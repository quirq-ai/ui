"use client";

import { useState, type ReactNode } from "react";
import { AppWindow, ChevronRight, CircleAlert, CreditCard, Folder, GitBranch, Layers, Network, Radio, RefreshCw, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StateChip } from "@/components/ui/status";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import { Segmented } from "@/components/ui/segmented";
import { CopyButton } from "@/components/ui/copy-button";
import { LoadingLine } from "@/components/ui/loaders";
import { formatCurrency, formatDate, formatTime, plural } from "@/lib/format";
import {
  BILLING,
  JOBS,
  JOB_RUNS,
  ORBIT_CATEGORIES,
  PROJECTS,
  PROJECT_BY_ID,
  PROJECT_STAGES,
  SESSIONS,
  SPACES,
  TODOS,
  TODO_STATUS_META,
  type JobRun,
  type Project,
  type ToneToken,
} from "@/lib/fixtures";
import { DrawerFacts, DrawerPanel, DrawerRow, DrawerSection, RunResult } from "./drawer";
import { Drawer } from "./drawer-layer";
import { ModalNotice } from "./modal-panel";
import { DemoSection, Example, Stage } from "./demo-kit";
import { useTimers } from "./demo-hooks";
import { Reopenable } from "./demo-reopen";

/* ----------------------------------------------------------------------------- shared */

const LANE_TONE: Record<Project["lane"], "grn" | "blu" | "neutral"> = { "Live agent": "grn", "Agent-assisted": "blu", "Human-led": "neutral" };
const TODO_DOT: Record<ToneToken, string> = {
  blu: "bg-blu",
  grn: "bg-grn",
  org: "bg-org",
  "ink-faint": "bg-ink-faint",
  red: "bg-red",
  yel: "bg-yel",
  cyn: "bg-cyn",
  pur: "bg-pur",
  ink: "bg-ink",
  "ink-dim": "bg-ink-dim",
};

function projectFacts(p: Project) {
  const todos = TODOS.filter((t) => t.projectId === p.id);
  const open = SESSIONS.filter((s) => s.projectId === p.id && s.open);
  const next = todos.find((t) => t.status === "in_progress") ?? todos.find((t) => t.status === "pending") ?? todos[0] ?? null;
  return { todos, open, next };
}

function ProjectBadges({ p }: { p: Project }) {
  const step = PROJECT_STAGES.find((s) => s.id === p.stage)?.step ?? 1;
  return (
    <>
      <Badge tone={LANE_TONE[p.lane]} dot size="md">
        {p.lane}
      </Badge>
      <Badge size="md" mono>
        {step} · {p.stage}
      </Badge>
    </>
  );
}

type Level = "h3" | "h4";

