"use client";

// App button set: primary (ink fill), outline, ghost, danger (red tint, never a solid slab),
// warning restart (orange), text, and the 48px iOS pill with its secondary partner. Sizes
// 28, 32 and 40. Busy swaps the label, shows a spinner, keeps focus on the button and
// swallows further clicks so a request cannot be sent twice. useBusyAction wires an async
// action to that state with a ref guard that holds even before the next render.
import { useCallback, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { Spinner } from "@/components/ui/loaders";
import { actionButtonClasses, type ActionButtonLookProps } from "./button-look";

export type { ActionVariant, ActionSize, ActionPreview, ActionButtonLookProps } from "./button-look";

export type ActionButtonProps = ActionButtonLookProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    /** Label shown while busy, such as "Starting…". */
    busyLabel?: ReactNode;
    /** Called when a click lands while busy and is swallowed. */
    onBusyClick?: () => void;
  };

/** App action button. Defaults to type="button" so it never submits by accident. */
export function ActionButton({
  variant = "outline",
  size = "md",
  block,
  preview,
  busy = false,
  busyLabel,
  onBusyClick,
  leadingIcon,
  trailingIcon,
  className,
  type = "button",
  onClick,
  children,
  ...rest
}: ActionButtonProps) {
  function handle(e: MouseEvent<HTMLButtonElement>) {
    if (busy) {
      // Busy keeps focus (no native disabled) but never runs the action again or submits.
      e.preventDefault();
      e.stopPropagation();
      onBusyClick?.();
      return;
    }
    onClick?.(e);
  }
  const spinner = variant === "ios" || variant === "ios-secondary" || size === "lg" ? "md" : size === "sm" ? "xs" : "sm";
  return (
    <button
      type={type}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      data-variant={variant}
      data-busy={busy || undefined}
      onClick={handle}
      className={actionButtonClasses({ variant, size, block, preview, busy, className })}
      {...rest}
    >
      {busy ? (
        <Spinner size={spinner} label={null} />
      ) : leadingIcon ? (
        <span aria-hidden="true" className="inline-flex">
          {leadingIcon}
        </span>
      ) : null}
      <span className="truncate leading-[1.25]">{busy && busyLabel ? busyLabel : children}</span>
      {trailingIcon && !busy ? (
        <span aria-hidden="true" className="inline-flex">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Runs an async action once at a time. busy drives the button; run returns false when a
 * second call arrives while the first is still in flight (the double submit that was blocked).
 */
export function useBusyAction<A extends unknown[]>(action: (...args: A) => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const run = useCallback(
    async (...args: A) => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setBusy(true);
      try {
        await action(...args);
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
      return true;
    },
    [action],
  );
  return { busy, run };
}
