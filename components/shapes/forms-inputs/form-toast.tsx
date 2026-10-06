"use client";

// FormToast: the small result card a form shows after it submits ("Project cloned",
// "2 added, 1 updated"). Rendered inline under the form, announced through a polite live
// region, dismissible, and optionally auto-hidden after a delay.
import { useEffect, useRef, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type FormToastTone = "success" | "error" | "warn" | "info";

export type FormToastProps = {
  tone?: FormToastTone;
  title: ReactNode;
  description?: ReactNode;
  /** Close button; omit to hide it. */
  onDismiss?: () => void;
  /** Hide after this many milliseconds (calls onDismiss). */
  autoHideMs?: number;
  className?: string;
};

const toneIcon: Record<FormToastTone, ReactNode> = {
  success: <CircleCheck aria-hidden="true" className="size-4 text-grn" />,
  error: <CircleAlert aria-hidden="true" className="size-4 text-red" />,
  warn: <TriangleAlert aria-hidden="true" className="size-4 text-org" />,
  info: <Info aria-hidden="true" className="size-4 text-blu" />,
};

/** Result card for a finished submit. */
export function FormToast({ tone = "success", title, description, onDismiss, autoHideMs, className }: FormToastProps) {
  // Keep the latest callback in a ref so a parent re-render (a new inline arrow) does not
  // restart the countdown.
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);
  const canDismiss = Boolean(onDismiss);
  useEffect(() => {
    if (!autoHideMs || !canDismiss) return;
    const t = setTimeout(() => dismiss.current?.(), autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, canDismiss]);

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rise flex w-full max-w-[380px] items-start gap-2.5 rounded-[12px] border border-hair-strong bg-s3 py-2.5 pl-3 pr-2",
        "shadow-[0_12px_32px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      <span className="mt-0.5 inline-flex shrink-0">{toneIcon[tone]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-5 text-ink">{title}</p>
        {description ? <p className="mt-0.5 text-[12px] leading-snug text-ink-dim">{description}</p> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-[6px]! text-ink-faint transition-colors hover:bg-s4 hover:text-ink"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
