"use client";

// Docking workspace: panes side by side, tmux style. The chat is a pinned column that is never
// closed or dropped into; views open from the one Views menu and dock to its right as
// tabsets. Tabs drag between tabsets (or onto a "Split right" zone), 6px splitters resize the
// columns by pointer or arrow keys, and the layout persists per browser, coming back as
// "Layout restored". On a phone the same panes take turns in one tabset behind a strip.
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { PanelsTopLeft, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Menu, type MenuEntry } from "./menu";

export type DockPane = { id: string; label: string; icon?: ReactNode; render: () => ReactNode };
export type DockTabset = { id: string; tabs: string[]; selected: string };
/** weights[0] is the chat column; weights[i + 1] belongs to tabsets[i]. */
export type DockLayout = { tabsets: DockTabset[]; weights: number[] };

export const EMPTY_LAYOUT: DockLayout = { tabsets: [], weights: [100] };

const CHAT_ID = "chat";
const MIN_COLUMN_PX = 180;

/* ----------------------------------------------------------------------------- layout ops */

/** Next free tabset id, unique within the layout (saved layouts keep their ids). */
function newTabsetId(layout: DockLayout) {
  const used = layout.tabsets.map((t) => Number(t.id.replace(/^ts-/, "")) || 0);
  return `ts-${Math.max(0, ...used) + 1}`;
}

function normalize(layout: DockLayout): DockLayout {
  const keep = layout.tabsets.map((t, i) => ({ t, w: layout.weights[i + 1] ?? 30 })).filter(({ t }) => t.tabs.length > 0);
  const tabsets = keep.map(({ t }) => ({ ...t, selected: t.tabs.includes(t.selected) ? t.selected : t.tabs[0] }));
  const weights = [layout.weights[0] ?? 40, ...keep.map(({ w }) => w)];
  if (tabsets.length === 0) return { tabsets: [], weights: [100] };
  return { tabsets, weights };
}

function removeTab(layout: DockLayout, paneId: string): DockLayout {
  return normalize({
    tabsets: layout.tabsets.map((t) => ({ ...t, tabs: t.tabs.filter((x) => x !== paneId) })),
    weights: layout.weights,
  });
}

/** First pane takes the space beside the chat, the second opens a column, later ones stack as tabs. */
export function dockPane(layout: DockLayout, paneId: string, maxTabsets = 3): DockLayout {
  if (layout.tabsets.some((t) => t.tabs.includes(paneId))) return layout;
  if (layout.tabsets.length === 0) {
    return { tabsets: [{ id: newTabsetId(layout), tabs: [paneId], selected: paneId }], weights: [30, 70] };
  }
  if (layout.tabsets.length < Math.min(2, maxTabsets)) {
    const last = layout.weights[layout.weights.length - 1];
    return {
      tabsets: [...layout.tabsets, { id: newTabsetId(layout), tabs: [paneId], selected: paneId }],
      weights: [...layout.weights.slice(0, -1), last / 2, last / 2],
    };
  }
  const tabsets = layout.tabsets.map((t, i) => (i === layout.tabsets.length - 1 ? { ...t, tabs: [...t.tabs, paneId], selected: paneId } : t));
  return { ...layout, tabsets };
}

function moveTab(layout: DockLayout, paneId: string, toTabsetId: string): DockLayout {
  const target = layout.tabsets.find((t) => t.id === toTabsetId);
  if (!target || target.tabs.includes(paneId)) {
    return { ...layout, tabsets: layout.tabsets.map((t) => (t.id === toTabsetId ? { ...t, selected: paneId } : t)) };
  }
  const moved = {
    ...layout,
    tabsets: layout.tabsets.map((t) =>
      t.id === toTabsetId ? { ...t, tabs: [...t.tabs, paneId], selected: paneId } : { ...t, tabs: t.tabs.filter((x) => x !== paneId) },
    ),
  };
  return normalize(moved);
}

function splitRight(layout: DockLayout, paneId: string, afterTabsetId: string, maxTabsets: number): DockLayout {
  const index = layout.tabsets.findIndex((t) => t.id === afterTabsetId);
  if (index < 0 || layout.tabsets.length >= maxTabsets) return moveTab(layout, paneId, afterTabsetId);
  const source = layout.tabsets.find((t) => t.tabs.includes(paneId));
  if (source && source.id === afterTabsetId && source.tabs.length === 1) return layout;
  const half = (layout.weights[index + 1] ?? 30) / 2;
  const tabsets = layout.tabsets.map((t) => ({ ...t, tabs: t.tabs.filter((x) => x !== paneId) }));
  tabsets.splice(index + 1, 0, { id: newTabsetId(layout), tabs: [paneId], selected: paneId });
  const weights = [...layout.weights];
  weights[index + 1] = half;
  weights.splice(index + 2, 0, half);
  return normalize({ tabsets, weights });
}

