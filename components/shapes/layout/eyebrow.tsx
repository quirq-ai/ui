// Eyebrow kicker and mono meta: the spectrum-chip kicker that opens a section, mono meta
// lines (bylines, qualifiers, reassurances, method footnotes), map captions, and relative
// timestamps that show the exact UTC date on hover or focus. Server-safe; RelativeTime is a
// client island re-exported from relative-time.tsx.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- Kicker */

export type KickerProps = {
  children: ReactNode;
  /** Leading index, set off with a middle dot: "02 · The mint rule". */
  number?: string;
  /** The 46x2 spectrum dash after the label. */
  rule?: boolean;
  /** Render as a heading when the kicker is the only title ("Further reading"). */
  as?: "div" | "p" | "h2" | "h3";
  /** Drop the spectrum chip (dense app kickers). */
  chip?: boolean;
  id?: string;
  className?: string;
};

/** Mono uppercase kicker with the 11px spectrum chip. The brand's resting spectrum. */
export function Kicker({ children, number, rule = false, as: Tag = "div", chip = true, id, className }: KickerProps) {
  return (
    <Tag id={id} className={cn("eyebrow m-0 min-w-0 font-normal", rule && "rule", className)}>
      {chip ? <span className="chip shrink-0" aria-hidden="true" /> : null}
      <span className="lbl min-w-0">
        {number ? (
          <>
            <span className="tabular-nums text-ink">{number}</span>
            <span aria-hidden="true" className="px-[0.6em] text-ink-faint">
              ·
            </span>
          </>
        ) : null}
        {children}
      </span>
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- MonoMeta */

export type MonoMetaKind = "byline" | "qualifier" | "reassurance" | "footnote";

export type MonoMetaProps = {
  /** Parts joined with a middle dot. */
  items: ReactNode[];
  /** byline and qualifier are uppercase; reassurance is ink-dim; footnote is sentence case. */
  kind?: MonoMetaKind;
  className?: string;
};

const metaCls: Record<MonoMetaKind, string> = {
  byline: "text-[10.5px] uppercase tracking-[0.16em] text-ink-faint",
  qualifier: "text-[10.5px] uppercase tracking-[0.14em] text-ink-dim",
  reassurance: "text-[10.5px] uppercase tracking-[0.14em] text-ink-faint",
  footnote: "text-[11.5px] leading-relaxed tracking-[0.01em] text-ink-faint",
};

/** One mono line of honest metadata. Qualifiers are brand behavior, not decoration. */
export function MonoMeta({ items, kind = "byline", className }: MonoMetaProps) {
  return (
    <p className={cn("m-0 min-w-0 font-mono", metaCls[kind], className)}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 ? (
            <span aria-hidden="true" className="px-[0.55em] opacity-70">
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

/* ----------------------------------------------------------------------------- MapCaption */

export type MapCaptionProps = {
  /** Left label: "All projects · 2 Oct 2026". */
  label: ReactNode;
  /** Right count, after a hairline: "11 projects mapped". */
  count?: ReactNode;
  /** CSS color for the 3px live dot; omit for no dot. */
  dot?: string;
  className?: string;
};

/** Small uppercase caption over a map or graph canvas, with an optional dot and edge count. */
export function MapCaption({ label, count, dot, className }: MapCaptionProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.17em] text-ink-faint",
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-[5px] shrink-0 rounded-full"
          style={{ background: dot, boxShadow: `0 0 0 3px color-mix(in srgb, ${dot} 16%, transparent)` }}
        />
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
      {count ? (
        <>
          <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-hair" />
          <span className="shrink-0 tabular-nums text-ink-dim">{count}</span>
        </>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- RelativeTime */

// RelativeTime holds hover, focus and Escape state, so it lives in a client file; the UTC
// helpers stay server-safe in time.ts.
export { RelativeTime, type RelativeTimeProps } from "./relative-time";
export { exactUtc, shortUtc, type MissingTime } from "./time";
