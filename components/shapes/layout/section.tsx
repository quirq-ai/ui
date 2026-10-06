// Section band and dividers: the max-1180 container with section rhythm, plus the hairline
// separators that divide everything inside it. Server-safe.
//
// Rules from the product: content max 1180px, gutters clamp(20px, 5vw, 44px), section
// padding clamp(88px, 12vh, 136px), scroll-margin-top 78px under the fixed 64px nav, article
// column 68ch. Lines are never heavier than 1px, except accent left bars (2px) and failure
// strips (3px).
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/components/ui";

/* ----------------------------------------------------------------------------- Band */

export type BandSpacing = "default" | "stacked" | "compact" | "page-top" | "none";

const spacingCls: Record<BandSpacing, string> = {
  /* full section rhythm */
  default: "py-[clamp(88px,12vh,136px)]",
  /* stacked sections share one gap: no bottom padding (landing "!pb-0") */
  stacked: "pt-[clamp(88px,12vh,136px)] pb-0",
  /* logo strips and fact rows (landing "!py-8") */
  compact: "py-8",
  /* first band on a page under the fixed nav */
  "page-top": "pt-[clamp(28px,4vw,48px)] pb-[clamp(88px,12vh,136px)]",
  none: "py-0",
};

export type BandProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Section anchor; the band gets scroll-margin-top so a fixed nav never covers it. */
  id?: string;
  spacing?: BandSpacing;
  /** "article" narrows the text column to 68ch inside the 1180 container. */
  width?: "default" | "article";
  as?: "section" | "div" | "header" | "footer" | "article";
  /** Class for the inner container (grids, alignment). */
  innerClassName?: string;
  children: ReactNode;
};

/** Max-1180 container with section rhythm and responsive gutters. */
export function Band({
  id,
  spacing = "default",
  width = "default",
  as: Tag = "section",
  className,
  innerClassName,
  children,
  ...rest
}: BandProps) {
  return (
    <Tag id={id} className={cn("relative scroll-mt-[78px]", className)} {...rest}>
      <div
        className={cn(
          "mx-auto w-full max-w-[1180px] px-[clamp(20px,5vw,44px)]",
          spacingCls[spacing],
          innerClassName,
        )}
      >
        {width === "article" ? <div className="max-w-[68ch]">{children}</div> : children}
      </div>
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- Separator */

export type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  /** Soft (row dividers), default hair, or strong (framed media). */
  weight?: "soft" | "default" | "strong";
  /** Decorative lines are hidden from assistive tech; semantic ones get role="separator". */
  decorative?: boolean;
  className?: string;
};

const weightBg = { soft: "bg-hair-soft", default: "bg-hair", strong: "bg-hair-strong" } as const;

/** One 1px line, horizontal or vertical (shadcn Separator shape). */
export function Separator({ orientation = "horizontal", weight = "default", decorative = true, className }: SeparatorProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0",
        weightBg[weight],
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
    />
  );
}

/* ----------------------------------------------------------------------------- LabeledRule */

/** Mono label followed by a hairline that fills the row (Sharing ".shl-rule"). */
export function LabeledRule({ children, aside, className }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{children}</span>
      <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-hair" />
      {aside ? <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint tabular-nums">{aside}</span> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- FactLine */

export type FactLineProps = {
  items: ReactNode[];
  /** Mono uppercase (meta lines) or sans (source facts). */
  mono?: boolean;
  /** Accessible name for the list, such as "Runtime facts". */
  "aria-label"?: string;
  className?: string;
};

/** Facts set off with a middle dot: "Installed · Agent folder found · 2.1.4". Wraps cleanly. */
export function FactLine({ items, mono = false, "aria-label": ariaLabel, className }: FactLineProps) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-y-1",
        mono ? "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint" : "text-[12.5px] text-ink-dim",
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={i} className="inline-flex min-w-0 items-center">
          <span className="min-w-0">{item}</span>
          {i < items.length - 1 ? (
            <span aria-hidden="true" className="px-2 text-ink-faint">
              ·
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- HairlineGrid */

export type HairlineGridProps = HTMLAttributes<HTMLElement> & {
  /** Columns from md up; one column below. */
  cols?: 2 | 3 | 4;
  /** Cell fill: soft panel (#0f0f11) or the black ground. The 1px gap shows the line behind. */
  surface?: "soft" | "ground";
  /** Framed (rounded border) or open (top and bottom rules only, like the products ladder). */
  frame?: "framed" | "open";
  as?: "div" | "ul" | "ol";
};

const colsCls = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;
const surfaceCls = { soft: "[&>*]:bg-[#0f0f11]", ground: "[&>*]:bg-bg" } as const;

/** gap-px grid: the gaps read as 1px hairlines between cells. */
export function HairlineGrid({
  cols = 3,
  surface = "soft",
  frame = "framed",
  as: Tag = "div",
  className,
  children,
  ...rest
}: HairlineGridProps) {
  return (
    <Tag
      className={cn(
        "grid gap-px bg-hair",
        frame === "framed" ? "overflow-hidden rounded-[14px] border border-hair-soft" : "border-y border-hair",
        colsCls[cols],
        surfaceCls[surface],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- AccentBar / FailureStrip */

const barBg: Record<Exclude<Tone, "neutral">, string> = {
  red: "before:bg-red",
  org: "before:bg-org",
  yel: "before:bg-yel",
  grn: "before:bg-grn",
  cyn: "before:bg-cyn",
  blu: "before:bg-blu",
  pur: "before:bg-pur",
};

/** Block with a 2px accent left bar: callouts, equations, the live flow node. */
export function AccentBar({
  tone = "blu",
  spectrum = false,
  children,
  className,
}: {
  tone?: Exclude<Tone, "neutral">;
  /** Use the full spectrum (quote bar) instead of one tone. */
  spectrum?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-r-[10px] bg-white/[0.03] py-3 pl-4 pr-4 text-[13.5px] leading-relaxed text-ink",
        "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-[2px] before:content-['']",
        spectrum ? "before:[background:linear-gradient(180deg,var(--red),var(--org),var(--yel),var(--grn),var(--cyn),var(--blu),var(--pur))]" : barBg[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Panel with a 3px red strip on top: the only heavier line, reserved for failures. */
export function FailureStrip({
  title,
  children,
  action,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("overflow-hidden rounded-[12px] border border-red/25 bg-red/[0.05]", className)}>
      <div aria-hidden="true" className="h-[3px] bg-red" />
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink">{title}</p>
          {children ? <div className="mt-0.5 text-[12.5px] leading-relaxed text-ink-dim">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
