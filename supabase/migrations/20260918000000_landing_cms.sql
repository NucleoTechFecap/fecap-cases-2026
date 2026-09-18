-- =====================================================================
-- FECAP Cases — CMS da Landing Page
-- Roles, rascunho/publicação, versões, mídia, auditoria e contato.
-- =====================================================================

-- ---------- Roles (único sistema de permissões do projeto) ----------
create type public.app_role as enum ('super_admin', 'admin', 'editor', 'viewer', 'user');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Todo usuário novo nasce como "user" (sem acesso ao painel).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers de autorização. SECURITY DEFINER para não recursar nas policies de profiles.
create function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role from public.profiles where id = (select auth.uid())), 'user'::public.app_role);
$$;

-- Pode ver o painel (inclui visualizador).
create function public.can_view_landing_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.current_app_role() in ('super_admin', 'admin', 'editor', 'viewer'); $$;

-- Pode editar rascunho e mídia.
create function public.can_edit_landing()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.current_app_role() in ('super_admin', 'admin', 'editor'); $$;

-- Pode publicar, restaurar e descartar.
create function public.can_publish_landing()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.current_app_role() in ('super_admin', 'admin'); $$;

create policy "profiles: ler o próprio ou admin lê todos"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.can_publish_landing());

-- Ninguém altera a própria role: só super_admin gerencia perfis.
create policy "profiles: super_admin atualiza"
  on public.profiles for update to authenticated
  using (public.current_app_role() = 'super_admin')
  with check (public.current_app_role() = 'super_admin');

-- ---------- Landing: rascunho + ponteiro para a versão publicada ----------
create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  draft_content jsonb not null default '{}'::jsonb,
  draft_updated_at timestamptz not null default now(),
  draft_updated_by uuid references auth.users (id) on delete set null,
  published_version_id uuid,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- Versões são imutáveis: nunca há UPDATE/DELETE (rollback cria nova versão).
create table public.landing_versions (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.landing_pages (id) on delete cascade,
  version integer not null,
  content jsonb not null,
  status text not null check (status in ('published', 'restored')),
  note text,
  restored_from_version integer,
  created_by uuid references auth.users (id) on delete set null,
  created_by_name text,
  created_at timestamptz not null default now(),
  unique (landing_page_id, version)
);

alter table public.landing_pages
  add constraint landing_pages_published_version_fk
  foreign key (published_version_id) references public.landing_versions (id);

create index landing_versions_page_idx on public.landing_versions (landing_page_id, version desc);

alter table public.landing_pages enable row level security;
alter table public.landing_versions enable row level security;

-- O público NÃO tem SELECT nestas tabelas (o rascunho vive aqui).
-- Visitantes leem apenas via get_published_landing().
create policy "landing_pages: painel lê"
  on public.landing_pages for select to authenticated
  using (public.can_view_landing_admin());

create policy "landing_pages: editor salva rascunho"
  on public.landing_pages for update to authenticated
  using (public.can_edit_landing())
  with check (public.can_edit_landing());

create policy "landing_versions: painel lê"
  on public.landing_versions for select to authenticated
  using (public.can_view_landing_admin());

-- Editor só pode mexer no rascunho; ponteiro de publicação muda apenas via RPC.
create function public.protect_landing_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(current_setting('landing.allow_publish', true), '') <> 'on' then
    if new.published_version_id is distinct from old.published_version_id
       or new.published_at is distinct from old.published_at
       or new.slug is distinct from old.slug then
      raise exception 'A publicação só pode ser alterada pelas funções de publicação.';
    end if;
  end if;
  return new;
end;
$$;

create trigger landing_pages_protect_publication
  before update on public.landing_pages
  for each row execute function public.protect_landing_publication();

-- ---------- Auditoria (somente inserção; sem UPDATE/DELETE) ----------
create table public.landing_audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index landing_audit_logs_created_idx on public.landing_audit_logs (created_at desc);

alter table public.landing_audit_logs enable row level security;

create policy "audit: painel lê"
  on public.landing_audit_logs for select to authenticated
  using (public.can_view_landing_admin());

