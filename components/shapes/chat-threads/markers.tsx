"use client";

// Agent work markers: the one-line rows a turn uses for everything that is not prose.
// Marker (default, separator, border), ToolCallMarker (icon, tool, summary, status; the row is
// the disclosure for its input and output), ReasoningMarker ("Thought about this"),
// WorkingMarker (the live "Working…" line), StepsMarker (a session's steps with their state)
// and InlineDiff (a numbered unified diff for an Edit's detail). Collapsed by default: a turn can
// run a dozen tool calls and the answer must stay on screen.
import { useId, useState, type HTMLAttributes, type ReactNode } from "react";
import { Brain, Check, ChevronRight, Circle, CircleAlert, CircleDashed, CircleStop, ListChecks, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";
import { StatusDot } from "@/components/ui/status";

/* ----------------------------------------------------------------------------- Marker */

export type MarkerVariant = "default" | "separator" | "border";

export type MarkerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  variant?: MarkerVariant;
  icon?: ReactNode;
  children: ReactNode;
  /** Right side: a time, a count, an action. */
  trailing?: ReactNode;
};

const markerVariant: Record<MarkerVariant, string> = {
  default: "",
  /* hairlines on both sides, label centered: "Session resumed · 09:02" */
  separator:
    "before:h-px before:min-w-4 before:flex-1 before:bg-hair after:h-px after:min-w-4 after:flex-1 after:bg-hair [&>[data-marker-content]]:flex-none [&>[data-marker-content]]:text-center",
  border: "border-b border-hair-soft pb-2",
};

/** Icon plus a short line, quieter than prose. */
export function Marker({ variant = "default", icon, trailing, className, children, ...rest }: MarkerProps) {
  return (
    <div
      data-variant={variant}
      className={cn(
        "flex min-h-5 w-full min-w-0 items-center gap-2 text-[12.5px] leading-5 text-ink-dim [&_svg]:size-4",
        markerVariant[variant],
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span data-marker-content className="min-w-0 break-words">
        {children}
      </span>
      {trailing ? <span className="ml-auto shrink-0 font-mono text-[10.5px] tabular-nums text-ink-faint">{trailing}</span> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- tool status */

/** stopped: the person ended the turn before the call returned. Not a failure, so not red. */
export type ToolStatus = "pending" | "running" | "done" | "error" | "stopped";

export const TOOL_STATUS_META: Record<ToolStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "text-ink-faint" },
  running: { label: "Running", cls: "text-blu" },
  done: { label: "Completed", cls: "text-ink-faint" },
  error: { label: "Failed", cls: "text-red" },
  stopped: { label: "Stopped", cls: "text-ink-faint" },
};

/** The tool's state as one glyph. Failure outranks progress. */
export function ToolStatusIcon({ status }: { status: ToolStatus }) {
  if (status === "error") return <CircleAlert className="text-red" />;
  if (status === "running") return <Spinner size={14} tone="blu" label={null} />;
  if (status === "pending") return <CircleDashed className="text-ink-faint" />;
  if (status === "stopped") return <CircleStop className="text-ink-faint" />;
  return <Wrench className="text-ink-dim" />;
}

/** One-line summary of a tool's input: the command, path, pattern or query it ran on. */
export function toolSummary(input: unknown): string {
  if (typeof input === "string") return input.split("\n")[0].trim();
  if (!input || typeof input !== "object") return "";
  const record = input as Record<string, unknown>;
  const pick = (key: string) => (typeof record[key] === "string" ? (record[key] as string).trim().split("\n")[0] : "");
  if (pick("pattern") && pick("path")) return `${pick("pattern")} ${pick("path")}`;
  for (const key of ["command", "description", "file_path", "path", "pattern", "query", "repo", "url", "prompt"]) {
    const value = pick(key);
    if (!value) continue;
    if (key !== "repo") return value;
    /* MCP calls read best as their arguments: repo=quirq-ai/galileo state=open */
    return Object.entries(record)
      .filter(([, v]) => typeof v === "string" || typeof v === "number")
      .map(([k, v]) => `${k}=${v}`)
      .join(" ");
  }
  return "";
}

/** Raw tool input as text: strings as typed, objects as two-space JSON. */
export function formatToolInput(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input === "string") return input;
  if (typeof input === "number" || typeof input === "boolean") return String(input);
  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return "[unserializable input]";
  }
}

const TOOL_OUTPUT_MAX = 4000;

function ToolPane({ label, body, tone = "dim" }: { label: string; body: string; tone?: "dim" | "error" }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <pre
        className={cn(
          "scroll-thin max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-[8px] border border-hair-soft bg-black/45 p-2.5 font-mono text-[11px] leading-relaxed",
          tone === "error" ? "text-[#ff8a80]" : "text-ink-dim",
        )}
      >
        {body}
      </pre>
    </div>
  );
}

/* ----------------------------------------------------------------------------- disclosure */

