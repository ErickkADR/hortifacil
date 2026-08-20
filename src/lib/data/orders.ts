import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Order, OrderItem } from "@/types/database";

export type OrderWithItems = Order & { itens: OrderItem[] };

/** Lista todos os pedidos pro admin — RLS libera select geral só pra quem é admin. */
export async function getOrdersAdmin(): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error || !orders || orders.length === 0) return [];

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      orders.map((o) => o.id),
    );

  return orders.map((o) => ({
    ...o,
    itens: (items ?? []).filter((i) => i.order_id === o.id),
  }));
}
