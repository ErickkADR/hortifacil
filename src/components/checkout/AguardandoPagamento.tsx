"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, XCircle, Copy, Leaf } from "lucide-react";
import { getStatusPedido } from "@/app/actions/orders";
import { formatBRL } from "@/lib/format";

const INTERVALO_MS = 3500;

type Props = {
  orderId: string;
  numeroInicial?: number;
  totalInicial: number;
  /** Presente só no fluxo Pix — mostra o QR inline em vez de "redirecionando...". */
  pix?: { qrCodeBase64: string; qrCode: string };
};

type StatusVisivel = "pendente_pagamento" | "pago" | "falhou" | "cancelado";

export function AguardandoPagamento({ orderId, numeroInicial, totalInicial, pix }: Props) {
  const [status, setStatus] = useState<StatusVisivel>("pendente_pagamento");
  const [numero, setNumero] = useState(numeroInicial);
  const [total, setTotal] = useState(totalInicial);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (status !== "pendente_pagamento") return;

    let cancelado = false;
    const id = setInterval(async () => {
      const pedido = await getStatusPedido(orderId);
      if (cancelado || !pedido) return;
      if (pedido.status !== "pendente_pagamento") {
        setStatus(pedido.status as StatusVisivel);
        setNumero(pedido.numero);
        setTotal(pedido.total);
      }
    }, INTERVALO_MS);

    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [orderId, status]);

  function copiarCodigo() {
    if (!pix) return;
    navigator.clipboard
      ?.writeText(pix.qrCode)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch(() => {});
  }

  if (status === "pago") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Leaf className="h-12 w-12 text-leaf" strokeWidth={1.5} />
        <h1 className="font-display text-3xl text-ink">Pagamento confirmado!</h1>
        {numero && (
          <p className="text-ink-soft">
            pedido <span className="font-semibold text-ink">#{numero}</span> — {formatBRL(total)}
          </p>
        )}
        <Link href="/" className="mt-3 rounded-full bg-leaf-deep px-6 py-3 text-sm font-semibold text-white hover:brightness-110">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  if (status === "falhou" || status === "cancelado") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-danger" strokeWidth={1.5} />
        <h1 className="font-display text-3xl text-ink">Pagamento não confirmado</h1>
        <p className="max-w-xs text-sm text-ink-soft">
          {status === "cancelado" ? "Esse pedido foi cancelado." : "Não conseguimos confirmar o pagamento desse pedido."}
        </p>
        <Link href="/carrinho" className="mt-3 rounded-full bg-leaf-deep px-6 py-3 text-sm font-semibold text-white hover:brightness-110">
          Tentar de novo
        </Link>
      </div>
    );
  }

  // pendente_pagamento
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {pix ? (
        <>
          <h1 className="font-display text-3xl text-ink">Pague com Pix</h1>
          <div className="rounded-2xl bg-white p-3 shadow-[0_10px_24px_-16px_rgba(20,40,25,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR code do Pix" width={220} height={220} />
          </div>
          <button
            onClick={copiarCodigo}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink-soft hover:border-leaf hover:text-ink"
          >
            <Copy className="h-4 w-4" strokeWidth={2} />
            {copiado ? "Código copiado!" : "Copiar código Pix"}
          </button>
        </>
      ) : (
        <h1 className="font-display text-3xl text-ink">Aguardando pagamento</h1>
      )}

      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
        Aguardando a confirmação do pagamento...
      </p>
      {numero && (
        <p className="text-xs text-ink-soft">
          pedido <span className="font-semibold text-ink">#{numero}</span> — {formatBRL(total)}
        </p>
      )}
    </div>
  );
}
