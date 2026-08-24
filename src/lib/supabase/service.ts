import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const isServiceRoleConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Client com a service role key — ignora RLS por completo. Só pode ser usado em código que
 * roda inteiramente no servidor (Route Handler, server action), NUNCA importado por um
 * client component. Hoje só dois lugares usam isso, de propósito:
 *  - o webhook do Mercado Pago (`src/app/api/webhooks/mercadopago/route.ts`), que não tem
 *    sessão de usuário nenhuma pra satisfazer as policies de `orders`/`order_items`;
 *  - `getStatusPedido` (`src/app/actions/orders.ts`), pra deixar o cliente CONVIDADO
 *    (sem login) reler o status do próprio pedido — a policy "dono ou admin lê o pedido" não
 *    libera isso pra convidado (user_id null e auth.uid() anônimo também é null, então
 *    `user_id = auth.uid()` nunca bate). Só devolve campos mínimos (status/numero/total), não
 *    a tabela inteira — o UUID do pedido não é enumerável, então o nível de sigilo é
 *    aceitável pra uma loja pessoal.
 */
export function createServiceClient() {
  if (!isServiceRoleConfigured) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_URL) não configurada.");
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
