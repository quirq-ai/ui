"use client";

// Phone frame: a space shown as a phone. A rounded body with an iOS status bar, a wallpaper,
// a home screen of apps with a dock, and the in-phone app frame (back, title, reload, new
// tab) that loads an app inside the phone. ResizablePhone adds the drag edges (pointer and
// keyboard), the expand toggle and the "370 px · phone" readout while dragging. Past 448 px
// the screen's container query swaps in the tablet wallpaper and a wider grid.
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ExternalLink, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ToneToken } from "@/lib/fixtures";
import { Spinner } from "@/components/ui";
import { Glyph } from "./glyphs";

export const PHONE_DEFAULT_WIDTH = 370;
export const PHONE_MIN_WIDTH = 300;
/** Where the screen's @md container query (28rem) shows the tablet layout. */
export const TABLET_WIDTH = 448;
const HANDLE = 14;

/* ----------------------------------------------------------------------------- status bar */

function WifiGlyph() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
      <path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.6 10.6 0 0 0 8 .4C5.1.4 2.5 1.5.5 3.4l1.2 1.3A8.9 8.9 0 0 1 8 2.2Z" />
      <path d="M8 5.6c1.5 0 2.8.5 3.9 1.5l1.2-1.3A7.4 7.4 0 0 0 8 3.8c-1.9 0-3.7.7-5.1 2l1.2 1.3c1-1 2.4-1.5 3.9-1.5Z" />
      <path d="M8 9c.6 0 1.1.2 1.6.6L8 11.4 6.4 9.6c.5-.4 1-.6 1.6-.6Z" />
    </svg>
  );
}

function BatteryGlyph() {
  return (
    <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
      <rect x="0.6" y="0.6" width="22" height="10.8" rx="3.2" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
      <rect x="2.4" y="2.4" width="16.4" height="7.2" rx="1.8" fill="currentColor" />
      <path d="M24.2 4v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

export type IosStatusBarProps = {
  /** Clock text. Fixed in demos so render stays deterministic. */
  time?: string;
  /** overlay: transparent over the wallpaper (home); solid: opaque for sub-pages. */
  tone?: "overlay" | "solid";
  className?: string;
};

/** iOS style status bar: clock on the left, wifi and battery on the right. */
export function IosStatusBar({ time = "09:41", tone = "overlay", className }: IosStatusBarProps) {
  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center justify-between px-6 text-[13.5px] font-semibold tabular-nums tracking-[0.01em] text-ink",
        tone === "solid" && "bg-[#0d0d0e]",
        className,
      )}
    >
      <span>
        <span className="sr-only">Time </span>
        {time}
      </span>
      <span className="flex items-center gap-1.5" aria-label="Wi-Fi connected, battery full" role="img">
        <WifiGlyph />
        <BatteryGlyph />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------- body and wallpaper */

const WALL_PHONE =
  "radial-gradient(120% 60% at 15% 0%, rgba(46,155,255,0.55), transparent 62%)," +
  "radial-gradient(90% 55% at 100% 38%, rgba(191,90,242,0.42), transparent 64%)," +
  "radial-gradient(110% 60% at 30% 105%, rgba(48,209,88,0.32), transparent 62%)," +
  "linear-gradient(180deg, #07070a, #050506)";

const WALL_TABLET =
  "radial-gradient(70% 70% at 0% 0%, rgba(46,155,255,0.5), transparent 62%)," +
  "radial-gradient(60% 70% at 55% 20%, rgba(47,210,255,0.26), transparent 60%)," +
  "radial-gradient(70% 80% at 100% 70%, rgba(191,90,242,0.4), transparent 62%)," +
  "radial-gradient(60% 60% at 20% 110%, rgba(255,159,10,0.24), transparent 60%)," +
  "linear-gradient(180deg, #07070a, #050506)";

/** Spectrum aurora wallpaper; the tablet arrangement shows once the screen is 448px wide. */
export function PhoneWallpaper({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="absolute inset-0 @md:hidden" style={{ background: WALL_PHONE }} />
      <div className="absolute inset-0 hidden @md:block" style={{ background: WALL_TABLET }} />
    </div>
  );
}

export type PhoneBodyProps = {
  children: ReactNode;
  /** Accessible name of the device region. */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** Rounded device body with a thin bezel. The screen inside is a size container. */
export function PhoneBody({ children, label = "Space on a phone", className, style }: PhoneBodyProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "relative min-w-0 rounded-[40px] border border-hair-strong bg-black p-[6px] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.04)]",
        className,
      )}
      style={style}
    >
      <div className="@container relative flex h-full flex-col overflow-hidden rounded-[34px] bg-[#050506]">{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- home screen */

export type PhoneHomeApp = {
  id: string;
  label: string;
  /** lucide glyph name */
  glyph: string;
  color: ToneToken;
  badge: number | null;
  dock: boolean;
};

function tileStyle(color: ToneToken): CSSProperties {
  const neutral = color === "ink" || color === "ink-dim" || color === "ink-faint";
  return {
    background: neutral
      ? "linear-gradient(160deg, #3a3a3e, #19191b)"
      : `linear-gradient(160deg, color-mix(in srgb, var(--${color}) 62%, #1d1d1f), color-mix(in srgb, var(--${color}) 22%, #0d0d0e))`,
  };
}

function AppIcon({ app, onOpen, disabled, showLabel = true }: { app: PhoneHomeApp; onOpen?: (id: string) => void; disabled?: boolean; showLabel?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen?.(app.id)}
      aria-label={app.badge ? `${app.label}, ${app.badge} new` : app.label}
      className="group flex min-w-0 flex-col items-center gap-1.5 rounded-[14px]! outline-offset-2 disabled:cursor-not-allowed"
    >
      <span
        className="relative grid size-[52px] place-items-center rounded-[14px] border border-white/10 text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-transform duration-150 group-enabled:group-hover:-translate-y-0.5 group-enabled:group-active:scale-95"
        style={tileStyle(app.color)}
      >
        <Glyph name={app.glyph} className="size-[24px]" strokeWidth={1.8} />
        {app.badge ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-red px-1 text-[11px] font-semibold tabular-nums text-white shadow-[0_0_0_2px_rgba(0,0,0,0.35)]">
            {app.badge}
          </span>
        ) : null}
      </span>
      {showLabel ? (
        <span className="max-w-full truncate text-[11px] font-medium text-ink [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{app.label}</span>
      ) : null}
    </button>
  );
}

