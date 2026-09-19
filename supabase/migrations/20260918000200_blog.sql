-- =====================================================================
-- FECAP Cases — Blog
-- Publicações, categorias, tags, busca e visibilidade pública.
--
-- Reutiliza o que já existe no projeto (nada é duplicado):
--   * roles ............ public.profiles + can_view_landing_admin / can_edit_landing / can_publish_landing
--   * mídia ............ public.landing_assets + bucket "landing-assets" (pastas blog/…)
--   * auditoria ........ public.landing_audit_logs
--
-- Permissões:
--   visitante .......... lê somente publicações visíveis (ver blog_post_is_public)
--   viewer ............. lê tudo no painel
--   editor ............. cria/edita RASCUNHOS, categorias e tags
--   admin/super_admin .. publica, agenda, despublica, arquiva e exclui
-- =====================================================================

-- ---------- Categorias ----------
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  description text not null default '' check (char_length(description) <= 300),
  color text not null default '#ff4b23' check (color ~ '^#[0-9a-fA-F]{6}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tags ----------
create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  created_at timestamptz not null default now()
);

-- ---------- Publicações ----------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  excerpt text not null default '' check (char_length(excerpt) <= 300),

  -- Documento do editor (Tiptap/ProseMirror). Nunca HTML: a página pública renderiza nó a nó.
  content_json jsonb not null default '{"type":"doc","content":[]}'::jsonb check (jsonb_typeof(content_json) = 'object'),
  content_text text not null default '',
  reading_minutes integer not null default 1 check (reading_minutes between 1 and 600),

  cover_image_url text not null default '',
  cover_image_alt text not null default '' check (char_length(cover_image_alt) <= 200),
  cover_image_decorative boolean not null default false,
  cover_image_caption text not null default '' check (char_length(cover_image_caption) <= 300),
  cover_image_credit text not null default '' check (char_length(cover_image_credit) <= 120),
  cover_image_source_url text not null default '',

  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  is_featured boolean not null default false,
  category_id uuid references public.blog_categories (id) on delete set null,

  -- Autor: vínculo com o usuário + assinatura exibida no site. A assinatura fica na publicação
  -- porque `profiles` não tem (e não deve ter) leitura pública.
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  author_name text not null default '' check (char_length(author_name) <= 120),
  author_role text not null default '' check (char_length(author_role) <= 120),
  author_bio text not null default '' check (char_length(author_bio) <= 400),
  author_avatar_url text not null default '',

  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  related_links jsonb not null default '[]'::jsonb check (jsonb_typeof(related_links) = 'array'),

  seo_title text not null default '' check (char_length(seo_title) <= 70),
  seo_description text not null default '' check (char_length(seo_description) <= 200),
  canonical_url text not null default '',
  og_title text not null default '' check (char_length(og_title) <= 100),
  og_description text not null default '' check (char_length(og_description) <= 200),
  og_image_url text not null default '',
  seo_index boolean not null default true,

  -- Data em que a publicação fica (ou ficou) visível. Em "scheduled" é uma data futura.
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,

  search tsvector generated always as (
    setweight(to_tsvector('portuguese', title), 'A') ||
    setweight(to_tsvector('portuguese', excerpt), 'B') ||
    setweight(to_tsvector('portuguese', content_text), 'C')
  ) stored,

  constraint blog_posts_publication_date check (status not in ('published', 'scheduled') or published_at is not null)
);

-- Slug único entre as publicações ativas (a lixeira não prende o endereço).
create unique index blog_posts_slug_key on public.blog_posts (slug) where deleted_at is null;
create index blog_posts_public_idx on public.blog_posts (published_at desc) where deleted_at is null and status in ('published', 'scheduled');
create index blog_posts_category_idx on public.blog_posts (category_id);
create index blog_posts_updated_idx on public.blog_posts (updated_at desc);
create index blog_posts_search_idx on public.blog_posts using gin (search);

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_post_tags_tag_idx on public.blog_post_tags (tag_id);

-- ---------- updated_at ----------
create function public.blog_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.blog_touch_updated_at();
create trigger blog_categories_touch before update on public.blog_categories
  for each row execute function public.blog_touch_updated_at();

