"use client";

/**
 * Admin WYSIWYG editor for the blog post body. Emits sanitized-on-read HTML
 * (see `sanitizeHtml` in `lib/markdown.ts`, applied before public rendering) and
 * is a drop-in replacement for `AdminTextarea` — `{ value, onChange }` carry an
 * HTML string, and an empty document serializes to `""` so `blogBodyStr.min(1)`
 * still rejects a blank body.
 *
 * Ported/adapted from an earlier internal project `src/components/ui/rich-text-editor.tsx`
 * (TipTap v3). Adaptations: no shadcn primitives (plain buttons + inline panels),
 * DiQualia `--diq_*` / `--gold` tokens, `.diq-markdown` editing surface so it
 * matches the public render, and the shared `uploadAdminImage` R2 helper.
 */

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Link2Off,
  ImageIcon,
  Table2,
  Undo2,
  Redo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadAdminImage } from "./uploadAdminImage";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      data-active={active || undefined}
      // Keep focus/selection in the editor when the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded border border-transparent text-[var(--diq_mid)] transition-colors hover:border-[var(--diq_border)] hover:text-[var(--gold)] disabled:pointer-events-none disabled:opacity-40 data-[active]:border-[var(--gold)] data-[active]:text-[var(--gold)]"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[var(--diq_border)]" aria-hidden />;
}

const selectClass =
  "h-8 rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]";

function blockValue(editor: Editor): "p" | "h2" | "h3" {
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  return "p";
}

function LinkControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const active = editor.isActive("link");

  function submit() {
    const trimmed = url.trim();
    if (trimmed) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: trimmed })
        .run();
    }
    setOpen(false);
  }

  return (
    <span className="relative">
      <ToolbarButton
        label={active ? "Edit link" : "Add link"}
        active={active}
        onClick={() => {
          setUrl((editor.getAttributes("link").href as string) ?? "");
          setOpen((v) => !v);
        }}
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      {active && (
        <ToolbarButton
          label="Remove link"
          onClick={() =>
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
          }
        >
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>
      )}
      {open && (
        <div className="absolute left-0 top-9 z-20 flex w-72 items-center gap-2 rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] p-2 shadow-lg">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="https://example.com"
            className="h-8 flex-1 rounded border border-[var(--diq_border)] bg-[var(--diq_ink)] px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            className="h-8 rounded border border-[var(--gold)] px-3 text-[11px] uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)]"
          >
            Set
          </button>
        </div>
      )}
    </span>
  );
}

const TABLE_ACTIONS: { label: string; run: (e: Editor) => void }[] = [
  {
    label: "Insert 3×3 table",
    run: (e) =>
      e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  { label: "Add row below", run: (e) => e.chain().focus().addRowAfter().run() },
  { label: "Add column right", run: (e) => e.chain().focus().addColumnAfter().run() },
  { label: "Delete row", run: (e) => e.chain().focus().deleteRow().run() },
  { label: "Delete column", run: (e) => e.chain().focus().deleteColumn().run() },
  { label: "Delete table", run: (e) => e.chain().focus().deleteTable().run() },
];

function TableControl({ editor }: { editor: Editor }) {
  return (
    <select
      aria-label="Table"
      title="Table"
      value=""
      onMouseDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        const action = TABLE_ACTIONS.find((a) => a.label === e.target.value);
        action?.run(editor);
        e.target.value = "";
      }}
      className={selectClass}
    >
      <option value="" disabled>
        Table…
      </option>
      {TABLE_ACTIONS.map((a) => (
        <option key={a.label} value={a.label}>
          {a.label}
        </option>
      ))}
    </select>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadAdminImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--diq_border)] px-2 py-1.5">
      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <select
        aria-label="Text style"
        value={blockValue(editor)}
        onChange={(e) => {
          const v = e.target.value;
          const chain = editor.chain().focus();
          if (v === "p") chain.setParagraph().run();
          else if (v === "h2") chain.toggleHeading({ level: 2 }).run();
          else if (v === "h3") chain.toggleHeading({ level: 3 }).run();
        }}
        className={selectClass}
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <Divider />

      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <LinkControl editor={editor} />
      <ToolbarButton
        label="Insert image"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={onFile}
      />
      <span className="ml-1 flex items-center">
        <Table2 className="mr-1 h-4 w-4 text-[var(--diq_mid)]" aria-hidden />
        <TableControl editor={editor} />
      </span>
    </div>
  );
}

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  minHeightClassName?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the post…",
  error,
  minHeightClassName = "min-h-64",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image.configure({ inline: false }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `diq-markdown ${minHeightClassName} px-3 py-3 text-[15px] leading-8 text-foreground focus:outline-none`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.isEmpty ? "" : e.getHTML());
    },
  });

  // Re-sync when `value` changes from outside (e.g. legacy-post conversion, form reset).
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    const next = value || "";
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  const containerCls = useCallback(
    () =>
      `diq-rte overflow-hidden rounded border bg-[var(--diq_deep)] focus-within:ring-1 ${
        error
          ? "border-red-400 focus-within:ring-red-400"
          : "border-[var(--diq_border)] focus-within:ring-[var(--gold)]"
      }`,
    [error],
  );

  return (
    <div>
      <div className={containerCls()}>
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default RichTextEditor;
