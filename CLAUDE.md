@AGENTS.md

# HortiFácil

Sistema de vendas de um hortifruti fictício. Projeto **pessoal** do Erick (não é Bannerjet).
Ver `.agent/rules/hortifacil/context.md` e `guardrails.md` no workspace `PROJETOS/` pro
contexto completo — aqui só o que é específico deste repo.

## Stack
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + GSAP/ScrollTrigger + Motion
(`motion/react`) + Zustand + Supabase (`@supabase/ssr`) + `lucide-react` (ícones SVG).

## Rodando local
```
npm install
npm run dev
```
Sem `.env.local` preenchido, a app roda em **modo demonstração**: catálogo usa o seed local
(`src/lib/data/products-seed.ts`), login fica indisponível e checkout/pedidos só simulam
sucesso sem persistir. `.env.local` já está preenchido (Supabase pessoal do Erick, projeto
`gglxjgpdvmrrlvramxjk`) — protegido por exceção no hook do workspace (ver
[[feedback-env-local-hortifacil-liberado]] na memória).

## Decisões deliberadas
- **Next.js 16 renomeou `middleware.ts` → `proxy.ts`** (função exportada é `proxy`, não
  `middleware`). `src/proxy.ts` é o arquivo certo — não recriar um `middleware.ts`.
- **Supabase é a conta pessoal do Erick** — nunca a conta Bannerjet usada no resto do
  workspace `PROJETOS/`. O MCP `mcp__supabase__*` daqui não enxerga essa conta; mudanças de
  schema são manuais via `.sql` no SQL Editor do dashboard dele (ver `supabase/`).
- **Todo acesso ao Supabase passa por `isSupabaseConfigured`** (`src/lib/supabase/config.ts`)
  antes de chamar `createClient()`. Sem essa guarda o `@supabase/ssr` lança e derruba a rota.
- Fontes: **Fraunces** (display) + **Sora** (UI/corpo). Hero da home usa GSAP + ScrollTrigger
  com 3 camadas de folha em profundidades diferentes (scroll scrub + parallax de mouse) — é o
  pedido central do Erick, não simplificar pra uma camada só sem alinhar com ele antes.
- **Sem emoji em lugar nenhum da UI** — pedido explícito do Erick (20/08). Fallback de "produto
  sem foto" é `ProductThumb`/`ImageOff` (lucide), não emoji. Antes de adicionar qualquer ícone
  novo, usar `lucide-react` — nunca um glyph de emoji solto no JSX.
- **Fotos de produto usam `<img>` normal, não `next/image`** (`ProductThumb`, `ProductGallery`,
  formulário do admin) — de propósito: o admin pode colar URL de qualquer host externo (stock
  photo, etc.) e `next/image` exigiria cadastrar cada domínio em `next.config.ts` antes.
- **Cada produto tem `imagem_url` (capa) + `imagens: string[]`** (galeria, até 4, mostrada em
  `/produto/[slug]`). A primeira posição de `imagens` normalmente repete `imagem_url`.

## Fonte de fotos de produto: Magnific/Freepik
O Magnific MCP (`mcp__magnific__stock_search` + `stock_download`) funciona pra buscar fotos de
produto isoladas em fundo branco, licença free, sem custo de crédito (não aparece em
`simulate_cost`). **Isso só existe nesta sessão de chat** — não é algo que o app em produção
consegue chamar sozinho; pra automatizar de verdade dentro do app precisaria de uma API key da
Freepik cadastrada como integração própria (não feito). Fluxo usado: buscar → `stock_download`
pega uma **URL assinada com expiração curta** (baixar na hora, não guardar a URL) → `curl` pra
`public/images/produtos/` → `sharp` (instalado com `--no-save`, não é dependência do projeto)
redimensiona pra ~700px/qualidade 80 antes de comitar.

## Telas do admin
- **`/admin` (Pedidos)** — lista os pedidos já feitos (checkout do cliente + "Montar pedido" do
  admin): data, forma de pagamento, total, itens (expande por linha) e status editável
  (aberto/pago/cancelado) via `atualizarStatusPedido`. Antes disso não existia — só dava pra
  criar pedido, nunca ver os que já tinham sido feitos.
- **`/admin/montar-pedido`** — o POS manual (`AdminOrderBuilder`), que antes vivia em `/admin`.
- **`/admin/produtos`** — CRUD de produto.

## Pendências conhecidas
- ✅ **Bug do checkout (RLS 42501) corrigido em 21/08** — causa real: as policies de
  `orders`/`order_items` não estavam aplicadas no banco ao vivo (schema rodado antes de elas
  existirem, ou rodadas sem `drop policy if exists` numa tentativa anterior). Fix em
  `supabase/corrigir-rls-pedidos-2026-08-21.sql` (idempotente, já rodado pelo Erick). Ver
  [[hortifacil-engineer/04-checkout-nao-registra-pedido]].
