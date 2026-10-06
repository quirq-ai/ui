"use client";

// Hours-back calculator (Machine Speed), full variant with disclosures. The result is hours,
// never quirqs. The coefficient is the share of work that can run without a decision,
// discounted by the share of each unit still reviewed. Every figure is illustrative.
import { useId, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { MSFormula } from "./machine-speed";

export type MSHoursCalculatorProps = {
  defaultHours?: number;
  defaultRate?: number;
  /** 0 to 100 */
  defaultAutomation?: number;
  /** 0 to 100 */
  defaultReview?: number;
  weeks?: number;
  target?: number;
  className?: string;
};

const RANGE =
  "h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-[2px] bg-[rgba(233,234,230,0.18)] accent-[#57b6ff] " +
  "[&::-webkit-slider-thumb]:size-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#10120f] [&::-webkit-slider-thumb]:bg-[#57b6ff] [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(233,234,230,0.25)] " +
  "[&::-moz-range-thumb]:size-[16px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[#10120f] [&::-moz-range-thumb]:bg-[#57b6ff] " +
  "focus-visible:outline-offset-[6px]";

const LEVER = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-2 sm:grid-cols-[minmax(0,1fr)_170px_auto]";

function Value({ children, unit, wide = false }: { children: string; unit: string; wide?: boolean }) {
  return (
    <span className={cn("shrink-0 text-right font-mono text-[18px] font-semibold tabular-nums tracking-[-0.02em] text-[#e9eae6]", wide ? "min-w-[96px]" : "min-w-[64px]")}>
      {children} <span className="font-sans text-[12px] font-normal text-[#808379]">{unit}</span>
    </span>
  );
}

export function MSHoursCalculator({ defaultHours = 15, defaultRate = 85, defaultAutomation = 80, defaultReview = 20, weeks = 48, target = 10, className }: MSHoursCalculatorProps) {
  const uid = useId();
  const [hours, setHours] = useState(defaultHours);
  const [rate, setRate] = useState(defaultRate);
  const [automation, setAutomation] = useState(defaultAutomation);
  const [review, setReview] = useState(defaultReview);

  const coef = (automation / 100) * (1 - review / 100);
  const back = hours * coef;
  const hit = back >= target;
  const pct = Math.min(100, (back / target) * 100);
  const need = coef > 0 ? Math.ceil(target / coef) : null;
  const sharePct = Math.round(coef * 100);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="rounded-[14px] border border-[rgba(233,234,230,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))] px-[clamp(16px,3vw,26px)] pt-6 pb-2">
        <div className="mb-7">
          <label htmlFor={`${uid}-h`} className="block text-[15px] font-semibold text-[#e9eae6]">
            Hours a week you spend on work that repeats
          </label>
          <p id={`${uid}-h-hint`} className="mt-1 mb-4 text-[13px] leading-[1.6] text-[#808379]">
            Not projects. The same thing over and over: orders, invoices, onboarding, re-keying data into a second system.
          </p>
          <div className="flex items-center gap-4">
            <input id={`${uid}-h`} type="range" min={1} max={40} step={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} aria-describedby={`${uid}-h-hint`} className={RANGE} />
            <Value unit="hrs" wide>{String(hours)}</Value>
          </div>
        </div>
        <div className="mb-5">
          <label htmlFor={`${uid}-r`} className="block text-[15px] font-semibold text-[#e9eae6]">
            What an hour of your time is worth
          </label>
          <p id={`${uid}-r-hint`} className="mt-1 mb-4 text-[13px] leading-[1.6] text-[#808379]">
            Not sure? Divide a year of revenue by the hours you actually work.
          </p>
          <div className="flex items-center gap-4">
            <input id={`${uid}-r`} type="range" min={25} max={400} step={5} value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-describedby={`${uid}-r-hint`} className={RANGE} />
            <Value unit="/hr" wide>{`$${rate}`}</Value>
          </div>
        </div>
      </div>

      <div role="status" aria-live="polite" className="rounded-[14px] border border-[rgba(233,234,230,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-[clamp(16px,3vw,26px)] py-7">
        <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#808379]">Hours you could get back, every week</p>
        <p className="text-[clamp(44px,7vw,56px)] font-semibold leading-none tracking-[-0.03em] tabular-nums">
          {back.toFixed(1)}
          <small className="ml-2 text-[18px] font-normal tracking-normal text-[#a8aba3]">hours</small>
        </p>
        <div className="mt-6 mb-3 h-2 overflow-hidden rounded-[4px] bg-[rgba(233,234,230,0.12)]">
          <div className={cn("h-full rounded-[4px] transition-[width] duration-200", hit ? "bg-[#b4e34a]" : "bg-[#57b6ff]")} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[13.5px] leading-[1.65] text-[#a8aba3]">
          {hit
            ? "Past ten hours a week. The constraint is no longer finding the time: it is deciding what the first ten hours are for."
            : `Ten hours a week is the target. At this rate you would need about ${need ?? "Unavailable"} hours a week of repeating work to reach it.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { k: "What that repeating work costs you now", v: formatCurrency(hours * weeks * rate, 0), n: "A year of your own time, at the rate above." },
          { k: "What the hours you get back are worth", v: formatCurrency(back * weeks * rate, 0), n: "A year of the returned hours, at the same rate." },
        ].map((s) => (
          <div key={s.k} className="min-w-0 rounded-[12px] border border-[rgba(233,234,230,0.12)] px-5 pt-5 pb-4">
            <p className="mb-2.5 text-[13px] leading-[1.5] text-[#808379]">{s.k}</p>
            <p className="text-[26px] font-semibold tabular-nums tracking-[-0.025em]">{s.v}</p>
            <p className="mt-1.5 text-[12px] leading-[1.5] text-[#808379]">{s.n}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <details className="group" open>
          <summary className="cursor-pointer list-none rounded-[4px] py-0.5 text-[14px] font-semibold text-[#57b6ff] [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="font-mono group-open:hidden">
              +{" "}
            </span>
            <span aria-hidden="true" className="hidden font-mono group-open:inline">
              -{" "}
            </span>
            How the {sharePct}% is worked out
          </summary>
          <div className="mt-3.5 space-y-3.5 text-[14px] leading-[1.75] text-[#a8aba3]">
            <MSFormula>
              Hours back a week = hours on repeating work × <b>{sharePct}%</b> = <b>{back.toFixed(1)}</b> hours
            </MSFormula>
            <div className={LEVER}>
              <label htmlFor={`${uid}-a`} className="col-span-2 text-[14px] text-[#a8aba3] sm:col-span-1">
                Share of the work that runs without you deciding
              </label>
              <input id={`${uid}-a`} type="range" min={0} max={100} step={5} value={automation} onChange={(e) => setAutomation(Number(e.target.value))} className={cn(RANGE, "w-full")} />
              <Value unit="%">{String(automation)}</Value>
            </div>
            <div className={LEVER}>
              <label htmlFor={`${uid}-v`} className="col-span-2 text-[14px] text-[#a8aba3] sm:col-span-1">
                Share of each unit you still review
              </label>
              <input id={`${uid}-v`} type="range" min={0} max={100} step={5} value={review} onChange={(e) => setReview(Number(e.target.value))} className={cn(RANGE, "w-full")} />
              <Value unit="%">{String(review)}</Value>
            </div>
          </div>
        </details>
        <details className="group border-t border-[rgba(233,234,230,0.12)] pt-4">
          <summary className="cursor-pointer list-none rounded-[4px] py-0.5 text-[14px] font-semibold text-[#57b6ff] [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="font-mono group-open:hidden">
              +{" "}
            </span>
            <span aria-hidden="true" className="hidden font-mono group-open:inline">
              -{" "}
            </span>
            What the hours are worth
          </summary>
          <div className="mt-3.5 space-y-3 text-[14px] leading-[1.75] text-[#a8aba3]">
            <MSFormula>
              What it is worth = hours back × <b>{weeks}</b> working weeks × your hourly rate = <b>{formatCurrency(back * weeks * rate, 0)}</b>
            </MSFormula>
            <p>A guide, not a quote: the real figure comes from measuring one workflow for thirty days.</p>
          </div>
        </details>
      </div>
    </div>
  );
}
