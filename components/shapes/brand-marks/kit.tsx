// Server-safe helpers shared by the brand-marks demos: the mono caption, a captioned
// specimen tile with a choice of ground, the provenance note, the film grain overlay, and
// KeepCase for "quirq" inside uppercase lines.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Fractal noise as a data URI, the same texture the landing uses for its 4% grain. */
export const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Film grain laid over art. 0.04 is the brand default; thumbs use 0.35 with overlay blending. */
export function Grain({ opacity = 0.04, blend = "normal", className }: { opacity?: number; blend?: "normal" | "overlay" | "soft-light"; className?: string }) {
  const style: CSSProperties = { backgroundImage: NOISE_URI, opacity, mixBlendMode: blend };
  return <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)} style={style} />;
}

/** Mono uppercase caption that names a variant or state inside a demo. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint", className)}>{children}</p>;
}

export type Ground = "black" | "card" | "panel" | "paper" | "olive" | "galileo" | "none";

const GROUND: Record<Ground, string> = {
  black: "bg-black",
  card: "bg-s1",
  panel: "bg-[#0f0f11]",
  paper: "bg-[#f4f3f0] text-[#08090A]",
  olive: "bg-[#10120f] text-[#e9eae6]",
  galileo: "bg-[#0e110c] text-[#eef2ea]",
  none: "",
};

/** A captioned specimen: label row above, framed ground below. */
export function Specimen({
  label,
  aside,
  ground = "card",
  children,
  className,
  bodyClassName,
  center = true,
  padded = true,
  minHeight = 120,
}: {
  label: ReactNode;
  aside?: ReactNode;
  ground?: Ground;
  children: ReactNode;
  className?: string;
  /** Extra classes for the ground; set center or padded to false before adding your own layout or padding. */
  bodyClassName?: string;
  /** Center the content with flex (default). */
  center?: boolean;
  /** 24px padding (default). */
  padded?: boolean;
  /** Minimum height of the ground in px; 0 lets the content set it. */
  minHeight?: number;
}) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      {/* From sm up the caption stays on one line and the aside gives way first (ellipsis plus
          a title), so grounds in the same row start at the same height. Single column wraps. */}
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:flex-nowrap">
        <Caption className="min-w-0">{label}</Caption>
        {aside ? (
          <span title={typeof aside === "string" ? aside : undefined} className="min-w-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint sm:truncate">
            {aside}
          </span>
        ) : null}
      </figcaption>
      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-[14px] border border-hair-soft",
          center && "flex items-center justify-center",
          padded && "p-6",
          GROUND[ground],
          bodyClassName,
        )}
        style={minHeight ? { minHeight } : undefined}
      >
        {children}
      </div>
    </figure>
  );
}

/** Section heading inside a long demo. */
export function DemoSection({ title, note, children, className }: { title: string; note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hair-soft pb-2.5">
        <h3 className="text-[13px] font-[600] tracking-[-0.005em] text-ink">{title}</h3>
        {note ? <p className="text-[12px] text-ink-faint">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Qualifier under mock or illustrative numbers. */
export function ProvenanceNote({ kind = "illustrative", children, className }: { kind?: "mock" | "illustrative"; children?: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        kind === "illustrative" ? "text-org/90" : "text-ink-faint",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("inline-block size-[5px] rounded-full", kind === "illustrative" ? "bg-org" : "bg-ink-faint")} />
      <span>{kind === "illustrative" ? "Illustrative, not a measurement" : "Mock data"}</span>
      {children ? <span className="normal-case tracking-normal text-ink-faint">{children}</span> : null}
    </p>
  );
}

/** Polite live line used by demos to confirm a click without leaving the page. */
export function ActionLog({ message, idle = "Click a mark to try it", className }: { message: string | null; idle?: string; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("min-h-[18px] font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint", className)}>
      {message ? (
        <>
          <span className="text-grn" aria-hidden="true">
            ●{" "}
          </span>
          {message}
        </>
      ) : (
        idle
      )}
    </p>
  );
}

/** Keeps "quirq" lowercase inside mono uppercase lines: the name is never capitalized. */
export function KeepCase({ children }: { children: ReactNode }) {
  return <span className="normal-case">{children}</span>;
}
