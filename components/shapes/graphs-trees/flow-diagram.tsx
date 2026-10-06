"use client";

// Flow and architecture diagrams: the blueprint canvas (trigger, agent, conditional and
// function nodes on a dotted board), a generic node-and-edge map with solid role edges and
// dashed intended edges, the four-step pipeline strip, the universal runtime tree and the
// galileo route map. Node focus lights a node's edges; wide boards scroll sideways.
import { useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Segmented } from "@/components/ui/segmented";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { Diagram, DiagramScroller, EdgeLegend, type DiagramEdge, type DiagramEdgeStyle, type DiagramGroup, type DiagramNode } from "./diagram";

/* ============================================================================ blueprint */

export type BlueprintNode = {
  id: string;
  /** "trigger", "agent node", "conditional", "function" */
  kind: string;
  /** CSS color of the kind marker */
  dot: string;
  title: string;
  sub: string;
  foot: string;
  /** foot in the accent color (a decision, a routed model) */
  footAccent?: boolean;
  x: number;
  y: number;
  w?: number;
  /** the decision the run is waiting on */
  highlight?: boolean;
};

export type BlueprintEdge = { from: string; to: string; label?: string; active?: boolean };

export type BlueprintCanvasProps = {
  name: string;
  running: boolean;
  deployed: boolean;
  /** right-hand brand in the bar */
  brand?: string;
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  width?: number;
  height?: number;
  /** text alternative for the whole board */
  description: string;
  caption?: ReactNode;
};

const NODE_H = 150;
const NODE_W = 184;

const FLOW_CSS = `
@keyframes gt-flow{from{offset-distance:0%;opacity:0}12%{opacity:1}88%{opacity:1}to{offset-distance:100%;opacity:0}}
.gt-flow-dot{position:absolute;left:0;top:0;width:6px;height:6px;border-radius:999px;background:var(--blu);box-shadow:0 0 0 3px color-mix(in srgb,var(--blu) 22%,transparent);offset-rotate:0deg;animation:gt-flow 2.4s linear infinite}
`;

function bpPath(a: BlueprintNode, b: BlueprintNode) {
  const x1 = a.x + (a.w ?? NODE_W);
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  const mx = Math.max(18, (x2 - x1) / 2);
  return { d: `M${x1} ${y1} C${x1 + mx} ${y1} ${x2 - mx} ${y2} ${x2} ${y2}`, x1, y1, x2, y2 };
}

