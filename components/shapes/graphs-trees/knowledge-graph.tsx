"use client";

// Knowledge and session graph: a root, hubs with counts, dashed hulls around each hub's
// leaves, leaf glyphs by type, todo satellites around a focused project, a legend, a focus
// crumb and a settling indicator. SVG, so it renders on the server; the layout is passed in
// (precomputed and deterministic) and the "settle" is an eased replay from a seeded scatter.
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Minus, Plus, RotateCcw, Scan } from "lucide-react";
import { cn } from "@/lib/cn";
import { hashString } from "@/components/ui/tones";
import { mulberry32, type TodoStatus } from "@/lib/fixtures";
import { IconButton } from "@/components/ui/button";

/* ----------------------------------------------------------------------------- types */

export type KGNodeType = "root" | "hub" | "group" | "leaf";
export type KGGlyph = "disc" | "ring" | "diamond" | "stack" | "slab";

export type KGNode = {
  id: string;
  type: KGNodeType;
  label: string;
  /** layout position in the graph's own units */
  x: number;
  y: number;
  r: number;
  /** CSS color, such as var(--blu) */
  color: string;
  glyph?: KGGlyph;
  /** hull this node belongs to (hubs and their leaves) */
  hull?: string;
  /** collapsible cluster (a group node id) this leaf sits in */
  cluster?: string;
  /** hub caption under the node, such as "227 SESSIONS" */
  countLabel?: string;
  /** hover card kicker, such as "Engineering · App" */
  kicker?: string;
  /** hover card lines */
  detail?: string[];
  /** drawn at 72 percent, for secondary types */
  dim?: boolean;
};

export type KGEdge = { source: string; target: string; kind?: "root" | "tie" | "x" };
export type KGHull = { id: string; color: string };
export type KGSatellite = { id: string; label: string; status: TodoStatus };
/** One legend row: a color swatch, a node glyph, a hollow ring or a curved tie line. */
export type KGLegendItem = { label: string; swatch?: string; glyph?: KGGlyph; ring?: boolean; line?: boolean; dim?: boolean };
/** Steps (todos) of one project, drawn as satellites while that project is focused. */
export type KGSatelliteGroup = { hostId: string; items: KGSatellite[] };

export type KnowledgeGraphProps = {
  nodes: KGNode[];
  edges: KGEdge[];
  hulls?: KGHull[];
  /** step satellites per project; a project's steps orbit it while it is focused */
  satellites?: KGSatelliteGroup[];
  legend?: KGLegendItem[];
  /** top-left help line, hidden on narrow screens */
  hint?: ReactNode;
  ariaLabel: string;
  defaultFocusId?: string | null;
  defaultZoom?: number;
  /** cluster (group) ids that start closed */
  defaultClosed?: string[];
  /** freeze the layout mid-settle (0 to 1) and show the settling status */
  settleProgress?: number;
  /** leaf labels always on, or only when zoomed in, hovered or focused */
  leafLabels?: "always" | "auto";
  /** hops in a focus neighborhood */
  focusDepth?: number;
  /** hides the hint and the replay control, for small tiles */
  compact?: boolean;
  /** height classes for the canvas */
  className?: string;
};

/* ----------------------------------------------------------------------------- geometry */

const K_MIN = 0.45;
const K_MAX = 3.2;
const SAT_MIN_K = 0.55;
const HULL_PAD = 30;
const clampK = (k: number) => Math.min(K_MAX, Math.max(K_MIN, k));

type Pos = { x: number; y: number };

function convexHull(points: [number, number][]): [number, number][] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length <= 2) return pts;
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** Smooth padded outline around a set of points: a circle for two, a rounded hull for more. */
function hullPath(points: [number, number][]): string | null {
  if (points.length < 2) return null;
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
  if (points.length === 2) {
    const r = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]) / 2 + HULL_PAD * 0.7;
    return `M${f1(cx - r)} ${f1(cy)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0Z`;
  }
  const hull = convexHull(points).map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    return [x + (dx / d) * HULL_PAD, y + (dy / d) * HULL_PAD] as [number, number];
  });
  if (hull.length < 3) return null;
  const first = hull[0];
  const last = hull[hull.length - 1];
  let d = `M${f1((last[0] + first[0]) / 2)} ${f1((last[1] + first[1]) / 2)}`;
  for (let i = 0; i < hull.length; i++) {
    const p = hull[i];
    const n = hull[(i + 1) % hull.length];
    d += ` Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + n[0]) / 2)} ${f1((p[1] + n[1]) / 2)}`;
  }
  return `${d}Z`;
}

/** Damped settle: overshoots a little, then rests. Exactly 1 at t = 1. */
function settleEase(t: number): number {
  if (t >= 1) return 1;
  return 1 - Math.exp(-5.4 * t) * Math.cos(6.8 * t);
}

/** Seeded scatter the layout settles from. Same ids, same scatter. */
function scatterFrom(nodes: KGNode[], cx: number, cy: number): Map<string, Pos> {
  const out = new Map<string, Pos>();
  for (const n of nodes) {
    const rng = mulberry32(hashString(n.id));
    out.set(n.id, {
      x: cx + (n.x - cx) * 0.18 + (rng() - 0.5) * 120,
      y: cy + (n.y - cy) * 0.18 + (rng() - 0.5) * 120,
    });
  }
  return out;
}

