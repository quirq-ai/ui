"use client";

// Demo helpers for inline examples. Reopenable lets an inline example be dismissed like the
// real thing: closing it shows a "Reopen" button in its place (focused, so keyboard users
// keep their spot) and reopening mounts a fresh copy in its starting state. FocusScope keeps
// keyboard focus inside an inline example when the control that had it goes away (a busy
// button, a confirm that replaces its trigger), the same way a real dialog layer does.
import { Fragment, useCallback, useRef, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useFocusRescue } from "./overlay-core";

/** Wrapper that puts focus back inside when its focused control disappears. */
export function FocusScope({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusRescue(ref, true, true);
  return (
    <div ref={ref} className={cn("contents", className)}>
      {children}
    </div>
  );
}

export function Reopenable({ label, children }: { label: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(true);
  const [round, setRound] = useState(0);
  // Stable callback: runs once when the closed state mounts, not on every parent render.
  const focusReopen = useCallback((el: HTMLDivElement | null) => {
    el?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, []);
  if (!open) {
    return (
      <div className="m-auto flex flex-col items-center gap-2 p-4 text-center" ref={focusReopen}>
        <p className="text-[12.5px] text-ink-dim">{label} closed.</p>
        <Button
          size="sm"
          leadingIcon={<RotateCcw />}
          onClick={() => {
            setRound((r) => r + 1);
            setOpen(true);
          }}
        >
          Reopen
        </Button>
      </div>
    );
  }
  return (
    <Fragment key={round}>
      <FocusScope>{children(() => setOpen(false))}</FocusScope>
    </Fragment>
  );
}
