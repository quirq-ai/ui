"use client";

// Live demo for the button set: every variant in context, sizes 28 to 40, the hover, focus,
// disabled and busy states, and three busy flows that prove a second click is swallowed.
import { useCallback, useState } from "react";
import { Check, Download, GitBranch, Play, RotateCcw, Save, Square, Trash2 } from "lucide-react";
import { StateChip } from "@/components/ui/status";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { JOBS, PROJECT_BY_ID, SPACE_BY_ID, SPACE_STATUS_META } from "@/lib/fixtures";
import { formatDuration, formatNumber } from "@/lib/format";
import { ActionButton, useBusyAction } from "./button-set";
import { Caption, DemoSection, DemoStack, Specimen, Stage, Still } from "./demo-kit";

/** Resolves after ms; stands in for a request. */
function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function ButtonSetDemo() {
  return (
    <DemoStack>
      <DemoSection title="Variants">
        <Specimen label="Primary · ink fill">
          <ActionButton variant="primary" leadingIcon={<Play />}>
            Start space
          </ActionButton>
          <ActionButton variant="primary" leadingIcon={<Save />}>
            Save agent
          </ActionButton>
        </Specimen>
        <Specimen label="Outline">
          <ActionButton leadingIcon={<GitBranch />}>Clone project</ActionButton>
          <ActionButton>Poll now</ActionButton>
        </Specimen>
        <Specimen label="Ghost">
          <ActionButton variant="ghost">Results</ActionButton>
          <ActionButton variant="ghost">Edit</ActionButton>
        </Specimen>
        <Specimen label="Danger · red tint">
          <ActionButton variant="danger" leadingIcon={<Trash2 />}>
            Delete
          </ActionButton>
          <ActionButton variant="danger" leadingIcon={<Square />}>
            Stop space
          </ActionButton>
        </Specimen>
        <Specimen label="Warning · restart">
          <ActionButton variant="warning" leadingIcon={<RotateCcw />}>
            Restart server
          </ActionButton>
        </Specimen>
        <Specimen label="Text">
          <ActionButton variant="text">Refresh</ActionButton>
          <ActionButton variant="text">Use the snapshot folder picker</ActionButton>
        </Specimen>
        <Specimen label="Outline sm · Export CSV">
          <ActionButton size="sm" leadingIcon={<Download />}>
            Export CSV
          </ActionButton>
          <ActionButton size="sm" variant="primary">
            Turn on here
          </ActionButton>
        </Specimen>
        <Specimen label="iOS · 48px pill" className="sm:col-span-2" layout="block">
          <PhoneSheet />
        </Specimen>
      </DemoSection>

      <DemoSection title="Sizes · 28 · 32 · 40" cols={3}>
        {(["sm", "md", "lg"] as const).map((size) => (
          <Specimen key={size} label={`${size} · ${size === "sm" ? 28 : size === "md" ? 32 : 40}px`}>
            <ActionButton size={size} variant="primary" leadingIcon={<Play />}>
              Run now
            </ActionButton>
            <ActionButton size={size}>Results</ActionButton>
          </Specimen>
        ))}
      </DemoSection>

      <DemoSection title="States" cols={4}>
        <Specimen label="Default">
          <ActionButton variant="primary">Apply 2 commits</ActionButton>
        </Specimen>
        <Specimen label="Hover">
          <Still>
            <ActionButton variant="primary" preview="hover">
              Apply 2 commits
            </ActionButton>
            <ActionButton preview="hover">Results</ActionButton>
          </Still>
        </Specimen>
        <Specimen label="Focus · 2px ink ring">
          <Still>
            <ActionButton variant="primary" preview="focus">
              Apply 2 commits
            </ActionButton>
          </Still>
        </Specimen>
        <Specimen label="Disabled · .45">
          <ActionButton variant="primary" disabled>
            Apply 2 commits
          </ActionButton>
          <ActionButton variant="danger" disabled>
            Delete
          </ActionButton>
        </Specimen>
        <Specimen label="Busy · label swap" className="sm:col-span-2 lg:col-span-4">
          <ActionButton variant="primary" busy busyLabel="Starting…">
            Start space
          </ActionButton>
          <ActionButton busy busyLabel="Polling…">
            Poll now
          </ActionButton>
          <ActionButton variant="warning" busy busyLabel="Restarting…">
            Restart server
          </ActionButton>
          <ActionButton variant="danger" busy busyLabel="Deleting…">
            Delete
          </ActionButton>
        </Specimen>
      </DemoSection>

      <DemoSection title="Busy blocks double submit · click fast">
        <Specimen label="Space lifecycle" layout="block">
          <SpaceControl />
        </Specimen>
        <Specimen label="Job · run now" layout="block">
          <JobRunner />
        </Specimen>
        <Specimen label="Apply commits" layout="block">
          <ApplyCommits />
        </Specimen>
      </DemoSection>
    </DemoStack>
  );
}

/* ----------------------------------------------------------------------------- pieces */

function Tally({ sent, ignored }: { sent: number; ignored: number }) {
  return (
    <p role="status" aria-live="polite" className="mt-3 border-t border-hair-soft pt-3 font-mono text-[11px] text-ink-faint">
      <span className="text-ink-dim">{formatNumber(sent)}</span> {sent === 1 ? "request" : "requests"} sent ·{" "}
      <span className={ignored ? "text-org" : "text-ink-dim"}>{formatNumber(ignored)}</span> {ignored === 1 ? "click" : "clicks"} ignored while busy
    </p>
  );
}

type Lifecycle = "stopped" | "starting" | "running" | "stopping";

