import { unstable_cache } from "next/cache";
import { DRIVE_ID, type DriveAlbumPreview, type DriveFolder, type DrivePreviews, parseDriveFolder } from "@/lib/landing/drive";
import { LANDING_CACHE_TAG } from "@/lib/supabase/env";

// A prévia lê a mesma página que o Drive usa para incorporar pastas (embeddedfolderview): não exige
// chave de API, só que a pasta esteja como "Qualquer pessoa com o link". Se o Google mudar esse HTML,
// a Galeria continua com o botão de cada álbum; só as miniaturas deixam de aparecer.

/** Fotos na prévia de cada álbum: o site mostra 9 no computador e 5 no celular. */
const PREVIEW_SIZE = 9;
const MAX_SUBFOLDERS = 3;
const MAX_ALBUMS = 60;

type FolderListing = { title: string; photos: string[]; folders: string[] };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeHtml(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, entity: string) => {
    if (entity[0] !== "#") return ENTITIES[entity.toLowerCase()] ?? match;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

function parseListing(html: string): FolderListing {
  const listing: FolderListing = { title: decodeHtml(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim(), photos: [], folders: [] };

  for (const entry of html.split('<div class="flip-entry" id="entry-').slice(1)) {
    const id = entry.slice(0, entry.indexOf('"'));
    if (!DRIVE_ID.test(id)) continue;

    if (/<a href="[^"]*\/folders\//.test(entry)) listing.folders.push(id);
    else if (entry.includes("/type/image/")) listing.photos.push(id);
  }

  return listing;
}

async function readFolder(folder: DriveFolder): Promise<FolderListing | "private" | "not-found"> {
  const params = new URLSearchParams({ id: folder.id });
  if (folder.resourceKey) params.set("resourcekey", folder.resourceKey);

  const response = await fetch(`https://drive.google.com/embeddedfolderview?${params}`, { signal: AbortSignal.timeout(8000) });
  if (response.status === 401 || response.status === 403) return "private";
  if (response.status === 404) return "not-found";
  // Instabilidade do Google: o erro sobe para não ficar guardado no cache.
  if (!response.ok) throw new Error(`O Drive respondeu ${response.status}.`);

  const html = await response.text();
  if (!html.includes("flip-contents")) throw new Error("O Drive devolveu uma página em formato desconhecido.");
  return parseListing(html);
}

/** Fotos espalhadas pelo álbum inteiro: as primeiras costumam ser sequências quase iguais da mesma cena. */
function spread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_, index) => items[Math.floor((index * items.length) / count)]);
}

async function fetchPreview(folder: DriveFolder): Promise<DriveAlbumPreview> {
  const listing = await readFolder(folder);
  if (typeof listing === "string") return { status: listing };

  // Álbum separado em subpastas (ex.: uma por fotógrafo): completa a prévia com as primeiras delas.
  if (listing.photos.length < PREVIEW_SIZE && listing.folders.length > 0) {
    const nested = await Promise.allSettled(listing.folders.slice(0, MAX_SUBFOLDERS).map((id) => readFolder({ id, resourceKey: "" })));
    for (const result of nested) {
      if (result.status === "fulfilled" && typeof result.value !== "string") listing.photos.push(...result.value.photos);
    }
  }

  return { status: "ok", title: listing.title, photos: spread(listing.photos, PREVIEW_SIZE) };
}

// 5 minutos: durante o evento as fotos chegam aos poucos. Publicar no painel também renova (mesma tag da landing).
const cachedPreview = unstable_cache(fetchPreview, ["drive-album-preview"], { tags: [LANDING_CACHE_TAG], revalidate: 300 });

/** Prévia de cada pasta do Drive citada nos links. `fresh` ignora o cache: o painel precisa ver o compartilhamento atual. */
export async function loadDrivePreviews(urls: string[], { fresh = false } = {}): Promise<DrivePreviews> {
  const folders = new Map<string, DriveFolder>();
  for (const url of urls) {
    const folder = parseDriveFolder(url);
    if (folder && folders.size < MAX_ALBUMS) folders.set(folder.id, folder);
  }

  const entries = await Promise.all(
    [...folders.values()].map(async (folder): Promise<[string, DriveAlbumPreview]> => {
      try {
        return [folder.id, await (fresh ? fetchPreview(folder) : cachedPreview(folder))];
      } catch (error) {
        console.error(`[galeria] Não foi possível ler a pasta ${folder.id} do Drive.`, error);
        return [folder.id, { status: "unavailable" }];
      }
    }),
  );

  return Object.fromEntries(entries);
}
