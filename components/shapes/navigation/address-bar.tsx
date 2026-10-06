"use client";

// Where a framed app is, and how to move it:
//  PathField       mono path or address input: focus selects, Enter navigates, Esc reverts,
//                  typing is never overwritten by updates while focused, invalid state
//  TelescopeBar    galileo's 48px bar: brand, source switcher, path, reload, open ↗, Sources
//  BrowserToolbar  back, forward, reload, address and open in a real tab
//  BrowserTabStrip tabs with a 3/8 count, unloaded and loading tabs, close and new tab
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CircleDashed, ExternalLink, Globe, LoaderCircle, Plus, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { XOMark } from "@/components/ui/runtime-logo";
import { SourceSwitcher, type SourceLike } from "./scope-switcher";

/* ----------------------------------------------------------------------------- PathField */

export type PathFieldProps = {
  /** The real path or address; shown whenever the field is not being edited. */
  value: string;
  /** Return false to mark the input invalid and keep it for fixing. */
  onNavigate?: (input: string) => boolean;
  disabled?: boolean;
  placeholder?: string;
  "aria-label": string;
  /** Message shown when Enter is refused. */
  invalidMessage?: string;
  /** Typed text on first render (state samples); the field shows it until Escape or blur. */
  defaultDraft?: string;
  /** Start in the invalid state with defaultDraft (state samples). */
  defaultInvalid?: boolean;
  className?: string;
};

/** Mono address input. Enter goes, Escape puts the real value back. */
export function PathField({
  value,
  onNavigate,
  disabled = false,
  placeholder = "/",
  "aria-label": ariaLabel,
  invalidMessage = "That address cannot be opened.",
  defaultDraft,
  defaultInvalid = false,
  className,
}: PathFieldProps) {
  const [draft, setDraft] = useState<string | null>(defaultDraft ?? null);
  const [invalid, setInvalid] = useState(defaultInvalid && defaultDraft !== undefined);
  const errId = useId();
  const shown = draft ?? value;

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const ok = onNavigate ? onNavigate(shown.trim()) : true;
      if (ok) {
        setDraft(null);
        setInvalid(false);
        e.currentTarget.blur();
      } else setInvalid(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraft(null);
      setInvalid(false);
      e.currentTarget.blur();
    }
  }

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <input
        type="text"
        value={shown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errId : undefined}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        inputMode="url"
        onFocus={(e) => {
          setDraft((d) => d ?? value);
          e.currentTarget.select();
        }}
        onBlur={() => {
          setDraft(null);
          setInvalid(false);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "h-8 w-full min-w-0 rounded-[8px]! border bg-[#0d0d0f] px-2.5 font-mono text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint",
          "focus:border-[#83d63a] focus-visible:outline-none! disabled:text-ink-faint",
          invalid ? "border-red/70 focus:border-red/70" : "border-hair",
        )}
      />
      {invalid ? (
        <p
          id={errId}
          role="alert"
          className="absolute left-0 top-[calc(100%+6px)] z-30 w-max max-w-[min(320px,calc(100vw-48px))] rounded-[8px] border border-red/40 bg-[#1a0f0e] px-2.5 py-1.5 text-[12px] leading-snug text-[#ff9b93] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          {invalidMessage}
        </p>
      ) : null}
    </div>
  );
}

const iconBtn =
  "inline-grid size-8 shrink-0 place-items-center rounded-[8px]! text-ink-dim transition-colors hover:bg-s2 hover:text-ink disabled:pointer-events-none disabled:opacity-35 aria-disabled:pointer-events-none aria-disabled:opacity-35 [&_svg]:size-4";

/* ----------------------------------------------------------------------------- TelescopeBar */

export type TelescopeBarProps = {
  /** null until the source list loads: the switcher, path, reload and open are disabled and
      nothing is marked current yet. */
  sources: SourceLike[] | null;
  /** Current source; null is the Sources page. */
  current: string | null;
  path: string;
  /** Address of the current source, for the open-in-a-tab link. */
  openHref?: string;
  reloading?: boolean;
  onPick: (name: string) => void;
  onNavigate: (path: string) => boolean;
  onReload: () => void;
  onSources: () => void;
  /** Source menu width (CSS); defaults to the telescope bar's min(420px, 100vw - 24px). */
  menuWidth?: string;
  className?: string;
};

