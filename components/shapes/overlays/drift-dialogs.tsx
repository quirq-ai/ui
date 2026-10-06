// Bodies for the space-drift flight dialogs, set inside a deep-tone ModalPanel:
// AtlasBody (bodies or files to land on or fly by, search, survey and queue states),
// ToursBody (saved routes, stops with current and missing, controls, JSON fallback) and
// ManualBody (the pilot's key guide). Controlled and hook-free.
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Copy, LogOut, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { SearchInput, Textarea } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
import { LoadingLine } from "@/components/ui/loaders";

const kicker = "font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint";
const note = "rounded-[8px] border border-blu/15 bg-blu/[0.04] px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-dim";

/* ----------------------------------------------------------------------------- Atlas */

export type AtlasLayer = "space" | "surface";

export type AtlasRow = {
  id: string;
  name: string;
  /** Facts joined with a middle dot: "repository · 48 KB · ×1.06". */
  meta: string[];
  actions: { id: string; label: string; done?: boolean }[];
};

export type AtlasBodyProps = {
  layer: AtlasLayer;
  onLayerChange?: (layer: AtlasLayer) => void;
  intro: ReactNode;
  ranking: { label: string; items: string[] };
  rows: AtlasRow[];
  query: string;
  onQueryChange?: (q: string) => void;
  /** Name of the body being surveyed; actions wait until it finishes. */
  surveying?: string | null;
  /** Files queued to open on landing. */
  queued?: number;
  onAction?: (rowId: string, actionId: string) => void;
  footnote: ReactNode;
  idPrefix: string;
};

/** Atlas: choose a body (space layer) or a file (surface layer). */
export function AtlasBody({
  layer,
  onLayerChange,
  intro,
  ranking,
  rows,
  query,
  onQueryChange,
  surveying,
  queued = 0,
  onAction,
  footnote,
  idPrefix,
}: AtlasBodyProps) {
  const q = query.trim().toLowerCase();
  const shown = q ? rows.filter((r) => `${r.name} ${r.meta.join(" ")}`.toLowerCase().includes(q)) : rows;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-ink-dim">{intro}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented<AtlasLayer>
          aria-label="Atlas view"
          size="sm"
          value={layer}
          onChange={onLayerChange}
          options={[
            { value: "space", label: "Space · projects" },
            { value: "surface", label: "Surface · files" },
          ]}
        />
        {queued > 0 ? (
          <Badge tone="cyn" mono dot>
            {queued} {queued === 1 ? "file" : "files"} queued
          </Badge>
        ) : null}
      </div>
      <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-ink-faint">
        <span className={kicker}>{ranking.label}</span>
        {ranking.items.map((item) => (
          <span key={item} className="rounded-[4px] border border-blu/20 bg-blu/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-ink-dim">
            {item}
          </span>
        ))}
      </p>
      {surveying ? <LoadingLine>Surveying {surveying}…</LoadingLine> : null}
      <ul aria-label={layer === "space" ? "Projects" : "Files and folders"} className="flex flex-col">
        {shown.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-blu/[0.12] px-1 py-2.5 transition-colors hover:bg-blu/[0.05]"
          >
            <div className="min-w-0 flex-1 basis-[150px]">
              <p className="truncate font-mono text-[13px] text-ink">{r.name}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">{r.meta.join(" · ")}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {r.actions.map((a) => (
                <Button
                  key={a.id}
                  size="sm"
                  variant={a.done ? "subtle" : "secondary"}
                  disabled={Boolean(surveying) || a.done}
                  onClick={() => onAction?.(r.id, a.id)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </li>
        ))}
        {shown.length === 0 ? (
          <li className="border-t border-blu/[0.12] px-1 py-4 text-[12.5px] text-ink-faint">Nothing matches &ldquo;{query}&rdquo;.</li>
        ) : null}
      </ul>
      <SearchInput
        shape="field"
        size="sm"
        aria-label="Find a folder or file"
        placeholder="Find a folder or file…"
        value={query}
        onChange={(e) => onQueryChange?.(e.target.value)}
        id={`${idPrefix}-search`}
      />
      <p className={note}>{footnote}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- Tours */

export type TourSummary = { id: string; title: string; stops: number; blurb: string };
export type TourStopState = "visited" | "current" | "upcoming" | "missing";
export type TourStopView = { id: string; label: string; place: string; state: TourStopState };

export type ToursBodyProps = {
  tours: TourSummary[];
  activeTour: string | null;
  onTourSelect?: (id: string) => void;
  stops: TourStopView[];
  /** Status line: "Stop 2 of 4 · README.md in xo-space". */
  status: ReactNode;
  running?: boolean;
  onPrevious?: () => void;
  onResume?: () => void;
  onNext?: () => void;
  onExit?: () => void;
  onExport?: () => void;
  /** When copying fails, the route JSON shows here to select by hand. */
  exportJson?: string | null;
  footnote: ReactNode;
  idPrefix: string;
};

