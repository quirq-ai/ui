"use client";

// Wizard and numbered stepper: Stepper (numbered circles joined by a connector, each step
// done, active, waiting, error or disabled, with the active step's body inline),
// SignInFlow (two steps: open the provider sign-in, then paste the code; Retry on a bad
// code), JobEditorWizard (kind, schedule presets and a live "Every day at 02:00 · Next: …"
// preview, with Back and Next) and StepProgress ("Step 2 of 7" over a segmented bar).
import { useId, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Check, Clock3, ExternalLink, Repeat, Timer, X, CalendarDays, CalendarRange } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ProgressBar, Spinner } from "@/components/ui/loaders";
import { formatDateTime } from "@/lib/format";
import { useTimers } from "./_timers";
import { FormStyles } from "./_styles";
import { Calendar } from "./pickers";

/* ============================================================================ Stepper */

export type StepState = "done" | "active" | "waiting" | "error" | "disabled";

export type StepItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  state: StepState;
  /** Body shown under the title (usually only for the active step). */
  content?: ReactNode;
};

function StepMark({ n, state }: { n: number; state: StepState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-[1] inline-flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] font-semibold tabular-nums transition-colors",
        state === "done" && "border-grn bg-grn text-black",
        state === "active" && "border-ink bg-ink text-black shadow-[0_0_0_4px_rgba(244,243,240,0.12)]",
        state === "waiting" && "border-blu/60 bg-blu/12 text-blu",
        state === "error" && "border-red/70 bg-red/12 text-red",
        state === "disabled" && "border-hair-strong bg-s1 text-ink-faint",
      )}
    >
      {state === "done" ? <Check strokeWidth={3} className="size-3.5" /> : state === "error" ? <X strokeWidth={3} className="size-3.5" /> : state === "waiting" ? <Spinner size={12} label={null} /> : n}
    </span>
  );
}

const stateWord: Record<StepState, string> = { done: "completed", active: "current step", waiting: "waiting", error: "needs attention", disabled: "not started" };

