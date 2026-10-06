// Pill CTAs: the white ink pill and its ghost partner (one primary per page, worded
// "Get started" for the deploy rung), the green mono "Create agent" pill, the mono nav pill,
// galileo's lime Add button and the Machine Speed square mono button. Also the Machine Speed
// CTA block and advisor card that carry the square button. Server-safe: no hooks.
//
// Radius classes carry "!" because the global focus-visible rule sets a 6px radius on
// focused controls and would otherwise square off pills. Disabled and aria-disabled pills
// take no pointer input, so hover never lifts or recolors them.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";

export type PillCtaVariant = "primary" | "ghost" | "green" | "nav" | "lime" | "square";
export type PillCtaSize = "compact" | "md" | "lg";
/** Static preview of an interactive state, for catalogs and docs. */
export type PillCtaPreview = "hover" | "focus";

type Look = {
  /** radius, border width and type treatment */
  frame: string;
  /** colors at rest */
  rest: string;
  /** hover: prefixed utilities, applied live */
  hover: string;
  /** the hover look without the prefix, for a static preview */
  hoverOn: string;
  sizes: Record<PillCtaSize, string>;
};

const LOOKS: Record<PillCtaVariant, Look> = {
  /* white ink pill, black text */
  primary: {
    frame: "rounded-full! border font-semibold tracking-[-0.01em]",
    rest: "border-ink bg-ink text-black",
    hover: "hover:-translate-y-0.5 hover:border-[#e8e8e6] hover:bg-[#e8e8e6] active:translate-y-0",
    hoverOn: "-translate-y-0.5 border-[#e8e8e6] bg-[#e8e8e6] text-black",
    sizes: {
      compact: "gap-2 px-6 py-3 text-[14px]",
      md: "gap-2.5 px-[30px] py-[14px] text-[16px]",
      lg: "gap-2.5 px-[34px] py-4 text-[18px]",
    },
  },
  /* transparent partner, white/40 border */
  ghost: {
    frame: "rounded-full! border font-semibold tracking-[-0.01em]",
    rest: "border-white/40 bg-transparent text-ink",
    hover: "hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/[0.06] active:translate-y-0",
    hoverOn: "-translate-y-0.5 border-white/75 bg-white/[0.06] text-ink",
    sizes: {
      compact: "gap-2 px-6 py-3 text-[14px]",
      md: "gap-2.5 px-[30px] py-[14px] text-[16px]",
      lg: "gap-2.5 px-[34px] py-4 text-[18px]",
    },
  },
  /* marketplace card: green fill, mono uppercase, black text */
  green: {
    frame: "rounded-full! border font-mono font-semibold uppercase tracking-[0.08em]",
    rest: "border-grn bg-grn text-black",
    hover: "hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
    hoverOn: "-translate-y-0.5 border-grn bg-grn text-black brightness-110",
    sizes: {
      compact: "gap-2 px-5 py-2.5 text-[11px]",
      md: "gap-2 px-6 py-3 text-[11.5px]",
      lg: "gap-2 px-7 py-3.5 text-[12.5px]",
    },
  },
  /* top nav: small ink pill, mono uppercase */
  nav: {
    frame: "rounded-full! border font-mono font-medium uppercase tracking-[0.13em]",
    rest: "border-ink bg-ink text-black",
    hover: "hover:-translate-y-px active:translate-y-0",
    hoverOn: "-translate-y-px border-ink bg-ink text-black",
    sizes: {
      compact: "gap-1.5 px-3.5 py-2 text-[10.5px]",
      md: "gap-1.5 px-4 py-2.5 text-[11.5px]",
      lg: "gap-2 px-5 py-3 text-[12px]",
    },
  },
  /* galileo Add: XO lime with dark ink, never white on lime */
  lime: {
    frame: "rounded-[9px]! border font-bold",
    rest: "border-[#83d63a] bg-[#83d63a] text-[#10140d]",
    hover: "hover:-translate-y-0.5 hover:border-[#93e04c] hover:bg-[#93e04c] active:translate-y-0",
    hoverOn: "-translate-y-0.5 border-[#93e04c] bg-[#93e04c] text-[#10140d]",
    sizes: {
      compact: "h-8 gap-1.5 px-4 text-[13px]",
      md: "h-[38px] gap-2 px-5 text-[14px]",
      lg: "h-11 gap-2 px-6 text-[15px]",
    },
  },
  /* Machine Speed: square-ish mono button, hover to pure white */
  square: {
    frame: "rounded-[3px]! border font-mono font-semibold uppercase tracking-[0.07em]",
    rest: "border-[#e9eae6] bg-[#e9eae6] text-[#10120f]",
    hover: "hover:border-white hover:bg-white",
    hoverOn: "border-white bg-white text-[#10120f]",
    sizes: {
      compact: "gap-1.5 px-5 py-3 text-[12px]",
      md: "gap-1.5 px-[30px] py-4 text-[13px]",
      lg: "gap-2 px-9 py-[18px] text-[14px]",
    },
  },
};

