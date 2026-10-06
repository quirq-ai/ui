// Status dot family: the single saturated mark with a 3px halo, and the pills built on it.
// StatusDot and StatusPill come from the ui kit; this file adds the product-specific shapes:
// SpaceStatusPill (lifecycle | API split pill), ConnectionPill (visualizer LIVE / PARTIAL),
// DotMeter (difficulty ●○○), StepDot (deploy steps), LivePip, PresenceLine and DotTip.
// Server-safe: no hooks. Tooltips are CSS only.
import type { ReactNode } from "react";
import {
  Check,
  CircleArrowDown,
  CircleArrowUp,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  CirclePlay,
  CircleStop,
  CircleX,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import { Tooltip } from "@/components/ui/tooltip";
import { toneBg, toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- SpaceStatusPill */

export type SpaceLifecycle = "creating" | "starting" | "running" | "stopping" | "stopped" | "failed" | "unknown";
/** "unknown" means the Space API has not been reached yet; it is not a down API. */
export type SpaceApiState = "up" | "down" | "unknown";

type Look = { label: string; icon: LucideIcon; tone: Tone; motion?: "spin" | "pulse"; hint: string };

/** Lifecycle words follow the public language: never "Ready" or "Failed". */
export const SPACE_LIFECYCLE: Record<SpaceLifecycle, Look> = {
  creating: { label: "Creating", icon: LoaderCircle, tone: "blu", motion: "spin", hint: "Provisioning the space." },
  starting: { label: "Starting", icon: CirclePlay, tone: "yel", motion: "pulse", hint: "Starting the runtime and Space API." },
  running: { label: "Running", icon: CircleCheck, tone: "grn", hint: "The space is up and the Space API answers." },
  stopping: { label: "Stopping", icon: LoaderCircle, tone: "org", motion: "spin", hint: "Saving state and stopping." },
  stopped: { label: "Stopped", icon: CircleStop, tone: "neutral", hint: "Nothing is running. Files stay on disk." },
  failed: { label: "Space could not start", icon: CircleX, tone: "red", hint: "The runtime exited before the Space API answered." },
  unknown: { label: "Checking…", icon: CircleDashed, tone: "neutral", motion: "pulse", hint: "The space status has not been read yet." },
};

export const SPACE_API: Record<SpaceApiState, Look> = {
  up: { label: "API: Up", icon: CircleArrowUp, tone: "grn", hint: "Space API is reachable: file, project and chat calls work." },
  down: { label: "API: Down", icon: CircleArrowDown, tone: "red", hint: "Space API is not responding. The space may still be starting." },
  unknown: { label: "API: Unknown", icon: CircleHelp, tone: "neutral", hint: "Space API has not been reached yet." },
};

function LookIcon({ look }: { look: Look }) {
  const Icon = look.icon;
  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0",
        look.tone === "neutral" ? "text-ink-faint" : toneText[look.tone],
        look.motion === "spin" && "spin",
        look.motion === "pulse" && "animate-pulse",
      )}
    />
  );
}

export type SpaceStatusPillProps = {
  status: SpaceLifecycle;
  /** Second half of the split pill. Omit for a single lifecycle pill. */
  api?: SpaceApiState;
  /** Icons only; the tooltip and accessible name still carry the words (narrow headers). */
  compact?: boolean;
  /** Id for the tooltip bubble, wires aria-describedby on the pill. */
  tipId?: string;
  /** Override the tooltip copy. */
  hint?: ReactNode;
  className?: string;
};

/** Space header pill: "● Running | API: Up". Focusable so keyboard users can read the hint. */
export function SpaceStatusPill({ status, api, compact = false, tipId, hint, className }: SpaceStatusPillProps) {
  const life = SPACE_LIFECYCLE[status];
  const apiLook = api ? SPACE_API[api] : null;
  const name = `Space: ${life.label}${apiLook ? `. ${apiLook.label}` : ""}`;
  const tip = hint ?? (
    <span className="flex flex-col gap-0.5">
      <span>{life.hint}</span>
      {apiLook ? <span className="text-ink-dim">{apiLook.hint}</span> : null}
    </span>
  );
  return (
    <Tooltip content={tip} id={tipId} placement="bottom" align="start">
      <span
        role="status"
        tabIndex={0}
        aria-label={name}
        data-state={status}
        className={cn(
          "inline-flex h-7 max-w-full cursor-default items-stretch overflow-hidden rounded-full! border border-hair bg-white/[0.03] text-[12px] leading-none",
          "transition-colors duration-150 hover:border-hair-strong",
          className,
        )}
      >
        <span className={cn("inline-flex min-w-0 items-center gap-1.5 px-2.5", life.tone === "neutral" ? "text-ink-dim" : toneText[life.tone])}>
          <LookIcon look={life} />
          {compact ? null : <span className="truncate font-medium leading-[1.3]">{life.label}</span>}
        </span>
        {apiLook ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 border-l border-hair px-2.5 text-ink-dim">
            <LookIcon look={apiLook} />
            {compact ? null : <span>{apiLook.label}</span>}
          </span>
        ) : null}
      </span>
    </Tooltip>
  );
}

