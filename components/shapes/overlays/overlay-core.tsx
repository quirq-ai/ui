"use client";

// Overlay core for the overlays category. Overlay is a portalled layer with a dim backdrop:
// it moves focus in, keeps Tab inside, closes on Escape (handled on the layer itself, so a
// nested layer stops the event before its parent sees it) and gives focus back to whatever
// opened it. When the focused control vanishes or turns disabled mid-task, focus is put
// back inside. The hooks below are shared by menus, popovers, hover cards and sheets.
import {
  useEffect,
  useEffectEvent,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

/** Visible, enabled, tabbable elements inside root, in DOM order. */
export function focusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && !el.closest("[inert]") && !el.closest("[hidden]"),
  );
}

/**
 * While active, move focus into ref (an element marked data-autofocus, the initialFocus
 * selector, the first focusable, or the container itself). When it deactivates, focus goes
 * back to the element that had it before.
 */
export function useFocusReturn(ref: RefObject<HTMLElement | null>, active: boolean, initialFocus?: string) {
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = ref.current;
    if (root) {
      const preferred = initialFocus ? root.querySelector<HTMLElement>(initialFocus) : null;
      const marked = root.querySelector<HTMLElement>("[data-autofocus]");
      (preferred ?? marked ?? focusables(root)[0] ?? root).focus({ preventScroll: true });
    }
    return () => {
      if (opener && opener.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus]);
}

/**
 * Puts focus back inside root when the focused control disappears or turns disabled (a busy
 * button, a step that swaps its actions) and focus falls to the page body. It picks an
 * element marked data-autofocus, else the first control, else root itself.
 * contained: only rescue while focus last sat inside root (inline layers on a page, where
 * the reader may have moved on). Modal layers leave it off: focus always belongs inside.
 */
export function useFocusRescue(ref: RefObject<HTMLElement | null>, active: boolean, contained = false) {
  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;
    let owns = !contained || root.contains(document.activeElement);
    let frame = 0;
    const onIn = () => {
      owns = true;
    };
    const onOut = (e: FocusEvent) => {
      if (contained && e.relatedTarget instanceof Node && !root.contains(e.relatedTarget)) owns = false;
    };
    const onDown = (e: PointerEvent) => {
      if (contained && e.target instanceof Node && !root.contains(e.target)) owns = false;
    };
    const check = () => {
      frame = 0;
      const now = document.activeElement;
      if (!owns || !root.isConnected || (now && now !== document.body && now !== document.documentElement)) return;
      const list = focusables(root);
      (list.find((el) => el.hasAttribute("data-autofocus")) ?? list[0] ?? root).focus({ preventScroll: true });
    };
    // Two frames: the browser moves focus off a disabled control during its next rendering step.
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(check);
      });
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert"] });
    root.addEventListener("focusin", onIn);
    root.addEventListener("focusout", onOut);
    document.addEventListener("pointerdown", onDown);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      root.removeEventListener("focusin", onIn);
      root.removeEventListener("focusout", onOut);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [ref, active, contained]);
}

/** Keeps Tab and Shift+Tab cycling inside root. Call from the layer's onKeyDown. */
export function trapTab(e: ReactKeyboardEvent, root: HTMLElement | null) {
  if (e.key !== "Tab" || !root) return;
  const list = focusables(root);
  if (list.length === 0) {
    e.preventDefault();
    root.focus();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  const current = document.activeElement;
  if (e.shiftKey && (current === first || current === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && current === last) {
    e.preventDefault();
    first.focus();
  }
}

/** Stops the page behind a modal layer from scrolling. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const el = document.documentElement;
    const previous = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = previous;
    };
  }, [active]);
}

/** Calls onOutside when a pointer goes down outside ref while active (menus, popovers). */
export function useOutsidePointer(ref: RefObject<HTMLElement | null>, active: boolean, onOutside: () => void) {
  const handle = useEffectEvent(onOutside);
  useEffect(() => {
    if (!active) return;
    const down = (e: PointerEvent) => {
      const root = ref.current;
      if (root && e.target instanceof Node && !root.contains(e.target)) handle();
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [active, ref]);
}

/* ----------------------------------------------------------------------------- Overlay */

export type OverlayPlacement = "center" | "right" | "top";

/* Open layers, oldest first. Only the newest one answers keys that land outside it. */
const layerStack: number[] = [];
let layerSeq = 0;

const containerCls: Record<OverlayPlacement, string> = {
  center: "items-center justify-center p-4 sm:p-6",
  right: "items-stretch justify-end",
  top: "items-start justify-center px-3 pb-4 pt-[12vh] max-[560px]:pt-[8vh]",
};

const enterCls: Record<OverlayPlacement, string> = {
  center: "starting:scale-[0.97] starting:opacity-0",
  right: "h-full w-[min(420px,100%)] starting:translate-x-full",
  top: "w-[min(560px,100%)] starting:-translate-y-1.5 starting:scale-[0.985] starting:opacity-0",
};

export type OverlayProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  placement?: OverlayPlacement;
  /** alertdialog for destructive confirms: no backdrop dismissal by default. */
  role?: "dialog" | "alertdialog";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Click on the dimmed backdrop closes. Defaults to true for dialogs, false for alertdialogs. */
  closeOnBackdrop?: boolean;
  /** Escape closes. Turn off while a step must finish (busy states). */
  closeOnEscape?: boolean;
  /** Selector for the element to focus first; otherwise [data-autofocus] or the first control. */
  initialFocus?: string;
  backdropClassName?: string;
  className?: string;
};

/** Portalled modal layer: backdrop, focus in, Tab trap, Escape, focus back to the opener. */
export function Overlay({
  open,
  onClose,
  children,
  placement = "center",
  role = "dialog",
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  closeOnBackdrop,
  closeOnEscape = true,
  initialFocus,
  backdropClassName,
  className,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Layers open from user input, after hydration; the server never renders a portal.
  const live = open && typeof document !== "undefined";
  useFocusReturn(panelRef, live, initialFocus);
  useFocusRescue(panelRef, live);
  useScrollLock(live);
  const escape = useEffectEvent(() => {
    if (closeOnEscape) onClose();
  });
  // When focus falls out of the panel (a focused button became disabled while busy), Escape
  // still closes the newest layer and Tab brings focus back inside it.
  useEffect(() => {
    if (!live) return;
    const id = ++layerSeq;
    layerStack.push(id);
    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (layerStack[layerStack.length - 1] !== id || !panel || panel.contains(document.activeElement)) return;
      if (e.key === "Escape") {
        e.preventDefault();
        escape();
      } else if (e.key === "Tab") {
        e.preventDefault();
        (focusables(panel)[0] ?? panel).focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      layerStack.splice(layerStack.indexOf(id), 1);
    };
  }, [live]);
  if (!live) return null;
  const backdropCloses = closeOnBackdrop ?? role === "dialog";

  return createPortal(
    <div
      className={cn("fixed inset-0 z-[300] flex", containerCls[placement])}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          e.preventDefault();
          if (closeOnEscape) onClose();
          return;
        }
        trapTab(e, panelRef.current);
      }}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-[3px] transition-opacity duration-200 starting:opacity-0",
          backdropClassName,
        )}
        onClick={backdropCloses ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-full max-w-full min-w-0 outline-none transition-[opacity,transform] duration-300 ease-quirq",
          enterCls[placement],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