/** Guided tours: pick a route, step through its stops. */
export function ToursBody({
  tours,
  activeTour,
  onTourSelect,
  stops,
  status,
  running = false,
  onPrevious,
  onResume,
  onNext,
  onExit,
  onExport,
  exportJson,
  footnote,
  idPrefix,
}: ToursBodyProps) {
  const current = stops.findIndex((s) => s.state === "current");
  return (
    <div className="flex flex-col gap-4">
      <p role="status" className={note}>
        {status}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {tours.map((t) => {
          const selected = t.id === activeTour;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onTourSelect?.(t.id)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-[10px]! border px-3 py-2.5 text-left transition-colors",
                selected ? "border-blu/45 bg-blu/[0.09]" : "border-hair bg-[#101629] hover:border-blu/30",
              )}
            >
              <span className="text-[13px] font-medium text-ink">{t.title}</span>
              <span className="text-[11.5px] leading-snug text-ink-faint">
                {t.stops} stops · {t.blurb}
              </span>
            </button>
          );
        })}
      </div>
      {stops.length > 0 ? (
        <ol aria-label="Stops" className="flex flex-col gap-1">
          {stops.map((s, i) => (
            <li
              key={s.id}
              aria-current={s.state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[8px] border-l-2 px-3 py-2 text-[12.5px]",
                s.state === "current" ? "border-blu bg-blu/[0.08] text-ink" : "border-transparent text-ink-dim",
              )}
            >
              <span className="w-5 shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("min-w-0 flex-1 truncate", s.state === "missing" && "text-ink-faint line-through")}>
                <span className="font-mono text-[12px]">{s.label}</span>
                <span className="text-ink-faint"> · {s.place}</span>
              </span>
              {s.state === "missing" ? (
                <Badge tone="org" size="xs" mono>
                  Missing
                </Badge>
              ) : s.state === "visited" ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Visited</span>
              ) : s.state === "current" ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-blu">Here</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tour controls">
        <Button size="sm" leadingIcon={<ArrowLeft />} onClick={onPrevious} disabled={!activeTour || current <= 0}>
          Previous
        </Button>
        <Button size="sm" leadingIcon={<Play />} onClick={onResume} disabled={!activeTour || running}>
          {current >= 0 ? "Resume" : "Start"}
        </Button>
        <Button size="sm" trailingIcon={<ArrowRight />} onClick={onNext} disabled={!activeTour || current >= stops.length - 1}>
          Next
        </Button>
        <Button size="sm" variant="subtle" leadingIcon={<LogOut />} onClick={onExit} disabled={!activeTour}>
          Exit tour
        </Button>
        <Button size="sm" variant="subtle" leadingIcon={<Copy />} onClick={onExport} disabled={!activeTour}>
          Copy route JSON
        </Button>
      </div>
      {exportJson ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-json`} className="text-[12px] text-org">
            Could not copy. Select the route below to copy it.
          </label>
          <Textarea id={`${idPrefix}-json`} mono readOnly rows={5} value={exportJson} resize={false} className="text-[11.5px]!" />
        </div>
      ) : null}
      <p className="text-[12px] leading-relaxed text-ink-faint">{footnote}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- Manual */

export type ManualBodyProps = {
  controls: { action: string; keys: string[] }[];
  sample?: { label: string; text: ReactNode; onPlay?: () => void };
  ruleTitle: string;
  rules: ReactNode[];
  readyLabel?: string;
  onReady?: () => void;
  /** Level of the rules heading: h3 under a dialog's h2 title, h4 under an h3. */
  headingAs?: "h3" | "h4";
};

/** Flight manual: key grid, the two kinds of flight, and a ready button. */
export function ManualBody({ controls, sample, ruleTitle, rules, readyLabel = "Ready to fly", onReady, headingAs: Heading = "h3" }: ManualBodyProps) {
  return (
    <div className="flex flex-col gap-5">
      {sample ? (
        <div className="flex flex-col gap-2 rounded-[10px] border border-blu/20 bg-blu/[0.05] p-3 sm:flex-row sm:items-center">
          <Button size="sm" variant="secondary" leadingIcon={<Play />} onClick={sample.onPlay}>
            {sample.label}
          </Button>
          <p className="text-[12px] leading-relaxed text-ink-dim">{sample.text}</p>
        </div>
      ) : null}
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5">
        {controls.map((c) => (
          <div key={c.action} className="contents">
            <dt className="text-[12px] text-ink-dim">{c.action}</dt>
            <dd className="flex flex-wrap justify-end gap-1">
              {c.keys.map((k) => (
                <Kbd key={k} size="sm">
                  {k}
                </Kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-blu/15 pt-4">
        <Heading className="text-[14px] font-semibold tracking-[-0.01em] text-ink">{ruleTitle}</Heading>
        {rules.map((r, i) => (
          <p key={i} className="mt-2 text-[11.5px] leading-[1.8] text-ink-dim">
            {r}
          </p>
        ))}
      </div>
      {onReady ? (
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={onReady} trailingIcon={<ArrowRight />}>
            {readyLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
