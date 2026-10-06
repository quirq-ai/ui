"use client";

// Filter chips that narrow a list in place, with counts:
//  FilterChips   mono uppercase chips; "pill" (ink fill when on, the quirq site filter),
//                "source" (separate pills, ink border when on), "year" (radius 6 chips)
//  StatusTrack   joined OPEN | DONE | ALL track with a filled active segment
//  CategoryTabs  underline tabs tinted by each category's color
//  NavPill       galileo's lime "Sources" pill link with aria-current
// Single select. Chips are toggle buttons (aria-pressed); arrow keys move between them.
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneBg, type Tone } from "@/components/ui/tones";

export type FilterChip<T extends string = string> = {
  id: T;
  label: ReactNode;
  /** Count suffix at 75% opacity. null reads "Unavailable", never 0. */
  count?: number | null;
  disabled?: boolean;
};

function arrowMove(e: KeyboardEvent<HTMLElement>, refs: (HTMLButtonElement | null)[]) {
  if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
  const list = refs.filter((r): r is HTMLButtonElement => !!r && !r.disabled);
  const i = list.indexOf(document.activeElement as HTMLButtonElement);
  const next =
    e.key === "Home" ? list[0] : e.key === "End" ? list[list.length - 1] : list[(i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length];
  if (!next) return;
  e.preventDefault();
  next.focus();
}

function CountSuffix({ count, on }: { count: number | null | undefined; on?: boolean }) {
  if (count === undefined) return null;
  return (
    <span className={cn("ml-[7px] tabular-nums", count === null ? "normal-case tracking-normal opacity-60" : "opacity-75", on && "opacity-80")}>
      {count === null ? "Unavailable" : count}
    </span>
  );
}

/* ----------------------------------------------------------------------------- FilterChips */

export type FilterChipsProps<T extends string> = {
  items: FilterChip<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  variant?: "pill" | "source" | "year";
  /** Pill size: md is the research filter (36px), sm the writings filter (28px). */
  size?: "md" | "sm";
  /** One sideways row instead of wrapping. */
  scroll?: boolean;
  /** Show this chip in its hover look (static state samples). */
  hoverId?: T;
  className?: string;
};

const chipBase =
  "inline-flex shrink-0 items-center whitespace-nowrap border font-mono uppercase transition-[background-color,border-color,color] duration-[180ms] disabled:pointer-events-none disabled:opacity-40";

/** Mono uppercase filter chips: ALL 14 · FOUNDATIONS 2 · EXPERIMENTS 9. */
export function FilterChips<T extends string>({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  variant = "pill",
  size = "md",
  scroll = false,
  hoverId,
  className,
}: FilterChipsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onKeyDown={(e) => arrowMove(e, refs.current)}
      className={cn("flex max-w-full gap-2", scroll ? "scroll-thin flex-nowrap overflow-x-auto pb-1" : "flex-wrap", variant !== "pill" && "gap-1.5", className)}
    >
      {items.map((it, i) => {
        const on = it.id === value;
        const hover = !on && it.id === hoverId;
        return (
          <button
            key={it.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            aria-pressed={on}
            disabled={it.disabled}
            onClick={() => onChange(it.id)}
            className={cn(
              chipBase,
              variant === "pill" && [
                size === "sm" ? "h-7 rounded-full! px-3 text-[10px] tracking-[0.12em]" : "h-9 rounded-full! px-[17px] text-[11px] tracking-[0.14em]",
                on
                  ? "border-ink bg-ink text-black"
                  : hover
                    ? "border-white/[0.22] bg-white/[0.04] text-ink"
                    : "border-hair bg-white/[0.04] text-ink-dim hover:border-white/[0.22] hover:text-ink",
              ],
              variant === "source" && [
                "h-7 rounded-full! px-2.5 text-[10.5px] tracking-[0.06em]",
                on
                  ? "border-white/40 bg-s3 text-ink"
                  : hover
                    ? "border-hair-strong bg-s2 text-ink"
                    : "border-hair-soft bg-s2 text-ink-dim hover:border-hair-strong hover:text-ink",
              ],
              variant === "year" && [
                "h-7 rounded-[6px]! px-2.5 text-[10.5px] tracking-[0.08em]",
                on
                  ? "border-hair-strong bg-white/[0.08] text-ink"
                  : hover
                    ? "border-hair bg-s2 text-ink"
                    : "border-hair-soft bg-transparent text-ink-dim hover:border-hair hover:text-ink",
              ],
            )}
          >
            {it.label}
            <CountSuffix count={it.count} on={on} />
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- StatusTrack */

export type StatusTrackProps<T extends string> = {
  items: FilterChip<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  className?: string;
};

/** Joined status filter: OPEN | DONE | ALL. A radiogroup on a soft pill track. */
export function StatusTrack<T extends string>({ items, value, onChange, "aria-label": ariaLabel, className }: StatusTrackProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
  const checked = items.findIndex((it) => it.id === value);
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const pos = enabled.indexOf(i);
    let n: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") n = enabled[0];
    else if (e.key === "End") n = enabled[enabled.length - 1];
    if (n === undefined) return;
    e.preventDefault();
    onChange(items[n].id);
    refs.current[n]?.focus();
  }
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex w-fit max-w-full gap-0.5 rounded-full! border border-hair-soft bg-s2 p-0.5", className)}>
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
            tabIndex={i === (checked >= 0 ? checked : enabled[0]) ? 0 : -1}
            onClick={() => onChange(it.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex h-[26px] items-center rounded-full! px-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 focus-visible:outline-offset-[-1px]!",
              on ? "bg-ink text-black" : "text-ink-dim hover:text-ink",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {it.label}
            <CountSuffix count={it.count} on={on} />
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- CategoryTabs */

export type CategoryTab<T extends string = string> = FilterChip<T> & { tone: Tone };

export type CategoryTabsProps<T extends string> = {
  items: CategoryTab<T>[];
  value: T;
  onChange: (id: T) => void;
  "aria-label": string;
  className?: string;
};

/** Category underline tabs: Engineering · Ops · Documentation · Research · Marketing. */
export function CategoryTabs<T extends string>({ items, value, onChange, "aria-label": ariaLabel, className }: CategoryTabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onKeyDown={(e) => arrowMove(e, refs.current)}
      className={cn("scroll-thin flex max-w-full gap-5 overflow-x-auto border-b border-hair", className)}
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
            aria-pressed={on}
            disabled={it.disabled}
            onClick={() => onChange(it.id)}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap pb-2.5 pt-1 text-[13px] transition-colors focus-visible:outline-offset-1!",
              on ? "font-medium text-ink" : "text-ink-faint hover:text-ink",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {it.label}
            {it.count !== undefined ? <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{it.count ?? "Unavailable"}</span> : null}
            <span
              aria-hidden="true"
              className={cn("absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-opacity", toneBg[it.tone], on ? "opacity-100" : "opacity-0")}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- NavPill */

export type NavPillProps = {
  href: string;
  children: ReactNode;
  current?: boolean;
  onClick?: () => void;
  /** Hide under 640px, as telescope does to keep room for the path field. */
  hideOnPhone?: boolean;
  /** Show in its hover look (static state samples). */
  forceHover?: boolean;
  className?: string;
};

/** galileo pill link: lime hairline, lime text when hovered or current. */
export function NavPill({ href, children, current = false, onClick, hideOnPhone = false, forceHover = false, className }: NavPillProps) {
  return (
    <a
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={(e) => {
        if (!onClick) return;
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full! border px-3 py-[5px] text-[13px] transition-colors",
        current || forceHover ? "border-[#83d63a] text-[#a6dd73]" : "border-[rgba(131,214,58,0.22)] text-ink hover:border-[#83d63a] hover:text-[#a6dd73]",
        hideOnPhone && "max-sm:hidden",
        className,
      )}
    >
      {children}
    </a>
  );
}
