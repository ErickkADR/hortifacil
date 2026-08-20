"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useCart, cartTotal } from "@/store/cart";
import { formatBRL } from "@/lib/format";
import { ProductThumb } from "@/components/catalog/ProductThumb";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQuantidade = useCart((s) => s.setQuantidade);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-hero-bg/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-display text-2xl text-ink">Seu carrinho</h2>
              <button onClick={close} aria-label="Fechar carrinho" className="text-2xl text-ink-soft">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-sm text-ink-soft">Ainda está vazio — bora escolher algo fresquinho.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map(({ product, quantidade }) => (
                    <li key={product.id} className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                        <ProductThumb product={product} size={44} className="object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink">{product.nome}</p>
                        <p className="text-xs text-ink-soft">{formatBRL(product.preco)} / {product.unidade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantidade(product.id, quantidade - 1)}
                          className="h-6 w-6 rounded-full bg-surface-2 text-sm text-ink"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm tabular-nums">{quantidade}</span>
                        <button
                          onClick={() => setQuantidade(product.id, quantidade + 1)}
                          className="h-6 w-6 rounded-full bg-leaf text-sm text-white"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-ink-soft">Total</span>
                <span className="font-display text-xl text-ink">{formatBRL(cartTotal(items))}</span>
              </div>
              <Link
                href="/carrinho"
                onClick={close}
                className="block rounded-full bg-leaf-deep py-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
              >
                Fechar pedido
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
