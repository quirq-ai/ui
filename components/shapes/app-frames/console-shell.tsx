"use client";

// Space console shell: the XO Space dashboard chrome. A 58px top bar (XO mark, primary tabs,
// search trigger and resource links), the active view, and a 42px footer with the server
// pill and map stats. Also the two sibling top bars that share the pattern: the projects
// visualizer bar (lens tabs, connection pill, refresh) and the landing Space mock bar.
// Every piece is prop driven; the demo feeds fixtures.
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { BookOpen, RotateCw, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyText, Count, Kbd, RuntimeLogo, StatusDot, XOMark, type DotStatus } from "@/components/ui";
import { isTypingTarget, XO_LIME } from "./_kit";

/* ----------------------------------------------------------------------------- brand */

export type ConsoleBrandProps = {
  /** Product word next to the mark: "Space". */
  product?: string;
  /** Small tag after it: "dashboard". */
  tag?: string;
  /** Lime glow behind the mark, as the shipped bar draws it. */
  glow?: boolean;
  className?: string;
};

/** XO mark plus the product word, as the Space dashboard sets it. */
export function ConsoleBrand({ product = "Space", tag = "dashboard", glow = true, className }: ConsoleBrandProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 whitespace-nowrap", className)}>
      <span className={cn("flex shrink-0", glow && "drop-shadow-[0_0_9px_rgba(131,214,58,0.35)]")}>
        <XOMark height={14} title="XO" />
      </span>
      <b className="truncate text-[16px] font-semibold tracking-[-0.01em] text-ink">{product}</b>
      {tag ? (
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint @md:inline">{tag}</span>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- tabs */

export type ConsoleTab = { id: string; label: string; count?: number | null };

export type ConsoleTabsProps = {
  tabs: ConsoleTab[];
  value: string;
  onChange: (id: string) => void;
  "aria-label"?: string;
  className?: string;
};

/** Primary sections in a hairline rail. The active one is filled ink and marked aria-current. */
export function ConsoleTabs({ tabs, value, onChange, "aria-label": ariaLabel = "Main navigation", className }: ConsoleTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  }
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "scroll-thin flex w-max max-w-full gap-0.5 overflow-x-auto rounded-[10px] border border-hair bg-s2 p-[3px] [scrollbar-width:none]",
        className,
      )}
    >
      {tabs.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-[7px]! px-3.5 text-[13px] transition-colors duration-150 focus-visible:outline-offset-1!",
              on ? "bg-ink font-semibold text-black" : "text-ink-dim hover:text-ink",
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <Count value={t.count} tone={on ? "neutral" : "red"} label="new" className={on ? "bg-black/10! text-black!" : undefined} />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

/* ----------------------------------------------------------------------------- top bar */

const resourceCls =
  "inline-flex h-[34px] min-w-[34px] shrink-0 items-center justify-center gap-2 rounded-[8px]! border border-hair bg-s2 px-2 text-[13px] font-medium text-ink-dim transition-colors hover:bg-s3 hover:text-ink @6xl:px-3";

export type ConsoleTopbarProps = {
  brand?: ReactNode;
  tabs: ConsoleTab[];
  active: string;
  onTabChange: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onOpenSearch?: () => void;
  /** Wiki is the one resource link that can be the current page. */
  wikiActive?: boolean;
  onWiki?: () => void;
  githubHref?: string;
  className?: string;
};

/**
 * 58px bar with three tracks so the tabs stay centered. Under 896px of container width the
 * tabs drop to a second row and scroll sideways; resource links are icon squares until the
 * container is wide enough for their labels.
 */
export function ConsoleTopbar({
  brand = <ConsoleBrand />,
  tabs,
  active,
  onTabChange,
  onRefresh,
  refreshing = false,
  onOpenSearch,
  wikiActive = false,
  onWiki,
  githubHref,
  className,
}: ConsoleTopbarProps) {
  return (
    <header
      className={cn(
        "relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-hair bg-[linear-gradient(180deg,#0e0e10,#0a0a0b)] px-3.5 py-2",
        "@4xl:h-[58px] @4xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @4xl:px-[18px] @4xl:py-0",
        className,
      )}
    >
      <div className="col-start-1 row-start-1 min-w-0">{brand}</div>
      <ConsoleTabs
        tabs={tabs}
        value={active}
        onChange={onTabChange}
        className="col-span-2 row-start-2 justify-self-start @4xl:col-span-1 @4xl:col-start-2 @4xl:row-start-1 @4xl:justify-self-center"
      />
      <nav aria-label="Resources" className="col-start-2 row-start-1 flex items-center justify-end gap-1.5 @4xl:col-start-3">
        <button
          type="button"
          onClick={onRefresh}
          aria-busy={refreshing || undefined}
          aria-label="Refresh page"
          title="Reload this page"
          className={resourceCls}
        >
          <RotateCw aria-hidden="true" className={cn("size-4", refreshing && "spin")} />
          <span className="hidden @6xl:inline">Refresh</span>
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Press Command K to search"
          aria-keyshortcuts="Meta+K Control+K /"
          title="Press ⌘K to search"
          className={cn(resourceCls, "text-ink-faint")}
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="hidden @2xl:inline">Press</span>
          <Kbd size="sm" subtle className="@max-2xl:hidden!">
            ⌘K
          </Kbd>
          <span className="hidden @6xl:inline">to search</span>
        </button>
        <a
          href="#wiki"
          aria-current={wikiActive ? "page" : undefined}
          onClick={(e) => {
            e.preventDefault();
            onWiki?.();
          }}
          aria-label="Wiki"
          title="Open Space wiki"
          className={cn(resourceCls, wikiActive && "bg-s3 text-ink")}
        >
          <BookOpen aria-hidden="true" className="size-4" />
          <span className="hidden @6xl:inline">Wiki</span>
        </a>
        {githubHref ? (
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="xo-space on GitHub (opens in a new tab)"
            title="Open xo-space on GitHub in a new tab"
            className={resourceCls}
          >
            <RuntimeLogo id="github" size={15} decorative />
            <span className="hidden @6xl:inline">GitHub</span>
            <span aria-hidden="true" className="hidden text-[12px] text-ink-faint @6xl:inline">
              ↗
            </span>
          </a>
        ) : null}
      </nav>
    </header>
  );
}

/* ----------------------------------------------------------------------------- server pill */

export type ServerState = "online" | "offline" | "checking";

export type ServerStatusPillProps = {
  state: ServerState;
  /** Server name in the label: "xo-space". */
  name?: string;
  /** Shell command shown when offline. */
  command?: string;
  /** Open the start popover on first render (catalog specimens). */
  defaultOpen?: boolean;
  className?: string;
};

/**
 * Footer server pill: a pip and "xo-space · online". Offline it offers "Start…", which opens
 * the shell command to run, because a page can check the server but not start it.
 */
export function ServerStatusPill({
  state,
  name = "xo-space",
  command = "cd xo-space && ./cowork-api.sh start",
  defaultOpen = false,
  className,
}: ServerStatusPillProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState<"done" | "failed" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popId = useId();
  const shown = open && state === "offline";

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!shown) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [shown]);

  async function copy(e: MouseEvent<HTMLButtonElement>) {
    const button = e.currentTarget;
    const ok = await copyText(command);
    /* the fallback copy path selects a temporary field; keep focus on this button so Escape still closes */
    if (document.activeElement === document.body) button.focus({ preventScroll: true });
    setCopied(ok ? "done" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1400);
  }

  const label = state === "checking" ? `checking ${name}…` : `${name} · ${state}`;

  return (
    <div
      ref={rootRef}
      className={cn("relative flex min-w-0 items-center gap-2.5 whitespace-nowrap text-[12px] text-ink-dim", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && shown) {
          e.stopPropagation();
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <span
        aria-hidden="true"
        className="size-[7px] shrink-0 rounded-full"
        style={
          state === "online"
            ? { background: XO_LIME, boxShadow: "0 0 8px rgba(131,214,58,0.55)" }
            : state === "offline"
              ? { background: "var(--red)" }
              : { background: "#56565a" }
        }
      />
      <span role="status" className="truncate">
        {label}
      </span>
      {state === "offline" ? (
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={shown}
          aria-controls={shown ? popId : undefined}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full! border border-hair px-2.5 py-[3px] text-[12px] font-medium text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
        >
          Start…
        </button>
      ) : null}
      {shown ? (
        <div
          id={popId}
          role="dialog"
          aria-label="Start the server"
          className="absolute bottom-[calc(100%+10px)] left-0 z-30 w-[280px] max-w-[calc(100vw-64px)] whitespace-normal rounded-[12px] border border-hair-strong bg-[rgba(21,21,22,0.97)] p-3 shadow-[0_20px_44px_rgba(0,0,0,0.6)] backdrop-blur-md"
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Start the server from a shell</p>
          <pre className="scroll-thin overflow-x-auto rounded-[8px] border border-hair bg-s3 px-2.5 py-2 font-mono text-[11px]" style={{ color: XO_LIME }}>
            {command}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="mt-2 rounded-full! border border-hair px-2.5 py-1 text-[12px] font-medium text-ink-dim transition-colors hover:text-ink"
          >
            {copied === "done" ? "Copied" : copied === "failed" ? "Select the command to copy it" : "Copy command"}
          </button>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">
            A page can check the server, but starting or stopping it needs a shell. This pill keeps polling and flips back on by
            itself.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- footer */

export type ConsoleFooterProps = {
  server: ReactNode;
  /** Map stats, joined with middle dots and truncated on narrow frames. */
  stats?: string[];
  className?: string;
};

/** 42px status footer: server pill on the left, map stats on the right. */
export function ConsoleFooter({ server, stats = [], className }: ConsoleFooterProps) {
  return (
    <footer
      className={cn(
        "relative z-10 flex h-[42px] min-w-0 items-center justify-between gap-3.5 border-t border-hair bg-[#0a0a0b] px-3.5 @4xl:px-[18px]",
        className,
      )}
    >
      {server}
      {stats.length ? (
        <p className="hidden min-w-0 truncate text-[12px] tabular-nums tracking-[0.02em] text-ink-faint @xl:block">
          {stats.join(" · ")}
        </p>
      ) : null}
    </footer>
  );
}

/* ----------------------------------------------------------------------------- command palette */

export type PaletteCommand = { id: string; label: string; group: string; hint?: string | null; shortcut?: string[] | null };

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
  onRun: (command: PaletteCommand) => void;
  placeholder?: string;
};

/** ⌘K palette scoped to the frame: type to filter, arrows to move, Enter to run, Escape to close. */
export function CommandPalette({ open, onClose, commands, onRun, placeholder = "Search projects, sessions and pages…" }: CommandPaletteProps) {
  if (!open) return null;
  return <PaletteBody onClose={onClose} commands={commands} onRun={onRun} placeholder={placeholder} />;
}

function PaletteBody({ onClose, commands, onRun, placeholder }: Omit<CommandPaletteProps, "open">) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  /* remember what had focus before the field takes it, and give it back on close */
  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, []);

  const q = query.trim().toLowerCase();
  const results = q ? commands.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q)) : commands;
  const current = Math.min(active, Math.max(results.length - 1, 0));

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[current];
      if (hit) {
        onRun(hit);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "Tab") {
      /* modal: the field is the only stop, so focus stays in the palette until it closes */
      e.preventDefault();
    }
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-black/60 px-3 pt-[12%] backdrop-blur-[2px]"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label="Search" className="w-full max-w-[520px] overflow-hidden rounded-[14px] border border-hair-strong bg-s2 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2.5 border-b border-hair px-3.5">
          <Search aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[current] ? `${listId}-${results[current].id}` : undefined}
            aria-label="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
            placeholder={placeholder}
            className="h-11 w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none"
          />
          <Kbd size="xs" subtle>
            esc
          </Kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="scroll-thin max-h-[260px] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12.5px] text-ink-faint">No results for “{query}”</li>
          ) : (
            results.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${c.id}`}
                role="option"
                aria-selected={i === current}
                onPointerMove={() => setActive(i)}
                onClick={() => {
                  onRun(c);
                  onClose();
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[8px] px-2.5 py-2 text-[13px]",
                  i === current ? "bg-s3 text-ink" : "text-ink-dim",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{c.label}</span>
                {c.hint ? <span className="shrink-0 text-[11.5px] text-ink-faint">{c.hint}</span> : null}
                <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">{c.group}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- shell */

export type ConsoleShellProps = {
  topbar: ReactNode;
  footer: ReactNode;
  /** The active view. */
  children: ReactNode;
  /** Accessible name of the view region ("Projects view"). */
  viewLabel: string;
  /** Number of primary tabs; digits 1 to n select them. */
  tabCount?: number;
  onSelectIndex?: (index: number) => void;
  /** ⌘K, Ctrl K or / inside the frame. */
  onOpenSearch?: () => void;
  /** Overlays scoped to the frame (palette, toast). */
  overlay?: ReactNode;
  className?: string;
};

/**
 * Three rows: top bar, view, footer. Keys only act while focus is inside the frame, so two
 * shells on one page never fight over a shortcut.
 */
export function ConsoleShell({
  topbar,
  footer,
  children,
  viewLabel,
  tabCount = 0,
  onSelectIndex,
  onOpenSearch,
  overlay,
  className,
}: ConsoleShellProps) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.nativeEvent.isComposing) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      onOpenSearch?.();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
    if (e.key === "/") {
      e.preventDefault();
      onOpenSearch?.();
      return;
    }
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= tabCount) {
      e.preventDefault();
      onSelectIndex?.(n - 1);
    }
  }
  return (
    <div
      onKeyDown={onKey}
      className={cn(
        "@container relative grid min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[14px] border border-hair bg-[#08080a]",
        className,
      )}
    >
      {topbar}
      <main tabIndex={0} aria-label={viewLabel} className="scroll-thin relative min-h-0 overflow-y-auto focus-visible:outline-offset-[-3px]!">
        {children}
      </main>
      {footer}
      {overlay}
    </div>
  );
}

/** Pill toast that rises above the footer, as space-ui does for quick confirmations. */
export function ConsoleToast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute bottom-[56px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-hair bg-s3 px-4 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-dim transition-[opacity,transform] duration-300 ease-quirq",
        message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      {message ?? ""}
    </div>
  );
}

/* ----------------------------------------------------------------------------- visualizer bar */

/** "/" focuses the bar's search while focus is inside the bar (never from inside a field). */
function focusOnSlash(e: KeyboardEvent<HTMLElement>, input: HTMLInputElement | null) {
  if (e.key !== "/" || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target) || !input) return;
  e.preventDefault();
  input.focus();
}

export type ConnectionState = "connecting" | "live" | "partial" | "offline";

const CONNECTION: Record<ConnectionState, { label: string; status: DotStatus; pulse?: boolean }> = {
  connecting: { label: "Connecting", status: "idle", pulse: true },
  live: { label: "Live", status: "up" },
  partial: { label: "Partial", status: "warn" },
  offline: { label: "Offline", status: "down" },
};

/**
 * Connection pill for live data: Connecting, Live, Partial or Offline. labelClassName lets a
 * bar condense it to the dot on narrow frames; the label stays for screen readers.
 */
export function ConnectionPill({ state, className, labelClassName }: { state: ConnectionState; className?: string; labelClassName?: string }) {
  const meta = CONNECTION[state];
  return (
    <div
      role="status"
      aria-live="polite"
      title={meta.label}
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[9px] border border-hair bg-black/40 px-[11px] font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-dim",
        className,
      )}
    >
      <StatusDot status={meta.status} pulse={meta.pulse} size="sm" />
      <span className={labelClassName}>{meta.label}</span>
    </div>
  );
}

export type VisualizerLens = { id: string; label: string; searchPlaceholder: string };

export type VisualizerTopbarProps = {
  lenses: VisualizerLens[];
  lens: string;
  onLensChange: (id: string) => void;
  connection: ConnectionState;
  refreshing?: boolean;
  onRefresh?: () => void;
  query?: string;
  onQueryChange?: (q: string) => void;
  className?: string;
};

/** Projects visualizer bar: XO tile, lens-aware search, lens tabs, connection, refresh. */
export function VisualizerTopbar({
  lenses,
  lens,
  onLensChange,
  connection,
  refreshing = false,
  onRefresh,
  query = "",
  onQueryChange,
  className,
}: VisualizerTopbarProps) {
  const current = lenses.find((l) => l.id === lens) ?? lenses[0];
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  return (
    <div className={cn("@container", className)} onKeyDown={(e) => focusOnSlash(e, searchRef.current)}>
    <header
      className={cn(
        "grid grid-cols-[38px_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2.5 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(14,14,16,0.96),rgba(14,14,16,0.82))] px-3.5 py-2.5 backdrop-blur-xl",
        "@3xl:h-16 @3xl:grid-cols-[38px_minmax(160px,244px)_1fr_auto_auto] @3xl:px-[18px] @3xl:py-0",
      )}
    >
      <a
        href="#map"
        onClick={(e) => {
          e.preventDefault();
          onLensChange(lenses[0].id);
        }}
        aria-label="XO projects home"
        className="grid size-[38px] place-items-center rounded-[11px]! border border-white/70 bg-ink text-black shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      >
        <XOMark height={10} title={null} mono />
      </a>
      <label htmlFor={searchId} className="relative flex h-[38px] min-w-0 items-center rounded-[10px] border border-white/[0.08] bg-black/70 transition-colors focus-within:border-white/25">
        <Search aria-hidden="true" className="ml-3 size-[15px] shrink-0 text-ink-faint" />
        <span className="sr-only">{current.searchPlaceholder}</span>
        <input
          ref={searchRef}
          id={searchId}
          type="search"
          autoComplete="off"
          aria-keyshortcuts="/"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder={current.searchPlaceholder}
          className="peer h-full w-full min-w-0 bg-transparent pl-2.5 pr-3 text-[12px] text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none @md:pr-9"
        />
        <Kbd size="sm" subtle className="absolute right-2.5 peer-focus:opacity-0 @max-md:hidden!">
          /
        </Kbd>
      </label>
      <nav
        aria-label="Visualizer views"
        className="col-span-4 row-start-2 flex w-max max-w-full items-center gap-0.5 justify-self-center overflow-x-auto rounded-[10px] border border-white/[0.08] bg-black/70 p-[3px] [scrollbar-width:none] @3xl:col-span-1 @3xl:col-start-3 @3xl:row-start-1"
      >
        {lenses.map((l) => {
          const on = l.id === lens;
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={on}
              onClick={() => onLensChange(l.id)}
              className={cn(
                "h-[30px] min-w-[76px] shrink-0 rounded-[7px]! px-3.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline-offset-1!",
                on ? "bg-ink text-black shadow-[0_1px_8px_rgba(0,0,0,0.35)]" : "text-ink-faint hover:text-ink-dim",
              )}
            >
              {l.label}
            </button>
          );
        })}
      </nav>
      <ConnectionPill state={connection} className="@3xl:col-start-4" labelClassName="sr-only @lg:not-sr-only" />
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh live data"
        aria-busy={refreshing || undefined}
        className="inline-flex h-[34px] items-center gap-2 rounded-[9px]! border border-hair bg-black/40 px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink @3xl:px-3"
      >
        <RotateCw aria-hidden="true" className={cn("size-4", refreshing && "spin")} />
        <span className="hidden @lg:inline">Refresh</span>
      </button>
    </header>
    </div>
  );
}

/* ----------------------------------------------------------------------------- landing Space mock bar */

export type SpaceMockTopbarProps = {
  segments: string[];
  active: string;
  onChange: (segment: string) => void;
  root: string;
  searchPlaceholder: string;
  stats: string[];
  /** Provenance tag for the numbers ("Mock"). */
  provenance?: string;
  className?: string;
};

const MS_LIME = "#b4e34a";

/** The Space app bar as the landing page mocks it: mono segments, graph root, search and stats. */
export function SpaceMockTopbar({ segments, active, onChange, root, searchPlaceholder, stats, provenance = "Mock", className }: SpaceMockTopbarProps) {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  return (
    <div className={cn("@container", className)} onKeyDown={(e) => focusOnSlash(e, searchRef.current)}>
    <header className="border-b border-hair bg-[#0b0c0a]">
      <nav aria-label="Space views" className="flex items-stretch gap-1 overflow-x-auto px-3 [scrollbar-width:none] @3xl:px-4">
        {segments.map((s) => {
          const on = s === active;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(s)}
              className={cn(
                "relative h-10 shrink-0 rounded-none! px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-colors focus-visible:outline-offset-[-3px]!",
                on ? "" : "text-ink-faint hover:text-ink-dim",
              )}
              style={on ? { color: MS_LIME } : undefined}
            >
              {s}
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-2.5 bottom-0 h-[2px] rounded-full transition-opacity", on ? "opacity-100" : "opacity-0")}
                style={{ background: MS_LIME }}
              />
            </button>
          );
        })}
      </nav>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hair-soft px-3 py-2 @3xl:px-4">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Root
          <b className="rounded-[5px] border border-hair bg-s2 px-1.5 py-0.5 font-medium normal-case tracking-normal text-ink">{root}</b>
        </span>
        <label htmlFor={searchId} className="relative flex h-8 min-w-0 flex-1 basis-[200px] items-center rounded-[8px] border border-hair bg-black/50">
          <span className="sr-only">Search</span>
          <Search aria-hidden="true" className="ml-2.5 size-3.5 text-ink-faint" />
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            aria-keyshortcuts="/"
            placeholder={searchPlaceholder}
            className="peer h-full w-full min-w-0 bg-transparent pl-2 pr-8 text-[12px] text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none"
          />
          <Kbd size="xs" subtle className="absolute right-2 peer-focus:opacity-0">
            /
          </Kbd>
        </label>
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint tabular-nums">
          {stats.map((s, i) => (
            <span key={s} className="whitespace-nowrap">
              {i > 0 ? <span aria-hidden="true" className="mr-2">·</span> : null}
              {s}
            </span>
          ))}
          <span className="rounded-[3px] border border-hair px-1 py-px text-[9px] tracking-[0.1em]">{provenance}</span>
        </p>
      </div>
    </header>
    </div>
  );
}
