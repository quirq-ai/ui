"use client";

// Embedded app frame: one app at its own origin under a bar. TelescopeBar is galileo's bar
// (brand, source switcher with up or down dots, path field, reload, open in a tab, Sources);
// SourceFrame is the full-bleed, white-backed area a source renders in, kept alive while
// hidden; BridgeReadout shows what the in-frame bridge reports. AppIframePane is the swarm
// docked app pane (minting, not running, loaded) and BrowserToolbar, BrowserTabStrip and
// BrowserNewTab make the xo-client browser pane. No real iframes: the demos pass mock pages.
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ExternalLink, Plus, RotateCw, Telescope, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GalileoSource } from "@/lib/fixtures";
import { Spinner, StatusDot } from "@/components/ui";
import { Menu, type MenuEntry } from "./menu";
import { XO_LIME } from "./_kit";

/* ----------------------------------------------------------------------------- telescope bar */

export type TelescopeBarProps = {
  sources: GalileoSource[];
  /** Current source name; null on the Sources page. */
  current: string | null;
  /** Path inside the current source, as the bridge reports it. */
  path: string;
  onSelectSource: (name: string | null) => void;
  onNavigate: (path: string) => void;
  onReload?: () => void;
  onPopOut?: () => void;
  /** First load, before the sources API answers. */
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const barIcon =
  "grid size-8 shrink-0 place-items-center rounded-[8px]! text-ink-dim transition-colors hover:bg-white/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4";

/** galileo's 48px bar. Under 640px of container width the wordmark text and Sources pill hide. */
export function TelescopeBar({
  sources,
  current,
  path,
  onSelectSource,
  onNavigate,
  onReload,
  onPopOut,
  disabled = false,
  loading = false,
  className,
}: TelescopeBarProps) {
  const source = sources.find((s) => s.name === current) ?? null;
  const [draft, setDraft] = useState<{ key: string; value: string } | null>(null);
  const key = `${current ?? ""} ${path}`;
  const value = draft && draft.key === key ? draft.value : source ? path : "";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!source) return;
    const next = value.startsWith("/") ? value : `/${value}`;
    setDraft(null);
    onNavigate(next);
  }

  const entries: MenuEntry[] = [
    { id: "__sources", label: "Sources", hint: "all", checked: current === null, onSelect: () => onSelectSource(null) },
    { kind: "label", id: "l-ports", label: "Ports" },
    ...sources
      .filter((s) => s.type === "port")
      .map((s): MenuEntry => ({
        id: s.name,
        label: s.name,
        icon: <StatusDot status={s.up ? "up" : "down"} size="xs" halo={false} />,
        hint: `:${s.port}`,
        checked: s.name === current,
        onSelect: () => onSelectSource(s.name),
      })),
    { kind: "label", id: "l-files", label: "Files" },
    ...sources
      .filter((s) => s.type === "files")
      .map((s): MenuEntry => ({
        id: s.name,
        label: s.name,
        icon: <StatusDot status={s.up ? "up" : "down"} size="xs" halo={false} />,
        hint: s.kind ?? undefined,
        checked: s.name === current,
        onSelect: () => onSelectSource(s.name),
      })),
  ];

  return (
    <div className={cn("@container", className)}>
      <header aria-label="telescope" className="relative z-10 flex h-12 items-center gap-2.5 border-b border-white/[0.09] bg-[#0a0a0b] pl-3 pr-2.5">
        <a
          href="#sources"
          onClick={(e) => {
            e.preventDefault();
            onSelectSource(null);
          }}
          title="galileo: the Sources page"
          className="inline-flex shrink-0 items-center gap-2 rounded-[6px]! font-semibold tracking-[-0.02em] text-ink"
        >
          <span className="grid size-[22px] place-items-center rounded-[6px] border border-hair bg-s3" style={{ color: XO_LIME }}>
            <Telescope aria-hidden="true" className="size-3.5" />
          </span>
          <span className="hidden @min-[640px]:inline">galileo</span>
          <span className="sr-only @min-[640px]:hidden">galileo</span>
        </a>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Menu
            label="Sources"
            align="start"
            disabled={disabled}
            menuClassName="w-[240px] max-h-[300px] overflow-y-auto scroll-thin"
            triggerClassName="inline-flex h-8 max-w-[46vw] shrink-0 items-center gap-2 rounded-[8px]! border border-white/[0.09] bg-s2 pl-2.5 pr-2 transition-colors hover:border-white/20 aria-expanded:border-white/25 disabled:cursor-default disabled:opacity-70 @min-[640px]:max-w-[220px]"
            trigger={
              <>
                {source ? <StatusDot status={source.up ? "up" : "down"} size="sm" /> : null}
                <span className="truncate text-[13.5px] font-semibold text-ink">{source ? source.name : "Sources"}</span>
                <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
              </>
            }
            entries={entries}
          />
          <form onSubmit={submit} className="min-w-0 flex-1">
            <input
              type="text"
              spellCheck={false}
              autoCapitalize="off"
              aria-label="Path in this source: type one and press Enter"
              placeholder="/"
              disabled={disabled || !source}
              value={value}
              onChange={(e) => setDraft({ key, value: e.target.value })}
              className="h-8 w-full min-w-0 rounded-[8px]! border border-white/[0.09] bg-[#0d0d0e] px-2.5 font-mono text-[12.5px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-white/35 disabled:text-ink-faint"
            />
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={onReload} disabled={disabled || !source} aria-label="Reload this source" title="Reload this source" className={barIcon}>
            <RotateCw aria-hidden="true" className={cn(loading && "spin")} />
          </button>
          <button
            type="button"
            onClick={onPopOut}
            disabled={disabled || !source}
            aria-label="Open this source in a tab of its own"
            title="Open this source in a tab of its own"
            className={barIcon}
          >
            <ExternalLink aria-hidden="true" />
          </button>
          <a
            href="#sources"
            onClick={(e) => {
              e.preventDefault();
              onSelectSource(null);
            }}
            aria-current={current === null ? "page" : undefined}
            className="ml-1 hidden h-8 items-center rounded-full! border border-white/[0.09] px-3 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink aria-[current=page]:border-white/25 aria-[current=page]:text-ink @min-[640px]:inline-flex"
          >
            Sources
          </a>
        </div>
      </header>
    </div>
  );
}

