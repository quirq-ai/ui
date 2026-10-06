// Demo timers that die with the component: schedule(fn, ms) from event handlers, never from
// render. Also a reduced-motion check for handlers that would otherwise animate.
import { useCallback, useEffect, useRef } from "react";

export function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => {
    const list = ids.current;
    return () => {
      list.forEach((id) => window.clearTimeout(id));
      list.length = 0;
    };
  }, []);
  const schedule = useCallback((fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearAll = useCallback(() => {
    ids.current.forEach((id) => window.clearTimeout(id));
    ids.current.length = 0;
  }, []);
  return { schedule, clearAll };
}

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
