"use client";

import { useId, useState } from "react";
import { JOBS, JOB_RUNS, NOW_ISO, PROJECTS, USAGE_DAILY } from "@/lib/fixtures";
import { formatDateTime, pluralize } from "@/lib/format";
import { DemoCell, DemoGrid } from "./_kit";
import { addDays, Calendar, formatRange, PeriodPicker, ProjectPicker, RangeCalendar, type DayKey, type MarkTone } from "./pickers";

const TODAY: DayKey = NOW_ISO.slice(0, 10); // 2026-10-02
const LAST_FULL_DAY: DayKey = USAGE_DAILY[USAGE_DAILY.length - 1].date; // 2026-10-01

const PROJECT_OPTIONS = PROJECTS.map((p) => ({
  value: p.id,
  label: p.displayName,
  color: `var(--${p.color})`,
  meta: p.openSessions > 0 ? `${p.category} · ${p.openSessions} open` : p.category,
}));

/* Run dots: past runs from the run log (red when any failed), then the nightly schedule. */
const RUN_MARKS: Record<DayKey, MarkTone> = (() => {
  const marks: Record<DayKey, MarkTone> = {};
  for (const r of JOB_RUNS) {
    const k = r.startedAt.slice(0, 10);
    if (r.status === "failed") marks[k] = "red";
    else if (!marks[k]) marks[k] = "grn";
  }
  for (let i = 1; i <= 20; i++) marks[addDays(TODAY, i)] = "blu";
  return marks;
})();

const markLabel = (t: MarkTone) => (t === "red" ? "a run failed" : t === "grn" ? "runs succeeded" : "run scheduled");

const NIGHTLY = JOBS.find((j) => j.id === "job_nightly")!;

function ProjectPickers() {
  const a = useId();
  const b = useId();
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span id={a} className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-dim">
          Project · placeholder
        </span>
        <ProjectPicker options={PROJECT_OPTIONS} value={picked} onChange={setPicked} labelledBy={a} aria-label="Project" />
        <span className="text-[12px] text-ink-faint">{picked ? `Sessions will open in ${picked}.` : "Nothing chosen yet."}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id={b} className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-dim">
          Project · selected
        </span>
        <ProjectPicker options={PROJECT_OPTIONS} defaultValue="xo-space" labelledBy={b} aria-label="Project" />
      </div>
    </div>
  );
}

function JobCalendar() {
  const [day, setDay] = useState<DayKey>(addDays(TODAY, 1));
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
      <Calendar
        today={TODAY}
        min={TODAY}
        value={day}
        onChange={setDay}
        marked={RUN_MARKS}
        markLabel={markLabel}
        label="Start day for Nightly tests"
      />
      <div className="flex min-w-0 flex-col gap-2.5 text-[12.5px]">
        <p className="text-ink">
          {NIGHTLY.name} <span className="text-ink-dim">starts</span> <span className="font-mono">{formatDateTime(`${day}T02:00:00Z`)}</span>
        </p>
        <p className="text-ink-dim">{NIGHTLY.schedule} · times in UTC</p>
        <ul className="mt-1 flex flex-col gap-1.5 text-[12px] text-ink-dim">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-grn" aria-hidden="true" /> Runs succeeded
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-red" aria-hidden="true" /> A run failed
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blu" aria-hidden="true" /> Scheduled
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex h-4 w-5 items-center justify-center rounded-[4px] bg-s3 font-mono text-[9px] text-ink" aria-hidden="true">
              2
            </span>
            Today
          </li>
        </ul>
        <p className="text-[11.5px] text-ink-faint">Days before today are disabled. Arrow keys move, Page Up and Page Down change month.</p>
      </div>
    </div>
  );
}

function PeriodPickers() {
  const [label, setLabel] = useState(formatRange(addDays(LAST_FULL_DAY, -29), LAST_FULL_DAY));
  const [days, setDays] = useState(30);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-[11.5px] text-ink-faint">Preset · usage header</span>
        <PeriodPicker
          presets={[7, 15, 30]}
          endDay={LAST_FULL_DAY}
          today={TODAY}
          onChange={(_, r) => {
            if (r.start && r.end) {
              setLabel(formatRange(r.start, r.end));
              setDays(Math.round((Date.parse(r.end) - Date.parse(r.start)) / 86_400_000) + 1);
            }
          }}
        />
        <p className="text-[12px] text-ink-dim">
          Showing tokens and cost for <span className="text-ink">{label}</span> · {pluralize(days, "day")}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11.5px] text-ink-faint">Custom without a range · dashboard (7 / 15 / custom)</span>
        <PeriodPicker presets={[7, 15]} endDay={LAST_FULL_DAY} today={TODAY} defaultValue={{ preset: "custom", start: null, end: null }} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11.5px] text-ink-faint">Range picked</span>
        <PeriodPicker presets={[7, 15, 30]} endDay={LAST_FULL_DAY} today={TODAY} defaultValue={{ preset: "custom", start: "2026-09-14", end: "2026-09-20" }} />
      </div>
    </div>
  );
}

export function PickersDemo() {
  return (
    <DemoGrid>
      <DemoCell label="Project picker" note="Arrows, Home, End, type-ahead, Esc">
        <ProjectPickers />
      </DemoCell>
      <DemoCell label="Last 7 / 15 / 30 / Custom" note="Future days disabled">
        <PeriodPickers />
      </DemoCell>
      <DemoCell label="2-month range" note="Hover previews the range" className="md:col-span-2">
        <RangeCalendar today={TODAY} max={TODAY} defaultValue={{ start: "2026-09-14", end: "2026-09-20" }} className="max-w-[620px]" />
      </DemoCell>
      <DemoCell label="Job calendar with run dots" note="Today, selected, marked, disabled" className="md:col-span-2">
        <JobCalendar />
      </DemoCell>
    </DemoGrid>
  );
}
