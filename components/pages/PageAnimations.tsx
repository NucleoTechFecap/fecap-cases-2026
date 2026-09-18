"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FULL_MOTION,
  INTRO_TARGETS,
  REDUCED_MOTION,
  animateContact,
  animateCounter,
  animateFooter,
  animateHeaderIntro,
  animateHeaderOnScroll,
  animateMarquee,
  refreshOnLoad,
  revealHeading,
} from "@/components/landing/animations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Animações das páginas internas, controladas por atributos no markup:
 * - data-reveal: o elemento sobe e aparece ao entrar na tela
 * - data-reveal-group: os filhos entram em cascata
 * - data-count: número que conta de 0 até o valor
 * - data-parallax="0.2": desloca o elemento conforme o scroll
 */
export function PageAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION, () => {
      gsap.set(INTRO_TARGETS, { autoAlpha: 1 });
    });

    mm.add(FULL_MOTION, () => {
      gsap.set(INTRO_TARGETS, { autoAlpha: 1 });

      animateHeaderIntro()
        .from(".page-hero-content > *", { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.15)
        .from(".page-hero-shape", { scale: 0.4, autoAlpha: 0, duration: 1.4, ease: "expo.out", stagger: 0.15 }, 0.1);

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        gsap.to(element, {
          yPercent: Number(element.dataset.parallax) * 100,
          ease: "none",
          scrollTrigger: { trigger: element.closest("section") ?? element, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".section-head h2").forEach((heading) => revealHeading(heading));

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 50,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        gsap.from(group.children, {
          y: 50,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          clearProps: "all",
          scrollTrigger: { trigger: group, start: "top 84%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".flow-line").forEach((line) => {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: { trigger: line.parentElement, start: "top 75%", end: "bottom 60%", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach(animateCounter);
      gsap.utils.toArray<HTMLElement>(".marquee-track").forEach(animateMarquee);

      animateHeaderOnScroll();
      animateContact();
      animateFooter();
      refreshOnLoad();
    });
  });

  return null;
}
