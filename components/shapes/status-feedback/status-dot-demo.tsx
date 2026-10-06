"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusDot, StatusPill, type DotStatus } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { IconButton, ButtonGroup } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { DEPLOY_PIPELINE, GALILEO, GALILEO_SOURCES, SPACES, type GalileoSource } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack, Specimen } from "./parts";
import {
  ConnectionPill,
  DotMeter,
  DotTip,
  LivePip,
  PresenceLine,
  SPACE_LIFECYCLE,
  SpaceStatusPill,
  StepDot,
  type SpaceApiState,
  type SpaceLifecycle,
  type StepState,
} from "./status-dot";

const DOT_WORDS: { status: DotStatus; word: string; detail: string }[] = [
  { status: "up", word: "up", detail: "Answering" },
  { status: "down", word: "down", detail: "Not answering" },
  { status: "idle", word: "idle", detail: "Off or unknown" },
  { status: "busy", word: "busy", detail: "Checking" },
  { status: "warn", word: "warn", detail: "Needs a person" },
];

const LIFECYCLE_ORDER: SpaceLifecycle[] = ["creating", "starting", "running", "stopping", "stopped", "failed", "unknown"];
const API_FOR: Record<SpaceLifecycle, SpaceApiState> = {
  creating: "unknown",
  starting: "unknown",
  running: "up",
  stopping: "down",
  stopped: "down",
  failed: "down",
  unknown: "unknown",
};

const toLifecycle = (s: string): SpaceLifecycle => s.toLowerCase() as SpaceLifecycle;
/* the fixture says "Unavailable" when the Space API was never reached: that reads as Unknown, not down */
const toApi = (s: "Up" | "Down" | "Unavailable"): SpaceApiState => (s === "Up" ? "up" : s === "Down" ? "down" : "unknown");
/* galileo words: a port answers or not; a files source is found or missing */
const sourceWord = (s: GalileoSource) => (s.type === "port" ? (s.up ? "answering" : "not answering") : s.up ? "found" : "missing");

const STEP_STATE: Record<string, StepState> = { completed: "done", in_progress: "active", pending: "pending", failed: "pending", skipped: "pending" };

