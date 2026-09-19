import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { pagesSchema } from "@/lib/landing/pages-schema";
import { type LandingConfig, type SectionType, landingConfigSchema, sectionSchema } from "@/lib/landing/schema";

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Preenche chaves ausentes com o padrão (arrays são tratados como valor atômico). */
function mergeDefaults<T>(defaults: T, value: unknown): T {
  if (!isObject(defaults) || !isObject(value)) return (value === undefined ? defaults : value) as T;

  const result: Json = { ...defaults };
  for (const key of Object.keys(defaults)) {
    result[key] = mergeDefaults((defaults as Json)[key], value[key]);
  }
  return result as T;
}

/**
 * Leitura tolerante: a landing nunca quebra por configuração incompleta.
 * 1) completa com os padrões; 2) valida; 3) se ainda falhar, recupera bloco a bloco.
 */
export function parseLandingConfig(raw: unknown): LandingConfig {
  if (!isObject(raw)) return DEFAULT_LANDING_CONFIG;

  const defaultsByType = new Map(DEFAULT_LANDING_CONFIG.sections.map((section) => [section.type, section]));
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];

  const sections = rawSections.flatMap((section) => {
    if (!isObject(section) || typeof section.type !== "string") return [];

    const fallback = defaultsByType.get(section.type as SectionType);
    if (!fallback) return [];

    const parsed = sectionSchema.safeParse(mergeDefaults(fallback, section));
    if (parsed.success) return [parsed.data];

    return [{ ...fallback, id: typeof section.id === "string" ? section.id : fallback.id }];
  });

  const { sections: _ignored, ...defaultsWithoutSections } = DEFAULT_LANDING_CONFIG;
  const { sections: _rawIgnored, ...rawWithoutSections } = raw;

  const candidate = {
    ...mergeDefaults(defaultsWithoutSections, rawWithoutSections),
    sections: sections.length > 0 ? sections : DEFAULT_LANDING_CONFIG.sections,
  };

  const parsed = landingConfigSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  // O que estiver inválido volta ao padrão; o restante é preservado.
  const recovered: Json = { ...DEFAULT_LANDING_CONFIG, sections: candidate.sections };
  for (const key of ["event", "design", "seo", "social", "header", "footer"] as const) {
    const part = landingConfigSchema.shape[key].safeParse(candidate[key]);
    if (part.success) recovered[key] = part.data;
  }

  // Páginas internas: uma página inválida não derruba as outras.
  const pages: Json = { ...DEFAULT_LANDING_CONFIG.pages };
  for (const key of Object.keys(pagesSchema.shape) as (keyof typeof pagesSchema.shape)[]) {
    const part = pagesSchema.shape[key].safeParse(candidate.pages[key]);
    if (part.success) pages[key] = part.data;
  }
  recovered.pages = pages;

  const final = landingConfigSchema.safeParse(recovered);
  return final.success ? final.data : DEFAULT_LANDING_CONFIG;
}

/** Mensagens legíveis para o painel a partir de um erro do Zod. */
export function describeIssues(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 3)
    .map((issue) => `${issue.path.map(String).join(" › ")}: ${issue.message}`)
    .join(" | ");
}
