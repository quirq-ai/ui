// Project dashboard sections (XO Swarm project visualizer card): a header with refresh, then
// section cards for open sessions, stats, steps and the event timeline, each with its own
// empty state, plus the loading, partial error and error panels. Server-safe and prop-driven.
import type { ComponentType, ReactNode } from "react";
import { Ban, CircleCheck, Circle, LoaderCircle, RefreshCw, RotateCcw, TriangleAlert, type LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TodoStatus } from "@/lib/fixtures";
import { Button, IconButton, Spinner } from "@/components/ui";

/* ----------------------------------------------------------------------------- chips */

/** Mono chip for runtime names (uppercase, tracked) and raw event types (as written). */
export function MonoChip({ children, upper = true, className }: { children: ReactNode; upper?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] shrink-0 items-center rounded-[5px] border border-hair px-1.5 font-mono text-[10px] leading-none text-ink-dim",
        upper ? "uppercase tracking-[0.08em]" : "bg-white/[0.03] tracking-normal",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------- header */

export type ProjectSectionsHeaderProps = {
  title: string;
  /** Heading level for the project title. */
  titleAs?: "h2" | "h3" | "h4";
  /** Projects root path, in mono. */
  path: string;
  busy?: boolean;
  onRefresh?: () => void;
};

/** Project title, its path and a refresh icon button that spins while loading. */
export function ProjectSectionsHeader({ title, titleAs: Title = "h3", path, busy = false, onRefresh }: ProjectSectionsHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Title className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</Title>
        <p className="mt-0.5 truncate font-mono text-[11.5px] text-ink-faint">{path}</p>
      </div>
      {onRefresh ? (
        <IconButton aria-label={busy ? "Refreshing" : "Refresh"} tip="bottom" size="md" variant="outline" onClick={onRefresh} disabled={busy}>
          <RefreshCw className={cn(busy && "spin")} />
        </IconButton>
      ) : null}
    </header>
  );
}

/* ----------------------------------------------------------------------------- section card */