create policy "audit: editor registra as próprias ações"
  on public.landing_audit_logs for insert to authenticated
  with check (public.can_edit_landing() and user_id = (select auth.uid()));

-- ---------- Publicação / rollback / descarte (atômicos) ----------
create function public.get_published_landing(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'content', v.content,
    'version', v.version,
    'published_at', p.published_at
  )
  from public.landing_pages p
  join public.landing_versions v on v.id = p.published_version_id
  where p.slug = p_slug;
$$;

create function public.publish_landing(p_slug text, p_note text default null)
returns public.landing_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_page public.landing_pages;
  v_version public.landing_versions;
begin
  if not public.can_publish_landing() then
    raise exception 'Sem permissão para publicar.' using errcode = '42501';
  end if;

  select * into v_page from public.landing_pages where slug = p_slug for update;
  if not found then
    raise exception 'Landing page não encontrada.';
  end if;

  insert into public.landing_versions (landing_page_id, version, content, status, note, created_by, created_by_name)
  values (
    v_page.id,
    coalesce((select max(version) from public.landing_versions where landing_page_id = v_page.id), 0) + 1,
    v_page.draft_content,
    'published',
    left(p_note, 280),
    (select auth.uid()),
    (select full_name from public.profiles where id = (select auth.uid()))
  )
  returning * into v_version;

  perform set_config('landing.allow_publish', 'on', true);
  update public.landing_pages
     set published_version_id = v_version.id, published_at = v_version.created_at
   where id = v_page.id;
  perform set_config('landing.allow_publish', 'off', true);

  insert into public.landing_audit_logs (user_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), 'landing_published', 'landing_version', v_version.id::text,
          jsonb_build_object('version', v_version.version));

  return v_version;
end;
$$;

-- Rollback: cria uma NOVA versão com o conteúdo antigo e alinha o rascunho.
create function public.restore_landing_version(p_version_id uuid)
returns public.landing_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.landing_versions;
  v_version public.landing_versions;
begin
  if not public.can_publish_landing() then
    raise exception 'Sem permissão para restaurar.' using errcode = '42501';
  end if;

  select * into v_source from public.landing_versions where id = p_version_id;
  if not found then
    raise exception 'Versão não encontrada.';
  end if;

  perform 1 from public.landing_pages where id = v_source.landing_page_id for update;

  insert into public.landing_versions (landing_page_id, version, content, status, restored_from_version, created_by, created_by_name)
  values (
    v_source.landing_page_id,
    (select max(version) from public.landing_versions where landing_page_id = v_source.landing_page_id) + 1,
    v_source.content,
    'restored',
    v_source.version,
    (select auth.uid()),
    (select full_name from public.profiles where id = (select auth.uid()))
  )
  returning * into v_version;

  perform set_config('landing.allow_publish', 'on', true);
  update public.landing_pages
     set published_version_id = v_version.id,
         published_at = v_version.created_at,
         draft_content = v_source.content,
         draft_updated_at = now(),
         draft_updated_by = (select auth.uid())
   where id = v_source.landing_page_id;
  perform set_config('landing.allow_publish', 'off', true);

  insert into public.landing_audit_logs (user_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), 'landing_restored', 'landing_version', v_version.id::text,
          jsonb_build_object('version', v_version.version, 'restored_from', v_source.version));

  return v_version;
end;
$$;

