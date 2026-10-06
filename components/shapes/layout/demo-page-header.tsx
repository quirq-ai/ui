"use client";

// Demo: page header and toolbar. Client component: filters, refresh and scope navigation.
import { useEffect, useMemo, useRef, useState } from "react";
import { FolderTree, List, Network, Plus } from "lucide-react";
import { Button, StateChip, Switch, Segmented } from "@/components/ui";
import { GALILEO_SOURCES, INBOX_NEW_COUNT, NOW_ISO, PROJECTS, type Project } from "@/lib/fixtures";
import { formatDate, formatNumber, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { RelativeTime } from "./eyebrow";
import { PageHeader, SeriesHead, StatusNote, TwoToneHeading } from "./page-header";
import { FilterHeader, ListToolbar, PhoneHeader, ScopeHeader } from "./page-header-client";
import { THEMES, ThemeScope } from "./theme";

/* ----------------------------------------------------------------------------- research data */

type Topic = "foundations" | "accounting" | "evidence" | "experiments";

const RESEARCH: { title: string; topic: Topic }[] = [
  { title: "What a business hands over: the job, defined", topic: "foundations" },
  { title: "The quirq: a unit of verified, owner-valued work", topic: "foundations" },
  { title: "Budget B is set before the work runs", topic: "foundations" },
  { title: "Why tokens are not delivered work", topic: "foundations" },
  { title: "Reconciling minted quirqs with the usage meter", topic: "accounting" },
  { title: "QER, QV and IR: always with a window and a method", topic: "accounting" },
  { title: "Interventions as a cost line", topic: "accounting" },
  { title: "Before and after snapshots as evidence", topic: "evidence" },
  { title: "Weighted checks beat raw line counts", topic: "evidence" },
  { title: "What a check cannot see", topic: "evidence" },
  { title: "Self-reported completion is not evidence", topic: "evidence" },
  { title: "Proving Grounds: partner trial design", topic: "experiments" },
  { title: "Sixty units of work, scored twice", topic: "experiments" },
  { title: "Threshold sensitivity at V = 0.7", topic: "experiments" },
];

const TOPICS: { id: Topic; label: string; blurb: string }[] = [
  { id: "foundations", label: "Foundations", blurb: "The two definitions the rest of the program stands on: the job a business hands over, and the unit its delivery mints." },
  { id: "accounting", label: "Accounting", blurb: "How budgets, costs and minted quirqs reconcile, window by window." },
  { id: "evidence", label: "Evidence", blurb: "What counts as a verified check, and what does not." },
  { id: "experiments", label: "Experiments", blurb: "Trials with partners. Numbers stay illustrative until a review completes." },
];

type WritingKind = "news" | "thoughts" | "guides";

const WRITINGS: { title: string; kind: WritingKind }[] = [
  { title: "XO Space 0.9: projects folder and pinned projects", kind: "news" },
  { title: "galileo joins the open-source stack", kind: "news" },
  { title: "Connectors now poll on a schedule", kind: "news" },
  { title: "A run is not an outcome", kind: "thoughts" },
  { title: "Why we meter tokens and quirqs apart", kind: "thoughts" },
  { title: "Owners set the budget, not the agent", kind: "thoughts" },
  { title: "Interventions are a cost line too", kind: "thoughts" },
  { title: "Set up a space on your laptop", kind: "guides" },
  { title: "Deploy a hosted space with XO Swarm", kind: "guides" },
];

const WRITING_KINDS: { id: WritingKind; label: string }[] = [
  { id: "news", label: "News" },
  { id: "thoughts", label: "Thoughts" },
  { id: "guides", label: "Guides" },
];

/* ----------------------------------------------------------------------------- projects data */

type View = "list" | "graph" | "tree";
const LIVE = PROJECTS.filter((p) => p.openSessions > 0);
const PINNED = PROJECTS.filter((p) => p.pinned);
const FILES = PROJECTS.reduce((n, p) => n + p.files, 0);
const ROW_GRID = "grid-cols-[minmax(0,1fr)_76px] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_104px_84px]";

const SCOPES = ["All xo-projects", ...PROJECTS.map((p) => p.displayName)];

export default function PageHeaderDemo() {
  /* index filters: the active chip decides which items show */
  const [topic, setTopic] = useState<"all" | Topic>("all");
  const [kind, setKind] = useState<"all" | WritingKind>("all");
  const research = topic === "all" ? RESEARCH : RESEARCH.filter((r) => r.topic === topic);
  const writings = kind === "all" ? WRITINGS : WRITINGS.filter((w) => w.kind === kind);

  /* projects toolbar */
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [partial, setPartial] = useState(false);
  const rows = useMemo(() => {
    let list: Project[] = filter === "live" ? LIVE : filter === "pinned" ? PINNED : filter === "engineering" ? PROJECTS.filter((p) => p.category === "Engineering") : PROJECTS;
    list = [...list].sort((a, b) =>
      sort === "name" ? a.displayName.localeCompare(b.displayName, "en-US") : sort === "files" ? b.files - a.files : a.lastActiveAt < b.lastActiveAt ? 1 : -1,
    );
    return list.slice(0, 5);
  }, [filter, sort]);

  /* phone refresh */
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const t = timer;
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);
  function refresh() {
    setRefreshing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRefreshing(false);
      setRefreshed(true);
    }, 1200);
  }

  /* dashboard scope */
  const [scope, setScope] = useState(0);
  const [windowMode, setWindowMode] = useState<"dated" | "live">("dated");

  const galileoDark = THEMES["galileo-dark"];

  return (
    <div className="flex flex-col gap-10">
      {/* marketing two-tone */}
      <Specimen label="Marketing two-tone" note="The claim in ink, the qualifier dim. Manual breaks give a deck-like rag.">
        <div className="flex flex-col gap-8 overflow-hidden rounded-[18px] border border-hair-soft bg-bg p-[clamp(18px,3vw,32px)]">
          <div>
            <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Display · centered</p>
            <TwoToneHeading as="h3" size="display" align="center" lead="Minted by verification." tail="Never by assertion." breakTail />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Page h1</p>
              <TwoToneHeading as="h3" size="page" lead="Tell us what you're running." tail="We'll take it from there." />
            </div>
            <div>
              <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Whitepaper h1 · max 16ch</p>
              <TwoToneHeading as="h3" size="whitepaper" lead="Every claim tiered," tail="with its falsifier." />
            </div>
          </div>
          <div>
            <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Products hero h1</p>
            <TwoToneHeading as="h3" size="products" lead="Launch a space" tail="for agent work." breakTail />
          </div>
          <div>
            <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Section h2 · max 34ch, dim tail</p>
            <TwoToneHeading
              as="h3"
              size="section"
              lead="Install a self-hosted space"
              tail="and the Space dashboard for observability, management and composability on your own infra."
            />
          </div>
        </div>
      </Specimen>

      <DemoRule />

      {/* index with filters */}
      <SpecimenGrid cols={1} className="md:grid-cols-[1.55fr_1fr]">
        <Specimen label="Index with filters · Research" note="Counts are computed from the list. The active chip changes the blurb, the lead story and the visible items.">
          <div className="rounded-[18px] border border-hair-soft bg-bg p-[clamp(16px,3vw,26px)]">
            <FilterHeader
              titleAs="h3"
              title="Research"
              filterLabel="Filter research by topic"
              value={topic}
              onChange={(id) => setTopic(id as "all" | Topic)}
              filters={[
                { id: "all", label: "All research", count: RESEARCH.length, blurb: "Every study, note and experiment behind the quirq unit of work." },
                ...TOPICS.map((t) => ({ id: t.id, label: t.label, count: RESEARCH.filter((r) => r.topic === t.id).length, blurb: t.blurb })),
              ]}
            />
            <VisibleItems label="Research shown" items={research.map((r) => r.title)} lead />
          </div>
        </Specimen>
        <Specimen label="Index with filters · Writings (no blurb)">
          <div className="rounded-[18px] border border-hair-soft bg-bg p-[clamp(16px,3vw,26px)]">
            <FilterHeader
              titleAs="h3"
              title="Writings"
              filterLabel="Filter writings by type"
              value={kind}
              onChange={(id) => setKind(id as "all" | WritingKind)}
              filters={[
                { id: "all", label: "All", count: WRITINGS.length },
                ...WRITING_KINDS.map((k) => ({ id: k.id, label: k.label, count: WRITINGS.filter((w) => w.kind === k.id).length })),
              ]}
            />
            <VisibleItems label="Writings shown" items={writings.map((w) => w.title)} />
          </div>
        </Specimen>
      </SpecimenGrid>

      <DemoRule />

      {/* app head + toolbar */}
      <Specimen
        label="App 30px head · list toolbar"
        note="Filter, sort and switch views. Turn on partial data to see the note strip and Unavailable cells."
      >
        <div className="flex flex-col gap-5 rounded-[18px] border border-hair-soft bg-[#0b0b0c] p-[clamp(16px,3vw,26px)]">
          <PageHeader
            as="h3"
            title="Projects"
            description="Folders with files and maintained context. Open one to see its sessions, steps and Git history."
            actions={
              <>
                <Switch size="sm" label="Simulate partial data" labelPosition="end" checked={partial} onCheckedChange={setPartial} />
                <Button size="sm" variant="secondary" leadingIcon={<Plus />}>
                  Add project
                </Button>
              </>
            }
          />
          <ListToolbar<View>
            idPrefix="ph-projects"
            summary={[
              pluralize(PROJECTS.length, "project"),
              partial ? "Live status unavailable" : `${LIVE.length} live`,
              partial ? "File index unavailable" : `${formatNumber(FILES)} indexed files`,
            ]}
            views={[
              { value: "list", label: "List", icon: <List aria-hidden="true" /> },
              { value: "graph", label: "Graph", icon: <Network aria-hidden="true" /> },
              { value: "tree", label: "Tree", icon: <FolderTree aria-hidden="true" /> },
            ]}
            view={view}
            onViewChange={setView}
            filters={[
              { value: "all", label: `All projects (${PROJECTS.length})` },
              { value: "live", label: `Live (${LIVE.length})` },
              { value: "pinned", label: `Pinned (${PINNED.length})` },
              { value: "engineering", label: `Engineering (${PROJECTS.filter((p) => p.category === "Engineering").length})` },
            ]}
            filter={filter}
            onFilterChange={setFilter}
            sorts={[
              { value: "recent", label: "Recent activity" },
              { value: "name", label: "Name" },
              { value: "files", label: "Indexed files" },
            ]}
            sort={sort}
            onSortChange={setSort}
            notes={partial ? ["File index unavailable.", "Live status unavailable."] : []}
            gridClassName={ROW_GRID}
            columns={
              view === "list"
                ? [
                    { label: "Project" },
                    { label: "Status", className: "hidden sm:block" },
                    { label: "Indexed files", align: "end", className: "hidden sm:block" },
                    { label: "Last active", align: "end" },
                  ]
                : undefined
            }
          />
          {view === "tree" ? <ProjectTree projects={rows} /> : null}
          {view === "graph" ? <ProjectGraph projects={rows} /> : null}
          <ul hidden={view !== "list"} className="-mt-3 list-none pl-0" aria-label="Projects, list view">
            {rows.map((p) => (
              <li key={p.id} className={cn("grid items-center gap-3 border-b border-hair-soft px-3 py-2.5 last:border-b-0", ROW_GRID)}>
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] font-medium">{p.displayName}</p>
                  <p className="m-0 truncate text-[12px] text-ink-faint">{p.category}</p>
                </div>
                <div className="hidden min-w-0 sm:block">
                  {partial ? (
                    <span className="text-[12px] italic text-ink-faint">Unavailable</span>
                  ) : p.openSessions > 0 ? (
                    <StateChip kind="provenance" state="live" variant="plain" label={`Live · ${pluralize(p.openSessions, "session")}`} />
                  ) : (
                    <span className="text-[12.5px] text-ink-dim">Idle</span>
                  )}
                </div>
                <span className={cn("hidden text-right font-mono text-[12px] tabular-nums sm:block", partial ? "italic text-ink-faint" : "text-ink-dim")}>
                  {partial ? "Unavailable" : formatNumber(p.files)}
                </span>
                <RelativeTime iso={p.lastActiveAt} now={NOW_ISO} layout="column" align="end" />
              </li>
            ))}
          </ul>
        </div>
      </Specimen>

      <Specimen label="State · partial data note" note="When a source is missing, the strip says what is missing instead of showing zeros.">
        <StatusNote notes={["Recent activity unavailable.", "Could not refresh projects. Showing the last list."]} />
      </Specimen>

      <SpecimenGrid cols={2}>
        {/* technical details hero */}
        <Specimen label="App hero · back pill" note="Space dashboard Technical details: blue kicker dot, back to Setup.">
          <div className="rounded-[18px] border border-hair-soft bg-[#0b0c0f] p-[clamp(16px,3vw,24px)]">
            <PageHeader
              as="h3"
              size="hero"
              kicker="Machine-local control plane"
              kickerDot="#8dbbe9"
              title="Technical"
              titleTail="details"
              description={
                <>
                  A live, privacy-aware map of installation state, watcher cursors, runtime configuration, credentials and ephemeral activity in{" "}
                  <code className="font-mono text-[12px] text-ink">~/.quirq</code>.
                </>
              }
              back={{ label: "Setup", href: "#page-header" }}
            />
          </div>
        </Specimen>

        {/* phone header */}
        <Specimen label="Phone 22px · refresh" note="Press refresh: the icon spins, the meta reads Refreshing…, then updates.">
          <div className="mx-auto flex w-full max-w-[360px] flex-col gap-3 rounded-[28px] border border-hair bg-[#0b0b0c] p-4">
            <PhoneHeader
              titleAs="h3"
              title="Inbox"
              meta={`${INBOX_NEW_COUNT} new · updated ${refreshed ? "just now" : "4m ago"}`}
              refreshing={refreshing}
              onRefresh={refresh}
            />
            <div className="h-px bg-hair-soft" />
            <div className="flex flex-col gap-2 opacity-90">
              <PhoneHeader titleAs="h3" title="Sessions" meta="4 open" refreshing onRefresh={() => {}} />
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">State · refreshing</p>
            </div>
          </div>
        </Specimen>
      </SpecimenGrid>

      {/* dashboard scope header */}
      <Specimen label="Dashboard detail · time chip · prev and next scope" note="Step through scopes; switch between a dated window and live data.">
        <div className="flex flex-col gap-4 rounded-[18px] border border-hair-soft bg-[#070b10] p-[clamp(16px,3vw,24px)]">
          <ScopeHeader
            titleAs="h3"
            backLabel="All dashboards"
            onBack={() => setScope(0)}
            kicker="Space command center"
            title={SCOPES[scope]}
            window={windowMode === "live" ? "live" : { span: "30 days", through: `through ${formatDate("2026-10-01T00:00:00Z", { withYear: true, weekday: false })}` }}
            prev={scope > 0 ? SCOPES[scope - 1] : null}
            next={scope < SCOPES.length - 1 ? SCOPES[scope + 1] : null}
            onPrev={() => setScope((s) => Math.max(0, s - 1))}
            onNext={() => setScope((s) => Math.min(SCOPES.length - 1, s + 1))}
          />
          <div className="self-start">
          <Segmented
            aria-label="Data window"
            size="sm"
            value={windowMode}
            onChange={setWindowMode}
            options={[
              { value: "dated", label: "Dated window" },
              { value: "live", label: "Live data" },
            ]}
          />
          </div>
        </div>
      </Specimen>

      <SpecimenGrid cols={2}>
        <Specimen label="Series head" note="Editorial series: title and a mono qualifier; wraps on mobile.">
          <div className="flex flex-col gap-6 rounded-[18px] border border-hair-soft bg-bg p-[clamp(16px,3vw,24px)]">
            <SeriesHead as="h3" title="News" sub="Launches · partnerships · integrations" className="pt-0" />
            <SeriesHead as="h3" title="Thoughts" sub="The findings, argued. Every note links to its study" />
            <SeriesHead as="h3" title="Guides" sub="Set up, deploy and run a space" />
          </div>
        </Specimen>

        <Specimen label="galileo page header" note="Sources page, and the smaller 22px head galileo uses for pages it makes.">
          <ThemeScope theme={galileoDark} className="flex flex-col gap-6 rounded-[18px] border border-[var(--t-line)] p-[clamp(16px,3vw,24px)]">
            <PageHeader
              as="h3"
              size="galileo"
              title="Sources"
              description={
                <>
                  <p className="m-0 text-[14px] text-[var(--t-ink3)]">
                    What galileo inspects: apps on ports of this machine, and files or folders on it. Each source gets an address of its own and
                    opens here, under telescope&apos;s bar.
                  </p>
                  <p className="m-0 mt-2 font-mono text-[11.5px] text-[var(--t-ink3)]">
                    {GALILEO_SOURCES.filter((s) => s.up).length} of {GALILEO_SOURCES.length} answering
                  </p>
                </>
              }
            />
            <div className="h-px bg-[var(--t-line)]" />
            <PageHeader
              as="h3"
              size="galileo-small"
              title="notes/drafts"
              description={<span className="text-[var(--t-ink3)]">A folder in the notes source. galileo only reads it.</span>}
            />
          </ThemeScope>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}

