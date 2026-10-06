// Shared node-and-edge diagram engine for flow, architecture and decision diagrams.
// Nodes are HTML boxes positioned on a fixed-size stage; edges, group frames and decision
// diamonds are drawn in one SVG layer underneath. No hooks: interactive wrappers pass
// highlight sets and handlers in. Geometry is plain arithmetic, so server and client agree.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneSoft, type Tone } from "@/components/ui/tones";
import { toneColor } from "./parts";

export type Side = "left" | "right" | "top" | "bottom";
export type DiagramNodeShape = "card" | "pill" | "diamond" | "store" | "result" | "start";
export type DiagramEdgeStyle = "solid" | "dashed" | "dotted";

export type DiagramNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  /** mono uppercase line above the title (cards only) */
  kicker?: string;
  shape?: DiagramNodeShape;
  tone?: Tone;
  /** mono title, for addresses, paths and commands */
  mono?: boolean;
};

export type DiagramEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  /** solid: a role or a step; dashed: intended, not validated; dotted: a side channel such as the bridge */
  style?: DiagramEdgeStyle;
  fromSide?: Side;
  toSide?: Side;
  /** color when highlighted */
  tone?: Tone;
  /** where the label sits along the curve, 0 to 1 (default 0.5) */
  labelAt?: number;
};

export type DiagramGroup = { id: string; label: string; x: number; y: number; w: number; h: number; tone?: Tone };

type Pt = { x: number; y: number };

const NORMAL: Record<Side, Pt> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

function anchor(n: DiagramNode, side: Side): Pt {
  switch (side) {
    case "left":
      return { x: n.x, y: n.y + n.h / 2 };
    case "right":
      return { x: n.x + n.w, y: n.y + n.h / 2 };
    case "top":
      return { x: n.x + n.w / 2, y: n.y };
    case "bottom":
      return { x: n.x + n.w / 2, y: n.y + n.h };
  }
}

function autoSides(a: DiagramNode, b: DiagramNode): [Side, Side] {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2);
  const dy = b.y + b.h / 2 - (a.y + a.h / 2);
  // horizontal when the boxes do not overlap sideways and the run is mostly sideways
  const sideways = b.x >= a.x + a.w || a.x >= b.x + b.w;
  if (sideways && Math.abs(dx) > Math.abs(dy) * 0.6) return dx > 0 ? ["right", "left"] : ["left", "right"];
  return dy > 0 ? ["bottom", "top"] : ["top", "bottom"];
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export type EdgeGeometry = { d: string; label: Pt; arrow: string; end: Pt };

/** Cubic edge between two boxes, with its label point and arrowhead polygon. */
export function edgeGeometry(a: DiagramNode, b: DiagramNode, fromSide?: Side, toSide?: Side, labelAt = 0.5): EdgeGeometry {
  const [fs, ts] = fromSide && toSide ? [fromSide, toSide] : (() => {
    const [f, t] = autoSides(a, b);
    return [fromSide ?? f, toSide ?? t] as [Side, Side];
  })();
  const p1 = anchor(a, fs);
  const p2 = anchor(b, ts);
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const k = Math.min(90, Math.max(22, dist * 0.42));
  const n1 = NORMAL[fs];
  const n2 = NORMAL[ts];
  const c1 = { x: p1.x + n1.x * k, y: p1.y + n1.y * k };
  const c2 = { x: p2.x + n2.x * k, y: p2.y + n2.y * k };
  const t = labelAt;
  const mt = 1 - t;
  const label = {
    x: mt * mt * mt * p1.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p2.x,
    y: mt * mt * mt * p1.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p2.y,
  };
  // arrowhead: tangent at the end of the curve points from c2 into p2
  let ux = p2.x - c2.x;
  let uy = p2.y - c2.y;
  const len = Math.hypot(ux, uy) || 1;
  ux /= len;
  uy /= len;
  const bx = p2.x - ux * 7;
  const by = p2.y - uy * 7;
  const arrow = `${r1(p2.x)},${r1(p2.y)} ${r1(bx - uy * 3.6)},${r1(by + ux * 3.6)} ${r1(bx + uy * 3.6)},${r1(by - ux * 3.6)}`;
  const end = { x: bx, y: by };
  const d = `M${r1(p1.x)} ${r1(p1.y)} C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(end.x)} ${r1(end.y)}`;
  return { d, label: { x: r1(label.x), y: r1(label.y) }, arrow, end };
}

