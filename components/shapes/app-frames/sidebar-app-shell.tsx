"use client";

// Sidebar app shell: the XO Swarm frame. A collapsible sidebar (full, icon rail, or an
// off-canvas sheet on narrow frames), a 64px header with the toggle, breadcrumb and Share
// space, and the content area. SpaceSplitView divides a running space into its info column
// and the app panel with a draggable, keyboard operable handle; when both minimum widths no
// longer fit (measured, not a media query) it becomes an Open apps / Exit apps toggle.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ChevronsUpDown, GripVertical, PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, CopyButton, RuntimeTag, StatusDot, XOMark, type DotStatus, type LogoId } from "@/components/ui";
import { Menu, type MenuEntry } from "./menu";

/* ----------------------------------------------------------------------------- sidebar nav */

export type SidebarNavItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  /** Status dot for space rows. */
  status?: DotStatus;
  /** Right side content: a count or a runtime glyph. */
  trailing?: ReactNode;
  /** Primary rows such as New space get a filled icon tile. */
  emphasis?: boolean;
};

export type SidebarNavGroup = { id: string; label: string; items: SidebarNavItem[] };

export type AppSidebarNavProps = {
  header?: ReactNode;
  groups: SidebarNavGroup[];
  footer?: ReactNode;
  collapsed?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
};

/** Grouped sidebar navigation. Collapsed it keeps icons and status dots, labels stay for screen readers. */
export function AppSidebarNav({ header, groups, footer, collapsed = false, onSelect, className }: AppSidebarNavProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {header ? <div className={cn("shrink-0 p-2", collapsed && "px-1.5")}>{header}</div> : null}
      <nav aria-label="Sidebar" className="scroll-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2">
        {groups.map((g) => (
          <div key={g.id} className="pt-3 first:pt-1">
            <h3 className={cn("mb-1 px-2 text-[11px] font-medium text-ink-faint", collapsed && "sr-only")}>{g.label}</h3>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    title={collapsed ? it.label : undefined}
                    aria-current={it.active ? "page" : undefined}
                    onClick={() => onSelect?.(it.id)}
                    className={cn(
                      "flex h-8 w-full items-center gap-2.5 rounded-[8px]! px-2 text-left text-[13px] transition-colors",
                      collapsed && "justify-center px-0",
                      it.active ? "bg-s3 font-medium text-ink" : "text-ink-dim hover:bg-s2 hover:text-ink",
                    )}
                  >
                    {it.icon ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-5 shrink-0 place-items-center [&_svg]:size-4",
                          it.emphasis && "rounded-[6px] bg-ink text-black [&_svg]:size-3.5",
                        )}
                      >
                        {it.icon}
                      </span>
                    ) : it.status ? (
                      <span className="grid size-5 shrink-0 place-items-center">
                        <StatusDot status={it.status} size="sm" pulse={it.status === "busy"} />
                      </span>
                    ) : null}
                    <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>{it.label}</span>
                    {!collapsed && it.trailing ? <span className="shrink-0 text-[11px] text-ink-faint">{it.trailing}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {footer ? <div className={cn("shrink-0 border-t border-hair-soft p-2", collapsed && "px-1.5")}>{footer}</div> : null}
    </div>
  );
}

export type ScopeSwitcherProps = {
  scopes: { id: string; name: string; kind: string }[];
  value: string;
  onChange: (id: string) => void;
  collapsed?: boolean;
};

