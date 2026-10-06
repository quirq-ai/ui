"use client";

// Bar charts: ColumnChart (daily columns, single or stacked, 4px rounded data ends, 2px
// surface gaps, hover and keyboard tooltip), RankedBarList (label | track | value rows for
// top models, tools and servers) and RampBars (the grey-ramp efficiency card with one
// colored headline). Columns are HTML, so rounded ends never distort at any width.
import { useState, type KeyboardEvent, type ReactNode } from "react";
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
  niceScale,
  pickIndices,
  ticks,
  type ValueFormat,
} from "./chart-kit";

/* ============================================================================ ColumnChart */

export type ColumnSeries = {
  key: string;
  label: string;
  color: string;
  /** null is a gap in telemetry: drawn as a dashed stub, read as Unavailable */
  values: (number | null)[];
};

export type ColumnChartProps = {
  labels: string[];
  axisLabels?: string[];
  /** one series for plain columns, several (bottom first) for a stack */
  series: ColumnSeries[];
  format?: ValueFormat;
  height?: number;
  gridLines?: number;
  xTicks?: number;
  /** px cap on column width; the rest of the slot stays air */
  maxBar?: number;
  legend?: boolean;
  /** draw the last column at full strength and the rest a step back */
  emphasizeLast?: boolean;
  emptyMessage?: ReactNode;
  footnote?: string;
  "aria-label": string;
  className?: string;
};

