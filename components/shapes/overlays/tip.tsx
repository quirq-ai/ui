"use client";

// Tooltip, hover card and popover. Tip names an icon (hover or focus, a short delay, Escape
// hides it, its text can change while shown). HoverCard previews an item with a rich card
// that stays open while the pointer moves onto it. Both reposition when they would leave
// their boundary (the nearest [data-tip-boundary] or the viewport below a 64px top bar):
// they flip below and align to the near edge. Popover holds a small form, opens on click,
// moves focus in, and closes on Escape or an outside click with focus back on its trigger.
// NodeCard is the graph hover card surface.
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import type { ColorToken } from "@/lib/fixtures";
import { focusables, useOutsidePointer } from "./overlay-core";

export type TipPlacement = "top" | "bottom";
export type TipAlign = "center" | "start" | "end";
type Pos = { placement: TipPlacement; align: TipAlign };

/** Picks a side and alignment that keep a layer of about this size inside its boundary. */
export function placeLayer(el: HTMLElement, size: { width: number; height: number }, prefer: TipPlacement = "top"): Pos {
  const r = el.getBoundingClientRect();
  const host = el.closest("[data-tip-boundary]");
  const b = host ? host.getBoundingClientRect() : { top: 64, left: 0, right: window.innerWidth, bottom: window.innerHeight };
  const fitsTop = r.top - size.height - 10 >= b.top;
  const fitsBottom = r.bottom + size.height + 10 <= b.bottom;
  const placement: TipPlacement = prefer === "top" ? (fitsTop || !fitsBottom ? "top" : "bottom") : fitsBottom || !fitsTop ? "bottom" : "top";
  const cx = r.left + r.width / 2;
  const align: TipAlign =
    cx - size.width / 2 < b.left + 8 ? "start" : cx + size.width / 2 > b.right - 8 ? "end" : "center";
  return { placement, align };
}

const sideCls: Record<TipPlacement, string> = { top: "bottom-full mb-2", bottom: "top-full mt-2" };
const alignCls: Record<TipAlign, string> = { center: "left-1/2 -translate-x-1/2", start: "left-0", end: "right-0" };

function useHoverLayer({
  inDelay,
  outDelay,
  size,
  placement,
  align,
}: {
  inDelay: number;
  outDelay: number;
  size: { width: number; height: number };
  placement: TipPlacement | "auto";
  align: TipAlign | "auto";
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef({ id: 0 });
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState<Pos>({ placement: placement === "auto" ? "top" : placement, align: align === "auto" ? "center" : align });

  useEffect(() => {
    const t = timer.current;
    return () => window.clearTimeout(t.id);
  }, []);

  const measure = () => {
    const el = wrapRef.current;
    if (!el) return;
    const auto = placeLayer(el, size, placement === "auto" ? "top" : placement);
    setPos({ placement: placement === "auto" ? auto.placement : placement, align: align === "auto" ? auto.align : align });
  };
  const show = (immediate: boolean) => {
    window.clearTimeout(timer.current.id);
    measure();
    if (immediate) setShown(true);
    else timer.current.id = window.setTimeout(() => setShown(true), inDelay);
  };
  const hide = (immediate: boolean) => {
    window.clearTimeout(timer.current.id);
    if (immediate) setShown(false);
    else timer.current.id = window.setTimeout(() => setShown(false), outDelay);
  };

  const handlers = {
    onPointerEnter: () => show(false),
    onPointerLeave: () => hide(false),
    onFocus: () => show(true),
    onBlur: () => hide(true),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Escape" && shown) {
        e.stopPropagation();
        hide(true);
      }
    },
  };
  return { wrapRef, shown, pos, handlers };
}

