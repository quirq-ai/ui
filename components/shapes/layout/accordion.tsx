"use client";

// Single-open accordions: NumberedAccordion (workflow steps, collapsed rows at .5 opacity)
// and LayerAccordion (the three layers with a color rail). Each header is a button inside a
// heading with aria-expanded and aria-controls; Up and Down move between headers, Home and
// End jump. The open panel stays a separate region so the button never changes identity.
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

function useHeaderKeys(count: number) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowDown") next = (i + 1) % count;
    else if (e.key === "ArrowUp") next = (i - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
  }
  return { refs, onKeyDown };
}

/* ----------------------------------------------------------------------------- NumberedAccordion */

export type NumberedItem = { num: string; title: string; body: ReactNode };

export type NumberedAccordionProps = {
  items: NumberedItem[];
  /** Controlled open index. */
  open?: number;
  defaultOpen?: number;
  onOpenChange?: (i: number) => void;
  /** Unique prefix for header and panel ids. */
  idPrefix: string;
  headingAs?: "h3" | "h4";
  className?: string;
};

/** Numbered workflow rows: one open at a time; collapsed rows sit at .5, .8 on hover, 1 on focus. */
export function NumberedAccordion({ items, open, defaultOpen = 0, onOpenChange, idPrefix, headingAs: H = "h3", className }: NumberedAccordionProps) {
  const [inner, setInner] = useState(defaultOpen);
  const current = open ?? inner;
  const { refs, onKeyDown } = useHeaderKeys(items.length);
  const set = (i: number) => {
    if (open === undefined) setInner(i);
    onOpenChange?.(i);
  };
  return (
    <div className={cn("border-b border-white/15", className)}>
      {items.map((item, i) => {
        const isOpen = current === i;
        const hid = `${idPrefix}-h-${i}`;
        const pid = `${idPrefix}-p-${i}`;
        return (
          <div key={item.num} className="border-t border-white/15">
            <H className="m-0">
              <button
                ref={(el) => {
                  refs.current[i] = el;
                }}
                id={hid}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => set(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "group grid w-full grid-cols-[56px_1fr] items-baseline py-[17px] text-left sm:grid-cols-[86px_1fr]",
                  "transition-opacity duration-200",
                  isOpen ? "opacity-100" : "opacity-50 hover:opacity-80 focus-visible:opacity-100",
                )}
              >
                <span className={cn("text-[clamp(18px,1.8vw,22px)] font-bold tracking-[2.2px] tabular-nums", isOpen ? "spec-text" : "text-ink")}>
                  {item.num}
                </span>
                <span className="text-[clamp(15px,1.6vw,20px)] font-bold uppercase tracking-[2.2px] text-ink">{item.title}</span>
              </button>
            </H>
            <div id={pid} role="region" aria-labelledby={hid} hidden={!isOpen} className="grid grid-cols-[56px_1fr] pb-[17px] sm:grid-cols-[86px_1fr]">
              <p className="col-start-2 m-0 -mt-1.5 text-[clamp(14.5px,1.5vw,18px)] leading-[1.4] text-white/70">{item.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- LayerAccordion */

export type LayerTone = "blu" | "grn" | "org";

export type LayerItem = {
  num: string;
  name: string;
  tone: LayerTone;
  heading: string;
  body: ReactNode;
};

const layerText: Record<LayerTone, string> = { blu: "text-blu", grn: "text-grn", org: "text-org" };
const layerBg: Record<LayerTone, string> = { blu: "bg-blu", grn: "bg-grn", org: "bg-org" };

export type LayerAccordionProps = {
  items: LayerItem[];
  open?: number;
  defaultOpen?: number;
  onOpenChange?: (i: number) => void;
  idPrefix: string;
  /** Show the 23px color rail (desktop variant). */
  rail?: boolean;
  /** Art panel on the right from md up. */
  art?: ReactNode;
  headingAs?: "h3" | "h4";
  className?: string;
};

/** The three layers: one open in a framed panel, the rest at .8; optional rail tracks the open layer. */
export function LayerAccordion({
  items,
  open,
  defaultOpen = 0,
  onOpenChange,
  idPrefix,
  rail = true,
  art,
  headingAs: H = "h3",
  className,
}: LayerAccordionProps) {
  const [inner, setInner] = useState(defaultOpen);
  const current = open ?? inner;
  const { refs, onKeyDown } = useHeaderKeys(items.length);
  const set = (i: number) => {
    if (open === undefined) setInner(i);
    onOpenChange?.(i);
  };
  return (
    <div
      className={cn(
        "grid items-stretch gap-x-6 gap-y-6",
        rail && art ? "md:grid-cols-[23px_1fr_1fr]" : rail ? "md:grid-cols-[23px_1fr]" : art ? "md:grid-cols-2" : "",
        className,
      )}
    >
      {rail ? (
        <div className="hidden flex-col gap-[3px] md:flex" aria-hidden="true">
          {items.map((l, i) => (
            <div
              key={l.num}
              className={cn("w-[23px] rounded-[1px] transition-[flex-grow,height] duration-300 ease-quirq", layerBg[l.tone], current === i ? "flex-1" : "h-[49px]")}
            />
          ))}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col gap-[3px]">
        {items.map((l, i) => {
          const isOpen = current === i;
          const hid = `${idPrefix}-h-${i}`;
          const pid = `${idPrefix}-p-${i}`;
          return (
            <div
              key={l.num}
              className={cn(isOpen && "flex-1 rounded-[10px] border border-hair-strong bg-[rgba(20,20,22,.8)] px-5 py-5 backdrop-blur sm:px-6")}
            >
              <H className="m-0">
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  id={hid}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={pid}
                  onClick={() => set(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "flex w-full items-center gap-[22px] text-left text-[clamp(17px,1.8vw,24px)] font-semibold tracking-[0.02em]",
                    layerText[l.tone],
                    isOpen ? "" : "h-[49px] px-5 opacity-80 transition-opacity hover:opacity-100 sm:px-6",
                  )}
                >
                  <span className="tabular-nums">{l.num}</span>
                  <span className="uppercase">{l.name}</span>
                </button>
              </H>
              <div id={pid} role="region" aria-labelledby={hid} hidden={!isOpen}>
                <p className="m-0 mb-2.5 mt-5 max-w-[18ch] text-[clamp(20px,2.1vw,28px)] font-bold leading-[1.14] text-ink">{l.heading}</p>
                <p className="m-0 text-[clamp(14px,1.35vw,16px)] leading-[1.5] text-white/60">{l.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {art ? <div className="hidden min-h-[260px] md:block">{art}</div> : null}
    </div>
  );
}
