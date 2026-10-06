// Buttons: Button (pill CTA, ghost pill, app buttons, danger, link), ButtonLink (same looks on
// an anchor), IconButton (icon only, aria-label required) and ButtonGroup (spaced or joined).
// Server-safe. Radius classes carry "!" because the global focus-visible rule sets a 6px
// radius on focused controls and would otherwise square off pills.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "./loaders";
import { Tooltip } from "./tooltip";

export type ButtonVariant = "primary" | "ghost" | "secondary" | "subtle" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap border font-medium " +
  "transition-[background-color,border-color,color,transform,opacity] duration-150 ease-quirq " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  /* white ink pill, black text: one per page */
  primary:
    "rounded-full! border-ink bg-ink font-semibold tracking-[-0.01em] text-black hover:-translate-y-0.5 hover:border-[#e8e8e6] hover:bg-[#e8e8e6] active:translate-y-0",
  /* transparent pill partner to primary */
  ghost:
    "rounded-full! border-white/40 bg-transparent font-semibold tracking-[-0.01em] text-ink hover:border-white/75 hover:bg-white/[0.06]",
  /* app button on s2 with a hairline */
  secondary: "rounded-[8px]! border-hair bg-s2 text-ink hover:border-hair-strong hover:bg-s3",
  /* quiet app action: no chrome until hover */
  subtle: "rounded-[8px]! border-transparent bg-transparent text-ink-dim hover:bg-s3 hover:text-ink",
  /* destructive: red tint, never a solid red slab */
  danger: "rounded-[8px]! border-red/45 bg-red/[0.08] text-[#ff7a70] hover:border-red/70 hover:bg-red/15",
  /* inline text action with a trailing arrow */
  link: "rounded-[4px]! border-transparent bg-transparent p-0 text-ink underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 text-[12px] [&_svg]:size-3.5",
  md: "h-8 gap-2 text-[13px] [&_svg]:size-4",
  lg: "h-11 gap-2.5 text-[15px] [&_svg]:size-[18px]",
};

/* Padding lives apart from size so no two px utilities ever compete (there is no class
   merging here). Pills get more horizontal room than app buttons at the same height. */
const appPad: Record<ButtonSize, string> = { sm: "px-2.5", md: "px-3.5", lg: "px-6" };
const pillPad: Record<ButtonSize, string> = { sm: "px-3.5", md: "px-[18px]", lg: "px-[30px]" };
const linkSizes: Record<ButtonSize, string> = {
  sm: "h-auto gap-1 text-[12px] [&_svg]:size-3.5",
  md: "h-auto gap-1.5 text-[13px] [&_svg]:size-4",
  lg: "h-auto gap-2 text-[15px] [&_svg]:size-[18px]",
};

/** Class string for any element that should look like a Button (anchors, summary, labels). */
export function buttonClasses({
  variant = "secondary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  const isPill = variant === "primary" || variant === "ghost";
  return cn(
    base,
    variants[variant],
    variant === "link" ? linkSizes[size] : [sizes[size], isPill ? pillPad[size] : appPad[size]],
    block && "w-full",
    className,
  );
}

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label; replaced by a spinner while loading. */
  leadingIcon?: ReactNode;
  /** Icon after the label. The link variant shows an arrow by default; pass null to drop it. */
  trailingIcon?: ReactNode;
  /** Busy: shows a spinner, sets aria-busy and blocks a second submit. */
  loading?: boolean;
  /** Label to show while loading, such as "Creating…". */
  loadingLabel?: ReactNode;
  /** Stretch to the container width. */
  block?: boolean;
};

export type ButtonProps = ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>;

function Inner({
  variant,
  size,
  leadingIcon,
  trailingIcon,
  loading,
  loadingLabel,
  children,
}: ButtonOwnProps & { children?: ReactNode }) {
  const trailing = trailingIcon === undefined && variant === "link" ? <ArrowRight aria-hidden="true" /> : trailingIcon;
  const spinnerSize = size === "lg" ? "md" : size === "sm" ? "xs" : "sm";
  return (
    <>
      {loading ? <Spinner size={spinnerSize} label={null} /> : leadingIcon ? <span className="inline-flex" aria-hidden="true">{leadingIcon}</span> : null}
      {loading && loadingLabel ? loadingLabel : children}
      {trailing ? <span className="inline-flex transition-transform duration-150 group-hover/btn:translate-x-0.5" aria-hidden="true">{trailing}</span> : null}
    </>
  );
}

