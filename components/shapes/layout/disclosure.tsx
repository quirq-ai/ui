// Native disclosures on <details>/<summary>: keyboard and screen reader support come from the
// platform, and the marker flips with Tailwind's group-open. Server-safe.
//   Disclosure: method details ("+ The equation, and the one assumption in it")
//   FaqItem:    question rows divided by hairlines
//   DetailsBox: Space setup boxes and inline "Advanced" sections with a ▸ chevron
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const resetMarker = "list-none [&::-webkit-details-marker]:hidden [&::marker]:content-['']";

/* ----------------------------------------------------------------------------- Disclosure */

export type DisclosureProps = {
  summary: ReactNode;
  children: ReactNode;
  /** quirq: blue summary with a mono +/- span. machine-speed: ink summary with a "+ " / "- " prefix. */
  variant?: "quirq" | "machine-speed";
  defaultOpen?: boolean;
  /** Hairline and spacing above (every item after the first). */
  divided?: boolean;
  className?: string;
};

/** Method disclosure: one question, one answer, closed by default. */
export function Disclosure({ summary, children, variant = "quirq", defaultOpen = false, divided = false, className }: DisclosureProps) {
  return (
    <details open={defaultOpen} className={cn("group", divided && "mt-4 border-t border-hair pt-4", className)}>
      <summary
        className={cn(
          resetMarker,
          "flex cursor-pointer items-baseline gap-3 rounded-[6px] text-[15px] font-semibold leading-snug transition-colors",
          variant === "quirq" ? "text-blu hover:text-[#5fb2ff]" : "text-ink hover:text-white",
        )}
      >
        {variant === "quirq" ? (
          <span aria-hidden="true" className="w-3 shrink-0 font-mono text-ink-faint">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">-</span>
          </span>
        ) : (
          <span aria-hidden="true" className="w-3 shrink-0 font-mono" style={{ color: "#b4e34a" }}>
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">-</span>
          </span>
        )}
        <span className="min-w-0">{summary}</span>
      </summary>
      <div className="mt-4 pl-6 text-[14px] leading-[1.75] text-ink-dim">{children}</div>
    </details>
  );
}

/* ----------------------------------------------------------------------------- FaqItem */

/** FAQ row: question as summary, answer below, hairline under each row. */
export function FaqItem({ question, children, defaultOpen = false, className }: { question: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <details open={defaultOpen} className={cn("group border-b border-hair py-4", className)}>
      <summary className={cn(resetMarker, "flex cursor-pointer items-center justify-between gap-4 rounded-[6px] text-[15px] font-medium text-ink")}>
        <span className="min-w-0">{question}</span>
        <span
          aria-hidden="true"
          className="relative size-3 shrink-0 text-ink-faint before:absolute before:inset-x-0 before:top-1/2 before:h-px before:-translate-y-1/2 before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-current after:transition-transform group-open:after:scale-y-0"
        />
      </summary>
      <div className="mt-2.5 max-w-[60ch] text-[14px] leading-relaxed text-ink-dim">{children}</div>
    </details>
  );
}

/* ----------------------------------------------------------------------------- DetailsBox */

export type DetailsBoxProps = {
  summary: ReactNode;
  /** Count after the summary: "Other agents (2)". */
  count?: number;
  children: ReactNode;
  /** box: bordered setup box (radius 9). inline: plain summary inside a form. */
  variant?: "box" | "inline";
  defaultOpen?: boolean;
  className?: string;
};

/** Space setup details: ▸ summary, body under a hairline when open. */
export function DetailsBox({ summary, count, children, variant = "box", defaultOpen = false, className }: DetailsBoxProps) {
  const box = variant === "box";
  return (
    <details open={defaultOpen} className={cn("group", box && "rounded-[9px] border border-hair-soft bg-s1", className)}>
      <summary
        className={cn(
          resetMarker,
          "flex cursor-pointer items-center gap-2 rounded-[8px] text-[12px] text-ink-dim transition-colors hover:text-ink",
          box ? "px-[15px] py-[13px] group-open:rounded-b-none group-open:border-b group-open:border-hair-soft" : "py-1",
        )}
      >
        <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint transition-transform duration-150 group-open:rotate-90" />
        <span className="min-w-0">
          {summary}
          {count !== undefined ? <span className="tabular-nums text-ink-faint"> ({count})</span> : null}
        </span>
      </summary>
      <div className={cn("text-[12.5px] leading-relaxed text-ink-dim", box ? "px-[15px] py-3.5" : "pb-1 pl-[22px] pt-2")}>{children}</div>
    </details>
  );
}
