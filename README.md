# FECAP Cases Landing Page

Landing page do FECAP Cases construída em React + Next.js 16 com App Router e TypeScript.

## Rodando o projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Arquitetura por componentes

A página `app/page.tsx` ficou propositalmente mínima. Toda a landing page está quebrada em componentes reutilizáveis:

```text
app/
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ContactForm.tsx
├── Countdown.tsx
├── FaqAccordion.tsx
└── landing/
    ├── AboutSection.tsx
    ├── ContactSection.tsx
    ├── CountdownSection.tsx
    ├── FaqSection.tsx
    ├── FecapCasesLandingPage.tsx
    ├── HeroSection.tsx
    ├── MarqueeBar.tsx
    ├── PartnersSection.tsx
    ├── SiteFooter.tsx
    ├── SiteHeader.tsx
    ├── SponsorGroup.tsx
    └── index.ts

data/
└── fecapCases.ts
```

## Onde editar o conteúdo

O conteúdo da landing é administrado pelo painel em `/admin/landing-page` (textos, imagens, cores, links,
seções, parceiros, FAQ, SEO…). Nada disso exige editar código.

- `lib/landing/defaults.ts` guarda o conteúdo padrão. Ele é usado como **fallback** (a landing nunca quebra
  se o Supabase estiver fora do ar ou sem configuração) e como **conteúdo inicial** migrado para o banco.
- `lib/landing/schema.ts` é o contrato (Zod) de tudo o que é editável. Toda gravação é validada no servidor.
- `data/pages.ts` e `data/schedule.ts` continuam alimentando as páginas internas.

## CMS da landing (Supabase)

### Configuração

1. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   A `service_role` **não** é usada pelo app e nunca deve ir para o front-end.
2. Aplique as migrations de `supabase/migrations/` (`supabase db push` no projeto remoto, ou
   `supabase start` + `supabase migration up` localmente). Elas criam tabelas, RLS, funções de
   publicação, o bucket `landing-assets` e os GRANTs mínimos.
3. Crie o usuário no Supabase Auth (Dashboard › Authentication › Add user) e promova-o no SQL Editor:

   ```sql
   update public.profiles set role = 'super_admin'
   where id = (select id from auth.users where email = 'pessoa@fecap.br');
   ```

   Todo usuário novo nasce como `user` (sem acesso). Roles: `super_admin`, `admin` (editam e publicam),
   `editor` (edita rascunho e mídia, não publica), `viewer` (somente leitura), `user`.
4. Na primeira vez que um admin abre `/admin/landing-page`, o conteúdo atual do site é gravado como
   rascunho + versão 1 publicada. A landing continua visualmente igual.

### Como funciona

- **Rascunho x publicado:** o editor grava apenas `landing_pages.draft_content`. "Publicar" chama a função
  `publish_landing`, que copia o rascunho para uma nova linha imutável em `landing_versions` e move o ponteiro
  `published_version_id`. Visitantes leem somente `get_published_landing()` — o rascunho não tem SELECT público.
- **Preview:** um iframe (`/admin/landing-page/preview`) renderiza os mesmos componentes da landing pública e
  recebe o rascunho por `postMessage`, na largura real de desktop/tablet/mobile.
- **Histórico e rollback:** restaurar cria uma **nova** versão com o conteúdo antigo; nada é apagado.
- **Cache:** a landing busca uma única configuração agregada, em cache (`unstable_cache`), revalidada ao
  publicar ou restaurar.
- **Segurança:** cada server action revalida sessão e role; o RLS do banco e do Storage bloqueia de forma
  independente. Uploads conferem extensão, MIME, assinatura do arquivo e sanitizam SVG.

## Blog (`/blog` e `/admin/blog`)

Módulo de blog integrado ao painel e ao site. Reutiliza roles, auditoria, biblioteca de mídia e bucket do CMS.

- **Rotas públicas:** `/blog` (destaque, busca `?q=`, filtros `?categoria=` / `?tag=`, paginação `?pagina=`) e
  `/blog/[slug]` (metadata, JSON-LD `BlogPosting`, breadcrumb, fontes, links relacionados, relacionados).
  `app/sitemap.ts` e `app/robots.ts` incluem só o que está no ar.
- **Painel:** `/admin/blog` (métricas, busca, filtros, ações), `/admin/blog/new`, `/admin/blog/[id]/edit`,
  `/admin/blog/[id]/preview`, `/admin/blog/categories`, `/admin/blog/tags`, `/admin/blog/media`.
- **Permissões:** `viewer` lê; `editor` cria/edita **rascunhos**, categorias e tags; `admin`/`super_admin` publicam,
  agendam, despublicam, arquivam e excluem. A regra vale nas páginas, nas server actions e no RLS.
- **Conteúdo:** o editor (Tiptap) grava JSON em `blog_posts.content_json`. O servidor reconstrói o documento por
  allowlist (`lib/blog/content.ts`) e o site renderiza nó a nó em React (`components/blog/ArticleContent.tsx`) —
  não existe HTML cru nem `dangerouslySetInnerHTML` para conteúdo. Títulos do texto começam em `<h2>`.
- **Agendamento sem cron:** uma publicação `scheduled` fica visível sozinha quando `published_at <= now()`
  (função `blog_post_is_public`, usada pelo RLS). O cache público revalida a cada 60 s; salvar/publicar pelo
  painel invalida na hora (`revalidateTag("blog")` + `revalidatePath`).
- **Autosave:** só para rascunhos (nunca publica). Exclusão é lógica (`deleted_at`).
- **Imagens:** mesma biblioteca da landing (`landing_assets` + bucket `landing-assets`), em `blog/covers` e
  `blog/content`. Imagem usada em publicação não pode ser excluída. Alt é obrigatório para publicar
  (ou marque a imagem como decorativa).
- **Landing:** `<LatestPosts />` (`components/blog/LatestPosts.tsx`) exibe "Conteúdos recentes" e pode ser colocado
  em qualquer página. O link "Blog" do menu vem de `NAV_ITEMS` (`data/fecapCases.ts`).
- **Configuração:** aplique `supabase/migrations/20260918000200_blog.sql` e defina `NEXT_PUBLIC_SITE_URL`
  (canonical, Open Graph, sitemap e JSON-LD). Sem ela, usa a URL canônica do SEO da landing.

## Componentes client-side

Somente os componentes que realmente precisam de estado/interação usam `"use client"`:

- `Countdown.tsx`;
- `FaqAccordion.tsx`;
- `ContactForm.tsx`.

O restante permanece como Server Components por padrão.
