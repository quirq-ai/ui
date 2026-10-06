// Tooltip: CSS only (hover and focus-within), no JS. Placement top or bottom, aligned
// center, start or end. The bubble is display:none until shown so it never widens the page
// at 390px. Use for short names of icon actions; never put essential content in a tooltip.
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TooltipProps = {
  /** Short text shown in the bubble. */
  content: ReactNode;
  /** The trigger: a focusable element such as a button or link. */
  children: ReactNode;
  placement?: "top" | "bottom";
  align?: "center" | "start" | "end";
  /**
   * Id for the bubble. When set (and describe is true) the trigger gets aria-describedby so
   * screen readers hear the tip as a description.
   */
  id?: string;
  /** Wire aria-describedby; turn off when the content repeats the trigger's aria-label. */
  describe?: boolean;
  className?: string;
};

const pos = {
  top: "bottom-full mb-2",
  bottom: "top-full mt-2",
} as const;

const alignCls = {
  center: "left-1/2 -translate-x-1/2",
  start: "left-0",
  end: "right-0",
} as const;

/** Hover or focus a trigger to see its tip. Wraps the trigger in an inline-flex span. */
export function Tooltip({ content, children, placement = "top", align = "center", id, describe = true, className }: TooltipProps) {
  const wire = describe && id && isValidElement(children);
  const trigger = wire
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": id })
    : children;
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden w-max max-w-[min(240px,calc(100vw-32px))]",
          "rounded-[6px] border border-hair-strong bg-s3 px-2 py-1 text-left text-[11.5px] font-normal leading-snug text-ink normal-case tracking-normal",
          "shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity duration-150 starting:opacity-0",
          "group-hover/tt:block group-focus-within/tt:block",
          pos[placement],
          alignCls[align],
        )}
      >
        {content}
      </span>
    </span>
  );
}
