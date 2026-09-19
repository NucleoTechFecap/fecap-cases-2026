import type { Metadata } from "next";
import { PatrocinadoresView } from "@/components/pages/views/PatrocinadoresView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("patrocinadores");

export default async function SponsorsPage() {
  const { config } = await getPublishedLanding();
  return <PatrocinadoresView config={config} />;
}
