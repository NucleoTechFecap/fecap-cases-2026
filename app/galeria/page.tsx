import type { Metadata } from "next";
import { GaleriaView } from "@/components/pages/views/GaleriaView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("galeria");

export default async function GalleryPage() {
  const { config } = await getPublishedLanding();
  return <GaleriaView config={config} />;
}