- **Rodar o SQL de sincronização** (se ainda não rodado): `supabase/schema.sql` (schema
  completo) + `supabase/atualizar-galeria-2026-08-20.sql` (galeria dos 18 produtos originais) +
  `supabase/adicionar-produtos-2026-08-20.sql` (os 25 produtos novos abaixo). O
  `insert ... on conflict do nothing` do schema não faz `update` em quem já existe.
- **Catálogo expandido em 20/08**: +25 produtos (12 frutas, 8 legumes, 5 verduras) via
  Magnific/Freepik — só foto de capa por enquanto, sem galeria de 4 fotos (fica pra próxima
  rodada se o Erick quiser). Novos: abacate, mamão, maracujá, melão, tangerina, ameixa, caqui,
  goiaba, coco, cereja, romã, figo, amora, abobrinha, abóbora, berinjela, pepino, beterraba,
  milho, cebola, batata-doce, couve, espinafre, rúcula, repolho. Rodar
  `supabase/adicionar-produtos-2026-08-20.sql` no banco ao vivo pra eles aparecerem lá (o modo
  demonstração já os tem via `products-seed.ts`).
- **Primeiro admin**: depois de aplicar o schema e criar a conta pela tela de login, rodar o
  `update` comentado no fim do `schema.sql` pra virar admin.
## Próximas etapas (definidas por Erick em 20/08)
1. **Redesign do visual** — "mudar bastante coisa no design", ainda sem escopo definido. Alinhar
   com ele o que exatamente antes de sair mexendo (telas? paleta? tipografia? só a home?).
2. 🟡 **Pagamento real com PIX e cartão (Mercado Pago) — código pronto em 24/08, falta credencial
   e deploy pro Erick prover.** Decisões fechadas: híbrido (Pix via Orders API `/v1/orders` com
   QR inline, cartão via Checkout Pro redirect); `criarPedido` virou duas funções —
   `criarPedidoCliente` (nasce `pendente_pagamento`, só confirma via webhook) e
   `criarPedidoAdmin` (POS presencial, nasce `pago` e já baixa estoque); webhook em
   `src/app/api/webhooks/mercadopago/route.ts`; SQL em
   `supabase/pagamento-mercadopago-2026-08-24.sql` (**ainda não rodado no banco**). Falta:
   Erick gerar as credenciais do Mercado Pago + a service role key do Supabase (ver
   `.env.example`), linkar o projeto na Vercel (`npx vercel login` interativo, não dá pra fazer
   por aqui) e rodar o SQL novo. Ver
   [[hortifacil-engineer/07-plano-pagamento-mercado-pago]] pro estado detalhado.

### Estado da sessão em 24/08 (parte 3) — retomar aqui na próxima
🔴 **Achado crítico: o código do pagamento (Mercado Pago) nunca foi commitado nem enviado ao
GitHub.** `git status` mostra `src/app/api/`, `src/lib/mercadopago/`, `src/components/checkout/`,
`src/lib/supabase/service.ts` e o SQL como untracked; `origin/main` está parado no commit que só
documentou o plano, não o código. A Vercel builda a partir do GitHub — o deploy em
**https://hortifacil.vercel.app** (já no ar, feito pelo Erick) **não tem nenhuma dessas rotas**.
`POST /api/webhooks/mercadopago` devolve 404 por causa disso, não por falta de env var. Antes de
qualquer teste real, alguém precisa commitar e dar `git push` — **não fiz isso sozinho** (regra
do workspace: só commitar/pushar quando pedido explicitamente pelo Erick).

O que já foi resolvido nesta parte da sessão (via MCP do Mercado Pago + o que o Erick fez à
parte):
- Erick rodou `supabase/pagamento-mercadopago-2026-08-24.sql`, preencheu
  `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` e deployou na Vercel.
- `save_webhook` configurado com sucesso (`callback_sandbox = hortifacil.vercel.app/api/webhooks/mercadopago`,
  topics `payment`+`order`), mas o `MERCADO_PAGO_WEBHOOK_SECRET` completo **não veio** — o MCP só
  mostra os 7 primeiros caracteres por segurança. Precisa pegar o valor inteiro em
  `https://www.mercadopago.com.br/developers/panel/app/8413860286566483/webhooks` e colar na
  linha já preparada no `.env.local`.
- Confirmado (via `/login` em produção, sem tocar em nada sensível) que
  `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` já estão na Vercel. As 3 vars novas
  (`MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) ainda
  precisam ser setadas lá — `npx vercel whoami` continua "Logged out" nesta sessão (sem
  `.vercel/` linkado, sem `VERCEL_TOKEN`), não dá pra fazer por CLI sem o Erick logar
  interativamente primeiro.

Ordem pra retomar: (1) Erick autoriza e alguém commita+dá push do código de pagamento, (2) seta
as 3 env vars na Vercel (dashboard ou CLI logado), (3) redeploy, (4) só aí testar Pix + cartão —
tem usuário de teste comprador pronto (`3639514870`, R$1.000 de saldo). Detalhe completo em
[[hortifacil-engineer/07-plano-pagamento-mercado-pago]].
