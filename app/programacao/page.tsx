import type { Metadata } from "next";
import { ProgramacaoView } from "@/components/pages/views/ProgramacaoView";
import { cmsPageMetadata } from "@/lib/landing/page-metadata";
import { getPublishedLanding } from "@/lib/landing/queries";
import "./programacao.css";

export const generateMetadata = (): Promise<Metadata> => cmsPageMetadata("programacao");

export default async function SchedulePage() {
  const { config } = await getPublishedLanding();
  return <ProgramacaoView config={config} />;
}