/* ----------------------------------------------------------------------------- saved layout */

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStorage(key: string | undefined): string | null {
  if (!key) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseLayout(raw: string | null, panes: DockPane[]): DockLayout | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as DockLayout;
    if (!Array.isArray(data.tabsets) || !Array.isArray(data.weights)) return null;
    const known = new Set(panes.map((p) => p.id));
    return normalize({
      tabsets: data.tabsets.map((t) => ({ id: String(t.id), tabs: t.tabs.filter((x) => known.has(x)), selected: String(t.selected) })),
      weights: data.weights.map(Number),
    });
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------------------- component */

export type DockingWorkspaceProps = {
  panes: DockPane[];
  /** The pinned chat column. */
  chat: ReactNode;
  chatLabel?: string;
  /** Left side of the toolbar: the space and its state. */
  toolbar?: ReactNode;
  /** split: columns and splitters; stack: one tabset with a strip (phone); auto: stack when narrow. */
  mode?: "auto" | "split" | "stack";
  /** Container width in px under which auto mode stacks. */
  stackBelow?: number;
  initialLayout?: DockLayout;
  /** Persist the layout in this browser under this key and offer it back as restored. */
  storageKey?: string;
  maxTabsets?: number;
  /** Catalog specimens: draw the drop indicators for a drag in progress. */
  previewDrag?: { paneId: string; tabsetId: string; zone: "strip" | "split" };
  /** Catalog specimens: show the restored badge without a saved layout. */
  showRestored?: boolean;
  className?: string;
};

/** Chat plus docked views with draggable tabs, 6px splitters, a Views menu and Reset layout. */
export function DockingWorkspace({
  panes,
  chat,
  chatLabel = "Chat",
  toolbar,
  mode: modeProp = "auto",
  stackBelow = 640,
  initialLayout = EMPTY_LAYOUT,
  storageKey,
  maxTabsets = 3,
  previewDrag,
  showRestored = false,
  className,
}: DockingWorkspaceProps) {
  const saved = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(storageKey),
    () => null,
  );
  const savedLayout = useMemo(() => parseLayout(saved, panes), [saved, panes]);
  const [edited, setEdited] = useState<DockLayout | null>(null);
  const [live, setLive] = useState<number[] | null>(null);
  const [dragTab, setDragTab] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<{ tabsetId: string; zone: "strip" | "split" } | null>(null);
  const [stackSel, setStackSel] = useState<string>(CHAT_ID);
  const rowRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (modeProp !== "auto") return;
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < stackBelow));
    ro.observe(el);
    return () => ro.disconnect();
  }, [modeProp, stackBelow]);

  const mode = modeProp === "stack" || (modeProp === "auto" && narrow) ? "stack" : "split";
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const splitDrag = useRef<{ index: number; x: number; width: number; start: number[] } | null>(null);

  const layout = edited ?? savedLayout ?? initialLayout;
  const selectedKey = layout.tabsets.map((t) => t.selected).join(" ");

  /* keep each selected tab visible inside its strip (scrolls the strip only, never the page) */
  useEffect(() => {
    for (const id of selectedKey.split(" ")) {
      const tab = tabRefs.current[id]?.parentElement;
      const strip = tab?.parentElement;
      if (!tab || !strip) continue;
      const left = tab.offsetLeft - strip.offsetLeft;
      if (left < strip.scrollLeft) strip.scrollLeft = left;
      else if (left + tab.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = left + tab.offsetWidth - strip.clientWidth;
    }
  }, [selectedKey]);
  const restored = showRestored || (edited === null && savedLayout !== null);
  const weights = live ?? layout.weights;
  const paneById = useMemo(() => Object.fromEntries(panes.map((p) => [p.id, p])), [panes]);
  const openIds = layout.tabsets.flatMap((t) => t.tabs);
  const effectiveDrag = dragTab ? { paneId: dragTab, ...(dropAt ?? { tabsetId: "", zone: "strip" as const }) } : previewDrag ?? null;

  function commit(next: DockLayout) {
    setEdited(next);
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* private mode or quota: the layout just will not survive a reload */
    }
  }

  function togglePane(id: string) {
    if (openIds.includes(id)) {
      commit(removeTab(layout, id));
      if (stackSel === id) setStackSel(CHAT_ID);
    } else {
      commit(dockPane(layout, id, maxTabsets));
      setStackSel(id);
    }
  }

  function reset() {
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* nothing to clean up */
      }
    }
    setEdited(initialLayout);
    setStackSel(CHAT_ID);
  }

  /* -------- splitters */

  function onSplitDown(e: PointerEvent<HTMLDivElement>, index: number) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    splitDrag.current = { index, x: e.clientX, width: rowRef.current?.getBoundingClientRect().width ?? 1, start: [...weights] };
    setLive([...weights]);
  }
  function resize(start: number[], index: number, deltaWeight: number, width: number) {
    const total = start.reduce((a, b) => a + b, 0);
    const min = (MIN_COLUMN_PX / Math.max(width, 1)) * total;
    const a = start[index] + deltaWeight;
    const b = start[index + 1] - deltaWeight;
    if (a < min || b < min) return start;
    const next = [...start];
    next[index] = a;
    next[index + 1] = b;
    return next;
  }
  function onSplitMove(e: PointerEvent<HTMLDivElement>) {
    const d = splitDrag.current;
    if (!d) return;
    const total = d.start.reduce((a, b) => a + b, 0);
    setLive(resize(d.start, d.index, ((e.clientX - d.x) / d.width) * total, d.width));
  }
  function onSplitUp() {
    if (!splitDrag.current) return;
    splitDrag.current = null;
    if (live) commit({ ...layout, weights: live });
    setLive(null);
  }
  function onSplitKey(e: KeyboardEvent<HTMLDivElement>, index: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const total = weights.reduce((a, b) => a + b, 0);
    const step = (e.shiftKey ? 0.08 : 0.02) * total;
    const width = rowRef.current?.getBoundingClientRect().width ?? 1000;
    commit({ ...layout, weights: resize(weights, index, e.key === "ArrowLeft" ? -step : step, width) });
  }

  /* -------- tabs */

  function select(tabsetId: string, paneId: string) {
    commit({ ...layout, tabsets: layout.tabsets.map((t) => (t.id === tabsetId ? { ...t, selected: paneId } : t)) });
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, ts: DockTabset, paneId: string) {
    const i = ts.tabs.indexOf(paneId);
    const tsIndex = layout.tabsets.findIndex((t) => t.id === ts.id);
    if (e.altKey && e.shiftKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      const right = e.key === "ArrowRight";
      const neighbour = layout.tabsets[tsIndex + (right ? 1 : -1)];
      if (neighbour) commit(moveTab(layout, paneId, neighbour.id));
      else if (right) commit(splitRight(layout, paneId, ts.id, maxTabsets));
      requestAnimationFrame(() => tabRefs.current[paneId]?.focus());
      return;
    }
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % ts.tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + ts.tabs.length) % ts.tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ts.tabs.length - 1;
    else if (e.key === "Delete") {
      e.preventDefault();
      commit(removeTab(layout, paneId));
      return;
    }
    if (next < 0) return;
    e.preventDefault();
    select(ts.id, ts.tabs[next]);
    tabRefs.current[ts.tabs[next]]?.focus();
  }

  function dragStart(e: DragEvent<HTMLButtonElement>, paneId: string) {
    e.dataTransfer.setData("text/plain", paneId);
    e.dataTransfer.effectAllowed = "move";
    setDragTab(paneId);
  }
  function dragEnd() {
    setDragTab(null);
    setDropAt(null);
  }
  function over(e: DragEvent<HTMLElement>, tabsetId: string, zone: "strip" | "split") {
    if (!dragTab) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropAt?.tabsetId !== tabsetId || dropAt.zone !== zone) setDropAt({ tabsetId, zone });
  }
  function drop(e: DragEvent<HTMLElement>, tabsetId: string, zone: "strip" | "split") {
    e.preventDefault();
    const paneId = e.dataTransfer.getData("text/plain") || dragTab;
    if (paneId) commit(zone === "split" ? splitRight(layout, paneId, tabsetId, maxTabsets) : moveTab(layout, paneId, tabsetId));
    dragEnd();
  }

  /* -------- render */

  const viewsMenu = (
    <Menu
      label="Views"
      align="end"
      triggerAriaLabel="Views"
      triggerClassName="inline-flex h-8 items-center gap-2 rounded-[8px]! px-2 text-[12.5px] text-ink-dim transition-colors hover:bg-s3 hover:text-ink aria-expanded:bg-s3 aria-expanded:text-ink [&_svg]:size-4"
      menuClassName="w-[232px]"
      trigger={
        <>
          <PanelsTopLeft aria-hidden="true" />
          <span className="hidden @md:inline">Views</span>
        </>
      }
      entries={[
        { kind: "label", id: "label", label: "Views" },
        ...panes.map(
          (p): MenuEntry => ({ id: p.id, label: p.label, icon: p.icon, checked: openIds.includes(p.id), onSelect: () => togglePane(p.id) }),
        ),
        { kind: "separator", id: "sep" },
        { id: "reset", label: "Reset layout", icon: <RotateCcw />, onSelect: reset },
      ]}
    />
  );

  const status = (
    <p className="hidden items-center gap-2 text-[11.5px] text-ink-faint @xl:flex" aria-live="polite">
      {effectiveDrag ? (
        <span className="text-blu">Moving {paneById[effectiveDrag.paneId]?.label}</span>
      ) : restored ? (
        <span className="rounded-[5px] border border-hair px-1.5 py-0.5 text-ink-dim">Layout restored</span>
      ) : null}
      <span className="tabular-nums">
        {openIds.length} {openIds.length === 1 ? "view" : "views"} on
      </span>
    </p>
  );

  const tabPill = (on: boolean) =>
    cn(
      "inline-flex h-7 max-w-[180px] shrink-0 items-center gap-1.5 rounded-[7px]! pl-2.5 text-[12px] transition-colors",
      on ? "bg-s3 font-semibold text-ink shadow-[inset_0_0_0_1px_var(--hair)]" : "text-ink-dim hover:bg-white/[0.04] hover:text-ink",
    );

  if (mode === "stack") {
    const stackTabs = [CHAT_ID, ...openIds];
    const current = stackTabs.includes(stackSel) ? stackSel : CHAT_ID;
    return (
      <div ref={rootRef} className={cn("@container flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair bg-[#060607]", className)}>
        <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-2">
          <div className="min-w-0 flex-1">{toolbar}</div>
          {viewsMenu}
        </div>
        <div className="mx-1.5 mb-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-hair bg-[#0e0e10]">
          <div role="tablist" aria-label="Views" className="flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b border-hair-soft px-1.5 [scrollbar-width:none]">
            {stackTabs.map((id) => {
              const on = id === current;
              const label = id === CHAT_ID ? chatLabel : paneById[id]?.label ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setStackSel(id)}
                  onKeyDown={(e) => {
                    const i = stackTabs.indexOf(id);
                    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
                    if (n === null) return;
                    e.preventDefault();
                    const target = stackTabs[(n + stackTabs.length) % stackTabs.length];
                    setStackSel(target);
                    tabRefs.current[`stack-${target}`]?.focus();
                  }}
                  ref={(el) => {
                    tabRefs.current[`stack-${id}`] = el;
                  }}
                  className={cn(tabPill(on), "pr-2.5 focus-visible:outline-offset-[-2px]!")}
                >
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
          <div role="tabpanel" aria-label={current === CHAT_ID ? chatLabel : paneById[current]?.label} className="min-h-0 flex-1 overflow-hidden">
            {current === CHAT_ID ? chat : paneById[current]?.render()}
          </div>
        </div>
      </div>
    );
  }

  const hasPanes = layout.tabsets.length > 0;

  return (
    <div ref={rootRef} className={cn("@container flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair bg-[#060607]", className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-1.5">
        <div className="min-w-0 flex-1">{toolbar}</div>
        {status}
        {viewsMenu}
      </div>
      <div ref={rowRef} className={cn("flex min-h-0 flex-1 px-1.5 pb-1.5", live && "cursor-col-resize select-none")}>
        <section
          aria-label={chatLabel}
          className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden", hasPanes ? "rounded-[10px] border border-hair bg-[#0e0e10]" : "")}
          style={{ flexGrow: weights[0], flexBasis: 0 }}
        >
          <div className={cn("flex h-full min-h-0 w-full flex-col", !hasPanes && "mx-auto max-w-3xl rounded-[10px] border border-hair bg-[#0e0e10]")}>
            {chat}
          </div>
        </section>
        {layout.tabsets.map((ts, i) => {
          const showStrip = effectiveDrag?.tabsetId === ts.id && effectiveDrag.zone === "strip";
          const showSplit = effectiveDrag?.tabsetId === ts.id && effectiveDrag.zone === "split";
          const selected = paneById[ts.selected];
          return (
            <div key={ts.id} className="flex min-h-0 min-w-0" style={{ flexGrow: weights[i + 1] ?? 30, flexBasis: 0 }}>
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${i === 0 ? chatLabel : paneById[layout.tabsets[i - 1].selected]?.label ?? "column"} and ${selected?.label ?? "column"}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((weights[i] / weights.reduce((a, b) => a + b, 0)) * 100)}
                tabIndex={0}
                onPointerDown={(e) => onSplitDown(e, i)}
                onPointerMove={onSplitMove}
                onPointerUp={onSplitUp}
                onPointerCancel={onSplitUp}
                onKeyDown={(e) => onSplitKey(e, i)}
                className="group flex w-1.5 shrink-0 cursor-col-resize touch-none justify-center outline-none"
              >
                <span className="my-6 w-[2px] rounded-full bg-transparent transition-colors group-hover:bg-hair-strong group-focus-visible:bg-ink group-active:bg-ink/60" />
              </div>
              <section
                aria-label={`${selected?.label ?? "Views"} tabset`}
                className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-hair bg-[#0e0e10]"
              >
                <div
                  onDragOver={(e) => over(e, ts.id, "strip")}
                  onDrop={(e) => drop(e, ts.id, "strip")}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-1 border-b border-hair-soft px-1.5 transition-colors",
                    showStrip && "bg-blu/[0.14] shadow-[inset_0_0_0_1px_rgba(46,155,255,0.45)]",
                  )}
                >
                  <div role="tablist" aria-label={`Tabs in column ${i + 1}`} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
                    {ts.tabs.map((id) => {
                      const pane = paneById[id];
                      const on = id === ts.selected;
                      return (
                        <span key={id} className={cn(tabPill(on), "group/tab", effectiveDrag?.paneId === id && "opacity-50")}>
                          <button
                            ref={(el) => {
                              tabRefs.current[id] = el;
                            }}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            tabIndex={on ? 0 : -1}
                            draggable
                            onDragStart={(e) => dragStart(e, id)}
                            onDragEnd={dragEnd}
                            onClick={() => select(ts.id, id)}
                            onKeyDown={(e) => onTabKey(e, ts, id)}
                            aria-keyshortcuts="Alt+Shift+ArrowRight Alt+Shift+ArrowLeft Delete"
                            className="flex min-w-0 cursor-grab items-center gap-1.5 rounded-[5px]! focus-visible:outline-offset-[-2px]! active:cursor-grabbing [&_svg]:size-3.5 [&_svg]:shrink-0"
                          >
                            {pane?.icon ? <span aria-hidden="true" className="inline-flex text-ink-faint">{pane.icon}</span> : null}
                            <span className="truncate">{pane?.label ?? id}</span>
                          </button>
                          <button
                            type="button"
                            tabIndex={-1}
                            aria-label={`Close ${pane?.label ?? id}`}
                            onClick={() => commit(removeTab(layout, id))}
                            className={cn(
                              "mr-1 grid size-5 shrink-0 place-items-center rounded-[5px]! text-ink-faint transition-opacity hover:bg-white/[0.08] hover:text-ink",
                              on ? "opacity-100" : "opacity-0 group-hover/tab:opacity-100 group-focus-within/tab:opacity-100",
                            )}
                          >
                            <X aria-hidden="true" className="size-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    aria-label={`Close column ${i + 1}`}
                    title="Close this tabset"
                    onClick={() => commit(normalize({ ...layout, tabsets: layout.tabsets.map((t) => (t.id === ts.id ? { ...t, tabs: [] } : t)) }))}
                    className="grid size-6 shrink-0 place-items-center rounded-[6px]! text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </div>
                <div role="tabpanel" aria-label={selected?.label} className="relative min-h-0 flex-1 overflow-hidden">
                  {selected?.render()}
                  {effectiveDrag && (dragTab || previewDrag) && layout.tabsets.length < maxTabsets ? (
                    <div
                      onDragOver={(e) => over(e, ts.id, "split")}
                      onDragLeave={() => setDropAt(null)}
                      onDrop={(e) => drop(e, ts.id, "split")}
                      className={cn(
                        "absolute inset-y-2 right-2 grid w-[38%] min-w-[90px] place-items-center rounded-[8px] border border-dashed font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                        showSplit ? "border-blu/60 bg-[#0a192b] text-blu" : "border-hair-strong bg-[#0b0b0d] text-ink-faint",
                      )}
                    >
                      Split right
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
