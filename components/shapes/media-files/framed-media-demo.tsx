"use client";

// Live demo for framed screenshots: framed (radius 8.5 and 20, warm layers panel), browser
// mock (bottom-anchored in a bento tile, and a closed frame) and the tab viewer that
// crossfades between Graph, Timeline and Sessions. Screens are SVG renders of fixtures.
import { useState } from "react";
import {
  CURRENT_SPACE,
  GRAPH,
  PROJECTS,
  PROJECT_BY_ID,
  RUNTIMES,
  RUNTIME_BY_ID,
  SESSIONS,
  SPACE_BY_ID,
  SWIMLANES,
  SWIMLANE_DAY,
  USAGE_DAILY,
  USAGE_SUMMARY,
  FIXTURE_NOTE,
  toneVar,
} from "@/lib/fixtures";
import { Caption, DemoSection, DemoStack, FootNote, Specimen } from "./_kit";
import { BrowserFrame, FramedMedia, MediaTile } from "./framed-media";
import { ScreenshotTabs, type ScreenshotView } from "./screenshot-tabs";
import { EnvironmentScreen, GraphScreen, LayersScreen, SessionsScreen, TimelineScreen, UsageScreen } from "./screens";

const SPACE_SESSIONS = SESSIONS.filter((s) => s.spaceId === CURRENT_SPACE.id);
const FOCUS = PROJECT_BY_ID["xo-space"];
const FOCUS_SESSIONS = SESSIONS.filter((s) => s.projectId === FOCUS.id);

const GRAPH_PANEL = {
  title: FOCUS.displayName,
  rows: [
    ["Sessions", String(FOCUS.sessions)],
    ["Open now", String(FOCUS.openSessions)],
    ["Files", String(FOCUS.files)],
    ["Last active", FOCUS.lastActive],
  ] as [string, string][],
  runtimes: RUNTIMES.filter((r) => FOCUS_SESSIONS.some((s) => s.runtime === r.id)).map((r) => ({
    label: r.label,
    color: toneVar(r.color),
    count: FOCUS_SESSIONS.filter((s) => s.runtime === r.id).length,
  })),
};

const OPS = SPACE_BY_ID["ws_7f3a9c21e4b0"];
const OPS_PROJECTS = PROJECTS.filter((p) => p.spaceId === OPS.id).map((p) => ({ name: p.displayName, sessions: p.sessions, color: toneVar(p.color) }));

const LAYERS = [
  { num: "01", name: "Observatory", body: "Graph, timeline and sessions: what ran, what it cost.", color: "var(--blu)" },
  { num: "02", name: "Environments", body: "Harness, model, memory and tools, packaged to run.", color: "var(--grn)" },
  { num: "03", name: "Spaces", body: "Local or hosted machines that hold environments.", color: "var(--org)" },
];

const runtimeLabel = (id: (typeof SESSIONS)[number]["runtime"]) => RUNTIME_BY_ID[id].label;
const runtimeColor = (id: (typeof SESSIONS)[number]["runtime"]) => toneVar(RUNTIME_BY_ID[id].color);

const usageTotals = {
  tokens: USAGE_SUMMARY["30 days"].tokens,
  cost: USAGE_SUMMARY["30 days"].cost,
  sessions: USAGE_SUMMARY["30 days"].sessions,
};

const VIEWS: ScreenshotView[] = [
  {
    key: "graph",
    label: "Graph",
    screen: (
      <GraphScreen
        uid="tabs-graph"
        label={`Space graph view: runtimes, projects, sessions and files of ${CURRENT_SPACE.name} clustered in one graph`}
        nodes={GRAPH.nodes}
        edges={GRAPH.edges}
        layout={{ width: GRAPH.width, height: GRAPH.height }}
        spaceName={CURRENT_SPACE.name}
        panel={GRAPH_PANEL}
      />
    ),
    caption: { title: "Everything a space holds", body: "Runtimes, projects, sessions and the files they touched, clustered in one live graph." },
  },
  {
    key: "timeline",
    label: "Timeline",
    screen: (
      <TimelineScreen
        uid="tabs-timeline"
        label={`Space timeline view: each runtime's runs on ${SWIMLANE_DAY.label}, hour by hour`}
        lanes={SWIMLANES}
        dayLabel={SWIMLANE_DAY.label}
        ticks={[360, 540, 720, 900, 1080, 1260, 1440]}
        range={[360, 1440]}
      />
    ),
    caption: { title: "Every run, hour by hour", body: "Each runtime's day as a lane: what ran, what failed and what waited for a person." },
  },
  {
    key: "sessions",
    label: "Sessions",
    screen: (
      <SessionsScreen
        uid="tabs-sessions"
        label="Space sessions view: runtime, model, token spend and mock cost for every session"
        sessions={SPACE_SESSIONS.slice(0, 9)}
        runtimeLabel={runtimeLabel}
        runtimeColor={runtimeColor}
      />
    ),
    caption: { title: "Spend per session", body: "Models and token spend for every session. Tokens and cost are the usage meter, never quirqs." },
  },
];

