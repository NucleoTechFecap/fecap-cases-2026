-- =====================================================================
-- FECAP Cases — Privilégios das tabelas do CMS (privilégio mínimo)
--
-- Projetos Supabase novos não concedem mais acesso automático às tabelas
-- de `public` para os papéis da API. Sem estes GRANTs nenhuma consulta do
-- painel funciona (nem a leitura de `profiles` no login).
-- O GRANT só abre a porta: quem decide linha a linha continua sendo o RLS.
-- =====================================================================

-- Parte de um estado conhecido: nada para os papéis da API (inclui TRUNCATE, que ignora RLS).
revoke all on table
  public.profiles,
  public.landing_pages,
  public.landing_versions,
  public.landing_audit_logs,
  public.landing_assets,
  public.contact_submissions
from anon, authenticated;

-- Visitante anônimo: apenas enviar o formulário de contato.
-- A landing publicada é lida somente via get_published_landing().
grant insert on table public.contact_submissions to anon, authenticated;

-- Usuário logado: só os verbos que alguma policy realmente usa.
grant select, update on table public.profiles to authenticated;
grant select, update on table public.landing_pages to authenticated;
grant select on table public.landing_versions to authenticated;
grant select, insert on table public.landing_audit_logs to authenticated;
grant select, insert, update, delete on table public.landing_assets to authenticated;
grant select on table public.contact_submissions to authenticated;

-- Rotinas de manutenção/backoffice (nunca exposto ao navegador).
grant all on table
  public.profiles,
  public.landing_pages,
  public.landing_versions,
  public.landing_audit_logs,
  public.landing_assets,
  public.contact_submissions
to service_role;

-- Helpers usados dentro das policies (avaliadas com o papel de quem consulta).
grant execute on function public.current_app_role() to anon, authenticated;
grant execute on function public.can_view_landing_admin() to anon, authenticated;
grant execute on function public.can_edit_landing() to anon, authenticated;
grant execute on function public.can_publish_landing() to anon, authenticated;