/** App and marketing button. Defaults to type="button" so it never submits by accident. */
export function Button({
  variant = "secondary",
  size = "md",
  leadingIcon,
  trailingIcon,
  loading = false,
  loadingLabel,
  block,
  className,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, block, className: cn("group/btn", loading && "cursor-wait", className) })}
      {...rest}
    >
      <Inner variant={variant} size={size} leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading} loadingLabel={loadingLabel}>
        {children}
      </Inner>
    </button>
  );
}

export type ButtonLinkProps = Omit<ButtonOwnProps, "loading" | "loadingLabel"> &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** Marks an external destination: adds rel noopener and a ↗ arrow when no trailing icon is set. */
    external?: boolean;
  };

/** A link that looks like a Button. Use for navigation; use Button for actions. */
export function ButtonLink({
  variant = "secondary",
  size = "md",
  leadingIcon,
  trailingIcon,
  block,
  external,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const trailing = trailingIcon === undefined && external ? <span className="text-[0.95em] leading-none">↗</span> : trailingIcon;
  return (
    <a
      className={buttonClasses({ variant, size, block, className: cn("group/btn", className) })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      {...rest}
    >
      <Inner variant={variant} size={size} leadingIcon={leadingIcon} trailingIcon={trailing}>
        {children}
      </Inner>
    </a>
  );
}

/* ----------------------------------------------------------------------------- IconButton */

export type IconButtonVariant = "ghost" | "outline" | "solid" | "glass" | "danger";
export type IconButtonSize = "xs" | "sm" | "md" | "lg";

const iconSizes: Record<IconButtonSize, string> = {
  xs: "size-6 [&_svg]:size-3.5",
  sm: "size-7 [&_svg]:size-4",
  md: "size-8 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-[18px]",
};

const iconVariants: Record<IconButtonVariant, string> = {
  ghost: "border-transparent bg-transparent text-ink-dim hover:bg-s3 hover:text-ink",
  outline: "border-hair bg-transparent text-ink-dim hover:border-hair-strong hover:bg-s2 hover:text-ink",
  solid: "border-hair bg-s2 text-ink hover:border-hair-strong hover:bg-s3",
  glass: "border-hair-strong bg-[rgba(30,30,32,0.72)] text-ink backdrop-blur-md hover:bg-[rgba(48,48,52,0.8)]",
  danger: "border-transparent bg-transparent text-ink-dim hover:bg-red/[0.12] hover:text-red",
};

/* pressed look replaces the variant colors outright so no utilities compete */
const iconActive = "border-hair-strong bg-s3 text-ink hover:bg-s4 [&_svg]:fill-current";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  /** Required: names the action for screen readers (and the tooltip when tip is set). */
  "aria-label": string;
  /** The icon, typically a 16px lucide glyph. */
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: "square" | "circle";
  /** Toggle state: sets aria-pressed and the pressed look (pin, star, mute). */
  active?: boolean;
  /** Show the aria-label as a CSS tooltip on hover and focus. */
  tip?: boolean | "top" | "bottom";
  loading?: boolean;
};

/** Compact icon action. Always named by aria-label; optionally shows it as a tooltip. */
export function IconButton({
  "aria-label": label,
  children,
  variant = "ghost",
  size = "md",
  shape = "square",
  active,
  tip,
  loading,
  disabled,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border transition-[background-color,border-color,color] duration-150",
        "disabled:pointer-events-none disabled:opacity-35",
        shape === "circle" ? "rounded-full!" : size === "lg" ? "rounded-[10px]!" : "rounded-[8px]!",
        iconSizes[size],
        active ? iconActive : iconVariants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" label={null} /> : <span aria-hidden="true" className="inline-flex">{children}</span>}
    </button>
  );
  if (!tip) return button;
  return (
    <Tooltip content={label} placement={tip === "bottom" ? "bottom" : "top"} describe={false}>
      {button}
    </Tooltip>
  );
}

/* ----------------------------------------------------------------------------- ButtonGroup */

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** Join the buttons edge to edge with shared borders (number stepper, split actions). */
  attached?: boolean;
  /** Name the group when its purpose is not obvious from the buttons. */
  "aria-label"?: string;
};

/** Row of related buttons. Wraps on narrow screens unless attached. The doubled "&&"
    selectors outrank each child's own important radius so joined edges stay square. */
export function ButtonGroup({ attached = false, className, children, ...rest }: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        attached
          ? "inline-flex items-stretch [&&>*]:rounded-none! [&&>*:first-child]:rounded-l-[8px]! [&&>*:last-child]:rounded-r-[8px]! [&>*+*]:-ml-px [&>*:focus-visible]:z-10"
          : "flex flex-wrap items-center gap-2",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
