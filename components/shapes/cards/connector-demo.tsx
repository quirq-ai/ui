"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { CONNECTORS, DEVICE_SIGN_IN, USAGE_BY_RUNTIME, type Connector } from "@/lib/fixtures";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { SearchInput } from "@/components/ui/field";
import { LOGO_META, type LogoId } from "@/components/ui/runtime-logo";
import { ConnectorCard, NativeConnectorCard, TelemetrySourceCard, type ConnectorWord, type TelemetryState } from "./connector-cards";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const LOGO: Record<string, LogoId> = {
  github: "github",
  linear: "linear",
  slack: "slack",
  gmail: "gmail",
  notion: "notion",
  googledrive: "google-drive",
  whatsapp: "whatsapp",
  vercel: "vercel",
};

const WRITE = /comment|post|send|create|draft|update|open issue/i;

/** Next status after the primary action. */
function after(status: ConnectorWord): ConnectorWord {
  switch (status) {
    case "Not connected":
      return "On in this space";
    case "On in this space":
      return "Off in this space";
    case "Off in this space":
      return "On in this space";
    case "Needs attention":
    case "Sign-in pending":
      return "On in this space";
    case "Unavailable":
      return "Unavailable";
    default:
      return status;
  }
}

function ToolkitGrid() {
  const later = useLater();
  const [status, setStatus] = useState<Record<string, ConnectorWord>>(Object.fromEntries(CONNECTORS.map((c) => [c.toolkit, c.status])));
  const [busy, setBusy] = useState<string | null>(null);
  const [polling, setPolling] = useState<string | null>(null);
  const [polled, setPolled] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const visible = (c: Connector) => !removed.includes(c.toolkit) && (!q || `${c.displayName} ${c.description}`.toLowerCase().includes(q.toLowerCase()));
  const shown = CONNECTORS.filter(visible);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-[320px]">
          <SearchInput aria-label="Search connectors" placeholder="Search connectors" value={q} onChange={(e) => setQ(e.target.value)} shape="field" size="sm" />
        </div>
        <span className="rounded-full border border-hair px-2 py-0.5 text-[11px] text-ink-faint">
          {shown.length} of {CONNECTORS.length - removed.length}
        </span>
      </div>
      {/* the live region stays mounted so the no-match note is announced when it appears */}
      <div role="status">
        {shown.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-hair-strong p-6 text-center text-[12.5px] text-ink-dim">
            No connectors match &ldquo;{q}&rdquo;. Clear the search to show all connectors.
          </p>
        ) : null}
      </div>
      <div className="grid items-stretch gap-3 has-[[data-drawer]]:items-start [grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr))]">
        {shown.map((c) => {
          const s = status[c.toolkit];
          return (
            <ConnectorCard
              key={c.toolkit}
              logo={LOGO[c.toolkit]}
              name={c.displayName}
              auth={c.auth}
              description={c.description}
              status={s}
              account={s === "Not connected" ? null : c.account}
              note={s === c.status ? c.note : null}
              actions={c.actions.map((a) => ({ name: a, kind: WRITE.test(a) ? "write" : "read", on: true }))}
              collectors={c.collectors.length ? c.collectors : ["New items"]}
              pollEvery={c.pollEvery}
              lastPoll={polled[c.toolkit] ?? c.lastPolled}
              lastPollError={c.toolkit === "github" && !polled[c.toolkit] ? "rate limited (403). Next poll at 09:45." : null}
              busy={busy === c.toolkit || s === "Checking…"}
              polling={polling === c.toolkit}
              onPrimary={() => {
                setBusy(c.toolkit);
                later(() => {
                  setBusy(null);
                  setStatus((x) => ({ ...x, [c.toolkit]: after(s) }));
                }, 1000);
              }}
              onPollNow={() => {
                setPolling(c.toolkit);
                later(() => {
                  setPolling(null);
                  setPolled((x) => ({ ...x, [c.toolkit]: "just now" }));
                }, 1100);
              }}
              onDelete={() => setRemoved((r) => [...r, c.toolkit])}
            />
          );
        })}
      </div>
      {removed.length ? (
        <Button size="sm" variant="subtle" onClick={() => setRemoved([])} className="self-start">
          Restore removed connectors
        </Button>
      ) : null}
    </div>
  );
}

