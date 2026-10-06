"use client";

// Command palette: a combobox over a grouped listbox. Every typed word must appear in an
// item's label or keywords; prefix hits rank first, then word starts, then any match.
// ArrowUp and ArrowDown move, Enter runs, Escape closes (or clears when inline). A page
// search row hands the query to the current page's own search. CommandPaletteDialog puts
// the panel in a blurred top layer; the demo opens it with Cmd+K or Ctrl+K.
import { useId, useRef, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd, KeyCombo } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/loaders";
import { Overlay } from "./overlay-core";

export type CommandItem = {
  id: string;
  label: string;
  group: string;
  icon?: ReactNode;
  hint?: ReactNode;
  shortcut?: string[];
  /** Extra words that should find this item. */
  keywords?: string;
};

export const PAGE_SEARCH_ID = "__page-search";

/** Every token must appear; prefix 3, word start 2, inside a word 1, keyword only 0.5. -1 means no match. */
export function scoreCommand(tokens: string[], label: string, keywords = ""): number {
  const name = label.toLowerCase();
  const hay = `${name} ${keywords.toLowerCase()}`;
  let total = 0;
  for (const t of tokens) {
    if (!hay.includes(t)) return -1;
    const at = name.indexOf(t);
    total += at === 0 ? 3 : at > 0 && /\W/.test(name[at - 1]) ? 2 : at > 0 ? 1 : 0.5;
  }
  return total;
}

type Row = { item: CommandItem; group: string };

