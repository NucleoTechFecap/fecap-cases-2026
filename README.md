# FECAP Cases Landing Page

Landing page do FECAP Cases construída em React + Next.js 15 com App Router e TypeScript.

## Rodando o projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Arquitetura por componentes

A página `app/page.tsx` ficou propositalmente mínima. Toda a landing page está quebrada em componentes reutilizáveis:

```text
app/
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ContactForm.tsx
├── Countdown.tsx
├── FaqAccordion.tsx
└── landing/
    ├── AboutSection.tsx
    ├── ContactSection.tsx
    ├── CountdownSection.tsx
    ├── FaqSection.tsx
    ├── FecapCasesLandingPage.tsx
    ├── HeroSection.tsx
    ├── MarqueeBar.tsx
    ├── PartnersSection.tsx
    ├── SiteFooter.tsx
    ├── SiteHeader.tsx
    ├── SponsorGroup.tsx
    └── index.ts

data/
└── fecapCases.ts
```

## Onde editar o conteúdo

Textos e configurações compartilhadas estão centralizados em `data/fecapCases.ts`, incluindo:

- navegação;
- redes sociais;
- itens do marquee;
- grupos de patrocinadores;
- perguntas do FAQ;
- estatísticas do evento;
- data da contagem regressiva;
- e-mail, telefone e localização.

## Componentes client-side

Somente os componentes que realmente precisam de estado/interação usam `"use client"`:

- `Countdown.tsx`;
- `FaqAccordion.tsx`;
- `ContactForm.tsx`.

O restante permanece como Server Components por padrão.
