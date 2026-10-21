"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { REDUCED_MOTION } from "@/components/landing/animations";
import { type DrivePreviews, driveFileUrl, drivePhotoUrl, parseDriveFolder } from "@/lib/landing/drive";
import type { GalleryAlbum, GalleryDay } from "@/lib/landing/pages-schema";
import { safeHref } from "@/lib/landing/urls";

gsap.registerPlugin(useGSAP);

type GalleryGridProps = { days: GalleryDay[]; previews: DrivePreviews; buttonLabel: string; emptyText: string };

const hasLink = (album: GalleryAlbum) => album.url.trim() !== "";

/** Abre no dia mais recente que já tem álbum: durante o evento, é o que as pessoas procuram. */
function initialDay(days: GalleryDay[]): string {
  return days.findLast((day) => day.albums.some(hasLink))?.id ?? days[0]?.id ?? "";
}

export function GalleryGrid({ days, previews, buttonLabel, emptyText }: GalleryGridProps) {
  const [selected, setSelected] = useState(() => initialDay(days));
  const rootRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // No painel o dia selecionado pode ser excluído durante a edição.
  const day = days.find((item) => item.id === selected) ?? days[0];

  // Troca de dia: os álbuns do novo dia entram em cascata.
  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (window.matchMedia(REDUCED_MOTION).matches) return;

      gsap.from(".gallery-album", {
        y: 36,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "all",
      });
    },
    { dependencies: [day?.id], scope: rootRef },
  );

  if (!day) return null;

  return (
    <div ref={rootRef}>
      {days.length > 1 && (
        <div className="gallery-filters" role="group" aria-label="Escolher o dia do evento" data-reveal>
          {days.map((item) => (
            <button type="button" aria-pressed={item.id === day.id} onClick={() => setSelected(item.id)} key={item.id}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="gallery-albums">
        {day.albums.map((album) => (
          <AlbumCard album={album} previews={previews} buttonLabel={buttonLabel} emptyText={emptyText} key={album.id} />
        ))}
        {day.albums.length === 0 && <p className="gallery-album-empty">{emptyText}</p>}
      </div>
    </div>
  );
}

type AlbumCardProps = { album: GalleryAlbum; previews: DrivePreviews; buttonLabel: string; emptyText: string };

function AlbumCard({ album, previews, buttonLabel, emptyText }: AlbumCardProps) {
  const folder = parseDriveFolder(album.url);
  const preview = folder ? previews[folder.id] : undefined;
  const photos = preview?.status === "ok" ? preview.photos : [];
  const href = hasLink(album) ? safeHref(album.url) : "";

  return (
    <article className="gallery-album">
      <header className="gallery-album-head">
        <h3>{album.name}</h3>
        {href && (
          <a className="button button-navy" href={href} target="_blank" rel="noopener noreferrer">
            {buttonLabel}
          </a>
        )}
      </header>

      {photos.length > 0 ? (
        <div className="gallery-grid" data-featured={photos.length >= 5}>
          {photos.map((photo, index) => (
            <a
              className="gallery-item"
              href={driveFileUrl(photo)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${album.name}: abrir a foto ${index + 1} no Google Drive`}
              key={photo}
            >
              {/* Miniaturas servidas pelo Google: o next/image baixaria e reprocessaria cada foto no nosso servidor. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gallery-photo" src={drivePhotoUrl(photo, index === 0 ? 1200 : 600)} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            </a>
          ))}
        </div>
      ) : (
        <p className="gallery-album-empty">{href ? "Veja as fotos deste álbum no Google Drive." : emptyText}</p>
      )}
    </article>
  );
}
