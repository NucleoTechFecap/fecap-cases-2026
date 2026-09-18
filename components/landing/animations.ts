import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FULL_MOTION = "(prefers-reduced-motion: no-preference)";

// Ocultos via CSS até o GSAP assumir (evita flash antes da entrada).
export const INTRO_TARGETS = ".site-header, .hero-content > *, .schedule-hero-content > *, .page-hero-content > *";

export function revealHeading(target: string | HTMLElement, trigger?: string) {
  const heading = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!heading) return;

  SplitText.create(heading, {
    type: "words",
    mask: "words",
    wordsClass: "split-word",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        yPercent: 110,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.07,
        scrollTrigger: { trigger: trigger ?? heading, start: "top 82%", once: true },
      }),
  });
}

export function animateMarquee(track: HTMLElement) {
  // Faixa com animação desligada no painel fica estática.
  if (track.closest<HTMLElement>(".marquee-bar")?.dataset.animated === "false") return;

  const reverse = track.classList.contains("marquee-reverse");
  const duration = Number(track.dataset.speed) || 26;

  // O GSAP assume o loop que antes era feito via @keyframes.
  gsap.set(track, { animation: "none" });

  const loop = gsap.fromTo(
    track,
    { xPercent: reverse ? -50 : 0 },
    { xPercent: reverse ? 0 : -50, duration, ease: "none", repeat: -1 },
  );

  // Acelera conforme a velocidade do scroll e volta ao ritmo normal.
  ScrollTrigger.create({
    trigger: track,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
      gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2, ease: "power2.out" });
    },
  });
}

// Header fixo: esconde ao rolar para baixo e reaparece ao rolar para cima.
export function animateHeaderOnScroll() {
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!header || header.dataset.fixed === "false" || header.dataset.hideOnScroll === "false") return;

  const show = gsap.to(".site-header", { yPercent: -110, duration: 0.35, ease: "power2.inOut", paused: true });

  ScrollTrigger.create({
    start: 240,
    end: "max",
    onUpdate: (self) => (self.direction === 1 ? show.play() : show.reverse()),
    onLeaveBack: () => show.reverse(),
  });
}

export function animateHeaderIntro() {
  return gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .from(".site-header > *", { y: -28, autoAlpha: 0, duration: 0.7, stagger: 0.1 });
}

export function animateContact() {
  if (!document.querySelector(".contact-section")) return;

  revealHeading(".contact-copy h2");
  gsap.from(".contact-copy > p, .contact-lines > *", {
    x: -40,
    autoAlpha: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: { trigger: ".contact-copy", start: "top 80%", once: true },
  });
  gsap.from(".contact-form > *", {
    y: 40,
    autoAlpha: 0,
    clearProps: "all",
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: { trigger: ".contact-form", start: "top 85%", once: true },
  });
}

export function animateFooter() {
  const footer = document.querySelector<HTMLElement>(".site-footer");
  if (!footer) return;

  const scrollTrigger = { trigger: footer, start: "top 92%", once: true };

  gsap.from(".footer-top > *, .footer-bottom", {
    y: 40,
    autoAlpha: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.12,
    clearProps: "all",
    scrollTrigger,
  });
  gsap.from(".social-row a > *", {
    scale: 0,
    duration: 0.6,
    ease: "back.out(2)",
    stagger: 0.1,
    delay: 0.4,
    clearProps: "all",
    scrollTrigger,
  });

  // Sem scrub: o texto gigante sobe uma única vez e sempre termina visível,
  // mesmo que a altura da página mude depois (fontes/imagens carregando).
  SplitText.create(".giant-word", {
    type: "chars",
    onSplit: (self) =>
      gsap.from(self.chars, {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: { trigger: ".giant-word", start: "top 100%", once: true },
      }),
  });
}

// Recalcula os gatilhos quando fontes e imagens terminam de carregar.
export function refreshOnLoad() {
  const refresh = () => ScrollTrigger.refresh();

  document.fonts?.ready.then(refresh);
  if (document.readyState === "complete") refresh();
  else window.addEventListener("load", refresh, { once: true });
}

export function animateCounter(element: HTMLElement) {
  const match = element.textContent?.match(/^(\d+)(.*)$/);
  if (!match) return;

  const [, total, suffix] = match;
  const counter = { value: 0 };

  gsap.to(counter, {
    value: Number(total),
    duration: 1.6,
    ease: "power2.out",
    scrollTrigger: { trigger: element, start: "top 88%", once: true },
    onUpdate: () => {
      element.textContent = `${Math.round(counter.value)}${suffix}`;
    },
  });
}
