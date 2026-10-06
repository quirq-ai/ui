"use client";

// Demo: Terminal, logs and code. Status transcript, log viewer (streaming, idle, loading,
// offline; follow tail, copy, scroll), galileo gateway log (start banner, per-source lines,
// added/changed/removed, sample port fallback, port taken with exit 1) and the code reader
// (TypeScript, JSON, raw text; wrapped and unwrapped).
import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { FILE_SAMPLES, GALILEO, GALILEO_SOURCES, LOG_LINES, RUNTIME_BY_ID, SESSIONS, TODOS, CURRENT_SPACE, SPACE_BY_ID, type LogLine, type RuntimeId } from "@/lib/fixtures";
import { formatBytes } from "@/lib/format";
import { Caption, Cell } from "./demo-kit";
import { GatewayLog, TerminalFrame, TerminalTranscript, type GatewayLine, type TranscriptLine } from "./terminal";
import { LogViewer } from "./log-viewer";
import { CodeReader } from "./code-reader";

/* ----------------------------------------------------------------------------- transcripts */

const open = SESSIONS.filter((s) => s.open);
const openByRuntime = open.reduce<Partial<Record<RuntimeId, number>>>((acc, s) => ({ ...acc, [s.runtime]: (acc[s.runtime] ?? 0) + 1 }), {});
const openSplit = (Object.entries(openByRuntime) as [RuntimeId, number][]).map(([r, n]) => `${RUNTIME_BY_ID[r].label} ${n}`).join(" · ");
const blocked = TODOS.filter((t) => t.status === "blocked").map((t) => t.content);
const billing = SPACE_BY_ID["ws_c40e19aa"];

const STATUS: TranscriptLine[] = [
  { kind: "prompt", text: `xo status ${CURRENT_SPACE.name}` },
  { kind: "ok", text: `space ${CURRENT_SPACE.name} Running · Space API Up · ${CURRENT_SPACE.host}`, strong: [CURRENT_SPACE.name] },
  { kind: "ok", text: `${open.length} sessions open · ${openSplit}`, strong: [`${open.length} sessions open`] },
  { kind: "next", text: `${blocked.length} steps waiting on a person: ${blocked.join(" · ")}`, strong: blocked },
];

const FAILED: TranscriptLine[] = [
  { kind: "prompt", text: `xo start ${billing.name}` },
  { kind: "dim", text: `  Starting ${billing.name} on ${billing.provider} (${billing.region})…` },
  { kind: "fail", text: "Space could not start", strong: ["Space could not start"] },
  { kind: "next", text: `Technical details: xo logs ${billing.name}`, strong: [`xo logs ${billing.name}`] },
  { kind: "prompt", text: "" },
];

const asText = (lines: TranscriptLine[]) =>
  lines.map((l) => `${l.kind === "prompt" ? "$ " : l.kind === "ok" ? "✓ " : l.kind === "next" ? "→ " : l.kind === "fail" ? "✗ " : ""}${l.text}`).join("\n");

/* ----------------------------------------------------------------------------- gateway */

const portSources = GALILEO_SOURCES.filter((s) => s.type === "port");
const fileSources = GALILEO_SOURCES.filter((s) => s.type === "files");

const GATEWAY: GatewayLine[] = [
  { prefix: "sample-app", text: "Acme Notes, as its own server sends it: http://localhost:4173" },
  { prefix: "galileo", text: `${GALILEO.origin}/ telescope: the Sources page, and every source under its bar` },
  ...portSources.map((s) => ({ prefix: "galileo", text: `${s.url} → localhost:${s.port}${s.up ? "" : ` (${s.detail.toLowerCase()})`}` })),
  ...fileSources.slice(0, 2).map((s) => ({ prefix: "galileo", text: `${s.url} → ${s.path}` })),
  { prefix: "galileo", text: "added notes → /Users/ada/notes" },
  { prefix: "galileo", text: "changed docs → localhost:3002" },
  { prefix: "galileo", text: "removed web" },
];

const GATEWAY_TAKEN: GatewayLine[] = [
  { prefix: "sample-app", text: "port 4173 is taken, so Acme Notes is on the next one: http://localhost:4174" },
  { prefix: "galileo", text: `port ${GALILEO.port} is taken: start it on another with PORT=${GALILEO.port + 1} npm start`, level: "error" },
];

/* ----------------------------------------------------------------------------- build log */

const BUILD_LINES: LogLine[] = [
  [0, "info", "build", "pnpm install --frozen-lockfile"],
  [0, "info", "build", "Lockfile is up to date, resolution step is skipped"],
  [1, "info", "build", "Packages: +412"],
  [3, "warn", "build", "deprecated: inflight@1.0.6, glob@7.2.3"],
  [8, "info", "build", "next build"],
  [21, "info", "build", "Compiled successfully in 12.8s"],
  [22, "info", "build", "Generating static pages (14/14)"],
  [24, "info", "agent", "startup script: installing openclaw@0.9.2"],
  [27, "info", "agent", "gateway listening on :18789"],
  [28, "info", "space-api", "GET /health 200 in 3ms"],
].map(([sec, level, source, message], i) => ({
  id: i + 1,
  ts: "",
  time: `09:10:${String(sec).padStart(2, "0")}`,
  level: level as LogLine["level"],
  source: source as string,
  message: message as string,
}));

/* The agent stream replays the seeded lines in a loop so the streaming state never runs
   out: line k repeats seed k mod n, shifted forward by whole replay cycles. Pure and
   deterministic, so the first render matches on server and client. */