function NativeRow() {
  const [remotes, setRemotes] = useState(["design-files", "research"]);
  return (
    <div className="grid items-start gap-3 md:grid-cols-3">
      <Specimen label="GitHub · connected">
        <NativeConnectorCard
          logo="github"
          name="GitHub"
          state="connected"
          description="Repositories, issues and project sync."
          account="@ada-moreno"
          actions={
            <>
              <Button size="sm">Manage</Button>
              <Button size="sm" variant="danger">
                Disconnect
              </Button>
            </>
          }
        />
      </Specimen>
      <Specimen label="Google Drive · configured remotes">
        <NativeConnectorCard
          logo="google-drive"
          name="Google Drive"
          state="configured"
          description="Folders mounted through rclone remotes."
          actions={
            <Button size="sm" leadingIcon={<Plus />} onClick={() => setRemotes((r) => (r.includes("finance") ? r : [...r, "finance"]))}>
              Add account
            </Button>
          }
        >
          {remotes.length ? (
            <ul className="flex flex-col">
              {remotes.map((r) => (
                <li key={r} className="flex items-center justify-between gap-2 border-t border-hair-soft py-2 text-[12px] first:border-t-0 first:pt-0">
                  <span className="min-w-0 truncate font-mono text-ink">{r}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-grn">Configured</span>
                    <Button size="sm" variant="subtle" onClick={() => setRemotes((x) => x.filter((y) => y !== r))}>
                      Remove
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-ink-faint">No remotes yet.</p>
          )}
        </NativeConnectorCard>
      </Specimen>
      <Specimen label="Vercel · sign-in pending, device code">
        <NativeConnectorCard logo="vercel" name="Vercel" state="sign_in_pending" description="Deployments and build logs. Sign in from your browser.">
          <div className="flex flex-col gap-2.5 rounded-[8px] border border-hair p-3 text-[12px] text-ink-dim">
            <p>Open the sign-in page and enter this code.</p>
            <div className="flex items-center gap-2">
              <code className="select-all font-mono text-[14px] font-medium tracking-[0.06em] text-grn">{DEVICE_SIGN_IN.code}</code>
              <CopyButton text={DEVICE_SIGN_IN.code} size="sm" aria-label="Copy device code" announce="Device code copied" />
            </div>
            <a href={DEVICE_SIGN_IN.verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded-[4px]! text-ink underline underline-offset-[3px]">
              {DEVICE_SIGN_IN.verifyUrl.replace("http://", "")}
              <ExternalLink aria-hidden="true" className="size-3" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <p className="text-ink-faint">Code expires in {DEVICE_SIGN_IN.expiresIn}.</p>
          </div>
        </NativeConnectorCard>
      </Specimen>
    </div>
  );
}

const SOURCES: { runtime: "claude_code" | "codex" | "openclaw" | "cursor" | "gemini"; envKey: string | null; path: string; state: TelemetryState; costKnown: boolean; problem?: string }[] = [
  { runtime: "claude_code", envKey: "ARGUS_DB", path: "~/.claude/argus.db", state: "on", costKnown: true },
  { runtime: "codex", envKey: "CODEX_HOME", path: "~/.codex", state: "on", costKnown: true },
  { runtime: "openclaw", envKey: null, path: "~/.openclaw/agents", state: "pending", costKnown: false },
  { runtime: "cursor", envKey: "CURSOR_HOME", path: "~/Library/Application Support/Cursor", state: "off", costKnown: false },
  {
    runtime: "gemini",
    envKey: "GEMINI_HOME",
    path: "~/.gemini",
    state: "down",
    costKnown: false,
    problem: "No session store at ~/.gemini. Set GEMINI_HOME to the folder that holds it.",
  },
];

function TelemetryRow() {
  const later = useLater();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(SOURCES.map((s) => [s.runtime, s.state !== "off"])));
  const [busy, setBusy] = useState<string | null>(null);
  const [paths, setPaths] = useState<Record<string, string>>(Object.fromEntries(SOURCES.map((s) => [s.runtime, s.path])));
  return (
    <div className="grid items-start gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr))]">
      {SOURCES.map((s) => {
        const u = USAGE_BY_RUNTIME.find((x) => x.runtime === s.runtime);
        const meta = LOGO_META[s.runtime];
        const on = enabled[s.runtime];
        return (
          <TelemetrySourceCard
            key={s.runtime}
            logo={s.runtime}
            label={meta.label}
            vendor={meta.vendor ?? "Runtime"}
            vendorColor={meta.color ?? "var(--ink-faint)"}
            state={on ? (s.state === "off" ? "on" : s.state) : "off"}
            enabled={on}
            busy={busy === s.runtime}
            onEnabledChange={(v) => {
              setBusy(s.runtime);
              later(() => {
                setBusy(null);
                setEnabled((x) => ({ ...x, [s.runtime]: v }));
              }, 700);
            }}
            sessions={u?.sessions ?? null}
            tokens={u?.tokens ?? null}
            cost={s.costKnown ? (u?.cost ?? null) : null}
            problem={s.problem}
            envKey={s.envKey}
            path={paths[s.runtime]}
            onSavePath={(p) => setPaths((x) => ({ ...x, [s.runtime]: p }))}
          />
        );
      })}
    </div>
  );
}

export function ConnectorCardDemo() {
  return (
    <DemoStack>
      <DemoSection title="Toolkit connectors · every status · actions and polling drawers">
        <ToolkitGrid />
        <p className="mt-3 text-[12px] text-ink-faint">Open Actions or Polling on GitHub, Linear, Slack or Gmail. Connect, sign in or turn a connector on and off; it is a sample flow.</p>
      </DemoSection>
      <DemoSection title="Native connectors · connected, configured, sign-in pending">
        <NativeRow />
      </DemoSection>
      <DemoSection title="Telemetry sources · a source, not a connector">
        <TelemetryRow />
        <p className="mt-3 text-[12px] text-ink-faint">Mock usage from the 30-day window. Cost reads Unavailable where the source does not report it, and a source that is not found reads Unavailable throughout. Collection off dims the stats.</p>
      </DemoSection>
    </DemoStack>
  );
}