function SpaceControl() {
  const space = SPACE_BY_ID["ws_c40e19aa"];
  const [state, setState] = useState<Lifecycle>("stopped");
  const [sent, setSent] = useState(0);
  const [ignored, setIgnored] = useState(0);

  const toggle = useCallback(async () => {
    setSent((n) => n + 1);
    if (state === "stopped") {
      setState("starting");
      await wait(1600);
      setState("running");
    } else {
      setState("stopping");
      await wait(1200);
      setState("stopped");
    }
  }, [state]);
  const { busy, run } = useBusyAction(toggle);
  const running = state === "running" || state === "stopping";

  return (
    <Stage>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{space.name}</p>
          <p className="truncate font-mono text-[11px] text-ink-faint">{space.host}</p>
        </div>
        <StateChip kind="space" state={state} />
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
        {SPACE_STATUS_META[state === "stopped" ? "Stopped" : state === "starting" ? "Starting" : state === "running" ? "Running" : "Stopping"].blurb}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {running ? (
          <ActionButton
            variant="danger"
            leadingIcon={<Square />}
            busy={busy}
            busyLabel="Stopping…"
            onBusyClick={() => setIgnored((n) => n + 1)}
            onClick={() => void run()}
          >
            Stop space
          </ActionButton>
        ) : (
          <ActionButton
            variant="primary"
            leadingIcon={<Play />}
            busy={busy}
            busyLabel="Starting…"
            onBusyClick={() => setIgnored((n) => n + 1)}
            onClick={() => void run()}
          >
            Start space
          </ActionButton>
        )}
        <ActionButton variant="ghost" disabled={!running || busy}>
          Open space
        </ActionButton>
      </div>
      <Tally sent={sent} ignored={ignored} />
    </Stage>
  );
}

function JobRunner() {
  const job = JOBS.find((j) => j.id === "job_nightly") ?? JOBS[0];
  const [runs, setRuns] = useState(0);
  const [ignored, setIgnored] = useState(0);
  const [last, setLast] = useState<string | null>(null);

  const start = useCallback(async () => {
    setRuns((n) => n + 1);
    await wait(1400);
    setLast(`Succeeded · ${formatDuration(41.2)} · exit 0`);
  }, []);
  const { busy, run } = useBusyAction(start);

  return (
    <Stage>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{job.name}</p>
          <p className="truncate font-mono text-[11px] text-ink-faint">{job.command.join(" ")}</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-ink-faint">{job.schedule}</span>
      </div>
      <p className="mt-2 text-[12px] text-ink-faint">
        {busy ? (
          <span className="text-blu">Running now…</span>
        ) : last ? (
          <span className="inline-flex items-center gap-1.5 text-grn">
            <Check aria-hidden="true" className="size-3.5" />
            {last}
          </span>
        ) : (
          <>Next run {job.nextRun ?? "Unavailable"}</>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton variant="primary" leadingIcon={<Play />} busy={busy} busyLabel="Running…" onBusyClick={() => setIgnored((n) => n + 1)} onClick={() => void run()}>
          Run now
        </ActionButton>
        <ActionButton variant="ghost">Results</ActionButton>
      </div>
      <Tally sent={runs} ignored={ignored} />
    </Stage>
  );
}

function ApplyCommits() {
  const project = PROJECT_BY_ID["xo-space"];
  const [applied, setApplied] = useState(false);
  const [sent, setSent] = useState(0);
  const [ignored, setIgnored] = useState(0);

  const apply = useCallback(async () => {
    setSent((n) => n + 1);
    await wait(1500);
    setApplied(true);
  }, []);
  const { busy, run } = useBusyAction(apply);

  return (
    <Stage>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <RuntimeLogo id="github" size={18} tile />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold">{project.displayName}</p>
            <p className="truncate font-mono text-[11px] text-ink-faint">{project.branch}</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-ink-faint">
        {applied ? <span className="text-grn">Applied 2 commits to {project.github?.defaultBranch ?? "main"}.</span> : "2 commits from a peer are ready to apply."}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {applied ? (
          <ActionButton variant="text" onClick={() => setApplied(false)}>
            Reset sample
          </ActionButton>
        ) : (
          <ActionButton variant="primary" busy={busy} busyLabel="Applying…" onBusyClick={() => setIgnored((n) => n + 1)} onClick={() => void run()}>
            Apply 2 commits
          </ActionButton>
        )}
      </div>
      <Tally sent={sent} ignored={ignored} />
    </Stage>
  );
}

function PhoneSheet() {
  const space = SPACE_BY_ID["ws_7f3a9c21e4b0"];
  const [choice, setChoice] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
      <div className="w-full max-w-[320px] rounded-[28px] border border-hair-strong bg-[#0a0a0b] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
        <div className="px-2 pb-1">
          <StateChip kind="space" state="running" prefix="Hosted space" variant="plain" />
          <p className="mt-2 text-[19px] font-semibold tracking-[-0.01em]">{space.name}</p>
          <p className="text-[13px] text-ink-faint">Stops in {space.stopsIn ?? "Unavailable"}</p>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <ActionButton variant="ios" block onClick={() => setChoice("Open space")}>
            Open space
          </ActionButton>
          <ActionButton variant="ios-secondary" block onClick={() => setChoice("Not now")}>
            Not now
          </ActionButton>
        </div>
      </div>
      <div className="flex min-w-[180px] flex-1 flex-col gap-3 pt-1">
        <p className="max-w-[34ch] text-[12.5px] leading-relaxed text-ink-dim">
          The phone pair is a fixed 48px: the primary in ink, the secondary on a raised grey. Both stretch to the sheet.
        </p>
        <div>
          <Caption>Tapped</Caption>
          <p role="status" className="mt-1 font-mono text-[12px] text-ink-dim">
            {choice ?? "Nothing yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
