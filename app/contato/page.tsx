import type { Metadata } from "next";
import { ContatoView } from "@/components/pages/views/ContatoView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("contato");

export default async function ContactPage() {
  const { config } = await getPublishedLanding();
  return <ContatoView config={config} />;
}
