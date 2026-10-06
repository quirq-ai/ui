"use client";

// Select, period and date pickers: ProjectPicker (a select-only combobox over a listbox:
// arrow keys, Home, End, type-ahead, Enter, Esc), Calendar and RangeCalendar (month grids
// with a roving tab stop: arrows move by day and week, Home and End jump in the week, Page
// Up and Page Down change month; today, selected, range, outside-month, disabled and marked
// days), and PeriodPicker ("Last 30 days" presets plus a custom range in a popover).
// Day math is pure UTC on "YYYY-MM-DD" keys, so server and client always agree.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- day math */

/** "2026-10-02" */
export type DayKey = string;

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK = [
  { short: "Su", long: "Sunday" },
  { short: "Mo", long: "Monday" },
  { short: "Tu", long: "Tuesday" },
  { short: "We", long: "Wednesday" },
  { short: "Th", long: "Thursday" },
  { short: "Fr", long: "Friday" },
  { short: "Sa", long: "Saturday" },
];
const DAY_MS = 86_400_000;

function parts(k: DayKey) {
  const [y, m, d] = k.split("-").map(Number);
  return { y, m: m - 1, d };
}
function msOf(k: DayKey) {
  const { y, m, d } = parts(k);
  return Date.UTC(y, m, d);
}
function keyOfMs(ms: number): DayKey {
  return new Date(ms).toISOString().slice(0, 10);
}
export function addDays(k: DayKey, n: number): DayKey {
  return keyOfMs(msOf(k) + n * DAY_MS);
}
/** First day of the month n months after the month of k. */
export function addMonths(k: DayKey, n: number): DayKey {
  const { y, m } = parts(k);
  return keyOfMs(Date.UTC(y, m + n, 1));
}
function monthStart(k: DayKey): DayKey {
  const { y, m } = parts(k);
  return keyOfMs(Date.UTC(y, m, 1));
}
function dow(k: DayKey) {
  return new Date(msOf(k)).getUTCDay();
}
function sameMonth(a: DayKey, b: DayKey) {
  return a.slice(0, 7) === b.slice(0, 7);
}
/** "Sep 2" */
export function shortDay(k: DayKey) {
  const { m, d } = parts(k);
  return `${MONTHS_SHORT[m]} ${d}`;
}
/** "Sep 2 to Oct 1, 2026"; years differ: "Dec 28, 2025 to Jan 3, 2026". */
export function formatRange(start: DayKey, end: DayKey) {
  const a = parts(start);
  const b = parts(end);
  return a.y === b.y ? `${shortDay(start)} to ${shortDay(end)}, ${b.y}` : `${shortDay(start)}, ${a.y} to ${shortDay(end)}, ${b.y}`;
}
function longDay(k: DayKey) {
  const { y, m, d } = parts(k);
  return `${WEEK[dow(k)].long}, ${MONTHS_LONG[m]} ${d}, ${y}`;
}
function daysBetween(a: DayKey, b: DayKey) {
  return Math.round((msOf(b) - msOf(a)) / DAY_MS);
}

/* ----------------------------------------------------------------------------- CalendarCore */

export type MarkTone = "grn" | "red" | "blu" | "org" | "ink";

type CoreProps = {
  months: 1 | 2;
  firstMonth: DayKey;
  onFirstMonthChange: (k: DayKey) => void;
  today?: DayKey;
  min?: DayKey;
  max?: DayKey;
  marked?: Record<DayKey, MarkTone>;
  /** What a mark means, for screen readers: "run". */
  markLabel?: (tone: MarkTone) => string;
  isSelected: (k: DayKey) => boolean;
  inRange?: (k: DayKey) => boolean;
  onPick: (k: DayKey) => void;
  onHoverDay?: (k: DayKey | null) => void;
  initialFocus: DayKey;
  label: string;
};

const markBg: Record<MarkTone, string> = { grn: "bg-grn", red: "bg-red", blu: "bg-blu", org: "bg-org", ink: "bg-ink" };