function describe(child: ReactNode, id: string, on: boolean) {
  if (!on || !isValidElement(child)) return child;
  return cloneElement(child as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": id });
}

/* ----------------------------------------------------------------------------- Tip */

export type TipProps = {
  content: ReactNode;
  /** One focusable trigger (a button or link). */
  children: ReactNode;
  placement?: TipPlacement | "auto";
  align?: TipAlign | "auto";
  /** Force it visible (copy feedback, previews). */
  open?: boolean;
  /** Wire aria-describedby on the trigger. Off when the text repeats the aria-label. */
  describe?: boolean;
  delay?: number;
  className?: string;
};

/** Short label for an icon or a truncated value. */
export function Tip({ content, children, placement = "auto", align = "auto", open, describe: wire = true, delay = 150, className }: TipProps) {
  const id = useId();
  const { wrapRef, shown, pos, handlers } = useHoverLayer({ inDelay: delay, outDelay: 0, size: { width: 200, height: 40 }, placement, align });
  const visible = open ?? shown;
  return (
    <span ref={wrapRef} className={cn("relative inline-flex", className)} {...handlers}>
      {describe(children, id, wire)}
      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-[min(260px,calc(100vw-16px))] rounded-[8px] border border-hair-strong bg-s3 px-2.5 py-[7px] text-left text-[12px] font-normal leading-snug tracking-normal text-ink normal-case",
          "shadow-[0_5px_18px_rgba(0,0,0,0.4)] transition-opacity duration-150 starting:opacity-0",
          sideCls[open && placement !== "auto" ? placement : pos.placement],
          alignCls[open && align !== "auto" ? align : pos.align],
        )}
      >
        {content}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- HoverCard */

export type HoverCardProps = {
  /** The focusable trigger. */
  children: ReactNode;
  /** Card content (keep it non-interactive). */
  card: ReactNode;
  width?: number;
  height?: number;
  placement?: TipPlacement | "auto";
  align?: TipAlign | "auto";
  open?: boolean;
  openDelay?: number;
  closeDelay?: number;
  className?: string;
};

/** Rich preview on hover or focus; stays open while the pointer is on it. */
export function HoverCard({
  children,
  card,
  width = 262,
  height = 200,
  placement = "auto",
  align = "auto",
  open,
  openDelay = 100,
  closeDelay = 100,
  className,
}: HoverCardProps) {
  const id = useId();
  const { wrapRef, shown, pos, handlers } = useHoverLayer({ inDelay: openDelay, outDelay: closeDelay, size: { width, height }, placement, align });
  const visible = open ?? shown;
  const side = open && placement !== "auto" ? placement : pos.placement;
  const al = open && align !== "auto" ? align : pos.align;
  return (
    <span ref={wrapRef} className={cn("relative inline-flex", className)} {...handlers}>
      {describe(children, id, true)}
      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        className={cn("absolute z-50 block transition-opacity duration-150 starting:opacity-0", sideCls[side], alignCls[al])}
        style={{ width: `min(${width}px, calc(100vw - 32px))` } as CSSProperties}
      >
        {card}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- NodeCard */

export type NodeCardProps = {
  kicker: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  rows: { term: string; value: ReactNode; mono?: boolean }[];
  foot?: ReactNode;
  color?: ColorToken;
  className?: string;
};

/** Graph hover card: tinted art header, a short definition list and a hint footer. */
export function NodeCard({ kicker, title, sub, rows, foot, color = "blu", className }: NodeCardProps) {
  return (
    <span
      className={cn(
        "block w-full overflow-hidden rounded-[12px] border border-hair-strong bg-[rgba(18,18,20,0.97)] text-left shadow-[0_22px_50px_rgba(0,0,0,0.66)] backdrop-blur-xl",
        className,
      )}
    >
      <span
        className="block px-4 pb-3 pt-3.5"
        style={{ background: `linear-gradient(155deg, color-mix(in srgb, var(--${color}) 26%, transparent), color-mix(in srgb, var(--${color}) 3%, transparent) 70%)` }}
      >
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">{kicker}</span>
        <span className="mt-1 block text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">{title}</span>
        {sub ? <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">{sub}</span> : null}
      </span>
      <span className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-3 gap-y-1.5 px-4 py-3 text-[12px]">
        {rows.map((r) => (
          <span key={r.term} className="contents">
            <span className="pt-px font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">{r.term}</span>
            <span className={cn("min-w-0 break-words text-ink-dim", r.mono && "font-mono text-[11.5px]")}>{r.value}</span>
          </span>
        ))}
      </span>
      {foot ? <span className="block border-t border-hair-soft px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">{foot}</span> : null}
    </span>
  );
}

/* ----------------------------------------------------------------------------- Popover */

export type PopoverProps = {
  /** Trigger content. */
  trigger: ReactNode;
  /** aria-label for an icon-only trigger. */
  triggerLabel?: string;
  triggerClassName?: string;
  /** Accessible name of the popover. */
  label: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end";
  width?: number;
  /** Start open (catalog previews); focus is not moved on first paint. */
  defaultOpen?: boolean;
  className?: string;
};

/** Click-to-open panel with a small form. */
export function Popover({ trigger, triggerLabel, triggerClassName, label, children, align = "start", width = 240, defaultOpen = false, className }: PopoverProps) {
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerId = `${panelId}-trigger`;
  const pending = useRef(false);
  const [open, setOpen] = useState(defaultOpen);
  useOutsidePointer(wrapRef, open, () => setOpen(false));
  useEffect(() => {
    if (!open || !pending.current) return;
    pending.current = false;
    (focusables(panelRef.current)[0] ?? panelRef.current)?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    document.getElementById(triggerId)?.focus();
  };

  return (
    <div ref={wrapRef} className={cn("relative inline-flex", className)}>
      <button
        id={triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={triggerLabel}
        onClick={() => {
          pending.current = !open;
          setOpen(!open);
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          style={{ width: `min(${width}px, calc(100vw - 32px))` }}
          className={cn(
            "absolute top-full z-40 mt-2 rounded-[12px] border border-hair-strong bg-s2 p-3 text-ink shadow-[0_14px_36px_rgba(0,0,0,0.5)] outline-none",
            "transition-[opacity,transform] duration-150 starting:-translate-y-1 starting:opacity-0",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}
