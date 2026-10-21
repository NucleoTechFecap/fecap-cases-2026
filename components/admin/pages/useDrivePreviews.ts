"use client";

import { useEffect, useState } from "react";
import { previewDriveAlbums } from "@/app/admin/actions";
import { type DrivePreviews, parseDriveFolder } from "@/lib/landing/drive";

/**
 * Prévia das pastas do Drive citadas nos links, lida no servidor depois que a digitação para.
 * `refresh` consulta tudo de novo (ex.: depois de mudar o compartilhamento da pasta no Drive).
 */
export function useDrivePreviews(urls: string[]) {
  const links = [...new Set(urls.map((url) => url.trim()).filter((url) => parseDriveFolder(url)))].sort();
  const key = links.join("\n");
  const [previews, setPreviews] = useState<DrivePreviews>({});
  const [error, setError] = useState("");
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!key) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const result = await previewDriveAlbums(key.split("\n"));
      if (cancelled) return;

      if (result.ok) {
        setPreviews((current) => ({ ...current, ...result.data }));
        setError("");
      } else {
        setError(result.error);
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, round]);

  function refresh() {
    setPreviews({});
    setRound((value) => value + 1);
  }

  return { previews, error, refresh };
}
