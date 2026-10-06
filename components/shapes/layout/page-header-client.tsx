"use client";

// Stateful page headers: FilterHeader (filter chips whose counts come from data and whose
// blurb follows the active tab), ListToolbar (view switch, filter and sort selects, column
// heads and a partial-data note), PhoneHeader (22px title with refresh) and ScopeHeader
// (dashboard detail head with a time chip and previous and next scope).
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton, Segmented, Select, StatusDot, TabChips, type SegmentedOption } from "@/components/ui";
import { StatusNote, ToolbarSummary } from "./page-header";

/* ----------------------------------------------------------------------------- FilterHeader */

export type HeaderFilter = {
  id: string;
  label: string;
  /** Computed from the data, never claimed. */
  count?: number;
  /** Blurb shown under the chips while this filter is active. */
  blurb?: ReactNode;
};

export type FilterHeaderProps = {
  title: ReactNode;
  filters: HeaderFilter[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Names the chip group: "Filter research by topic". */
  filterLabel: string;
  titleId?: string;
  titleAs?: "h1" | "h2" | "h3";
  /** Keep the chips on one sideways-scrolling row instead of wrapping. */
  scroll?: boolean;
  className?: string;
};

/** Index page header: title, filter chips with counts, and a blurb that follows the active chip. */
export function FilterHeader({ title, filters, value, defaultValue, onChange, filterLabel, titleId, titleAs: Title = "h1", scroll = false, className }: FilterHeaderProps) {
  const [inner, setInner] = useState(defaultValue ?? filters[0]?.id ?? "");
  const current = value ?? inner;
  const active = filters.find((f) => f.id === current);
  return (
    <header className={cn("flex flex-col gap-5", className)}>
      <Title id={titleId} className="m-0 text-[clamp(30px,4vw,50px)] font-semibold leading-[1.1] tracking-[-0.028em]">
        {title}
      </Title>
      <TabChips
        aria-label={filterLabel}
        items={filters.map((f) => ({ id: f.id, label: f.label, count: f.count }))}
        value={current}
        onChange={(id) => {
          if (value === undefined) setInner(id);
          onChange?.(id);
        }}
        scroll={scroll}
      />
      {active?.blurb ? (
        <p aria-live="polite" className="m-0 max-w-[62ch] text-[clamp(15px,1.7vw,18px)] leading-normal text-ink-dim">
          {active.blurb}
        </p>
      ) : null}
    </header>
  );
}

/* ----------------------------------------------------------------------------- ListToolbar */

export type ToolbarOption = { value: string; label: string };

export type ListToolbarProps<V extends string> = {
  /** Count parts: ["11 projects", "3 live", "1,204 indexed files"]. */
  summary: ReactNode[];
  views?: SegmentedOption<V>[];
  view?: V;
  onViewChange?: (v: V) => void;
  filters: ToolbarOption[];
  filter: string;
  onFilterChange: (v: string) => void;
  sorts: ToolbarOption[];
  sort: string;
  onSortChange: (v: string) => void;
  /** Column heads under the controls. Leave empty for card views. */
  columns?: { label: string; align?: "start" | "end"; className?: string }[];
  /** Grid template for the column heads, shared with the rows. */
  gridClassName?: string;
  /** Partial-data notes: "File index unavailable." */
  notes?: string[];
  /** Prefix for control ids so two toolbars can share a page. */
  idPrefix: string;
  className?: string;
};

/** List toolbar: counts, view switch, labelled filter and sort, partial-data note, column heads. */
export function ListToolbar<V extends string>({
  summary,
  views,
  view,
  onViewChange,
  filters,
  filter,
  onFilterChange,
  sorts,
  sort,
  onSortChange,
  columns,
  gridClassName,
  notes = [],
  idPrefix,
  className,
}: ListToolbarProps<V>) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ToolbarSummary items={summary} />
        <div className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-2.5">
          {views && view !== undefined ? (
            <Segmented aria-label="View" size="md" options={views} value={view} onChange={(v) => onViewChange?.(v)} />
          ) : null}
          <label className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Filter</span>
            <Select id={`${idPrefix}-filter`} size="md" value={filter} onChange={(e) => onFilterChange(e.target.value)} className="sm:w-[190px]">
              {filters.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Sort by</span>
            <Select id={`${idPrefix}-sort`} size="md" value={sort} onChange={(e) => onSortChange(e.target.value)} className="sm:w-[170px]">
              {sorts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </div>
      <StatusNote notes={notes} />
      {columns?.length ? (
        <div
          aria-hidden="true"
          className={cn(
            "grid items-center gap-3 border-b border-hair-soft px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint",
            gridClassName,
          )}
        >
          {columns.map((c) => (
            <span key={c.label} className={cn(c.align === "end" && "text-right", c.className)}>
              {c.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- PhoneHeader */

export type PhoneHeaderProps = {
  title: ReactNode;
  /** Meta under the title: "6 new · updated 4m ago". */
  meta: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra actions before the refresh button. */
  actions?: ReactNode;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
};

/** Phone page header: 22px title, meta line, and a refresh button that spins while busy. */
export function PhoneHeader({ title, meta, refreshing = false, onRefresh, actions, titleAs: Title = "h1", className }: PhoneHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)} aria-busy={refreshing || undefined}>
      <div className="min-w-0">
        <Title className="m-0 text-[22px] font-semibold leading-tight tracking-[-0.02em]">{title}</Title>
        <p className="m-0 mt-0.5 text-[12px] text-ink-faint tabular-nums" aria-live="polite">
          {refreshing ? "Refreshing…" : meta}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {actions}
        {onRefresh ? (
          /* aria-disabled, not disabled: the button keeps focus while it spins */
          <IconButton
            aria-label={refreshing ? "Refreshing" : "Refresh"}
            aria-disabled={refreshing || undefined}
            variant="outline"
            size="md"
            shape="circle"
            onClick={() => {
              if (!refreshing) onRefresh();
            }}
            className={cn(refreshing && "cursor-wait text-ink")}
          >
            <RefreshCw className={cn(refreshing && "spin")} />
          </IconButton>
        ) : null}
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------------- ScopeHeader */

export type ScopeWindow = { span: string; through: string } | "live";

export type ScopeHeaderProps = {
  backLabel: string;
  onBack: () => void;
  kicker: ReactNode;
  title: ReactNode;
  /** Dated window ("30 days", "through 1 Oct") or live data. */
  window: ScopeWindow;
  prev?: string | null;
  next?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
};

const edgeCls =
  "inline-flex min-w-0 items-center gap-1 text-ink-faint transition-colors hover:text-ink aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:text-ink-faint";

/** Dashboard detail header: back, kicker, title, time chip, and previous and next scope. */
export function ScopeHeader({ backLabel, onBack, kicker, title, window, prev, next, onPrev, onNext, titleAs: Title = "h1", className }: ScopeHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-ink-dim transition-colors hover:text-ink"
      >
        <ChevronLeft aria-hidden="true" className="size-3.5" />
        {backLabel}
      </button>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="m-0 mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.17em] text-ink-faint">{kicker}</p>
          <Title className="m-0 text-[clamp(22px,2.6vw,30px)] font-medium leading-tight tracking-[-0.02em]" aria-live="polite">
            {title}
          </Title>
        </div>
        <p className="m-0 inline-flex items-center overflow-hidden rounded-[9px] border border-hair bg-s1 text-[12px] leading-none">
          {window === "live" ? (
            <span className="inline-flex items-center gap-2 px-3 py-2 text-ink">
              <StatusDot status="up" size="xs" pulse />
              Live data
            </span>
          ) : (
            <>
              <span className="px-3 py-2 text-ink">{window.span}</span>
              <span className="border-l border-hair px-3 py-2 text-ink-faint">{window.through}</span>
            </>
          )}
        </p>
      </div>
      {/* aria-disabled keeps focus on an edge button when the last step disables it */}
      <nav aria-label="Neighboring scopes" className="flex items-center justify-between gap-3 border-t border-hair-soft pt-3 text-[12.5px]">
        <button
          type="button"
          onClick={() => {
            if (prev) onPrev?.();
          }}
          aria-disabled={!prev || undefined}
          className={edgeCls}
        >
          <ChevronLeft aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="sr-only">Previous: </span>
          <span className="truncate">{prev ?? "None"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (next) onNext?.();
          }}
          aria-disabled={!next || undefined}
          className={edgeCls}
        >
          <span className="sr-only">Next: </span>
          <span className="truncate">{next ?? "None"}</span>
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
        </button>
      </nav>
    </header>
  );
}