const XO_CHEVRONS: [string, [number, number][]][] = [
  ["var(--ink)", [[37, 166], [118, 247], [31, 335]]],
  ["var(--ink)", [[245, 166], [163, 247], [251, 335]]],
  ["#83d63a", [[328, 165], [247, 247], [334, 334]]],
  ["#83d63a", [[381, 165], [462, 247], [375, 334]]],
];

function GlyphShape({ glyph, x, y, r, color, filled = true }: { glyph: KGGlyph; x: number; y: number; r: number; color: string; filled?: boolean }) {
  const fill = filled ? color : "none";
  const stroke = filled ? undefined : color;
  switch (glyph) {
    case "ring":
      return <circle cx={x} cy={y} r={r * 0.92} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />;
    case "diamond": {
      const s = r * 1.25;
      return <path d={`M${f1(x)} ${f1(y - s)}L${f1(x + s)} ${f1(y)}L${f1(x)} ${f1(y + s)}L${f1(x - s)} ${f1(y)}Z`} fill={fill} stroke={stroke} vectorEffect="non-scaling-stroke" />;
    }
    case "slab": {
      const w = r * 1.55;
      const h = r * 0.95;
      return <rect x={x - w} y={y - h} width={w * 2} height={h * 2} rx={0.6} fill={fill} stroke={stroke} vectorEffect="non-scaling-stroke" />;
    }
    case "stack": {
      const s = r * 0.92;
      const o = r * 0.38;
      return (
        <g>
          <rect x={x - s - o} y={y - s + o} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
          <rect x={x - s + o} y={y - s - o} width={s * 2} height={s * 2} fill={fill} stroke={stroke} vectorEffect="non-scaling-stroke" />
        </g>
      );
    }
    default:
      return <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} vectorEffect="non-scaling-stroke" />;
  }
}

/** Small legend glyph (10px), for use outside the canvas too. */
export function LegendGlyph({ glyph, color = "#b3ada0" }: { glyph: KGGlyph; color?: string }) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true" className="shrink-0">
      <GlyphShape glyph={glyph} x={6} y={5} r={glyph === "slab" ? 3.2 : glyph === "stack" ? 2.8 : 3.6} color={color} />
    </svg>
  );
}

