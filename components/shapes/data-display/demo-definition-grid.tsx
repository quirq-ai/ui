// Demo: Definition grid. Every variant (metadata, identity, root path, storage split, file
// meta, glossary term) and state (loading, not recorded), with copy on values.
import { KeyRound } from "lucide-react";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { formatBytes, formatDate, formatTime } from "@/lib/format";
import { GALILEO_SOURCES, PEOPLE, PROJECT_BY_ID, PROJECTS, RUNTIME_BY_ID, SPACE_BY_ID, CURRENT_SPACE, minutesAgo } from "@/lib/fixtures";
import { Caption, Cell } from "./demo-kit";
import { DefinitionGrid, FileMetaHead, IdentityPanel, RootPathStrip, type DefinitionItem } from "./definition-grid";
import { TrustSplit, type TrustSide } from "./trust-boundary";

const project = PROJECT_BY_ID["xo-space"];
const ops = SPACE_BY_ID["ws_7f3a9c21e4b0"];
const created = minutesAgo(40 * 1440 + 382);
const createdText = `${formatDate(created, { withYear: true })}, ${formatTime(created)}`;

function RepoLink({ repo, url }: { repo: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-ink no-underline transition-colors hover:underline hover:underline-offset-[3px]"
    >
      <RuntimeLogo id="github" size={14} decorative />
      <span className="[overflow-wrap:anywhere]">{repo}</span>
      <span aria-hidden="true" className="text-ink-faint">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const METADATA: DefinitionItem[] = [
  { id: "description", label: "Description", value: project.description, copy: project.description, wide: true },
  { id: "name", label: "Name", value: project.displayName, copy: project.displayName, copyLabel: "project name" },
  { id: "id", label: "Project ID", value: project.id, mono: true, copy: project.id, copyLabel: "project ID" },
  { id: "uuid", label: "Project UUID", value: "f2c286f0-54f0-49f8-9460-2cc32952099f", mono: true, copy: "f2c286f0-54f0-49f8-9460-2cc32952099f", copyLabel: "project UUID" },
  { id: "owner", label: "Owner user ID", value: PEOPLE[project.owner].handle, mono: true, copy: PEOPLE[project.owner].handle, copyLabel: "owner user ID" },
  { id: "branch", label: "Default branch", value: project.github?.defaultBranch, mono: true, copy: project.github?.defaultBranch, copyLabel: "default branch" },
  { id: "created", label: "Created", value: createdText, copy: created, copyLabel: "created time" },
  { id: "meta", label: "Space metadata", value: "Present" },
  {
    id: "github",
    label: "GitHub repository",
    value: project.github ? <RepoLink repo={project.github.repo} url={project.github.url} /> : null,
    copy: project.github?.url,
    copyLabel: "GitHub URL",
    wide: true,
  },
];

const GITHUB_STATES: DefinitionItem[] = [
  { id: "gh-loading", label: "GitHub repository", state: "loading", stateText: "Loading…" },
  { id: "gh-none", label: "GitHub repository", state: "not-recorded", stateText: "No GitHub remote recorded." },
  { id: "gh-not-loaded", label: "GitHub repository", state: "not-recorded", stateText: "Not loaded" },
  { id: "gh-error", label: "GitHub repository", state: "error", stateText: "GitHub answered 403. Try again in a minute." },
];

const LOADING_GRID: DefinitionItem[] = [
  { id: "l1", label: "Name", state: "loading" },
  { id: "l2", label: "Project ID", state: "loading" },
  { id: "l3", label: "Default branch", state: "loading" },
  { id: "l4", label: "Created", state: "not-recorded" },
];

const TECH_ROWS: DefinitionItem[] = [
  { id: "runtime", label: "Agent runtime", value: RUNTIME_BY_ID[CURRENT_SPACE.runtime].label },
  { id: "version", label: "Version", value: CURRENT_SPACE.version, mono: true },
  { id: "api", label: "Space API", value: CURRENT_SPACE.url, mono: true, copy: CURRENT_SPACE.url, copyLabel: "Space API URL" },
  { id: "folder", label: "Projects folder", value: "~/projects", mono: true, copy: "~/projects", copyLabel: "projects folder" },
  { id: "region", label: "Region", state: "not-recorded" },
];

const LEAD_ROWS: DefinitionItem[] = [
  {
    id: "spaces",
    label: "Spaces",
    labelTone: "org",
    lead: "The ground floor.",
    value: "A space holds the projects, tools and state agents work with, on any cloud, any hardware or an air-gapped network.",
  },
  { id: "env", label: "Environments", labelTone: "grn", lead: "Where the work happens.", value: "Any runtime, any model, with the record of everything that ran inside." },
  { id: "obs", label: "Observatory", labelTone: "blu", lead: "The view over both.", value: "Graph, timeline and sessions: what ran, what it cost, what data it touched." },
];

const GLOSSARY_ROWS: DefinitionItem[] = [
  {
    id: "session",
    label: "session",
    value: "An agent conversation and execution history that can continue across turns.",
    note: "Keep distinct from: a task. One task can involve several sessions.",
  },
  {
    id: "space",
    label: "space",
    value: "A configured environment where agents work with projects, tools and state; local or hosted.",
    note: "Keep distinct from: the XO Space software, the host machine and a project.",
  },
  {
    id: "step",
    label: "step",
    value: "A smaller action tracked while carrying out work. Existing APIs may call steps todos.",
    note: "Keep distinct from: the parent task's status.",
  },
  {
    id: "quirq",
    label: "quirq",
    value: "Unit of verified, owner-valued, delivered work under a stated method; minted Q = V · B.",
    note: "Keep distinct from: tokens, model calls, hours, cost and task counts.",
  },
];

const machineFiles = 7;

const STORAGE: [TrustSide, TrustSide] = [
  {
    id: "local",
    kicker: "Machine-local · ephemeral",
    title: ".quirq watcher state",
    count: `${machineFiles} files`,
    path: "/Users/ada/.quirq",
    rail: "local",
    blurb: "Read cursors, coordination locks and open-now heartbeats. They help this installation keep up and never become project history.",
    rows: [
      { id: "offsets", label: "projects/offsets.json", mono: true, detail: "Shared JSONL byte and inode cursors; source paths stay hidden here.", status: "1 present · 37 tracked" },
      { id: "beats", label: "watcher/heartbeats.json", mono: true, detail: "Open-now heartbeat per session.", status: "4 open" },
      { id: "lock", label: "watcher/watcher.lock", mono: true, detail: "Coordination lock for this installation.", status: "Held" },
      { id: "activity", label: "cache/activity/", mono: true, detail: "Current live activity, newest first.", status: "30 events" },
    ],
  },
  {
    id: "portable",
    kicker: "XO project · portable",
    title: ".xo derived metadata",
    count: `${PROJECTS.length} projects`,
    path: "XO_PROJECTS_ROOT/<project>/.xo",
    rail: "portable",
    blurb: "Identity, session indexes, steps, statistics and timeline history. They describe durable work without copying full conversations.",
    rows: [
      { id: "proj", label: ".xo/project.json", mono: true, detail: "Identity, owner and default branch.", status: `${PROJECTS.length} present` },
      { id: "sessions", label: ".xo/sessions/sessionslist.json", mono: true, detail: "Session index, no full conversations.", status: `${PROJECTS.length} present` },
      { id: "todos", label: ".xo/todos.json", mono: true, detail: "Steps and their status.", status: "9 present" },
      { id: "timeline", label: ".xo/timeline.jsonl", mono: true, detail: "Timeline history.", status: `${PROJECTS.length} present` },
    ],
  },
];

/* galileo file sources: a single-file source (label is the basename) and a file inside a
   folder source (label is the relative path). Sizes are seeded bytes, formatted like galileo. */
const brief = GALILEO_SOURCES.find((s) => s.name === "brief");
const notes = GALILEO_SOURCES.find((s) => s.name === "notes");
const BRIEF_BYTES = 4301;
const NESTED = { path: "papers/verification/snapshot-diffs.md", bytes: 3482 };
const modified = `${formatDate(minutesAgo(1090), { weekday: false })}, ${formatTime(minutesAgo(1090))}`;

export function DefinitionGridDemo() {
  return (
    <div className="space-y-10">
      {/* metadata */}
      <div className="space-y-4">
        <Caption>Variant · metadata (manage details, copy on each value)</Caption>
        <div className="rounded-[14px] border border-hair bg-s1 p-4 sm:p-5">
          <DefinitionGrid items={METADATA} aria-label="Project details" labelStyle="plain" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Cell label="Variant · metadata rows (Technical details)">
            <div className="rounded-[14px] border border-hair bg-s1 p-4">
              <DefinitionGrid items={TECH_ROWS} layout="rows" aria-label="Technical details" />
            </div>
          </Cell>
          <Cell label="Variant · lead rows (what the command gives you)">
            <div className="rounded-[18px] border border-hair-soft bg-[#0f0f11] px-5 py-5">
              <DefinitionGrid items={LEAD_ROWS} layout="lead" aria-label="What the command gives you" />
            </div>
          </Cell>
        </div>
      </div>

      {/* states */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Cell label="State · loading, not recorded, not loaded, error">
          <div className="rounded-[14px] border border-hair bg-s1 p-4">
            <DefinitionGrid items={GITHUB_STATES} layout="rows" labelStyle="plain" aria-label="GitHub field states" />
          </div>
        </Cell>
        <Cell label="State · loading grid">
          <div aria-busy="true" className="rounded-[14px] border border-hair bg-s1 p-4">
            <DefinitionGrid items={LOADING_GRID} columns={2} aria-label="Project details, loading" labelStyle="plain" />
          </div>
        </Cell>
      </div>

      {/* identity */}
      <div className="space-y-4">
        <Caption>Variant · identity</Caption>
        <IdentityPanel
          rows={[
            { id: "sid", label: "Space ID", value: ops.id, mono: true, copy: ops.id, copyLabel: "space ID" },
            { id: "sname", label: "Space name", value: ops.name },
            { id: "sowner", label: "Space owner", value: `${PEOPLE[ops.owner].name} · ${PEOPLE[ops.owner].email}` },
          ]}
          connections={[
            { id: "xo", title: "XO account", state: "connected", detail: "User ID: user_2abcd" },
            { id: "gh", title: "GitHub", state: "connected", detail: `@${PEOPLE[ops.owner].handle} · Environment (GITHUB_PAT)`, icon: <RuntimeLogo id="github" size={14} decorative /> },
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Cell label="Identity · not configured, rejected, unable to verify">
            <IdentityPanel
              rows={[
                { id: "sid", label: "Space ID", value: CURRENT_SPACE.id, mono: true, copy: CURRENT_SPACE.id, copyLabel: "space ID" },
                { id: "sname", label: "Space name", value: CURRENT_SPACE.name },
              ]}
              connections={[
                { id: "xo", title: "XO account", state: "not_configured", detail: "Local use needs no account. Sign in to link this space." },
                { id: "gh", title: "GitHub", state: "rejected", detail: "The token in GITHUB_PAT was rejected. Replace it in Secrets.", icon: <KeyRound /> },
                { id: "lin", title: "Linear", state: "unable", detail: "Linear did not answer. Nothing changed." },
              ]}
            />
          </Cell>
          <Cell label="Identity · loading (checking…)">
            <IdentityPanel
              rows={[
                { id: "sid", label: "Space ID", state: "loading", stateText: "Checking…" },
                { id: "sname", label: "Space name", state: "loading" },
              ]}
              connections={[
                { id: "xo", title: "XO account", state: "checking" },
                { id: "gh", title: "GitHub", state: "checking" },
              ]}
            />
          </Cell>
        </div>
      </div>

      {/* root path */}
      <div className="space-y-3">
        <Caption>Variant · root path (good, warn, state unavailable)</Caption>
        <RootPathStrip hostRoot="/Users/ada/.quirq" containerRoot="/home/space/.quirq" access="readwrite" />
        <RootPathStrip hostRoot="/Users/ada/.quirq" containerRoot={null} access="readonly" note="New roots waiting for installer" />
        <RootPathStrip access="unavailable" error="Could not inspect .quirq. The watcher is not running." />
      </div>

      {/* storage split */}
      <Cell label="Variant · storage split (machine-local vs portable)">
        <TrustSplit sides={STORAGE} aria-label="Storage map" />
      </Cell>

      {/* file meta */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Cell label="Variant · file meta (single-file source)">
          <div className="rounded-[12px] border border-hair-soft bg-black/40 px-4 py-3">
            <FileMetaHead label="BRIEF.md" size={formatBytes(BRIEF_BYTES)} modified={modified} rawHref={`${brief?.url ?? "/"}?raw`} />
          </div>
        </Cell>
        <Cell label="Variant · file meta (file in a folder, wraps when narrow)">
          <div className="max-w-[300px] rounded-[12px] border border-hair-soft bg-black/40 px-4 py-3">
            <FileMetaHead label={NESTED.path} size={formatBytes(NESTED.bytes)} modified={modified} rawHref={`${notes?.url ?? "/"}${NESTED.path}?raw`} />
          </div>
        </Cell>
      </div>

      {/* glossary */}
      <Cell label="Variant · glossary term">
        <div className="max-w-[780px] rounded-[14px] border border-hair bg-s1 p-4 sm:p-5">
          <DefinitionGrid items={GLOSSARY_ROWS} layout="rows" labelStyle="term" aria-label="Glossary" />
        </div>
      </Cell>
    </div>
  );
}
