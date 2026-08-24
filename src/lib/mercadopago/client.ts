import "server-only";

const MP_API_BASE = "https://api.mercadopago.com";

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurada.");
  return token;
}

async function mpFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const corpo = await res.text().catch(() => "");
    throw new Error(`Mercado Pago ${path} respondeu ${res.status}: ${corpo}`);
  }

  return res.json();
}

export type ItemCheckout = { titulo: string; quantidade: number; precoUnitario: number };

type PreferenciaResposta = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

/**
 * Checkout Pro — usado só pro cartão (débito/crédito). O cliente é redirecionado pro
 * checkout hospedado do Mercado Pago; a confirmação chega depois via webhook com
 * `type: "payment"` (formato clássico, ver `buscarPayment`).
 *
 * De propósito, Pix é excluído daqui — o Pix segue pela Orders API (`criarPagamentoPix`),
 * que devolve o QR code direto na resposta, sem precisar sair do site.
 */
export async function criarPreferenciaCheckoutPro(params: {
  itens: ItemCheckout[];
  externalReference: string;
  notificationUrl: string;
  backUrl: string;
}) {
  const data = (await mpFetch("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: params.itens.map((item) => ({
        title: item.titulo,
        quantity: item.quantidade,
        unit_price: item.precoUnitario,
        currency_id: "BRL",
      })),
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      back_urls: {
        success: params.backUrl,
        failure: params.backUrl,
        pending: params.backUrl,
      },
      auto_return: "approved",
      payment_methods: {
        // Pix vai pela Orders API (ver criarPagamentoPix) — aqui só cartão.
        excluded_payment_methods: [{ id: "pix" }],
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
      },
    }),
  })) as PreferenciaResposta;

  const initPoint = data.init_point ?? data.sandbox_init_point;
  if (!initPoint) throw new Error("Mercado Pago não devolveu init_point da preferência.");

  return { preferenceId: data.id, initPoint };
}

type OrderPixResposta = {
  id: string;
  external_reference?: string;
  transactions?: {
    payments?: Array<{
      id?: string | number;
      status?: string;
      status_detail?: string;
      payment_method?: {
        qr_code_base64?: string;
        qr_code?: string;
        ticket_url?: string;
      };
    }>;
  };
};

/**
 * Pix via Checkout Transparente (Orders API, `POST /v1/orders`) — devolve o QR code
 * (imagem base64) e o "copia e cola" já prontos na resposta, sem precisar de nenhum SDK
 * client nem do Payment Brick. Confirmação chega via webhook com `type: "order"` (ver
 * `buscarOrder`), formato diferente do webhook clássico de pagamento.
 */
export async function criarPagamentoPix(params: {
  orderId: string;
  externalReference: string;
  total: number;
  email: string;
}) {
  const data = (await mpFetch("/v1/orders", {
    method: "POST",
    // idempotência por pedido: se essa chamada for repetida pro mesmo order.id (retry de
    // rede, por ex.), o Mercado Pago não cria uma segunda cobrança.
    headers: { "X-Idempotency-Key": params.orderId },
    body: JSON.stringify({
      type: "online",
      total_amount: params.total.toFixed(2),
      external_reference: params.externalReference,
      processing_mode: "automatic",
      transactions: {
        payments: [
          {
            amount: params.total.toFixed(2),
            payment_method: { id: "pix", type: "bank_transfer" },
          },
        ],
      },
      payer: { email: params.email },
    }),
  })) as OrderPixResposta;

  const pagamento = data.transactions?.payments?.[0];
  if (!pagamento?.payment_method?.qr_code) {
    throw new Error("Mercado Pago não devolveu o QR code do Pix.");
  }

  return {
    mpOrderId: data.id,
    qrCodeBase64: pagamento.payment_method.qr_code_base64 ?? "",
    qrCode: pagamento.payment_method.qr_code,
    ticketUrl: pagamento.payment_method.ticket_url,
  };
}

type PaymentResposta = {
  id: number;
  status: string;
  status_detail: string;
  external_reference?: string;
};

/** Formato clássico — usado pelo webhook quando `type === "payment"` (vem do Checkout Pro). */
export async function buscarPayment(id: string) {
  return (await mpFetch(`/v1/payments/${id}`)) as PaymentResposta;
}

/** Orders API — usado pelo webhook quando `type === "order"` (vem do Pix). */
export async function buscarOrder(id: string) {
  return (await mpFetch(`/v1/orders/${id}`)) as OrderPixResposta;
}
