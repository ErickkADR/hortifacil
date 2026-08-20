"use client";

import Link from "next/link";
import { Pencil, PackageX } from "lucide-react";
import type { Product } from "@/types/database";
import { formatBRL } from "@/lib/format";
import { ProductThumb } from "@/components/catalog/ProductThumb";

export function ProductsTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-2 px-6 py-16 text-center">
        <PackageX className="h-8 w-8 text-ink-soft/50" strokeWidth={1.5} />
        <p className="text-sm text-ink-soft">Nenhum produto cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2">
          <tr className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            <th className="px-5 py-3">Produto</th>
            <th className="px-5 py-3">Categoria</th>
            <th className="px-5 py-3">Preço</th>
            <th className="px-5 py-3">Estoque</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="flex items-center gap-3 px-5 py-3">
                <ProductThumb product={p} size={36} className="h-9 w-9 rounded-lg object-contain" />
                <span className="font-medium text-ink">{p.nome}</span>
              </td>
              <td className="px-5 py-3 text-ink-soft">{p.categoria}</td>
              <td className="px-5 py-3 tabular-nums text-ink">
                {formatBRL(p.preco)} <span className="text-xs text-ink-soft">/ {p.unidade}</span>
              </td>
              <td className="px-5 py-3 tabular-nums text-ink">{p.estoque}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.ativo ? "bg-leaf/15 text-leaf-deep" : "bg-ink-soft/10 text-ink-soft"
                  }`}
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/produtos/${p.id}/editar`}
                  aria-label={`Editar ${p.nome}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-2 hover:text-ink"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
