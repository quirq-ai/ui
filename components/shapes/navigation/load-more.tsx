"use client";

// Extending a list in place, without paging:
//  LoadMoreRow   full-width quiet row: "Load older activity · 22 more ↓", "Loading…", end of list
//  ExpandToggle  chip that shows more or fewer: "Read more news ↓" / "Show fewer news ↑"
//  Disclosure    "Other agents (2)" row that reveals hidden items
// Callers append rows and move focus to the first new one (see useFocusOnChange).
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";

/** Focuses the element registered under `key` whenever `key` changes to a non-null value. */
export function useFocusOnChange(key: string | null) {
  const nodes = useRef(new Map<string, HTMLElement>());
  useEffect(() => {
    if (key) nodes.current.get(key)?.focus();
  }, [key]);
  return (id: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(id, el);
    else nodes.current.delete(id);
  };
}

export type LoadMoreRowProps = {
  /** more: can load; loading: fetching; end: nothing left. */
  state: "more" | "loading" | "end";
  label: string;
  /** How many remain. null when the source cannot say (cursor pagination): no count is shown. */
  remaining?: number | null;
  direction?: "down" | "up";
  onLoad?: () => void;
  /** Text for the end of the list: "End of activity · 30 events". */
  endLabel?: string;
  className?: string;
};

/** Quiet full-width row at the end of a list. */
export function LoadMoreRow({ state, label, remaining, direction = "down", onLoad, endLabel = "End of list", className }: LoadMoreRowProps) {
  const arrow = direction === "down" ? "↓" : "↑";
  if (state === "end") {
    return (
      <p className={cn("flex h-11 items-center justify-center border-t border-hair-soft font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint", className)}>
        {endLabel}
      </p>
    );
  }
  const loading = state === "loading";
  return (
    <button
      type="button"
      onClick={onLoad}
      disabled={loading}
      aria-busy={loading || undefined}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-none! border-t border-hair-soft text-[12.5px] text-ink-dim transition-colors hover:bg-white/[0.03] hover:text-ink focus-visible:outline-offset-[-2px]! disabled:cursor-wait",
        className,
      )}
    >
      {loading ? (
        <>
          <Spinner size="xs" label={null} />
          <span>Loading…</span>
        </>
      ) : (
        <>
          <span className="font-medium text-ink">{label}</span>
          {typeof remaining === "number" ? (
            <span className="tabular-nums">
              <span aria-hidden="true">· </span>
              {remaining} more
            </span>
          ) : null}
          <span aria-hidden="true">{arrow}</span>
        </>
      )}
    </button>
  );
}

export type ExpandToggleProps = {
  expanded: boolean;
  onToggle: () => void;
  /** Panel the toggle shows and hides. */
  controls?: string;
  moreLabel: string;
  lessLabel: string;
  className?: string;
};

/** Mono chip that expands or collapses a list: READ MORE NEWS ↓ / SHOW FEWER NEWS ↑. */
export function ExpandToggle({ expanded, onToggle, controls, moreLabel, lessLabel, className }: ExpandToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full! border border-hair bg-white/[0.04] px-[17px] font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim transition-[color,border-color] duration-[180ms] hover:border-white/[0.22] hover:text-ink",
        className,
      )}
    >
      {expanded ? lessLabel : moreLabel}
      <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
    </button>
  );
}

export type DisclosureProps = {
  /** Row label, such as "Other agents". */
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/** "▸ Other agents (2)": a quiet row that reveals more items under it. */
export function Disclosure({ label, count, defaultOpen = false, children, className }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-[6px]! py-1.5 pr-2 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
      >
        <ChevronRight aria-hidden="true" className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")} />
        {label}
        {count !== undefined ? <span className="tabular-nums text-ink-faint">({count})</span> : null}
      </button>
      <div id={id} hidden={!open} className="mt-2">
        {children}
      </div>
    </div>
  );
}
