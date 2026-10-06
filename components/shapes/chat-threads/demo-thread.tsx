"use client";

// Chat thread demo: the df1a1a5b transcript as a live thread (streaming, complete or stopped;
// send a prompt and watch the reply stream; scroll up for Jump to latest), every bubble fill,
// the skeletons and empty notes, and the legacy context-tagged chat.
import { useEffect, useState } from "react";
import { Check, MessageCircleDashed, ServerOff, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loaders";
import { Segmented } from "@/components/ui/segmented";
import { CURRENT_SPACE, PEOPLE, PROJECT_BY_ID, PROJECTS, SESSIONS, WORK_ITEMS, minutesAgo } from "@/lib/fixtures";
import { formatList, formatTime, plural } from "@/lib/format";
import { Bubble, BubbleReactions, type BubbleAlign, type BubbleVariant } from "./bubble";
import { ChatBubbleSkeleton, TranscriptSkeleton } from "./chat-skeleton";
import { ChatScroller } from "./chat-scroller";
import { ChatComposer } from "./composer";
import { CONTEXT_IDS, ContextChip, ContextMessage } from "./context-bubble";
import { Caption, DemoCell, DemoGroup } from "./demo-kit";
import { AGENT, DEMO_REPLY, SESSION, SESSION_PROJECT, itemsFor, type TurnState } from "./demo-data";
import { ChatNote } from "./message";
import { renderInline } from "./prose";
import { ChatTranscript, type TranscriptItem } from "./transcript";
import { reducedMotion, useTimers } from "./use-timers";

/* ----------------------------------------------------------------------------- live thread */

type Phase = "idle" | "working" | "streaming";

function LiveThread() {
  const [turn, setTurn] = useState<TurnState>("streaming");
  const [extra, setExtra] = useState<TranscriptItem[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shown, setShown] = useState(0);
  const { schedule, clearAll } = useTimers();

  // Stream the canned reply a few characters at a time; commit it when it is all there.
  useEffect(() => {
    if (phase !== "streaming") return;
    let n = 0;
    const id = window.setInterval(() => {
      n = Math.min(DEMO_REPLY.length, n + 4);
      setShown(n);
      if (n >= DEMO_REPLY.length) {
        window.clearInterval(id);
        setExtra((prev) => [...prev, { kind: "text", id: `x-r${prev.length}`, text: DEMO_REPLY }]);
        setPhase("idle");
      }
    }, 28);
    return () => window.clearInterval(id);
  }, [phase]);

  function changeTurn(next: TurnState) {
    clearAll();
    setTurn(next);
    setExtra([]);
    setPhase("idle");
    setShown(0);
  }

  function send(text: string) {
    setExtra((prev) => [...prev, { kind: "user", id: `x-u${prev.length}`, author: PEOPLE.ada.name, text, time: formatTime(minutesAgo(0)) }]);
    setPhase("working");
    schedule(() => {
      if (reducedMotion()) {
        setExtra((prev) => [...prev, { kind: "text", id: `x-r${prev.length}`, text: DEMO_REPLY }]);
        setPhase("idle");
      } else {
        setShown(0);
        setPhase("streaming");
      }
    }, 900);
  }

  function stop() {
    if (phase === "idle") {
      changeTurn("stopped");
      return;
    }
    clearAll();
    const partial = phase === "streaming" ? DEMO_REPLY.slice(0, shown) : "";
    setExtra((prev) => [
      ...prev,
      ...(partial ? [{ kind: "text" as const, id: `x-r${prev.length}`, text: partial }] : []),
      { kind: "separator" as const, id: `x-s${prev.length}`, label: `Stopped by ${PEOPLE.ada.name} · ${formatTime(minutesAgo(0))}` },
    ]);
    setPhase("idle");
    setShown(0);
  }

  const live: TranscriptItem[] =
    phase === "working"
      ? [{ kind: "pending", id: "live-pending" }]
      : phase === "streaming"
        ? [{ kind: "text", id: "live-text", text: DEMO_REPLY.slice(0, shown), streaming: true }]
        : [];
  const items = [...itemsFor(turn), ...extra, ...live];
  const responding = phase !== "idle" || turn === "streaming";

  return (
    <div className="overflow-hidden rounded-[18px] border border-hair-soft bg-[#0f0f11]">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b border-hair-soft px-4 py-3 sm:px-5">
        <Avatar name={AGENT.name} runtime={AGENT.runtime} size="sm" decorative />
        <div className="min-w-0 flex-1 basis-[200px]">
          <p className="truncate text-[13.5px] font-medium text-ink">{SESSION.title}</p>
          <p className="truncate font-mono text-[11px] text-ink-faint">
            {SESSION_PROJECT.displayName} · {SESSION.id} · {CURRENT_SPACE.name}
          </p>
        </div>
        <Badge mono size="sm">
          Mock transcript
        </Badge>
        <Segmented<TurnState>
          size="sm"
          aria-label="Turn state"
          value={turn}
          onChange={changeTurn}
          options={[
            { value: "streaming", label: "Streaming" },
            { value: "complete", label: "Complete" },
            { value: "stopped", label: "Stopped" },
          ]}
        />
      </header>
      <ChatScroller
        label={`Conversation with ${AGENT.name}`}
        contentKey={`${turn}:${items.length}:${shown}`}
        className="h-[480px]"
        contentClassName="gap-6"
        busy={phase !== "idle"}
      >
        <ChatTranscript items={items} agent={AGENT} />
      </ChatScroller>
      <div className="border-t border-hair-soft p-3 sm:p-4">
        <ChatComposer
          mode="existing"
          status={responding ? "responding" : "ready"}
          sessionProject={SESSION_PROJECT.displayName}
          onSend={send}
          onStop={stop}
          label={`Message ${AGENT.name}`}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- bubbles */

/* Counts come from the work item fixtures, so the bubbles agree with the github.list_issues
   output in the markers demo. */
const GALILEO_OPEN = WORK_ITEMS.filter((w) => w.projectId === "galileo" && w.status === "open");
const GALILEO_REFS = formatList(GALILEO_OPEN.map((w) => `#${w.number}`));

const SAMPLES: { variant: BubbleVariant; caption: string; align: BubbleAlign; text: string }[] = [
  { variant: "default", caption: "default · person", align: "end", text: "Triage the open issues on galileo and assign the gateway ones to me." },
  {
    variant: "muted",
    caption: "muted · agent",
    align: "start",
    text: `Found ${GALILEO_OPEN.length} open ${plural(GALILEO_OPEN.length, "issue")} on galileo, all in the gateway: ${GALILEO_REFS}.`,
  },
  { variant: "secondary", caption: "secondary", align: "start", text: `Assigned ${GALILEO_REFS} to you. #17 still needs a \`gateway\` label.` },
  { variant: "tinted", caption: "tinted · system", align: "start", text: "Session resumed in galileo on `main`." },
  { variant: "outline", caption: "outline · draft", align: "end", text: "Draft: ask for repro steps on #17?" },
  {
    variant: "ghost",
    caption: "ghost · prose",
    align: "start",
    text: "Down sources still render as zero in the bar. **#17** fixes that by reading `Unavailable` from the health check.",
  },
  { variant: "destructive", caption: "destructive · error", align: "start", text: "Stream timed out: no events for 45s." },
];

function ReactionsCell() {
  const [up, setUp] = useState(false);
  const [ok, setOk] = useState(true);
  const chip = "inline-flex h-5 items-center gap-1 rounded-full! px-1.5 font-mono text-[10.5px] tabular-nums transition-colors hover:bg-s4";
  return (
    <Bubble
      variant="muted"
      reactions={
        <BubbleReactions role="group" aria-label="Reactions">
          <button type="button" aria-pressed={up} aria-label={`Helpful, ${up ? 3 : 2}`} onClick={() => setUp((v) => !v)} className={cn(chip, up ? "bg-blu/20 text-blu" : "text-ink-dim")}>
            <ThumbsUp aria-hidden="true" className="size-3" />
            {up ? 3 : 2}
          </button>
          <button type="button" aria-pressed={ok} aria-label={`Done, ${ok ? 1 : 0}`} onClick={() => setOk((v) => !v)} className={cn(chip, ok ? "bg-grn/15 text-grn" : "text-ink-dim")}>
            <Check aria-hidden="true" className="size-3" />
            {ok ? 1 : 0}
          </button>
        </BubbleReactions>
      }
    >
      {renderInline(`Assigned **${GALILEO_REFS}** to ${PEOPLE.ada.name}.`)}
    </Bubble>
  );
}

function BubbleVariants() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SAMPLES.map((s) => (
        <DemoCell key={s.variant} caption={s.caption} bodyClassName="justify-center">
          <Bubble variant={s.variant} align={s.align}>
            {renderInline(s.text)}
          </Bubble>
        </DemoCell>
      ))}
      <DemoCell caption="reactions · toggle" bodyClassName="justify-center">
        <ReactionsCell />
      </DemoCell>
      <DemoCell caption="empty text · spinner" bodyClassName="justify-center">
        <Bubble variant="muted">
          <Spinner size="sm" label="Agent is responding" className="my-1 text-ink-dim" />
        </Bubble>
      </DemoCell>
    </div>
  );
}

