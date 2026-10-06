"use client";

// Sequence and decision diagrams for gateway and runtime flows. SequenceDiagram draws
// participant heads, dashed lifelines and numbered message arrows (dashed for returns);
// hover a step or an arrow to light it, or focus the diagram and step with the arrow keys.
// DecisionTree lays out diamonds and results top-down and traces a request's path.
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Segmented } from "@/components/ui/segmented";
import { Kbd } from "@/components/ui/kbd";
import type { Tone } from "@/components/ui/tones";
import { Diagram, DiagramScroller, layoutTree, monoWidth, type DiagramEdge, type DiagramNode, type DiagramNodeShape } from "./diagram";

/* ============================================================================ sequence */

export type SeqParticipant = { id: string; label: string; sub?: string };
export type SeqMessage = {
  from: string;
  to: string;
  /** full wording, shown in the step list */
  label: string;
  /** short arrow label; falls back to label */
  short?: string;
  /** a reply or a side channel: dashed */
  reply?: boolean;
};

export type SequenceDiagramProps = {
  participants: SeqParticipant[];
  messages: SeqMessage[];
  ariaLabel: string;
  /** step highlighted at first (0-based) */
  defaultActive?: number | null;
  /** no hover or keyboard stepping, no step list */
  static?: boolean;
  colWidth?: number;
  className?: string;
};

const ROW = 40;
const HEAD_H = 46;
const TOP = HEAD_H + 30;

