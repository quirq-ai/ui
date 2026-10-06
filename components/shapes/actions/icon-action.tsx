// Icon actions: compact square or circle buttons (24 to 40px) and links, always named by
// aria-label and, by default, by a CSS tooltip on hover and focus. Covers pin (aria-pressed
// fills the glyph), reload, open external (a real anchor with target _blank), trash (red
// tint on hover), close circle and the glass back button that floats over media. Also the
// galileo telescope glyphs, drawn from galileo/telescope/index.html. Server-safe: no hooks.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";
import { Tooltip } from "@/components/ui/tooltip";

export type IconActionVariant = "ghost" | "outline" | "solid" | "glass" | "danger";
export type IconActionSize = "xs" | "sm" | "md" | "lg";
/** Static preview of an interactive state, for catalogs and docs. */
export type IconActionPreview = "hover" | "focus";
export type IconPressedTone = "ink" | "yel" | "grn" | "blu";

const SIZES: Record<IconActionSize, string> = {
  xs: "size-6 [&_svg]:size-3.5",
  sm: "size-7 [&_svg]:size-4",
  md: "size-8 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-[18px]",
};

type Look = { rest: string; hover: string; hoverOn: string };

const LOOKS: Record<IconActionVariant, Look> = {
  ghost: {
    rest: "border-transparent bg-transparent text-ink-dim",
    hover: "hover:bg-s3 hover:text-ink",
    hoverOn: "border-transparent bg-s3 text-ink",
  },
  outline: {
    rest: "border-hair bg-transparent text-ink-dim",
    hover: "hover:border-hair-strong hover:bg-s2 hover:text-ink",
    hoverOn: "border-hair-strong bg-s2 text-ink",
  },
  solid: {
    rest: "border-hair bg-s2 text-ink",
    hover: "hover:border-hair-strong hover:bg-s3",
    hoverOn: "border-hair-strong bg-s3 text-ink",
  },
  glass: {
    rest: "border-hair-strong bg-[rgba(30,30,32,0.72)] text-ink backdrop-blur-md",
    hover: "hover:bg-[rgba(52,52,56,0.82)]",
    hoverOn: "border-hair-strong bg-[rgba(52,52,56,0.82)] text-ink backdrop-blur-md",
  },
  danger: {
    rest: "border-transparent bg-transparent text-ink-dim",
    hover: "hover:bg-red/[0.12] hover:text-[#ff7a70]",
    hoverOn: "border-transparent bg-red/[0.12] text-[#ff7a70]",
  },
};

/* pressed replaces the variant colors so no utilities compete; the glyph fills */
const PRESSED: Record<IconPressedTone, string> = {
  ink: "border-hair-strong bg-s3 text-ink hover:bg-s4 [&_svg]:fill-current",
  yel: "border-yel/30 bg-yel/10 text-yel hover:bg-yel/15 [&_svg]:fill-current",
  grn: "border-grn/30 bg-grn/10 text-grn hover:bg-grn/15 [&_svg]:fill-current",
  blu: "border-blu/30 bg-blu/12 text-blu hover:bg-blu/20 [&_svg]:fill-current",
};

const focusOn = "outline-2 outline-offset-3 outline-ink outline-solid";

export type IconActionLookProps = {
  variant?: IconActionVariant;
  size?: IconActionSize;
  shape?: "square" | "circle";
  /** Toggle state (pin, star, mute): fills the glyph and, on buttons, sets aria-pressed. */
  pressed?: boolean;
  pressedTone?: IconPressedTone;
  preview?: IconActionPreview;
  className?: string;
};

