import type { Metadata } from "next";
import { GalleryGrid } from "@/components/pages/GalleryGrid";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { GALLERY_ITEMS } from "@/data/pages";

export const metadata: Metadata = {
  title: "Galeria | FECAP Cases 2026",
  description: "Fotos das palestras, workshops, ativações e bastidores do FECAP Cases.",
};

export default function GalleryPage() {
  return (
    <PageShell
      eyebrow="GALERIA"
      title="Momentos que ficam"
      lead="Palestras, workshops, ativações e bastidores: reviva o que aconteceu no palco e fora dele."
    >
      <section className="page-section">
        <div className="shell">
          <SectionHead
            eyebrow="FOTOS"
            title={
              <>
                O EVENTO EM <span>IMAGENS</span>
              </>
            }
            text="As fotos oficiais serão publicadas aqui durante e depois do evento."
          />

          <GalleryGrid items={GALLERY_ITEMS} />
        </div>
      </section>
    </PageShell>
  );
}
