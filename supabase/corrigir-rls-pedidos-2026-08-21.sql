-- Corrige o erro 42501 ("new row violates row-level security policy for table orders")
-- no checkout. Idempotente: pode rodar quantas vezes precisar.

drop policy if exists "qualquer um cria pedido" on public.orders;
create policy "qualquer um cria pedido"
  on public.orders for insert
  with check (true);

drop policy if exists "dono ou admin lê o pedido" on public.orders;
create policy "dono ou admin lê o pedido"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin atualiza pedido" on public.orders;
create policy "admin atualiza pedido"
  on public.orders for update
  using (public.is_admin());

drop policy if exists "qualquer um insere item de pedido" on public.order_items;
create policy "qualquer um insere item de pedido"
  on public.order_items for insert
  with check (true);

drop policy if exists "dono ou admin lê itens do pedido" on public.order_items;
create policy "dono ou admin lê itens do pedido"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- confirma que RLS está ligado nas duas (não custa reforçar)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- diagnóstico: lista as políticas que ficaram valendo em orders/order_items
select tablename, policyname, cmd, permissive, roles
from pg_policies
where tablename in ('orders', 'order_items')
order by tablename, cmd;
