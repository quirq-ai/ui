"use client";

import { FileText, FolderOpen, KeyRound, Plus } from "lucide-react";
import {
  ACTIVITY,
  CURRENT_SPACE,
  ORBIT_CATEGORIES,
  PROJECTS,
  QUIRQ_READINGS,
  RUNTIME_BY_ID,
  SECRETS,
  SPACES,
} from "@/lib/fixtures";
import { formatFixed, formatNumber, formatQuirqs } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CopyButton, CopyField } from "@/components/ui/copy-button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import { StateChip, type StateOf } from "@/components/ui/status";
import { Badge } from "@/components/ui/badge";
import { CategoryInfoPanel, GlassCard, SectionCard, SetupCard, SoftPanel } from "./surfaces";
import { RevealItem, ReplayButton, useReplay } from "./reveal";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const reading = QUIRQ_READINGS[0];

function categoryStats(id: (typeof ORBIT_CATEGORIES)[number]["id"]) {
  const projects = PROJECTS.filter((p) => p.category === id);
  const ids = new Set(projects.map((p) => p.id));
  return {
    projects,
    stats: [
      { label: "Projects", value: formatNumber(projects.length) },
      { label: "Open sessions", value: formatNumber(projects.reduce((n, p) => n + p.openSessions, 0)) },
      { label: "Recorded sessions", value: formatNumber(projects.reduce((n, p) => n + p.sessions, 0)) },
      { label: "Recent events", value: formatNumber(ACTIVITY.filter((e) => e.projectId && ids.has(e.projectId)).length) },
    ],
  };
}

const ENGINEERING = ORBIT_CATEGORIES.find((c) => c.id === "Engineering")!;
const RESEARCH = ORBIT_CATEGORIES.find((c) => c.id === "Research")!;

function ScalingSpark() {
  const bars = [22, 26, 24, 31, 38, 35, 44, 52, 49, 61, 70, 66, 78, 86];
  return (
    <svg viewBox="0 0 280 96" className="h-auto w-full" aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * 20 + 2} y={96 - h} width="14" height={h} rx="3" fill={i === bars.length - 1 ? "var(--grn)" : "rgba(217,217,217,0.2)"} />
      ))}
    </svg>
  );
}

