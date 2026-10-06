// Loaders: Spinner (busy indicator), Skeleton (shape-matched shimmer, uses .skeleton) and
// ProgressBar (determinate, indeterminate, segmented). Server-safe; motion is CSS only and
// the global reduced-motion rule clamps it.
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneBg, toneText, type Tone } from "./tones";

/* ----------------------------------------------------------------------------- Spinner */

const spinnerPx = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28 } as const;
export type SpinnerSize = keyof typeof spinnerPx;

export type SpinnerProps = {
  size?: SpinnerSize | number;
  /** Tone of the moving arc; defaults to the current text color. */
  tone?: Tone;
  /** Announced to screen readers. Pass null when a parent already says it is busy. */
  label?: string | null;
  className?: string;
};

/** Ring with a turning arc. Static under reduced motion. */
export function Spinner({ size = "md", tone, label = "Loading", className }: SpinnerProps) {
  const px = typeof size === "number" ? size : spinnerPx[size];
  return (
    <span
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0 items-center justify-center", tone && toneText[tone], className)}
    >
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" className="spin" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path d="M21.5 12A9.5 9.5 0 0 0 12 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

/** Spinner plus a mono caption, for whole-view loading ("Loading projects…"). */
export function LoadingLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim", className)}>
      <Spinner size="sm" label={null} />
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------- Skeleton */

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: number | string;
  height?: number | string;
  /** Render n text lines instead of one block; the last line is shorter. */
  lines?: number;
  /** Corner radius in px; defaults to the .skeleton 8px. Use 999 for pills and avatars. */
  radius?: number;
};

/** Shimmer placeholder matched to the shape it stands in for. Hidden from assistive tech. */
export function Skeleton({ width, height, lines, radius, className, style, ...rest }: SkeletonProps) {
  const shape: CSSProperties = { width, height, borderRadius: radius, ...style };
  if (lines && lines > 1) {
    return (
      <div aria-hidden="true" className={cn("flex flex-col gap-2", className)} style={{ width }} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="skeleton h-3"
            style={{ width: i === lines - 1 ? "62%" : "100%", height, borderRadius: radius ?? 4 }}
          />
        ))}
      </div>
    );
  }
  return <div aria-hidden="true" className={cn("skeleton", !height && "h-3", className)} style={shape} {...rest} />;
}

/* ----------------------------------------------------------------------------- ProgressBar */

const trackHeight = { xs: "h-[3px]", sm: "h-1", md: "h-1.5", lg: "h-2" } as const;

export type ProgressBarProps = {
  /** Current value; null means the measurement is missing and renders "Unavailable". */
  value?: number | null;
  max?: number;
  /** Sweeping sliver when the amount of work is unknown (cloning, connecting). */
  indeterminate?: boolean;
  /** Split the track into n stage segments (stage bars like 02 / 05). */
  segments?: number;
  tone?: Tone | "ink";
  /** Visible label above the bar; also the accessible name. */
  label?: ReactNode;
  /** Accessible name when no visible label is shown. */
  "aria-label"?: string;
  /** Show the mono readout on the right of the label row. */
  showValue?: boolean;
  /** Custom readout, such as "02 / 05" or "2.4 MB of 6 MB". */
  valueText?: string;
  size?: keyof typeof trackHeight;
  className?: string;
};

/** Linear progress: determinate fill, indeterminate sweep, or segmented stages. */
export function ProgressBar({
  value,
  max = 100,
  indeterminate = false,
  segments,
  tone = "ink",
  label,
  "aria-label": ariaLabel,
  showValue = true,
  valueText,
  size = "sm",
  className,
}: ProgressBarProps) {
  const unavailable = !indeterminate && (value === null || value === undefined);
  const clamped = unavailable ? 0 : Math.min(Math.max(value ?? 0, 0), max);
  const pct = max > 0 ? (clamped / max) * 100 : 0;
  const fill = tone === "ink" ? "bg-ink" : toneBg[tone];
  const fillColor = tone === "ink" ? "var(--ink)" : `var(--${tone === "neutral" ? "ink-faint" : tone})`;
  const readout = unavailable ? "Unavailable" : indeterminate ? null : valueText ?? `${Math.round(pct)}%`;

  return (
    <div className={cn("w-full min-w-0", className)}>
      {label || (showValue && readout) ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
          {label ? <span className="min-w-0 truncate text-ink-dim">{label}</span> : <span />}
          {showValue && readout ? (
            <span className={cn("shrink-0 font-mono text-[11px] tabular-nums", unavailable ? "text-ink-faint" : "text-ink")}>
              {readout}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={typeof label === "string" ? label : ariaLabel}
        aria-valuemin={indeterminate || unavailable ? undefined : 0}
        aria-valuemax={indeterminate || unavailable ? undefined : max}
        aria-valuenow={indeterminate || unavailable ? undefined : clamped}
        aria-valuetext={unavailable ? "Unavailable" : valueText}
        aria-busy={indeterminate || undefined}
        className={cn("relative w-full overflow-hidden rounded-full", trackHeight[size], !segments && "bg-white/[0.08]")}
      >
        {segments && segments > 1 && !indeterminate ? (
          <div className="flex h-full gap-[3px]">
            {Array.from({ length: segments }, (_, i) => {
              const filled = (i + 1) / segments <= pct / 100 + 1e-9;
              return <span key={i} className={cn("h-full flex-1 rounded-[2px]", filled ? fill : "bg-white/[0.09]")} />;
            })}
          </div>
        ) : indeterminate ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 0%, transparent 30%, ${fillColor} 42%, ${fillColor} 58%, transparent 70%, transparent 100%)`,
              backgroundSize: "200% 100%",
              animation: "q-shimmer 1.6s linear infinite",
            }}
          />
        ) : (
          <div
            className={cn("h-full rounded-full transition-[width] duration-500 ease-quirq", fill)}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}
