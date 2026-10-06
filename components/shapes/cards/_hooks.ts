// Client hooks shared by the cards demos. Import only from "use client" files.
import { useCallback, useEffect, useRef } from "react";

/** setTimeout that is cleared on unmount. Only call it from event handlers. */
export function useLater() {
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((id) => window.clearTimeout(id));
    };
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
}
