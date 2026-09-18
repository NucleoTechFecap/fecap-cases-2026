import type { CSSProperties } from "react";
import { SOCIAL_LABELS, SocialIcon } from "@/components/landing/cms/SocialIcon";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import type { FooterConfig, SocialLink } from "@/lib/landing/schema";
import { linkTargetProps, safeHref, safeImage } from "@/lib/landing/urls";

type SiteFooterProps = {
  footer?: FooterConfig;
  social?: SocialLink[];
};

export function SiteFooter({
  footer = DEFAULT_LANDING_CONFIG.footer,
  social = DEFAULT_LANDING_CONFIG.social,
}: SiteFooterProps) {
  const links = footer.links.filter((link) => link.active && link.label.trim());
  const socialLinks = footer.showSocial
    ? social.filter((item) => item.active)
    : [];
  const logo = safeImage(footer.logoUrl);

  const vars: Record<string, string> = {};
  if (footer.backgroundColor) vars["--footer-bg"] = footer.backgroundColor;
  if (footer.textColor) vars["--footer-text"] = footer.textColor;
  if (footer.logoColor) vars["--footer-logo"] = footer.logoColor;
  if (logo) vars["--footer-logo-image"] = `url("${logo}")`;

  return (
    <footer className="site-footer" style={vars as CSSProperties}>
      <div className="shell footer-top">
        <div className="footer-brand">
          {logo && (
            <a
              className="footer-logo"
              href="/"
              aria-label="FECAP Cases - início"
            />
          )}
          {footer.tagline.trim() && <p>{footer.tagline}</p>}
        </div>

        {links.length > 0 && (
          <div className="footer-column">
            <strong>{footer.linksTitle}</strong>
            {links.map((item) => (
              <a
                href={safeHref(item.url)}
                key={item.id}
                {...linkTargetProps(item.newTab)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="footer-column">
            <strong>{footer.socialTitle}</strong>
            <div className="social-row">
              {socialLinks.map((item) => (
                <a
                  href={safeHref(item.url)}
                  aria-label={SOCIAL_LABELS[item.network]}
                  key={item.id}
                  {...linkTargetProps(item.url.startsWith("http"))}
                >
                  <SocialIcon network={item.network} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="footer-bottom shell">
        {footer.credits
          .filter((line) => line.text.trim())
          .map((line) => (
            <span key={line.id}>{line.text}</span>
          ))}
      </div>

      {footer.giantWord.trim() && (
        <div className="giant-word" aria-hidden="true">
          {footer.giantWord}
        </div>
      )}
    </footer>
  );
}
