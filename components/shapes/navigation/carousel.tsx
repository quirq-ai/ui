"use client";

// Carousels for browsing cards sideways:
//  SnapRail   scroll-snap rail with ← → buttons that disable at the start and end
//  Coverflow  3D command center carousel: wraparound, front card glow, dimmed side cards,
//             arrows, dots, arrow keys and swipe
//  PageDots   page indicator buttons (phone home screen, onboarding)
//  SwipePages pages that slide under the dots, with swipe and arrow keys
// Motion is transform-only and the global reduced-motion rule collapses it.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tracks a horizontal swipe on pointer devices; calls back with -1 or 1 past a 40px threshold. */
function useSwipe(onSwipe: (dir: -1 | 1) => void) {
  const start = useRef<number | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      start.current = e.clientX;
    },
    onPointerUp: (e: PointerEvent) => {
      if (start.current === null) return;
      const dx = e.clientX - start.current;
      start.current = null;
      if (Math.abs(dx) > 40) onSwipe(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

/* ----------------------------------------------------------------------------- SnapRail */

export type RailPosition = "start" | "middle" | "end" | "fits";

export type SnapRailProps = {
  children: ReactNode;
  "aria-label": string;
  /** Left side of the header row (a headline). */
  heading?: ReactNode;
  /** Minimum card width; cards share the rest. */
  itemMin?: number;
  /** Where the rail starts scrolled (state samples and restored views). */
  initialPosition?: "start" | "middle" | "end";
  /** Smaller arrows and gaps for dense rows. */
  size?: "md" | "sm";
  onPositionChange?: (p: RailPosition) => void;
  className?: string;
};

const arrowBtn =
  "inline-flex h-9 w-10 items-center justify-center rounded-full! border border-hair bg-white/[0.04] text-ink-dim transition-[color,border-color,opacity] hover:border-white/[0.22] hover:text-ink disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4";
const arrowBtnSm = "h-7 w-8 [&_svg]:size-3.5";

/** Horizontal card rail with snap points and arrow buttons. No dots. */
export function SnapRail({
  children,
  "aria-label": ariaLabel,
  heading,
  itemMin = 260,
  initialPosition = "start",
  size = "md",
  onPositionChange,
  className,
}: SnapRailProps) {
  const rail = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<RailPosition>("start");
  const report = useRef(onPositionChange);
  useEffect(() => {
    report.current = onPositionChange;
  });

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    // The first position is applied once layout has settled (the observer's first report), so
    // the scroll range is the real one and snapping keeps the end reachable.
    let pending = initialPosition !== "start";
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (pending && max > 2) {
        pending = false;
        el.scrollLeft = initialPosition === "end" ? max : Math.round(max / 2);
      }
      const next: RailPosition = max <= 2 ? "fits" : el.scrollLeft <= 2 ? "start" : el.scrollLeft >= max - 2 ? "end" : "middle";
      setPos(next);
      report.current?.(next);
    };
    // The observer reports once on observe, which sets the first position.
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
    // initialPosition applies on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.66, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section aria-label={ariaLabel} aria-roledescription="carousel" className={cn("min-w-0", className)}>
      <div className={cn("flex flex-wrap items-end justify-between", size === "sm" ? "gap-3" : "gap-5")}>
        <div className="min-w-0">{heading}</div>
        <div className={cn("flex", size === "sm" ? "gap-1.5" : "gap-2.5")}>
          <button type="button" className={cn(arrowBtn, size === "sm" && arrowBtnSm)} aria-label="Scroll back" disabled={pos === "start" || pos === "fits"} onClick={() => scroll(-1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className={cn(arrowBtn, size === "sm" && arrowBtnSm)} aria-label="Scroll forward" disabled={pos === "end" || pos === "fits"} onClick={() => scroll(1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        ref={rail}
        role="group"
        tabIndex={0}
        aria-label={`${ariaLabel}, scroll sideways`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            scroll(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
        className={cn(
          "grid snap-x snap-mandatory grid-flow-col overflow-x-auto px-0.5 pb-2 pt-1 [scrollbar-width:none] focus-visible:outline-offset-2! [&::-webkit-scrollbar]:hidden",
          size === "sm" ? "mt-3 gap-2.5" : "mt-6 gap-[18px]",
        )}
        style={{ gridAutoColumns: `minmax(min(${itemMin}px, 80%), 1fr)` }}
      >
        {children}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- Coverflow */

export type CoverflowProps<T> = {
  items: T[];
  index: number;
  onIndexChange: (i: number) => void;
  /** Name of an item, for the dots and the announcement. */
  getLabel: (item: T) => string;
  renderCard: (item: T, state: { front: boolean }) => ReactNode;
  /** Open the front card (Enter on the stage, or a click on the front card). */
  onOpen?: (item: T) => void;
  "aria-label": string;
  className?: string;
};

/** Wraparound coverflow: the front card glows, side cards sit back and dim. */
export function Coverflow<T>({ items, index, onIndexChange, getLabel, renderCard, onOpen, "aria-label": ariaLabel, className }: CoverflowProps<T>) {
  const n = items.length;
  const move = (d: number) => onIndexChange(((index + d) % n + n) % n);
  const swipe = useSwipe(move);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" && onOpen) {
      e.preventDefault();
      onOpen(items[index]);
    }
  }

  return (
    <section aria-label={ariaLabel} aria-roledescription="carousel" className={cn("min-w-0", className)}>
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        {...swipe}
        aria-label={`${getLabel(items[index])}, ${index + 1} of ${n}. Use the arrow keys to turn the carousel.`}
        className="relative h-[320px] touch-pan-y select-none overflow-hidden rounded-[16px]! [perspective:1200px] focus-visible:outline-offset-[-2px]!"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 92%, rgba(98,110,139,0.18), transparent 70%)" }}
      >
        {items.map((item, i) => {
          let rel = i - index;
          if (n > 2) {
            if (rel > n / 2) rel -= n;
            if (rel < -n / 2) rel += n;
          }
          const depth = Math.abs(rel);
          if (depth > 2) return null;
          const front = rel === 0;
          return (
            <div
              key={i}
              aria-hidden={!front}
              onClick={() => (front ? onOpen?.(item) : onIndexChange(i))}
              className={cn(
                "absolute left-1/2 top-5 w-[min(280px,68%)] cursor-pointer [transform-style:preserve-3d]",
                "transition-[transform,opacity,filter] [transition-duration:560ms,400ms,400ms] [transition-timing-function:cubic-bezier(0.2,0.75,0.2,1)]",
              )}
              style={{
                transform: `translateX(-50%) translateX(${rel * 58}%) translateZ(${-depth * 140}px) rotateY(${-rel * 16}deg)`,
                zIndex: 10 - depth,
                opacity: depth === 2 ? 0.45 : 1,
                filter: front ? "none" : "saturate(.62) brightness(.7)",
              }}
            >
              <div
                className={cn(
                  "rounded-[16px] border transition-[border-color,box-shadow] duration-500",
                  front ? "border-[rgba(149,134,224,0.42)] shadow-[0_0_0_1px_rgba(149,134,224,0.18),0_20px_60px_rgba(149,134,224,0.18),0_18px_40px_rgba(0,0,0,0.6)]" : "border-hair",
                )}
              >
                {renderCard(item, { front })}
              </div>
            </div>
          );
        })}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[10%] bottom-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" className={arrowBtn} aria-label="Previous card" onClick={() => move(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <PageDots count={n} index={index} onIndexChange={onIndexChange} labelFor={(i) => `Show ${getLabel(items[i])}`} label="Card position" />
        <button type="button" className={arrowBtn} aria-label="Next card" onClick={() => move(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {getLabel(items[index])}, {index + 1} of {n}
      </p>
    </section>
  );
}

/* ----------------------------------------------------------------------------- PageDots */

export type PageDotsProps = {
  count: number;
  index: number;
  onIndexChange: (i: number) => void;
  /** Group name: "Home screen pages". */
  label: string;
  labelFor?: (i: number) => string;
  /** light: for use on glass or photos. */
  tone?: "ink" | "light";
  className?: string;
};

/** Page indicator: one dot per page, the current one stretched into a pill. */
export function PageDots({ count, index, onIndexChange, label, labelFor, tone = "ink", className }: PageDotsProps) {
  return (
    <div role="group" aria-label={label} className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: count }, (_, i) => {
        const on = i === index;
        return (
          <button
            key={i}
            type="button"
            aria-label={labelFor ? labelFor(i) : `Page ${i + 1} of ${count}`}
            aria-current={on ? "true" : undefined}
            onClick={() => onIndexChange(i)}
            className="group/dot inline-flex h-5 items-center justify-center rounded-full! px-0.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-quirq",
                on ? "w-4" : "w-1.5",
                on ? (tone === "light" ? "bg-white" : "bg-ink") : tone === "light" ? "bg-white/40 group-hover/dot:bg-white/70" : "bg-white/20 group-hover/dot:bg-white/45",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- SwipePages */

export type SwipePagesProps = {
  pages: ReactNode[];
  index: number;
  onIndexChange: (i: number) => void;
  "aria-label": string;
  className?: string;
};

/** Pages that slide sideways; swipe, arrow keys or the dots move between them. */
export function SwipePages({ pages, index, onIndexChange, "aria-label": ariaLabel, className }: SwipePagesProps) {
  const n = pages.length;
  const swipe = useSwipe((d) => onIndexChange(Math.min(n - 1, Math.max(0, index + d))));
  return (
    <section aria-label={ariaLabel} aria-roledescription="carousel" className={cn("min-w-0", className)}>
      <div
        tabIndex={0}
        {...swipe}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && index < n - 1) {
            e.preventDefault();
            onIndexChange(index + 1);
          } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            onIndexChange(index - 1);
          }
        }}
        aria-label={`Page ${index + 1} of ${n}`}
        className="touch-pan-y select-none overflow-hidden rounded-[12px]! focus-visible:outline-offset-[-2px]!"
      >
        <div className="flex transition-transform duration-[420ms] ease-quirq" style={{ transform: `translateX(-${index * 100}%)` }}>
          {pages.map((p, i) => (
            <div key={i} className="w-full shrink-0" aria-hidden={i !== index} inert={i !== index}>
              {p}
            </div>
          ))}
        </div>
      </div>
      <PageDots className="mt-3 justify-center" count={n} index={index} onIndexChange={onIndexChange} label={`${ariaLabel} pages`} tone="light" />
    </section>
  );
}
