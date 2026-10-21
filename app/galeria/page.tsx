import type { Metadata } from "next";
import { GaleriaView } from "@/components/pages/views/GaleriaView";
import { albumUrls } from "@/lib/landing/drive";
import { loadDrivePreviews } from "@/lib/landing/drive-preview";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("galeria");

export default async function GalleryPage() {
  const { config } = await getPublishedLanding();
  const previews = await loadDrivePreviews(albumUrls(config.pages.galeria.days));
  return <GaleriaView config={config} previews={previews} />;
}
