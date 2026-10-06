"use client";

// Chat composer: an auto-growing prompt box with the project the chat runs in and a Send or
// Stop control. Two layouts from the product: "card" (the swarm org chat: textarea over an
// addon row with the project picker and a round send button) and "bar" (the space dashboard:
// project select, textarea and text buttons in one row on s2). Enter sends, Shift+Enter adds a
// line. The project is chosen only while the chat is new; an existing chat shows where it runs.
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, ChevronDown, Folder, Info, Square, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/loaders";

export type ComposerStatus = "ready" | "responding" | "down";
export type ComposerProject = { id: string; label: string };

/** The root option: the chat runs in the space's projects folder, not inside one project. */
export const PROJECTS_ROOT_LABEL = "Projects folder";

export const COMPOSER_PLACEHOLDER: Record<ComposerStatus, string> = {
  ready: "Ask the agent something…",
  responding: "Agent is responding…",
  down: "Space is not up. Waiting for agent…",
};

/* ----------------------------------------------------------------------------- ProjectPicker */

export type ProjectPickerProps = {
  /** null while the list loads: renders a skeleton of the same size. */
  projects: ComposerProject[] | null;
  /** null = the projects folder root. */
  value: string | null;
  onChange?: (id: string | null) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  rootLabel?: string;
  className?: string;
};

/** Where the next new conversation runs: a project, or the projects folder. Native select. */
export function ProjectPicker({
  projects,
  value,
  onChange,
  disabled,
  size = "sm",
  rootLabel = PROJECTS_ROOT_LABEL,
  className,
}: ProjectPickerProps) {
  if (projects === null) {
    return <Skeleton width={size === "sm" ? 150 : 160} height={size === "sm" ? 28 : 38} radius={8} className={cn("shrink-0", className)} />;
  }
  return (
    <div
      className={cn("relative inline-flex min-w-0 shrink", size === "sm" ? "h-7 max-w-[60%]" : "h-[38px]", className)}
      title="Where this chat runs. A conversation stays where it started."
    >
      <Folder aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
      <select
        aria-label="Project this chat runs in"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value || null)}
        className={cn(
          "w-full min-w-0 cursor-pointer appearance-none truncate border pl-8 pr-7 text-ink-dim transition-colors hover:border-hair-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-60",
          size === "sm" ? "h-7 rounded-[8px]! border-hair bg-s2 text-[12px]" : "h-[38px] rounded-[8px]! border-hair-soft bg-s3 text-[12.5px]",
        )}
      >
        <option value="">{rootLabel}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}

/* ----------------------------------------------------------------------------- ProjectLabel */

export type ProjectLabelProps = {
  /** Project name, PROJECTS_ROOT_LABEL, or null while the session row loads. */
  label: string | null;
  /** The space does not know this session yet (stale link, row not written). */
  unknown?: boolean;
  size?: "sm" | "md";
  className?: string;
};

/** Which project an existing conversation runs in. Read-only: a chat stays where it started. */
export function ProjectLabel({ label, unknown = false, size = "sm", className }: ProjectLabelProps) {
  if (label === null && !unknown) return <Skeleton width={140} height={size === "sm" ? 28 : 38} radius={8} className={cn("shrink-0", className)} />;
  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-[60%] items-center gap-1.5 text-[12px] text-ink-faint",
        size === "sm" ? "h-7" : "h-[38px]",
        className,
      )}
      title="The project this conversation runs in. A chat stays where it started."
    >
      <Folder aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">Runs in </span>
      <span className="truncate">{unknown ? "Unknown project" : label}</span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- ChatComposer */

export type ChatComposerProps = {
  /** new: the project can still be chosen; existing: the project is shown as a label. */
  mode?: "new" | "existing";
  status?: ComposerStatus;
  layout?: "card" | "bar";
  projects?: ComposerProject[] | null;
  /** Controlled project (null = projects folder). */
  projectId?: string | null;
  defaultProjectId?: string | null;
  onProjectChange?: (id: string | null) => void;
  /** Existing chat: the project it runs in (null while loading). */
  sessionProject?: string | null;
  onSend?: (text: string) => void;
  onStop?: () => void;
  /** Red line above the box, announced as an alert. */
  error?: ReactNode;
  /** Muted line above the box. */
  notice?: ReactNode;
  placeholder?: string;
  defaultValue?: string;
  /** Show the Enter and Shift+Enter hint (card layout, wide screens). */
  hint?: boolean;
  /** Accessible name for the prompt box. */
  label?: string;
  className?: string;
};

const MAX_HEIGHT = 160;

