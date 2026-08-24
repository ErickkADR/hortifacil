"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, isServiceRoleConfigured } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isMercadoPagoConfigured, getAppUrl } from "@/lib/mercadopago/config";
import { criarPreferenciaCheckoutPro, criarPagamentoPix } from "@/lib/mercadopago/client";
import { requireAdmin } from "@/lib/dal";
import { getProducts } from "@/lib/data/products";
import type { MetodoPagamento, StatusPedido } from "@/types/database";

export type CheckoutItem = { productId: string; quantidade: number };

async function montarLinhas(items: CheckoutItem[]) {
  const produtos = await getProducts();
  const linhas = items
    .map((item) => {
      const produto = produtos.find((p) => p.id === item.productId);
      if (!produto) return null;
      return { produto, quantidade: item.quantidade };
    })
    .filter((l): l is { produto: (typeof produtos)[number]; quantidade: number } => l !== null);

  const total = linhas.reduce((sum, l) => sum + l.produto.preco * l.quantidade, 0);
  return { linhas, total };
}

/**
 * POS do admin ("Montar pedido") — venda presencial: o admin já recebeu o pagamento na hora
 * (dinheiro, maquininha física separada), não existe gateway nenhum aqui. Por isso o pedido
 * já nasce "pago" e o estoque já baixa na hora, ao contrário do checkout do cliente.
 */
