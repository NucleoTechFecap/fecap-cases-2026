import { PageFrame, type PageFrameProps } from "@/components/pages/PageFrame";
import { getPublishedLanding } from "@/lib/landing/queries";

// Header, faixa, cores e footer das páginas internas seguem o que foi publicado no painel.
export async function PageShell(props: Omit<PageFrameProps, "config" | "animated">) {
  const { config } = await getPublishedLanding();
  return <PageFrame config={config} {...props} />;
}
