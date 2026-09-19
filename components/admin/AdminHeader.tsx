"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/admin/actions";

type AdminHeaderProps = { name: string; roleLabel: string };

type NavItem = { href: string; label: string; isActive?: (pathname: string) => boolean };

const BLOG_SECTIONS = ["/admin/blog/categories", "/admin/blog/tags", "/admin/blog/media"];

const NAV: NavItem[] = [
  { href: "/admin", label: "Início", isActive: (pathname) => pathname === "/admin" },
  { href: "/admin/landing-page", label: "Site e páginas" },
  {
    href: "/admin/blog",
    label: "Publicações",
    // Lista, nova publicação e edição — mas não as outras seções do Blog.
    isActive: (pathname) => pathname.startsWith("/admin/blog") && !BLOG_SECTIONS.some((section) => pathname.startsWith(section)),
  },
  { href: "/admin/blog/categories", label: "Categorias" },
  { href: "/admin/blog/tags", label: "Tags" },
  { href: "/admin/blog/media", label: "Mídia" },
];

/** Cabeçalho do painel: a mesma "pílula" da landing, com o menu em tela cheia no celular. */
export function AdminHeader({ name, roleLabel }: AdminHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = NAV.map((item) => (
    <a href={item.href} aria-current={(item.isActive?.(pathname) ?? pathname.startsWith(item.href)) ? "page" : undefined} key={item.href}>
      {item.label}
    </a>
  ));

  return (
    <>
      <header className="adm-header">
        <a className="adm-brand" href="/admin" aria-label="FECAP Cases — início do painel">
          <span className="adm-brand-logo" aria-hidden="true" />
          <span className="adm-brand-tag">Admin</span>
        </a>

        <nav aria-label="Menu administrativo">{links}</nav>

        <div className="adm-header-user">
          <p>
            <strong>{name}</strong>
            <span>{roleLabel}</span>
          </p>
          <a className="adm-header-round" href="/" target="_blank" rel="noopener" aria-label="Abrir o site em nova aba" title="Abrir o site">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
          <form action={signOut}>
            <button type="submit" className="adm-header-signout">
              Sair
            </button>
          </form>
          <button type="button" className="adm-menu-toggle" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="adm-mobile-menu" onClick={() => setMenuOpen(true)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="adm-mobile-menu" id="adm-mobile-menu" data-open={menuOpen} role="dialog" aria-modal="true" aria-label="Menu administrativo" hidden={!menuOpen}>
        <button type="button" className="adm-mobile-menu-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
          <span />
          <span />
        </button>
        <nav aria-label="Menu administrativo (celular)">{links}</nav>
        <div className="adm-mobile-menu-footer">
          <p>
            <strong>{name}</strong> · {roleLabel}
          </p>
          <div>
            <a href="/" target="_blank" rel="noopener">
              Abrir o site ↗
            </a>
            <form action={signOut}>
              <button type="submit">Sair</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
