// Demo scaffolding for the cards category: mono captions, labelled specimens and
// section heads. Server-safe. Not exported from the category index.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const CAPTION = "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint";

/** Small mono caption naming a variant or state. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(CAPTION, className)}>{children}</p>;
}

/** One labelled specimen: caption above, the live shape below. */
export function Specimen({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <figure className={cn("m-0 flex min-w-0 flex-col gap-2.5", className)}>
      <figcaption className={CAPTION}>{label}</figcaption>
      {children}
    </figure>
  );
}

/** Group heading inside a demo: a mono label with a hairline, optional controls on the right. */
export function DemoSection({
  title,
  aside,
  children,
  className,
}: {
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft pb-2.5">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-dim">{title}</h3>
        {aside ? <div className="flex flex-wrap items-center gap-2">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** Vertical rhythm for a whole demo. */
export function DemoStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex min-w-0 flex-col gap-10", className)}>{children}</div>;
}
