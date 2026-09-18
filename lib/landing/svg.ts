// Sanitização conservadora de SVG enviado pelo painel.
// Os SVGs são exibidos apenas via <img>/mask (onde scripts não executam), mas o arquivo
// fica público no Storage — então removemos tudo que poderia rodar se aberto diretamente.

const FORBIDDEN_TAGS = ["script", "foreignObject", "iframe", "object", "embed", "audio", "video", "animate", "set", "handler"];

export function sanitizeSvg(source: string): string | null {
  if (!/<svg[\s>]/i.test(source)) return null;
  if (/<!ENTITY/i.test(source) || /<!DOCTYPE[^>]*\[/i.test(source)) return null;

  let svg = source;

  for (const tag of FORBIDDEN_TAGS) {
    svg = svg.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}\\s*>`, "gi"), "");
    svg = svg.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
  }

  svg = svg
    // on*="..." (onload, onclick…)
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // href/xlink:href que não seja âncora interna ou data:image
    .replace(/\s(xlink:href|href)\s*=\s*("(?!#|data:image\/)[^"]*"|'(?!#|data:image\/)[^']*')/gi, "")
    // javascript: em qualquer atributo e em url()
    .replace(/javascript:/gi, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Se ainda sobrou algo suspeito, recusa o arquivo em vez de arriscar.
  if (/<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(svg)) return null;

  return svg.trim();
}
