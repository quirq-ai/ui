// Chat and agent transcript: conversation, tool markers, composer and history.
import type { Shape } from "@/lib/types";
import { ChatThreadDemo } from "./demo-thread";
import { MarkersDemo } from "./demo-markers";
import { ComposerDemo } from "./demo-composer";
import { HistoryDemo } from "./demo-history";

export { Bubble, BubbleGroup, BubbleReactions, BUBBLE_VARIANTS, type BubbleVariant, type BubbleAlign } from "./bubble";
export { ChatMessageRow, TurnHeader, ChatNote } from "./message";
export { ChatProse, renderInline } from "./prose";
export { ChatScroller } from "./chat-scroller";
export { ChatBubbleSkeleton, TranscriptSkeleton } from "./chat-skeleton";
export { ContextMessage, ContextChip, CONTEXT_CONFIG, CONTEXT_IDS, type ChatContextId } from "./context-bubble";
export { ChatTranscript, type TranscriptItem, type TranscriptAgent } from "./transcript";
export {
  Marker,
  ToolCallMarker,
  ReasoningMarker,
  WorkingMarker,
  StepsMarker,
  InlineDiff,
  ToolStatusIcon,
  TOOL_STATUS_META,
  toolSummary,
  formatToolInput,
  type ToolStatus,
  type MarkerVariant,
} from "./markers";
export { PromptTurnList, type PromptTurn, type PromptTurnState } from "./prompt-turns";
export {
  ChatComposer,
  ProjectPicker,
  ProjectLabel,
  PROJECTS_ROOT_LABEL,
  COMPOSER_PLACEHOLDER,
  type ComposerStatus,
  type ComposerProject,
} from "./composer";
export { ChatHistory, HISTORY_GROUPS, type HistoryRow, type HistoryGroup, type HistoryState } from "./history";

export const shapes: Shape[] = [
  {
    id: "chat-thread",
    name: "Chat thread",
    purpose: "Conversation with a space's agent.",
    seenIn: [
      "swarm:chat-thread",
      "swarm:context-chat-legacy",
      "client:chat-message-bubble",
      "client:chat-message-scroller",
      "client:chat-marker",
      "space-ui:chat-message-thread",
      "landing:chat-bubble-skeleton",
    ],
    variants: ["Bubble variants", "Reactions", "Skeleton", "Context-tagged"],
    states: ["Streaming", "Complete", "Stopped", "Empty text spinner", "Thinking", "Loading", "Empty"],
    Demo: ChatThreadDemo,
  },
  {
    id: "agent-work-markers",
    name: "Tool call and turn markers",
    purpose: "Tool calls, reasoning and per-turn prompts.",
    seenIn: ["swarm:agent-work-markers", "client:assistant-turn-parts", "space-ui:prompt-turn-list"],
    variants: ["Tool call", "Reasoning", "Working…", "Prompt by turn", "Marker: default, separator, border"],
    states: ["Pending", "Running", "Done", "Error", "Stopped", "Loading prompts", "Unsupported runtime", "No transcript"],
    Demo: MarkersDemo,
  },
  {
    id: "chat-composer",
    name: "Chat composer",
    purpose: "Write a prompt and choose its project.",
    seenIn: ["swarm:chat-composer", "space-ui:chat-sidebar-composer"],
    variants: ["New chat (project picker)", "Existing chat (project label)", "Card layout", "Bar layout"],
    states: ["Ready", "Responding", "Space down", "Stream error", "Projects loading"],
    Demo: ComposerDemo,
  },
  {
    id: "chat-history",
    name: "Chat history",
    purpose: "Past conversations by recency and project.",
    seenIn: ["swarm:org-chat-history-nav", "client:chat-session-list"],
    variants: ["Sidebar", "List"],
    states: ["Loaded", "Loading", "API down", "Empty", "Refreshing", "Active session"],
    Demo: HistoryDemo,
  },
];