export type ProjectSectionCardProps = {
  icon: ComponentType<LucideProps>;
  title: string;
  /** Heading level for the section title, one below the project title. */
  titleAs?: "h3" | "h4" | "h5";
  /** Right side summary, such as "2 completed · 1 in progress". */
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** One dashboard section: icon, title, optional summary, body. */
export function ProjectSectionCard({ icon: Icon, title, titleAs: Title = "h4", subtitle, children, className }: ProjectSectionCardProps) {
  return (
    <section className={cn("@container min-w-0 rounded-[14px] border border-hair bg-s2 p-4 sm:p-5", className)} aria-label={title}>
      <header className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
          <Title className="truncate text-[13px] font-semibold text-ink">{title}</Title>
        </div>
        {subtitle ? <p className="text-[12px] text-ink-faint">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

/** Centered two-line empty state inside a section. */
export function SectionEmpty({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-5 text-center">
      <p className="text-[13px] font-medium text-ink/85">{primary}</p>
      <p className="max-w-md text-[12px] leading-relaxed text-ink-faint">{secondary}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- open sessions */

export type SectionSession = { id: string; runtime: string | null; lastActive: string | null };

/** Live session rows: green dot, mono session id, runtime chip and relative time. */
export function OpenSessionRows({ sessions }: { sessions: SectionSession[] }) {
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-hair-soft p-0">
      {sessions.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-grn shadow-[0_0_0_3px_color-mix(in_srgb,var(--grn)_18%,transparent)]" />
            <code className="truncate font-mono text-[12px] text-ink">{s.id}</code>
            {s.runtime ? <MonoChip>{s.runtime}</MonoChip> : null}
          </div>
          {s.lastActive ? <span className="shrink-0 text-[12px] tabular-nums text-ink-faint">{s.lastActive}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- stats */

export type SectionStat = { label: string; value: string; sub: string };

/** Rolling totals as small tiles. Pass "Unavailable" for values with no source, never 0. */
export function StatTiles({ stats }: { stats: SectionStat[] }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-3 @2xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col gap-1.5 rounded-[10px] border border-hair-soft bg-black/30 p-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{s.label}</dt>
          <dd className={cn("m-0 truncate text-[19px] font-semibold tabular-nums", s.value === "Unavailable" ? "text-[14px] font-medium text-ink-faint" : "text-ink")}>
            {s.value}
          </dd>
          <dd className="m-0 truncate text-[11px] text-ink-faint">{s.sub}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ----------------------------------------------------------------------------- steps */

export type SectionStep = { id: string; content: string; status: TodoStatus; note?: string | null };
export type SectionStepGroup = { sessionId: string; runtime: string | null; steps: SectionStep[] };

const STEP_WORD: Record<TodoStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  pending: "Pending",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

function StepIcon({ status }: { status: TodoStatus }) {
  const cls = "mt-[3px] size-3.5 shrink-0";
  if (status === "completed") return <CircleCheck aria-hidden="true" className={cn(cls, "text-grn")} />;
  if (status === "in_progress") return <LoaderCircle aria-hidden="true" className={cn(cls, "spin text-blu")} />;
  if (status === "blocked") return <TriangleAlert aria-hidden="true" className={cn(cls, "text-org")} />;
  if (status === "cancelled") return <Ban aria-hidden="true" className={cn(cls, "text-ink-faint")} />;
  return <Circle aria-hidden="true" className={cn(cls, "text-ink-faint/60")} />;
}

/** Steps grouped by session: session id, runtime chip, then one row per step. */
export function StepGroups({ groups }: { groups: SectionStepGroup[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {groups.map((g) => (
        <li key={g.sessionId}>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <code className="font-mono text-[12px] text-ink">{g.sessionId}</code>
            {g.runtime ? <MonoChip>{g.runtime}</MonoChip> : null}
          </div>
          {g.steps.length === 0 ? (
            <p className="ml-5 text-[12px] italic text-ink-faint">No steps in this session.</p>
          ) : (
            <ul className="m-0 ml-1 flex list-none flex-col gap-1 p-0">
              {g.steps.map((t) => {
                const done = t.status === "completed" || t.status === "cancelled";
                return (
                  <li key={t.id} className="flex items-start gap-2 text-[13px] leading-snug">
                    <StepIcon status={t.status} />
                    <span className="min-w-0">
                      <span className={cn(done ? "text-ink-faint line-through decoration-ink-faint/60" : "text-ink")}>{t.content}</span>
                      <span className="sr-only"> ({STEP_WORD[t.status]})</span>
                      {t.note ? <span className="mt-0.5 block text-[11.5px] text-ink-faint">{t.note}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Count summary for the steps section header. */
export function stepSummary(groups: SectionStepGroup[]): string | undefined {
  const all = groups.flatMap((g) => g.steps);
  if (all.length === 0) return undefined;
  const n = (s: TodoStatus) => all.filter((t) => t.status === s).length;
  const parts = [
    `${n("completed")} completed`,
    `${n("in_progress")} in progress`,
    `${n("pending")} pending`,
    n("blocked") ? `${n("blocked")} blocked` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/* ----------------------------------------------------------------------------- timeline */

export type SectionEvent = { id: string; ts: string; when: string; type: string; detail: string };

/** Event rows: relative time, mono type chip, one-line detail. Older rows fold into a count. */
export function EventTimelineRows({ events, max = 30 }: { events: SectionEvent[]; max?: number }) {
  const shown = events.slice(0, max);
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-hair-soft p-0">
      {shown.map((e) => (
        <li key={e.id} className="flex items-start gap-3 py-1.5 first:pt-0 last:pb-0">
          <time dateTime={e.ts} className="w-14 shrink-0 pt-px font-mono text-[10.5px] tabular-nums text-ink-faint">
            {e.when}
          </time>
          <MonoChip upper={false}>{e.type}</MonoChip>
          <span className="min-w-0 flex-1 truncate text-[12px] text-ink-dim">{e.detail}</span>
        </li>
      ))}
      {events.length > shown.length ? (
        <li className="pt-2 text-center text-[12px] text-ink-faint">+ {events.length - shown.length} older events</li>
      ) : null}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- whole-card states */

/** Spinner panel while the project bundle loads. */
export function SectionLoadingPanel({ label = "Loading project…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 rounded-[14px] border border-hair bg-s2 p-12 text-[13px] text-ink-dim">
      <Spinner size="sm" label={null} />
      {label}
    </div>
  );
}

/** Amber banner listing the panels that failed while the rest loaded. */
export function PartialErrorBanner({ errors }: { errors: string[] }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-[14px] border border-org/35 bg-org/[0.07] p-3">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-org" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[12px] font-medium text-org">Some panels could not load</p>
        <ul className="m-0 list-inside list-disc p-0 text-[12px] text-ink-dim">
          {errors.map((e) => (
            <li key={e} className="truncate" title={e}>
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Full error panel with a retry action. */
export function SectionErrorPanel({ title = "Could not load this project", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-[14px] border border-hair bg-s2 p-10 text-center">
      <TriangleAlert aria-hidden="true" className="size-7 text-red/80" />
      <div>
        <p className="text-[13px] font-medium text-[#ff7a70]">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-ink-faint">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" leadingIcon={<RotateCcw />} onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
