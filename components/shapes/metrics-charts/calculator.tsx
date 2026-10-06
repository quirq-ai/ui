"use client";

// Hours-back calculator (Machine Speed). Two sliders drive a live result toward the
// ten-hour target: blue below it, green at or past it, announced politely. The answer is
// hours, not quirqs. Full variant: quirq skin with the stat pair and the disclosures that
// hold the one assumption (two levers). Compact variant: the Machine Speed olive skin.
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatFixed } from "@/lib/format";
import type { Provenance } from "@/lib/fixtures";
import { ProvenanceTag } from "./chart-kit";

const RANGE_BASE =
  "h-1 min-w-0 cursor-pointer appearance-none rounded-full outline-none " +
  "[&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] " +
  "[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(255,255,255,0.25)] [&::-webkit-slider-thumb]:transition-transform " +
  "active:[&::-webkit-slider-thumb]:scale-110 " +
  "[&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px]";

const RANGE = {
  quirq:
    RANGE_BASE +
    " bg-white/[0.18] [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-blu [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-blu",
  ms:
    RANGE_BASE +
    " bg-[rgba(233,234,230,0.18)] [&::-webkit-slider-thumb]:border-[#10120f] [&::-webkit-slider-thumb]:bg-[#57b6ff] [&::-moz-range-thumb]:border-[#10120f] [&::-moz-range-thumb]:bg-[#57b6ff]",
} as const;

export type CalculatorInputs = { hours: number; rate: number; automation: number; review: number };

export type HoursBackResult = {
  coefficient: number;
  hoursBack: number;
  hit: boolean;
  /** share of the target reached, 0 to 1 */
  progress: number;
  /** hours of repeating work needed to reach the target at this coefficient */
  needed: number;
  costNow: number;
  valueBack: number;
};

/** The arithmetic, exported so a sample app can show the same numbers elsewhere. */
export function hoursBack(inputs: CalculatorInputs, target = 10, weeks = 48): HoursBackResult {
  const coefficient = (inputs.automation / 100) * (1 - inputs.review / 100);
  const back = inputs.hours * coefficient;
  return {
    coefficient,
    hoursBack: back,
    hit: back >= target,
    progress: Math.min(1, back / target),
    needed: coefficient > 0 ? Math.ceil(target / coefficient) : Infinity,
    costNow: inputs.hours * weeks * inputs.rate,
    valueBack: back * weeks * inputs.rate,
  };
}

export type HoursBackCalculatorProps = {
  variant?: "full" | "compact";
  defaults?: Partial<CalculatorInputs>;
  /** hours a week; the bar fills toward it */
  target?: number;
  /** working weeks a year */
  weeks?: number;
  provenance?: Provenance;
  /** compact: link to the full method */
  methodHref?: string;
  /** heading; full defaults to "Hours-back calculator (Machine Speed)", compact to the ten-hour test question */
  title?: ReactNode;
  className?: string;
};

const DEFAULTS: CalculatorInputs = { hours: 15, rate: 85, automation: 80, review: 20 };