/** Numbered steps joined by a connector. Vertical with inline bodies, or a compact horizontal row. */
export function Stepper({ steps, orientation = "vertical", className }: { steps: StepItem[]; orientation?: "vertical" | "horizontal"; className?: string }) {
  if (orientation === "horizontal") {
    return (
      <ol className={cn("flex min-w-0 items-center gap-2", className)}>
        {steps.map((s, i) => (
          <li key={s.id} aria-current={s.state === "active" ? "step" : undefined} className="flex min-w-0 items-center gap-2">
            <StepMark n={i + 1} state={s.state} />
            <span className={cn("hidden truncate text-[12.5px] sm:inline", s.state === "active" ? "font-medium text-ink" : s.state === "disabled" ? "text-ink-faint" : "text-ink-dim")}>
              {s.title}
            </span>
            <span className="sr-only">, {stateWord[s.state]}</span>
            {i < steps.length - 1 ? <span aria-hidden="true" className={cn("h-px w-6 shrink-0 sm:w-10", s.state === "done" ? "bg-grn/60" : "bg-hair-strong")} /> : null}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ol className={cn("flex min-w-0 flex-col", className)}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.id} aria-current={s.state === "active" ? "step" : undefined} className="relative flex gap-3.5 pb-6 last:pb-0">
            {!last ? (
              <span aria-hidden="true" className={cn("absolute left-[13.5px] top-8 bottom-1 w-px", s.state === "done" ? "bg-grn/50" : "bg-hair-strong")} />
            ) : null}
            <StepMark n={i + 1} state={s.state} />
            <div className="min-w-0 flex-1 pt-[3px]">
              <p className={cn("text-[13.5px] font-medium leading-5", s.state === "disabled" ? "text-ink-faint" : "text-ink")}>
                {s.title}
                <span className="sr-only">, {stateWord[s.state]}</span>
              </p>
              {s.description ? <p className={cn("mt-0.5 text-[12.5px] leading-snug", s.state === "disabled" ? "text-ink-faint" : "text-ink-dim")}>{s.description}</p> : null}
              {s.content ? <div className="mt-3">{s.content}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================================ SignInFlow */

export type SignInFlowProps = {
  /** "Claude", "ChatGPT". */
  provider: string;
  /** Accepts or rejects a pasted code. */
  verify: (code: string) => boolean;
  /** Start with step 1 done. */
  defaultSignedIn?: boolean;
  defaultCode?: string;
  onConnected?: () => void;
  delayMs?: number;
  className?: string;
};

/** Connect a subscription: open the provider sign-in, then paste the code it shows. */
export function SignInFlow({ provider, verify, defaultSignedIn = false, defaultCode = "", onConnected, delayMs = 1100, className }: SignInFlowProps) {
  const uid = useId();
  const later = useTimers();
  const [one, setOne] = useState<"todo" | "waiting" | "done">(defaultSignedIn ? "done" : "todo");
  const [code, setCode] = useState(defaultCode);
  const [two, setTwo] = useState<"todo" | "checking" | "error" | "done">("todo");

  const steps: StepItem[] = [
    {
      id: "open",
      title: `Sign in with ${provider}`,
      state: one === "done" ? "done" : one === "waiting" ? "waiting" : "active",
      description:
        one === "done" ? (
          <span className="inline-flex items-center gap-1.5 text-grn">
            <Check aria-hidden="true" className="size-3.5" /> Signed in
          </span>
        ) : one === "waiting" ? (
          "Waiting for you to finish in the other tab…"
        ) : (
          `Opens ${provider} in a new tab. Come back here when it shows a code.`
        ),
      content:
        one === "todo" ? (
          <Button
            size="sm"
            variant="secondary"
            trailingIcon={<ExternalLink aria-hidden="true" />}
            onClick={() => {
              setOne("waiting");
              later(() => setOne("done"), delayMs);
            }}
          >
            Open sign-in
          </Button>
        ) : null,
    },
    {
      id: "code",
      title: "Enter sign-in code",
      state: two === "done" ? "done" : two === "error" ? "error" : two === "checking" ? "waiting" : one === "done" ? "active" : "disabled",
      description: two === "done" ? <span className="text-grn">{provider} subscription connected</span> : "Paste the code you received after signing in.",
      content:
        one === "done" && two !== "done" ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!code.trim()) return;
              setTwo("checking");
              later(() => {
                if (verify(code.trim())) {
                  setTwo("done");
                  onConnected?.();
                } else setTwo("error");
              }, delayMs);
            }}
          >
            <div className="flex min-w-0 gap-2">
              <label htmlFor={`${uid}-code`} className="sr-only">
                Sign-in code
              </label>
              <Input
                id={`${uid}-code`}
                mono
                size="sm"
                placeholder="Paste the code"
                autoComplete="one-time-code"
                spellCheck={false}
                value={code}
                disabled={two === "checking"}
                aria-invalid={two === "error" || undefined}
                aria-describedby={two === "error" ? `${uid}-err` : undefined}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (two === "error") setTwo("todo");
                }}
              />
              <Button type="submit" size="sm" variant="primary" disabled={!code.trim()} loading={two === "checking"} loadingLabel="Checking…">
                {two === "error" ? "Retry" : "Connect"}
              </Button>
            </div>
            {two === "error" ? (
              <p id={`${uid}-err`} role="alert" className="text-[12px] text-[#ff7a70]">
                Invalid code. Please make sure the full code was copied.
              </p>
            ) : null}
          </form>
        ) : null,
    },
  ];

  return (
    <div className={cn("rounded-[14px] border border-hair bg-s2 p-5", className)}>
      <Stepper steps={steps} />
    </div>
  );
}

/* ============================================================================ JobEditorWizard */

type Kind = "scheduled" | "once";
type Repeat = "custom" | "hourly" | "daily" | "weekly";
type Unit = "minutes" | "hours" | "days";

const PRESETS: { value: Repeat; label: string; hint: string; icon: ReactNode }[] = [
  { value: "custom", label: "Every…", hint: "Minutes, hours or days", icon: <Timer aria-hidden="true" className="size-4" /> },
  { value: "hourly", label: "Hourly", hint: "At a minute past each hour", icon: <Clock3 aria-hidden="true" className="size-4" /> },
  { value: "daily", label: "Daily", hint: "Once a day at a set time", icon: <CalendarDays aria-hidden="true" className="size-4" /> },
  { value: "weekly", label: "Weekly", hint: "One day a week", icon: <CalendarRange aria-hidden="true" className="size-4" /> },
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const UNIT_MS: Record<Unit, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 };
const TIME_24 = /^([01]\d|2[0-3]):[0-5]\d$/;

