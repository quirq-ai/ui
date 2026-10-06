// Demo-only scaffolding for the layout category: mono captions and labelled cells.
// Server-safe; no hooks.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small mono caption that names the variant or state a specimen shows. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] text-ink-faint", className)}>{children}</p>
  );
}

/** Caption plus specimen. `note` adds a dim sentence under the caption. */
export function Specimen({
  label,
  note,
  children,
  className,
  bodyClassName,
}: {
  label: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <div className="flex flex-col gap-1">
        <Caption>{label}</Caption>
        {note ? <p className="text-[12px] leading-snug text-ink-faint">{note}</p> : null}
      </div>
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </div>
  );
}

/** Responsive specimen grid. */
export function SpecimenGrid({ cols = 2, children, className }: { cols?: 1 | 2 | 3; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-x-6 gap-y-8",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Hairline between demo groups. */
export function DemoRule() {
  return <hr className="border-0 border-t border-hair-soft" />;
}
