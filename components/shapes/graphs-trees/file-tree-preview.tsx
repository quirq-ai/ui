"use client";

// Tree + preview: an indented file tree (WAI tree keyboard pattern) beside a read-only
// preview with Preview and Code views for Markdown, HTML and CSV. On narrow screens the two
// panes take turns: picking a file opens the preview, and "Files" goes back.
import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, Code, Eye, FileQuestion, FileText, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/loaders";
import type { FsNode } from "./file-explorer";
import { CodeView, CsvTable, MarkdownLite } from "./markdown-lite";

export type PreviewSource = { language: "markdown" | "typescript" | "json" | "csv" | "html"; content: string };

export type FileTreePreviewProps = {
  project: string;
  root: FsNode;
  /** preview sources by project-relative path; anything missing is unsupported */
  previews: Record<string, PreviewSource>;
  /** folder paths open at first, such as "space_ui/" */
  defaultOpen?: string[];
  /** first selection; defaults to the root README */
  defaultSelected?: string | null;
  /** the tree is still loading */
  treeLoading?: boolean;
  /** force a preview state, for state demos */
  previewState?: "loading" | "error" | null;
  errorMessage?: string;
  /** which pane shows first on narrow screens */
  defaultPane?: "tree" | "preview";
  className?: string;
};

type Row = { node: FsNode; depth: number; parent: string | null };

function flatten(node: FsNode, open: Set<string>, depth = 1, parent: string | null = null): Row[] {
  const kids = [...(node.children ?? [])].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1));
  const out: Row[] = [];
  for (const k of kids) {
    out.push({ node: k, depth, parent });
    if (k.type === "folder" && open.has(k.path)) out.push(...flatten(k, open, depth + 1, k.path));
  }
  return out;
}

const RENDERED = new Set(["markdown", "html", "csv"]);

