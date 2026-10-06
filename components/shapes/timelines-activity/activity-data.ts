// Demo data for the activity feed shape, derived from the shared fixtures only. Mock data:
// every relative time is computed against the fixed NOW_ISO, never the wall clock.
import {
  ACTIVITY,
  PROJECTS,
  PROJECT_BY_ID,
  RUNTIME_BY_ID,
  SESSIONS,
  SESSION_BY_ID,
  TODOS,
  WORK_ITEMS,
  NOW_MS,
  ago,
  minutesAgo,
  type ActivityEvent,
  type RuntimeId,
} from "@/lib/fixtures";
import { formatCompact, formatNumber } from "@/lib/format";
import type { ActivityFeedEvent } from "./activity-feed";
import type { LiveSession } from "./live-sessions";
import type { IconEventItem, Signal } from "./event-list";
import { iconForEventType } from "./event-list";
import type { SectionEvent, SectionSession, SectionStat, SectionStepGroup } from "./project-sections";

export const PROJECT_NAME: Record<string, string> = Object.fromEntries(PROJECTS.map((p) => [p.id, p.displayName]));

/** Display name for a runtime id: claude_code reads "Claude Code". Raw ids stay out of the UI. */
export function runtimeLabel(id: RuntimeId | null | undefined): string | null {
  return id ? RUNTIME_BY_ID[id].label : null;
}

/* Jobs and connectors report their own result; session titles never set a tone. */
function toneFor(e: ActivityEvent): ActivityFeedEvent["tone"] {
  if (e.type === "job.run" && /^Failed/.test(e.detail)) return "error";
  if (e.type === "connector.polled" && /needs attention/i.test(e.detail)) return "warn";
  return "default";
}

function fromActivity(e: ActivityEvent): ActivityFeedEvent {
  return {
    id: e.id,
    label: e.label,
    ts: e.ts,
    ago: e.ago,
    subjectId: e.projectId,
    subjectLabel: e.projectId ? PROJECT_NAME[e.projectId] ?? e.projectId : "Space",
    detail: e.detail,
    runtime: runtimeLabel(e.runtime),
    sessionId: e.sessionId,
    actor: e.runtime ? null : e.actor,
    tone: toneFor(e),
  };
}

/* Three events the timeline also carries: a blocked step, a linked issue and a peer sync
   conflict (error tone, as the space dashboard marks conflicts). */
const blockedStep = TODOS.find((t) => t.id === "t_15")!;
const linkedIssue = WORK_ITEMS.find((w) => w.id === "wi_44")!;

const DERIVED: ActivityFeedEvent[] = [
  {
    id: `ev_${blockedStep.id}`,
    label: "Step status changed",
    ts: blockedStep.updatedAt,
    ago: blockedStep.updatedAgo,
    subjectId: blockedStep.projectId,
    subjectLabel: PROJECT_NAME[blockedStep.projectId],
    detail: `${blockedStep.content} · Status: blocked · ${blockedStep.note}`,
    runtime: runtimeLabel(blockedStep.runtime),
    sessionId: blockedStep.sessionId,
    tone: "warn",
  },
  {
    id: `ev_${linkedIssue.id}`,
    label: "Issue linked",
    ts: linkedIssue.updatedAt,
    ago: linkedIssue.updatedAgo,
    subjectId: linkedIssue.projectId,
    subjectLabel: PROJECT_NAME[linkedIssue.projectId],
    detail: `Work item ${linkedIssue.id} · ${linkedIssue.repo} #${linkedIssue.number}`,
    runtime: linkedIssue.linkedSessionId ? runtimeLabel(SESSION_BY_ID[linkedIssue.linkedSessionId].runtime) : null,
    sessionId: linkedIssue.linkedSessionId,
  },
  {
    id: "ev_sync_conflict",
    label: "Peer sync conflict",
    ts: minutesAgo(9),
    ago: ago(minutesAgo(9)),
    subjectId: "research-notes",
    subjectLabel: PROJECT_NAME["research-notes"],
    detail: "docs/decisions.md changed on both sides · Status: blocked",
    actor: "Lena Fischer",
    tone: "error",
  },
];

/** Every space event, newest first (ACTIVITY plus the two derived rows). */
export const FEED_EVENTS: ActivityFeedEvent[] = [...ACTIVITY.map(fromActivity), ...DERIVED].sort((a, b) =>
  a.ts === b.ts ? a.id.localeCompare(b.id, "en-US") : a.ts < b.ts ? 1 : -1,
);

/** Open sessions across the space, for the live disclosure. */
export const LIVE_SESSIONS: (LiveSession & { projectId: string })[] = SESSIONS.filter((s) => s.open).map((s) => ({
  id: s.id,
  projectId: s.projectId,
  title: s.title,
  runtime: runtimeLabel(s.runtime),
  projectLabel: PROJECT_NAME[s.projectId],
  openedAt: s.startedAt,
  lastActiveAt: s.lastActivityAt,
}));

/* ----------------------------------------------------------------------------- swarm sections */