export function PanelSurfaceDemo() {
  const glass = useReplay();
  const eng = categoryStats(ENGINEERING.id);
  const res = categoryStats(RESEARCH.id);

  return (
    <DemoStack>
      <DemoSection title="Glass · featured only" aside={<ReplayButton onClick={glass.replay} />}>
        <div className="grid gap-5 md:grid-cols-3">
          <RevealItem shown={glass.shown} index={0}>
            <Specimen label="Bento tile · revealed">
              <GlassCard
                layout="bento"
                title="Dynamic scaling"
                className="md:min-h-[300px]"
                footer={
                  <div className="-mx-1">
                    <ScalingSpark />
                  </div>
                }
              >
                Spin up a space with the press of a button. Capacity, specs and location are provisioned for you.
              </GlassCard>
            </Specimen>
          </RevealItem>
          <RevealItem shown={glass.shown} index={1}>
            <Specimen label="Install card · revealed">
              <GlassCard
                layout="install"
                title="Install XO Space"
                className="md:min-h-[300px]"
                footer={
                  <div className="flex flex-col gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">Run in your shell</p>
                    <CopyField value="curl -fsSL quirq.ai/install | sh" prompt="$" label="Install command" shape="pill" />
                  </div>
                }
              >
                The open source space runs on your own machine.
              </GlassCard>
            </Specimen>
          </RevealItem>
          <RevealItem shown={glass.shown} index={2}>
            <Specimen label="Mint rule card · revealed">
              <GlassCard
                layout="rule"
                kicker="Mint rule"
                title="Q = V · B"
                className="md:min-h-[300px]"
                footer={
                  <dl className="grid grid-cols-3 gap-2 border-t border-hair pt-4 font-mono text-[11px]">
                    <div>
                      <dt className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">V</dt>
                      <dd className="mt-1 tabular-nums text-ink">{formatFixed(reading.completionV, 2)}</dd>
                    </div>
                    <div>
                      <dt className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">B</dt>
                      <dd className="mt-1 tabular-nums text-ink">{formatQuirqs(reading.budgetB)}</dd>
                    </div>
                    <div>
                      <dt className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">Q</dt>
                      <dd className="mt-1 tabular-nums text-grn">{formatQuirqs(reading.mintedQ)}</dd>
                    </div>
                    <p className="col-span-3 mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                      {reading.unitId} · Mock
                    </p>
                  </dl>
                }
              >
                A quirq is minted by verification, never self-reported. Verified completion V times the owner&apos;s budget B.
              </GlassCard>
            </Specimen>
          </RevealItem>
        </div>
      </DemoSection>

      <DemoSection title="Soft panel · the default container">
        <div className="flex flex-col gap-5">
          <Specimen label="Callout paragraph · static">
            <SoftPanel layout="callout">
              <p className="text-[13.5px] leading-[1.7] text-ink-dim">
                <b className="font-semibold text-ink">We run the infrastructure so you don&apos;t.</b> Hosted spaces run on clouds we operate,
                orchestrated across spot capacity, so an agent never dies mid-task and never pays retail.
              </p>
            </SoftPanel>
          </Specimen>
          <Specimen label="Caption cards · static">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Graph", "Projects, sessions and files as one connected map of the space."],
                ["Timeline", "Every session and step on one clock, per runtime."],
                ["Sessions", "Tokens, cost and turns for each agent conversation."],
              ].map(([t, d]) => (
                <SoftPanel key={t} layout="caption" kicker={t}>
                  <p className="text-[13.5px] leading-[1.7] text-ink-dim">{d}</p>
                </SoftPanel>
              ))}
            </div>
          </Specimen>
          <Specimen label="Table wrapper · p 6">
            <SoftPanel layout="table">
              <div className="scroll-thin overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                  <caption className="sr-only">Spaces</caption>
                  <thead>
                    <tr className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
                      <th scope="col" className="px-4 py-3 font-normal">Space</th>
                      <th scope="col" className="px-4 py-3 font-normal">Where</th>
                      <th scope="col" className="px-4 py-3 font-normal">Runtime</th>
                      <th scope="col" className="px-4 py-3 font-normal">Status</th>
                      <th scope="col" className="px-4 py-3 text-right font-normal">Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPACES.map((s) => (
                      <tr key={s.id} className="border-t border-hair-soft">
                        <th scope="row" className="px-4 py-3 font-medium text-ink">
                          {s.name}
                        </th>
                        <td className="px-4 py-3 text-ink-dim">{s.deployment === "local" ? "Local" : "Hosted"}</td>
                        <td className="px-4 py-3 text-ink-dim">{RUNTIME_BY_ID[s.runtime].label}</td>
                        <td className="px-4 py-3">
                          <StateChip kind="space" variant="plain" state={s.status.toLowerCase() as StateOf<"space">} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] tabular-nums text-ink-dim">{s.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SoftPanel>
          </Specimen>
          <Specimen label="Form panel · two columns with aside">
            <SoftPanel
              layout="form"
              kicker="Tell us what you're running"
              aside={
                <div>
                  <p className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">Or reach us directly</p>
                  <p className="text-[14px] leading-[2] text-ink-dim">hello@example.com</p>
                  <p className="mt-5 text-[13px] leading-[1.7] text-ink-dim">
                    Evaluating for a team? Ask for the deployment guide and a walkthrough with your own numbers.
                  </p>
                </div>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="sp-form-name" label="Name">
                  <Input placeholder="Ada Moreno" autoComplete="off" />
                </Field>
                <Field id="sp-form-email" label="Work email">
                  <Input type="email" placeholder="ada@example.com" autoComplete="off" />
                </Field>
                <Field id="sp-form-msg" label="What should agents do?" className="sm:col-span-2">
                  <Textarea rows={3} placeholder="Triage support mail and draft replies" />
                </Field>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Button variant="primary" size="md">
                  Send
                </Button>
                <span className="text-[12px] text-ink-faint">Sample form. Nothing is sent.</span>
              </div>
            </SoftPanel>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="App surfaces · setup card and section card">
        <div className="grid gap-5 md:grid-cols-2">
          <Specimen label="Setup card · status accent">
            <SetupCard
              title="Connect an agent"
              titleId="sp-setup-agent"
              status={{ label: "In use", tone: "accent" }}
              action={<Button size="sm" leadingIcon={<KeyRound />}>Manage secrets</Button>}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <RuntimeTag id="claude_code" />
                <span>Installed · Agent folder found</span>
              </div>
              <p className="mt-2 text-[12px] text-ink-faint">Default runtime for {CURRENT_SPACE.name}.</p>
            </SetupCard>
          </Specimen>
          <Specimen label="Setup card · status amber">
            <SetupCard
              title="Folders"
              titleId="sp-setup-folders"
              status={{ label: "Restart to apply", tone: "amber" }}
              action={<Button size="sm" leadingIcon={<FolderOpen />}>Choose folder</Button>}
            >
              <ul className="flex flex-col gap-2 font-mono text-[12px]">
                <li className="flex items-center justify-between gap-3">
                  <span className="truncate text-ink">~/projects</span>
                  <Badge tone="grn" size="xs" mono>
                    In use
                  </Badge>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="truncate text-ink">~/notes</span>
                  <Badge tone="org" size="xs" mono>
                    Saved
                  </Badge>
                </li>
              </ul>
            </SetupCard>
          </Specimen>
          <Specimen label="Setup card · count chip">
            <SetupCard
              title="Saved secrets"
              titleId="sp-setup-secrets"
              count={4}
              action={<Button size="sm" leadingIcon={<Plus />}>Add secret</Button>}
            >
              <ul className="flex flex-col divide-y divide-hair-soft">
                {SECRETS.slice(0, 4).map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                    <span className="truncate font-mono text-[12px] text-ink">{s.name}</span>
                    <span className="shrink-0 font-mono text-[11.5px] text-ink-faint">{s.masked ?? "Not set"}</span>
                  </li>
                ))}
              </ul>
            </SetupCard>
          </Specimen>
          <Specimen label="Section card · header, action, footer">
            <SectionCard
              icon={<FileText />}
              title="Status and metadata"
              description={`Space, runtime and API state for ${CURRENT_SPACE.name}.`}
              action={<CopyButton text={CURRENT_SPACE.id} aria-label="Copy space ID" announce="Space ID copied" />}
              footer={
                <>
                  <Button size="sm">View logs</Button>
                  <Button size="sm" variant="subtle">
                    Technical details
                  </Button>
                </>
              }
            >
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Status</dt>
                  <dd className="mt-1">
                    <StateChip kind="space" state="running" variant="plain" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Space API</dt>
                  <dd className="mt-1 text-ink">{CURRENT_SPACE.apiStatus}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Host</dt>
                  <dd className="mt-1 font-mono text-[12px] text-ink">{CURRENT_SPACE.host}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Version</dt>
                  <dd className="mt-1 font-mono text-[12px] text-ink">{CURRENT_SPACE.version}</dd>
                </div>
              </dl>
            </SectionCard>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Info panel · visualizer category">
        <div className="grid gap-5 md:grid-cols-2">
          <Specimen label="Category info panel">
            <CategoryInfoPanel
              kicker="Space category"
              title={ENGINEERING.id}
              color={`var(--${ENGINEERING.color})`}
              description="Apps, services and libraries that are built and shipped."
              stats={eng.stats}
              hint="Select a project node to open its live operating detail. Counts are mock data."
            />
          </Specimen>
          <Specimen label="Scrolls internally when tall">
            <CategoryInfoPanel
              kicker="Space category"
              title={RESEARCH.id}
              color={`var(--${RESEARCH.color})`}
              description="Reading, experiments and visualizers. Notes feed the method; visualizers make the space legible."
              stats={[
                ...res.stats,
                ...res.projects.map((p) => ({ label: p.displayName, value: `${formatNumber(p.files)} files` })),
              ]}
              hint="Select a project node to open its live operating detail. Counts are mock data."
              maxHeight={340}
            />
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
