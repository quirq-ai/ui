"use client";

// ScreenshotTabs: mono uppercase view chips over one framed screen; picking a view crossfades
// to it (the others go transparent and aria-hidden). Optional caption panels follow, one per
// view, with the shown one lit. Arrow keys, Home and End move between the chips.
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ScreenshotView = {
  key: string;
  /** Chip label, shown uppercase. */
  label: string;
  /** The screen itself; give it alt text (role img and aria-label). */
  screen: ReactNode;
  /** Caption panel under the frame. */
  caption?: { title: string; body: string };
};

export type ScreenshotTabsProps = {
  views: ScreenshotView[];
  defaultKey?: string;
  value?: string;
  onChange?: (key: string) => void;
  /** Names the chip group: "Space screenshot views". */
  "aria-label": string;
  /** Screen aspect as width / height, such as "1000 / 520". */
  aspect?: string;
  className?: string;
};

/** Tab viewer for product screenshots with a 300ms crossfade. */
export function ScreenshotTabs({ views, defaultKey, value, onChange, "aria-label": ariaLabel, aspect = "1000 / 520", className }: ScreenshotTabsProps) {
  const [inner, setInner] = useState(defaultKey ?? views[0]?.key);
  const current = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function pick(key: string) {
    if (value === undefined) setInner(key);
    onChange?.(key);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % views.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + views.length) % views.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = views.length - 1;
    if (next === null) return;
    e.preventDefault();
    pick(views[next].key);
    refs.current[next]?.focus();
  }

  const withCaptions = views.some((v) => v.caption);

  return (
    <div className={cn("min-w-0", className)}>
      <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2.5">
        {views.map((v, i) => {
          const on = v.key === current;
          return (
            <button
              key={v.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              aria-pressed={on}
              onClick={() => pick(v.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "rounded-full! border px-[17px] py-[9px] font-mono text-[11px] uppercase leading-none tracking-[0.14em] transition-colors",
                on ? "border-ink bg-ink text-black" : "border-hair text-ink-dim hover:border-white/[0.22] hover:text-ink",
              )}
            >
              {v.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-[20px] border border-hair-soft bg-[#0f0f11] p-2">
        <div className="relative overflow-hidden rounded-[14px] bg-[#0b0d0c]" style={{ aspectRatio: aspect }}>
          {views.map((v) => {
            const on = v.key === current;
            return (
              <div
                key={v.key}
                aria-hidden={on ? undefined : true}
                data-shown={on || undefined}
                className={cn("absolute inset-0 transition-opacity duration-300 ease-quirq [&>svg]:h-full", on ? "opacity-100" : "opacity-0")}
              >
                {v.screen}
              </div>
            );
          })}
        </div>
      </div>
      {withCaptions ? (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {views.map((v) =>
            v.caption ? (
              <div
                key={v.key}
                className={cn(
                  "rounded-[18px] border bg-[#0f0f11] p-5 transition-colors duration-300",
                  v.key === current ? "border-hair-strong" : "border-hair-soft",
                )}
              >
                <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.18em]", v.key === current ? "text-ink" : "text-ink-faint")}>{v.label}</p>
                <p className="mt-2 text-[15px] font-semibold leading-snug text-ink">{v.caption.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{v.caption.body}</p>
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
