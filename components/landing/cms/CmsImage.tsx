import Image from "next/image";
import { safeImage } from "@/lib/landing/urls";

type CmsImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Arquivos do próprio site continuam otimizados pelo next/image.
 * Uploads do painel (Supabase Storage) usam <img> comum: evita liberar domínios
 * externos no otimizador e garante que SVGs sejam tratados só como imagem.
 */
export function CmsImage({ src, alt, width, height, className, priority, sizes }: CmsImageProps) {
  const safeSrc = safeImage(src);
  if (!safeSrc) return null;

  if (safeSrc.startsWith("/")) {
    return (
      <Image className={className} src={safeSrc} alt={alt} width={width} height={height} priority={priority} sizes={sizes} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
