import type { Metadata } from "next";
import { DuvidasView } from "@/components/pages/views/DuvidasView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("duvidas");

export default async function FaqPage() {
  const { config } = await getPublishedLanding();
  return <DuvidasView config={config} />;
}
