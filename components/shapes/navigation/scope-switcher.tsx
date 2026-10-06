"use client";

// Source and root switchers:
//  SourceSwitcher  galileo's "● acme ▾" button and its grouped menu (Ports, then Files), with
//                  loading, empty and single-group states and an "Add or remove sources" footer
//  SourceMenu      the menu panel on its own, so states can be shown inline
//  GraphRootPicker the space dashboard's "GRAPH ROOT Categories ▾" picker: a combobox with
//                  search, match highlighting, loading, error and no-match states, and a reset
// Arrow keys move, Enter picks, Esc closes and returns focus to the trigger.
import { useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";
import { moveFocus, useDismiss } from "./menu";

/* ----------------------------------------------------------------------------- sources */

/** The fields of a galileo source the switcher needs. */
export type SourceLike = {
  name: string;
  type: "port" | "files";
  port: number | null;
  path: string | null;
  up: boolean;
};

export function sourceDetail(s: SourceLike): string {
  return s.type === "port" ? `localhost:${s.port}` : (s.path ?? "");
}

const LIME_TINT = "bg-[rgba(131,214,58,0.1)]";

function SourceDot({ up, className }: { up: boolean | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2 shrink-0 rounded-full",
        up === null ? "bg-ink-faint" : up ? "bg-[#83d63a] shadow-[0_0_0_3px_rgba(131,214,58,0.16)]" : "bg-red",
        className,
      )}
    />
  );
}

export type SourceMenuProps = {
  /** null while the list loads. */
  sources: SourceLike[] | null;
  current?: string | null;
  onPick?: (name: string) => void;
  footer?: { label: string; href: string; onClick?: () => void };
  id?: string;
  /** Called on Escape and Tab so a popover owner can close. */
  onRequestClose?: (reason: "escape" | "tab") => void;
  menuRef?: RefObject<HTMLDivElement | null>;
  /** CSS width; defaults to min(420px, 100vw - 24px), the telescope bar's menu. */
  width?: string;
  className?: string;
};

/** The grouped source menu: PORTS then FILES, each row a dot, a name and a mono detail. */
export function SourceMenu({ sources, current, onPick, footer, id, onRequestClose, menuRef, width = "min(420px, calc(100vw - 24px))", className }: SourceMenuProps) {
  const local = useRef<HTMLDivElement | null>(null);
  const ref = menuRef ?? local;
  const groups: [string, SourceLike[]][] = sources
    ? ([
        ["Ports", sources.filter((s) => s.type === "port")],
        ["Files", sources.filter((s) => s.type === "files")],
      ] as [string, SourceLike[]][]).filter(([, list]) => list.length > 0)
    : [];

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const list = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (moveFocus(e, list)) return;
    if (e.key === "Escape") {
      e.preventDefault();
      onRequestClose?.("escape");
    } else if (e.key === "Tab") onRequestClose?.("tab");
  }

  return (
    <div
      ref={ref}
      id={id}
      role="menu"
      aria-label="Sources"
      aria-busy={sources === null || undefined}
      onKeyDown={onKeyDown}
      style={{ width }}
      className={cn(
        "scroll-thin max-h-[min(70vh,520px)] max-w-full overflow-auto rounded-[12px] border border-[rgba(131,214,58,0.22)] bg-s1 p-1.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {sources === null ? (
        <p className="mx-2.5 my-1.5 flex items-center gap-2 text-[13px] text-ink-dim" role="status">
          <Spinner size="xs" label={null} /> Loading sources…
        </p>
      ) : groups.length === 0 ? (
        <p className="mx-2.5 my-1.5 text-[13px] text-ink-dim">No sources yet.</p>
      ) : (
        groups.map(([title, list]) => (
          <div key={title} role="group" aria-label={title}>
            <p aria-hidden="true" className="mx-2.5 mb-1 mt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              {title}
            </p>
            {list.map((s) => {
              const on = s.name === current;
              return (
                <button
                  key={s.name}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  aria-current={on ? "true" : undefined}
                  onClick={() => onPick?.(s.name)}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2.5 rounded-[8px]! px-2.5 py-2 text-left outline-none transition-colors",
                    "hover:bg-[rgba(131,214,58,0.1)] focus:bg-[rgba(131,214,58,0.1)] focus-visible:outline-offset-[-2px]!",
                    on && LIME_TINT,
                  )}
                >
                  <SourceDot up={s.up} />
                  <span className="shrink-0 text-[14px] font-semibold text-ink">{s.name}</span>
                  <span className="min-w-0 flex-1 truncate text-right font-mono text-[12px] text-ink-faint">{sourceDetail(s)}</span>
                  {!s.up ? <span className="sr-only">, not answering</span> : null}
                </button>
              );
            })}
          </div>
        ))
      )}
      {footer ? (
        <div className="mt-1.5 border-t border-hair pt-1.5">
          <a
            role="menuitem"
            tabIndex={-1}
            href={footer.href}
            onClick={(e) => {
              if (!footer.onClick) return;
              e.preventDefault();
              footer.onClick();
            }}
            className="flex w-full items-center rounded-[8px]! px-2.5 py-2 text-[13px] text-[#a6dd73] outline-none transition-colors hover:bg-[rgba(131,214,58,0.1)] focus:bg-[rgba(131,214,58,0.1)] focus-visible:outline-offset-[-2px]!"
          >
            {footer.label}
          </a>
        </div>
      ) : null}
    </div>
  );
}

