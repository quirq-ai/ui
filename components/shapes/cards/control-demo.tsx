"use client";

import { useState } from "react";
import { FileCode, Globe, SquareTerminal } from "lucide-react";
import { CONNECTORS, CURRENT_SPACE, PROJECTS, SECRETS, SESSIONS, SPACE_BY_ID, SPACE_START_FAILURE, RUNTIME_BY_ID } from "@/lib/fixtures";
import { formatNumber } from "@/lib/format";
import { Checkbox } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import {
  RemoteSessionControl,
  ServerUpdateCard,
  SpaceControlCard,
  SpaceControlMessage,
  SpaceHeaderControls,
  WatcherPanel,
  type ApiState,
  type SpaceLifecycle,
  type UpdateState,
} from "./control-cards";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const OPS = SPACE_BY_ID["ws_7f3a9c21e4b0"];
const PILOT = SPACE_BY_ID["ws_e5d7b302"];
const SANDBOX = SPACE_BY_ID["ws_c40e19aa"];
const logo = (id: string) => (id === "gemini_cli" ? "gemini" : id) as "claude_code" | "codex" | "openclaw";
const type = (s: typeof OPS) => `${RUNTIME_BY_ID[s.runtime].label} · ${s.deployment} · ${s.provider}`;
const FAILURE = { body: SPACE_START_FAILURE.body, details: "runtime exited with code 1\nspace-api: no answer on :5002 after 30s\nlast log: claude: ANTHROPIC_API_KEY not set" };

function LiveControl() {
  const later = useLater();
  const [status, setStatus] = useState<SpaceLifecycle>("running");
  const [failNext, setFailNext] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [outdated, setOutdated] = useState(true);
  const [opened, setOpened] = useState(false);

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,380px)_1fr]">
      <SpaceControlCard
        name={OPS.name}
        runtime={logo(OPS.runtime)}
        typeLabel={type(OPS)}
        status={status}
        stopsIn={{ label: OPS.stopsIn ?? "23h 40m", minutes: 23 * 60 + 40 }}
        trial
        outdated={outdated}
        updating={updating}
        failure={FAILURE}
        onOpen={() => setOpened(true)}
        onStop={() => {
          setStatus("stopping");
          later(() => setStatus("stopped"), 1300);
        }}
        onStart={() => {
          setStatus("starting");
          later(() => setStatus(failNext ? "failed" : "running"), 1600);
        }}
        onUpdate={() => {
          setUpdating(true);
          later(() => {
            setUpdating(false);
            setOutdated(false);
          }, 1600);
        }}
      />
      <div className="flex flex-col gap-3 text-[12.5px] text-ink-dim">
        <p>Stop, then Start. Turn on the failure below to see Space could not start, Try again and Technical details.</p>
        <Checkbox checked={failNext} onChange={() => setFailNext((v) => !v)} label="Fail the next start" description="The runtime exits before the Space API answers." />
        <p role="status" className="font-mono text-[11px] text-ink-faint">
          {opened ? `Open space: would open ${OPS.url}. Sample action.` : `Status: ${status}`}
        </p>
      </div>
    </div>
  );
}

