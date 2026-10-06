// Icon event list (projects visualizer drawer): a labelled section with rows of a 28px icon
// tile, a bold one-line title and a "runtime · 12m ago" meta line. The first row has no top
// border. Also the signals panel: up to three toned dots that say what needs attention.
// Server-safe and prop-driven.
import type { ReactNode } from "react";
import { Activity, FileText, ListChecks, Radio, Waypoints } from "lucide-react";
import { cn } from "@/lib/cn";

export type EventIconKind = "live" | "document" | "task" | "timeline";

const ICONS: Record<EventIconKind, typeof Radio> = {
  live: Radio,
  document: FileText,
  task: ListChecks,
  timeline: Waypoints,
};

/** Icon for an event type: document for file.*, task for todo.*, timeline otherwise. */
export function iconForEventType(type: string): EventIconKind {
  if (type.startsWith("file.")) return "document";
  if (type.startsWith("todo.")) return "task";
  return "timeline";
}

export type IconEventItem = {
  id: string;
  icon: EventIconKind;
  title: string;
  /** "Claude Code · active 2m ago" */
  meta: string;
};

export type IconEventListProps = {
  /** Section label, such as "Recent events". */
  label: string;
  /** Count suffix after a middle dot. */
  count?: number;
  items: IconEventItem[];
  emptyText?: string;
  className?: string;
};

/** Drawer section with icon-tile rows. */
export function IconEventList({ label, count, items, emptyText = "No recent events have been emitted.", className }: IconEventListProps) {
  const heading = count === undefined ? label : `${label} · ${count}`;
  return (
    <section className={cn("min-w-0", className)} aria-label={heading}>
      <p className="mb-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">{heading}</p>
      {items.length === 0 ? (
        <p className="text-[12px] leading-relaxed text-ink-faint">{emptyText}</p>
      ) : (
        <ul className="m-0 grid list-none p-0">
          {items.map((it) => {
            const Icon = ICONS[it.icon];
            return (
              <li key={it.id} className="grid min-h-[52px] grid-cols-[32px_minmax(0,1fr)] items-center gap-2.5 border-t border-hair-soft first:border-t-0">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-[8px] border border-hair",
                    it.icon === "live" ? "text-grn" : "text-ink-dim",
                  )}
                >
                  <Icon aria-hidden="true" className="size-[13px]" />
                </span>
                <p className="m-0 min-w-0">
                  <b className="block truncate text-[12px] font-semibold text-ink">{it.title}</b>
                  <small className="mt-1 block truncate text-[11px] text-ink-faint">{it.meta}</small>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------------- signals */

export type SignalTone = "good" | "warn" | "neutral";

export type Signal = { id: string; tone: SignalTone; text: ReactNode };

const SIGNAL_DOT: Record<SignalTone, string> = {
  good: "bg-grn shadow-[0_0_8px_color-mix(in_srgb,var(--grn)_55%,transparent)]",
  warn: "bg-org",
  neutral: "bg-ink-faint",
};

const SIGNAL_WORD: Record<SignalTone, string> = { good: "Good", warn: "Needs attention", neutral: "Note" };

export type SignalsPanelProps = {
  signals: Signal[];
  title?: string;
  description?: string;
  /** Row shown when no signal applies. */
  fallback?: string;
  /** At most this many signals are shown. */
  max?: number;
  className?: string;
};

/** "What needs attention in this scope": good, warn and neutral dots with one line each. */
export function SignalsPanel({
  signals,
  title = "Signals",
  description = "What needs attention in this scope",
  fallback = "No recent signal is available for this scope yet.",
  max = 3,
  className,
}: SignalsPanelProps) {
  const rows: Signal[] = signals.length ? signals.slice(0, max) : [{ id: "fallback", tone: "neutral", text: fallback }];
  return (
    <section className={cn("@container min-w-0 rounded-[14px] border border-hair bg-s2 p-[18px]", className)} aria-label={title}>
      <div className="flex items-start gap-2.5">
        <Activity aria-hidden="true" className="mt-0.5 size-[15px] shrink-0 text-ink-faint" />
        <div>
          <h4 className="m-0 text-[13px] font-semibold text-ink">{title}</h4>
          <p className="m-0 mt-0.5 text-[11.5px] text-ink-faint">{description}</p>
        </div>
      </div>
      <ul className="m-0 mt-4 grid list-none gap-x-5 gap-y-3 p-0 @2xl:grid-cols-3">
        {rows.map((s) => (
          <li key={s.id} className="grid grid-cols-[8px_minmax(0,1fr)] gap-2.5 leading-normal">
            <span aria-hidden="true" className={cn("mt-[7px] size-[7px] rounded-full", SIGNAL_DOT[s.tone])} />
            <p className="m-0 text-[12.5px] text-ink-dim">
              <span className="sr-only">{SIGNAL_WORD[s.tone]}: </span>
              {s.text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