export type PhoneHomeScreenProps = {
  apps: PhoneHomeApp[];
  onOpenApp?: (id: string) => void;
  /** Space API down: the dock dims to 50% and stops opening apps. */
  dockDisabled?: boolean;
  dockNote?: string;
  time?: string;
  /** Optional widget above the grid (space name, status). */
  header?: ReactNode;
};

/** Wallpaper, transparent status bar, app grid, page dots and a glass dock. */
export function PhoneHomeScreen({ apps, onOpenApp, dockDisabled = false, dockNote = "Space API is down", time, header }: PhoneHomeScreenProps) {
  const grid = apps.filter((a) => !a.dock);
  const dock = apps.filter((a) => a.dock);
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <PhoneWallpaper />
      <IosStatusBar time={time} tone="overlay" className="relative" />
      <div className={cn("relative flex min-h-0 flex-1 flex-col px-4 pt-2 @xs:px-5", dockDisabled ? "pb-[126px]" : "pb-[104px]")}>
        {header}
        <ul className="grid grid-cols-4 gap-x-2 gap-y-5 @xs:gap-x-3 @md:grid-cols-6 @md:gap-x-5">
          {grid.map((a) => (
            <li key={a.id} className="flex justify-center">
              <AppIcon app={a} onOpen={onOpenApp} />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex justify-center gap-1.5 pt-4" aria-hidden="true">
          <span className="size-1.5 rounded-full bg-white/85" />
          <span className="size-1.5 rounded-full bg-white/30" />
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-3">
        {dockDisabled ? (
          <p role="status" className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
            {dockNote}
          </p>
        ) : null}
        <ul
          aria-label={dockDisabled ? "Dock, unavailable" : "Dock"}
          className={cn(
            "grid grid-cols-4 rounded-[28px] border border-white/12 bg-white/[0.12] px-3 py-3 backdrop-blur-xl transition-opacity",
            dockDisabled && "opacity-50",
          )}
        >
          {dock.map((a) => (
            <li key={a.id} className="flex justify-center">
              <AppIcon app={a} onOpen={onOpenApp} disabled={dockDisabled} showLabel={false} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- in-phone app */

export type PhoneAppState = "loading" | "ready" | "stalled";

export type PhoneAppFrameProps = {
  title: string;
  state: PhoneAppState;
  onBack?: () => void;
  onReload?: () => void;
  onOpenExternal?: () => void;
  time?: string;
  /** The loaded app. Rendered under the loading veil, replaced while stalled. */
  children: ReactNode;
  /** Extra controls in the bar (a status chip). */
  barExtra?: ReactNode;
};

const barIcon =
  "grid size-8 place-items-center rounded-[8px]! text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink [&_svg]:size-4";

/**
 * An app loaded inside the phone instead of a new tab. A frame that has not loaded by the
 * timeout reads as stalled and offers the new-tab way out.
 */
export function PhoneAppFrame({ title, state, onBack, onReload, onOpenExternal, time, children, barExtra }: PhoneAppFrameProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b0b0c]">
      <IosStatusBar time={time} tone="solid" />
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-white/[0.08] bg-[#0d0d0e]/80 px-2 text-[12px] backdrop-blur-md">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back" className={barIcon}>
            <ChevronLeft aria-hidden="true" />
          </button>
        ) : null}
        <span className="truncate pl-1 font-medium text-ink">{title}</span>
        <span className="ml-auto flex items-center gap-1">
          {barExtra}
          {onReload ? (
            <button type="button" onClick={onReload} aria-label="Reload" title="Reload" className={barIcon}>
              <RefreshCw aria-hidden="true" className={cn(state === "loading" && "spin")} />
            </button>
          ) : null}
          {onOpenExternal ? (
            <button
              type="button"
              onClick={onOpenExternal}
              aria-label="New tab"
              title="Open in new tab"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px]! px-2 text-[12px] text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink [&_svg]:size-4"
            >
              <ExternalLink aria-hidden="true" />
              <span className="hidden @min-[22rem]:inline">New tab</span>
            </button>
          ) : null}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black" aria-busy={state === "loading" || undefined}>
        {state !== "stalled" ? <div className="scroll-thin h-full overflow-y-auto">{children}</div> : null}
        {state === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/60 p-4 text-center text-[12px] text-ink">
            <span className="flex items-center gap-2">
              <Spinner size="sm" label={null} />
              Loading {title}…
            </span>
          </div>
        ) : null}
        {state === "stalled" ? (
          <div role="alert" className="absolute inset-0 grid place-items-center p-5 text-center text-[12px] text-ink">
            <div className="max-w-[260px] space-y-3">
              <p className="leading-relaxed">
                {title} is not loading inside the frame (cookies or frame headers).
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {onOpenExternal ? (
                  <button
                    type="button"
                    onClick={onOpenExternal}
                    className="inline-flex h-7 items-center gap-1.5 rounded-[8px]! border border-hair bg-s2 px-2.5 text-[12px] text-ink hover:bg-s3 [&_svg]:size-3.5"
                  >
                    <ExternalLink aria-hidden="true" />
                    Open in new tab
                  </button>
                ) : null}
                {onReload ? (
                  <button
                    type="button"
                    onClick={onReload}
                    className="inline-flex h-7 items-center gap-1.5 rounded-[8px]! px-2.5 text-[12px] text-ink-dim hover:bg-white/[0.08] hover:text-ink [&_svg]:size-3.5"
                  >
                    <RefreshCw aria-hidden="true" />
                    Retry
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- resizable phone */

export type ResizablePhoneState = { width: number; tablet: boolean; expanded: boolean };

export type ResizablePhoneProps = {
  defaultWidth?: number;
  minWidth?: number;
  /** Phone height in px. */
  height?: number;
  defaultExpanded?: boolean;
  /** Show the dragging look without a pointer (catalog specimen). */
  forceDragging?: boolean;
  label?: string;
  /** Called with the width shown: after a drag or key step, live while dragging, and when a narrow stage clamps it. */
  onWidthChange?: (width: number) => void;
  children: (state: ResizablePhoneState) => ReactNode;
  className?: string;
};

type Drag = { startX: number; start: number; side: "left" | "right" };

/**
 * The phone, centered at the width it was left at. Drag either edge (it widens on both sides),
 * use the arrow keys on a focused edge, double-click an edge for the default width, or expand
 * it to fill the stage.
 */
export function ResizablePhone({
  defaultWidth = PHONE_DEFAULT_WIDTH,
  minWidth = PHONE_MIN_WIDTH,
  height = 600,
  defaultExpanded = false,
  forceDragging = false,
  label = "Space on a phone",
  onWidthChange,
  children,
  className,
}: ResizablePhoneProps) {
  const [width, setWidthState] = useState(defaultWidth);
  const [live, setLive] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [maxWidth, setMaxWidth] = useState(760);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setMaxWidth(Math.max(minWidth, Math.floor(entry.contentRect.width - 2 * HANDLE))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [minWidth]);

  const fit = (w: number) => Math.round(Math.min(Math.max(w, minWidth), maxWidth));
  const shown = fit(live ?? width);
  const dragging = live !== null || forceDragging;
  const tablet = shown >= TABLET_WIDTH;

  function setWidth(next: number) {
    setWidthState(fit(next));
  }

  /* report the width actually shown, including clamps from a narrow stage and live drags */
  useEffect(() => {
    onWidthChange?.(shown);
  }, [shown, onWidthChange]);

  const start = (side: Drag["side"]) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, start: shown, side };
    setLive(shown);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    setLive(fit(d.start + 2 * (d.side === "right" ? dx : -dx)));
  };
  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dx = e.clientX - d.startX;
    setLive(null);
    setWidth(d.start + 2 * (d.side === "right" ? dx : -dx));
  };
  const onKey = (side: Drag["side"]) => (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 64 : 16;
    const outward = side === "right" ? "ArrowRight" : "ArrowLeft";
    const inward = side === "right" ? "ArrowLeft" : "ArrowRight";
    if (e.key === outward) setWidth(shown + 2 * step);
    else if (e.key === inward) setWidth(shown - 2 * step);
    else if (e.key === "Home") setWidth(minWidth);
    else if (e.key === "End") setWidth(maxWidth);
    else if (e.key === "Enter") setWidth(PHONE_DEFAULT_WIDTH);
    else return;
    e.preventDefault();
  };

  const handle = (side: Drag["side"]) => (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Phone width, ${side} edge`}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={shown}
      aria-valuetext={`${shown} px, ${tablet ? "tablet" : "phone"}`}
      tabIndex={0}
      title="Drag to resize, double-click for the default width"
      onPointerDown={start(side)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={() => setWidth(PHONE_DEFAULT_WIDTH)}
      onKeyDown={onKey(side)}
      className="group flex w-3.5 shrink-0 cursor-ew-resize touch-none items-center justify-center rounded-full outline-none"
    >
      <span
        className={cn(
          "h-14 w-1 rounded-full transition-colors group-hover:bg-white/40 group-focus-visible:bg-ink",
          dragging ? "bg-white/55" : "bg-white/15",
        )}
      />
    </div>
  );

  return (
    <div ref={stageRef} className={cn("relative flex min-w-0 flex-col items-center", className)}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-pressed={expanded}
        aria-label={expanded ? "Shrink the phone" : "Expand the phone"}
        title={expanded ? "Shrink the phone" : "Expand the phone"}
        className="absolute right-0 top-0 z-20 grid size-8 place-items-center rounded-full! border border-hair-strong bg-[rgba(30,30,32,0.8)] text-ink backdrop-blur-md transition-colors hover:bg-[rgba(48,48,52,0.9)] [&_svg]:size-4"
      >
        {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      </button>

      <div className={cn("flex max-w-full items-stretch justify-center", expanded ? "w-full pr-10" : "")}>
        {!expanded && handle("left")}
        <PhoneBody
          label={label}
          className={cn("shrink", expanded ? "w-full" : "")}
          style={expanded ? { height } : { width: shown, maxWidth: "100%", height }}
        >
          {children({ width: shown, tablet, expanded })}
        </PhoneBody>
        {!expanded && handle("right")}
      </div>

      {dragging ? (
        <span
          role="status"
          className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 font-mono text-[11.5px] tabular-nums text-black shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
        >
          {shown} px · {tablet ? "tablet" : "phone"}
        </span>
      ) : null}
    </div>
  );
}