export function FramedMediaDemo() {
  const [view, setView] = useState("graph");
  return (
    <DemoStack>
      <DemoSection title="Framed · landing" note="Real product renders in a dark frame with a hair-strong border. No fake glow.">
        <div className="grid items-start gap-x-6 gap-y-8 md:grid-cols-2">
          <Specimen label="space graph · radius 8.5">
            <FramedMedia radius="sm" caption={`${CURRENT_SPACE.name} space graph. Mock data.`}>
              <GraphScreen
                uid="framed-graph"
                label={`Knowledge graph of the ${CURRENT_SPACE.name} space`}
                nodes={GRAPH.nodes}
                edges={GRAPH.edges}
                layout={{ width: GRAPH.width, height: GRAPH.height }}
                spaceName={CURRENT_SPACE.name}
                width={560}
                height={518}
              />
            </FramedMedia>
          </Specimen>
          <Specimen label="environment view · radius 20">
            <FramedMedia radius="lg" caption={`${OPS.name}, a hosted space on ${OPS.provider}. Meters are mock.`}>
              <EnvironmentScreen
                uid="framed-env"
                label={`Environment view of the ${OPS.name} space: status, runtime, meters and projects`}
                space={OPS}
                runtimeLabel={RUNTIME_BY_ID[OPS.runtime].label}
                projects={OPS_PROJECTS}
              />
            </FramedMedia>
          </Specimen>
          <Specimen label="layers panel · warm frame" className="md:col-span-2">
            <FramedMedia radius="lg" tone="warm" inset>
              <LayersScreen layers={LAYERS} />
            </FramedMedia>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Browser mock" note="A grey browser shell with a mono URL pill. In a bento tile it is anchored to the bottom edge.">
        <div className="grid items-start gap-x-6 gap-y-8 md:grid-cols-[1.25fr_1fr]">
          <Specimen label="bottom-anchored in tile">
            <MediaTile
              kicker="Mock data"
              title="Unified cost observability"
              body="Each space comes with a usage meter that details the cost, time spent and sessions of your agents."
              className="flex-1"
            >
              <BrowserFrame url="quirq.ai">
                <UsageScreen
                  uid="bento-usage"
                  label={`Space dashboard usage view: Claude Code ${RUNTIME_BY_ID.claude_code.sessions} sessions, Codex ${RUNTIME_BY_ID.codex.sessions} sessions, OpenClaw ${RUNTIME_BY_ID.openclaw.sessions} sessions, Cursor ${RUNTIME_BY_ID.cursor.sessions} sessions`}
                  runtimes={RUNTIMES}
                  days={USAGE_DAILY}
                  totals={usageTotals}
                />
              </BrowserFrame>
            </MediaTile>
          </Specimen>
          <Specimen label="full frame">
            <div className="rounded-[18px] border border-hair-soft bg-[#0f0f11] p-[clamp(14px,3vw,24px)]">
              <BrowserFrame url="localhost:5002" anchor="full">
                <TimelineScreen
                  uid="browser-timeline"
                  label={`Timeline of ${SWIMLANE_DAY.label} in the Space dashboard`}
                  lanes={SWIMLANES}
                  dayLabel={SWIMLANE_DAY.label}
                  ticks={[360, 720, 1080, 1440]}
                  range={[360, 1440]}
                  width={640}
                  height={420}
                />
              </BrowserFrame>
              <Caption className="mt-3">Space dashboard on a local space</Caption>
            </div>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection
        title="Tab viewer · crossfade"
        note="Pick a view: the shown screen fades in over 300ms, the others go transparent and are hidden from assistive tech. Screens show mock data."
      >
        <ScreenshotTabs aria-label="Space screenshot views" views={VIEWS} value={view} onChange={setView} />
        <p className="mt-3 text-[12px] text-ink-faint" aria-live="polite">
          Showing {VIEWS.find((v) => v.key === view)?.label}. Arrow keys move between views.
        </p>
      </DemoSection>
      <FootNote>{FIXTURE_NOTE} Screens are drawn from the shared fixtures.</FootNote>
    </DemoStack>
  );
}
