"use client";

// Range slider: RangeSlider (a native range input, so arrow keys, Page keys, Home and End
// all step it; spectrum-blue fill up to the thumb; a 2px ink focus ring on the thumb; a
// live mono readout with its unit; aria-valuetext reads the value in words) in a field
// layout or an inline lever layout, and HoursBackPanel (the Machine Speed hours-back
// calculator: two sliders, an answer in hours, blue below the target and lime once hit).
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { formatFixed } from "@/lib/format";
import { FormStyles } from "./_styles";

export type RangeSliderProps = {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  min: number;
  max: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Readout parts: the number and its unit ("15" and "hrs"). */
  format: (value: number) => { value: string; unit?: string; prefix?: string };
  /** What a screen reader hears: "15 hours a week". */
  valueText: (value: number) => string;
  /** field: label, hint, then slider and big readout; inline: label left, 170px slider, 60px readout. */
  variant?: "field" | "inline";
  /** Fill and thumb color (CSS color); spectrum blue by default. */
  color?: string;
  disabled?: boolean;
  /** Demo controls: hold the dragging or focused look. */
  forceDragging?: boolean;
  forceFocus?: boolean;
  className?: string;
};

/** Bounded number by dragging, with a live mono readout. */
export function RangeSlider({
  id,
  label,
  hint,
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  format,
  valueText,
  variant = "field",
  color = "var(--blu)",
  disabled = false,
  forceDragging = false,
  forceFocus = false,
  className,
}: RangeSliderProps) {
  const auto = useId();
  const inputId = id ?? `rs-${auto}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;
  const [dragging, setDragging] = useState(false);
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const shown = format(current);

  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging]);

  const track: CSSProperties = {
    background: `linear-gradient(to right, ${disabled ? "var(--ink-faint)" : color} 0%, ${disabled ? "var(--ink-faint)" : color} ${pct}%, rgba(255,255,255,0.18) ${pct}%, rgba(255,255,255,0.18) 100%)`,
    ["--fi-thumb" as string]: disabled ? "var(--ink-faint)" : color,
  };

  const input = (
    <input
      id={inputId}
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      disabled={disabled}
      aria-describedby={hintId}
      aria-valuetext={valueText(current)}
      data-dragging={dragging || forceDragging ? "" : undefined}
      data-focus={forceFocus ? "" : undefined}
      onPointerDown={() => setDragging(true)}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (value === undefined) setInner(v);
        onChange?.(v);
      }}
      style={track}
      className="fi-range flex-1"
    />
  );

  const readout = (big: boolean) => (
    // aria-hidden: the slider already announces its value through aria-valuetext.
    <output
      htmlFor={inputId}
      aria-hidden="true"
      className={cn(
        "shrink-0 text-right font-mono font-semibold tabular-nums tracking-[-0.02em] transition-colors",
        big ? "min-w-[104px] text-[20px]" : "min-w-[60px] text-[15px]",
        dragging || forceDragging ? "text-ink" : disabled ? "text-ink-faint" : "text-ink",
      )}
    >
      {shown.prefix}
      {shown.value}
      {shown.unit ? <span className={cn("font-sans font-normal text-ink-dim", big ? "ml-1 text-[13px]" : "text-[12px]")}>{big ? ` ${shown.unit}` : shown.unit}</span> : null}
    </output>
  );

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
        <FormStyles />
        <label htmlFor={inputId} className={cn("min-w-[180px] flex-1 text-[13.5px]", disabled ? "text-ink-faint" : "text-ink")}>
          {label}
        </label>
        <div className="flex min-w-0 items-center gap-3" style={{ flex: "0 1 242px" }}>
          <div className="flex min-w-0 items-center" style={{ flex: "0 1 170px" }}>
            {input}
          </div>
          {readout(false)}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <FormStyles />
      <label htmlFor={inputId} className={cn("block text-[14.5px] font-semibold", disabled ? "text-ink-faint" : "text-ink")}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-[12.5px] leading-[1.6] text-ink-dim">
          {hint}
        </p>
      ) : null}
      <div className="mt-4 flex items-center gap-4">
        {input}
        {readout(true)}
      </div>
    </div>
  );
}

/* ============================================================================ HoursBackPanel */

export type HoursBackPanelProps = {
  defaultHours: number;
  /** 0 to 1. */
  defaultShare: number;
  /** Hours back per week that counts as the target. */
  target?: number;
  /** Shown as a badge: hours, not quirqs, and the numbers are examples. */
  provenance?: ReactNode;
  className?: string;
};

const MS_LIME = "#b4e34a";
const MS_BLUE = "#57b6ff";

/** Machine Speed hours-back calculator. The answer is hours, never quirqs. */
export function HoursBackPanel({ defaultHours, defaultShare, target = 10, provenance = "Illustrative", className }: HoursBackPanelProps) {
  const [hours, setHours] = useState(defaultHours);
  const [share, setShare] = useState(Math.round(defaultShare * 100));
  const back = (hours * share) / 100;
  const hit = back >= target;
  const fill = Math.min(100, (back / target) * 100);

  return (
    <div className={cn("flex min-w-0 flex-col gap-6 rounded-[16px] border border-white/[0.07] p-[clamp(18px,3vw,26px)]", className)} style={{ background: "#10120f" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-dim">The ten-hour test</p>
        <Badge tone="org" size="sm" mono>
          {provenance}
        </Badge>
      </div>
      <p className="-mt-3 text-[18px] font-semibold tracking-[-0.015em] text-ink">What is the repeating work costing you?</p>
      <RangeSlider
        label="Hours on this work each week"
        min={1}
        max={40}
        value={hours}
        onChange={setHours}
        format={(v) => ({ value: String(v), unit: "hrs" })}
        valueText={(v) => `${v} hours a week`}
        color={MS_BLUE}
      />
      <RangeSlider
        variant="inline"
        label="Share agents can take"
        min={20}
        max={95}
        step={1}
        value={share}
        onChange={setShare}
        format={(v) => ({ value: String(v), unit: "%" })}
        valueText={(v) => `${v} percent`}
        color={MS_BLUE}
      />
      <div aria-live="polite" className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">Hours back, every week</p>
        <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink">
          {formatFixed(back, 1)}
          <span className="ml-2 text-[15px] font-normal tracking-normal text-ink-dim">hours</span>
        </p>
        <div aria-hidden="true" className="mb-2.5 mt-4 h-2 overflow-hidden rounded-full bg-white/[0.12]">
          <div className="h-full rounded-full transition-[width,background-color] duration-200" style={{ width: `${fill.toFixed(1)}%`, background: hit ? MS_LIME : MS_BLUE }} />
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink-dim">
          {hit
            ? `Past ${target} hours a week. Decide what the first ${target} hours are for before they get absorbed.`
            : `${target} hours a week is the target. ${hours} hrs × ${share}% gets you ${formatFixed(back, 1)}.`}
        </p>
      </div>
      <details className="group text-[13px] text-ink-dim">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-[#57b6ff]">
          <span aria-hidden="true" className="font-mono text-ink-faint">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">-</span>
          </span>
          See the full method and the assumption behind it
        </summary>
        <p className="mt-3 leading-relaxed">
          Hours back = hours on repeating work × the share agents can take. The share is the one assumption; move it and the answer moves. The result is hours, not quirqs: quirqs only come from verified work.
        </p>
      </details>
    </div>
  );
}