/** Personal spaces or an organization's spaces, picked from a menu. */
export function ScopeSwitcher({ scopes, value, onChange, collapsed = false }: ScopeSwitcherProps) {
  const current = scopes.find((s) => s.id === value) ?? scopes[0];
  const entries: MenuEntry[] = [
    { kind: "label", id: "l", label: "Switch scope" },
    ...scopes.map((s) => ({ id: s.id, label: s.name, hint: s.kind, checked: s.id === value, onSelect: () => onChange(s.id) })),
  ];
  return (
    <Menu
      label="Scopes"
      entries={entries}
      align="start"
      triggerAriaLabel={collapsed ? `Scope: ${current.name}` : undefined}
      triggerClassName={cn(
        "flex w-full items-center gap-2.5 rounded-[10px]! p-1.5 text-left transition-colors hover:bg-s2",
        collapsed && "justify-center",
      )}
      menuClassName="w-[232px]"
      trigger={
        <>
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-hair bg-s3">
            <XOMark height={9} title={null} />
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{current.name}</span>
                <span className="block truncate text-[11px] text-ink-faint">{current.kind}</span>
              </span>
              <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
            </>
          ) : null}
        </>
      }
    />
  );
}

/* ----------------------------------------------------------------------------- breadcrumb */

export type ShellBreadcrumbProps = {
  spaceName: string;
  spaceId: string;
  runtime: LogoId;
  className?: string;
};

/**
 * XO mark › space name, the runtime badge and a copy control for the space ID. The badge shows
 * the runtime's display name ("Claude Code"), not its raw id.
 */
export function ShellBreadcrumb({ spaceName, spaceId, runtime, className }: ShellBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0 overflow-x-auto px-1 py-[6px] [scrollbar-width:none]", className)}>
      <ol className="flex items-center gap-2 whitespace-nowrap text-[13px]">
        <li className="flex items-center">
          <XOMark height={12} title="XO" />
        </li>
        <li aria-hidden="true" className="text-ink-faint">
          ›
        </li>
        <li className="flex items-center gap-2">
          <span aria-current="page" className="font-medium text-ink">
            {spaceName}
          </span>
          {/* the badge gives way first on narrow headers so the space name never truncates mid-badge */}
          <RuntimeTag id={runtime} className="@max-sm:hidden!" />
          <CopyButton text={spaceId} size="sm" aria-label="Copy space ID" announce="Space ID copied" />
        </li>
      </ol>
    </nav>
  );
}

/* ----------------------------------------------------------------------------- shell */

export type ShellMode = "auto" | "desktop" | "mobile";
export type SidebarRenderState = { collapsed: boolean; mobile: boolean; close: () => void };

export type SidebarAppShellProps = {
  /** Sidebar content for the current state (rail, full or sheet). */
  sidebar: (state: SidebarRenderState) => ReactNode;
  /** Breadcrumb or title in the header. */
  header: ReactNode;
  /** Right side of the header: Open apps, Share space. */
  actions?: ReactNode;
  children: ReactNode;
  /** auto switches to the sheet when the frame is narrower than 640px. */
  mode?: ShellMode;
  defaultCollapsed?: boolean;
  defaultSheetOpen?: boolean;
  className?: string;
};