export async function criarPedidoAdmin(items: CheckoutItem[], metodoPagamento: MetodoPagamento) {
  await requireAdmin();

  if (items.length === 0) return { ok: false as const, error: "Carrinho vazio." };

  const { linhas, total } = await montarLinhas(items);
  if (linhas.length === 0) return { ok: false as const, error: "Nenhum produto válido no pedido." };

  if (!isSupabaseConfigured) {
    return { ok: true as const, demo: true as const, total };
  }

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: null, status: "pago", metodo_pagamento: metodoPagamento, total, pago_em: new Date().toISOString() })
    .select("id, numero")
    .single();

  if (orderError || !order) {
    console.error("criarPedidoAdmin: falha ao inserir em orders", orderError);
    return { ok: false as const, error: "Não deu pra registrar o pedido. Tenta de novo." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    linhas.map((l) => ({
      order_id: order.id,
      product_id: l.produto.id,
      produto_nome: l.produto.nome,
      quantidade: l.quantidade,
      preco_unitario: l.produto.preco,
    })),
  );

  if (itemsError) {
    console.error("criarPedidoAdmin: falha ao inserir em order_items", itemsError);
    return { ok: false as const, error: "Pedido criado, mas faltou salvar os itens." };
  }

  // baixa de estoque: venda presencial, ator único (o admin), sem concorrência real —
  // update simples em vez da função SQL atômica que o webhook usa (ver
  // confirmar_pagamento_pedido em supabase/pagamento-mercadopago-2026-08-24.sql).
  for (const l of linhas) {
    const { error: estoqueError } = await supabase
      .from("products")
      .update({ estoque: Math.max(l.produto.estoque - l.quantidade, 0) })
      .eq("id", l.produto.id);
    if (estoqueError) {
      console.error("criarPedidoAdmin: falha ao baixar estoque de", l.produto.id, estoqueError);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/");

  return { ok: true as const, demo: false as const, numero: order.numero, total };
}

type PagamentoInfo =
  | { tipo: "pix"; qrCodeBase64: string; qrCode: string }
  | { tipo: "redirect"; initPoint: string };

/**
 * Checkout do cliente (`/carrinho`) — o pedido nasce "pendente_pagamento" (precisa de um id
 * estável pra mandar como external_reference pro Mercado Pago casar o pagamento de volta) e
 * só vira "pago" de verdade quando o webhook confirmar. Estoque não é tocado aqui.
 */
export async function criarPedidoCliente(items: CheckoutItem[], metodoPagamento: MetodoPagamento) {
  if (items.length === 0) return { ok: false as const, error: "Carrinho vazio." };

  const { linhas, total } = await montarLinhas(items);
  if (linhas.length === 0) return { ok: false as const, error: "Nenhum produto válido no pedido." };

  if (!isSupabaseConfigured) {
    // Sem Supabase plugado ainda: confirma visualmente sem persistir de verdade.
    return { ok: true as const, demo: true as const, total };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isServiceRoleConfigured) {
    console.error("criarPedidoCliente: SUPABASE_SERVICE_ROLE_KEY ausente, não dá pra registrar o pedido");
    return { ok: false as const, error: "Não deu pra registrar o pedido. Tenta de novo." };
  }

  // Insert com a service role, não o client de RLS: a policy de SELECT em `orders` é "dono ou
  // admin lê o pedido" (user_id = auth.uid()), e pra convidado os dois lados são null — `null =
  // null` não é true no Postgres, então o RETURNING do `.select().single()` encadeado no INSERT
  // não acharia a linha mesmo o INSERT em si tendo passado (a policy de insert é `with check
  // (true)`). Mesmo motivo por trás de getStatusPedido usar a service role logo abaixo.
  const servico = createServiceClient();

  const { data: order, error: orderError } = await servico
    .from("orders")
    .insert({ user_id: user?.id ?? null, status: "pendente_pagamento", metodo_pagamento: metodoPagamento, total })
    .select("id, numero")
    .single();

  if (orderError || !order) {
    console.error("criarPedidoCliente: falha ao inserir em orders", orderError);
    return { ok: false as const, error: "Não deu pra registrar o pedido. Tenta de novo." };
  }

  const { error: itemsError } = await servico.from("order_items").insert(
    linhas.map((l) => ({
      order_id: order.id,
      product_id: l.produto.id,
      produto_nome: l.produto.nome,
      quantidade: l.quantidade,
      preco_unitario: l.produto.preco,
    })),
  );

  if (itemsError) {
    console.error("criarPedidoCliente: falha ao inserir em order_items", itemsError);
    return { ok: false as const, error: "Pedido criado, mas faltou salvar os itens." };
  }

  if (!isMercadoPagoConfigured) {
    // Supabase plugado mas o Mercado Pago ainda não — não faz sentido deixar um pedido
    // pendente_pagamento órfão que nunca vai ser confirmado.
    await supabase.from("orders").delete().eq("id", order.id);
    console.error("criarPedidoCliente: MERCADO_PAGO_ACCESS_TOKEN ou NEXT_PUBLIC_APP_URL ausente");
    return { ok: false as const, error: "Pagamento online ainda não está configurado. Tenta de novo mais tarde." };
  }

  const appUrl = getAppUrl()!;
  const emailCliente = user?.email ?? "convidado@hortifacil.app";

  // Os updates abaixo (mp_preference_id no sucesso, status "falhou" no catch) rodam fora de
  // sessão de admin — a única policy de UPDATE em `orders` é "admin atualiza pedido" (ver
  // supabase/corrigir-rls-pedidos-2026-08-21.sql), então o client de RLS (`supabase`, usado
  // acima só pro INSERT que tem policy própria de cliente/convidado) afetaria 0 linhas em
  // silêncio aqui. Usa a service role, mesmo padrão de getStatusPedido e do webhook do MP.
  const atualizarPedidoPosPagamento = async (campos: Partial<{ mp_preference_id: string; status: StatusPedido }>) => {
    if (!isServiceRoleConfigured) {
      console.error("criarPedidoCliente: SUPABASE_SERVICE_ROLE_KEY ausente, não deu pra atualizar orders", campos);
      return;
    }
    const { error } = await createServiceClient().from("orders").update(campos).eq("id", order.id);
    if (error) {
      console.error("criarPedidoCliente: falha ao atualizar orders via service role", campos, error);
    }
  };

  try {
    let pagamento: PagamentoInfo;

    if (metodoPagamento === "pix") {
      const resultado = await criarPagamentoPix({
        orderId: order.id,
        externalReference: order.id,
        total,
        email: emailCliente,
      });
      await atualizarPedidoPosPagamento({ mp_preference_id: resultado.mpOrderId });
      pagamento = { tipo: "pix", qrCodeBase64: resultado.qrCodeBase64, qrCode: resultado.qrCode };
    } else {
      const resultado = await criarPreferenciaCheckoutPro({
        itens: linhas.map((l) => ({ titulo: l.produto.nome, quantidade: l.quantidade, precoUnitario: l.produto.preco })),
        externalReference: order.id,
        notificationUrl: `${appUrl}/api/webhooks/mercadopago`,
        backUrl: `${appUrl}/pedido/${order.id}`,
      });
      await atualizarPedidoPosPagamento({ mp_preference_id: resultado.preferenceId });
      pagamento = { tipo: "redirect", initPoint: resultado.initPoint };
    }

    revalidatePath("/admin");
    return { ok: true as const, demo: false as const, orderId: order.id, numero: order.numero, total, pagamento };
  } catch (err) {
    console.error("criarPedidoCliente: falha ao iniciar pagamento no Mercado Pago", err);
    await atualizarPedidoPosPagamento({ status: "falhou" });
    return { ok: false as const, error: "Não deu pra iniciar o pagamento. Tenta de novo." };
  }
}

/**
 * Consulta o status mínimo de um pedido pra tela de "aguardando confirmação" — usa a service
 * role porque o checkout de convidado (sem login) não passa no RLS de select de `orders` (ver
 * o comentário em `src/lib/supabase/service.ts`). Só devolve os 3 campos que a UI precisa.
 */
export async function getStatusPedido(orderId: string) {
  if (!isSupabaseConfigured || !isServiceRoleConfigured) return null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("status, numero, total")
    .eq("id", orderId)
    .single();

  return data;
}

export async function atualizarStatusPedido(orderId: string, status: StatusPedido) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    return { ok: false as const, error: "Não deu pra atualizar o status do pedido." };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}
