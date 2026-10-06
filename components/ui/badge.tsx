// Badges: Badge (type, tier, role, runtime and HTTP chips in soft, outline or solid tone,
// optional mono uppercase and dot) and Count (tabular count pill). Server-safe.
// Radius 3px for badges, full pill for counts. Color is semantic: green live or managed,
// blue open source or computed, orange enterprise, sample or proving.
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneBg, toneOutline, toneSoft, toneSolid, type Tone } from "./tones";

export type BadgeStyle = "soft" | "outline" | "solid";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "style"> & {
  tone?: Tone;
  /** Visual weight: soft tint (default), outline, or solid fill with dark text. */
  variant?: BadgeStyle;
  /** Mono uppercase with tracking, for kicker-like tags (FEATURED, LOCAL ONLY, 201). */
  mono?: boolean;
  /** Leading 5px dot in the tone color. */
  dot?: boolean;
  /** Leading icon (12px). */
  icon?: ReactNode;
  size?: "xs" | "sm" | "md";
  children: ReactNode;
};

const styles: Record<BadgeStyle, Record<Tone, string>> = { soft: toneSoft, outline: toneOutline, solid: toneSolid };

const sizeCls = {
  xs: "h-4 gap-1 px-1",
  sm: "h-[18px] gap-1 px-1.5",
  md: "h-[22px] gap-1.5 px-2",
} as const;
/* text size is chosen apart from box size so mono and plain never set two font sizes */
const plainText = { xs: "text-[9.5px]", sm: "text-[11px]", md: "text-[12px]" } as const;
const monoText = { xs: "text-[9px]", sm: "text-[10px]", md: "text-[10.5px]" } as const;

/** Small static label. Never interactive; wrap in a button if it needs to act. */
export function Badge({ tone = "neutral", variant = "soft", mono = false, dot = false, icon, size = "sm", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-[3px] border leading-none [&_svg]:size-3",
        sizeCls[size],
        mono ? ["font-mono font-medium uppercase tracking-[0.08em]", monoText[size]] : ["font-medium", plainText[size]],
        styles[variant][tone],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn("size-[5px] shrink-0 rounded-full", variant === "solid" ? "bg-black/70" : toneBg[tone])}
        />
      ) : null}
      {icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
      {children}
    </span>
  );
}

export type CountProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** The count. null means unknown and reads "Unavailable", never 0. */
  value: number | null;
  /** Cap the display, such as 99 to show "99+". */
  max?: number;
  tone?: Tone | "ink";
  /** Noun for screen readers, such as "unread": read as "3 unread". */
  label?: string;
};

const countTone: Record<Tone | "ink", string> = {
  ink: "bg-ink text-black",
  neutral: "bg-white/[0.08] text-ink-dim",
  red: "bg-red/15 text-red",
  org: "bg-org/15 text-org",
  yel: "bg-yel/15 text-yel",
  grn: "bg-grn/15 text-grn",
  cyn: "bg-cyn/15 text-cyn",
  blu: "bg-blu/15 text-blu",
  pur: "bg-pur/15 text-pur",
};

/** Count pill with tabular numerals: tab counts, unread totals, "Saved jobs 3". */
export function Count({ value, max, tone = "neutral", label, className, ...rest }: CountProps) {
  if (value === null) {
    return (
      <span className={cn("font-mono text-[10.5px] text-ink-faint", className)} {...rest}>
        Unavailable
      </span>
    );
  }
  const shown = max !== undefined && value > max ? `${max}+` : new Intl.NumberFormat("en-US").format(value);
  return (
    <span
      className={cn(
        "inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1.5 font-mono text-[10.5px] font-medium leading-none tabular-nums",
        countTone[tone],
        className,
      )}
      {...rest}
    >
      {shown}
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}
