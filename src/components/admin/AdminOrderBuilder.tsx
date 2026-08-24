"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import type { Product, MetodoPagamento } from "@/types/database";
import { formatBRL } from "@/lib/format";
import { criarPedidoAdmin } from "@/app/actions/orders";
import { ProductThumb } from "@/components/catalog/ProductThumb";

type Linha = { product: Product; quantidade: number };

const METODOS: { id: MetodoPagamento; label: string }[] = [
  { id: "debito", label: "Débito" },
  { id: "credito", label: "Crédito" },
  { id: "pix", label: "PIX" },
];

export function AdminOrderBuilder({ products }: { products: Product[] }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const total = useMemo(
    () => linhas.reduce((sum, l) => sum + l.product.preco * l.quantidade, 0),
    [linhas],
  );

  function addProduto(product: Product) {
    setLinhas((prev) => {
      const existe = prev.find((l) => l.product.id === product.id);
      if (existe) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantidade: l.quantidade + 1 } : l,
        );
      }
      return [...prev, { product, quantidade: 1 }];
    });
    setPickerOpen(false);
  }

  function setQuantidade(productId: string, quantidade: number) {
    setLinhas((prev) =>
      quantidade <= 0
        ? prev.filter((l) => l.product.id !== productId)
        : prev.map((l) => (l.product.id === productId ? { ...l, quantidade } : l)),
    );
  }

  function finalizar() {
    if (!metodo || linhas.length === 0) return;
    setMensagem(null);
    setSucesso(false);
    startTransition(async () => {
      const res = await criarPedidoAdmin(
        linhas.map((l) => ({ productId: l.product.id, quantidade: l.quantidade })),
        metodo,
      );
      if (!res.ok) {
        setMensagem(res.error);
        return;
      }
      setMensagem(
        res.demo
          ? "Pedido fechado (modo demonstração — Supabase ainda não plugado)."
          : `Pedido #${res.numero} fechado com sucesso.`,
      );
      setSucesso(!res.demo);
      setLinhas([]);
      setMetodo(null);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="relative mb-6 inline-block">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-surface-2 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface-2/70"
          >
            Adicionar Produto <ShoppingCart className="h-4 w-4" strokeWidth={2} />
          </button>

          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 z-20 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl bg-surface p-2 shadow-2xl ring-1 ring-border"
              >
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduto(p)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-2"
                  >
                    <span className="flex h-8 w-8 items-center justify-center">
                      <ProductThumb product={p} size={26} className="object-contain" />
                    </span>
                    <span className="flex-1 text-ink">{p.nome}</span>
                    <span className="text-xs text-ink-soft">{formatBRL(p.preco)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3">
          {linhas.length === 0 && (
            <p className="rounded-2xl bg-surface-2 px-5 py-6 text-center text-sm text-ink-soft">
              Nenhum item ainda — clique em &ldquo;Adicionar Produto&rdquo;.
            </p>
          )}
          <AnimatePresence initial={false}>
            {linhas.map((l) => (
              <motion.div
                key={l.product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between rounded-2xl bg-surface-2 px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-ink">{l.product.nome}</p>
                  <p className="text-xs text-ink-soft">Quantidade: {l.quantidade}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantidade(l.product.id, l.quantidade - 1)}
                      aria-label="Diminuir quantidade"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-surface"
                    >
                      <Minus className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setQuantidade(l.product.id, l.quantidade + 1)}
                      aria-label="Aumentar quantidade"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-white"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                  <span className="w-20 rounded-full bg-surface px-3 py-1.5 text-center text-sm font-medium tabular-nums text-ink">
                    {formatBRL(l.product.preco * l.quantidade)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <aside className="sticky top-10 flex h-fit flex-col gap-5">
        <div className="max-h-96 overflow-y-auto rounded-2xl bg-surface-2 p-4">
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-soft uppercase">Resumo</h3>
          {linhas.length === 0 ? (
            <p className="text-sm text-ink-soft">—</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {linhas.map((l) => (
                <li key={l.product.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <ProductThumb product={l.product} size={26} className="object-contain" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-ink">{l.product.nome}</span>
                    <span className="text-xs text-ink-soft">Qtd: {l.quantidade}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-surface-2 p-4">
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-soft uppercase">Método de pagamento</h3>
          <div className="mb-4 flex gap-2">
            {METODOS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetodo(m.id)}
                className={`flex-1 rounded-full border py-2 text-xs font-medium transition ${
                  metodo === m.id ? "border-leaf-deep bg-leaf-deep text-white" : "border-border bg-surface text-ink-soft"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mensagem && (
            <p className="mb-3 text-xs text-ink-soft">
              {mensagem}
              {sucesso && (
                <>
                  {" "}
                  <Link href="/admin" className="font-medium text-leaf-deep underline">
                    Ver pedidos
                  </Link>
                </>
              )}
            </p>
          )}

          <button
            onClick={finalizar}
            disabled={!metodo || linhas.length === 0 || pending}
            className="w-full rounded-full bg-leaf-deep py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "Enviando..." : `TOTAL: ${formatBRL(total)}`}
          </button>
        </div>
      </aside>
    </div>
  );
}