/** Legend row: category swatches, glyph types and ring types (dim items at 72 percent). */
export function GraphLegend({ items, boxed = false, className }: { items: KGLegendItem[]; boxed?: boolean; className?: string }) {
  return (
    <ul
      aria-label="Legend"
      tabIndex={boxed ? 0 : undefined}
      className={cn(
        "flex flex-wrap items-center gap-x-[15px] gap-y-1.5 text-[12px] tracking-[0.02em] text-ink-faint",
        boxed && "scroll-thin max-h-[74px] overflow-y-auto rounded-[10px] border border-hair bg-s1/95 px-3 py-2",
        className,
      )}
    >
      {items.map((it) => (
        <li key={it.label} className={cn("flex items-center gap-1.5", it.dim && "opacity-[0.72]")}>
          {it.swatch ? (
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: it.swatch }} />
          ) : it.glyph ? (
            <LegendGlyph glyph={it.glyph} />
          ) : it.ring ? (
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full border border-ink-faint" />
          ) : it.line ? (
            <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true" className="shrink-0">
              <path d="M1 7 Q8 0 15 7" fill="none" stroke="var(--ink-dim)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          ) : null}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Focus crumb: the focused node, its neighborhood size and a Clear pill. */
export function FocusCrumb({
  name,
  depth,
  count,
  onClear,
  extra,
  className,
}: {
  name: string;
  depth: number;
  count: number;
  onClear?: () => void;
  extra?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-full items-center gap-3 rounded-full border border-hair bg-s2/[0.92] py-[7px] pl-[15px] pr-2 backdrop-blur-[10px]",
        className,
      )}
    >
      <span className="min-w-0 max-w-[200px] truncate text-[14px] text-ink">{name}</span>
      <span className="whitespace-nowrap text-[12px] tracking-[0.02em] text-ink-faint tabular-nums">
        {depth} {depth === 1 ? "hop" : "hops"} · {count} nodes
      </span>
      {extra}
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-hair px-[11px] py-1 text-[11px] uppercase tracking-[0.06em] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

/** "● SETTLING…" status; fades out when the layout rests. */
export function SimStat({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden={!on}
      className={cn(
        "flex items-center gap-[7px] text-[11px] uppercase tracking-[0.06em] text-ink-faint transition-opacity duration-500",
        on ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full bg-blu", on && "animate-pulse")} />
      Settling…
    </span>
  );
}

const SAT_COLOR: Record<TodoStatus, string> = {
  in_progress: "var(--blu)",
  blocked: "var(--org)",
  pending: "var(--ink-dim)",
  completed: "var(--ink-faint)",
  cancelled: "var(--ink-faint)",
};
const SAT_ORDER: Record<TodoStatus, number> = { in_progress: 0, pending: 1, blocked: 2, completed: 3, cancelled: 4 };

/** "1 in progress · 2 pending · 2 completed" */
export function satelliteTally(items: KGSatellite[]): string {
  const by = new Map<TodoStatus, number>();
  for (const s of items) by.set(s.status, (by.get(s.status) ?? 0) + 1);
  return (Object.keys(SAT_ORDER) as TodoStatus[])
    .filter((s) => by.get(s))
    .map((s) => `${by.get(s)} ${s.replace("_", " ")}`)
    .join(" · ");
}

/* ----------------------------------------------------------------------------- component */

type Cam = { x: number; y: number; k: number };

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function KnowledgeGraph({
  nodes,
  edges,
  hulls = [],
  satellites,
  legend,
  hint,
  ariaLabel,
  defaultFocusId = null,
  defaultZoom = 1,
  defaultClosed = [],
  settleProgress,
  leafLabels = "auto",
  focusDepth = 2,
  compact = false,
  className,
}: KnowledgeGraphProps) {
  const uid = useId();
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const initialFocus = defaultFocusId ? byId.get(defaultFocusId) : undefined;
  /* the camera frames the content, not the whole layout box */
  const B = useMemo(() => {
    const xs = nodes.map((n) => [n.x - n.r, n.x + n.r]).flat();
    const ys = nodes.map((n) => [n.y - n.r, n.y + n.r]).flat();
    // labels sit above nodes and counts below hubs, so the frame pads more at the top
    const x0 = Math.min(...xs) - 60;
    const x1 = Math.max(...xs) + 60;
    const y0 = Math.min(...ys) - 64;
    const y1 = Math.max(...ys) + (legend?.length && !compact ? 84 : 52);
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
  }, [nodes, legend, compact]);
  const focusZoom = (n: KGNode) => clampK((n.type === "leaf" ? 1.7 : 1.3) * (compact ? 1.35 : 1));

  const [cam, setCam] = useState<Cam>(() =>
    initialFocus ? { x: initialFocus.x, y: initialFocus.y, k: focusZoom(initialFocus) } : { x: B.x, y: B.y, k: defaultZoom },
  );
  const [focusId, setFocusId] = useState<string | null>(defaultFocusId);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [satHover, setSatHover] = useState<string | null>(null);
  const [closed, setClosed] = useState<Set<string>>(() => new Set(defaultClosed));
  const [settle, setSettle] = useState<number>(settleProgress ?? 1);
  const [size, setSize] = useState({ w: 900, h: 520 });
  const [kbdId, setKbdId] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const camRaf = useRef<number | null>(null);
  const settleRaf = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null);
  const camRef = useRef(cam);
  useEffect(() => {
    camRef.current = cam;
  }, [cam]);

  /* measure the canvas so labels stay a constant screen size */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* pinch or modifier-wheel zooms; plain wheel keeps scrolling the page */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setCam((c) => ({ ...c, k: clampK(c.k * Math.exp(-e.deltaY * 0.0022)) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(
    () => () => {
      if (camRaf.current) cancelAnimationFrame(camRaf.current);
      if (settleRaf.current) cancelAnimationFrame(settleRaf.current);
    },
    [],
  );

  const tweenCam = useCallback((to: Cam) => {
    if (camRaf.current) cancelAnimationFrame(camRaf.current);
    if (reduced()) {
      setCam(to);
      return;
    }
    const from = camRef.current;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 520);
      const e = 1 - Math.pow(1 - t, 3);
      setCam({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, k: from.k + (to.k - from.k) * e });
      if (t < 1) camRaf.current = requestAnimationFrame(step);
      else camRaf.current = null;
    };
    camRaf.current = requestAnimationFrame(step);
  }, []);

  const replaySettle = useCallback(() => {
    if (settleRaf.current) cancelAnimationFrame(settleRaf.current);
    if (reduced()) {
      setSettle(1);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1900);
      setSettle(t);
      if (t < 1) settleRaf.current = requestAnimationFrame(step);
      else settleRaf.current = null;
    };
    setSettle(0);
    settleRaf.current = requestAnimationFrame(step);
  }, []);

  /* ------------------------------------------------------------ derived graph state */

  const visible = useMemo(() => nodes.filter((n) => !(n.cluster && closed.has(n.cluster))), [nodes, closed]);
  const visibleIds = useMemo(() => new Set(visible.map((n) => n.id)), [visible]);
  const shownEdges = useMemo(
    () => edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [edges, visibleIds],
  );
  const clusterSize = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of nodes) if (n.cluster) m.set(n.cluster, (m.get(n.cluster) ?? 0) + 1);
    return m;
  }, [nodes]);

  const scatter = useMemo(() => scatterFrom(nodes, B.x, B.y), [nodes, B]);
  const settling = settle < 1;
  const e = settleEase(settle);
  const pos = (n: KGNode): Pos => {
    if (!settling) return { x: n.x, y: n.y };
    const s = scatter.get(n.id) ?? { x: n.x, y: n.y };
    return { x: s.x + (n.x - s.x) * e, y: s.y + (n.y - s.y) * e };
  };
  const P = new Map(visible.map((n) => [n.id, pos(n)]));

  const adjacency = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e2 of shownEdges) {
      m.set(e2.source, [...(m.get(e2.source) ?? []), e2.target]);
      m.set(e2.target, [...(m.get(e2.target) ?? []), e2.source]);
    }
    return m;
  }, [shownEdges]);

  const focusSet = useMemo(() => {
    if (!focusId || !visibleIds.has(focusId)) return null;
    const set = new Set([focusId]);
    let frontier = [focusId];
    for (let d = 0; d < focusDepth; d++) {
      const next: string[] = [];
      for (const u of frontier) for (const v of adjacency.get(u) ?? []) if (!set.has(v)) {
        set.add(v);
        next.push(v);
      }
      frontier = next;
    }
    return set;
  }, [focusId, visibleIds, adjacency, focusDepth]);

  /* keyboard order: root, hubs, groups, then leaves, each swept clockwise from 12 o'clock */
  const navOrder = useMemo(() => {
    const rank: Record<KGNodeType, number> = { root: 0, hub: 1, group: 2, leaf: 3 };
    const ang = (n: KGNode) => (Math.atan2(n.y - B.y, n.x - B.x) + Math.PI * 2.5) % (Math.PI * 2);
    return [...visible].sort((a, b) => rank[a.type] - rank[b.type] || ang(a) - ang(b)).map((n) => n.id);
  }, [visible, B]);
  const tabStop = kbdId && visibleIds.has(kbdId) ? kbdId : navOrder[0];

  /* camera -> viewBox, and the screen scale that keeps text and hit areas constant */
  const vw = B.w / cam.k;
  const vh = B.h / cam.k;
  const scale = Math.min(size.w / vw, size.h / vh);
  const px = (n: number) => n / scale;
  /* text shrinks a little on small canvases so labels crowd less */
  const tScale = Math.min(1, Math.max(0.78, scale * 1.6));
  const tx = (n: number) => (n * tScale) / scale;
  const vb = `${f1(cam.x - vw / 2)} ${f1(cam.y - vh / 2)} ${f1(vw)} ${f1(vh)}`;

  /* ------------------------------------------------------------ actions */

  const focusNode = useCallback(
    (id: string) => {
      const n = byId.get(id);
      if (!n) return;
      setFocusId(id);
      const k = Math.max(camRef.current.k, clampK((n.type === "leaf" ? 1.7 : 1.3) * (compact ? 1.35 : 1)));
      tweenCam({ x: n.x, y: n.y, k });
    },
    [byId, tweenCam, compact],
  );
  const clearFocus = useCallback(() => {
    setFocusId(null);
    tweenCam({ x: B.x, y: B.y, k: defaultZoom });
  }, [tweenCam, B, defaultZoom]);
  const toggleCluster = useCallback((id: string) => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const zoomBy = (f: number) => tweenCam({ ...camRef.current, k: clampK(camRef.current.k * f) });
  const resetView = () => tweenCam({ x: B.x, y: B.y, k: defaultZoom });

  const focusDom = (id: string) => {
    const el = svgRef.current?.querySelector<SVGGElement>(`[data-kg-node="${CSS.escape(id)}"]`);
    el?.focus();
  };

  const onNodeKey = (ev: KeyboardEvent<SVGGElement>, id: string) => {
    const i = navOrder.indexOf(id);
    let next: string | undefined;
    switch (ev.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = navOrder[(i + 1) % navOrder.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = navOrder[(i - 1 + navOrder.length) % navOrder.length];
        break;
      case "Home":
        next = navOrder[0];
        break;
      case "End":
        next = navOrder[navOrder.length - 1];
        break;
      case "Enter":
      case " ":
        ev.preventDefault();
        if (focusId === id && byId.get(id)?.type === "group") toggleCluster(id);
        else focusNode(id);
        return;
      case "+":
      case "=":
        ev.preventDefault();
        zoomBy(1.25);
        return;
      case "-":
      case "_":
        ev.preventDefault();
        zoomBy(0.8);
        return;
      default:
        return;
    }
    ev.preventDefault();
    if (next) {
      setKbdId(next);
      focusDom(next);
    }
  };

  /* drag on the background pans; a click on the background clears the focus */
  const onPointerDown = (ev: ReactPointerEvent<SVGSVGElement>) => {
    if (ev.button !== 0) return;
    if ((ev.target as Element).closest("[data-kg-node]")) return;
    drag.current = { x: ev.clientX, y: ev.clientY, moved: false, id: ev.pointerId };
  };
  const onPointerMove = (ev: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = ev.clientX - d.x;
    const dy = ev.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) <= 4) return;
      d.moved = true;
      setPanning(true);
      ev.currentTarget.setPointerCapture(d.id);
    }
    d.x = ev.clientX;
    d.y = ev.clientY;
    if (camRaf.current) cancelAnimationFrame(camRaf.current);
    setCam((c) => ({
      k: c.k,
      x: Math.min(B.x + B.w / 2, Math.max(B.x - B.w / 2, c.x - dx / scale)),
      y: Math.min(B.y + B.h / 2, Math.max(B.y - B.h / 2, c.y - dy / scale)),
    }));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setPanning(false);
    if (d && !d.moved && focusId) clearFocus();
  };

  /* ------------------------------------------------------------ render pieces */

  /* satellites belong to the focused project; sizes are in screen pixels so they stay legible */
  const satGroup = focusId ? satellites?.find((g) => g.hostId === focusId) : undefined;
  const showSats = !!satGroup && !!focusSet && cam.k >= SAT_MIN_K && P.has(satGroup.hostId);
  const satHost = satGroup ? byId.get(satGroup.hostId) : undefined;
  const satHostPos = satGroup ? P.get(satGroup.hostId) : undefined;
  const sats = useMemo(() => {
    if (!satGroup) return [];
    return [...satGroup.items]
      .sort((a, b) => SAT_ORDER[a.status] - SAT_ORDER[b.status] || a.label.localeCompare(b.label))
      .map((s, i) => {
        const shell = i < 8 ? 0 : 1;
        const slot = shell === 0 ? i : i - 8;
        const cap = shell === 0 ? 8 : 12;
        return { ...s, shell, angle: (slot / cap) * Math.PI * 2 - Math.PI / 2 + shell * 0.31 };
      });
  }, [satGroup]);
  const orbitR = (shell: number) => (satHost?.r ?? 0) + px(16) + shell * px(11);
  const satR = (status: TodoStatus) => px(status === "in_progress" ? 4.4 : status === "blocked" ? 4 : status === "pending" ? 3.6 : 3);

  const hullPaths = hulls
    .map((h) => {
      const pts = visible.filter((n) => n.hull === h.id).map((n) => {
        const p = P.get(n.id) as Pos;
        return [p.x, p.y] as [number, number];
      });
      return { ...h, d: hullPath(pts) };
    })
    .filter((h) => h.d);

  const nodeAlpha = (n: KGNode) => (focusSet ? (focusSet.has(n.id) ? 1 : 0.14) : n.dim ? 0.72 : 1);
  const labelOn = (n: KGNode) => {
    if (focusSet && !focusSet.has(n.id)) return false;
    if (n.type === "hub" || n.type === "root") return true;
    if (n.id === hoverId || n.id === focusId || n.id === kbdId) return true;
    if (n.type === "group") return scale > 0.42 || !!focusSet;
    if (leafLabels === "always" && scale > 0.55) return true;
    return scale > 1.4 || (!!focusSet && focusSet.has(n.id));
  };
  const trunc = (s: string, max = 26) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

  const hovered = hoverId ? byId.get(hoverId) : kbdId ? byId.get(kbdId) : undefined;
  const focused = focusId ? byId.get(focusId) : undefined;
  const liveMsg =
    focused && focusSet
      ? `Focused ${focused.label}: ${focusDepth} hops, ${focusSet.size} nodes.${satGroup ? ` ${satGroup.items.length} ${satGroup.items.length === 1 ? "step" : "steps"}: ${satelliteTally(satGroup.items)}.` : ""}`
      : "";

  const textProps = (fs: number, weight = 500) => ({
    fontSize: tx(fs),
    fontWeight: weight,
    stroke: "#050506",
    strokeWidth: px(3.5),
    strokeOpacity: 0.88,
    strokeLinejoin: "round" as const,
    paintOrder: "stroke" as const,
    textAnchor: "middle" as const,
  });

  return (
    // Escape clears the focus from anywhere in the graph, its crumb and its controls
    <div
      className="@container relative min-w-0"
      onKeyDown={(ev) => {
        if (ev.key === "Escape" && focusId) {
          ev.preventDefault();
          clearFocus();
        }
      }}
    >
      <div
        ref={wrapRef}
        className={cn(
          "relative overflow-hidden rounded-[14px] border border-hair-soft bg-[#060607]",
          className ?? "h-[380px] @min-[640px]:h-[520px]",
        )}
      >
        <div aria-hidden="true" className="dots pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 74% 30%, color-mix(in srgb, var(--blu) 7%, transparent), transparent 70%), radial-gradient(50% 50% at 18% 82%, rgba(255,255,255,0.035), transparent 70%)",
          }}
        />
        <svg
          ref={svgRef}
          viewBox={vb}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label={ariaLabel}
          aria-describedby={`${uid}-help`}
          className={cn("relative block size-full touch-none select-none", panning ? "cursor-grabbing" : "cursor-grab")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* hulls */}
          {hullPaths.map((h) => (
            <path
              key={h.id}
              d={h.d as string}
              fill={h.color}
              fillOpacity={focusSet ? 0.02 : 0.055}
              stroke={h.color}
              strokeOpacity={focusSet ? 0.12 : 0.34}
              strokeWidth={1.2}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
              style={{ transition: "fill-opacity 200ms, stroke-opacity 200ms" }}
            />
          ))}

          {/* edges */}
          {shownEdges.map((ed) => {
            const a = P.get(ed.source) as Pos;
            const b = P.get(ed.target) as Pos;
            let alpha: number;
            let width: number;
            let color = "var(--ink)";
            if (focusSet) {
              const inA = focusSet.has(ed.source);
              const inB = focusSet.has(ed.target);
              const lit = (ed.source === focusId || ed.target === focusId) && inA && inB;
              if (lit) {
                alpha = 0.7;
                width = 1.5;
                color = "var(--blu)";
              } else if (inA && inB) {
                alpha = 0.26;
                width = 1;
              } else {
                alpha = 0.03;
                width = 0.8;
              }
            } else {
              alpha = ed.kind === "x" ? 0.26 : ed.kind === "root" ? 0.13 : 0.2;
              width = ed.kind === "x" ? 1.1 : 0.9;
            }
            let d: string;
            if (ed.kind === "x") {
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy) || 1;
              const mx = (a.x + b.x) / 2 - (dy / dist) * dist * 0.13;
              const my = (a.y + b.y) / 2 + (dx / dist) * dist * 0.13;
              d = `M${f1(a.x)} ${f1(a.y)} Q${f1(mx)} ${f1(my)} ${f1(b.x)} ${f1(b.y)}`;
            } else d = `M${f1(a.x)} ${f1(a.y)} L${f1(b.x)} ${f1(b.y)}`;
            return (
              <path
                key={`${ed.source}->${ed.target}`}
                d={d}
                fill="none"
                stroke={color}
                strokeOpacity={alpha}
                strokeWidth={width}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* satellite orbits and spokes */}
          {showSats && satHost && satHostPos ? (
            <g aria-hidden="true">
              {[...new Set(sats.map((s) => s.shell))].map((shell) => (
                <circle
                  key={shell}
                  cx={satHostPos.x}
                  cy={satHostPos.y}
                  r={orbitR(shell)}
                  fill="none"
                  stroke={satHost.color}
                  strokeOpacity={0.16}
                  strokeWidth={0.8}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {sats
                .filter((s) => s.status === "in_progress")
                .map((s) => {
                  const rr = orbitR(s.shell);
                  return (
                    <line
                      key={`spoke-${s.id}`}
                      x1={satHostPos.x + Math.cos(s.angle) * (satHost.r + 3)}
                      y1={satHostPos.y + Math.sin(s.angle) * (satHost.r + 3)}
                      x2={satHostPos.x + Math.cos(s.angle) * rr}
                      y2={satHostPos.y + Math.sin(s.angle) * rr}
                      stroke="var(--blu)"
                      strokeOpacity={0.4}
                      strokeWidth={0.9}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
            </g>
          ) : null}

          {/* nodes */}
          {visible.map((n) => {
            const p = P.get(n.id) as Pos;
            const a = nodeAlpha(n);
            const isFocus = n.id === focusId;
            const isHover = n.id === hoverId || n.id === kbdId;
            const label =
              n.type === "group"
                ? `${n.label}, folder cluster, ${closed.has(n.id) ? "closed" : "open"}`
                : [n.kicker, n.label, ...(n.detail ?? [])].filter(Boolean).join(", ");
            return (
              <g
                key={n.id}
                data-kg-node={n.id}
                role="button"
                tabIndex={n.id === tabStop ? 0 : -1}
                aria-label={label}
                aria-pressed={isFocus}
                opacity={a}
                className="cursor-pointer outline-none"
                style={{ transition: "opacity 220ms var(--ease)" }}
                onClick={() => focusNode(n.id)}
                onDoubleClick={() => n.type === "group" && toggleCluster(n.id)}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                onFocus={() => setKbdId(n.id)}
                onBlur={() => setKbdId((k) => (k === n.id ? null : k))}
                onKeyDown={(ev) => onNodeKey(ev, n.id)}
              >
                <circle cx={p.x} cy={p.y} r={Math.max(n.r + 3, px(11))} fill="transparent" />
                {n.type === "root" ? (
                  <g strokeLinejoin="miter" strokeLinecap="butt" fill="none">
                    <circle cx={p.x} cy={p.y} r={24} fill="#050506" stroke="var(--hair-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    {XO_CHEVRONS.map(([col, pts], i) => (
                      <polyline
                        key={i}
                        points={pts.map(([x, y]) => `${f1(p.x + (x - 246.5) * 0.068)},${f1(p.y + (y - 250) * 0.068)}`).join(" ")}
                        stroke={col}
                        strokeWidth={2.2}
                      />
                    ))}
                  </g>
                ) : n.type === "hub" ? (
                  <g>
                    <circle cx={p.x} cy={p.y} r={n.r} fill={n.color} fillOpacity={0.13} stroke={n.color} strokeOpacity={0.9} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                    <circle cx={p.x} cy={p.y} r={2.6} fill={n.color} />
                  </g>
                ) : n.type === "group" ? (
                  <g>
                    <circle cx={p.x} cy={p.y} r={n.r} fill={n.color} fillOpacity={0.22} stroke={n.color} strokeOpacity={0.8} strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
                    {closed.has(n.id) ? (
                      <circle cx={p.x} cy={p.y} r={n.r + 3.2} fill="none" stroke={n.color} strokeOpacity={0.45} strokeWidth={0.9} strokeDasharray="2.4 3.2" vectorEffect="non-scaling-stroke" />
                    ) : null}
                  </g>
                ) : (
                  <GlyphShape glyph={n.glyph ?? "disc"} x={p.x} y={p.y} r={n.r * (isHover || isFocus ? 1.4 : 1)} color={n.color} />
                )}
                {isFocus && n.type !== "root" ? (
                  <circle cx={p.x} cy={p.y} r={n.r * (n.type === "leaf" ? 1.4 : 1) + px(4)} fill="none" stroke="var(--blu)" strokeOpacity={0.85} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                ) : isHover ? (
                  <circle cx={p.x} cy={p.y} r={n.r * (n.type === "leaf" ? 1.4 : 1) + px(3.5)} fill="none" stroke="var(--ink)" strokeOpacity={0.85} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                ) : null}
              </g>
            );
          })}

          {/* satellites */}
          {showSats && satHost && satHostPos ? (
            <g>
              {sats.map((s) => {
                const rr = orbitR(s.shell);
                const x = satHostPos.x + Math.cos(s.angle) * rr;
                const y = satHostPos.y + Math.sin(s.angle) * rr;
                const r = satR(s.status);
                const done = s.status === "completed" || s.status === "cancelled";
                const on = satHover === s.id;
                return (
                  <g key={s.id} onMouseEnter={() => setSatHover(s.id)} onMouseLeave={() => setSatHover(null)}>
                    <title>{`${s.label} · ${s.status.replace("_", " ")}`}</title>
                    {s.status === "in_progress" ? (
                      <circle cx={x} cy={y} r={r + px(3)} fill="var(--blu)" fillOpacity={0.18} className="animate-pulse" />
                    ) : null}
                    <circle
                      cx={x}
                      cy={y}
                      r={r + (on ? px(1.2) : 0)}
                      fill={s.status === "pending" ? "#050506" : SAT_COLOR[s.status]}
                      fillOpacity={done ? 0.45 : 1}
                      stroke={s.status === "pending" ? SAT_COLOR.pending : "none"}
                      strokeWidth={1.2}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={x} cy={y} r={Math.max(r + 3, px(8))} fill="transparent" />
                  </g>
                );
              })}
            </g>
          ) : null}

          {/* labels */}
          <g pointerEvents="none">
            {visible.map((n) => {
              if (!labelOn(n)) return null;
              const p = P.get(n.id) as Pos;
              const a = focusSet ? (focusSet.has(n.id) ? 1 : 0) : n.dim ? 0.8 : 1;
              // a project with its steps showing keeps its name above the orbit
              const orbiting = showSats && n.id === satGroup?.hostId;
              const rScreen =
                n.type === "root"
                  ? 24
                  : orbiting
                    ? orbitR(Math.max(...sats.map((s) => s.shell))) + px(3)
                    : n.r * (n.type === "leaf" && (n.id === hoverId || n.id === focusId) ? 1.4 : 1);
              if (n.type === "hub") {
                return (
                  <g key={`l-${n.id}`} opacity={a}>
                    <text x={p.x} y={p.y - rScreen - px(11)} fill="var(--ink)" {...textProps(16)}>
                      {n.label}
                    </text>
                    {n.countLabel ? (
                      <text
                        x={p.x}
                        y={p.y + rScreen + px(16)}
                        fill="var(--ink-faint)"
                        letterSpacing={px(0.7)}
                        {...textProps(10.5)}
                      >
                        {n.countLabel.toUpperCase()}
                      </text>
                    ) : null}
                  </g>
                );
              }
              if (n.type === "root") {
                return n.label ? (
                  <text key={`l-${n.id}`} x={p.x} y={p.y + 24 + px(16)} fill="var(--ink-dim)" letterSpacing={px(0.6)} {...textProps(10.5)}>
                    {n.label.toUpperCase()}
                  </text>
                ) : null;
              }
              if (n.type === "group") {
                const t = (n.label.split("/").pop() ?? n.label).toUpperCase() + (closed.has(n.id) ? ` +${clusterSize.get(n.id) ?? 0}` : "");
                // the label sits on the inward side: the cluster's leaves fan outward
                const dx = B.x - p.x;
                const dy = B.y - p.y;
                const dl = Math.hypot(dx, dy) || 1;
                const off = n.r + px(13);
                return (
                  <text
                    key={`l-${n.id}`}
                    x={p.x + (dx / dl) * off}
                    y={p.y + (dy / dl) * off + px(3.5)}
                    fill="var(--ink-dim)"
                    letterSpacing={px(0.6)}
                    opacity={a}
                    {...textProps(10.5)}
                  >
                    {t}
                  </text>
                );
              }
              const on = n.id === hoverId || n.id === focusId || n.id === kbdId;
              return (
                <text
                  key={`l-${n.id}`}
                  x={p.x}
                  y={p.y - rScreen - px(7)}
                  fill={on ? "var(--ink)" : "var(--ink-dim)"}
                  opacity={a}
                  {...textProps(11, 400)}
                >
                  {trunc(n.label)}
                </text>
              );
            })}
            {showSats && satHost && satHostPos && satGroup ? (
              <text
                x={satHostPos.x}
                y={satHostPos.y + orbitR(Math.max(...sats.map((s) => s.shell))) + px(19)}
                fill="var(--blu)"
                letterSpacing={px(0.7)}
                {...textProps(10.5)}
              >
                {`${satGroup.items.length} ${satGroup.items.length === 1 ? "STEP" : "STEPS"}`}
              </text>
            ) : null}
            {showSats && satHost && satHostPos && satHover
              ? (() => {
                  const s = sats.find((x) => x.id === satHover);
                  if (!s) return null;
                  const rr = orbitR(s.shell);
                  return (
                    <text
                      x={satHostPos.x + Math.cos(s.angle) * rr}
                      y={satHostPos.y + Math.sin(s.angle) * rr - px(9)}
                      fill="var(--ink)"
                      {...textProps(11, 400)}
                    >
                      {trunc(s.label, 44)}
                    </text>
                  );
                })()
              : null}
          </g>
        </svg>

        {/* overlays */}
        {hint && !compact ? (
          <p className="pointer-events-none absolute left-[18px] top-4 hidden max-w-[300px] text-[12px] leading-[1.65] text-ink-faint @min-[760px]:block">
            {hint}
          </p>
        ) : null}

        {hovered && !(focused && hovered.id === focused.id) ? (
          <div
            className={cn(
              "pointer-events-none absolute left-[18px] hidden w-[248px] overflow-hidden rounded-[12px] border border-hair bg-[#0b0b0d]/[0.96] shadow-[0_22px_50px_rgba(0,0,0,0.66)] backdrop-blur-[16px] @min-[640px]:block",
              hint && !compact ? "top-[92px]" : "top-4",
            )}
          >
            <div
              className="px-4 pb-3 pt-3.5"
              style={{ background: `linear-gradient(155deg, color-mix(in srgb, ${hovered.color} 24%, transparent), color-mix(in srgb, ${hovered.color} 3%, transparent) 68%)` }}
            >
              <p className="text-[11px] uppercase tracking-[0.06em] text-ink-dim">
                {hovered.kicker ?? (hovered.type === "hub" ? "Hub" : hovered.type === "group" ? "Cluster" : hovered.type === "root" ? "The center" : "Node")}
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-tight text-ink">{hovered.label}</p>
            </div>
            {hovered.detail?.length ? (
              <ul className="space-y-1 px-4 py-2.5 text-[12px] text-ink-dim">
                {hovered.detail.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
            <p className="border-t border-hair-soft px-4 py-1.5 text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
              {hovered.type === "group" ? "Click to focus · Double-click to open or close" : "Click to focus"}
            </p>
          </div>
        ) : null}

        {focused && focusSet ? (
          <div className="absolute right-3 top-3 max-w-[calc(100%-24px)] @min-[640px]:right-[18px] @min-[640px]:top-4">
            <FocusCrumb
              name={focused.label}
              depth={focusDepth}
              count={focusSet.size}
              onClear={clearFocus}
              extra={
                focused.type === "group" ? (
                  <button
                    type="button"
                    onClick={() => toggleCluster(focused.id)}
                    className="whitespace-nowrap rounded-full border border-hair px-[11px] py-1 text-[11px] uppercase tracking-[0.06em] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
                  >
                    {closed.has(focused.id) ? "Open cluster" : "Close cluster"}
                  </button>
                ) : null
              }
            />
          </div>
        ) : null}

        {legend?.length ? (
          <div className="pointer-events-none absolute bottom-4 left-[18px] right-[150px] hidden @min-[640px]:block">
            <GraphLegend items={legend} className="pointer-events-auto max-h-[96px] overflow-hidden" />
          </div>
        ) : null}

        <div className="absolute bottom-3 right-3 flex items-center gap-3 @min-[640px]:bottom-4 @min-[640px]:right-[18px]">
          <SimStat on={settling} />
          <div className="flex items-center gap-1 rounded-[10px] border border-hair bg-s1/90 p-0.5 backdrop-blur">
            <IconButton aria-label="Zoom out" size="xs" onClick={() => zoomBy(0.8)} disabled={cam.k <= K_MIN + 0.001}>
              <Minus />
            </IconButton>
            <span className="w-9 text-center font-mono text-[10px] tabular-nums text-ink-faint" aria-hidden="true">
              {Math.round(cam.k * 100)}%
            </span>
            <IconButton aria-label="Zoom in" size="xs" onClick={() => zoomBy(1.25)} disabled={cam.k >= K_MAX - 0.001}>
              <Plus />
            </IconButton>
            <IconButton aria-label="Reset view" size="xs" onClick={resetView}>
              <Scan />
            </IconButton>
            {!compact ? (
              <IconButton aria-label="Re-run layout" size="xs" onClick={replaySettle}>
                <RotateCcw />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>

      {/* narrow screens: details and legend sit under the canvas */}
      <div className="mt-2.5 space-y-2 @min-[640px]:hidden">
        {hovered || focused ? (
          <p className="truncate text-[12px] text-ink-dim">
            <span className="text-ink">{(hovered ?? focused)?.label}</span>
            {(hovered ?? focused)?.detail?.[0] ? ` · ${(hovered ?? focused)?.detail?.[0]}` : null}
          </p>
        ) : null}
        {legend?.length ? <GraphLegend items={legend} boxed /> : null}
      </div>

      <p id={`${uid}-help`} className="sr-only">
        Arrow keys move between nodes. Enter focuses a node and its neighborhood. Escape clears the focus. Plus and minus zoom.
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {liveMsg}
      </p>
    </div>
  );
}