function CalendarCore({
  months,
  firstMonth,
  onFirstMonthChange,
  today,
  min,
  max,
  marked,
  markLabel,
  isSelected,
  inRange,
  onPick,
  onHoverDay,
  initialFocus,
  label,
}: CoreProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [focusKey, setFocusKey] = useState<DayKey>(initialFocus);
  const [moved, setMoved] = useState(0);
  const lastMonth = addMonths(firstMonth, months - 1);
  const visible = (k: DayKey) => msOf(k) >= msOf(firstMonth) && msOf(k) < msOf(addMonths(firstMonth, months));
  const tabKey = visible(focusKey) ? focusKey : visible(initialFocus) ? initialFocus : firstMonth;

  useEffect(() => {
    if (!moved) return;
    rootRef.current?.querySelector<HTMLButtonElement>(`button[data-day="${focusKey}"]`)?.focus();
  }, [moved, focusKey]);

  const disabled = (k: DayKey) => (min ? msOf(k) < msOf(min) : false) || (max ? msOf(k) > msOf(max) : false);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, k: DayKey) {
    let next: DayKey | null = null;
    if (e.key === "ArrowLeft") next = addDays(k, -1);
    else if (e.key === "ArrowRight") next = addDays(k, 1);
    else if (e.key === "ArrowUp") next = addDays(k, -7);
    else if (e.key === "ArrowDown") next = addDays(k, 7);
    else if (e.key === "Home") next = addDays(k, -dow(k));
    else if (e.key === "End") next = addDays(k, 6 - dow(k));
    else if (e.key === "PageUp" || e.key === "PageDown") {
      const shifted = addMonths(k, e.key === "PageUp" ? -1 : 1);
      const { d } = parts(k);
      const dim = parts(addDays(addMonths(shifted, 1), -1)).d;
      next = addDays(shifted, Math.min(d, dim) - 1);
    }
    if (!next) return;
    e.preventDefault();
    if (msOf(next) < msOf(firstMonth)) onFirstMonthChange(monthStart(next));
    else if (msOf(next) >= msOf(addMonths(firstMonth, months))) onFirstMonthChange(addMonths(monthStart(next), -(months - 1)));
    setFocusKey(next);
    setMoved((n) => n + 1);
  }

  const monthKeys = Array.from({ length: months }, (_, i) => addMonths(firstMonth, i));

  return (
    <div ref={rootRef} className="min-w-0" onMouseLeave={() => onHoverDay?.(null)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => onFirstMonthChange(addMonths(firstMonth, -1))}
          className="inline-flex size-7 items-center justify-center rounded-[7px]! text-ink-dim transition-colors hover:bg-s3 hover:text-ink"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <p aria-live="polite" className="text-[13px] font-medium text-ink">
          <span className="sr-only">{label}: </span>
          {months === 1
            ? `${MONTHS_LONG[parts(firstMonth).m]} ${parts(firstMonth).y}`
            : `${MONTHS_LONG[parts(firstMonth).m]} to ${MONTHS_LONG[parts(lastMonth).m]} ${parts(lastMonth).y}`}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => onFirstMonthChange(addMonths(firstMonth, 1))}
          className="inline-flex size-7 items-center justify-center rounded-[7px]! text-ink-dim transition-colors hover:bg-s3 hover:text-ink"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className={cn("grid gap-x-6 gap-y-4", months === 2 && "sm:grid-cols-2")}>
        {monthKeys.map((mk) => {
          const start = addDays(mk, -dow(mk));
          const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
          const rows = Array.from({ length: 6 }, (_, r) => cells.slice(r * 7, r * 7 + 7)).filter((row) => months === 1 || row.some((k) => sameMonth(k, mk)));
          const { m, y } = parts(mk);
          return (
            <div key={mk} className="min-w-0">
              {months === 2 ? <p className="mb-1.5 text-center text-[12px] text-ink-dim">{`${MONTHS_LONG[m]} ${y}`}</p> : null}
              <table role="grid" aria-label={`${MONTHS_LONG[m]} ${y}`} className="w-full border-collapse">
                <thead>
                  <tr>
                    {WEEK.map((w) => (
                      <th key={w.short} scope="col" abbr={w.long} className="pb-1 text-center font-mono text-[10px] font-normal uppercase tracking-[0.06em] text-ink-faint">
                        {w.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((k) => {
                        const outside = !sameMonth(k, mk);
                        if (outside && months === 2) return <td key={k} className="p-0" />;
                        const sel = isSelected(k);
                        const range = !sel && (inRange?.(k) ?? false);
                        const off = disabled(k);
                        const isToday = k === today;
                        const mark = marked?.[k];
                        return (
                          <td key={k} className={cn("p-0 text-center", range && "bg-white/[0.07]")}>
                            <button
                              type="button"
                              data-day={k}
                              tabIndex={k === tabKey && !outside ? 0 : -1}
                              aria-pressed={sel}
                              aria-disabled={off || undefined}
                              aria-current={isToday ? "date" : undefined}
                              aria-label={`${longDay(k)}${isToday ? ", today" : ""}${mark ? `, ${markLabel?.(mark) ?? "marked"}` : ""}${off ? ", unavailable" : ""}`}
                              onClick={() => {
                                if (off) return;
                                setFocusKey(k);
                                onPick(k);
                              }}
                              onMouseEnter={() => onHoverDay?.(off ? null : k)}
                              onFocus={() => onHoverDay?.(off ? null : k)}
                              onKeyDown={(e) => onKeyDown(e, k)}
                              className={cn(
                                "relative mx-auto inline-flex size-8 items-center justify-center rounded-[8px]! font-mono text-[12px] tabular-nums transition-colors",
                                sel
                                  ? "bg-ink font-semibold text-black"
                                  : isToday
                                    ? "bg-s3 font-semibold text-ink hover:bg-s4"
                                    : outside
                                      ? "text-ink-faint/60 hover:bg-s2"
                                      : "text-ink hover:bg-s3",
                                off && "cursor-not-allowed opacity-40 hover:bg-transparent",
                              )}
                            >
                              {parts(k).d}
                              {mark ? (
                                <span
                                  aria-hidden="true"
                                  className={cn("absolute bottom-[3px] left-1/2 size-1 -translate-x-1/2 rounded-full", sel ? "bg-black" : markBg[mark])}
                                />
                              ) : null}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- Calendar */

export type CalendarProps = {
  /** Month to show first ("2026-10-01"); defaults to the selected day or today. */
  defaultMonth?: DayKey;
  today?: DayKey;
  value?: DayKey | null;
  defaultValue?: DayKey | null;
  onChange?: (day: DayKey) => void;
  min?: DayKey;
  max?: DayKey;
  marked?: Record<DayKey, MarkTone>;
  markLabel?: (tone: MarkTone) => string;
  label?: string;
  className?: string;
};

/** One month grid with today, selected, outside, disabled and marked days. */
export function Calendar({ defaultMonth, today, value, defaultValue = null, onChange, min, max, marked, markLabel, label = "Choose a day", className }: CalendarProps) {
  const [inner, setInner] = useState<DayKey | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const [first, setFirst] = useState(monthStart(defaultMonth ?? selected ?? today ?? "2026-10-01"));
  return (
    <div className={cn("w-full max-w-[292px] rounded-[12px] border border-hair bg-black/50 p-3", className)}>
      <CalendarCore
        months={1}
        firstMonth={first}
        onFirstMonthChange={setFirst}
        today={today}
        min={min}
        max={max}
        marked={marked}
        markLabel={markLabel}
        isSelected={(k) => k === selected}
        onPick={(k) => {
          if (value === undefined) setInner(k);
          onChange?.(k);
        }}
        initialFocus={selected ?? today ?? first}
        label={label}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- RangeCalendar */

export type DayRange = { start: DayKey | null; end: DayKey | null };

export type RangeCalendarProps = {
  defaultMonth?: DayKey;
  today?: DayKey;
  value?: DayRange;
  defaultValue?: DayRange;
  onChange?: (range: DayRange) => void;
  min?: DayKey;
  max?: DayKey;
  label?: string;
  className?: string;
};

/** Two months side by side. First pick sets the start, second the end; hover previews. */
export function RangeCalendar({ defaultMonth, today, value, defaultValue = { start: null, end: null }, onChange, min, max, label = "Choose a range", className }: RangeCalendarProps) {
  const [inner, setInner] = useState<DayRange>(defaultValue);
  const range = value ?? inner;
  const [hover, setHover] = useState<DayKey | null>(null);
  const [first, setFirst] = useState(() => {
    const anchor = defaultMonth ?? today ?? range.end ?? "2026-10-01";
    return addMonths(monthStart(anchor), defaultMonth ? 0 : -1);
  });

  const lo = range.start;
  const hi = range.end ?? (lo && hover && msOf(hover) > msOf(lo) ? hover : null);

  function pick(k: DayKey) {
    let next: DayRange;
    if (!range.start || range.end) next = { start: k, end: null };
    else if (msOf(k) < msOf(range.start)) next = { start: k, end: range.start };
    else next = { start: range.start, end: k };
    if (value === undefined) setInner(next);
    onChange?.(next);
  }

  const days = lo && range.end ? daysBetween(lo, range.end) + 1 : null;

  return (
    <div className={cn("min-w-0 rounded-[12px] border border-hair bg-black/50 p-3", className)}>
      <CalendarCore
        months={2}
        firstMonth={first}
        onFirstMonthChange={setFirst}
        today={today}
        min={min}
        max={max}
        isSelected={(k) => k === lo || k === range.end}
        inRange={(k) => !!lo && !!hi && msOf(k) > msOf(lo) && msOf(k) < msOf(hi)}
        onPick={pick}
        onHoverDay={setHover}
        initialFocus={range.end ?? range.start ?? today ?? first}
        label={label}
      />
      <p role="status" className="mt-3 border-t border-hair-soft pt-2.5 text-[12px] text-ink-dim">
        {lo && range.end ? (
          <>
            <span className="text-ink">{formatRange(lo, range.end)}</span>
            <span className="text-ink-faint"> · {days} days</span>
          </>
        ) : lo ? (
          `From ${shortDay(lo)}: pick the last day`
        ) : (
          "Pick the first day"
        )}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- PeriodPicker */

export type Period = { preset: number } | { preset: "custom"; start: DayKey | null; end: DayKey | null };

export type PeriodPickerProps = {
  /** Preset windows in days, such as [7, 15, 30]. */
  presets: number[];
  /** Last full day a preset counts back from. */
  endDay: DayKey;
  /** Days after this are disabled in the custom range. */
  today: DayKey;
  value?: Period;
  defaultValue?: Period;
  onChange?: (period: Period, range: DayRange) => void;
  className?: string;
};

/** "[Last 30 days ▾] [Sep 2 to Oct 1, 2026]": presets plus a custom two-month range. */
export function PeriodPicker({ presets, endDay, today, value, defaultValue, onChange, className }: PeriodPickerProps) {
  const uid = useId();
  const [inner, setInner] = useState<Period>(defaultValue ?? { preset: presets[presets.length - 1] });
  const period = value ?? inner;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const range: DayRange =
    period.preset === "custom" ? { start: period.start, end: period.end } : { start: addDays(endDay, -(period.preset - 1)), end: endDay };

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    // Move focus onto the calendar's one tab stop so arrow keys work straight away.
    rootRef.current?.querySelector<HTMLButtonElement>('[role="dialog"] button[data-day][tabindex="0"]')?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function set(next: Period) {
    if (value === undefined) setInner(next);
    const r: DayRange = next.preset === "custom" ? { start: next.start, end: next.end } : { start: addDays(endDay, -(next.preset - 1)), end: endDay };
    onChange?.(next, r);
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative flex flex-wrap items-center gap-2", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
      onBlur={(e) => {
        // Tabbing out closes it; a click on blank space inside (relatedTarget null) does not.
        const next = e.relatedTarget as Node | null;
        if (open && next && !rootRef.current?.contains(next)) setOpen(false);
      }}
    >
      <label htmlFor={`${uid}-preset`} className="sr-only">
        Time window
      </label>
      <div className="relative">
        <select
          id={`${uid}-preset`}
          value={String(period.preset)}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "custom") {
              set({ preset: "custom", start: null, end: null });
              setOpen(true);
            } else set({ preset: Number(v) });
          }}
          className="h-8 cursor-pointer appearance-none rounded-[8px]! border border-hair bg-s2 pl-2.5 pr-8 text-[12.5px] text-ink transition-colors hover:border-hair-strong hover:bg-s3"
        >
          {presets.map((p) => (
            <option key={p} value={p}>
              Last {p} days
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
      </div>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={range.start && range.end ? `Date range ${formatRange(range.start, range.end)}. Change range` : "Pick a range"}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-[8px]! border border-hair bg-s2 px-2.5 text-[12.5px] transition-colors hover:border-hair-strong hover:bg-s3",
          range.start && range.end ? "text-ink" : "text-ink-dim",
        )}
      >
        <CalendarDays aria-hidden="true" className="size-3.5 text-ink-faint" />
        {range.start && range.end ? formatRange(range.start, range.end) : "Pick a range"}
      </button>
      {open ? (
        // tabIndex -1: a click on blank space inside keeps focus here, so Esc still closes it.
        <div
          role="dialog"
          aria-label="Custom range"
          tabIndex={-1}
          className="rise absolute left-0 top-full z-30 mt-1.5 w-[min(560px,calc(100vw-48px))] rounded-[12px] shadow-[0_18px_48px_rgba(0,0,0,0.6)] focus-visible:outline-none!"
        >
          <RangeCalendar
            today={today}
            max={today}
            className="bg-s2"
            defaultValue={range}
            onChange={(r) => {
              if (r.start && r.end) {
                set({ preset: "custom", start: r.start, end: r.end });
                setOpen(false);
                triggerRef.current?.focus();
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- ProjectPicker */

export type PickerOption = {
  value: string;
  label: string;
  /** Second line or right side meta: "Engineering · 2 open". */
  meta?: ReactNode;
  /** CSS color for the leading dot. */
  color?: string;
};

export type ProjectPickerProps = {
  options: PickerOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Visible label id; or pass aria-label. */
  labelledBy?: string;
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
};

/** Select-only combobox: a trigger plus a listbox popover, fully keyboard operable. */
export function ProjectPicker({
  options,
  value,
  defaultValue = null,
  onChange,
  placeholder = "Choose a project",
  labelledBy,
  "aria-label": ariaLabel,
  disabled,
  className,
}: ProjectPickerProps) {
  const uid = useId();
  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === current) ?? null;
  const listId = `${uid}-list`;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function choose(i: number) {
    const o = options[i];
    if (!o) return;
    if (value === undefined) setInner(o.value);
    onChange?.(o.value);
    setOpen(false);
  }

  function openAt(i: number) {
    setActive(Math.max(0, Math.min(options.length - 1, i)));
    setOpen(true);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const idx = selected ? options.indexOf(selected) : 0;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openAt(e.key === "ArrowUp" && !selected ? options.length - 1 : idx);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const ch = e.key.toLowerCase();
      const start = active + 1;
      const order = [...options.slice(start), ...options.slice(0, start)];
      const hit = order.find((o) => o.label.toLowerCase().startsWith(ch));
      if (hit) setActive(options.indexOf(hit));
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openAt(selected ? options.indexOf(selected) : 0))}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2.5 rounded-[10px]! border border-hair bg-s1 pl-3 pr-2.5 text-left text-[13px] transition-colors",
          "hover:border-hair-strong disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-white/30 bg-s2",
        )}
      >
        {selected ? (
          <>
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: selected.color ?? "var(--ink-faint)" }} />
            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink">{selected.label}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-ink-faint">{placeholder}</span>
        )}
        <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-ink-faint transition-transform duration-150", open && "rotate-180")} />
      </button>
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel ?? "Options"}
        hidden={!open}
        // Keep focus on the combobox while the pointer is in the list.
        onMouseDown={(e) => e.preventDefault()}
        className="rise scroll-thin absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[248px] overflow-y-auto rounded-[12px] border border-hair-strong bg-s2 p-1 shadow-[0_18px_48px_rgba(0,0,0,0.6)]"
      >
        {options.map((o, i) => {
          const isSel = o.value === current;
          return (
            <li
              key={o.value}
              id={`${uid}-opt-${i}`}
              data-index={i}
              role="option"
              aria-selected={isSel}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(i)}
              className={cn("flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2", i === active && "bg-s4")}
            >
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: o.color ?? "var(--ink-faint)" }} />
              <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink">{o.label}</span>
              {o.meta ? <span className="shrink-0 text-[11.5px] text-ink-faint">{o.meta}</span> : null}
              <Check aria-hidden="true" className={cn("size-3.5 shrink-0 text-ink", isSel ? "opacity-100" : "opacity-0")} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