const base =
  "relative inline-flex max-w-full shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap leading-[1.2] " +
  "transition-[background-color,border-color,color,transform,filter] duration-150 ease-quirq " +
  "disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60";

const focusOn = "outline-2 outline-offset-3 outline-ink outline-solid";

export type PillCtaLookProps = {
  variant?: PillCtaVariant;
  size?: PillCtaSize;
  /** Stretch to the container (pricing cards, mobile sheets). */
  block?: boolean;
  /** Wide layers CTA: min width 400px, never wider than its container. */
  wide?: boolean;
  /** Show a hover or focus look without interaction. */
  preview?: PillCtaPreview;
  className?: string;
};

/** Class string for any element that should look like a pill CTA. */
export function pillCtaClasses({ variant = "primary", size = "md", block, wide, preview, className }: PillCtaLookProps = {}) {
  const look = LOOKS[variant];
  return cn(
    base,
    look.frame,
    look.sizes[size],
    preview === "hover" ? look.hoverOn : [look.rest, look.hover],
    preview === "focus" && focusOn,
    block && "w-full",
    wide && "min-w-[min(400px,100%)]",
    className,
  );
}

function Arrow({ glyph }: { glyph: ReactNode }) {
  return (
    <span aria-hidden="true" className="inline-flex font-normal leading-none transition-transform duration-150 group-hover/pill:translate-x-0.5">
      {glyph}
    </span>
  );
}

export type PillCtaProps = PillCtaLookProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    /** Icon before the label; replaced by a spinner while busy. */
    leadingIcon?: ReactNode;
    /** Glyph after the label, such as ↗ for an external destination or → for in-app. */
    trailing?: ReactNode;
    /**
     * In flight: spinner, aria-busy and aria-disabled at .6. The button keeps focus, and a
     * click or Enter while busy is swallowed (no second submit). Needs a client parent.
     */
    busy?: boolean;
    /** Label while busy, such as "Adding…". */
    busyLabel?: ReactNode;
  };

/** Swallows activation while busy: no handler runs and no form submits. */
function swallow(e: MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
  e.stopPropagation();
}

/** Pill call to action rendered as a button. */
export function PillCta({
  variant = "primary",
  size = "md",
  block,
  wide,
  preview,
  className,
  leadingIcon,
  trailing,
  busy = false,
  busyLabel,
  disabled,
  type = "button",
  onClick,
  children,
  ...rest
}: PillCtaProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      data-variant={variant}
      onClick={busy ? swallow : onClick}
      className={pillCtaClasses({ variant, size, block, wide, preview, className: cn("group/pill", className) })}
      {...rest}
    >
      {busy ? <Spinner size="sm" label={null} /> : leadingIcon ? <span aria-hidden="true" className="inline-flex [&_svg]:size-4">{leadingIcon}</span> : null}
      <span className="truncate">{busy && busyLabel ? busyLabel : children}</span>
      {trailing && !busy ? <Arrow glyph={trailing} /> : null}
    </button>
  );
}

export type PillCtaLinkProps = PillCtaLookProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    leadingIcon?: ReactNode;
    trailing?: ReactNode;
    /** Opens in a new tab with rel noopener and shows ↗ unless trailing is set. */
    external?: boolean;
    /** Renders without an href and with aria-disabled. */
    disabled?: boolean;
  };

