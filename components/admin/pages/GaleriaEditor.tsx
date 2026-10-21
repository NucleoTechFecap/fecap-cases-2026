"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { HeadingFields, HeroFields, PageSeoFields } from "@/components/admin/pages/PageFields";
import { useDrivePreviews } from "@/components/admin/pages/useDrivePreviews";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import { GALLERY_ALBUMS } from "@/data/pages";
import { type DrivePreviews, albumUrls, parseDriveFolder } from "@/lib/landing/drive";
import type { GalleryAlbum, GalleryDay, PagesConfig } from "@/lib/landing/pages-schema";
import { isSafeUrl } from "@/lib/landing/urls";

type Galeria = PagesConfig["galeria"];

const ALBUM_HINT = "Link da pasta no Google Drive, compartilhada como “Qualquer pessoa com o link”.";

/** Situação do link: o painel avisa antes de publicar uma pasta privada ou um link que não é de pasta. */
function AlbumStatus({ url, previews, error }: { url: string; previews: DrivePreviews; error: string }) {
  if (!url.trim() || !isSafeUrl(url)) return null;

  const folder = parseDriveFolder(url);
  if (!folder) return <p className="adm-drive-status">Link aceito, mas a prévia das fotos só aparece com o link de uma pasta do Google Drive.</p>;
  if (error) return <p className="adm-drive-status adm-error">{error}</p>;

  const preview = previews[folder.id];
  if (!preview) return <p className="adm-drive-status">Verificando a pasta no Drive…</p>;

  switch (preview.status) {
    case "ok":
      return preview.photos.length > 0 ? (
        <p className="adm-drive-status" data-tone="ok">
          ✓ Pasta “{preview.title || "sem nome"}” pública — {preview.photos.length} {preview.photos.length === 1 ? "foto" : "fotos"} na prévia.
        </p>
      ) : (
        <p className="adm-drive-status" data-tone="warn">
          A pasta está pública, mas ainda não tem fotos. A prévia aparece assim que elas forem enviadas.
        </p>
      );
    case "private":
      return (
        <p className="adm-drive-status" data-tone="warn">
          Esta pasta não está pública: os visitantes não vão conseguir abrir. No Drive, vá em Compartilhar › Acesso geral › “Qualquer pessoa com o link”.
        </p>
      );
    case "not-found":
      return (
        <p className="adm-drive-status" data-tone="warn">
          Pasta não encontrada. Confira se o link é de uma pasta (e não de uma foto) e se ela não foi excluída.
        </p>
      );
    case "unavailable":
      return (
        <p className="adm-drive-status" data-tone="warn">
          Não foi possível consultar o Drive agora. O link continua salvo; use “Verificar links de novo” em instantes.
        </p>
      );
  }
}

/** Galeria: dias (botões do site) e, em cada dia, álbuns que apontam para pastas do Google Drive. */
export function GaleriaEditor({ value, onChange }: { value: Galeria; onChange: (next: Galeria) => void }) {
  const { confirm } = useFeedback();
  const set = patcher(value, onChange);
  const { previews, error, refresh } = useDrivePreviews(albumUrls(value.days));
  const updateDay = (id: string, patch: Partial<GalleryDay>) => set("days", value.days.map((day) => (day.id === id ? { ...day, ...patch } : day)));
  const updateAlbum = (day: GalleryDay, id: string, patch: Partial<GalleryAlbum>) =>
    updateDay(day.id, { albums: day.albums.map((album) => (album.id === id ? { ...album, ...patch } : album)) });

  async function removeDay(day: GalleryDay) {
    const confirmed = await confirm({
      title: "Excluir dia?",
      description: `"${day.label}" e os ${day.albums.length} álbuns cadastrados nele serão removidos do site. As pastas no Drive não são afetadas.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) set("days", value.days.filter((item) => item.id !== day.id));
  }

  return (
    <>
      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />

      <Group title="Cabeçalho dos álbuns">
        <HeadingFields value={value.heading} onChange={(next) => set("heading", next)} />
      </Group>

      <Group title="Textos dos álbuns">
        <TextField label="Botão que abre o álbum no Drive" value={value.albumButtonLabel} maxLength={40} onChange={(next) => set("albumButtonLabel", next)} />
        <TextAreaField label="Aviso de álbum ainda sem link" value={value.emptyText} maxLength={200} rows={2} onChange={(next) => set("emptyText", next)} />
      </Group>

      <Group
        title="Dias e álbuns"
        description="Cada dia vira um botão no site. Em cada álbum, cole o link da pasta do Google Drive: o site mostra algumas fotos dela e o botão leva ao álbum completo. Fotos novas na pasta aparecem sozinhas em até 5 minutos."
      >
        <div className="adm-add-row">
          <button type="button" className="adm-btn adm-btn-small" onClick={refresh}>
            Verificar links de novo
          </button>
        </div>

        <SortableList
          label="Dias"
          items={value.days}
          onReorder={(next) => set("days", next)}
          renderItem={(day) => (
            <details className="adm-item">
              <summary>
                <span>{day.label || "Novo dia"}</span>
                <em className="adm-item-count">
                  {day.albums.filter((album) => album.url.trim()).length} de {day.albums.length} com link
                </em>
              </summary>

              <TextField label="Nome do botão" value={day.label} maxLength={40} onChange={(label) => updateDay(day.id, { label })} />

              <SortableList
                label={`Álbuns de ${day.label}`}
                items={day.albums}
                onReorder={(albums) => updateDay(day.id, { albums })}
                renderItem={(album) => (
                  <div className="adm-line-item">
                    <TextField label="Nome do álbum" value={album.name} maxLength={40} onChange={(name) => updateAlbum(day, album.id, { name })} />
                    <LinkField label="Link do Google Drive" value={album.url} hint={ALBUM_HINT} onChange={(url) => updateAlbum(day, album.id, { url })} />
                    <AlbumStatus url={album.url} previews={previews} error={error} />
                    <button
                      type="button"
                      className="adm-btn adm-btn-small adm-btn-danger-text"
                      onClick={() => updateDay(day.id, { albums: day.albums.filter((item) => item.id !== album.id) })}
                    >
                      Excluir álbum
                    </button>
                  </div>
                )}
              />

              <div className="adm-add-row">
                <button
                  type="button"
                  className="adm-btn adm-btn-small"
                  disabled={day.albums.length >= 6}
                  onClick={() => updateDay(day.id, { albums: [...day.albums, { id: newId("album"), name: "Novo álbum", url: "" }] })}
                >
                  + Novo álbum
                </button>
                <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => removeDay(day)}>
                  Excluir dia
                </button>
              </div>
            </details>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.days.length >= 10}
          onClick={() =>
            set("days", [
              ...value.days,
              { id: newId("dia"), label: `Dia ${value.days.length + 1}`, albums: GALLERY_ALBUMS.map((name) => ({ id: newId("album"), name, url: "" })) },
            ])
          }
        >
          + Novo dia
        </button>
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}