const START = 16;
const WINDOW = 120;
const toSec = (hms: string) => {
  const [h, m, sec] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + sec;
};
const fromSec = (t: number) => {
  const d = ((t % 86400) + 86400) % 86400;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(d / 3600))}:${p(Math.floor((d % 3600) / 60))}:${p(d % 60)}`;
};
const CYCLE_SEC = toSec(LOG_LINES[LOG_LINES.length - 1].time) - toSec(LOG_LINES[0].time) + 12;

function streamLine(k: number): LogLine {
  const seed = LOG_LINES[k % LOG_LINES.length];
  const cycle = Math.floor(k / LOG_LINES.length);
  return cycle === 0 ? seed : { ...seed, id: k + 1, ts: "", time: fromSec(toSec(seed.time) + cycle * CYCLE_SEC) };
}

export function TerminalDemo() {
  const [count, setCount] = useState(START);
  const [playing, setPlaying] = useState(true);
  const [tab, setTab] = useState<"agent" | "build">("agent");
  const streaming = playing && tab === "agent";

  useEffect(() => {
    if (!streaming) return;
    const t = setInterval(() => setCount((c) => c + 1), 1100);
    return () => clearInterval(t);
  }, [streaming]);

  const agentLines = useMemo(
    () => Array.from({ length: Math.min(count, WINDOW) }, (_, i) => streamLine(count - Math.min(count, WINDOW) + i)),
    [count],
  );
  const lines = tab === "agent" ? agentLines : BUILD_LINES;

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Cell label="Variant · status transcript">
          <TerminalFrame title="~/projects · zsh" actions={<CopyButton text={asText(STATUS)} size="sm" aria-label="Copy transcript" announce="Transcript copied" />}>
            <TerminalTranscript lines={STATUS} label="xo status output" />
          </TerminalFrame>
        </Cell>
        <Cell label="Status transcript · failed start, waiting for input">
          <TerminalFrame title="~/projects · zsh" actions={<CopyButton text={asText(FAILED)} size="sm" aria-label="Copy transcript" announce="Transcript copied" />}>
            <TerminalTranscript lines={FAILED} label="xo start output" caret />
          </TerminalFrame>
        </Cell>
      </div>

      <div className="space-y-3">
        <Caption>Variant · log viewer · state {streaming ? "streaming" : "idle"} (scroll up to pause follow, Agent and Build tabs)</Caption>
        <LogViewer
          title={tab === "agent" ? "Agent logs" : "Build logs"}
          lines={lines}
          state={streaming ? "streaming" : "idle"}
          height={300}
          toolbar={
            <Segmented<"agent" | "build">
              size="sm"
              aria-label="Log source"
              value={tab}
              onChange={setTab}
              options={[
                { value: "agent", label: "Agent" },
                { value: "build", label: "Build" },
              ]}
            />
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={playing ? <Pause /> : <Play />}
            onClick={() => setPlaying((p) => !p)}
            disabled={tab !== "agent"}
          >
            {playing ? "Pause stream" : "Resume stream"}
          </Button>
          <Button
            size="sm"
            variant="subtle"
            leadingIcon={<RotateCcw />}
            onClick={() => {
              setCount(START);
              setPlaying(true);
            }}
          >
            Replay
          </Button>
          <span className="font-mono text-[10.5px] text-ink-faint">Mock log lines from research-lab, one every 1.1 s, replayed in a loop.</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label="Log viewer · state loading">
          <LogViewer title="Agent logs" lines={[]} state="loading" height={170} />
        </Cell>
        <Cell label="Log viewer · state offline">
          <LogViewer title="Agent logs" lines={[]} state="offline" height={170} />
        </Cell>
      </div>

      <div className="space-y-6">
        <Cell label="Variant · gateway log (start banner, per-source lines, added, changed, removed)">
          <TerminalFrame title="galileo · npm start">
            <GatewayLog lines={GATEWAY} label="galileo start output" />
          </TerminalFrame>
        </Cell>
        <Cell label="Gateway log · sample port fallback, port taken (error, exit 1)">
          <TerminalFrame title="galileo · npm start">
            <GatewayLog lines={GATEWAY_TAKEN} exitCode={1} label="galileo error output" />
          </TerminalFrame>
        </Cell>
      </div>

      <div className="space-y-6">
        <Cell label="Variant · code reader (TypeScript, unwrapped)">
          <CodeReader code={FILE_SAMPLES.typescript.content} language="typescript" filename={FILE_SAMPLES.typescript.path} meta={`TypeScript · ${formatBytes(FILE_SAMPLES.typescript.size)}`} />
        </Cell>
        <div className="grid gap-6 lg:grid-cols-2">
          <Cell label="Code reader · JSON">
            <CodeReader code={FILE_SAMPLES.json.content} language="json" filename={FILE_SAMPLES.json.path} meta={`JSON · ${formatBytes(FILE_SAMPLES.json.size)}`} wrapToggle={false} maxHeight={300} />
          </Cell>
          <Cell label="Code reader · raw source (wrapped)">
            <CodeReader
              code={FILE_SAMPLES.csv.content.split("\n").slice(0, 12).join("\n")}
              language="text"
              filename={FILE_SAMPLES.csv.path}
              meta="CSV · mock"
              defaultWrap
              maxHeight={300}
            />
          </Cell>
        </div>
      </div>
    </div>
  );
}
