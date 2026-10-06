"use client";

import { useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, FolderPlus, Plus, RotateCw, X } from "lucide-react";
import {
  GALILEO_SOURCES,
  ORBIT_CATEGORIES,
  PEOPLE,
  PROJECTS,
  PROJECT_STAGES,
  SESSIONS,
  TODOS,
  ACTIVITY,
  USAGE_DAILY,
  USAGE_SUMMARY,
  seededSeries,
  type Project,
} from "@/lib/fixtures";
import { formatCompact, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AvatarGroup } from "@/components/ui/avatar";
import { CommandCard, GatewayAppCard, ManageProjectCard, ProjectCard, ProjectCardSkeleton, RepoLinkCard, RolloutCard } from "./project-cards";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const CAT_COLOR = Object.fromEntries(ORBIT_CATEGORIES.map((c) => [c.id, `var(--${c.color})`])) as Record<string, string>;
const P = (id: string) => PROJECTS.find((p) => p.id === id)!;
const name = (id: Project["owner"]) => PEOPLE[id].name;
const tokensFor = (id: string) => SESSIONS.filter((s) => s.projectId === id).reduce((n, s) => n + s.tokens, 0);
const logoFor = (r: string) => (r === "gemini_cli" ? "gemini" : r) as "claude_code" | "codex" | "openclaw" | "cursor" | "hermes" | "gemini";
const runtimeOf = (id: string) => SESSIONS.find((s) => s.projectId === id)?.runtime ?? "claude_code";

const GRID = ["xo-space", "galileo", "xo-swarm", "research-notes", "billing-api", "demo-kit"];

function OpenTabs() {
  const [tabs, setTabs] = useState<string[]>(["xo-space"]);
  const [active, setActive] = useState("xo-space");
  const [state, setState] = useState<"ready" | "loading" | "error" | "empty">("ready");
  const [note, setNote] = useState("");

  function open(id: string) {
    setTabs((t) => (t.includes(id) ? t : [...t, id]));
    setActive(id);
  }
  function close(id: string) {
    const next = tabs.filter((t) => t !== id);
    setTabs(next);
    if (active === id) setActive(next[next.length - 1] ?? "");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul aria-label="Open project tabs" className="scroll-thin flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-[10px] border border-hair bg-s1 p-1">
          {tabs.length === 0 ? <li className="px-2.5 py-1 text-[12px] text-ink-faint">No project open. Choose a card.</li> : null}
          {tabs.map((t) => (
            <li key={t} className={`flex shrink-0 items-center rounded-[7px] ${active === t ? "bg-s3" : ""}`}>
              <button type="button" aria-current={active === t ? "true" : undefined} onClick={() => setActive(t)} className="rounded-[7px]! py-1 pl-2.5 pr-1.5 font-mono text-[11.5px] text-ink">
                {t}
              </button>
              <button type="button" aria-label={`Close ${t}`} onClick={() => close(t)} className="mr-1 grid size-5 place-items-center rounded-[5px]! text-ink-faint hover:bg-s4 hover:text-ink">
                <X aria-hidden="true" className="size-3" />
              </button>
            </li>
          ))}
        </ul>
        <div role="group" aria-label="Board state" className="flex flex-wrap gap-1.5">
          {(["ready", "loading", "error", "empty"] as const).map((s) => (
            <Button key={s} size="sm" variant={state === s ? "secondary" : "subtle"} aria-pressed={state === s} onClick={() => setState(s)} className="capitalize">
              {s}
            </Button>
          ))}
        </div>
      </div>

      {state === "error" ? (
        <div role="alert" className="flex items-start gap-2 rounded-[12px] border border-red/40 bg-red/[0.06] p-3 text-[12px] text-[#ff7a70]">
          <CircleAlert aria-hidden="true" className="mt-px size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Couldn&apos;t load projects</p>
            <p className="text-[#ff7a70]/80">The Space API did not answer. Showing nothing rather than an empty list.</p>
          </div>
          <Button size="sm" leadingIcon={<RotateCw />} onClick={() => setState("ready")}>
            Retry
          </Button>
        </div>
      ) : null}

      {state === "empty" ? (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-hair-strong bg-s1/70 p-8 text-center">
          <FolderPlus aria-hidden="true" className="size-6 text-ink-faint" />
          <p className="text-[13px] text-ink">No projects in this org space</p>
          <p className="text-[12px] text-ink-faint">Add a folder to start tracking sessions and steps.</p>
          <Button size="sm" leadingIcon={<Plus />} className="mt-1">
            Add project
          </Button>
        </div>
      ) : state === "loading" ? (
        <div role="status" aria-label="Loading projects" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : state === "ready" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GRID.map((id) => {
            const p = P(id);
            const unscaffolded = id === "demo-kit";
            const noOwner = id === "billing-api";
            return (
              <Specimen key={id} label={unscaffolded ? "Unscaffolded" : noOwner ? "No owner set" : `${p.pinned ? "Pinned · " : ""}${p.openSessions ? "live" : "idle"}`}>
                <ProjectCard
                  className="h-full"
                  name={p.displayName}
                  description={p.description}
                  ownerName={noOwner || unscaffolded ? null : name(p.owner)}
                  unscaffolded={unscaffolded}
                  peers={unscaffolded ? [] : p.peers.map(name)}
                  liveCount={p.openSessions}
                  sessions={p.sessions}
                  category={{ label: p.category, color: CAT_COLOR[p.category] }}
                  when={p.lastActive}
                  pinned={p.pinned}
                  open={active === id}
                  onOpen={() => open(id)}
                  onShare={() => setNote(`Share ${p.displayName}: the access list opens in the project pane. Sample action.`)}
                />
              </Specimen>
            );
          })}
        </div>
      ) : null}
      <p role="status" className="min-h-5 font-mono text-[11px] text-ink-faint">
        {note || "Choose a card to open it in a tab. Hover or focus a card for its Share action."}
      </p>
    </div>
  );
}