-- ---------- Visibilidade pública ----------
-- Agendamento SEM cron: uma publicação "scheduled" passa a ser visível sozinha quando
-- published_at <= now(). Não há janela em que um job atrasado deixe o post de fora, nem
-- forma de o público enxergar antes da hora — a regra é avaliada a cada consulta.
create function public.blog_post_is_public(p public.blog_posts)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p.deleted_at is null
     and p.status in ('published', 'scheduled')
     and p.published_at is not null
     and p.published_at <= now();
$$;

-- ---------- RLS ----------
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;

-- Publicações
create policy "blog_posts: público lê publicadas" on public.blog_posts for select to anon, authenticated
  using (public.blog_post_is_public(blog_posts));

create policy "blog_posts: painel lê tudo" on public.blog_posts for select to authenticated
  using (public.can_view_landing_admin());

-- Editor só cria e altera rascunhos; qualquer outro status exige permissão de publicação.
create policy "blog_posts: editor cria rascunho" on public.blog_posts for insert to authenticated
  with check (public.can_edit_landing() and (status = 'draft' or public.can_publish_landing()));

create policy "blog_posts: editor altera rascunho" on public.blog_posts for update to authenticated
  using (public.can_edit_landing() and (status = 'draft' or public.can_publish_landing()))
  with check (public.can_edit_landing() and (status = 'draft' or public.can_publish_landing()));

-- O painel usa exclusão lógica (deleted_at); a exclusão definitiva fica restrita a administradores.
create policy "blog_posts: admin exclui" on public.blog_posts for delete to authenticated
  using (public.can_publish_landing());

-- Mover para a lixeira (deleted_at) também é decisão de quem publica, mesmo em rascunhos.
create function public.blog_protect_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deleted_at is distinct from old.deleted_at and not public.can_publish_landing() then
    raise exception 'Sem permissão para excluir publicações.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger blog_posts_protect_delete before update on public.blog_posts
  for each row execute function public.blog_protect_delete();

-- Categorias
create policy "blog_categories: público lê ativas" on public.blog_categories for select to anon, authenticated
  using (is_active);
create policy "blog_categories: painel lê tudo" on public.blog_categories for select to authenticated
  using (public.can_view_landing_admin());
create policy "blog_categories: editor cria" on public.blog_categories for insert to authenticated
  with check (public.can_edit_landing());
create policy "blog_categories: editor altera" on public.blog_categories for update to authenticated
  using (public.can_edit_landing()) with check (public.can_edit_landing());
-- Excluir mexe em publicações que já estão no ar (categoria/tag some delas): só quem publica.
create policy "blog_categories: admin exclui" on public.blog_categories for delete to authenticated
  using (public.can_publish_landing());

-- Tags
create policy "blog_tags: leitura pública" on public.blog_tags for select to anon, authenticated
  using (true);
create policy "blog_tags: editor cria" on public.blog_tags for insert to authenticated
  with check (public.can_edit_landing());
create policy "blog_tags: editor altera" on public.blog_tags for update to authenticated
  using (public.can_edit_landing()) with check (public.can_edit_landing());
create policy "blog_tags: admin exclui" on public.blog_tags for delete to authenticated
  using (public.can_publish_landing());

-- Vínculos: seguem a visibilidade/permissão da publicação (as subconsultas passam pelo RLS de blog_posts).
create policy "blog_post_tags: lê quem enxerga a publicação" on public.blog_post_tags for select to anon, authenticated
  using (exists (select 1 from public.blog_posts p where p.id = post_id));
create policy "blog_post_tags: editor vincula" on public.blog_post_tags for insert to authenticated
  with check (
    public.can_edit_landing()
    and exists (select 1 from public.blog_posts p where p.id = post_id and (p.status = 'draft' or public.can_publish_landing()))
  );
create policy "blog_post_tags: editor desvincula" on public.blog_post_tags for delete to authenticated
  using (
    public.can_edit_landing()
    and exists (select 1 from public.blog_posts p where p.id = post_id and (p.status = 'draft' or public.can_publish_landing()))
  );

-- ---------- Funções (SECURITY INVOKER: sempre respeitam o RLS de quem chama) ----------

