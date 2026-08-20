import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getAllProductsAdmin } from "@/lib/data/products";

export default async function AdminProdutosPage() {
  const products = await getAllProductsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 rounded-full bg-leaf-deep px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Novo produto
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
