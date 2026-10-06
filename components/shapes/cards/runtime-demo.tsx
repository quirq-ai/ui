"use client";

import { useState, type ReactNode } from "react";
import { Bot, Code, Plus, RotateCw, Search, Workflow } from "lucide-react";
import { CURRENT_SPACE, RUNTIMES, SESSIONS, SPACES, type RuntimeId as FixtureRuntimeId } from "@/lib/fixtures";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { RuntimeMarketCard, RuntimePickerCard, RuntimeSetupRow, TemplateCard, type CreateState } from "./runtime-cards";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const logoFor = (id: FixtureRuntimeId): LogoId => (id === "gemini_cli" ? "gemini" : id);

const FEATURES = [
  "Command via Slack · WhatsApp · Telegram · Discord",
  "Switch across 100+ AI providers",
  "Connect to VS Code · Cursor · GitHub · Vercel",
];

const MARKET = [
  { slug: "openclaw", name: "OpenClaw", runtime: "openclaw" as const, poweredBy: "OpenClaw", tag: "Featured" as const, level: 1 as const, levelLabel: "No coding required", inUse: SPACES.some((s) => s.runtime === "openclaw" && s.status === "Running") },
  { slug: "hermes", name: "Hermes Agent", runtime: "hermes" as const, poweredBy: "Hermes", tag: "New" as const, level: 1 as const, levelLabel: "No coding required", inUse: false },
  { slug: "research", name: "AI Research Team", runtime: "claude_code" as const, poweredBy: "Claude Code", tag: "New" as const, level: 2 as const, levelLabel: "Some technical setup", inUse: true },
  { slug: "codex", name: "Codex", runtime: "codex" as const, poweredBy: "OpenAI", tag: "New" as const, level: 2 as const, levelLabel: "Some technical setup", inUse: false },
];

function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-6 items-center gap-1.5 rounded-[6px] border border-hair bg-white/[0.03] px-2 text-[11px] text-ink">{children}</span>;
}

function ExecOverview() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[11.5px] text-ink-faint">Command them via</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip>XO</Chip>
          <Chip>
            <RuntimeLogo id="whatsapp" size={12} decorative />
            WhatsApp
          </Chip>
          <Chip>Telegram</Chip>
          <Chip>
            <RuntimeLogo id="slack" size={12} decorative />
            Slack
          </Chip>
          <Chip>Discord</Chip>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11.5px] text-ink-faint">Switch between</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip>
            <RuntimeLogo id="anthropic" size={12} decorative />
            Claude
          </Chip>
          <Chip>
            <RuntimeLogo id="openai" size={12} decorative />
            GPT
          </Chip>
          <span className="text-[11.5px] text-ink-dim">and 100+ AI providers</span>
        </div>
      </div>
    </div>
  );
}

function CodeOverview({ runtime }: { runtime: "codex" | "claude_code" }) {
  const r = RUNTIMES.find((x) => x.id === runtime)!;
  return (
    <div className="flex flex-col gap-2.5">
      <p className="leading-[1.55]">{r.description}</p>
      <p className="font-mono text-[11px] text-ink-faint">
        Skills run as {r.skillPrefix}skill-name · {r.models.length} models
      </p>
    </div>
  );
}

type Picker = {
  slug: string;
  caption: string;
  name: string;
  runtime: LogoId;
  poweredBy: string;
  badge?: string;
  level: 1 | 2 | 3;
  levelLabel: string;
  overview: ReactNode;
  useCases: string[];
};

