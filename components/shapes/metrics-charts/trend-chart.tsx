"use client";

// Area, line and sparkline charts. One responsive SVG per plot (stretched with
// preserveAspectRatio="none" and non-scaling strokes) with HTML for every piece of text,
// the dots, the crosshair and the tooltip, so text never distorts and nothing needs to
// measure the container. Hover snaps a crosshair to the nearest point; the plot is also
// keyboard operable (arrows, Home, End, Escape) and carries a screen-reader data table.
import { useId, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { UNAVAILABLE } from "@/lib/format";
import type { Provenance } from "@/lib/fixtures";
import {
  EmptyPlot,
  Legend,
  ProvenanceTag,
  TooltipBox,
  finiteValues,
  formatTick,
  formatValue,
  hideTickOnPhone,
  keepQuirq,
  linearPath,
  monotonePath,
  niceScale,
  pickIndices,
  runsOf,
  svgId,
  ticks,
  type Pt,
  type ValueFormat,
} from "./chart-kit";

const SPECTRUM = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#2fd2ff", "#2e9bff", "#bf5af2"];
const VBW = 1000;
const SURFACE = "#0f0f11";

/* ============================================================================ TrendChart */

/** "2.9 s to 7.2 s", or Unavailable when either edge of the band is missing. */
function bandText(band: { lower: (number | null)[]; upper: (number | null)[] }, i: number, format: ValueFormat): string {
  const lo = band.lower[i];
  const hi = band.upper[i];
  return lo === null || lo === undefined || hi === null || hi === undefined ? UNAVAILABLE : `${formatValue(lo, format)} to ${formatValue(hi, format)}`;
}

export type TrendSeries = {
  key: string;
  label: string;
  /** any CSS color, usually a brand token such as var(--blu) */
  color: string;
  /** null is a telemetry gap: the line breaks and the tooltip reads Unavailable */
  values: (number | null)[];
  /** soft gradient wash under the line */
  area?: boolean;
  dashed?: boolean;
  /** draw the stroke with the brand spectrum (quirq series only) */
  spectrum?: boolean;
};

export type TrendBand = {
  key: string;
  label: string;
  color: string;
  lower: (number | null)[];
  upper: (number | null)[];
};

export type TrendChartProps = {
  /** full label per point, used in the tooltip ("Thu 1 Oct") */
  labels: string[];
  /** shorter axis labels ("1 Oct"); defaults to labels */
  axisLabels?: string[];
  series: TrendSeries[];
  /** shaded range behind the lines, such as p50 to p95 latency */
  band?: TrendBand;
  format?: ValueFormat;
  /** plot height in px */
  height?: number;
  yMin?: number;
  yMax?: number;
  gridLines?: number;
  /** about how many x labels to show */
  xTicks?: number;
  legend?: boolean;
  /** direct label on the last point of the first series */
  endLabel?: boolean;
  smooth?: boolean;
  yAxis?: boolean;
  emptyMessage?: ReactNode;
  /** small print under the tooltip rows */
  footnote?: string;
  "aria-label": string;
  className?: string;
};

/** Line or area chart over time with a dashed grid, gradient areas, a band, and a crosshair tooltip. */
export function TrendChart({
  labels,
  axisLabels,
  series,
  band,
  format = "number",
  height = 180,
  yMin,
  yMax,
  gridLines = 3,
  xTicks = 5,
  legend,
  endLabel = false,
  smooth = true,
  yAxis = true,
  emptyMessage = "No data in this window",
  footnote,
  "aria-label": ariaLabel,
  className,
}: TrendChartProps) {
  const rawId = useId();
  const uid = svgId(rawId);
  const [active, setActive] = useState<number | null>(null);
  const n = labels.length;
  const all = [...series.flatMap((s) => finiteValues(s.values)), ...(band ? finiteValues(band.upper) : [])];

  if (n === 0 || all.length === 0) {
    return (
      <figure className={cn("min-w-0", className)}>
        <EmptyPlot message={emptyMessage} height={height + 22} />
        <figcaption className="sr-only">{ariaLabel}: {typeof emptyMessage === "string" ? emptyMessage : "no data"}</figcaption>
      </figure>
    );
  }

  const lo = yMin ?? 0;
  const hi = yMax ?? niceScale(Math.max(...all), gridLines);
  const H = height;
  const pad = 6;
  const xAt = (i: number) => (n === 1 ? VBW / 2 : (VBW * i) / (n - 1));
  const yAt = (v: number) => pad + (H - 2 * pad) * (1 - (v - lo) / (hi - lo || 1));
  const pct = (i: number) => (xAt(i) / VBW) * 100;
  const path = smooth ? monotonePath : linearPath;
  const showLegend = legend ?? series.length + (band ? 1 : 0) > 1;
  const primary = series[0];
  const gaps = primary ? primary.values.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0) : [];
  const tickVals = ticks(lo, hi, gridLines);
  const xIdx = pickIndices(n, xTicks);
  const ax = axisLabels ?? labels;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const f = r.width ? (e.clientX - r.left) / r.width : 0;
    setActive(Math.max(0, Math.min(n - 1, Math.round(f * (n - 1)))));
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    let next: number | null | undefined;
    if (e.key === "ArrowRight") next = Math.min(n - 1, (active ?? -1) + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, (active ?? n) - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
  }

  const readout =
    active === null
      ? ""
      : `${labels[active]}: ${[
          ...series.map((s) => `${s.label} ${formatValue(s.values[active], format)}`),
          ...(band ? [`${band.label} ${bandText(band, active, format)}`] : []),
        ].join(", ")}`;

  const leftGutter = yAxis ? 46 : 0;
  const last = primary ? [...primary.values].reverse().findIndex((v) => v !== null) : -1;
  const lastIdx = last >= 0 ? n - 1 - last : -1;

  return (
    <figure className={cn("min-w-0", className)}>
      <div
        role="group"
        aria-label={`${ariaLabel}. Use the arrow keys to read each point.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setActive((a) => (a === null ? n - 1 : a))}
        onBlur={() => setActive(null)}
        className="relative select-none rounded-[8px]"
        style={{ height: H + 24 }}
      >
        {/* y axis */}
        {yAxis ? (
          <div aria-hidden="true" className="absolute left-0 top-0" style={{ width: leftGutter - 8, height: H }}>
            {tickVals.map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 font-mono text-[10.5px] tabular-nums text-ink-faint"
                style={{ top: yAt(t) }}
              >
                {formatTick(t, format)}
              </span>
            ))}
          </div>
        ) : null}

        {/* plot */}
        <div className="absolute right-0 top-0" style={{ left: leftGutter, height: H }}>
          {tickVals.map((t, k) => (
            <div
              key={t}
              aria-hidden="true"
              className={cn("absolute inset-x-0 border-t", k === 0 ? "border-solid border-white/[0.12]" : "border-dashed border-white/[0.07]")}
              style={{ top: yAt(t) }}
            />
          ))}
          {gaps.map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="absolute bottom-0 top-0 border-l border-dashed border-white/25"
              style={{ left: `${pct(i)}%` }}
            />
          ))}

          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${VBW} ${H}`}
            preserveAspectRatio="none"
          >
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${uid}-a-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
              <linearGradient id={`${uid}-spec`} x1="0" y1="0" x2={VBW} y2="0" gradientUnits="userSpaceOnUse">
                {SPECTRUM.map((c, i) => (
                  <stop key={c} offset={`${(i / (SPECTRUM.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            </defs>

            {band
              ? runsOf(band.lower.map((l, i) => (l !== null && band.upper[i] !== null ? l : null))).map((run) => {
                  const up: Pt[] = run.map(({ i }) => [xAt(i), yAt(band.upper[i] as number)]);
                  const down: Pt[] = run.map(({ i, v }) => [xAt(i), yAt(v)]).reverse() as Pt[];
                  const d = `${path(up)}L${down[0][0].toFixed(2)} ${down[0][1].toFixed(2)}${path(down).replace(/^M[^A-Z]*/, "")}Z`;
                  return (
                    <path
                      key={`band-${run[0].i}`}
                      d={d}
                      fill={`color-mix(in srgb, ${band.color} 15%, transparent)`}
                      stroke="none"
                    />
                  );
                })
              : null}

            {series.map((s) =>
              runsOf(s.values).map((run) => {
                const pts: Pt[] = run.map(({ i, v }) => [xAt(i), yAt(v)]);
                const line = path(pts);
                const base = yAt(lo);
                return (
                  <g key={`${s.key}-${run[0].i}`}>
                    {s.area && pts.length > 1 ? (
                      <path
                        d={`${line}L${pts[pts.length - 1][0].toFixed(2)} ${base}L${pts[0][0].toFixed(2)} ${base}Z`}
                        fill={`url(#${uid}-a-${s.key})`}
                        stroke="none"
                      />
                    ) : null}
                    <path
                      d={line}
                      fill="none"
                      stroke={s.spectrum ? `url(#${uid}-spec)` : s.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={s.dashed ? "5 5" : undefined}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              }),
            )}
          </svg>

          {/* single isolated points (a run of one) still need a mark */}
          {series.map((s) =>
            runsOf(s.values)
              .filter((r) => r.length === 1)
              .map((r) => (
                <span
                  key={`${s.key}-solo-${r[0].i}`}
                  aria-hidden="true"
                  className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${pct(r[0].i)}%`, top: yAt(r[0].v), background: s.color }}
                />
              )),
          )}

          {endLabel && primary && lastIdx >= 0 && active === null ? (
            <>
              <span
                aria-hidden="true"
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: `${pct(lastIdx)}%`, top: yAt(primary.values[lastIdx] as number), background: primary.spectrum ? SPECTRUM[6] : primary.color, boxShadow: `0 0 0 2px ${SURFACE}` }}
              />
              <span
                aria-hidden="true"
                className="absolute -translate-x-full -translate-y-[150%] whitespace-nowrap pr-1 font-mono text-[10.5px] font-medium tabular-nums text-ink"
                style={{ left: `${pct(lastIdx)}%`, top: yAt(primary.values[lastIdx] as number) }}
              >
                {formatValue(primary.values[lastIdx], format)}
              </span>
            </>
          ) : null}

          {active !== null ? (
            <>
              <div aria-hidden="true" className="absolute bottom-0 top-0 w-px bg-white/30" style={{ left: `${pct(active)}%` }} />
              {series.map((s) => {
                const v = s.values[active];
                if (v === null || v === undefined) return null;
                return (
                  <span
                    key={s.key}
                    aria-hidden="true"
                    className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ left: `${pct(active)}%`, top: yAt(v), background: s.spectrum ? SPECTRUM[6] : s.color, boxShadow: `0 0 0 2px ${SURFACE}` }}
                  />
                );
              })}
              <div
                aria-hidden="true"
                className="absolute top-1 z-10"
                style={{
                  left: `${pct(active)}%`,
                  transform: pct(active) > 55 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
                }}
              >
                <TooltipBox
                  title={labels[active]}
                  footnote={footnote}
                  rows={[
                    ...series.map((s) => ({
                      key: s.key,
                      label: s.label,
                      value: formatValue(s.values[active], format),
                      color: s.spectrum ? SPECTRUM[6] : s.color,
                      muted: s.values[active] === null,
                    })),
                    ...(band
                      ? [
                          {
                            key: band.key,
                            label: band.label,
                            value:
                              band.upper[active] == null || band.lower[active] == null
                                ? UNAVAILABLE
                                : `${formatTick(band.lower[active] as number, format)} to ${formatTick(band.upper[active] as number, format)}`,
                            color: band.color,
                            mark: "band" as const,
                            muted: band.upper[active] == null || band.lower[active] == null,
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </>
          ) : null}

          <div
            aria-hidden="true"
            className="absolute inset-0 cursor-crosshair touch-pan-y"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setActive(null)}
          />
        </div>

        {/* x axis */}
        <div aria-hidden="true" className="absolute right-0" style={{ left: leftGutter, top: H + 7 }}>
          {xIdx.map((i, k) => (
            <span
              key={i}
              className={cn(
                "absolute whitespace-nowrap font-mono text-[10.5px] tabular-nums text-ink-faint",
                hideTickOnPhone(k, xIdx.length) && "max-sm:hidden",
              )}
              style={{
                left: `${pct(i)}%`,
                transform: i === 0 && n > 1 ? "none" : i === n - 1 && n > 1 ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {ax[i]}
            </span>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {readout}
        </p>
      </div>

      {showLegend ? (
        <Legend
          className="mt-3"
          items={[
            ...series.map((s) => ({ key: s.key, label: s.label, color: s.spectrum ? SPECTRUM[6] : s.color, mark: s.dashed ? ("dash" as const) : ("line" as const) })),
            ...(band ? [{ key: band.key, label: band.label, color: band.color, mark: "band" as const }] : []),
            ...(gaps.length ? [{ key: "gap", label: "Unavailable (no telemetry)", color: "rgba(255,255,255,0.4)", mark: "dash" as const }] : []),
          ]}
        />
      ) : null}

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Point</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
            {band ? <th scope="col">{band.label}</th> : null}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={`${l}-${i}`}>
              <th scope="row">{l}</th>
              {series.map((s) => (
                <td key={s.key}>{formatValue(s.values[i], format)}</td>
              ))}
              {band ? (
                <td>
                  {bandText(band, i, format)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* ============================================================================ Sparkline */

export type SparklineProps = {
  values: (number | null)[];
  labels?: string[];
  color?: string;
  /** px */
  height?: number;
  area?: boolean;
  format?: ValueFormat;
  /** series name in the tooltip, such as "Tokens" */
  seriesLabel?: string;
  /** dashed reference line at the first value */
  baseline?: boolean;
  endDot?: boolean;
  interactive?: boolean;
  emptyMessage?: string;
  "aria-label": string;
  className?: string;
};

/** Axis-free line for card strips: hover shows the point, one value centers, no data reads "No activity yet". */
export function Sparkline({
  values,
  labels,
  color = "var(--blu)",
  height = 44,
  area = true,
  format = "number",
  seriesLabel = "Value",
  baseline = false,
  endDot = true,
  interactive = true,
  emptyMessage = "No activity yet",
  "aria-label": ariaLabel,
  className,
}: SparklineProps) {
  const rawId = useId();
  const uid = svgId(rawId);
  const [active, setActive] = useState<number | null>(null);
  const vals = finiteValues(values);
  const n = values.length;

  if (vals.length === 0) {
    return (
      <div role="img" aria-label={`${ariaLabel}: ${emptyMessage}`} className={cn("relative flex items-center justify-center", className)} style={{ height }}>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-1 border-t border-dashed border-white/[0.12]" />
        <span className="relative bg-[#0f0f11] px-1.5 text-[11px] text-ink-faint">{emptyMessage}</span>
      </div>
    );
  }

  const pad = 6;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const span = max - min || max || 1;
  const lo = Math.max(0, min - span * 0.15);
  const hi = max + span * 0.08;
  const xAt = (i: number) => (n === 1 ? VBW / 2 : 8 + ((VBW - 16) * i) / (n - 1));
  const yAt = (v: number) => pad + (height - 2 * pad) * (1 - (v - lo) / (hi - lo || 1));
  const pct = (i: number) => (xAt(i) / VBW) * 100;
  const lastIdx = n - 1 - [...values].reverse().findIndex((v) => v !== null);
  const firstIdx = values.findIndex((v) => v !== null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const f = r.width ? (e.clientX - r.left) / r.width : 0;
    setActive(Math.max(0, Math.min(n - 1, Math.round(f * (n - 1)))));
  }

  const dotAt = active ?? (endDot ? lastIdx : null);
  const dotVal = dotAt !== null ? values[dotAt] : null;

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <svg role="img" aria-label={`${ariaLabel}, latest ${formatValue(values[lastIdx], format)}`} className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${VBW} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.36} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {baseline && firstIdx >= 0 ? (
          <line x1="0" x2={VBW} y1={yAt(values[firstIdx] as number)} y2={yAt(values[firstIdx] as number)} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        ) : null}
        {runsOf(values).map((run) => {
          const pts: Pt[] = run.map(({ i, v }) => [xAt(i), yAt(v)]);
          const line = monotonePath(pts);
          return (
            <g key={run[0].i}>
              {area && pts.length > 1 ? (
                <path d={`${line}L${pts[pts.length - 1][0].toFixed(2)} ${height}L${pts[0][0].toFixed(2)} ${height}Z`} fill={`url(#${uid}-a)`} />
              ) : null}
              <path d={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>
      {dotAt !== null && dotVal !== null && dotVal !== undefined ? (
        <span
          aria-hidden="true"
          className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${pct(dotAt)}%`, top: yAt(dotVal), background: color, boxShadow: `0 0 0 2px ${SURFACE}` }}
        />
      ) : null}
      {interactive && active !== null ? (
        <div
          aria-hidden="true"
          className="absolute bottom-full z-10 mb-1.5"
          style={{ left: `${pct(active)}%`, transform: pct(active) > 55 ? "translateX(calc(-100% + 8px))" : "translateX(-8px)" }}
        >
          <TooltipBox
            title={labels?.[active] ?? `Point ${active + 1}`}
            rows={[{ key: "v", label: seriesLabel, value: formatValue(values[active], format), color, muted: values[active] === null }]}
          />
        </div>
      ) : null}
      {interactive ? (
        <div aria-hidden="true" className="absolute inset-0 cursor-crosshair touch-pan-y" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setActive(null)} />
      ) : null}
    </div>
  );
}

/* ============================================================================ DeltaSparkCard */

export type DeltaSparkCardProps = {
  /** mono kicker such as "Cost / run" */
  label: string;
  /** ratio change over the window: -0.42 reads "-42%" */
  delta: number | null;
  /** green when the change is an improvement */
  upIsGood?: boolean;
  values: (number | null)[];
  labels?: string[];
  format?: ValueFormat;
  /** how far along a stated target the series has come, 0 to 1; pair it with a caption that names the target */
  progress?: number;
  caption?: ReactNode;
  provenance?: Provenance;
  className?: string;
};

/** Compact trend tile: a kicker, a signed change in the improvement color, a sparkline and a progress rail. */
export function DeltaSparkCard({ label, delta, upIsGood = false, values, labels, format = "currency", progress, caption, provenance, className }: DeltaSparkCardProps) {
  const good = delta === null || Math.round(Math.abs(delta) * 100) === 0 ? null : delta < 0 ? !upIsGood : upIsGood;
  const tone = good === null ? "var(--ink-faint)" : good ? "var(--grn)" : "var(--red)";
  const pct = delta === null ? null : Math.round(Math.abs(delta) * 100);
  const text = delta === null || pct === null ? UNAVAILABLE : pct === 0 ? "0%" : `${delta > 0 ? "+" : "−"}${pct}%`;
  return (
    <div className={cn("flex min-w-0 flex-col justify-center rounded-[12px] border border-hair bg-[#101014] px-4 py-3.5", className)}>
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.15em]">
        <span className="text-ink-dim">{keepQuirq(label)}</span>
        <span className="tabular-nums" style={{ color: tone }}>
          {text}
        </span>
      </div>
      <Sparkline
        className="mb-2 mt-2"
        values={values}
        labels={labels}
        color={tone}
        height={46}
        area={false}
        baseline
        format={format}
        seriesLabel={label}
        aria-label={`${label}, change ${text}`}
      />
      {progress !== undefined ? (
        <div className="relative h-[3px] rounded-[2px] bg-white/15" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 rounded-[2px]" style={{ width: `${Math.round(progress * 100)}%`, background: tone }} />
          <div className="absolute top-[-3px] size-[9px] -translate-x-1/2 rounded-full" style={{ left: `${Math.round(progress * 100)}%`, background: tone }} />
        </div>
      ) : null}
      {caption || provenance ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-faint">
          {caption ? <span>{caption}</span> : <span />}
          {provenance ? <ProvenanceTag provenance={provenance} /> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================================ LearningCurve */

export type LearningCurvePoint = { unit: number; fresh: number; persistent: number };

export type LearningCurveProps = {
  /** token cost per unit for every unit 1..n */
  fresh: number[];
  persistent: number[];
  /** rows for the comparison table */
  checkpoints: LearningCurvePoint[];
  totals: { fresh: number; persistent: number };
  provenance?: Provenance;
  title?: ReactNode;
  note?: ReactNode;
  /** small print in the tooltip */
  footnote?: string;
  className?: string;
};

/** Tenure learning curve: a fresh context against a persistent environment, plus the comparison table. */
export function LearningCurve({
  fresh,
  persistent,
  checkpoints,
  totals,
  provenance = "illustrative",
  title,
  note,
  footnote = "Tokens per unit · worked micro-benchmark",
  className,
}: LearningCurveProps) {
  const labels = fresh.map((_, i) => `Unit ${i + 1}`);
  const axis = fresh.map((_, i) => String(i + 1));
  const saving = (f: number, p: number) => (f > 0 ? (f - p) / f : null);
  return (
    <div className={cn("flex min-w-0 flex-col gap-4", className)}>
      {title || provenance ? (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {title ? <p className="text-[13.5px] font-semibold text-ink">{title}</p> : null}
            {note ? <p className="mt-0.5 text-[12px] text-ink-dim">{note}</p> : null}
          </div>
          <ProvenanceTag provenance={provenance} />
        </div>
      ) : null}
      <TrendChart
        labels={labels}
        axisLabels={axis}
        series={[
          { key: "fresh", label: "Fresh context", color: "var(--ink-faint)", values: fresh, dashed: true },
          { key: "persistent", label: "Persistent environment", color: "var(--blu)", values: persistent, area: true },
        ]}
        format="number"
        height={150}
        xTicks={6}
        footnote={footnote}
        aria-label="Tokens per unit of work, fresh context against a persistent environment"
      />
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-hair text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <th scope="col" className="py-2 pr-3 font-normal">
                Tokens per unit
              </th>
              {checkpoints.map((c) => (
                <th key={c.unit} scope="col" className="px-2 py-2 text-right font-normal">
                  Unit {c.unit}
                </th>
              ))}
              <th scope="col" className="py-2 pl-2 text-right font-normal">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            <tr className="border-b border-hair-soft">
              <th scope="row" className="py-2 pr-3 text-left font-sans font-normal text-ink-dim">
                Fresh context
              </th>
              {checkpoints.map((c) => (
                <td key={c.unit} className="px-2 py-2 text-right text-ink-dim">
                  {formatValue(c.fresh)}
                </td>
              ))}
              <td className="py-2 pl-2 text-right text-ink-dim">{formatValue(totals.fresh)}</td>
            </tr>
            <tr className="border-b border-hair-soft">
              <th scope="row" className="py-2 pr-3 text-left font-sans font-normal text-ink">
                Persistent environment
              </th>
              {checkpoints.map((c) => (
                <td key={c.unit} className="px-2 py-2 text-right text-ink">
                  {formatValue(c.persistent)}
                </td>
              ))}
              <td className="py-2 pl-2 text-right text-ink">{formatValue(totals.persistent)}</td>
            </tr>
            <tr>
              <th scope="row" className="py-2 pr-3 text-left font-sans font-normal text-ink-dim">
                Savings
              </th>
              {checkpoints.map((c) => (
                <td key={c.unit} className="px-2 py-2 text-right text-ink-dim">
                  {formatValue(saving(c.fresh, c.persistent), "percent")}
                </td>
              ))}
              <td className="py-2 pl-2 text-right font-medium text-grn">{formatValue(saving(totals.fresh, totals.persistent), "percent")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