export function SequenceDiagram({
  participants,
  messages,
  ariaLabel,
  defaultActive = null,
  static: isStatic = false,
  colWidth = 210,
  className,
}: SequenceDiagramProps) {
  const uid = useId();
  const [pinned, setPinned] = useState<number | null>(defaultActive);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? pinned;
  const col = new Map(participants.map((p, i) => [p.id, 20 + colWidth / 2 + i * colWidth]));
  const labelOf = new Map(participants.map((p) => [p.id, p.label]));
  const width = 40 + participants.length * colWidth;
  const bottom = TOP + messages.length * ROW + 6;
  const height = bottom + HEAD_H + 10;

  const step = (to: number | null) => {
    setHover(null);
    setPinned(to);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isStatic) return;
    const n = messages.length;
    const cur = pinned ?? -1;
    let next: number | null | undefined;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(n - 1, cur + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, cur <= 0 ? 0 : cur - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    step(next);
  };

  const head = (y: number) =>
    participants.map((p) => {
      const x = col.get(p.id) as number;
      const w = colWidth - 34;
      return (
        <g key={`${p.id}-${y}`}>
          <rect x={x - w / 2} y={y} width={w} height={HEAD_H} rx={9} fill="var(--s2)" stroke="var(--hair-strong)" />
          <text x={x} y={y + (p.sub ? 20 : 27)} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--ink)">
            {p.label}
          </text>
          {p.sub ? (
            <text x={x} y={y + 35} textAnchor="middle" fontSize={10} className="font-mono" fill="var(--ink-faint)">
              {p.sub}
            </text>
          ) : null}
        </g>
      );
    });

  const current = active !== null ? messages[active] : null;

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <div
        role="group"
        aria-label={`${ariaLabel}${isStatic ? "" : ", use the arrow keys to step through"}`}
        aria-describedby={isStatic ? undefined : `${uid}-now`}
        tabIndex={isStatic ? undefined : 0}
        onKeyDown={onKey}
        className="scroll-thin overflow-x-auto rounded-[14px] border border-hair-soft bg-[#08080a] focus-visible:outline-offset-[-2px]"
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block" aria-hidden="true" focusable="false">
          {head(10)}
          {participants.map((p) => {
            const x = col.get(p.id) as number;
            return <line key={`life-${p.id}`} x1={x} y1={10 + HEAD_H} x2={x} y2={bottom} stroke="var(--hair-strong)" strokeDasharray="3 4" />;
          })}
          {head(bottom)}
          {messages.map((m, i) => {
            const y = TOP + i * ROW + 22;
            const x1 = col.get(m.from) as number;
            const x2 = col.get(m.to) as number;
            const on = active === i;
            const dim = active !== null && !on;
            const color = on ? "var(--blu)" : m.reply ? "var(--ink-faint)" : "var(--ink-dim)";
            const text = m.short ?? m.label;
            const self = x1 === x2;
            const dir = x2 >= x1 ? 1 : -1;
            const avail = self ? colWidth - 70 : Math.abs(x2 - x1) - 44;
            const max = Math.max(8, Math.floor(avail / 6.1));
            const shown = text.length > max ? `${text.slice(0, max - 1)}…` : text;
            const path = self ? `M${x1} ${y - 6} h30 v14 h-26` : `M${x1 + dir * 2} ${y} H${x2 - dir * 8}`;
            const tip = self ? `${x1 + 4},${y + 8} ${x1 + 11},${y + 4.5} ${x1 + 11},${y + 11.5}` : `${x2},${y} ${x2 - dir * 8},${y - 4} ${x2 - dir * 8},${y + 4}`;
            const lx = self ? x1 + 40 : (x1 + x2) / 2;
            return (
              <g
                key={i}
                opacity={dim ? 0.38 : 1}
                style={{ transition: "opacity 160ms var(--ease)" }}
                onMouseEnter={isStatic ? undefined : () => setHover(i)}
                onMouseLeave={isStatic ? undefined : () => setHover(null)}
                onClick={isStatic ? undefined : () => step(pinned === i ? null : i)}
                className={isStatic ? undefined : "cursor-pointer"}
              >
                <title>{`${i + 1}. ${labelOf.get(m.from)} to ${labelOf.get(m.to)}: ${m.label}`}</title>
                <path d={path} fill="none" stroke="transparent" strokeWidth={14} />
                <path d={path} fill="none" stroke={color} strokeWidth={on ? 1.8 : 1.2} strokeDasharray={m.reply ? "5 4" : undefined} />
                <polygon points={tip} fill={color} />
                <circle cx={self ? x1 - 12 : x1 + dir * 14} cy={y} r={8} fill={on ? "var(--blu)" : "var(--s3)"} stroke={on ? "none" : "var(--hair-strong)"} />
                <text
                  x={self ? x1 - 12 : x1 + dir * 14}
                  y={y + 3.3}
                  textAnchor="middle"
                  fontSize={9}
                  className="font-mono"
                  fill={on ? "#04111f" : "var(--ink-dim)"}
                  fontWeight={600}
                >
                  {i + 1}
                </text>
                <text
                  x={self ? lx : lx + dir * 8}
                  y={self ? y + 4 : y - 7}
                  textAnchor={self ? "start" : "middle"}
                  fontSize={10.5}
                  className="font-mono"
                  fill={on ? "var(--ink)" : "var(--ink-dim)"}
                >
                  {shown}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {!isStatic ? (
        <>
          <p id={`${uid}-now`} aria-live="polite" className="flex min-h-[20px] flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-dim">
            {current && active !== null ? (
              <>
                <span className="font-mono text-[11px] tabular-nums text-blu">
                  {String(active + 1).padStart(2, "0")} / {String(messages.length).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11.5px] text-ink">
                  {labelOf.get(current.from)} → {labelOf.get(current.to)}
                </span>
                <span>{current.label}</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-ink-faint">
                Hover a step, or focus the diagram and press <Kbd size="xs">down</Kbd> to step through
              </span>
            )}
          </p>
          <ol className="grid gap-x-6 gap-y-0.5 md:grid-cols-2" aria-label="Steps">
            {messages.map((m, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={active === i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => step(pinned === i ? null : i)}
                  className={cn(
                    "grid w-full grid-cols-[22px_minmax(0,1fr)] items-baseline gap-2 rounded-[7px] px-2 py-1 text-left text-[12px] transition-colors",
                    active === i ? "bg-blu/[0.08] text-ink" : "text-ink-dim hover:bg-s2",
                  )}
                >
                  <span className={cn("font-mono text-[10.5px] tabular-nums", active === i ? "text-blu" : "text-ink-faint")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="font-mono text-[11px] text-ink-faint">
                      {labelOf.get(m.from)} {m.reply ? "⇢" : "→"} {labelOf.get(m.to)}
                    </span>{" "}
                    {m.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  );
}

/* ============================================================================ decision tree */

export type DecisionNode = {
  id: string;
  label: string;
  /** start: the input; decision: a diamond; step: a plain box; result: an outcome */
  kind: "start" | "decision" | "step" | "result";
  tone?: Tone;
  w?: number;
  h?: number;
  mono?: boolean;
};
export type DecisionEdge = { from: string; to: string; label?: string };
export type DecisionTrace = { id: string; label: string; path: string[] };

export type DecisionTreeProps = {
  nodes: DecisionNode[];
  edges: DecisionEdge[];
  root: string;
  traces?: DecisionTrace[];
  defaultTrace?: string | null;
  ariaLabel: string;
  description: string;
  nodeWidth?: number;
  gapX?: number;
  gapY?: number;
  className?: string;
};

const SHAPE: Record<DecisionNode["kind"], DiagramNodeShape> = { start: "start", decision: "diamond", step: "card", result: "result" };

/**
 * Height that fits a node's wrapped label, from rough per-character widths of the type the
 * diagram uses (12.5px titles, 11.5px outcomes, 11px diamonds and mono). A diamond's text sits
 * in its middle 60 percent, so it needs about 2.4 times the text block's height.
 */
function fitHeight(n: DecisionNode, w: number): number {
  const lines = (perChar: number, room: number) => Math.max(1, Math.ceil((n.label.length * perChar * 1.08) / Math.max(24, room)));
  if (n.kind === "decision") return Math.max(52, Math.round(lines(n.mono ? 6.6 : 5.7, w * 0.6 - 6) * 14 * 2.4 + 8));
  if (n.kind === "result") return Math.max(40, lines(n.mono ? 6.6 : 5.9, w - 20) * 14.5 + 18);
  if (n.kind === "start") return Math.max(38, lines(n.mono ? 6.6 : 6.6, w - 24) * 15.5 + 16);
  return Math.max(44, lines(n.mono ? 6.6 : 6.6, w - 22) * 15.5 + 18);
}

export function DecisionTree({
  nodes,
  edges,
  root,
  traces = [],
  defaultTrace = null,
  ariaLabel,
  description,
  nodeWidth = 112,
  gapX = 14,
  gapY = 48,
  className,
}: DecisionTreeProps) {
  const uid = useId();
  const [traceId, setTraceId] = useState<string>(defaultTrace ?? "none");
  const [stepAt, setStepAt] = useState<number | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const laid = useMemo(() => {
    const items = nodes.map((n) => {
      const w = n.w ?? (n.kind === "decision" ? nodeWidth + 16 : nodeWidth);
      return { ...n, w, h: n.h ?? fitHeight(n, w) };
    });
    return layoutTree(items, edges, { root, gapX, gapY, pad: 10 });
  }, [nodes, edges, root, nodeWidth, gapX, gapY]);

  const parent = useMemo(() => {
    const m = new Map<string, string>();
    const seen = new Set([root]);
    const queue = [root];
    while (queue.length) {
      const id = queue.shift() as string;
      for (const e of edges)
        if (e.from === id && !seen.has(e.to)) {
          seen.add(e.to);
          m.set(e.to, id);
          queue.push(e.to);
        }
    }
    return m;
  }, [edges, root]);

  // edges run down from a parent's bottom to a child's top (a same-row edge picks its own
  // sides); a branch label sits just above the child it leads to, so siblings never collide
  const diagramEdges: DiagramEdge[] = useMemo(() => {
    const at = new Map(laid.nodes.map((n) => [n.id, n]));
    return edges.map((e) => {
      const a = at.get(e.from);
      const b = at.get(e.to);
      const down = !!a && !!b && b.y >= a.y + a.h - 1;
      return {
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        label: e.label,
        labelAt: down ? 0.76 : 0.5,
        tone: "blu" as const,
        fromSide: down ? ("bottom" as const) : undefined,
        toSide: down ? ("top" as const) : undefined,
      };
    });
  }, [edges, laid]);

  const dNodes: DiagramNode[] = laid.nodes.map((n) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    w: n.w,
    h: n.h,
    title: n.label,
    shape: SHAPE[n.kind],
    tone: n.tone,
    mono: n.mono,
  }));

  const trace = traces.find((t) => t.id === traceId) ?? null;
  const pathTo = (id: string) => {
    const out = [id];
    let cur = id;
    while (parent.has(cur)) {
      cur = parent.get(cur) as string;
      out.unshift(cur);
    }
    return out;
  };
  const litPath = hover ? pathTo(hover) : trace ? trace.path.slice(0, (stepAt ?? trace.path.length - 1) + 1) : null;
  const highlight = litPath
    ? { nodes: litPath, edges: litPath.slice(1).map((id, i) => `${litPath[i]}->${id}`) }
    : null;
  const activeNode = litPath ? litPath[litPath.length - 1] : null;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && (hover || stepAt !== null)) {
      e.preventDefault();
      setHover(null);
      setStepAt(null);
      return;
    }
    if (!trace) return;
    const last = trace.path.length - 1;
    const cur = stepAt ?? last;
    let next: number | undefined;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(last, cur + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, cur - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === undefined) return;
    e.preventDefault();
    setStepAt(next);
  };

  const outcome = activeNode ? nodes.find((n) => n.id === activeNode) : null;
  const longest = Math.max(...diagramEdges.map((e) => (e.label ? monoWidth(e.label) : 0)));

  return (
    <figure className={cn("m-0 min-w-0 space-y-3", className)}>
      {traces.length ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint" id={`${uid}-trace`}>
            Trace a request
          </span>
          <div className="scroll-thin max-w-full overflow-x-auto pb-0.5">
            <div className="w-max">
            <Segmented
              size="sm"
              aria-label="Trace a request"
              value={traceId}
              onChange={(v) => {
                setTraceId(v);
                setStepAt(null);
              }}
              options={[{ value: "none", label: "None" }, ...traces.map((t) => ({ value: t.id, label: t.label }))]}
            />
            </div>
          </div>
        </div>
      ) : null}
      <div onKeyDown={onKey}>
        <DiagramScroller label={`${ariaLabel}${trace ? ", arrow keys step along the traced path" : ""}`} className="border border-hair-soft bg-[#08080a]">
          <div className="dots mx-auto p-2" style={{ width: Math.max(laid.width, longest + 40) + 16 }}>
            <Diagram
              width={laid.width}
              height={laid.height}
              nodes={dNodes}
              edges={diagramEdges}
              highlight={highlight}
              activeNodeId={activeNode}
              interactive
              onNodeEnter={setHover}
              onNodeLeave={(id) => setHover((h) => (h === id ? null : h))}
              onNodeClick={(id) => setHover((h) => (h === id ? null : id))}
            />
          </div>
        </DiagramScroller>
      </div>
      <figcaption aria-live="polite" className="min-h-[20px] text-[12.5px] text-ink-dim">
        {outcome && litPath ? (
          <>
            <span className="font-mono text-[11px] text-blu">
              {String(litPath.length).padStart(2, "0")} {litPath.length === 1 ? "step" : "steps"}
            </span>{" "}
            <span className="text-ink-faint">{litPath.map((id) => nodes.find((n) => n.id === id)?.label).join(" → ")}</span>
          </>
        ) : (
          <span className="text-ink-faint">Hover an outcome to light the path that reaches it.</span>
        )}
      </figcaption>
      <p className="sr-only">{description}</p>
    </figure>
  );
}
