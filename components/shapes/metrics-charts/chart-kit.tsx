// Shared, server-safe helpers for the metrics and charts shapes: value formats that can
// cross the server/client boundary as plain strings, nice axis maths, monotone line paths,
// arcs, and a few tiny presentational pieces (captions, legends, provenance tags, empty
// plots). No hooks here, so both server demos and client charts can import it.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  UNAVAILABLE,
  formatCompact,
  formatCurrency,
  formatFixed,
  formatLatency,
  formatNumber,
  formatPercent,
  formatQuirqs,
  formatRatio,
  formatTokens,
  type Maybe,
} from "@/lib/format";
import { PROVENANCE_META, type Provenance } from "@/lib/fixtures";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ value formats */

/**
 * Named value formats. Charts take one of these strings (not a function) so a server
 * component can hand data straight to a client chart.
 */
export type ValueFormat =
  | "number"
  | "decimal1"
  | "decimal2"
  | "fixed2"
  | "compact"
  | "tokens"
  | "tokensUnit"
  | "currency"
  | "currency0"
  | "latency"
  | "percent"
  | "percent1"
  | "quirqs"
  | "quirqs1"
  | "ratio"
  | "hours";

/** Formats a value by name. Missing values always read "Unavailable", never 0. */
export function formatValue(n: Maybe<number>, kind: ValueFormat = "number"): string {
  if (n === null || n === undefined || Number.isNaN(n)) return UNAVAILABLE;
  switch (kind) {
    case "decimal1":
      return formatNumber(n, 1);
    case "decimal2":
      return formatNumber(n, 2);
    case "fixed2":
      return formatFixed(n, 2);
    case "compact":
    case "tokens":
      return formatCompact(n);
    case "tokensUnit":
      return formatTokens(n);
    case "currency":
      return formatCurrency(n);
    case "currency0":
      return formatCurrency(n, 0);
    case "latency":
      return formatLatency(n);
    case "percent":
      return formatPercent(n);
    case "percent1":
      return formatPercent(n, 1);
    case "quirqs":
      return formatQuirqs(n);
    case "quirqs1":
      return formatQuirqs(n, 1);
    case "ratio":
      return formatRatio(n);
    case "hours":
      return `${formatFixed(n, 1)} hours`;
    default:
      return formatNumber(n);
  }
}

/** Short axis tick text: compact magnitudes, currency without cents, latency in seconds. */
export function formatTick(n: number, kind: ValueFormat = "number"): string {
  if (n === 0) return kind === "currency" || kind === "currency0" ? "$0" : "0";
  switch (kind) {
    case "currency":
    case "currency0":
      return n < 10 ? `$${formatNumber(n, 1)}` : `$${formatCompact(n)}`;
    case "latency":
      return `${formatNumber(n / 1000, 1)}s`;
    case "percent":
    case "percent1":
      return formatPercent(n);
    case "quirqs":
    case "quirqs1":
    case "ratio":
    case "hours":
      return formatNumber(n, 1);
    default:
      return formatCompact(n);
  }
}

/* ------------------------------------------------------------------ axis maths */

