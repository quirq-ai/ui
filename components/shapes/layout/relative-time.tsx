"use client";

// RelativeTime: "4m ago" measured against a fixed now, with the exact UTC date in a tooltip on
// hover and keyboard focus. Escape dismisses the tooltip without moving focus or the pointer.
// The tooltip text is always wired through aria-describedby, so screen readers hear the exact
// date even while it is hidden. Missing times render a word, never 0.
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { exactUtc, shortUtc, type MissingTime } from "./time";

export type RelativeTimeProps = {
  /** ISO timestamp, or null when the time was not recorded. */
  iso: string | null | undefined;
  /** The fixed "now" to measure against (never the wall clock during render). */
  now: string;
  /** inline text, right-aligned tabular column, or two lines (absolute over relative). */
  layout?: "inline" | "column" | "stacked";
  /** Word for a missing time. */
  missing?: MissingTime;
  /** Tooltip alignment; use "end" near a right edge. */
  align?: "start" | "center" | "end";
  className?: string;
};

const BASE = "font-mono text-[12px] tracking-[0.02em] tabular-nums";

const alignCls = {
  center: "left-1/2 -translate-x-1/2",
  start: "left-0",
  end: "right-0",
} as const;

export function RelativeTime({ iso, now, layout = "inline", missing = "Time unavailable", align = "center", className }: RelativeTimeProps) {
  const tipId = useId();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!iso) {
    return <span className={cn(BASE, "italic text-ink-faint", layout === "column" ? "block text-right" : null, className)}>{missing}</span>;
  }

  const rel = formatRelative(iso, now);
  if (layout === "stacked") {
    return (
      <time dateTime={iso} className={cn("flex flex-col whitespace-nowrap leading-tight", BASE, className)}>
        <span className="text-ink-dim">{shortUtc(iso)}</span>
        <span className="text-ink-faint">{rel}</span>
      </time>
    );
  }

  const open = (hover || focus) && !dismissed;
  const exact = exactUtc(iso);
  return (
    <span
      className={cn("relative", layout === "column" ? "flex justify-end" : "inline-flex", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        if (!focus) setDismissed(false);
      }}
    >
      <time
        dateTime={iso}
        tabIndex={0}
        aria-describedby={tipId}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          if (!hover) setDismissed(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setDismissed(true);
          }
        }}
        className={cn(
          BASE,
          "cursor-default rounded-[4px] text-ink-faint underline decoration-hair-strong decoration-dotted underline-offset-[3px] hover:text-ink-dim",
          layout === "column" && "text-right",
        )}
      >
        {rel}
      </time>
      <span
        id={tipId}
        role="tooltip"
        hidden={!open}
        className={cn(
          "pointer-events-none absolute bottom-full z-50 mb-2 w-max max-w-[min(240px,calc(100vw-32px))]",
          "rounded-[6px] border border-hair-strong bg-s3 px-2 py-1 text-left font-sans text-[11.5px] font-normal normal-case leading-snug tracking-normal text-ink",
          "shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
          alignCls[align],
        )}
      >
        {exact}
      </span>
    </span>
  );
}
