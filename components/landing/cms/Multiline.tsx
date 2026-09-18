import { Fragment } from "react";
import { multiline } from "@/lib/landing/derive";

/** Quebras de linha digitadas no painel viram <br /> (texto puro, sem HTML). */
export function Multiline({ text }: { text: string }) {
  const lines = multiline(text);

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={`${line}-${index}`}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function SectionTitle({ title, highlight }: { title: string; highlight: string }) {
  return (
    <>
      <Multiline text={title} />
      {title.trim() && highlight.trim() && <br />}
      {highlight.trim() && (
        <span>
          <Multiline text={highlight} />
        </span>
      )}
    </>
  );
}
