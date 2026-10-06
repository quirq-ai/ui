"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { Switch } from "@/components/ui/switch";
import { PRICING_PLANS, RUNTIMES, type RuntimeId } from "@/lib/fixtures";
import { DemoCell, DemoGrid, DemoRule } from "./_kit";
import { OnOffToggle, RadioCardGroup, SettingsList, SourceCheckboxGroup, SwitchRow } from "./toggles";

const logoFor = (id: RuntimeId) => (id === "gemini_cli" ? "gemini" : id);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const SOURCES = RUNTIMES.filter((r) => r.id !== "gemini_cli").map((r) => ({
  id: r.id,
  label: r.label,
  icon: <RuntimeLogo id={logoFor(r.id)} size={14} decorative />,
  available: r.id !== "cursor" && r.installed,
  badge: r.installed ? "offline" : "not installed",
  reason: r.id === "cursor" ? "Cursor is not running on this machine." : `${r.label} is not installed in this space.`,
}));

const MANAGED = PRICING_PLANS.find((p) => p.id === "managed") ?? PRICING_PLANS[1];

function BilledAnnually() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-hair bg-s1 p-4">
      <Switch checked={annual} onCheckedChange={setAnnual} label="Billed annually" labelPosition="end" />
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-dim">
        <span>{MANAGED.name}</span>
        <span className="font-mono text-ink tabular-nums">{annual ? "$39" : MANAGED.price}</span>
        <span>{annual ? "per space per month, billed yearly" : MANAGED.cadence}</span>
        <Badge tone="org" size="xs" mono>
          Illustrative
        </Badge>
      </p>
    </div>
  );
}

export function TogglesDemo() {
  return (
    <div>
      <DemoGrid>
        <DemoCell label="Switch row" note="Click or Space; saves show a busy thumb">
          <SettingsList title="Activity">
            <SwitchRow
              label="Update activity automatically"
              description="Keep sessions and project history up to date."
              defaultChecked
              onCheckedChange={() => wait(900)}
            />
            <SwitchRow
              label="Send step updates to Inbox"
              description="A card when a step completes or gets blocked."
              onCheckedChange={() => wait(900)}
            />
            <SwitchRow label="Sync shared projects every hour" description="Pull new commits that other spaces shared with this one." defaultChecked busy />
            <SwitchRow
              label="Share usage with XO Swarm"
              description="Available on hosted spaces only."
              disabled
              status="Off · this is a local space"
            />
          </SettingsList>
        </DemoCell>

        <DemoCell label="Source checkbox group" note="Hover offline for the reason">
          <div className="flex flex-col gap-6">
            <SourceCheckboxGroup sources={SOURCES} defaultValue={["claude_code", "codex"]} />
            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] text-ink-faint">None selected</span>
              <SourceCheckboxGroup legend="Sources" sources={SOURCES.slice(0, 3)} defaultValue={[]} />
            </div>
          </div>
        </DemoCell>

        <DemoCell label="Radio card" note="Arrow keys move the choice">
          <RadioCardGroup
            name="org-agent-runtime"
            legend="Runtime for the org agent"
            hint="It answers in shared channels and runs jobs for the org."
            defaultValue="codex"
            options={[
              {
                value: "codex",
                title: "Codex",
                description: "Runs on OpenAI models",
                icon: <RuntimeLogo id="codex" size={18} decorative />,
                badge: <Badge size="xs" mono>Default</Badge>,
              },
              { value: "claude_code", title: "Claude Code", description: "Runs on Anthropic models", icon: <RuntimeLogo id="claude_code" size={18} decorative /> },
              {
                value: "openclaw",
                title: "OpenClaw",
                description: "Open-source runtime with channels",
                icon: <RuntimeLogo id="openclaw" size={18} decorative />,
              },
              { value: "hermes", title: "Hermes", description: "Not installed in this space", icon: <RuntimeLogo id="hermes" size={18} decorative />, disabled: true },
            ]}
          />
        </DemoCell>

        <DemoCell label="ON/OFF toggle · billed annually">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 rounded-[12px] border border-blu/20 bg-[#05080d]/80 p-2.5">
              <span className="px-1.5 pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Drift controls</span>
              <OnOffToggle label="Physics" defaultChecked />
              <OnOffToggle label="Labels" />
              <OnOffToggle label="Orbits" defaultChecked />
              <OnOffToggle label="Trails" disabled />
            </div>
            <BilledAnnually />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid cols={3}>
        <DemoCell label="State · on / off">
          <div className="flex flex-col gap-3">
            <Switch defaultChecked label="Run timed jobs" labelPosition="end" />
            <Switch label="Run timed jobs" labelPosition="end" />
            <Checkbox defaultChecked label="GMAIL_FETCH_EMAILS" trailing={<Badge size="xs" mono>Read</Badge>} />
            <Checkbox label="GMAIL_SEND_EMAIL" trailing={<Badge size="xs" mono tone="org">Write</Badge>} />
          </div>
        </DemoCell>
        <DemoCell label="State · disabled">
          <div className="flex flex-col gap-3">
            <Switch defaultChecked disabled label="Managed by your org" labelPosition="end" />
            <Switch disabled label="Not available here" labelPosition="end" />
            <Checkbox defaultChecked disabled label="GITHUB_LIST_ISSUES" />
            <Checkbox disabled label="GITHUB_MERGE_PULL_REQUEST" />
          </div>
        </DemoCell>
        <DemoCell label="State · busy">
          <div className="flex flex-col gap-3">
            <Switch defaultChecked busy label="Saving the new setting" labelPosition="end" />
            <Switch busy label="Checking the connection" labelPosition="end" />
            <p className="text-[12px] leading-snug text-ink-faint">Busy blocks a second toggle and shows a wait cursor until the save settles.</p>
          </div>
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
