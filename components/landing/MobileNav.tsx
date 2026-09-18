"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { REDUCED_MOTION } from "@/components/landing/animations";
import type { CmsLink } from "@/lib/landing/schema";
import { linkTargetProps, safeHref } from "@/lib/landing/urls";

gsap.registerPlugin(useGSAP);

type MobileNavProps = {
  items: CmsLink[];
  socialLinks: { id: string; label: string; url: string }[];
  activeHref: string;
};

export function MobileNav({ items, socialLinks, activeHref }: MobileNavProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      if (!mounted) return;

      timeline.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .set(overlayRef.current, { visibility: "visible" })
        .fromTo(
          overlayRef.current,
          { clipPath: "circle(0% at calc(100% - 44px) 40px)" },
          {
            clipPath: "circle(150% at calc(100% - 44px) 40px)",
            duration: 0.7,
            ease: "power3.inOut",
          },
        )
        .from(
          ".mobile-menu-links a",
          { y: 40, autoAlpha: 0, duration: 0.5, stagger: 0.06 },
          0.25,
        )
        .from(
          ".mobile-menu-footer > *",
          { y: 20, autoAlpha: 0, duration: 0.4, stagger: 0.08 },
          0.5,
        );

      if (window.matchMedia(REDUCED_MOTION).matches)
        timeline.current.timeScale(50);
    },
    { dependencies: [mounted], scope: overlayRef },
  );

  useEffect(() => {
    if (!timeline.current) return;

    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      timeline.current
        .timeScale(window.matchMedia(REDUCED_MOTION).matches ? 50 : 1)
        .play();
      overlayRef.current
        ?.querySelector<HTMLElement>("a")
        ?.focus({ preventScroll: true });
    } else {
      timeline.current
        .timeScale(window.matchMedia(REDUCED_MOTION).matches ? 50 : 1.8)
        .reverse();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    // Se a tela crescer até o breakpoint do menu desktop, fecha o overlay.
    const desktop = window.matchMedia("(min-width: 1025px)");
    const handleResize = () => desktop.matches && setOpen(false);

    window.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleResize);
    };
  }, [open]);

  function handleLinkClick() {
    // Libera o scroll antes da navegação por âncora acontecer.
    document.body.style.overflow = "";
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        ref={toggleRef}
      >
        <span />
        <span />
        <span />
      </button>

      {mounted &&
        createPortal(
          <div
            className="mobile-menu"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            ref={overlayRef}
          >
            <button
              type="button"
              className="mobile-menu-close"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
            >
              <span />
              <span />
            </button>

            <nav
              className="mobile-menu-links"
              aria-label="Navegação principal (mobile)"
            >
              {items.map((item) => (
                <a
                  href={safeHref(item.url)}
                  aria-current={item.url === activeHref ? "page" : undefined}
                  onClick={handleLinkClick}
                  key={item.id}
                  {...linkTargetProps(item.newTab)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mobile-menu-footer">
              <div className="mobile-menu-social">
                {socialLinks.map((item) => (
                  <a
                    href={safeHref(item.url)}
                    onClick={handleLinkClick}
                    key={item.id}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <span>FECAP Cases 2026 — Direções</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
