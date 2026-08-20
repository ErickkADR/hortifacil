-- HortiFácil — schema inicial
-- Rodar isso no SQL Editor do projeto Supabase (conta pessoal do Erick, não a da Bannerjet).

-- ========== profiles ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  criado_em timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "usuário lê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- cria o profile automaticamente quando alguém se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, new.raw_user_meta_data ->> 'nome', 'cliente');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper pra política de admin sem recursão de RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ========== products ==========
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  nome text not null,
  categoria text not null,
  preco numeric(10, 2) not null,
  unidade text not null default 'kg',
  imagem_url text,
  imagens text[] not null default '{}',
  descricao text not null default '',
  estoque integer not null default 0,
  ativo boolean not null default true
);

-- se a tabela já existia (schema aplicado antes de 20/08), isso adiciona a
-- coluna sem quebrar nada — seguro rodar de novo em qualquer estado.
alter table public.products add column if not exists imagens text[] not null default '{}';

alter table public.products enable row level security;

create policy "qualquer um lê produtos ativos"
  on public.products for select
  using (ativo = true or public.is_admin());

create policy "só admin edita produtos"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ========== orders ==========
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'aberto' check (status in ('aberto', 'pago', 'cancelado')),
  metodo_pagamento text check (metodo_pagamento in ('debito', 'credito', 'pix')),
  total numeric(10, 2) not null default 0,
  criado_em timestamptz not null default now()
);

alter table public.orders enable row level security;

-- checkout de convidado (sem login) também é permitido, por isso o insert é aberto
create policy "qualquer um cria pedido"
  on public.orders for insert
  with check (true);

create policy "dono ou admin lê o pedido"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "admin atualiza pedido"
  on public.orders for update
  using (public.is_admin());

-- ========== order_items ==========
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text references public.products (id),
  produto_nome text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null
);

alter table public.order_items enable row level security;

create policy "qualquer um insere item de pedido"
  on public.order_items for insert
  with check (true);

create policy "dono ou admin lê itens do pedido"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- ========== seed dos produtos ==========
-- gerado a partir de src/lib/data/products-seed.ts — rode junto com o schema acima.
insert into public.products (id, slug, nome, categoria, preco, unidade, imagem_url, imagens, descricao, estoque, ativo) values
  ('tomate', 'tomate', 'Tomate', 'Legume', 8.90, 'kg', '/images/produtos/tomate.png', array['/images/produtos/tomate.png'], 'Vermelho, suculento e colhido no ponto certo de maturação. Ótimo cru em saladas ou refogado no molho do dia a dia.', 40, true),
  ('alface', 'alface', 'Alface', 'Verdura', 3.50, 'unid', '/images/produtos/alface.png', array['/images/produtos/alface.png'], 'Folhas crocantes e fresquinhas, direto do produtor pra sua mesa. Rica em fibras — a base de qualquer salada boa.', 30, true),
  ('cenoura', 'cenoura', 'Cenoura', 'Legume', 5.90, 'kg', '/images/produtos/cenoura.png', array['/images/produtos/cenoura.png'], 'Doce, crocante e cheia de betacaroteno. Vai bem crua, no suco, refogada ou assada.', 35, true),
  ('banana', 'banana', 'Banana', 'Fruta', 6.50, 'kg', '/images/produtos/banana.png', array['/images/produtos/banana.png'], 'Doce e energética, a queridinha de qualquer hora do dia. Ótima pura, na vitamina ou na fruta assada.', 50, true),
  ('laranja', 'laranja', 'Laranja', 'Fruta', 5.50, 'kg', '/images/produtos/laranja.png', array['/images/produtos/laranja.png'], 'Suculenta e cheia de vitamina C. Perfeita pro suco da manhã ou pra comer descascada mesmo.', 45, true),
  ('melancia', 'melancia', 'Melancia', 'Fruta', 4.90, 'kg', '/images/produtos/melancia.jpg', array['/images/produtos/melancia.jpg'], 'Refrescante, doce e com mais de 90% de água. A fruta certa pros dias quentes.', 20, true),
  ('maca', 'maca', 'Maçã', 'Fruta', 9.90, 'kg', '/images/produtos/maca.png', array['/images/produtos/maca.png'], 'Crocante e levemente adocicada. Ótima pura, em saladas ou numa torta caseira.', 40, true),
  ('limao', 'limao', 'Limão', 'Fruta', 6.90, 'kg', '/images/produtos/limao.jpg', array['/images/produtos/limao.jpg'], 'Ácido na medida certa pra temperar, suco ou aquela caipirinha de fim de semana.', 30, true),
  ('batata', 'batata', 'Batata', 'Legume', 6.90, 'kg', '/images/produtos/batata.png', array['/images/produtos/batata.png'], 'Versátil e presente em quase toda receita — frita, cozida, assada ou no purê.', 50, true),
  ('pera', 'pera', 'Pera', 'Fruta', 10.90, 'kg', '/images/produtos/pera.png', array['/images/produtos/pera.png'], 'Macia, suculenta e delicadamente doce. Ótima pura ou numa salada com queijo.', 25, true),
  ('uva', 'uva', 'Uva', 'Fruta', 14.90, 'kg', '/images/produtos/uva.png', array['/images/produtos/uva.png'], 'Bagos suculentos, prontos pra comer direto do cacho. Antioxidante e uma delícia gelada.', 20, true),
  ('brocolis', 'brocolis', 'Brócolis', 'Verdura', 7.90, 'unid', '/images/produtos/brocolis.png', array['/images/produtos/brocolis.png'], 'Rico em nutrientes, ótimo no vapor, salteado ou numa sopa nutritiva.', 20, true),
  ('pimentao', 'pimentao', 'Pimentão', 'Legume', 9.50, 'kg', '/images/produtos/pimentao.png', array['/images/produtos/pimentao.png'], 'Crocante e colorido, dá sabor e cor pra qualquer refogado ou salada.', 25, true),
  ('manga', 'manga', 'Manga', 'Fruta', 8.50, 'kg', '/images/produtos/manga.png', array['/images/produtos/manga.png'], 'Polpa doce e aromática. Ótima pura, em suco ou numa salada tropical.', 30, true),
  ('morango', 'morango', 'Morango', 'Fruta', 12.90, 'cx', '/images/produtos/morango.png', array['/images/produtos/morango.png'], 'Vermelho, doce e perfumado. Combina com tudo — puro, no leite condensado ou na sobremesa.', 20, true),
  ('abacaxi', 'abacaxi', 'Abacaxi', 'Fruta', 7.90, 'unid', '/images/produtos/abacaxi.png', array['/images/produtos/abacaxi.png'], 'Doce, ácido na medida e super refrescante. Ótimo puro, grelhado ou no suco.', 20, true),
  ('kiwi', 'kiwi', 'Kiwi', 'Fruta', 15.90, 'kg', '/images/produtos/kiwi.png', array['/images/produtos/kiwi.png'], 'Polpa verde, ácida e cheia de vitamina C. Ótimo puro, na salada de frutas ou na vitamina.', 15, true),
  ('pessego', 'pessego', 'Pêssego', 'Fruta', 11.90, 'kg', '/images/produtos/pessego.png', array['/images/produtos/pessego.png'], 'Macio, suculento e delicadamente doce. Ótimo puro ou numa torta de fim de semana.', 15, true)
on conflict (id) do nothing;

-- ========== primeiro admin ==========
-- depois de criar sua conta pela tela de login (ou pelo Authentication > Users do
-- dashboard), rode isto pra virar admin:
-- update public.profiles set role = 'admin' where id = 'UUID-DO-SEU-USUARIO';
