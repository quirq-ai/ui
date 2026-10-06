// Object state chips: the specific state word for each object, never a universal "Active".
// StateChip and STATE_MAPS come from the ui kit (space, todo, connector, measurement,
// subscription, membership, result...). This file adds ToneChip for words outside those
// maps, SharingChip with the sharing states, WithDetail (hover or focus to read why) and
// TodoStatusRow. Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StateChip, StatusDot, stateMeta, statusTone, type DotStatus } from "@/components/ui/status";
import { Tooltip } from "@/components/ui/tooltip";
import { toneSoft } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- tone groups */

/** Four tone groups every state word falls into. */
export type ToneGroup = "good" | "pending" | "error" | "idle";

export const TONE_GROUP: Record<DotStatus, ToneGroup> = { up: "good", busy: "pending", warn: "pending", down: "error", idle: "idle" };

export const TONE_GROUP_META: Record<ToneGroup, { label: string; status: DotStatus; blurb: string }> = {
  good: { label: "Good", status: "up", blurb: "Working as intended" },
  pending: { label: "Pending", status: "warn", blurb: "In motion or waiting on a person" },
  error: { label: "Error", status: "down", blurb: "Failed or unreachable" },
  idle: { label: "Idle", status: "idle", blurb: "Off, finished or unknown" },
};

/* ----------------------------------------------------------------------------- ToneChip */

export type ToneChipProps = {
  status: DotStatus;
  children: ReactNode;
  prefix?: ReactNode;
  pulse?: boolean;
  dot?: boolean;
  /** Chip (tinted box, radius 6) or plain (dot and word, for table cells). */
  variant?: "chip" | "plain";
  className?: string;
};