const PICKERS: Picker[] = [
  {
    slug: "exec",
    caption: "Default",
    name: "AI Executive Team",
    runtime: "openclaw",
    poweredBy: "OpenClaw",
    level: 1,
    levelLabel: "No coding required",
    overview: <ExecOverview />,
    useCases: ["Co-CEO", "Executive assistant", "Support agent", "Sales rep"],
  },
  {
    slug: "codex",
    caption: "Featured",
    name: "Codex",
    runtime: "codex",
    poweredBy: "OpenAI",
    badge: "Featured",
    level: 1,
    levelLabel: "No coding required",
    overview: <CodeOverview runtime="codex" />,
    useCases: ["Code review", "Test writing", "Refactors"],
  },
  {
    slug: "research",
    caption: "Level 2 · some setup",
    name: "AI Research Team",
    runtime: "claude_code",
    poweredBy: "Claude Code",
    level: 2,
    levelLabel: "Some technical setup needed",
    overview: <CodeOverview runtime="claude_code" />,
    useCases: ["Literature review", "Data analysis", "Report drafting"],
  },
  {
    slug: "cowork",
    caption: "Experimental",
    name: "XO Cowork",
    runtime: "openclaw",
    poweredBy: "OpenClaw",
    badge: "Experimental",
    level: 1,
    levelLabel: "No coding required",
    overview: <ExecOverview />,
    useCases: ["Co-CEO", "Executive assistant", "Support agent", "Sales rep"],
  },
];

