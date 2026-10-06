"use client";

// Choice rows: Segmented (a radiogroup with roving tabindex; arrow keys move and select,
// Home and End jump; sizes; optional icons) and TabChips (mono uppercase filter chips with a
// count suffix; toggle buttons with aria-pressed; single or multiple selection).
// Both work controlled (value + onChange) or uncontrolled (defaultValue).
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- Segmented */

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Required when the option shows only an icon. */
  "aria-label"?: string;
};

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** Names the group: "Time window", "View". */
  "aria-label": string;
  size?: "sm" | "md";
  /** Hide the labels and show icons only (labels move to aria-label). */
  iconOnly?: boolean;
  /** Stretch segments to fill the container. */
  block?: boolean;
  className?: string;
};

const segSize = {
  sm: { wrap: "h-7 p-0.5", item: "h-6 px-2.5 text-[11.5px] gap-1.5 [&_svg]:size-3.5", icon: "h-6 w-7 [&_svg]:size-3.5" },
  md: { wrap: "h-9 p-[3px]", item: "h-[28px] px-3 text-[12.5px] gap-2 [&_svg]:size-4", icon: "h-[28px] w-8 [&_svg]:size-4" },
} as const;

/** Exclusive choice between two to five short options. */
export function Segmented<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  "aria-label": ariaLabel,
  size = "md",
  iconOnly = false,
  block = false,
  className,
}: SegmentedProps<T>) {
  const [inner, setInner] = useState<T | undefined>(defaultValue);
  const current = value !== undefined ? value : inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const checkedIndex = options.findIndex((o) => o.value === current);
  const tabStop = checkedIndex >= 0 && !options[checkedIndex].disabled ? checkedIndex : enabled[0];

  function select(i: number) {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    if (value === undefined) setInner(opt.value);
    onChange?.(opt.value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const pos = enabled.indexOf(i);
    let next: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "max-w-full items-center gap-0.5 rounded-full! border border-hair bg-s1",
        block ? "flex w-full" : "inline-flex",
        segSize[size].wrap,
        className,
      )}
    >
      {options.map((o, i) => {
        const checked = o.value === current;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={iconOnly ? o["aria-label"] ?? (typeof o.label === "string" ? o.label : undefined) : o["aria-label"]}
            disabled={o.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-full! font-medium transition-[background-color,color] duration-150",
              "disabled:pointer-events-none disabled:opacity-40",
              iconOnly ? segSize[size].icon : segSize[size].item,
              block && "flex-1",
              checked ? "bg-s4 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-ink-dim hover:text-ink",
            )}
          >
            {o.icon ? <span aria-hidden="true" className="inline-flex">{o.icon}</span> : null}
            {iconOnly ? null : <span className="truncate">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- TabChips */

export type TabChipItem = {
  id: string;
  label: ReactNode;
  /** Count suffix. Leave undefined to hide; counts are tabular. */
  count?: number;
  disabled?: boolean;
};

type TabChipsBase = {
  items: TabChipItem[];
  /** Names the filter group: "Filter writings by type". */
  "aria-label": string;
  size?: "sm" | "md";
  /** Scroll sideways in one row instead of wrapping (dense toolbars). */
  scroll?: boolean;
  className?: string;
};

type TabChipsSingle = TabChipsBase & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
};

type TabChipsMultiple = TabChipsBase & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
};

export type TabChipsProps = TabChipsSingle | TabChipsMultiple;

const chipSize = {
  sm: "h-7 px-3 text-[10px] tracking-[0.12em]",
  md: "h-9 px-4 text-[11px] tracking-[0.14em]",
} as const;

function toArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

/** Mono uppercase filter chips with count suffixes: ALL 24 · NOTES 9 · NEWS 6. */
export function TabChips(props: TabChipsProps) {
  const { items, "aria-label": ariaLabel, size = "md", scroll = false, className } = props;
  const [inner, setInner] = useState<string[]>(() => toArray(props.defaultValue) ?? (props.multiple ? [] : items[0] ? [items[0].id] : []));
  const selected = toArray(props.value) ?? inner;

  function toggle(id: string) {
    let next: string[];
    if (props.multiple) {
      next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
      if (props.value === undefined) setInner(next);
      props.onChange?.(next);
    } else {
      next = [id];
      if (props.value === undefined) setInner(next);
      props.onChange?.(id);
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex max-w-full gap-2",
        scroll ? "scroll-thin flex-nowrap overflow-x-auto pb-1" : "flex-wrap",
        className,
      )}
    >
      {items.map((it) => {
        const on = selected.includes(it.id);
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={on}
            disabled={it.disabled}
            onClick={() => toggle(it.id)}
            className={cn(
              "inline-flex shrink-0 items-center whitespace-nowrap rounded-full! border font-mono uppercase transition-[background-color,border-color,color] duration-150",
              "disabled:pointer-events-none disabled:opacity-40",
              chipSize[size],
              on
                ? "border-ink bg-ink text-black"
                : "border-hair bg-white/[0.04] text-ink-dim hover:border-white/[0.22] hover:text-ink",
            )}
          >
            {it.label}
            {it.count !== undefined ? <span className="ml-[7px] tabular-nums opacity-75">{it.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
