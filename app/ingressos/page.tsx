import type { Metadata } from "next";
import { IngressosView } from "@/components/pages/views/IngressosView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("ingressos");

export default async function TicketsPage() {
  const { config } = await getPublishedLanding();
  return <IngressosView config={config} />;
}
