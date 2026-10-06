// Fixture adapters for the chat demos: map the shared mock records into the view models the
// components take (TranscriptItem, HistoryRow, ComposerProject, PromptTurn). Pure data, no
// hooks; every value derives from lib/fixtures so server and client agree.
import {
  CHAT_HISTORY,
  CHAT_TRANSCRIPT,
  CURRENT_SPACE,
  MODELS,
  PEOPLE,
  PROJECT_BY_ID,
  PROJECTS,
  RUNTIME_BY_ID,
  SESSION_BY_ID,
  minutesAgo,
  type ChatMessage,
  type RuntimeId as FixtureRuntimeId,
} from "@/lib/fixtures";
import { formatBytes, formatDateTime, formatLatency, formatTime } from "@/lib/format";
import type { LogoId } from "@/components/ui/runtime-logo";
import type { TranscriptAgent, TranscriptItem } from "./transcript";
import type { HistoryRow } from "./history";
import type { ComposerProject } from "./composer";
import type { PromptTurn } from "./prompt-turns";

/** Fixture runtime ids to logo ids (gemini_cli ships as the gemini logo). */
function logoFor(runtime: FixtureRuntimeId): LogoId {
  return runtime === "gemini_cli" ? "gemini" : runtime;
}

export const SESSION = CHAT_TRANSCRIPT.session;
export const SESSION_PROJECT = PROJECT_BY_ID[SESSION.projectId];

export const AGENT: TranscriptAgent = {
  name: RUNTIME_BY_ID[SESSION.runtime].label,
  runtime: logoFor(SESSION.runtime),
  model: MODELS[SESSION.model].label,
};

const TOOL_STATUS = { ok: "done", error: "error", running: "running" } as const;

function toItem(m: ChatMessage): TranscriptItem {
  switch (m.kind) {
    case "user":
      return { kind: "user", id: m.id, author: PEOPLE[m.author].name, text: m.text, time: m.time };
    case "assistant":
      return { kind: "text", id: m.id, text: m.text, time: m.time, streaming: m.streaming };
    case "steps":
      return { kind: "steps", id: m.id, steps: m.steps, time: m.time };
    case "tool_call":
      return {
        kind: "tool",
        id: m.id,
        tool: m.name,
        input: m.input,
        output: m.output,
        status: TOOL_STATUS[m.status],
        meta: m.durationMs === null ? undefined : formatLatency(m.durationMs),
        time: m.time,
      };
    case "file":
      return { kind: "file", id: m.id, path: m.path, action: m.action, size: formatBytes(m.size), time: m.time };
    case "diff":
      return { kind: "diff", id: m.id, path: m.path, additions: m.additions, deletions: m.deletions, lines: m.lines, time: m.time };
    case "approval":
      return {
        kind: "approval",
        id: m.id,
        title: m.title,
        command: m.command,
        state: m.state,
        choice: m.state === "approved" ? m.options[0] : undefined,
        time: m.time,
      };
    case "error":
      return { kind: "error", id: m.id, title: m.title, detail: m.detail, retryable: m.retryable, time: m.time };
  }
}

/** The df1a1a5b transcript as fixtures store it (mid-turn: the last reply is streaming). */
const BASE_ITEMS: TranscriptItem[] = CHAT_TRANSCRIPT.messages.map(toItem);

export type TurnState = "streaming" | "complete" | "stopped";

/** The same transcript in each turn state. */
export function itemsFor(state: TurnState): TranscriptItem[] {
  const items = BASE_ITEMS.map((it): TranscriptItem => {
    if (it.id === "m13" && it.kind === "text") return { ...it, streaming: state === "streaming" };
    if (it.id === "m14" && it.kind === "tool") {
      if (state === "complete") return { ...it, status: "done", output: "Updated 2 lines in session-list.tsx", meta: "212 ms" };
      if (state === "stopped") return { ...it, status: "stopped", output: "Stopped before the edit finished. No lines changed." };
    }
    return it;
  });
  if (state === "streaming") return [...items, { kind: "working", id: "w1", label: "Working…" }];
  if (state === "stopped") return [...items, { kind: "separator", id: "s1", label: `Stopped by ${PEOPLE.ada.name} · ${formatTime(minutesAgo(0))}` }];
  return [
    ...items,
    {
      kind: "tool",
      id: "m15",
      tool: "Bash",
      input: { command: "pnpm test status" },
      output: "14 passed (14)\nDuration 3.98s",
      status: "done",
      meta: formatLatency(3980),
    },
    {
      kind: "text",
      id: "m16",
      text: "The summary row now reads **Unavailable** too, and `pnpm test status` passes 14 of 14. The change is on `feat/status-pill`, ready for review.",
      time: formatTime(minutesAgo(1)),
    },
  ];
}

/** Canned reply for prompts typed into the demo composer. */
export const DEMO_REPLY =
  "Noted. I'll fold that into the summary row fix and rerun `pnpm test status` once the edit lands. Nothing else in `space_ui` reads the old zero fallback.";

/* ----------------------------------------------------------------------------- composer */

/** Projects in the current space, for the project picker. */
export const SPACE_PROJECTS: ComposerProject[] = PROJECTS.filter((p) => p.spaceId === CURRENT_SPACE.id).map((p) => ({
  id: p.id,
  label: p.displayName,
}));

/* ----------------------------------------------------------------------------- history */

/** Conversations in the current space, newest first: a history list belongs to one space. */
export const HISTORY_ROWS: HistoryRow[] = CHAT_HISTORY.filter((h) => PROJECT_BY_ID[h.projectId]?.spaceId === CURRENT_SPACE.id).map((h) => ({
  id: h.sessionId,
  title: h.title,
  group: h.group,
  time: h.lastActivity,
  project: PROJECT_BY_ID[h.projectId]?.displayName ?? h.projectId,
  runtime: logoFor(h.runtime),
  runtimeLabel: RUNTIME_BY_ID[h.runtime].label,
  preview: h.preview,
  live: h.open,
}));

/* ----------------------------------------------------------------------------- prompts by turn */

/** Typed prompts for session 2af7d3c8 (xo-space, Projects list pinned filter). Mock. */
const PINNED_SESSION = SESSION_BY_ID["2af7d3c8"];
export const PROMPT_SESSION = {
  id: PINNED_SESSION.id,
  title: PINNED_SESSION.title,
  project: PROJECT_BY_ID[PINNED_SESSION.projectId].displayName,
};

export const PROMPT_TURNS: PromptTurn[] = [
  { turn: 1, at: formatDateTime(minutesAgo(2900)), text: "Add a pinned filter to the projects list.", replies: 2, toolCalls: 4 },
  {
    turn: 2,
    at: formatDateTime(minutesAgo(2874)),
    text: "Pinned projects should sort first and survive a reload. Keep the existing sort for everything else.",
    replies: 3,
    toolCalls: 6,
  },
  {
    turn: 3,
    at: formatDateTime(minutesAgo(2851)),
    text: "Implement the filter in space_ui and keep the previewer mounted while the list changes.",
    replies: 3,
    toolCalls: 7,
  },
  {
    turn: 4,
    at: formatDateTime(minutesAgo(2826)),
    text: "Run the projects tests and summarize what changed for the PR description. Mention the pinned sort, the persisted filter and the previewer fix",
    replies: 1,
    toolCalls: 2,
    truncated: true,
  },
];