/* ----------------------------------------------------------------------------- ConnectionPill */

export type ConnectionState = "connecting" | "live" | "partial" | "offline";

const CONNECTION: Record<ConnectionState, { label: string; dot: string }> = {
  connecting: { label: "Connecting", dot: "animate-pulse bg-ink-faint shadow-[0_0_0_4px_rgba(125,125,120,0.12)]" },
  live: { label: "Live", dot: "bg-grn shadow-[0_0_0_4px_rgba(48,209,88,0.14),0_0_10px_rgba(48,209,88,0.65)]" },
  partial: { label: "Partial", dot: "bg-org shadow-[0_0_0_4px_rgba(255,159,10,0.14),0_0_10px_rgba(255,159,10,0.55)]" },
  offline: { label: "Offline", dot: "bg-red shadow-[0_0_0_4px_rgba(255,69,58,0.14)]" },
};

/** Visualizer header pill: 34px, radius 9, 10px uppercase, 6px dot with a 4px halo. */
export function ConnectionPill({ state, label, className }: { state: ConnectionState; label?: ReactNode; className?: string }) {
  const c = CONNECTION[state];
  return (
    <span
      data-state={state}
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[9px] border border-[rgba(220,228,236,0.12)] bg-[rgba(9,13,19,0.74)] px-[11px]",
        "text-[10px] font-[650] uppercase leading-none tracking-[0.08em]",
        state === "offline" ? "text-ink-dim" : "text-ink",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", c.dot)} />
      {label ?? c.label}
    </span>
  );
}

/* ----------------------------------------------------------------------------- DotMeter */

export type DotMeterProps = {
  /** Filled dots. */
  level: number;
  max?: number;
  tone?: Tone;
  /** The words carry the meaning; the dots are decorative. */
  children: ReactNode;
  className?: string;
};

/** Difficulty meter from the marketplace rail: ●○○ No coding required. */
export function DotMeter({ level, max = 3, tone = "grn", children, className }: DotMeterProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[11.5px] text-ink-faint", className)}>
      <span className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cn("size-[5px] rounded-full", i < level ? toneBg[tone] : "bg-white/20")} />
        ))}
      </span>
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------- StepDot */

export type StepState = "done" | "active" | "pending";

/** 26px deploy step dot: done dark green with a check, active green with the live pulse, pending grey. */
export function StepDot({ state, index, label, className }: { state: StepState; index: number; label: string; className?: string }) {
  const word = state === "done" ? "done" : state === "active" ? "in progress" : "pending";
  return (
    <span
      role="img"
      aria-label={`Step ${index}, ${label}: ${word}`}
      className={cn(
        "relative inline-flex size-[26px] shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums",
        state === "done" && "bg-[#246136] text-[#b8f5c6]",
        state === "active" && "bg-grn text-black",
        state === "pending" && "border border-hair bg-[#636464]/25 text-ink-faint",
        className,
      )}
    >
      {state === "active" ? <span aria-hidden="true" className="pulse absolute inset-0 rounded-full text-grn" /> : null}
      {state === "done" ? <Check aria-hidden="true" className="size-3.5" strokeWidth={3} /> : <span aria-hidden="true">{index}</span>}
    </span>
  );
}

/* ----------------------------------------------------------------------------- LivePip and PresenceLine */

/** "● LIVE": a pulsing dot with an uppercase accent label (live projects, proving grounds). */
export function LivePip({ children = "Live", tone = "grn", pulse = true, className }: { children?: ReactNode; tone?: Tone; pulse?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] uppercase leading-none tracking-[0.14em]", toneText[tone], className)}>
      <StatusDot tone={tone} pulse={pulse} size="xs" />
      {children}
    </span>
  );
}

/** "● xo-space · online": a dot, a name and its state word. */
export function PresenceLine({
  status,
  name,
  detail,
  pulse,
  className,
}: {
  status: DotStatus;
  name: ReactNode;
  detail: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 text-[12.5px]", className)}>
      <StatusDot status={status} pulse={pulse} />
      <span className="truncate font-mono text-ink">{name}</span>
      <span aria-hidden="true" className="text-ink-faint">·</span>
      <span className="shrink-0 text-ink-dim">{detail}</span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- DotTip */

/** A status dot that explains itself on hover or focus (galileo source rows, legends). */
export function DotTip({
  status,
  label,
  tip,
  id,
  pulse,
  align = "start",
}: {
  status: DotStatus;
  /** Accessible name, such as "acme: answering". */
  label: string;
  tip: ReactNode;
  id?: string;
  pulse?: boolean;
  align?: "start" | "center" | "end";
}) {
  return (
    <Tooltip content={tip} id={id} align={align}>
      <span
        tabIndex={0}
        role="img"
        aria-label={label}
        className="inline-flex size-5 shrink-0 cursor-default items-center justify-center rounded-full! hover:bg-white/[0.06]"
      >
        <StatusDot status={status} pulse={pulse} />
      </span>
    </Tooltip>
  );
}
