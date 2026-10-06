// Activity feed (XO Space "Activity" view): a newest-first event list in a soft card.
// Rows are a dot | body | time grid; under a narrow container the time moves under the body.
// Server-safe and prop-driven: pass events, status and the optional callbacks from a client
// parent (project links, load older events).
import type { ReactNode } from "react";
import { History, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { Skeleton, Spinner } from "@/components/ui";

export type ActivityTone = "default" | "warn" | "error";

export type ActivityFeedEvent = {
  id: string;
  /** Human event label, such as "Step completed" or "Peer sync applied". */
  label: string;
  /** ISO timestamp. */
  ts: string;
  /** Relative string computed against a fixed now, such as "12m ago". */
  ago: string;
  /** Project id. With onSelectSubject the subject renders as a button. */
  subjectId?: string | null;
  /** Project display name, or "Space" for space-wide events. */
  subjectLabel: string;
  detail?: string | null;
  /** Runtime display name, such as "Claude Code" (not the raw claude_code id). */
  runtime?: string | null;
  sessionId?: string | null;
  /** Person, job or connector behind events that have no session. */
  actor?: string | null;
  /** error for conflicts and failures, warn for blocked work. */
  tone?: ActivityTone;
};

export type ActivityFeedStatus = "loading" | "ready" | "refreshing" | "unavailable";

const DOT: Record<ActivityTone, string> = {
  default: "bg-white/[0.28]",
  warn: "bg-org shadow-[0_0_0_3px_color-mix(in_srgb,var(--org)_18%,transparent)]",
  error: "bg-red shadow-[0_0_0_3px_color-mix(in_srgb,var(--red)_18%,transparent)]",
};

const TONE_WORD: Record<ActivityTone, string | null> = { default: null, warn: "Needs attention", error: "Error" };

export type ActivityEventRowProps = {
  event: ActivityFeedEvent;
  onSelectSubject?: (id: string) => void;
};

/** One event: dot, label with project link, detail, runtime and session, then the time column. */
export function ActivityEventRow({ event, onSelectSubject }: ActivityEventRowProps) {
  const tone = event.tone ?? "default";
  const source = [event.runtime, event.sessionId ? `Session ${event.sessionId}` : null].filter(Boolean).join(" · ") || event.actor;
  const toneWord = TONE_WORD[tone];
  return (
    <li
      className={cn(
        "grid grid-cols-[6px_minmax(0,1fr)] items-start gap-x-[11px] gap-y-2 px-3.5 py-3.5",
        "@lg:grid-cols-[8px_minmax(0,1fr)_auto] @lg:gap-x-3.5 @lg:px-[18px] @lg:py-4",
        "border-t border-hair-soft first:border-t-0",
      )}
    >
      <span aria-hidden="true" className={cn("mt-[7px] size-1.5 rounded-full", DOT[tone])} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[12px] leading-normal">
          <b className="font-medium text-ink">
            {event.label}
            {toneWord ? <span className="sr-only"> ({toneWord})</span> : null}
          </b>
          {event.subjectId && onSelectSubject ? (
            <button
              type="button"
              onClick={() => onSelectSubject(event.subjectId as string)}
              className="min-w-0 max-w-full text-left text-[12px] text-ink-dim underline decoration-hair-strong underline-offset-[3px] [overflow-wrap:anywhere] hover:text-ink hover:decoration-ink"
            >
              {event.subjectLabel}
            </button>
          ) : (
            <span className="text-[12px] text-ink-dim">{event.subjectLabel}</span>
          )}
        </div>
        {event.detail ? (
          <p className="mt-1.5 whitespace-pre-wrap text-[12px] leading-relaxed text-ink-dim [overflow-wrap:anywhere]">{event.detail}</p>
        ) : null}
        {source ? <p className="mt-1.5 font-mono text-[11px] leading-normal text-ink-faint [overflow-wrap:anywhere]">{source}</p> : null}
      </div>
      <div className="col-start-2 flex flex-wrap gap-x-2 gap-y-1 text-[12px] leading-normal text-ink-faint @lg:col-start-auto @lg:flex-col @lg:items-end @lg:gap-1 @lg:whitespace-nowrap @lg:text-right">
        <time dateTime={event.ts} className="tabular-nums">
          {formatDateTime(event.ts)}
        </time>
        <span className="tabular-nums">{event.ago}</span>
      </div>
    </li>
  );
}

export type ActivityEventListProps = {
  events: ActivityFeedEvent[];
  onSelectSubject?: (id: string) => void;
  "aria-label"?: string;
  className?: string;
};

/** The bordered event list on its own (no header or footer). Wrap a parent in @container. */
export function ActivityEventList({ events, onSelectSubject, "aria-label": ariaLabel, className }: ActivityEventListProps) {
  return (
    <ol aria-label={ariaLabel} className={cn("m-0 list-none overflow-hidden rounded-[12px] border border-hair-soft bg-s2 p-0", className)}>
      {events.map((e) => (
        <ActivityEventRow key={e.id} event={e} onSelectSubject={onSelectSubject} />
      ))}
    </ol>
  );
}

/** Dashed empty or loading message in place of the list. */
export function ActivityFeedEmpty({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("rounded-[12px] border border-dashed border-hair px-[18px] py-[38px] text-center text-[13px] leading-relaxed text-ink-faint", className)}>
      {children}
    </p>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-[12px] border border-hair-soft bg-s1">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("grid grid-cols-[8px_minmax(0,1fr)_64px] gap-3.5 px-[18px] py-4", i > 0 && "border-t border-hair-soft")}>
          <Skeleton width={6} height={6} radius={999} className="mt-1.5" />
          <div className="flex flex-col gap-2">
            <Skeleton width={i % 2 ? "46%" : "58%"} height={10} />
            <Skeleton width={i % 2 ? "72%" : "64%"} height={9} />
          </div>
          <Skeleton height={10} />
        </div>
      ))}
    </div>
  );
}

