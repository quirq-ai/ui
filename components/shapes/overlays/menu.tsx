"use client";

// Dropdown and context menus. Menu is a trigger button plus a role=menu list: Enter, Space,
// ArrowDown or ArrowUp opens it, arrows move, Home and End jump, a letter jumps to the next
// item that starts with it, Escape closes and returns focus to the trigger, Tab or an outside
// click closes. Checkbox items stay open on select. ContextMenu opens the same list at the
// pointer on right-click (or a plain click when openOnClick is set), or at a focused row on
// Shift+F10 or the Menu key.
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button";
import { KeyCombo } from "@/components/ui/kbd";
import { useOutsidePointer } from "./overlay-core";

export type MenuEntry =
  | {
      kind: "item";
      id: string;
      label: ReactNode;
      /** Text for type-ahead when the label is not a plain string. */
      textValue?: string;
      icon?: ReactNode;
      /** Quiet text on the right, such as a path or an id. */
      hint?: ReactNode;
      shortcut?: string[];
      destructive?: boolean;
      disabled?: boolean;
    }
  | { kind: "checkbox"; id: string; label: ReactNode; textValue?: string; icon?: ReactNode; checked: boolean; disabled?: boolean }
  | { kind: "separator"; id: string }
  | { kind: "label"; id: string; label: ReactNode };

type Actionable = Extract<MenuEntry, { kind: "item" | "checkbox" }>;

const isActionable = (e: MenuEntry): e is Actionable => e.kind === "item" || e.kind === "checkbox";
const textOf = (e: Actionable) => (e.textValue ?? (typeof e.label === "string" ? e.label : "")).toLowerCase();

/* ----------------------------------------------------------------------------- keyboard */

function useMenuKeys(items: MenuEntry[], initialActive: number, onEscape: () => void, onTab: () => void) {
  const [active, setActive] = useState(initialActive);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const nav = items.map((e, i) => (isActionable(e) && !e.disabled ? i : -1)).filter((i) => i >= 0);

  const move = (to: number | undefined) => {
    if (to === undefined) return;
    setActive(to);
    refs.current[to]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const pos = nav.indexOf(active);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(nav[pos < 0 ? 0 : (pos + 1) % nav.length]);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(nav[pos <= 0 ? nav.length - 1 : pos - 1]);
        break;
      case "Home":
        e.preventDefault();
        move(nav[0]);
        break;
      case "End":
        e.preventDefault();
        move(nav[nav.length - 1]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        break;
      case "Tab":
        onTab();
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const key = e.key.toLowerCase();
          const order = [...nav.slice(pos + 1), ...nav.slice(0, pos + 1)];
          const hit = order.find((i) => textOf(items[i] as Actionable).startsWith(key));
          if (hit !== undefined) {
            e.preventDefault();
            move(hit);
          }
        }
    }
  };

  const register = (i: number, el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  };
  const focusAt = (i: number | undefined) => {
    if (i !== undefined) refs.current[i]?.focus();
  };

  return { active, setActive, onKeyDown, register, focusAt, first: nav[0], last: nav[nav.length - 1] };
}

/* ----------------------------------------------------------------------------- surface */

export type MenuSurfaceProps = {
  id?: string;
  label: string;
  items: MenuEntry[];
  active: number;
  onActiveChange: (index: number) => void;
  onActivate: (entry: Actionable) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  register?: (index: number, el: HTMLButtonElement | null) => void;
  width?: number;
  style?: CSSProperties;
  className?: string;
};