export type JobSchedule = {
  kind: Kind | null;
  repeat: Repeat;
  every: string;
  unit: Unit;
  time: string;
  minute: string;
  weekday: number;
  /** One time: "2026-10-05", or "" for Run now. */
  day: string;
};

/** Plain-language summary and the next two runs, computed from an explicit now (UTC). */
export function describeSchedule(s: JobSchedule, nowIso: string): { summary: string; next: string[]; error: string | null } {
  const now = Date.parse(nowIso);
  const needsTime = s.kind === "once" ? Boolean(s.day) : s.repeat === "daily" || s.repeat === "weekly";
  if (needsTime && !TIME_24.test(s.time)) return { summary: "At …", next: [], error: "Use 24-hour time, such as 02:00." };
  const [hh, mm] = s.time.split(":").map(Number);
  const dayStart = Math.floor(now / 86_400_000) * 86_400_000;
  if (s.kind === "once") {
    if (!s.day) return { summary: "Runs once, when you click Run now", next: [], error: null };
    const at = Date.parse(`${s.day}T${s.time}:00Z`);
    if (at <= now) return { summary: "Runs once", next: [], error: "Pick a day and time after now." };
    return { summary: `Runs once on ${formatDateTime(at)}`, next: [formatDateTime(at)], error: null };
  }
  if (s.repeat === "custom") {
    const n = Number(s.every);
    if (!Number.isInteger(n) || n < 1 || n > 999) return { summary: "Every …", next: [], error: "Use a whole number from 1 to 999." };
    const step = n * UNIT_MS[s.unit];
    const unit = n === 1 ? s.unit.slice(0, -1) : s.unit;
    return { summary: `Every ${n} ${unit}`, next: [formatDateTime(now + step), formatDateTime(now + 2 * step)], error: null };
  }
  if (s.repeat === "hourly") {
    const m = Number(s.minute);
    if (!Number.isInteger(m) || m < 0 || m > 59) return { summary: "Hourly", next: [], error: "Use a minute from 0 to 59." };
    const hourStart = Math.floor(now / 3_600_000) * 3_600_000;
    let first = hourStart + m * 60_000;
    if (first <= now) first += 3_600_000;
    return { summary: `Every hour at :${String(m).padStart(2, "0")}`, next: [formatDateTime(first), formatDateTime(first + 3_600_000)], error: null };
  }
  const offset = (hh * 60 + mm) * 60_000;
  if (s.repeat === "daily") {
    let first = dayStart + offset;
    if (first <= now) first += 86_400_000;
    return { summary: `Every day at ${s.time}`, next: [formatDateTime(first), formatDateTime(first + 86_400_000)], error: null };
  }
  // UTC weekday from the epoch day (1970-01-01 was a Thursday, weekday 4).
  const today = (Math.floor(now / 86_400_000) + 4) % 7;
  let first = dayStart + ((s.weekday - today + 7) % 7) * 86_400_000 + offset;
  if (first <= now) first += 7 * 86_400_000;
  return { summary: `Every ${WEEKDAYS[s.weekday]} at ${s.time}`, next: [formatDateTime(first), formatDateTime(first + 7 * 86_400_000)], error: null };
}

export type JobEditorWizardProps = {
  /** Fixed "now" for the preview (fixtures use NOW_ISO). */
  nowIso: string;
  defaultName?: string;
  defaultCommand?: string;
  defaultSchedule?: Partial<JobSchedule>;
  /** Start on this step (0, 1 or 2). */
  defaultStep?: number;
  /** Time zone note under the preview. */
  zoneNote?: ReactNode;
  onSave?: (job: { name: string; command: string; schedule: JobSchedule }) => void;
  className?: string;
};

