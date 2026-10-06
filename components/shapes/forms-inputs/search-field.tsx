"use client";

// Search and faceted filter: FilterSearch (glyph, input, "/" kbd hint, clear button; Esc
// clears, the change callback is debounced, "/" can focus it from anywhere), FacetedFilter
// (dashed "+ Runtime" trigger that opens a popover of checkable options with counts; arrow
// keys, Enter and Esc work inside it), EmailSearch (exact-email lookup with searching,
// found and not found states) and HighlightMatch (bolds the matching part of a label).
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, CirclePlus, Search, UserRound, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/loaders";
import { FormStyles } from "./_styles";

/* ----------------------------------------------------------------------------- FilterSearch */

export type FilterSearchShape = "pill" | "field" | "topbar";

export type FilterSearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "type"> & {
  value?: string;
  defaultValue?: string;
  /** Every keystroke. */
  onValueChange?: (value: string) => void;
  /** After typing pauses for debounceMs. Use this one to filter or fetch. */
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  /** Key hint shown while empty and unfocused. */
  shortcut?: string;
  /** Let the shortcut key focus this field from anywhere on the page. Bind one field per page. */
  bindShortcut?: boolean;
  /** pill: page filter (radius full); field: inside panels (radius 10); topbar: 38px app bar search. */
  shape?: FilterSearchShape;
  size?: "sm" | "md";
  /** Spinner in place of the glyph while results load. */
  busy?: boolean;
  /** Trailing meta such as "4 of 11". */
  meta?: ReactNode;
  "aria-label": string;
};

const shapeCls: Record<FilterSearchShape, string> = {
  pill: "rounded-full bg-s1",
  field: "rounded-[10px] bg-s1",
  topbar: "rounded-[10px] bg-black/60",
};