/** Rounds a maximum up so `count` grid steps land on clean values (1, 2, 2.5, 3, 4, 5, 6, 8). */
export function niceScale(max: number, count = 3): number {
  if (!Number.isFinite(max) || max <= 0) return 1;
  const raw = max / count;
  const p = 10 ** Math.floor(Math.log10(raw));
  const steps = [1, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = (steps.find((s) => s * p >= raw - 1e-9) ?? 10) * p;
  return step * count;
}

/** Evenly spaced tick values from min to max (inclusive), `count` intervals. */
export function ticks(min: number, max: number, count = 3): number[] {
  return Array.from({ length: count + 1 }, (_, i) => min + ((max - min) * i) / count);
}

/** Picks about `want` indices out of n, always including the first and the last. */
export function pickIndices(n: number, want: number): number[] {
  if (n <= 0) return [];
  if (n <= want) return Array.from({ length: n }, (_, i) => i);
  const step = Math.max(1, Math.ceil((n - 1) / Math.max(1, want - 1)));
  const out: number[] = [];
  for (let i = 0; i < n; i += step) out.push(i);
  const last = out[out.length - 1];
  if (last !== n - 1) {
    if (n - 1 - last < step / 2) out[out.length - 1] = n - 1;
    else out.push(n - 1);
  }
  return out;
}

/** On phones every other x label hides, counted from the last so the end label never collides. */
export function hideTickOnPhone(k: number, count: number): boolean {
  if (k === 0 || k === count - 1) return false;
  return k === 1 || (count - 1 - k) % 2 === 1;
}

export function finiteValues(values: (number | null | undefined)[]): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

/* ------------------------------------------------------------------ paths */

export type Pt = [number, number];

/** Monotone cubic (Fritsch and Carlson) through the points: smooth, never overshoots. */
export function monotonePath(pts: Pt[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  if (n === 2) return `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}L${pts[1][0].toFixed(2)} ${pts[1][1].toFixed(2)}`;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1));
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  m.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += `C${(x0 + h).toFixed(2)} ${(y0 + m[i] * h).toFixed(2)} ${(x1 - h).toFixed(2)} ${(y1 - m[i + 1] * h).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

/** Straight segments through the points. */
export function linearPath(pts: Pt[]): string {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
}

/** Splits a series at nulls into runs of [index, value] pairs, so gaps break the line. */
export function runsOf(values: (number | null | undefined)[]): { i: number; v: number }[][] {
  const runs: { i: number; v: number }[][] = [];
  let cur: { i: number; v: number }[] = [];
  values.forEach((v, i) => {
    if (typeof v === "number" && Number.isFinite(v)) cur.push({ i, v });
    else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  });
  if (cur.length) runs.push(cur);
  return runs;
}

/** Point on a circle; angle in degrees, 0 at twelve o'clock, clockwise. */
export function polar(cx: number, cy: number, r: number, deg: number): Pt {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Open arc along a circle from a0 to a1 degrees (clockwise). */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const sweep = Math.min(Math.max(a1 - a0, 0), 359.99);
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a0 + sweep);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** Filled ring sector (donut slice) from a0 to a1 degrees. */
export function sectorPath(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number): string {
  const sweep = Math.min(Math.max(a1 - a0, 0), 359.99);
  const e = a0 + sweep;
  const big = sweep > 180 ? 1 : 0;
  const [x0, y0] = polar(cx, cy, ro, a0);
  const [x1, y1] = polar(cx, cy, ro, e);
  const [x2, y2] = polar(cx, cy, ri, e);
  const [x3, y3] = polar(cx, cy, ri, a0);
  const f = (n: number) => n.toFixed(2);
  return `M${f(x0)} ${f(y0)}A${ro} ${ro} 0 ${big} 1 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${ri} ${ri} 0 ${big} 0 ${f(x3)} ${f(y3)}Z`;
}

/** A useId value made safe for SVG url(#id) references. */
export function svgId(raw: string, suffix = ""): string {
  return `q${raw.replace(/[^a-zA-Z0-9_-]/g, "")}${suffix}`;
}

/* ------------------------------------------------------------------ small pieces */

/** Keeps "quirq" lowercase inside uppercase kickers: the unit is never capitalized. */
export function keepQuirq(text: ReactNode): ReactNode {
  if (typeof text !== "string" || !/quirq/.test(text)) return text;
  return text.split(/(quirqs?)/g).map((part, i) =>
    /^quirqs?$/.test(part) ? (
      <span key={i} className="normal-case">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** The demo caption style: mono, uppercase, faint. */
export function Caption({ children, className, as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "h3" | "h4" | "span" }) {
  return <Tag className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint", className)}>{keepQuirq(children)}</Tag>;
}

/** A captioned demo cell: caption on top, content below. */
export function DemoCell({ caption, children, className }: { caption: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <Caption>{caption}</Caption>
      {children}
    </div>
  );
}

const PROVENANCE_TONE = { live: "grn", mock: "neutral", illustrative: "org" } as const;

/** Where a number came from: Live, Mock or Illustrative. Never present mock as live. */
export function ProvenanceTag({ provenance, className, title }: { provenance: Provenance; className?: string; title?: string }) {
  const meta = PROVENANCE_META[provenance];
  return (
    <Badge tone={PROVENANCE_TONE[provenance]} mono size="xs" dot={provenance === "live"} className={className} title={title ?? meta.note}>
      {meta.label}
    </Badge>
  );
}

/** Legend row; the key mirrors the mark (line for lines, square for bars and areas). */
export function Legend({
  items,
  className,
}: {
  items: { key: string; label: ReactNode; color: string; mark?: "line" | "dash" | "square" | "band" }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-ink-dim", className)}>
      {items.map((it) => (
        <li key={it.key} className="inline-flex items-center gap-1.5">
          <LegendKey color={it.color} mark={it.mark ?? "square"} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function LegendKey({ color, mark = "square" }: { color: string; mark?: "line" | "dash" | "square" | "band" }) {
  if (mark === "line" || mark === "dash") {
    return (
      <svg width="14" height="6" viewBox="0 0 14 6" aria-hidden="true" className="shrink-0">
        <line x1="1" y1="3" x2="13" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={mark === "dash" ? "2 3" : undefined} />
      </svg>
    );
  }
  if (mark === "band") {
    return <span aria-hidden="true" className="h-2.5 w-3.5 shrink-0 rounded-[2px]" style={{ background: `color-mix(in srgb, ${color} 28%, transparent)` }} />;
  }
  return <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[2px]" style={{ background: color }} />;
}

/** Plot-sized empty state: "No data in this window". Keeps the frame, never draws zeros. */
export function EmptyPlot({ message, height = 160, className, children }: { message: ReactNode; height?: number; className?: string; children?: ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border border-dashed border-hair text-center",
        className,
      )}
      style={{ minHeight: height }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-dashed border-white/[0.07]" />
      <p className="relative bg-[#0f0f11] px-2 text-[12.5px] text-ink-dim">{message}</p>
      {children ? <div className="relative bg-[#0f0f11] px-2 text-[11.5px] text-ink-faint">{children}</div> : null}
    </div>
  );
}

/** Tooltip box used by every chart: value first, label second, line keys. */
export function TooltipBox({
  title,
  rows,
  footnote,
  className,
}: {
  title: ReactNode;
  rows: { key: string; label: ReactNode; value: ReactNode; color?: string; mark?: "line" | "square" | "band"; muted?: boolean }[];
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none min-w-[9.5rem] max-w-[min(240px,calc(100vw-48px))] rounded-[8px] border border-hair-strong bg-s3/95 px-2.5 py-2 text-[11.5px] leading-snug shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur-sm",
        className,
      )}
    >
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">{keepQuirq(title)}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2">
            {r.color ? <LegendKey color={r.color} mark={r.mark ?? "line"} /> : <span className="w-3.5 shrink-0" aria-hidden="true" />}
            <span className="min-w-0 flex-1 truncate text-ink-dim">{r.label}</span>
            <span className={cn("shrink-0 font-mono tabular-nums", r.muted ? "text-ink-faint" : "font-medium text-ink")}>{r.value}</span>
          </li>
        ))}
      </ul>
      {footnote ? <p className="mt-1.5 border-t border-hair-soft pt-1.5 text-[10.5px] text-ink-faint">{footnote}</p> : null}
    </div>
  );
}

/** Signed change with direction and whether up is good: "+4.9% vs previous 7 days". */
export function Delta({
  value,
  upIsGood = true,
  neutral = false,
  suffix,
  className,
}: {
  /** ratio change, such as 0.049 for +4.9%; null reads Unavailable */
  value: number | null;
  upIsGood?: boolean;
  /** direction only, no judgement (usage volume) */
  neutral?: boolean;
  suffix?: ReactNode;
  className?: string;
}) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={cn("text-[11.5px] text-ink-faint", className)}>{UNAVAILABLE}{suffix ? <> {suffix}</> : null}</span>;
  }
  const flat = Math.abs(value) < 0.0005;
  const up = value > 0;
  const good = flat || neutral ? null : up === upIsGood;
  const sign = flat ? "" : up ? "+" : "−";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11.5px]", className)}>
      <span className={cn("font-mono tabular-nums", good === null ? "text-ink-dim" : good ? "text-grn" : "text-red")}>
        <span aria-hidden="true">{flat ? "·" : up ? "▲" : "▼"}</span> {sign}
        {formatPercent(Math.abs(value), 1)}
      </span>
      {suffix ? <span className="text-ink-faint">{suffix}</span> : null}
    </span>
  );
}
