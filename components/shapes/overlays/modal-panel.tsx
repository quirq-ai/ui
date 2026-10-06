// ModalPanel: the dialog surface (kicker, title, description, body, footer, close) in two
// tones: default soft panel and "deep" for the space-drift flight dialogs. Hook-free, so it
// renders inline in static examples and inside the Modal layer alike.
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button";

export type ModalSize = "sm" | "md" | "lg" | "xl";
export type ModalTone = "default" | "deep";

/** Width per size; the Modal layer uses the same class so the panel's 100% has a box to fill. */
export const MODAL_WIDTHS: Record<ModalSize, string> = {
  sm: "w-[min(400px,100%)]",
  md: "w-[min(460px,100%)]",
  lg: "w-[min(760px,100%)]",
  xl: "w-[min(1040px,100%)]",
};

const toneCls: Record<ModalTone, string> = {
  default: "rounded-[16px] border border-hair-strong bg-[#0f0f11]",
  deep: "rounded-[16px] border border-blu/25 bg-[rgba(8,11,22,0.98)]",
};

export type ModalPanelProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Mono uppercase line above the title ("SPACE ATLAS"). */
  kicker?: ReactNode;
  /** Leading icon tile or logo beside the title. */
  icon?: ReactNode;
  titleId?: string;
  descriptionId?: string;
  /** h2 inside a real dialog; h3 when shown inline under a page heading. */
  titleAs?: "h2" | "h3";
  /** Large display title, as the space-drift dialogs set it. */
  display?: boolean;
  /** Shows the close button when set. */
  onClose?: () => void;
  closeLabel?: string;
  /** Hide the close button (an update that must finish). */
  hideClose?: boolean;
  size?: ModalSize;
  tone?: ModalTone;
  /** Footer row, right-aligned on wide screens: Cancel then the primary action. */
  footer?: ReactNode;
  children?: ReactNode;
  /** Drop the body padding (side-nav layouts own their own). */
  flush?: boolean;
  bodyClassName?: string;
  className?: string;
};

/** Dialog surface. Pair with Modal for the real layer, or render inline for previews. */
export function ModalPanel({
  title,
  description,
  kicker,
  icon,
  titleId,
  descriptionId,
  titleAs: Title = "h2",
  display = false,
  onClose,
  closeLabel = "Close",
  hideClose = false,
  size = "md",
  tone = "default",
  footer,
  children,
  flush = false,
  bodyClassName,
  className,
}: ModalPanelProps) {
  const showClose = Boolean(onClose) && !hideClose;
  return (
    <div
      className={cn(
        "relative flex max-h-[min(780px,calc(100dvh-32px))] min-w-0 max-w-full flex-col overflow-hidden text-ink",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(0,0,0,0.3)]",
        MODAL_WIDTHS[size],
        toneCls[tone],
        className,
      )}
    >
      <header className={cn("flex shrink-0 items-start gap-3", display ? "px-6 pt-6 sm:px-7 sm:pt-7" : "px-5 pt-5", showClose && "pr-12")}>
        {icon ? <div className="shrink-0">{icon}</div> : null}
        <div className="min-w-0 flex-1">
          {kicker ? (
            <p className={cn("mb-1.5 font-mono uppercase leading-none text-ink-faint", display ? "text-[11px] tracking-[0.2em]" : "text-[10.5px] tracking-[0.18em]")}>
              {kicker}
            </p>
          ) : null}
          <Title
            id={titleId}
            className={cn(
              "text-ink",
              display
                ? "text-[clamp(24px,3.2vw,30px)] font-semibold leading-[1.1] tracking-[-0.035em]"
                : "text-[16px] font-semibold leading-snug tracking-[-0.01em]",
            )}
          >
            {title}
          </Title>
          {description ? (
            <p id={descriptionId} className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      {children ? (
        <div
          className={cn(
            "scroll-thin min-h-0 flex-1 overflow-y-auto",
            !flush && (display ? "px-6 pb-6 pt-4 sm:px-7" : "px-5 pb-5 pt-4"),
            bodyClassName,
          )}
        >
          {children}
        </div>
      ) : null}
      {footer ? <ModalFooter className={cn(display ? "px-6 sm:px-7" : "px-5")}>{footer}</ModalFooter> : null}
      {/* last in the DOM so focus starts in the content; shown top right */}
      {showClose ? (
        <IconButton aria-label={closeLabel} size="sm" onClick={onClose} className="absolute right-3 top-3">
          <X />
        </IconButton>
      ) : null}
    </div>
  );
}

/** Footer row: wraps on narrow screens, right-aligned when there is room. */
export function ModalFooter({ children, className, divider = true }: { children: ReactNode; className?: string; divider?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-2 py-3.5",
        divider && "border-t border-hair-soft bg-white/[0.015]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Inline result line inside a dialog body: error, success or busy. */
export function ModalNotice({
  tone,
  icon,
  title,
  children,
  className,
}: {
  tone: "error" | "success" | "info" | "warn";
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const toneCls = {
    error: "border-red/35 bg-red/[0.07] text-[#ff8a80]",
    success: "border-grn/30 bg-grn/[0.07] text-grn",
    info: "border-blu/30 bg-blu/[0.07] text-blu",
    warn: "border-org/35 bg-org/[0.07] text-org",
  }[tone];
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn("flex items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-snug [&_svg]:size-4", toneCls, className)}
    >
      {icon ? <span aria-hidden="true" className="mt-px inline-flex shrink-0">{icon}</span> : null}
      <div className="min-w-0">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className={cn("text-ink-dim", title && "mt-0.5")}>{children}</div> : null}
      </div>
    </div>
  );
}
