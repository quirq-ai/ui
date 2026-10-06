"use client";

// Chat composer demo: new and existing chats in every state (ready, responding with Stop,
// space down, stream error, projects loading, unknown project) plus the space dashboard bar.
// Enter sends, Shift+Enter adds a line; a sent prompt runs a short mock turn.
import { useState } from "react";
import { PROJECT_BY_ID, PROJECTS, SPACE_BY_ID } from "@/lib/fixtures";
import { DemoCell, DemoGroup } from "./demo-kit";
import { SPACE_PROJECTS } from "./demo-data";
import { ChatComposer, PROJECTS_ROOT_LABEL, type ComposerStatus } from "./composer";
import { useTimers } from "./use-timers";

/* The space down cell is a different space (demo-pilot, Starting), so it lists its own projects. */
const STARTING_SPACE = SPACE_BY_ID["ws_e5d7b302"];
const STARTING_PROJECTS = PROJECTS.filter((p) => p.spaceId === STARTING_SPACE.id).map((p) => ({ id: p.id, label: p.displayName }));

function projectName(id: string | null) {
  return id ? (PROJECT_BY_ID[id]?.displayName ?? id) : PROJECTS_ROOT_LABEL;
}

/** A composer wired to a mock turn: Send runs a 2.4s response, Stop ends it early. */
function useMockTurn(initial: ComposerStatus = "ready") {
  const [status, setStatus] = useState<ComposerStatus>(initial);
  const [last, setLast] = useState<string | null>(null);
  const { schedule, clearAll } = useTimers();
  function send(text: string, where: string) {
    setLast(`Sent to ${where}: “${text}”`);
    setStatus("responding");
    schedule(() => {
      setStatus("ready");
      setLast((l) => (l ? `${l} · Turn complete` : l));
    }, 2400);
  }
  function stop() {
    clearAll();
    setStatus("ready");
    setLast((l) => `${l ?? "Turn"} · Stopped`);
  }
  return { status, last, send, stop };
}

function SentLine({ text }: { text: string | null }) {
  return (
    <p aria-live="polite" className="min-h-4 truncate text-[11.5px] text-ink-faint">
      {text ?? ""}
    </p>
  );
}

function NewChatCell() {
  const [project, setProject] = useState<string | null>("galileo");
  const turn = useMockTurn();
  return (
    <DemoCell caption="new chat · ready" bodyClassName="gap-2">
      <ChatComposer
        mode="new"
        status={turn.status}
        projects={SPACE_PROJECTS}
        projectId={project}
        onProjectChange={setProject}
        onSend={(t) => turn.send(t, projectName(project))}
        onStop={turn.stop}
      />
      <SentLine text={turn.last} />
    </DemoCell>
  );
}

function ExistingChatCell() {
  const turn = useMockTurn("responding");
  return (
    <DemoCell caption="existing chat · responding, Stop" bodyClassName="gap-2">
      <ChatComposer
        mode="existing"
        status={turn.status}
        sessionProject={PROJECT_BY_ID["xo-space"].displayName}
        onSend={(t) => turn.send(t, "xo-space")}
        onStop={turn.stop}
      />
      <SentLine text={turn.last ?? "Claude Code is answering in xo-space"} />
    </DemoCell>
  );
}

function BarCell() {
  const turn = useMockTurn();
  const [project, setProject] = useState<string | null>(null);
  return (
    <DemoCell caption="bar layout · space dashboard" surface={false} bodyClassName="gap-2">
      <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-[#0c0c0d]">
        <div className="flex min-h-[120px] items-center px-4 py-6 sm:px-6">
          <p className="max-w-[52ch] text-[12.5px] text-ink-faint">
            Pick a session on the left, or start a new chat. A new chat can run inside a project folder: the agent then works in that
            project.
          </p>
        </div>
        <ChatComposer
          layout="bar"
          mode="new"
          status={turn.status}
          projects={SPACE_PROJECTS}
          projectId={project}
          onProjectChange={setProject}
          onSend={(t) => turn.send(t, projectName(project))}
          onStop={turn.stop}
        />
      </div>
      <SentLine text={turn.last} />
    </DemoCell>
  );
}

export function ComposerDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoGroup title="Card layout" note="Enter sends · Shift+Enter adds a line">
        <div className="grid gap-4 md:grid-cols-2">
          <NewChatCell />
          <ExistingChatCell />
          <DemoCell caption="space down">
            <ChatComposer
              mode="new"
              status="down"
              projects={STARTING_PROJECTS}
              defaultProjectId={STARTING_PROJECTS[0]?.id ?? null}
              notice={`${STARTING_SPACE.name} is ${STARTING_SPACE.status}. Chat opens when the Space API answers.`}
            />
          </DemoCell>
          <DemoCell caption="error · stream timed out">
            <ChatComposer mode="existing" status="ready" sessionProject={PROJECT_BY_ID.galileo.displayName} error="Stream timed out: no events for 45s." />
          </DemoCell>
          <DemoCell caption="new chat · projects loading">
            <ChatComposer mode="new" status="ready" projects={null} />
          </DemoCell>
          <DemoCell caption="new chat · projects unavailable">
            <ChatComposer
              mode="new"
              status="ready"
              projects={[]}
              notice={`Couldn't load projects (Space API timed out). This chat will run in the ${PROJECTS_ROOT_LABEL.toLowerCase()}.`}
            />
          </DemoCell>
        </div>
      </DemoGroup>
      <DemoGroup title="Bar layout">
        <BarCell />
      </DemoGroup>
    </div>
  );
}
