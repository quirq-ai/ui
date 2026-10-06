// Quiet secondary navigation with arrows. Server-safe; every hover is CSS.
//  ArrowLink   text + → (in-app), ↗ (external) or ‹ (back); the arrow nudges 4px on hover
//  CircleArrow 22 or 26px circled ↗ for reading lists and linked cards
//  LinkedCard  a card that is a link; its diagonal arrow fades in on hover
//  RungStrip   2, 3 or 4 rung cells with a colored mono number; stacks with top hairlines
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneText, type Tone } from "@/components/ui/tones";

/** 12 to 14px line arrows, stroke 1.5, round caps. */
export function ArrowGlyph({ dir, size = 13, className }: { dir: "right" | "up-right" | "left"; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true" className={cn("shrink-0", className)}>
      {dir === "right" ? (
        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : dir === "up-right" ? (
        <path d="M4 10 10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 3 5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** text: dim 16px sentence; mono: uppercase 11px; underline: external with a hairline underline; back: mono with a leading chevron. */
  variant?: "text" | "mono" | "underline" | "back";
  /** Opens in a new tab and shows ↗ instead of →. */
  external?: boolean;
  /** Static hover look, for state samples. */
  hovered?: boolean;
  className?: string;
};

/** "Read the research →", "Open →", "Canonical version ↗", "‹ Research". */
export function ArrowLink({ href, children, variant = "text", external = false, hovered = false, className }: ArrowLinkProps) {
  const back = variant === "back";
  const dir = back ? "left" : external ? "up-right" : "right";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      className={cn(
        "group/al inline-flex items-center gap-2 transition-colors duration-200",
        variant === "text" && "text-[16px] tracking-[-0.01em]",
        (variant === "mono" || back) && "font-mono text-[11px] uppercase tracking-[0.14em]",
        variant === "underline" && "text-[14px] underline decoration-hair-strong underline-offset-4",
        back && "flex-row-reverse",
        hovered ? "text-ink" : variant === "underline" ? "text-ink-dim hover:text-ink hover:decoration-ink" : "text-white/50 hover:text-ink",
        className,
      )}
    >
      <span>{children}</span>
      <ArrowGlyph
        dir={dir}
        size={variant === "text" ? 14 : 12}
        className={cn(
          "transition-transform duration-200 ease-quirq",
          back
            ? hovered
              ? "-translate-x-1"
              : "group-hover/al:-translate-x-1"
            : external
              ? hovered
                ? "translate-x-1 -translate-y-px"
                : "group-hover/al:translate-x-1 group-hover/al:-translate-y-px"
              : hovered
                ? "translate-x-1"
                : "group-hover/al:translate-x-1",
        )}
      />
      {external ? <span className="sr-only">(opens in a new tab)</span> : null}
    </a>
  );
}

/** Circled ↗ (26 or 22px). Decorative inside a link that already names the destination. */
export function CircleArrow({ size = 26, className }: { size?: 22 | 26; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-hair-strong text-ink-dim transition-[border-color,color] duration-200 group-hover:border-white/30 group-hover:text-ink",
        size === 26 ? "size-[26px]" : "size-[22px]",
        className,
      )}
    >
      <ArrowGlyph dir="up-right" size={size === 26 ? 12 : 11} />
    </span>
  );
}

export type LinkedCardProps = {
  href: string;
  kicker: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  external?: boolean;
  className?: string;
};

/** A whole card as one link. The diagonal arrow appears on hover and focus. */
export function LinkedCard({ href, kicker, title, meta, external, className }: LinkedCardProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      className={cn(
        "group relative flex min-w-0 flex-col gap-2 rounded-[14px]! border border-hair-soft bg-[#0f0f11] p-5 transition-colors hover:border-white/20",
        className,
      )}
    >
      <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-faint">{kicker}</span>
      <span className="pr-8 text-[15.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">{title}</span>
      {meta ? <span className="text-[12.5px] text-ink-dim">{meta}</span> : null}
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 text-ink-dim opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <ArrowGlyph dir="up-right" size={14} />
      </span>
      {external ? <span className="sr-only">(opens in a new tab)</span> : null}
    </a>
  );
}

/** Hairlines between rungs: stacked rows get a top rule, side-by-side cells a left rule. */
function rungBorder(i: number, columns: 2 | 3 | 4): string {
  if (i === 0) return "";
  if (columns !== 4 || i === 1) return "border-t @[640px]:border-t-0 @[640px]:border-l";
  if (i === 2) return "border-t @[880px]:border-t-0 @[880px]:border-l";
  return "border-t @[640px]:border-l @[880px]:border-t-0";
}

export type Rung = { num: string; title: string; desc: string; href: string; tone: Tone };

/** Rung strip: numbered link cells with hairline dividers. Stacks under 640px of frame width. */
export function RungStrip({ rungs, columns = 3, "aria-label": ariaLabel, className }: { rungs: Rung[]; columns?: 2 | 3 | 4; "aria-label": string; className?: string }) {
  return (
    <nav aria-label={ariaLabel} className={cn("@container", className)}>
      <ul
        className={cn(
          "grid border-y border-hair",
          columns === 2 && "@[640px]:grid-cols-2",
          columns === 3 && "@[640px]:grid-cols-3",
          columns === 4 && "@[640px]:grid-cols-2 @[880px]:grid-cols-4",
        )}
      >
        {rungs.map((r, i) => (
          <li
            key={r.num}
            className={cn("min-w-0 border-hair", rungBorder(i, columns))}
          >
            <a href={r.href} className="flex h-full flex-col gap-1.5 rounded-none! px-5 py-6 transition-colors hover:bg-white/[0.02] focus-visible:outline-offset-[-2px]!">
              <span className={cn("font-mono text-[11px] tabular-nums", toneText[r.tone])}>{r.num}</span>
              <b className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{r.title}</b>
              <span className="text-[13px] text-ink-dim">{r.desc}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