/** A state word outside the shared maps ("Connection failed", "2 new · not applied"). */
export function ToneChip({ status, children, prefix, pulse = false, dot = true, variant = "chip", className }: ToneChipProps) {
  const tone = statusTone[status];
  const pre = prefix ? (
    <>
      <span className="text-ink-dim">{prefix}</span>
      <span aria-hidden="true" className="text-ink-faint">
        ·
      </span>
    </>
  ) : null;
  if (variant === "plain") {
    return (
      <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-[12.5px] text-ink", className)}>
        {dot ? <StatusDot status={status} pulse={pulse} /> : null}
        {pre}
        <span>{children}</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-2 text-[11.5px] font-medium leading-none",
        toneSoft[tone],
        className,
      )}
    >
      {dot ? <StatusDot status={status} pulse={pulse} size="xs" halo={false} /> : null}
      {pre}
      <span className="truncate leading-[1.3]">{children}</span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- SharingChip */

export type SharingState =
  | "shared"
  | "new_not_applied"
  | "cloning"
  | "shared_with_you"
  | "in_sync"
  | "removed_locally"
  | "needs_github"
  | "no_access"
  | "folder_in_the_way"
  | "fetch_failed"
  | "clone_failed"
  | "sharing_parked";

/** Sharing words from the space dashboard; blocked states read amber, quiet states grey. */
export const SHARING_STATES: Record<SharingState, { label: string; status: DotStatus; pulse?: boolean; detail: string }> = {
  shared: { label: "Shared", status: "up", detail: "Peers receive changes from this project." },
  new_not_applied: { label: "new · not applied", status: "up", detail: "Changes arrived from a peer. Apply them when you are ready." },
  cloning: { label: "Cloning…", status: "busy", pulse: true, detail: "Copying the project from its git origin." },
  shared_with_you: { label: "Shared with you", status: "warn", detail: "Another person owns this project." },
  in_sync: { label: "In sync", status: "idle", detail: "Nothing to apply." },
  removed_locally: { label: "Removed locally", status: "idle", detail: "The folder was removed. The share stays until you leave it." },
  needs_github: { label: "Needs GitHub", status: "warn", detail: "Connect GitHub to fetch this project." },
  no_access: { label: "No access", status: "warn", detail: "The owner has not given you access to the repository." },
  folder_in_the_way: { label: "Folder in the way", status: "warn", detail: "A folder with this name already exists in the projects folder." },
  fetch_failed: { label: "Fetch failed", status: "warn", detail: "The last fetch did not reach the origin. Sharing retries every minute." },
  clone_failed: { label: "Clone failed", status: "warn", detail: "The clone stopped before it finished. Nothing was overwritten." },
  sharing_parked: { label: "Sharing parked", status: "warn", detail: "Sign in to XO to share projects." },
};

export function SharingChip({ state, count, className }: { state: SharingState; /** For new_not_applied: "2 new · not applied". */ count?: number; className?: string }) {
  const s = SHARING_STATES[state];
  const label = state === "new_not_applied" ? `${count ?? 1} ${s.label}` : s.label;
  return (
    <ToneChip status={s.status} pulse={s.pulse} className={className}>
      {label}
    </ToneChip>
  );
}

/* ----------------------------------------------------------------------------- WithDetail */

/** Wraps a chip so hover or focus shows why it reads that way (the title detail). */
export function WithDetail({
  detail,
  id,
  label,
  children,
  align = "start",
}: {
  detail: ReactNode;
  /** Bubble id, for aria-describedby. */
  id: string;
  /** Accessible name for the focusable wrapper, such as "Blocked: Reconcile June invoices". */
  label?: string;
  children: ReactNode;
  align?: "start" | "center" | "end";
}) {
  return (
    <Tooltip content={detail} id={id} align={align}>
      {/* a generic span cannot carry a name, so a labelled wrapper becomes a group */}
      <span tabIndex={0} role={label ? "group" : undefined} aria-label={label} className="inline-flex max-w-full cursor-help rounded-[6px]! outline-offset-2">
        {children}
      </span>
    </Tooltip>
  );
}

/* ----------------------------------------------------------------------------- TodoStatusRow */

export type TodoState = "pending" | "in_progress" | "blocked" | "completed" | "cancelled";

/** Status order in lists: in progress first, finished last. */
export const TODO_ORDER: TodoState[] = ["in_progress", "pending", "blocked", "completed", "cancelled"];

export type TodoStatusRowProps = {
  id: string;
  status: TodoState;
  content: ReactNode;
  /** Raw runtime id shown as a trailing mono tag (claude_code, codex). */
  runtime?: string;
  /** Why it is blocked or cancelled; shown on hover or focus of the chip. */
  note?: string | null;
  meta?: ReactNode;
  className?: string;
};

/** One step: status chip, content (struck through when finished) and the runtime tag. */
export function TodoStatusRow({ id, status, content, runtime, note, meta, className }: TodoStatusRowProps) {
  const done = status === "completed" || status === "cancelled";
  const chip = <StateChip kind="todo" state={status} />;
  const word = stateMeta("todo", status).label;
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 py-2", className)}>
      <span className="flex w-[104px] shrink-0 items-center">
        {note ? (
          <WithDetail id={`${id}-note`} detail={note} label={word}>
            {chip}
          </WithDetail>
        ) : (
          chip
        )}
      </span>
      {/* content first; meta and the runtime tag wrap under it when the row is narrow */}
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "line-clamp-2 min-w-[min(100%,12rem)] flex-1 text-[12.5px] leading-snug",
            done ? "text-ink-faint line-through decoration-ink-faint/70" : "text-ink",
          )}
        >
          {content}
        </span>
        {meta || runtime ? (
          <span className="flex shrink-0 items-center gap-2.5">
            {meta ? <span className="text-[11px] text-ink-faint">{meta}</span> : null}
            {runtime ? (
              <span className="rounded-[4px] border border-hair-soft px-1.5 py-[3px] font-mono text-[10px] leading-none text-ink-faint">{runtime}</span>
            ) : null}
          </span>
        ) : null}
      </span>
    </div>
  );
}
