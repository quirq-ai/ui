// Demo scaffolding for the data-display category: the small mono caption that names each
// variant or state, and a labelled cell. Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Mono caption above a demo cell: "VARIANT · METADATA", "STATE · LOADING". Wraps cleanly. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase leading-[1.5] tracking-[0.14em] text-ink-faint", className)}>{children}</p>;
}

/** A captioned demo cell. */
export function Cell({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <Caption className="mb-3">{label}</Caption>
      {children}
    </div>
  );
}
