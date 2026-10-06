// Status: StatusDot (one saturated dot with a 3px halo, optional pulse), StatusPill (dot plus
// mono label, optional split detail such as "API: Up") and StateChip (the specific state word
// per object, never a universal "Active"). STATE_MAPS holds every mapping so tables and
// cards can reuse the same words and tones through stateMeta(). Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneSoft, toneText, type Tone } from "./tones";

/* ----------------------------------------------------------------------------- StatusDot */

/** up = live or answering, down = failed or unreachable, idle = off or unknown,
    busy = in motion (starting, checking), warn = needs a person. */
export type DotStatus = "up" | "down" | "idle" | "busy" | "warn";

export const statusTone: Record<DotStatus, Tone> = {
  up: "grn",
  down: "red",
  idle: "neutral",
  busy: "blu",
  warn: "org",
};

const dotPx = { xs: "size-[5px]", sm: "size-1.5", md: "size-2", lg: "size-2.5" } as const;
export type DotSize = keyof typeof dotPx;

export type StatusDotProps = {
  status?: DotStatus;
  /** Override the color while keeping the status semantics. */
  tone?: Tone;
  size?: DotSize;
  /** The one looping animation: use for live or in-flight states only. */
  pulse?: boolean;
  /** Drop the 3px halo (dense legends). */
  halo?: boolean;
  /** Accessible name. Without it the dot is decorative and the adjacent text must carry meaning. */
  label?: string;
  className?: string;
};

/** Single saturated status mark. Decorative unless labelled. */
export function StatusDot({ status = "idle", tone, size = "sm", pulse = false, halo = true, label, className }: StatusDotProps) {
  const t = tone ?? statusTone[status];
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block shrink-0 rounded-full bg-current",
        t === "neutral" ? "text-ink-faint" : toneText[t],
        dotPx[size],
        halo && "shadow-[0_0_0_3px_color-mix(in_srgb,currentColor_18%,transparent)]",
        pulse && "pulse",
        className,
      )}
    />
  );
}

/* ----------------------------------------------------------------------------- StatusPill */

export type StatusPillProps = {
  status: DotStatus;
  label: ReactNode;
  pulse?: boolean;
  /** Second half of a split pill, after a hairline: "API: Up". */
  detail?: ReactNode;
  /** Mono uppercase label (default) or sentence case sans. */
  mono?: boolean;
  /** Color the label with the status tone, as swarm does for space state. */
  tinted?: boolean;
  size?: "sm" | "md";
  tone?: Tone;
  className?: string;
};

/** Dot plus label in a hairline pill: "● Running | API: Up", "● LIVE", "● Partial". */
export function StatusPill({ status, label, pulse, detail, mono = true, tinted = false, size = "sm", tone, className }: StatusPillProps) {
  const t = tone ?? statusTone[status];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-stretch overflow-hidden rounded-full border border-hair bg-white/[0.03] leading-none",
        mono ? "font-mono uppercase tracking-[0.1em]" : "font-medium",
        mono ? (size === "sm" ? "text-[10px]" : "text-[11px]") : size === "sm" ? "text-[11.5px]" : "text-[12.5px]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-2",
          size === "sm" ? "h-6 px-2.5" : "h-7 px-3",
          tinted && t !== "neutral" ? toneText[t] : "text-ink",
        )}
      >
        <StatusDot status={status} tone={tone} pulse={pulse} size={size === "sm" ? "xs" : "sm"} />
        <span className="truncate leading-[1.3]">{label}</span>
      </span>
      {detail ? (
        <span className={cn("inline-flex items-center border-l border-hair text-ink-dim", size === "sm" ? "px-2.5" : "px-3")}>{detail}</span>
      ) : null}
    </span>
  );
}

/* ----------------------------------------------------------------------------- StateChip */

export type StateMeta = { label: string; status: DotStatus; pulse?: boolean };

/**
 * Object states and their words. Keys are stable lowercase ids; labels follow the public
 * language (space lifecycle Creating, Starting, Running, Stopping, Stopped; failure
 * "Space could not start"; "Trial active", "Payment overdue"; "Unavailable" for missing data).
 */