const SECTION_PROJECT = PROJECT_BY_ID["xo-space"];
const WEEK_MIN = 7 * 1440;
const projectSessions = SESSIONS.filter((s) => s.projectId === SECTION_PROJECT.id);
const NOW_MIN_AGO = (iso: string) => Math.round((NOW_MS - Date.parse(iso)) / 60000);
const inWeek = projectSessions.filter((s) => NOW_MIN_AGO(s.startedAt) <= WEEK_MIN);
const sumOf = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const SECTIONS_PROJECT = {
  title: SECTION_PROJECT.displayName,
  path: `~/xo-projects/${SECTION_PROJECT.id}`,
  lastActive: SECTION_PROJECT.lastActive,
};

export const SECTION_SESSIONS: SectionSession[] = projectSessions
  .filter((s) => s.open)
  .map((s) => ({ id: s.id, runtime: runtimeLabel(s.runtime), lastActive: s.lastActivity }));

const filesEdited7 = ACTIVITY.filter((e) => e.projectId === SECTION_PROJECT.id && e.type === "file.edited").length;

export const SECTION_STATS: SectionStat[] = [
  {
    label: "Input tokens",
    value: formatCompact(sumOf(inWeek.map((s) => s.inputTokens))),
    sub: `7d · 30d: ${formatCompact(sumOf(projectSessions.map((s) => s.inputTokens)))}`,
  },
  {
    label: "Output tokens",
    value: formatCompact(sumOf(inWeek.map((s) => s.outputTokens))),
    sub: `7d · 30d: ${formatCompact(sumOf(projectSessions.map((s) => s.outputTokens)))}`,
  },
  { label: "Sessions", value: formatNumber(inWeek.length), sub: `7d · 30d: ${formatNumber(projectSessions.length)}` },
  /* The watcher only keeps a 7 day file window, so the 30 day figure has no source. */
  { label: "Files edited", value: formatNumber(filesEdited7), sub: `7d · 30d: ${formatNumber(null)}` },
];

export const SECTION_STEPS: SectionStepGroup[] = projectSessions
  .map((s) => ({
    sessionId: s.id,
    runtime: runtimeLabel(s.runtime),
    steps: TODOS.filter((t) => t.sessionId === s.id).map((t) => ({ id: t.id, content: t.content, status: t.status, note: t.note })),
  }))
  .filter((g) => g.steps.length > 0);

function describe(e: ActivityEvent): string {
  switch (e.type) {
    case "session.started":
      return `${runtimeLabel(e.runtime) ?? "Session"} started · ${e.sessionId ?? ""}`;
    case "session.ended":
      return `${runtimeLabel(e.runtime) ?? "Session"} ended · ${e.detail}`;
    case "todo.completed":
      return `Completed step: ${e.detail}`;
    case "file.edited":
      return `Edited ${e.detail}`;
    case "peer.sync.applied":
      return e.detail;
    default:
      return e.detail;
  }
}

export const SECTION_EVENTS: SectionEvent[] = ACTIVITY.filter((e) => e.projectId === SECTION_PROJECT.id).map((e) => ({
  id: e.id,
  ts: e.ts,
  when: e.ago,
  type: e.type,
  detail: describe(e),
}));

/* ----------------------------------------------------------------------------- visualizer drawer */

function vizLabel(e: ActivityEvent): string {
  switch (e.type) {
    case "file.edited":
      return `Edited ${e.detail}`;
    case "todo.completed":
      return "Completed a step";
    case "session.started":
      return "Started a session";
    case "session.ended":
      return "Ended a session";
    case "peer.sync.applied":
      return "Applied a peer sync";
    case "job.run":
      return `Job ran · ${e.actor}`;
    case "connector.polled":
      return `Connector polled · ${e.actor}`;
  }
}

export const DRAWER_OPEN: IconEventItem[] = SESSIONS.filter((s) => s.open).map((s) => ({
  id: s.id,
  icon: "live",
  title: s.title,
  meta: `${runtimeLabel(s.runtime)} · active ${s.lastActivity}`,
}));

export const DRAWER_EVENTS: IconEventItem[] = ACTIVITY.slice(0, 8).map((e) => ({
  id: e.id,
  icon: iconForEventType(e.type),
  title: vizLabel(e),
  meta: `${runtimeLabel(e.runtime) ?? "Space"} · ${e.ago}`,
}));

/* ----------------------------------------------------------------------------- signals */

function signalsFor(projectIds: string[] | null): Signal[] {
  const inScope = (id: string | null) => projectIds === null || (id !== null && projectIds.includes(id));
  const open = SESSIONS.filter((s) => s.open && inScope(s.projectId));
  const blocked = TODOS.filter((t) => t.status === "blocked" && inScope(t.projectId));
  const latest = ACTIVITY.find((e) => inScope(e.projectId));
  const out: Signal[] = [];
  if (open.length) {
    out.push({ id: "open", tone: "good", text: `${open.length} observable ${open.length === 1 ? "session is" : "sessions are"} active now.` });
  }
  if (blocked.length) {
    out.push({ id: "blocked", tone: "warn", text: `${blocked.length} blocked ${blocked.length === 1 ? "step needs" : "steps need"} attention.` });
  }
  if (latest) out.push({ id: "latest", tone: "neutral", text: `${vizLabel(latest)} · ${ago(latest.ts)}.` });
  return out;
}

export const SIGNALS_SPACE = signalsFor(null);
export const SIGNALS_BILLING = signalsFor(["billing-api"]);
export const SIGNALS_EMPTY = signalsFor(["demo-kit"]);
