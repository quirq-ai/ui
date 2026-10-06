"use client";

// Tool call and turn markers demo: every tool state (expand any row with input or output),
// a replayable call, reasoning and Working… lines, the three marker layouts, a whole agent
// turn, and prompts by turn with its loading, unsupported and missing notes.
import { useState } from "react";
import { History, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { RUNTIME_BY_ID, WORK_ITEMS } from "@/lib/fixtures";
import { formatLatency } from "@/lib/format";
import { Caption, DemoCell, DemoGroup } from "./demo-kit";
import { AGENT, PROMPT_SESSION, PROMPT_TURNS } from "./demo-data";
import { Marker, ReasoningMarker, TOOL_STATUS_META, ToolCallMarker, WorkingMarker, type ToolStatus } from "./markers";
import { PromptTurnList } from "./prompt-turns";
import { ChatTranscript, type TranscriptItem } from "./transcript";
import { useTimers } from "./use-timers";

const ENGINE = "services/cowork_agent/engine";

const GALILEO_OPEN = WORK_ITEMS.filter((w) => w.projectId === "galileo" && w.status === "open");
const LIST_ISSUES_OUTPUT = GALILEO_OPEN.map((w) => `#${w.number}  ${w.title}  [${w.labels.join(", ")}]`).join("\n");

const REASONING =
  "The pill reads apiStatus straight from the response and falls back to 0 when the request throws. A mapper in lib/status.ts can turn a failed request into Unavailable, so every caller gets the same word. The summary row in session-list.tsx probably copies the old fallback; check it before running the tests.";

const TURN: TranscriptItem[] = [
  { kind: "reasoning", id: "t1", text: REASONING, meta: "6s", time: "09:12" },
  {
    kind: "tool",
    id: "t2",
    tool: "Grep",
    input: { pattern: "agent_id", path: ENGINE },
    output: `${ENGINE}/router.py:41\n${ENGINE}/session_map.py:18\n${ENGINE}/session_map.py:77`,
    status: "done",
    meta: formatLatency(112),
  },
  { kind: "tool", id: "t3", tool: "Read", input: { file_path: `${ENGINE}/session_map.py` }, output: "Read 132 lines", status: "done", meta: formatLatency(41) },
  {
    kind: "text",
    id: "t4",
    text: "`agent_id` is set in two places. `session_map.py` maps the logical id to the provider id, so that is where a Codex session loses it.",
  },
];

function ReplayCell() {
  const [status, setStatus] = useState<ToolStatus>("done");
  const { schedule, clearAll } = useTimers();
  function run() {
    clearAll();
    setStatus("pending");
    schedule(() => setStatus("running"), 600);
    schedule(() => setStatus("done"), 2400);
  }
  return (
    <div className="flex flex-col gap-3">
      <ToolCallMarker
        tool="Read"
        input={{ file_path: "space_ui/components/status-pill.tsx" }}
        output={status === "done" ? "Read 48 lines" : null}
        status={status}
        meta={status === "done" ? formatLatency(38) : undefined}
      />
      <div className="flex items-center gap-3">
        <Button size="sm" variant="secondary" leadingIcon={<Play />} onClick={run} disabled={status !== "done"}>
          Run again
        </Button>
        <span aria-live="polite" className="text-[11.5px] text-ink-faint">
          {TOOL_STATUS_META[status].label}
        </span>
      </div>
    </div>
  );
}

export function MarkersDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoGroup title="Tool call" note="Rows with input or output open on click, Enter or Space">
        <div className="grid gap-4 md:grid-cols-2">
          <DemoCell caption="pending">
            <ToolCallMarker tool="Read" input={{ file_path: `${ENGINE}/router.py` }} status="pending" />
          </DemoCell>
          <DemoCell caption="running">
            <ToolCallMarker tool="Bash" input={{ command: "pnpm test status" }} status="running" />
          </DemoCell>
          <DemoCell caption="done · expanded">
            <ToolCallMarker
              tool="Grep"
              input={{ pattern: "agent_id", path: ENGINE }}
              output={`${ENGINE}/router.py:41\n${ENGINE}/session_map.py:18\n${ENGINE}/session_map.py:77`}
              status="done"
              meta={formatLatency(112)}
              defaultOpen
            />
          </DemoCell>
          <DemoCell caption="error">
            <ToolCallMarker
              tool="Bash"
              input={{ command: "pnpm test status" }}
              output={'13 passed, 1 failed (14)\nstatus.test.ts > summary row > renders Unavailable when the API is down\nExpected "Unavailable", received "0"'}
              status="error"
              meta={formatLatency(4120)}
              defaultOpen
            />
          </DemoCell>
          <DemoCell caption="stopped · turn ended by the person">
            <ToolCallMarker
              tool="Edit"
              input={{ file_path: "space_ui/components/session-list.tsx", replace_all: false }}
              output="Stopped before the edit finished. No lines changed."
              status="stopped"
            />
          </DemoCell>
          <DemoCell caption="mcp tool · github">
            <ToolCallMarker
              tool="github.list_issues"
              input={{ repo: "quirq-ai/galileo", state: "open" }}
              output={LIST_ISSUES_OUTPUT}
              status="done"
              meta={formatLatency(842)}
            />
          </DemoCell>
          <DemoCell caption="replay · pending, running, done" className="md:col-span-2">
            <ReplayCell />
          </DemoCell>
        </div>
      </DemoGroup>

      <DemoGroup title="Reasoning and Working…">
        <div className="grid gap-4 md:grid-cols-3">
          <DemoCell caption="reasoning · collapsed" bodyClassName="justify-center">
            <ReasoningMarker text={REASONING} meta="6s" />
          </DemoCell>
          <DemoCell caption="reasoning · thinking" bodyClassName="justify-center">
            <ReasoningMarker text="Checking which callers read apiStatus before changing the mapper." thinking />
          </DemoCell>
          <DemoCell caption="working · live status" bodyClassName="gap-1">
            <WorkingMarker />
            <WorkingMarker label="Loading model…" />
            <WorkingMarker label="Reading 3 files…" />
          </DemoCell>
        </div>
      </DemoGroup>

      <DemoGroup title="Marker layouts">
        <div className="grid gap-4 md:grid-cols-3">
          <DemoCell caption="default" bodyClassName="justify-center">
            <Marker icon={<History className="text-ink-dim" />} trailing="09:02">
              Session resumed from {RUNTIME_BY_ID.claude_code.label}
            </Marker>
          </DemoCell>
          <DemoCell caption="separator" bodyClassName="justify-center">
            <Marker variant="separator" className="text-[11.5px] text-ink-faint">
              Today · 09:02
            </Marker>
          </DemoCell>
          <DemoCell caption="border" bodyClassName="justify-center">
            <Marker variant="border" icon={<History className="text-ink-dim" />} trailing="37 turns">
              Earlier turns are collapsed
            </Marker>
          </DemoCell>
        </div>
      </DemoGroup>

      <DemoGroup title="In a turn" note="Markers interleave with prose in the order they happened · mock turn">
        <div className="rounded-[14px] border border-hair-soft bg-[#0c0c0d] p-4 sm:p-5">
          <ChatTranscript items={TURN} agent={AGENT} />
        </div>
      </DemoGroup>

      <DemoGroup title="Prompts by turn">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-2.5">
            <Caption>ready · {PROMPT_SESSION.id}</Caption>
            <Panel variant="card" padding="md">
              <PanelHeader
                title="Prompts by turn"
                description={`What you typed, one exchange per turn · ${PROMPT_SESSION.title} · ${PROMPT_SESSION.project}`}
                actions={
                  <Badge mono size="sm">
                    Mock prompts
                  </Badge>
                }
                divider
              />
              <PromptTurnList turns={PROMPT_TURNS} className="mt-3" />
            </Panel>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <DemoCell caption="loading">
              <PromptTurnList turns={[]} state="loading" />
            </DemoCell>
            <DemoCell caption="unsupported runtime">
              <PromptTurnList turns={[]} state="unsupported" runtimeLabel={RUNTIME_BY_ID.cursor.label} />
            </DemoCell>
            <DemoCell caption="no transcript found">
              <PromptTurnList turns={[]} state="missing" />
            </DemoCell>
          </div>
        </div>
      </DemoGroup>
    </div>
  );
}
