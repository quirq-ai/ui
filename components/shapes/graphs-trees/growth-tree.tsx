"use client";

// Horizontal growth tree: the projects folder on the left, one column per level of folders,
// files stacked in a card beside the folder that holds them. Link weight grows with what a
// branch holds; new branches grow in and their links draw in. Drag the canvas to pan.
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/loaders";
import type { FsNode } from "./file-explorer";

type GKind = "root" | "project" | "dir";
type GNode = { key: string; name: string; kind: GKind; dirs: GNode[]; files: FsNode[]; nFiles: number; nDirs: number };

const COL_W = 212;
const ROW_H = 34;
const FILE_H = 20;
const STACK_PAD = 13;
const GAP = 7;
const PAD_Y = 22;
const PAD_X = 18;

function build(node: FsNode, key: string, kind: GKind): GNode {
  const kids = node.children ?? [];
  const dirs = kids
    .filter((c) => c.type === "folder")
    .map((c) => build(c, `${key}/${c.name}`, kind === "root" ? "project" : "dir"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = kids.filter((c) => c.type === "file").sort((a, b) => a.name.localeCompare(b.name));
  return {
    key,
    name: node.name,
    kind,
    dirs,
    files,
    nFiles: files.length + dirs.reduce((s, d) => s + d.nFiles, 0),
    nDirs: dirs.length + dirs.reduce((s, d) => s + d.nDirs, 0),
  };
}

function matches(n: GNode, q: string): boolean {
  if (!q) return true;
  if (n.name.toLowerCase().includes(q)) return true;
  if (n.files.some((f) => f.name.toLowerCase().includes(q))) return true;
  return n.dirs.some((d) => matches(d, q));
}

type LNode = { key: string; x: number; y: number; n: GNode; depth: number; open: boolean; hasKids: boolean };
type LLink = { key: string; x1: number; y1: number; x2: number; y2: number; w: number; leaf: boolean };
type LStack = { key: string; x: number; y: number; h: number; files: FsNode[]; extra: number; total: number; projectKey: string };
type Layout = { nodes: LNode[]; links: LLink[]; stacks: LStack[]; width: number; height: number };

/** 1 file reads as a hairline, a few hundred as 4px: log2, so big branches do not swamp. */
const weight = (n: number) => Math.max(1.1, Math.min(4.4, Math.log2(1 + n) * 0.62));

function layoutTree(model: GNode, open: Set<string>, expanded: Set<string>, q: string, filesShown: number): Layout {
  const out: Omit<Layout, "width" | "height"> = { nodes: [], links: [], stacks: [] };
  const projectOf = (key: string) => key.split("/").slice(0, 2).join("/");
  const walk = (n: GNode, depth: number, top: number): { height: number; centre: number } => {
    const x = PAD_X + depth * COL_W;
    const isOpen = q ? true : open.has(n.key);
    const kids = n.dirs.filter((c) => matches(c, q));
    const files = q ? n.files.filter((f) => f.name.toLowerCase().includes(q) || n.name.toLowerCase().includes(q)) : n.files;
    const hasKids = n.dirs.length + n.files.length > 0;
    if (!isOpen || (!kids.length && !files.length)) {
      out.nodes.push({ key: n.key, x, y: top, n, depth, open: false, hasKids });
      return { height: ROW_H, centre: top + ROW_H / 2 };
    }
    let cursor = top;
    let first: number | null = null;
    let last = 0;
    const centres: number[] = [];
    for (const c of kids) {
      const r = walk(c, depth + 1, cursor);
      cursor += r.height + GAP;
      centres.push(r.centre);
      if (first === null) first = r.centre;
      last = r.centre;
    }
    let stack: LStack | null = null;
    if (files.length) {
      const all = expanded.has(n.key);
      const shown = all ? files : files.slice(0, filesShown);
      const rows = shown.length + (files.length > filesShown ? 1 : 0);
      const h = rows * FILE_H + STACK_PAD * 2 + FILE_H;
      stack = { key: n.key, x: x + COL_W, y: cursor, h, files: shown, extra: files.length - shown.length, total: files.length, projectKey: projectOf(n.key) };
      out.stacks.push(stack);
      const c = cursor + h / 2;
      centres.push(c);
      if (first === null) first = c;
      last = c;
      cursor += h + GAP;
    }
    const height = Math.max(ROW_H, cursor - GAP - top);
    const centre = first === null ? top + ROW_H / 2 : (first + last) / 2;
    out.nodes.push({ key: n.key, x, y: centre - ROW_H / 2, n, depth, open: true, hasKids: true });
    kids.forEach((c, i) =>
      out.links.push({ key: c.key, x1: x + COL_W - 24, y1: centre, x2: x + COL_W, y2: centres[i], w: weight(c.nFiles), leaf: false }),
    );
    if (stack) out.links.push({ key: `stack:${n.key}`, x1: x + COL_W - 24, y1: centre, x2: x + COL_W, y2: stack.y + stack.h / 2, w: weight(files.length), leaf: true });
    return { height, centre };
  };
  const r = walk(model, 0, PAD_Y);
  const width = Math.max(...out.nodes.map((n) => n.x + COL_W), ...out.stacks.map((s) => s.x + COL_W), 640) + PAD_X;
  const height = Math.max(r.height + PAD_Y * 2, ...out.stacks.map((s) => s.y + s.h + PAD_Y), 300);
  return { ...out, width, height };
}

const curve = (l: LLink) => {
  const mx = (l.x1 + l.x2) / 2;
  return `M${l.x1} ${l.y1} C${mx} ${l.y1} ${mx} ${l.y2} ${l.x2} ${l.y2}`;
};

const tagOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : "";
};

const visibleKeys = (l: Layout) => new Set([...l.nodes.map((n) => n.key), ...l.stacks.map((s) => `stack:${s.key}`)]);

const ANIM_CSS = `
@keyframes gt-grow{from{opacity:0;transform:translateX(-16px) scale(.94)}to{opacity:1;transform:none}}
@keyframes gt-draw{from{stroke-dasharray:1;stroke-dashoffset:1;opacity:0}to{stroke-dasharray:1;stroke-dashoffset:0;opacity:.9}}
.gt-new{animation:gt-grow .34s var(--ease) backwards}
.gt-draw{animation:gt-draw .42s var(--ease) backwards}
@keyframes gt-fade{from{opacity:0}to{opacity:.9}}
.gt-fade{animation:gt-fade .42s var(--ease) backwards}
`;

export type GrowthTreeProps = {
  /** the projects folder: its folders are projects */
  root: FsNode;
  /** branch keys open at first: "" is the root, "/xo-space/docs" a folder */
  defaultOpen?: string[];
  /** files shown per card before "+N more" */
  filesShown?: number;
  /** skeleton while the projects folder loads */
  loading?: boolean;
  /** called with the project and the project-relative path */
  onOpenFile?: (project: string, path: string) => void;
  /** start with a filter, for state demos */
  defaultQuery?: string;
  /** canvas height in px */
  height?: number;
  className?: string;
};

export function GrowthTree({
  root,
  defaultOpen = [""],
  filesShown = 4,
  loading = false,
  onOpenFile,
  defaultQuery = "",
  height = 440,
  className,
}: GrowthTreeProps) {
  const model = useMemo(() => build(root, "", "root"), [root]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState(defaultQuery);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [panning, setPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null);

  const q = query.trim().toLowerCase();
  const layout = useMemo(() => layoutTree(model, open, expanded, q, filesShown), [model, open, expanded, q, filesShown]);
  const noMatch = !!q && !matches(model, q);

  /* the root sits halfway down its branches: start, and reset, with it in view */
  const rootY = layout.nodes.find((n) => n.n.kind === "root")?.y ?? 0;
  const centreRoot = useCallback(
    (behavior: ScrollBehavior) => {
      const el = canvasRef.current;
      if (!el) return;
      el.scrollTo({ left: 0, top: Math.max(0, rootY + 19 - el.clientHeight / 2), behavior });
    },
    [rootY],
  );
  const centred = useRef(false);
  useEffect(() => {
    if (centred.current || loading) return;
    centred.current = true;
    centreRoot("auto");
  }, [centreRoot, loading]);

  const grow = (nextOpen: Set<string>, nextExpanded: Set<string>) => {
    const before = visibleKeys(layout);
    const after = visibleKeys(layoutTree(model, nextOpen, nextExpanded, q, filesShown));
    setFresh(new Set([...after].filter((k) => !before.has(k))));
  };
  const toggle = (key: string) => {
    const next = new Set(open);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    grow(next, expanded);
    setOpen(next);
  };
  const toggleStack = (key: string) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded(next);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as Element).closest("button")) return;
    pan.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    const el = canvasRef.current;
    if (!p || !el) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved) {
      if (Math.hypot(dx, dy) <= 4) return;
      p.moved = true;
      setPanning(true);
      el.setPointerCapture(p.id);
    }
    el.scrollLeft -= dx;
    el.scrollTop -= dy;
    p.x = e.clientX;
    p.y = e.clientY;
  };
  const endPan = () => {
    pan.current = null;
    setPanning(false);
  };

  const counts = `${model.dirs.length} ${plural(model.dirs.length, "project")} · ${model.nDirs - model.dirs.length} ${plural(model.nDirs - model.dirs.length, "folder")} · ${model.nFiles} ${plural(model.nFiles, "file")}`;

  return (
    <div className={cn("@container overflow-hidden rounded-[14px] border border-hair-soft bg-[#08080a]", className)}>
      <style href="gt-growth-tree" precedence="medium">
        {ANIM_CSS}
      </style>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hair-soft px-3.5 py-2.5">
        <span className="mr-auto font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{loading ? "Loading…" : counts}</span>
        <div className="flex min-w-0 flex-[1_1_100%] flex-wrap items-center gap-2 @min-[640px]:flex-none">
          <div className="min-w-[150px] flex-1 @min-[640px]:w-[220px] @min-[640px]:flex-none">
            <SearchInput
              size="sm"
              shape="field"
              placeholder="Filter tree by name…"
              aria-label="Filter tree by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => {
              setOpen(new Set([""]));
              setExpanded(new Set());
              setFresh(new Set());
            }}
          >
            Projects only
          </Button>
          <Button size="sm" variant="secondary" disabled={loading} onClick={() => centreRoot("smooth")}>
            Reset view
          </Button>
        </div>
      </div>

      {noMatch ? (
        <p role="status" className="border-b border-hair-soft px-4 py-2.5 text-[12px] text-ink-faint">
          No names match “{query.trim()}”. Clear the search to show the tree.
        </p>
      ) : null}

      <div
        ref={canvasRef}
        role="group"
        aria-label="Projects folder tree, drag to pan"
        tabIndex={0}
        className={cn(
          "scroll-thin relative overflow-auto focus-visible:outline-offset-[-2px]",
          panning ? "cursor-grabbing select-none" : "cursor-grab",
        )}
        style={{ height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        {loading ? (
          <div className="space-y-3 p-5" aria-busy="true">
            <p role="status" className="text-[12px] text-ink-faint">
              Loading the projects folder…
            </p>
            <div className="flex items-center gap-6">
              <Skeleton width={196} height={38} radius={9} />
              <div className="space-y-2.5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} width={188} height={34} radius={9} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative" style={{ width: layout.width, height: layout.height }}>
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width={layout.width} height={layout.height} aria-hidden="true">
              {layout.links.map((l) => (
                <path
                  key={l.key}
                  d={curve(l)}
                  pathLength={l.leaf ? undefined : 1}
                  fill="none"
                  stroke={l.leaf ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.2)"}
                  strokeWidth={l.leaf ? Math.min(l.w, 1.6) : l.w}
                  strokeLinecap="round"
                  strokeDasharray={l.leaf ? "2.5 3.5" : undefined}
                  className={cn(fresh.has(l.key) && (l.leaf ? "gt-fade" : "gt-draw"))}
                  style={{ opacity: 0.9 }}
                />
              ))}
            </svg>

            {layout.nodes.map((ln) => {
              const n = ln.n;
              const sub =
                n.kind === "root"
                  ? `${n.dirs.length} ${plural(n.dirs.length, "project")} · ${n.nFiles} ${plural(n.nFiles, "file")}`
                  : `${n.nFiles} ${plural(n.nFiles, "file")}${n.nDirs ? ` · ${n.nDirs} ${plural(n.nDirs, "folder")}` : ""}`;
              const bud = Math.max(4, Math.min(11, 3 + Math.log2(1 + n.nFiles) * 1.5));
              const isRoot = n.kind === "root";
              return (
                <button
                  key={ln.key}
                  type="button"
                  aria-expanded={ln.hasKids ? ln.open : undefined}
                  aria-label={`${n.name}, ${sub}${ln.hasKids ? "" : ", empty"}`}
                  disabled={!ln.hasKids}
                  onClick={() => toggle(ln.key)}
                  className={cn(
                    "group absolute grid items-center gap-x-[9px] rounded-[9px] border pl-[9px] pr-2.5 text-left transition-[border-color,background-color,transform] duration-150 enabled:hover:translate-x-[2px] enabled:hover:border-hair-strong disabled:cursor-default",
                    ln.open ? "border-hair" : "border-hair-soft",
                    fresh.has(ln.key) && "gt-new",
                  )}
                  style={{
                    left: ln.x,
                    top: ln.y,
                    width: isRoot ? 196 : 188,
                    height: isRoot ? 38 : ROW_H,
                    gridTemplateColumns: `${bud}px minmax(0,1fr) 10px`,
                    background: isRoot ? "var(--s2)" : `color-mix(in srgb, var(--s3) ${100 - Math.min(ln.depth, 5) * 9}%, var(--s2))`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "rounded-full border-[1.5px] transition-opacity",
                      !ln.hasKids ? "border-ink-faint opacity-40" : ln.open ? "border-blu bg-blu opacity-100 shadow-[0_0_0_3px_color-mix(in_srgb,var(--blu)_14%,transparent)]" : "border-blu opacity-55 group-hover:opacity-100",
                    )}
                    style={{ width: bud, height: bud }}
                  />
                  <span className="flex min-w-0 flex-col gap-px">
                    <span
                      className={cn(
                        "truncate leading-[1.15]",
                        isRoot ? "text-[13.5px] font-semibold text-ink" : n.kind === "project" ? (ln.hasKids ? "text-[12.5px] font-medium text-blu" : "text-[12.5px] font-medium text-ink-dim") : "text-[12.5px] text-ink",
                      )}
                    >
                      {n.name}
                    </span>
                    <span className="truncate text-[11px] leading-[1.15] tracking-[0.02em] text-ink-faint tabular-nums">{sub}</span>
                  </span>
                  {ln.hasKids ? (
                    <ChevronRight
                      aria-hidden="true"
                      className={cn("size-2.5 justify-self-end transition-transform", ln.open ? "rotate-90 text-blu" : "text-ink-faint")}
                    />
                  ) : (
                    <span />
                  )}
                </button>
              );
            })}

            {layout.stacks.map((s) => (
              <div
                key={`stack:${s.key}`}
                className={cn("absolute w-[196px] rounded-[9px] border border-hair-soft bg-s2/60 pb-2 pt-[7px]", fresh.has(`stack:${s.key}`) && "gt-new")}
                style={{ left: s.x, top: s.y, minHeight: s.h }}
              >
                <p className="mb-0.5 border-b border-hair-soft px-2.5 pb-[5px] text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  {s.total} {plural(s.total, "file")}
                </p>
                {s.files.map((f) => (
                  <button
                    key={f.path}
                    type="button"
                    title={f.name}
                    onClick={() => onOpenFile?.(s.projectKey.replace(/^\//, ""), f.path)}
                    className="group/leaf grid h-5 w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2 rounded-[5px] px-2.5 text-left hover:bg-s3"
                  >
                    <span className="truncate text-[12px] text-ink-dim group-hover/leaf:text-ink">{f.name}</span>
                    <span className="text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">{tagOf(f.name)}</span>
                  </button>
                ))}
                {s.extra > 0 || (expanded.has(s.key) && s.total > filesShown) ? (
                  <button
                    type="button"
                    onClick={() => toggleStack(s.key)}
                    className="mt-[3px] h-5 w-full rounded-[5px] px-2.5 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-blu hover:bg-s3"
                  >
                    {s.extra > 0 ? `+${s.extra} more` : "Show fewer"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