/* ----------------------------------------------------------------------------- source frame */

export type SourceFrameProps = {
  /** The page the source serves. */
  children: ReactNode;
  /** Accessible name, as an iframe title would be. */
  title: string;
  /** white backs light apps the way telescope's frame does; dark for apps that paint their own ground. */
  backing?: "white" | "dark";
  loading?: boolean;
  /** Hidden but mounted, so Back returns to the same state. */
  hidden?: boolean;
  className?: string;
};

/** Full-bleed, borderless app area. Hidden frames stay mounted (kept alive). */
export function SourceFrame({ children, title, backing = "white", loading = false, hidden = false, className }: SourceFrameProps) {
  return (
    <div
      role="document"
      aria-label={title}
      aria-busy={loading || undefined}
      hidden={hidden}
      className={cn("relative min-h-0 flex-1 overflow-hidden", backing === "white" ? "bg-white text-[#16181d] [color-scheme:light]" : "bg-[#0b0b0c]", className)}
    >
      <div className="scroll-thin h-full overflow-y-auto">{children}</div>
      {loading ? (
        <div className={cn("absolute inset-0 grid place-items-center", backing === "white" ? "bg-white/80 text-[#16181d]" : "bg-black/70 text-ink")}>
          <span
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] shadow-[0_6px_20px_rgba(0,0,0,0.12)]",
              backing === "white" ? "border-[#e6e8ee] bg-white" : "border-hair bg-s2",
            )}
          >
            <Spinner size="sm" label={null} />
            Loading…
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** What the bridge inside the frame reports: path and title, polled every 300 ms. */
export function BridgeReadout({ path, title, note }: { path: string; title: string; note?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hair-soft bg-[#0a0a0b] px-3 py-2 font-mono text-[10.5px] text-ink-faint">
      <span className="uppercase tracking-[0.14em]">Bridge</span>
      <span>
        path <b className="font-medium text-ink-dim">{path}</b>
      </span>
      <span className="min-w-0 truncate">
        tab title <b className="font-medium text-ink-dim">{title}</b>
      </span>
      {note ? <span className="ml-auto">{note}</span> : null}
    </p>
  );
}

/* ----------------------------------------------------------------------------- swarm app pane */

export type AppPaneState = "loading-space" | "minting" | "not_running" | "missing" | "error" | "ready";

export type AppIframePaneProps = {
  /** The app's display name, also what the pane calls it: "Space", "Cowork". */
  appName: string;
  state: AppPaneState;
  onReload?: () => void;
  onOpenExternal?: () => void;
  /** The loaded app. */
  children?: ReactNode;
  className?: string;
};

function PaneMessage({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center gap-2 p-4 text-center text-[12px] text-ink-faint">{children}</div>;
}

/** A space app docked as a pane: a URL is minted on mount, then the app loads under reload and open controls. */
export function AppIframePane({ appName, state, onReload, onOpenExternal, children, className }: AppIframePaneProps) {
  if (state === "loading-space") {
    return (
      <PaneMessage>
        <Spinner size="sm" label={null} />
        Loading space…
      </PaneMessage>
    );
  }
  if (state === "minting") {
    return (
      <PaneMessage>
        <Spinner size="sm" label={null} />
        Opening {appName}…
      </PaneMessage>
    );
  }
  if (state === "not_running") return <PaneMessage>Start your space to open {appName}.</PaneMessage>;
  if (state === "missing") return <PaneMessage>This space has no {appName} app.</PaneMessage>;
  if (state === "error") return <PaneMessage>Could not open {appName}. Try again in a moment.</PaneMessage>;
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-end gap-1 border-b border-hair-soft px-2 py-1">
        <button type="button" onClick={onReload} className="grid size-7 place-items-center rounded-[7px]! text-ink-dim hover:bg-white/[0.06] hover:text-ink">
          <RotateCw aria-hidden="true" className="size-3.5" />
          <span className="sr-only">Reload {appName}</span>
        </button>
        <button type="button" onClick={onOpenExternal} className="grid size-7 place-items-center rounded-[7px]! text-ink-dim hover:bg-white/[0.06] hover:text-ink">
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only">Open {appName} in a new tab</span>
        </button>
      </div>
      <div role="document" aria-label={appName} className="scroll-thin min-h-0 w-full flex-1 overflow-y-auto bg-[#0b0b0c]">
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- browser pane */

export type BrowserTabInfo = { id: string; title: string; loading?: boolean };

/** Tabs of the in-space browser with a new tab button. */
export function BrowserTabStrip({
  tabs,
  active,
  onSelect,
  onClose,
  onNew,
}: {
  tabs: BrowserTabInfo[];
  active: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-9 shrink-0 items-end gap-1 overflow-x-auto border-b border-hair-soft bg-[#0a0a0b] px-1.5 [scrollbar-width:none]">
      <div role="tablist" aria-label="Browser tabs" className="flex min-w-0 items-end gap-1">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <span
              key={t.id}
              className={cn(
                "group flex h-8 max-w-[200px] shrink-0 items-center gap-1.5 rounded-t-[8px] border border-b-0 pl-2.5 pr-1 text-[12px]",
                on ? "border-hair bg-[#111113] text-ink" : "border-transparent text-ink-dim hover:text-ink",
              )}
            >
              <button type="button" role="tab" aria-selected={on} onClick={() => onSelect(t.id)} className="flex min-w-0 items-center gap-1.5 rounded-[5px]! focus-visible:outline-offset-[-2px]!">
                {t.loading ? <Spinner size="xs" label={null} /> : null}
                <span className="truncate">{t.title}</span>
              </button>
              <button
                type="button"
                aria-label={`Close ${t.title}`}
                onClick={() => onClose(t.id)}
                className="grid size-5 shrink-0 place-items-center rounded-[5px]! text-ink-faint hover:bg-white/[0.08] hover:text-ink focus-visible:outline-offset-[-2px]!"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </span>
          );
        })}
      </div>
      <button type="button" aria-label="New tab" onClick={onNew} className="mb-1 grid size-7 shrink-0 place-items-center rounded-[7px]! text-ink-dim hover:bg-white/[0.06] hover:text-ink">
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

export type BrowserToolbarProps = {
  /** null on a new tab. */
  url: string | null;
  canBack: boolean;
  canForward: boolean;
  loading?: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  /** Return false when the address is refused. */
  onSubmit: (input: string) => boolean;
  onOpenExternal?: () => void;
};

const toolIcon =
  "grid size-8 shrink-0 place-items-center rounded-[8px]! text-ink-dim transition-colors hover:bg-white/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4";

/** Back, forward, reload, the address bar and a way out to a real browser tab. */
export function BrowserToolbar({ url, canBack, canForward, loading = false, onBack, onForward, onReload, onSubmit, onOpenExternal }: BrowserToolbarProps) {
  const [draft, setDraft] = useState<{ key: string; value: string; refused: boolean } | null>(null);
  const key = url ?? "";
  const value = draft && draft.key === key ? draft.value : url ?? "";
  const refused = Boolean(draft && draft.key === key && draft.refused);
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-hair-soft bg-[#111113] p-1.5">
      <button type="button" aria-label="Back" title="Back" disabled={!canBack} onClick={onBack} className={toolIcon}>
        <ArrowLeft aria-hidden="true" />
      </button>
      <button type="button" aria-label="Forward" title="Forward" disabled={!canForward} onClick={onForward} className={toolIcon}>
        <ArrowRight aria-hidden="true" />
      </button>
      <button type="button" aria-label="Reload" title="Reload" disabled={!url} onClick={onReload} className={toolIcon}>
        <RotateCw aria-hidden="true" className={cn("size-3.5!", loading && "spin")} />
      </button>
      <form
        className="min-w-0 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = onSubmit(value.trim());
          setDraft(ok ? null : { key, value, refused: true });
        }}
      >
        <input
          type="text"
          aria-label="Address"
          aria-invalid={refused || undefined}
          spellCheck={false}
          placeholder="Type an address, like localhost:3000"
          value={value}
          onChange={(e) => setDraft({ key, value: e.target.value, refused: false })}
          className="h-8 w-full min-w-0 rounded-[8px]! border border-hair bg-s1 px-2.5 font-mono text-[12px] text-ink outline-none placeholder:font-sans placeholder:text-ink-faint focus:border-white/30 aria-[invalid=true]:border-red/60"
        />
      </form>
      <button type="button" aria-label="Open in a browser tab" title="Open in a browser tab" disabled={!url} onClick={onOpenExternal} className={toolIcon}>
        <ExternalLink aria-hidden="true" className="size-3.5!" />
      </button>
    </div>
  );
}

/** A new tab: no frame yet, just shortcuts. */
export function BrowserNewTab({ shortcuts, onOpen }: { shortcuts: { label: string; url: string }[]; onOpen: (url: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-[14px] font-medium text-ink">New tab</p>
      <p className="max-w-xs text-[12px] leading-relaxed text-ink-dim">
        Type an address above, like <code className="font-mono text-ink">localhost:3000</code>, or open one of these.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {shortcuts.map((s) => (
          <button
            key={s.url}
            type="button"
            onClick={() => onOpen(s.url)}
            className="h-7 rounded-[8px]! border border-hair bg-s1 px-2.5 text-[12px] text-ink transition-colors hover:border-hair-strong hover:bg-s2"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
