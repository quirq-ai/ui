"use client";

// Demo: Local vs sent trust panel. Stays local vs sent split (copy a path), usage reporting
// in all four states plus a live switch (off, pending, on; a rejected key blocks it), the
// storage map while it loads, the localhost vs acme.localhost boundary diagram, the
// FILES STAY LOCAL header tag and the attribution row.
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GALILEO, GALILEO_SOURCES, USAGE_DAILY } from "@/lib/fixtures";
import { formatDate } from "@/lib/format";
import { Caption, Cell } from "./demo-kit";
import {
  AttributionRow,
  BoundaryDiagram,
  LocalHeaderStrip,
  LocalOnlyTag,
  TrustSplit,
  UsageReportingStatus,
  type ReportingState,
  type TrustSide,
} from "./trust-boundary";

const lastSent = formatDate(USAGE_DAILY[USAGE_DAILY.length - 1].date);
const notes = GALILEO_SOURCES.find((s) => s.name === "notes");

const SPLIT: [TrustSide, TrustSide] = [
  {
    id: "local",
    kicker: "Stays local",
    title: "On this machine",
    count: "Never sent",
    rail: "local",
    blurb: "Everything an agent reads or writes stays in the space. Copy a path to open it yourself.",
    rows: [
      { id: "prompts", label: "Prompts and responses", detail: "Full session histories under each project.", status: <LocalOnlyTag size="xs" /> },
      { id: "files", label: "~/projects", mono: true, copy: true, detail: "Project files, drafts and diffs.", status: <LocalOnlyTag size="xs" /> },
      { id: "secrets", label: "~/.xo/secrets", mono: true, copy: true, detail: "Secret values. Only names appear in the dashboard.", status: <LocalOnlyTag size="xs" /> },
      { id: "state", label: "~/.quirq", mono: true, copy: true, detail: "Watcher cursors and heartbeats.", status: <LocalOnlyTag size="xs" /> },
    ],
  },
  {
    id: "sent",
    kicker: "Sent daily",
    title: "Usage totals to XO",
    count: `Last sent ${lastSent}`,
    rail: "sent",
    blurb: "One small daily total per space, for billing and the usage view. No content.",
    rows: [
      { id: "tokens", label: "Tokens", detail: "Input and output counts per model.", status: "Totals" },
      { id: "cost", label: "Cost", detail: "USD from the usage meter.", status: "Totals" },
      { id: "sessions", label: "Sessions", detail: "How many ran, not what they said.", status: "Counts" },
      { id: "tools", label: "Tool calls", detail: "Counts per tool name.", status: "Counts" },
    ],
  },
];

const STORAGE_LOADING: [TrustSide, TrustSide] = [
  { id: "local", kicker: "Machine-local · ephemeral", title: ".quirq watcher state", rail: "local", rows: [] },
  { id: "portable", kicker: "XO project · portable", title: ".xo derived metadata", rail: "portable", rows: [] },
];

export function TrustBoundaryDemo() {
  const [state, setState] = useState<ReportingState>("off");
  const [folder, setFolder] = useState(false);

  useEffect(() => {
    if (state !== "pending") return;
    const t = setTimeout(() => setState("on"), 1400);
    return () => clearTimeout(t);
  }, [state]);

  const on = state === "on" || state === "pending";

  return (
    <div className="space-y-10">
      <Cell label="Variant · stays local vs sent (copy a path)">
        <TrustSplit sides={SPLIT} aria-label="What stays local and what is sent" />
      </Cell>

      <div className="space-y-3">
        <Caption>Interaction · turn reporting on or off (state {state})</Caption>
        <UsageReportingStatus
          state={state}
          lastSent={lastSent}
          href="#trust-boundary"
          control={
            <Switch
              size="sm"
              aria-label="Usage reporting"
              checked={on}
              busy={state === "pending"}
              onCheckedChange={(next) => setState(next ? "pending" : "off")}
            />
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="subtle" onClick={() => setState("blocked")} disabled={state === "blocked"}>
            Simulate a rejected key
          </Button>
          <span className="font-mono text-[10.5px] text-ink-faint">Demo only: nothing leaves this page.</span>
        </div>
      </div>

      <div className="space-y-3">
        <Caption>Variant · usage reporting · state on, blocked, pending, off</Caption>
        <div className="grid gap-3 lg:grid-cols-2">
          {(["on", "blocked", "pending", "off"] as ReportingState[]).map((s) => (
            <UsageReportingStatus key={s} state={s} lastSent={lastSent} />
          ))}
        </div>
      </div>

      <Cell label="Variant · storage map · state mapping watcher outputs">
        <TrustSplit sides={STORAGE_LOADING} loading aria-label="Storage map, loading" />
      </Cell>

      <Cell label="Variant · trust boundary diagram (localhost vs acme.localhost)">
        <BoundaryDiagram
          zones={[
            {
              origin: `localhost:${GALILEO.port}`,
              title: "telescope bar",
              rail: "local",
              items: ["The Sources page and the bar over every source", "Your source list in data/sources.json", "Never framed by a source"],
            },
            {
              origin: `acme.localhost:${GALILEO.port}`,
              title: "Source frame",
              rail: "sent",
              items: ["Your app at localhost:4173, proxied as is", "Its own origin: cannot read the bar or other sources", "Talks to the bar only by postMessage"],
            },
          ]}
          messages={[
            { id: "frame", direction: "toRight", label: "Frame request", detail: "/pricing" },
            { id: "tag", direction: "toLeft", label: "Bridge tag after the last byte", dotted: true },
            { id: "where", direction: "toLeft", label: "postMessage", detail: "where: /pricing and the page title" },
          ]}
        />
      </Cell>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Cell label="Variant · FILES STAY LOCAL header tag (no folder, connected, sample)">
          <div className="space-y-2">
            <LocalHeaderStrip
              product="Space Drift"
              state={folder ? "connected" : "none"}
              folder={notes?.path ?? "~/notes"}
              detail={notes?.detail}
              action={
                <Button size="sm" variant="secondary" onClick={() => setFolder((f) => !f)}>
                  {folder ? "Disconnect" : "Connect folder"}
                </Button>
              }
            />
            <LocalHeaderStrip product="Space Drift" state="connected" folder={notes?.path ?? "~/notes"} detail={notes?.detail} />
            <LocalHeaderStrip product="Space Drift" state="sample" />
          </div>
        </Cell>
        <Cell label="Attribution row (inline when wide, stacked when narrow)">
          <div className="rounded-[12px] border border-hair-soft bg-black/40 px-4 py-3">
            <AttributionRow
              byLabel="quirq.ai"
              byHref="https://quirq.ai"
              items={[
                { id: "agents", icon: <span className="block size-1 rounded-full bg-cyn" />, text: "Written and managed by agents, reviewed by people." },
                { id: "lock", icon: <Lock />, text: "We don't collect or store your file data." },
              ]}
            />
          </div>
        </Cell>
      </div>
    </div>
  );
}
