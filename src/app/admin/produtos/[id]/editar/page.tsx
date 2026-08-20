import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAllProductsAdmin } from "@/lib/data/products";

export default async function EditarProdutoPage(props: PageProps<"/admin/produtos/[id]/editar">) {
  const { id } = await props.params;
  const products = await getAllProductsAdmin();
  const produto = products.find((p) => p.id === id);

  if (!produto) notFound();

  const categorias = Array.from(new Set(products.map((p) => p.categoria))).sort();

  return (
    <div>
      <Link href="/admin/produtos" className="text-xs text-ink-soft hover:text-ink">
        &larr; produtos
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl text-ink">Editar {produto.nome}</h1>
      <ProductForm produto={produto} categorias={categorias} />
    </div>
  );
}
