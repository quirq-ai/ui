"use client";

// Docks and action bars:
//  GlassDock     liquid glass dock of app tiles (Overview, Files, Secrets, Usage); springy hover;
//                disabled as a whole when the space API is down (links stop working)
//  NavigatorDock floating dock: the space crumb, pinned module tabs, then closable project tabs;
//                arrow keys move between tabs, middle-click closes an opened tab
//  ActionBar     HUD action pills with key badges (Land L, Overlay G, Tours T, Details)
//  TouchPad      round touch controls with key badges, for touch screens
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { moveFocus } from "./menu";

/* ----------------------------------------------------------------------------- GlassDock */

export type DockApp = { id: string; label: string; href: string; icon: ReactNode; /** Tile gradient, as a CSS background. */ tile: string };

export type GlassDockProps = {
  apps: DockApp[];
  active?: string;
  onOpen?: (id: string) => void;
  /** The space API is down: the dock dims and its links go nowhere. */
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

/** Liquid glass dock: blur, frosted tint and an edge shine over the wallpaper. */
export function GlassDock({ apps, active, onOpen, disabled = false, "aria-label": ariaLabel = "Dock", className }: GlassDockProps) {
  const filterId = useId().replace(/:/g, "");
  return (
    <nav aria-label={ariaLabel} data-disabled={disabled || undefined} className={cn("flex justify-center", className)}>
      {disabled ? <span className="sr-only">Unavailable while the space API is down.</span> : null}
      <svg aria-hidden="true" className="absolute size-0">
        <filter id={`glass-${filterId}`} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div
        className={cn(
          "group/dock relative isolate w-[90%] max-w-[400px] overflow-hidden rounded-[30px] shadow-[0_6px_6px_rgba(0,0,0,0.2),0_0_20px_rgba(0,0,0,0.1)]",
          "transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,2.2)] hover:rounded-[36px]",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden backdrop-blur-[3px]" style={{ filter: `url(#glass-${filterId})` }} />
        <div aria-hidden="true" className="absolute inset-0 z-[1] bg-white/[0.14]" />
        <div aria-hidden="true" className="absolute inset-0 z-[2] shadow-[inset_2px_2px_1px_0_rgba(255,255,255,0.35),inset_-1px_-1px_1px_1px_rgba(255,255,255,0.25)]" />
        <ul className="relative z-[3] flex items-center justify-evenly p-2.5 transition-[padding] duration-[400ms] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,2.2)] group-hover/dock:p-3">
          {apps.map((a) => {
            const on = a.id === active;
            return (
              <li key={a.id}>
                <a
                  href={disabled ? "#" : a.href}
                  aria-label={a.label}
                  aria-current={on ? "page" : undefined}
                  aria-disabled={disabled || undefined}
                  tabIndex={disabled ? -1 : undefined}
                  title={a.label}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) onOpen?.(a.id);
                  }}
                  className="group/app relative flex flex-col items-center rounded-[14px]!"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-12 items-center justify-center rounded-[14px] border border-white/15 text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-transform duration-200 group-hover/app:scale-95 group-active/app:scale-90 [&_svg]:size-[22px]"
                    style={{ background: a.tile }}
                  >
                    {a.icon}
                  </span>
                  <span aria-hidden="true" className={cn("absolute -bottom-1.5 size-1 rounded-full bg-white transition-opacity", on ? "opacity-100" : "opacity-0")} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------------------- NavigatorDock */

export type NavTab = {
  id: string;
  label: string;
  /** Pinned modules show their icon and cannot close; opened tabs show initials and can. */
  icon?: ReactNode;
  pinned?: boolean;
};

export type NavigatorDockProps = {
  /** The space crumb at the start of the dock. */
  crumb: ReactNode;
  tabs: NavTab[];
  active: string;
  onShow: (id: string) => void;
  onClose: (id: string) => void;
  className?: string;
};

function initialsOf(label: string) {
  const w = label.split(/[\s_-]+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : label.slice(0, 2)).toUpperCase();
}

/** Floating dock: crumb, divider, pinned modules, divider, opened tabs. */
export function NavigatorDock({ crumb, tabs, active, onShow, onClose, className }: NavigatorDockProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const pinned = tabs.filter((t) => t.pinned);
  const opened = tabs.filter((t) => !t.pinned);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const list = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
    if (moveFocus(e, list, "horizontal")) {
      const id = (document.activeElement as HTMLElement | null)?.dataset.tab;
      if (id) onShow(id);
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      const id = (document.activeElement as HTMLElement | null)?.dataset.tab;
      const t = tabs.find((x) => x.id === id);
      if (t && !t.pinned) {
        e.preventDefault();
        onClose(t.id);
      }
    }
  }

  const item = (t: NavTab) => {
    const shown = t.id === active;
    return (
      <div key={t.id} className="group/tab relative shrink-0">
        <button
          type="button"
          role="tab"
          data-tab={t.id}
          aria-selected={shown}
          aria-label={t.label}
          aria-keyshortcuts={t.pinned ? undefined : "Delete"}
          tabIndex={shown ? 0 : -1}
          onClick={() => onShow(t.id)}
          onAuxClick={(e) => {
            if (e.button !== 1 || t.pinned) return;
            e.preventDefault();
            onClose(t.id);
          }}
          className={cn(
            "relative flex size-10 items-center justify-center rounded-[12px]! transition-colors [&_svg]:size-5",
            shown ? "bg-s3 text-ink shadow-sm ring-1 ring-hair-strong" : "text-ink-dim hover:bg-s2 hover:text-ink",
          )}
        >
          {t.pinned && t.icon ? (
            <span aria-hidden="true" className="inline-flex">{t.icon}</span>
          ) : (
            <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-[8px] border border-hair bg-s2 font-mono text-[10.5px] font-semibold text-ink">
              {initialsOf(t.label)}
            </span>
          )}
          <span aria-hidden="true" className={cn("absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#83d63a] transition-opacity", shown ? "opacity-100" : "opacity-0")} />
        </button>
        {/* The tab is named by aria-label; the tag is visual only, so the tablist owns nothing but tabs. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 hidden -translate-x-1/2 whitespace-nowrap rounded-[6px] border border-hair-strong bg-s3 px-2 py-1 text-[11.5px] text-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)] group-hover/tab:block group-focus-within/tab:block"
        >
          {t.label}
        </span>
        {!t.pinned ? (
          // Pointer shortcut for closing. Keyboard and screen reader users close with Delete on the tab.
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            title={`Close ${t.label}`}
            onClick={() => onClose(t.id)}
            className={cn(
              "absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full! border border-hair-strong bg-s2 text-ink-dim shadow-sm transition-opacity hover:text-ink [&_svg]:size-2.5",
              shown ? "opacity-100" : "opacity-0 group-hover/tab:opacity-100 max-md:opacity-100",
            )}
          >
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className={cn("flex w-full min-w-0 justify-center", className)}>
      <div className="flex min-w-0 max-w-full items-center gap-1 rounded-[16px] border border-hair bg-[rgba(20,20,22,0.85)] p-1.5 shadow-lg shadow-black/30 backdrop-blur-md">
        <div className="shrink-0">{crumb}</div>
        <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-hair" />
        <nav aria-label="Navigator" className="flex min-w-0">
          <div
            ref={listRef}
            role="tablist"
            aria-label="Views"
            onKeyDown={onKeyDown}
            className="-my-1.5 flex min-w-0 items-center gap-1 overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {pinned.map(item)}
            {opened.length ? <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-hair" /> : null}
            {opened.map(item)}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- ActionBar */

export type ActionPill = {
  id: string;
  label?: string;
  /** Key badge such as L, G, T. */
  kbd?: string;
  icon?: ReactNode;
  /** Required when the pill is icon only. */
  "aria-label"?: string;
  disabled?: boolean;
  /** For disclosure pills (Details). */
  expanded?: boolean;
  pressed?: boolean;
};

/** HUD action bar: dark pills with mono key badges. */
export function ActionBar({ actions, onAction, "aria-label": ariaLabel = "Actions", className }: { actions: ActionPill[]; onAction: (id: string) => void; "aria-label"?: string; className?: string }) {
  return (
    <div role="toolbar" aria-label={ariaLabel} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          disabled={a.disabled}
          aria-label={a["aria-label"]}
          aria-expanded={a.expanded}
          aria-pressed={a.pressed}
          aria-keyshortcuts={a.kbd}
          onClick={() => onAction(a.id)}
          className={cn(
            "inline-flex h-[34px] items-center gap-2 rounded-[5px]! border px-2.5 text-[10.5px] font-medium uppercase tracking-[0.08em] transition-colors [&_svg]:size-3.5",
            a.pressed || a.expanded ? "border-hair-strong bg-s3 text-ink" : "border-hair bg-[rgba(12,12,14,0.9)] text-ink-dim hover:border-hair-strong hover:text-ink",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-ink-dim",
          )}
        >
          {a.kbd ? (
            <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] border border-hair-strong bg-white/[0.05] px-1 font-mono text-[10px] text-ink">{a.kbd}</kbd>
          ) : null}
          {a.icon ? <span aria-hidden="true" className="inline-flex">{a.icon}</span> : null}
          {a.label ? <span>{a.label}</span> : null}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- TouchPad */

export type TouchKey = { id: string; label: string; icon: ReactNode; kbd?: string };

/** Round touch controls with key badges. Set touchOnly to hide it on devices with a fine pointer. */
export function TouchPad({
  keys,
  onPress,
  active,
  touchOnly = false,
  "aria-label": ariaLabel = "Touch controls",
  className,
}: {
  keys: TouchKey[];
  onPress: (id: string) => void;
  active?: string | null;
  touchOnly?: boolean;
  "aria-label"?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("grid w-fit max-w-full grid-cols-6 gap-2", touchOnly && "[@media(hover:hover)_and_(pointer:fine)]:hidden", className)}
    >
      {keys.map((k) => (
        <button
          key={k.id}
          type="button"
          aria-label={k.label}
          aria-keyshortcuts={k.kbd}
          onClick={() => onPress(k.id)}
          className={cn(
            "relative flex size-11 items-center justify-center rounded-full! border transition-colors [&_svg]:size-[18px]",
            active === k.id ? "border-hair-strong bg-s3 text-ink" : "border-hair bg-[rgba(12,12,14,0.9)] text-ink-dim hover:text-ink active:bg-s3",
          )}
        >
          <span aria-hidden="true" className="inline-flex">{k.icon}</span>
          {k.kbd ? (
            <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 rounded-[3px] border border-hair bg-bg px-1 font-mono text-[9px] leading-[14px] text-ink-faint">
              {k.kbd}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
