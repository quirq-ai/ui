"use client";

// Feed rows: ConnectionsList and ConnectionRow (polled apps with Poll now and Configure),
// JobRow (saved command with schedule, last result, Run now, Results, Edit, Delete; compact
// or full), InboxRow (dot, kind, title, project, when; new, seen or done; opens to its text
// and actions) with InboxSkeleton, and SharingRow (shared project that may need Apply).
import { useId, useState, type ReactNode } from "react";
import { ChevronRight, Pencil, Play, RefreshCw, ScrollText, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import { StatusDot } from "@/components/ui/status";

/* ----------------------------------------------------------------------------- connections */

export type ConnectionRowData = {
  id: string;
  name: string;
  account: string | null;
  /** "Unread mail · every 15 min" */
  what: string;
  /** "last poll 3m ago" or "Not polled yet" */
  lastPoll: string;
  error?: string | null;
};

export type ConnectionRowProps = {
  row: ConnectionRowData;
  polling?: boolean;
  onPoll?: (row: ConnectionRowData) => void;
  onConfigure?: (row: ConnectionRowData) => void;
};

/** One polled app: name and account, what it collects, last poll, Poll now and Configure. */
export function ConnectionRow({ row, polling = false, onPoll, onConfigure }: ConnectionRowProps) {
  return (
    <li className="@container border-t border-hair-soft first:border-t-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3.5 py-2.5 text-[12.5px] @min-[640px]:grid-cols-[minmax(120px,auto)_minmax(0,1fr)_minmax(0,0.8fr)_auto]">
        <span className="min-w-0">
          <span className="block font-medium text-ink">{row.name}</span>
          <span className="block truncate font-mono text-[11px] text-ink-faint">{row.account ?? "No account linked"}</span>
        </span>
        <span className="min-w-0 truncate text-ink-dim @max-[640px]:col-span-2 @max-[640px]:row-start-2 @max-[640px]:whitespace-normal">
          {row.what}
          <span className={cn("@min-[640px]:hidden", row.error ? "text-red" : "text-ink-faint")}> · {polling ? "Polling…" : row.lastPoll}</span>
        </span>
        <span className={cn("min-w-0 truncate @max-[640px]:hidden", row.error ? "text-red" : "text-ink-faint")}>{polling ? "Polling…" : row.lastPoll}</span>
        <span className="col-start-2 row-start-1 flex items-center gap-1.5 @min-[640px]:col-start-auto @min-[640px]:row-start-auto">
          <Button size="sm" variant="secondary" loading={polling} loadingLabel="Polling…" leadingIcon={<RefreshCw />} onClick={() => onPoll?.(row)} aria-label={`Poll ${row.name} now`}>
            Poll now
          </Button>
          <IconButton aria-label={`Configure ${row.name}`} size="sm" variant="outline" tip onClick={() => onConfigure?.(row)}>
            <Settings2 />
          </IconButton>
        </span>
      </div>
      {row.error ? (
        <p title={row.error} className="truncate px-3.5 pb-2.5 text-[12px] text-red">
          {row.error}
        </p>
      ) : null}
    </li>
  );
}

export type ConnectionsListProps = {
  rows: ConnectionRowData[];
  state?: "ready" | "loading" | "unreachable";
  /** Space name for the unreachable line. */
  spaceName?: string;
  defaultOpen?: boolean;
  renderRow: (row: ConnectionRowData) => ReactNode;
  className?: string;
};

/** Collapsible "Polled apps 3 · 1 with errors" list. */
export function ConnectionsList({ rows, state = "ready", spaceName = "this space", defaultOpen = true, renderRow, className }: ConnectionsListProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const errors = rows.filter((r) => r.error).length;
  return (
    <section className={cn("min-w-0 overflow-hidden rounded-[12px] border border-hair-soft bg-s2", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-none! px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint hover:text-ink"
      >
        <ChevronRight aria-hidden="true" className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        Polled apps
        {state === "ready" ? (
          <span className="rounded-full border border-hair bg-s3 px-1.5 font-mono text-[10.5px] tabular-nums tracking-normal text-ink-dim">{rows.length}</span>
        ) : null}
        {errors ? <span className="normal-case tracking-normal text-red">· {errors} with errors</span> : null}
      </button>
      {open ? (
        <div id={id} className="border-t border-hair-soft">
          {state === "loading" ? (
            <p role="status" className="flex items-center gap-2 px-3.5 py-3 text-[12.5px] text-ink-faint">
              <Spinner size="sm" label={null} /> Loading connections…
            </p>
          ) : state === "unreachable" ? (
            <p className="px-3.5 py-3 text-[12.5px] text-red">Connections: {spaceName} is unreachable.</p>
          ) : rows.length === 0 ? (
            <p className="px-3.5 py-3 text-[12.5px] text-ink-faint">No updates yet. Open Setup → Connectors to connect an app and turn on polling.</p>
          ) : (
            <ul>{rows.map(renderRow)}</ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

/* ----------------------------------------------------------------------------- JobRow */

export type JobResultKind =
  | "running"
  | "never"
  | "succeeded"
  | "failed"
  | "timed_out"
  | "not_found"
  | "could_not_start"
  | "skipped"
  | "interrupted";

export const JOB_RESULT_META: Record<JobResultKind, { label: string; tone: "grn" | "red" | "blu" | "faint" | "org" }> = {
  running: { label: "Running…", tone: "blu" },
  never: { label: "Not run yet", tone: "faint" },
  succeeded: { label: "Succeeded", tone: "grn" },
  failed: { label: "Failed", tone: "red" },
  timed_out: { label: "Timed out", tone: "red" },
  not_found: { label: "Command not found", tone: "red" },
  could_not_start: { label: "Could not start", tone: "red" },
  skipped: { label: "Skipped (still running)", tone: "faint" },
  interrupted: { label: "Interrupted", tone: "org" },
};

const resultTone = { grn: "text-grn", red: "text-red", blu: "text-blu", faint: "text-ink-faint", org: "text-org" } as const;

export type JobRowData = {
  id: string;
  name: string;
  /** repeating jobs run on a schedule; once runs a single time */
  kind?: "repeating" | "once";
  description?: string;
  /** argv, shown as one mono command line */
  command: string[];
  cwd?: string;
  schedule: string;
  enabled: boolean;
  nextRun: string | null;
  result: { kind: JobResultKind; ago?: string; duration?: string | null; exit?: number | null; label?: string };
  /** last run output, for the Results preview */
  output?: string;
};

export type JobRowProps = {
  job: JobRowData;
  /** compact sits in the Inbox; full is the Setup row with every action. */
  variant?: "compact" | "full";
  onRunNow?: (job: JobRowData) => void;
  onEdit?: (job: JobRowData) => void;
  onDelete?: (job: JobRowData) => void;
};

/** Result pill: "Succeeded · 3h ago · 1.24s". */
export function JobResultPill({ result }: { result: JobRowData["result"] }) {
  const meta = JOB_RESULT_META[result.kind];
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full border border-hair px-2.5 py-0.5 text-[12px]", resultTone[meta.tone])}>
      {result.kind === "running" ? <Spinner size="xs" label={null} /> : <StatusDot status={meta.tone === "grn" ? "up" : meta.tone === "red" ? "down" : meta.tone === "org" ? "warn" : "idle"} size="xs" halo={false} />}
      <span className="truncate">
        {result.label ?? meta.label}
        {result.ago ? <span className="text-ink-faint"> · {result.ago}</span> : null}
        {result.duration ? <span className="text-ink-faint"> · {result.duration}</span> : null}
        {result.exit !== undefined && result.exit !== null && result.exit !== 0 ? <span className="text-ink-faint"> · exit {result.exit}</span> : null}
      </span>
    </span>
  );
}

/** Saved job: name, kind, command, where it runs, schedule, last result and actions. */
export function JobRow({ job, variant = "full", onRunNow, onEdit, onDelete }: JobRowProps) {
  const [showOutput, setShowOutput] = useState(false);
  const running = job.result.kind === "running";
  const outId = useId();
  return (
    <li className="border-t border-hair-soft px-3.5 py-3 first:border-t-0">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2.5">
        <div className="min-w-0 flex-1 basis-[260px]">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-[13.5px] font-medium text-ink">{job.name}</h5>
            <Badge size="sm" tone="neutral">
              {job.kind === "once" ? "Once" : "Repeating"}
            </Badge>
          </div>
          {variant === "full" && job.description ? <p className="mt-1 text-[12px] text-ink-dim">{job.description}</p> : null}
          {variant === "full" ? (
            <p className="mt-1.5 truncate font-mono text-[12px] text-ink-dim">
              <span aria-hidden="true" className="mr-1.5 select-none text-ink-faint">
                $
              </span>
              {job.command.join(" ")}
            </p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-faint">
            {variant === "full" && job.cwd ? (
              <span>
                Runs in <span className="font-mono text-ink-dim">{job.cwd}</span>
              </span>
            ) : null}
            <span>{job.schedule}</span>
            <span className={job.enabled ? "text-grn" : "text-ink-faint"}>{job.enabled ? "Enabled" : "Disabled"}</span>
            <span>{job.nextRun ? `Next due ${job.nextRun}` : "No next run"}</span>
          </p>
          <div className="mt-2">
            <JobResultPill result={job.result} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="secondary" leadingIcon={<Play />} loading={running} loadingLabel="Running…" disabled={!job.enabled} onClick={() => onRunNow?.(job)} aria-label={`Run ${job.name} now`}>
            Run now
          </Button>
          {job.output ? (
            <Button
              size="sm"
              variant="subtle"
              leadingIcon={<ScrollText />}
              aria-expanded={showOutput}
              aria-controls={showOutput ? outId : undefined}
              onClick={() => setShowOutput((s) => !s)}
            >
              Results
            </Button>
          ) : null}
          {variant === "full" ? (
            <>
              <IconButton aria-label={`Edit ${job.name}`} size="sm" variant="ghost" tip onClick={() => onEdit?.(job)}>
                <Pencil />
              </IconButton>
              <IconButton aria-label={`Delete ${job.name}`} size="sm" variant="danger" tip onClick={() => onDelete?.(job)}>
                <Trash2 />
              </IconButton>
            </>
          ) : null}
        </div>
      </div>
      {showOutput && job.output ? (
        <pre id={outId} className="scroll-thin mt-2.5 max-h-[6.5em] overflow-auto whitespace-pre-wrap rounded-[8px] border border-hair-soft bg-bg px-3 py-2 font-mono text-[12px] leading-[1.5] text-ink-dim">
          {job.output}
        </pre>
      ) : null}
    </li>
  );
}

/* ----------------------------------------------------------------------------- inbox */

export type InboxRowData = {
  id: string;
  kind: string;
  status: "new" | "seen" | "done";
  title: string;
  detail: string;
  project: string | null;
  when: string;
  /** a failed job or a needs-attention connector: red strip */
  failure?: boolean;
};

export type InboxRowProps = {
  item: InboxRowData;
  open?: boolean;
  onToggle?: (id: string) => void;
  onMarkSeen?: (id: string) => void;
  onMarkDone?: (id: string) => void;
  /** Buttons disabled while a write is in flight. */
  busy?: boolean;
  /** Extra actions in the open body (Open session, Sign in again). */
  actions?: ReactNode;
};

/** Inbox row: dot, kind, title, project, when. Opens to its text and actions. */
export function InboxRow({ item, open = false, onToggle, onMarkSeen, onMarkDone, busy = false, actions }: InboxRowProps) {
  const bodyId = useId();
  const isNew = item.status === "new";
  return (
    <li
      data-status={item.status}
      className={cn(
        "@container rounded-[12px] border transition-colors",
        open ? "border-hair-strong bg-s3" : "border-hair-soft bg-s2 hover:border-hair",
        item.failure && "border-l-[3px] border-l-red",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? bodyId : undefined}
        onClick={() => onToggle?.(item.id)}
        className="group/i grid w-full grid-cols-[10px_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 rounded-[12px]! px-4 py-[11px] text-left @min-[620px]:grid-cols-[10px_auto_minmax(0,1fr)_auto_84px]"
      >
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", isNew ? "bg-blu shadow-[0_0_0_3px_color-mix(in_srgb,var(--blu)_18%,transparent)]" : "bg-ink-faint/55")}
        />
        <span
          className={cn(
            "whitespace-nowrap rounded-[5px] border px-1.5 py-[3px] font-mono text-[10.5px] leading-none",
            isNew ? "border-blu/40 text-blu" : "border-hair bg-s3 text-ink-dim",
          )}
        >
          {item.kind}
        </span>
        <span
          className={cn(
            "min-w-0 truncate text-[13.5px] transition-colors group-hover/i:text-ink",
            isNew ? "font-medium text-ink" : item.status === "done" ? "text-ink-faint line-through decoration-ink-faint/40" : "text-ink-dim",
          )}
        >
          <span className="sr-only">{isNew ? "New: " : item.status === "done" ? "Done: " : "Seen: "}</span>
          {item.title}
        </span>
        <span className="col-start-2 max-w-[200px] truncate font-mono text-[11.5px] text-ink-faint @min-[620px]:col-start-auto">{item.project ?? "space"}</span>
        <span className="col-start-3 justify-self-end whitespace-nowrap text-right font-mono text-[11.5px] tabular-nums text-ink-faint @min-[620px]:col-start-auto">{item.when}</span>
      </button>
      {open ? (
        <div id={bodyId} className="border-t border-hair-soft px-4 pb-3.5 @min-[620px]:pl-[38px]">
          <p className="mt-3 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-dim">{item.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.status === "new" ? (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => onMarkSeen?.(item.id)}>
                Mark seen
              </Button>
            ) : null}
            {item.status !== "done" ? (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => onMarkDone?.(item.id)}>
                Mark done
              </Button>
            ) : (
              <Button size="sm" variant="subtle" disabled={busy} onClick={() => onMarkSeen?.(item.id)}>
                Reopen
              </Button>
            )}
            {actions}
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** 44px shimmer rows while the inbox loads. */
export function InboxSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="skeleton h-11 rounded-[12px]!" />
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- sharing */

export type SharingRowData = {
  id: string;
  name: string;
  repo: string;
  checked: string;
  /** incoming changes not yet applied */
  pending: number;
};

export type SharingRowProps = {
  row: SharingRowData;
  selected?: boolean;
  applying?: boolean;
  onSelect?: (id: string) => void;
  onApply?: (row: SharingRowData) => void;
};

/** Shared project in the sharing rail: "2 new · not applied" with Apply, or "in sync". */
export function SharingRow({ row, selected = false, applying = false, onSelect, onApply }: SharingRowProps) {
  const needs = row.pending > 0;
  return (
    <li
      className={cn(
        "relative rounded-[12px] border border-hair-soft bg-s2 transition-colors hover:border-hair",
        selected && "bg-s3",
        needs && "shadow-[inset_2px_0_0_var(--blu)]",
      )}
    >
      <div className="flex items-start gap-3 px-3.5 py-3">
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect?.(row.id)}
          className="min-w-0 flex-1 rounded-[6px]! text-left after:absolute after:inset-0 after:rounded-[12px] after:content-['']"
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] font-medium text-ink">{row.name}</span>
            {applying ? (
              <Badge size="sm" tone="blu">
                Applying…
              </Badge>
            ) : needs ? (
              <Badge size="sm" tone="blu">
                {row.pending} new · not applied
              </Badge>
            ) : (
              <Badge size="sm" tone="neutral">
                in sync
              </Badge>
            )}
          </span>
          <span className="mt-1 block truncate font-mono text-[11px] text-ink-faint">
            {row.repo} · checked {row.checked}
          </span>
        </button>
        {needs ? (
          <Button size="sm" variant="secondary" className="relative z-10" loading={applying} loadingLabel="Applying…" onClick={() => onApply?.(row)} aria-label={`Apply ${row.pending} changes to ${row.name}`}>
            Apply
          </Button>
        ) : null}
      </div>
    </li>
  );
}
