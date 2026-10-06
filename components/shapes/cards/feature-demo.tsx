"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  Brain,
  Building2,
  Cpu,
  FolderGit2,
  FolderOpen,
  Hash,
  HardDrive,
  Laptop,
  Network,
  RadioTower,
  Rocket,
  ShieldCheck,
  UserPlus,
  Workflow,
} from "lucide-react";
import { ORGANIZATIONS } from "@/lib/fixtures";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { BenefitCard, FeatureCard, LauncherTile, PaperFeatureCard, StepRow } from "./feature-cards";
import { InstallCard, OrgCreateCard, OrgJoinCard, OrgPendingCard, type OrgResult } from "./feature-cards-client";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

type Route = { key: string; icon: ReactNode; kicker: string; tone: "blu" | "grn" | "org"; title: string; description: string; cta: string };

const OFFERINGS: Route[] = [
  { key: "space", icon: <Laptop />, kicker: "Open source", tone: "blu", title: "XO Space", description: "Set up and manage work from inside your agent session.", cta: "Install XO Space" },
  { key: "cloud", icon: <Rocket />, kicker: "Managed", tone: "grn", title: "Managed cloud", description: "Hosted operation that extends XO Space.", cta: "Explore managed cloud" },
  { key: "ms", icon: <Workflow />, kicker: "Service", tone: "org", title: "Machine Speed", description: "AI workflows, implemented for your business.", cta: "Discuss a workflow" },
];

const NEEDS: Route[] = [
  { key: "impl", icon: <Workflow />, kicker: "Machine Speed", tone: "org", title: "Get a workflow implemented", description: "We scope, build and run it with you.", cta: "Discuss a workflow" },
  { key: "hosted", icon: <Rocket />, kicker: "XO Swarm", tone: "grn", title: "Launch hosted agent work", description: "Hosted spaces that start, stop and report on their own.", cta: "Explore managed cloud" },
  { key: "local", icon: <Laptop />, kicker: "XO Space", tone: "blu", title: "Run a space locally", description: "Install on your machine. Free and open source.", cta: "Install XO Space" },
];

const LAUNCHERS = [
  { key: "models", group: "Overview", icon: <Cpu />, title: "Models", description: "The intelligence layer for your agent: how it reasons, writes and uses tools." },
  { key: "data", group: "Overview", icon: <HardDrive />, title: "Data", description: "Files, memory and knowledge the agent can read." },
  { key: "channels", group: "Overview", icon: <RadioTower />, title: "Channels", description: "Where people reach the agent: Slack, WhatsApp and Telegram." },
  { key: "files", group: "Work", icon: <FolderOpen />, title: "Files", description: "Browse and edit the files in this space." },
  { key: "projects", group: "Work", icon: <FolderGit2 />, title: "Projects", description: "Folders with context, steps and Git history." },
] as const;

const INSTALL = "curl -fsSL quirq.ai/install | sh";
const INSTALL_LAUNCHERS = [
  { id: "claude_code" as const, label: "Launch from Claude Code" },
  { id: "openai" as const, label: "Launch from OpenAI Codex" },
  { id: "cursor" as const, label: "Launch from Cursor" },
  { id: "codex" as const, label: "Launch from Codex CLI" },
];

const SEARCHABLE: OrgResult[] = ORGANIZATIONS.filter((o) => o.kind === "Org spaces").map((o) => ({ id: o.id, name: o.name, members: o.members }));

