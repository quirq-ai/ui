"use client";

// Menu primitives for the navigation shapes: DropdownMenu (a button that opens a role=menu
// panel; arrow keys, Home and End move, Escape closes and returns focus, Tab and outside
// clicks close), MenuItem, MenuGroup, MenuSeparator, and useDismiss for disclosure popovers
// that are not menus (nav dropdowns, pickers with a search field).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- useDismiss */

/**
 * Closes a popover on Escape (returning focus to the trigger) and on a pointer press outside
 * every element in `inside`. Subscribes only while open.
 */
export function useDismiss(
  open: boolean,
  onDismiss: (reason: "escape" | "outside") => void,
  inside: RefObject<HTMLElement | null>[],
) {
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  });
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (t && inside.some((r) => r.current?.contains(t))) return;
      latest.current("outside");
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target as Node | null;
      // Only react when focus is inside the popover or on its trigger, so two open demos never fight.
      if (t && !inside.some((r) => r.current?.contains(t)) && t !== document.body) return;
      latest.current("escape");
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // inside is a stable list of refs per caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

/** Moves focus through a list of elements with arrow keys, Home and End. Returns true when handled. */
export function moveFocus(e: KeyboardEvent, list: HTMLElement[], orientation: "vertical" | "horizontal" = "vertical"): boolean {
  if (list.length === 0) return false;
  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  const idx = list.indexOf(document.activeElement as HTMLElement);
  let next: HTMLElement | undefined;
  if (e.key === nextKey) next = list[idx < 0 ? 0 : (idx + 1) % list.length];
  else if (e.key === prevKey) next = list[idx < 0 ? list.length - 1 : (idx - 1 + list.length) % list.length];
  else if (e.key === "Home") next = list[0];
  else if (e.key === "End") next = list[list.length - 1];
  if (!next) return false;
  e.preventDefault();
  next.focus();
  return true;
}

/* ----------------------------------------------------------------------------- DropdownMenu */

type MenuCtx = { close: (restoreFocus?: boolean) => void };
const MenuContext = createContext<MenuCtx | null>(null);

export type MenuTriggerProps = {
  ref: RefObject<HTMLButtonElement | null>;
  id: string;
  type: "button";
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
};

export type DropdownMenuProps = {
  /** Render the trigger button and spread the given props onto it. */
  trigger: (props: MenuTriggerProps, state: { open: boolean }) => ReactNode;
  children: ReactNode;
  /** Names the menu for screen readers, such as "Space actions". */
  "aria-label": string;
  align?: "start" | "end";
  side?: "bottom" | "top" | "right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  menuClassName?: string;
  /** Menu width; clamped to the viewport. */
  width?: number | string;
  /** Stretch the wrapper to its container (full-width triggers). */
  block?: boolean;
};

const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';

const sideCls = {
  bottom: { base: "top-full mt-1.5", start: "left-0", end: "right-0" },
  top: { base: "bottom-full mb-1.5", start: "left-0", end: "right-0" },
  right: { base: "left-full ml-2", start: "top-0", end: "bottom-0" },
} as const;