function ProjectSections({ p, headingAs }: { p: Project; headingAs: Level }) {
  const { todos, open, next } = projectFacts(p);
  const step = PROJECT_STAGES.find((s) => s.id === p.stage)?.step ?? 1;
  return (
    <>
      <p className="text-[13px] leading-relaxed text-ink-dim">{p.description}</p>
      <DrawerSection headingAs={headingAs} label="Current operating state">
        <ol className="flex flex-col gap-1.5">
          {PROJECT_STAGES.map((s) => {
            const reached = s.step <= step;
            return (
              <li key={s.id} className="flex items-start gap-2.5 text-[12.5px]">
                <span aria-hidden="true" className={cn("mt-[5px] size-2 shrink-0 rounded-full", reached ? "bg-grn" : "border border-hair-strong")} />
                <span className={reached ? "text-ink" : "text-ink-faint"}>
                  <b className="font-medium">{s.id}</b> <span className="text-ink-faint">{s.blurb}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </DrawerSection>
      <DrawerSection headingAs={headingAs} label="Live facts" aside="Mock">
        <DrawerFacts
          items={[
            { term: "Sessions", value: p.sessions },
            { term: "Open now", value: p.openSessions },
            { term: "Steps", value: todos.length },
            { term: "Open work items", value: p.openWorkItems },
          ]}
        />
      </DrawerSection>
      {next ? (
        <DrawerSection headingAs={headingAs} label={next.status === "completed" ? "Latest step" : "Next step"}>
          <div className="flex flex-col gap-2 rounded-[10px] border border-hair-soft bg-white/[0.02] p-3">
            <StateChip kind="todo" state={next.status} />
            <p className="text-[13.5px] font-medium text-ink">{next.content}</p>
            <RuntimeTag id={next.runtime === "gemini_cli" ? "gemini" : next.runtime} raw />
          </div>
        </DrawerSection>
      ) : null}
      {open.length > 0 ? (
        <DrawerSection headingAs={headingAs} label={`Open sessions · ${open.length}`}>
          {open.map((s) => (
            <DrawerRow key={s.id} icon={<Radio />} title={s.title} sub={`${s.runtime} · active ${s.lastActivity}`} />
          ))}
        </DrawerSection>
      ) : null}
    </>
  );
}

function ProjectFooter({ p }: { p: Project }) {
  const [opening, setOpening] = useState(false);
  return (
    <>
      <span role="status" className="text-[12px] text-ink-faint">
        {opening ? `Opening the ${p.displayName} dashboard (demo)` : `Last observed ${p.lastActive}`}
      </span>
      <Button size="sm" variant="secondary" trailingIcon={<ChevronRight />} onClick={() => setOpening(true)}>
        Open dashboard
      </Button>
    </>
  );
}

/* ----------------------------------------------------------------------------- live */

function LiveProjects() {
  const schedule = useTimers();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const list = PROJECTS.slice(0, 5);
  const p = openId ? PROJECT_BY_ID[openId] : null;

  return (
    <div className="flex flex-col gap-2">
      <ul className="divide-y divide-hair-soft overflow-hidden rounded-[12px] border border-hair-soft bg-[#0f0f11]">
        {list.map((proj) => (
          <li key={proj.id}>
            <button
              type="button"
              onClick={() => {
                setOpenId(proj.id);
                setLoading(true);
                setNote("");
                schedule(() => setLoading(false), 700);
              }}
              className="flex w-full items-center gap-3 rounded-none! px-4 py-3 text-left transition-colors hover:bg-white/[0.03] sm:gap-4"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[13px] text-ink">{proj.displayName}</span>
                <span className="block text-[11.5px] text-ink-faint">
                  {proj.category} · {proj.sessions} {plural(proj.sessions, "session")}
                </span>
              </span>
              {/* badge and time stack on narrow rows, sit side by side when there is room */}
              <span className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                <Badge tone={LANE_TONE[proj.lane]} dot>
                  {proj.lane}
                </Badge>
                <span className="text-right text-[11.5px] tabular-nums text-ink-faint sm:w-[64px]">{proj.lastActive}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
            </button>
          </li>
        ))}
      </ul>
      <p role="status" className="min-h-[18px] text-[12px] text-ink-dim">
        {note}
      </p>
      {p ? (
        <Drawer
          open={openId !== null}
          onClose={() => {
            setNote(`Closed ${p.displayName}. Focus is back on its row.`);
            setOpenId(null);
          }}
          kicker={p.category}
          title={p.displayName}
          icon={p.github ? <AppWindow /> : <Folder />}
          loading={loading ? `Loading ${p.displayName}…` : null}
          badges={<ProjectBadges p={p} />}
          footer={<ProjectFooter p={p} />}
        >
          <ProjectSections p={p} headingAs="h3" />
        </Drawer>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- graph inspector */

function GraphInspector({ onClose }: { onClose: () => void }) {
  const p = PROJECT_BY_ID["xo-space"];
  const todos = TODOS.filter((t) => t.projectId === p.id);
  const [flash, setFlash] = useState<string>("t_03");
  const [focused, setFocused] = useState(false);
  const counts = (["in_progress", "pending", "blocked", "completed"] as const)
    .map((s) => [s, todos.filter((t) => t.status === s).length] as const)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${TODO_STATUS_META[s].label.toLowerCase()}`)
    .join(" · ");
  const cat = ORBIT_CATEGORIES.find((c) => c.id === p.category)!;
  return (
    <DrawerPanel
      titleAs="h3"
      poster={cat.color}
      kicker={`${p.category} · project`}
      title={p.displayName}
      subtitle={`Last touched ${p.lastActive} · ${p.github?.repo ?? "local only"}`}
      posterExtra={
        <div className="flex items-center gap-2" role="group" aria-label="Step satellites">
          {todos.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Show step: ${t.content}`}
              aria-pressed={flash === t.id}
              onClick={() => setFlash(t.id)}
              className={cn(
                "size-3.5 rounded-full! border-2 border-black/50 transition-transform hover:scale-125",
                TODO_DOT[TODO_STATUS_META[t.status].tone],
                flash === t.id && "ring-2 ring-white/70 ring-offset-1 ring-offset-transparent",
              )}
            />
          ))}
          <span className="ml-1 text-[11px] text-ink-dim">Click a satellite</span>
        </div>
      }
      onClose={onClose}
      footer={
        <>
          <span role="status" className="text-[12px] text-ink-faint">
            {focused ? `Map centered on ${p.displayName} (demo)` : `${todos.length} of ${todos.length} shown on the map`}
          </span>
          <Button size="sm" variant="secondary" trailingIcon={<ChevronRight />} onClick={() => setFocused(true)}>
            Focus on map
          </Button>
        </>
      }
    >
      <DrawerSection headingAs="h4" label="About">
        <p className="text-[12.5px] leading-relaxed text-ink-dim">
          {p.files} mapped files · {p.category} + Research · {p.languages.map((l) => l.name).slice(0, 2).join(" and ")}
        </p>
      </DrawerSection>
      <DrawerSection headingAs="h4" label="Steps" aside={counts}>
        <div className="flex flex-col gap-0.5">
          {todos.map((t) => (
            <DrawerRow
              key={t.id}
              highlight={flash === t.id}
              title={t.content}
              sub={<RuntimeTag id="claude_code" raw className="mt-1" />}
              trailing={<StateChip kind="todo" state={t.status} variant="plain" />}
            />
          ))}
        </div>
      </DrawerSection>
      <DrawerSection headingAs="h4" label="Connections">
        <DrawerRow icon={<Layers />} title="Engineering" sub="part of" />
        <DrawerRow icon={<Network />} title="research-lab" sub="space · holds this project" />
        <DrawerRow icon={<Terminal />} title="Claude Code" sub="runs here" />
      </DrawerSection>
    </DrawerPanel>
  );
}

/* ----------------------------------------------------------------------------- run results */

const RUN_WINDOW = (r: JobRun) => {
  const start = Date.parse(r.startedAt);
  const end = r.durationSec === null ? null : start + r.durationSec * 1000;
  return `${formatDate(r.startedAt)} · ${formatTime(start, true)} → ${end === null ? "now" : formatTime(end, true)}`;
};

type RunScenario = "nightly" | "poll" | "empty" | "loading";

const JOB_LOG: Record<string, string> = {
  job_nightly: "~/.quirq/logs/scheduler/nightly-tests.log",
  job_poll_github: "~/.quirq/logs/scheduler/poll-github-issues.log",
};

function RunResults({ onClose }: { onClose: () => void }) {
  const [scenario, setScenario] = useState<RunScenario>("nightly");
  const job =
    scenario === "nightly"
      ? JOBS.find((j) => j.id === "job_nightly")!
      : scenario === "poll"
        ? JOBS.find((j) => j.id === "job_poll_github")!
        : { id: "job_lint_docs", name: "Lint docs", command: ["pnpm", "lint:docs"] };
  const runs = JOB_RUNS.filter((r) => r.jobId === job.id).slice(0, 4);
  const running = runs.some((r) => r.status === "running");
  const log = JOB_LOG[job.id];

  return (
    <div className="flex h-full w-full flex-col items-end gap-3">
      <Segmented<RunScenario>
        aria-label="Run results example"
        size="sm"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "nightly", label: "Nightly" },
          { value: "poll", label: "Running" },
          { value: "empty", label: "Empty" },
          { value: "loading", label: "Loading" },
        ]}
        className="mr-3 mt-3 max-w-[calc(100%-24px)] overflow-x-auto"
      />
      <DrawerPanel
        titleAs="h3"
        className="min-h-0 flex-1"
        kicker="Command results"
        title={job.name}
        subtitle="Latest 20 runs · newest first"
        icon={<Terminal />}
        onClose={onClose}
        footer={
          <>
            <span className="text-[12px] text-ink-faint">{running ? "Updates every 3s while running" : "Read only. Opening results never runs a command."}</span>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </>
        }
      >
        {scenario === "loading" ? (
          <LoadingLine>Loading results…</LoadingLine>
        ) : (
          <>
            {scenario === "poll" ? (
              <ModalNotice tone="error" icon={<CircleAlert />}>
                Results: the scheduler did not answer in time. Showing the last saved runs.
              </ModalNotice>
            ) : null}
            <div className="flex flex-col gap-2">
              <code className="w-fit rounded-[6px] bg-white/[0.05] px-2 py-1 font-mono text-[12px] text-ink">{JSON.stringify(job.command)}</code>
              <p className="text-[12px] text-ink-faint">
                Working directory: <code className="font-mono text-ink-dim">~/xo-projects/xo-space</code>
              </p>
              {running ? (
                <p role="status" className="flex items-center gap-2 text-[12px] text-blu">
                  <RefreshCw aria-hidden="true" className="spin size-3.5" />
                  Running since {formatTime(runs.find((r) => r.status === "running")!.startedAt)} · results update automatically
                </p>
              ) : null}
            </div>
            {log ? (
              <div className="flex flex-col gap-2 rounded-[10px] border border-hair-soft bg-white/[0.02] p-3">
                <p className="text-[11.5px] text-ink-faint">Full log on this machine</p>
                <code className="break-all font-mono text-[12px] text-ink-dim">{log}</code>
                <CopyButton text={log} variant="labelled" size="sm" label="Copy log path" announce="Log path copied" />
              </div>
            ) : null}
            {runs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {runs.map((r) => (
                  <RunResult
                    key={r.id}
                    status={r.status}
                    duration={r.duration}
                    window={RUN_WINDOW(r)}
                    trigger={r.trigger === "schedule" ? "scheduled" : "manual"}
                    exit={r.exit}
                    reason={r.reason}
                    output={r.output}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-[10px] border border-dashed border-hair-strong px-4 py-6 text-center text-[12.5px] text-ink-faint">
                No results yet. Run this command from Setup to record its output.
              </p>
            )}
          </>
        )}
      </DrawerPanel>
    </div>
  );
}

/* ----------------------------------------------------------------------------- billing */

type BillingScenario = "loaded" | "loading" | "error";

function BillingSheet({ onClose }: { onClose: () => void }) {
  const schedule = useTimers();
  const [scenario, setScenario] = useState<BillingScenario>("loaded");
  const [plans, setPlans] = useState(false);
  const b = BILLING;
  const pm = b.paymentMethod!;
  return (
    <div className="flex h-full w-full flex-col items-end gap-3">
      <Segmented<BillingScenario>
        aria-label="Billing sheet example"
        size="sm"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "loaded", label: "Loaded" },
          { value: "loading", label: "Loading" },
          { value: "error", label: "Error" },
        ]}
        className="mr-3 mt-3"
      />
      <DrawerPanel
        titleAs="h3"
        className="min-h-0 flex-1"
        title="Billing"
        subtitle="Manage your subscription and payment methods"
        icon={<CreditCard />}
        onClose={onClose}
        loading={scenario === "loading" ? "Loading billing…" : null}
        footer={
          <>
            <Button size="sm" variant="subtle" trailingIcon={<ChevronRight />} onClick={() => setPlans(true)}>
              Check pricing plans
            </Button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </>
        }
      >
        {plans ? (
          <ModalNotice tone="info" className="-mb-2">
            Pricing plans open on the pricing page. Demo only.
          </ModalNotice>
        ) : null}
        {scenario === "error" ? (
          <ModalNotice tone="error" icon={<CircleAlert />} title="Could not load billing">
            The billing service did not answer. Your plan and spaces are unchanged.
            <div className="mt-2.5">
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={<RefreshCw />}
                onClick={() => {
                  setScenario("loading");
                  schedule(() => setScenario("loaded"), 900);
                }}
              >
                Retry
              </Button>
            </div>
          </ModalNotice>
        ) : (
          <>
            <DrawerSection headingAs="h4" label="Subscription" aside={<Badge size="xs" mono>Mock</Badge>}>
              <div className="flex flex-col gap-3 rounded-[12px] border border-hair-soft bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold text-ink">{b.plan}</p>
                  <StateChip kind="subscription" state="trial_active" />
                </div>
                <p className="text-[12.5px] text-ink-dim">
                  {formatCurrency(b.pricePerSpace, 0)} per space per month · trial ends {b.trialEnds}
                </p>
                <DrawerFacts
                  items={[
                    { term: "Hosted spaces", value: `${b.spacesRunning} of ${b.spacesIncluded}` },
                    { term: "Seats", value: b.seats },
                    { term: "Next invoice", value: b.nextInvoice },
                    { term: "Amount due", value: formatCurrency(b.amountDue, 0) },
                  ]}
                />
              </div>
            </DrawerSection>
            <DrawerSection headingAs="h4" label="Payment methods">
              <div className="flex items-center gap-3 rounded-[12px] border border-hair-soft bg-white/[0.02] p-3">
                <span aria-hidden="true" className="grid h-8 w-11 place-items-center rounded-[6px] border border-hair bg-s3 font-mono text-[10px] font-semibold text-ink">
                  VISA
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink">
                    {pm.brand} ending {pm.last4}
                  </p>
                  <p className="text-[11.5px] text-ink-faint">
                    Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear} · {pm.holder}
                  </p>
                </div>
                <Badge tone="org" size="xs" mono>
                  {pm.label}
                </Badge>
              </div>
            </DrawerSection>
          </>
        )}
      </DrawerPanel>
    </div>
  );
}

