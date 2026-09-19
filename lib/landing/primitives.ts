import { z } from "zod";
import { isSafeImageUrl, isSafeUrl } from "@/lib/landing/urls";

// ---------- Primitivos validados (compartilhados entre a landing e as páginas internas) ----------
export const text = (max: number) => z.string().max(max);
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida");
/** "" = usar a cor padrão do tema. */
export const optionalColor = z.union([hexColor, z.literal("")]);
export const linkUrl = z.string().max(500).refine(isSafeUrl, "Link inválido ou inseguro");
export const imageUrl = z.string().max(700).refine(isSafeImageUrl, "Imagem inválida");
export const id = z.string().min(1).max(60);
