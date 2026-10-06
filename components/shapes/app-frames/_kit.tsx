// Demo scaffolding for the app-frames category: mono captions, labelled specimens, section
// heads and keyboard hints. Server-safe. Not exported from the category index.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const CAPTION = "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint";

/** Small mono caption naming a variant or state. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(CAPTION, className)}>{children}</p>;
}

/** One labelled specimen: caption above, the live frame below. */
export function Specimen({
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
    <figure className={cn("m-0 flex min-w-0 flex-col gap-2.5", className)}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className={CAPTION}>{label}</span>
        {note ? <span className="text-[11.5px] text-ink-faint">{note}</span> : null}
      </figcaption>
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
  return <div className={cn("flex min-w-0 flex-col gap-12", className)}>{children}</div>;
}

/** One line of how-to-use text under a live specimen. */
export function Hint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[12px] leading-relaxed text-ink-faint", className)}>{children}</p>;
}

/** Film grain inside a frame (the global .grain is fixed to the viewport, so frames use this). */
export const GRAIN_STYLE: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

/** XO lime, used only for live pips and the inner chevrons of the XO mark. */
export const XO_LIME = "#83d63a";

/** Inputs, textareas, selects and editable regions keep their own keys. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}
