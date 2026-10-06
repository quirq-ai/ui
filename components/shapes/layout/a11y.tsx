// Accessibility primitives: SkipLink (hidden until focused, then a white pill), VisuallyHidden
// (titles that exist for screen readers on canvas pages) and FocusRing (the brand ring shown
// statically, for specimens and docs). Server-safe.
//
// The live ring comes from globals.css: 2px solid var(--ink), offset 3px, on every
// focus-visible control. Reduced motion clamps animation and transition globally.
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** First focusable element on a page: jumps past the nav to the main landmark. */
export function SkipLink({
  href = "#main",
  children = "Skip to content",
  position = "fixed",
  className,
}: {
  href?: string;
  children?: ReactNode;
  /** fixed for a page; absolute to pin it inside a framed preview. */
  position?: "fixed" | "absolute";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        /* not-sr-only resets padding to 0, so the focused padding carries "!" */
        "sr-only z-[70] whitespace-nowrap rounded-full! bg-ink text-[13px] font-semibold text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] focus:px-4! focus:py-2!",
        position === "fixed" ? "focus:not-sr-only focus:fixed focus:left-4 focus:top-4" : "focus:not-sr-only focus:absolute focus:left-3 focus:top-3",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Content for screen readers only: canvas page titles, extra context for icon-only controls. */
export function VisuallyHidden({ as: Tag = "span", children, id }: { as?: ElementType; children: ReactNode; id?: string }) {
  return (
    <Tag id={id} className="sr-only">
      {children}
    </Tag>
  );
}

/** Static brand focus ring around any child, for specimens: 2px solid ink, offset 3px. */
export function FocusRing({ children, radius = 6, className }: { children: ReactNode; radius?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex outline-2 outline-offset-[3px] outline-solid outline-ink", className)}
      style={{ borderRadius: radius }}
    >
      {children}
    </span>
  );
}