/* ----------------------------------------------------------------------------- entity panel */

function EntityPanel({ onClose }: { onClose: () => void }) {
  const cat = ORBIT_CATEGORIES.find((c) => c.id === "Engineering")!;
  const [path, setPath] = useState<"from" | "to" | null>("from");
  const [timeline, setTimeline] = useState(false);
  const spaces = SPACES.filter((s) => s.projects.some((id) => cat.projects.includes(id)));
  const pill = (active: boolean) =>
    cn(
      "inline-flex h-7 items-center rounded-full! border px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
      active ? "border-grn/60 bg-grn/12 text-grn" : "border-hair-strong text-ink-dim hover:text-ink",
    );
  return (
    <DrawerPanel
      titleAs="h3"
      poster="blu"
      kicker="Engineering · category"
      title={cat.id}
      subtitle={cat.blurb}
      posterExtra={<Badge tone="blu" mono dot>Selected</Badge>}
      onClose={onClose}
    >
      <DrawerSection headingAs="h4" label="About">
        <p className="text-[12.5px] text-ink-dim">
          {cat.projects.length} {plural(cat.projects.length, "project")} · {cat.projects.join(", ")}
        </p>
      </DrawerSection>
      <DrawerSection headingAs="h4" label="Connections">
        {spaces.map((s) => (
          <DrawerRow key={s.id} icon={<Network />} title={s.name} sub="holds" />
        ))}
        <DrawerRow icon={<GitBranch />} title="Research" sub="shares space-drift and research-notes readers" />
      </DrawerSection>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
        <button type="button" aria-pressed={timeline} className={pill(timeline)} onClick={() => setTimeline(!timeline)}>
          Show on timeline
        </button>
        <button type="button" aria-pressed={path === "from"} className={pill(path === "from")} onClick={() => setPath(path === "from" ? null : "from")}>
          Path from
        </button>
        <button type="button" aria-pressed={path === "to"} className={pill(path === "to")} onClick={() => setPath(path === "to" ? null : "to")}>
          Path to here
        </button>
      </div>
    </DrawerPanel>
  );
}

