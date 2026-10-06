"use client";

// Usage dashboard for one space: a range control and refresh in one row above everything,
// a summary strip (cost, messages, tokens), a KPI row with week-over-week deltas, the token
// trend, top models, daily cost and a 16-week calendar heatmap. Tokens and cost are the
// usage meter, never quirqs. An empty window keeps the frame and reads Unavailable.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { UNAVAILABLE, formatDayLabel, formatDate, plural } from "@/lib/format";
import type { Provenance, UsageDay } from "@/lib/fixtures";
import { IconButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/loaders";
import { Delta, ProvenanceTag, formatValue, type ValueFormat } from "./chart-kit";
import { StatGrid, StatTile } from "./stat-tile";
import { TrendChart } from "./trend-chart";
import { ColumnChart, RankedBarList } from "./bar-chart";

const DAY_MS = 86_400_000;

/* ============================================================================ CalendarHeatmap */

export type HeatmapDay = { date: string; value: number | null };

export type CalendarHeatmapProps = {
  values: HeatmapDay[];
  /** "2026-10-02": the grid ends with the week that holds this day */
  today: string;
  weeks?: number;
  format?: ValueFormat;
  /** series name for the readout, such as "Tokens" */
  label?: string;
  color?: string;
  /** px */
  cell?: number;
  gap?: number;
  "aria-label": string;
  className?: string;
};

/** Daily activity for the last n weeks, Monday first; empty days use a muted fill. Arrows move a cursor. */
export function CalendarHeatmap({
  values,
  today,
  weeks = 16,
  format = "tokens",
  label = "Tokens",
  color = "var(--blu)",
  cell = 13,
  gap = 3,
  "aria-label": ariaLabel,
  className,
}: CalendarHeatmapProps) {
  const [active, setActive] = useState<number | null>(null);
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const dow = (new Date(todayMs).getUTCDay() + 6) % 7;
  const endMs = todayMs + (6 - dow) * DAY_MS;
  const startMs = endMs - (weeks * 7 - 1) * DAY_MS;
  const lastIndex = Math.round((todayMs - startMs) / DAY_MS);
  const byDate = new Map(values.map((d) => [d.date, d.value]));
  const vmax = Math.max(0, ...values.map((d) => d.value ?? 0));
  const left = 30;
  const top = 16;
  const pitch = cell + gap;
  const width = left + weeks * pitch;
  const height = top + 7 * pitch;
  const cells = Array.from({ length: lastIndex + 1 }, (_, i) => {
    const ms = startMs + i * DAY_MS;
    const date = new Date(ms).toISOString().slice(0, 10);
    const v = byDate.get(date);
    return { i, date, value: v === undefined ? null : v, col: Math.floor(i / 7), row: i % 7 };
  });
  const months: { col: number; text: string }[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startMs + w * 7 * DAY_MS);
    const prev = w === 0 ? null : new Date(startMs + (w - 1) * 7 * DAY_MS);
    if (!prev || prev.getUTCMonth() !== d.getUTCMonth()) months.push({ col: w, text: formatDate(d, { weekday: false }).split(" ")[1] });
  }
  if (months.length > 1 && months[1].col - months[0].col < 2) months.shift();

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const cur = active ?? lastIndex;
    let next: number | null | undefined;
    if (e.key === "ArrowRight") next = cur + 7;
    else if (e.key === "ArrowLeft") next = cur - 7;
    else if (e.key === "ArrowDown") next = cur + 1;
    else if (e.key === "ArrowUp") next = cur - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = lastIndex;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    setActive(next === null ? null : Math.max(0, Math.min(lastIndex, next)));
  }

  const hit = active !== null ? cells[active] : null;
  const steps = [0.15, 0.36, 0.58, 0.79, 1];

  return (
    <div className={cn("min-w-0", className)}>
      <div className="scroll-thin overflow-x-auto pb-1">
        <div
          role="group"
          aria-label={`${ariaLabel}. Use the arrow keys to move between days.`}
          tabIndex={0}
          onKeyDown={onKey}
          onFocus={() => setActive((a) => (a === null ? lastIndex : a))}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          className="w-fit max-w-full rounded-[6px]"
        >
          <svg aria-hidden="true" width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block h-auto max-w-full">
            {months.map((m) => (
              <text key={`${m.col}-${m.text}`} x={left + m.col * pitch} y={10} className="fill-ink-faint font-mono text-[9.5px]">
                {m.text}
              </text>
            ))}
            {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((t, r) =>
              t ? (
                <text key={t} x={0} y={top + r * pitch + cell - 2} className="fill-ink-faint font-mono text-[9.5px]">
                  {t}
                </text>
              ) : null,
            )}
            {cells.map((c) => {
              const v = c.value;
              const filled = v !== null && v > 0 && vmax > 0;
              const on = active === c.i;
              return (
                <rect
                  key={c.date}
                  x={left + c.col * pitch}
                  y={top + c.row * pitch}
                  width={cell}
                  height={cell}
                  rx={3}
                  fill={filled ? color : "rgba(255,255,255,0.055)"}
                  fillOpacity={filled ? 0.15 + 0.85 * Math.sqrt((v as number) / vmax) : 1}
                  stroke={on ? "var(--ink)" : c.i === lastIndex ? "rgba(255,255,255,0.4)" : "none"}
                  strokeWidth={on ? 1.5 : 1}
                  onPointerEnter={() => setActive(c.i)}
                  onPointerDown={() => setActive(c.i)}
                />
              );
            })}
          </svg>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="min-h-[18px] text-[12px] text-ink-dim" aria-live="polite">
          {hit ? (
            <>
              <span className="text-ink">{formatDate(hit.date)}</span>
              {hit.i === lastIndex ? <span className="text-ink-faint"> (today)</span> : null}
              <span className="text-ink-faint"> · </span>
              <span className={cn("font-mono", hit.value === null && "text-ink-faint")}>
                {hit.value === null ? UNAVAILABLE : `${formatValue(hit.value, format)} ${label.toLowerCase()}`}
              </span>
            </>
          ) : (
            <span className="text-ink-faint">Hover a day, or focus and use the arrow keys</span>
          )}
        </p>
        <span aria-hidden="true" className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-faint">
          Less
          <span className="size-2.5 rounded-[2px] bg-white/[0.055]" />
          {steps.map((s) => (
            <span key={s} className="size-2.5 rounded-[2px]" style={{ background: color, opacity: s }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

/* ============================================================================ UsageDashboard */

export type UsageModelShare = { id: string; label: string; share: number; color: string };

export type UsageDashboardProps = {
  title?: string;
  /** "research-lab" */
  spaceName: string;
  /** chip beside the space name, such as its lifecycle state */
  spaceStatus?: ReactNode;
  /** every day available, oldest first; the window is the last n days */
  days: UsageDay[];
  windows?: number[];
  initialWindow?: number;
  /** model mix used to split the window's tokens */
  models: UsageModelShare[];
  heatmap: { values: HeatmapDay[]; today: string; weeks?: number };
  provenance: Provenance;
  /** why there is no data, shown when days is empty */
  emptyNote?: string;
  /** force the refreshing look, for a static snapshot */
  refreshing?: boolean;
  /** header, strip and KPI row only */
  compact?: boolean;
  className?: string;
};

function sumOf(days: UsageDay[], k: "tokens" | "cost" | "messages" | "toolCalls" | "sessions"): number {
  return days.reduce((a, d) => a + d[k], 0);
}

/** Window, summary strip, KPIs, charts and a 16-week heatmap for one space. */
export function UsageDashboard({
  title = "Usage summary",
  spaceName,
  spaceStatus,
  days,
  windows = [7, 30],
  initialWindow = 7,
  models,
  heatmap,
  provenance,
  emptyNote = "No telemetry source has reported for this space yet.",
  refreshing,
  compact = false,
  className,
}: UsageDashboardProps) {
  const [win, setWin] = useState(String(initialWindow));
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const loading = refreshing ?? busy;
  const n = Number(win);
  const cur = days.slice(-n);
  const prev = days.length >= n * 2 ? days.slice(-n * 2, -n) : null;
  const empty = cur.length === 0;
  const tokens = empty ? null : sumOf(cur, "tokens");
  const cost = empty ? null : sumOf(cur, "cost");
  const messages = empty ? null : sumOf(cur, "messages");
  const sessions = empty ? null : sumOf(cur, "sessions");
  const toolCalls = empty ? null : sumOf(cur, "toolCalls");
  const lat = cur.filter((d) => d.latencyP50Ms !== null);
  const latency = lat.length ? Math.round(lat.reduce((a, d) => a + (d.latencyP50Ms ?? 0), 0) / lat.length) : null;
  const p95 = lat.length ? Math.round(lat.reduce((a, d) => a + (d.latencyP95Ms ?? 0), 0) / lat.length) : null;
  const gapDays = cur.length - lat.length;
  const prevLat = prev ? prev.filter((d) => d.latencyP50Ms !== null) : [];
  const prevLatency = prevLat.length ? prevLat.reduce((a, d) => a + (d.latencyP50Ms ?? 0), 0) / prevLat.length : null;
  const change = (now: number | null, before: number | null) => (now === null || before === null || before === 0 ? null : now / before - 1);
  const vsLabel = prev ? `vs previous ${n} days` : "no earlier window";
  const range = empty ? "No days in this window" : `${formatDayLabel(cur[0].date)} to ${formatDayLabel(cur[cur.length - 1].date)} ${cur[cur.length - 1].date.slice(0, 4)}`;

  function refresh() {
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    setAnnounce("Refreshing usage…");
    timer.current = setTimeout(() => {
      setBusy(false);
      setAnnounce("Usage updated");
    }, 1400);
  }

  const strip: { label: string; value: string | null; note?: string }[] = [
    { label: "Cost", value: cost === null ? null : `~${formatValue(cost, "currency")}`, note: "estimated" },
    { label: "Messages", value: messages === null ? null : formatValue(messages) },
    { label: "Tokens", value: tokens === null ? null : formatValue(tokens, "tokens") },
  ];

  return (
    <section className={cn("min-w-0 rounded-[18px] border border-hair-soft bg-[#0b0b0d] p-[clamp(14px,2.4vw,22px)]", className)} aria-label={`${title} for ${spaceName}`}>
      {/* filters: one row above everything they scope */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
            <span className="font-mono text-[11px] text-ink-faint">{spaceName}</span>
            {spaceStatus}
            <ProvenanceTag provenance={provenance} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              aria-label="Time window"
              size="sm"
              value={win}
              onChange={setWin}
              options={windows.map((w) => ({ value: String(w), label: `Last ${w} days` }))}
            />
            <IconButton aria-label="Refresh usage" variant="outline" size="sm" onClick={refresh} aria-busy={loading || undefined} tip>
              <RefreshCw className={loading ? "spin" : undefined} />
            </IconButton>
            <span className="font-mono text-[11px] text-ink-faint">{range}</span>
            <span className="sr-only" aria-live="polite">
              {announce}
            </span>
          </div>
        </div>
        <dl className="flex min-w-0 divide-x divide-hair border-hair lg:border-l">
          {strip.map((s, i) => (
            <div key={s.label} className={cn("flex min-w-0 flex-col justify-center gap-1.5 px-3 py-1 sm:px-5", i === 0 && "max-lg:pl-0")}>
              <dt className="text-[11.5px] text-ink-faint">{s.label}</dt>
              <dd className="leading-none">
                {loading ? (
                  <Skeleton height={20} width={64} radius={5} />
                ) : (
                  <span className={cn("whitespace-nowrap font-semibold tracking-[-0.02em]", s.value === null ? "text-[13px] font-medium text-ink-faint" : "text-[clamp(17px,2.4vw,22px)] text-ink")}>
                    {s.value ?? UNAVAILABLE}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={cn("mt-5 transition-opacity duration-200", loading && "opacity-60")} aria-busy={loading || undefined}>
        <StatGrid cols={4} aria-label="Key numbers">
          <StatTile
            label="Total tokens"
            badge={`${n} days`}
            value={tokens === null ? null : formatValue(tokens, "tokens")}
            loading={loading}
            note={sessions ? `${formatValue(tokens! / sessions, "tokens")} per session` : undefined}
            unavailableNote={emptyNote}
            delta={<Delta value={change(tokens, prev ? sumOf(prev, "tokens") : null)} neutral />}
          />
          <StatTile
            label="Sessions"
            value={sessions === null ? null : formatValue(sessions)}
            loading={loading}
            note={`${vsLabel}`}
            unavailableNote="No sessions in this window"
            delta={<Delta value={change(sessions, prev ? sumOf(prev, "sessions") : null)} />}
          />
          <StatTile
            label="Avg latency"
            value={latency === null ? null : formatValue(latency, "latency")}
            loading={loading}
            note={p95 === null ? undefined : `p95 ${formatValue(p95, "latency")}${gapDays ? ` · ${gapDays} ${plural(gapDays, "day")} without telemetry excluded` : ""}`}
            unavailableNote="No latency telemetry in this window"
            delta={<Delta value={change(latency, prevLatency)} upIsGood={false} />}
          />
          <StatTile
            label="Tool calls"
            value={toolCalls === null ? null : formatValue(toolCalls)}
            loading={loading}
            note={messages ? `${formatValue(toolCalls! / messages, "decimal1")} per message` : undefined}
            unavailableNote="No tool telemetry in this window"
            delta={<Delta value={change(toolCalls, prev ? sumOf(prev, "toolCalls") : null)} />}
          />
        </StatGrid>

        {compact ? null : (
          <>
            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <Card title="Tokens over time" sub={`Daily token volume · last ${n} days`}>
                <TrendChart
                  labels={cur.map((d) => d.label)}
                  axisLabels={cur.map((d) => formatDayLabel(d.date))}
                  series={[{ key: "tokens", label: "Tokens", color: "var(--blu)", values: cur.map((d) => d.tokens), area: true }]}
                  format="tokens"
                  height={170}
                  xTicks={n > 7 ? 6 : 7}
                  endLabel
                  emptyMessage="No data in this window"
                  aria-label={`Daily tokens, last ${n} days`}
                />
              </Card>
              <Card title="Top models by tokens" sub="Share of the window's tokens">
                <RankedBarList
                  items={models.map((m) => ({
                    id: m.id,
                    label: m.label,
                    value: tokens === null ? null : Math.round(tokens * m.share),
                    color: m.color,
                    meta: formatValue(m.share, "percent"),
                  }))}
                  format="tokens"
                  emptyMessage="No sessions in this window"
                  aria-label="Top models by tokens"
                />
              </Card>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
              <Card title="Daily heatmap" sub={`Last ${heatmap.weeks ?? 16} weeks · all time`}>
                <CalendarHeatmap
                  values={heatmap.values}
                  today={heatmap.today}
                  weeks={heatmap.weeks}
                  aria-label={`Daily tokens for ${spaceName}, last ${heatmap.weeks ?? 16} weeks`}
                />
              </Card>
              <Card title="Daily cost" sub="Estimated from the usage meter">
                <ColumnChart
                  labels={cur.map((d) => d.label)}
                  axisLabels={cur.map((d) => formatDayLabel(d.date))}
                  series={[{ key: "cost", label: "Cost (estimated)", color: "var(--cyn)", values: cur.map((d) => d.cost) }]}
                  format="currency"
                  height={150}
                  xTicks={n > 7 ? 6 : 7}
                  emphasizeLast
                  footnote="Estimated · mock pricing"
                  aria-label={`Daily estimated cost, last ${n} days`}
                />
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
      <div className="mb-4">
        <h4 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-dim">{title}</h4>
        {sub ? <p className="mt-1 text-[11.5px] text-ink-faint">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}