/** Class string for any element that should look like an icon action. */
export function iconActionClasses({
  variant = "ghost",
  size = "md",
  shape = "square",
  pressed,
  pressedTone = "ink",
  preview,
  className,
}: IconActionLookProps = {}) {
  const look = LOOKS[variant];
  return cn(
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center border transition-[background-color,border-color,color] duration-150",
    "disabled:pointer-events-none disabled:opacity-35 aria-disabled:pointer-events-none aria-disabled:opacity-35",
    shape === "circle" ? "rounded-full!" : size === "lg" ? "rounded-[10px]!" : "rounded-[8px]!",
    SIZES[size],
    pressed ? PRESSED[pressedTone] : preview === "hover" ? look.hoverOn : [look.rest, look.hover],
    preview === "focus" && focusOn,
    className,
  );
}

type Shared = IconActionLookProps & {
  /** Names the action for screen readers and fills the tooltip: "Reload this source". */
  label: string;
  /** The glyph, typically a 16px lucide icon. */
  icon: ReactNode;
  /** Tooltip placement; false hides the tooltip (the label still names the control). */
  tip?: "top" | "bottom" | false;
  tipAlign?: "center" | "start" | "end";
  /** Small key badge in the corner, such as "E" for a touch key. */
  keyHint?: string;
  busy?: boolean;
};

function Glyph({ icon, busy, keyHint }: { icon: ReactNode; busy?: boolean; keyHint?: string }) {
  return (
    <>
      {busy ? <Spinner size="sm" label={null} /> : <span aria-hidden="true" className="inline-flex">{icon}</span>}
      {keyHint ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-[4px] border border-hair-strong bg-s3 px-1 font-mono text-[9px] leading-none text-ink-dim"
        >
          {keyHint}
        </span>
      ) : null}
    </>
  );
}

function withTip(node: ReactNode, label: string, tip: Shared["tip"], align: Shared["tipAlign"]) {
  if (tip === false) return node;
  return (
    <Tooltip content={label} placement={tip ?? "top"} align={align ?? "center"} describe={false}>
      {node}
    </Tooltip>
  );
}

export type IconActionProps = Shared & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "aria-label">;

/** Compact icon button. Named by label; shows it as a tooltip unless tip is false. */
export function IconAction({
  label,
  icon,
  variant,
  size,
  shape,
  pressed,
  pressedTone,
  preview,
  tip,
  tipAlign,
  keyHint,
  busy,
  disabled,
  type = "button",
  className,
  ...rest
}: IconActionProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      aria-busy={busy || undefined}
      disabled={disabled}
      className={iconActionClasses({ variant, size, shape, pressed, pressedTone, preview, className })}
      {...rest}
    >
      <Glyph icon={icon} busy={busy} keyHint={keyHint} />
    </button>
  );
  return withTip(button, label, tip, tipAlign);
}

export type IconActionLinkProps = Shared &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "aria-label"> & {
    /** New tab with rel noopener. */
    external?: boolean;
    /** No href, aria-disabled, out of the tab order, .35 opacity. */
    disabled?: boolean;
  };

/** Icon link, such as "Open this source in a tab of its own". */
export function IconActionLink({
  label,
  icon,
  variant,
  size,
  shape,
  pressed,
  pressedTone,
  preview,
  tip,
  tipAlign,
  keyHint,
  busy,
  external,
  disabled,
  href,
  className,
  ...rest
}: IconActionLinkProps) {
  const link = (
    <a
      aria-label={label}
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={iconActionClasses({ variant, size, shape, pressed, pressedTone, preview, className })}
      {...(external && !disabled ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      {...rest}
    >
      <Glyph icon={icon} busy={busy} keyHint={keyHint} />
    </a>
  );
  return withTip(link, label, tip, tipAlign);
}

/* ----------------------------------------------------------------------------- galileo glyphs */

const glyphProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** galileo reload: circular arrow. */
export function ReloadGlyph({ className }: { className?: string }) {
  return (
    <svg {...glyphProps} className={className}>
      <path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" />
    </svg>
  );
}

/** galileo open external: box with an arrow out of its corner. */
export function OpenExternalGlyph({ className }: { className?: string }) {
  return (
    <svg {...glyphProps} className={className}>
      <path d="M9.5 3H13v3.5M13 3 7.5 8.5M11 9.5V13H3V5h3.5" />
    </svg>
  );
}
