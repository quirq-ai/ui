"use client";

// Demo helper for the media-files category: timeouts started from clicks (simulated loads)
// that are all cleared when the demo unmounts. Not exported from the category index.
import { useCallback, useEffect, useRef } from "react";

/** Returns `later(fn, ms)`; every pending timeout is cleared on unmount. */
export function useTimers() {
  const list = useRef<number[]>([]);
  useEffect(() => {
    const current = list.current;
    return () => current.forEach((t) => window.clearTimeout(t));
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    list.current.push(window.setTimeout(fn, ms));
  }, []);
}
