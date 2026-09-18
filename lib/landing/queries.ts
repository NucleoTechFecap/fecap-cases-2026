import { unstable_cache } from "next/cache";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { parseLandingConfig } from "@/lib/landing/parse";
import type { LandingConfig } from "@/lib/landing/schema";
import { LANDING_CACHE_TAG, LANDING_SLUG, isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export type PublishedLanding = { config: LandingConfig; version: number | null; publishedAt: string | null };

const FALLBACK: PublishedLanding = { config: DEFAULT_LANDING_CONFIG, version: null, publishedAt: null };

// Uma única consulta agregada para a página inteira, em cache até a próxima publicação.
const fetchPublished = unstable_cache(
  async (): Promise<PublishedLanding> => {
    const { data, error } = await createPublicClient().rpc("get_published_landing", { p_slug: LANDING_SLUG });
    if (error) throw new Error(error.message);
    if (!data) return FALLBACK;

    const payload = data as { content: unknown; version: number; published_at: string };
    return { config: parseLandingConfig(payload.content), version: payload.version, publishedAt: payload.published_at };
  },
  ["landing-published"],
  { tags: [LANDING_CACHE_TAG], revalidate: 3600 },
);

/** Visitantes SEMPRE recebem a versão publicada — nunca o rascunho. */
export async function getPublishedLanding(): Promise<PublishedLanding> {
  if (!isSupabaseConfigured) return FALLBACK;

  try {
    return await fetchPublished();
  } catch (error) {
    console.error("[landing] Falha ao carregar a versão publicada; usando conteúdo padrão.", error);
    return FALLBACK;
  }
}
