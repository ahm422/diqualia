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
 *
 * The TipTap extension list + `editorProps` are exposed as `buildEditorExtensions`
 * / `buildEditorProps` so other admin section editors can reuse the editor with a
 * lighter toolbar via the `features` prop (defaults to everything enabled).
 */

import {
  useEditor,
  EditorContent,
  type Editor,
  type Extensions,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit, TableCell } from "@tiptap/extension-table";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
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
  Baseline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RemoveFormatting,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadAdminImage } from "./uploadAdminImage";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml";

/* -------------------------------------------------------------------------- */
/*  Extension factory (reusable)                                             */
/* -------------------------------------------------------------------------- */

export type EditorFeatures = {
  color?: boolean;
  highlight?: boolean;
  align?: boolean;
  tables?: boolean;
  images?: boolean;
};

export const DEFAULT_FEATURES: Required<EditorFeatures> = {
  color: true,
  highlight: true,
  align: true,
  tables: true,
  images: true,
};

/** Table cell with an author-set `background-color` (round-trips as an inline style). */
const CellWithBackground = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null as string | null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.backgroundColor
            ? { style: `background-color: ${attributes.backgroundColor as string}` }
            : {},
      },
    };
  },
});

export function buildEditorExtensions(
  features: EditorFeatures = {},
  options: { placeholder?: string } = {},
): Extensions {
  const f = { ...DEFAULT_FEATURES, ...features };

  const extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Placeholder.configure({ placeholder: options.placeholder ?? "Write the post…" }),
    // TextStyle backs the Color mark (and keeps a hook for future inline marks).
    TextStyle,
  ];

  if (f.color) extensions.push(Color.configure({ types: ["textStyle"] }));
  if (f.highlight) extensions.push(Highlight.configure({ multicolor: true }));
  if (f.align) {
    extensions.push(
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
    );
  }
  if (f.images) extensions.push(Image.configure({ inline: false }));
  if (f.tables) {
    extensions.push(
      TableKit.configure({ table: { resizable: false }, tableCell: false }),
      CellWithBackground,
    );
  }

  return extensions;
}

