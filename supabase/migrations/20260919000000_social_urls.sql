-- Redes oficiais do evento: troca a URL de TODOS os itens de Instagram e TikTok gravados no CMS
-- (rascunho e versão publicada). Versões antigas do histórico ficam como estavam.

create function pg_temp.with_official_social(content jsonb)
returns jsonb
language sql
as $$
  select case
    when jsonb_typeof(content -> 'social') <> 'array' then content
    else jsonb_set(
      content,
      '{social}',
      coalesce(
        (
          select jsonb_agg(
            case item ->> 'network'
              when 'instagram' then item || '{"url": "https://www.instagram.com/fecapcases/"}'::jsonb
              when 'tiktok' then item || '{"url": "https://www.tiktok.com/@fecap_cases"}'::jsonb
              else item
            end
            order by position
          )
          from jsonb_array_elements(content -> 'social') with ordinality as entries (item, position)
        ),
        '[]'::jsonb
      )
    )
  end;
$$;

update public.landing_pages
set draft_content = pg_temp.with_official_social(draft_content);

update public.landing_versions v
set content = pg_temp.with_official_social(v.content)
from public.landing_pages p
where p.published_version_id = v.id;
