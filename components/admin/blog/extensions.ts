import { Mark, Node } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { HEADING_LEVELS } from "@/lib/blog/content";
import { isSafeUrl } from "@/lib/landing/urls";

// Os nomes de nós/marcas e seus atributos espelham a allowlist de lib/blog/content.ts:
// o que o editor produz é exatamente o que o servidor aceita e o site sabe renderizar.

function readAttrs(element: HTMLElement): Record<string, unknown> | false {
  try {
    return JSON.parse(element.getAttribute("data-attrs") ?? "") as Record<string, unknown>;
  } catch {
    return false;
  }
}

/** Imagem editorial: alt (ou decorativa), legenda, crédito, fonte e alinhamento. */
export const BlogImage = Node.create({
  name: "blogImage",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    const hidden = { rendered: false };
    return {
      src: { default: "", ...hidden },
      alt: { default: "", ...hidden },
      decorative: { default: false, ...hidden },
      caption: { default: "", ...hidden },
      credit: { default: "", ...hidden },
      sourceUrl: { default: "", ...hidden },
      align: { default: "center", ...hidden },
    };
  },

  // data-attrs só serve para copiar/colar dentro do editor; o que vale é o JSON, revalidado no servidor.
  parseHTML() {
    return [{ tag: "figure[data-blog-image]", getAttrs: (element) => readAttrs(element as HTMLElement) }];
  },

  renderHTML({ node }) {
    const { src, alt, caption, credit, align } = node.attrs;
    const legend = [caption, credit && `Crédito: ${credit}`].filter(Boolean).join(" · ");
    return [
      "figure",
      { "data-blog-image": "", "data-align": align, "data-attrs": JSON.stringify(node.attrs), class: "article-figure" },
      ["img", { src, alt, draggable: "false" }],
      ...(legend ? [["figcaption", {}, legend]] : []),
    ];
  },
});

/** Botão de chamada para ação dentro do texto. */
export const Cta = Node.create({
  name: "cta",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    const hidden = { rendered: false };
    return {
      label: { default: "", ...hidden },
      href: { default: "", ...hidden },
      newTab: { default: false, ...hidden },
      style: { default: "filled", ...hidden },
    };
  },

  parseHTML() {
    return [{ tag: "p[data-cta]", getAttrs: (element) => readAttrs(element as HTMLElement) }];
  },

  renderHTML({ node }) {
    const variant = node.attrs.style === "outline" ? "button-ghost" : "button-navy";
    return ["p", { "data-cta": "", "data-attrs": JSON.stringify(node.attrs), class: "article-cta" }, ["span", { class: `button ${variant}` }, node.attrs.label]];
  },
});

/** Tipografia por presets (fonte e tamanho de listas fechadas — nunca CSS livre). */
export const TextPreset = Mark.create({
  name: "textPreset",

  addAttributes() {
    return {
      font: { default: "default", rendered: false },
      size: { default: "normal", rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-font]",
        getAttrs: (element) => ({
          font: (element as HTMLElement).getAttribute("data-font") ?? "default",
          size: (element as HTMLElement).getAttribute("data-size") ?? "normal",
        }),
      },
    ];
  },

  renderHTML({ mark }) {
    return ["span", { "data-font": mark.attrs.font, "data-size": mark.attrs.size }, 0];
  },
});

export const blogExtensions = [
  StarterKit.configure({
    heading: { levels: [...HEADING_LEVELS] },
    link: {
      openOnClick: false,
      autolink: true,
      protocols: ["mailto", "tel"],
      HTMLAttributes: { rel: "noopener noreferrer" },
      // javascript:, data:, vbscript: etc. nem chegam a virar link.
      isAllowedUri: (url) => isSafeUrl(url),
    },
  }),
  TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right"] }),
  Highlight,
  TextPreset,
  BlogImage,
  Cta,
];
