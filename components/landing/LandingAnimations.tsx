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

export function LandingAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION, () => {
      gsap.set(INTRO_TARGETS, { autoAlpha: 1 });
    });

    mm.add(FULL_MOTION, () => {
      /* Header + hero: entrada */
      gsap.set(INTRO_TARGETS, { autoAlpha: 1 });
      // Os botões têm transition de transform no CSS, que brigaria com o tween.
      gsap.set(".button", { transition: "none" });

      animateHeaderIntro()
        .from(".hero-eyebrow", { y: 30, autoAlpha: 0, duration: 0.8 }, 0.15)
        .from(
          ".hero-logo",
          {
            scale: 0.72,
            rotation: -8,
            autoAlpha: 0,
            duration: 1.3,
            ease: "expo.out",
          },
          0.3,
        )
        .from(
          ".hero-bottom-row > div:first-child > *",
          { x: -40, autoAlpha: 0, duration: 0.8, stagger: 0.12 },
          0.75,
        )
        .from(
          ".hero-cta-stack .button",
          {
            y: 30,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.12,
            clearProps: "all",
          },
          0.85,
        );

      /* Hero: parallax no scroll */
      const heroScrub = {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to(".hero", {
        backgroundPosition: "50% 70%",
        ease: "none",
        scrollTrigger: heroScrub,
      });
      gsap.to(".hero-lockup", {
        yPercent: 22,
        scale: 0.92,
        ease: "none",
        scrollTrigger: heroScrub,
      });
      gsap.to(".hero-eyebrow", {
        yPercent: 120,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: heroScrub,
      });

      /* Marquees */
      animateHeaderOnScroll();
      gsap.utils.toArray<HTMLElement>(".marquee-track").forEach(animateMarquee);

      /* Contagem regressiva */
      revealHeading(".countdown-layout h2");
      gsap.from(".countdown-card", {
        y: 60,
        scale: 0.8,
        autoAlpha: 0,
        duration: 0.8,
        ease: "back.out(1.6)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".countdown-grid",
          start: "top 85%",
          once: true,
        },
      });
      gsap.from(".countdown-colon", {
        autoAlpha: 0,
        scale: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        scrollTrigger: {
          trigger: ".countdown-grid",
          start: "top 85%",
          once: true,
        },
      });

      /* Sobre */
      gsap.from(".about-card", {
        y: 90,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-card", start: "top 85%", once: true },
      });
      gsap.from(".about-kicker", {
        x: -30,
        autoAlpha: 0,
        duration: 0.7,
        scrollTrigger: { trigger: ".about-card", start: "top 75%", once: true },
      });
      revealHeading(".about-copy-grid h2");
      gsap.from(".about-copy-grid p", {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-copy-grid",
          start: "top 78%",
          once: true,
        },
      });
      gsap.from(".stats-grid > div", {
        y: 40,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: ".stats-grid", start: "top 88%", once: true },
      });
      gsap.utils
        .toArray<HTMLElement>(".stats-grid strong")
        .forEach(animateCounter);

      /* Patrocinadores */
      gsap.from(".partner-ribbon", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.4,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: ".partner-ribbon-wrap",
          start: "top 80%",
          once: true,
        },
      });
      gsap.fromTo(
        ".partner-ribbon",
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: ".partner-ribbon-wrap",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".sponsor-group").forEach((group) => {
        const scrollTrigger = { trigger: group, start: "top 85%", once: true };

        gsap
          .timeline({ scrollTrigger, defaults: { ease: "power3.out" } })
          .from(group.querySelector(".sponsor-heading h3"), {
            x: -40,
            autoAlpha: 0,
            duration: 0.7,
          })
          .from(
            group.querySelector(".sponsor-heading span"),
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.9,
              ease: "power2.inOut",
            },
            0.1,
          )
          .from(
            group.querySelectorAll(".logo-placeholder, .logo-tile"),
            { y: 40, scale: 0.92, autoAlpha: 0, duration: 0.6, stagger: 0.07 },
            0.25,
          );
      });

      /* FAQ */
      gsap.fromTo(
        ".faq-wave",
        { scaleY: 1.5, transformOrigin: "top center" },
        {
          scaleY: 0.75,
          ease: "none",
          scrollTrigger: {
            trigger: ".faq-section",
            start: "top bottom",
            end: "top 20%",
            scrub: true,
          },
        },
      );
      gsap.from(".faq-intro .eyebrow, .faq-intro > p:last-child", {
        y: 24,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.25,
        scrollTrigger: { trigger: ".faq-intro", start: "top 80%", once: true },
      });
      revealHeading(".faq-intro h2");
      gsap.from(".faq-item", {
        x: 60,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".faq-list", start: "top 82%", once: true },
      });

      animateContact();
      animateFooter();
      refreshOnLoad();
    });
  });

  return null;
}
