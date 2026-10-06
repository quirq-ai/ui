// Demo scaffolding for the actions category: mono captions, labelled specimens, titled
// sections and a quiet stage panel. Server-safe; no hooks.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const captionCls = "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint";

/** Small mono caption that names a variant or state. */
export function Caption({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p id={id} className={cn(captionCls, "leading-snug", className)}>
      {children}
    </p>
  );
}

/** One labelled sample: caption on top, the sample below, an optional faint note. */
export function Specimen({
  label,
  note,
  children,
  className,
  layout = "row",
}: {
  label: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
  /** row: wrapping inline samples; block: one full-width sample; stack: full-width column. */
  layout?: "row" | "block" | "stack";
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <Caption>{label}</Caption>
      <div
        className={cn(
          "min-w-0",
          layout === "row" && "flex flex-wrap items-center gap-3",
          layout === "block" && "block",
          layout === "stack" && "flex flex-col items-start gap-3",
        )}
      >
        {children}
      </div>
      {note ? <p className="text-[12px] leading-relaxed text-ink-faint">{note}</p> : null}
    </div>
  );
}

const colsCls = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-5",
} as const;

/** A titled group of specimens laid out in a responsive grid. */
export function DemoSection({
  title,
  children,
  cols = 3,
  className,
  aside,
}: {
  title: string;
  children: ReactNode;
  cols?: keyof typeof colsCls;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <section aria-label={title} className={cn("min-w-0", className)}>
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-dim">{title}</h3>
        <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-hair-soft" />
        {aside}
      </div>
      <div className={cn("grid gap-x-6 gap-y-8", colsCls[cols])}>{children}</div>
    </section>
  );
}

/** Quiet surface behind a sample, like an app panel: s1, hairline, radius 14. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 rounded-[14px] border border-hair-soft bg-s1 p-4", className)}>{children}</div>;
}

/**
 * Static preview of an interactive state (hover, focus, pressed). inert takes it out of the
 * tab order, the accessibility tree and pointer input, so a look-alike never acts like a
 * control. display: contents keeps the parent's flex or grid layout.
 */
export function Still({ children }: { children: ReactNode }) {
  return (
    <div inert className="contents">
      {children}
    </div>
  );
}

/** Vertical stack for a whole demo. */
export function DemoStack({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-12">{children}</div>;
}