/** Collapsible sidebar, 64px header and content; the sidebar becomes an off-canvas sheet when narrow. */
export function SidebarAppShell({
  sidebar,
  header,
  actions,
  children,
  mode = "auto",
  defaultCollapsed = false,
  defaultSheetOpen = false,
  className,
}: SidebarAppShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [sheetOpen, setSheetOpen] = useState(defaultSheetOpen);
  const [narrow, setNarrow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();

  useEffect(() => {
    if (mode !== "auto") return;
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  const mobile = mode === "mobile" || (mode === "auto" && narrow);
  const sheetShown = mobile && sheetOpen;

  /* Focus moves only for sheets a person opened: a sheet open on first render (a catalog
     specimen) must not pull focus or scroll the page. */
  const wasShown = useRef(false);
  const userOpened = useRef(false);
  useEffect(() => {
    if (sheetShown) {
      wasShown.current = true;
      if (!userOpened.current) return;
      const id = requestAnimationFrame(() =>
        sheetRef.current?.querySelector<HTMLElement>("button, a, input")?.focus({ preventScroll: true }),
      );
      return () => cancelAnimationFrame(id);
    }
    if (wasShown.current) {
      wasShown.current = false;
      if (userOpened.current) toggleRef.current?.focus({ preventScroll: true });
    }
  }, [sheetShown]);

  /* focus returns to the toggle from the effect above, so this stays safe to hand to render props */
  const closeSheet = () => setSheetOpen(false);

  function toggle() {
    userOpened.current = true;
    if (mobile) setSheetOpen((v) => !v);
    else setCollapsed((v) => !v);
  }

  return (
    <div ref={rootRef} className={cn("relative flex min-w-0 overflow-hidden rounded-[14px] border border-hair bg-[#08080a]", className)}>
      {!mobile ? (
        <aside
          aria-label="App sidebar"
          className={cn(
            "flex shrink-0 flex-col border-r border-hair-soft bg-[#0c0c0d] transition-[width] duration-200 ease-quirq",
            collapsed ? "w-[56px]" : "w-[248px]",
          )}
        >
          {sidebar({ collapsed, mobile: false, close: () => {} })}
        </aside>
      ) : null}

      <div className="@container flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-1 overflow-hidden border-b border-hair-soft px-4 sm:gap-2">
          <button
            ref={toggleRef}
            type="button"
            onClick={toggle}
            aria-label={mobile ? "Open sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={mobile ? sheetShown : !collapsed}
            aria-controls={mobile && sheetShown ? sheetId : undefined}
            className="-ml-1 grid size-8 shrink-0 place-items-center rounded-[8px]! text-ink-dim transition-colors hover:bg-s3 hover:text-ink"
          >
            <PanelLeft aria-hidden="true" className="size-4" />
          </button>
          <span aria-hidden="true" className="mr-2 h-4 w-px shrink-0 bg-hair" />
          <div className="mr-2 flex min-w-0 flex-1 items-center sm:mr-4">{header}</div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      </div>

      {sheetShown ? (
        <div
          className="absolute inset-0 z-40"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              userOpened.current = true;
              closeSheet();
            } else if (e.key === "Tab") {
              /* modal sheet: Tab and Shift Tab wrap inside it */
              const stops = Array.from(
                sheetRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]):not([tabindex='-1']), a[href], input:not([disabled]), [tabindex='0']") ?? [],
              );
              if (stops.length === 0) return;
              const first = stops[0];
              const last = stops[stops.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          <button
            type="button"
            aria-label="Close sidebar"
            tabIndex={-1}
            onClick={() => {
              userOpened.current = true;
              closeSheet();
            }} className="absolute inset-0 rounded-none! bg-black/60 backdrop-blur-[1px]" />
          <div
            ref={sheetRef}
            id={sheetId}
            role="dialog"
            aria-modal="true"
            aria-label="App sidebar"
            className="rise absolute inset-y-0 left-0 flex w-[272px] max-w-[86%] flex-col border-r border-hair bg-[#0c0c0d] shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          >
            <button
              type="button"
              onClick={() => {
                userOpened.current = true;
                closeSheet();
              }}
              aria-label="Close sidebar"
              className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-[8px]! text-ink-dim hover:bg-s3 hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            {sidebar({ collapsed: false, mobile: true, close: closeSheet })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- split view */

const HANDLE_WIDTH = 17;

export type SpaceSplitViewProps = {
  info: ReactNode;
  app: ReactNode;
  /** Stopped spaces show only the info column, full width. */
  running: boolean;
  defaultAppWidth?: number;
  minInfoWidth?: number;
  minAppWidth?: number;
  className?: string;
};

/**
 * Info and app side by side with a draggable handle. Narrower than both minimums plus the
 * handle (617px by default) it shows one at a time behind Open apps / Exit apps.
 */
export function SpaceSplitView({
  info,
  app,
  running,
  defaultAppWidth = 370,
  minInfoWidth = 250,
  minAppWidth = 350,
  className,
}: SpaceSplitViewProps) {
  const [total, setTotal] = useState(0);
  const [appWidth, setAppWidth] = useState(defaultAppWidth);
  const [showApp, setShowApp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number } | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setTotal(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minSplit = minInfoWidth + minAppWidth + HANDLE_WIDTH;
  const narrow = total > 0 && total < minSplit;
  const maxApp = total > 0 ? Math.max(minAppWidth, total - minInfoWidth - HANDLE_WIDTH) : 760;
  const fit = (w: number) => Math.round(Math.min(Math.max(w, minAppWidth), maxApp));
  const shown = fit(appWidth);

  function onDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: shown };
    setDragging(true);
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    setAppWidth(fit(d.start - (e.clientX - d.x)));
  }
  function onUp() {
    drag.current = null;
    setDragging(false);
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 64 : 16;
    if (e.key === "ArrowLeft") setAppWidth(fit(shown + step));
    else if (e.key === "ArrowRight") setAppWidth(fit(shown - step));
    else if (e.key === "Home") setAppWidth(minAppWidth);
    else if (e.key === "End") setAppWidth(maxApp);
    else if (e.key === "Enter") setAppWidth(fit(defaultAppWidth));
    else return;
    e.preventDefault();
  }

  if (!running) {
    return (
      <div ref={rootRef} className={cn("scroll-thin min-h-0 flex-1 overflow-y-auto p-2", className)}>
        {info}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("flex min-h-0 flex-1 flex-col p-2", className)}>
      {narrow ? (
        <>
          <div className="flex shrink-0 justify-end pb-2">
            <Button variant="secondary" size="sm" aria-pressed={showApp} onClick={() => setShowApp((v) => !v)}>
              {showApp ? "Exit apps" : "Open apps"}
            </Button>
          </div>
          {showApp ? (
            <section aria-label="Apps" className="min-h-0 flex-1 overflow-hidden rounded-[32px]">
              {app}
            </section>
          ) : (
            <section aria-label="Space details" className="scroll-thin min-h-0 flex-1 overflow-y-auto">
              {info}
            </section>
          )}
        </>
      ) : (
        <div className={cn("flex min-h-0 flex-1", dragging && "cursor-col-resize select-none")}>
          <section aria-label="Space details" className="scroll-thin min-h-0 min-w-0 flex-1 overflow-y-auto" style={{ minWidth: minInfoWidth }}>
            {info}
          </section>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize the app panel"
            aria-valuemin={minAppWidth}
            aria-valuemax={maxApp}
            aria-valuenow={shown}
            tabIndex={0}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onDoubleClick={() => setAppWidth(fit(defaultAppWidth))}
            onKeyDown={onKey}
            className="group relative flex w-[17px] shrink-0 cursor-col-resize touch-none items-center justify-center px-2 outline-none"
          >
            <span className={cn("h-full w-px transition-colors", dragging ? "bg-ink/60" : "bg-hair group-hover:bg-hair-strong")} />
            <span
              aria-hidden="true"
              className="absolute grid h-6 w-3.5 place-items-center rounded-[4px] border border-hair bg-s2 text-ink-faint group-focus-visible:border-ink group-focus-visible:text-ink"
            >
              <GripVertical className="size-3" />
            </span>
          </div>
          <section aria-label="Apps" className="min-h-0 shrink-0 overflow-hidden rounded-[32px]" style={{ width: shown }}>
            {app}
          </section>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------- paywall */

/** Replaces the content for an unpaid account: a heading and the plans. */
export function PaywallGate({ title = "Subscribe to get full access", note, children }: { title?: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col items-center overflow-y-auto p-4 sm:p-6">
      <h2 className="mb-1 text-center text-[clamp(18px,2.4vw,26px)] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      {note ? <p className="mb-6 text-center text-[12.5px] text-ink-faint">{note}</p> : <div className="mb-6" />}
      {children}
    </div>
  );
}
