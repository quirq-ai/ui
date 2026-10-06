"use client";

// Segmented controls and tabs that switch a view in place:
//  PillTabs   primary section tabs with count badges, 1 to 9 keys, scrollable strip
//  SubNav     underline sub-nav with an actions slot; wraps to two rows on narrow frames
//  LensSwitch tinted segment links for data views (List | Graph | Tree, By file | By project)
//  ToggleGroup joined outline toggles (Today | 7 days | 30 days | All), optional counts
//  ViewTabs   uppercase visualizer tabs with a bone active segment (Map | Dashboards | Chart)
// Every control takes value + onChange; disabled options are skipped by the keyboard.
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- shared */

export type SegmentItem<T extends string = string> = {
  id: T;
  label: ReactNode;
  /** Count badge or suffix. null means unknown and is not shown as 0. */
  count?: number | null;
  icon?: ReactNode;
  disabled?: boolean;
  /** Accessible name when the label is not plain text. */
  "aria-label"?: string;
};

/** Arrow keys, Home and End over enabled items; selects as it moves (radio behavior). */
function rovingKey<T extends string>(
  e: KeyboardEvent,
  items: SegmentItem<T>[],
  current: T,
  select: (id: T) => void,
  refs: (HTMLElement | null)[],
) {
  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
  if (!enabled.length) return;
  const pos = Math.max(0, enabled.indexOf(items.findIndex((it) => it.id === current)));
  let next: number | undefined;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(pos + 1) % enabled.length];
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(pos - 1 + enabled.length) % enabled.length];
  else if (e.key === "Home") next = enabled[0];
  else if (e.key === "End") next = enabled[enabled.length - 1];
  if (next === undefined) return;
  e.preventDefault();
  select(items[next].id);
  refs[next]?.focus();
}

/* ----------------------------------------------------------------------------- PillTabs */

export type PillTabsProps<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  /** Number keys 1 to 9 pick a tab while focus is inside the strip. */
  shortcuts?: boolean;
  /** Hash route for each tab, rendered as the link href: (id) => `#/${id}`. */
  hrefFor?: (id: T) => string;
  /** md drops to the compact 7px 10px padding under 480px, as the space dashboard does;
      compact keeps it at every width. */
  size?: "md" | "compact";
  className?: string;
};

