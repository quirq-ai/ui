// Demo scaffolding for this category: mono captions, labelled cells and section headings.
// Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small mono caption naming the variant or state on show. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint", className)}>{children}</p>;
}

/** One labelled example. surface adds the dark app card behind it. */
export function DemoCell({
  caption,
  children,
  surface = true,
  className,
  bodyClassName,
}: {
  caption: ReactNode;
  children: ReactNode;
  surface?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <figcaption>
        <Caption>{caption}</Caption>
      </figcaption>
      <div
        className={cn(
          "min-w-0",
          surface && "flex flex-1 flex-col rounded-[14px] border border-hair-soft bg-[#0c0c0d] p-4",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </figure>
  );
}

/** Group heading inside a demo: caption, optional note, then content. */
export function DemoGroup({ title, note, children, className }: { title: ReactNode; note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hair-soft pb-2">
        <h3 className="text-[13px] font-semibold tracking-[-0.005em] text-ink">{title}</h3>
        {note ? <p className="text-[11.5px] text-ink-faint">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