function ManageList() {
  const ids = ["xo-space", "galileo", "telescope"];
  const [pins, setPins] = useState<Record<string, boolean>>(Object.fromEntries(ids.map((id) => [id, P(id).pinned])));
  const [expanded, setExpanded] = useState<string | null>("galileo");
  const [share, setShare] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 text-[17px] font-medium">
          Manage projects
          <span className="rounded-[6px] border border-hair-soft px-1.5 py-px font-mono text-[11px] tabular-nums text-ink-faint">{PROJECTS.length}</span>
        </p>
        <Button size="sm" variant="primary" leadingIcon={<Plus />}>
          Add project
        </Button>
      </div>
      {ids.map((id) => {
        const p = P(id);
        const sessions = SESSIONS.filter((s) => s.projectId === id);
        return (
          <ManageProjectCard
            key={id}
            detailsId={`mpc-${id}`}
            name={p.displayName}
            projectId={p.id}
            path={`~/projects/${p.id}`}
            pinned={pins[id]}
            expanded={expanded === id}
            shareOpen={share === id}
            githubUrl={p.github?.url}
            onToggleExpand={() => setExpanded((e) => (e === id ? null : id))}
            onTogglePin={() => {
              setPins((x) => ({ ...x, [id]: !x[id] }));
              setNote(`${p.displayName} ${pins[id] ? "unpinned" : "pinned"}. Pinned projects sort first.`);
            }}
            onViewActivity={() => setNote(`${ACTIVITY.filter((e) => e.projectId === id).length} recent events in ${p.displayName}.`)}
            onShare={() => {
              setShare((s) => (s === id ? null : id));
              setExpanded(id);
            }}
            onRemove={() => setNote(`Removing ${p.displayName} needs a confirm step. Nothing was removed.`)}
            details={[
              { term: "Description", value: p.description, wide: true },
              { term: "Owner", value: name(p.owner) },
              { term: "Stage", value: `${p.stage} · ${p.lane}` },
              { term: "Branch", value: <code className="font-mono text-[12px]">{p.branch}</code> },
              { term: "Sessions", value: `${formatNumber(sessions.length)} recorded · ${formatNumber(p.openSessions)} open` },
              { term: "Files", value: formatNumber(p.files) },
              { term: "GitHub", value: p.github ? <code className="font-mono text-[12px]">{p.github.repo}</code> : "Not linked" },
            ]}
          >
            {share === id ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hair-soft pt-4">
                <div className="flex items-center gap-3">
                  <AvatarGroup names={[name(p.owner), ...p.peers.map(name)]} size="sm" />
                  <span className="text-[12.5px] text-ink-dim">Shared with {p.peers.length} {p.peers.length === 1 ? "person" : "people"}</span>
                </div>
                <Button size="sm" onClick={() => setShare(null)}>
                  Done
                </Button>
              </div>
            ) : null}
          </ManageProjectCard>
        );
      })}
      <p role="status" className="min-h-5 font-mono text-[11px] text-ink-faint">
        {note}
      </p>
    </div>
  );
}

