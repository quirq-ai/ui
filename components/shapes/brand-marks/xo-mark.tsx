// XO product identity: two chevron pairs, the outer (X) pair in ink and the inner (O) pair
// in XO lime #83d63a. Dark, light and themed colorways, the lime glow, the product lockup
// ("XO Space · ops-copilot") with a ringed status dot, galileo's heavier favicon tile and bar
// lockup, and the muted breadcrumb home mark. Polylines from xo-space/brand/xo-logo.svg.
// Server-safe.
import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const XO_LIME = "#83d63a";
/** Light-surface lime, darkened for contrast on white (about 7:1). */
export const XO_LIME_LIGHT = "hsl(92, 60%, 28%)";

/** The four chevrons on the 500 grid. */
const CHEVRONS = {
  x1: "36.99 165.84 118.47 247.31 31.16 334.61",
  x2: "244.91 165.84 163.44 247.31 250.74 334.61",
  o1: "328.12 165.06 246.65 246.53 333.95 333.84",
  o2: "380.51 165.06 461.99 246.53 374.68 333.84",
};

/** The four polylines, outer pair then inner pair, on the 500 grid. Reused by every mark. */
export function XOChevrons({ outer, inner, strokeWidth = 15.38 }: { outer: string; inner: string; strokeWidth?: number }) {
  return (
    <g fill="none" strokeWidth={strokeWidth} strokeMiterlimit="10">
      <polyline stroke={outer} points={CHEVRONS.x1} />
      <polyline stroke={outer} points={CHEVRONS.x2} />
      <polyline stroke={inner} points={CHEVRONS.o1} />
      <polyline stroke={inner} points={CHEVRONS.o2} />
    </g>
  );
}

export type XOVariant = "dark" | "light" | "themed";

const COLORWAY: Record<XOVariant, { outer: string; inner: string }> = {
  dark: { outer: "#ffffff", inner: XO_LIME },
  light: { outer: "#08090A", inner: XO_LIME_LIGHT },
  /* Neon, Midnight, Graphite and Linen themes: every polyline takes the theme ink. */
  themed: { outer: "currentColor", inner: "currentColor" },
};

export type XOLogoProps = {
  /** Height in px; width follows the cropped 460 : 190 box. */
  height?: number;
  variant?: XOVariant;
  /** Default space-ui glow: drop-shadow 0 0 9px rgba(131,214,58,.35). Never on themed. */
  glow?: boolean;
  /** "brand" is the 15.38 source stroke; "chrome" is the 26 stroke space-ui uses at 14px. */
  weight?: "brand" | "chrome";
  /** Accessible name; null when a visible label sits beside the mark. */
  title?: string | null;
  className?: string;
};

/** The XO mark, cropped to its chevrons. */
export function XOLogo({ height = 20, variant = "dark", glow = false, weight = "brand", title = "XO", className }: XOLogoProps) {
  const c = COLORWAY[variant];
  const sw = weight === "chrome" ? 26 : 15.38;
  const style: CSSProperties | undefined =
    glow && variant !== "themed" ? { filter: "drop-shadow(0 0 9px rgba(131, 214, 58, 0.35))" } : undefined;
  return (
    <svg
      height={height}
      width={(height * 460) / 190}
      viewBox="20 155 460 190"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0 overflow-visible", className)}
      style={style}
    >
      <XOChevrons outer={c.outer} inner={c.inner} strokeWidth={sw} />
    </svg>
  );
}

/** The XO mark on its full 500 x 500 square, as swarm's xo.svg and xo-light.svg ship it. */
export function XOSquare({ size = 28, variant = "dark", title = "XO", className }: { size?: number; variant?: Exclude<XOVariant, "themed">; title?: string | null; className?: string }) {
  const c = COLORWAY[variant];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      <XOChevrons outer={c.outer} inner={c.inner} />
    </svg>
  );
}

/** galileo's favicon: the mark on #0e110c with heavier round strokes so it reads at tab size. */
export function GalileoTile({ size = 22, title = null, className }: { size?: number; title?: string | null; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      <rect width="500" height="500" rx="112" fill="#0e110c" />
      <g fill="none" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
        <polyline stroke="#eef2ea" points="56 170 128 248 50 326" />
        <polyline stroke="#eef2ea" points="238 170 166 248 244 326" />
        <polyline stroke={XO_LIME} points="322 170 250 248 328 326" />
        <polyline stroke={XO_LIME} points="372 170 444 248 366 326" />
      </g>
    </svg>
  );
}

export type LockupStatus = "up" | "busy" | "warn" | "down" | "idle";

