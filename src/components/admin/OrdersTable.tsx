"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ClipboardX } from "lucide-react";
import type { StatusPedido } from "@/types/database";
import type { OrderWithItems } from "@/lib/data/orders";
import { formatBRL } from "@/lib/format";
import { atualizarStatusPedido } from "@/app/actions/orders";

const STATUS_LABEL: Record<StatusPedido, string> = {
  pendente_pagamento: "Aguardando pagamento",
  aberto: "Aberto",
  pago: "Pago",
  cancelado: "Cancelado",
  falhou: "Falhou",
};

const STATUS_CLASS: Record<StatusPedido, string> = {
  pendente_pagamento: "bg-sky-500/15 text-sky-700",
  aberto: "bg-amber-500/15 text-amber-700",
  pago: "bg-leaf/15 text-leaf-deep",
  cancelado: "bg-danger/10 text-danger",
  falhou: "bg-danger/15 text-danger",
};

const METODO_LABEL: Record<string, string> = {
  debito: "Débito",
  credito: "Crédito",
  pix: "PIX",
};

function formatData(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function OrderRow({ order }: { order: OrderWithItems }) {
  const [aberto, setAberto] = useState(false);
  const [pending, startTransition] = useTransition();

  function mudarStatus(status: StatusPedido) {
    startTransition(() => {
      atualizarStatusPedido(order.id, status);
    });
  }

  return (
    <>
      <tr className="border-t border-border">
        <td className="px-5 py-3">
          <button
            onClick={() => setAberto((v) => !v)}
            className="flex items-center gap-2 font-medium text-ink"
          >
            <ChevronDown
              className={`h-4 w-4 text-ink-soft transition-transform ${aberto ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
            #{order.numero}
          </button>
        </td>
        <td className="px-5 py-3 text-ink-soft">{formatData(order.criado_em)}</td>
        <td className="px-5 py-3 text-ink-soft">
          {order.metodo_pagamento ? METODO_LABEL[order.metodo_pagamento] : "—"}
        </td>
        <td className="px-5 py-3 tabular-nums text-ink">{formatBRL(order.total)}</td>
        <td className="px-5 py-3">
          <select
            value={order.status}
            disabled={pending}
            onChange={(e) => mudarStatus(e.target.value as StatusPedido)}
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}
          >
            {(Object.keys(STATUS_LABEL) as StatusPedido[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </td>
      </tr>
      {aberto && (
        <tr className="border-t border-border bg-surface-2/50">
          <td colSpan={5} className="px-5 py-3">
            <ul className="flex flex-col gap-1.5 text-sm">
              {order.itens.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-ink-soft">
                  <span>
                    {item.quantidade}x {item.produto_nome}
                  </span>
                  <span className="tabular-nums">{formatBRL(item.preco_unitario * item.quantidade)}</span>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

export function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-2 px-6 py-16 text-center">
        <ClipboardX className="h-8 w-8 text-ink-soft/50" strokeWidth={1.5} />
        <p className="text-sm text-ink-soft">Nenhum pedido registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2">
          <tr className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            <th className="px-5 py-3">Pedido</th>
            <th className="px-5 py-3">Data</th>
            <th className="px-5 py-3">Pagamento</th>
            <th className="px-5 py-3">Total</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
