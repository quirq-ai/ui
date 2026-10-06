"use client";

// Rings, donut and gauge: ActivityRings (CPU, memory and disk as concentric rings with a
// stats list), Donut (share of a total with a center readout; the hovered slice grows
// 6px), RadialGauge (one ratio on a 270 degree arc, warn color past a threshold, track only
// at zero) and ConcentricRadar (where spaces run, by trust boundary, with a slow sweep).
// Every chart keeps a text list beside it, so identity never rests on color alone.
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { UNAVAILABLE } from "@/lib/format";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import { LoadingLine } from "@/components/ui/loaders";
import { TooltipBox, arcPath, formatValue, polar, sectorPath, svgId, type ValueFormat } from "./chart-kit";

const SURFACE = "#0f0f11";
const TRACK = "rgba(255,255,255,0.075)";

/* ============================================================================ ActivityRings */

export type RingDatum = {
  key: string;
  label: string;
  /** null when the space cannot report it: empty track, reads Unavailable */
  used: number | null;
  total: number;
  color: string;
  /** "18.4 GB of 50 GB" */
  detail?: string;
  /** the stat could not be read */
  error?: boolean;
};

export type ActivityRingsProps = {
  /** outer ring first */
  rings: RingDatum[];
  loading?: boolean;
  /** px */
  size?: number;
  "aria-label": string;
  className?: string;
};