export function FileTreePreview({
  project,
  root,
  previews,
  defaultOpen = [],
  defaultSelected,
  treeLoading = false,
  previewState = null,
  errorMessage = "Could not read this file. The Space API did not answer.",
  defaultPane = "tree",
  className,
}: FileTreePreviewProps) {
  const uid = useId();
  const readme = (root.children ?? []).find((c) => c.type === "file" && /^readme\.mdx?$/i.test(c.name))?.path ?? null;
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  const [selected, setSelected] = useState<string | null>(defaultSelected === undefined ? readme : defaultSelected);
  const [active, setActive] = useState<string | null>(null);
  const [mode, setMode] = useState<"rendered" | "source">("rendered");
  const [narrow, setNarrow] = useState<"tree" | "preview">(defaultPane);

  const rows = useMemo(() => (treeLoading ? [] : flatten(root, open)), [root, open, treeLoading]);
  const activeKey = active && rows.some((r) => r.node.path === active) ? active : rows[0]?.node.path ?? null;
  const source = selected ? previews[selected] : undefined;

  const toggle = (path: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  const pick = (node: FsNode) => {
    if (node.type === "folder") toggle(node.path);
    else {
      setSelected(node.path);
      setNarrow("preview");
    }
  };
  const focusRow = (path: string) => {
    setActive(path);
    document.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(uid)}"] [data-path="${CSS.escape(path)}"]`)?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const i = rows.findIndex((r) => r.node.path === activeKey);
    if (i < 0) return;
    const row = rows[i];
    const isFolder = row.node.type === "folder";
    const isOpen = open.has(row.node.path);
    switch (e.key) {
      case "ArrowDown":
        if (rows[i + 1]) focusRow(rows[i + 1].node.path);
        break;
      case "ArrowUp":
        if (rows[i - 1]) focusRow(rows[i - 1].node.path);
        break;
      case "ArrowRight":
        if (isFolder && !isOpen) toggle(row.node.path);
        else if (isFolder && rows[i + 1]?.parent === row.node.path) focusRow(rows[i + 1].node.path);
        break;
      case "ArrowLeft":
        if (isFolder && isOpen) toggle(row.node.path);
        else if (row.parent) focusRow(row.parent);
        break;
      case "Home":
        if (rows[0]) focusRow(rows[0].node.path);
        break;
      case "End":
        if (rows.length) focusRow(rows[rows.length - 1].node.path);
        break;
      case "Enter":
      case " ":
        pick(row.node);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const canRender = !!source && RENDERED.has(source.language);
  /* empty, error and unsupported states sit in a dashed box, as in the Space dashboard */
  const notice = (children: ReactNode, tone: "faint" | "error" = "faint") => (
    <div
      className={cn(
        "m-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-center text-[12px]",
        tone === "error" ? "border-red/30 text-ink-dim" : "border-hair-strong text-ink-faint",
      )}
    >
      {children}
    </div>
  );
  const scrollable = (node: ReactNode) => (
    <div role="region" aria-label={`Preview of ${selected}`} tabIndex={0} className="scroll-thin min-h-0 flex-1 overflow-auto focus-visible:outline-offset-[-2px]">
      {node}
    </div>
  );
  let body;
  if (!selected) {
    body = treeLoading ? null : notice(<p>Select a file to preview it.</p>);
  } else if (previewState === "loading") {
    body = (
      <p role="status" className="m-auto flex items-center gap-2 p-4 text-[12px] text-ink-faint">
        <Spinner size="sm" label={null} />
        Loading…
      </p>
    );
  } else if (previewState === "error") {
    body = notice(
      <>
        <CircleAlert aria-hidden="true" className="size-5 text-red/80" />
        <p className="max-w-[320px]">{errorMessage}</p>
      </>,
      "error",
    );
  } else if (!source) {
    body = notice(
      <>
        <FileQuestion aria-hidden="true" className="size-5" />
        <p className="max-w-[320px]">There is no preview for this file type. Open it in your editor.</p>
      </>,
    );
  } else if (mode === "rendered" && source.language === "markdown") {
    body = scrollable(<MarkdownLite source={source.content} className="px-5 py-4" />);
  } else if (mode === "rendered" && source.language === "html") {
    body = (
      <iframe
        title={`Preview of ${selected}`}
        srcDoc={source.content}
        sandbox=""
        referrerPolicy="no-referrer"
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    );
  } else if (mode === "rendered" && source.language === "csv") {
    body = <CsvTable content={source.content} label={`Preview of ${selected}`} className="min-h-0 flex-1" />;
  } else {
    body = <CodeView content={source.content} language={source.language} label={`Source of ${selected}`} className="min-h-0 flex-1 py-3" />;
  }

  return (
    <div className={cn("@container", className)}>
      <div className="flex flex-col gap-3 @min-[760px]:h-[460px] @min-[760px]:flex-row">
        {/* tree */}
        <div
          className={cn(
            "relative flex min-h-[300px] flex-col overflow-hidden rounded-[16px] border border-hair-soft bg-[#08080a] @min-[760px]:w-[262px] @min-[760px]:shrink-0",
            narrow === "preview" && "@max-[759px]:hidden",
          )}
        >
          <p id={`${uid}-files`} className="px-3 pb-1 pt-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-faint">
            Files
          </p>
          <ul
            role="tree"
            aria-label={`Files in ${project}`}
            aria-busy={treeLoading || undefined}
            data-tree-id={uid}
            onKeyDown={onKey}
            className="scroll-thin min-h-0 flex-1 overflow-y-auto px-1.5 pb-2"
          >
            {rows.map(({ node, depth }) => {
              const isFolder = node.type === "folder";
              const isOpen = open.has(node.path);
              const isSel = node.path === selected;
              return (
                <li
                  key={node.path}
                  role="treeitem"
                  data-path={node.path}
                  aria-level={depth}
                  aria-expanded={isFolder ? isOpen : undefined}
                  aria-selected={isFolder ? undefined : isSel}
                  tabIndex={node.path === activeKey ? 0 : -1}
                  onClick={() => {
                    setActive(node.path);
                    pick(node);
                  }}
                  onFocus={() => setActive(node.path)}
                  className={cn(
                    "flex h-7 cursor-pointer select-none items-center gap-1.5 rounded-[7px] pr-2 text-[12.5px] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--ink)]",
                    isSel ? "bg-s3 text-ink" : "text-ink-dim hover:bg-s2 hover:text-ink",
                  )}
                  style={{ paddingLeft: 6 + (depth - 1) * 14 }}
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn("size-3.5 shrink-0 text-ink-faint transition-transform", isFolder ? (isOpen ? "rotate-90" : "") : "invisible")}
                  />
                  {isFolder ? (
                    isOpen ? (
                      <FolderOpen aria-hidden="true" className="size-3.5 shrink-0 text-blu" />
                    ) : (
                      <Folder aria-hidden="true" className="size-3.5 shrink-0 text-blu/80" />
                    )
                  ) : (
                    <FileText aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{node.name}</span>
                  {node.git ? (
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        node.git === "modified" ? "text-org" : node.git === "added" ? "text-grn" : "text-blu",
                      )}
                      title={`Git: ${node.git}`}
                    >
                      {node.git === "modified" ? "M" : node.git === "added" ? "A" : node.git === "untracked" ? "U" : node.git.slice(0, 1).toUpperCase()}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {selected ? (
            <button
              type="button"
              onClick={() => setNarrow("preview")}
              className="flex shrink-0 items-center gap-2 border-t border-hair-soft px-3 py-2.5 text-left text-[12px] hover:bg-s2 @min-[760px]:hidden"
            >
              <FileText aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 truncate font-mono text-ink">{selected}</span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
            </button>
          ) : null}
          {treeLoading ? (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#08080a] text-[12px] text-ink-faint">
              <Spinner size="sm" label={null} />
              Loading files…
            </div>
          ) : null}
        </div>

        {/* preview */}
        <div
          className={cn(
            "flex min-h-[300px] min-w-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-hair-soft bg-[#08080a]",
            narrow === "tree" && "@max-[759px]:hidden",
          )}
        >
          {!selected ? (
            <div className="flex min-h-[44px] shrink-0 items-center border-b border-hair-soft px-3 py-1.5 @min-[760px]:hidden">
              <button
                type="button"
                onClick={() => setNarrow("tree")}
                className="-ml-1 inline-flex h-7 items-center gap-1 rounded-[7px] px-1.5 text-[12px] text-ink-dim hover:bg-s2 hover:text-ink"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                Files
              </button>
            </div>
          ) : null}
          {selected ? (
            <div className="flex min-h-[44px] shrink-0 flex-wrap items-center gap-2 border-b border-hair-soft px-3 py-1.5">
              <button
                type="button"
                onClick={() => setNarrow("tree")}
                className="-ml-1 inline-flex h-7 items-center gap-1 rounded-[7px] px-1.5 text-[12px] text-ink-dim hover:bg-s2 hover:text-ink @min-[760px]:hidden"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                Files
              </button>
              <span className="min-w-0 truncate font-mono text-[12px] text-ink">{selected}</span>
              <span className="ml-auto flex shrink-0 items-center gap-2">
                {canRender && !previewState ? (
                  <Segmented
                    size="sm"
                    aria-label="Preview mode"
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: "rendered", label: "Preview", icon: <Eye aria-hidden="true" /> },
                      { value: "source", label: "Code", icon: <Code aria-hidden="true" /> },
                    ]}
                  />
                ) : null}
                <span className="rounded-full border border-hair px-2 py-0.5 text-[10px] text-ink-faint">Read only</span>
              </span>
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col">{body}</div>
        </div>
      </div>
    </div>
  );
}
