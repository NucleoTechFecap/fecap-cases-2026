"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { CtaDialog, type CtaValues, ImageDialog, type ImageValues, LinkDialog, type LinkValues } from "@/components/admin/blog/EditorDialogs";
import { EditorToolbar } from "@/components/admin/blog/EditorToolbar";
import { blogExtensions } from "@/components/admin/blog/extensions";
import type { RichDoc } from "@/lib/blog/content";

type RichTextEditorProps = { initial: RichDoc; editable: boolean; onChange: (doc: RichDoc, words: number) => void };

type Dialog = { kind: "link"; initial: LinkValues; isEditing: boolean } | { kind: "image"; initial: ImageValues | null } | { kind: "cta"; initial: CtaValues | null } | null;

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

export function RichTextEditor({ initial, editable, onChange }: RichTextEditorProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  // O atalho é registrado uma vez na criação do editor; a ref aponta sempre para a função atual.
  const openLinkRef = useRef<() => void>(() => {});
  // Ao abrir, o editor normaliza o documento (ex.: parágrafo final) e dispara "update" sozinho.
  // Só conta como alteração o que acontece depois que a pessoa entra no editor.
  const hasInteracted = useRef(false);

  const editor = useEditor({
    extensions: blogExtensions,
    content: initial,
    editable,
    // Next renderiza no servidor primeiro: o editor só nasce no navegador.
    immediatelyRender: false,
    // A barra reflete negrito/alinhamento/etc. da seleção atual.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: "article-content adm-rte-content", role: "textbox", "aria-multiline": "true", "aria-label": "Conteúdo da publicação" },
      handleKeyDown: (_, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          openLinkRef.current();
          return true;
        }
        return false;
      },
    },
    // O ProseMirror cria `attrs` sem protótipo (Object.create(null)); server actions só aceitam objetos
    // simples — sem esta cópia o React envia uma "referência temporária" e o servidor não consegue ler.
    onFocus: () => {
      hasInteracted.current = true;
    },
    onUpdate: ({ editor: current }) => hasInteracted.current && onChange(JSON.parse(JSON.stringify(current.getJSON())) as RichDoc, countWords(current.getText())),
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  function openLink() {
    if (!editor) return;
    const isEditing = editor.isActive("link");
    if (isEditing) editor.chain().focus().extendMarkRange("link").run();

    const { from, to } = editor.state.selection;
    const attrs = editor.getAttributes("link") as { href?: string; target?: string | null };
    setDialog({
      kind: "link",
      isEditing,
      initial: { text: editor.state.doc.textBetween(from, to, " "), href: attrs.href ?? "", newTab: attrs.target === "_blank" },
    });
  }

  openLinkRef.current = openLink;

  function applyLink({ text, href, newTab }: LinkValues) {
    if (!editor) return;
    const attrs = { href, target: newTab ? "_blank" : null };
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, " ");
    const label = text.trim() || selected || href;

    if (label !== selected) {
      // Texto novo (ou nada selecionado): insere o texto já com o link, substituindo a seleção.
      editor.chain().focus().insertContent({ type: "text", text: label, marks: [{ type: "link", attrs }] }).run();
    } else {
      editor.chain().focus().setLink(attrs).run();
    }
    setDialog(null);
  }

  function applyNode(type: "blogImage" | "cta", attrs: ImageValues | CtaValues, isEditing: boolean) {
    if (!editor) return;
    if (isEditing) editor.chain().focus().updateAttributes(type, attrs).run();
    // Insere DEPOIS da seleção: com uma imagem/CTA selecionado, insertContent substituiria o bloco.
    // O parágrafo vazio em seguida dá ao autor onde continuar escrevendo.
    else editor.chain().focus().insertContentAt(editor.state.selection.to, [{ type, attrs }, { type: "paragraph" }]).run();
    setDialog(null);
  }

  function removeSelectedNode() {
    editor?.chain().focus().deleteSelection().run();
    setDialog(null);
  }

  if (!editor) return <div className="adm-rte adm-rte-loading">Carregando editor…</div>;

  return (
    <div className="adm-rte" data-readonly={!editable}>
      {editable && (
        <EditorToolbar
          editor={editor}
          onLink={openLink}
          onImage={() => setDialog({ kind: "image", initial: editor.isActive("blogImage") ? (editor.getAttributes("blogImage") as ImageValues) : null })}
          onCta={() => setDialog({ kind: "cta", initial: editor.isActive("cta") ? (editor.getAttributes("cta") as CtaValues) : null })}
        />
      )}

      <EditorContent
        editor={editor}
        onDoubleClick={() => {
          // Duplo clique numa imagem ou CTA abre as configurações do bloco.
          if (!editable) return;
          if (editor.isActive("blogImage")) setDialog({ kind: "image", initial: editor.getAttributes("blogImage") as ImageValues });
          else if (editor.isActive("cta")) setDialog({ kind: "cta", initial: editor.getAttributes("cta") as CtaValues });
        }}
      />

      {dialog?.kind === "link" && (
        <LinkDialog
          initial={dialog.initial}
          isEditing={dialog.isEditing}
          onSubmit={applyLink}
          onRemove={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "image" && (
        <ImageDialog
          initial={dialog.initial}
          onSubmit={(values) => applyNode("blogImage", values, dialog.initial !== null)}
          onRemove={dialog.initial ? removeSelectedNode : undefined}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "cta" && (
        <CtaDialog
          initial={dialog.initial}
          onSubmit={(values) => applyNode("cta", values, dialog.initial !== null)}
          onRemove={dialog.initial ? removeSelectedNode : undefined}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