/** Pill call to action rendered as a link. Use for navigation; use PillCta for actions. */
export function PillCtaLink({
  variant = "primary",
  size = "md",
  block,
  wide,
  preview,
  className,
  leadingIcon,
  trailing,
  external,
  disabled,
  href,
  children,
  ...rest
}: PillCtaLinkProps) {
  const glyph = trailing ?? (external ? "↗" : null);
  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      data-variant={variant}
      className={pillCtaClasses({ variant, size, block, wide, preview, className: cn("group/pill no-underline", className) })}
      {...(external && !disabled ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      {...rest}
    >
      {leadingIcon ? <span aria-hidden="true" className="inline-flex [&_svg]:size-4">{leadingIcon}</span> : null}
      <span className="truncate">{children}</span>
      {glyph ? <Arrow glyph={glyph} /> : null}
    </a>
  );
}

/* ----------------------------------------------------------------------------- CtaBlock */

export type CtaBlockProps = {
  /** Headline, sentence case: "Agentic workflows that hand you back ten hours a week." */
  heading: ReactNode;
  /** The single action, typically a square PillCta. */
  action: ReactNode;
  /** Optional mono kicker above the heading. */
  kicker?: ReactNode;
  /** Optional faint line under the action (sample or method note). */
  note?: ReactNode;
  /** Id for the heading; the section is labelled by it. */
  headingId: string;
  /** Heading element; h2 as on the Machine Speed page, lower when nested in a section. */
  headingLevel?: "h2" | "h3" | "h4";
  /** "ms" sets the Machine Speed olive ground; "quirq" sits on the black ground. */
  tone?: "ms" | "quirq";
  className?: string;
};

/** Centered closing call to action: one headline and one button. */
export function CtaBlock({ heading, action, kicker, note, headingId, headingLevel: H = "h2", tone = "ms", className }: CtaBlockProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 rounded-[18px] border px-[clamp(20px,5vw,40px)] pb-[clamp(36px,5vw,56px)] pt-[clamp(40px,6vw,64px)] text-center",
        tone === "ms"
          ? "border-[rgba(233,234,230,0.12)] bg-[#10120f] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] text-[#e9eae6]"
          : "border-hair bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] text-ink",
        className,
      )}
    >
      {kicker ? <p className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8aba3]">{kicker}</p> : null}
      <H id={headingId} className="mx-auto mb-8 max-w-[24ch] text-[clamp(21px,3.2vw,30px)] font-semibold leading-[1.25] tracking-[-0.015em]">
        {heading}
      </H>
      <div className="flex justify-center">{action}</div>
      {/* the note often carries the mock label, so it stays readable (6:1) on the olive ground */}
      {note ? <p className={cn("mt-5 text-[12px]", tone === "ms" ? "text-[#8f928a]" : "text-ink-faint")}>{note}</p> : null}
    </section>
  );
}

/* ----------------------------------------------------------------------------- AdvisorCard */

export type AdvisorCardProps = {
  /** "Work with Mira Okafor" */
  heading: ReactNode;
  /** One line under the heading. */
  tagline: ReactNode;
  action: ReactNode;
  headingId: string;
  /** Heading element; defaults to h3 (a card inside a page section). */
  headingLevel?: "h2" | "h3" | "h4";
  /** Leading avatar or mark. */
  media?: ReactNode;
  className?: string;
};

/** Machine Speed "Work with" card: heading, tagline and one square button. */
export function AdvisorCard({ heading, tagline, action, headingId, headingLevel: H = "h3", media, className }: AdvisorCardProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 rounded-[18px] border border-[rgba(233,234,230,0.12)] bg-[#10120f] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] px-[clamp(20px,4vw,30px)] py-[clamp(24px,4vw,34px)] text-[#e9eae6]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {media}
        <H id={headingId} className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em]">
          {heading}
        </H>
      </div>
      <p className="mb-6 mt-1.5 text-[15px] leading-relaxed text-[#a8aba3]">{tagline}</p>
      {action}
    </section>
  );
}
