"use client";

// CardMenu: a small action menu for card corners and header controls (kebab, "Space apps",
// "Connections"). Button with aria-haspopup, a role=menu list, arrow keys and Home/End move
// focus, Escape and outside clicks close it and return focus to the trigger.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardMenuItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Right side hint such as a shortcut or a state word. */
  hint?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export type CardMenuProps = {
  /** Visible trigger content (icon or icon plus label). */
  trigger: ReactNode;
  /** Accessible name for the trigger, required when it shows only an icon. */
  "aria-label"?: string;
  items: CardMenuItem[];
  /** Which trigger edge the menu lines up with. */
  align?: "start" | "end";
  /** Optional heading inside the menu. */
  heading?: ReactNode;
  disabled?: boolean;
  /** Native tooltip, used to explain a disabled trigger. */
  title?: string;
  /** Classes for the trigger button. */
  triggerClassName?: string;
  className?: string;
};

/** Menu button with keyboard support. Items run onSelect and close the menu. */
export function CardMenu({
  trigger,
  "aria-label": ariaLabel,
  items,
  align = "end",
  heading,
  disabled,
  title,
  triggerClassName,
  className,
}: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  function focusItem(i: number | undefined) {
    if (i === undefined) return;
    itemRefs.current[i]?.focus();
  }

  function openMenu(focus: "first" | "last") {
    setOpen(true);
    // wait one frame so the menu exists before focusing into it
    requestAnimationFrame(() => focusItem(focus === "first" ? enabled[0] : enabled[enabled.length - 1]));
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openMenu("first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openMenu("last");
    }
  }

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const pos = enabled.indexOf(current);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(enabled[(pos + 1) % enabled.length]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(enabled[(pos - 1 + enabled.length) % enabled.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(enabled[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(enabled[enabled.length - 1]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrap} className={cn("relative inline-flex", className)}>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={() => (open ? close(false) : openMenu("first"))}
        onKeyDown={onTriggerKey}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45",
          triggerClassName ?? "size-8 rounded-[8px]! border-transparent text-ink-dim hover:bg-s3 hover:text-ink [&_svg]:size-4",
          open && "bg-s3 text-ink",
        )}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={typeof ariaLabel === "string" ? ariaLabel : undefined}
          onKeyDown={onMenuKey}
          className={cn(
            "absolute top-full z-40 mt-1.5 min-w-[184px] max-w-[min(260px,calc(100vw-32px))] rounded-[10px] border border-hair-strong bg-s2 p-1 shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {heading ? (
            <p className="px-2.5 pb-1 pt-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">{heading}</p>
          ) : null}
          {items.map((it, i) => (
            <button
              key={it.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={it.disabled}
              onClick={() => {
                it.onSelect?.();
                close();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[7px]! px-2.5 py-2 text-left text-[12.5px] outline-none transition-colors [&_svg]:size-3.5",
                "focus-visible:outline-none! focus:bg-s3 hover:bg-s3 disabled:cursor-not-allowed disabled:opacity-40",
                it.danger ? "text-[#ff7a70]" : "text-ink",
              )}
            >
              {it.icon ? <span aria-hidden="true" className="inline-flex text-ink-dim">{it.icon}</span> : null}
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.hint ? <span className="shrink-0 font-mono text-[10px] text-ink-faint">{it.hint}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
