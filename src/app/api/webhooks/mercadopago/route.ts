import { NextResponse } from "next/server";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { isMercadoPagoConfigured } from "@/lib/mercadopago/config";
import { validarAssinaturaWebhook } from "@/lib/mercadopago/webhook";
import { buscarPayment, buscarOrder } from "@/lib/mercadopago/client";

/**
 * Webhook do Mercado Pago. Recebe DOIS formatos diferentes, porque o checkout é híbrido
 * (ver decisão em .agent/rules/hortifacil — Pix via Orders API, cartão via Checkout Pro):
 *
 *  - `type: "payment"` — vem do Checkout Pro (cartão). `data.id` é o id de um pagamento
 *    clássico, buscado em `GET /v1/payments/{id}`.
 *  - `type: "order"` — vem do Pix (Orders API). `data.id` é o id da ORDER do Mercado Pago
 *    (não confundir com o nosso `orders.id`), buscado em `GET /v1/orders/{id}`; o status do
 *    pagamento de verdade fica dentro de `transactions.payments[0]`.
 *
 * Nos dois casos, o pedido nosso é encontrado pelo `external_reference` (que setamos como o
 * `orders.id` na hora de criar o pagamento/preferência) — nunca pelo id do Mercado Pago.
 *
 * Isso foi montado a partir da doc oficial (Webhooks/Notifications + Orders API) em
 * 24/08/2026 sem poder testar contra uma notificação real (falta token/segredo de produção)
 * — reconferir o formato exato assim que o primeiro pagamento de teste chegar aqui.
 */
export async function POST(request: Request) {
  if (!isMercadoPagoConfigured || !isServiceRoleConfigured) {
    console.error("webhook mercadopago: MERCADO_PAGO_ACCESS_TOKEN/NEXT_PUBLIC_APP_URL ou SUPABASE_SERVICE_ROLE_KEY ausente");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("webhook mercadopago: MERCADO_PAGO_WEBHOOK_SECRET ausente");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const body = await request.json().catch(() => null);

  const type = body?.type as string | undefined;
  const dataId = (body?.data?.id as string | undefined) ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (!type || !dataId) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  if (!xSignature || !xRequestId || !validarAssinaturaWebhook({ xSignature, xRequestId, dataId, secret })) {
    console.error("webhook mercadopago: assinatura inválida", { type, dataId });
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  // tópicos que não interessam aqui (merchant_order, chargebacks, etc.) — confirma recebido
  // e não faz nada, pra não gerar retry inútil do lado do Mercado Pago.
  if (type !== "payment" && type !== "order") {
    return NextResponse.json({ ok: true });
  }

  try {
    let externalReference: string | null = null;
    let status: string | null = null;
    let statusDetail: string | null = null;
    let mpPaymentId: string | null = null;

    if (type === "payment") {
      const payment = await buscarPayment(dataId);
      externalReference = payment.external_reference ?? null;
      status = payment.status ?? null;
      statusDetail = payment.status_detail ?? null;
      mpPaymentId = String(payment.id);
    } else {
      const order = await buscarOrder(dataId);
      externalReference = order.external_reference ?? null;
      const pagamento = order.transactions?.payments?.[0];
      status = pagamento?.status ?? null;
      statusDetail = pagamento?.status_detail ?? null;
      mpPaymentId = pagamento?.id != null ? String(pagamento.id) : dataId;
    }

    if (!externalReference) {
      console.error("webhook mercadopago: notificação sem external_reference", { type, dataId, status });
      return NextResponse.json({ ok: true });
    }

    const supabase = createServiceClient();

    if (status === "approved") {
      const { error } = await supabase.rpc("confirmar_pagamento_pedido", {
        p_order_id: externalReference,
        p_mp_payment_id: mpPaymentId,
        p_mp_status: status,
        p_mp_status_detail: statusDetail,
      });
      if (error) {
        console.error("webhook mercadopago: falha ao confirmar pedido", externalReference, error);
        return NextResponse.json({ error: "falha ao confirmar" }, { status: 500 });
      }
    } else if (status === "rejected" || status === "cancelled") {
      // só derruba um pedido que ainda está pendente — nunca sobrescreve um que já foi
      // confirmado por uma notificação anterior (proteção de corrida entre webhooks)
      await supabase
        .from("orders")
        .update({ status: "falhou", mp_status: status, mp_status_detail: statusDetail })
        .eq("id", externalReference)
        .eq("status", "pendente_pagamento");
    } else {
      // in_process, pending, action_required, etc — guarda o status bruto pra debug, sem
      // mudar o status do pedido ainda
      await supabase
        .from("orders")
        .update({ mp_status: status, mp_status_detail: statusDetail })
        .eq("id", externalReference)
        .eq("status", "pendente_pagamento");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("webhook mercadopago: erro inesperado", err);
    // 500 faz o Mercado Pago reentregar depois — melhor que engolir e nunca confirmar
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}