function Tile({ checked, name, value, onChange, icon, title, hint, disabled }: { checked: boolean; name: string; value: string; onChange: () => void; icon: ReactNode; title: string; hint: string; disabled?: boolean }) {
  return (
    <label
      className={cn(
        "fi-ring-any flex cursor-pointer items-start gap-3 rounded-[9px] border px-3.5 py-3 transition-[border-color,background-color] duration-150",
        checked ? "border-blu/60 bg-blu/[0.06]" : "border-hair bg-s1 hover:border-hair-strong",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span aria-hidden="true" className={cn("mt-0.5 inline-flex shrink-0", checked ? "text-blu" : "text-ink-faint")}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium leading-5 text-ink">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">{hint}</span>
      </span>
    </label>
  );
}

/** Job editor in three steps: kind, schedule, review. The preview updates as you choose. */
export function JobEditorWizard({
  nowIso,
  defaultName = "Nightly tests",
  defaultCommand = "pnpm test",
  defaultSchedule,
  defaultStep = 0,
  zoneNote = "Times are in UTC.",
  onSave,
  className,
}: JobEditorWizardProps) {
  const uid = useId();
  const later = useTimers();
  const [step, setStep] = useState(defaultStep);
  const [name, setName] = useState(defaultName);
  const [command, setCommand] = useState(defaultCommand);
  const [s, setS] = useState<JobSchedule>({
    kind: null,
    repeat: "daily",
    every: "30",
    unit: "minutes",
    time: "02:00",
    minute: "01",
    weekday: 1,
    day: "",
    ...defaultSchedule,
  });
  const [phase, setPhase] = useState<"idle" | "saving" | "saved">("idle");
  const set = <K extends keyof JobSchedule>(k: K, v: JobSchedule[K]) => {
    setS((x) => ({ ...x, [k]: v }));
    setPhase("idle");
  };
  const preview = s.kind ? describeSchedule(s, nowIso) : null;
  const canNext = step === 0 ? s.kind !== null : step === 1 ? !!preview && !preview.error : true;
  const titles = ["Kind", "Schedule", "Review"];

  const stepState = (i: number): StepState => (i < step ? "done" : i === step ? "active" : "disabled");

  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-blu/30 bg-s2", className)}>
      <FormStyles />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <CalendarClock aria-hidden="true" className="size-4 text-blu" />
          <h4 className="text-[14px] font-semibold text-ink">New job</h4>
        </div>
        <Stepper orientation="horizontal" steps={titles.map((t, i) => ({ id: t, title: t, state: stepState(i) }))} />
      </div>

      <div className="flex min-h-[248px] flex-col gap-4 p-5">
        {step === 0 ? (
          <fieldset className="min-w-0">
            <legend className="mb-3 text-[13px] font-medium text-ink">What kind of job is this?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <Tile name={`${uid}-kind`} value="scheduled" checked={s.kind === "scheduled"} onChange={() => set("kind", "scheduled")} icon={<Repeat className="size-4" />} title="Repeating" hint="Runs again and again, on a schedule you choose." />
              <Tile name={`${uid}-kind`} value="once" checked={s.kind === "once"} onChange={() => set("kind", "once")} icon={<Timer className="size-4" />} title="One time" hint="Runs once on the day and time you pick, or whenever you click Run now." />
            </div>
          </fieldset>
        ) : null}

        {step === 1 && s.kind === "scheduled" ? (
          <>
            <fieldset className="min-w-0">
              <legend className="mb-3 text-[13px] font-medium text-ink">How often?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRESETS.map((p) => (
                  <Tile key={p.value} name={`${uid}-repeat`} value={p.value} checked={s.repeat === p.value} onChange={() => set("repeat", p.value)} icon={p.icon} title={p.label} hint={p.hint} />
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-dim">
              {s.repeat === "custom" ? (
                <>
                  <span>Every</span>
                  <div className="w-16">
                    <Input aria-label="Repeat every" mono size="sm" inputMode="numeric" value={s.every} onChange={(e) => set("every", e.target.value)} aria-invalid={!!preview?.error || undefined} />
                  </div>
                  <Select aria-label="Repeat unit" size="sm" value={s.unit} onChange={(e) => set("unit", e.target.value as Unit)} className="max-w-28">
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </Select>
                </>
              ) : s.repeat === "hourly" ? (
                <>
                  <span>At minute</span>
                  <div className="w-16">
                    <Input aria-label="Minute past the hour" mono size="sm" inputMode="numeric" value={s.minute} onChange={(e) => set("minute", e.target.value)} aria-invalid={!!preview?.error || undefined} />
                  </div>
                </>
              ) : (
                <>
                  {s.repeat === "weekly" ? (
                    <>
                      <span>On</span>
                      <Select aria-label="Day of the week" size="sm" value={String(s.weekday)} onChange={(e) => set("weekday", Number(e.target.value))} className="max-w-32">
                        {WEEKDAYS.map((d, i) => (
                          <option key={d} value={i}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </>
                  ) : null}
                  <span>At</span>
                  <div className="w-20">
                    <Input
                      aria-label="Run time, 24-hour"
                      mono
                      size="sm"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="02:00"
                      value={s.time}
                      aria-invalid={!!preview?.error || undefined}
                      onChange={(e) => set("time", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}

        {step === 1 && s.kind === "once" ? (
          <div className="flex flex-wrap items-start gap-4">
            <Calendar today={nowIso.slice(0, 10)} min={nowIso.slice(0, 10)} value={s.day || null} onChange={(d) => set("day", d)} label="Day to run" />
            <div className="flex flex-col gap-3">
              <Field id={`${uid}-time`} label="Time" hint="24-hour, UTC." className="w-32">
                <Input mono size="sm" inputMode="numeric" maxLength={5} placeholder="02:00" value={s.time} onChange={(e) => set("time", e.target.value)} />
              </Field>
              <Button size="sm" variant="subtle" disabled={!s.day} onClick={() => set("day", "")}>
                No day: wait for Run now
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${uid}-name`} label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id={`${uid}-cmd`} label="Command">
              <Input mono value={command} onChange={(e) => setCommand(e.target.value)} />
            </Field>
          </div>
        ) : null}

        {preview && step > 0 ? (
          <div role="status" aria-live="polite" className={cn("mt-auto rounded-[10px] border px-3.5 py-3", preview.error ? "border-red/35 bg-red/[0.06]" : "border-hair-soft bg-black/40")}>
            {preview.error ? (
              <p className="text-[12.5px] text-[#ff7a70]">{preview.error}</p>
            ) : (
              <>
                <p className="text-[13px] font-medium text-ink">{preview.summary}</p>
                <p className="mt-1 font-mono text-[11.5px] text-ink-dim">
                  {preview.next.length ? `Next: ${preview.next.join(" · ")}` : "No set time: it waits for Run now."}
                </p>
              </>
            )}
            <p className="mt-1.5 text-[11.5px] text-ink-faint">{zoneNote}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-hair-soft px-5 py-3.5">
        <Button size="sm" variant="subtle" leadingIcon={<ArrowLeft aria-hidden="true" />} disabled={step === 0 || phase === "saving"} onClick={() => setStep((x) => x - 1)}>
          Back
        </Button>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">
          {String(step + 1).padStart(2, "0")} / 03
        </span>
        {step < 2 ? (
          <Button size="sm" variant="primary" trailingIcon={<ArrowRight aria-hidden="true" />} disabled={!canNext} onClick={() => setStep((x) => x + 1)}>
            Next
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            disabled={!name.trim() || !command.trim() || phase === "saved"}
            loading={phase === "saving"}
            loadingLabel="Saving…"
            onClick={() => {
              setPhase("saving");
              later(() => {
                setPhase("saved");
                onSave?.({ name, command, schedule: s });
              }, 800);
            }}
          >
            {phase === "saved" ? "Saved" : "Save job"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ============================================================================ StepProgress */

export type StepProgressProps = {
  steps: string[];
  defaultStep?: number;
  onFinish?: () => void;
  children?: (step: number) => ReactNode;
  className?: string;
};

/** "Step 2 of 7": a segmented bar with the step name and Back and Next. */
export function StepProgress({ steps, defaultStep = 1, onFinish, children, className }: StepProgressProps) {
  const [i, setI] = useState(defaultStep);
  const last = i === steps.length - 1;
  return (
    <div className={cn("flex flex-col gap-4 rounded-[14px] border border-hair bg-s2 p-5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[14px] font-semibold text-ink">{steps[i]}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
          Step {i + 1} of {steps.length}
        </p>
      </div>
      <ProgressBar value={i + 1} max={steps.length} segments={steps.length} showValue={false} tone="ink" aria-label={`Step ${i + 1} of ${steps.length}: ${steps[i]}`} valueText={`Step ${i + 1} of ${steps.length}`} />
      {children ? <div className="min-h-[96px]">{children(i)}</div> : null}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="subtle" leadingIcon={<ArrowLeft aria-hidden="true" />} disabled={i === 0} onClick={() => setI((x) => x - 1)}>
          Back
        </Button>
        <span className="ml-auto truncate text-[12px] text-ink-faint">{last ? "" : `Next: ${steps[i + 1]}`}</span>
        <Button
          size="sm"
          variant="primary"
          trailingIcon={last ? undefined : <ArrowRight aria-hidden="true" />}
          onClick={() => (last ? onFinish?.() : setI((x) => x + 1))}
        >
          {last ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
