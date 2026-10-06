"use client";

// Menu: a small accessible dropdown used by the frames (Views menu, theme toggle, server
// popover triggers). The trigger is a button with aria-haspopup and aria-expanded; the list is
// role="menu". Arrow keys move, Home and End jump, Escape closes and returns focus, Tab and a
// click outside close it.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type MenuEntry =
  | {
      kind?: "item";
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      /** Right side text, such as a shortcut or a count. */
      hint?: ReactNode;
      /** Renders a menuitemcheckbox with a check mark. */
      checked?: boolean;
      disabled?: boolean;
      danger?: boolean;
      onSelect: () => void;
    }
  | { kind: "separator"; id: string }
  | { kind: "label"; id: string; label: ReactNode };

export type MenuProps = {
  entries: MenuEntry[];
  /** Accessible name of the list ("Views", "Theme"). */
  label: string;
  /** Visible trigger content (icon and or text). */
  trigger: ReactNode;
  /** Accessible name for an icon-only trigger. */
  triggerAriaLabel?: string;
  triggerClassName?: string;
  align?: "start" | "end";
  placement?: "bottom" | "top";
  menuClassName?: string;
  disabled?: boolean;
  /** Light surfaces (the auth screen in light theme). */
  light?: boolean;
};

function isAction(e: MenuEntry): e is Extract<MenuEntry, { onSelect: () => void }> {
  return (e.kind === undefined || e.kind === "item") && !("disabled" in e && e.disabled);
}

/** Button that opens a short list of actions. */
export function Menu({
  entries,
  label,
  trigger,
  triggerAriaLabel,
  triggerClassName,
  align = "end",
  placement = "bottom",
  menuClassName,
  disabled,
  light = false,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuId = useId();
  const actionable = entries.filter(isAction).map((e) => e.id);

  useEffect(() => {
    if (!open) return;
    const onDown = (ev: PointerEvent) => {
      if (!rootRef.current?.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const focusId = (id: string | undefined) => {
    if (id) itemRefs.current[id]?.focus();
  };

  function openMenu(which: "first" | "last") {
    setOpen(true);
    requestAnimationFrame(() => focusId(which === "first" ? actionable[0] : actionable[actionable.length - 1]));
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu("first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openMenu("last");
    }
  }

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    const current = actionable.indexOf((document.activeElement as HTMLElement | null)?.dataset.menuId ?? "");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusId(actionable[(current + 1) % actionable.length]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusId(actionable[(current - 1 + actionable.length) % actionable.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusId(actionable[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      focusId(actionable[actionable.length - 1]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerAriaLabel}
        disabled={disabled}
        onClick={() => (open ? close(false) : openMenu("first"))}
        onKeyDown={onTriggerKey}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            "absolute z-50 min-w-[208px] rounded-[10px] border p-1 shadow-[0_18px_44px_rgba(0,0,0,0.55)]",
            light ? "border-black/10 bg-white text-[#141414]" : "border-hair-strong bg-s2 text-ink",
            placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {entries.map((entry) => {
            if (entry.kind === "separator") {
              return <div key={entry.id} role="separator" className={cn("my-1 h-px", light ? "bg-black/10" : "bg-hair")} />;
            }
            if (entry.kind === "label") {
              return (
                <div
                  key={entry.id}
                  role="presentation"
                  className={cn(
                    "px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                    light ? "text-black/45" : "text-ink-faint",
                  )}
                >
                  {entry.label}
                </div>
              );
            }
            const checkable = entry.checked !== undefined;
            return (
              <button
                key={entry.id}
                ref={(el) => {
                  itemRefs.current[entry.id] = el;
                }}
                type="button"
                role={checkable ? "menuitemcheckbox" : "menuitem"}
                aria-checked={checkable ? entry.checked : undefined}
                data-menu-id={entry.id}
                tabIndex={-1}
                disabled={entry.disabled}
                onClick={() => {
                  entry.onSelect();
                  close(true);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[7px]! px-2.5 py-1.5 text-left text-[12.5px] outline-none disabled:opacity-40",
                  "[&_svg]:size-4 [&_svg]:shrink-0",
                  light ? "hover:bg-black/[0.05] focus-visible:bg-black/[0.06]" : "hover:bg-s3 focus-visible:bg-s3",
                  entry.danger ? "text-[#ff7a70]" : light ? "text-[#141414]" : "text-ink",
                )}
              >
                {entry.icon ? (
                  <span aria-hidden="true" className={cn("inline-flex", light ? "text-black/55" : "text-ink-dim")}>
                    {entry.icon}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                {entry.hint ? <span className={cn("text-[11px]", light ? "text-black/45" : "text-ink-faint")}>{entry.hint}</span> : null}
                {checkable ? (
                  <Check aria-hidden="true" className={cn(entry.checked ? "opacity-100" : "opacity-0")} />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
