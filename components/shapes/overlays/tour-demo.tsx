"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ChartColumn,
  Folder,
  FolderKanban,
  GitPullRequest,
  Hash,
  Inbox,
  KeyRound,
  LayoutGrid,
  NotebookPen,
  RotateCcw,
  SquareKanban,
  SquareTerminal,
  Telescope,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { PHONE_APPS, SPACES } from "@/lib/fixtures";
import { Spotlight, TargetMarker, TourCard, type MarkerState, type SpotRect } from "./tour";
import { DemoSection, DemoStatus, Example, FauxSpace } from "./demo-kit";

/* ----------------------------------------------------------------------------- phone tour */

const W = 300;
const H = 600;
const DOCK_TOP = H - 16 - 72;
const SLOT = 67;

const APP_ICONS: Record<string, ReactNode> = {
  SquareTerminal: <SquareTerminal />,
  Telescope: <Telescope />,
  GitPullRequest: <GitPullRequest />,
  SquareKanban: <SquareKanban />,
  Hash: <Hash />,
  NotebookPen: <NotebookPen />,
  Inbox: <Inbox />,
  ChartColumn: <ChartColumn />,
  FolderKanban: <FolderKanban />,
};
const GRID_APPS = PHONE_APPS.filter((a) => APP_ICONS[a.glyph] && a.id !== "usage").slice(0, 8);

const DOCK = [
  { id: "overview", label: "Overview", icon: <LayoutGrid /> },
  { id: "files", label: "Files", icon: <Folder /> },
  { id: "secrets", label: "Secrets", icon: <KeyRound /> },
  { id: "usage", label: "Usage", icon: <ChartColumn /> },
];

type Step = { title: string; text: string; spot: SpotRect | null; radius?: number; card: "below" | "above" | "center"; dock?: number };

const STEPS: Step[] = [
  {
    title: "Apps and integrations",
    text: "Launch apps like Terminal and VS Code, connect AI providers and data sources, and install skills for your agent.",
    spot: { top: 86, left: 6, width: W - 12, height: 250 },
    radius: 28,
    card: "below",
  },
  ...DOCK.map((d, i) => ({
    title: d.label,
    text: [
      "See and manage this space's settings, models and channels.",
      "Upload, browse and manage files your agent can use.",
      "Store API keys and environment variables for your agent.",
      "Track token usage, compute and cost in one place.",
    ][i],
    spot: { top: DOCK_TOP + 4, left: 16 + SLOT * i + 4, width: SLOT - 8, height: 64 },
    radius: 16,
    card: "above" as const,
    dock: i,
  })),
  { title: "You're ready", text: "Your agent is ready. Connect more tools, or change this space any time.", spot: null, card: "center" },
];

type TourState = number | "finished" | "skipped";