export const DASH: Record<DiagramEdgeStyle, string | undefined> = {
  solid: undefined,
  dashed: "6 5",
  dotted: "1.5 4.5",
};

/** Approximate width of a mono label at 10px (0.6em per character). */
export function monoWidth(text: string, size = 10): number {
  return text.length * size * 0.6;
}

export type DiagramProps = {
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
  /** when set, every node and edge outside it dims */
  highlight?: { nodes: readonly string[]; edges: readonly string[] } | null;
  /** strongest emphasis: the current step or the focused node */
  activeNodeId?: string | null;
  /** render nodes as buttons; requires the handlers below */
  interactive?: boolean;
  onNodeEnter?: (id: string) => void;
  onNodeLeave?: (id: string) => void;
  onNodeClick?: (id: string) => void;
  /** roving tab stop: return 0 for the one focusable node, -1 for the rest */
  nodeTabIndex?: (id: string) => number;
  /** extra overlays positioned on the stage (flow dots, badges) */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const groupStroke = (tone?: Tone) => (tone ? toneColor(tone) : "var(--ink-faint)");

/** The stage: fixed pixel size, edges under nodes. Wrap it in DiagramScroller for narrow screens. */
export function Diagram({
  width,
  height,
  nodes,
  edges,
  groups = [],
  highlight = null,
  activeNodeId = null,
  interactive = false,
  onNodeEnter,
  onNodeLeave,
  onNodeClick,
  nodeTabIndex,
  children,
  className,
  style,
}: DiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const litNodes = highlight ? new Set(highlight.nodes) : null;
  const litEdges = highlight ? new Set(highlight.edges) : null;

  return (
    <div className={cn("relative", className)} style={{ width, height, ...style }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        {groups.map((g) => (
          <g key={g.id}>
            <rect
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={14}
              fill={groupStroke(g.tone)}
              fillOpacity={0.035}
              stroke={groupStroke(g.tone)}
              strokeOpacity={0.45}
              strokeDasharray="4 5"
            />
            <text
              x={g.x + 14}
              y={g.y + 18}
              className="font-mono"
              fontSize={9.5}
              letterSpacing="0.14em"
              fill={groupStroke(g.tone)}
              fillOpacity={0.9}
            >
              {g.label.toUpperCase()}
            </text>
          </g>
        ))}

        {nodes
          .filter((n) => n.shape === "diamond")
          .map((n) => {
            const dim = litNodes && !litNodes.has(n.id);
            const active = activeNodeId === n.id || (litNodes?.has(n.id) ?? false);
            return (
              <polygon
                key={`dia-${n.id}`}
                points={`${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w / 2},${n.y + n.h} ${n.x},${n.y + n.h / 2}`}
                fill="var(--s2)"
                stroke={active ? toneColor(n.tone ?? "blu") : "var(--hair-strong)"}
                strokeWidth={activeNodeId === n.id ? 1.6 : 1}
                opacity={dim ? 0.3 : 1}
                style={{ transition: "opacity 180ms var(--ease), stroke 180ms var(--ease)" }}
              />
            );
          })}

        {edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const geo = edgeGeometry(a, b, e.fromSide, e.toSide, e.labelAt);
          const lit = litEdges?.has(e.id) ?? false;
          const dim = litEdges !== null && !lit;
          const color = lit ? toneColor(e.tone ?? "blu") : "var(--ink-faint)";
          const style = e.style ?? "solid";
          return (
            <g key={e.id} opacity={dim ? 0.18 : 1} style={{ transition: "opacity 180ms var(--ease)" }}>
              <path
                d={geo.d}
                fill="none"
                stroke={color}
                strokeOpacity={lit ? 1 : 0.75}
                strokeWidth={lit ? 1.8 : 1.2}
                strokeDasharray={DASH[style]}
                strokeLinecap="round"
              />
              <polygon points={geo.arrow} fill={color} fillOpacity={lit ? 1 : 0.85} />
            </g>
          );
        })}

        {edges.map((e) => {
          if (!e.label) return null;
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const geo = edgeGeometry(a, b, e.fromSide, e.toSide, e.labelAt);
          const lit = litEdges?.has(e.id) ?? false;
          const dim = litEdges !== null && !lit;
          const w = monoWidth(e.label) + 12;
          return (
            <g key={`lbl-${e.id}`} opacity={dim ? 0.25 : 1} style={{ transition: "opacity 180ms var(--ease)" }}>
              <rect
                x={r1(geo.label.x - w / 2)}
                y={geo.label.y - 8.5}
                width={r1(w)}
                height={17}
                rx={4}
                fill="#0b0b0c"
                stroke={lit ? toneColor(e.tone ?? "blu") : "var(--hair)"}
                strokeOpacity={lit ? 0.6 : 1}
              />
              <text
                x={geo.label.x}
                y={geo.label.y + 3.4}
                textAnchor="middle"
                className="font-mono"
                fontSize={10}
                fill={lit ? "var(--ink)" : "var(--ink-dim)"}
              >
                {e.label}
              </text>
            </g>
          );
        })}
      </svg>

      {nodes.map((n) => (
        <DiagramNodeBox
          key={n.id}
          node={n}
          dim={litNodes !== null && !litNodes.has(n.id)}
          lit={litNodes?.has(n.id) ?? false}
          active={activeNodeId === n.id}
          interactive={interactive}
          tabIndex={nodeTabIndex ? nodeTabIndex(n.id) : undefined}
          onEnter={onNodeEnter}
          onLeave={onNodeLeave}
          onClick={onNodeClick}
        />
      ))}
      {children}
    </div>
  );
}

