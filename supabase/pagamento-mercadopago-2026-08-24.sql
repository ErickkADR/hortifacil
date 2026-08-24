-- Pagamento real com Mercado Pago (Pix + cartão). Idempotente: pode rodar quantas vezes
-- precisar. Rodar no SQL Editor do projeto Supabase pessoal do Erick (gglxjgpdvmrrlvramxjk).
--
-- Contexto: o pedido do cliente agora nasce como 'pendente_pagamento' (não 'aberto') e só
-- vira 'pago' quando o webhook do Mercado Pago confirmar. O pedido do POS do admin continua
-- nascendo direto como 'pago' (venda presencial, sem gateway). 'aberto' fica só por
-- compatibilidade com pedidos antigos já gravados — nenhum fluxo novo usa esse status.

-- ========== novos valores de status ==========
-- o schema.sql original criou a constraint inline (sem nome explícito), então o Postgres deu
-- o nome padrão <tabela>_<coluna>_check.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pendente_pagamento', 'aberto', 'pago', 'cancelado', 'falhou'));

-- ========== rastreio do Mercado Pago ==========
alter table public.orders add column if not exists mp_payment_id text;
alter table public.orders add column if not exists mp_preference_id text;
alter table public.orders add column if not exists mp_status text;
alter table public.orders add column if not exists mp_status_detail text;
alter table public.orders add column if not exists pago_em timestamptz;

-- ========== confirmação de pagamento (idempotente, chamada só pelo webhook) ==========
-- security definer pra rodar com privilégio elevado independente de quem chama — o webhook
-- chama via service role (que já ignora RLS), mas a função em si também precisa poder mexer
-- em orders/products sem depender de nenhuma policy.
create or replace function public.confirmar_pagamento_pedido(
  p_order_id uuid,
  p_mp_payment_id text,
  p_mp_status text,
  p_mp_status_detail text
) returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_status_atual text;
begin
  select status into v_status_atual from public.orders where id = p_order_id for update;

  if v_status_atual is null then
    raise exception 'pedido % não encontrado', p_order_id;
  end if;

  -- idempotência: o Mercado Pago pode reentregar a mesma notificação mais de uma vez —
  -- se já processamos essa confirmação, não baixa estoque de novo.
  if v_status_atual = 'pago' then
    return;
  end if;

  update public.orders
    set status = 'pago',
        mp_payment_id = p_mp_payment_id,
        mp_status = p_mp_status,
        mp_status_detail = p_mp_status_detail,
        pago_em = now()
    where id = p_order_id;

  update public.products p
    set estoque = greatest(p.estoque - oi.quantidade, 0)
    from public.order_items oi
    where oi.order_id = p_order_id and oi.product_id = p.id;
end;
$$;

-- ninguém além da service role pode chamar isso — senão qualquer usuário autenticado
-- conseguiria marcar o próprio pedido como pago via RPC direto.
revoke execute on function public.confirmar_pagamento_pedido(uuid, text, text, text) from public;
revoke execute on function public.confirmar_pagamento_pedido(uuid, text, text, text) from anon;
revoke execute on function public.confirmar_pagamento_pedido(uuid, text, text, text) from authenticated;
grant execute on function public.confirmar_pagamento_pedido(uuid, text, text, text) to service_role;

-- diagnóstico: confirma a constraint nova e os privilégios da função
select conname, pg_get_constraintdef(oid) as definicao
from pg_constraint
where conrelid = 'public.orders'::regclass and conname = 'orders_status_check';

select routine_name, security_type
from information_schema.routines
where routine_schema = 'public' and routine_name = 'confirmar_pagamento_pedido';
