import type { Metadata } from "next";
import { SobreView } from "@/components/pages/views/SobreView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("sobre");

export default async function AboutPage() {
  const { config } = await getPublishedLanding();
  return <SobreView config={config} />;
}