function RouteChooser() {
  const [mode, setMode] = useState<"offering" | "need">("offering");
  const [chosen, setChosen] = useState<string | null>(null);
  const routes = mode === "offering" ? OFFERINGS : NEEDS;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[18px] font-semibold tracking-[-0.015em]">What would you like to do?</p>
        <Segmented
          aria-label="Group routes by"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: "offering", label: "By offering" },
            { value: "need", label: "By need" },
          ]}
        />
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {routes.map((r) => (
          <FeatureCard
            key={r.key}
            as="li"
            icon={r.icon}
            kicker={r.kicker}
            tone={r.tone}
            title={r.title}
            description={r.description}
            action={
              <Button size="sm" trailingIcon={<ArrowRight />} onClick={() => setChosen(r.cta)}>
                {r.cta}
              </Button>
            }
          />
        ))}
      </ul>
      <p role="status" className="min-h-5 font-mono text-[11px] text-ink-faint">
        {chosen ? `Chosen: ${chosen}. In the product this opens the next step.` : ""}
      </p>
    </div>
  );
}

function PhoneLauncher() {
  const [runtime, setRuntime] = useState<"openclaw" | "claude_code">("openclaw");
  const [open, setOpen] = useState<string>("models");
  const visible = LAUNCHERS.filter((l) => !(l.key === "channels" && runtime === "claude_code"));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-dim">Channels are hidden for Claude Code spaces.</p>
        <Segmented
          aria-label="Space runtime"
          size="sm"
          value={runtime}
          onChange={(v) => {
            setRuntime(v);
            if (v === "claude_code" && open === "channels") setOpen("models");
          }}
          options={[
            { value: "openclaw", label: "OpenClaw" },
            { value: "claude_code", label: "Claude Code" },
          ]}
        />
      </div>
      {(["Overview", "Work"] as const).map((g) => (
        <div key={g}>
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{g}</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible
              .filter((l) => l.group === g)
              .map((l) => (
                <li key={l.key}>
                  <LauncherTile icon={l.icon} title={l.title} description={l.description} active={open === l.key} onOpen={() => setOpen(l.key)} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function OrgGate() {
  const later = useLater();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<OrgResult[] | null>(null);
  const [noMatch, setNoMatch] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [pending, setPending] = useState<OrgResult | null>(null);
  const [cancelling, setCancelling] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 md:grid-cols-2">
        <Specimen label={created ? `Create · created ${created}` : "Create · try it"}>
          <OrgCreateCard
            idPrefix="fc-create"
            creating={creating}
            error={createError}
            onCreate={(name) => {
              if (!name) {
                setCreateError("Enter a name for the organization.");
                return;
              }
              setCreateError(null);
              setCreating(true);
              later(() => {
                setCreating(false);
                setCreated(name);
              }, 1200);
            }}
          />
        </Specimen>
        {pending ? (
          <Specimen label="Pending · request sent, try cancel">
            <OrgPendingCard
              orgName={pending.name}
              cancelling={cancelling}
              onCancel={() => {
                setCancelling(true);
                later(() => {
                  setCancelling(false);
                  setPending(null);
                  setResults(null);
                }, 900);
              }}
            />
          </Specimen>
        ) : (
          <Specimen label="Join · try it">
            <OrgJoinCard
              idPrefix="fc-join"
              searching={searching}
              results={results}
              noMatch={noMatch}
              sendingId={sendingId}
              onSearch={(q) => {
                setSearching(true);
                setNoMatch(null);
                setResults(null);
                later(() => {
                  setSearching(false);
                  const hits = SEARCHABLE.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase()));
                  if (hits.length === 0) setNoMatch(q);
                  else setResults(hits);
                }, 900);
              }}
              onRequest={(o) => {
                setSendingId(o.id);
                later(() => {
                  setSendingId(null);
                  setPending(o);
                }, 1000);
              }}
            />
          </Specimen>
        )}
      </div>
      <p className="text-[12px] text-ink-faint">Try an empty search for all orgs, or a name like &ldquo;zeta&rdquo; for the error box.</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Specimen label="Create · creating">
          <OrgCreateCard idPrefix="fc-static-create" creating />
        </Specimen>
        <Specimen label="Create · error">
          <OrgCreateCard idPrefix="fc-static-create-error" error="Enter a name for the organization." />
        </Specimen>
        <Specimen label="Join · searching">
          <OrgJoinCard idPrefix="fc-static-search" searching />
        </Specimen>
        <Specimen label="Join · sending">
          <OrgJoinCard idPrefix="fc-static-send" results={SEARCHABLE} sendingId={SEARCHABLE[0]?.id ?? null} />
        </Specimen>
        <Specimen label="Join · error, dashed box">
          <OrgJoinCard idPrefix="fc-static-error" noMatch="zeta labs" />
        </Specimen>
        <Specimen label="Pending · request sent">
          <OrgPendingCard orgName={SEARCHABLE[1]?.name ?? "Northwind Studio"} />
        </Specimen>
      </div>
    </div>
  );
}

export function FeatureCardsDemo() {
  return (
    <DemoStack>
      <DemoSection title="Route chooser · one primary action per card · hover">
        <RouteChooser />
      </DemoSection>

      <DemoSection title="Phone launcher · tiles open an area">
        <PhoneLauncher />
      </DemoSection>

      <DemoSection title="Org onboarding · steps, benefits and gate">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Specimen label="Step rows">
            <ol className="divide-y divide-hair-soft rounded-[14px] border border-hair bg-s1 px-4">
              <StepRow n={1} icon={<Building2 />} title="Create your org" description="Name it and choose a default agent." done />
              <StepRow n={2} icon={<UserPlus />} title="Add your team" description="Invite colleagues and assign them roles." done />
              <StepRow n={3} icon={<Bot />} title="Bring in agents" description="Claude Code, Codex or OpenClaw, each in its own space." />
              <StepRow n={4} icon={<Network />} title="Design the structure" description="Group spaces by team and project." />
              <StepRow n={5} icon={<Hash />} title="Open your offices" description="#research, #support and #war-room." />
              <StepRow n={6} icon={<ShieldCheck />} title="Set the rules" description="Who can start spaces, share projects and add secrets." />
            </ol>
          </Specimen>
          <Specimen label="Benefit cards">
            <div className="flex flex-col gap-3">
              <BenefitCard icon={<Brain />} title="Automated memory and context management" description="Every space keeps its own memory, so agents start each session where the last one stopped." />
              <BenefitCard icon={<Network />} title="Open agent network" description="Agents in one org can hand work to each other across spaces." />
            </div>
          </Specimen>
        </div>
        <div className="mt-6">
          <OrgGate />
        </div>
      </DemoSection>

      <DemoSection title="Install card · copy and launchers">
        <div className="grid gap-5 md:grid-cols-2">
          <Specimen label="Command idle · click to copy">
            <InstallCard command={INSTALL} launchers={INSTALL_LAUNCHERS} />
          </Specimen>
          <Specimen label="Copied · shown for 1.5 s">
            <InstallCard command={INSTALL} launchers={INSTALL_LAUNCHERS} previewState="copied" />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Feature grid · sample app served by galileo">
        <div className="overflow-hidden rounded-[14px] border border-hair-strong">
          <div className="flex items-center gap-2 border-b border-hair bg-s2 px-3 py-2">
            <span aria-hidden="true" className="flex gap-1.5">
              <i className="size-2.5 rounded-full bg-white/15" />
              <i className="size-2.5 rounded-full bg-white/15" />
              <i className="size-2.5 rounded-full bg-white/15" />
            </span>
            <span className="mx-auto truncate rounded-[6px] bg-black/40 px-3 py-0.5 font-mono text-[11px] text-ink-dim">acme.localhost:4100</span>
          </div>
          <div className="grid gap-5 bg-[#f6f4ee] p-5 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
            <PaperFeatureCard title="Backlinks without effort" description="Mention a note and acme links it both ways. No manual wiring." />
            <PaperFeatureCard title="Decisions you can find" description="Every decision gets a date, an owner and a link back to its thread." />
            <PaperFeatureCard title="Plain text, always" description="Notes are Markdown files on disk. Take them anywhere." />
          </div>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
