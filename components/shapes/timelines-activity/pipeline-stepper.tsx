// Pipeline and stage steppers. Server-safe and prop-driven.
//  PipelineStepper: a vertical rail of steps, as the landing deploy tile ("rail") or as an app
//    list with detail and duration ("list"). States done, active, pending, plus failed, skipped.
//    RailDot is the rail's status dot alone, for legends.
//  OperatingStateStepper: the visualizer's reached / not reached project stages.
//  StageFlow: the XO improvement story (Start, Work, Measure, Understand, Improve) with a
//    per-stage status (Working, Under validation, Planned) and a loop back.
//  LoopChips: the short loop as a chip chain that returns to its start.
//  CycleStepper: the quirq loop as a ring of stages with done, active and pending nodes.
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Ban, Check, CornerDownLeft, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge, type Tone } from "@/components/ui";

export type StepStatus = "done" | "active" | "pending" | "failed" | "skipped";

export const STEP_STATUS_WORD: Record<StepStatus, string> = {
  done: "Done",
  active: "In progress",
  pending: "Pending",
  failed: "Failed",
  skipped: "Skipped",
};

export type PipelineStep = {
  id: string;
  label: string;
  detail?: ReactNode;
  /** Right side meta, such as a duration. */
  meta?: ReactNode;
  status: StepStatus;
};

export type PipelineStepperProps = {
  steps: PipelineStep[];
  /** rail: landing deploy tile (26px dots, mono label pills). list: app rows with detail. */
  variant?: "rail" | "list";
  "aria-label": string;
  className?: string;
};

/* ----------------------------------------------------------------------------- rail */

const RAIL_DOT: Record<StepStatus, string> = {
  done: "bg-[color-mix(in_srgb,var(--grn)_42%,#000)]",
  active: "bg-grn text-grn pulse",
  pending: "bg-white/[0.36]",
  failed: "bg-red",
  skipped: "border-2 border-dashed border-white/25 bg-bg",
};

/** The landing rail's status dot on its own, for legends. Decorative: pair it with a word. */
export function RailDot({ status, className }: { status: StepStatus; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-3 shrink-0 rounded-full", RAIL_DOT[status], className)} />;
}

function RailSteps({ steps }: { steps: PipelineStep[] }) {
  return (
    <>
      <span aria-hidden="true" className="absolute bottom-5 left-[10.5px] top-5 w-[5px] rounded-full bg-[#303030]" />
      {steps.map((s) => (
        <li key={s.id} aria-current={s.status === "active" ? "step" : undefined} className="relative flex items-center gap-4">
          <RailDot status={s.status} className="relative z-[1] size-[26px]" />
          <span
            className={cn(
              "min-w-0 flex-1 rounded-[6px] px-4 py-2.5 font-mono text-[13px] leading-snug [overflow-wrap:anywhere]",
              s.status === "active" ? "bg-white/[0.16] text-ink" : "bg-white/[0.1] text-ink/70",
              (s.status === "pending" || s.status === "skipped") && "text-ink-dim",
              s.status === "failed" && "text-[#ff7a70]",
            )}
          >
            {s.label}
            <span className="sr-only"> ({STEP_STATUS_WORD[s.status]})</span>
          </span>
        </li>
      ))}
    </>
  );
}

/* ----------------------------------------------------------------------------- list */

function ListIcon({ status }: { status: StepStatus }) {
  const base = "relative z-[1] grid size-5 shrink-0 place-items-center rounded-full";
  if (status === "done")
    return (
      <span aria-hidden="true" className={cn(base, "bg-grn text-black")}>
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  if (status === "active")
    return (
      <span aria-hidden="true" className={cn(base, "border border-blu/60 bg-bg")}>
        <span className="pulse size-2 rounded-full bg-blu text-blu" />
      </span>
    );
  if (status === "failed")
    return (
      <span aria-hidden="true" className={cn(base, "bg-red text-black")}>
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  if (status === "skipped")
    return (
      <span aria-hidden="true" className={cn(base, "border border-dashed border-hair-strong bg-bg text-ink-faint")}>
        <Ban className="size-2.5" />
      </span>
    );
  return <span aria-hidden="true" className={cn(base, "border border-hair-strong bg-bg")} />;
}

function ListSteps({ steps }: { steps: PipelineStep[] }) {
  return (
    <>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={s.id}
            aria-current={s.status === "active" ? "step" : undefined}
            className={cn("relative grid grid-cols-[20px_minmax(0,1fr)_auto] gap-x-3", !last && "pb-5")}
          >
            {!last ? (
              <span
                aria-hidden="true"
                className={cn("absolute bottom-0.5 left-[9.5px] top-[23px] w-px", s.status === "done" ? "bg-grn/45" : "bg-hair")}
              />
            ) : null}
            <ListIcon status={s.status} />
            <div className="min-w-0">
              <p
                className={cn(
                  "m-0 text-[13px] font-medium leading-5",
                  s.status === "pending" || s.status === "skipped" ? "text-ink-dim" : s.status === "failed" ? "text-[#ff7a70]" : "text-ink",
                )}
              >
                {s.label}
                <span className="sr-only"> ({STEP_STATUS_WORD[s.status]})</span>
              </p>
              {s.detail ? <p className="m-0 mt-0.5 text-[12px] leading-relaxed text-ink-faint [overflow-wrap:anywhere]">{s.detail}</p> : null}
            </div>
            <span className="pt-0.5 font-mono text-[11px] tabular-nums text-ink-faint">
              {s.meta ?? (s.status === "active" ? "Running…" : null)}
            </span>
          </li>
        );
      })}
    </>
  );
}

