// Validação central de links e imagens vindos do CMS.

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i;
const SAFE_IMAGE = /^(https:\/\/|\/(?!\/))/i;
const LOCAL_IMAGE = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i;

/** Espaços e caracteres de controle são usados para disfarçar "java\nscript:". */
function hasUnsafeCharacters(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 32 || code === 127) return true;
  }
  return false;
}

/** Aceita https://, http://, mailto:, tel:, #ancora e caminhos internos (/pagina). */
export function isSafeUrl(value: string): boolean {
  const url = value.trim();
  if (url === "") return true;
  if (hasUnsafeCharacters(url)) return false;
  return SAFE_LINK.test(url);
}

/** Imagens: apenas arquivos do próprio site (/...) ou https://. */
export function isSafeImageUrl(value: string): boolean {
  const url = value.trim();
  if (url === "") return true;
  if (hasUnsafeCharacters(url)) return false;
  // Estes caracteres permitiriam escapar de url("...") quando a imagem vira background no CSS.
  if (/["'()\\]/.test(url)) return false;
  return SAFE_IMAGE.test(url) || LOCAL_IMAGE.test(url);
}

/** Usado na renderização: qualquer URL insegura vira "#". */
export function safeHref(value: string | undefined | null): string {
  if (!value) return "#";
  return isSafeUrl(value) ? value.trim() || "#" : "#";
}

export function safeImage(value: string | undefined | null, fallback = ""): string {
  if (!value) return fallback;
  return isSafeImageUrl(value) ? value.trim() : fallback;
}

export function linkTargetProps(newTab: boolean | undefined) {
  return newTab ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};
}