/** Sliders drive a live hours-back result; blue below the ten-hour target, green at or past it. */
export function HoursBackCalculator({
  variant = "full",
  defaults,
  target = 10,
  weeks = 48,
  provenance = "illustrative",
  methodHref,
  title,
  className,
}: HoursBackCalculatorProps) {
  const uid = useId();
  const start: CalculatorInputs = { ...DEFAULTS, ...defaults };
  const [v, setV] = useState<CalculatorInputs>(start);
  const r = hoursBack(v, target, weeks);
  const set = (k: keyof CalculatorInputs) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const message = r.hit
    ? "Past ten hours a week. The constraint is no longer finding the time: it is deciding what those hours are for before they get absorbed."
    : `Ten hours a week is the target. At this rate you would need about ${r.needed} hours a week of repeating work to reach it, so the next move is listing the work you have not written down yet.`;

  if (variant === "compact") {
    return (
      <section
        aria-labelledby={`${uid}-h`}
        className={cn("min-w-0 rounded-[18px] border border-[rgba(233,234,230,0.12)] bg-[#10120f] p-[clamp(18px,3vw,28px)] text-[#e9eae6]", className)}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#a8aba3]">The ten-hour test</p>
          <ProvenanceTag provenance={provenance} />
        </div>
        <h3 id={`${uid}-h`} className="mt-2 text-[clamp(19px,2.4vw,24px)] font-semibold leading-tight tracking-[-0.02em]">
          {title ?? "What is the repeating work costing you?"}
        </h3>
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <Slider
              id={`${uid}-hours`}
              skin="ms"
              label="Hours a week you spend on work that repeats"
              min={1}
              max={40}
              step={1}
              value={v.hours}
              onChange={set("hours")}
              valueText={`${v.hours} hours a week`}
              display={
                <>
                  {v.hours} <span className="font-sans text-[12px] font-normal text-[#a8aba3]">hrs</span>
                </>
              }
            />
            <Slider
              id={`${uid}-rate`}
              skin="ms"
              label="What an hour of your time is worth"
              min={25}
              max={400}
              step={5}
              value={v.rate}
              onChange={set("rate")}
              valueText={`${v.rate} dollars an hour`}
              display={
                <>
                  ${v.rate} <span className="font-sans text-[12px] font-normal text-[#a8aba3]">/hr</span>
                </>
              }
            />
            <div className="flex flex-col gap-3 sm:flex-row" role="status" aria-live="polite">
              <div className="min-w-0 flex-1 rounded-[12px] border border-[rgba(233,234,230,0.12)] p-3.5">
                <p className="text-[12px] leading-[1.5] text-[#a8aba3]">What that repeating work costs you now</p>
                <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em]">{formatCurrency(r.costNow, 0)}</p>
              </div>
              <div className="min-w-0 flex-1 rounded-[12px] border border-[rgba(233,234,230,0.12)] p-3.5">
                <p className="text-[12px] leading-[1.5] text-[#a8aba3]">What the returned hours are worth</p>
                <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em]">{formatCurrency(r.valueBack, 0)}</p>
              </div>
            </div>
          </div>
          <div className="min-w-0 rounded-[14px] border border-[rgba(233,234,230,0.12)] bg-black/25 p-[clamp(18px,2.6vw,24px)]" aria-live="polite">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#a8aba3]">Hours back, every week</p>
            <p className="mt-3 text-[clamp(40px,7vw,52px)] font-semibold leading-none tracking-[-0.03em]">
              {formatFixed(r.hoursBack, 1)}
              <small className="ml-2 text-[17px] font-normal tracking-normal text-[#a8aba3]">hours</small>
            </p>
            <div aria-hidden="true" className="mb-3 mt-5 h-2 overflow-hidden rounded-[4px] bg-[rgba(233,234,230,0.12)]">
              <div
                className="h-full rounded-[4px] transition-[width,background-color] duration-200 motion-reduce:transition-none"
                style={{ width: `${(r.progress * 100).toFixed(1)}%`, background: r.hit ? "#b4e34a" : "#57b6ff" }}
              />
            </div>
            <p className="text-[13px] leading-[1.6] text-[#a8aba3]">
              <span className={cn("mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em]", r.hit ? "text-[#b4e34a]" : "text-[#57b6ff]")}>
                {r.hit ? "Target hit" : "Below target"}
              </span>
              {r.hit
                ? "Past ten hours a week. The constraint is no longer finding the time: it is deciding what those hours are for."
                : `Ten hours a week is the target. At this rate you would need about ${r.needed} hours a week of repeating work to reach it.`}
            </p>
            {methodHref ? (
              <p className="mt-5 text-[13px]">
                <a href={methodHref} className="text-[#e9eae6] underline decoration-[rgba(233,234,230,0.35)] underline-offset-4 hover:decoration-[#e9eae6]">
                  See the full method and the assumption behind it →
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${uid}-h`} className={cn("min-w-0 max-w-[760px]", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">The ten-hour test</p>
          <h3 id={`${uid}-h`} className="mt-1.5 text-[clamp(18px,2.2vw,22px)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {title ?? "Hours-back calculator (Machine Speed)"}
          </h3>
        </div>
        <ProvenanceTag provenance={provenance} />
      </div>
      <div className="flex flex-col gap-7 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3.5vw,28px)]">
        <Slider
          id={`${uid}-hours`}
          skin="quirq"
          label="Hours a week you spend on work that repeats"
          hint="Not projects. The same thing over and over: orders, invoices, onboarding, scheduling, chasing, re-keying the same data into a second system."
          min={1}
          max={40}
          step={1}
          value={v.hours}
          onChange={set("hours")}
          valueText={`${v.hours} hours a week`}
          display={
            <>
              {v.hours} <span className="font-sans text-[13px] font-normal text-ink-dim">hrs</span>
            </>
          }
          big
        />
        <Slider
          id={`${uid}-rate`}
          skin="quirq"
          label="What an hour of your time is worth"
          hint="If you are not sure, take your revenue for the year and divide it by the hours you actually work."
          min={25}
          max={400}
          step={5}
          value={v.rate}
          onChange={set("rate")}
          valueText={`${v.rate} dollars an hour`}
          display={
            <>
              ${v.rate} <span className="font-sans text-[13px] font-normal text-ink-dim">/hr</span>
            </>
          }
          big
        />
      </div>

      <div aria-live="polite">
        <div className="mt-4 rounded-[16px] border border-hair-soft bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-[clamp(20px,3.5vw,30px)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">Hours you could get back, every week</p>
            <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]", r.hit ? "text-grn" : "text-blu")}>
              <span aria-hidden="true" className={cn("size-1.5 rounded-full", r.hit ? "bg-grn" : "bg-blu")} />
              {r.hit ? "Target hit" : "Below target"}
            </span>
          </div>
          <p className="mt-3.5 text-[clamp(44px,8vw,58px)] font-semibold leading-none tracking-[-0.03em]">
            {formatFixed(r.hoursBack, 1)}
            <span className="ml-2 text-[19px] font-normal tracking-normal text-ink-dim">hours</span>
          </p>
          <p className="mt-2 font-mono text-[12px] text-ink-faint">
            {v.hours} hrs × {Math.round(r.coefficient * 100)}% · hours, not quirqs
          </p>
          <div aria-hidden="true" className="relative mb-3 mt-6 h-2 overflow-hidden rounded-full bg-white/[0.12]">
            <div
              className={cn("h-full rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none", r.hit ? "bg-grn" : "bg-blu")}
              style={{ width: `${(r.progress * 100).toFixed(1)}%` }}
            />
          </div>
          <p className="text-[13.5px] leading-[1.65] text-ink-dim">{message}</p>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[22px]">
            <p className="text-[13px] leading-[1.5] text-ink-dim sm:min-h-[40px]">What that repeating work costs you now</p>
            <p className="mt-2.5 text-[27px] font-semibold tracking-[-0.025em]">{formatCurrency(r.costNow, 0)}</p>
            <p className="mt-1.5 text-[12px] leading-[1.5] text-ink-dim">A year of your own time, at the rate above.</p>
          </div>
          <div className="flex-1 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[22px]">
            <p className="text-[13px] leading-[1.5] text-ink-dim sm:min-h-[40px]">What the hours you get back are worth</p>
            <p className="mt-2.5 text-[27px] font-semibold tracking-[-0.025em]">{formatCurrency(r.valueBack, 0)}</p>
            <p className="mt-1.5 text-[12px] leading-[1.5] text-ink-dim">A year of the returned hours, at the same rate.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3.5vw,26px)]">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-[6px] py-1 text-[14px] font-semibold text-blu [&::-webkit-details-marker]:hidden">
            <Marker />
            The equation, and the one assumption in it
          </summary>
          <div className="mt-4 text-[14px] leading-[1.75] text-ink-dim">
            <div className="overflow-x-auto rounded-r-lg border-l-[3px] border-blu bg-white/[0.03] px-4 py-3.5 text-[14px] leading-[1.8] text-ink">
              <p className="whitespace-nowrap">
                Hours back a week = hours on repeating work ×{" "}
                <b className="font-mono font-normal tabular-nums text-blu">{Math.round(r.coefficient * 100)}%</b>
              </p>
              <p className="whitespace-nowrap">What it is worth = hours back × {weeks} working weeks × your hourly rate</p>
            </div>
            <p className="mt-4">
              That single percentage is the only assumption here, and it is two things multiplied together: how much of the work can run without you
              deciding, and how much of each unit you still review afterwards. Move it and watch the answer move.
            </p>
            <Lever
              id={`${uid}-auto`}
              label="Share of the work that can run without you deciding"
              min={20}
              max={95}
              value={v.automation}
              onChange={set("automation")}
            />
            <Lever id={`${uid}-review`} label="Of each unit, the share you still review afterwards" min={0} max={60} value={v.review} onChange={set("review")} />
            <p className="mt-4">
              The defaults are illustrative, not measured. Your own number is whatever thirty days of measurement says it is.
            </p>
          </div>
        </details>
        <details className="group mt-4 border-t border-hair pt-4">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-[6px] py-1 text-[14px] font-semibold text-blu [&::-webkit-details-marker]:hidden">
            <Marker />
            Why hours and not just cost
          </summary>
          <p className="mt-4 text-[14px] leading-[1.75] text-ink-dim">
            Cost falling is easy to fake. A tool that halves your software bill while quietly moving the same work onto your evenings has not helped you.
            The test that cannot be gamed is whether the hours actually left your week. Work that has to be redone is not finished work, and it is not
            counted.
          </p>
        </details>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hair pt-4 text-[12px] text-ink-faint">
          <ProvenanceTag provenance={provenance} />
          <span>
            Defaults: {start.hours} hrs, ${start.rate}/hr, {start.automation}% automation, {start.review}% review. The result is hours, not quirqs.
          </span>
        </div>
      </div>
    </section>
  );
}

function Marker() {
  return (
    <span aria-hidden="true" className="w-3 font-mono text-ink-faint">
      <span className="group-open:hidden">+</span>
      <span className="hidden group-open:inline">-</span>
    </span>
  );
}

function Slider({
  id,
  skin,
  label,
  hint,
  min,
  max,
  step,
  value,
  onChange,
  valueText,
  display,
  big = false,
}: {
  id: string;
  skin: "quirq" | "ms";
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  valueText: string;
  display: ReactNode;
  big?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={cn("block font-semibold", big ? "text-[15px]" : "text-[13.5px]", skin === "ms" ? "text-[#e9eae6]" : "text-ink")}>
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[13px] leading-[1.6] text-ink-dim">
          {hint}
        </p>
      ) : null}
      <div className={cn("flex items-center gap-4", big ? "mt-4" : "mt-3")}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          aria-valuetext={valueText}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn("flex-1", RANGE[skin])}
        />
        <output
          htmlFor={id}
          aria-hidden="true"
          className={cn("text-right font-mono font-semibold tabular-nums tracking-[-0.02em]", big ? "min-w-[96px] text-[20px]" : "min-w-[84px] text-[17px]")}
        >
          {display}
        </output>
      </div>
    </div>
  );
}

function Lever({ id, label, min, max, value, onChange }: { id: string; label: string; min: number; max: number; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <label htmlFor={id} className="min-w-[180px] flex-1 text-[13.5px] text-ink">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        aria-valuetext={`${value} percent`}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("flex-[0_1_170px]", RANGE.quirq)}
      />
      <output htmlFor={id} aria-hidden="true" className="min-w-[52px] text-right font-mono text-[15px] font-semibold tabular-nums text-ink">
        {value}%
      </output>
    </div>
  );
}