/** Concentric usage rings with a stats list; hover or focus a row to isolate its ring. */
export function ActivityRings({ rings, loading = false, size = 132, "aria-label": ariaLabel, className }: ActivityRingsProps) {
  const uid = svgId(useId());
  const [active, setActive] = useState<string | null>(null);
  const stroke = 12;
  const gap = 2.5;
  const c = 66;

  return (
    <div className={cn("@container min-w-0", className)}>
      <div className="flex flex-col items-center gap-4 @[290px]:flex-row">
        <svg
          role="img"
          aria-label={loading ? `${ariaLabel}: loading` : ariaLabel}
          width={size}
          height={size}
          viewBox="0 0 132 132"
          className={cn("shrink-0", loading && "animate-pulse")}
        >
          <defs>
            {rings.map((r) => (
              <linearGradient key={r.key} id={`${uid}-${r.key}`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor={r.color} stopOpacity={0.6} />
                <stop offset="50%" stopColor={r.color} stopOpacity={0.85} />
                <stop offset="100%" stopColor={r.color} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
          {rings.map((r, k) => {
            const radius = c - stroke / 2 - k * (stroke + gap);
            const ratio = r.used === null || r.error || loading ? 0 : Math.min(1, Math.max(0, r.used / (r.total || 1)));
            const dim = active !== null && active !== r.key;
            return (
              <g key={r.key} style={{ opacity: dim ? 0.3 : 1, transition: "opacity 150ms" }}>
                <circle cx={c} cy={c} r={radius} fill="none" stroke={TRACK} strokeWidth={stroke} />
                {ratio > 0 ? (
                  <path
                    d={arcPath(c, c, radius, 0, Math.max(ratio * 360, 4))}
                    fill="none"
                    stroke={`url(#${uid}-${r.key})`}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        {loading ? (
          <LoadingLine>Loading stats…</LoadingLine>
        ) : (
          <ul className="flex w-full min-w-0 flex-col gap-1 @[290px]:w-auto @[290px]:flex-1" onPointerLeave={() => setActive(null)}>
            {rings.map((r) => {
              const ratio = r.used === null ? null : r.used / (r.total || 1);
              return (
                <li
                  key={r.key}
                  tabIndex={0}
                  onPointerEnter={() => setActive(r.key)}
                  onFocus={() => setActive(r.key)}
                  onBlur={() => setActive(null)}
                  className={cn("min-w-0 rounded-[6px] px-1.5 py-0.5 transition-colors", active === r.key && "bg-white/[0.05]")}
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-ink">
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />
                    {r.label}
                    <span className="ml-auto pl-2 font-mono text-[11px] font-normal tabular-nums text-ink-dim">
                      {r.error || ratio === null ? "" : formatValue(ratio, "percent1")}
                    </span>
                  </span>
                  <span className={cn("block truncate pl-3.5 font-mono text-[11px] tabular-nums", r.error ? "text-red" : r.used === null ? "text-ink-faint" : "text-ink-dim")}>
                    {r.error ? "Could not read" : r.used === null ? UNAVAILABLE : r.detail ?? formatValue(r.used)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================================================================ Donut */

export type DonutSegment = { key: string; label: string; value: number; color: string };

export type DonutProps = {
  segments: DonutSegment[];
  format?: ValueFormat;
  /** center readout when nothing is hovered */
  center: { value: string; label: string };
  /** px */
  size?: number;
  legend?: "right" | "bottom";
  emptyMessage?: string;
  "aria-label": string;
  className?: string;
};

/** Share of a total. Hovering a slice or a legend row grows that slice and fills the center. */
export function Donut({
  segments,
  format = "number",
  center,
  size = 220,
  legend = "right",
  emptyMessage = "No usage in this window",
  "aria-label": ariaLabel,
  className,
}: DonutProps) {
  const [active, setActive] = useState<string | null>(null);
  const rows = segments.filter((s) => s.value > 0);
  const total = rows.reduce((a, s) => a + s.value, 0);
  const R = 104;
  const r0 = R * 0.64;
  const empty = rows.length === 0;
  const hit = rows.find((s) => s.key === active);
  let a = 0;

  return (
    <div className={cn("flex min-w-0 gap-5", legend === "right" ? "flex-col items-center sm:flex-row" : "flex-col items-center", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg role="img" aria-label={empty ? `${ariaLabel}: ${emptyMessage}` : ariaLabel} viewBox="0 0 240 240" width={size} height={size} onPointerLeave={() => setActive(null)}>
          {empty ? (
            <circle cx="120" cy="120" r={(R + r0) / 2} fill="none" stroke={TRACK} strokeWidth={R - r0} />
          ) : (
            rows.map((s) => {
              const sweep = (s.value / total) * 360;
              const a0 = a;
              a += sweep;
              const on = active === s.key;
              return (
                <path
                  key={s.key}
                  d={sectorPath(120, 120, on ? R + 6 : R, r0, a0, a0 + sweep)}
                  fill={s.color}
                  stroke={SURFACE}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  onPointerEnter={() => setActive(s.key)}
                  style={{ opacity: active !== null && !on ? 0.45 : 1, transition: "opacity 150ms" }}
                />
              );
            })
          )}
        </svg>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          {empty ? (
            <span className="text-[12px] leading-snug text-ink-faint">{emptyMessage}</span>
          ) : hit ? (
            <>
              <span className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-ink">{formatValue(hit.value, format)}</span>
              <span className="mt-1.5 max-w-full truncate text-[11.5px] text-ink-dim">
                {hit.label} · {formatValue(hit.value / total, "percent")}
              </span>
            </>
          ) : (
            <>
              <span className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">{center.value}</span>
              <span className="mt-1.5 text-[11.5px] text-ink-dim">{center.label}</span>
            </>
          )}
        </div>
      </div>

      {empty ? null : (
        <ul className={cn("flex min-w-0 flex-col gap-0.5", legend === "bottom" && "w-full")} onPointerLeave={() => setActive(null)}>
          {rows.map((s) => (
            <li
              key={s.key}
              tabIndex={0}
              onPointerEnter={() => setActive(s.key)}
              onFocus={() => setActive(s.key)}
              onBlur={() => setActive(null)}
              className={cn(
                "grid grid-cols-[10px_minmax(0,1fr)_auto_auto] items-center gap-x-2.5 rounded-[6px] px-1.5 py-1 text-[12px] transition-colors",
                active === s.key && "bg-white/[0.05]",
              )}
            >
              <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
              <span className="truncate text-ink-dim">{s.label}</span>
              <span className="text-right font-mono text-[11.5px] tabular-nums text-ink">{formatValue(s.value, format)}</span>
              <span className="w-[38px] text-right font-mono text-[11px] tabular-nums text-ink-faint">{formatValue(s.value / total, "percent")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================================ RadialGauge */

export type RadialGaugeProps = {
  /** the measured ratio; null reads Unavailable, 0 shows only the track */
  value: number | null;
  /** full-scale value of the arc, such as 0.2 for a 0 to 20% gauge */
  max?: number;
  /** big center text, such as "0.8%" */
  text: string;
  /** muted line under it, such as "21 errors" */
  label?: ReactNode;
  /** past this ratio the arc switches to the warn tone */
  threshold?: number;
  tone?: string;
  warnTone?: string;
  /** end labels at the arc ends */
  scale?: [string, string];
  size?: number;
  "aria-label": string;
  className?: string;
};

/** One ratio on a 270 degree arc: healthy tone below the threshold, warn tone above. */
export function RadialGauge({
  value,
  max = 1,
  text,
  label,
  threshold,
  tone = "var(--grn)",
  warnTone = "var(--red)",
  scale,
  size = 170,
  "aria-label": ariaLabel,
  className,
}: RadialGaugeProps) {
  const c = 100;
  const R = 84;
  const sw = Math.max(10, R * 0.2);
  const r = R - sw / 2;
  const start = -135;
  const sweep = 270;
  const frac = value === null ? 0 : Math.min(1, Math.max(0, value / max));
  const warn = value !== null && threshold !== undefined && value > threshold;
  const color = warn ? warnTone : tone;
  const [sx, sy] = polar(c, c, r, start);
  const [ex, ey] = polar(c, c, r, start + sweep);

  return (
    <figure className={cn("flex min-w-0 flex-col items-center", className)} style={{ width: size, maxWidth: "100%" }}>
      <div className="relative w-full" style={{ aspectRatio: "200 / 178" }}>
        <svg role="img" aria-label={`${ariaLabel}: ${value === null ? UNAVAILABLE : text}`} viewBox="0 0 200 178" className="absolute inset-0 h-full w-full">
          <path d={arcPath(c, c, r, start, start + sweep)} fill="none" stroke={TRACK} strokeWidth={sw} strokeLinecap="round" />
          {frac > 0 ? (
            <path d={arcPath(c, c, r, start, start + Math.max(sweep * frac, 1.5))} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
          ) : null}
          {threshold !== undefined && threshold < max
            ? (() => {
                const [tx0, ty0] = polar(c, c, r - sw / 2 - 3, start + (sweep * threshold) / max);
                const [tx1, ty1] = polar(c, c, r + sw / 2 + 3, start + (sweep * threshold) / max);
                return <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} strokeDasharray="2 2" />;
              })()
            : null}
          {scale ? (
            <>
              <text x={sx} y={sy + 24} textAnchor="middle" className="fill-ink-faint font-mono text-[12.5px]">
                {scale[0]}
              </text>
              <text x={ex} y={ey + 24} textAnchor="middle" className="fill-ink-faint font-mono text-[12.5px]">
                {scale[1]}
              </text>
            </>
          ) : null}
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-[56%] -translate-y-1/2 text-center leading-none",
            value === null ? "text-[13px] font-medium text-ink-faint" : "text-[clamp(20px,2.4vw,26px)] font-semibold tracking-[-0.02em] text-ink",
          )}
        >
          {value === null ? UNAVAILABLE : text}
        </span>
      </div>
      {label || warn ? (
        <figcaption className="mt-2 flex flex-col items-center gap-1 text-center">
          {label ? <span className="text-[11.5px] leading-snug text-ink-dim">{label}</span> : null}
          {warn ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-red">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-red" />
              Above threshold
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ============================================================================ ConcentricRadar */

export type RadarBlip = {
  id: string;
  label: string;
  /** ring index, inner first */
  ring: number;
  /** degrees, 0 at twelve o'clock, clockwise */
  angle: number;
  status: DotStatus;
  /** one line for the tooltip and the list, such as "Laptop · Running" */
  detail: string;
};

export type ConcentricRadarProps = {
  /** ring names, inner first */
  rings: string[];
  blips: RadarBlip[];
  /** slow rotating sweep; reduced motion leaves it still */
  sweep?: boolean;
  /** px, square */
  size?: number;
  "aria-label": string;
  className?: string;
};

/** Concentric rings with labelled blips. Hover, focus or tap a blip for its detail; Escape clears. */
export function ConcentricRadar({ rings, blips, sweep = true, size = 284, "aria-label": ariaLabel, className }: ConcentricRadarProps) {
  const uid = svgId(useId());
  const [active, setActive] = useState<string | null>(null);
  const c = 142;
  const outer = 128;
  const step = outer / rings.length;
  const radiusOf = (ring: number) => step * ring + step * 0.62;
  const hit = blips.find((b) => b.id === active);

  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-4", className)}>
      <div className="relative aspect-square w-full" style={{ maxWidth: size }} role="group" aria-label={ariaLabel} onKeyDown={(e) => e.key === "Escape" && setActive(null)}>
        <svg aria-hidden="true" viewBox="0 0 284 284" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(46,155,255,0.16)" />
              <stop offset="100%" stopColor="rgba(46,155,255,0)" />
            </radialGradient>
          </defs>
          <circle cx={c} cy={c} r={outer} fill={`url(#${uid}-core)`} />
          {rings.map((_, k) => (
            <circle key={k} cx={c} cy={c} r={step * (k + 1)} fill="none" stroke={k === rings.length - 1 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"} strokeDasharray={k === rings.length - 1 ? undefined : "3 4"} />
          ))}
          {[0, 45, 90, 135].map((deg) => {
            const [x0, y0] = polar(c, c, outer, deg);
            const [x1, y1] = polar(c, c, outer, deg + 180);
            return <line key={deg} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(255,255,255,0.05)" />;
          })}
          {rings.map((name, k) => {
            const [x, y] = polar(c, c, step * (k + 1) - 4, 0);
            return (
              <text key={name} x={x} y={y + 11} textAnchor="middle" className="fill-ink-dim font-mono text-[9px] uppercase tracking-[0.1em]">
                {name}
              </text>
            );
          })}
          <circle cx={c} cy={c} r={3} fill="var(--ink)" />
        </svg>
        {sweep ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              inset: `${((c - outer) / 284) * 100}%`,
              background: "conic-gradient(from 0deg, rgba(46,155,255,0) 0deg, rgba(46,155,255,0) 300deg, rgba(46,155,255,0.22) 360deg)",
              animation: "q-spin 9s linear infinite",
            }}
          />
        ) : null}
        {blips.map((b) => {
          const [x, y] = polar(c, c, radiusOf(b.ring), b.angle);
          const on = active === b.id;
          return (
            <button
              key={b.id}
              type="button"
              aria-label={`${b.label}: ${b.detail}`}
              onPointerEnter={() => setActive(b.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(b.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(on ? null : b.id)}
              className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full!"
              style={{ left: `${(x / 284) * 100}%`, top: `${(y / 284) * 100}%` }}
            >
              <StatusDot status={b.status} size={on ? "lg" : "md"} pulse={b.status === "busy"} />
            </button>
          );
        })}
        {hit
          ? (() => {
              const [x, y] = polar(c, c, radiusOf(hit.ring), hit.angle);
              const right = x / 284 > 0.5;
              return (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10"
                  style={{ left: `${(x / 284) * 100}%`, top: `${(y / 284) * 100}%`, transform: right ? "translate(calc(-100% - 16px), -50%)" : "translate(16px, -50%)" }}
                >
                  <TooltipBox title={rings[hit.ring]} rows={[{ key: hit.id, label: hit.label, value: "" }]} footnote={hit.detail} />
                </div>
              );
            })()
          : null}
      </div>
      <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11.5px] text-ink-dim">
        {blips.map((b) => (
          <li key={b.id} className={cn("inline-flex items-center gap-1.5", active === b.id && "text-ink")}>
            <StatusDot status={b.status} size="xs" halo={false} />
            <span className="font-medium">{b.label}</span>
            <span className="text-ink-faint">{b.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
