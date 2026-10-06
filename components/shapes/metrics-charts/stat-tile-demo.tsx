// Demo: stat tiles and KPI rows. Variants hero, 4-up, stat pair, resource tiles and mini;
// states value, Unavailable (never a dash or 0) and skeleton. Usage numbers are the token
// meter for the last 7 days of research-lab, all mock.
import { Clock, Cpu, Database, Folder, FileText, Layers, MessageSquare, Radio, Wrench } from "lucide-react";
import {
  CHAT_TRANSCRIPT,
  FILE_TREE,
  GALILEO,
  PROJECTS,
  SPACE_BY_ID,
  USAGE_BY_RUNTIME,
  USAGE_GAP_DATE,
  USAGE_PREVIOUS_7,
  USAGE_SUMMARY,
  ACTIVITY,
  TODOS,
  SESSIONS,
  PROJECT_BY_ID,
} from "@/lib/fixtures";
import { formatBytes, formatDate, formatList } from "@/lib/format";
import { Caption, Delta, DemoCell, ProvenanceTag, formatValue } from "./chart-kit";
import { FactGrid, ResourceTiles, StatGrid, StatPair, StatTile } from "./stat-tile";

export function StatTileDemo() {
  const w = USAGE_SUMMARY["7 days"];
  const prev = USAGE_PREVIOUS_7;
  const w30 = USAGE_SUMMARY["30 days"];
  const s = CHAT_TRANSCRIPT.session;
  const lab = SPACE_BY_ID["ws_2b81d0e4"];
  const ops = SPACE_BY_ID["ws_7f3a9c21e4b0"];
  const billing = SPACE_BY_ID["ws_c40e19aa"];
  const labProjects = PROJECTS.filter((p) => p.spaceId === lab.id);
  const labFiles = labProjects.reduce((a, p) => a + p.files, 0);
  const openNow = SESSIONS.filter((x) => x.open && labProjects.some((p) => p.id === x.projectId)).length;
  /* week over week; a missing side stays Unavailable rather than becoming a change from 0 */
  const change = (a: number | null, b: number | null) => (a === null || b === null || b === 0 ? null : a / b - 1);
  const xs = PROJECT_BY_ID["xo-space"];
  const xsSessions = SESSIONS.filter((x) => x.projectId === xs.id);
  const xsSteps = TODOS.filter((t) => xsSessions.some((x) => x.id === t.sessionId) && t.status !== "completed" && t.status !== "cancelled").length;
  const xsEvents = ACTIVITY.filter((a) => a.projectId === xs.id).length;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <DemoCell caption="Hero · footer divider · mock">
          <StatTile
            variant="hero"
            label="Total tokens"
            labelStyle="plain"
            badge="7 days"
            value={formatValue(w.tokens, "tokens")}
            note={`${formatValue(w.tokens / w.sessions, "tokens")} per session · usage meter, not quirqs`}
            delta={<Delta value={change(w.tokens, prev.tokens)} neutral suffix="vs prior 7 days" />}
            footer={{ value: `~${formatValue(w.cost, "currency")}`, label: "Estimated cost · mock pricing 2026-09" }}
          />
        </DemoCell>
        <DemoCell caption="KPI row · 4-up when wide, 2-up at this width, 1-up on phones · primary tone first">
          <StatGrid cols={4}>
            <StatTile
              label="Sessions"
              icon={<Layers />}
              tone="blu"
              value={formatValue(w.sessions)}
              note={`${USAGE_BY_RUNTIME.length} runtimes · ${formatList(USAGE_BY_RUNTIME.map((r) => r.label))}`}
              delta={<Delta value={change(w.sessions, prev.sessions)} />}
            />
            <StatTile label="Messages" icon={<MessageSquare />} value={formatValue(w.messages)} note="Across every space" delta={<Delta value={change(w.messages, prev.messages)} />} />
            <StatTile
              label="Avg latency"
              icon={<Clock />}
              value={formatValue(w.avgLatencyMs, "latency")}
              note={`p95 ${formatValue(w.p95LatencyMs, "latency")}`}
              delta={<Delta value={change(w.avgLatencyMs, prev.avgLatencyMs)} upIsGood={false} />}
            />
            <StatTile label="Tool calls" icon={<Wrench />} value={formatValue(w.toolCalls)} note={`${formatValue(w.toolCalls / w.messages, "decimal1")} per message`} delta={<Delta value={change(w.toolCalls, prev.toolCalls)} />} />
          </StatGrid>
        </DemoCell>
      </div>

      <DemoCell caption={`Session stat cards · ${s.title}`}>
        <StatGrid cols={4}>
          <StatTile label="Session tokens" value={formatValue(s.tokens, "tokens")} note={`${formatValue(s.inputTokens, "tokens")} in · ${formatValue(s.outputTokens, "tokens")} out`} />
          <StatTile label="Cost (est.)" value={`~${formatValue(s.cost, "currency")}`} note="Mock pricing 2026-09 · usage meter" />
          <StatTile label="Turns" value={formatValue(s.turns)} note="Model iterations" />
          <StatTile label="Duration" value={s.duration} note={`${formatValue(s.toolCalls)} tool calls`} />
        </StatGrid>
      </DemoCell>

      <DemoCell caption={`Metric tiles · ${lab.name} · Technical details`}>
        <StatGrid cols={4}>
          <StatTile label="Files" icon={<FileText />} value={formatValue(labFiles)} note={`Across ${labProjects.length} projects`} />
          <StatTile label="Storage" icon={<Database />} value={formatBytes(FILE_TREE.size)} note={`${FILE_TREE.name} tree, excluding directories`} />
          <StatTile label="Projects" icon={<Folder />} value={formatValue(labProjects.length)} note="Portable .xo stores" />
          <StatTile label="Open now" icon={<Radio />} value={formatValue(openNow)} note="Sessions in this space" tone="grn" />
        </StatGrid>
      </DemoCell>

      <div className="grid gap-6 lg:grid-cols-2">
        <DemoCell caption={`Resource tiles · ${ops.name} · Up`}>
          <ResourceTiles
            items={[
              { label: "Space API", value: ops.apiStatus, state: "up" },
              { label: "Gateway", value: "Up", state: "up" },
              { label: "Runtime", value: "openclaw", mono: true },
              { label: "Gateway port", value: `:${GALILEO.port}`, mono: true },
            ]}
          />
        </DemoCell>
        <DemoCell caption="Resource tiles · error value · Down">
          <ResourceTiles
            items={[
              { label: "Space API", value: "Down", state: "down" },
              { label: "Gateway", value: "Up", state: "up" },
              { label: "Runtime", value: "codex", mono: true },
              { label: "Uptime", value: null },
            ]}
          />
        </DemoCell>
        <DemoCell caption="Resource tiles · loading">
          <ResourceTiles status="loading" items={[{ label: "Space API", value: null }, { label: "Gateway", value: null }, { label: "Runtime", value: null }, { label: "Gateway port", value: null }]} />
        </DemoCell>
        <DemoCell caption="Resource tiles · offline placeholder">
          <ResourceTiles
            status="offline"
            items={[]}
            offlineTitle={`${billing.name} is Stopped`}
            offlineNote="Start the space to read live metadata. Files stay on disk."
          />
        </DemoCell>
      </div>

      <DemoCell caption="Stat pair · side by side, stacked on phones · illustrative">
        <StatPair
          items={[
            { label: "What that repeating work costs you now", value: formatValue(15 * 48 * 85, "currency0"), note: "A year of your own time, at $85 an hour." },
            { label: "What the hours you get back are worth", value: formatValue(9.6 * 48 * 85, "currency0"), note: "A year of the returned hours, at the same rate." },
          ]}
        />
        <div className="flex items-center gap-2 text-[11.5px] text-ink-faint">
          <ProvenanceTag provenance="illustrative" />
          15 hrs a week × 48 working weeks · 9.6 hours back
        </div>
      </DemoCell>

      <div className="grid gap-6 lg:grid-cols-3">
        <DemoCell caption="Mini · world signature stats">
          <FactGrid
            facts={[
              { label: "Bodies", value: formatValue(PROJECTS.length) },
              { label: "Emitting", value: formatValue(SESSIONS.filter((x) => x.open).length), tone: "grn" },
              { label: "Total mass", value: formatValue(w30.tokens, "tokens") },
            ]}
          />
        </DemoCell>
        <DemoCell caption={`Mini · drawer facts · ${xs.id}`}>
          <FactGrid
            cols={2}
            size="sm"
            facts={[
              { label: "Sessions", value: formatValue(xs.sessions) },
              { label: "Open now", value: formatValue(xs.openSessions) },
              { label: "Steps", value: formatValue(xsSteps) },
              { label: "Events", value: formatValue(xsEvents) },
            ]}
          />
        </DemoCell>
        <DemoCell caption="Mini · inside a card">
          <div className="grid grid-cols-2 gap-2">
            <StatTile variant="mini" label="Turns" value={formatValue(s.turns)} note="this session" />
            <StatTile variant="mini" label="Cost" value={formatValue(s.cost, "currency")} note="estimated" />
          </div>
        </DemoCell>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DemoCell caption="Unavailable when unknown · never 0, never a dash">
          <StatGrid cols={2}>
            <StatTile label="Response time" icon={<Clock />} value={null} unavailableNote={`No latency telemetry on ${formatDate(USAGE_GAP_DATE)}.`} />
            <StatTile label="CPU" icon={<Cpu />} value={billing.usage.cpu.used === null ? null : String(billing.usage.cpu.used)} unavailableNote={`${billing.name} is Stopped and cannot report it.`} />
          </StatGrid>
        </DemoCell>
        <div className="flex flex-col gap-2.5">
          <Caption>Skeleton · while loading</Caption>
          <StatGrid cols={2}>
            <StatTile label="Total tokens" value={null} loading />
            <StatTile label="Sessions" value={null} loading />
          </StatGrid>
        </div>
      </div>
    </div>
  );
}
