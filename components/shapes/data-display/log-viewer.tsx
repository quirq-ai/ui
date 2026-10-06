"use client";

// LogViewer: line-numbered mono log with level tags, a follow-tail toggle, copy, and the
// streaming, idle, loading and offline states. Scrolling up pauses follow; scrolling back to
// the bottom or pressing "Jump to latest" resumes it. Lines come in through props, so the
// caller decides how they stream; new lines are counted by id, so a sliding window of the
// latest lines works as well as an ever-growing list. Line numbers follow the line ids.
import { useEffect, useRef, useState, type ReactNode, type UIEvent } from "react";
import { ArrowDownToLine, CaptionsOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LogLevel, LogLine } from "@/lib/fixtures";
import { CopyButton } from "@/components/ui/copy-button";
import { LoadingLine } from "@/components/ui/loaders";
import { StatusPill, type DotStatus } from "@/components/ui/status";
import { ToggleButton } from "./controls";

export type LogViewerState = "streaming" | "idle" | "loading" | "offline";

const STATE_META: Record<LogViewerState, { dot: DotStatus; label: string; pulse?: boolean }> = {
  streaming: { dot: "up", label: "Streaming", pulse: true },
  idle: { dot: "idle", label: "Idle" },
  loading: { dot: "busy", label: "Loading", pulse: true },
  offline: { dot: "down", label: "Offline" },
};

const LEVEL_CLS: Record<LogLevel, string> = {
  debug: "text-ink-faint",
  info: "text-blu",
  warn: "text-yel",
  error: "text-red",
};

export type LogViewerProps = {
  /** Lines in order. Ids must increase; they double as the line numbers in the gutter. */
  lines: LogLine[];
  /** Accessible name and title: "Agent logs". */
  title: string;
  state?: LogViewerState;
  /** Body height in px. */
  height?: number;
  /** Extra controls on the left of the toolbar, such as Agent and Build tabs. */
  toolbar?: ReactNode;
  showTime?: boolean;
  showSource?: boolean;
  offlineTitle?: string;
  offlineText?: string;
  loadingText?: string;
  className?: string;
};

function lineText(l: LogLine) {
  return `${l.time} ${l.level.toUpperCase()} [${l.source}] ${l.message}`;
}

/** Live log with follow tail. */
export function LogViewer({
  lines,
  title,
  state = "idle",
  height = 280,
  toolbar,
  showTime = true,
  showSource = true,
  offlineTitle = "Logs unavailable",
  offlineText = "The space is stopped. Start the space to view logs.",
  loadingText = "Loading logs…",
  className,
}: LogViewerProps) {
  const [follow, setFollow] = useState(true);
  /* id of the newest line when follow paused, so the jump chip can say how many arrived since */
  const [pausedAtId, setPausedAtId] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const meta = STATE_META[state];
  const hasLines = state !== "offline" && state !== "loading" && lines.length > 0;
  const lastId = lines.length ? lines[lines.length - 1].id : 0;
  const unseen = follow ? 0 : lines.filter((l) => l.id > pausedAtId).length;
  const gutter = `${Math.max(3, String(lastId).length)}ch`;

  useEffect(() => {
    const el = box.current;
    if (el && follow) el.scrollTop = el.scrollHeight;
  }, [lastId, follow, state]);

  function pause() {
    setFollow(false);
    setPausedAtId(lastId);
  }

  function onScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 16;
    if (!atBottom && follow) pause();
    else if (atBottom && !follow) setFollow(true);
  }

  function toggleFollow() {
    if (follow) pause();
    else setFollow(true);
  }

  /* The chip disappears once followed, so hand focus to the log instead of dropping it. */
  function jumpToLatest() {
    setFollow(true);
    box.current?.focus();
  }

  return (
    <section aria-label={title} className={cn("min-w-0 overflow-hidden rounded-[12px] border border-hair bg-[#0a0a0c]", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hair-soft px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {toolbar}
          <StatusPill status={meta.dot} label={meta.label} pulse={meta.pulse} />
          {hasLines ? <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{lines.length} lines</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ToggleButton pressed={follow && hasLines} onClick={toggleFollow} disabled={!hasLines} icon={<ArrowDownToLine />} className="disabled:opacity-40">
            Follow
          </ToggleButton>
          {hasLines ? (
            <CopyButton
              text={lines.map(lineText).join("\n")}
              variant="labelled"
              size="sm"
              aria-label={`Copy ${title.toLowerCase()}`}
              announce="Logs copied"
            />
          ) : null}
        </div>
      </div>

      <div className="relative">
        {state === "loading" ? (
          <div className="grid place-items-center" style={{ height }}>
            <LoadingLine>{loadingText}</LoadingLine>
          </div>
        ) : state === "offline" || lines.length === 0 ? (
          <div className="grid place-items-center px-6 text-center" style={{ height }}>
            <div>
              <span className="mx-auto grid size-11 place-items-center rounded-full border border-hair bg-s2 text-ink-dim">
                <CaptionsOff aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 text-[14px] font-semibold text-ink">{offlineTitle}</p>
              <p className="mx-auto mt-1 max-w-[36ch] text-[12.5px] leading-[1.55] text-ink-dim">{offlineText}</p>
            </div>
          </div>
        ) : (
          <div
            ref={box}
            onScroll={onScroll}
            tabIndex={0}
            role="region"
            aria-label={`${title} output`}
            className="scroll-thin overflow-auto py-2 font-mono text-[12px] leading-[1.8]"
            style={{ height }}
          >
            <ol className="w-max min-w-full">
              {lines.map((l) => (
                <li
                  key={l.id}
                  className={cn(
                    "flex gap-3 whitespace-nowrap pl-2 pr-4 transition-colors hover:bg-white/[0.045]",
                    l.level === "error" && "bg-red/[0.06]",
                  )}
                >
                  <span aria-hidden="true" className="shrink-0 select-none text-right tabular-nums text-ink-faint/60" style={{ width: gutter }}>
                    {l.id}
                  </span>
                  {showTime ? <span className="shrink-0 tabular-nums text-ink-faint">{l.time}</span> : null}
                  <span className={cn("w-[5ch] shrink-0 font-medium", LEVEL_CLS[l.level])}>{l.level.toUpperCase()}</span>
                  {showSource ? <span className="shrink-0 text-ink-dim">[{l.source}]</span> : null}
                  <span className="text-ink">{l.message}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {unseen > 0 && hasLines ? (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full! border border-hair-strong bg-s3 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:bg-s4"
          >
            <ArrowDownToLine aria-hidden="true" className="size-3.5" />
            {unseen} new · Jump to latest
          </button>
        ) : null}
      </div>
    </section>
  );
}
