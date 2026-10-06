"use client";

// Radial orbit map: a core with an event cloud, two rings, numbered category hubs, project
// nodes with satellites, and a category focus view with a side panel. Search mutes what does
// not match (12 percent, 180ms). SVG with fixed coordinates, so it renders on the server.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { hashString } from "@/components/ui/tones";
import { plural } from "@/lib/format";

export type OrbitSatellite = { label: string; kind: "sessions" | "live" | "event" | "setup" };

export type OrbitProject = {
  id: string;
  name: string;
  /** one letter shown on the focus disc (A for App, D for Docs) */
  glyph: string;
  sessions: number;
  live: number;
  /** "3h ago" */
  lastActive: string;
  satellites: OrbitSatellite[];
};

export type OrbitCategoryData = {
  id: string;
  name: string;
  /** CSS color, such as var(--blu) */
  color: string;
  blurb: string;
  events: number;
  projects: OrbitProject[];
};

export type OrbitMapProps = {
  categories: OrbitCategoryData[];
  /** top-left kicker: [scope, date] */
  kicker: [string, string];
  /** recent events drawn as the core's particle cloud */
  eventCount: number;
  /** search text; non-matching nodes mute to 12 percent */
  query?: string;
  /** controlled focus category; null shows the overview */
  category?: string | null;
  defaultCategory?: string | null;
  onCategoryChange?: (id: string | null) => void;
  onOpenProject?: (id: string) => void;
  /** project id to show as hovered (for static state demos) */
  hoverProject?: string | null;
  /**
   * small tiles: labels twice as large, project names only on hover, focus or a search
   * match, and no count line under the core
   */
  compact?: boolean;
  /** multiply label sizes; defaults to 2 when compact, else 1 */
  labelScale?: number;
  /** hide the focus side panel (tiles) */
  hidePanel?: boolean;
  /** min width before the map scrolls sideways */
  minWidth?: number;
  className?: string;
};

const W = 1000;
const H = 840;
const CX = 500;
const CY = 430;
/** category label blocks start outside the project labels */
const LABEL_R = 352;

const rad = (deg: number) => (deg * Math.PI) / 180;
const r1 = (n: number) => Math.round(n * 10) / 10;
const polar = (r: number, deg: number, cx = CX, cy = CY) => ({ x: r1(cx + Math.cos(rad(deg)) * r), y: r1(cy + Math.sin(rad(deg)) * r) });

const matches = (q: string, ...values: string[]) => !q || values.some((v) => v.toLowerCase().includes(q));

function satellitePoints(from: { x: number; y: number }, deg: number, count: number, base: number, step: number) {
  return Array.from({ length: Math.min(count, 3) }, (_, i) => {
    const spread = (i - (Math.min(count, 3) - 1) / 2) * 18;
    return polar(base + i * step, deg + spread, from.x, from.y);
  });
}

function onActivate(ev: KeyboardEvent, fn: () => void) {
  if (ev.key === "Enter" || ev.key === " ") {
    ev.preventDefault();
    fn();
  }
}

