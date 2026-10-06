// quirq identity pieces: the wordmark at its fixed sizes, the q mark, the nav lockup that
// links home, the favicon tile, the ghost q used behind visualizations, and the word set in
// spectrum text. White on black, never recolored except the spectrum word. "quirq" is always
// lowercase. Server-safe.
import type { AnchorHTMLAttributes, CSSProperties } from "react";
import { Mark, Wordmark } from "@/components/brand/mark";
import { cn } from "@/lib/cn";

/** The bare q glyph from the favicon and the Space Drift sprite (100 x 132 box). */
export const QUIRQ_Q_PATH =
  "M50 0A50 50 0 0 1 100 50V118A14 14 0 0 1 86 132A14 14 0 0 1 72 118V94.87A50 50 0 1 1 50 0ZM50 33A17 17 0 1 0 50 67A17 17 0 1 0 50 33Z";

export type QuirqWordmarkSize = "hero" | "footer" | number;

/**
 * The quirq wordmark. "hero" is fluid (min(280px, 58%) of its column), "footer" is 130px
 * wide, a number sets the height in px.
 */
export function QuirqWordmark({ size = "footer", className, title = "quirq" }: { size?: QuirqWordmarkSize; className?: string; title?: string }) {
  if (size === "hero") return <Wordmark title={title} className={cn("h-auto w-[min(280px,58%)] text-white", className)} />;
  if (size === "footer") return <Wordmark title={title} className={cn("h-auto w-[130px] text-white", className)} />;
  return <Wordmark title={title} height={size} className={cn("text-white", className)} />;
}

/** The q mark inside its 5px ring. Decorative unless a title is given. */
export function QuirqMark({ size = 72, title, className, style }: { size?: number; title?: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={cn("inline-flex text-white", className)} style={style}>
      <Mark size={size} title={title} />
    </span>
  );
}

export type NavLockupProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  /** Destination, home by default. */
  href?: string;
  /** Mark size in px; the nav uses 26. */
  size?: number;
  /** Word size in px; follows the mark (19 beside the 26px mark) unless set. */
  textSize?: number;
  label?: string;
};

/** Nav lockup: 26px mark plus Quicksand 19px "quirq", a link home named "quirq home". */
export function NavLockup({ href = "/", size = 26, textSize, label = "quirq", className, ...rest }: NavLockupProps) {
  return (
    <a
      href={href}
      aria-label={`${label} home`}
      className={cn("inline-flex items-center gap-2.5 rounded-[6px] text-white no-underline", className)}
      {...rest}
    >
      <Mark size={size} />
      <span className="font-round font-semibold leading-none tracking-[0.01em]" style={{ fontSize: textSize ?? Math.round((size * 19) / 26) }}>
        {label}
      </span>
    </a>
  );
}

/** Favicon tile: black rounded square with the off-white q, from landing/public/favicon.svg. */
export function QuirqFavicon({ size = 32, title = "quirq", className }: { size?: number; title?: string | null; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      <rect width="64" height="64" rx="14" fill="#000" />
      <path transform="translate(15,9) scale(0.34)" fill="#f4f3f0" d={QUIRQ_Q_PATH} />
    </svg>
  );
}

/** The q mark at 21% behind a visualization: texture, never information. */
export function GhostMark({ size = 220, opacity = 0.21, className }: { size?: number; opacity?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none inline-flex text-white", className)} style={{ opacity }}>
      <Mark size={size} />
    </span>
  );
}

/** "quirq" set in Quicksand with the spectrum as text fill, as on the whitepaper meter card. */
export function SpectrumWord({ children = "quirq", size = 28, className }: { children?: string; size?: number; className?: string }) {
  return (
    <span className={cn("spec-text font-round font-semibold leading-none tracking-[0.005em]", className)} style={{ fontSize: size }}>
      {children}
    </span>
  );
}