export const STATE_MAPS = {
  space: {
    creating: { label: "Creating", status: "busy", pulse: true },
    starting: { label: "Starting", status: "busy", pulse: true },
    running: { label: "Running", status: "up" },
    stopping: { label: "Stopping", status: "busy", pulse: true },
    stopped: { label: "Stopped", status: "idle" },
    failed: { label: "Space could not start", status: "down" },
  },
  todo: {
    in_progress: { label: "In progress", status: "busy" },
    pending: { label: "Pending", status: "idle" },
    blocked: { label: "Blocked", status: "warn" },
    completed: { label: "Completed", status: "up" },
    cancelled: { label: "Cancelled", status: "idle" },
  },
  inbox: {
    new: { label: "New", status: "busy" },
    seen: { label: "Seen", status: "idle" },
    done: { label: "Done", status: "up" },
  },
  connector: {
    not_connected: { label: "Not connected", status: "idle" },
    connected: { label: "Connected", status: "up" },
    on: { label: "On in this space", status: "up" },
    configured: { label: "Configured", status: "up" },
    off: { label: "Off in this space", status: "idle" },
    not_set: { label: "Not set", status: "warn" },
    sign_in_pending: { label: "Sign-in pending", status: "warn", pulse: true },
    needs_attention: { label: "Needs attention", status: "warn" },
    unavailable: { label: "Unavailable", status: "down" },
    checking: { label: "Checking…", status: "busy", pulse: true },
  },
  run: {
    queued: { label: "Queued", status: "idle" },
    running: { label: "Running", status: "busy", pulse: true },
    ok: { label: "Succeeded", status: "up" },
    failed: { label: "Failed", status: "down" },
    timed_out: { label: "Timed out", status: "down" },
    skipped: { label: "Skipped", status: "idle" },
    cancelled: { label: "Cancelled", status: "idle" },
  },
  source: {
    answering: { label: "Answering", status: "up" },
    not_answering: { label: "Not answering", status: "down" },
    waiting: { label: "Waiting", status: "busy", pulse: true },
    unknown: { label: "Unknown", status: "idle" },
  },
  measurement: {
    available: { label: "Available", status: "up" },
    unavailable: { label: "Unavailable", status: "idle" },
  },
  provenance: {
    live: { label: "Live", status: "up", pulse: true },
    mock: { label: "Mock", status: "idle" },
    illustrative: { label: "Illustrative", status: "idle" },
  },
  subscription: {
    active: { label: "Active", status: "up" },
    trial_active: { label: "Trial active", status: "busy" },
    payment_overdue: { label: "Payment overdue", status: "warn" },
    needs_attention: { label: "Payment needs attention", status: "down" },
    cancelled: { label: "Cancelled", status: "idle" },
  },
  membership: {
    request_pending: { label: "Request pending", status: "warn" },
    active_member: { label: "Active member", status: "up" },
  },
  result: {
    awaiting_review: { label: "Awaiting review", status: "warn" },
    accepted: { label: "Accepted", status: "up" },
  },
  workItem: {
    open: { label: "Open", status: "up" },
    in_progress: { label: "In progress", status: "busy" },
    closed: { label: "Closed", status: "idle" },
  },
} as const satisfies Record<string, Record<string, StateMeta>>;

export type StateKind = keyof typeof STATE_MAPS;
export type StateOf<K extends StateKind> = keyof (typeof STATE_MAPS)[K] & string;

/** Label, dot status and pulse for an object state, for reuse outside StateChip. */
export function stateMeta<K extends StateKind>(kind: K, state: StateOf<K>): StateMeta {
  return (STATE_MAPS[kind] as Record<string, StateMeta>)[state];
}

export type StateChipProps<K extends StateKind> = {
  kind: K;
  state: StateOf<K>;
  /** Override the word, for example to quote a shipped UI label. */
  label?: ReactNode;
  /** Prefix such as "Hosted space" or "Measurement", set off with a middle dot. */
  prefix?: ReactNode;
  /** Chip (tinted box, radius 6) or plain (dot and word only, for table cells). */
  variant?: "chip" | "plain";
  dot?: boolean;
  /** Override the animation from the mapping. */
  pulse?: boolean;
  className?: string;
};

/** The state word for a specific object, with its tone and dot. */
export function StateChip<K extends StateKind>({
  kind,
  state,
  label,
  prefix,
  variant = "chip",
  dot = true,
  pulse,
  className,
}: StateChipProps<K>) {
  const meta = stateMeta(kind, state);
  const tone = statusTone[meta.status];
  const animate = pulse ?? Boolean(meta.pulse);
  if (variant === "plain") {
    return (
      <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-[12.5px] text-ink", className)} data-state={state}>
        {dot ? <StatusDot status={meta.status} pulse={animate} /> : null}
        {prefix ? (
          <>
            <span className="text-ink-dim">{prefix}</span>
            <span aria-hidden="true" className="text-ink-faint">·</span>
          </>
        ) : null}
        <span>{label ?? meta.label}</span>
      </span>
    );
  }
  return (
    <span
      data-state={state}
      className={cn(
        "inline-flex h-[22px] w-fit max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-2 text-[11.5px] font-medium leading-none",
        toneSoft[tone],
        className,
      )}
    >
      {dot ? <StatusDot status={meta.status} pulse={animate} size="xs" halo={false} /> : null}
      {prefix ? (
        <>
          <span className="text-ink-dim">{prefix}</span>
          <span aria-hidden="true" className="text-ink-faint">·</span>
        </>
      ) : null}
      <span className="truncate">{label ?? meta.label}</span>
    </span>
  );
}
