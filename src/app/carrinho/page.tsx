"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, X } from "lucide-react";
import { useCart, cartTotal } from "@/store/cart";
import { formatBRL } from "@/lib/format";
import { criarPedidoCliente } from "@/app/actions/orders";
import type { MetodoPagamento } from "@/types/database";
import { ProductThumb } from "@/components/catalog/ProductThumb";
import { AguardandoPagamento } from "@/components/checkout/AguardandoPagamento";

const METODOS: { id: MetodoPagamento; label: string }[] = [
  { id: "debito", label: "Débito" },
  { id: "credito", label: "Crédito" },
  { id: "pix", label: "PIX" },
];

export default function CarrinhoPage() {
  const items = useCart((s) => s.items);
  const setQuantidade = useCart((s) => s.setQuantidade);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [pending, startTransition] = useTransition();
  const [demo, setDemo] = useState<{ total: number } | null>(null);
  const [aguardando, setAguardando] = useState<{
    orderId: string;
    numero?: number;
    total: number;
    pix?: { qrCodeBase64: string; qrCode: string };
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function finalizar() {
    if (!metodo) return;
    setErro(null);
    startTransition(async () => {
      const res = await criarPedidoCliente(
        items.map((i) => ({ productId: i.product.id, quantidade: i.quantidade })),
        metodo,
      );
      if (!res.ok) {
        setErro(res.error);
        return;
      }

      clear();

      if (res.demo) {
        setDemo({ total: res.total });
        return;
      }

      if (res.pagamento.tipo === "redirect") {
        // sai do site pro checkout hospedado do Mercado Pago; a confirmação chega via
        // webhook e o cliente volta pra /pedido/[id] através do back_url configurado.
        window.location.href = res.pagamento.initPoint;
        return;
      }

      setAguardando({
        orderId: res.orderId,
        numero: res.numero,
        total: res.total,
        pix: { qrCodeBase64: res.pagamento.qrCodeBase64, qrCode: res.pagamento.qrCode },
      });
    });
  }

  if (demo) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <Leaf className="h-12 w-12 text-leaf" strokeWidth={1.5} />
        <h1 className="font-display text-3xl text-ink">Pedido recebido!</h1>
        <p className="max-w-xs text-xs text-ink-soft">
          (modo demonstração — ainda sem Supabase plugado, então esse pedido não foi salvo de verdade)
        </p>
        <Link href="/" className="mt-3 rounded-full bg-leaf-deep px-6 py-3 text-sm font-semibold text-white hover:brightness-110">
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  if (aguardando) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6">
        <AguardandoPagamento
          orderId={aguardando.orderId}
          numeroInicial={aguardando.numero}
          totalInicial={aguardando.total}
          pix={aguardando.pix}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <Link href="/" className="text-xs text-ink-soft hover:text-ink">&larr; continuar comprando</Link>
      <h1 className="mt-3 mb-8 font-display text-4xl text-ink">Seu pedido</h1>

      {items.length === 0 ? (
        <p className="text-ink-soft">Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="mb-8 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {items.map(({ product, quantidade }) => (
                <motion.li
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-[0_10px_24px_-16px_rgba(20,40,25,0.3)]"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                    <ProductThumb product={product} size={52} className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{product.nome}</p>
                    <p className="text-xs text-ink-soft">{formatBRL(product.preco)} / {product.unidade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQuantidade(product.id, quantidade - 1)} className="h-7 w-7 rounded-full bg-surface-2 text-sm">−</button>
                    <span className="w-5 text-center text-sm tabular-nums">{quantidade}</span>
                    <button onClick={() => setQuantidade(product.id, quantidade + 1)} className="h-7 w-7 rounded-full bg-leaf text-sm text-white">+</button>
                  </div>
                  <p className="w-20 text-right text-sm font-semibold tabular-nums text-ink">
                    {formatBRL(product.preco * quantidade)}
                  </p>
                  <button onClick={() => remove(product.id)} aria-label={`Remover ${product.nome}`} className="text-ink-soft hover:text-danger">
                    <X className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="rounded-2xl bg-surface-2 p-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">Método de pagamento</h2>
            <div className="mb-6 flex gap-2">
              {METODOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={`flex-1 rounded-full border py-2.5 text-sm font-medium transition ${
                    metodo === m.id
                      ? "border-leaf-deep bg-leaf-deep text-white"
                      : "border-border bg-surface text-ink-soft hover:border-leaf"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-ink-soft">Total</span>
              <span className="font-display text-2xl text-ink">{formatBRL(cartTotal(items))}</span>
            </div>

            {erro && <p className="mb-3 text-sm text-danger">{erro}</p>}

            <button
              onClick={finalizar}
              disabled={!metodo || pending}
              className="w-full rounded-full bg-leaf-deep py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "Enviando..." : "Finalizar pedido"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
