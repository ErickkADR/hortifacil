"use client";

import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import type { Product } from "@/types/database";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/store/cart";

export function ProductPurchaseCard({ product }: { product: Product }) {
  const addQuantity = useCart((s) => s.addQuantity);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  function adicionar() {
    addQuantity(product, quantidade);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1800);
  }

  return (
    <aside className="w-full max-w-sm rounded-3xl bg-surface-2 p-8">
      <h1 className="font-sans text-xl font-bold tracking-wide text-ink uppercase">{product.nome}</h1>
      <div className="my-5 h-px bg-border" />

      <p className="mb-5 text-[15px] leading-relaxed text-ink-soft">{product.descricao}</p>

      <p className="mb-6 text-2xl font-semibold text-leaf-deep">
        {formatBRL(product.preco)} <span className="text-sm font-normal text-ink-soft">/ {product.unidade}</span>
      </p>

      <div className="my-5 h-px bg-border" />

      <div className="mb-5 flex items-center justify-center gap-4">
        <button
          onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
          aria-label="Diminuir quantidade"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-sm"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <span className="w-8 text-center text-lg font-medium tabular-nums">{quantidade}</span>
        <button
          onClick={() => setQuantidade((q) => q + 1)}
          aria-label="Aumentar quantidade"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      <button
        onClick={adicionar}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-leaf-deep py-3.5 text-sm font-semibold tracking-wide text-white uppercase transition hover:brightness-110"
      >
        {adicionado ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Adicionado
          </>
        ) : (
          `Comprar agora — ${formatBRL(product.preco * quantidade)}`
        )}
      </button>
    </aside>
  );
}