function PhoneTour() {
  const titleId = useId();
  const nextId = useId();
  const restartId = useId();
  const moved = useRef(false);
  const [state, setState] = useState<TourState>(0);
  const step = typeof state === "number" ? STEPS[state] : null;
  const space = SPACES.find((s) => s.name === "research-lab")!;

  // After a step change, focus Next; after skip or finish, focus Restart. Never on first paint.
  useEffect(() => {
    if (!moved.current) return;
    document.getElementById(typeof state === "number" ? nextId : restartId)?.focus({ preventScroll: true });
  }, [state, nextId, restartId]);

  const go = (to: TourState) => {
    moved.current = true;
    setState(to);
  };

  const cardStyle = (s: Step): CSSProperties => {
    if (s.card === "below") return { top: (s.spot?.top ?? 0) + (s.spot?.height ?? 0) + 12, left: 10 };
    if (s.card === "above") return { bottom: H - DOCK_TOP + 12, left: 10 };
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  };
  const arrowFor = (s: Step) =>
    s.card === "below" ? { side: "top" as const, offset: 140 } : s.card === "above" && s.dock !== undefined ? { side: "bottom" as const, offset: 16 + SLOT * s.dock + SLOT / 2 - 10 } : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="max-w-full overflow-x-auto scroll-thin">
        <div
          className="relative shrink-0 overflow-hidden rounded-[42px] border border-hair-strong bg-[#050506] shadow-[inset_0_0_0_6px_#111113]"
          style={{ width: W, height: H }}
          onKeyDown={(e) => {
            if (typeof state !== "number") return;
            if (e.key === "Escape") {
              e.stopPropagation();
              go("skipped");
            } else if (e.key === "ArrowRight" && state < STEPS.length - 1) go(state + 1);
            else if (e.key === "ArrowLeft" && state > 0) go(state - 1);
          }}
        >
          {/* screen */}
          <div aria-hidden={step ? true : undefined}>
            <div className="flex h-9 items-end justify-between px-8 pb-1 font-mono text-[11px] text-ink-dim">
              <span>09:30</span>
              <span>5G</span>
            </div>
            <div className="flex items-center justify-between px-5 pt-2">
              <div>
                <p className="text-[11px] text-ink-faint">Space</p>
                <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{space.name}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-grn/30 bg-grn/10 px-2 py-0.5 text-[11px] text-grn">
                <span className="size-1.5 rounded-full bg-grn" />
                {space.status}
              </span>
            </div>
            <div className="absolute rounded-[24px] bg-white/[0.035] p-3" style={{ top: 92, left: 12, width: W - 24, height: 238 }}>
              <p className="mb-3 px-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">Apps and integrations</p>
              <div className="grid grid-cols-4 gap-x-2 gap-y-3">
                {GRID_APPS.map((a) => (
                  <div key={a.id} className="flex flex-col items-center gap-1">
                    <span
                      className="relative grid size-12 place-items-center rounded-[14px] border border-hair bg-s3 [&_svg]:size-5"
                      style={{ color: `var(--${a.color})` }}
                    >
                      {APP_ICONS[a.glyph]}
                      {a.badge ? (
                        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 font-mono text-[9px] font-semibold text-black">{a.badge}</span>
                      ) : null}
                    </span>
                    <span className="max-w-full truncate text-[10px] text-ink-dim">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute flex gap-1.5" style={{ top: 344, left: "50%", transform: "translateX(-50%)" }}>
              <span className="size-1.5 rounded-full bg-ink" />
              <span className="size-1.5 rounded-full bg-white/25" />
            </div>
            <div className="absolute flex rounded-[24px] border border-hair bg-white/[0.07] backdrop-blur" style={{ top: DOCK_TOP, left: 16, width: W - 32, height: 72 }}>
              {DOCK.map((d) => (
                <div key={d.id} className="flex flex-col items-center justify-center gap-1 text-ink-dim [&_svg]:size-5" style={{ width: SLOT }}>
                  {d.icon}
                  <span className="text-[10px]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* tour layer */}
          {step && typeof state === "number" ? (
            <>
              <Spotlight rect={step.spot} radius={step.radius} />
              <div role="dialog" aria-labelledby={titleId} className="absolute" style={cardStyle(step)}>
                <TourCard
                  title={step.title}
                  titleId={titleId}
                  nextId={nextId}
                  step={state + 1}
                  total={STEPS.length}
                  arrow={arrowFor(step)}
                  onBack={() => go(state - 1)}
                  onNext={() => go(state + 1 < STEPS.length ? state + 1 : "finished")}
                  onSkip={() => go("skipped")}
                >
                  {step.text}
                </TourCard>
              </div>
            </>
          ) : (
            <div className="absolute inset-x-0 bottom-28 flex justify-center">
              <Button id={restartId} size="sm" variant="secondary" leadingIcon={<RotateCcw />} onClick={() => go(0)}>
                Restart tour
              </Button>
            </div>
          )}
        </div>
      </div>
      <DemoStatus className="text-center">
        {state === "finished" ? "Tour finished. It stays dismissed until you restart it." : state === "skipped" ? "Tour skipped. It stays dismissed until you restart it." : "Next, Back, the arrow keys, or Esc to skip."}
      </DemoStatus>
      <ol aria-label="Tour steps" className="flex w-full max-w-[420px] flex-col gap-1">
        {STEPS.map((s, i) => {
          const current = state === i;
          return (
            <li key={s.title}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => go(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[8px]! border-l-2 px-3 py-1.5 text-left text-[12.5px] transition-colors",
                  current ? "border-ink bg-white/[0.06] text-ink" : "border-transparent text-ink-dim hover:bg-white/[0.03] hover:text-ink",
                )}
              >
                <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                  {i + 1} of {STEPS.length}
                </span>
                {s.title}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ----------------------------------------------------------------------------- mission markers */

function MissionMarkers() {
  const [gate, setGate] = useState<MarkerState>("onscreen");
  const offscreen = gate === "offscreen-left" || gate === "offscreen-right";
  return (
    <div className="flex flex-col gap-3">
      <Segmented<MarkerState>
        aria-label="Gate 01 marker state"
        size="sm"
        value={gate}
        onChange={setGate}
        className="max-w-full overflow-x-auto"
        options={[
          { value: "onscreen", label: "On screen" },
          { value: "offscreen-left", label: "Off left" },
          { value: "offscreen-right", label: "Off right" },
          { value: "cleared", label: "Cleared" },
        ]}
      />
      <div className="relative h-[440px] overflow-hidden rounded-[14px] border border-hair-soft sm:h-[400px]">
        <FauxSpace />
        {/* landing ring around the planet */}
        <div aria-hidden="true" className="absolute left-[58%] top-[30%] h-28 w-28">
          <span className="absolute -inset-5 rounded-full border border-dashed border-cyn/45" />
        </div>
        <TargetMarker
          label="xo-space"
          detail="landing ring"
          state="onscreen"
          className="absolute right-3 top-[64%] sm:right-auto sm:left-[70%] sm:-translate-x-1/2"
        />
        {offscreen ? (
          <TargetMarker
            label="Flight gate 01"
            detail="42 u"
            state={gate}
            className={cn("absolute top-[30%] -translate-y-1/2 sm:top-[44%]", gate === "offscreen-left" ? "left-3" : "right-3")}
          />
        ) : (
          <TargetMarker label="Flight gate 01" detail="42 u" state={gate} className="absolute left-4 top-[10%] sm:left-[24%] sm:-translate-x-1/2" />
        )}
        <TargetMarker label="Bank left" detail="gate 02" state="offscreen-left" className="absolute left-3 top-[90%] -translate-y-1/2 sm:top-[87%]" />
        <TargetMarker label="README.md" keepCase detail="open E" state="cleared" className="absolute left-4 top-[46%] sm:left-[26%] sm:top-[50%] sm:-translate-x-1/2" />
        <p className="absolute right-3 top-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">Sample mission · fictional space</p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- marker states */

const MARKER_STATES: { state: MarkerState; caption: string; label: string; detail: string }[] = [
  { state: "onscreen", caption: "On screen", label: "Flight gate 01", detail: "42 u" },
  { state: "offscreen-left", caption: "Off screen, left", label: "Bank left", detail: "gate 02" },
  { state: "offscreen-right", caption: "Off screen, right", label: "Bank right", detail: "gate 03" },
  { state: "cleared", caption: "Cleared", label: "Flight gate 01", detail: "42 u" },
];

/** Every marker state side by side, each labelled. */
function MarkerStates() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-[14px] border border-hair-soft bg-hair-soft sm:grid-cols-2">
      {MARKER_STATES.map((m) => (
        <li key={m.state} className="relative flex min-h-[150px] items-center justify-center bg-[#04060d] px-4 pb-4 pt-9">
          <span className="absolute left-3 top-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{m.caption}</span>
          <TargetMarker label={m.label} detail={m.detail} state={m.state} />
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function TourDemo() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <DemoSection title="Variant · phone tour">
        <Example caption="State · step n" note="Spotlight follows the target">
          <PhoneTour />
        </Example>
      </DemoSection>
      <DemoSection title="Variant · mission markers">
        <div className="flex flex-col gap-6">
          <Example caption="State · offscreen arrow" note="Pick a state for gate 01">
            <MissionMarkers />
          </Example>
          <Example caption="Marker states" note="Diamond, edge arrow, mint chip">
            <MarkerStates />
          </Example>
        </div>
      </DemoSection>
    </div>
  );
}
