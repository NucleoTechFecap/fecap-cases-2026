"use client";

import type { Editor } from "@tiptap/react";
import { FONT_PRESETS, type FontPreset, SIZE_PRESETS, type SizePreset } from "@/lib/blog/content";

type EditorToolbarProps = { editor: Editor; onLink: () => void; onImage: () => void; onCta: () => void };

type ToolButtonProps = { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode };

function ToolButton({ label, active = false, disabled = false, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      className="adm-rte-btn"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Mantém a seleção do texto ao clicar na barra.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const BLOCKS = [
  { value: "paragraph", label: "Parágrafo" },
  { value: "2", label: "Título 1" },
  { value: "3", label: "Título 2" },
  { value: "4", label: "Título 3" },
] as const;

export function EditorToolbar({ editor, onLink, onImage, onCta }: EditorToolbarProps) {
  const chain = () => editor.chain().focus();
  const block = ([2, 3, 4] as const).find((level) => editor.isActive("heading", { level }))?.toString() ?? "paragraph";
  const preset = editor.getAttributes("textPreset") as { font?: FontPreset; size?: SizePreset };
  const font = preset.font ?? "default";
  const size = preset.size ?? "normal";

  function setBlock(value: string) {
    if (value === "paragraph") chain().setParagraph().run();
    else chain().setHeading({ level: Number(value) as 2 | 3 | 4 }).run();
  }

  function setPreset(next: { font: FontPreset; size: SizePreset }) {
    if (next.font === "default" && next.size === "normal") chain().unsetMark("textPreset").run();
    else chain().setMark("textPreset", next).run();
  }

  return (
    <div className="adm-rte-toolbar" role="toolbar" aria-label="Formatação do texto">
      <div className="adm-rte-group">
        <ToolButton label="Desfazer (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
          ↶
        </ToolButton>
        <ToolButton label="Refazer (Ctrl+Shift+Z)" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
          ↷
        </ToolButton>
      </div>

      <div className="adm-rte-group">
        <select className="adm-rte-select" aria-label="Estilo do bloco" value={block} onChange={(event) => setBlock(event.target.value)}>
          {BLOCKS.map((item) => (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select className="adm-rte-select" aria-label="Fonte" value={font} onChange={(event) => setPreset({ font: event.target.value as FontPreset, size })}>
          {FONT_PRESETS.map((item) => (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select className="adm-rte-select" aria-label="Tamanho do texto" value={size} onChange={(event) => setPreset({ font, size: event.target.value as SizePreset })}>
          {SIZE_PRESETS.map((item) => (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="adm-rte-group">
        <ToolButton label="Negrito (Ctrl+B)" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
          <strong>B</strong>
        </ToolButton>
        <ToolButton label="Itálico (Ctrl+I)" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
          <em>I</em>
        </ToolButton>
        <ToolButton label="Sublinhado (Ctrl+U)" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}>
          <u>U</u>
        </ToolButton>
        <ToolButton label="Tachado" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}>
          <s>S</s>
        </ToolButton>
        <ToolButton label="Destacar texto" active={editor.isActive("highlight")} onClick={() => chain().toggleHighlight().run()}>
          <mark>A</mark>
        </ToolButton>
        <ToolButton label="Código inline" active={editor.isActive("code")} onClick={() => chain().toggleCode().run()}>
          {"</>"}
        </ToolButton>
      </div>

      <div className="adm-rte-group">
        <ToolButton label="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}>
          <AlignIcon lines={[16, 10, 16, 8]} />
        </ToolButton>
        <ToolButton label="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}>
          <AlignIcon lines={[16, 10, 16, 8]} align="center" />
        </ToolButton>
        <ToolButton label="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}>
          <AlignIcon lines={[16, 10, 16, 8]} align="right" />
        </ToolButton>
      </div>

      <div className="adm-rte-group">
        <ToolButton label="Lista" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
          • ≡
        </ToolButton>
        <ToolButton label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>
          1. ≡
        </ToolButton>
        <ToolButton label="Citação" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>
          ❝
        </ToolButton>
        <ToolButton label="Bloco de código" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()}>
          {"{ }"}
        </ToolButton>
        <ToolButton label="Divisor" onClick={() => chain().setHorizontalRule().run()}>
          ―
        </ToolButton>
      </div>

      <div className="adm-rte-group">
        <ToolButton label="Link (Ctrl+K)" active={editor.isActive("link")} onClick={onLink}>
          🔗 <span className="adm-rte-text">Link</span>
        </ToolButton>
        <ToolButton label="Imagem" active={editor.isActive("blogImage")} onClick={onImage}>
          🖼 <span className="adm-rte-text">Imagem</span>
        </ToolButton>
        <ToolButton label="Botão (CTA)" active={editor.isActive("cta")} onClick={onCta}>
          ▭ <span className="adm-rte-text">CTA</span>
        </ToolButton>
      </div>

      <div className="adm-rte-group">
        <ToolButton label="Limpar formatação" onClick={() => chain().unsetAllMarks().clearNodes().run()}>
          T̸
        </ToolButton>
      </div>
    </div>
  );
}

function AlignIcon({ lines, align = "left" }: { lines: number[]; align?: "left" | "center" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {lines.map((width, index) => {
        const x = align === "left" ? 0 : align === "right" ? 16 - width : (16 - width) / 2;
        const y = 2.5 + index * 3.7;
        return <path d={`M${x} ${y}h${width}`} key={index} />;
      })}
    </svg>
  );
}
