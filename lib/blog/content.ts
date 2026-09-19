// Contrato do conteúdo rich text do Blog.
//
// O editor (Tiptap) produz um documento JSON. Ele NUNCA vira HTML cru: no servidor passa por
// sanitizeDoc() (allowlist de nós, marcas e atributos) e no site é renderizado nó a nó em React.
// Assim <script>, handlers on*, iframes e "javascript:" simplesmente não têm como existir.

import { isSafeImageUrl, isSafeUrl } from "@/lib/landing/urls";

export type RichMark = { type: string; attrs?: Record<string, unknown> };
export type RichNode = { type: string; attrs?: Record<string, unknown>; content?: RichNode[]; marks?: RichMark[]; text?: string };
export type RichDoc = { type: "doc"; content: RichNode[] };

export const EMPTY_DOC: RichDoc = { type: "doc", content: [] };

// Tipografia por presets: só as fontes já carregadas pelo site e tamanhos fixos (nada de "900px").
export const FONT_PRESETS = [
  { value: "default", label: "Padrão" },
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "archivo", label: "Archivo (display)" },
] as const;

export const SIZE_PRESETS = [
  { value: "small", label: "Pequeno" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Grande" },
  { value: "lead", label: "Destaque" },
] as const;

export const IMAGE_ALIGNMENTS = [
  { value: "left", label: "Esquerda" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Direita" },
  { value: "full", label: "Largura completa" },
] as const;

export type FontPreset = (typeof FONT_PRESETS)[number]["value"];
export type SizePreset = (typeof SIZE_PRESETS)[number]["value"];
export type ImageAlignment = (typeof IMAGE_ALIGNMENTS)[number]["value"];

/** Os títulos do conteúdo começam em <h2>: o <h1> da página é sempre o título da publicação. */
export const HEADING_LEVELS = [2, 3, 4] as const;

const TEXT_ALIGNMENTS = ["left", "center", "right"];
const MAX_NODES = 4000;
const MAX_DEPTH = 12;

const oneOf = <T extends string>(value: unknown, options: readonly { value: T }[], fallback: T): T =>
  options.some((option) => option.value === value) ? (value as T) : fallback;

const str = (value: unknown, max: number): string => (typeof value === "string" ? value.slice(0, max) : "");

function alignAttr(attrs: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  const align = attrs?.textAlign;
  return typeof align === "string" && TEXT_ALIGNMENTS.includes(align) && align !== "left" ? { textAlign: align } : undefined;
}

function sanitizeMark(mark: unknown): RichMark | null {
  if (!mark || typeof mark !== "object") return null;
  const { type, attrs } = mark as RichMark;

  switch (type) {
    case "bold":
    case "italic":
    case "underline":
    case "strike":
    case "code":
    case "highlight":
      return { type };
    case "link": {
      const href = str(attrs?.href, 500).trim();
      if (!href || !isSafeUrl(href)) return null;
      return { type, attrs: { href, target: attrs?.target === "_blank" ? "_blank" : null } };
    }
    case "textPreset": {
      const font = oneOf(attrs?.font, FONT_PRESETS, "default");
      const size = oneOf(attrs?.size, SIZE_PRESETS, "normal");
      return font === "default" && size === "normal" ? null : { type, attrs: { font, size } };
    }
    default:
      return null;
  }
}

function sanitizeNode(node: unknown, depth: number, budget: { left: number }): RichNode | null {
  if (!node || typeof node !== "object" || depth > MAX_DEPTH || budget.left <= 0) return null;
  budget.left -= 1;

  const { type, attrs, content, marks, text } = node as RichNode;
  const children = () =>
    (Array.isArray(content) ? content : []).flatMap((child) => sanitizeNode(child, depth + 1, budget) ?? []);

  switch (type) {
    case "text": {
      if (typeof text !== "string" || text === "") return null;
      const cleanMarks = (Array.isArray(marks) ? marks : []).flatMap((mark) => sanitizeMark(mark) ?? []);
      return { type, text: text.slice(0, 20000), ...(cleanMarks.length ? { marks: cleanMarks } : {}) };
    }
    case "paragraph": {
      const align = alignAttr(attrs);
      return { type, ...(align ? { attrs: align } : {}), content: children() };
    }
    case "heading": {
      const level = (HEADING_LEVELS as readonly number[]).includes(Number(attrs?.level)) ? Number(attrs?.level) : 2;
      return { type, attrs: { level, ...alignAttr(attrs) }, content: children() };
    }
    case "bulletList":
    case "listItem":
    case "blockquote":
      return { type, content: children() };
    case "orderedList": {
      const start = Number.isInteger(attrs?.start) && Number(attrs?.start) > 0 ? Math.min(Number(attrs?.start), 9999) : 1;
      return { type, attrs: { start }, content: children() };
    }
    case "codeBlock":
      return { type, content: children().filter((child) => child.type === "text").map(({ text: value }) => ({ type: "text", text: value })) };
    case "horizontalRule":
    case "hardBreak":
      return { type };
    case "blogImage": {
      const src = str(attrs?.src, 700).trim();
      if (!src || !isSafeImageUrl(src)) return null;
      const sourceUrl = str(attrs?.sourceUrl, 500).trim();
      return {
        type,
        attrs: {
          src,
          alt: str(attrs?.alt, 200),
          decorative: attrs?.decorative === true,
          caption: str(attrs?.caption, 300),
          credit: str(attrs?.credit, 120),
          sourceUrl: isSafeUrl(sourceUrl) ? sourceUrl : "",
          align: oneOf(attrs?.align, IMAGE_ALIGNMENTS, "center"),
        },
      };
    }
    case "cta": {
      const href = str(attrs?.href, 500).trim();
      const label = str(attrs?.label, 60).trim();
      if (!href || !label || !isSafeUrl(href)) return null;
      return { type, attrs: { label, href, newTab: attrs?.newTab === true, style: attrs?.style === "outline" ? "outline" : "filled" } };
    }
    default:
      return null;
  }
}

/** Reconstrói o documento apenas com o que é permitido. Qualquer coisa fora da allowlist some. */
export function sanitizeDoc(input: unknown): RichDoc {
  if (!input || typeof input !== "object" || (input as RichNode).type !== "doc") return EMPTY_DOC;
  const budget = { left: MAX_NODES };
  const content = ((input as RichNode).content ?? []).flatMap((node) => {
    const clean = sanitizeNode(node, 1, budget);
    return clean && clean.type !== "text" ? clean : [];
  });
  return { type: "doc", content };
}

/** Texto puro para busca e tempo de leitura (inclui legendas e textos alternativos). */
export function extractText(doc: RichDoc): string {
  const parts: string[] = [];
  const walk = (node: RichNode) => {
    if (node.type === "text" && node.text) parts.push(node.text);
    if (node.type === "blogImage") parts.push(String(node.attrs?.caption ?? ""), String(node.attrs?.alt ?? ""));
    if (node.type === "cta") parts.push(String(node.attrs?.label ?? ""));
    node.content?.forEach(walk);
    if (node.type !== "text" && node.type !== "listItem") parts.push("\n");
  };
  doc.content.forEach(walk);
  return parts.join(" ").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
}

const WORDS_PER_MINUTE = 200;

export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.min(600, Math.max(1, Math.round(words / WORDS_PER_MINUTE)));
}

/** Imagens sem texto alternativo (e não marcadas como decorativas) bloqueiam a publicação. */
export function imagesMissingAlt(doc: RichDoc): number {
  let count = 0;
  const walk = (node: RichNode) => {
    if (node.type === "blogImage" && node.attrs?.decorative !== true && String(node.attrs?.alt ?? "").trim() === "") count += 1;
    node.content?.forEach(walk);
  };
  doc.content.forEach(walk);
  return count;
}
