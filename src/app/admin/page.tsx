import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getOrdersAdmin } from "@/lib/data/orders";

export default async function AdminPedidosPage() {
  const orders = await getOrdersAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Pedidos</h1>
        <Link
          href="/admin/montar-pedido"
          className="flex items-center gap-2 rounded-full bg-leaf-deep px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
          Montar pedido
        </Link>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
