// Product screens drawn from the shared fixtures, for framed screenshots: the space graph, the
// timeline, the sessions table, the Space dashboard usage view and a space's environment view
// as inline SVG that scales like an image, plus the three-layer plate (a drawn plate with
// real text beside it). Server-safe, no hooks: every value comes from props or seeded
// fixtures, so server and client render the same.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatBytes, formatCompact, formatCurrency, formatTokens } from "@/lib/format";
import { toneVar, type GraphEdge, type GraphNode, type Runtime, type Session, type Space, type Swimlane, type UsageDay } from "@/lib/fixtures";

type SvgProps = {
  /** Alt text: what the screen shows. */
  label: string;
  /** Unique prefix for pattern ids on this page. */
  uid: string;
  className?: string;
};

function Screen({ w, h, label, className, children }: { w: number; h: number; label: string; className?: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className={cn("block h-auto w-full select-none", className)} preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  );
}

function Dots({ uid, w, h, fill = "#0b0d0c" }: { uid: string; w: number; h: number; fill?: string }) {
  return (
    <>
      <defs>
        <pattern id={`${uid}-dots`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,.07)" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={fill} />
      <rect width={w} height={h} fill={`url(#${uid}-dots)`} />
    </>
  );
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const T = {
  mono: "font-mono",
  sans: "font-sans",
};

/* ============================================================ graph */

export type GraphScreenProps = SvgProps & {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Layout box the node coordinates were computed in. */
  layout: { width: number; height: number };
  spaceName: string;
  /** Screen size in viewBox units. */
  width?: number;
  height?: number;
  /** Detail rows for the left panel; omit to show the graph alone. */
  panel?: { title: string; rows: [string, string][]; runtimes: { label: string; color: string; count: number }[] };
};

/** Space graph: space root, runtimes, projects, sessions and touched files on a dotted ground. */
export function GraphScreen({ nodes, edges, layout, spaceName, width = 1000, height = 520, panel, label, uid, className }: GraphScreenProps) {
  const left = panel ? 290 : 0;
  const pad = 24;
  const top = 44;
  // Fit the drawn nodes, not the whole layout box, with room for labels.
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const bx = nodes.length ? Math.min(...xs) - 34 : 0;
  const by = nodes.length ? Math.min(...ys) - 14 : 0;
  const bw = nodes.length ? Math.max(...xs) + 34 - bx : layout.width;
  const bh = nodes.length ? Math.max(...ys) + 28 - by : layout.height;
  const scale = Math.min((width - left - pad * 2) / bw, (height - top - pad) / bh);
  const gx = left + pad + (width - left - pad * 2 - bw * scale) / 2 - bx * scale;
  const gy = top + (height - top - pad - bh * scale) / 2 - by * scale;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const P = (n: GraphNode) => ({ x: gx + n.x * scale, y: gy + n.y * scale });
  return (
    <Screen w={width} h={height} label={label} className={className}>
      <Dots uid={uid} w={width} h={height} />
      <text x={pad} y={28} className={T.mono} fontSize="11" letterSpacing="1.6" fill="#7d7d78">
        {`${spaceName.toUpperCase()} · GRAPH · ${nodes.length} NODES · ${edges.length} EDGES`}
      </text>
      {edges.map((e) => {
        const a = byId.get(e.source);
        const b = byId.get(e.target);
        if (!a || !b) return null;
        const pa = P(a);
        const pb = P(b);
        return (
          <line
            key={e.id}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke={e.kind === "runs" ? toneVar(a.color === "ink" ? "ink-faint" : a.color) : "#f4f3f0"}
            strokeOpacity={e.kind === "runs" ? 0.28 : e.kind === "touches" ? 0.1 : 0.16}
            strokeWidth={Math.max(0.6, Math.min(2.4, e.weight * 0.35)) * Math.max(scale, 0.6)}
          />
        );
      })}
      {nodes.map((n) => {
        const p = P(n);
        const r = Math.max(2, n.size * scale);
        const showLabel = n.kind === "space" || n.kind === "runtime" || n.kind === "project";
        return (
          <g key={n.id}>
            {n.kind === "space" ? <circle cx={p.x} cy={p.y} r={r + 7 * scale} fill="none" stroke="rgba(255,255,255,.18)" /> : null}
            <circle cx={p.x} cy={p.y} r={r} fill={toneVar(n.color)} fillOpacity={n.kind === "file" ? 0.55 : n.kind === "session" ? 0.8 : 1} />
            {showLabel ? (
              <text
                x={p.x}
                y={p.y + r + 13}
                textAnchor="middle"
                className={n.kind === "runtime" ? T.mono : T.sans}
                fontSize={n.kind === "space" ? 13 : 11}
                fontWeight={n.kind === "space" ? 600 : 400}
                fill={n.kind === "runtime" ? "#a3a39e" : "#f4f3f0"}
              >
                {n.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {panel ? (
        <g>
          <rect x={pad} y={top} width={left - pad - 8} height={height - top - pad} rx="14" fill="#121214" stroke="rgba(255,255,255,.09)" />
          <text x={pad + 18} y={top + 30} className={T.mono} fontSize="10" letterSpacing="1.8" fill="#7d7d78">
            PROJECT
          </text>
          <text x={pad + 18} y={top + 56} className={T.sans} fontSize="19" fontWeight="600" fill="#f4f3f0">
            {panel.title}
          </text>
          {panel.rows.map(([k, v], i) => (
            <g key={k}>
              <text x={pad + 18} y={top + 92 + i * 28} className={T.sans} fontSize="12" fill="#7d7d78">
                {k}
              </text>
              <text x={left - 26} y={top + 92 + i * 28} textAnchor="end" className={T.mono} fontSize="12" fill="#f4f3f0">
                {v}
              </text>
            </g>
          ))}
          <line x1={pad + 18} x2={left - 26} y1={top + 92 + panel.rows.length * 28 - 6} y2={top + 92 + panel.rows.length * 28 - 6} stroke="rgba(255,255,255,.07)" />
          {panel.runtimes.map((r, i) => (
            <g key={r.label}>
              <circle cx={pad + 22} cy={top + 116 + panel.rows.length * 28 + i * 26} r="4" fill={r.color} />
              <text x={pad + 34} y={top + 120 + panel.rows.length * 28 + i * 26} className={T.sans} fontSize="12" fill="#a3a39e">
                {r.label}
              </text>
              <text x={left - 26} y={top + 120 + panel.rows.length * 28 + i * 26} textAnchor="end" className={T.mono} fontSize="12" fill="#a3a39e">
                {r.count}
              </text>
            </g>
          ))}
        </g>
      ) : null}
    </Screen>
  );
}

/* ============================================================ timeline */

export type TimelineScreenProps = SvgProps & {
  lanes: Swimlane[];
  dayLabel: string;
  ticks: number[];
  /** Visible window in minutes after midnight. */
  range?: [number, number];
  width?: number;
  height?: number;
};

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:00`;
const dur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`);

/** One day of runtime activity as swimlanes: ran, error and waiting segments. */
export function TimelineScreen({ lanes, dayLabel, ticks, range = [0, 1440], width = 1000, height = 520, label, uid, className }: TimelineScreenProps) {
  const x0 = 170;
  const x1 = width - 90;
  const top = 92;
  const laneH = Math.min(86, (height - top - 60) / Math.max(1, lanes.length));
  const [r0, r1] = range;
  const X = (m: number) => x0 + ((Math.min(Math.max(m, r0), r1) - r0) / (r1 - r0)) * (x1 - x0);
  const shownTicks = ticks.filter((t) => t >= r0 && t <= r1);
  return (
    <Screen w={width} h={height} label={label} className={className}>
      <Dots uid={uid} w={width} h={height} />
      <text x={24} y={34} className={T.sans} fontSize="17" fontWeight="600" fill="#f4f3f0">
        Timeline
      </text>
      <text x={24} y={56} className={T.mono} fontSize="10.5" letterSpacing="1.6" fill="#7d7d78">
        {`${dayLabel.toUpperCase()} · ${lanes.length} RUNTIMES · UTC`}
      </text>
      {shownTicks.map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={top - 10} y2={top + laneH * lanes.length} stroke="rgba(255,255,255,.06)" />
          <text x={X(t)} y={top - 16} textAnchor="middle" className={T.mono} fontSize="10" fill="#7d7d78">
            {t === 1440 ? "24:00" : hhmm(t)}
          </text>
        </g>
      ))}
      {lanes.map((lane, i) => {
        const y = top + i * laneH;
        const c = toneVar(lane.color);
        return (
          <g key={lane.runtime}>
            <line x1={24} x2={width - 24} y1={y + laneH} y2={y + laneH} stroke="rgba(255,255,255,.05)" />
            <circle cx={30} cy={y + laneH / 2} r="4" fill={c} />
            <text x={42} y={y + laneH / 2 + 4} className={T.sans} fontSize="13" fill="#f4f3f0">
              {lane.label}
            </text>
            <text x={width - 24} y={y + laneH / 2 + 4} textAnchor="end" className={T.mono} fontSize="11" fill="#7d7d78">
              {dur(lane.activeMin)}
            </text>
            {lane.segments.map((s) => {
              const sx = X(s.startMin);
              const sw = Math.max(5, X(s.endMin) - sx);
              const sy = y + laneH * 0.24;
              const sh = laneH * 0.52;
              const err = s.status === "error";
              const wait = s.status === "waiting";
              return (
                <g key={s.id}>
                  <rect
                    x={sx}
                    y={sy}
                    width={sw}
                    height={sh}
                    rx="6"
                    fill={err ? "var(--red)" : wait ? "transparent" : c}
                    fillOpacity={err ? 0.22 : wait ? 0 : 0.72}
                    stroke={err ? "var(--red)" : wait ? c : "none"}
                    strokeDasharray={wait ? "4 3" : undefined}
                  />
                  {sw > 74 ? (
                    <text x={sx + 8} y={sy + sh / 2 + 4} className={T.sans} fontSize="10.5" fill={err || wait ? "#f4f3f0" : "#000"}>
                      {clip(s.label, Math.floor(sw / 6.4))}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {(
        [
          ["Ran", "var(--ink-dim)", "solid"],
          ["Error", "var(--red)", "error"],
          ["Waiting", "var(--ink-dim)", "dash"],
        ] as const
      ).map(([name, color, kind], i) => (
        <g key={name} transform={`translate(${x0 + i * 96} ${height - 26})`}>
          <rect
            width="16"
            height="9"
            rx="3"
            y="-8"
            fill={kind === "dash" ? "transparent" : color}
            fillOpacity={kind === "error" ? 0.3 : 0.8}
            stroke={kind === "solid" ? "none" : color}
            strokeDasharray={kind === "dash" ? "3 2" : undefined}
          />
          <text x="22" y="0" className={T.sans} fontSize="11" fill="#a3a39e">
            {name}
          </text>
        </g>
      ))}
    </Screen>
  );
}

/* ============================================================ sessions */

export type SessionsScreenProps = SvgProps & {
  sessions: Session[];
  runtimeLabel: (id: Session["runtime"]) => string;
  runtimeColor: (id: Session["runtime"]) => string;
  title?: string;
  width?: number;
  height?: number;
};

/** Sessions table: inputs, runtime, model, token spend and cost for every session. */
export function SessionsScreen({ sessions, runtimeLabel, runtimeColor, title = "Sessions", width = 1000, height = 520, label, uid, className }: SessionsScreenProps) {
  const cols = [
    { k: "Session", x: 24, anchor: "start" as const },
    { k: "Runtime", x: 430, anchor: "start" as const },
    { k: "Model", x: 560, anchor: "start" as const },
    { k: "Tokens", x: 760, anchor: "end" as const },
    { k: "Cost", x: 850, anchor: "end" as const },
    { k: "Last activity", x: width - 24, anchor: "end" as const },
  ];
  const top = 104;
  const rowH = Math.min(44, (height - top - 16) / Math.max(1, sessions.length));
  return (
    <Screen w={width} h={height} label={label} className={className}>
      <Dots uid={uid} w={width} h={height} />
      <text x={24} y={34} className={T.sans} fontSize="17" fontWeight="600" fill="#f4f3f0">
        {title}
      </text>
      <text x={24} y={56} className={T.mono} fontSize="10.5" letterSpacing="1.6" fill="#7d7d78">
        {`${sessions.length} SESSIONS · ${sessions.filter((s) => s.open).length} OPEN · COST IS MOCK`}
      </text>
      <rect x={14} y={top - 26} width={width - 28} height={rowH * sessions.length + 30} rx="12" fill="#101012" stroke="rgba(255,255,255,.07)" />
      {cols.map((c) => (
        <text key={c.k} x={c.x} y={top - 6} textAnchor={c.anchor} className={T.mono} fontSize="10" letterSpacing="1.4" fill="#7d7d78">
          {c.k.toUpperCase()}
        </text>
      ))}
      {sessions.map((s, i) => {
        const y = top + i * rowH;
        const mid = y + rowH / 2 + 4;
        return (
          <g key={s.id}>
            <line x1={14} x2={width - 14} y1={y} y2={y} stroke="rgba(255,255,255,.055)" />
            {s.open ? <circle cx={30} cy={mid - 4} r="3.5" fill="var(--grn)" /> : <circle cx={30} cy={mid - 4} r="3.5" fill="rgba(255,255,255,.2)" />}
            <text x={42} y={mid} className={T.sans} fontSize="12.5" fill="#f4f3f0">
              {clip(s.title, 52)}
            </text>
            <circle cx={436} cy={mid - 4} r="3.5" fill={runtimeColor(s.runtime)} />
            <text x={446} y={mid} className={T.sans} fontSize="12" fill="#a3a39e">
              {runtimeLabel(s.runtime)}
            </text>
            <text x={560} y={mid} className={T.mono} fontSize="11.5" fill="#a3a39e">
              {s.model}
            </text>
            <text x={760} y={mid} textAnchor="end" className={T.mono} fontSize="11.5" fill="#f4f3f0">
              {formatCompact(s.tokens)}
            </text>
            <text x={850} y={mid} textAnchor="end" className={T.mono} fontSize="11.5" fill="#a3a39e">
              {formatCurrency(s.cost)}
            </text>
            <text x={width - 24} y={mid} textAnchor="end" className={T.mono} fontSize="11.5" fill="#7d7d78">
              {s.lastActivity}
            </text>
          </g>
        );
      })}
    </Screen>
  );
}

/* ============================================================ observatory (usage) */

export type UsageScreenProps = SvgProps & {
  runtimes: Pick<Runtime, "id" | "label" | "sessions" | "color">[];
  days: UsageDay[];
  totals: { tokens: number; cost: number; sessions: number };
  width?: number;
  height?: number;
};

/** Space dashboard usage view: sessions per runtime as bubbles and daily tokens as bars. */
export function UsageScreen({ runtimes, days, totals, width = 1000, height = 520, label, uid, className }: UsageScreenProps) {
  const ranked = [...runtimes].filter((r) => r.sessions > 0).sort((a, b) => b.sessions - a.sessions);
  const maxS = Math.max(...ranked.map((r) => r.sessions), 1);
  const spots = [
    { x: 190, y: 262 },
    { x: 330, y: 200 },
    { x: 318, y: 350 },
    { x: 410, y: 292 },
  ];
  const chartX = 520;
  const chartW = width - chartX - 30;
  const chartTop = 196;
  const chartH = height - chartTop - 54;
  const maxT = Math.max(...days.map((d) => d.tokens), 1);
  const bw = chartW / days.length;
  return (
    <Screen w={width} h={height} label={label} className={className}>
      <Dots uid={uid} w={width} h={height} />
      <text x={30} y={40} className={T.sans} fontSize="18" fontWeight="600" fill="#f4f3f0">
        Space dashboard
      </text>
      <text x={30} y={62} className={T.mono} fontSize="10.5" letterSpacing="1.6" fill="#7d7d78">
        USAGE METER · 30 DAYS · MOCK DATA
      </text>
      {(
        [
          ["Tokens", formatTokens(totals.tokens)],
          ["Cost", formatCurrency(totals.cost, 0)],
          ["Sessions", String(totals.sessions)],
        ] as const
      ).map(([k, v], i) => (
        <g key={k} transform={`translate(${chartX + i * ((chartW + 10) / 3)} 84)`}>
          <rect width={(chartW + 10) / 3 - 10} height="74" rx="12" fill="#121214" stroke="rgba(255,255,255,.08)" />
          <text x="16" y="28" className={T.mono} fontSize="10" letterSpacing="1.4" fill="#7d7d78">
            {k.toUpperCase()}
          </text>
          <text x="16" y="56" className={T.sans} fontSize="20" fontWeight="600" fill="#f4f3f0">
            {v}
          </text>
        </g>
      ))}
      {ranked.slice(0, spots.length).map((r, i) => {
        const rad = 26 + Math.sqrt(r.sessions / maxS) * 64;
        const s = spots[i];
        return (
          <g key={r.id}>
            <circle cx={s.x} cy={s.y} r={rad} fill={toneVar(r.color)} fillOpacity="0.16" stroke={toneVar(r.color)} strokeOpacity="0.6" />
            <text x={s.x} y={s.y - 2} textAnchor="middle" className={T.sans} fontSize={rad > 50 ? 14 : 11} fontWeight="600" fill="#f4f3f0">
              {r.label}
            </text>
            <text x={s.x} y={s.y + 15} textAnchor="middle" className={T.mono} fontSize="10.5" fill="#a3a39e">
              {`${r.sessions} sessions`}
            </text>
          </g>
        );
      })}
      <line x1={chartX} x2={chartX + chartW} y1={chartTop + chartH} y2={chartTop + chartH} stroke="rgba(255,255,255,.12)" />
      {days.map((d, i) => {
        const h = (d.tokens / maxT) * (chartH - 10);
        return <rect key={d.date} x={chartX + i * bw + 1.5} y={chartTop + chartH - h} width={Math.max(2, bw - 3)} height={h} rx="2" fill="var(--blu)" fillOpacity={i >= days.length - 7 ? 0.95 : 0.45} />;
      })}
      <text x={chartX} y={chartTop + chartH + 22} className={T.mono} fontSize="10" fill="#7d7d78">
        {days[0]?.label ?? ""}
      </text>
      <text x={chartX + chartW} y={chartTop + chartH + 22} textAnchor="end" className={T.mono} fontSize="10" fill="#7d7d78">
        {days[days.length - 1]?.label ?? ""}
      </text>
    </Screen>
  );
}

/* ============================================================ environment view */

export type EnvironmentScreenProps = SvgProps & {
  space: Space;
  runtimeLabel: string;
  projects: { name: string; sessions: number; color: string }[];
  width?: number;
  height?: number;
};

/** One space: lifecycle, runtime, meters (Unavailable when missing) and its projects. */
export function EnvironmentScreen({ space, runtimeLabel, projects, width = 620, height = 600, label, uid, className }: EnvironmentScreenProps) {
  const meters: [string, number | null, number, string][] = [
    ["CPU", space.usage.cpu.used, space.usage.cpu.total, space.usage.cpu.used === null ? "Unavailable" : `${space.usage.cpu.used} / ${space.usage.cpu.total} cores`],
    ["Memory", space.usage.memory.used, space.usage.memory.total, space.usage.memory.used === null ? "Unavailable" : `${formatBytes(space.usage.memory.used)} / ${formatBytes(space.usage.memory.total)}`],
    ["Disk", space.usage.disk.used, space.usage.disk.total, space.usage.disk.used === null ? "Unavailable" : `${formatBytes(space.usage.disk.used)} / ${formatBytes(space.usage.disk.total)}`],
  ];
  const running = space.status === "Running";
  return (
    <Screen w={width} h={height} label={label} className={className}>
      <Dots uid={uid} w={width} h={height} />
      <text x={32} y={52} className={T.mono} fontSize="10.5" letterSpacing="1.8" fill="#7d7d78">
        {`${space.deployment.toUpperCase()} SPACE · ${space.provider.toUpperCase()}`}
      </text>
      <text x={32} y={88} className={T.sans} fontSize="28" fontWeight="600" fill="#f4f3f0" letterSpacing="-0.6">
        {space.name}
      </text>
      <g transform={`translate(32 108)`}>
        <rect width="104" height="26" rx="6" fill={running ? "rgba(48,209,88,.1)" : "rgba(255,255,255,.06)"} stroke={running ? "rgba(48,209,88,.3)" : "rgba(255,255,255,.1)"} />
        <circle cx="14" cy="13" r="3.5" fill={running ? "var(--grn)" : "var(--ink-faint)"} />
        <text x="25" y="17.5" className={T.sans} fontSize="12" fill={running ? "var(--grn)" : "#a3a39e"}>
          {space.status}
        </text>
      </g>
      <text x={150} y={126} className={T.sans} fontSize="12.5" fill="#a3a39e">
        {`${runtimeLabel} · ${space.stopsIn ? `stops in ${space.stopsIn}` : "no auto-stop"}`}
      </text>
      <text x={32} y={166} className={T.mono} fontSize="11.5" fill="#7d7d78">
        {space.host}
      </text>
      {meters.map(([k, used, total, text], i) => {
        const y = 206 + i * 62;
        const w = width - 64;
        return (
          <g key={k}>
            <text x={32} y={y} className={T.sans} fontSize="12.5" fill="#a3a39e">
              {k}
            </text>
            <text x={width - 32} y={y} textAnchor="end" className={T.mono} fontSize="12" fill={used === null ? "#7d7d78" : "#f4f3f0"}>
              {text}
            </text>
            <rect x={32} y={y + 12} width={w} height="7" rx="3.5" fill="rgba(255,255,255,.08)" />
            {used !== null ? <rect x={32} y={y + 12} width={(used / total) * w} height="7" rx="3.5" fill="var(--ink)" /> : null}
          </g>
        );
      })}
      <text x={32} y={410} className={T.mono} fontSize="10.5" letterSpacing="1.8" fill="#7d7d78">
        {`PROJECTS · ${projects.length}`}
      </text>
      {projects.slice(0, 4).map((p, i) => {
        const y = 428 + i * 40;
        return (
          <g key={p.name}>
            <rect x={24} y={y} width={width - 48} height="32" rx="8" fill="#121214" stroke="rgba(255,255,255,.07)" />
            <circle cx={42} cy={y + 16} r="4" fill={p.color} />
            <text x={54} y={y + 20.5} className={T.sans} fontSize="12.5" fill="#f4f3f0">
              {p.name}
            </text>
            <text x={width - 40} y={y + 20.5} textAnchor="end" className={T.mono} fontSize="11" fill="#7d7d78">
              {`${p.sessions} sessions`}
            </text>
          </g>
        );
      })}
    </Screen>
  );
}

/* ============================================================ layers plate */

export type LayerSpec = { num: string; name: string; body: string; color: string };

export type LayersScreenProps = {
  layers: LayerSpec[];
  className?: string;
};

/**
 * Three stacked layers on the warm panel: 01 Observatory (blue), 02 Environments (green),
 * 03 Spaces (orange). The plate is drawn; the names are real text, so they stay legible
 * and stack under the plate on narrow screens.
 */
export function LayersScreen({ layers, className }: LayersScreenProps) {
  const cx = 200;
  return (
    <div className={cn("grid items-center gap-x-10 gap-y-6 bg-[#1c1710] px-[clamp(18px,4vw,44px)] py-[clamp(20px,4vw,36px)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]", className)}>
      <svg viewBox="0 0 400 300" aria-hidden="true" className="mx-auto block h-auto w-full max-w-[400px]">
        {[...layers].reverse().map((l, ri) => {
          const i = layers.length - 1 - ri;
          const y = 70 + i * 80;
          return (
            <g key={l.num}>
              <path
                d={`M${cx} ${y - 58} L${cx + 190} ${y} L${cx} ${y + 58} L${cx - 190} ${y} Z`}
                fill={l.color}
                fillOpacity="0.14"
                stroke={l.color}
                strokeOpacity="0.85"
                strokeWidth="1.4"
              />
              <path d={`M${cx - 190} ${y} L${cx - 190} ${y + 10} L${cx} ${y + 68} L${cx + 190} ${y + 10} L${cx + 190} ${y}`} fill="none" stroke={l.color} strokeOpacity="0.35" />
            </g>
          );
        })}
      </svg>
      <ol className="m-0 flex list-none flex-col gap-5 p-0">
        {layers.map((l) => (
          <li key={l.num} className="min-w-0">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em]" style={{ color: l.color }}>
              {l.num} {l.name}
            </p>
            <p className="mt-1.5 text-[14px] leading-snug text-white/65">{l.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
