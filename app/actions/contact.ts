"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(4000),
});

/** Grava a mensagem como visitante anônimo: o RLS só permite INSERT nessa tabela. */
export async function submitContact(formData: FormData): Promise<{ ok: boolean }> {
  // Honeypot preenchido = robô. Responde "ok" para não dar pista.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success || !isSupabaseConfigured) return { ok: false };

  const { error } = await createPublicClient().from("contact_submissions").insert(parsed.data);
  if (error) {
    console.error("[contato] Falha ao registrar mensagem:", error.message);
    return { ok: false };
  }

  return { ok: true };
}
