"use client";

// ChatScroller: the transcript viewport. Opens pinned to the newest message, stays pinned while
// new parts arrive if the reader was already at the end, and shows a "Jump to latest" pill once
// they scroll up. role="log" so assistive tech treats it as an append-only conversation; the
// region is focusable so the keyboard can scroll it.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type ChatScrollerProps = {
  children: ReactNode;
  /** Accessible name for the log, such as "Conversation with Claude Code". */
  label: string;
  /** Changes whenever content grows (message count plus streamed length). */
  contentKey?: string | number;
  /** Fixed viewport height; the thread scrolls inside it. */
  className?: string;
  /** Inner padding and gap for the messages. */
  contentClassName?: string;
  /** Distance from the end, in px, at which the jump pill appears. */
  threshold?: number;
  /** A turn is still arriving: sets aria-busy so readers do not announce every streamed chunk. */
  busy?: boolean;
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scrolling transcript with stick-to-end and a jump-to-latest control. */
export function ChatScroller({ children, label, contentKey, className, contentClassName, threshold = 120, busy = false }: ChatScrollerProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [away, setAway] = useState(false);

  // Follow new content only while the reader is at the end; never yank them back up.
  useEffect(() => {
    const el = viewport.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [contentKey]);

  function onScroll() {
    const el = viewport.current;
    if (!el) return;
    const fromEnd = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinned.current = fromEnd < 48;
    setAway(fromEnd > threshold);
  }

  function jump() {
    const el = viewport.current;
    if (!el) return;
    pinned.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }

  return (
    <div className={cn("relative flex min-h-0 flex-col", className)}>
      <div
        ref={viewport}
        role="log"
        aria-label={label}
        aria-busy={busy || undefined}
        tabIndex={0}
        onScroll={onScroll}
        className="scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:rounded-[14px]! focus-visible:outline-offset-[-3px]!"
      >
        <div className={cn("flex min-h-full flex-col justify-end gap-6 p-4 sm:p-6", contentClassName)}>{children}</div>
      </div>
      <button
        type="button"
        onClick={jump}
        inert={!away}
        className={cn(
          "absolute bottom-3 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full! border border-hair-strong bg-[rgba(30,30,32,0.92)] px-3 text-[12px] font-medium text-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md",
          "transition-[opacity,transform] duration-200 ease-quirq hover:bg-s4",
          away ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ArrowDown aria-hidden="true" className="size-3.5" />
        Jump to latest
      </button>
    </div>
  );
}