export function OrbitMap({
  categories,
  kicker,
  eventCount,
  query = "",
  category,
  defaultCategory = null,
  onCategoryChange,
  onOpenProject,
  hoverProject = null,
  compact = false,
  labelScale = compact ? 2 : 1,
  hidePanel = false,
  minWidth = 720,
  className,
}: OrbitMapProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [inner, setInner] = useState<string | null>(defaultCategory);
  const current = category !== undefined ? category : inner;
  const [hover, setHover] = useState<string | null>(null);
  const select = (id: string | null) => {
    if (category === undefined) setInner(id);
    onCategoryChange?.(id);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  /* on narrow screens the map scrolls sideways: start at its center */
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [current]);
  const q = query.trim().toLowerCase();
  const fs = (n: number) => n * labelScale;
  const selected = categories.find((c) => c.id === current) ?? null;
  const projectCount = categories.reduce((s, c) => s + c.projects.length, 0);

  const halo = { stroke: "#050506", strokeWidth: 3.5 * labelScale, strokeOpacity: 0.9, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

  let canvas: ReactNode;
  if (!selected) {
    canvas = (
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label={`${kicker[0]}: projects grouped by category`}>
        <defs>
          <radialGradient id={`glow-${uid}`}>
            <stop offset="0" stopColor="#f3efe4" stopOpacity="0.26" />
            <stop offset="1" stopColor="#f3efe4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={136} fill="none" stroke="rgba(209,219,232,0.07)" />
        <circle cx={CX} cy={CY} r={232} fill="none" stroke="rgba(209,219,232,0.09)" strokeDasharray="2 9" />
        <circle cx={CX} cy={CY} r={96} fill={`url(#glow-${uid})`} opacity={0.3} />

        {categories.map((c, i) => {
          const deg = -90 + (i / categories.length) * 360;
          const hub = polar(175, deg);
          return <line key={`root-${c.id}`} x1={CX} y1={CY} x2={hub.x} y2={hub.y} stroke="rgba(207,217,229,0.12)" strokeWidth={1.35} />;
        })}

        {categories.map((c, i) => {
          const deg = -90 + (i / categories.length) * 360;
          const hub = polar(175, deg);
          const cos = Math.cos(rad(deg));
          const sin = Math.sin(rad(deg));
          // the name and count block sits outside the projects: above them at the top, below
          // them at the bottom, beside them at the sides; clamped inside the canvas
          const anchor = sin < -0.6 || sin > 0.6 ? "middle" : cos > 0 ? "start" : "end";
          const textW = c.name.length * fs(15) * 0.8;
          const rawX = anchor === "middle" ? CX + LABEL_R * cos : CX + 360 * cos;
          const rawY =
            sin < -0.6 ? CY + LABEL_R * sin - fs(17) : sin > 0.6 ? CY + LABEL_R * sin + fs(15) * 0.8 : CY + 360 * sin;
          const label = {
            x:
              anchor === "end"
                ? Math.max(rawX, textW + 6)
                : anchor === "start"
                  ? Math.min(rawX, W - textW - 6)
                  : Math.min(Math.max(rawX, textW / 2 + 6), W - textW / 2 - 6),
            y: Math.min(Math.max(rawY, fs(15) + 2), H - fs(17) - 6),
          };
          const catMatch = matches(q, c.name, ...c.projects.flatMap((p) => [p.name, p.id]));
          const hk = `c:${c.id}`;
          const hot = hover === hk;
          const n = c.projects.length;
          const open = () => select(c.id);
          return (
            <g key={c.id}>
              {n === 0 ? (
                <g opacity={catMatch ? 1 : 0.12} style={{ transition: "opacity 180ms ease" }}>
                  {(() => {
                    const stub = polar(246, deg);
                    return (
                      <>
                        <line x1={hub.x} y1={hub.y} x2={stub.x} y2={stub.y} stroke="rgba(207,217,229,0.12)" strokeWidth={1.35} />
                        <circle cx={stub.x} cy={stub.y} r={5} fill="none" stroke="rgba(207,217,229,0.3)" />
                      </>
                    );
                  })()}
                </g>
              ) : (
                c.projects.map((p, j) => {
                  const step = Math.min(13, 46 / n);
                  const pdeg = deg + (j - (n - 1) / 2) * step;
                  const pt = polar(252 + (j % 2) * 24, pdeg);
                  const sats = satellitePoints(pt, pdeg, p.satellites.length, 26, 7);
                  const pMatch = matches(q, p.name, p.id);
                  return (
                    <g key={`link-${p.id}`} opacity={pMatch ? 1 : 0.12} style={{ transition: "opacity 180ms ease" }}>
                      <line x1={hub.x} y1={hub.y} x2={pt.x} y2={pt.y} stroke="rgba(207,217,229,0.36)" strokeWidth={1.35} />
                      {sats.map((s, k) => (
                        <line key={k} x1={pt.x} y1={pt.y} x2={s.x} y2={s.y} stroke="rgba(207,217,229,0.22)" strokeWidth={1} />
                      ))}
                    </g>
                  );
                })
              )}

              <g
                role="button"
                tabIndex={0}
                aria-label={`Open ${c.name}, ${n} ${plural(n, "project")}`}
                className="cursor-pointer outline-none"
                opacity={catMatch ? 1 : 0.12}
                style={{ transition: "opacity 180ms ease" }}
                onClick={open}
                onKeyDown={(ev) => onActivate(ev, open)}
                onMouseEnter={() => setHover(hk)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(hk)}
                onBlur={() => setHover(null)}
              >
                <circle cx={hub.x} cy={hub.y} r={26} fill={c.color} fillOpacity={hot ? 0.18 : 0.09} stroke={c.color} strokeOpacity={hot ? 1 : 0.48} strokeWidth={hot ? 2 : 1} />
                <circle cx={hub.x} cy={hub.y} r={16} fill="#0e1014" stroke={c.color} strokeWidth={1.25} />
                <text x={hub.x} y={hub.y + 0.5} textAnchor="middle" dominantBaseline="middle" fill={c.color} fontSize={fs(8.5)} fontWeight={800} letterSpacing="0.06em">
                  {String(i + 1).padStart(2, "0")}
                </text>
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={anchor}
                  fill={hot ? "var(--ink)" : "#c8cbd0"}
                  fontSize={fs(15)}
                  letterSpacing="0.19em"
                  {...halo}
                >
                  {c.name.toUpperCase()}
                </text>
                <text x={label.x} y={label.y + fs(17)} textAnchor={anchor} fill="var(--ink-faint)" fontSize={fs(9)} letterSpacing="0.12em" {...halo}>
                  {`${n} ${plural(n, "project")}`.toUpperCase()}
                </text>
              </g>

              {c.projects.map((p, j) => {
                const step = Math.min(13, 46 / n);
                const pdeg = deg + (j - (n - 1) / 2) * step;
                const pt = polar(252 + (j % 2) * 24, pdeg);
                const sats = satellitePoints(pt, pdeg, p.satellites.length, 26, 7);
                const pMatch = matches(q, p.name, p.id);
                const pk = `p:${p.id}`;
                const phot = hover === pk || hoverProject === p.id;
                // the name sits outward, past the satellites
                const lp = polar(compact ? 44 : 54, pdeg, pt.x, pt.y);
                const pc = Math.cos(rad(pdeg));
                const lAnchor = pc > 0.5 ? "start" : pc < -0.5 ? "end" : "middle";
                const named = !compact || phot || (!!q && pMatch);
                const openP = () => onOpenProject?.(p.id);
                return (
                  <g
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${p.name}: ${p.sessions} ${plural(p.sessions, "session")}, ${p.live ? `${p.live} live` : `last active ${p.lastActive}`}`}
                    className="cursor-pointer outline-none"
                    opacity={pMatch ? 1 : 0.12}
                    style={{ transition: "opacity 180ms ease" }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      openP();
                    }}
                    onKeyDown={(ev) => onActivate(ev, openP)}
                    onMouseEnter={() => setHover(pk)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(pk)}
                    onBlur={() => setHover(null)}
                  >
                    {sats.map((s, k) => (
                      <circle key={k} cx={s.x} cy={s.y} r={3.4} fill={c.color} stroke="#17202a" strokeWidth={1.2}>
                        <title>{p.satellites[k]?.label}</title>
                      </circle>
                    ))}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={10}
                      fill={phot ? `color-mix(in srgb, ${c.color} 16%, #0b1017)` : "rgba(8,12,17,0.86)"}
                      stroke={`color-mix(in srgb, ${c.color} 68%, #dbe1e9)`}
                      strokeWidth={phot ? 2 : 1.2}
                    />
                    <circle cx={pt.x} cy={pt.y} r={5} fill="#ece9df" style={{ filter: "drop-shadow(0 0 5px rgba(238,236,228,0.36))" }} />
                    {named ? (
                      <text
                        x={lp.x}
                        y={lp.y + fs(4)}
                        textAnchor={lAnchor}
                        fill={phot ? "var(--ink)" : "var(--ink-dim)"}
                        fontSize={fs(11)}
                        {...halo}
                      >
                        {p.name}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}

        {Array.from({ length: Math.max(14, Math.min(72, eventCount)) }, (_, i) => {
          const seed = hashString(`event:${i}:${kicker[0]}`);
          const deg = ((seed % 3600) / 3600) * 360;
          const pt = polar(14 + ((seed >>> 9) % 70), deg);
          const r = 1.2 + ((seed >>> 17) % 4) * 0.5;
          const fill = i % 5 === 0 ? "rgba(224,112,138,0.5)" : i % 3 === 0 ? "rgba(111,183,224,0.55)" : "rgba(230,231,226,0.46)";
          return <circle key={i} cx={pt.x} cy={pt.y} r={r1(r)} fill={fill} aria-hidden="true" />;
        })}
        <circle cx={CX} cy={CY} r={6} fill="var(--ink)" style={{ filter: "drop-shadow(0 0 10px rgba(244,243,240,0.6))" }} />
        <text x={CX} y={CY + 104} textAnchor="middle" fill="#d5d3ca" fontSize={fs(12.5)} letterSpacing="0.22em" {...halo}>
          XO PROJECTS
        </text>
        {!compact ? (
          <text x={CX} y={CY + 104 + fs(16)} textAnchor="middle" fill="var(--ink-faint)" fontSize={fs(8.5)} letterSpacing="0.12em" {...halo}>
            {`${projectCount} ${plural(projectCount, "project")} · ${eventCount} ${plural(eventCount, "event")}`.toUpperCase()}
          </text>
        ) : null}
      </svg>
    );
  } else {
    const hub = { x: 500, y: 690 };
    const n = selected.projects.length;
    const points = selected.projects.map((_, i) =>
      n === 1 ? { x: 500, y: 370 } : polar(316, -155 + (i / Math.max(n - 1, 1)) * 130, hub.x, hub.y),
    );
    // crop the empty sky above the highest disc and its satellites
    const top = Math.max(0, Math.min(...points.map((p) => p.y), hub.y) - 130);
    canvas = (
      <svg viewBox={`0 ${top} ${W} ${H - top}`} className="block h-auto w-full" role="group" aria-label={`${selected.name} projects`}>
        <circle cx={hub.x} cy={hub.y} r={320} fill="none" stroke="rgba(209,219,232,0.08)" />
        {selected.projects.map((p, i) => {
          const pt = points[i];
          const outward = Math.atan2(pt.y - hub.y, pt.x - hub.x) * (180 / Math.PI);
          const sats = satellitePoints(pt, outward, p.satellites.length, 54, 10);
          const pMatch = matches(q, p.name, p.id);
          const pk = `p:${p.id}`;
          const phot = hover === pk || hoverProject === p.id;
          const openP = () => onOpenProject?.(p.id);
          return (
            <g key={p.id} opacity={pMatch ? 1 : 0.12} style={{ transition: "opacity 180ms ease" }}>
              <line x1={hub.x} y1={hub.y} x2={pt.x} y2={pt.y} stroke="rgba(226,231,236,0.42)" strokeWidth={1.7} />
              {sats.map((s, k) => (
                <g key={k}>
                  <line x1={pt.x} y1={pt.y} x2={s.x} y2={s.y} stroke="rgba(207,217,229,0.22)" />
                  <circle cx={s.x} cy={s.y} r={6} fill={selected.color} stroke="#17202a" strokeWidth={1.2}>
                    <title>{p.satellites[k]?.label}</title>
                  </circle>
                </g>
              ))}
              <g
                role="button"
                tabIndex={0}
                aria-label={`Open ${p.name}: ${p.live ? `${p.live} live` : `last active ${p.lastActive}`}`}
                className="cursor-pointer outline-none"
                onClick={openP}
                onKeyDown={(ev) => onActivate(ev, openP)}
                onMouseEnter={() => setHover(pk)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(pk)}
                onBlur={() => setHover(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={42}
                  fill={phot ? selected.color : "rgba(238,236,228,0.025)"}
                  fillOpacity={phot ? 0.12 : 1}
                  stroke={phot ? selected.color : "rgba(238,236,228,0.16)"}
                />
                <circle cx={pt.x} cy={pt.y} r={31} fill="#ece9df" stroke="rgba(255,255,255,0.9)" style={{ filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.4))" }} />
                <text x={pt.x} y={pt.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#151920" fontSize={fs(17)} fontWeight={700}>
                  {p.glyph}
                </text>
                <text x={pt.x} y={pt.y + 62} textAnchor="middle" fill="var(--ink)" fontSize={fs(14)} fontWeight={650} {...halo}>
                  {p.name}
                </text>
                <text x={pt.x} y={pt.y + 62 + fs(18)} textAnchor="middle" fill={p.live ? "var(--grn)" : "var(--ink-faint)"} fontSize={fs(9.5)} letterSpacing="0.12em" {...halo}>
                  {(p.live ? `${p.live} live` : p.lastActive).toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}
        <circle cx={hub.x} cy={hub.y} r={46} fill={selected.color} fillOpacity={0.09} stroke={selected.color} strokeOpacity={0.6} strokeWidth={1.4} />
        <circle cx={hub.x} cy={hub.y} r={32} fill="#0e1014" stroke={selected.color} strokeWidth={1.25} />
        <text x={hub.x} y={hub.y + 1} textAnchor="middle" dominantBaseline="middle" fill={selected.color} fontSize={fs(11)} fontWeight={800} letterSpacing="0.06em">
          {selected.name.slice(0, 2).toUpperCase()}
        </text>
        <text x={hub.x} y={hub.y + 70} textAnchor="middle" fill="#d5d3ca" fontSize={fs(13)} letterSpacing="0.22em" {...halo}>
          {selected.name.toUpperCase()}
        </text>
        <text x={hub.x} y={hub.y + 70 + fs(17)} textAnchor="middle" fill="var(--ink-faint)" fontSize={fs(9)} letterSpacing="0.12em" {...halo}>
          {`${n} ${plural(n, "project")}`.toUpperCase()}
        </text>
      </svg>
    );
  }

  const live = selected?.projects.reduce((s, p) => s + p.live, 0) ?? 0;
  const recorded = selected?.projects.reduce((s, p) => s + p.sessions, 0) ?? 0;

  return (
    <div className={cn("@container relative overflow-hidden rounded-[14px] border border-hair-soft bg-[#060708]", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(70% 60% at 50% 46%, rgba(46,155,255,0.05), transparent 70%)" }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 pt-3.5 @min-[640px]:px-6">
        {selected ? (
          <button
            type="button"
            onClick={() => select(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-hair bg-s1/80 px-3 py-1 text-[12px] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            All categories
          </button>
        ) : (
          <p className="flex items-center gap-3 font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            <span>{kicker[0]}</span>
            <span aria-hidden="true" className="size-[3px] rounded-full bg-grn" />
            <span>{kicker[1]}</span>
          </p>
        )}
        {selected ? (
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">Projects · sessions · events</p>
        ) : null}
      </div>

      <div className={cn("relative", selected && !hidePanel && "@min-[860px]:grid @min-[860px]:grid-cols-[250px_minmax(0,1fr)]")}>
        {selected && !hidePanel ? (
          <aside
            className="relative mx-4 mt-3 rounded-[12px] border border-hair bg-s1/80 p-4 backdrop-blur @min-[640px]:mx-6 @min-[860px]:mr-0 @min-[860px]:mt-6 @min-[860px]:self-start"
            style={{ boxShadow: `inset 2px 0 0 ${selected.color}` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Project category</p>
            <h4 className="mt-1.5 text-[20px] font-semibold tracking-[-0.01em] text-ink">{selected.name}</h4>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">{selected.blurb}</p>
            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-hair-soft bg-hair-soft">
              {[
                ["Projects", selected.projects.length],
                ["Open sessions", live],
                ["Recorded sessions", recorded],
                ["Recent events", selected.events],
              ].map(([k, v]) => (
                <div key={k as string} className="bg-[#0c0c0e] px-3 py-2">
                  <dt className="text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">{k}</dt>
                  <dd className="mt-0.5 font-mono text-[15px] tabular-nums text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11.5px] text-ink-faint">Select a project node to open its live detail.</p>
          </aside>
        ) : null}
        <div ref={scrollRef} className="scroll-thin overflow-x-auto">
          <div style={{ minWidth }} className="px-2 pb-2">
            {canvas}
          </div>
        </div>
      </div>

      {!selected ? (
        <div className="relative flex items-center justify-center gap-4 px-4 pb-4 font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          <span>Choose a category to explore</span>
          <span aria-hidden="true" className="h-px w-10 bg-hair-strong" />
          <span>
            {projectCount} {plural(projectCount, "project")} mapped
          </span>
        </div>
      ) : null}
    </div>
  );
}
