"use client";

// AnchorScroller: a contained page with a sticky bar of in-page anchors. Clicking an anchor
// scrolls smoothly to its section (instantly under reduced motion), honors the 78px
// scroll margin under the bar, and moves focus to the section heading so keyboard and screen
// reader users land where sighted users do. The current section is marked aria-current.
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "./use-motion";

export type AnchorSection = {
  /** Unique on the page; becomes the element id and the #hash. */
  id: string;
  label: string;
  content: ReactNode;
};

export type AnchorScrollerProps = {
  sections: AnchorSection[];
  /** Brand or page name at the left of the bar. */
  brand?: ReactNode;
  /** Visible height of the scrolling page. */
  height?: number;
  /** Space kept above a section when scrolled to (the scroll-margin-top). */
  scrollMargin?: number;
  "aria-label": string;
  className?: string;
};

export function AnchorScroller({
  sections,
  brand,
  height = 340,
  scrollMargin = 56,
  "aria-label": ariaLabel,
  className,
}: AnchorScrollerProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(sections[0]?.id ?? "");

  /* Track which section sits under the bar while the page scrolls. */
  useEffect(() => {
    const root = scroller.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root, rootMargin: `-${scrollMargin}px 0px -55% 0px`, threshold: 0 },
    );
    sections.forEach((s) => {
      const el = root.querySelector<HTMLElement>(`#${CSS.escape(s.id)}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections, scrollMargin]);

  function go(e: MouseEvent<HTMLAnchorElement>, id: string) {
    const root = scroller.current;
    const target = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!root || !target) return;
    e.preventDefault();
    const top = Math.max(0, target.offsetTop - scrollMargin);
    root.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    setActive(id);
    target.querySelector<HTMLElement>("[data-anchor-heading]")?.focus({ preventScroll: true });
  }

  return (
    <div className={cn("overflow-hidden rounded-[14px] border border-hair-soft bg-bg", className)}>
      <div
        ref={scroller}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="scroll-thin relative overflow-y-auto overscroll-contain"
        style={{ height }}
      >
        <nav
          aria-label="On this page"
          className="sticky top-0 z-10 flex h-11 items-center gap-3 border-b border-hair-soft bg-black/80 px-4 backdrop-blur-md"
        >
          {brand ? <span className="hidden shrink-0 text-[12.5px] font-semibold sm:inline">{brand}</span> : null}
          <ul className="scroll-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:justify-end">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  aria-current={active === s.id ? "location" : undefined}
                  className={cn(
                    "inline-flex h-7 items-center rounded-full px-2.5 text-[12px] transition-colors",
                    active === s.id ? "bg-white/[0.08] text-ink" : "text-ink-dim hover:text-ink",
                  )}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {sections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            style={{ scrollMarginTop: scrollMargin }}
            className={cn("px-5 py-10", i > 0 && "border-t border-hair-soft")}
          >
            {s.content}
          </section>
        ))}
        <div className="h-24" aria-hidden="true" />
      </div>
    </div>
  );
}