-- Troca as tags de uma publicação de forma atômica.
create function public.set_blog_post_tags(p_post_id uuid, p_tag_ids uuid[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  delete from public.blog_post_tags where post_id = p_post_id and not (tag_id = any (coalesce(p_tag_ids, '{}')));
  insert into public.blog_post_tags (post_id, tag_id)
  select p_post_id, t from unnest(coalesce(p_tag_ids, '{}')) as t
  on conflict do nothing;
end;
$$;

-- Listagem/busca pública: título, resumo e conteúdo (full-text), além de categoria e tags.
create function public.search_blog_posts(p_query text default '', p_category text default '', p_tag text default '')
returns setof public.blog_posts
language sql
stable
set search_path = ''
as $$
  with q as (
    select trim(coalesce(p_query, '')) as raw,
           '%' || replace(replace(replace(trim(coalesce(p_query, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select p.*
  from public.blog_posts p, q
  where public.blog_post_is_public(p)
    and (coalesce(p_category, '') = '' or exists (
      select 1 from public.blog_categories c where c.id = p.category_id and c.slug = p_category and c.is_active))
    and (coalesce(p_tag, '') = '' or exists (
      select 1 from public.blog_post_tags pt join public.blog_tags t on t.id = pt.tag_id
      where pt.post_id = p.id and t.slug = p_tag))
    and (
      q.raw = ''
      or p.search @@ websearch_to_tsquery('portuguese', q.raw)
      or p.title ilike q.pattern
      or exists (select 1 from public.blog_categories c where c.id = p.category_id and c.is_active and c.name ilike q.pattern)
      or exists (
        select 1 from public.blog_post_tags pt join public.blog_tags t on t.id = pt.tag_id
        where pt.post_id = p.id and t.name ilike q.pattern)
    );
$$;

-- Conteúdos relacionados: mesma categoria vale 2 pontos, cada tag em comum vale 1.
create function public.related_blog_posts(p_post_id uuid, p_limit integer default 3)
returns setof public.blog_posts
language sql
stable
set search_path = ''
as $$
  select p.*
  from public.blog_posts p
  join public.blog_posts ref on ref.id = p_post_id
  where p.id <> ref.id
    and public.blog_post_is_public(p)
  order by
    (case when p.category_id is not null and p.category_id = ref.category_id then 2 else 0 end)
    + (select count(*) from public.blog_post_tags a
       join public.blog_post_tags b on b.tag_id = a.tag_id
       where a.post_id = p.id and b.post_id = ref.id) desc,
    p.published_at desc
  limit least(greatest(coalesce(p_limit, 3), 1), 12);
$$;

-- A biblioteca de mídia é compartilhada com a landing: antes de excluir uma imagem o painel
-- confere também se ela aparece em alguma publicação (capa, SEO, autor ou corpo do texto).
create function public.blog_asset_in_use(p_url text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.blog_posts p
    where p.deleted_at is null
      and (p.cover_image_url = p_url
        or p.og_image_url = p_url
        or p.author_avatar_url = p_url
        or position(p_url in p.content_json::text) > 0)
  );
$$;

-- ---------- Privilégios (privilégio mínimo; o RLS decide linha a linha) ----------
revoke all on table public.blog_posts, public.blog_categories, public.blog_tags, public.blog_post_tags
from anon, authenticated;

grant select on table public.blog_posts, public.blog_categories, public.blog_tags, public.blog_post_tags to anon;

grant select, insert, update, delete on table public.blog_posts, public.blog_categories, public.blog_tags to authenticated;
grant select, insert, delete on table public.blog_post_tags to authenticated;

grant all on table public.blog_posts, public.blog_categories, public.blog_tags, public.blog_post_tags to service_role;

revoke all on function public.set_blog_post_tags(uuid, uuid[]) from public, anon;
revoke all on function public.blog_asset_in_use(text) from public, anon;
grant execute on function public.set_blog_post_tags(uuid, uuid[]) to authenticated;
grant execute on function public.blog_asset_in_use(text) to authenticated;
grant execute on function public.blog_post_is_public(public.blog_posts) to anon, authenticated;
grant execute on function public.search_blog_posts(text, text, text) to anon, authenticated;
grant execute on function public.related_blog_posts(uuid, integer) to anon, authenticated;
