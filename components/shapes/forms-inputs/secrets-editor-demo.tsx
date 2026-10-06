"use client";

import { useState } from "react";
import { SECRETS, SPACE_BY_ID, type Secret } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import { ApiKeyPanel, CredentialList, EnvPasteComposer, SecretRowList, type SecretRow } from "./secrets-editor";
import { useTimers } from "./_timers";

const toRow = (s: Secret): SecretRow => ({
  key: s.name,
  state: s.status === "Set" ? "configured" : s.status === "Not set" ? "not_set" : "needs_attention",
  hint: s.masked,
  usedBy: s.usedBy,
  updated: s.updated,
});

const SPACE_SECRETS = SECRETS.filter((s) => s.scope === "space");
const RESEARCH = SPACE_BY_ID["ws_2b81d0e4"];

const PASTE = `# research-lab
OPENAI_API_KEY=sk-example-0000
XO_API_KEY="xo_example_0000"
NOTION_TOKEN=secret_example_0000`;

/** Setup card: paste, review, save, then manage rows. Values live only in this demo's memory. */
function SetupCard() {
  const [rows, setRows] = useState<SecretRow[]>(SPACE_SECRETS.map(toRow));
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-5 rounded-[14px] border border-hair bg-s2 p-5">
      <div>
        <h4 className="text-[14px] font-semibold text-ink">Secrets</h4>
        <p className="mt-0.5 text-[12.5px] text-ink-dim">
          Environment values for <span className="font-mono text-ink">{RESEARCH.name}</span>. Write-only: saved values are never shown again.
        </p>
      </div>
      <EnvPasteComposer
        defaultText={PASTE}
        existingKeys={rows.filter((r) => r.state !== "not_set").map((r) => r.key)}
        onSave={(entries) => {
          let added = 0;
          let updated = 0;
          const next = [...rows];
          const nextValues = { ...values };
          for (const e of entries) {
            const at = next.findIndex((r) => r.key === e.key);
            if (at < 0) {
              added++;
              next.push({ key: e.key, state: "configured", updated: "just now" });
            } else if (values[e.key] !== e.value) {
              updated++;
              next[at] = { ...next[at], state: "configured", updated: "just now" };
            }
            nextValues[e.key] = e.value;
          }
          setRows(next);
          setValues(nextValues);
          return { added, updated };
        }}
      />
      <SecretRowList
        rows={rows}
        onReplace={(key, value) => {
          setValues((v) => ({ ...v, [key]: value }));
          setRows((rs) => rs.map((r) => (r.key === key ? { ...r, state: "configured", updated: "just now" } : r)));
        }}
        onRemove={(key) => setRows((rs) => rs.filter((r) => r.key !== key))}
      />
    </div>
  );
}

/** Load error with Try again: the retry "loads" and shows the rows. */
function RetryableList() {
  const later = useTimers();
  const [phase, setPhase] = useState<"error" | "loading" | "ok">("error");
  return (
    <SecretRowList
      rows={phase === "ok" ? SPACE_SECRETS.slice(0, 2).map(toRow) : []}
      loading={phase === "loading"}
      loadError={phase === "error" ? "Could not load secrets. The Space API did not answer." : null}
      onRetry={() => {
        setPhase("loading");
        later(() => setPhase("ok"), 900);
      }}
    />
  );
}

export function SecretsEditorDemo() {
  return (
    <div>
      <DemoGrid>
        <DemoCell label="Setup card · merge by key" note="Save, then save the same paste again" className="md:col-span-2">
          <SetupCard />
        </DemoCell>
        <DemoCell label="iOS grouped · expandable credential row" note="Tap a row; reveal in the field">
          <CredentialList
            title="Space secrets"
            rows={SECRETS.slice(0, 5).map(toRow)}
            defaultOpen="GITHUB_TOKEN"
            footnote="Stored in the space. XO Swarm never sees the values."
          />
        </DemoCell>
        <DemoCell label="BYO key panel">
          <div className="flex flex-col gap-3">
            <ApiKeyPanel title="Composio API key" envVar="COMPOSIO_BYO_API_KEY" state="set" description="Connectors are active." />
            <ApiKeyPanel title="Composio API key" envVar="COMPOSIO_BYO_API_KEY" state="env" description="Connectors are active." />
            <ApiKeyPanel title="Gemini API key" envVar="GEMINI_API_KEY" state="not_set" description="Needed before Gemini CLI can run in this space." defaultReplacing />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid cols={2}>
        <DemoCell label="State · saving">
          <SecretRowList rows={[toRow(SECRETS[4])]} savingKey={SECRETS[4].name} />
        </DemoCell>
        <DemoCell label="State · empty">
          <SecretRowList rows={[]} />
        </DemoCell>
        <DemoCell label="State · loading">
          <SecretRowList rows={[]} loading />
        </DemoCell>
        <DemoCell label="State · load error">
          <RetryableList />
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
