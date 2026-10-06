// Time helpers for the eyebrow and meta shapes. Server-safe (plain functions, no hooks), so
// both server and client components can call them. All formatting is UTC and locale-free.
import { formatDate, formatTime } from "@/lib/format";

/** Words for a time that was never recorded. Never render 0 or a blank. */
export type MissingTime = "Never" | "Unknown" | "Not recorded" | "Time unavailable";

/** "Fri 2 Oct 2026, 09:26 UTC" */
export function exactUtc(iso: string): string {
  return `${formatDate(iso, { withYear: true })}, ${formatTime(iso)} UTC`;
}

/** "Fri 2 Oct, 09:26" for the absolute line of a two-line time column. */
export function shortUtc(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}