/** telescope's bar along the top of a galileo source. Brand text and the Sources pill drop under 560px. */
export function TelescopeBar({ sources, current, path, openHref, reloading = false, onPick, onNavigate, onReload, onSources, menuWidth, className }: TelescopeBarProps) {
  const ready = sources !== null;
  const onSourcesPage = ready && current === null;
  const off = !ready || current === null;
  return (
    <div className={cn("@container", className)}>
      <header aria-label="telescope" className="relative flex h-12 items-center gap-2.5 border-b border-hair bg-[#0a0a0b] pl-3 pr-2.5">
        <a
          href="/sources"
          onClick={(e) => {
            e.preventDefault();
            onSources();
          }}
          title="galileo: the Sources page"
          className="inline-flex shrink-0 items-center gap-2 rounded-[6px]! font-bold tracking-[-0.02em]"
        >
          <span className="inline-grid size-[22px] place-items-center rounded-[6px] border border-hair bg-s2">
            <XOMark height={7} title={null} />
          </span>
          <span className="hidden text-[15px] text-[#a6dd73] @[560px]:inline">galileo</span>
          <span className="sr-only @[560px]:hidden">galileo</span>
        </a>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <SourceSwitcher
            sources={sources}
            current={current}
            onPick={onPick}
            footer={{ label: "Add or remove sources", href: "/sources", onClick: onSources }}
            menuWidth={menuWidth}
            className="max-w-[55%] shrink-0 @[560px]:max-w-[40%]"
          />
          <PathField
            value={off ? "" : path}
            disabled={off}
            placeholder={onSourcesPage ? "Pick a source" : "/"}
            aria-label="Path in this source: type one and press Enter"
            invalidMessage="Paths start with /, like /pricing."
            onNavigate={onNavigate}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" className={iconBtn} aria-label="Reload this source" title="Reload this source" disabled={off} onClick={onReload}>
            <RotateCw aria-hidden="true" className={cn(reloading && "spin")} />
          </button>
          <a
            className={iconBtn}
            href={off ? undefined : openHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open this source in a tab of its own"
            title="Open this source in a tab of its own"
            aria-disabled={off || undefined}
          >
            <ExternalLink aria-hidden="true" />
          </a>
          <a
            href="/sources"
            aria-current={onSourcesPage ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onSources();
            }}
            className={cn(
              "ml-1 hidden shrink-0 whitespace-nowrap rounded-full! border px-3 py-[5px] text-[13px] transition-colors @[560px]:inline-flex",
              onSourcesPage ? "border-[#83d63a] text-[#a6dd73]" : "border-[rgba(131,214,58,0.22)] text-ink hover:border-[#83d63a] hover:text-[#a6dd73]",
            )}
          >
            Sources
          </a>
        </div>
      </header>
    </div>
  );
}

/* ----------------------------------------------------------------------------- BrowserToolbar */

export type BrowserToolbarProps = {
  url: string | null;
  canBack: boolean;
  canForward: boolean;
  loading?: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onNavigate: (input: string) => boolean;
  className?: string;
};