function DiagramNodeBox({
  node: n,
  dim,
  lit,
  active,
  interactive,
  tabIndex,
  onEnter,
  onLeave,
  onClick,
}: {
  node: DiagramNode;
  dim: boolean;
  lit: boolean;
  active: boolean;
  interactive: boolean;
  tabIndex?: number;
  onEnter?: (id: string) => void;
  onLeave?: (id: string) => void;
  onClick?: (id: string) => void;
}) {
  const shape = n.shape ?? "card";
  const toneLine = n.tone ? toneColor(n.tone) : "var(--ink-faint)";
  const box: CSSProperties = {
    left: n.x,
    top: n.y,
    width: n.w,
    height: n.h,
    transition: "opacity 180ms var(--ease), border-color 180ms var(--ease), box-shadow 180ms var(--ease)",
    opacity: dim ? 0.32 : 1,
    paddingLeft: shape === "diamond" ? Math.round(n.w * 0.2) : undefined,
    paddingRight: shape === "diamond" ? Math.round(n.w * 0.2) : undefined,
    boxShadow:
      active && shape !== "diamond"
        ? "0 0 0 2px color-mix(in srgb, var(--blu) 55%, transparent)"
        : shape === "card"
          ? "0 8px 24px rgba(0, 0, 0, 0.35)"
          : undefined,
  };
  const ring = active || lit;
  const cls = cn(
    "absolute flex min-w-0",
    shape === "card" && "flex-col justify-center gap-0.5 rounded-[10px] border bg-s2 px-[11px] py-2 text-left",
    shape === "store" && "flex-col justify-center gap-0.5 rounded-[10px] border border-dashed bg-s1 px-[11px] py-2 text-left",
    shape === "pill" && "items-center justify-center rounded-full border bg-s2 px-3 text-center",
    shape === "start" && "items-center justify-center rounded-full border border-dashed bg-s1 px-3 text-center",
    shape === "result" && "items-center justify-center rounded-[8px] border px-2.5 text-center",
    shape === "diamond" && "items-center justify-center text-center",
    shape === "result" ? toneSoft[n.tone ?? "neutral"] : null,
    shape !== "diamond" && shape !== "result" && (ring ? "border-hair-strong" : "border-hair"),
    interactive && "cursor-pointer",
  );

  const content = (
    <>
      {n.kicker && (shape === "card" || shape === "store") ? (
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.16em] text-ink-faint">
          <span aria-hidden="true" className="size-[6px] shrink-0 -skew-x-12 rounded-[1.5px]" style={{ background: toneLine }} />
          {n.kicker}
        </span>
      ) : null}
      <span
        className={cn(
          "block min-w-0 leading-tight text-ink",
          n.mono ? "font-mono text-[11px]" : shape === "diamond" ? "text-[11px]" : "text-[12.5px] font-medium",
          shape === "result" && "text-[11.5px] font-normal",
          shape === "start" && "text-ink-dim",
          (shape === "card" || shape === "store") && n.kicker ? "mt-1" : null,
        )}
      >
        {n.title}
      </span>
      {n.sub ? (
        <span
          className={cn(
            "block min-w-0 leading-snug text-ink-faint",
            shape === "diamond" || shape === "pill" || shape === "result" ? "text-[10px]" : "text-[11px]",
          )}
        >
          {n.sub}
        </span>
      ) : null}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        data-node={n.id}
        tabIndex={tabIndex}
        aria-pressed={active}
        aria-label={[n.kicker, n.title, n.sub].filter(Boolean).join(", ")}
        className={cn(cls, shape === "diamond" || shape === "pill" || shape === "result" || shape === "start" ? "flex-col" : null)}
        style={box}
        onMouseEnter={() => onEnter?.(n.id)}
        onMouseLeave={() => onLeave?.(n.id)}
        onFocus={() => onEnter?.(n.id)}
        onBlur={() => onLeave?.(n.id)}
        onClick={() => onClick?.(n.id)}
      >
        {content}
      </button>
    );
  }
  return (
    <div
      data-node={n.id}
      className={cn(cls, shape === "diamond" || shape === "pill" || shape === "result" || shape === "start" ? "flex-col" : null)}
      style={box}
    >
      {content}
    </div>
  );
}