/* ----------------------------------------------------------------------------- demo */

function DrawerStage({ children, label }: { children: (close: () => void) => ReactNode; label: string }) {
  return (
    <Stage align="right" className="h-[640px]">
      <div className="flex w-full justify-end">
        <Reopenable label={label}>{children}</Reopenable>
      </div>
    </Stage>
  );
}

export function DrawerDemo() {
  const xo = PROJECT_BY_ID["xo-space"];
  return (
    <div className="flex flex-col gap-10">
      <DemoSection title="Live · click a project, Esc closes">
        <LiveProjects />
      </DemoSection>

      <DemoSection title="Variants">
        <div className="grid gap-5 lg:grid-cols-2">
          <Example caption="Variant · graph inspector" note="Satellite click flashes its row">
            <DrawerStage label="Inspector">{(close) => <GraphInspector onClose={close} />}</DrawerStage>
          </Example>
          <Example caption="Variant · project drawer · state · open">
            <DrawerStage label="Project drawer">
              {(close) => (
                <DrawerPanel
                  titleAs="h3"
                  kicker={xo.category}
                  title={xo.displayName}
                  icon={<AppWindow />}
                  badges={<ProjectBadges p={xo} />}
                  onClose={close}
                  footer={<ProjectFooter p={xo} />}
                >
                  <ProjectSections p={xo} headingAs="h4" />
                </DrawerPanel>
              )}
            </DrawerStage>
          </Example>
          <Example caption="Variant · run results" note="Nightly, running with an error, empty, loading">
            <DrawerStage label="Command results">{(close) => <RunResults onClose={close} />}</DrawerStage>
          </Example>
          <Example caption="Variant · billing sheet" note="Error offers Retry">
            <DrawerStage label="Billing">{(close) => <BillingSheet onClose={close} />}</DrawerStage>
          </Example>
          <Example caption="Variant · entity panel" note="Category selected on the graph">
            <DrawerStage label="Entity panel">{(close) => <EntityPanel onClose={close} />}</DrawerStage>
          </Example>
          <Example caption="State · loading">
            <DrawerStage label="Project drawer">
              {(close) => <DrawerPanel titleAs="h3" kicker={xo.category} title={xo.displayName} icon={<AppWindow />} loading={`Loading ${xo.displayName}…`} onClose={close} />}
            </DrawerStage>
          </Example>
        </div>
      </DemoSection>
    </div>
  );
}
