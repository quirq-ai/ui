"use client";

// Media-query hooks for the layout shapes. useSyncExternalStore keeps the server snapshot
// fixed (no preference, dark), so the first client render matches the server HTML and the
// real value arrives right after hydration.
import { useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
const LIGHT = "(prefers-color-scheme: light)";

function makeStore(query: string) {
  const subscribe = (onChange: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
  const getSnapshot = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const getServerSnapshot = () => false;
  return { subscribe, getSnapshot, getServerSnapshot };
}

const reduceStore = makeStore(REDUCE);
const lightStore = makeStore(LIGHT);

/** True when the device asks for reduced motion. False on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(reduceStore.subscribe, reduceStore.getSnapshot, reduceStore.getServerSnapshot);
}

/** The device color scheme. "dark" on the server. */
export function useSystemScheme(): "light" | "dark" {
  return useSyncExternalStore(lightStore.subscribe, lightStore.getSnapshot, lightStore.getServerSnapshot) ? "light" : "dark";
}
