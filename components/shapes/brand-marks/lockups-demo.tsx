"use client";

import { useState } from "react";
import { SPACES, type RuntimeId } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { Caption, DemoSection, KeepCase, Specimen } from "./kit";
import {
  AttributionRow,
  IntegrationIconRow,
  MSBars,
  PartnerLockup,
  PartnerStrip,
  RuntimeWordmark,
  SPACE_TYPE_LABEL,
  SpaceTypeMark,
  type IntegrationItem,
  type PartnerWord,
  type SpaceType,
} from "./lockups";

const TYPE_FOR_RUNTIME: Record<RuntimeId, SpaceType> = {
  claude_code: "claude-code",
  codex: "codex",
  openclaw: "openclaw",
  cursor: "default",
  hermes: "hermes",
  gemini_cli: "default",
};

const ALL_TYPES: SpaceType[] = ["openclaw", "nebius-openclaw", "hermes", "claude-code", "xo-cowork", "antigravity", "codex", "default"];

const CHANNELS: IntegrationItem[] = [
  { id: "xo", name: "XO" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "telegram", name: "Telegram" },
  { id: "slack", name: "Slack" },
  { id: "discord", name: "Discord" },
];
const MODELS: IntegrationItem[] = [
  { id: "claude", name: "Claude" },
  { id: "chatgpt", name: "ChatGPT" },
];
const IDES: IntegrationItem[] = [
  { id: "vscode", name: "VS Code" },
  { id: "cursor", name: "Cursor" },
  { id: "antigravity", name: "Antigravity" },
];
const CONNECTORS: IntegrationItem[] = [
  { id: "github", name: "GitHub" },
  { id: "linear", name: "Linear" },
  { id: "slack", name: "Slack" },
  { id: "gmail", name: "Gmail" },
  { id: "notion", name: "Notion" },
  { id: "google-drive", name: "Google Drive" },
  { id: "vercel", name: "Vercel" },
  { id: "mcp", name: "MCP" },
];

const PARTNERS: PartnerWord[] = [
  { name: "OpenAI", face: "sans" },
  { name: "Google", face: "sans" },
  { name: "aws", face: "lower" },
  { name: "OKX", face: "bold" },
  { name: "Shopify", face: "bold" },
  { name: "Shodai", face: "wide" },
  { name: "Nevermined", face: "round" },
  { name: "MagicPath", face: "mono" },
];

const RUNTIME_MARKS = ["claude_code", "codex", "openclaw", "cursor", "hermes"] as const;