function results(items: CommandItem[], query: string, groupOrder: string[], pageScope: string | null, max: number): Row[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const order = (g: string) => {
    const i = groupOrder.indexOf(g);
    return i < 0 ? groupOrder.length : i;
  };
  let picked: CommandItem[];
  if (tokens.length === 0) {
    picked = [...items].sort((a, b) => order(a.group) - order(b.group));
  } else {
    picked = items
      .map((item, i) => ({ item, i, s: scoreCommand(tokens, item.label, item.keywords) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s || order(a.item.group) - order(b.item.group) || a.i - b.i)
      .map((x) => x.item);
    // keep each group together, groups ordered by their best hit
    const firstSeen: string[] = [];
    picked.forEach((p) => {
      if (!firstSeen.includes(p.group)) firstSeen.push(p.group);
    });
    picked = firstSeen.flatMap((g) => picked.filter((p) => p.group === g));
  }
  const rows: Row[] = picked.slice(0, max).map((item) => ({ item, group: item.group }));
  if (tokens.length && pageScope) {
    rows.unshift({
      item: { id: PAGE_SEARCH_ID, label: `Search "${query.trim()}" ${pageScope}`, group: "This page", icon: <Search /> },
      group: "This page",
    });
  }
  return rows;
}

export type CommandPaletteProps = {
  items: CommandItem[];
  groupOrder?: string[];
  onSelect?: (item: CommandItem, query: string) => void;
  /** Escape closes when set; otherwise Escape clears the query. */
  onClose?: () => void;
  /** Projects are still loading: the empty state says so. */
  loading?: boolean;
  /** Adds a page search row, such as 'on this page'. */
  pageScope?: string | null;
  placeholder?: string;
  defaultQuery?: string;
  autoFocus?: boolean;
  showFooter?: boolean;
  maxResults?: number;
  /** Accessible name. */
  label?: string;
  className?: string;
};

/** The palette panel: input, grouped results, key footer. */
export function CommandPalette({
  items,
  groupOrder = [],
  onSelect,
  onClose,
  loading = false,
  pageScope = null,
  placeholder = "Search projects, pages and actions…",
  defaultQuery = "",
  autoFocus = false,
  showFooter = true,
  maxResults = 40,
  label = "Command menu",
  className,
}: CommandPaletteProps) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [active, setActive] = useState(0);
  const rows = results(items, query, groupOrder, pageScope, maxResults);
  const current = Math.min(active, rows.length - 1);
  const optionId = (i: number) => `${id}-opt-${i}`;

  const reveal = (i: number) => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`#${CSS.escape(optionId(i))}`);
    if (!list || !el) return;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop - 34;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight + 6;
  };
  const go = (i: number) => {
    setActive(i);
    reveal(i);
  };
  const run = (i: number) => {
    const row = rows[i];
    if (row) onSelect?.(row.item, query.trim());
  };

  // consecutive rows of one group render as a labelled role=group inside the listbox
  const groups: { name: string; rows: { row: Row; index: number }[] }[] = [];
  rows.forEach((row, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === row.group) last.rows.push({ row, index });
    else groups.push({ name: row.group, rows: [{ row, index }] });
  });
  return (
    <div
      className={cn(
        "flex max-h-[min(60vh,520px)] w-[min(560px,100%)] min-w-0 max-w-full flex-col overflow-hidden rounded-[14px] border border-hair-strong bg-s2 text-ink",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2.5 border-b border-hair-soft px-4 py-3 transition-colors focus-within:border-hair-strong focus-within:bg-white/[0.02]">
        <Search aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
        <input
          type="text"
          role="combobox"
          aria-label={label}
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={rows.length ? optionId(current) : undefined}
          spellCheck={false}
          autoComplete="off"
          data-autofocus={autoFocus || undefined}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            if (listRef.current) listRef.current.scrollTop = 0;
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && rows.length) {
              e.preventDefault();
              go((current + 1) % rows.length);
            } else if (e.key === "ArrowUp" && rows.length) {
              e.preventDefault();
              go((current - 1 + rows.length) % rows.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              run(current);
            } else if (e.key === "Escape" && !onClose && query) {
              e.preventDefault();
              e.stopPropagation();
              setQuery("");
              setActive(0);
            }
          }}
          className="min-w-0 flex-1 rounded-none! bg-transparent p-0 text-[15px] text-ink outline-none! placeholder:text-ink-faint"
        />
        <Kbd size="sm" subtle>
          esc
        </Kbd>
      </div>

      <div ref={listRef} id={`${id}-list`} role="listbox" aria-label="Results" className="scroll-thin relative min-h-0 flex-1 overflow-y-auto p-1.5">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-3 py-7 text-center text-[13px] text-ink-faint">
            {loading ? (
              <>
                <Spinner size="sm" label={null} />
                No results yet; still loading projects…
              </>
            ) : (
              "No results"
            )}
          </div>
        ) : (
          groups.map((g, gi) => (
            <div key={`${g.name}-${gi}`} role="group" aria-labelledby={`${id}-g${gi}`}>
              <div id={`${id}-g${gi}`} className="px-2.5 pb-1 pt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {g.name}
              </div>
              {g.rows.map(({ row, index: i }) => {
                const on = i === current;
                return (
                  <div
                    key={`${row.item.id}-${i}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={on}
                    onPointerMove={() => {
                      if (!on) setActive(i);
                    }}
                    onClick={() => run(i)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-[9px] [&_svg]:size-4",
                      on ? "bg-[color-mix(in_srgb,var(--ink)_9%,transparent)] text-ink" : "text-ink-dim",
                    )}
                  >
                    {row.item.icon ? (
                      <span aria-hidden="true" className={cn("inline-flex shrink-0", on ? "text-ink" : "text-ink-faint")}>
                        {row.item.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate text-[13.5px]">{row.item.label}</span>
                    {row.item.hint ? <span className={cn("shrink-0 text-[12px]", on ? "text-ink-dim" : "text-ink-faint")}>{row.item.hint}</span> : null}
                    {row.item.shortcut ? <KeyCombo keys={row.item.shortcut} size="xs" subtle /> : null}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {showFooter ? (
        <div aria-hidden="true" className="flex shrink-0 gap-4 border-t border-hair-soft px-3.5 py-2.5 text-[12px] text-ink-faint max-[560px]:hidden">
          <span className="inline-flex items-center gap-1.5">
            <Kbd size="xs" subtle>
              up
            </Kbd>
            <Kbd size="xs" subtle>
              down
            </Kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd size="xs" subtle>
              enter
            </Kbd>
            open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd size="xs" subtle>
              esc
            </Kbd>
            close
          </span>
        </div>
      ) : null}
    </div>
  );
}

export type CommandPaletteDialogProps = Omit<CommandPaletteProps, "onClose" | "autoFocus"> & {
  open: boolean;
  onClose: () => void;
};

/** The palette in a blurred top layer. */
export function CommandPaletteDialog({ open, onClose, label = "Command menu", ...panel }: CommandPaletteDialogProps) {
  return (
    <Overlay open={open} onClose={onClose} placement="top" aria-label={label} backdropClassName="bg-[rgba(6,7,9,0.6)] backdrop-blur-[2px]">
      <CommandPalette {...panel} label={label} onClose={onClose} autoFocus className="w-full" />
    </Overlay>
  );
}