/* ----------------------------------------------------------------------------- skeletons and notes */

function SkeletonsAndNotes() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DemoCell caption="skeleton · landing art" surface={false}>
        <div className="flex h-full flex-col rounded-[20px] border border-hair-strong bg-[linear-gradient(180deg,rgba(40,40,42,0.86),rgba(18,18,20,0.86))] p-5">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Context optimization</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">Our engine interprets your goals and draws from your data.</p>
          <ChatBubbleSkeleton count={5} height={32} className="mt-5 flex-1" />
        </div>
      </DemoCell>
      <DemoCell caption="skeleton · loading conversation">
        <TranscriptSkeleton />
      </DemoCell>
      <DemoCell caption="notes · empty, loading, space down" bodyClassName="gap-4">
        <ChatNote icon={<MessageCircleDashed />}>Send a message to start a session with the agent.</ChatNote>
        <ChatNote>Pick a session on the left, or start a new chat. A new chat can run inside a project folder.</ChatNote>
        <ChatNote>No messages in this session yet.</ChatNote>
        <ChatNote busy>Loading transcript…</ChatNote>
        <ChatNote icon={<ServerOff />}>The Space API is down. It usually comes back shortly after the space starts.</ChatNote>
      </DemoCell>
    </div>
  );
}

/* ----------------------------------------------------------------------------- context-tagged */