function StatesGrid() {
  const card = (s: typeof OPS) => ({ name: s.name, runtime: logo(s.runtime), typeLabel: type(s) });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Specimen label="Creating">
        <SpaceControlCard compact {...card(PILOT)} status="creating" />
      </Specimen>
      <Specimen label="Starting">
        <SpaceControlCard compact {...card(PILOT)} status="starting" />
      </Specimen>
      <Specimen label="Running · agent connecting">
        <SpaceControlCard compact {...card(CURRENT_SPACE)} status="running" agentConnecting watch="connecting" />
      </Specimen>
      <Specimen label="Running · update available">
        <SpaceControlCard compact {...card(CURRENT_SPACE)} status="running" outdated />
      </Specimen>
      <Specimen label="Updating">
        <SpaceControlCard compact {...card(CURRENT_SPACE)} status="running" updating />
      </Specimen>
      <Specimen label="Stopping">
        <SpaceControlCard compact {...card(SANDBOX)} status="stopping" />
      </Specimen>
      <Specimen label="Stopped · live status lost">
        <SpaceControlCard compact {...card(SANDBOX)} status="stopped" watch="disconnected" />
      </Specimen>
      <Specimen label="Space could not start">
        <SpaceControlCard compact {...card(PILOT)} status="failed" failure={FAILURE} />
      </Specimen>
      <Specimen label="Shared user · read-only">
        <SpaceControlCard compact {...card(OPS)} status="running" canOperate={false} stopsIn={{ label: OPS.stopsIn ?? "23h 40m", minutes: 1420 }} />
      </Specimen>
      <Specimen label="Timer · normal">
        <SpaceControlCard compact {...card(OPS)} status="running" stopsIn={{ label: OPS.stopsIn ?? "23h 40m", minutes: 1420 }} />
      </Specimen>
      <Specimen label="Timer warn · under 60 min">
        <SpaceControlCard compact {...card(OPS)} status="running" stopsIn={{ label: "42m", minutes: 42 }} />
      </Specimen>
      <Specimen label="Timer critical · under 15 min">
        <SpaceControlCard compact {...card(OPS)} status="running" stopsIn={{ label: "9m", minutes: 9 }} />
      </Specimen>
      <Specimen label="Loading">
        <SpaceControlMessage kind="loading" />
      </Specimen>
      <Specimen label="Error">
        <SpaceControlMessage kind="error" message="The Coder API timed out after 10s." />
      </Specimen>
      <Specimen label="Not found">
        <SpaceControlMessage kind="missing" />
      </Specimen>
    </div>
  );
}

