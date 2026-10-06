// ChatTranscript: renders a list of transcript items as turns. The person's prompt is an ink
// bubble on the right with their avatar; everything the agent does until the next prompt is
// one turn on the left under the runtime's avatar, interleaved in the order it happened
// (prose, tool calls, steps, files, diffs, approvals, errors) because the order is the story.
// Data in, markup out: callers map their own records into TranscriptItem. Server-safe; the
// markers it uses carry their own client boundary.
import type { ReactNode } from "react";
import { FileCode2, FilePen, FilePlus2, RotateCw, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import type { LogoId } from "@/components/ui/runtime-logo";
import { Bubble } from "./bubble";
import { ChatMessageRow, TurnHeader } from "./message";
import {
  InlineDiff,
  Marker,
  ReasoningMarker,
  StepsMarker,
  ToolCallMarker,
  WorkingMarker,
  type InlineDiffLine,
  type StepStatus,
  type ToolStatus,
} from "./markers";
import { ChatProse, renderInline } from "./prose";

export type TranscriptItem =
  | { kind: "user"; id: string; author: string; text: string; time: string }
  | { kind: "text"; id: string; text: string; time?: string; streaming?: boolean }
  /** Turn started, no text yet: a bubble holding a spinner. */
  | { kind: "pending"; id: string; time?: string }
  | { kind: "tool"; id: string; tool: string; input?: unknown; output?: string | null; status: ToolStatus; summary?: string; meta?: string; time?: string }
  | { kind: "reasoning"; id: string; text: string; thinking?: boolean; meta?: string; time?: string }
  | { kind: "steps"; id: string; steps: { content: string; status: StepStatus }[]; time?: string }
  | { kind: "file"; id: string; path: string; action: "created" | "edited" | "read"; size?: string; time?: string }
  | { kind: "diff"; id: string; path: string; additions: number; deletions: number; lines: InlineDiffLine[]; time?: string }
  | { kind: "approval"; id: string; title: string; command: string; state: "pending" | "approved" | "denied"; choice?: string; time?: string }
  | { kind: "error"; id: string; title: string; detail: string; retryable?: boolean; time?: string }
  | { kind: "working"; id: string; label: string }
  | { kind: "separator"; id: string; label: string };

export type TranscriptAgent = {
  /** Display name above each turn: "Claude Code". */
  name: string;
  runtime: LogoId;
  /** Model label: "Claude Opus". */
  model?: string;
};

export type ChatTranscriptProps = {
  items: TranscriptItem[];
  agent: TranscriptAgent;
  /** Retry handler for retryable errors; the button is hidden without it. */
  onRetry?: (id: string) => void;
};

type Group =
  | { type: "user"; item: Extract<TranscriptItem, { kind: "user" }> }
  | { type: "separator"; item: Extract<TranscriptItem, { kind: "separator" }> }
  | { type: "agent"; id: string; items: TranscriptItem[] };

function groupTurns(items: TranscriptItem[]): Group[] {
  const out: Group[] = [];
  for (const item of items) {
    if (item.kind === "user") out.push({ type: "user", item });
    else if (item.kind === "separator") out.push({ type: "separator", item });
    else {
      const last = out[out.length - 1];
      if (last && last.type === "agent") last.items.push(item);
      else out.push({ type: "agent", id: item.id, items: [item] });
    }
  }
  return out;
}

const FILE_ICON = { created: FilePlus2, edited: FilePen, read: FileCode2 } as const;
const FILE_VERB = { created: "Created", edited: "Edited", read: "Read" } as const;

function AgentPart({ item, onRetry }: { item: TranscriptItem; onRetry?: (id: string) => void }): ReactNode {
  switch (item.kind) {
    case "text":
      return <ChatProse text={item.text} streaming={item.streaming} />;
    case "pending":
      return (
        <Bubble variant="muted">
          <Spinner size="sm" label="Agent is responding" className="my-1 text-ink-dim" />
        </Bubble>
      );
    case "tool":
      return (
        <ToolCallMarker tool={item.tool} input={item.input} output={item.output} status={item.status} summary={item.summary} meta={item.meta} />
      );
    case "reasoning":
      return <ReasoningMarker text={item.text} thinking={item.thinking} meta={item.meta} />;
    case "steps":
      return <StepsMarker steps={item.steps} />;
    case "file": {
      const Icon = FILE_ICON[item.action];
      return (
        <Marker icon={<Icon className="text-ink-dim" />} trailing={item.size}>
          {FILE_VERB[item.action]} <code className="font-mono text-[11.5px] text-ink">{item.path}</code>
        </Marker>
      );
    }
    case "diff":
      return (
        <ToolCallMarker
          tool="Edit"
          summary={item.path}
          status="done"
          meta={
            <>
              <span className="text-grn">+{item.additions}</span> <span className="text-red">-{item.deletions}</span>
            </>
          }
          detail={<InlineDiff path={item.path} lines={item.lines} />}
        />
      );
    case "approval": {
      const meta =
        item.state === "approved"
          ? { icon: <ShieldCheck className="text-grn" />, word: "Approved" }
          : item.state === "denied"
            ? { icon: <ShieldX className="text-red" />, word: "Denied" }
            : { icon: <ShieldAlert className="text-org" />, word: "Waiting for approval" };
      return (
        <Marker icon={meta.icon} trailing={item.choice}>
          <span className="text-ink">{meta.word}</span>
          <span className="text-ink-faint"> · </span>
          <code className="font-mono text-[11.5px] text-ink-dim">{item.command}</code>
        </Marker>
      );
    }
    case "error":
      return (
        <Bubble variant="destructive" tail={false} wide className="w-full sm:w-auto">
          {/* Not role="alert": a stored error is history, and announcing it on every load is noise. */}
          <p className="font-medium">{renderInline(item.title)}</p>
          <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[#ff9b93]/85">{item.detail}</pre>
          {item.retryable && onRetry ? (
            <Button size="sm" variant="danger" className="mt-2.5" leadingIcon={<RotateCw />} onClick={() => onRetry(item.id)}>
              Try again
            </Button>
          ) : null}
        </Bubble>
      );
    case "working":
      return <WorkingMarker label={item.label} />;
    default:
      return null;
  }
}

function firstTime(items: TranscriptItem[]): string | undefined {
  for (const it of items) if ("time" in it && it.time) return it.time;
  return undefined;
}

/** A whole conversation as turns, newest last. */
export function ChatTranscript({ items, agent, onRetry }: ChatTranscriptProps) {
  const groups = groupTurns(items);
  return (
    <>
      {groups.map((g) => {
        if (g.type === "separator") {
          return (
            <Marker key={g.item.id} variant="separator" className="text-[11.5px] text-ink-faint">
              {g.item.label}
            </Marker>
          );
        }
        if (g.type === "user") {
          return (
            <ChatMessageRow
              key={g.item.id}
              align="end"
              avatar={<Avatar name={g.item.author} size="md" />}
              footer={g.item.time}
            >
              <Bubble variant="default" align="end">
                <p className="whitespace-pre-wrap">{renderInline(g.item.text)}</p>
              </Bubble>
            </ChatMessageRow>
          );
        }
        const time = firstTime(g.items);
        return (
          <ChatMessageRow
            key={g.id}
            align="start"
            avatar={<Avatar name={agent.name} runtime={agent.runtime} size="md" />}
            header={<TurnHeader name={agent.name} model={agent.model} time={time} />}
          >
            <div className="flex min-w-0 flex-col gap-2">
              {g.items.map((it) => (
                <div key={it.id} className="min-w-0">
                  <AgentPart item={it} onRetry={onRetry} />
                </div>
              ))}
            </div>
          </ChatMessageRow>
        );
      })}
    </>
  );
}