export function AgentRuntimeDemo() {
  const later = useLater();
  const [create, setCreate] = useState<Record<string, CreateState>>({});
  const [opened, setOpened] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, CreateState>>({});
  const [selected, setSelected] = useState<FixtureRuntimeId>(CURRENT_SPACE.runtime);
  const [check, setCheck] = useState<"ready" | "checking" | "error">("ready");

  const installed = RUNTIMES.filter((r) => r.installed);
  const primary = installed.filter((r) => r.id === "claude_code" || r.id === "openclaw");
  const others = RUNTIMES.filter((r) => !primary.includes(r));
  const sessionFiles = (id: FixtureRuntimeId) => RUNTIMES.find((r) => r.id === id)?.sessions ?? 0;

  return (
    <DemoStack>
      <DemoSection title="Marketplace · featured, new, in use">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {MARKET.map(({ slug, ...m }) => (
            <Specimen key={slug} label={`${m.tag}${m.inUse ? " · in use" : ""}`}>
              <RuntimeMarketCard
                {...m}
                features={FEATURES}
                createState={create[slug] ?? "idle"}
                onCreate={() => {
                  setCreate((c) => ({ ...c, [slug]: "creating" }));
                  later(() => setCreate((c) => ({ ...c, [slug]: "created" })), 1300);
                }}
                onOpen={() => setOpened(m.name)}
                className="h-full"
              />
            </Specimen>
          ))}
        </div>
        <p role="status" className="mt-3 min-h-5 font-mono text-[11px] text-ink-faint">
          {opened ? `Opening the new ${opened} space. Sample flow, nothing is created.` : "Create space starts a sample flow. Nothing is created."}
        </p>
        <div className="mt-4 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {(["creating", "created"] as const).map((st) => {
            const { slug, ...m } = MARKET[1];
            return (
              <Specimen key={`${slug}-${st}`} label={st === "creating" ? "Creating" : "Created · open space"}>
                <RuntimeMarketCard {...m} features={FEATURES} createState={st} onOpen={() => setOpened(m.name)} className="h-full" />
              </Specimen>
            );
          })}
        </div>
      </DemoSection>

      <DemoSection title="Create picker · overview and details tabs">
        <div className="grid gap-4 md:grid-cols-2">
          {PICKERS.map(({ slug, ...p }) => (
            <Specimen key={slug} label={p.caption}>
              <RuntimePickerCard
                className="h-full"
                name={p.name}
                runtime={p.runtime}
                poweredBy={p.poweredBy}
                badge={p.badge}
                level={p.level}
                levelLabel={p.levelLabel}
                overview={p.overview}
                useCases={p.useCases}
                createState={picked[slug] ?? "idle"}
                onCreate={() => {
                  setPicked((c) => ({ ...c, [slug]: "creating" }));
                  later(() => setPicked((c) => ({ ...c, [slug]: "created" })), 1300);
                }}
                onOpen={() => setOpened(p.name)}
              />
            </Specimen>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">Use the arrow keys, Home and End on the tabs. Create space is a sample flow.</p>
      </DemoSection>

      <DemoSection title="Templates · available and coming soon">
        <div className="grid gap-4 md:grid-cols-3">
          <TemplateCard
            name="AI Coder"
            badge="Beta"
            icon={<Code />}
            description="Launch an autonomous coding assistant with full privacy and data control."
            features={["Code generation", "Bug detection", "Code review", "Privacy first"]}
          />
          <TemplateCard
            name="n8n workflows"
            badge="New"
            icon={<Workflow />}
            description="Run n8n inside a space and let agents trigger and edit workflows."
            features={["Visual editor", "Webhooks", "Schedules"]}
          />
          <TemplateCard
            name="Deep researcher"
            badge="Coming soon"
            icon={<Search />}
            description="Multi-step research with sources, notes and a cited summary."
            features={["Web sources", "Citations", "Notes"]}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Setup rows · selected, in use, other agents"
        aside={
          <div role="group" aria-label="Agent check state" className="flex flex-wrap gap-2">
            <Button size="sm" variant={check === "ready" ? "secondary" : "subtle"} aria-pressed={check === "ready"} onClick={() => setCheck("ready")}>
              Checked
            </Button>
            <Button size="sm" variant={check === "checking" ? "secondary" : "subtle"} aria-pressed={check === "checking"} onClick={() => setCheck("checking")}>
              Checking
            </Button>
            <Button size="sm" variant={check === "error" ? "secondary" : "subtle"} aria-pressed={check === "error"} onClick={() => setCheck("error")}>
              Error
            </Button>
          </div>
        }
      >
        {check === "checking" ? (
          <p role="status" className="flex items-center gap-2.5 rounded-[9px] border border-hair-soft bg-s2 p-[15px] text-[12.5px] text-ink-dim">
            <Spinner size="sm" label={null} /> Checking agents…
          </p>
        ) : check === "error" ? (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-red/35 bg-red/[0.06] p-[15px] text-[12.5px] text-[#ff7a70]">
            Could not check agents. The Space API did not answer.
            <Button size="sm" leadingIcon={<RotateCw />} onClick={() => setCheck("ready")}>
              Try again
            </Button>
          </div>
        ) : (
          <fieldset className="flex min-w-0 flex-col gap-2.5">
            <legend className="sr-only">Agent for {CURRENT_SPACE.name}</legend>
            {primary.map((r) => (
              <RuntimeSetupRow
                key={r.id}
                group="rt-setup"
                runtime={logoFor(r.id)}
                name={r.label}
                version={r.version}
                installed={r.installed}
                folderFound
                inUse={r.inUse}
                selected={selected === r.id}
                onSelect={() => setSelected(r.id)}
                action={
                  r.id === "claude_code" ? (
                    <Button size="sm" variant="subtle" leadingIcon={<Plus />}>
                      Demo API key
                    </Button>
                  ) : undefined
                }
                details={[
                  { term: "Host", value: r.id === "claude_code" ? "~/.claude" : "~/.openclaw" },
                  { term: "Server", value: r.id === "claude_code" ? "/home/space/.claude" : "/home/space/.openclaw" },
                  { term: "Sessions", value: `${formatNumber(sessionFiles(r.id))} session files found` },
                  { term: "Open now", value: formatNumber(SESSIONS.filter((s) => s.runtime === r.id && s.open).length) },
                ]}
              />
            ))}
            <details className="group/oth rounded-[9px] border border-hair-soft bg-s1 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-[9px]! px-[15px] py-3 text-[12.5px] text-ink-dim hover:text-ink">
                <Bot aria-hidden="true" className="size-4" />
                Other agents ({others.length})
              </summary>
              <div className="flex flex-col gap-2.5 px-2.5 pb-2.5">
                {others.map((r) => (
                  <RuntimeSetupRow
                    key={r.id}
                    group="rt-setup"
                    runtime={logoFor(r.id)}
                    name={r.label}
                    version={r.version}
                    installed={r.installed}
                    folderFound={r.sessions > 0}
                    selected={selected === r.id}
                    onSelect={() => setSelected(r.id)}
                  />
                ))}
              </div>
            </details>
          </fieldset>
        )}
      </DemoSection>
    </DemoStack>
  );
}
