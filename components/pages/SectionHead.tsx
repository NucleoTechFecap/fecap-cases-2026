type SectionHeadProps = {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  align?: "left" | "center";
};

export function SectionHead({ eyebrow, title, text, align = "left" }: SectionHeadProps) {
  return (
    <header className={`section-head ${align === "center" ? "section-head-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p data-reveal>{text}</p>}
    </header>
  );
}