function Disclosure({
  row,
  detail,
  open,
  onToggle,
  label,
}: {
  row: ReactNode;
  detail: ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Accessible name when the row's text alone would read badly. aria-expanded carries the state. */
  label?: string;
}) {
  const panelId = useId();
  return (
    <div className="min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={onToggle}
        className="group/marker -mx-1.5 flex w-[calc(100%+12px)] min-w-0 items-center gap-2 rounded-[8px]! px-1.5 py-1 text-left text-[12.5px] leading-5 text-ink-dim transition-colors hover:bg-white/[0.035] hover:text-ink"
      >
        {row}
        <ChevronRight
          aria-hidden="true"
          className={cn("size-3.5 shrink-0 text-ink-faint transition-transform duration-150", open && "rotate-90")}
        />
      </button>
      <div id={panelId} hidden={!open} className="mt-1.5 ml-[7px] flex min-w-0 flex-col gap-2.5 border-l border-hair pb-1 pl-3.5">
        {open ? detail : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- ToolCallMarker */

export type ToolCallMarkerProps = {
  /** Tool name as the runtime reports it: Read, Grep, Bash, github.list_issues. */
  tool: string;
  /** Overrides the summary derived from input. */
  summary?: string;
  input?: unknown;
  /** null while the call has not returned. */
  output?: string | null;
  status: ToolStatus;
  /** Small mono note before the status: a duration, "+7 −3". */
  meta?: ReactNode;
  /** Custom expanded content (a diff); replaces the Input and Output panes. */
  detail?: ReactNode;
  defaultOpen?: boolean;
  /** Hide the status word (dense lists). */
  hideStatus?: boolean;
  className?: string;
};

/** One tool call, collapsed to a single line; the line opens its input and output. */
export function ToolCallMarker({
  tool,
  summary,
  input,
  output = null,
  status,
  meta,
  detail,
  defaultOpen = false,
  hideStatus = false,
  className,
}: ToolCallMarkerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const line = summary ?? toolSummary(input);
  const inputText = formatToolInput(input);
  const outputText = output ? (output.length > TOOL_OUTPUT_MAX ? `${output.slice(0, TOOL_OUTPUT_MAX)}\n… truncated` : output) : "";
  const failed = status === "error";
  const st = TOOL_STATUS_META[status];

  const row = (
    <>
      <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
        <ToolStatusIcon status={status} />
      </span>
      <span className={cn("shrink-0 font-medium", failed ? "text-red" : "text-ink")}>{tool}</span>
      {line ? (
        <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink-faint" title={line}>
          {line}
        </span>
      ) : (
        <span className="flex-1" />
      )}
      {meta ? <span className="hidden shrink-0 font-mono text-[10.5px] tabular-nums text-ink-faint sm:inline">{meta}</span> : null}
      {hideStatus ? <span className="sr-only">{st.label}</span> : <span className={cn("shrink-0 text-[11.5px]", st.cls)}>{st.label}</span>}
    </>
  );

  const content =
    detail ??
    (inputText || outputText || status === "running" ? (
      <>
        {inputText ? <ToolPane label="Input" body={inputText} /> : null}
        {outputText ? (
          <ToolPane label="Output" body={outputText} tone={failed ? "error" : "dim"} />
        ) : status === "running" || status === "pending" ? (
          <p className="flex items-center gap-2 text-[11.5px] text-ink-faint">
            {status === "running" ? <Spinner size="xs" label={null} /> : null}
            {status === "running" ? "Waiting for output…" : "Not started yet."}
          </p>
        ) : null}
      </>
    ) : null);

  if (!content) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2 py-1 text-[12.5px] leading-5 text-ink-dim", className)}>{row}</div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <Disclosure
        row={row}
        detail={content}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        label={`${tool}${line ? ` ${line}` : ""}, ${st.label}`}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- ReasoningMarker */

export type ReasoningMarkerProps = {
  text: string;
  /** Still thinking: label reads "Thinking…" with a spinner. */
  thinking?: boolean;
  /** Override "Thought about this". */
  label?: string;
  /** Mono note such as "6s". */
  meta?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/** The model talking to itself: worth being able to open, never worth reading first. */
export function ReasoningMarker({ text, thinking = false, label, meta, defaultOpen = false, className }: ReasoningMarkerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const title = label ?? (thinking ? "Thinking…" : "Thought about this");
  const row = (
    <>
      <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
        <Brain className={cn("size-4", thinking ? "text-pur" : "text-ink-dim")} />
      </span>
      <span className={cn("min-w-0 truncate", thinking && "text-ink")}>{title}</span>
      {thinking ? <Spinner size="xs" label={null} className="text-ink-faint" /> : null}
      <span className="flex-1" />
      {meta ? <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-faint">{meta}</span> : null}
    </>
  );
  return (
    <div className={cn("min-w-0", className)}>
      <Disclosure
        row={row}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        detail={<p className="whitespace-pre-wrap text-[12px] leading-relaxed text-ink-faint">{text}</p>}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- WorkingMarker */

/** The live line for work happening before text arrives. Sits inside the turn it belongs to. */
export function WorkingMarker({ label = "Working…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex min-w-0 items-center gap-2 py-1 text-[12.5px] leading-5 text-ink-dim", className)}>
      <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
        <Spinner size={14} label={null} />
      </span>
      <span className="truncate bg-[linear-gradient(90deg,var(--ink-dim)_0%,var(--ink)_50%,var(--ink-dim)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:q-shimmer_2.2s_linear_infinite]">
        {label}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------- StepsMarker */

export type StepStatus = "pending" | "in_progress" | "blocked" | "completed" | "cancelled";

function StepGlyph({ status }: { status: StepStatus }) {
  if (status === "completed") return <Check className="size-3.5 text-grn" strokeWidth={2.6} />;
  if (status === "in_progress") return <StatusDot status="busy" size="sm" pulse />;
  if (status === "blocked") return <StatusDot status="warn" size="sm" />;
  return <Circle className="size-3 text-ink-faint" />;
}

const STEP_LABEL: Record<StepStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type StepsMarkerProps = {
  steps: { content: string; status: StepStatus }[];
  defaultOpen?: boolean;
  className?: string;
};

/** A session's steps as one line ("Steps · 1 of 5 completed") that opens the checklist. */
export function StepsMarker({ steps, defaultOpen = true, className }: StepsMarkerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const done = steps.filter((s) => s.status === "completed").length;
  const row = (
    <>
      <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
        <ListChecks className="size-4 text-ink-dim" />
      </span>
      <span className="shrink-0 font-medium text-ink">Steps</span>
      <span className="min-w-0 flex-1 truncate text-ink-faint">
        {done} of {steps.length} completed
      </span>
    </>
  );
  return (
    <div className={cn("min-w-0", className)}>
      <Disclosure
        row={row}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        label={`Steps, ${done} of ${steps.length} completed`}
        detail={
          <ol className="flex flex-col gap-1">
            {steps.map((s, i) => (
              <li key={i} className="flex min-w-0 items-center gap-2.5 text-[12.5px] leading-5">
                <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">
                  <StepGlyph status={s.status} />
                </span>
                <span
                  className={cn(
                    "min-w-0 truncate",
                    s.status === "completed" ? "text-ink-faint" : s.status === "cancelled" ? "text-ink-faint line-through" : "text-ink-dim",
                    s.status === "in_progress" && "text-ink",
                  )}
                >
                  {s.content}
                </span>
                <span className="sr-only">, {STEP_LABEL[s.status]}</span>
              </li>
            ))}
          </ol>
        }
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- InlineDiff */

export type InlineDiffLine = { type: "hunk" | "ctx" | "add" | "del"; text: string; oldNo: number | null; newNo: number | null };

/** Numbered unified diff for an Edit's detail: old and new gutters, tinted adds and deletes. */
export function InlineDiff({ path, lines, className }: { path: string; lines: InlineDiffLine[]; className?: string }) {
  return (
    <figure className={cn("min-w-0 overflow-hidden rounded-[8px] border border-hair-soft bg-black/45", className)}>
      <figcaption className="border-b border-hair-soft px-2.5 py-1.5 font-mono text-[10.5px] text-ink-faint">{path}</figcaption>
      <div className="scroll-thin max-h-64 overflow-auto">
        <table className="w-full border-collapse font-mono text-[11px] leading-[1.65]">
          <tbody>
            {lines.map((l, i) => (
              <tr
                key={i}
                className={cn(
                  l.type === "add" && "bg-grn/[0.08]",
                  l.type === "del" && "bg-red/[0.08]",
                  l.type === "hunk" && "bg-blu/[0.06]",
                )}
              >
                <td className="w-8 select-none px-1.5 text-right tabular-nums text-ink-faint">{l.oldNo ?? ""}</td>
                <td className="w-8 select-none px-1.5 text-right tabular-nums text-ink-faint">{l.newNo ?? ""}</td>
                <td
                  className={cn(
                    "w-4 select-none text-center",
                    l.type === "add" ? "text-grn" : l.type === "del" ? "text-red" : "text-ink-faint",
                  )}
                  aria-hidden="true"
                >
                  {l.type === "add" ? "+" : l.type === "del" ? "-" : ""}
                </td>
                <td
                  className={cn(
                    "whitespace-pre pr-3",
                    l.type === "hunk" ? "text-blu" : l.type === "add" ? "text-[#8fe3a5]" : l.type === "del" ? "text-[#ff9b93]" : "text-ink-dim",
                  )}
                >
                  <span className="sr-only">{l.type === "add" ? "Added: " : l.type === "del" ? "Removed: " : ""}</span>
                  {l.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
