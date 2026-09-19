"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";

/** Tela de carregamento para links internos, inclusive links do conteúdo CMS. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const pendingNavigation = useRef(false);
  const entrancePending = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  const stopAnimation = () => timeline.current?.kill();

  useEffect(() => {
    if (!entrancePending.current) return;

    entrancePending.current = false;
    const page = pageRef.current;
    const loader = loaderRef.current;
    const copy = copyRef.current;
    const progress = progressRef.current;
    if (!page || !loader || !copy || !progress) return;

    stopAnimation();
    timeline.current = gsap
      .timeline()
      .set(page, { x: 30, autoAlpha: 0 })
      .to(copy, { y: -18, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
      .to(loader, { xPercent: -100, duration: 0.55, ease: "power4.inOut" }, 0.08)
      .to(page, { x: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, 0.26)
      .set(loader, { autoAlpha: 0, display: "none", xPercent: 100 })
      .set(progress, { scaleX: 0 })
      .set(copy, { y: 24, autoAlpha: 0 });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || pendingNavigation.current) return;

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      const destination = `${url.pathname}${url.search}${url.hash}`;
      const currentDestination = `${current.pathname}${current.search}${current.hash}`;

      // Links externos, protocolos e links para um ponto da mesma página continuam nativos.
      if (url.origin !== current.origin || destination === currentDestination || (url.pathname === current.pathname && url.search === current.search)) return;

      event.preventDefault();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(destination);
        return;
      }

      const page = pageRef.current;
      const loader = loaderRef.current;
      const copy = copyRef.current;
      const progress = progressRef.current;
      if (!page || !loader || !copy || !progress) {
        router.push(destination);
        return;
      }

      pendingNavigation.current = true;
      entrancePending.current = true;
      stopAnimation();
      timeline.current = gsap
        .timeline()
        .set(loader, { display: "grid", autoAlpha: 1, xPercent: 100 })
        .set(progress, { scaleX: 0, transformOrigin: "left center" })
        .set(copy, { y: 24, autoAlpha: 0 })
        .to(page, { x: -36, autoAlpha: 0.72, duration: 0.36, ease: "power2.in" }, 0)
        .to(loader, { xPercent: 0, duration: 0.5, ease: "power4.inOut" }, 0)
        .to(copy, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" }, 0.18)
        .to(progress, { scaleX: 1, duration: 0.42, ease: "power2.inOut" }, 0.25)
        .add(() => {
          router.push(destination);
          pendingNavigation.current = false;
        });
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [router]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);

  return (
    <>
      <div className="page-transition" ref={pageRef}>{children}</div>
      <div className="page-loader" ref={loaderRef} aria-hidden="true">
        <span className="page-loader-ribbon page-loader-ribbon--orange" />
        <span className="page-loader-ribbon page-loader-ribbon--lime" />
        <div className="page-loader-content" ref={copyRef}>
          <img src="/fecap-cases-logo.png" alt="" className="page-loader-logo" />
          <p>PREPARANDO A PRÓXIMA DIREÇÃO</p>
          <span className="page-loader-track"><span ref={progressRef} /></span>
        </div>
      </div>
    </>
  );
}