/** Prompt box with project choice and Send or Stop. */
export function ChatComposer({
  mode = "new",
  status = "ready",
  layout = "card",
  projects = [],
  projectId,
  defaultProjectId = null,
  onProjectChange,
  sessionProject = null,
  onSend,
  onStop,
  error,
  notice,
  placeholder,
  defaultValue = "",
  hint = true,
  label = "Message the agent",
  className,
}: ChatComposerProps) {
  const id = useId();
  const hintId = `${id}-keys`;
  const area = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(defaultValue);
  const [innerProject, setInnerProject] = useState<string | null>(defaultProjectId);
  const project = projectId !== undefined ? projectId : innerProject;
  const down = status === "down";
  const busy = status === "responding";
  const bar = layout === "bar";
  const canSend = !down && !busy && text.trim().length > 0;

  function fit(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, MAX_HEIGHT)}px`;
  }

  // Size a prefilled box once on mount.
  useEffect(() => {
    if (area.current && defaultValue) fit(area.current);
  }, [defaultValue]);

  // The card disables the box while a turn generates, which drops focus to the page. Hand it
  // back when the turn ends, without scrolling, unless the person has moved on elsewhere.
  const wasBusy = useRef(busy);
  useEffect(() => {
    const dropped = document.activeElement === null || document.activeElement === document.body;
    if (wasBusy.current && status === "ready" && dropped) area.current?.focus({ preventScroll: true });
    wasBusy.current = status === "responding";
  }, [status]);

  function submit() {
    if (!canSend) return;
    onSend?.(text.trim());
    setText("");
    if (area.current) area.current.style.height = "";
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function chooseProject(next: string | null) {
    if (projectId === undefined) setInnerProject(next);
    onProjectChange?.(next);
  }

  const where =
    mode === "new" ? (
      <ProjectPicker
        projects={projects}
        value={project}
        onChange={chooseProject}
        disabled={down || busy}
        size={bar ? "md" : "sm"}
        className={bar ? "w-full sm:w-auto sm:max-w-[180px]" : undefined}
      />
    ) : (
      <ProjectLabel label={sessionProject} size={bar ? "md" : "sm"} />
    );

  const lines =
    error || notice ? (
      <div className={cn("flex flex-col gap-1.5", bar && "px-4 sm:px-6")}>
        {error ? (
          <p role="alert" className="flex items-start gap-2 text-[12px] leading-snug text-[#ff8a80]">
            <TriangleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
        {notice ? (
          <p className="flex items-start gap-2 text-[12px] leading-snug text-ink-faint">
            <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            <span>{notice}</span>
          </p>
        ) : null}
      </div>
    ) : null;

  if (bar) {
    return (
      <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
        {lines}
        <form
          onSubmit={onSubmit}
          aria-busy={busy || undefined}
          className={cn(
            "flex flex-wrap items-end gap-2.5 border-t border-hair-soft bg-s2 px-4 py-3.5 sm:flex-nowrap sm:px-6",
            down && "cursor-not-allowed opacity-60",
          )}
        >
          {where}
          <label htmlFor={id} className="sr-only">
            {label}
          </label>
          <span id={hintId} className="sr-only">
            Enter to send, Shift+Enter for a new line.
          </span>
          <textarea
            id={id}
            ref={area}
            rows={1}
            value={text}
            disabled={down}
            placeholder={placeholder ?? (down ? COMPOSER_PLACEHOLDER.down : "Message the agent…")}
            aria-describedby={hintId}
            onChange={(e) => {
              setText(e.target.value);
              fit(e.target);
            }}
            onKeyDown={onKeyDown}
            className="scroll-thin max-h-40 min-h-[38px] min-w-0 flex-1 basis-[180px] resize-none rounded-[10px]! border border-hair-soft bg-s3 px-3 py-[8px] text-[13px] leading-[1.5] text-ink placeholder:text-ink-faint transition-colors focus:border-hair-strong disabled:cursor-not-allowed"
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="submit"
              disabled={!canSend}
              className="h-[38px] rounded-[9px]! bg-ink px-4 text-[12.5px] font-semibold text-black transition-[background-color,opacity] hover:bg-[#e8e8e6] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Send
            </button>
            {busy ? (
              <button
                type="button"
                onClick={onStop}
                className="h-[38px] rounded-[9px]! border border-red/60 px-3.5 text-[12.5px] font-medium text-[#ff8a80] transition-colors hover:bg-red/10"
              >
                Stop
              </button>
            ) : null}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      {lines}
      <form
        onSubmit={onSubmit}
        aria-busy={busy || undefined}
        className={cn(
          "rounded-[16px] border border-hair bg-s1 transition-[border-color,box-shadow] focus-within:border-white/25",
          "has-[textarea:focus-visible]:border-white/45 has-[textarea:focus-visible]:shadow-[0_0_0_3px_rgba(244,243,240,0.12)]",
          down && "cursor-not-allowed opacity-60",
        )}
      >
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <span id={hintId} className="sr-only">
          Enter to send, Shift+Enter for a new line.
        </span>
        <textarea
          id={id}
          ref={area}
          rows={2}
          value={text}
          disabled={down || busy}
          placeholder={placeholder ?? COMPOSER_PLACEHOLDER[status]}
          aria-describedby={hintId}
          onChange={(e) => {
            setText(e.target.value);
            fit(e.target);
          }}
          onKeyDown={onKeyDown}
          className="scroll-thin block max-h-40 min-h-14 w-full resize-none rounded-t-[16px]! bg-transparent px-3.5 pb-1 pt-3 text-[13.5px] leading-[1.55] text-ink placeholder:text-ink-faint focus-visible:outline-none! disabled:cursor-not-allowed"
        />
        <div className="flex min-w-0 items-center gap-2 px-2.5 pb-2.5 pt-1">
          {where}
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {hint ? (
              <span aria-hidden="true" className="hidden items-center gap-1 text-[11px] text-ink-faint md:inline-flex">
                <Kbd size="xs" subtle>
                  enter
                </Kbd>
                send
                <span className="mx-1 text-ink-faint/60">·</span>
                <Kbd size="xs" subtle>
                  shift
                </Kbd>
                <Kbd size="xs" subtle>
                  enter
                </Kbd>
                new line
              </span>
            ) : null}
            {busy ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop"
                className="inline-flex size-8 items-center justify-center rounded-full! border border-hair-strong bg-s3 text-ink transition-colors hover:bg-s4"
              >
                <Square aria-hidden="true" className="size-3 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!canSend}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full! border transition-colors",
                  canSend ? "border-ink bg-ink text-black hover:bg-[#e8e8e6]" : "cursor-not-allowed border-hair bg-s3 text-ink-faint",
                )}
              >
                <ArrowUp aria-hidden="true" className="size-4" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