/** Primary section tabs: Projects · Agents · Inbox 3 · Setup. Links with aria-current. */
export function PillTabs<T extends string>({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  shortcuts = false,
  hrefFor,
  size = "md",
  className,
}: PillTabsProps<T>) {
  const strip = useRef<HTMLDivElement | null>(null);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Keep the active tab inside the scrollable strip without moving the page.
  useEffect(() => {
    const el = strip.current;
    const i = items.findIndex((it) => it.id === value);
    const tab = refs.current[i];
    if (!el || !tab) return;
    const left = tab.offsetLeft;
    if (left < el.scrollLeft) el.scrollLeft = left - 8;
    else if (left + tab.offsetWidth > el.scrollLeft + el.clientWidth) el.scrollLeft = left + tab.offsetWidth - el.clientWidth + 8;
  }, [value, items]);

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (shortcuts && /^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const it = items[Number(e.key) - 1];
      if (it && !it.disabled) {
        e.preventDefault();
        onChange(it.id);
        refs.current[Number(e.key) - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
      const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
      const at = enabled.indexOf(refs.current.findIndex((r) => r === document.activeElement));
      const next =
        e.key === "Home" ? enabled[0] : e.key === "End" ? enabled[enabled.length - 1] : enabled[(at + (e.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
      if (next === undefined) return;
      e.preventDefault();
      refs.current[next]?.focus();
    }
  }

  return (
    <nav aria-label={ariaLabel} onKeyDown={onKeyDown} className={cn("max-w-full min-w-0", className)}>
      <div
        ref={strip}
        className="relative flex w-max max-w-full gap-0.5 overflow-x-auto rounded-[10px] border border-hair bg-s2 p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => {
          const on = it.id === value;
          return (
            <a
              key={it.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              href={hrefFor ? hrefFor(it.id) : `#${it.id}`}
              aria-current={on ? "page" : undefined}
              aria-disabled={it.disabled || undefined}
              aria-keyshortcuts={shortcuts && i < 9 ? String(i + 1) : undefined}
              tabIndex={it.disabled ? -1 : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (!it.disabled) onChange(it.id);
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[7px]! text-[13px] transition-[color,background-color] duration-150 ease-quirq focus-visible:outline-offset-[-2px]!",
                size === "compact" ? "px-2.5 py-[7px]" : "px-[15px] py-[7px] max-[480px]:px-2.5",
                on ? "bg-ink font-semibold text-black" : "font-medium text-ink-dim hover:text-ink",
                it.disabled && "pointer-events-none opacity-40",
              )}
            >
              {it.icon ? <span aria-hidden="true" className="inline-flex [&_svg]:size-3.5">{it.icon}</span> : null}
              {it.label}
              {typeof it.count === "number" && it.count > 0 ? (
                <span
                  className={cn(
                    "inline-flex h-[17px] min-w-4 items-center justify-center rounded-full px-[5px] text-[11px] font-semibold leading-none tabular-nums",
                    on ? "bg-black text-ink" : "bg-ink text-black",
                  )}
                >
                  {it.count}
                  <span className="sr-only"> new</span>
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------------------- SubNav */

export type SubNavProps<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  /** Right side tools: page actions, a graph root picker. */
  actions?: ReactNode;
  hrefFor?: (id: T) => string;
  className?: string;
};

/** Section sub-nav: Overview · Data · Timeline · Manage with a 2px underline on the current link. */
export function SubNav<T extends string>({ items, value, onChange, "aria-label": ariaLabel, actions, hrefFor, className }: SubNavProps<T>) {
  return (
    <div className={cn("@container border-b border-hair bg-bg", className)}>
      <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2 px-4 pb-2 pt-2.5 @[900px]:flex-nowrap @[900px]:px-[26px] @[900px]:py-3">
        <nav
          aria-label={ariaLabel}
          className="scroll-thin flex min-w-0 flex-[1_1_100%] items-center gap-1 overflow-x-auto @[900px]:flex-initial"
        >
          {items.map((it) => {
            const on = it.id === value;
            return (
              <a
                key={it.id}
                href={hrefFor ? hrefFor(it.id) : `#${it.id}`}
                aria-current={on ? "page" : undefined}
                aria-disabled={it.disabled || undefined}
                tabIndex={it.disabled ? -1 : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (!it.disabled) onChange(it.id);
                }}
                className={cn(
                  "inline-flex min-h-[38px] flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-t-[5px]! border-b-2 px-2.5 py-2 text-[12px] font-medium transition-colors focus-visible:outline-offset-[-2px]!",
                  on ? "border-ink text-ink" : "border-transparent text-ink-faint hover:bg-s2 hover:text-ink",
                  it.disabled && "pointer-events-none opacity-40",
                )}
              >
                {it.label}
                {typeof it.count === "number" ? <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{it.count}</span> : null}
              </a>
            );
          })}
        </nav>
        {actions ? <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 @[900px]:ml-auto">{actions}</div> : null}
      </div>
    </div>
  );
}

/** Sub-nav action button: min-height 36, hairline, radius 8, 11px. Busy shows a wait cursor at 55%. */
export function SubNavAction({
  children,
  busy = false,
  onClick,
  icon,
}: {
  children: ReactNode;
  busy?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy || undefined}
      className="inline-flex min-h-9 flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px]! border border-hair bg-transparent px-2.5 py-[7px] text-[11px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-wait disabled:opacity-55 [&_svg]:size-3.5"
    >
      {icon ? <span aria-hidden="true" className={cn("inline-flex", busy && "spin")}>{icon}</span> : null}
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------------------- LensSwitch */

export type LensSwitchProps<T extends string> = {
  items: SegmentItem<T>[];
  /** Show this item in its hover look (static state samples). */
  hoverId?: T;
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  hrefFor?: (id: T) => string;
  className?: string;
};

/** Data view switch: List · Graph · Tree. Links in a soft track; the current one is tinted. */
export function LensSwitch<T extends string>({ items, value, onChange, "aria-label": ariaLabel, hrefFor, hoverId, className }: LensSwitchProps<T>) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("inline-flex w-fit max-w-full flex-none items-center gap-1 overflow-x-auto rounded-[10px] border border-hair-soft bg-s2 p-[3px] [scrollbar-width:none]", className)}
    >
      {items.map((it) => {
        const on = it.id === value;
        return (
          <a
            key={it.id}
            href={hrefFor ? hrefFor(it.id) : `#${it.id}`}
            aria-current={on ? "page" : undefined}
            aria-disabled={it.disabled || undefined}
            tabIndex={it.disabled ? -1 : undefined}
            title={it.disabled ? "Not available for this project yet" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!it.disabled) onChange(it.id);
            }}
            className={cn(
              "inline-flex min-h-[34px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px]! border px-[13px] py-[7px] text-[12px] font-medium transition-colors focus-visible:outline-offset-[-2px]! [&_svg]:size-3.5",
              on ? "border-hair-strong bg-white/[0.07] text-ink" : it.id === hoverId ? "border-transparent bg-s3 text-ink" : "border-transparent text-ink-dim hover:bg-s3 hover:text-ink",
              it.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-ink-dim",
            )}
          >
            {it.icon ? <span aria-hidden="true" className="inline-flex">{it.icon}</span> : null}
            {it.label}
          </a>
        );
      })}
    </nav>
  );
}

/* ----------------------------------------------------------------------------- ToggleGroup */

export type ToggleGroupProps<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  /** outline: joined hairline buttons, active s3 with ink text. filled: active ink fill (issue states with counts). */
  variant?: "outline" | "filled";
  size?: "sm" | "md";
  className?: string;
};

/** Joined single-choice toggles. A radiogroup: arrows move and select, Home and End jump. */
export function ToggleGroup<T extends string>({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  variant = "outline",
  size = "sm",
  className,
}: ToggleGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledFirst = items.findIndex((it) => !it.disabled);
  const checkedIdx = items.findIndex((it) => it.id === value && !it.disabled);
  const tabStop = checkedIdx >= 0 ? checkedIdx : enabledFirst;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex w-fit max-w-full items-stretch overflow-x-auto [scrollbar-width:none]", className)}
    >
      {items.map((it, i) => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={it["aria-label"]}
            disabled={it.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => onChange(it.id)}
            onKeyDown={(e) => rovingKey(e, items, value, onChange, refs.current)}
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border font-medium transition-colors focus-visible:z-10 focus-visible:outline-offset-[-2px]!",
              "rounded-none! first:rounded-l-[8px]! last:rounded-r-[8px]! [&+&]:-ml-px",
              size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[12.5px]",
              on
                ? variant === "filled"
                  ? "z-[1] border-ink bg-ink text-black"
                  : "z-[1] border-hair-strong bg-s3 text-ink"
                : "border-hair bg-transparent text-ink-dim hover:bg-s2 hover:text-ink",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {it.icon ? <span aria-hidden="true" className="inline-flex [&_svg]:size-3.5">{it.icon}</span> : null}
            {it.label}
            {it.count !== undefined ? (
              <span className={cn("font-mono text-[11px] tabular-nums", on && variant === "filled" ? "text-black/70" : "text-ink-faint")}>
                {it.count === null ? "Unavailable" : it.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- ViewTabs */

export type ViewTabsProps<T extends string> = {
  items: SegmentItem<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  className?: string;
};

/** Visualizer view tabs: MAP · DASHBOARDS · CHART. Bone active segment with a soft shadow. */
export function ViewTabs<T extends string>({ items, value, onChange, "aria-label": ariaLabel, className }: ViewTabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIdx = items.findIndex((it) => it.id === value && !it.disabled);
  const tabStop = checkedIdx >= 0 ? checkedIdx : items.findIndex((it) => !it.disabled);
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-[10px] border border-hair bg-[#0b0b0d] p-[3px] [scrollbar-width:none]", className)}
    >
      {items.map((it, i) => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={it.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => onChange(it.id)}
            onKeyDown={(e) => rovingKey(e, items, value, onChange, refs.current)}
            className={cn(
              "inline-flex h-[30px] min-w-[84px] shrink-0 items-center justify-center gap-1.5 rounded-[7px]! px-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-offset-[-2px]!",
              on ? "bg-[#ece9df] text-[#15181d] shadow-[0_1px_8px_rgba(0,0,0,0.35)]" : "text-ink-faint hover:text-ink",
              "disabled:pointer-events-none disabled:opacity-35",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
