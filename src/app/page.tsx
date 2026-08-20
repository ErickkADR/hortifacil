import { LeafParallaxHero } from "@/components/hero/LeafParallaxHero";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartButton } from "@/components/cart/CartButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getProducts } from "@/lib/data/products";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <LeafParallaxHero />
      <ProductGrid products={products} />
      <SiteFooter />
      <CartButton />
      <CartDrawer />
    </>
  );
}