-- Descartar: rascunho volta a ser igual à versão publicada.
create function public.discard_landing_draft(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_content jsonb;
begin
  if not public.can_publish_landing() then
    raise exception 'Sem permissão para descartar o rascunho.' using errcode = '42501';
  end if;

  select v.content into v_content
  from public.landing_pages p
  join public.landing_versions v on v.id = p.published_version_id
  where p.slug = p_slug;

  if v_content is null then
    raise exception 'Ainda não existe versão publicada.';
  end if;

  update public.landing_pages
     set draft_content = v_content, draft_updated_at = now(), draft_updated_by = (select auth.uid())
   where slug = p_slug;

  insert into public.landing_audit_logs (user_id, action, entity_type, entity_id)
  values ((select auth.uid()), 'landing_draft_discarded', 'landing_page', p_slug);

  return v_content;
end;
$$;

-- Migração do conteúdo atual: na primeira visita de um admin ao painel, o app envia a
-- configuração padrão (o conteúdo que estava hardcoded) e ela vira rascunho + versão 1 publicada.
create function public.ensure_landing(p_slug text, p_name text, p_content jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_page_id uuid;
  v_version public.landing_versions;
begin
  select id into v_page_id from public.landing_pages where slug = p_slug;
  if v_page_id is not null then
    return v_page_id;
  end if;

  if not public.can_publish_landing() then
    raise exception 'Sem permissão para inicializar a landing.' using errcode = '42501';
  end if;

  insert into public.landing_pages (slug, name, draft_content, draft_updated_by)
  values (p_slug, p_name, p_content, (select auth.uid()))
  returning id into v_page_id;

  insert into public.landing_versions (landing_page_id, version, content, status, note, created_by, created_by_name)
  values (v_page_id, 1, p_content, 'published', 'Conteúdo inicial migrado do site',
          (select auth.uid()), (select full_name from public.profiles where id = (select auth.uid())))
  returning * into v_version;

  perform set_config('landing.allow_publish', 'on', true);
  update public.landing_pages
     set published_version_id = v_version.id, published_at = v_version.created_at
   where id = v_page_id;
  perform set_config('landing.allow_publish', 'off', true);

  insert into public.landing_audit_logs (user_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), 'landing_initialized', 'landing_page', v_page_id::text, jsonb_build_object('version', 1));

  return v_page_id;
end;
$$;

revoke all on function public.ensure_landing(text, text, jsonb) from public, anon;
grant execute on function public.ensure_landing(text, text, jsonb) to authenticated;

revoke all on function public.publish_landing(text, text) from public, anon;
revoke all on function public.restore_landing_version(uuid) from public, anon;
revoke all on function public.discard_landing_draft(text) from public, anon;
grant execute on function public.publish_landing(text, text) to authenticated;
grant execute on function public.restore_landing_version(uuid) to authenticated;
grant execute on function public.discard_landing_draft(text) to authenticated;
grant execute on function public.get_published_landing(text) to anon, authenticated;

-- ---------- Biblioteca de mídia ----------
create table public.landing_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  path text not null unique,
  url text not null,
  folder text not null,
  mime_type text not null,
  size integer not null check (size > 0),
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.landing_assets enable row level security;

create policy "assets: painel lê" on public.landing_assets for select to authenticated
  using (public.can_view_landing_admin());
create policy "assets: editor envia" on public.landing_assets for insert to authenticated
  with check (public.can_edit_landing() and uploaded_by = (select auth.uid()));
create policy "assets: editor renomeia" on public.landing_assets for update to authenticated
  using (public.can_edit_landing()) with check (public.can_edit_landing());
create policy "assets: editor exclui" on public.landing_assets for delete to authenticated
  using (public.can_edit_landing());

-- ---------- Mensagens do formulário de contato ----------
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  message text not null check (char_length(message) between 5 and 4000),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Visitante só pode INSERIR; nunca ler mensagens de outras pessoas.
create policy "contato: qualquer pessoa envia" on public.contact_submissions for insert to anon, authenticated
  with check (true);
create policy "contato: painel lê" on public.contact_submissions for select to authenticated
  using (public.can_view_landing_admin());

-- ---------- Storage: leitura pública, escrita só para editores ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'landing-assets', 'landing-assets', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "landing-assets: leitura pública" on storage.objects for select to anon, authenticated
  using (bucket_id = 'landing-assets');
create policy "landing-assets: editor envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'landing-assets' and public.can_edit_landing());
create policy "landing-assets: editor substitui" on storage.objects for update to authenticated
  using (bucket_id = 'landing-assets' and public.can_edit_landing())
  with check (bucket_id = 'landing-assets' and public.can_edit_landing());
create policy "landing-assets: editor exclui" on storage.objects for delete to authenticated
  using (bucket_id = 'landing-assets' and public.can_edit_landing());

