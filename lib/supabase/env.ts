export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Sem Supabase configurado a landing continua funcionando com o conteúdo padrão. */
export const isSupabaseConfigured = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

export const LANDING_SLUG = "home";
export const LANDING_CACHE_TAG = "landing-published";
export const ASSETS_BUCKET = "landing-assets";
