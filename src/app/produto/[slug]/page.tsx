import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/products";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductPurchaseCard } from "@/components/catalog/ProductPurchaseCard";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default async function ProdutoPage(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-bg">
      <header className="relative flex items-center justify-center border-b border-border px-6 py-5">
        <Link
          href="/"
          className="absolute left-6 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink"
        >
          &larr; voltar
        </Link>
        <span className="font-display text-2xl font-light text-ink">
          Horti<em className="font-medium text-leaf not-italic">Fácil</em>
        </span>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-16 sm:flex-row sm:items-center sm:justify-center">
        <ProductGallery
          imagens={product.imagens?.length ? product.imagens : product.imagem_url ? [product.imagem_url] : []}
          nome={product.nome}
        />

        <ProductPurchaseCard product={product} />
      </div>

      <CartButton />
      <CartDrawer />
    </main>
  );
}
