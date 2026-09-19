import { MarqueeBar } from "@/components/landing/MarqueeBar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { CtaBand } from "@/components/pages/CtaBand";
import { PageAnimations } from "@/components/pages/PageAnimations";
import { designVariables, findSection } from "@/lib/landing/derive";
import { getPublishedLanding } from "@/lib/landing/queries";

type PageShellProps = {
  activeHref?: string;
  eyebrow: React.ReactNode;
  title: string;
  lead?: string;
  /** Conteúdo acima do eyebrow (ex.: breadcrumb do Blog). */
  heroTop?: React.ReactNode;
  heroActions?: React.ReactNode;
  showCta?: boolean;
  children: React.ReactNode;
};

// Header, faixa, cores e footer das páginas internas seguem o que foi publicado no painel.
export async function PageShell({ activeHref = "", eyebrow, title, lead, heroTop, heroActions, showCta = true, children }: PageShellProps) {
  const { config } = await getPublishedLanding();
  const marquee = findSection(config, "marquee");

  return (
    <main
      data-cms
      data-heading-font={config.design.headingFont === "system" ? undefined : config.design.headingFont}
      style={designVariables(config.design)}
    >
      <PageAnimations />
      <SiteHeader header={config.header} social={config.social} activeHref={activeHref} />

      <section className="page-hero">
        <span className="page-hero-shape page-hero-shape-a" aria-hidden="true" />
        <span className="page-hero-shape page-hero-shape-b" aria-hidden="true" />

        <div className="page-hero-content shell">
          {heroTop}
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lead && <p className="page-hero-lead">{lead}</p>}
          {heroActions && <div className="page-hero-actions">{heroActions}</div>}
        </div>
      </section>

      {children}

      {showCta && <CtaBand event={config.event} />}
      {marquee?.enabled && <MarqueeBar section={marquee} />}
      <SiteFooter footer={config.footer} social={config.social} />
    </main>
  );
}
