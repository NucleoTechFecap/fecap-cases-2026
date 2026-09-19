"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { REDUCED_MOTION } from "@/components/landing/animations";
import type { GalleryCategory, GalleryItem } from "@/lib/landing/pages-schema";
import { safeImage } from "@/lib/landing/urls";

gsap.registerPlugin(useGSAP);

const ALL = "";

type GalleryGridProps = { items: GalleryItem[]; categories: GalleryCategory[]; allLabel: string };

export function GalleryGrid({ items, categories, allLabel }: GalleryGridProps) {
  const [selected, setSelected] = useState(ALL);
  const rootRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // No painel a categoria selecionada pode ser excluída durante a edição.
  const category = categories.some((item) => item.id === selected) ? selected : ALL;
  const visible = category === ALL ? items : items.filter((item) => item.categoryId === category);
  const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? "";

  // Troca de filtro: as fotos reaparecem em cascata.
  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (window.matchMedia(REDUCED_MOTION).matches) return;

      gsap.from(".gallery-item", {
        scale: 0.85,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.05,
        clearProps: "all",
      });
    },
    { dependencies: [category], scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      {categories.length > 0 && (
        <div className="gallery-filters" role="group" aria-label="Filtrar fotos por categoria" data-reveal>
          {[{ id: ALL, name: allLabel || "Todos" }, ...categories].map((item) => (
            <button type="button" aria-pressed={item.id === category} onClick={() => setSelected(item.id)} key={item.id}>
              {item.name}
            </button>
          ))}
        </div>
      )}

      <div className="gallery-grid" data-reveal-group>
        {visible.map((item) => {
          const src = safeImage(item.imageUrl);

          return (
            <figure className={`gallery-item gallery-${item.shape} gallery-tone-${item.tone}`} key={item.id}>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="gallery-photo" src={src} alt={item.alt || item.caption} loading="lazy" decoding="async" />
              ) : (
                <span className="gallery-placeholder" aria-hidden="true">
                  FOTO
                </span>
              )}
              <figcaption>
                <strong>{categoryName(item.categoryId)}</strong>
                {item.caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