/** In-app browser toolbar. The address resets when the tab or the page changes. */
export function BrowserToolbar({ url, canBack, canForward, loading = false, onBack, onForward, onReload, onNavigate, className }: BrowserToolbarProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-1 border-b border-hair bg-[#0d0d0f] p-1.5", className)}>
      <button type="button" className={iconBtn} aria-label="Back" title="Back" disabled={!canBack} onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
      </button>
      <button type="button" className={iconBtn} aria-label="Forward" title="Forward" disabled={!canForward} onClick={onForward}>
        <ArrowRight aria-hidden="true" />
      </button>
      <button type="button" className={iconBtn} aria-label="Reload" title="Reload" disabled={!url} onClick={onReload}>
        <RotateCw aria-hidden="true" className={cn("size-3.5!", loading && "spin")} />
      </button>
      <PathField
        key={url ?? "new"}
        value={url ?? ""}
        placeholder="localhost:3000 or https://…"
        aria-label="Address"
        invalidMessage="Enter an http(s) address, like localhost:3000"
        onNavigate={onNavigate}
      />
      <a
        className={iconBtn}
        href={url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in a browser tab"
        title="Open in a browser tab"
        aria-disabled={!url || undefined}
      >
        <ExternalLink aria-hidden="true" className="size-3.5!" />
      </a>
    </div>
  );
}

/* ----------------------------------------------------------------------------- BrowserTabStrip */

export type BrowserTabInfo = {
  id: string;
  title: string;
  /** null for a new, empty tab. */
  url: string | null;
  loading?: boolean;
  /** false: unloaded to save memory; loads again when shown. */
  loaded?: boolean;
};

export type BrowserTabStripProps = {
  tabs: BrowserTabInfo[];
  activeId: string;
  max: number;
  onShow: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  /** Panel id the tabs control. */
  panelId?: string;
  className?: string;
};

/** Browser tabs with a count against the limit. ← → move, Delete or middle-click closes a tab. */
export function BrowserTabStrip({ tabs, activeId, max, onShow, onClose, onNew, panelId, className }: BrowserTabStripProps) {
  const full = tabs.length >= max;
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Delete") {
      e.preventDefault();
      const root = e.currentTarget;
      const i = tabs.findIndex((t) => t.id === activeId);
      const after = tabs[i + 1] ?? tabs[i - 1];
      onClose(activeId);
      if (after) requestAnimationFrame(() => root.querySelector<HTMLElement>(`[data-tab="${after.id}"]`)?.focus());
      return;
    }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex((t) => t.id === activeId);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    if (!next) return;
    e.preventDefault();
    const root = e.currentTarget;
    onShow(next.id);
    requestAnimationFrame(() => root.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus());
  }
  return (
    <div className={cn("flex shrink-0 items-end gap-1 border-b border-hair bg-[#0a0a0b] px-1.5 pt-1.5", className)}>
      <div role="tablist" aria-label="Browser tabs" onKeyDown={onKeyDown} className="flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const shown = t.id === activeId;
          const unloaded = t.url !== null && t.loaded === false;
          return (
            <div
              key={t.id}
              className={cn(
                "flex h-8 min-w-24 max-w-48 flex-1 items-center rounded-t-[8px] border border-b-0 text-[12px]",
                shown ? "border-hair bg-[#0d0d0f] text-ink" : "border-transparent text-ink-faint hover:bg-white/[0.04] hover:text-ink-dim",
              )}
            >
              <button
                type="button"
                role="tab"
                data-tab={t.id}
                aria-selected={shown}
                aria-controls={panelId}
                aria-keyshortcuts="Delete"
                tabIndex={shown ? 0 : -1}
                title={unloaded ? `${t.url}\nUnloaded to save memory; loads again when shown.` : (t.url ?? "New tab")}
                onClick={() => onShow(t.id)}
                onAuxClick={(e) => {
                  if (e.button !== 1) return;
                  e.preventDefault();
                  onClose(t.id);
                }}
                className="flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-tl-[8px]! pl-2 text-left focus-visible:outline-offset-[-2px]!"
              >
                {t.loading ? (
                  <LoaderCircle aria-hidden="true" className="spin size-3.5 shrink-0" />
                ) : unloaded ? (
                  <CircleDashed aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
                ) : (
                  <Globe aria-hidden="true" className="size-3.5 shrink-0" />
                )}
                <span className="truncate">{t.title}</span>
                {unloaded ? <span className="sr-only">, unloaded</span> : null}
              </button>
              {/* Pointer shortcut; keyboard users press Delete on the tab, so the tablist owns only tabs. */}
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                title={`Close ${t.title}`}
                onClick={() => onClose(t.id)}
                className="mr-1 flex size-5 shrink-0 items-center justify-center rounded-[4px]! opacity-60 hover:bg-white/[0.08] hover:opacity-100 [&_svg]:size-3"
              >
                <X aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 pb-0.5">
        <span className={cn("px-1 font-mono text-[11px] tabular-nums", full ? "text-red" : "text-ink-faint")} title={`${tabs.length} of ${max} tabs open`}>
          {tabs.length}/{max}
          <span className="sr-only"> tabs open</span>
        </span>
        <button type="button" className={cn(iconBtn, "size-7")} aria-label={full ? `${max} tabs is the limit` : "New tab"} title={full ? `${max} tabs is the limit` : "New tab"} disabled={full} onClick={onNew}>
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Placeholder page body for framed apps in demos and empty tabs. */
export function FramedPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-h-[120px] bg-white p-5 text-[#1d2433]", className)}>{children}</div>;
}
