// Demo for the pipeline and stage stepper shape: deploy pipelines (landing rail, a space
// starting, a space that could not start), the visualizer operating state and the XO
// improvement loop. Static snapshots: steppers have no interactions.
import {
  ACTIVITY,
  DEPLOY_PIPELINE,
  DEPLOY_PIPELINE_FAILED,
  IMPROVEMENT_LOOP,
  PROJECT_BY_ID,
  PROJECT_STAGES,
  SPACE_BY_ID,
  TODOS,
  type PipelineStage,
  type PipelineStatus,
  type Project,
} from "@/lib/fixtures";
import { plural } from "@/lib/format";
import { Badge, Panel, StateChip, StatusDot } from "@/components/ui";
import {
  CycleStepper,
  LoopChips,
  OperatingStateStepper,
  PipelineStepper,
  RailDot,
  StageFlow,
  type CycleStage,
  type FlowStage,
  type LoopChip,
  type OperatingStage,
  type PipelineStep,
  type StepStatus,
} from "./pipeline-stepper";
import { Caption, DemoCell, DemoGroup } from "./shared";

/* ----------------------------------------------------------------------------- data */

/** Landing "Production-ready" tile, quoted as shipped. A static snapshot. */
const LANDING_STEPS: PipelineStep[] = [
  { id: "merge", label: "Merged to main", status: "done" },
  { id: "push", label: "Pushed to GHCR", status: "done" },
  { id: "promote", label: "Promoted to :stable", status: "done" },
  { id: "update", label: "Updating environment", status: "active" },
  { id: "heartbeat", label: "Listen for heartbeat", status: "pending" },
];

const STATUS_FROM: Record<PipelineStatus, StepStatus> = {
  completed: "done",
  in_progress: "active",
  pending: "pending",
  failed: "failed",
  skipped: "skipped",
};

function fromStages(stages: PipelineStage[]): PipelineStep[] {
  return stages.map((s) => ({ id: s.id, label: s.label, detail: s.detail, meta: s.duration ?? undefined, status: STATUS_FROM[s.status] }));
}

const DEPLOY_SPACE = SPACE_BY_ID[DEPLOY_PIPELINE.spaceId];

function operatingStages(p: Project): OperatingStage[] {
  const reachedIndex = PROJECT_STAGES.findIndex((s) => s.id === p.stage);
  const steps = TODOS.filter((t) => t.projectId === p.id);
  const completed = steps.filter((t) => t.status === "completed").length;
  const active = steps.filter((t) => t.status === "in_progress").length;
  const fileEvents = ACTIVITY.filter((e) => e.projectId === p.id && e.type === "file.edited").length;
  const details: Record<string, string> = {
    Foundation: "Identity and project context are available.",
    Capture: `${p.sessions} ${plural(p.sessions, "session")} and ${steps.length} ${plural(steps.length, "step")} are recorded.`,
    Generate: `${fileEvents} recent file ${plural(fileEvents, "event")} and ${completed} completed ${plural(completed, "step")}.`,
    Orchestrate: `${p.openSessions} open ${plural(p.openSessions, "session")} and ${active} active ${plural(active, "step")}.`,
  };
  return PROJECT_STAGES.map((s, i) => ({ id: s.id, title: s.id, detail: details[s.id], reached: i <= reachedIndex }));
}

const OPERATING_PROJECTS = ["xo-space", "billing-api", "space-drift"].map((id) => PROJECT_BY_ID[id]);

/** Strategy table from the XO foundation brief. Stage status is illustrative. */
const FLOW: FlowStage[] = [
  { id: "start", name: "Start", question: "Can I get my agent work running?", state: "working" },
  { id: "work", name: "Work", question: "Can it complete my actual task?", state: "working" },
  { id: "measure", name: "Measure", question: "What work happened, and how is it assessed?", state: "validating" },
  { id: "understand", name: "Understand", question: "What explains the result?", state: "planned" },
  { id: "improve", name: "Improve", question: "Did that change help?", state: "planned" },
];

const SHORT_LOOP: LoopChip[] = [
  { id: "work", label: "Work" },
  { id: "measurement", label: "Measurement" },
  { id: "interpretation", label: "Interpretation" },
  { id: "suggested", label: "Suggested change", emphasis: "untested" },
  { id: "checked", label: "Checked result" },
  { id: "retained", label: "Retained learning", emphasis: "tested" },
];

const CYCLE_STATUS: Record<string, CycleStage["status"]> = {
  budget: "done",
  run: "done",
  snapshot: "done",
  verify: "active",
  mint: "pending",
  improve: "pending",
};

const CYCLE: CycleStage[] = IMPROVEMENT_LOOP.map((s) => ({ id: s.id, label: s.label, detail: s.detail, color: s.color, status: CYCLE_STATUS[s.id] ?? "pending" }));

const LEGEND: { status: StepStatus; label: string }[] = [
  { status: "done", label: "Done" },
  { status: "active", label: "Active" },
  { status: "pending", label: "Pending" },
];

/* ----------------------------------------------------------------------------- demo */

