// Demo scaffolding for the forms-inputs category: mono captions, labelled cells, responsive
// grids and a static focus look for state demos. Server-safe. Demos only, not a shape.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small mono caption that names a variant or state in a demo. */
export function DemoCaption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint", className)}>{children}</p>;
}

/** One labelled cell in a demo grid. */
export function DemoCell({
  label,
  note,
  children,
  className,
}: {
  label: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <DemoCaption>{label}</DemoCaption>
        {note ? <span className="text-[11.5px] leading-snug text-ink-faint">{note}</span> : null}
      </div>
      {children}
    </div>
  );
}

const colsCls = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
} as const;

/** Responsive grid of demo cells. */
export function DemoGrid({ cols = 2, children, className }: { cols?: 1 | 2 | 3; children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-x-6 gap-y-9", colsCls[cols], className)}>{children}</div>;
}

/** Hairline between demo groups. */
export function DemoRule() {
  return <hr className="my-9 border-0 border-t border-hair-soft" />;
}

/** The keyboard focus ring drawn statically, so a "focus" state can sit beside the others. */
export const FOCUS_LOOK = "outline-2 outline-offset-3 outline-ink";
