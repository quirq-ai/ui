// Chat bubbles: Bubble (seven fills from the swarm bubble set, mapped to quirq tokens),
// BubbleGroup (consecutive bubbles from one side) and BubbleReactions (the small chip that
// hangs off a bubble edge). Server-safe. The person's side is ink filled with black text, the
// agent's side is muted s2; the fill is what tells the two sides apart.
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive";
export type BubbleAlign = "start" | "end";

export const BUBBLE_VARIANTS: BubbleVariant[] = ["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"];

const fill: Record<BubbleVariant, string> = {
  /* the person's turn: ink fill, black text; inline code inherits instead of going grey */
  default:
    "border-ink bg-ink text-black [&_code]:border-black/10 [&_code]:bg-black/[0.07] [&_code]:text-black [&_strong]:text-black",
  secondary: "border-hair bg-s3 text-ink",
  /* the agent's turn */
  muted: "border-transparent bg-s2 text-ink/90",
  tinted: "border-blu/25 bg-[color-mix(in_srgb,var(--blu)_14%,var(--s1))] text-ink",
  outline: "border-hair-strong bg-transparent text-ink",
  /* prose with no chrome; full width */
  ghost: "border-transparent bg-transparent text-ink/90",
  destructive: "border-red/30 bg-red/[0.08] text-[#ff8a80] [&_code]:bg-red/10 [&_code]:border-red/20",
};

export type BubbleProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  variant?: BubbleVariant;
  /** start = agent side (left), end = person side (right). */
  align?: BubbleAlign;
  /** Squares the corner nearest the avatar, like a speech tail. */
  tail?: boolean;
  /** Reaction chip that hangs off the bottom edge (see BubbleReactions). */
  reactions?: ReactNode;
  /** Override the 80% cap, for wide markdown. */
  wide?: boolean;
  children: ReactNode;
};

/** One message bubble. Aligns itself inside a flex column or a block parent. */
export function Bubble({
  variant = "muted",
  align = "start",
  tail = true,
  reactions,
  wide = false,
  className,
  children,
  ...rest
}: BubbleProps) {
  const ghost = variant === "ghost";
  return (
    <div
      data-variant={variant}
      data-align={align}
      className={cn(
        "relative flex w-fit min-w-0 flex-col",
        align === "end" ? "ml-auto items-end self-end" : "mr-auto items-start self-start",
        ghost || wide ? "max-w-full" : "max-w-[80%]",
        /* the chip hangs three quarters below the edge; reserve that space */
        reactions ? "mb-4" : null,
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "min-w-0 max-w-full break-words border text-[13.5px] leading-[1.6]",
          ghost ? "p-0" : "rounded-[18px] px-3.5 py-2",
          !ghost && tail && (align === "end" ? "rounded-br-[6px]" : "rounded-bl-[6px]"),
          fill[variant],
        )}
      >
        {children}
      </div>
      {reactions ? (
        <div className={cn("absolute bottom-0 z-10 flex translate-y-3/4 items-center", align === "end" ? "right-3" : "left-3")}>
          {reactions}
        </div>
      ) : null}
    </div>
  );
}

/** Consecutive bubbles from one side, tighter than separate turns. */
export function BubbleGroup({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 flex-col gap-1.5", className)} {...rest} />;
}

/** Chip row hanging off a bubble edge. Pass static spans or toggle buttons as children. */
export function BubbleReactions({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-hair bg-s3 p-0.5 text-[11px] text-ink-dim shadow-[0_0_0_3px_#0c0c0d]",
        className,
      )}
      {...rest}
    />
  );
}