/** The menu list itself: label rows, icon items, checks, hints, separators, destructive items. */
export function MenuSurface({ id, label, items, active, onActiveChange, onActivate, onKeyDown, register, width = 224, style, className }: MenuSurfaceProps) {
  return (
    <div
      id={id}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
      style={{ width, ...style }}
      className={cn(
        "z-40 max-w-[calc(100vw-32px)] rounded-[10px] border border-hair-strong bg-s2 p-[5px] text-ink shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "transition-[opacity,transform] duration-150 starting:-translate-y-1 starting:opacity-0",
        className,
      )}
    >
      {items.map((it, i) => {
        if (it.kind === "separator") return <div key={it.id} role="separator" className="my-1 h-px bg-hair-soft" />;
        if (it.kind === "label") {
          return (
            <div key={it.id} role="presentation" className="truncate px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {it.label}
            </div>
          );
        }
        const isActive = i === active;
        const destructive = it.kind === "item" && it.destructive;
        return (
          <button
            key={it.id}
            type="button"
            role={it.kind === "checkbox" ? "menuitemcheckbox" : "menuitem"}
            aria-checked={it.kind === "checkbox" ? it.checked : undefined}
            aria-disabled={it.disabled || undefined}
            tabIndex={isActive ? 0 : -1}
            ref={register ? (el) => register(i, el) : undefined}
            data-active={isActive || undefined}
            onPointerMove={() => {
              if (!it.disabled && !isActive) onActiveChange(i);
            }}
            onFocus={() => onActiveChange(i)}
            onClick={() => {
              if (!it.disabled) onActivate(it);
            }}
            className={cn(
              "flex w-full min-w-0 items-center gap-2.5 rounded-[7px]! px-2.5 py-[7px] text-left text-[12.5px] font-medium transition-colors [&_svg]:size-[15px]",
              it.disabled
                ? "cursor-not-allowed text-ink-faint/70"
                : destructive
                  ? isActive
                    ? "bg-red/12 text-[#ff8a80]"
                    : "text-[#ff8a80]"
                  : isActive
                    ? "bg-white/[0.08] text-ink"
                    : "text-ink-dim",
            )}
          >
            {it.kind === "checkbox" ? (
              <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center text-ink">
                {it.checked ? <Check strokeWidth={2.5} /> : null}
              </span>
            ) : null}
            {it.icon ? (
              <span aria-hidden="true" className={cn("inline-flex shrink-0", destructive ? "text-[#ff8a80]" : "text-ink-faint")}>
                {it.icon}
              </span>
            ) : null}
            {it.kind === "item" && it.hint ? (
              <>
                <span className="shrink-0 whitespace-nowrap">{it.label}</span>
                {/* rtl box keeps the end of a long path visible; bdi keeps the path itself left to right */}
                <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] font-normal text-ink-faint" dir="rtl">
                  <bdi dir="ltr">{it.hint}</bdi>
                </span>
              </>
            ) : (
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
            )}
            {it.kind === "item" && it.shortcut ? <KeyCombo keys={it.shortcut} size="xs" subtle /> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Menu */

export type MenuProps = {
  /** Accessible name of the menu ("Space actions"). */
  label: string;
  items: MenuEntry[];
  onSelect?: (id: string) => void;
  onCheckedChange?: (id: string, checked: boolean) => void;
  /** Trigger content: a label, or an icon with triggerLabel. */
  trigger: ReactNode;
  /** aria-label for an icon-only trigger. */
  triggerLabel?: string;
  /** Classes for the trigger button; defaults to a small secondary app button. */
  triggerClassName?: string;
  align?: "start" | "end";
  width?: number;
  /** Start open (catalog previews). Focus is not moved on first paint. */
  defaultOpen?: boolean;
  /** Item highlighted when it starts open, to show the hover state. */
  defaultActiveId?: string;
  className?: string;
};

/** Dropdown menu: trigger plus list, full keyboard support. */
export function Menu({
  label,
  items,
  onSelect,
  onCheckedChange,
  trigger,
  triggerLabel,
  triggerClassName,
  align = "start",
  width = 224,
  defaultOpen = false,
  defaultActiveId,
  className,
}: MenuProps) {
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"first" | "last" | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const keys = useMenuKeys(
    items,
    defaultActiveId ? items.findIndex((e) => e.id === defaultActiveId) : -1,
    () => close(true),
    () => close(false),
  );
  useOutsidePointer(wrapRef, open, () => setOpen(false));

  const { focusAt, first, last, setActive } = keys;
  useEffect(() => {
    if (!open || !pendingFocus.current) return;
    focusAt(pendingFocus.current === "first" ? first : last);
    pendingFocus.current = null;
  }, [open, focusAt, first, last]);

  const openWith = (where: "first" | "last") => {
    setActive(where === "first" ? (first ?? -1) : (last ?? -1));
    if (open) {
      focusAt(where === "first" ? first : last);
      return;
    }
    pendingFocus.current = where;
    setOpen(true);
  };

  return (
    <div ref={wrapRef} className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        onClick={() => (open ? close(false) : openWith("first"))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openWith("first");
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openWith("last");
          } else if (e.key === "Escape" && open) {
            e.preventDefault();
            e.stopPropagation();
            close(false);
          }
        }}
        className={triggerClassName ?? buttonClasses({ variant: "secondary", size: "sm" })}
      >
        {trigger}
      </button>
      {open ? (
        <MenuSurface
          id={menuId}
          label={label}
          items={items}
          width={width}
          active={keys.active}
          onActiveChange={keys.setActive}
          onKeyDown={keys.onKeyDown}
          register={keys.register}
          onActivate={(entry) => {
            if (entry.kind === "checkbox") {
              onCheckedChange?.(entry.id, !entry.checked);
              return;
            }
            close(true);
            onSelect?.(entry.id);
          }}
          className={cn("absolute top-full mt-1.5", align === "end" ? "right-0" : "left-0")}
        />
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- ContextMenu */

export type ContextMenuProps = {
  label: string;
  /** Items for the row that was right-clicked (rows carry data-context-id). */
  getItems: (targetId: string) => MenuEntry[];
  onSelect?: (id: string, targetId: string) => void;
  children: ReactNode;
  width?: number;
  /** Start open on this row at this offset (catalog previews). */
  defaultTarget?: { id: string; x: number; y: number; activeId?: string };
  /** Also open on a plain click or Enter on a row, for rows with no other action. */
  openOnClick?: boolean;
  className?: string;
};

/** Right-click (or Shift+F10, or the Menu key) on a row inside to open its menu at that spot. */
export function ContextMenu({ label, getItems, onSelect, children, width = 280, defaultTarget, openOnClick = false, className }: ContextMenuProps) {
  const menuId = useId();
  const regionRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef(false);
  const [target, setTarget] = useState<{ id: string; x: number; y: number } | null>(defaultTarget ?? null);
  const items = target ? getItems(target.id) : [];
  const close = (refocus: boolean) => {
    setTarget(null);
    if (refocus) opener.current?.focus();
  };
  const keys = useMenuKeys(
    items,
    defaultTarget?.activeId ? items.findIndex((e) => e.id === defaultTarget.activeId) : -1,
    () => close(true),
    () => close(false),
  );
  useOutsidePointer(regionRef, target !== null, () => setTarget(null));

  const { focusAt, first, setActive } = keys;
  useEffect(() => {
    if (!target || !pendingFocus.current) return;
    pendingFocus.current = false;
    focusAt(first);
  }, [target, focusAt, first]);

  const openAt = (row: HTMLElement, clientX: number | null, clientY: number | null) => {
    const region = regionRef.current;
    if (!region) return;
    const box = region.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    const rawX = clientX === null ? rowBox.left - box.left + 16 : clientX - box.left;
    const rawY = clientY === null ? rowBox.bottom - box.top + 4 : clientY - box.top;
    const x = Math.max(4, Math.min(rawX, box.width - Math.min(width, box.width - 8) - 4));
    opener.current = row;
    pendingFocus.current = true;
    setActive(-1);
    setTarget({ id: row.dataset.contextId ?? "", x, y: rawY });
  };

  const rowFrom = (el: EventTarget | null) => (el instanceof HTMLElement ? el.closest<HTMLElement>("[data-context-id]") : null);

  return (
    <div
      ref={regionRef}
      className={cn("relative", className)}
      onContextMenu={(e) => {
        const row = rowFrom(e.target);
        if (!row) return;
        e.preventDefault();
        openAt(row, e.clientX, e.clientY);
      }}
      onClick={(e) => {
        const row = openOnClick ? rowFrom(e.target) : null;
        if (!row) return;
        // detail 0: Enter or Space on the row, so anchor the menu to the row, not the pointer
        if (e.detail === 0) openAt(row, null, null);
        else openAt(row, e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if ((e.key === "F10" && e.shiftKey) || e.key === "ContextMenu") {
          const row = rowFrom(e.target);
          if (!row) return;
          e.preventDefault();
          openAt(row, null, null);
        }
      }}
    >
      {children}
      {target ? (
        <MenuSurface
          id={menuId}
          label={label}
          items={items}
          width={width}
          active={keys.active}
          onActiveChange={keys.setActive}
          onKeyDown={keys.onKeyDown}
          register={keys.register}
          onActivate={(entry) => {
            const id = target.id;
            close(true);
            onSelect?.(entry.id, id);
          }}
          className="absolute"
          style={{
            left: `max(4px, min(${target.x}px, calc(100% - ${width}px - 4px)))`,
            top: target.y,
            width: `min(${width}px, calc(100% - 8px))`,
          }}
        />
      ) : null}
    </div>
  );
}
