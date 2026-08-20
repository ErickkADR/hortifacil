"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import type { Product } from "@/types/database";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/store/cart";
import { ProductThumb } from "@/components/catalog/ProductThumb";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const add = useCart((s) => s.add);

  return (
    <Link href={`/produto/${product.slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        className="group relative cursor-pointer rounded-2xl bg-surface p-5 pb-4 text-center shadow-[0_18px_36px_-22px_rgba(20,40,25,0.35)]"
      >
        <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
          <ProductThumb
            product={product}
            size={110}
            className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          />
        </div>
        <h3 className="font-sans text-[15px] font-semibold text-ink">{product.nome}</h3>
        <p className="mb-3 text-xs text-ink-soft">{formatBRL(product.preco)} / {product.unidade}</p>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            add(product);
          }}
          aria-label={`Adicionar ${product.nome} ao carrinho`}
          className="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full bg-leaf text-white transition hover:scale-110 hover:bg-leaf-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </motion.div>
    </Link>
  );
}