function HeaderControls() {
  const later = useLater();
  const [status, setStatus] = useState<SpaceLifecycle>("running");
  const [api, setApi] = useState<ApiState>("up");
  const [note, setNote] = useState("");
  const apps = [
    { id: "dash", label: "Space dashboard", icon: <Globe />, hint: ":5002", onSelect: () => setNote("Opened the Space dashboard. Sample action.") },
    { id: "term", label: "Terminal", icon: <SquareTerminal />, onSelect: () => setNote("Opened a terminal. Sample action.") },
    { id: "code", label: "Code editor", icon: <FileCode />, onSelect: () => setNote("Opened the code editor. Sample action.") },
  ];
  const connections = CONNECTORS.slice(0, 4).map((c) => ({ id: c.toolkit, label: c.displayName, hint: c.status, onSelect: () => setNote(`${c.displayName}: ${c.status}.`) }));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SpaceHeaderControls
          idPrefix="hdr"
          status={status}
          api={api}
          apps={apps}
          connections={connections}
          onStop={() => {
            setStatus("stopping");
            setApi("down");
            later(() => {
              setStatus("stopped");
              setApi("unknown");
            }, 1200);
          }}
          onStart={() => {
            setStatus("starting");
            later(() => {
              setStatus("running");
              setApi("down");
            }, 1300);
            later(() => setApi("up"), 2600);
          }}
        />
        <Segmented
          aria-label="Space API state"
          size="sm"
          value={api}
          onChange={setApi}
          options={[
            { value: "up", label: "API up" },
            { value: "down", label: "API down" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
      </div>
      <p role="status" className="min-h-5 font-mono text-[11px] text-ink-faint">
        {note || "Hover or focus a pill for its meaning. Connections is disabled while the Space API is down."}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <Specimen label="Stopped">
          <SpaceHeaderControls idPrefix="hdr-st" status="stopped" api="unknown" apps={apps} connections={connections} />
        </Specimen>
        <Specimen label="Starting · transitioning">
          <SpaceHeaderControls idPrefix="hdr-sg" status="starting" api="down" apps={apps} connections={connections} />
        </Specimen>
      </div>
    </div>
  );
}

function RemoteSession() {
  const later = useLater();
  const s = SESSIONS.find((x) => x.open && x.runtime === "openclaw")!;
  const [state, setState] = useState<"running" | "connecting" | "stopped">("running");
  const [busy, setBusy] = useState(false);
  return (
    <RemoteSessionControl
      runtime={logo(s.runtime)}
      title={s.title}
      spaceName={SPACE_BY_ID[s.spaceId].name}
      state={state}
      elapsed={s.duration}
      busy={busy}
      onStop={() => {
        setBusy(true);
        later(() => {
          setBusy(false);
          setState("stopped");
        }, 900);
      }}
      onResume={() => {
        setBusy(true);
        later(() => {
          setBusy(false);
          setState("connecting");
        }, 700);
        later(() => setState("running"), 1900);
      }}
    />
  );
}

const INSTALLED = { sha: "a1b2c3d", date: "2026-09-22", subject: "Add theme picker" };
const LATEST = { sha: "9f8e7d6", date: "2026-10-01", subject: "Status pill reads Unavailable when the API is down" };

function Updates() {
  const later = useLater();
  const [state, setState] = useState<UpdateState>("not_checked");
  const base = { installed: INSTALLED, latest: LATEST, behind: 3, branch: "main", className: "h-full" };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Specimen label="Live · check, update, restart">
        <ServerUpdateCard
          {...base}
          state={state}
          onCheck={() => {
            setState("checking");
            later(() => setState("behind"), 1100);
          }}
          onUpdate={() => {
            setState("updating");
            later(() => setState("updated"), 1500);
          }}
          onRestart={() => setState("up_to_date")}
        />
      </Specimen>
      <Specimen label="Up to date">
        <ServerUpdateCard {...base} state="up_to_date" latest={undefined} behind={0} />
      </Specimen>
      <Specimen label="Behind · update available">
        <ServerUpdateCard {...base} state="behind" />
      </Specimen>
      <Specimen label="Updated · restart needed">
        <ServerUpdateCard {...base} state="updated" />
      </Specimen>
      <Specimen label="Blocked · local changes">
        <ServerUpdateCard {...base} state="blocked" blockedReason="local changes present" />
      </Specimen>
      <Specimen label="Error">
        <ServerUpdateCard {...base} state="error" error="Could not reach the remote. Check your network and try again." />
      </Specimen>
    </div>
  );
}

function Watcher() {
  const open = SESSIONS.filter((s) => s.open);
  const active = PROJECTS.filter((p) => p.openSessions > 0);
  const rows = active.map((p) => {
    const s = open.find((x) => x.projectId === p.id)!;
    return { project: p.displayName, runtime: logo(s.runtime), open: p.openSessions, ago: p.lastActive, live: true };
  });
  const creds = SECRETS.filter((s) => s.status === "Set" && s.scope === "space").map((s) => s.name);
  const stats = [
    { label: "Space sessions", value: formatNumber(open.length) },
    { label: "Active projects", value: formatNumber(active.length) },
    { label: "Cursor files", value: formatNumber(37) },
  ];
  const config = [
    { label: "Agent backend", value: RUNTIME_BY_ID[CURRENT_SPACE.runtime].label },
    { label: "Watcher", value: "Enabled" },
    { label: "Tick interval", value: "1 second" },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Specimen label="Live">
        <WatcherPanel state="live" stats={stats} rows={rows} config={config} credentials={creds.slice(0, 3)} />
      </Specimen>
      <Specimen label="Stalled · empty">
        <WatcherPanel
          state="stalled"
          stalledSince="09:12"
          stats={[
            { label: "Space sessions", value: "Unavailable" },
            { label: "Active projects", value: "Unavailable" },
            { label: "Cursor files", value: "Unavailable" },
          ]}
          rows={[]}
          config={[...config.slice(0, 1), { label: "Watcher", value: "Enabled, not ticking" }, config[2]]}
          credentials={[]}
        />
      </Specimen>
    </div>
  );
}

export function ControlCardDemo() {
  return (
    <DemoStack>
      <DemoSection title="Space control card · start, stop, update">
        <LiveControl />
      </DemoSection>
      <DemoSection title="Lifecycle and timer states">
        <StatesGrid />
      </DemoSection>
      <DemoSection title="Header controls · status and API pills, menus">
        <HeaderControls />
      </DemoSection>
      <DemoSection title="Remote session">
        <RemoteSession />
      </DemoSection>
      <DemoSection title="Server update card">
        <Updates />
      </DemoSection>
      <DemoSection title="Watcher panel · live and stalled">
        <Watcher />
      </DemoSection>
    </DemoStack>
  );
}
