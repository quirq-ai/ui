"use client";

// Demo-only hooks: scheduled steps that simulate slow work (connecting, deleting, saving)
// and are cleared when the demo unmounts. Timers only start from event handlers, never
// during render, so the first paint is identical on the server and in the browser.
import { useCallback, useEffect, useRef } from "react";

/** Returns schedule(fn, ms): a setTimeout that is cancelled on unmount. */
export function useTimers() {
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((t) => window.clearTimeout(t));
      list.length = 0;
    };
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
}