export function BrandLockupsDemo() {
  const [active, setActive] = useState(SPACES.find((s) => s.name === "research-lab")?.id ?? SPACES[0].id);

  return (
    <div className="space-y-10">
      <DemoSection title="Machine Speed bars" note="Pure CSS mark on the olive ground">
        <div className="grid gap-5 sm:grid-cols-2">
          <Specimen label="Default · 7 x 22" ground="olive" minHeight={130}>
            <MSBars label="MACHINE SPEED" />
          </Specimen>
          <Specimen label="Small · 5 x 15 in the footer" ground="olive" center={false} minHeight={130} bodyClassName="flex items-center">
            <div className="flex flex-wrap items-center gap-3.5">
              <MSBars size="small" label="MACHINE SPEED" />
              <span className="font-mono text-[11px] tracking-[0.06em] text-[#808379]">
                © 2026 MACHINE SPEED · built on <b className="font-semibold lowercase text-[#b4e34a]">quirq</b> technology
              </span>
            </div>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Space type mini marks" note="Idle 55%, active or hovered 100%">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="space-y-2.5">
            <Caption>Sidebar · select a space</Caption>
            <div className="flex gap-3 rounded-[14px] border border-hair-soft bg-[#0b0b0c] p-2">
              <ul className="min-w-0 flex-1 list-none space-y-0.5 p-0" aria-label="Spaces">
                {SPACES.map((s) => {
                  const on = s.id === active;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        aria-current={on ? "true" : undefined}
                        onClick={() => setActive(s.id)}
                        className={cn(
                          "group relative flex h-9 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] transition-colors",
                          on ? "bg-[linear-gradient(90deg,rgba(131,214,58,0.145),rgba(131,214,58,0.052)_64%,transparent)] font-medium text-ink" : "text-ink-dim hover:bg-white/[0.04] hover:text-ink",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute top-1/2 left-1 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#83d63a] shadow-[0_0_12px_rgba(131,214,58,0.72)] transition-opacity",
                            on ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                          )}
                        />
                        <SpaceTypeMark type={TYPE_FOR_RUNTIME[s.runtime]} active={on} />
                        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{s.name}</span>
                        <span className="text-[10.5px] text-ink-faint">{s.status}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <ul className="flex w-9 list-none flex-col items-center gap-1 border-l border-hair-soft p-0 pl-1.5" aria-label="Spaces, collapsed sidebar">
                {SPACES.map((s) => (
                  <li key={s.id} className="group flex h-9 items-center">
                    <SpaceTypeMark type={TYPE_FOR_RUNTIME[s.runtime]} active={s.id === active} size={16} className="w-5" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2.5">
            <Caption>Every space type · hover a cell</Caption>
            <ul className="grid list-none grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-hair-soft bg-hair-soft p-0 min-[520px]:grid-cols-4">
              {ALL_TYPES.map((t) => (
                <li key={t} className="group flex flex-col items-center gap-2 bg-[#0b0b0c] px-2 py-4 transition-colors hover:bg-s2">
                  <SpaceTypeMark type={t} size={20} className="h-7 w-9" />
                  <span aria-hidden="true" className="text-center text-[11.5px] leading-tight text-ink-dim">
                    {SPACE_TYPE_LABEL[t]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Runtime wordmarks" note="Dark and light grounds">
        <div className="grid gap-px overflow-hidden rounded-[14px] border border-hair-soft bg-hair-soft md:grid-cols-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 bg-black px-5 py-6">
            {RUNTIME_MARKS.map((id) => (
              <RuntimeWordmark key={id} id={id} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 bg-[#f4f3f0] px-5 py-6">
            {RUNTIME_MARKS.map((id) => (
              <RuntimeWordmark key={id} id={id} theme="light" />
            ))}
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Integration icon rows" note="Hover or focus an icon to name it">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2.5 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4 text-[13px] text-ink-dim">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Command them via</span>
              <IntegrationIconRow items={CHANNELS} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Switch seamlessly</span>
              <IntegrationIconRow items={MODELS} />
              <span className="text-[12px]">&amp; 100+ AI providers</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Seamlessly connect to</span>
              <IntegrationIconRow items={IDES} />
            </div>
          </div>
          <div className="space-y-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <Caption>Connectors · 20px</Caption>
            <IntegrationIconRow items={CONNECTORS} size={20} className="gap-3.5" />
            <p className="text-[11.5px] leading-[1.6] text-ink-faint">Telegram, Discord, VS Code and Antigravity are simple stand-in glyphs; shipped logos come from the product&rsquo;s own files.</p>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Partners" note="Monochrome keeps third-party color out of the palette">
        <div className="space-y-5">
          <div className="rounded-[14px] border border-hair-soft bg-black px-5 py-7">
            <PartnerStrip partners={PARTNERS} />
            <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Names set as text stand-ins · wraps on mobile, one row on desktop</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Specimen
              label={
                <>
                  <KeepCase>quirq</KeepCase> × Partner
                </>
              }
              ground="black"
              minHeight={110}
            >
              <PartnerLockup partner="Nevermined" face="round" />
            </Specimen>
            <Specimen
              label={
                <>
                  <KeepCase>quirq</KeepCase> × Partner · second partner
                </>
              }
              ground="black"
              minHeight={110}
            >
              <PartnerLockup partner="MagicPath" face="mono" />
            </Specimen>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Attribution row" note="Inline on desktop, stacked when narrow · hover the link">
        <div className="space-y-5">
          <Specimen label="Inline · Space Drift header" aside="space drift" ground="none" center={false} padded={false} minHeight={0} bodyClassName="bg-[#080b18] px-5 py-4">
            <AttributionRow tone="drift" />
          </Specimen>
          <Specimen label="Inline · brand greys" aside="on black" ground="black" center={false} padded={false} minHeight={0} bodyClassName="px-5 py-4">
            <AttributionRow />
          </Specimen>
          <Specimen label="Stacked · narrow column" ground="none" center={false} padded={false} minHeight={0} className="max-w-[300px]" bodyClassName="bg-[#080b18] px-5 py-4">
            <AttributionRow tone="drift" layout="stacked" />
          </Specimen>
        </div>
      </DemoSection>
    </div>
  );
}
