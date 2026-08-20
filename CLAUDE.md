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

## Pendências conhecidas
- 🔴 **BUG ABERTO (20/08): "Finalizar pedido" falha** — `/carrinho` e o "Montar pedido" do
  admin mostram "Não deu pra registrar o pedido" ao tentar `criarPedido`
  (`src/app/actions/orders.ts`). Causa real não diagnosticada — suspeita principal é o schema
  (tabelas `orders`/`order_items`) não estar 100% aplicado no banco ao vivo. Já adicionei
  `console.error(orderError)` / `console.error(itemsError)` na action — a próxima tentativa vai
  aparecer no terminal do `npm run dev` com o erro real do Supabase, ler isso primeiro antes de
  tentar qualquer coisa. Ver [[hortifacil-engineer/04-checkout-nao-registra-pedido]].
- **Rodar o SQL de sincronização**: `supabase/schema.sql` (schema completo, se ainda não
  rodado) + `supabase/atualizar-galeria-2026-08-20.sql` (preenche a coluna `imagens` dos 18
  produtos — o `insert ... on conflict do nothing` do schema não faz `update` em quem já
  existe). Sem isso o Supabase ao vivo fica sem a galeria (a home/produto funcionam do mesmo
  jeito, só sem as 4 fotos).
- **Primeiro admin**: depois de aplicar o schema e criar a conta pela tela de login, rodar o
  `update` comentado no fim do `schema.sql` pra virar admin.
- Checkout não tem gateway de pagamento de verdade — "Débito/Crédito/PIX" é só metadado do
  pedido, sem cobrança real.
- Redesign mais amplo do visual (fora do admin) ainda não começou — Erick sinalizou que quer
  "mudar bastante coisa no design" antes de fechar o projeto, mas sem especificar o quê ainda.
