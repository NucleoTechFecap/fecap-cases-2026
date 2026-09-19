import { Fragment } from "react";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import type { RichDoc, RichMark, RichNode } from "@/lib/blog/content";
import { blogLinkProps } from "@/lib/blog/links";
import { slugify } from "@/lib/blog/slug";

// Renderização nó a nó do documento do editor. Não existe dangerouslySetInnerHTML: só os
// elementos abaixo podem aparecer, e todo link/imagem passa pela validação central de URLs.

const textOf = (node: RichNode): string => (node.text ?? "") + (node.content ?? []).map(textOf).join("");

function alignStyle(node: RichNode): React.CSSProperties | undefined {
  const align = node.attrs?.textAlign;
  return align === "center" || align === "right" ? { textAlign: align } : undefined;
}

function applyMark(mark: RichMark, children: React.ReactNode): React.ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong>{children}</strong>;
    case "italic":
      return <em>{children}</em>;
    case "underline":
      return <u>{children}</u>;
    case "strike":
      return <s>{children}</s>;
    case "code":
      return <code>{children}</code>;
    case "highlight":
      return <mark>{children}</mark>;
    case "link":
      return <a {...blogLinkProps(String(mark.attrs?.href ?? ""), mark.attrs?.target === "_blank")}>{children}</a>;
    case "textPreset":
      return (
        <span data-font={String(mark.attrs?.font ?? "default")} data-size={String(mark.attrs?.size ?? "normal")}>
          {children}
        </span>
      );
    default:
      return children;
  }
}

function Figure({ node }: { node: RichNode }) {
  const { src, alt, decorative, caption, credit, sourceUrl, align } = node.attrs ?? {};
  const hasCaption = Boolean(caption || credit);

  return (
    <figure className="article-figure" data-align={String(align ?? "center")}>
      <CmsImage src={String(src ?? "")} alt={decorative ? "" : String(alt ?? "")} width={1200} height={675} sizes="(max-width:820px) 100vw, 820px" />
      {hasCaption && (
        <figcaption>
          {caption ? <span>{String(caption)}</span> : null}
          {credit ? (
            <small>
              Crédito: {sourceUrl ? <a {...blogLinkProps(String(sourceUrl))}>{String(credit)}</a> : String(credit)}
            </small>
          ) : null}
        </figcaption>
      )}
    </figure>
  );
}

function renderNode(node: RichNode, key: number, headingIds: Set<string>): React.ReactNode {
  const children = () => (node.content ?? []).map((child, index) => renderNode(child, index, headingIds));

  switch (node.type) {
    case "text":
      return <Fragment key={key}>{(node.marks ?? []).reduce<React.ReactNode>((acc, mark) => applyMark(mark, acc), node.text)}</Fragment>;
    case "paragraph":
      return (
        <p style={alignStyle(node)} key={key}>
          {children()}
        </p>
      );
    case "heading": {
      const Tag = (["h2", "h3", "h4"] as const)[Number(node.attrs?.level) - 2] ?? "h2";
      // id estável para links "#ancora"; repetidos ganham sufixo.
      let id = slugify(textOf(node), 60);
      if (id && headingIds.has(id)) id = `${id}-${headingIds.size}`;
      if (id) headingIds.add(id);
      return (
        <Tag id={id || undefined} style={alignStyle(node)} key={key}>
          {children()}
        </Tag>
      );
    }
    case "bulletList":
      return <ul key={key}>{children()}</ul>;
    case "orderedList":
      return (
        <ol start={Number(node.attrs?.start) || 1} key={key}>
          {children()}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children()}</li>;
    case "blockquote":
      return <blockquote key={key}>{children()}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{textOf(node)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "blogImage":
      return <Figure node={node} key={key} />;
    case "cta":
      return (
        <p className="article-cta" key={key}>
          <a
            className={`button ${node.attrs?.style === "outline" ? "button-ghost" : "button-navy"}`}
            {...blogLinkProps(String(node.attrs?.href ?? ""), node.attrs?.newTab === true)}
          >
            {String(node.attrs?.label ?? "")}
          </a>
        </p>
      );
    default:
      return null;
  }
}

export function ArticleContent({ doc }: { doc: RichDoc }) {
  const headingIds = new Set<string>();
  return <div className="article-content">{doc.content.map((node, index) => renderNode(node, index, headingIds))}</div>;
}