/* Items left after the active filter: the first is the lead story. */
function VisibleItems({ label, items, lead = false }: { label: string; items: string[]; lead?: boolean }) {
  const shown = items.slice(0, 3);
  return (
    <ul aria-label={label} className="m-0 mt-5 flex list-none flex-col border-t border-hair-soft pl-0">
      {shown.map((title, i) => (
        <li key={title} className="flex items-baseline gap-3 border-b border-hair-soft py-2.5 last:border-b-0">
          <span className="w-12 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{lead && i === 0 ? "Lead" : String(i + 1).padStart(2, "0")}</span>
          <span className={cn("min-w-0 text-[13px] leading-snug", lead && i === 0 ? "font-semibold text-ink" : "text-ink-dim")}>{title}</span>
        </li>
      ))}
      {items.length > shown.length ? (
        <li className="pt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{pluralize(items.length - shown.length, "more item")}</li>
      ) : null}
    </ul>
  );
}

/* Tree view: projects grouped by category. */
function ProjectTree({ projects }: { projects: Project[] }) {
  const groups = Array.from(new Set(projects.map((p) => p.category)));
  return (
    <ul aria-label="Projects, tree view" className="-mt-1 m-0 flex list-none flex-col gap-3 pl-0">
      {groups.map((g) => {
        const items = projects.filter((p) => p.category === g);
        return (
          <li key={g}>
            <p className="m-0 flex items-center gap-2 text-[12.5px] font-medium text-ink">
              <FolderTree aria-hidden="true" className="size-3.5 text-ink-faint" />
              {g}
              <span className="font-mono text-[11px] tabular-nums text-ink-faint">{items.length}</span>
            </p>
            <ul className="m-0 mt-1.5 ml-[7px] list-none border-l border-hair pl-4">
              {items.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 py-1 text-[12.5px]">
                  <span className="min-w-0 truncate text-ink-dim">{p.displayName}</span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">{pluralize(p.files, "file")}</span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

/* Graph view: projects around the space, node size by indexed files. */
function ProjectGraph({ projects }: { projects: Project[] }) {
  const max = Math.max(1, ...projects.map((p) => p.files));
  return (
    /* fixed 220px height at natural scale; narrow screens scroll sideways instead of shrinking labels */
    <figure className="scroll-thin m-0 -mt-1 overflow-x-auto rounded-[12px] border border-hair-soft bg-black/30">
      <svg
        viewBox="0 0 560 220"
        role="img"
        aria-label={`Projects, graph view: ${projects.map((p) => p.displayName).join(", ")}`}
        className="h-[220px] w-full min-w-[480px]"
      >
        {projects.map((p, i) => {
          const a = (i / projects.length) * Math.PI * 2 - Math.PI / 2;
          const x = 280 + Math.cos(a) * 190;
          const y = 110 + Math.sin(a) * 76;
          return (
            <g key={p.id}>
              <line x1="280" y1="110" x2={x} y2={y} stroke="rgba(255,255,255,.12)" />
              <circle cx={x} cy={y} r={5 + (p.files / max) * 9} fill={`var(--${p.color})`} opacity="0.85" />
              <text x={x} y={y + 26} textAnchor="middle" fill="#a3a39e" fontSize="12" fontFamily="var(--font-mono)">
                {p.displayName}
              </text>
            </g>
          );
        })}
        <circle cx="280" cy="110" r="6" fill="#f4f3f0" />
      </svg>
    </figure>
  );
}