const ISSUE_17 = WORK_ITEMS.find((w) => w.projectId === "galileo" && w.number === 17);
const BILLING_REPO = PROJECT_BY_ID["billing-api"]?.github?.url;

/* The XO reply is derived from fixtures as of its own send time, so it agrees with the
   sessions shown elsewhere in the catalog. */
const XO_REPLY_MIN = 40;
const SPACE_PROJECT_IDS = PROJECTS.filter((p) => p.spaceId === CURRENT_SPACE.id).map((p) => p.id);
const REPLY_AT = minutesAgo(XO_REPLY_MIN);
const HOUR_BEFORE_REPLY = minutesAgo(XO_REPLY_MIN + 60);
const ACTIVE_LAST_HOUR = Array.from(
  new Set(
    SESSIONS.filter(
      (x) => SPACE_PROJECT_IDS.includes(x.projectId) && x.startedAt <= REPLY_AT && x.lastActivityAt >= HOUR_BEFORE_REPLY,
    ).map((x) => x.projectId),
  ),
).sort();
const XO_SUMMARY = `${CURRENT_SPACE.name} has ${SPACE_PROJECT_IDS.length} ${plural(SPACE_PROJECT_IDS.length, "project")}. ${
  ACTIVE_LAST_HOUR.length ? `${formatList(ACTIVE_LAST_HOUR)} had agent sessions in the last hour.` : "No agent sessions in the last hour."
}`;

function ContextTagged() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Caption>contexts</Caption>
        <ul className="flex flex-wrap gap-1.5" aria-label="Chat contexts">
          {CONTEXT_IDS.map((c) => (
            <li key={c}>
              <ContextChip context={c} />
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DemoCell caption="answered · thinking" bodyClassName="gap-4">
          <ContextMessage context="claude-code" role="user" userName={PEOPLE.ada.name} text="@claude-code Refactor the billing hook to use useOptimistic." time={formatTime(minutesAgo(18))} />
          <ContextMessage
            context="claude-code"
            role="assistant"
            text="Refactored `useBilling` to use `useOptimistic`. The plan badge now updates before the server confirms, and rolls back on a failed charge."
            time={formatTime(minutesAgo(17))}
            url={BILLING_REPO}
          />
          <ContextMessage context="click-up" role="user" userName={PEOPLE.ada.name} text="@click-up What are my pending tasks?" time={formatTime(minutesAgo(2))} />
          <ContextMessage context="click-up" role="assistant" status="thinking" time={formatTime(minutesAgo(1))} />
        </DemoCell>
        <DemoCell caption="answered · with metadata" bodyClassName="gap-4">
          <ContextMessage context="github-copilot" role="user" userName={PEOPLE.kenji.name} text="@github-copilot Create an issue for down sources showing zero in the bar." time={formatTime(minutesAgo(45))} />
          <ContextMessage
            context="github-copilot"
            role="assistant"
            text={`Opened ${ISSUE_17 ? `#${ISSUE_17.number} "${ISSUE_17.title}"` : "an issue"} in quirq-ai/galileo with the repro steps.`}
            time={formatTime(minutesAgo(44))}
            issueNo={ISSUE_17?.number}
            recordId="wi_48"
            url={ISSUE_17?.url}
          />
          <ContextMessage context="xo" role="assistant" text={XO_SUMMARY} time={formatTime(REPLY_AT)} />
        </DemoCell>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function ChatThreadDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoGroup title="Live thread" note="Send a prompt, stop a turn, or scroll up for Jump to latest">
        <LiveThread />
      </DemoGroup>
      <DemoGroup title="Bubble variants" note="The fill tells the two sides apart · mock messages">
        <BubbleVariants />
      </DemoGroup>
      <DemoGroup title="Skeleton and empty notes">
        <SkeletonsAndNotes />
      </DemoGroup>
      <DemoGroup title="Context-tagged" note="Legacy swarm chat, not on current routes · mock messages">
        <ContextTagged />
      </DemoGroup>
    </div>
  );
}