/** Vertical columns over time, plain or stacked, with a dashed grid and per-column tooltips. */
export function ColumnChart({
  labels,
  axisLabels,
  series,
  format = "number",
  height = 200,
  gridLines = 3,
  xTicks = 7,
  maxBar = 24,
  legend,
  emphasizeLast = false,
  emptyMessage = "No data in this window",
  footnote,
  "aria-label": ariaLabel,
  className,
}: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const n = labels.length;
  const totals = labels.map((_, i) => {
    const parts = series.map((s) => s.values[i]);
    return parts.every((v) => v === null || v === undefined) ? null : finiteValues(parts).reduce((a, b) => a + b, 0);
  });
  const finiteTotals = finiteValues(totals);

  if (n === 0 || finiteTotals.length === 0) {
    return (
      <figure className={cn("min-w-0", className)}>
        <EmptyPlot message={emptyMessage} height={height + 22} />
        <figcaption className="sr-only">{ariaLabel}</figcaption>
      </figure>
    );
  }

  const hi = niceScale(Math.max(...finiteTotals), gridLines);
  const H = height;
  const yAt = (v: number) => H * (1 - v / hi);
  const stacked = series.length > 1;
  const showLegend = legend ?? stacked;
  const xIdx = new Set(pickIndices(n, xTicks));
  const ax = axisLabels ?? labels;
  const gutter = 46;

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

  const center = (i: number) => ((i + 0.5) / n) * 100;
  const readout =
    active === null
      ? ""
      : `${labels[active]}: ${series.map((s) => `${s.label} ${formatValue(s.values[active], format)}`).join(", ")}${stacked ? `, total ${formatValue(totals[active], format)}` : ""}`;

  return (
    <figure className={cn("min-w-0", className)}>
      <div
        role="group"
        aria-label={`${ariaLabel}. Use the arrow keys to read each column.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setActive((a) => (a === null ? n - 1 : a))}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        className="relative select-none rounded-[8px]"
        style={{ height: H + 24 }}
      >
        <div aria-hidden="true" className="absolute left-0 top-0" style={{ width: gutter - 8, height: H }}>
          {ticks(0, hi, gridLines).map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2 font-mono text-[10.5px] tabular-nums text-ink-faint" style={{ top: yAt(t) }}>
              {formatTick(t, format)}
            </span>
          ))}
        </div>

        <div className="absolute right-0 top-0" style={{ left: gutter, height: H }}>
          {ticks(0, hi, gridLines).map((t, k) => (
            <div
              key={t}
              aria-hidden="true"
              className={cn("absolute inset-x-0 border-t", k === 0 ? "border-solid border-white/[0.12]" : "border-dashed border-white/[0.07]")}
              style={{ top: yAt(t) }}
            />
          ))}

          <div className="absolute inset-0 flex">
            {labels.map((l, i) => {
              const isActive = active === i;
              const dim = (active !== null && !isActive) || (active === null && emphasizeLast && i !== n - 1);
              const segs = series.map((s) => ({ s, v: s.values[i] })).filter((x) => typeof x.v === "number" && (x.v as number) > 0);
              const missing = totals[i] === null;
              return (
                <div
                  key={`${l}-${i}`}
                  aria-hidden="true"
                  className={cn("relative h-full flex-1 cursor-default transition-colors duration-150", isActive && "bg-white/[0.035]")}
                  onPointerEnter={() => setActive(i)}
                  onPointerDown={() => setActive(i)}
                >
                  {missing ? (
                    <div
                      className="absolute bottom-0 left-1/2 h-3 -translate-x-1/2 rounded-t-[4px] border border-b-0 border-dashed border-white/30"
                      style={{ width: `min(${maxBar}px, 62%)` }}
                    />
                  ) : (
                    <div
                      className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col-reverse gap-[2px] transition-opacity duration-150"
                      style={{ width: `min(${maxBar}px, 62%)`, opacity: dim ? 0.55 : 1 }}
                    >
                      {segs.map(({ s, v }, k) => {
                        const px = Math.max(1, (H * (v as number)) / hi - (k > 0 ? 2 : 0));
                        const top = k === segs.length - 1;
                        return (
                          <div
                            key={s.key}
                            className={cn("w-full shrink-0", top && "rounded-t-[4px]")}
                            style={{ height: px, background: `linear-gradient(180deg, ${s.color}, color-mix(in srgb, ${s.color} 58%, transparent))` }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {active !== null ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1 z-10"
              style={{ left: `${center(active)}%`, transform: center(active) > 55 ? "translateX(calc(-100% - 14px))" : "translateX(14px)" }}
            >
              <TooltipBox
                title={labels[active]}
                footnote={footnote}
                rows={[
                  ...series.map((s) => ({
                    key: s.key,
                    label: s.label,
                    value: formatValue(s.values[active], format),
                    color: s.color,
                    mark: "square" as const,
                    muted: s.values[active] === null,
                  })),
                  ...(stacked ? [{ key: "total", label: "Total", value: formatValue(totals[active], format) }] : []),
                ]}
              />
            </div>
          ) : null}
        </div>

        <div aria-hidden="true" className="absolute right-0" style={{ left: gutter, top: H + 7 }}>
          {[...xIdx].map((i, k, arr) => (
            <span
              key={i}
              className={cn(
                "absolute -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] tabular-nums text-ink-faint",
                hideTickOnPhone(k, arr.length) && "max-sm:hidden",
                active === i && "text-ink",
              )}
              style={{ left: `${center(i)}%` }}
            >
              {ax[i]}
            </span>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {readout}
        </p>
      </div>

      {showLegend ? <Legend className="mt-3" items={series.map((s) => ({ key: s.key, label: s.label, color: s.color }))} /> : null}

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={`${l}-${i}`}>
              <th scope="row">{l}</th>
              {series.map((s) => (
                <td key={s.key}>{formatValue(s.values[i], format)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* ============================================================================ RankedBarList */

export type RankedItem = {
  id: string;
  label: string;
  /** null reads Unavailable and draws no bar */
  value: number | null;
  color?: string;
  /** secondary readout, such as "$90.99 · 46%" */
  meta?: string;
  icon?: ReactNode;
};

export type RankedBarListProps = {
  items: RankedItem[];
  format?: ValueFormat;
  /** rows shown; the rest fold into "Other" when foldOther is set */
  max?: number;
  foldOther?: boolean;
  /** smallest visible bar as a share of the track */
  minShare?: number;
  color?: string;
  /** rank numbers (01, 02...) before the labels */
  ranked?: boolean;
  emptyMessage?: ReactNode;
  "aria-label": string;
  className?: string;
};

/**
 * Horizontal ranked bars: label | track | value, at most seven rows, min bar 3%. In a narrow
 * container (under 280px) each row stacks the track under its label so names never truncate.
 */
export function RankedBarList({
  items,
  format = "number",
  max = 7,
  foldOther = false,
  minShare = 0.03,
  color = "var(--blu)",
  ranked = false,
  emptyMessage = "No data in this window",
  "aria-label": ariaLabel,
  className,
}: RankedBarListProps) {
  const [active, setActive] = useState<string | null>(null);
  const sorted = [...items].sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  let rows = sorted.slice(0, max);
  if (foldOther && sorted.length > max) {
    const rest = sorted.slice(max - 1);
    const restTotal = finiteValues(rest.map((r) => r.value)).reduce((a, b) => a + b, 0);
    rows = [...sorted.slice(0, max - 1), { id: "other", label: `Other (${rest.length})`, value: restTotal, color: "var(--ink-faint)" }];
  }
  const vmax = Math.max(0, ...finiteValues(rows.map((r) => r.value)));

  if (rows.length === 0 || vmax === 0) {
    return (
      <div className={className}>
        <EmptyPlot message={emptyMessage} height={120} />
      </div>
    );
  }

  return (
    <ol aria-label={ariaLabel} className={cn("@container flex min-w-0 flex-col", className)} onPointerLeave={() => setActive(null)}>
      {rows.map((r, k) => {
        const share = r.value === null ? 0 : Math.max(minShare, r.value / vmax);
        const c = r.color ?? color;
        const on = active === r.id;
        const dim = active !== null && !on;
        return (
          <li
            key={r.id}
            onPointerEnter={() => setActive(r.id)}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 rounded-[6px] px-1.5 py-1.5 transition-colors duration-150",
              "@[280px]:h-[30px] @[280px]:grid-cols-[minmax(76px,36%)_minmax(0,1fr)_auto] @[280px]:py-0 @[420px]:grid-cols-[minmax(76px,128px)_minmax(0,1fr)_auto] @[420px]:gap-x-3",
              on && "bg-white/[0.04]",
            )}
          >
            <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 text-[12.5px]">
              {ranked ? <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{String(k + 1).padStart(2, "0")}</span> : null}
              {r.icon ? <span aria-hidden="true" className="inline-flex shrink-0 text-ink-faint [&_svg]:size-3.5">{r.icon}</span> : null}
              <span className={cn("truncate", on ? "text-ink" : "text-ink-dim")} title={r.label}>
                {r.label}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="relative col-span-2 row-start-2 h-2.5 overflow-hidden rounded-[3px] bg-white/[0.06] @[280px]:col-span-1 @[280px]:col-start-2 @[280px]:row-start-1"
            >
              {r.value !== null ? (
                <span
                  className="absolute inset-y-0 left-0 rounded-[3px] transition-[opacity,width] duration-300 ease-quirq"
                  style={{
                    width: `${share * 100}%`,
                    background: `linear-gradient(90deg, color-mix(in srgb, ${c} 62%, transparent), ${c})`,
                    opacity: dim ? 0.45 : 1,
                  }}
                />
              ) : null}
            </span>
            <span className="col-start-2 row-start-1 flex items-baseline justify-end gap-2 whitespace-nowrap @[280px]:col-start-3">
              <span className={cn("font-mono text-[12px] tabular-nums", r.value === null ? "text-ink-faint" : "text-ink")}>
                {r.value === null ? UNAVAILABLE : formatValue(r.value, format)}
              </span>
              {r.meta ? <span className="font-mono text-[10.5px] tabular-nums text-ink-faint @[280px]:hidden @[420px]:inline">{r.meta}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================================ RampBars */

export type RampBarsProps = {
  /** mono kicker, such as "quirqs minted per day" */
  kicker: string;
  /** the one colored number, such as "+60%" */
  headline: string;
  headlineTone?: "grn" | "red" | "blu" | "ink";
  /** right-aligned mono window, such as "Past 30 days" */
  window: string;
  values: number[];
  labels: string[];
  format?: ValueFormat;
  provenance?: Provenance;
  footnote?: ReactNode;
  "aria-label": string;
  className?: string;
};

const RAMP = ["#5e5e5e", "#6b6b6b", "#777777", "#848484", "#919191", "#9e9e9e", "#ababab", "#b8b8b8", "#c6c6c6", "#d9d9d9"];

/** Grey ramp columns under one green number: color is delivered value, grey is everything else. */
export function RampBars({
  kicker,
  headline,
  headlineTone = "grn",
  window,
  values,
  labels,
  format = "number",
  provenance,
  footnote,
  "aria-label": ariaLabel,
  className,
}: RampBarsProps) {
  const [active, setActive] = useState<number | null>(null);
  const n = values.length;
  const vmax = Math.max(1, ...values);
  const vmin = Math.min(...values);
  const floor = Math.max(0, vmin - (vmax - vmin) * 1.2);
  const toneCls = { grn: "text-grn", red: "text-red", blu: "text-blu", ink: "text-ink" }[headlineTone];

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

  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-hair bg-white/[0.06] px-[22px] pt-[22px]", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[12.5px] font-bold tracking-[0.04em] text-ink-dim">{kicker}</p>
        {provenance ? <ProvenanceTag provenance={provenance} /> : null}
      </div>
      <div className="mt-1 flex items-start justify-between gap-3">
        <span className={cn("font-mono text-[32px] font-bold leading-none tracking-[-0.01em]", toneCls)}>{headline}</span>
        <span className="whitespace-pre-line text-right font-mono text-[11px] font-bold uppercase leading-[1.2] tracking-[0.06em] text-ink-faint">{window}</span>
      </div>
      {footnote ? <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">{footnote}</p> : null}
      <div
        role="group"
        aria-label={`${ariaLabel}. Use the arrow keys to read each bar.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setActive((a) => (a === null ? n - 1 : a))}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
        className="relative mt-5 flex h-[130px] items-end gap-[8px] rounded-t-[8px] sm:gap-[10px]"
      >
        {values.map((v, i) => {
          const h = 18 + ((v - floor) / (vmax - floor || 1)) * 82;
          return (
            <span
              key={`${labels[i]}-${i}`}
              aria-hidden="true"
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}
              className="flex-1 rounded-t-[6px] transition-[background-color,transform] duration-150"
              style={{ height: `${h}%`, background: active === i ? "var(--ink)" : RAMP[Math.round((i / Math.max(1, n - 1)) * (RAMP.length - 1))] }}
            />
          );
        })}
        {active !== null ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 z-10"
            style={{ left: `${((active + 0.5) / n) * 100}%`, transform: active / n > 0.5 ? "translateX(calc(-100% - 10px))" : "translateX(10px)" }}
          >
            <TooltipBox title={labels[active]} rows={[{ key: "v", label: kicker, value: formatValue(values[active], format), color: "var(--ink)", mark: "square" }]} />
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {active === null ? "" : `${labels[active]}: ${formatValue(values[active], format)}`}
        </p>
      </div>
    </div>
  );
}
