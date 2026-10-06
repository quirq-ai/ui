// Demo scaffolding shared by the status-feedback demos: mono captions, labelled specimen
// cells and titled groups. Server-safe, no hooks.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const captionCls = "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint";

/** Small mono caption that names a variant or state in a demo. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(captionCls, "leading-[1.45]", className)}>{children}</p>;
}

/** One labelled cell: caption on top, the specimen below. */
export function Specimen({
  label,
  children,
  className,
  bodyClassName,
  aside,
  flat = false,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Right side of the caption row (a hint or a small control). */
  aside?: ReactNode;
  /** Drop the cell chrome when the specimen brings its own surface. */
  flat?: boolean;
}) {
  return (
    <figure
      className={cn(
        "m-0 flex min-w-0 flex-col gap-3",
        !flat && "rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4",
        className,
      )}
    >
      <figcaption className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className={cn(captionCls, "leading-[1.4]")}>{label}</span>
        {aside ? <span className="text-[11px] text-ink-faint">{aside}</span> : null}
      </figcaption>
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </figure>
  );
}

/** A titled band of specimens inside one demo. */
export function DemoGroup({
  title,
  hint,
  children,
  className,
}: {
  title: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-3 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hair-soft pb-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">{title}</h3>
        {hint ? <p className="text-[11.5px] text-ink-faint">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Vertical rhythm for a whole demo. */
export function DemoStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex min-w-0 flex-col gap-8", className)}>{children}</div>;
}
