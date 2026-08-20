import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAllProductsAdmin } from "@/lib/data/products";

export default async function NovoProdutoPage() {
  const products = await getAllProductsAdmin();
  const categorias = Array.from(new Set(products.map((p) => p.categoria))).sort();

  return (
    <div>
      <Link href="/admin/produtos" className="text-xs text-ink-soft hover:text-ink">
        &larr; produtos
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl text-ink">Novo produto</h1>
      <ProductForm categorias={categorias.length > 0 ? categorias : ["Fruta", "Legume", "Verdura"]} />
    </div>
  );
}
