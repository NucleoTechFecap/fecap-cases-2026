import { Multiline } from "@/components/landing/cms/Multiline";
import type { PageHeading } from "@/lib/landing/pages-schema";

type SectionHeadProps = {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  align?: "left" | "center";
};

export function SectionHead({ eyebrow, title, text, align = "left" }: SectionHeadProps) {
  return (
    <header className={`section-head ${align === "center" ? "section-head-center" : ""}`}>
      {eyebrow.trim() && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p data-reveal>{text}</p>}
    </header>
  );
}

/** Cabeçalho editável pelo painel: título + destaque colorido, na mesma linha ou na de baixo. */
export function CmsSectionHead({ heading, align }: { heading: PageHeading; align?: "left" | "center" }) {
  const hasTitle = heading.title.trim() !== "";
  const hasHighlight = heading.titleHighlight.trim() !== "";

  return (
    <SectionHead
      align={align}
      eyebrow={heading.eyebrow}
      text={heading.text.trim() || undefined}
      title={
        <>
          <Multiline text={heading.title} />
          {hasTitle && hasHighlight && (heading.highlightOnNewLine ? <br /> : " ")}
          {hasHighlight && (
            <span>
              <Multiline text={heading.titleHighlight} />
            </span>
          )}
        </>
      }
    />
  );
}
