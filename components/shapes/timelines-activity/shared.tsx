// Small server-safe pieces shared by the timelines-activity demos: mono captions, labelled
// demo cells and UTC date helpers built from fixed name arrays (no Intl date data, so the
// server and the browser always print the same string).
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Mono caption that names a variant or state inside a demo. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10.5px] uppercase leading-[1.5] tracking-[0.14em] text-ink-faint", className)}>{children}</p>;
}

/** One labelled cell in a demo grid. */
export function DemoCell({ caption, children, className }: { caption: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <Caption>{caption}</Caption>
      {children}
    </div>
  );
}

/** A titled group of cells inside one shape demo. */
export function DemoGroup({ title, note, children, className }: { title: string; note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0", className)} aria-label={title}>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hair-soft pb-2.5">
        <h3 className="text-[13px] font-semibold tracking-[-0.005em] text-ink">{title}</h3>
        {note ? <p className="text-[12px] text-ink-faint">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ UTC date helpers */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 1785542400000 -> "Aug 2026". UTC. */
export function monthYear(ms: number): string {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Axis tick: "SEP 2025" when withYear, else "SEP". UTC. */
export function monthTick(ms: number, withYear: boolean): string {
  const d = new Date(ms);
  const m = MONTHS[d.getUTCMonth()].toUpperCase();
  return withYear ? `${m} ${d.getUTCFullYear()}` : m;
}

/** "1 Sep 2025". UTC. */
export function dayMonthYear(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** First instant of the month that contains ms. UTC. */
export function monthStart(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

/** First instant of the next month. UTC. */
export function nextMonth(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

/** Number words for headline counts: 13 -> "Thirteen". */
const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen"];
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}
