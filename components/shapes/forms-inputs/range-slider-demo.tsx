"use client";

import { useState } from "react";
import { HOURS_BACK_DEFAULTS } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import { HoursBackPanel, RangeSlider } from "./range-slider";

const hrs = (v: number) => ({ value: String(v), unit: "hrs" });
const hrsText = (v: number) => `${v} hours a week`;
const pct = (v: number) => ({ value: String(v), unit: "%" });
const pctText = (v: number) => `${v} percent`;

function PrimaryFields() {
  const [hours, setHours] = useState(HOURS_BACK_DEFAULTS.hoursPerWeek);
  const [rate, setRate] = useState(85);
  return (
    <div className="flex flex-col gap-8 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3vw,26px)]">
      <RangeSlider
        label="Hours a week you spend on work that repeats"
        hint="Not projects. The same thing over and over: orders, invoices, onboarding, re-keying data."
        min={1}
        max={40}
        value={hours}
        onChange={setHours}
        format={hrs}
        valueText={hrsText}
      />
      <RangeSlider
        label="What an hour of your time is worth"
        hint="Not sure? Divide a year of revenue by the hours you actually work."
        min={25}
        max={400}
        step={5}
        value={rate}
        onChange={setRate}
        format={(v) => ({ prefix: "$", value: String(v), unit: "/hr" })}
        valueText={(v) => `${v} dollars an hour`}
      />
    </div>
  );
}

function Levers() {
  const [auto, setAuto] = useState(80);
  const [review, setReview] = useState(20);
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3vw,26px)]">
      <RangeSlider variant="inline" label="Share of the work that can run without you deciding" min={20} max={95} step={5} value={auto} onChange={setAuto} format={pct} valueText={pctText} />
      <RangeSlider variant="inline" label="Of each unit, the share you still review afterwards" min={0} max={60} step={5} value={review} onChange={setReview} format={pct} valueText={pctText} />
      <p className="border-t border-hair-soft pt-3 font-mono text-[11.5px] text-ink-dim">
        coefficient = {auto}% × (1 − {review}%) = <span className="text-blu">{Math.round(auto * (1 - review / 100))}%</span>
      </p>
    </div>
  );
}

export function RangeSliderDemo() {
  return (
    <div>
      <DemoGrid>
        <DemoCell label="Primary field" note="Hours 1 to 40 · rate $25 to $400, step 5">
          <PrimaryFields />
        </DemoCell>
        <DemoCell label="Inline lever" note="Arrow keys step; Home and End jump">
          <Levers />
        </DemoCell>
        <DemoCell label={HOURS_BACK_DEFAULTS.title} note="Below target blue, target hit lime" className="md:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <HoursBackPanel defaultHours={HOURS_BACK_DEFAULTS.hoursPerWeek} defaultShare={HOURS_BACK_DEFAULTS.automationShare} />
            <HoursBackPanel defaultHours={18} defaultShare={0.72} />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid cols={2}>
        <DemoCell label="State · idle">
          <RangeSlider label="Hours on this work each week" min={1} max={40} defaultValue={15} format={hrs} valueText={hrsText} />
        </DemoCell>
        <DemoCell label="State · dragging">
          <RangeSlider label="Hours on this work each week" min={1} max={40} defaultValue={27} format={hrs} valueText={hrsText} forceDragging />
        </DemoCell>
        <DemoCell label="State · focus">
          <RangeSlider label="Hours on this work each week" min={1} max={40} defaultValue={9} format={hrs} valueText={hrsText} forceFocus />
        </DemoCell>
        <DemoCell label="State · disabled">
          <RangeSlider label="Hours on this work each week" hint="Locked while the estimate is saved." min={1} max={40} defaultValue={15} format={hrs} valueText={hrsText} disabled />
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
