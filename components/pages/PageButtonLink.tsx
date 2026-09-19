import type { PageButton } from "@/lib/landing/pages-schema";
import { linkTargetProps, safeHref } from "@/lib/landing/urls";

/** Botão das páginas internas: o visual é fixo do layout; texto, link e visibilidade vêm do painel. */
export function PageButtonLink({ button, className, url }: { button: PageButton; className: string; url?: string }) {
  if (!button.enabled || !button.label.trim()) return null;

  return (
    <a className={className} href={safeHref(url ?? button.url)} {...linkTargetProps(button.newTab)}>
      {button.label}
    </a>
  );
}
