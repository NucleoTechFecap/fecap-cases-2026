import type { CSSProperties } from "react";
import { InstagramIcon } from "@animateicons/react/lucide/instagram-icon";
import { SquarePlayIcon } from "@animateicons/react/lucide/square-play-icon";
import { HeaderNavFit } from "@/components/landing/HeaderNavFit";
import { HeaderScrollState } from "@/components/landing/HeaderScrollState";
import { MobileNav } from "@/components/landing/MobileNav";
import { CmsButton } from "@/components/landing/cms/CmsButton";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import { SOCIAL_LABELS, SocialIcon } from "@/components/landing/cms/SocialIcon";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { withSitePages } from "@/lib/landing/navigation";
import type { HeaderConfig, SocialLink } from "@/lib/landing/schema";
import { linkTargetProps, safeHref } from "@/lib/landing/urls";

type SiteHeaderProps = {
  header?: HeaderConfig;
  social?: SocialLink[];
  activeHref?: string;
};

function headerVariables(header: HeaderConfig): CSSProperties {
  const background =
    header.background === "transparent"
      ? "transparent"
      : header.backgroundColor;

  const vars: Record<string, string> = {
    "--logo-width": `${header.logoWidth}px`,
  };

  // Só sobrescreve a cor do CSS quando o admin mudou o fundo padrão.
  const isDefault =
    header.background === DEFAULT_LANDING_CONFIG.header.background &&
    header.backgroundColor === DEFAULT_LANDING_CONFIG.header.backgroundColor;
  if (!isDefault) vars["--header-bg"] = background;

  if (header.scrolledColor) vars["--header-scrolled"] = header.scrolledColor;
  if (header.textColor) vars["--header-text"] = header.textColor;

  return vars as CSSProperties;
}

export function SiteHeader({
  header = DEFAULT_LANDING_CONFIG.header,
  social = DEFAULT_LANDING_CONFIG.social,
  activeHref = "/",
}: SiteHeaderProps) {
  // withSitePages também aqui: o preview do painel usa o rascunho sem passar pelo parse.
  const links = withSitePages(header.links).filter(
    (link) => link.active && link.label.trim(),
  );
  const activeSocial = social.filter((item) => item.active);
  const headerSocial = header.showSocial
    ? activeSocial.filter((item) => item.showInHeader)
    : [];

  return (
    <header
      className="site-header"
      data-fixed={header.fixed}
      data-hide-on-scroll={header.hideOnScroll}
      data-background={header.background}
      style={headerVariables(header)}
    >
      <HeaderScrollState />
      <HeaderNavFit />

      <a
        className="mini-brand"
        href="/"
        aria-label={`${header.logoAlt} - início`}
      >
        <CmsImage
          src={header.logoUrl}
          alt={header.logoAlt}
          width={100}
          height={50}
          priority
        />
      </a>

      <nav aria-label="Navegação principal">
        {links.map((item) => (
          <a
            href={safeHref(item.url)}
            aria-current={item.url === activeHref ? "page" : undefined}
            key={item.id}
            {...linkTargetProps(item.newTab)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions" aria-label="Redes sociais">
        {headerSocial.map((item) => (
          <a
            href={safeHref(item.url)}
            aria-label={SOCIAL_LABELS[item.network]}
            key={item.id}
            {...linkTargetProps(item.url.startsWith("http"))}
          >
            {item.network === "instagram" ? (
              <InstagramIcon aria-hidden="true" size={24} />
            ) : item.network === "youtube" ? (
              <SquarePlayIcon aria-hidden="true" size={24} />
            ) : (
              <SocialIcon network={item.network} size={22} />
            )}
          </a>
        ))}
        <CmsButton button={header.cta} className="header-cta" />
        <MobileNav
          items={links}
          socialLinks={activeSocial.map((item) => ({
            id: item.id,
            label: SOCIAL_LABELS[item.network],
            url: item.url,
          }))}
          activeHref={activeHref}
        />
      </div>
    </header>
  );
}