export function buildEditorProps(minHeightClassName: string) {
  return {
    attributes: {
      class: `diq-markdown ${minHeightClassName} px-3 py-3 text-[15px] leading-8 text-foreground focus:outline-none`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Toolbar primitives                                                       */
/* -------------------------------------------------------------------------- */

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

const panelClass =
  "absolute left-0 top-9 z-20 rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] p-2 shadow-lg";

function blockValue(editor: Editor): "p" | "h2" | "h3" {
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  return "p";
}

/* -------------------------------------------------------------------------- */
/*  Colour / highlight swatch popover                                        */
/* -------------------------------------------------------------------------- */

// Literal hex mirroring the design tokens in globals.css — CSS vars can't be
// read at module-eval time, and the native colour input covers anything else.
const TEXT_SWATCHES: { name: string; value: string }[] = [
  { name: "Gold", value: "#caa84b" },
  { name: "Ink", value: "#0a0b0d" },
  { name: "Muted", value: "#6b7280" },
  { name: "Green", value: "#3a8a7a" },
  { name: "Red", value: "#b91c1c" },
  { name: "Blue", value: "#3a6ea5" },
];

const HIGHLIGHT_SWATCHES: { name: string; value: string }[] = [
  { name: "Gold", value: "#f3e5b8" },
  { name: "Green", value: "#d8efdd" },
  { name: "Blue", value: "#dbe8f6" },
  { name: "Pink", value: "#f6dde6" },
];

const CELL_BG_SWATCHES: { name: string; value: string }[] = [
  { name: "Gold tint", value: "#f3e5b8" },
  { name: "Grey tint", value: "#ececec" },
  { name: "Green tint", value: "#e0f0e5" },
];

function SwatchPopover({
  label,
  icon,
  active,
  swatches,
  onPick,
  onClear,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  swatches: { name: string; value: string }[];
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative">
      <ToolbarButton label={label} active={active} onClick={() => setOpen((v) => !v)}>
        {icon}
      </ToolbarButton>
      {open && (
        <div
          className={`${panelClass} w-56`}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="flex flex-wrap gap-1.5">
            {swatches.map((s) => (
              <button
                key={s.value}
                type="button"
                title={s.name}
                aria-label={s.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(s.value);
                  setOpen(false);
                }}
                className="h-6 w-6 rounded border border-[var(--diq_border)]"
                style={{ background: s.value }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              aria-label={`${label}: custom`}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => onPick(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border border-[var(--diq_border)] bg-transparent"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="h-7 flex-1 rounded border border-[var(--diq_border)] px-2 text-[11px] uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)]"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

function ColorControl({ editor }: { editor: Editor }) {
  return (
    <SwatchPopover
      label="Text color"
      icon={<Baseline className="h-4 w-4" />}
      active={!!editor.getAttributes("textStyle").color}
      swatches={TEXT_SWATCHES}
      onPick={(v) => editor.chain().focus().setColor(v).run()}
      onClear={() => editor.chain().focus().unsetColor().run()}
    />
  );
}

function HighlightControl({ editor }: { editor: Editor }) {
  return (
    <SwatchPopover
      label="Highlight color"
      icon={<Highlighter className="h-4 w-4" />}
      active={editor.isActive("highlight")}
      swatches={HIGHLIGHT_SWATCHES}
      onPick={(v) => editor.chain().focus().toggleHighlight({ color: v }).run()}
      onClear={() => editor.chain().focus().unsetHighlight().run()}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Alignment + clear formatting                                             */
/* -------------------------------------------------------------------------- */

const ALIGNMENTS = [
  { dir: "left", Icon: AlignLeft, label: "Align left" },
  { dir: "center", Icon: AlignCenter, label: "Align center" },
  { dir: "right", Icon: AlignRight, label: "Align right" },
  { dir: "justify", Icon: AlignJustify, label: "Justify" },
] as const;

function AlignControl({ editor }: { editor: Editor }) {
  return (
    <>
      {ALIGNMENTS.map(({ dir, Icon, label }) => (
        <ToolbarButton
          key={dir}
          label={label}
          active={editor.isActive({ textAlign: dir })}
          onClick={() => editor.chain().focus().setTextAlign(dir).run()}
        >
          <Icon className="h-4 w-4" />
        </ToolbarButton>
      ))}
    </>
  );
}

function ClearFormatting({ editor }: { editor: Editor }) {
  return (
    <ToolbarButton
      label="Clear formatting"
      onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
    >
      <RemoveFormatting className="h-4 w-4" />
    </ToolbarButton>
  );
}

/* -------------------------------------------------------------------------- */
/*  Link                                                                     */
/* -------------------------------------------------------------------------- */

function LinkControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const active = editor.isActive("link");

  function submit() {
    const trimmed = url.trim();
    if (trimmed) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
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

/* -------------------------------------------------------------------------- */
/*  Table menu                                                               */
/* -------------------------------------------------------------------------- */

const TABLE_ACTIONS: { label: string; run: (e: Editor) => void }[] = [
  { label: "Header row", run: (e) => e.chain().focus().toggleHeaderRow().run() },
  { label: "Header col", run: (e) => e.chain().focus().toggleHeaderColumn().run() },
  { label: "Header cell", run: (e) => e.chain().focus().toggleHeaderCell().run() },
  { label: "Row ↑", run: (e) => e.chain().focus().addRowBefore().run() },
  { label: "Row ↓", run: (e) => e.chain().focus().addRowAfter().run() },
  { label: "Del row", run: (e) => e.chain().focus().deleteRow().run() },
  { label: "Col ←", run: (e) => e.chain().focus().addColumnBefore().run() },
  { label: "Col →", run: (e) => e.chain().focus().addColumnAfter().run() },
  { label: "Del col", run: (e) => e.chain().focus().deleteColumn().run() },
  { label: "Merge", run: (e) => e.chain().focus().mergeCells().run() },
  { label: "Split", run: (e) => e.chain().focus().splitCell().run() },
  { label: "Merge/split", run: (e) => e.chain().focus().mergeOrSplit().run() },
  { label: "Delete table", run: (e) => e.chain().focus().deleteTable().run() },
];

const TABLE_GRID_MAX = 8;

function TableControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const inTable = editor.isActive("table");

  return (
    <span className="relative">
      <ToolbarButton label="Table" active={inTable} onClick={() => setOpen((v) => !v)}>
        <Table2 className="h-4 w-4" />
      </ToolbarButton>
      {open && (
        <div
          className={`${panelClass} w-64`}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">
            {hover.rows > 0 ? `${hover.rows} × ${hover.cols}` : "Insert table"}
          </p>
          <div
            className="grid w-max gap-0.5"
            style={{ gridTemplateColumns: `repeat(${TABLE_GRID_MAX}, 1fr)` }}
            onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
          >
            {Array.from({ length: TABLE_GRID_MAX * TABLE_GRID_MAX }).map((_, i) => {
              const r = Math.floor(i / TABLE_GRID_MAX) + 1;
              const c = (i % TABLE_GRID_MAX) + 1;
              const on = r <= hover.rows && c <= hover.cols;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${r} by ${c}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHover({ rows: r, cols: c })}
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: r, cols: c, withHeaderRow: true })
                      .run();
                    setOpen(false);
                  }}
                  className={`h-4 w-4 rounded-[2px] border ${
                    on
                      ? "border-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_35%,transparent)]"
                      : "border-[var(--diq_border)]"
                  }`}
                />
              );
            })}
          </div>

          {inTable && (
            <div className="mt-2 space-y-2 border-t border-[var(--diq_border)] pt-2">
              <div className="flex flex-wrap gap-1">
                {TABLE_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => a.run(editor)}
                    className="rounded border border-[var(--diq_border)] px-1.5 py-1 text-[10px] text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">
                  Cell
                </span>
                {CELL_BG_SWATCHES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    title={s.name}
                    aria-label={`Cell background ${s.name}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      editor.chain().focus().setCellAttribute("backgroundColor", s.value).run()
                    }
                    className="h-5 w-5 rounded border border-[var(--diq_border)]"
                    style={{ background: s.value }}
                  />
                ))}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor.chain().focus().setCellAttribute("backgroundColor", null).run()
                  }
                  className="rounded border border-[var(--diq_border)] px-1.5 py-1 text-[10px] text-[var(--diq_mid)] hover:text-[var(--gold)]"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                  */
/* -------------------------------------------------------------------------- */

function Toolbar({
  editor,
  features,
}: {
  editor: Editor;
  features: Required<EditorFeatures>;
}) {
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

      {(features.color || features.highlight) && <Divider />}
      {features.color && <ColorControl editor={editor} />}
      {features.highlight && <HighlightControl editor={editor} />}

      {features.align && (
        <>
          <Divider />
          <AlignControl editor={editor} />
        </>
      )}

      <Divider />
      <ClearFormatting editor={editor} />

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
      {features.images && (
        <>
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
        </>
      )}
      {features.tables && (
        <>
          <Divider />
          <TableControl editor={editor} />
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Editor                                                                   */
/* -------------------------------------------------------------------------- */

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  minHeightClassName?: string;
  /** Opt into a lighter toolbar. Defaults to every feature enabled. */
  features?: EditorFeatures;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the post…",
  error,
  minHeightClassName = "min-h-64",
  features,
}: RichTextEditorProps) {
  const resolvedFeatures: Required<EditorFeatures> = { ...DEFAULT_FEATURES, ...features };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildEditorExtensions(resolvedFeatures, { placeholder }),
    content: value || "",
    editorProps: buildEditorProps(minHeightClassName),
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
        {editor && <Toolbar editor={editor} features={resolvedFeatures} />}
        <EditorContent editor={editor} />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default RichTextEditor;
