"use client";

// Reveal: the brand's one entrance motion. A 24px rise and fade over 1s on
// cubic-bezier(0.22, 1, 0.36, 1), staggered with a --d delay. Content renders visible on the
// server and without JavaScript; the effect hides it just before it is observed, then reveals
// it when it scrolls into view (or right away with trigger="mount"). Reduced motion keeps it
// visible with no transition. State lives on data-rv, so React never fights the DOM.
import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";

export type RevealProps = {
  children: ReactNode;
  /** Stagger delay in seconds, written to --d (landing steps of .06 to .08). */
  delay?: number;
  /** "scroll" reveals on intersection (default); "mount" plays as soon as it renders. */
  trigger?: "scroll" | "mount";
  /** Scroll container to observe against instead of the viewport. */
  rootRef?: RefObject<HTMLElement | null>;
  /** Skip the motion entirely (reduced motion, or a simulated preference). */
  instant?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const motionCls =
  "transition-[opacity,transform] duration-1000 ease-quirq delay-(--d) " +
  "data-[rv=hidden]:translate-y-6 data-[rv=hidden]:opacity-0 data-[rv=hidden]:transition-none " +
  "motion-reduce:data-[rv=hidden]:translate-y-0 motion-reduce:data-[rv=hidden]:opacity-100 motion-reduce:transition-none";

export function Reveal({ children, delay = 0, trigger = "scroll", rootRef, instant = false, as: Tag = "div", className, style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || instant) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.rv = "hidden";
    // Commit the hidden style before revealing so the transition has a start point.
    void el.getBoundingClientRect();
    if (trigger === "mount" || !("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => {
        el.dataset.rv = "on";
      });
      return () => {
        cancelAnimationFrame(raf);
        el.dataset.rv = "static";
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.dataset.rv = "on";
            io.disconnect();
          }
        }
      },
      { root: rootRef?.current ?? null, threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.dataset.rv = "static";
    };
  }, [trigger, rootRef, instant]);

  return (
    <Tag
      ref={ref}
      data-rv="static"
      className={cn(!instant && motionCls, className)}
      style={{ "--d": `${delay}s`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
