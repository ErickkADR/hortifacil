import { AdminOrderBuilder } from "@/components/admin/AdminOrderBuilder";
import { getProducts } from "@/lib/data/products";

export default async function AdminPedidosPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink">Montar pedido</h1>
      <AdminOrderBuilder products={products} />
    </div>
  );
}
