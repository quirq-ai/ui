// Page header and toolbar pieces that need no state: the two-tone headline with its dim
// qualifier clause, the app page header (kicker, title, summary, actions, back pill), the
// editorial series head, toolbar summary counts, column heads and the partial-data note.
// Server-safe. Stateful headers (filters, refresh, prev and next scope) live in
// page-header-client.tsx.
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- TwoToneHeading */

export type TwoToneSize = "display" | "page" | "products" | "whitepaper" | "section";

const twoToneCls: Record<TwoToneSize, string> = {
  /* centered display h2: clamp(40px, 5.25vw, 75.5px), weight 600, -0.03em */
  display: "text-[clamp(34px,5.25vw,75.5px)] font-semibold leading-[1.12] tracking-[-0.03em]",
  /* page h1: clamp(34px, 4vw, 50px) */
  page: "text-[clamp(30px,4vw,50px)] font-semibold leading-[1.1] tracking-[-0.028em]",
  /* products hero h1: clamp(40px, 6.4vw, 84px), lh .98, -0.045em */
  products: "text-[clamp(36px,6.4vw,84px)] font-semibold leading-[0.98] tracking-[-0.045em]",
  /* whitepaper h1: clamp(38px, 5.6vw, 72px), max 16ch */
  whitepaper: "max-w-[16ch] text-[clamp(32px,5.6vw,72px)] font-semibold leading-[1.02] tracking-[-0.035em]",
  /* section h2 with dim tail: clamp(26px, 3vw, 38px), max 34ch */
  section: "max-w-[34ch] text-[clamp(24px,3vw,38px)] font-semibold leading-[1.12] tracking-[-0.03em]",
};

export type TwoToneHeadingProps = {
  /** The claim, in ink. */
  lead: ReactNode;
  /** The qualifier clause, in ink-dim. */
  tail?: ReactNode;
  /** Put the tail on its own line (deck-like rag). */
  breakTail?: boolean;
  size?: TwoToneSize;
  as?: "h1" | "h2" | "h3";
  align?: "start" | "center";
  id?: string;
  className?: string;
};

/** Headline with a dim qualifier: "Pay per space. Never per seat." */
export function TwoToneHeading({ lead, tail, breakTail = false, size = "page", as: Tag = "h2", align = "start", id, className }: TwoToneHeadingProps) {
  return (
    <Tag id={id} className={cn("m-0 text-balance text-ink", twoToneCls[size], align === "center" && "mx-auto text-center", className)}>
      {lead}
      {tail ? (
        <>
          {breakTail ? <br /> : " "}
          <span className="text-ink-dim">{tail}</span>
        </>
      ) : null}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- PageHeader */

export type PageHeaderSize = "app" | "hero" | "galileo" | "galileo-small";

const titleCls: Record<PageHeaderSize, string> = {
  /* Space dashboard pages: 30px, weight 500, tight tracking */
  app: "text-[clamp(24px,3vw,30px)] font-medium leading-[1.12] tracking-[-0.02em]",
  /* Technical details hero: clamp(34px, 4vw, 54px), lh 1 */
  hero: "text-[clamp(30px,4vw,54px)] font-medium leading-none tracking-[-0.03em]",
  /* galileo pages: clamp(26px, 4vw, 34px), -0.02em */
  galileo: "text-[clamp(24px,4vw,34px)] font-semibold leading-[1.15] tracking-[-0.02em]",
  /* galileo-made pages: 22px */
  "galileo-small": "text-[22px] font-semibold leading-[1.2] tracking-[-0.015em]",
};

export type PageHeaderProps = {
  title: ReactNode;
  /** Part of the title set in the accent or dim tone. */
  titleTail?: ReactNode;
  /** Mono kicker above the title. */
  kicker?: ReactNode;
  /** CSS color for a kicker dot with a soft halo (Technical details uses blue). */
  kickerDot?: string;
  description?: ReactNode;
  /** Controls on the right; they wrap under the title on narrow screens. */
  actions?: ReactNode;
  /** Back pill, such as "Setup": rendered as a link with a leading arrow. */
  back?: { label: string; href: string };
  size?: PageHeaderSize;
  as?: "h1" | "h2" | "h3";
  titleId?: string;
  className?: string;
};

/** App page header: kicker, title, summary line and actions. */
export function PageHeader({
  title,
  titleTail,
  kicker,
  kickerDot,
  description,
  actions,
  back,
  size = "app",
  as: Tag = "h1",
  titleId,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-7 gap-y-4", className)}>
      <div className="min-w-0 flex-1 basis-[280px]">
        {kicker ? (
          <p className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">
            {kickerDot ? (
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: kickerDot, boxShadow: `0 0 0 4px color-mix(in srgb, ${kickerDot} 12%, transparent)` }}
              />
            ) : null}
            {kicker}
          </p>
        ) : null}
        <Tag id={titleId} className={cn("m-0 text-ink", titleCls[size])}>
          {title}
          {titleTail ? <span className="text-ink-dim"> {titleTail}</span> : null}
        </Tag>
        {description ? (
          <div className={cn("mt-2.5 max-w-[70ch] text-ink-dim", size === "app" || size === "galileo-small" ? "text-[13px] leading-relaxed" : "text-[13.5px] leading-[1.55]")}>
            {description}
          </div>
        ) : null}
      </div>
      {back || actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {back ? (
            <a
              href={back.href}
              className="inline-flex h-8 items-center gap-1.5 rounded-full! border border-hair px-3.5 text-[12px] font-medium text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              {back.label}
            </a>
          ) : null}
          {actions}
        </div>
      ) : null}
    </header>
  );
}

/* ----------------------------------------------------------------------------- SeriesHead */

/** Editorial series head: title left, mono qualifier right; wraps on mobile. */
export function SeriesHead({ title, sub, as: Tag = "h2", className }: { title: ReactNode; sub: ReactNode; as?: "h2" | "h3"; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 border-b border-hair-soft pb-3", className)}>
      <Tag className="m-0 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</Tag>
      <p className="m-0 font-mono text-[10.5px] uppercase tracking-[0.15em] text-ink-faint">{sub}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- ToolbarSummary */

/** Counts line over a list: "11 projects · 3 live · 83 indexed files". Counts come from data. */
export function ToolbarSummary({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <p className={cn("m-0 text-[13px] text-ink-dim tabular-nums", className)}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 ? (
            <span aria-hidden="true" className="px-1.5 text-ink-faint">
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

/* ----------------------------------------------------------------------------- StatusNote */

/** Partial-data note strip under a toolbar: says what is missing instead of showing zeros. */
export function StatusNote({ notes, className }: { notes: string[]; className?: string }) {
  if (!notes.length) return null;
  return (
    <p role="status" className={cn("m-0 rounded-[9px] border border-org/20 bg-s2 px-3.5 py-[11px] text-[12px] leading-relaxed text-ink-dim", className)}>
      <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-org align-middle" aria-hidden="true" />
      {notes.join(" ")}
    </p>
  );
}
