"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  FULL_MOTION,
  INTRO_TARGETS,
  REDUCED_MOTION,
  animateContact,
  animateFooter,
  animateHeaderIntro,
  animateHeaderOnScroll,
  animateMarquee,
  refreshOnLoad,
} from "@/components/landing/animations";

gsap.registerPlugin(useGSAP);

export function ScheduleAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION, () => {
      gsap.set(INTRO_TARGETS, { autoAlpha: 1 });
    });

    mm.add(FULL_MOTION, () => {
      gsap.set(INTRO_TARGETS, { autoAlpha: 1 });

      animateHeaderIntro()
        .from(".schedule-hero-content > .eyebrow", { y: 24, autoAlpha: 0, duration: 0.7 }, 0.15)
        .from(".schedule-hero-content > h1", { y: 50, autoAlpha: 0, duration: 0.9, ease: "power4.out" }, 0.25)
        .from(".schedule-lead", { y: 24, autoAlpha: 0, duration: 0.7 }, 0.45)
        .from(".schedule-tabs button", { y: 40, autoAlpha: 0, duration: 0.6, stagger: 0.07, clearProps: "all" }, 0.55)
        .from(
          ".schedule-block",
          { y: 50, autoAlpha: 0, duration: 0.7, stagger: 0.1, clearProps: "all" },
          0.8,
        );

      animateHeaderOnScroll();
      gsap.utils.toArray<HTMLElement>(".marquee-track").forEach(animateMarquee);
      animateContact();
      animateFooter();
      refreshOnLoad();
    });
  });

  return null;
}