/** Button-triggered action menu with full keyboard support. */
export function DropdownMenu({
  trigger,
  children,
  "aria-label": ariaLabel,
  align = "start",
  side = "bottom",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  menuClassName,
  width,
  block = false,
}: DropdownMenuProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const focusOnOpen = useRef<"first" | "last" | "menu" | null>(null);

  const setOpen = useCallback(
    (v: boolean) => {
      if (openProp === undefined) setInner(v);
      onOpenChange?.(v);
    },
    [openProp, onOpenChange],
  );

  const close = useCallback(
    (restore = true) => {
      setOpen(false);
      if (restore) triggerRef.current?.focus();
    },
    [setOpen],
  );

  useDismiss(open, (reason) => close(reason === "escape"), [wrapRef]);

  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    const target = focusOnOpen.current;
    focusOnOpen.current = null;
    const list = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []).filter(
      (el) => el.getAttribute("aria-disabled") !== "true",
    );
    if (target === "menu") menuRef.current?.focus();
    else (target === "first" ? list[0] : list[list.length - 1])?.focus();
  }, [open]);

  const triggerProps: MenuTriggerProps = {
    ref: triggerRef,
    id: `${id}-trigger`,
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? `${id}-menu` : undefined,
    onClick: () => {
      focusOnOpen.current = open ? null : "menu";
      setOpen(!open);
    },
    onKeyDown: (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        focusOnOpen.current = "first";
        setOpen(true);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusOnOpen.current = "last";
        setOpen(true);
      }
    },
  };

  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const list = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []).filter(
      (el) => el.getAttribute("aria-disabled") !== "true",
    );
    if (moveFocus(e, list)) return;
    if (e.key === "Tab") setOpen(false);
  }

  const pos = sideCls[side];

  return (
    <MenuContext.Provider value={{ close }}>
      <div ref={wrapRef} className={cn("relative", block ? "flex w-full" : "inline-flex", className)}>
        {trigger(triggerProps, { open })}
        {open ? (
          <div
            ref={menuRef}
            id={`${id}-menu`}
            role="menu"
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : `${id}-trigger`}
            onKeyDown={onMenuKeyDown}
            style={width !== undefined ? { width } : undefined}
            className={cn(
              "absolute z-40 min-w-[208px] max-w-[min(340px,calc(100vw-32px))] rounded-[12px] border border-hair-strong bg-[rgba(18,18,20,0.97)] p-1.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-md",
              "focus-visible:outline-none! rise",
              pos.base,
              pos[align],
              menuClassName,
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    </MenuContext.Provider>
  );
}

/* ----------------------------------------------------------------------------- items */

export type MenuItemProps = {
  children: ReactNode;
  icon?: ReactNode;
  /** Right side: a mono hint, shortcut or state word. */
  hint?: ReactNode;
  /** Second line under the label. */
  description?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  /** Keep the menu open after selecting (theme cycle, checkbox menus). */
  keepOpen?: boolean;
  /** radio: one of a set (scope pickers); checkbox: independent toggles. */
  kind?: "item" | "radio" | "checkbox";
  checked?: boolean;
  /** Render as a link. */
  href?: string;
  external?: boolean;
  className?: string;
};

const itemCls =
  "group/mi flex w-full min-w-0 cursor-pointer select-none items-center gap-2.5 rounded-[8px]! px-2.5 py-[7px] text-left text-[13px] leading-snug text-ink-dim outline-none " +
  "transition-colors duration-100 hover:bg-white/[0.07] hover:text-ink focus:bg-white/[0.07] focus:text-ink focus-visible:outline-offset-[-2px]! " +
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:hover:bg-transparent [&_svg]:size-4 [&_svg]:shrink-0";

/** One menu row. Selecting it runs onSelect and closes the menu unless keepOpen is set. */
export function MenuItem({
  children,
  icon,
  hint,
  description,
  onSelect,
  disabled = false,
  tone = "default",
  keepOpen = false,
  kind = "item",
  checked,
  href,
  external,
  className,
}: MenuItemProps) {
  const ctx = useContext(MenuContext);
  const role = kind === "radio" ? "menuitemradio" : kind === "checkbox" ? "menuitemcheckbox" : "menuitem";
  const select = () => {
    if (disabled) return;
    onSelect?.();
    if (!keepOpen) ctx?.close(true);
  };
  const body = (
    <>
      {kind !== "item" ? (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center text-ink">
          {checked ? <Check /> : null}
        </span>
      ) : null}
      {icon ? (
        <span aria-hidden="true" className={cn("inline-flex shrink-0", tone === "danger" ? "text-[#ff7a70]" : "text-ink-faint group-hover/mi:text-ink group-focus/mi:text-ink")}>
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate", tone === "danger" && "text-[#ff7a70]")}>{children}</span>
        {description ? <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-dim">{description}</span> : null}
      </span>
      {hint ? <span className="shrink-0 font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">{hint}</span> : null}
    </>
  );
  if (href && !disabled) {
    return (
      <a
        role={role}
        tabIndex={-1}
        href={href}
        onClick={() => ctx?.close(false)}
        className={cn(itemCls, className)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      >
        {body}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <button
      type="button"
      role={role}
      tabIndex={-1}
      aria-checked={kind === "item" ? undefined : Boolean(checked)}
      aria-disabled={disabled || undefined}
      onClick={select}
      className={cn(itemCls, tone === "danger" && "hover:bg-red/10 focus:bg-red/10", className)}
    >
      {body}
    </button>
  );
}

/** Labelled group of items. */
export function MenuGroup({ label, children }: { label?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={label ? id : undefined}>
      {label ? (
        <p id={id} className="px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="-mx-1.5 my-1.5 h-px bg-hair" />;
}

/** Non-interactive header block inside a menu (signed-in identity, notes). */
export function MenuHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-2.5 py-2", className)}>{children}</div>;
}