/** Default spoken label per dot, in the space lifecycle words. */
const STATUS_LABEL: Record<LockupStatus, string> = {
  up: "Running",
  busy: "Starting",
  warn: "Needs attention",
  down: "Space could not start",
  idle: "Stopped",
};

const STATUS_COLOR: Record<LockupStatus, string> = {
  up: "var(--grn)",
  busy: "var(--blu)",
  warn: "var(--org)",
  down: "var(--red)",
  idle: "var(--ink-faint)",
};

export type XOProductLockupProps = {
  /** Product word beside the mark: Space, Swarm, Cowork. Custom branding replaces it. */
  product?: string;
  /** Optional context after a middle dot, such as the space name. */
  context?: string;
  /** Ringed status dot after the context. */
  status?: LockupStatus;
  /** Spoken label for the dot; defaults to the lifecycle word (up reads "Running"). */
  statusLabel?: string;
  variant?: XOVariant;
  glow?: boolean;
  /** Custom uploaded logo in place of the mark (space branding). */
  customLogo?: ReactNode;
  /** Theme font for the product word (Poppins SemiBold under Neon and Midnight). */
  brandFont?: string;
  className?: string;
};

/**
 * "[XO] Space · ops-copilot ●": the space-ui topbar brand. A baseline row with a 10px gap; the
 * 34 x 14 chrome mark centers itself on the 18px/600 word, and the context reads 11px upper.
 */
export function XOProductLockup({
  product = "Space",
  context,
  status,
  statusLabel,
  variant = "dark",
  glow = variant === "dark",
  customLogo,
  brandFont,
  className,
}: XOProductLockupProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-baseline gap-2.5 whitespace-nowrap", className)}>
      <span className="flex shrink-0 items-center self-center">
        {customLogo ?? <XOLogo height={14} weight="chrome" variant={variant} glow={glow} title={null} />}
      </span>
      <b
        className="min-w-0 truncate text-[18px] font-[600] leading-none tracking-[-0.01em]"
        style={brandFont ? { fontFamily: brandFont } : undefined}
        title={product}
      >
        {product}
      </b>
      {context ? (
        <>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span className="truncate text-[11px] uppercase tracking-[0.06em] opacity-70">{context}</span>
        </>
      ) : null}
      {status ? (
        <span
          role="img"
          aria-label={statusLabel ?? STATUS_LABEL[status]}
          className="size-[7px] shrink-0 self-center rounded-full"
          style={{ background: STATUS_COLOR[status], boxShadow: `0 0 0 3px color-mix(in srgb, ${STATUS_COLOR[status]} 22%, transparent)` }}
        />
      ) : null}
    </span>
  );
}

export type GalileoBrandLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  /** Hide the word and keep the icon (galileo does this under 640px). */
  iconOnly?: boolean;
};

/** galileo bar lockup: 22px tile (radius 6) + "galileo" in lime 750, gap 8px, lime focus ring. */
export function GalileoBrandLink({ href = "/sources", iconOnly = false, className, ...rest }: GalileoBrandLinkProps) {
  return (
    <a
      href={href}
      title="galileo: the Sources page"
      aria-label={iconOnly ? "galileo, Sources" : undefined}
      className={cn(
        "inline-flex flex-none items-center gap-2 rounded-[6px] font-[750] tracking-[-0.02em] text-[#eef2ea] no-underline",
        /* "!" so the lime ring beats the global ink focus outline */
        "focus-visible:outline-[#83d63a]! focus-visible:outline-offset-2!",
        className,
      )}
      {...rest}
    >
      <GalileoTile size={22} className="rounded-[6px]" />
      {iconOnly ? null : <span className="text-[15px] text-[#83d63a]">galileo</span>}
    </a>
  );
}

export type BreadcrumbHomeMarkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  /** full: always 100%. muted-hover: 55% until the link is hovered or focused. */
  tone?: "full" | "muted-hover";
  /** Light app theme swaps in the light colorway. */
  theme?: "dark" | "light";
  /** Square size in px; the swarm header uses 28. */
  size?: number;
};

/** swarm breadcrumb home: the 28px XO square, muted to 55% until hover or focus. */
export function BreadcrumbHomeMark({ href = "/", tone = "muted-hover", theme = "dark", size = 28, className, ...rest }: BreadcrumbHomeMarkProps) {
  return (
    <a href={href} aria-label="Home" className={cn("group inline-flex items-center rounded-[6px]", className)} {...rest}>
      <span
        className={cn(
          "inline-flex shrink-0 transition-opacity duration-200",
          tone === "full" ? "opacity-100" : "opacity-[0.55] group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
      >
        <XOSquare size={size} variant={theme} title={null} />
      </span>
    </a>
  );
}