/** Search or filter box. Esc clears it (or leaves it when already empty). */
export function FilterSearch({
  value,
  defaultValue = "",
  onValueChange,
  onDebouncedChange,
  debounceMs = 180,
  shortcut = "/",
  bindShortcut = false,
  shape = "pill",
  size = "md",
  busy = false,
  meta,
  disabled,
  className,
  placeholder = "Search…",
  ...rest
}: FilterSearchProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useRef(onDebouncedChange);

  useEffect(() => {
    debounced.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    const t = setTimeout(() => debounced.current?.(current), debounceMs);
    return () => clearTimeout(t);
  }, [current, debounceMs]);

  useEffect(() => {
    if (!bindShortcut || !shortcut) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key !== shortcut || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [bindShortcut, shortcut]);

  function set(v: string) {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  }

  const h = shape === "topbar" ? "h-[38px]" : size === "sm" ? "h-8" : "h-9";

  return (
    <div
      className={cn(
        "fi-ring group/search relative flex w-full min-w-0 items-center border border-hair transition-[border-color,background-color] duration-150",
        "hover:border-hair-strong focus-within:bg-s2",
        shapeCls[shape],
        h,
        disabled && "opacity-50",
        className,
      )}
    >
      <FormStyles />
      <span className="pointer-events-none absolute left-3 inline-flex text-ink-faint" aria-hidden="true">
        {busy ? <Spinner size="sm" label={null} /> : <Search className={size === "sm" ? "size-3.5" : "size-4"} />}
      </span>
      <input
        ref={inputRef}
        type="text"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        disabled={disabled}
        value={current}
        aria-busy={busy || undefined}
        onChange={(e) => set(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          e.preventDefault();
          if (current) set("");
          else inputRef.current?.blur();
        }}
        className={cn(
          "peer h-full min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-faint focus-visible:outline-none! disabled:cursor-not-allowed",
          size === "sm" ? "pl-8 text-[12.5px]" : "pl-9 text-[13px]",
          "pr-2",
        )}
        {...rest}
      />
      {meta ? <span className="shrink-0 pr-2 font-mono text-[10.5px] tabular-nums text-ink-faint">{meta}</span> : null}
      {current ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            set("");
            inputRef.current?.focus();
          }}
          className="mr-1.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full! text-ink-faint transition-colors hover:bg-s4 hover:text-ink"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : shortcut ? (
        <Kbd
          subtle
          size={shape === "topbar" ? "sm" : "xs"}
          className={cn("mr-2.5 transition-opacity duration-150 peer-focus:opacity-0", shape === "topbar" && "size-5 rounded-[5px]")}
        >
          {shortcut}
        </Kbd>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- HighlightMatch */

/** Renders text with the first case-insensitive match of query set in ink. */
export function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-white/[0.12] px-px text-ink">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

/* ----------------------------------------------------------------------------- FacetedFilter */

export type FacetOption = {
  value: string;
  label: string;
  /** Rows with this value in the current data. */
  count?: number;
  icon?: ReactNode;
};

export type FacetedFilterProps = {
  title: string;
  options: FacetOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** Open the popover on first render (demos and docs). */
  defaultOpen?: boolean;
  className?: string;
};

/** "+ Runtime | Claude Code, Codex": a popover of checkable options with counts. */
export function FacetedFilter({ title, options, value, defaultValue = [], onChange, defaultOpen = false, className }: FacetedFilterProps) {
  const uid = useId();
  const [inner, setInner] = useState<string[]>(defaultValue);
  const selected = value ?? inner;
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function commit(next: string[]) {
    if (value === undefined) setInner(next);
    onChange?.(next);
  }

  function toggle(v: string) {
    commit(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  }

  function openPopover() {
    setOpen(true);
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function onListKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(shown.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(shown.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = shown[active];
      if (o) toggle(o.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const chosen = options.filter((o) => selected.includes(o.value));
  const listId = `${uid}-list`;

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      onBlur={(e) => {
        // Tabbing out closes it; a click on blank space inside (relatedTarget null) does not.
        const next = e.relatedTarget as Node | null;
        if (open && next && !rootRef.current?.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openPopover())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            openPopover();
          }
        }}
        className={cn(
          "inline-flex h-8 max-w-full items-center gap-1.5 rounded-[8px]! border border-dashed px-2.5 text-[12.5px] font-medium transition-colors",
          open ? "border-hair-strong bg-s3 text-ink" : "border-hair-strong bg-transparent text-ink-dim hover:bg-s2 hover:text-ink",
        )}
      >
        <CirclePlus aria-hidden="true" className="size-3.5" />
        {title}
        {chosen.length > 0 ? (
          <>
            <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-hair-strong" />
            {chosen.length > 2 ? (
              <Badge size="sm">{chosen.length} selected</Badge>
            ) : (
              chosen.map((o) => (
                <Badge key={o.value} size="sm">
                  {o.label}
                </Badge>
              ))
            )}
          </>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={`Filter by ${title.toLowerCase()}`}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !e.defaultPrevented) {
              e.preventDefault();
              close();
            }
          }}
          className="rise absolute left-0 top-full z-30 mt-1.5 w-[248px] max-w-[calc(100vw-48px)] overflow-hidden rounded-[12px] border border-hair-strong bg-s2 shadow-[0_18px_48px_rgba(0,0,0,0.6)] focus-visible:outline-none!"
        >
          <div className="flex items-center gap-2 border-b border-hair-soft px-3">
            <Search aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={shown[active] ? `${uid}-opt-${shown[active].value}` : undefined}
              aria-label={`Search ${title.toLowerCase()}`}
              placeholder={title}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onListKey}
              className="h-9 min-w-0 flex-1 bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint focus-visible:outline-none!"
            />
          </div>
          <ul id={listId} role="listbox" aria-multiselectable="true" aria-label={title} className="scroll-thin max-h-[220px] overflow-y-auto p-1">
            {shown.length === 0 ? (
              <li role="presentation" className="px-3 py-5 text-center text-[12.5px] text-ink-faint">
                No results found.
              </li>
            ) : (
              shown.map((o, i) => {
                const on = selected.includes(o.value);
                return (
                  <li
                    key={o.value}
                    id={`${uid}-opt-${o.value}`}
                    role="option"
                    aria-selected={on}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[12.5px] text-ink",
                      i === active && "bg-s4",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                        on ? "border-ink bg-ink text-black" : "border-hair-strong",
                      )}
                    >
                      {on ? <Check strokeWidth={3} className="size-3" /> : null}
                    </span>
                    {o.icon ? <span aria-hidden="true" className="inline-flex shrink-0">{o.icon}</span> : null}
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {o.count !== undefined ? <span className="font-mono text-[11px] tabular-nums text-ink-faint">{o.count}</span> : null}
                  </li>
                );
              })
            )}
          </ul>
          {selected.length > 0 ? (
            <div className="border-t border-hair-soft p-1">
              <button
                type="button"
                onClick={() => {
                  commit([]);
                  inputRef.current?.focus();
                }}
                className="h-8 w-full rounded-[8px]! text-[12.5px] text-ink-dim transition-colors hover:bg-s4 hover:text-ink"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- EmailSearch */

export type EmailMatch = { name: string; email: string; detail?: string };

export type EmailSearchProps = {
  /** Returns the person with exactly this email, or null. */
  lookup: (email: string) => EmailMatch | null;
  /** Simulated round trip in ms. */
  delayMs?: number;
  /** Action on a found person: "Give access". */
  actionLabel?: string;
  onPick?: (match: EmailMatch) => void;
  /** Emails that already have access; the action reads "Has access". */
  existing?: string[];
  defaultValue?: string;
  className?: string;
};

type LookupState = { phase: "idle" } | { phase: "searching" } | { phase: "found"; match: EmailMatch } | { phase: "none"; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Search by exact email address…": no partial matches, so nobody is listed by accident. */
export function EmailSearch({ lookup, delayMs = 700, actionLabel = "Give access", onPick, existing = [], defaultValue = "", className }: EmailSearchProps) {
  const uid = useId();
  const [email, setEmail] = useState(defaultValue);
  const [state, setState] = useState<LookupState>({ phase: "idle" });
  const [picked, setPicked] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const valid = EMAIL_RE.test(email.trim());

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const q = email.trim().toLowerCase();
    setState({ phase: "searching" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const match = lookup(q);
      setState(match ? { phase: "found", match } : { phase: "none", email: q });
    }, delayMs);
  }

  const has = (m: EmailMatch) => existing.includes(m.email) || picked.includes(m.email);

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <form role="search" onSubmit={submit} className="flex min-w-0 gap-2">
        <label htmlFor={`${uid}-email`} className="sr-only">
          Email address
        </label>
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search by exact email address…"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state.phase !== "searching") setState({ phase: "idle" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && email) {
                e.preventDefault();
                setEmail("");
                setState({ phase: "idle" });
              }
            }}
            className="h-9 w-full min-w-0 rounded-[10px]! border border-hair bg-s1 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint transition-colors hover:border-hair-strong focus:border-white/30"
          />
        </div>
        <Button type="submit" size="md" disabled={!valid} loading={state.phase === "searching"} loadingLabel="Searching…">
          Search
        </Button>
      </form>
      <div aria-live="polite" className="min-h-[58px]">
        {state.phase === "searching" ? (
          <div className="flex items-center gap-3 rounded-[10px] border border-hair-soft px-3 py-2.5">
            <span className="skeleton size-8 shrink-0 rounded-full!" aria-hidden="true" />
            <div className="flex flex-1 flex-col gap-1.5" aria-hidden="true">
              <span className="skeleton h-2.5 w-28" />
              <span className="skeleton h-2 w-40" />
            </div>
            <span className="sr-only">Searching</span>
          </div>
        ) : state.phase === "found" ? (
          <div className="flex items-center gap-3 rounded-[10px] border border-hair bg-s1 px-3 py-2.5 transition-colors hover:bg-s2">
            <Avatar name={state.match.name} size="md" decorative />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{state.match.name}</p>
              <p className="truncate font-mono text-[11.5px] text-ink-dim">{state.match.email}</p>
              {state.match.detail ? <p className="truncate text-[11.5px] text-ink-faint">{state.match.detail}</p> : null}
            </div>
            {has(state.match) ? (
              <Badge tone="grn" size="md">
                Has access
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  if (state.phase !== "found") return;
                  setPicked((p) => [...p, state.match.email]);
                  onPick?.(state.match);
                }}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        ) : state.phase === "none" ? (
          <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-hair-strong px-3 py-3 text-[12.5px] text-ink-dim">
            <UserRound aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
            No user found with that email address.
          </div>
        ) : (
          <p className="px-1 pt-1 text-[12px] text-ink-faint">Type the full address. Partial matches are never shown.</p>
        )}
      </div>
    </div>
  );
}