/** Horizontal scroll region for a fixed-size stage. Focusable so keyboard users can scroll it. */
export function DiagramScroller({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={`${label}, scrolls sideways on narrow screens`}
      tabIndex={0}
      className={cn("scroll-thin max-w-full overflow-x-auto overflow-y-hidden rounded-[14px] focus-visible:outline-offset-[-2px]", className)}
    >
      {children}
    </div>
  );
}

/** Legend for edge styles. */
export function EdgeLegend({ items, className }: { items: { style: DiagramEdgeStyle; label: string }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-ink-dim", className)} aria-label="Edge legend">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <svg width="26" height="8" aria-hidden="true">
            <line
              x1="1"
              y1="4"
              x2="19"
              y2="4"
              stroke="var(--ink-dim)"
              strokeWidth="1.3"
              strokeDasharray={DASH[it.style]}
              strokeLinecap="round"
            />
            <polygon points="25,4 19,1 19,7" fill="var(--ink-dim)" />
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------------------- tree layout */

export type TreeLayoutItem = { id: string; w: number; h: number };

/** Per-depth horizontal extent of a subtree, relative to its root's center. */
type Contour = Map<number, [number, number]>;

/**
 * Top-down tidy layout. Each node sits under its first parent and centers over its
 * children. Sibling subtrees are packed by their contours, so a short branch only keeps
 * its distance on the rows it actually uses. Extra parents just add edges.
 */
export function layoutTree<T extends TreeLayoutItem>(
  items: T[],
  links: { from: string; to: string }[],
  opts: { root: string; gapX?: number; gapY?: number; pad?: number },
): { nodes: (T & { x: number; y: number })[]; width: number; height: number } {
  const gapX = opts.gapX ?? 12;
  const gapY = opts.gapY ?? 34;
  const pad = opts.pad ?? 16;
  const byId = new Map(items.map((i) => [i.id, i]));
  const kidsOf = new Map<string, string[]>();
  const depth = new Map<string, number>([[opts.root, 0]]);
  const queue = [opts.root];
  while (queue.length) {
    const id = queue.shift() as string;
    for (const l of links) {
      if (l.from !== id || depth.has(l.to) || !byId.has(l.to)) continue;
      depth.set(l.to, (depth.get(id) ?? 0) + 1);
      kidsOf.set(id, [...(kidsOf.get(id) ?? []), l.to]);
      queue.push(l.to);
    }
  }

  /* bottom up: each child's offset from its parent's center, and each subtree's contour */
  const offset = new Map<string, number>();
  const contourOf = (id: string): Contour => {
    const item = byId.get(id) as T;
    const d = depth.get(id) ?? 0;
    const kids = kidsOf.get(id) ?? [];
    const own: [number, number] = [-item.w / 2, item.w / 2];
    if (!kids.length) return new Map([[d, own]]);
    const acc: Contour = new Map();
    const at: number[] = [];
    kids.forEach((k, i) => {
      const c = contourOf(k);
      let shift = 0;
      if (i > 0) {
        shift = -Infinity;
        for (const [dd, [l]] of c) {
          const a = acc.get(dd);
          if (a) shift = Math.max(shift, a[1] + gapX - l);
        }
        if (shift === -Infinity) shift = at[i - 1];
      }
      at.push(shift);
      for (const [dd, [l, r]] of c) {
        const a = acc.get(dd);
        acc.set(dd, a ? [Math.min(a[0], l + shift), Math.max(a[1], r + shift)] : [l + shift, r + shift]);
      }
    });
    const centre = (at[0] + at[at.length - 1]) / 2;
    kids.forEach((k, i) => offset.set(k, at[i] - centre));
    const out: Contour = new Map([[d, own]]);
    for (const [dd, [l, r]] of acc) out.set(dd, [l - centre, r - centre]);
    return out;
  };
  contourOf(opts.root);

  /* top down: absolute centers */
  const cx = new Map<string, number>([[opts.root, 0]]);
  const down = (id: string) => {
    for (const k of kidsOf.get(id) ?? []) {
      cx.set(k, (cx.get(id) ?? 0) + (offset.get(k) ?? 0));
      down(k);
    }
  };
  down(opts.root);
  const maxDepth = Math.max(...depth.values());
  const rowH: number[] = Array.from({ length: maxDepth + 1 }, () => 0);
  for (const [id, d] of depth) rowH[d] = Math.max(rowH[d], byId.get(id)?.h ?? 0);
  const rowTop: number[] = [];
  let y = pad;
  for (let d = 0; d <= maxDepth; d++) {
    rowTop[d] = y;
    y += rowH[d] + gapY;
  }
  const placed = items
    .filter((i) => depth.has(i.id))
    .map((i) => {
      const d = depth.get(i.id) ?? 0;
      return { ...i, x: (cx.get(i.id) ?? 0) - i.w / 2, y: rowTop[d] + (rowH[d] - i.h) / 2 };
    });
  const minX = Math.min(...placed.map((p) => p.x));
  const shifted = placed.map((p) => ({ ...p, x: Math.round(p.x - minX + pad), y: Math.round(p.y) }));
  const width = Math.max(...shifted.map((p) => p.x + p.w)) + pad;
  const height = y - gapY + pad;
  return { nodes: shifted, width, height };
}