export function BlueprintCanvas({
  name,
  running,
  deployed,
  brand = "XO",
  nodes,
  edges,
  width = 880,
  height = 420,
  description,
  caption,
}: BlueprintCanvasProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const touches = (e: BlueprintEdge) => !!focus && (e.from === focus || e.to === focus);
  const focused = focus ? byId.get(focus) : undefined;

  return (
    <figure className="m-0 min-w-0">
      <style href="gt-blueprint-flow" precedence="medium">
        {FLOW_CSS}
      </style>
      <div className="overflow-hidden rounded-[12px] border border-hair bg-[#0a0b0a]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair bg-white/[0.02] px-4 py-2.5">
          <span className="font-mono text-[11px] tracking-[0.08em] text-ink-dim">
            Blueprint: <b className="font-semibold text-ink">{name}</b> ·{" "}
            <span className={running ? "text-grn" : "text-ink-faint"}>{running ? "running" : "paused"}</span>
          </span>
          <span className="flex items-center gap-3.5">
            <span className="font-mono text-[12px] tracking-[0.04em] text-ink-faint">{brand}</span>
            {deployed ? (
              <span className="whitespace-nowrap rounded-[5px] bg-blu px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.1em] text-[#0a1018]">
                ● DEPLOYED
              </span>
            ) : (
              <span className="whitespace-nowrap rounded-[5px] border border-hair-strong px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.1em] text-ink-faint">
                ○ DRAFT
              </span>
            )}
          </span>
        </div>
        <div
          className="scroll-thin overflow-x-auto focus-visible:outline-offset-[-2px]"
          tabIndex={0}
          role="group"
          aria-label={`${name} blueprint, scrolls sideways`}
        >
          <div
            className="relative"
            style={{
              width,
              height,
              backgroundImage: "radial-gradient(rgba(233,234,230,0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="pointer-events-none absolute inset-0" aria-hidden="true" focusable="false">
              {edges.map((e) => {
                const a = byId.get(e.from);
                const b = byId.get(e.to);
                if (!a || !b) return null;
                const p = bpPath(a, b);
                const lit = touches(e);
                const dim = !!focus && !lit;
                return (
                  <g key={`${e.from}-${e.to}`} opacity={dim ? 0.25 : 1} style={{ transition: "opacity 180ms var(--ease)" }}>
                    <path
                      d={p.d}
                      fill="none"
                      stroke={e.active ? "rgba(46,155,255,0.6)" : "rgba(233,234,230,0.24)"}
                      strokeWidth={lit ? 2.2 : 1.5}
                    />
                    <circle cx={p.x1} cy={p.y1} r={3} fill={e.active ? "rgba(46,155,255,0.9)" : "rgba(233,234,230,0.4)"} />
                    {e.label ? (
                      <text
                        x={p.x1 + 14}
                        y={p.y2 < p.y1 ? p.y1 - 24 : p.y1 + 32}
                        fontSize={9.5}
                        className="font-mono"
                        fill={e.active ? "rgba(46,155,255,0.9)" : "rgba(233,234,230,0.4)"}
                      >
                        {e.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            {running
              ? edges
                  .filter((e) => e.active)
                  .map((e, i) => {
                    const a = byId.get(e.from);
                    const b = byId.get(e.to);
                    if (!a || !b) return null;
                    return (
                      <span
                        key={`dot-${e.from}-${e.to}`}
                        aria-hidden="true"
                        className="gt-flow-dot"
                        style={{ offsetPath: `path("${bpPath(a, b).d}")`, animationDelay: `${i * 0.6}s`, marginLeft: -3, marginTop: -3 }}
                      />
                    );
                  })
              : null}
            {nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                aria-pressed={focus === n.id}
                onClick={() => setFocus((f) => (f === n.id ? null : n.id))}
                onMouseEnter={() => setFocus(n.id)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(n.id)}
                onBlur={() => setFocus(null)}
                className={cn(
                  "absolute flex flex-col overflow-hidden rounded-[9px] border bg-[#121411] text-left text-[11px] shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-[border-color,opacity] duration-150",
                  n.highlight ? "border-blu/45" : "border-hair",
                  focus === n.id && "border-hair-strong",
                  focus && focus !== n.id && !edges.some((e) => (e.from === focus && e.to === n.id) || (e.to === focus && e.from === n.id)) && "opacity-50",
                )}
                style={{ left: n.x, top: n.y, width: n.w ?? NODE_W, height: NODE_H }}
              >
                <span className="flex items-center gap-[7px] border-b border-hair px-[11px] py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                  <span aria-hidden="true" className="size-[7px] -skew-x-[10deg] rounded-[2px]" style={{ background: n.dot }} />
                  {n.kind}
                </span>
                <span className="flex-1 px-[11px] py-2">
                  <span className="block text-[12px] font-semibold leading-[1.35] text-ink">{n.title}</span>
                  <span className="mt-[3px] block text-[10px] leading-normal text-ink-faint">{n.sub}</span>
                </span>
                <span
                  className={cn(
                    "border-t border-hair px-[11px] py-[7px] font-mono text-[9.5px] tracking-[0.03em]",
                    n.footAccent ? "font-semibold text-blu" : "text-ink-faint",
                  )}
                >
                  {n.foot}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only">{description}</p>
      <figcaption className="mt-3 text-center font-mono text-[11px] tracking-[0.06em] text-ink-faint">
        {focused ? (
          <>
            <span className="text-ink-dim">{focused.title}</span> · {focused.kind} · {focused.foot}
          </>
        ) : (
          caption
        )}
      </figcaption>
    </figure>
  );
}

/* ============================================================================ node-and-edge map */

export type FlowDiagramProps = {
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
  legend?: { style: DiagramEdgeStyle; label: string }[];
  ariaLabel: string;
  /** text alternative for the whole diagram */
  description: string;
  caption?: ReactNode;
  className?: string;
};

/** Node-and-edge map. Hover or focus a node to light its edges and neighbors. */
export function FlowDiagram({ width, height, nodes, edges, groups, legend, ariaLabel, description, caption, className }: FlowDiagramProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const lit = focus ? edges.filter((e) => e.from === focus || e.to === focus) : [];
  const highlight = focus ? { nodes: [focus, ...lit.map((e) => (e.from === focus ? e.to : e.from))], edges: lit.map((e) => e.id) } : null;
  const node = focus ? nodes.find((n) => n.id === focus) : undefined;

  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <DiagramScroller label={ariaLabel} className="border border-hair-soft bg-[#08080a]">
        <div className="dots" style={{ width: width + 32, padding: 16 }}>
          <Diagram
            width={width}
            height={height}
            nodes={nodes}
            edges={edges}
            groups={groups}
            highlight={highlight}
            activeNodeId={focus}
            interactive
            onNodeEnter={setFocus}
            onNodeLeave={(id) => setFocus((f) => (f === id ? null : f))}
            onNodeClick={(id) => setFocus((f) => (f === id ? null : id))}
          />
        </div>
      </DiagramScroller>
      <p className="sr-only">{description}</p>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className="min-h-[18px] font-mono text-[11px] tracking-[0.04em] text-ink-faint">
          {node ? (
            <>
              <span className="text-ink">{node.title}</span>
              {lit.length ? ` · ${lit.map((e) => e.label ?? (e.from === focus ? "→" : "←")).filter(Boolean).join(" · ")}` : ""}
            </>
          ) : (
            caption
          )}
        </span>
        {legend ? <EdgeLegend items={legend} /> : null}
      </figcaption>
    </figure>
  );
}

/* ============================================================================ pipeline strip */

export type PipelineStep = {
  step: string;
  label: string;
  title: string;
  caption: string;
  /** live: a running process (blue bar); state: where it writes (green bar) */
  variant?: "live" | "state";
};

/** Four steps with arrows; two columns, then one, on narrow screens (arrows hidden). */
export function PipelineStrip({ steps, className, ariaLabel = "Pipeline" }: { steps: PipelineStep[]; className?: string; ariaLabel?: string }) {
  return (
    <div className={cn("@container", className)}>
      <ol
        aria-label={ariaLabel}
        className="grid grid-cols-1 items-stretch gap-2 rounded-[14px] border border-hair bg-s2/[0.66] p-2 @min-[520px]:grid-cols-2 @min-[860px]:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]"
      >
        {steps.map((s, i) => (
          <li key={s.step} className="contents">
            {i > 0 ? (
              <span aria-hidden="true" className="hidden self-center text-ink-faint/60 @min-[860px]:block">
                <ArrowRight className="size-3.5" />
              </span>
            ) : null}
            <div
              className={cn("min-w-0 rounded-[9px] px-3.5 py-[13px]", s.variant === "live" ? "bg-blu/[0.05]" : s.variant === "state" ? "bg-grn/[0.04]" : "bg-white/[0.015]")}
              style={{
                boxShadow: s.variant === "live" ? "inset 2px 0 var(--blu)" : s.variant === "state" ? "inset 2px 0 var(--grn)" : undefined,
              }}
            >
              <span className="mb-1 block font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-faint">
                {s.step} · {s.label}
              </span>
              <b className="block font-mono text-[14px] font-semibold text-ink">{s.title}</b>
              <p className="mt-[3px] truncate text-[12px] text-ink-faint" title={s.caption}>
                {s.caption}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================================================================ runtime tree */

export type RuntimeTreeProps = {
  title: string;
  body: string;
  capabilities: string[];
  /** a filled tile lists its runtimes; null is an empty slot */
  tiles: (LogoId[] | null)[];
  className?: string;
};

/** Monochrome "universal runtime" diagram: capability chips over a tree, then runtime tiles. */
export function RuntimeTree({ title, body, capabilities, tiles, className }: RuntimeTreeProps) {
  return (
    <div className={cn("flex flex-col rounded-[16px] border border-hair bg-[#0d0d0e] p-5", className)}>
      <h4 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h4>
      <p className="mt-1 text-[13px] text-ink-dim">{body}</p>
      <div className="mt-5 flex flex-col items-center gap-4 pb-1">
        <ul className="flex max-w-[300px] flex-wrap justify-center gap-2" aria-label="Capabilities in every runtime">
          {capabilities.map((c) => (
            <li key={c} className="rounded-[6px] bg-s4 px-2.5 py-1 font-mono text-[12.5px] font-bold text-ink/80">
              {c}
            </li>
          ))}
        </ul>
        <svg width="200" height="62" viewBox="0 0 199.6 62.4" fill="none" aria-hidden="true">
          <circle cx="100.1" cy="4.5" r="4.5" fill="#d9d9d9" />
          <circle cx="100.1" cy="57.9" r="4.5" fill="#d9d9d9" />
          <circle cx="195.1" cy="57.9" r="4.5" fill="#d9d9d9" />
          <circle cx="4.5" cy="57.9" r="4.5" fill="#d9d9d9" />
          <path d="M195.1 57.9V43.4c0-5.5-4.5-10-10-10H14.3c-5.5 0-10 4.5-10 10v14.5" stroke="#d9d9d9" />
          <line x1="99.8" y1="5.9" x2="99.8" y2="57.9" stroke="#d9d9d9" />
        </svg>
        <ul className="flex gap-2.5" aria-label="Runtime slots">
          {tiles.map((t, i) => (
            <li
              key={i}
              aria-label={t ? `Runtimes: ${t.join(", ")}` : "Empty slot"}
              className="grid size-[84px] grid-cols-2 gap-1 rounded-[8px] bg-[rgba(217,217,217,0.14)] p-1"
            >
              {t
                ? [0, 1, 2, 3].map((k) => (
                    <span key={k} className="grid place-items-center rounded-[4.5px] bg-[rgba(217,217,217,0.16)]">
                      {t[k] ? <RuntimeLogo id={t[k]} size={18} /> : null}
                    </span>
                  ))
                : [0, 1, 2, 3].map((k) => <span key={k} className="rounded-[4.5px] bg-[rgba(217,217,217,0.16)]" />)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================================ route map */

export type RouteRow = { from: string; to: string; code?: string };
export type RouteGroup = { id: string; label: string; note?: string; rows: RouteRow[] };

/** Mono address to destination rows, grouped by where the request lands. */
export function RouteMap({ groups, title, className }: { groups: RouteGroup[]; title: string; className?: string }) {
  const [current, setCurrent] = useState(groups[0]?.id ?? "");
  const group = groups.find((g) => g.id === current) ?? groups[0];
  return (
    <div className={cn("flex flex-col gap-3 rounded-[16px] border border-hair bg-[#0d0d0e] p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{title}</h4>
        <Segmented
          size="sm"
          aria-label="Route group"
          value={group?.id}
          onChange={setCurrent}
          options={groups.map((g) => ({ value: g.id, label: g.label }))}
        />
      </div>
      {group?.note ? <p className="text-[12px] text-ink-faint">{group.note}</p> : null}
      <ul className="divide-y divide-hair-soft rounded-[10px] border border-hair-soft bg-black/40">
        {group?.rows.map((r) => (
          <li key={r.from} className="grid gap-x-3 gap-y-0.5 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)]">
            <code className="font-mono text-[11.5px] text-ink">
              {r.from.split("/").map((part, i) => (
                <span key={i}>
                  {i > 0 ? (
                    <>
                      /<wbr />
                    </>
                  ) : null}
                  {part}
                </span>
              ))}
            </code>
            <span aria-hidden="true" className="hidden font-mono text-[11px] text-ink-faint sm:inline">
              ─▶
            </span>
            <span className="flex flex-wrap items-baseline gap-2 text-[12px] text-ink-dim">
              <span className="sr-only">goes to </span>
              {r.to}
              {r.code ? (
                <span
                  className={cn(
                    "rounded-[3px] border px-1 font-mono text-[10px] leading-4",
                    r.code.startsWith("2") ? "border-grn/30 text-grn" : r.code.startsWith("4") ? "border-org/35 text-org" : "border-red/35 text-red",
                  )}
                >
                  {r.code}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
