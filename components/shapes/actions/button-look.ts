// Class recipe for the app button set, kept server-safe so any element (anchors, summary,
// labels) can borrow the look without the client ActionButton. Hover utilities carry
// not-disabled so a disabled button keeps its resting look under the pointer.
import { cn } from "@/lib/cn";

export type ActionVariant = "primary" | "outline" | "ghost" | "danger" | "warning" | "text" | "ios" | "ios-secondary";
export type ActionSize = "sm" | "md" | "lg";
export type ActionPreview = "hover" | "focus";

type Look = { rest: string; hover: string; hoverOn: string };

const LOOKS: Record<ActionVariant, Look> = {
  primary: {
    rest: "border-ink bg-ink text-black",
    hover: "not-disabled:hover:border-[#e8e8e6] not-disabled:hover:bg-[#e8e8e6]",
    hoverOn: "border-[#e8e8e6] bg-[#e8e8e6] text-black",
  },
  outline: {
    rest: "border-hair-strong bg-transparent text-ink-dim",
    hover: "not-disabled:hover:border-white/35 not-disabled:hover:bg-white/[0.03] not-disabled:hover:text-ink",
    hoverOn: "border-white/35 bg-white/[0.03] text-ink",
  },
  ghost: {
    rest: "border-transparent bg-transparent text-ink-dim",
    hover: "not-disabled:hover:bg-s3 not-disabled:hover:text-ink",
    hoverOn: "border-transparent bg-s3 text-ink",
  },
  danger: {
    rest: "border-red/45 bg-red/[0.06] text-[#ff7a70]",
    hover: "not-disabled:hover:border-red/70 not-disabled:hover:bg-red/[0.12]",
    hoverOn: "border-red/70 bg-red/[0.12] text-[#ff7a70]",
  },
  warning: {
    rest: "border-org/50 bg-org/[0.05] text-org",
    hover: "not-disabled:hover:border-org/75 not-disabled:hover:bg-org/10",
    hoverOn: "border-org/75 bg-org/10 text-org",
  },
  text: {
    rest: "border-transparent bg-transparent text-ink-dim",
    hover: "not-disabled:hover:text-ink not-disabled:hover:underline",
    hoverOn: "border-transparent bg-transparent text-ink underline",
  },
  ios: {
    rest: "border-ink bg-ink text-black",
    hover: "not-disabled:hover:border-[#e8e8e6] not-disabled:hover:bg-[#e8e8e6]",
    hoverOn: "border-[#e8e8e6] bg-[#e8e8e6] text-black",
  },
  "ios-secondary": {
    rest: "border-hair bg-s3 text-ink",
    hover: "not-disabled:hover:border-hair-strong not-disabled:hover:bg-s4",
    hoverOn: "border-hair-strong bg-s4 text-ink",
  },
};

const SIZES: Record<ActionSize, string> = {
  sm: "h-7 gap-1.5 rounded-[7px]! px-2.5 text-[12px] [&_svg]:size-3.5",
  md: "h-8 gap-2 rounded-[8px]! px-3 text-[13px] [&_svg]:size-4",
  lg: "h-10 gap-2 rounded-[9px]! px-4 text-[14px] [&_svg]:size-4",
};

const TEXT_SIZES: Record<ActionSize, string> = {
  sm: "h-auto gap-1 rounded-[4px]! px-0 text-[12px] [&_svg]:size-3.5",
  md: "h-auto gap-1.5 rounded-[4px]! px-0 text-[13px] [&_svg]:size-4",
  lg: "h-auto gap-1.5 rounded-[4px]! px-0 text-[14px] [&_svg]:size-4",
};

const IOS = "h-12 gap-2 rounded-full! px-6 text-[16px] font-semibold tracking-[-0.01em] [&_svg]:size-[18px]";

const focusOn = "outline-2 outline-offset-3 outline-ink outline-solid";

export type ActionButtonLookProps = {
  variant?: ActionVariant;
  /** 28, 32 or 40px. The iOS variants are always 48px. */
  size?: ActionSize;
  block?: boolean;
  /** Static hover or focus look, for catalogs and docs. */
  preview?: ActionPreview;
  /** Busy look: wait cursor, full opacity. */
  busy?: boolean;
  className?: string;
};

/** Class string for any element that should look like an ActionButton. */
export function actionButtonClasses({ variant = "outline", size = "md", block, preview, busy, className }: ActionButtonLookProps = {}) {
  const look = LOOKS[variant];
  const isIos = variant === "ios" || variant === "ios-secondary";
  return cn(
    "relative inline-flex max-w-full shrink-0 select-none items-center justify-center whitespace-nowrap border font-medium leading-none underline-offset-4",
    "transition-[background-color,border-color,color,opacity] duration-150 ease-quirq",
    isIos ? IOS : variant === "text" ? TEXT_SIZES[size] : SIZES[size],
    preview === "hover" ? look.hoverOn : busy ? look.rest : [look.rest, look.hover],
    preview === "focus" && focusOn,
    busy ? "cursor-wait" : "disabled:cursor-not-allowed disabled:opacity-45",
    block && "w-full",
    className,
  );
}