export type SourceSwitcherProps = {
  sources: SourceLike[] | null;
  /** Current source name; null shows "Sources" with no dot (the Sources page). While the list
      loads, a named source shows without its dot, since its state is not known yet. */
  current: string | null;
  onPick: (name: string) => void;
  footer?: SourceMenuProps["footer"];
  defaultOpen?: boolean;
  /** Menu width (CSS), passed to SourceMenu. */
  menuWidth?: string;
  /** Stretch-limit used inside a bar: 40% of the bar, 46% on phones. */
  className?: string;
};

/** "● acme ▾": names the current source and opens the source menu. Disabled until the list loads. */
export function SourceSwitcher({ sources, current, onPick, footer, defaultOpen = false, menuWidth, className }: SourceSwitcherProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const wrap = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  const cur = sources?.find((s) => s.name === current) ?? null;
  const loading = sources === null;

  const close = (restore: boolean) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  useDismiss(open, (reason) => close(reason === "escape"), [wrap]);

  const focusFirst = () =>
    requestAnimationFrame(() => {
      const items = menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      const currentItem = menu.current?.querySelector<HTMLElement>('[aria-current="true"]');
      (currentItem ?? items?.[0])?.focus();
    });

  return (
    <div ref={wrap} className={cn("relative min-w-0", className)}>
      <button
        ref={trigger}
        type="button"
        disabled={loading}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        aria-label={cur ? `Source: ${cur.name}${cur.up ? "" : ", not answering"}. Switch source` : current ? `Source: ${current}. Switch source` : "Switch source"}
        onClick={() => {
          setOpen(!open);
          if (!open) focusFirst();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            focusFirst();
          }
        }}
        className={cn(
          "inline-flex h-8 max-w-full items-center gap-[7px] rounded-[8px]! border bg-s2 pl-2.5 pr-2 transition-colors",
          open ? "border-[rgba(131,214,58,0.4)]" : "border-hair hover:border-[rgba(131,214,58,0.3)]",
          "disabled:cursor-default disabled:opacity-70",
        )}
      >
        {cur ? <SourceDot up={cur.up} /> : null}
        <span className="truncate text-[14px] font-semibold text-ink">{current ?? "Sources"}</span>
        <ChevronDown aria-hidden="true" className={cn("size-3.5 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="rise absolute left-0 top-[calc(100%+6px)] z-40">
          <SourceMenu
            id={`${id}-menu`}
            menuRef={menu}
            sources={sources}
            current={current}
            footer={footer}
            width={menuWidth}
            onPick={(name) => {
              onPick(name);
              close(true);
            }}
            onRequestClose={(reason) => close(reason === "escape")}
          />
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- graph root */

export type RootOption = { id: string; label: string; kind: string };

export type GraphRootPickerProps = {
  /** Options; null while loading; "error" when they could not be loaded. */
  options: RootOption[] | null | "error";
  /** Current root id; null is the default root. */
  value: string | null;
  onChange: (id: string | null) => void;
  /** Name of the default root, shown when value is null: "Categories". */
  defaultLabel: string;
  label?: string;
  defaultOpen?: boolean;
  defaultQuery?: string;
  /** Popover alignment against the trigger. */
  align?: "start" | "end";
  /** Keep the popover open (state samples): outside clicks and Escape do not close it. */
  pinnedOpen?: boolean;
  className?: string;
};

function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-[#a6dd73]">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** GRAPH ROOT ▾ picker: search the space's projects, categories and files to re-root the graph. */
export function GraphRootPicker({
  options,
  value,
  onChange,
  defaultLabel,
  label = "Graph root",
  defaultOpen = false,
  defaultQuery = "",
  align = "end",
  pinnedOpen = false,
  className,
}: GraphRootPickerProps) {
  const [openState, setOpen] = useState(defaultOpen);
  const open = pinnedOpen || openState;
  const [query, setQuery] = useState(defaultQuery);
  const [active, setActive] = useState(0);
  const id = useId();
  const wrap = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const list = Array.isArray(options) ? options : [];
  const q = query.trim();
  const results = q ? list.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()) || o.kind.toLowerCase().includes(q.toLowerCase())) : list;
  const current = list.find((o) => o.id === value);
  const activeIdx = Math.min(active, Math.max(results.length - 1, 0));

  const close = (restore: boolean) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  useDismiss(open, (reason) => close(reason === "escape"), [wrap]);

  const pick = (opt: RootOption | null) => {
    onChange(opt ? opt.id : null);
    setQuery("");
    setActive(0);
    close(true);
  };

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIdx + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIdx - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) pick(results[activeIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    }
  }

  return (
    <div ref={wrap} className={cn("relative min-w-0", className)}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-pop` : undefined}
        onClick={() => {
          setOpen(!open);
          if (!open) requestAnimationFrame(() => input.current?.focus());
        }}
        className={cn(
          "inline-flex min-h-9 max-w-full items-center gap-[7px] whitespace-nowrap rounded-[8px]! border bg-s2 px-2.5 py-[7px] text-[11px] tracking-[0.02em] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink",
          open ? "border-hair-strong" : "border-hair",
        )}
      >
        <span className="shrink-0 uppercase text-ink-faint">{label}</span>
        <b className="min-w-0 max-w-[65px] truncate font-semibold text-ink sm:max-w-[130px]">{current ? current.label : defaultLabel}</b>
        <ChevronDown aria-hidden="true" className={cn("size-3 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          id={`${id}-pop`}
          role="dialog"
          aria-label={`Choose a ${label.toLowerCase()}`}
          className={cn(
            "rise absolute top-[calc(100%+7px)] z-40 w-[min(280px,calc(100vw-32px))] rounded-[12px] border border-hair-strong bg-[rgba(14,14,15,0.97)] p-2.5 shadow-[0_20px_44px_rgba(0,0,0,0.6)] backdrop-blur-[14px]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <p className="mb-[7px] text-[11px] uppercase tracking-[0.06em] text-ink-faint">Choose a {label.toLowerCase()}</p>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              ref={input}
              type="text"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={results.length > 0 ? `${id}-list` : undefined}
              aria-autocomplete="list"
              aria-activedescendant={results[activeIdx] ? `${id}-opt-${results[activeIdx].id}` : undefined}
              aria-label="Search roots"
              placeholder="Project, category or file"
              value={query}
              disabled={!Array.isArray(options)}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
              className="h-9 w-full rounded-[8px]! border border-hair bg-s3 pl-8 pr-2.5 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-hair-strong disabled:opacity-60"
            />
          </div>

          <div className="mt-1.5">
            {options === null ? (
              <p role="status" aria-busy="true" className="flex items-center gap-2 px-1 py-2.5 text-[12.5px] text-ink-dim">
                <Spinner size="xs" label={null} /> Loading roots…
              </p>
            ) : options === "error" ? (
              <p role="alert" className="px-1 py-2.5 text-[12.5px] leading-snug text-[#ff7a70]">
                Could not load roots. Close and reopen to retry.
              </p>
            ) : results.length === 0 ? (
              <p className="px-1 py-2.5 text-[12.5px] text-ink-dim">No match in this space</p>
            ) : (
              <ul id={`${id}-list`} role="listbox" aria-label="Roots" className="scroll-thin max-h-[240px] overflow-y-auto">
                {results.map((o, i) => {
                  const on = i === activeIdx;
                  return (
                    <li
                      key={o.id}
                      id={`${id}-opt-${o.id}`}
                      role="option"
                      aria-selected={on}
                      onPointerMove={() => setActive(i)}
                      onClick={() => pick(o)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-[7px] px-2.5 py-2 text-[13px] text-ink",
                        on && "bg-s3",
                        o.id === value && "font-semibold",
                      )}
                    >
                      {o.id === value ? <span className="sr-only">Current root: </span> : null}
                      <span className="min-w-0 truncate">{highlight(o.label, q)}</span>
                      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-dim">{o.kind}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => pick(null)}
            className="mt-2 w-full rounded-[8px]! border border-hair py-[7px] text-[11px] uppercase tracking-[0.06em] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
          >
            Reset to {defaultLabel.toLowerCase()}
          </button>
        </div>
      ) : null}
    </div>
  );
}
