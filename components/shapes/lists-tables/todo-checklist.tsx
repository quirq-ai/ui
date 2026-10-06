// Todo checklist and next step card. Read only and server-safe.
//   TodoChecklist: one group per session (session id, runtime, project, progress), then a
//   row per step with its status icon, and the note on blocked or cancelled steps.
//   NextStepCard: the step a session works on next (in progress first, then pending).
// A todo inside a session is shown to people as a step.
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Circle, CircleDotDashed, CircleSlash } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TodoStatus } from "@/lib/fixtures";
import { ProgressBar } from "@/components/ui/loaders";

export type StepItem = {
  id: string;
  content: string;
  status: TodoStatus;
  note?: string | null;
  updated?: string;
};

export const STEP_STATUS: Record<TodoStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "text-grn" },
  in_progress: { label: "In progress", cls: "text-blu" },
  pending: { label: "Pending", cls: "text-ink-faint" },
  blocked: { label: "Blocked", cls: "text-org" },
  cancelled: { label: "Cancelled", cls: "text-ink-faint" },
};

const STEP_GLYPH = { completed: CircleCheck, in_progress: CircleDotDashed, blocked: CircleAlert, cancelled: CircleSlash, pending: Circle } as const;

/** Status glyph for a step; named for screen readers unless decorative (a visible label sits next to it). */
export function StepIcon({ status, decorative = false, className }: { status: TodoStatus; decorative?: boolean; className?: string }) {
  const Glyph = STEP_GLYPH[status];
  const a11y = decorative ? { "aria-hidden": true as const } : { role: "img", "aria-label": STEP_STATUS[status].label };
  return <Glyph {...a11y} className={cn("size-4 shrink-0", STEP_STATUS[status].cls, className)} />;
}

/** In progress first, then pending, else the first step. */
export function pickNextStep<T extends Pick<StepItem, "status">>(steps: T[]): T | null {
  return steps.find((s) => s.status === "in_progress") ?? steps.find((s) => s.status === "pending") ?? steps[0] ?? null;
}

export type TodoGroupProps = {
  /** Session id, such as df1a1a5b. */
  sessionId: string;
  /** Runtime chip (RuntimeTag). */
  runtime: ReactNode;
  title?: string;
  project?: string;
  steps: StepItem[];
  className?: string;
};

/** One session's planned steps and how far it got. */
export function TodoGroup({ sessionId, runtime, title, project, steps, className }: TodoGroupProps) {
  const done = steps.filter((s) => s.status === "completed").length;
  const counted = steps.filter((s) => s.status !== "cancelled").length;
  return (
    <section aria-label={`Steps for session ${sessionId}`} className={cn("min-w-0 rounded-[14px] border border-hair-soft bg-[#0f0f11]", className)}>
      <header className="flex flex-col gap-2 border-b border-hair-soft px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] text-ink">{sessionId}</span>
          {runtime}
          {project ? <span className="font-mono text-[11px] text-ink-faint">· {project}</span> : null}
          <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-dim">
            {done} of {counted} completed
          </span>
        </div>
        {title ? <p className="truncate text-[12.5px] text-ink-dim">{title}</p> : null}
        <ProgressBar value={done} max={Math.max(1, counted)} size="xs" tone="grn" showValue={false} aria-label={`${done} of ${counted} steps completed`} />
      </header>
      <ol className="px-4 py-2">
        {steps.map((s) => (
          <li key={s.id} className="flex items-start gap-2.5 py-1.5">
            <StepIcon status={s.status} className="mt-[3px]" />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-[13px] leading-snug",
                  s.status === "completed" ? "text-ink-dim" : s.status === "cancelled" ? "text-ink-faint line-through decoration-ink-faint/50" : "text-ink",
                  s.status === "in_progress" && "font-medium",
                )}
              >
                {s.content}
              </p>
              {s.note ? <p className={cn("mt-0.5 text-[12px]", s.status === "blocked" ? "text-org/90" : "text-ink-faint")}>{s.note}</p> : null}
            </div>
            {s.updated ? <span className="shrink-0 pt-px font-mono text-[10.5px] tabular-nums text-ink-faint">{s.updated}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export type NextStepCardProps = {
  step: StepItem | null;
  /** Session summary or context line. */
  detail?: string;
  runtime?: ReactNode;
  project?: string;
  className?: string;
};

/** "Next step": status in small caps, the step, a context line, the runtime. */
export function NextStepCard({ step, detail, runtime, project, className }: NextStepCardProps) {
  return (
    <article className={cn("min-w-0 rounded-[12px] border border-hair-soft bg-black/45 p-4", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Next step</p>
      {step ? (
        <>
          <p className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em]", STEP_STATUS[step.status].cls)}>
            <StepIcon status={step.status} decorative className="size-3.5" />
            {STEP_STATUS[step.status].label}
          </p>
          <h5 className="mt-1.5 text-[14.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">{step.content}</h5>
          {detail ? <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{detail}</p> : null}
          {runtime || project ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {runtime}
              {project ? <span className="font-mono text-[11px] text-ink-faint">{project}</span> : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-2 text-[13px] text-ink-faint">No steps recorded for this session.</p>
          {project ? <p className="mt-3 font-mono text-[11px] text-ink-faint">{project}</p> : null}
        </>
      )}
    </article>
  );
}
