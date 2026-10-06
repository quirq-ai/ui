// Numbered and hairline lists. Server-safe, no hooks.
//   ReadingList: zero padded ordinals, title, Start here badge, read time, a ↗ circle; rows are links.
//   PlanList: counter numbered steps with a bold lead sentence, hairlines between.
//   HairlineList and HairlineGrid: the gap-px trick for perfect 1px dividers in any grid.
//   FeatureDotList: a saturated dot, a mono uppercase title and one line of copy.
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneBg, toneText, type Tone } from "@/components/ui/tones";

/** 1 -> "01". */
export function ordinal(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

/* ----------------------------------------------------------------------------- ReadingList */

export type ReadingItem = {
  title: string;
  desc: string;
  /** "2 min" */
  read: string;
  date?: string;
  /** the first guide in reading order */
  start?: boolean;
  href: string;
};

export type ReadingListProps = {
  items: ReadingItem[];
  /** Intercept a row (demos); default follows the link. */
  onOpen?: (item: ReadingItem, e: MouseEvent<HTMLAnchorElement>) => void;
  /** Paint one row in its hover look (static demos). */
  hoverIndex?: number;
  /** Starting ordinal. */
  start?: number;
  label?: string;
  className?: string;
};

/** Guides in reading order. Each row is one link. */
export function ReadingList({ items, onOpen, hoverIndex, start = 1, label = "Guides in reading order", className }: ReadingListProps) {
  return (
    <ol aria-label={label} className={cn("border-b border-hair", className)}>
      {items.map((g, i) => (
        <li key={g.href}>
          <a
            href={g.href}
            onClick={onOpen ? (e) => onOpen(g, e) : undefined}
            className={cn(
              "group/r grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-4 rounded-none! border-t border-hair px-3 py-5 transition-colors hover:bg-white/[0.025] sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-x-5",
              hoverIndex === i && "bg-white/[0.025]",
            )}
          >
            <span aria-hidden="true" className="self-start pt-[3px] font-mono text-[11px] text-ink-faint">
              {ordinal(start + i)}
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2.5">
                <span className="text-[16.5px] font-semibold tracking-[-0.01em] text-ink">{g.title}</span>
                {g.start ? (
                  <span className="rounded-[3px] border border-grn/30 px-2 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.14em] text-grn">Start here</span>
                ) : null}
              </span>
              <span className="mt-1 block text-[13.5px] leading-[1.55] text-ink-dim">{g.desc}</span>
            </span>
            <span className="flex items-center gap-6">
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint md:block">{g.read}</span>
              {g.date ? <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint md:block">{g.date}</span> : null}
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-[26px] items-center justify-center rounded-full border border-hair text-[11px] text-ink-dim transition-colors group-hover/r:border-white/30 group-hover/r:text-ink",
                  hoverIndex === i && "border-white/30 text-ink",
                )}
              >
                ↗
              </span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------------------- PlanList */

export type PlanItem = { lead: string; body: ReactNode };

/** Numbered plan in a reading column: counter, bold lead, body. */
export function PlanList({ items, label, className }: { items: PlanItem[]; label?: string; className?: string }) {
  return (
    <ol aria-label={label} className={cn("max-w-[660px] border-b border-hair", className)}>
      {items.map((s, i) => (
        <li key={s.lead} className="relative border-t border-hair py-5 pl-14 text-[15px] leading-[1.75] text-ink-dim">
          <span aria-hidden="true" className="absolute left-0 top-[22px] font-mono text-[13px] text-ink-faint">
            {i + 1}
          </span>
          <b className="mb-0.5 block font-semibold text-ink">{s.lead}</b>
          {s.body}
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------------------- Hairline */

export type HairlineItem = { title: string; note: ReactNode };

const stagger = (i: number, reveal: boolean): CSSProperties | undefined => (reveal ? { animationDelay: `${0.06 * i}s` } : undefined);

/** Ordered list with gap-px hairlines: 01 Title, note. */
export function HairlineList({ items, reveal = false, label, className }: { items: HairlineItem[]; reveal?: boolean; label?: string; className?: string }) {
  return (
    <ol aria-label={label} className={cn("grid gap-px overflow-hidden rounded-[16px] border border-hair-soft bg-white/[0.06]", className)}>
      {items.map((b, i) => (
        <li key={b.title} className={cn("flex gap-5 bg-[#0f0f11] px-[clamp(18px,3vw,28px)] py-5", reveal && "rise")} style={stagger(i, reveal)}>
          <span aria-hidden="true" className="mt-1 font-mono text-[10px] text-ink-faint">
            {ordinal(i + 1)}
          </span>
          <div className="min-w-0">
            <b className="text-[15px] font-semibold text-ink">{b.title}</b>
            <p className="mt-1 text-[13.5px] leading-[1.7] text-ink-dim">{b.note}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export type HairlineCell = { kicker: string; note: ReactNode; tone?: Tone };

/** Grid of cells with perfect 1px dividers: 1 column, 2 from sm, 4 from lg. */
export function HairlineGrid({ cells, reveal = false, label, className }: { cells: HairlineCell[]; reveal?: boolean; label?: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn("grid gap-px overflow-hidden rounded-[16px] border border-hair-soft bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cells.map((t, i) => (
        <li key={t.kicker} className={cn("bg-[#0f0f11] px-6 py-6", reveal && "rise")} style={stagger(i, reveal)}>
          <div className={cn("mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.18em]", t.tone ? toneText[t.tone] : "text-ink-dim")}>{t.kicker}</div>
          <p className="text-[13.5px] leading-[1.7] text-ink-dim">{t.note}</p>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- FeatureDotList */

export type FeatureDot = { title: string; copy: ReactNode; tone: Exclude<Tone, "neutral"> };

/** Saturated dot, mono uppercase title, one line of copy. */
export function FeatureDotList({ items, className }: { items: FeatureDot[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-[30px]", className)}>
      {items.map((f) => (
        <li key={f.title} className="grid grid-cols-[34px_minmax(0,1fr)] items-start">
          <span aria-hidden="true" className={cn("mt-[5px] size-4 rounded-full", toneBg[f.tone])} />
          <div>
            <b className="block font-mono text-[14px] font-semibold uppercase tracking-[0.12em] text-ink">{f.title}</b>
            <p className="mt-2 text-[15.5px] leading-[1.5] text-ink-dim">{f.copy}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