function CommandCarousel() {
  const cards = [
    {
      key: "space",
      kicker: `Space · ${PROJECTS.reduce((n, p) => n + p.openSessions, 0)} live`,
      live: true,
      title: "All projects",
      metrics: [
        { label: "Tokens 7d", value: formatCompact(USAGE_SUMMARY["7 days"].tokens) },
        { label: "Sessions", value: formatNumber(PROJECTS.reduce((n, p) => n + p.sessions, 0)) },
        { label: "Live", value: formatNumber(PROJECTS.reduce((n, p) => n + p.openSessions, 0)) },
      ],
      series: USAGE_DAILY.slice(-16).map((d) => d.tokens),
      footer: "The whole connected space",
    },
    ...["xo-space", "billing-api", "telescope"].map((id, i) => {
      const p = P(id);
      return {
        key: id,
        kicker: `Project · ${p.category}`,
        live: p.openSessions > 0,
        title: p.displayName,
        metrics: [
          { label: "Tokens", value: formatCompact(tokensFor(id)) },
          { label: "Sessions", value: formatNumber(p.sessions) },
          { label: "Live", value: formatNumber(p.openSessions) },
        ],
        series: seededSeries(400 + i * 17, 16, 10, 90),
        footer: `Open ${p.displayName}`,
      };
    }),
  ];
  const [front, setFront] = useState(0);
  const go = (d: number) => setFront((f) => (f + d + cards.length) % cards.length);
  const prev = (front - 1 + cards.length) % cards.length;
  const next = (front + 1) % cards.length;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Command cards"
      tabIndex={0}
      onKeyDown={onKey}
      className="dots flex flex-col gap-4 rounded-[16px] border border-hair-soft bg-black/40 p-4 sm:p-6"
    >
      {/* Background cards keep their full size and peek in from the clipped edges, as in the visualizer carousel. */}
      <div className="flex items-stretch justify-center gap-4 overflow-hidden md:[mask-image:linear-gradient(90deg,transparent,#000_16%,#000_84%,transparent)]">
        {[prev, front, next].map((idx, pos) => {
          const c = cards[idx];
          const isFront = pos === 1;
          return (
            <div
              key={`${c.key}-${pos}`}
              aria-hidden={!isFront}
              className={isFront ? "w-full max-w-[420px] shrink-0" : "hidden w-[420px] shrink-0 scale-[0.9] opacity-45 saturate-[0.6] md:block"}
              aria-roledescription={isFront ? "slide" : undefined}
              aria-label={isFront ? `${idx + 1} of ${cards.length}: ${c.title}` : undefined}
              role={isFront ? "group" : undefined}
            >
              <CommandCard kicker={c.kicker} live={c.live} title={c.title} metrics={c.metrics} series={c.series} footer={c.footer} front={isFront} />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button size="sm" leadingIcon={<ChevronLeft />} onClick={() => go(-1)} aria-label="Previous card">
          Prev
        </Button>
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {front + 1} / {cards.length}
        </span>
        <Button size="sm" trailingIcon={<ChevronRight />} onClick={() => go(1)} aria-label="Next card">
          Next
        </Button>
      </div>
      <p className="text-center text-[11.5px] text-ink-faint">Focus the carousel and use the arrow keys. Background cards dim and desaturate.</p>
    </div>
  );
}

function Rollout() {
  const ids = ["xo-space", "galileo", "research-notes", "demo-kit"];
  const [open, setOpen] = useState<string | null>("xo-space");
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ids.map((id) => {
        const p = P(id);
        const step = PROJECT_STAGES.find((s) => s.id === p.stage)!.step;
        const steps = TODOS.filter((t) => t.projectId === id && t.status === "in_progress").length;
        return (
          <Specimen key={id} label={open === id ? "Expanded" : "Collapsed"}>
            <RolloutCard
              panelId={`ro-${id}`}
              name={p.displayName}
              color={CAT_COLOR[p.category]}
              stage={p.stage}
              stageIndex={step}
              ago={p.lastActive}
              description={PROJECT_STAGES.find((s) => s.id === p.stage)!.blurb}
              metrics={[
                { label: "Sessions", value: formatNumber(p.sessions) },
                { label: "Open", value: formatNumber(p.openSessions) },
                { label: "Active steps", value: formatNumber(steps) },
                { label: "File events", value: formatNumber(ACTIVITY.filter((e) => e.projectId === id && e.type === "file.edited").length) },
              ]}
              runtime={logoFor(runtimeOf(id))}
              expanded={open === id}
              onToggle={() => setOpen((o) => (o === id ? null : id))}
            />
          </Specimen>
        );
      })}
    </div>
  );
}

function GatewayApps() {
  const [ver, setVer] = useState<Record<string, string>>({ acme: "v3", storybook: "main" });
  const acme = GALILEO_SOURCES.find((s) => s.name === "acme")!;
  const sb = GALILEO_SOURCES.find((s) => s.name === "storybook")!;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Specimen label="App card with versions · answering">
        <GatewayAppCard
          group="gw-acme"
          name={acme.name}
          url={acme.url}
          up={acme.up}
          detail={`${acme.detail} on port ${acme.port} · checked ${acme.checkedAgo}`}
          version={ver.acme}
          onVersionChange={(v) => setVer((x) => ({ ...x, acme: v }))}
          versions={[
            { id: "v3", label: "v3", detail: "current · 12m ago" },
            { id: "v2", label: "v2", detail: "2d ago" },
            { id: "v1", label: "v1", detail: "Fri 18 Sep" },
          ]}
        />
      </Specimen>
      <Specimen label="App card · not answering">
        <GatewayAppCard
          group="gw-sb"
          name={sb.name}
          url={sb.url}
          up={sb.up}
          detail={`${sb.detail} on port ${sb.port} · checked ${sb.checkedAgo}`}
          version={ver.storybook}
          onVersionChange={(v) => setVer((x) => ({ ...x, storybook: v }))}
          versions={[
            { id: "main", label: "main", detail: "last good 3h ago" },
            { id: "fix", label: "fix/narrow-bar", detail: "1d ago" },
          ]}
        />
      </Specimen>
      <Specimen label="Repo link">
        <div className="flex flex-col gap-3">
          {["galileo", "xo-space"].map((id) => {
            const p = P(id);
            return p.github ? <RepoLinkCard key={id} name={p.displayName} url={p.github.url} /> : null;
          })}
        </div>
      </Specimen>
    </div>
  );
}

export function ProjectCardDemo() {
  return (
    <DemoStack>
      <DemoSection title="Grid cards · open tab, loading, error, empty">
        <OpenTabs />
      </DemoSection>
      <DemoSection title="Manage cards · pinned, expanded, share">
        <ManageList />
      </DemoSection>
      <DemoSection title="Command cards · live vs idle, front vs background">
        <CommandCarousel />
      </DemoSection>
      <DemoSection title="Rollout cards · collapsed and expanded">
        <Rollout />
      </DemoSection>
      <DemoSection title="App and repo cards">
        <GatewayApps />
      </DemoSection>
    </DemoStack>
  );
}
