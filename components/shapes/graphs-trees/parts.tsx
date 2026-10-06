// Small server-safe building blocks shared by the graphs-trees demos and components:
// the mono demo caption, a captioned demo cell, and a tone helper for inline SVG.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/components/ui/tones";

/** Mono caption above each demo variant or state. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] text-ink-faint", className)}>{children}</p>
  );
}

/** A captioned demo block. */
export function DemoCell({
  caption,
  note,
  className,
  children,
}: {
  caption: ReactNode;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Caption>{caption}</Caption>
        {note ? <p className="text-[11.5px] text-ink-faint">{note}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** CSS color for a Tone, usable in SVG fill and stroke. neutral reads as dim ink. */
export function toneColor(tone: Tone | "ink" | "faint" | undefined): string {
  switch (tone) {
    case undefined:
    case "neutral":
      return "var(--ink-dim)";
    case "ink":
      return "var(--ink)";
    case "faint":
      return "var(--ink-faint)";
    default:
      return `var(--${tone})`;
  }
}
