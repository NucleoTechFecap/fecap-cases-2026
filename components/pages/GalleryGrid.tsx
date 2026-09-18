"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { REDUCED_MOTION } from "@/components/landing/animations";
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryItem } from "@/data/pages";

gsap.registerPlugin(useGSAP);

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState<GalleryCategory>("Todos");
  const rootRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const visible = category === "Todos" ? items : items.filter((item) => item.category === category);

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
      <div className="gallery-filters" role="group" aria-label="Filtrar fotos por categoria" data-reveal>
        {GALLERY_CATEGORIES.map((item) => (
          <button type="button" aria-pressed={item === category} onClick={() => setCategory(item)} key={item}>
            {item}
          </button>
        ))}
      </div>

      <div className="gallery-grid" data-reveal-group>
        {visible.map((item) => (
          <figure className={`gallery-item gallery-${item.shape} gallery-tone-${item.tone}`} key={item.id}>
            <span className="gallery-placeholder" aria-hidden="true">
              FOTO
            </span>
            <figcaption>
              <strong>{item.category}</strong>
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