/** Vertical step rail from start to done. */
export function PipelineStepper({ steps, variant = "list", "aria-label": ariaLabel, className }: PipelineStepperProps) {
  return (
    <ol aria-label={ariaLabel} className={cn("relative m-0 flex list-none flex-col p-0", variant === "rail" ? "gap-[9px]" : "", className)}>
      {variant === "rail" ? <RailSteps steps={steps} /> : <ListSteps steps={steps} />}
    </ol>
  );
}

/* ----------------------------------------------------------------------------- operating state */

export type OperatingStage = { id: string; title: string; detail: ReactNode; reached: boolean };

/** Reached stages fill with bone ink; the highest reached one is current; the rest stay hollow. */
export function OperatingStateStepper({ stages, "aria-label": ariaLabel, className }: { stages: OperatingStage[]; "aria-label": string; className?: string }) {
  const current = stages.reduce((acc, s, i) => (s.reached ? i : acc), -1);
  return (
    <ol aria-label={ariaLabel} className={cn("m-0 grid list-none gap-1 p-0", className)}>
      {stages.map((s, i) => {
        const last = i === stages.length - 1;
        return (
          <li key={s.id} aria-current={i === current ? "step" : undefined} className="relative grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 py-2">
            {!last ? <span aria-hidden="true" className="absolute left-[3.5px] top-[22px] h-[calc(100%-14px)] w-px bg-hair" /> : null}
            <i
              aria-hidden="true"
              className={cn(
                "mt-[3px] size-2 rounded-full border",
                s.reached ? "border-ink bg-ink" : "border-hair-strong bg-transparent",
                i === current && "shadow-[0_0_8px_rgba(244,243,240,0.32),0_0_0_3px_rgba(244,243,240,0.08)]",
              )}
            />
            <span className={cn("min-w-0", s.reached ? "text-ink-dim" : "text-ink-faint")}>
              <b className={cn("mb-1 block font-mono text-[10px] font-medium uppercase tracking-[0.1em]", s.reached ? "text-ink" : "text-ink-faint")}>
                {s.title}
                <span className="sr-only"> ({s.reached ? "Reached" : "Not reached"})</span>
              </b>
              <span className="text-[12px] leading-relaxed">{s.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ----------------------------------------------------------------------------- stage flow */

export type StageState = "working" | "validating" | "planned";

export const STAGE_STATE_META: Record<StageState, { label: string; tone: Tone }> = {
  working: { label: "Working", tone: "grn" },
  validating: { label: "Under validation", tone: "org" },
  planned: { label: "Planned", tone: "neutral" },
};

export type FlowStage = { id: string; name: string; question: string; state: StageState };

/** Five-stage story with a status per stage and a loop back from the last stage to the second. */
export function StageFlow({
  stages,
  loopLabel = "Next configuration",
  "aria-label": ariaLabel,
  className,
}: {
  stages: FlowStage[];
  loopLabel?: string;
  "aria-label": string;
  className?: string;
}) {
  return (
    <div className={cn("@container min-w-0", className)}>
      <ol aria-label={ariaLabel} className="m-0 grid list-none gap-2 p-0 @3xl:grid-cols-5 @3xl:gap-0">
        {stages.map((s, i) => {
          const meta = STAGE_STATE_META[s.state];
          const last = i === stages.length - 1;
          return (
            <li key={s.id} className="relative flex min-w-0 @3xl:pr-5">
              <div
                className={cn(
                  "flex w-full min-w-0 flex-col gap-2 rounded-[12px] border p-3.5",
                  s.state === "planned" ? "border-dashed border-hair-strong bg-transparent" : "border-hair bg-s2",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] tabular-nums tracking-[0.12em] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                  <Badge tone={meta.tone} size="xs" dot>
                    {meta.label}
                  </Badge>
                </div>
                <p className="m-0 text-[14px] font-semibold tracking-[-0.01em] text-ink">{s.name}</p>
                <p className="m-0 text-[12px] leading-relaxed text-ink-dim">{s.question}</p>
              </div>
              {!last ? (
                <ArrowRight aria-hidden="true" className="absolute right-0.5 top-1/2 hidden size-3.5 -translate-y-1/2 text-ink-faint @3xl:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="m-0 mt-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        <CornerDownLeft aria-hidden="true" className="size-3.5" />
        {stages.at(-1)?.name} loops back to {stages[1]?.name ?? stages[0]?.name} · {loopLabel}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- loop chips */

export type LoopChip = { id: string; label: string; emphasis?: "tested" | "untested" };

/** A chain of chips joined by arrows that returns to its first chip. */
export function LoopChips({ items, "aria-label": ariaLabel, className }: { items: LoopChip[]; "aria-label": string; className?: string }) {
  return (
    <ol aria-label={ariaLabel} className={cn("m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-2 p-0", className)}>
      {items.map((c, i) => (
        <li key={c.id} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex h-7 items-center rounded-full border px-3 text-[12px] leading-none",
              c.emphasis === "untested"
                ? "border-dashed border-org/50 text-org"
                : c.emphasis === "tested"
                  ? "border-grn/45 bg-grn/[0.08] text-grn"
                  : "border-hair bg-white/[0.03] text-ink",
            )}
          >
            {c.label}
          </span>
          {i < items.length - 1 ? <ArrowRight aria-hidden="true" className="size-3.5 text-ink-faint" /> : null}
        </li>
      ))}
      <li className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        <CornerDownLeft aria-hidden="true" className="size-3.5" />
        back to {items[0]?.label.toLowerCase()}
      </li>
    </ol>
  );
}

/* ----------------------------------------------------------------------------- cycle */

export type CycleStage = {
  id: string;
  label: string;
  /** One line about the stage; the active stage's detail is printed under the ring. */
  detail?: string;
  color: Exclude<Tone, "neutral">;
  status: Extract<StepStatus, "done" | "active" | "pending">;
};

/** Point i of n on a ring centered in a 100 x 100 box, clockwise from the top, rounded so the
    server and the browser print the same coordinates. */
function ringPoint(i: number, n: number, r: number): [number, number] {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return [Math.round((50 + r * Math.cos(a)) * 1000) / 1000, Math.round((50 + r * Math.sin(a)) * 1000) / 1000];
}

/** Ring of stages read clockwise from the top. Node fill follows its status. */
export function CycleStepper({
  stages,
  center,
  "aria-label": ariaLabel,
  className,
}: {
  stages: CycleStage[];
  center?: ReactNode;
  "aria-label": string;
  className?: string;
}) {
  const n = stages.length;
  const R = 30; // ring radius, in percent of the box
  const active = stages.find((s) => s.status === "active");
  return (
    <div className={cn("mx-auto w-full max-w-[380px]", className)}>
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--hair-strong)" strokeWidth="0.35" strokeDasharray="0.8 1.6" />
          {stages.map((s, i) => {
            if (s.status !== "done") return null;
            const [x0, y0] = ringPoint(i, n, R);
            const [x1, y1] = ringPoint(i + 1, n, R);
            return <path key={s.id} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" stroke={`var(--${s.color})`} strokeOpacity="0.55" strokeWidth="0.7" />;
          })}
        </svg>
        {center ? <div className="absolute inset-[30%] grid place-items-center text-center">{center}</div> : null}
        <ol aria-label={ariaLabel} className="m-0 list-none p-0">
          {stages.map((s, i) => {
            const [x, y] = ringPoint(i, n, R);
            const style: CSSProperties = {
              left: `${x}%`,
              top: `${y}%`,
              ["--c" as string]: `var(--${s.color})`,
            };
            /* labels sit outside the ring: above, below, or to the outer side */
            const dx = x - 50;
            const dy = y - 50;
            const side = Math.abs(dx) < 8 ? (dy < 0 ? "top" : "bottom") : dx > 0 ? "right" : "left";
            return (
              <li key={s.id} aria-current={s.status === "active" ? "step" : undefined} style={style} className="absolute size-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-0 block size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
                    s.status === "done" && "border-[var(--c)] bg-[var(--c)]",
                    s.status === "active" && "pulse border-[var(--c)] bg-bg text-[var(--c)]",
                    s.status === "pending" && "border-hair-strong bg-bg",
                  )}
                />
                <span
                  className={cn(
                    "absolute whitespace-nowrap text-[11.5px] font-medium leading-tight",
                    s.status === "pending" ? "text-ink-faint" : "text-ink",
                    side === "top" && "bottom-[14px] left-0 -translate-x-1/2",
                    side === "bottom" && "left-0 top-[14px] -translate-x-1/2",
                    side === "right" && "left-[15px] top-0 -translate-y-1/2",
                    side === "left" && "right-[15px] top-0 -translate-y-1/2",
                  )}
                >
                  {s.label}
                  <span className="sr-only"> ({STEP_STATUS_WORD[s.status]})</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {active?.detail ? (
        <p className="m-0 mt-1 flex items-baseline justify-center gap-2 text-center text-[12px] leading-relaxed text-ink-dim">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: `var(--${active.color})` }}>
            {active.label}
          </span>
          <span>{active.detail}</span>
        </p>
      ) : null}
    </div>
  );
}
