"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/loaders";
import { formatBytes } from "@/lib/format";
import { DEPLOY_PIPELINE, DEPLOY_PIPELINE_FAILED, PROJECT_STAGES, SPACES, type PipelineStage } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack, Specimen } from "./parts";
import { ProgressRing, Sliver, StageBar, StageDots, type Stage } from "./progress";

/* fixed step sizes so the run looks organic but plays the same every time */
const STEPS = [6, 11, 4, 9, 13, 7, 3, 10, 8, 12, 5, 9, 3];

const toStage = (s: PipelineStage): Stage => ({
  id: s.id,
  label: s.label,
  state: s.status === "completed" ? "done" : s.status === "in_progress" ? "active" : s.status === "failed" ? "failed" : "todo",
});

const STAGE_TONES = ["blu", "cyn", "grn", "org"] as const;

/** Size of the mock upload. */
const UPLOAD_BYTES = 4.8 * 1024 * 1024;

export function ProgressDemo() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  const step = useRef(0);
  const complete = value >= 100;

  const valueRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const next = Math.min(100, valueRef.current + STEPS[step.current % STEPS.length]);
      step.current += 1;
      valueRef.current = next;
      setValue(next);
      if (next >= 100) setRunning(false);
    }, 220);
    return () => clearInterval(t);
  }, [running]);

  const reset = () => {
    step.current = 0;
    valueRef.current = 0;
    setRunning(false);
    setValue(0);
  };

  const ops = SPACES[0];
  const billing = SPACES[2];
  const rollout: Stage[] = PROJECT_STAGES.map((s, i) => ({ id: s.id, label: `${s.step} · ${s.id}`, state: "done", tone: STAGE_TONES[i % STAGE_TONES.length] }));

  return (
    <DemoStack>
      <DemoGroup title="Animating → complete" hint="Start a mock upload; the fill animates, then swaps tone and label when done.">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
          <Specimen label={complete ? "complete" : running ? "animating" : value > 0 ? "paused" : "idle"}>
            <div className="flex flex-col gap-4">
              <ProgressBar
                value={value}
                size="md"
                tone={complete ? "grn" : "ink"}
                label={complete ? "agents-tools-7d-2026-10-02.csv uploaded" : "Uploading agents-tools-7d-2026-10-02.csv"}
                valueText={complete ? "Complete" : `${value}%`}
              />
              <div className="flex flex-wrap items-center gap-2">
                {complete ? (
                  <Button size="sm" leadingIcon={<RotateCcw />} onClick={reset}>
                    Run again
                  </Button>
                ) : (
                  <Button size="sm" leadingIcon={running ? <Pause /> : <Play />} onClick={() => setRunning((r) => !r)}>
                    {running ? "Pause" : value > 0 ? "Resume" : "Start upload"}
                  </Button>
                )}
                {value > 0 && !complete ? (
                  <Button size="sm" variant="subtle" onClick={reset}>
                    Reset
                  </Button>
                ) : null}
                <span role="status" className="inline-flex items-center gap-1.5 text-[12px] text-grn">
                  {complete ? (
                    <>
                      <Check aria-hidden="true" className="size-3.5" /> {formatBytes(UPLOAD_BYTES)} uploaded
                    </>
                  ) : null}
                </span>
              </div>
            </div>
          </Specimen>
          <Specimen label="ring arc · same run" bodyClassName="flex items-center gap-4">
            <ProgressRing value={value} size={56} stroke={4} tone={complete ? "cyn" : "blu"} label="Upload" center={complete ? <Check className="size-4 text-cyn" /> : undefined} />
            <div className="min-w-0 text-[12.5px]">
              <p className="tabular-nums text-ink">
                {formatBytes((UPLOAD_BYTES * value) / 100)} of {formatBytes(UPLOAD_BYTES)}
              </p>
              <p className="text-ink-dim">{complete ? "Complete: the arc turns cyan" : "The arc grows from 12 o'clock"}</p>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Linear" hint="Readouts are mock data.">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="determinate · readouts">
            <div className="flex flex-col gap-4">
              <ProgressBar value={64} tone="grn" label="Share synced" />
              <ProgressBar
                value={ops.usage.disk.used}
                max={ops.usage.disk.total}
                label={`Disk · ${ops.name}`}
                valueText={`${formatBytes(ops.usage.disk.used)} of ${formatBytes(ops.usage.disk.total)}`}
              />
              <ProgressBar value={billing.usage.cpu.used} max={billing.usage.cpu.total} label={`CPU · ${billing.name}`} />
            </div>
          </Specimen>
          <Specimen label="track sizes · xs 3px to lg 8px">
            <div className="flex flex-col gap-3.5">
              {(["xs", "sm", "md", "lg"] as const).map((s, i) => (
                <ProgressBar key={s} value={[22, 48, 71, 93][i]} size={s} tone={(["blu", "cyn", "grn", "org"] as const)[i]} aria-label={`Size ${s}`} showValue={false} />
              ))}
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Indeterminate" hint="When the amount of work is unknown: cloning, connecting.">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="clone sliver · 3px by 120px">
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 items-center gap-3 text-[12.5px]">
                <span className="min-w-0 flex-1 truncate font-mono text-ink">galileo</span>
                <span className="text-ink-faint">cloning</span>
                <Sliver label="Cloning galileo" />
              </div>
              <div className="flex min-w-0 items-center gap-3 text-[12.5px]">
                <span className="min-w-0 flex-1 truncate font-mono text-ink">research-notes</span>
                <span className="text-ink-faint">fetching</span>
                <Sliver label="Fetching research-notes" tone="blu" />
              </div>
            </div>
          </Specimen>
          <Specimen label="full width sweep">
            <ProgressBar indeterminate label="Connecting to Google Drive…" tone="blu" />
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Segmented stage">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label={`deploy · ${SPACES[3].name} · in progress`}>
            <StageBar label="Deploy" stages={DEPLOY_PIPELINE.stages.map(toStage)} />
          </Specimen>
          <Specimen label="deploy · failed at Start">
            <StageBar label={DEPLOY_PIPELINE_FAILED.failure.title} stages={DEPLOY_PIPELINE_FAILED.stages.map(toStage)} valueText="Stopped at 04" />
          </Specimen>
          <Specimen label="rollout card · 4 segments">
            <StageBar label="xo-space rollout" stages={rollout} valueText={`${PROJECT_STAGES.length} · ${PROJECT_STAGES[PROJECT_STAGES.length - 1].id}`} />
          </Specimen>
          <Specimen label="segmented track · stage header dots">
            <div className="flex flex-col gap-4">
              <ProgressBar value={2} max={5} segments={5} tone="blu" label="Stages" valueText="02 / 05" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StageDots total={5} current={2} label="Expedition" />
                <Caption>02 / 05</Caption>
                <StageDots total={3} current={1} tone="grn" label="Bodies landed" />
                <Caption>1 / 3 bodies landed</Caption>
              </div>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Ring arc" hint="Counts are illustrative.">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          <figure className="m-0 flex items-center gap-3">
            <ProgressRing value={2} max={5} label="Atoms charted" />
            <figcaption className="text-[12px] text-ink-dim">02 / 05 atoms charted</figcaption>
          </figure>
          <figure className="m-0 flex items-center gap-3">
            <ProgressRing value={1} max={3} tone="grn" label="Bodies landed" />
            <figcaption className="text-[12px] text-ink-dim">1 / 3 bodies landed</figcaption>
          </figure>
          <figure className="m-0 flex items-center gap-3">
            <ProgressRing value={3} max={9} tone="org" size={40} label="Demo mission" valueText="03 / 9" center="3/9" />
            <figcaption className="text-[12px] text-ink-dim">Demo 03 / 9 · 300 pts</figcaption>
          </figure>
          <figure className="m-0 flex items-center gap-3">
            <ProgressRing value={100} tone="cyn" label="Expedition complete" center={<Check className="size-3 text-cyn" />} />
            <figcaption className="text-[12px] text-ink-dim">Complete</figcaption>
          </figure>
          <figure className="m-0 flex items-center gap-3">
            <ProgressRing value={null} label="Share synced" />
            <figcaption className="text-[12px] text-ink-faint">Unavailable</figcaption>
          </figure>
        </div>
      </DemoGroup>
    </DemoStack>
  );
}