export type ActivityFeedProps = {
  /** Heading, such as "Activity" or "Sharing activity". */
  title?: ReactNode;
  titleAs?: "h2" | "h3" | "h4";
  events: ActivityFeedEvent[];
  /** Events loaded before filtering, for the "8 of 30 loaded events" summary. */
  loadedCount?: number;
  status?: ActivityFeedStatus;
  /** Filter row: project select, search. */
  controls?: ReactNode;
  /** Retention note at the end of the controls row. */
  retention?: ReactNode;
  /** Orange note for failed or partial reads ("Could not load activity. Try Refresh."), announced politely. */
  warning?: ReactNode;
  /** Slot above the list, such as the open sessions disclosure. */
  live?: ReactNode;
  /** Shown when there are no rows. */
  emptyMessage?: ReactNode;
  onSelectSubject?: (id: string) => void;
  /** Refresh button in the header. */
  onRefresh?: () => void;
  /** Cursor pagination: show "Load older events" while more pages exist. */
  hasMore?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  /** "Updated Fri 2 Oct, 09:30". */
  updatedLabel?: ReactNode;
  className?: string;
};

/** Read-only, newest-first activity stream with summary, filters, live slot and pagination. */
export function ActivityFeed({
  title = "Activity",
  titleAs: Title = "h3",
  events,
  loadedCount,
  status = "ready",
  controls,
  retention,
  warning,
  live,
  emptyMessage = "No project events have been recorded yet.",
  onSelectSubject,
  onRefresh,
  hasMore = false,
  loadingOlder = false,
  onLoadOlder,
  updatedLabel,
  className,
}: ActivityFeedProps) {
  const total = loadedCount ?? events.length;
  const summary =
    status === "loading"
      ? "Loading activity…"
      : status === "unavailable"
        ? "Activity unavailable"
        : `${status === "refreshing" ? "Refreshing… · " : ""}${events.length} of ${total} loaded ${total === 1 ? "event" : "events"}`;
  const busy = status === "loading" || status === "refreshing";

  return (
    <div className={cn("@container min-w-0", className)}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <Title className="text-[22px] font-medium leading-tight tracking-[-0.02em] text-ink">{title}</Title>
          <p role="status" className="inline-flex items-center gap-2 text-[12px] text-ink-faint">
            {busy ? <Spinner size="xs" label={null} /> : null}
            {summary}
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-hair bg-s2 px-3 text-[12px] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw aria-hidden="true" className={cn("size-3.5", busy && "spin")} />
            Refresh
          </button>
        ) : null}
      </header>

      {controls || retention ? (
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          {controls}
          {retention ? <span className="basis-full text-[12px] leading-normal text-ink-faint @2xl:ml-auto @2xl:basis-auto">{retention}</span> : null}
        </div>
      ) : null}

      {warning ? (
        <p role="status" className="mb-4 rounded-[9px] border border-org/30 bg-org/[0.06] px-3.5 py-2.5 text-[12px] leading-relaxed text-org">
          {warning}
        </p>
      ) : null}

      {live}

      {status === "loading" && events.length === 0 ? (
        <SkeletonRows count={3} />
      ) : events.length === 0 ? (
        <ActivityFeedEmpty>{status === "unavailable" ? "Activity is unavailable." : emptyMessage}</ActivityFeedEmpty>
      ) : (
        <ActivityEventList events={events} onSelectSubject={onSelectSubject} aria-label={typeof title === "string" ? `${title} events` : undefined} />
      )}

      {(hasMore && onLoadOlder) || updatedLabel ? (
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {hasMore && onLoadOlder ? (
            <button
              type="button"
              onClick={onLoadOlder}
              disabled={loadingOlder || busy}
              aria-busy={loadingOlder || undefined}
              className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-hair bg-s2 px-3.5 text-[12px] text-ink transition-colors hover:border-hair-strong hover:bg-s3 disabled:cursor-wait disabled:opacity-60"
            >
              {loadingOlder ? <Spinner size="xs" label={null} /> : <History aria-hidden="true" className="size-3.5 text-ink-dim" />}
              {loadingOlder ? "Loading…" : "Load older events"}
            </button>
          ) : (
            <span />
          )}
          {updatedLabel ? <span className="ml-auto text-[12px] text-ink-faint">{updatedLabel}</span> : null}
        </footer>
      ) : null}
    </div>
  );
}
