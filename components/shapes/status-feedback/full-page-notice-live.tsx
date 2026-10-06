"use client";

// Timers for full-page notices: useCountdown (result redirects), useAutoRefresh (galileo's
// waiting page tries again every 2 s) and AutoRefreshLine (the visible "trying again" line).
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StatusDot, type DotStatus } from "@/components/ui/status";

/** Counts whole seconds down from `from` while `running`; restart() starts over, finish() ends now. */
export function useCountdown(from: number, running = true) {
  const [left, setLeft] = useState(from);
  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setTimeout(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(t);
  }, [running, left]);
  return {
    left,
    done: left === 0,
    restart: () => setLeft(from),
    finish: () => setLeft(0),
  };
}

/** Fires a new attempt every `everyMs` while `running`; attempt counts from 1. */
export function useAutoRefresh(everyMs = 2000, running = true) {
  const [attempt, setAttempt] = useState(1);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setAttempt((n) => n + 1), everyMs);
    return () => clearInterval(t);
  }, [everyMs, running]);
  return { attempt, reset: () => setAttempt(1) };
}

/** "Trying again every 2 s · attempt 3" with a dot and a bar that refills each attempt. */
export function AutoRefreshLine({
  attempt,
  everyMs = 2000,
  status = "down",
  running = true,
  children,
  className,
}: {
  attempt: number;
  everyMs?: number;
  status?: DotStatus;
  running?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        <StatusDot status={status} pulse={running && status !== "down"} size="xs" />
        {children ?? <>Trying again every {everyMs / 1000} s</>}
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">attempt {attempt}</span>
      </span>
      {running ? (
        <span aria-hidden="true" className="mx-auto block h-[2px] w-[120px] overflow-hidden rounded-full bg-white/[0.08]">
          <style href="sf-refill" precedence="low">
            {"@keyframes sf-refill{from{transform:scaleX(0)}to{transform:scaleX(1)}}"}
          </style>
          <span key={attempt} className="block h-full origin-left bg-ink-dim" style={{ animation: `sf-refill ${everyMs}ms linear forwards` }} />
        </span>
      ) : null}
    </div>
  );
}