export function PipelineStepperDemo() {
  return (
    <div className="flex min-w-0 flex-col gap-12">
      <DemoGroup title="Deploy pipeline" note="Done, active and pending, plus the failed run · Mock data">
        <div className="grid gap-6 lg:grid-cols-3">
          <DemoCell caption="Rail · landing tile · static snapshot">
            <div className="glass flex flex-col overflow-hidden px-[22px] pb-[22px] pt-6">
              <h4 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">Production-ready</h4>
              <p className="mt-2 text-[14px] leading-[1.45] text-white/55">Deploy direct to AWS, GCP, Azure or any Terraform compatible stack.</p>
              <PipelineStepper variant="rail" steps={LANDING_STEPS} aria-label="Deploy pipeline" className="mt-6" />
            </div>
          </DemoCell>

          <DemoCell caption="List · space starting">
            <Panel variant="soft" padding="md" className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[14px] font-semibold text-ink">{DEPLOY_SPACE.name}</p>
                  <p className="m-0 mt-0.5 truncate font-mono text-[11px] text-ink-faint">{DEPLOY_SPACE.id}</p>
                </div>
                <StateChip kind="space" state="starting" />
              </div>
              <PipelineStepper steps={fromStages(DEPLOY_PIPELINE.stages)} aria-label={`Start ${DEPLOY_SPACE.name}`} />
            </Panel>
          </DemoCell>

          <DemoCell caption="List · space could not start">
            <Panel variant="soft" padding="md" className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[14px] font-semibold text-ink">{DEPLOY_SPACE.name}</p>
                  <p className="m-0 mt-0.5 truncate font-mono text-[11px] text-ink-faint">{DEPLOY_SPACE.id}</p>
                </div>
                <StateChip kind="space" state="failed" />
              </div>
              <PipelineStepper steps={fromStages(DEPLOY_PIPELINE_FAILED.stages)} aria-label={`Failed start of ${DEPLOY_SPACE.name}`} />
              <div className="rounded-[10px] border border-red/30 bg-red/[0.06] p-3">
                <p className="m-0 text-[12.5px] font-medium text-[#ff7a70]">{DEPLOY_PIPELINE_FAILED.failure.title}</p>
                <p className="m-0 mt-1 text-[12px] leading-relaxed text-ink-dim">{DEPLOY_PIPELINE_FAILED.failure.body}</p>
              </div>
            </Panel>
          </DemoCell>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Caption>States</Caption>
          {LEGEND.map((l) => (
            <span key={l.status} className="inline-flex items-center gap-2 text-[12px] text-ink-dim">
              <RailDot status={l.status} />
              {l.label}
            </span>
          ))}
        </div>
      </DemoGroup>

      <DemoGroup title="Operating state" note="Projects visualizer · reached stages fill, the rest stay hollow · Mock data">
        <div className="grid gap-6 md:grid-cols-3">
          {OPERATING_PROJECTS.map((p) => {
            const step = PROJECT_STAGES.find((s) => s.id === p.stage)?.step ?? 1;
            return (
              <DemoCell key={p.id} caption={`${p.displayName} · reached ${p.stage}`}>
                <Panel variant="soft" padding="md">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hair px-2 py-0.5 text-[11px] text-ink-dim">
                      <StatusDot status={p.lane === "Live agent" ? "up" : p.lane === "Agent-assisted" ? "busy" : "idle"} size="xs" />
                      {p.lane}
                    </span>
                    <Badge size="sm" mono>
                      {step} · {p.stage}
                    </Badge>
                  </div>
                  <p className="m-0 mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">Current operating state</p>
                  <OperatingStateStepper stages={operatingStages(p)} aria-label={`${p.displayName} operating state`} />
                </Panel>
              </DemoCell>
            );
          })}
        </div>
      </DemoGroup>

      <DemoGroup title="Improvement loop" note="Stage status is illustrative, not a validated claim">
        <div className="flex flex-col gap-8">
          <DemoCell caption="Start → Work → Measure → Understand → Improve">
            <Panel variant="soft" padding="md">
              <p className="m-0 mb-4 text-[17px] font-semibold tracking-[-0.015em] text-ink">
                Start simply. <span className="text-ink-dim">Understand the work. Improve the space.</span>
              </p>
              <StageFlow stages={FLOW} aria-label="How a space improves" />
            </Panel>
          </DemoCell>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <DemoCell caption="Short loop">
              <Panel variant="soft" padding="md" className="flex flex-col gap-4">
                <LoopChips items={SHORT_LOOP} aria-label="Short improvement loop" />
                <p className="m-0 text-[12px] leading-relaxed text-ink-faint">
                  Untested ideas read <span className="text-org">Suggested change</span>. A change is called an Improvement only after its check passed and the
                  result was kept.
                </p>
              </Panel>
            </DemoCell>
            <DemoCell caption="quirq loop · illustrative position">
              <Panel variant="soft" padding="md">
                <CycleStepper
                  stages={CYCLE}
                  aria-label="quirq improvement loop"
                  center={
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-[15px] text-ink">Q = V · B</span>
                      <span className="text-[11px] leading-tight text-ink-faint">Minted quirqs</span>
                      <Badge tone="org" size="xs" mono className="mt-1">
                        Illustrative
                      </Badge>
                    </div>
                  }
                />
              </Panel>
            </DemoCell>
          </div>
        </div>
      </DemoGroup>
    </div>
  );
}
