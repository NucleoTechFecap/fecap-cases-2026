import type { GalleryDay } from "@/lib/landing/pages-schema";

// Álbuns da Galeria: pastas públicas do Google Drive. As fotos nunca passam pelo Storage do site.

export type DriveFolder = { id: string; resourceKey: string };

/** "private" = a pasta existe, mas não está como "Qualquer pessoa com o link". `photos` = IDs dos arquivos. */
export type DriveAlbumPreview = { status: "ok"; title: string; photos: string[] } | { status: "private" | "not-found" | "unavailable" };

/** Prévias indexadas pelo ID da pasta. */
export type DrivePreviews = Record<string, DriveAlbumPreview>;

export const DRIVE_ID = /^[\w-]{10,100}$/;

/** Aceita os formatos de link do Drive: /drive/folders/ID, /drive/u/0/folders/ID, open?id=ID e folderview?id=ID. */
export function parseDriveFolder(value: string): DriveFolder | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== "drive.google.com") return null;

  const id = url.pathname.match(/\/folders\/([^/]+)/)?.[1] ?? (url.pathname.startsWith("/drive/") ? null : url.searchParams.get("id"));
  if (!id || !DRIVE_ID.test(id)) return null;

  // Pastas compartilhadas antes de 2021 só abrem com a resourcekey do link.
  const resourceKey = url.searchParams.get("resourcekey") ?? "";
  return { id, resourceKey: /^[\w-]{1,100}$/.test(resourceKey) ? resourceKey : "" };
}

export const albumUrls = (days: GalleryDay[]) => days.flatMap((day) => day.albums.map((album) => album.url));

/** Miniatura gerada pelo próprio Google (funciona também para HEIC); `size` = maior lado, em pixels. */
export const drivePhotoUrl = (id: string, size: number) => `https://lh3.googleusercontent.com/d/${id}=s${size}`;

export const driveFileUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`;