export function StatusDotDemo() {
  const [step, setStep] = useState(2);
  const [api, setApi] = useState<SpaceApiState>("up");
  const current = LIFECYCLE_ORDER[step];
  const go = (d: number) => {
    const next = (step + d + LIFECYCLE_ORDER.length) % LIFECYCLE_ORDER.length;
    setStep(next);
    setApi(API_FOR[LIFECYCLE_ORDER[next]]);
  };
  const ops = SPACES[0];

  return (
    <DemoStack>
      <DemoGroup title="Dot states" hint="6 to 8px dot, 3px halo. One looping pulse.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Specimen label="up · down · idle · busy · warn">
            <ul className="flex flex-col gap-2.5">
              {DOT_WORDS.map((d) => (
                <li key={d.status} className="flex items-center gap-2.5 text-[12.5px]">
                  <StatusDot status={d.status} size="md" />
                  <span className="w-10 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{d.word}</span>
                  <span className="text-ink-dim">{d.detail}</span>
                </li>
              ))}
            </ul>
          </Specimen>
          <Specimen label="pulse">
            <div className="flex flex-col items-start gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-org/35 px-[13px] py-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-org">
                <StatusDot tone="org" pulse size="sm" halo={false} />
                Proving Grounds
              </span>
              <LivePip>Live</LivePip>
              <LivePip tone="blu">Settling…</LivePip>
              <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-dim">
                <StatusDot status="busy" pulse />
                Sign-in pending
              </span>
            </div>
          </Specimen>
          <Specimen label="sizes · halo on and off">
            <div className="flex flex-col gap-3">
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <div key={size} className="flex items-center gap-3">
                  <span className="w-6 font-mono text-[10.5px] uppercase text-ink-faint">{size}</span>
                  <StatusDot status="up" size={size} />
                  <StatusDot status="down" size={size} />
                  <StatusDot status="idle" size={size} />
                  <span className="mx-1 h-3 w-px bg-hair" aria-hidden="true" />
                  <StatusDot status="up" size={size} halo={false} />
                  <StatusDot status="busy" size={size} halo={false} />
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="presence line">
            <div className="flex flex-col gap-2.5">
              <PresenceLine status="up" name="xo-space" detail="online" />
              <PresenceLine status="up" name={SPACES[1].name} detail={SPACES[1].status} />
              <PresenceLine status="busy" pulse name={SPACES[3].name} detail={SPACES[3].status} />
              <PresenceLine status="idle" name={SPACES[2].name} detail={SPACES[2].status} />
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Label pills" hint="Mono uppercase, hairline border, 11px.">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="LIVE / PARTIAL / OFFLINE pill">
            <div className="flex flex-wrap gap-2">
              <StatusPill status="up" label="Live" pulse />
              <StatusPill status="warn" label="Partial" />
              <StatusPill status="down" label="Offline" />
              <StatusPill status="idle" label="Connecting" />
              <StatusPill status="up" label="Running" detail="API: Up" mono={false} tinted size="md" />
            </div>
          </Specimen>
          <Specimen label="visualizer connection · space drift folder">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {(["connecting", "live", "partial", "offline"] as const).map((s) => (
                  <ConnectionPill key={s} state={s} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-ink-dim">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status="idle" size="xs" halo={false} />
                  No folder connected
                </span>
                <span className="inline-flex items-center gap-2 text-ink">
                  <StatusDot tone="cyn" size="xs" />
                  research-notes
                  <Badge variant="outline" mono size="xs">
                    Local only
                  </Badge>
                </span>
              </div>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Split status | API" hint="Hover or focus a pill to read what each half means.">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr]">
          <Specimen label="space header · step through the lifecycle">
            <div className="flex flex-col gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border border-hair-soft bg-s1 px-3 py-2.5">
                <span className="min-w-0 truncate font-mono text-[12.5px] text-ink">{ops.name}</span>
                <span className="text-[11.5px] text-ink-faint">Hosted space · {ops.provider}</span>
                <span className="ml-auto">
                  <SpaceStatusPill status={current} api={api} tipId="sd-live-pill-tip" />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonGroup attached aria-label="Step through the space lifecycle">
                  <IconButton aria-label="Previous state" variant="outline" size="sm" onClick={() => go(-1)}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton aria-label="Next state" variant="outline" size="sm" onClick={() => go(1)}>
                    <ChevronRight />
                  </IconButton>
                </ButtonGroup>
                <span className="font-mono text-[11px] tabular-nums text-ink-faint" aria-live="polite">
                  {String(step + 1).padStart(2, "0")} / {String(LIFECYCLE_ORDER.length).padStart(2, "0")} · {SPACE_LIFECYCLE[current].label}
                </span>
              </div>
              <Segmented
                size="sm"
                aria-label="Space API"
                value={api}
                onChange={setApi}
                options={[
                  { value: "up", label: "API up" },
                  { value: "down", label: "API down" },
                  { value: "unknown", label: "API unknown" },
                ]}
              />
              <p className="border-t border-hair-soft pt-3 text-[12px] leading-relaxed text-ink-dim">
                <span className="text-ink">{SPACE_LIFECYCLE[current].label}.</span> {SPACE_LIFECYCLE[current].hint}{" "}
                {current === "failed" ? "Your files are safe." : null}
              </p>
            </div>
          </Specimen>
          <Specimen label="every lifecycle state · compact, icons only" aside="Words live in the tooltip">
            {/* wide: the compact pill sits beside its full pill; narrow: compact pills get their own row */}
            <ul className="flex flex-col gap-2">
              {LIFECYCLE_ORDER.map((s) => (
                <li key={s} className="flex min-w-0 items-center justify-between gap-3">
                  <SpaceStatusPill status={s} api={API_FOR[s]} tipId={`sd-pill-${s}`} />
                  <span className="hidden sm:inline-flex">
                    <SpaceStatusPill status={s} api={API_FOR[s]} compact tipId={`sd-pill-c-${s}`} />
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-hair-soft pt-3 sm:hidden">
              <Caption>compact</Caption>
              <ul className="flex flex-wrap gap-2">
                {LIFECYCLE_ORDER.map((s) => (
                  <li key={s}>
                    <SpaceStatusPill status={s} api={API_FOR[s]} compact tipId={`sd-pill-n-${s}`} />
                  </li>
                ))}
              </ul>
            </div>
          </Specimen>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SPACES.map((s) => (
            <div key={s.id} className="flex min-w-0 flex-col gap-2 rounded-[12px] border border-hair-soft bg-s1 p-3">
              <div className="flex min-w-0 items-baseline justify-between gap-2">
                <span className="truncate font-mono text-[12px] text-ink">{s.name}</span>
                <span className="shrink-0 text-[11px] capitalize text-ink-faint">{s.deployment}</span>
              </div>
              <SpaceStatusPill status={toLifecycle(s.status)} api={toApi(s.apiStatus)} tipId={`sd-space-${s.id}`} />
            </div>
          ))}
        </div>
      </DemoGroup>

      <DemoGroup title="Meters and steps">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="difficulty ●○○ · dots are decorative, words carry meaning">
            <div className="flex flex-col gap-2.5">
              <DotMeter level={1}>No coding required</DotMeter>
              <DotMeter level={2}>Some technical setup</DotMeter>
              <DotMeter level={3} tone="org">
                Engineering team required
              </DotMeter>
            </div>
          </Specimen>
          <Specimen label="deploy step dots · done · active · pending">
            <ol className="flex min-w-0 items-start">
              {DEPLOY_PIPELINE.stages.map((st, i) => (
                <li key={st.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full items-center">
                    <span className={i === 0 ? "flex-1" : "h-px flex-1 bg-hair-strong"} aria-hidden="true" />
                    <StepDot state={STEP_STATE[st.status]} index={i + 1} label={st.label} />
                    <span className={i === DEPLOY_PIPELINE.stages.length - 1 ? "flex-1" : "h-px flex-1 bg-hair-strong"} aria-hidden="true" />
                  </div>
                  <span className="max-w-full truncate text-[10.5px] text-ink-dim">{st.label}</span>
                </li>
              ))}
            </ol>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="galileo source rows" hint={`Rechecked every 5 s on ${GALILEO.origin.replace("http://", "")}. Hover or focus a dot.`}>
        <ul className="grid gap-x-6 rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-1 md:grid-cols-2">
          {GALILEO_SOURCES.map((s) => (
            <li key={s.name} className="flex min-w-0 items-center gap-2.5 border-b border-hair-soft py-2 last:border-b-0">
              <DotTip
                status={s.up ? "up" : "down"}
                label={`${s.name}: ${sourceWord(s)}`}
                id={`sd-src-${s.name}`}
                tip={`${s.detail} · checked ${s.checkedAgo}`}
              />
              <span className="min-w-0 truncate font-mono text-[12px] text-ink">{s.name}</span>
              <span className="min-w-0 truncate text-[11.5px] text-ink-faint">
                {s.type === "port" ? `port ${s.port}` : s.kind === "file" ? "file" : "folder"}
              </span>
              <span className={s.up ? "ml-auto shrink-0 text-[11.5px] text-ink-dim" : "ml-auto shrink-0 text-[11.5px] text-red"}>
                {sourceWord(s)}
              </span>
            </li>
          ))}
        </ul>
      </DemoGroup>
    </DemoStack>
  );
}
