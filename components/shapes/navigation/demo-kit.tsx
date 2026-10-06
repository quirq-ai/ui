// Layout helpers shared by the navigation demos: mono captions, labelled cells and
// responsive grids. Server-safe; no hooks.
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small mono caption that labels a variant or state in a demo. */
export function Caption({ children, className, as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" | "h3" | "h4" }) {
  return <Tag className={cn("font-mono text-[10.5px] font-normal uppercase leading-snug tracking-[0.14em] text-ink-faint", className)}>{children}</Tag>;
}

export type DemoCellProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Variant or state name, shown as the mono caption. */
  label: ReactNode;
  /** Optional one-line note under the caption (interaction hint, data source). */
  note?: ReactNode;
};

/** One labelled example: caption above, content below. */
export function DemoCell({ label, note, className, children, ...rest }: DemoCellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)} {...rest}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Caption>{label}</Caption>
        {note ? <span className="text-[11.5px] leading-snug text-ink-faint">{note}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** Responsive grid for demo cells. */
export function DemoGrid({ cols = 2, className, children }: { cols?: 1 | 2 | 3; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-x-6 gap-y-8",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical stack of demo groups with generous spacing. */
export function DemoStack({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex min-w-0 flex-col gap-10", className)}>{children}</div>;
}

/** A mock surface that frames an app region (page ground with a hairline). Pass clip={false}
    when a popover inside must be able to leave the frame. */
export function Surface({ className, children, clip = true, ...rest }: HTMLAttributes<HTMLDivElement> & { clip?: boolean }) {
  return (
    <div className={cn("relative min-w-0 rounded-[14px] border border-hair bg-bg", clip && "overflow-hidden", className)} {...rest}>
      {children}
    </div>
  );
}

/** Mono readout line used under interactive demos: "ROUTE #/inbox". */
export function Readout({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-ink-dim", className)} aria-live="polite">
      <span className="uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <span className="min-w-0 break-all text-ink">{children}</span>
    </p>
  );
}
