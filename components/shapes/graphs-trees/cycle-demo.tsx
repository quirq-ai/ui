"use client";

import { IMPROVEMENT_LOOP } from "@/lib/fixtures";
import { CycleDiagram, type CycleStage } from "./cycle-diagram";
import { DemoCell } from "./parts";

const TAGLINE = "Start simply. Understand the work. Improve the space.";

/** Stage status is illustrative: it shows the pattern, not a release state. */
const START_LOOP: CycleStage[] = [
  { id: "start", label: "Start", note: "Can I get my agent work running?", status: "Working", tone: "blu" },
  { id: "work", label: "Work", note: "Can it complete my actual task?", status: "Working", tone: "grn" },
  { id: "measure", label: "Measure", note: "What work happened, and how is it assessed?", status: "Under validation", tone: "org" },
  { id: "understand", label: "Understand", note: "What explains the result?", status: "Planned", tone: "pur" },
  { id: "improve", label: "Improve", note: "Did that change help?", status: "Planned", tone: "cyn" },
];

const SHORT_LOOP: CycleStage[] = [
  { id: "work", label: "Work", note: "Agents work in the space on the task.", tone: "grn" },
  { id: "measurement", label: "Measurement", note: "quirq measurement with its method; cost and time stay separate.", tone: "org" },
  { id: "interpretation", label: "Interpretation", note: "Connect the result to the workflow and the space configuration.", tone: "pur" },
  { id: "suggested", label: "Suggested change", note: "An untested idea is a suggested change, not yet an improvement.", tone: "yel" },
  { id: "checked", label: "Checked result", note: "Test the change under stated conditions and check the accepted result.", tone: "blu" },
  { id: "learning", label: "Retained learning", note: "Keep or reverse the change, and record what was learned.", tone: "cyn" },
];

const FOUNDATION_LOOP: CycleStage[] = [
  { id: "space", label: "Space", note: "Agents, projects, tools and context.", tone: "org" },
  { id: "work", label: "Work and output", note: "The work and its resulting output.", tone: "grn" },
  { id: "quirq", label: "quirq measurement", note: "Evidence and method, never a bare score.", tone: "pur" },
  { id: "study", label: "Study", note: "Study the result and identify a change.", tone: "blu" },
  { id: "test", label: "Test", note: "Test the change: check quality, cost and time.", tone: "cyn" },
  { id: "keep", label: "Keep or reverse", note: "Keep or reverse it, and record what was learned.", tone: "yel" },
];

const QUIRQ_LOOP: CycleStage[] = IMPROVEMENT_LOOP.map((s) => ({ id: s.id, label: s.label, note: s.detail, tone: s.color }));

export function CycleDiagramDemo() {
  return (
    <div className="grid gap-x-8 gap-y-10 xl:grid-cols-2">
      <DemoCell caption="Variant · start to improve · state: active stage" note="Hover or focus a stage · stage status is illustrative">
        <CycleDiagram stages={START_LOOP} tagline={TAGLINE} defaultActive="measure" ariaLabel="Start, work, measure, understand, improve" />
      </DemoCell>
      <DemoCell caption="Variant · foundation loop" note="XO leads into the space; the loop returns with the next configuration">
        <CycleDiagram
          stages={FOUNDATION_LOOP}
          tagline={TAGLINE}
          entry={{ label: "XO", sub: "Set up, deploy and manage" }}
          ariaLabel="Foundation loop from XO through the space to keep or reverse"
        />
      </DemoCell>
      <DemoCell caption="Variant · short loop" note="An untested idea is labeled a suggested change">
        <CycleDiagram stages={SHORT_LOOP} tagline="Work, measure, interpret, change, check, learn." ariaLabel="Short improvement loop" />
      </DemoCell>
      <DemoCell caption="State · static · quirq minting loop" note="Minted Q = V · B">
        <CycleDiagram stages={QUIRQ_LOOP} tagline="Verified work mints quirqs." returnLabel="next run" static ariaLabel="quirq minting loop" />
      </DemoCell>
    </div>
  );
}
