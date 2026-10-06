/**
 * Shared demo data for the quirq shapes catalog and the sample app built from it.
 *
 * Everything here is mock data. People are fictional, emails use example.com,
 * secrets are masked placeholders and every series comes from a seeded PRNG,
 * so the module evaluates to the same values on the server and in the browser.
 *
 * Vocabulary: XO is the product, a space is the work environment, and quirq is
 * only the unit-of-work metric (minted Q = V · B). Tokens and cost are a separate
 * usage meter. A missing measurement is null here and renders as "Unavailable".
 *
 * "Now" for every relative string is NOW_ISO (Fri 2 Oct 2026, 09:30 UTC).
 */

import { formatClock, formatDate, formatDateTime, formatDuration, formatRelative, formatTime } from "./format";

/* ======================================================================== */
/* Clock, seeds and helpers                                                  */
/* ======================================================================== */

export const NOW_ISO = "2026-10-02T09:30:00Z";
export const NOW_MS = Date.parse(NOW_ISO);
export const TODAY_LABEL = formatDate(NOW_ISO); // "Fri 2 Oct"

/** Every number in this module is mock unless a record says "illustrative". */
export const FIXTURE_NOTE = "Mock data for the shapes catalog. Not a live measurement.";

const MINUTE = 60_000;
const DAY = 86_400_000;
const GB = 1024 ** 3;

/** Tiny seeded PRNG (mulberry32). Same seed, same sequence, every runtime. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded random walk clamped to [min, max], rounded to `digits`. */
export function seededSeries(seed: number, length: number, min: number, max: number, digits = 0): number[] {
  const rng = mulberry32(seed);
  const span = max - min;
  const scale = 10 ** digits;
  let v = min + span * (0.35 + rng() * 0.3);
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    v += (rng() - 0.5) * span * 0.28;
    v = Math.min(max, Math.max(min, v));
    out.push(Math.round(v * scale) / scale);
  }
  return out;
}

/** ISO timestamp `min` minutes before NOW_ISO, second precision. */
export function minutesAgo(min: number): string {
  return new Date(NOW_MS - min * MINUTE).toISOString().replace(".000Z", "Z");
}

/** ISO timestamp `min` minutes after NOW_ISO. */
export function minutesFromNow(min: number): string {
  return minutesAgo(-min);
}

/** Relative string against NOW_ISO: "4m ago", "3h ago", "in 23h 40m". */
export function ago(iso: string): string {
  return formatRelative(iso, NOW_ISO);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/* ======================================================================== */
/* Shared enums and tokens                                                   */
/* ======================================================================== */

/** Spectrum color tokens from app/globals.css (text-grn, bg-blu, var(--org)...). */
export type ColorToken = "red" | "org" | "yel" | "grn" | "cyn" | "blu" | "pur";
/** Color tokens plus neutral ink tones. */
export type ToneToken = ColorToken | "ink" | "ink-dim" | "ink-faint";
/** Where a number came from. Never present mock or illustrative values as live. */
export type Provenance = "live" | "mock" | "illustrative";
export type Availability = "Available" | "Unavailable";

/** CSS variable for a tone, for inline SVG fills and strokes. */
export function toneVar(tone: ToneToken): string {
  return `var(--${tone})`;
}

export const PROVENANCE_META: Record<Provenance, { label: string; tone: ToneToken; note: string }> = {
  live: { label: "Live", tone: "grn", note: "Read from a connected telemetry source." },
  mock: { label: "Mock", tone: "ink-dim", note: "Sample data for this demo." },
  illustrative: { label: "Illustrative", tone: "org", note: "Example numbers that show the method, not a result." },
};

/* ======================================================================== */
/* People, organizations and members                                         */
/* ======================================================================== */

export type PersonId = "ada" | "kenji" | "lena" | "tomas" | "mira" | "jonah" | "imani";

export type Person = {
  id: PersonId;
  name: string;
  /** GitHub-style handle, without the @ */
  handle: string;
  email: string;
  initials: string;
  color: ColorToken;
  title: string;
};

export const PEOPLE: Record<PersonId, Person> = {
  ada: { id: "ada", name: "Ada Moreno", handle: "ada-moreno", email: "ada@example.com", initials: "AM", color: "blu", title: "Founding engineer" },
  kenji: { id: "kenji", name: "Kenji Sato", handle: "kenji-sato", email: "kenji@example.com", initials: "KS", color: "grn", title: "Platform engineer" },
  lena: { id: "lena", name: "Lena Fischer", handle: "lena-f", email: "lena@example.com", initials: "LF", color: "pur", title: "Finance and ops" },
  tomas: { id: "tomas", name: "Tomás Ruiz", handle: "tomas-ruiz", email: "tomas@example.com", initials: "TR", color: "org", title: "Design engineer" },
  mira: { id: "mira", name: "Mira Okafor", handle: "mira-o", email: "mira@example.com", initials: "MO", color: "cyn", title: "Product marketing" },
  jonah: { id: "jonah", name: "Jonah Reyes", handle: "jonah-r", email: "jonah@example.com", initials: "JR", color: "yel", title: "Contractor" },
  imani: { id: "imani", name: "Imani Brooks", handle: "imani-b", email: "imani@example.com", initials: "IB", color: "red", title: "Research partner" },
};

export const PEOPLE_LIST: Person[] = Object.values(PEOPLE);

/** The signed-in viewer for every demo. */
export const CURRENT_USER: Person = PEOPLE.ada;

export type Organization = {
  id: string;
  name: string;
  kind: "Personal spaces" | "Org spaces";
  role: MemberRole;
  members: number;
  spaces: number;
};

export const ORGANIZATIONS: Organization[] = [
  { id: "personal", name: "Personal", kind: "Personal spaces", role: "owner", members: 1, spaces: 1 },
  { id: "org_acme", name: "Acme Robotics", kind: "Org spaces", role: "owner", members: 5, spaces: 3 },
  { id: "org_northwind", name: "Northwind Studio", kind: "Org spaces", role: "collaborator", members: 12, spaces: 6 },
];

export type MemberRole = "owner" | "collaborator";
export type MemberState = "Active member" | "Request pending";

export type Member = {
  personId: PersonId;
  name: string;
  email: string;
  role: MemberRole;
  state: MemberState;
  joinedAt: string;
  joined: string;
  lastActive: string;
};

export const MEMBERS: Member[] = (
  [
    ["ada", "owner", 30 * 1440, 4],
    ["kenji", "collaborator", 28 * 1440, 14],
    ["lena", "collaborator", 21 * 1440, 110],
    ["tomas", "collaborator", 12 * 1440, 1300],
    ["mira", "collaborator", 9 * 1440, 296],
  ] as const
).map(([id, role, joinedMin, activeMin]) => {
  const joinedAt = minutesAgo(joinedMin);
  return {
    personId: id,
    name: PEOPLE[id].name,
    email: PEOPLE[id].email,
    role,
    state: "Active member" as const,
    joinedAt,
    joined: formatDate(joinedAt),
    lastActive: ago(minutesAgo(activeMin)),
  };
});

export type Invite = {
  id: string;
  email: string;
  role: MemberRole;
  state: "Request pending";
  invitedBy: PersonId;
  sentAt: string;
  sent: string;
  expiresIn: string;
};

export const INVITES: Invite[] = (
  [
    ["inv_01", "jonah@example.com", "ada", 2 * 1440 + 90, "5d"],
    ["inv_02", "imani@example.com", "kenji", 300, "6d"],
  ] as const
).map(([id, email, invitedBy, min, expiresIn]) => {
  const sentAt = minutesAgo(min);
  return { id, email, role: "collaborator" as const, state: "Request pending" as const, invitedBy, sentAt, sent: ago(sentAt), expiresIn };
});

/* ======================================================================== */
/* Models and agent runtimes                                                 */
/* ======================================================================== */

export type ModelId =
  | "claude-opus"
  | "claude-sonnet"
  | "claude-haiku"
  | "gpt-5-codex"
  | "gpt-5"
  | "cursor-auto"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "hermes-4-70b"
  | "hermes-4-405b";

export type Model = {
  id: ModelId;
  label: string;
  vendor: string;
  /** illustrative blended USD per 1M tokens, used to derive mock session cost */
  pricePerMTok: number;
  /** typical tokens per active minute, used to derive mock session tokens */
  tokensPerMin: number;
  color: ColorToken;
};

export const MODELS: Record<ModelId, Model> = {
  "claude-opus": { id: "claude-opus", label: "Claude Opus", vendor: "Anthropic", pricePerMTok: 3.47, tokensPerMin: 16700, color: "org" },
  "claude-sonnet": { id: "claude-sonnet", label: "Claude Sonnet", vendor: "Anthropic", pricePerMTok: 1.15, tokensPerMin: 12000, color: "yel" },
  "claude-haiku": { id: "claude-haiku", label: "Claude Haiku", vendor: "Anthropic", pricePerMTok: 0.35, tokensPerMin: 6000, color: "red" },
  "gpt-5-codex": { id: "gpt-5-codex", label: "GPT-5 Codex", vendor: "OpenAI", pricePerMTok: 1.1, tokensPerMin: 3900, color: "cyn" },
  "gpt-5": { id: "gpt-5", label: "GPT-5", vendor: "OpenAI", pricePerMTok: 1.25, tokensPerMin: 5000, color: "blu" },
  "cursor-auto": { id: "cursor-auto", label: "Cursor Auto", vendor: "Anysphere", pricePerMTok: 0.9, tokensPerMin: 7000, color: "pur" },
  "gemini-2.5-pro": { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", vendor: "Google", pricePerMTok: 1.0, tokensPerMin: 9000, color: "blu" },
  "gemini-2.5-flash": { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", vendor: "Google", pricePerMTok: 0.3, tokensPerMin: 9000, color: "cyn" },
  "hermes-4-70b": { id: "hermes-4-70b", label: "Hermes 4 70B", vendor: "Nous Research", pricePerMTok: 0.4, tokensPerMin: 6000, color: "pur" },
  "hermes-4-405b": { id: "hermes-4-405b", label: "Hermes 4 405B", vendor: "Nous Research", pricePerMTok: 1.0, tokensPerMin: 5000, color: "pur" },
};

/** One id form everywhere: snake_case, displayed with `label`. */
export type RuntimeId = "claude_code" | "codex" | "openclaw" | "cursor" | "hermes" | "gemini_cli";

export type Runtime = {
  id: RuntimeId;
  label: string;
  vendor: string;
  kind: "CLI" | "IDE agent" | "Open-source runtime";
  description: string;
  installed: boolean;
  inUse: boolean;
  /** all-time session count in this space */
  sessions: number;
  color: ColorToken;
  models: ModelId[];
  defaultModel: ModelId;
  /** null when not installed */
  version: string | null;
  command: string;
  /** how a skill is invoked: /skill-name for Claude Code, $skill-name for Codex */
  skillPrefix: "/" | "$" | null;
};

export const RUNTIMES: Runtime[] = [
  {
    id: "claude_code",
    label: "Claude Code",
    vendor: "Anthropic",
    kind: "CLI",
    description: "Agentic coding in the terminal. Default runtime for local spaces.",
    installed: true,
    inUse: true,
    sessions: 227,
    color: "org",
    models: ["claude-opus", "claude-sonnet", "claude-haiku"],
    defaultModel: "claude-opus",
    version: "2.4.1",
    command: "claude",
    skillPrefix: "/",
  },
  {
    id: "codex",
    label: "Codex",
    vendor: "OpenAI",
    kind: "CLI",
    description: "OpenAI's coding agent CLI, brokered through the Space API.",
    installed: true,
    inUse: false,
    sessions: 75,
    color: "cyn",
    models: ["gpt-5-codex", "gpt-5"],
    defaultModel: "gpt-5-codex",
    version: "0.48.0",
    command: "codex",
    skillPrefix: "$",
  },
  {
    id: "openclaw",
    label: "OpenClaw",
    vendor: "Open source",
    kind: "Open-source runtime",
    description: "Open-source agent runtime with file-based sessions and channels.",
    installed: true,
    inUse: true,
    sessions: 41,
    color: "grn",
    models: ["claude-sonnet", "claude-opus", "gpt-5"],
    defaultModel: "claude-sonnet",
    version: "1.9.3",
    command: "openclaw",
    skillPrefix: "/",
  },
  {
    id: "cursor",
    label: "Cursor",
    vendor: "Anysphere",
    kind: "IDE agent",
    description: "Editor agent that reads the same project folders.",
    installed: true,
    inUse: false,
    sessions: 12,
    color: "blu",
    models: ["cursor-auto", "claude-sonnet", "gpt-5"],
    defaultModel: "cursor-auto",
    version: "1.7.2",
    command: "cursor-agent",
    skillPrefix: null,
  },
  {
    id: "hermes",
    label: "Hermes",
    vendor: "Nous Research",
    kind: "Open-source runtime",
    description: "Open-weights agent runtime for self-hosted models.",
    installed: false,
    inUse: false,
    sessions: 0,
    color: "pur",
    models: ["hermes-4-70b", "hermes-4-405b"],
    defaultModel: "hermes-4-70b",
    version: null,
    command: "hermes",
    skillPrefix: null,
  },
  {
    id: "gemini_cli",
    label: "Gemini CLI",
    vendor: "Google",
    kind: "CLI",
    description: "Google's terminal agent with a large context window.",
    installed: false,
    inUse: false,
    sessions: 0,
    color: "yel",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    defaultModel: "gemini-2.5-pro",
    version: null,
    command: "gemini",
    skillPrefix: null,
  },
];

export const RUNTIME_BY_ID: Record<RuntimeId, Runtime> = Object.fromEntries(RUNTIMES.map((r) => [r.id, r])) as Record<
  RuntimeId,
  Runtime
>;

export type CapabilityState = "Supported" | "Partial" | "Planned" | "Unavailable";

/** Rollout matrix: what each runtime supports inside a space. */
export const RUNTIME_CAPABILITIES: { capability: string; states: Record<RuntimeId, CapabilityState> }[] = [
  { capability: "Skills", states: { claude_code: "Supported", codex: "Supported", openclaw: "Supported", cursor: "Partial", hermes: "Planned", gemini_cli: "Planned" } },
  { capability: "Session resume", states: { claude_code: "Supported", codex: "Supported", openclaw: "Supported", cursor: "Partial", hermes: "Unavailable", gemini_cli: "Planned" } },
  { capability: "Step sync", states: { claude_code: "Supported", codex: "Partial", openclaw: "Supported", cursor: "Unavailable", hermes: "Unavailable", gemini_cli: "Planned" } },
  { capability: "Usage telemetry", states: { claude_code: "Supported", codex: "Supported", openclaw: "Supported", cursor: "Partial", hermes: "Planned", gemini_cli: "Planned" } },
  { capability: "Hosted spaces", states: { claude_code: "Supported", codex: "Supported", openclaw: "Supported", cursor: "Unavailable", hermes: "Planned", gemini_cli: "Planned" } },
];

/* ======================================================================== */
/* Projects (raw; final PROJECTS adds session-derived fields)                */
/* ======================================================================== */

export type OrbitCategory = "Engineering" | "Ops" | "Documentation" | "Research" | "Marketing";
export type ProjectStage = "Foundation" | "Capture" | "Generate" | "Orchestrate";
export type ProjectLane = "Human-led" | "Agent-assisted" | "Live agent";

export const PROJECT_STAGES: { id: ProjectStage; step: number; blurb: string }[] = [
  { id: "Foundation", step: 1, blurb: "Folder, context files and owner are set up." },
  { id: "Capture", step: 2, blurb: "Sources, notes and history flow into the project." },
  { id: "Generate", step: 3, blurb: "Agents draft and change files with a person reviewing." },
  { id: "Orchestrate", step: 4, blurb: "Agents run scheduled and multi-step work on their own." },
];

export const PROJECT_LANES: { id: ProjectLane; tone: ToneToken; blurb: string }[] = [
  { id: "Human-led", tone: "ink-dim", blurb: "A person does the work; agents answer questions." },
  { id: "Agent-assisted", tone: "blu", blurb: "Agents propose changes; a person accepts each one." },
  { id: "Live agent", tone: "grn", blurb: "An agent session is working in the project now." },
];

export type LanguageShare = { name: string; share: number; color: ColorToken };

export type Project = {
  id: string;
  displayName: string;
  category: OrbitCategory;
  description: string;
  stage: ProjectStage;
  lane: ProjectLane;
  spaceId: string;
  /** all-time sessions */
  sessions: number;
  /** derived from SESSIONS */
  openSessions: number;
  files: number;
  lastActiveAt: string;
  lastActive: string;
  owner: PersonId;
  peers: PersonId[];
  pinned: boolean;
  github: { repo: string; url: string; defaultBranch: string } | null;
  branch: string;
  languages: LanguageShare[];
  color: ColorToken;
  openWorkItems: number;
};

type RawProject = Omit<Project, "openSessions" | "lastActive" | "color" | "openWorkItems">;

const gh = (name: string, defaultBranch = "main") => ({
  repo: `quirq-ai/${name}`,
  url: `https://github.com/quirq-ai/${name}`,
  defaultBranch,
});

const RAW_PROJECTS: RawProject[] = [
  {
    id: "xo-space",
    displayName: "xo-space",
    category: "Engineering",
    description: "Engine, Space API and Space dashboard that run a space locally.",
    stage: "Orchestrate",
    lane: "Live agent",
    spaceId: "ws_2b81d0e4",
    sessions: 18,
    files: 83,
    lastActiveAt: minutesAgo(4),
    owner: "ada",
    peers: ["kenji", "lena"],
    pinned: true,
    github: gh("xo-space"),
    branch: "feat/status-pill",
    languages: [
      { name: "TypeScript", share: 0.58, color: "blu" },
      { name: "Python", share: 0.31, color: "yel" },
      { name: "CSS", share: 0.07, color: "pur" },
      { name: "Shell", share: 0.04, color: "grn" },
    ],
  },
  {
    id: "galileo",
    displayName: "galileo",
    category: "Engineering",
    description: "Local gateway that gives each source its own origin.",
    stage: "Generate",
    lane: "Agent-assisted",
    spaceId: "ws_2b81d0e4",
    sessions: 9,
    files: 41,
    lastActiveAt: minutesAgo(12),
    owner: "ada",
    peers: ["kenji"],
    pinned: true,
    github: gh("galileo"),
    branch: "main",
    languages: [
      { name: "JavaScript", share: 0.71, color: "yel" },
      { name: "TypeScript", share: 0.18, color: "blu" },
      { name: "CSS", share: 0.11, color: "pur" },
    ],
  },
  {
    id: "xo-swarm",
    displayName: "xo-swarm",
    category: "Engineering",
    description: "Hosted management that launches and manages many spaces.",
    stage: "Orchestrate",
    lane: "Live agent",
    spaceId: "ws_7f3a9c21e4b0",
    sessions: 24,
    files: 312,
    lastActiveAt: minutesAgo(2),
    owner: "kenji",
    peers: ["ada", "mira"],
    pinned: true,
    github: gh("xo-swarm"),
    branch: "feat/launchpad-retry",
    languages: [
      { name: "TypeScript", share: 0.82, color: "blu" },
      { name: "CSS", share: 0.1, color: "pur" },
      { name: "JavaScript", share: 0.08, color: "yel" },
    ],
  },
  {
    id: "telescope",
    displayName: "telescope",
    category: "Engineering",
    description: "The bar UI for galileo: sources, status and quick switching.",
    stage: "Generate",
    lane: "Live agent",
    spaceId: "ws_2b81d0e4",
    sessions: 7,
    files: 22,
    lastActiveAt: minutesAgo(3),
    owner: "ada",
    peers: ["tomas"],
    pinned: false,
    github: gh("telescope"),
    branch: "fix/narrow-bar",
    languages: [
      { name: "JavaScript", share: 0.64, color: "yel" },
      { name: "CSS", share: 0.36, color: "pur" },
    ],
  },
  {
    id: "landing",
    displayName: "landing",
    category: "Marketing",
    description: "Public site: layers, pricing and the Get started path.",
    stage: "Generate",
    lane: "Agent-assisted",
    spaceId: "ws_7f3a9c21e4b0",
    sessions: 11,
    files: 64,
    lastActiveAt: minutesAgo(296),
    owner: "mira",
    peers: ["tomas", "ada"],
    pinned: false,
    github: gh("landing"),
    branch: "copy/pricing-cta",
    languages: [
      { name: "TypeScript", share: 0.74, color: "blu" },
      { name: "MDX", share: 0.16, color: "org" },
      { name: "CSS", share: 0.1, color: "pur" },
    ],
  },
  {
    id: "billing-api",
    displayName: "billing-api",
    category: "Ops",
    description: "Payments service: checkout, subscriptions and invoices.",
    stage: "Capture",
    lane: "Human-led",
    spaceId: "ws_c40e19aa",
    sessions: 6,
    files: 38,
    lastActiveAt: minutesAgo(1405),
    owner: "lena",
    peers: ["kenji"],
    pinned: false,
    github: gh("billing-api"),
    branch: "main",
    languages: [
      { name: "TypeScript", share: 0.9, color: "blu" },
      { name: "SQL", share: 0.1, color: "grn" },
    ],
  },
  {
    id: "research-notes",
    displayName: "research-notes",
    category: "Research",
    description: "Reading notes on verification and work measurement.",
    stage: "Capture",
    lane: "Agent-assisted",
    spaceId: "ws_2b81d0e4",
    sessions: 5,
    files: 29,
    lastActiveAt: minutesAgo(110),
    owner: "ada",
    peers: ["lena", "imani"],
    pinned: false,
    github: null,
    branch: "main",
    languages: [
      { name: "Markdown", share: 0.88, color: "cyn" },
      { name: "Python", share: 0.12, color: "yel" },
    ],
  },
  {
    id: "space-drift",
    displayName: "space-drift",
    category: "Research",
    description: "Visualizer that drifts through projects, sessions and files.",
    stage: "Foundation",
    lane: "Human-led",
    spaceId: "ws_2b81d0e4",
    sessions: 4,
    files: 17,
    lastActiveAt: minutesAgo(1238),
    owner: "tomas",
    peers: ["ada"],
    pinned: false,
    github: gh("space-drift"),
    branch: "main",
    languages: [
      { name: "TypeScript", share: 0.6, color: "blu" },
      { name: "GLSL", share: 0.25, color: "grn" },
      { name: "CSS", share: 0.15, color: "pur" },
    ],
  },
  {
    id: "ops-runbooks",
    displayName: "ops-runbooks",
    category: "Ops",
    description: "Runbooks for connectors, incidents and token rotation.",
    stage: "Orchestrate",
    lane: "Live agent",
    spaceId: "ws_7f3a9c21e4b0",
    sessions: 13,
    files: 46,
    lastActiveAt: minutesAgo(1),
    owner: "kenji",
    peers: ["lena"],
    pinned: false,
    github: gh("ops-runbooks"),
    branch: "main",
    languages: [
      { name: "Markdown", share: 0.55, color: "cyn" },
      { name: "Shell", share: 0.3, color: "grn" },
      { name: "YAML", share: 0.15, color: "org" },
    ],
  },
  {
    id: "xo-docs",
    displayName: "xo-docs",
    category: "Documentation",
    description: "Public product docs: getting started, agents and troubleshooting.",
    stage: "Generate",
    lane: "Agent-assisted",
    spaceId: "ws_7f3a9c21e4b0",
    sessions: 8,
    files: 92,
    lastActiveAt: minutesAgo(2 * 1440 + 200),
    owner: "lena",
    peers: ["mira"],
    pinned: false,
    github: gh("xo-docs"),
    branch: "docs/space-wording",
    languages: [
      { name: "MDX", share: 0.81, color: "org" },
      { name: "TypeScript", share: 0.19, color: "blu" },
    ],
  },
  {
    id: "demo-kit",
    displayName: "demo-kit",
    category: "Marketing",
    description: "Seeded demo data and scripts for pilot walkthroughs.",
    stage: "Foundation",
    lane: "Human-led",
    spaceId: "ws_e5d7b302",
    sessions: 2,
    files: 14,
    lastActiveAt: minutesAgo(5850),
    owner: "tomas",
    peers: ["mira"],
    pinned: false,
    github: gh("demo-kit"),
    branch: "main",
    languages: [
      { name: "TypeScript", share: 0.7, color: "blu" },
      { name: "JSON", share: 0.3, color: "yel" },
    ],
  },
];

const RAW_PROJECT_BY_ID = Object.fromEntries(RAW_PROJECTS.map((p) => [p.id, p])) as Record<string, RawProject>;

/* ======================================================================== */
/* Sessions                                                                  */
/* ======================================================================== */

export type Session = {
  id: string;
  projectId: string;
  spaceId: string;
  runtime: RuntimeId;
  model: ModelId;
  title: string;
  /** last message preview, for chat history rows */
  summary: string;
  owner: PersonId;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  /** USD, mock */
  cost: number;
  turns: number;
  toolCalls: number;
  durationSec: number;
  /** "1h 12m" */
  duration: string;
  open: boolean;
  startedAt: string;
  startedAgo: string;
  lastActivityAt: string;
  lastActivity: string;
};

type SessionSeed = {
  id: string;
  projectId: string;
  runtime: RuntimeId;
  model: ModelId;
  title: string;
  summary: string;
  owner: PersonId;
  startMinAgo: number;
  durationMin: number;
  open?: boolean;
  tokens?: number;
  cost?: number;
  turns?: number;
};

const SESSION_SEEDS: SessionSeed[] = [
  { id: "df1a1a5b", projectId: "xo-space", runtime: "claude_code", model: "claude-opus", title: "Wire Space API status pill", summary: "One test still expects the old zero fallback. Fixing the summary row next.", owner: "ada", startMinAgo: 76, durationMin: 72, open: true, tokens: 1_204_331, cost: 4.18, turns: 37 },
  { id: "7c2e91d0", projectId: "telescope", runtime: "claude_code", model: "claude-sonnet", title: "Bar UI: collapse sources on narrow screens", summary: "Sources fold into a menu under 480px. Checking focus order now.", owner: "ada", startMinAgo: 35, durationMin: 32, open: true },
  { id: "a41f03be", projectId: "xo-swarm", runtime: "openclaw", model: "claude-sonnet", title: "Launchpad: retry failed space starts", summary: "Retrying with backoff, three attempts, then Space could not start.", owner: "kenji", startMinAgo: 18, durationMin: 16, open: true },
  { id: "9d4c2f68", projectId: "ops-runbooks", runtime: "openclaw", model: "claude-sonnet", title: "Incident: Slack connector needs attention", summary: "The Slack sign-in expired. Waiting for Kenji to sign in again.", owner: "kenji", startMinAgo: 14, durationMin: 13, open: true },
  { id: "ses_9f1c2a", projectId: "galileo", runtime: "codex", model: "gpt-5-codex", title: "Give each source its own origin", summary: "Port sources now resolve at name.localhost:4100. Router tests pass.", owner: "ada", startMinAgo: 260, durationMin: 80, tokens: 312_500 },
  { id: "c7a4e0f9", projectId: "ops-runbooks", runtime: "openclaw", model: "gpt-5", title: "Runbook: rotate connector tokens", summary: "Added steps for GitHub, Linear and Slack with a rollback note.", owner: "kenji", startMinAgo: 120, durationMin: 25 },
  { id: "e19a7b33", projectId: "landing", runtime: "openclaw", model: "claude-sonnet", title: "Pricing page: Get started CTA", summary: "Renamed Deploy to Get started and kept one primary CTA per page.", owner: "mira", startMinAgo: 340, durationMin: 44 },
  { id: "f0c5d218", projectId: "research-notes", runtime: "claude_code", model: "claude-opus", title: "Summarize verification papers", summary: "Drafted summaries of three papers. Citations still pending.", owner: "ada", startMinAgo: 600, durationMin: 130 },
  { id: "3d9e6a12", projectId: "space-drift", runtime: "claude_code", model: "claude-sonnet", title: "Orbit map: smoother camera easing", summary: "Camera now eases over 600ms and respects reduced motion.", owner: "tomas", startMinAgo: 1300, durationMin: 62 },
  { id: "91be2f6a", projectId: "xo-space", runtime: "codex", model: "gpt-5-codex", title: "Engine: session mapping tests", summary: "Covered logical to provider id mapping for Codex and Claude Code.", owner: "kenji", startMinAgo: 1380, durationMin: 54 },
  { id: "b8d2c4e7", projectId: "billing-api", runtime: "codex", model: "gpt-5-codex", title: "Reconcile June invoices", summary: "Blocked: the June export from finance has not arrived.", owner: "lena", startMinAgo: 1500, durationMin: 95 },
  { id: "2af7d3c8", projectId: "xo-space", runtime: "claude_code", model: "claude-opus", title: "Projects list pinned filter", summary: "Pinned projects sort first and survive a reload.", owner: "ada", startMinAgo: 2900, durationMin: 88 },
  { id: "64d1c9b0", projectId: "galileo", runtime: "claude_code", model: "claude-sonnet", title: "Health checks for port sources", summary: "Down sources now read Down, never zero, in the bar.", owner: "ada", startMinAgo: 3000, durationMin: 41 },
  { id: "5e8b2a71", projectId: "xo-swarm", runtime: "openclaw", model: "claude-opus", title: "Billing: Trial active banner copy", summary: "Replaced Trialing with Trial active across billing views.", owner: "mira", startMinAgo: 4300, durationMin: 37 },
  { id: "d2f6c3a9", projectId: "telescope", runtime: "cursor", model: "cursor-auto", title: "Keyboard focus order in the bar", summary: "Tab order now follows the visual order of sources.", owner: "lena", startMinAgo: 4400, durationMin: 22 },
  { id: "8a3e5f14", projectId: "research-notes", runtime: "codex", model: "gpt-5", title: "Compare snapshot diff methods", summary: "Weighted checks beat raw line counts on the sample set.", owner: "ada", startMinAgo: 5800, durationMin: 70 },
  { id: "1c9f8a43", projectId: "demo-kit", runtime: "claude_code", model: "claude-sonnet", title: "Seed demo data for the pilot", summary: "Seeded five projects and two weeks of mock usage.", owner: "tomas", startMinAgo: 5900, durationMin: 48 },
  { id: "0b7d4e26", projectId: "landing", runtime: "claude_code", model: "claude-haiku", title: "Fix footer hairline contrast", summary: "Raised the hairline to 18% white on the light theme.", owner: "mira", startMinAgo: 7300, durationMin: 12 },
  { id: "4f2a6b95", projectId: "xo-swarm", runtime: "codex", model: "gpt-5-codex", title: "Coder adapter: stop on idle", summary: "Idle spaces stop after the configured window.", owner: "kenji", startMinAgo: 8800, durationMin: 66 },
  { id: "6b1d8e07", projectId: "billing-api", runtime: "claude_code", model: "claude-sonnet", title: "Webhook retries for invoices", summary: "Retries back off and stop after five attempts.", owner: "lena", startMinAgo: 10200, durationMin: 58 },
  { id: "a7e3b1c4", projectId: "space-drift", runtime: "cursor", model: "claude-sonnet", title: "Particle field performance pass", summary: "Halved draw calls by batching sessions per project.", owner: "tomas", startMinAgo: 11600, durationMin: 34 },
  { id: "c3f9d5a2", projectId: "galileo", runtime: "codex", model: "gpt-5-codex", title: "Files source: folder listing", summary: "Folder sources list files with sizes and modified times.", owner: "ada", startMinAgo: 12900, durationMin: 45 },
  { id: "e6a2c8f1", projectId: "xo-docs", runtime: "openclaw", model: "gpt-5", title: "Docs: space vs workspace wording", summary: "New copy says space; quoted UI labels kept as shipped.", owner: "lena", startMinAgo: 13400, durationMin: 29 },
  { id: "f8b4d7e3", projectId: "telescope", runtime: "claude_code", model: "claude-opus", title: "Source status dots", summary: "One saturated dot per source with a 3px halo.", owner: "ada", startMinAgo: 15800, durationMin: 77 },
];

export const SESSIONS: Session[] = SESSION_SEEDS.map((s, i) => {
  const rng = mulberry32(9100 + i * 37);
  const model = MODELS[s.model];
  const tokens = s.tokens ?? Math.round(s.durationMin * model.tokensPerMin * (0.8 + rng() * 0.4));
  const outputShare = 0.12 + rng() * 0.08;
  const outputTokens = Math.round(tokens * outputShare);
  const turns = s.turns ?? Math.max(2, Math.round(s.durationMin * 0.5 * (0.8 + rng() * 0.4)));
  const startedAt = minutesAgo(s.startMinAgo);
  const lastActivityAt = minutesAgo(s.startMinAgo - s.durationMin);
  return {
    id: s.id,
    projectId: s.projectId,
    spaceId: RAW_PROJECT_BY_ID[s.projectId].spaceId,
    runtime: s.runtime,
    model: s.model,
    title: s.title,
    summary: s.summary,
    owner: s.owner,
    tokens,
    inputTokens: tokens - outputTokens,
    outputTokens,
    cost: s.cost ?? round2((tokens / 1_000_000) * model.pricePerMTok),
    turns,
    toolCalls: Math.round(turns * (1.4 + rng())),
    durationSec: s.durationMin * 60,
    duration: formatDuration(s.durationMin * 60),
    open: s.open ?? false,
    startedAt,
    startedAgo: ago(startedAt),
    lastActivityAt,
    lastActivity: ago(lastActivityAt),
  };
});

export const SESSION_BY_ID: Record<string, Session> = Object.fromEntries(SESSIONS.map((s) => [s.id, s]));

/* ======================================================================== */
/* Todos (steps)                                                             */
/* ======================================================================== */

/** A todo inside a session is shown to people as a step. */
export type TodoStatus = "pending" | "in_progress" | "blocked" | "completed" | "cancelled";

export const TODO_STATUS_META: Record<TodoStatus, { label: string; tone: ToneToken }> = {
  pending: { label: "Pending", tone: "ink-faint" },
  in_progress: { label: "In progress", tone: "blu" },
  blocked: { label: "Blocked", tone: "org" },
  completed: { label: "Completed", tone: "grn" },
  cancelled: { label: "Cancelled", tone: "ink-faint" },
};

export type Todo = {
  id: string;
  sessionId: string;
  projectId: string;
  runtime: RuntimeId;
  content: string;
  status: TodoStatus;
  /** why it is blocked or cancelled */
  note: string | null;
  updatedAt: string;
  updatedAgo: string;
};

const TODO_SEEDS: [string, string, string, TodoStatus, number, string | null][] = [
  ["t_01", "df1a1a5b", "Agree on the acceptance criteria", "completed", 28, null],
  ["t_02", "df1a1a5b", "Read the current status pill", "completed", 4, null],
  ["t_03", "df1a1a5b", "Wire Space API status pill", "in_progress", 2, null],
  ["t_04", "df1a1a5b", "Show Unavailable when the API is down", "pending", 76, null],
  ["t_05", "df1a1a5b", "Run the status tests", "pending", 76, null],
  ["t_06", "7c2e91d0", "Measure the bar at 390px", "completed", 22, null],
  ["t_07", "7c2e91d0", "Collapse sources into a menu", "in_progress", 6, null],
  ["t_08", "7c2e91d0", "Keep focus on the toggle after collapse", "pending", 35, null],
  ["t_09", "a41f03be", "Read Coder start errors", "completed", 20, null],
  ["t_10", "a41f03be", "Retry with backoff, three attempts", "in_progress", 3, null],
  ["t_11", "a41f03be", "Show Space could not start after the last attempt", "pending", 18, null],
  ["t_12", "b8d2c4e7", "Reconcile June invoices", "blocked", 1420, "Waiting on the June export from finance"],
  ["t_13", "b8d2c4e7", "Match payouts to invoices", "cancelled", 1410, "Moved to next month's close"],
  ["t_14", "9d4c2f68", "Find which token expired", "completed", 9, null],
  ["t_15", "9d4c2f68", "Ask Kenji to sign in to Slack again", "blocked", 2, "Needs a person to sign in"],
  ["t_16", "e19a7b33", "Rename Deploy to Get started", "completed", 310, null],
  ["t_17", "e19a7b33", "Check one primary CTA per page", "completed", 300, null],
  ["t_18", "f0c5d218", "Draft a summary of three papers", "completed", 480, null],
  ["t_19", "f0c5d218", "Cite the method for each paper", "pending", 470, null],
];

export const TODOS: Todo[] = TODO_SEEDS.map(([id, sessionId, content, status, min, note]) => {
  const s = SESSION_BY_ID[sessionId];
  const updatedAt = minutesAgo(min);
  return { id, sessionId, projectId: s.projectId, runtime: s.runtime, content, status, note, updatedAt, updatedAgo: ago(updatedAt) };
});

/* ======================================================================== */
/* Projects (final) and spaces                                               */
/* ======================================================================== */

export const ORBIT_CATEGORIES: { id: OrbitCategory; color: ColorToken; blurb: string; projects: string[] }[] = (
  [
    ["Engineering", "blu", "Product code and services"],
    ["Ops", "grn", "Payments, runbooks and incidents"],
    ["Documentation", "yel", "Docs people read"],
    ["Research", "pur", "Reading, experiments and visualizers"],
    ["Marketing", "org", "Site, pricing and demos"],
  ] as const
).map(([id, color, blurb]) => ({ id, color, blurb, projects: RAW_PROJECTS.filter((p) => p.category === id).map((p) => p.id) }));

const CATEGORY_COLOR = Object.fromEntries(ORBIT_CATEGORIES.map((c) => [c.id, c.color])) as Record<OrbitCategory, ColorToken>;

export type WorkItemColumn = "Backlog" | "In progress" | "In review" | "Done";

export type WorkItem = {
  id: string;
  number: number;
  title: string;
  repo: string;
  url: string;
  projectId: string;
  labels: string[];
  status: "open" | "closed";
  column: WorkItemColumn;
  assignee: PersonId | null;
  inProgress: boolean;
  tracked: boolean;
  comments: number;
  linkedSessionId: string | null;
  updatedAt: string;
  updatedAgo: string;
};

export const WORK_ITEM_LABELS: Record<string, { name: string; color: ColorToken }> = {
  bug: { name: "bug", color: "red" },
  p1: { name: "p1", color: "org" },
  p2: { name: "p2", color: "yel" },
  ui: { name: "ui", color: "blu" },
  enhancement: { name: "enhancement", color: "cyn" },
  copy: { name: "copy", color: "pur" },
  docs: { name: "docs", color: "yel" },
  infra: { name: "infra", color: "grn" },
  a11y: { name: "a11y", color: "blu" },
  finance: { name: "finance", color: "grn" },
  blocked: { name: "blocked", color: "org" },
};

export const WORK_ITEM_COLUMNS: WorkItemColumn[] = ["Backlog", "In progress", "In review", "Done"];

const WORK_ITEM_SEEDS: [string, string, number, string, string[], WorkItemColumn, PersonId | null, number, number, string | null][] = [
  // id, project, number, title, labels, column, assignee, comments, updated min ago, linked session
  ["wi_42", "xo-space", 100, "Projects list needs a pinned filter", ["ui"], "In progress", "ada", 4, 2900, "2af7d3c8"],
  ["wi_43", "xo-space", 130, "Chat: fix chat-related bugs", ["bug", "p1"], "In progress", "kenji", 9, 180, null],
  ["wi_44", "xo-space", 131, "Status pill shows Unavailable when the API is down", ["ui", "p1"], "In progress", "ada", 2, 4, "df1a1a5b"],
  ["wi_45", "xo-space", 96, "Session mapping drops Codex conversation ids", ["bug"], "Done", "kenji", 6, 1326, "91be2f6a"],
  ["wi_46", "galileo", 12, "Per-source origins for port sources", ["enhancement"], "Done", "ada", 3, 180, "ses_9f1c2a"],
  ["wi_47", "galileo", 15, "Files source: show folder listing", ["enhancement"], "In review", "ada", 1, 9, "c3f9d5a2"],
  ["wi_48", "galileo", 17, "Down sources render as zero in the bar", ["bug", "p2"], "Backlog", null, 0, 2959, null],
  ["wi_49", "xo-swarm", 214, "Launchpad: retry failed space starts", ["enhancement", "p1"], "In progress", "kenji", 5, 2, "a41f03be"],
  ["wi_50", "xo-swarm", 220, "Rename Trialing to Trial active", ["copy"], "Done", "mira", 2, 4263, "5e8b2a71"],
  ["wi_51", "xo-swarm", 223, "Coder adapter: stop idle spaces", ["infra"], "In review", "kenji", 7, 640, "4f2a6b95"],
  ["wi_52", "landing", 58, "Pricing CTA should read Get started", ["copy"], "Done", "mira", 3, 296, "e19a7b33"],
  ["wi_53", "landing", 61, "Footer hairline fails contrast in light theme", ["a11y"], "Backlog", null, 1, 7288, null],
  ["wi_54", "billing-api", 9, "Reconcile June invoices", ["finance", "blocked"], "Backlog", "lena", 4, 1420, "b8d2c4e7"],
  ["wi_55", "space-drift", 4, "Orbit map camera jitter on resize", ["bug"], "Backlog", "tomas", 0, 1238, null],
  ["wi_56", "xo-docs", 27, "Prefer space over workspace in new copy", ["docs"], "In review", "lena", 3, 13371, "e6a2c8f1"],
];

export const WORK_ITEMS: WorkItem[] = WORK_ITEM_SEEDS.map(([id, projectId, number, title, labels, column, assignee, comments, min, linked]) => {
  const repo = RAW_PROJECT_BY_ID[projectId].github?.repo ?? `quirq-ai/${projectId}`;
  const updatedAt = minutesAgo(min);
  return {
    id,
    number,
    title,
    repo,
    url: `https://github.com/${repo}/issues/${number}`,
    projectId,
    labels,
    status: column === "Done" ? "closed" : "open",
    column,
    assignee,
    inProgress: column === "In progress",
    tracked: linked !== null,
    comments,
    linkedSessionId: linked,
    updatedAt,
    updatedAgo: ago(updatedAt),
  };
});

/** Board view grouped by column, in column order. */
export const WORK_ITEM_BOARD: { column: WorkItemColumn; items: WorkItem[] }[] = WORK_ITEM_COLUMNS.map((column) => ({
  column,
  items: WORK_ITEMS.filter((w) => w.column === column),
}));

export const PROJECTS: Project[] = RAW_PROJECTS.map((p) => {
  const own = SESSIONS.filter((s) => s.projectId === p.id);
  const latest = own.reduce((max, s) => (s.lastActivityAt > max ? s.lastActivityAt : max), p.lastActiveAt);
  return {
    ...p,
    sessions: Math.max(p.sessions, own.length),
    openSessions: own.filter((s) => s.open).length,
    lastActiveAt: latest,
    lastActive: ago(latest),
    color: CATEGORY_COLOR[p.category],
    openWorkItems: WORK_ITEMS.filter((w) => w.projectId === p.id && w.status === "open").length,
  };
});

export const PROJECT_BY_ID: Record<string, Project> = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

export type SpaceStatus = "Creating" | "Starting" | "Running" | "Stopping" | "Stopped";
export type Deployment = "local" | "hosted";

export const SPACE_STATUS_META: Record<SpaceStatus, { tone: ToneToken; pulse: boolean; action: string | null; blurb: string }> = {
  Creating: { tone: "blu", pulse: true, action: null, blurb: "Provisioning the space." },
  Starting: { tone: "yel", pulse: true, action: null, blurb: "Starting the runtime and Space API." },
  Running: { tone: "grn", pulse: false, action: "Open space", blurb: "The space is up and the Space API answers." },
  Stopping: { tone: "org", pulse: true, action: null, blurb: "Saving state and stopping." },
  Stopped: { tone: "ink-faint", pulse: false, action: "Start space", blurb: "Nothing is running. Files stay on disk." },
};

/** Failure copy for a space that did not reach Running. */
export const SPACE_START_FAILURE = {
  title: "Space could not start",
  body: "The runtime exited before the Space API answered. Your files are safe.",
  action: "Try again",
  details: "Technical details",
};

/** used is null when the space cannot report it; render "Unavailable". */
export type Meter = { used: number | null; total: number; unit: "cores" | "bytes" };

export type Space = {
  id: string;
  name: string;
  deployment: Deployment;
  runtime: RuntimeId;
  status: SpaceStatus;
  owner: PersonId;
  members: PersonId[];
  description: string;
  host: string;
  provider: "Laptop" | "Coder" | "Docker" | "Vercel Sandbox";
  region: string | null;
  url: string;
  /** "23h 40m"; null when the space has no auto-stop */
  stopsIn: string | null;
  stopsAt: string | null;
  projects: string[];
  usage: { cpu: Meter; memory: Meter; disk: Meter };
  apiStatus: "Up" | "Down" | "Unavailable";
  version: string;
  createdAt: string;
  lastActiveAt: string;
  lastActive: string;
};

type RawSpace = Omit<Space, "projects" | "lastActive">;

const RAW_SPACES: RawSpace[] = [
  {
    id: "ws_7f3a9c21e4b0",
    name: "ops-copilot",
    deployment: "hosted",
    runtime: "openclaw",
    status: "Running",
    owner: "kenji",
    members: ["kenji", "ada", "mira", "lena"],
    description: "Hosted space for the platform, docs, site and runbooks.",
    host: "ops-copilot.spaces.example.com",
    provider: "Coder",
    region: "us-east-1",
    url: "https://ops-copilot.spaces.example.com",
    stopsIn: "23h 40m",
    stopsAt: minutesFromNow(23 * 60 + 40),
    usage: {
      cpu: { used: 1.6, total: 4, unit: "cores" },
      memory: { used: 5.2 * GB, total: 8 * GB, unit: "bytes" },
      disk: { used: 18.4 * GB, total: 50 * GB, unit: "bytes" },
    },
    apiStatus: "Up",
    version: "0.14.2",
    createdAt: minutesAgo(28 * 1440),
    lastActiveAt: minutesAgo(1),
  },
  {
    id: "ws_2b81d0e4",
    name: "research-lab",
    deployment: "local",
    runtime: "claude_code",
    status: "Running",
    owner: "ada",
    members: ["ada", "tomas", "lena"],
    description: "Local space on Ada's laptop for the engine, gateway and research.",
    host: "localhost:5002",
    provider: "Laptop",
    region: null,
    url: "http://localhost:5002",
    stopsIn: null,
    stopsAt: null,
    usage: {
      cpu: { used: 2.1, total: 10, unit: "cores" },
      memory: { used: 9.8 * GB, total: 32 * GB, unit: "bytes" },
      disk: { used: 212 * GB, total: 994 * GB, unit: "bytes" },
    },
    apiStatus: "Up",
    version: "0.14.2",
    createdAt: minutesAgo(41 * 1440),
    lastActiveAt: minutesAgo(2),
  },
  {
    id: "ws_c40e19aa",
    name: "billing-sandbox",
    deployment: "hosted",
    runtime: "codex",
    status: "Stopped",
    owner: "lena",
    members: ["lena", "kenji"],
    description: "Hosted sandbox for payment and invoice work.",
    host: "billing-sandbox.spaces.example.com",
    provider: "Docker",
    region: "eu-central-1",
    url: "https://billing-sandbox.spaces.example.com",
    stopsIn: null,
    stopsAt: null,
    usage: {
      cpu: { used: null, total: 2, unit: "cores" },
      memory: { used: null, total: 4 * GB, unit: "bytes" },
      disk: { used: 6.1 * GB, total: 20 * GB, unit: "bytes" },
    },
    apiStatus: "Down",
    version: "0.13.9",
    createdAt: minutesAgo(19 * 1440),
    lastActiveAt: minutesAgo(1405),
  },
  {
    id: "ws_e5d7b302",
    name: "demo-pilot",
    deployment: "hosted",
    runtime: "claude_code",
    status: "Starting",
    owner: "tomas",
    members: ["tomas", "mira"],
    description: "Hosted space for pilot walkthroughs with seeded demo data.",
    host: "demo-pilot.spaces.example.com",
    provider: "Vercel Sandbox",
    region: "iad1",
    url: "https://demo-pilot.spaces.example.com",
    stopsIn: null,
    stopsAt: null,
    usage: {
      cpu: { used: 0.4, total: 2, unit: "cores" },
      memory: { used: 0.6 * GB, total: 4 * GB, unit: "bytes" },
      disk: { used: 1.2 * GB, total: 10 * GB, unit: "bytes" },
    },
    apiStatus: "Unavailable",
    version: "0.14.2",
    createdAt: minutesAgo(6 * 1440),
    lastActiveAt: minutesAgo(1),
  },
];

export const SPACES: Space[] = RAW_SPACES.map((s) => ({
  ...s,
  projects: PROJECTS.filter((p) => p.spaceId === s.id).map((p) => p.id),
  lastActive: ago(s.lastActiveAt),
}));

export const SPACE_BY_ID: Record<string, Space> = Object.fromEntries(SPACES.map((s) => [s.id, s]));

/** The space most demos open into (local, Running). */
export const CURRENT_SPACE: Space = SPACE_BY_ID["ws_2b81d0e4"];

/* ======================================================================== */
/* Activity feed                                                             */
/* ======================================================================== */

export type ActivityType =
  | "session.started"
  | "session.ended"
  | "todo.completed"
  | "file.edited"
  | "peer.sync.applied"
  | "job.run"
  | "connector.polled";

export const ACTIVITY_META: Record<ActivityType, { label: string; tone: ToneToken; glyph: string }> = {
  "session.started": { label: "Session started", tone: "grn", glyph: "Play" },
  "session.ended": { label: "Session ended", tone: "ink-faint", glyph: "Square" },
  "todo.completed": { label: "Step completed", tone: "blu", glyph: "CircleCheck" },
  "file.edited": { label: "File edited", tone: "yel", glyph: "FilePen" },
  "peer.sync.applied": { label: "Peer sync applied", tone: "pur", glyph: "RefreshCw" },
  "job.run": { label: "Job ran", tone: "cyn", glyph: "Timer" },
  "connector.polled": { label: "Connector polled", tone: "org", glyph: "Plug" },
};

export type ActivityEvent = {
  id: string;
  ts: string;
  /** "09:02" */
  time: string;
  ago: string;
  type: ActivityType;
  label: string;
  projectId: string | null;
  runtime: RuntimeId | null;
  sessionId: string | null;
  /** person or runtime that did it */
  actor: string;
  detail: string;
};

const ACTIVITY_SEEDS: [number, ActivityType, string | null, string | null, string, string][] = [
  // min ago, type, project, session, actor, detail
  [2, "file.edited", "xo-space", "df1a1a5b", "Claude Code", "space_ui/components/status-pill.tsx"],
  [4, "todo.completed", "xo-space", "df1a1a5b", "Claude Code", "Read the current status pill"],
  [30, "connector.polled", null, null, "GitHub", "3 assigned issues, 1 review request"],
  [12, "file.edited", "galileo", null, "Ada Moreno", "telescope/telescope.js"],
  [14, "session.started", "ops-runbooks", "9d4c2f68", "Kenji Sato", "Incident: Slack connector needs attention"],
  [16, "peer.sync.applied", "xo-space", null, "Kenji Sato", "Applied 6 changes from Kenji Sato"],
  [18, "session.started", "xo-swarm", "a41f03be", "Kenji Sato", "Launchpad: retry failed space starts"],
  [20, "todo.completed", "xo-swarm", "a41f03be", "OpenClaw", "Read Coder start errors"],
  [24, "connector.polled", null, null, "Slack", "Sign-in expired. Needs attention"],
  [28, "todo.completed", "xo-space", "df1a1a5b", "Claude Code", "Agree on the acceptance criteria"],
  [15, "job.run", null, null, "Poll GitHub issues", "Failed: rate limited"],
  [35, "session.started", "telescope", "7c2e91d0", "Ada Moreno", "Bar UI: collapse sources on narrow screens"],
  [41, "file.edited", "telescope", "7c2e91d0", "Claude Code", "bar/sources.js"],
  [30, "job.run", null, null, "Sync peers", "OK in 6.8s"],
  [22, "todo.completed", "telescope", "7c2e91d0", "Claude Code", "Measure the bar at 390px"],
  [60, "connector.polled", null, null, "Linear", "2 issues assigned to you"],
  [76, "session.started", "xo-space", "df1a1a5b", "Ada Moreno", "Wire Space API status pill"],
  [95, "session.ended", "ops-runbooks", "c7a4e0f9", "OpenClaw", "Ended after 25m"],
  [110, "peer.sync.applied", "research-notes", null, "Lena Fischer", "Applied 3 changes from Lena Fischer"],
  [120, "session.started", "ops-runbooks", "c7a4e0f9", "Kenji Sato", "Runbook: rotate connector tokens"],
  [180, "session.ended", "galileo", "ses_9f1c2a", "Codex", "Ended after 1h 20m"],
  [200, "file.edited", "galileo", "ses_9f1c2a", "Codex", "gateway/router.js"],
  [260, "session.started", "galileo", "ses_9f1c2a", "Ada Moreno", "Give each source its own origin"],
  [296, "session.ended", "landing", "e19a7b33", "OpenClaw", "Ended after 44m"],
  [300, "todo.completed", "landing", "e19a7b33", "OpenClaw", "Check one primary CTA per page"],
  [340, "session.started", "landing", "e19a7b33", "Mira Okafor", "Pricing page: Get started CTA"],
  [450, "job.run", null, null, "Nightly tests", "OK in 41.2s, exit 0"],
  [470, "session.ended", "research-notes", "f0c5d218", "Claude Code", "Ended after 2h 10m"],
  [480, "todo.completed", "research-notes", "f0c5d218", "Claude Code", "Draft a summary of three papers"],
  [600, "session.started", "research-notes", "f0c5d218", "Ada Moreno", "Summarize verification papers"],
];

export const ACTIVITY: ActivityEvent[] = [...ACTIVITY_SEEDS]
  .sort((a, b) => a[0] - b[0])
  .map(([min, type, projectId, sessionId, actor, detail], i) => {
  const ts = minutesAgo(min);
  return {
    id: `ev_${String(i + 1).padStart(3, "0")}`,
    ts,
    time: formatTime(ts),
    ago: ago(ts),
    type,
    label: ACTIVITY_META[type].label,
    projectId,
    runtime: sessionId ? SESSION_BY_ID[sessionId].runtime : null,
    sessionId,
    actor,
    detail,
  };
});

/* ======================================================================== */
/* galileo sources                                                           */
/* ======================================================================== */

export const GALILEO = {
  name: "galileo",
  version: "v0",
  port: 4100,
  origin: "http://localhost:4100",
  pattern: "http://<name>.localhost:4100/",
};

/** A galileo source (not a telemetry source): a local port or a files path with its own origin. */
export type GalileoSource = {
  name: string;
  type: "port" | "files";
  port: number | null;
  path: string | null;
  kind: "folder" | "file" | null;
  url: string;
  up: boolean;
  detail: string;
  checkedAgo: string;
  projectId: string | null;
};

const src = (name: string) => `http://${name}.localhost:4100/`;

export const GALILEO_SOURCES: GalileoSource[] = [
  { name: "acme", type: "port", port: 4173, path: null, kind: null, url: src("acme"), up: true, detail: "Vite preview", checkedAgo: "just now", projectId: "landing" },
  { name: "space", type: "port", port: 5002, path: null, kind: null, url: src("space"), up: true, detail: "Space dashboard", checkedAgo: "just now", projectId: "xo-space" },
  { name: "docs", type: "port", port: 3001, path: null, kind: null, url: src("docs"), up: true, detail: "Docs dev server", checkedAgo: "1m ago", projectId: "xo-docs" },
  { name: "storybook", type: "port", port: 6006, path: null, kind: null, url: src("storybook"), up: false, detail: "Connection refused", checkedAgo: "1m ago", projectId: "telescope" },
  { name: "billing", type: "port", port: 8080, path: null, kind: null, url: src("billing"), up: false, detail: "Space is stopped", checkedAgo: "4m ago", projectId: "billing-api" },
  { name: "notes", type: "files", port: null, path: "~/notes", kind: "folder", url: src("notes"), up: true, detail: "212 files", checkedAgo: "just now", projectId: "research-notes" },
  { name: "shots", type: "files", port: null, path: "~/Desktop/shots", kind: "folder", url: src("shots"), up: true, detail: "38 images", checkedAgo: "2m ago", projectId: null },
  { name: "brief", type: "files", port: null, path: "~/projects/galileo/BRIEF.md", kind: "file", url: src("brief"), up: true, detail: "4.2 KB markdown", checkedAgo: "2m ago", projectId: "galileo" },
  { name: "archive", type: "files", port: null, path: "~/old/archive", kind: "folder", url: src("archive"), up: false, detail: "Path not found", checkedAgo: "6m ago", projectId: null },
];

/* ======================================================================== */
/* Connectors                                                                */
/* ======================================================================== */

export type ConnectorStatus =
  | "Not connected"
  | "Checking…"
  | "On in this space"
  | "Off in this space"
  | "Needs attention"
  | "Sign-in pending"
  | "Unavailable";

export const CONNECTOR_STATUS_META: Record<ConnectorStatus, { tone: ToneToken; action: string | null; pulse: boolean }> = {
  "Not connected": { tone: "ink-faint", action: "Connect", pulse: false },
  "Checking…": { tone: "blu", action: null, pulse: true },
  "On in this space": { tone: "grn", action: "Turn off", pulse: false },
  "Off in this space": { tone: "ink-dim", action: "Turn on", pulse: false },
  "Needs attention": { tone: "org", action: "Sign in again", pulse: false },
  "Sign-in pending": { tone: "yel", action: "Finish sign-in", pulse: true },
  Unavailable: { tone: "ink-faint", action: null, pulse: false },
};

export type Connector = {
  toolkit: string;
  displayName: string;
  description: string;
  auth: "OAuth" | "API key" | "QR pairing";
  status: ConnectorStatus;
  /** the connection's account; null when nothing is linked */
  account: string | null;
  pollEvery: string | null;
  collectors: string[];
  actions: string[];
  lastPolled: string | null;
  note: string | null;
  color: ToneToken;
  glyph: string;
};

export const CONNECTORS: Connector[] = [
  {
    toolkit: "github",
    displayName: "GitHub",
    description: "Issues, pull requests and review requests.",
    auth: "OAuth",
    status: "On in this space",
    account: "@ada-moreno",
    pollEvery: "15 min",
    collectors: ["Assigned issues", "Review requests"],
    actions: ["Open issue", "Comment", "Create branch"],
    lastPolled: "15m ago",
    note: "Last poll was rate limited. Next poll at 09:45.",
    color: "ink",
    glyph: "GitPullRequest",
  },
  {
    toolkit: "linear",
    displayName: "Linear",
    description: "Issues assigned to you and cycle progress.",
    auth: "OAuth",
    status: "On in this space",
    account: "ada@example.com",
    pollEvery: "15 min",
    collectors: ["My issues"],
    actions: ["Update status", "Comment"],
    lastPolled: "1h ago",
    note: null,
    color: "blu",
    glyph: "SquareKanban",
  },
  {
    toolkit: "slack",
    displayName: "Slack",
    description: "Mentions and alerts from chosen channels.",
    auth: "OAuth",
    status: "Needs attention",
    account: "#ops-alerts",
    pollEvery: "5 min",
    collectors: ["Mentions", "#ops-alerts"],
    actions: ["Post message"],
    lastPolled: "24m ago",
    note: "Sign-in expired. Sign in again to resume polling.",
    color: "pur",
    glyph: "Hash",
  },
  {
    toolkit: "gmail",
    displayName: "Gmail",
    description: "Unread mail from people you work with.",
    auth: "OAuth",
    status: "Off in this space",
    account: "dev@example.com",
    pollEvery: "15 min",
    collectors: ["Unread mail"],
    actions: ["Draft reply"],
    lastPolled: "2d ago",
    note: null,
    color: "red",
    glyph: "Mail",
  },
  {
    toolkit: "notion",
    displayName: "Notion",
    description: "Pages and databases shared with the space.",
    auth: "OAuth",
    status: "Sign-in pending",
    account: null,
    pollEvery: null,
    collectors: [],
    actions: ["Read pages"],
    lastPolled: null,
    note: "Finish signing in from the browser tab that opened.",
    color: "ink",
    glyph: "BookOpen",
  },
  {
    toolkit: "googledrive",
    displayName: "Google Drive",
    description: "Docs, sheets and files from a chosen folder.",
    auth: "OAuth",
    status: "Not connected",
    account: null,
    pollEvery: null,
    collectors: [],
    actions: ["Read files"],
    lastPolled: null,
    note: null,
    color: "yel",
    glyph: "HardDrive",
  },
  {
    toolkit: "whatsapp",
    displayName: "WhatsApp",
    description: "Messages to and from a paired phone.",
    auth: "QR pairing",
    status: "Checking…",
    account: "+1 555 0142",
    pollEvery: "1 min",
    collectors: ["Direct messages"],
    actions: ["Send message"],
    lastPolled: null,
    note: null,
    color: "grn",
    glyph: "MessageCircle",
  },
  {
    toolkit: "vercel",
    displayName: "Vercel",
    description: "Deployments and build logs.",
    auth: "API key",
    status: "Unavailable",
    account: null,
    pollEvery: null,
    collectors: [],
    actions: ["Read deployments"],
    lastPolled: null,
    note: "The connector service did not answer. Try again later.",
    color: "ink",
    glyph: "Triangle",
  },
];

/* ======================================================================== */
/* Usage (the token meter; never quirqs)                                     */
/* ======================================================================== */

export type UsageDay = {
  /** "2026-10-01" */
  date: string;
  /** "Thu 1 Oct" */
  label: string;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  /** USD */
  cost: number;
  messages: number;
  toolCalls: number;
  sessions: number;
  /** null on a telemetry gap; render "Unavailable" */
  latencyP50Ms: number | null;
  latencyP95Ms: number | null;
};

/** model mix for the 30-day window; shares sum to 1 */
const MODEL_MIX: [ModelId, RuntimeId, number][] = [
  ["claude-opus", "claude_code", 0.46],
  ["claude-sonnet", "claude_code", 0.27],
  ["gpt-5-codex", "codex", 0.14],
  ["gpt-5", "openclaw", 0.06],
  ["cursor-auto", "cursor", 0.04],
  ["claude-haiku", "claude_code", 0.03],
];

const BLENDED_PRICE = sum(MODEL_MIX.map(([m, , share]) => MODELS[m].pricePerMTok * share));

const DOW_FACTOR = [0.42, 1, 1.06, 1.1, 1.08, 0.97, 0.48]; // Sun..Sat
const USAGE_START_MS = Date.parse("2026-09-02T00:00:00Z");
/** day with no latency telemetry, to exercise the Unavailable state */
export const USAGE_GAP_DATE = "2026-09-14";

export const USAGE_DAILY: UsageDay[] = (() => {
  const rng = mulberry32(20261002);
  const out: UsageDay[] = [];
  for (let i = 0; i < 30; i++) {
    const ms = USAGE_START_MS + i * DAY;
    const iso = new Date(ms).toISOString();
    const date = iso.slice(0, 10);
    const dow = new Date(ms).getUTCDay();
    const trend = 0.78 + 0.44 * (i / 29);
    const tokens = Math.round(2_150_000 * trend * DOW_FACTOR[dow] * (0.86 + rng() * 0.28));
    const outputTokens = Math.round(tokens * (0.14 + rng() * 0.05));
    const messages = Math.round(tokens / (10_500 + rng() * 1500));
    const toolCalls = Math.round(messages * (1.6 + rng() * 0.7));
    const sessions = Math.max(1, Math.round(messages / (24 + rng() * 10)));
    const p50 = Math.round(2900 + rng() * 900 - (i / 29) * 300);
    const p95 = Math.round(p50 * (2.1 + rng() * 0.6));
    const gap = date === USAGE_GAP_DATE;
    out.push({
      date,
      label: formatDate(iso),
      tokens,
      inputTokens: tokens - outputTokens,
      outputTokens,
      cost: round2((tokens / 1_000_000) * BLENDED_PRICE),
      messages,
      toolCalls,
      sessions,
      latencyP50Ms: gap ? null : p50,
      latencyP95Ms: gap ? null : p95,
    });
  }
  return out;
})();

export type UsageRollup = {
  window: "7 days" | "30 days";
  from: string;
  to: string;
  tokens: number;
  cost: number;
  messages: number;
  toolCalls: number;
  sessions: number;
  /** mean of days with telemetry; days without it are excluded, not counted as zero */
  avgLatencyMs: number | null;
  p95LatencyMs: number | null;
  daysWithoutLatency: number;
  provenance: Provenance;
};

function rollup(days: UsageDay[], window: UsageRollup["window"]): UsageRollup {
  const lat = days.filter((d) => d.latencyP50Ms !== null);
  return {
    window,
    from: days[0].date,
    to: days[days.length - 1].date,
    tokens: sum(days.map((d) => d.tokens)),
    cost: round2(sum(days.map((d) => d.cost))),
    messages: sum(days.map((d) => d.messages)),
    toolCalls: sum(days.map((d) => d.toolCalls)),
    sessions: sum(days.map((d) => d.sessions)),
    avgLatencyMs: lat.length ? Math.round(sum(lat.map((d) => d.latencyP50Ms ?? 0)) / lat.length) : null,
    p95LatencyMs: lat.length ? Math.round(sum(lat.map((d) => d.latencyP95Ms ?? 0)) / lat.length) : null,
    daysWithoutLatency: days.length - lat.length,
    provenance: "mock",
  };
}

export const USAGE_SUMMARY: { "7 days": UsageRollup; "30 days": UsageRollup } = {
  "7 days": rollup(USAGE_DAILY.slice(-7), "7 days"),
  "30 days": rollup(USAGE_DAILY, "30 days"),
};

/** Previous 7 days, for week-over-week deltas. */
export const USAGE_PREVIOUS_7: UsageRollup = rollup(USAGE_DAILY.slice(-14, -7), "7 days");

export type UsageByModel = { model: ModelId; label: string; runtime: RuntimeId; tokens: number; cost: number; share: number; color: ColorToken };

export const USAGE_BY_MODEL: UsageByModel[] = MODEL_MIX.map(([model, runtime, share]) => {
  const tokens = Math.round(USAGE_SUMMARY["30 days"].tokens * share);
  return { model, label: MODELS[model].label, runtime, tokens, cost: round2((tokens / 1_000_000) * MODELS[model].pricePerMTok), share, color: MODELS[model].color };
});

export type UsageByRuntime = { runtime: RuntimeId; label: string; tokens: number; cost: number; sessions: number; share: number; color: ColorToken };

export const USAGE_BY_RUNTIME: UsageByRuntime[] = (
  [
    ["claude_code", 0.58],
    ["openclaw", 0.22],
    ["codex", 0.16],
    ["cursor", 0.04],
  ] as const
).map(([runtime, share]) => {
  const total = USAGE_SUMMARY["30 days"];
  return {
    runtime,
    label: RUNTIME_BY_ID[runtime].label,
    tokens: Math.round(total.tokens * share),
    cost: round2(total.cost * share),
    sessions: Math.round(total.sessions * share),
    share,
    color: RUNTIME_BY_ID[runtime].color,
  };
});

const HOUR_SHAPE = [0.05, 0.03, 0.02, 0.02, 0.03, 0.06, 0.12, 0.25, 0.55, 0.85, 1, 0.95, 0.7, 0.85, 0.95, 0.9, 0.8, 0.6, 0.42, 0.3, 0.22, 0.16, 0.1, 0.07];

/** Messages per hour of day (UTC) for each weekday, Mon first. 7 rows x 24 columns. */
export const USAGE_HEATMAP: { days: string[]; hours: number[]; values: number[][]; max: number; unit: string } = (() => {
  const rng = mulberry32(724);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dowIndex = [1, 2, 3, 4, 5, 6, 0];
  const values = days.map((_, r) => HOUR_SHAPE.map((h) => Math.round(42 * h * DOW_FACTOR[dowIndex[r]] * (0.7 + rng() * 0.6))));
  return { days, hours: HOUR_SHAPE.map((_, i) => i), values, max: Math.max(...values.flat()), unit: "messages" };
})();

/* ======================================================================== */
/* quirq readings (units of work) and portfolio windows                      */
/* ======================================================================== */

/** V below this counts as an intervention for IR. */
export const QUIRQ_THRESHOLD = 0.7;
export const QUIRQ_METHOD = "v0 · weighted checks on before and after snapshots";
export const QUIRQ_UNAVAILABLE_NOTE = "No quirq measurement is available for this work.";

export type EvidenceCheck = {
  id: string;
  label: string;
  weight: number;
  /** null when the check did not run */
  passed: boolean | null;
  detail: string;
};

export type QuirqReading = {
  unitId: string;
  title: string;
  projectId: string;
  owner: PersonId;
  sessionIds: string[];
  /** potential quirqs set by the owner before work ran */
  budgetB: number;
  /** verified completion 0..1; null when unavailable */
  completionV: number | null;
  /** minted Q = V · B; null when unavailable */
  mintedQ: number | null;
  method: string;
  evidence: EvidenceCheck[];
  /** USD from the usage meter, separate from quirqs */
  costTotal: number | null;
  availability: Availability;
  provenance: Provenance;
  belowThreshold: boolean | null;
  note: string | null;
  measuredAt: string;
  measured: string;
};

type ReadingSeed = {
  unitId: string;
  title: string;
  projectId: string;
  owner: PersonId;
  sessionIds: string[];
  budgetB: number;
  provenance: Provenance;
  measuredMinAgo: number;
  checks: [string, number, boolean | null, string][] | null;
};

const READING_SEEDS: ReadingSeed[] = [
  {
    unitId: "uow_118",
    title: "Status pill shows Unavailable when the API is down",
    projectId: "xo-space",
    owner: "ada",
    sessionIds: ["df1a1a5b"],
    budgetB: 40,
    provenance: "mock",
    measuredMinAgo: 3,
    checks: [
      ["Pill reads Unavailable when the API is down", 0.4, true, "Snapshot after shows the word, before showed 0"],
      ["No zero shown for a missing measurement", 0.25, true, "Searched rendered output for a bare 0"],
      ["Focus ring visible on the pill", 0.2, true, "Keyboard pass in the after snapshot"],
      ["Status tests pass", 0.15, false, "13 of 14 passed"],
    ],
  },
  {
    unitId: "uow_119",
    title: "Webhook retries for invoices",
    projectId: "billing-api",
    owner: "lena",
    sessionIds: ["6b1d8e07"],
    budgetB: 25,
    provenance: "mock",
    measuredMinAgo: 9200,
    checks: [
      ["Retries back off", 0.3, true, "Delays 1s, 4s, 16s"],
      ["Stops after five attempts", 0.3, true, "Sixth attempt not sent"],
      ["Failed invoices flagged for a person", 0.4, false, "No flag in the after snapshot"],
    ],
  },
  {
    unitId: "uow_120",
    title: "Bar collapses sources on narrow screens",
    projectId: "telescope",
    owner: "ada",
    sessionIds: ["7c2e91d0"],
    budgetB: 12,
    provenance: "illustrative",
    measuredMinAgo: 1,
    checks: [
      ["No horizontal overflow at 390px", 0.5, true, "Measured 0px overflow"],
      ["Menu opens with Enter and closes with Escape", 0.3, true, "Keyboard pass"],
      ["Source status dots stay visible", 0.2, true, "Dots present in the menu"],
    ],
  },
  {
    unitId: "uow_121",
    title: "Give each source its own origin",
    projectId: "galileo",
    owner: "ada",
    sessionIds: ["ses_9f1c2a"],
    budgetB: 30,
    provenance: "live",
    measuredMinAgo: 175,
    checks: null,
  },
  {
    unitId: "uow_122",
    title: "Pricing page: Get started CTA",
    projectId: "landing",
    owner: "mira",
    sessionIds: ["e19a7b33"],
    budgetB: 8,
    provenance: "mock",
    measuredMinAgo: 290,
    checks: [
      ["Deploy rung reads Get started", 0.5, true, "Copy diff"],
      ["One primary CTA per page", 0.4, true, "Counted white pills per page"],
      ["Sentence case on plan names", 0.1, false, "One Title Case heading left"],
    ],
  },
  {
    unitId: "uow_123",
    title: "Summary of three verification papers",
    projectId: "research-notes",
    owner: "ada",
    sessionIds: ["f0c5d218"],
    budgetB: 20,
    provenance: "mock",
    measuredMinAgo: 460,
    checks: [
      ["Three summaries present", 0.5, true, "Three files in notes/papers"],
      ["Each summary under 300 words", 0.25, true, "Longest is 274 words"],
      ["Method cited for each paper", 0.25, false, "Citations pending"],
    ],
  },
  {
    unitId: "uow_124",
    title: "Launchpad: retry failed space starts",
    projectId: "xo-swarm",
    owner: "kenji",
    sessionIds: ["a41f03be"],
    budgetB: 35,
    provenance: "mock",
    measuredMinAgo: 1,
    checks: [
      ["Retries three times with backoff", 0.4, true, "Seen in run log"],
      ["Shows Space could not start after the last attempt", 0.35, false, "Still shows a spinner"],
      ["Technical details link opens the log", 0.25, null, "Check did not run"],
    ],
  },
  {
    unitId: "uow_125",
    title: "Orbit map: smoother camera easing",
    projectId: "space-drift",
    owner: "tomas",
    sessionIds: ["3d9e6a12"],
    budgetB: 15,
    provenance: "mock",
    measuredMinAgo: 1230,
    checks: null,
  },
];

export const QUIRQ_READINGS: QuirqReading[] = READING_SEEDS.map((r) => {
  const costTotal = round2(sum(r.sessionIds.map((id) => SESSION_BY_ID[id]?.cost ?? 0)));
  const measuredAt = minutesAgo(r.measuredMinAgo);
  const base = {
    unitId: r.unitId,
    title: r.title,
    projectId: r.projectId,
    owner: r.owner,
    sessionIds: r.sessionIds,
    budgetB: r.budgetB,
    method: QUIRQ_METHOD,
    costTotal,
    provenance: r.provenance,
    measuredAt,
    measured: ago(measuredAt),
  };
  if (!r.checks) {
    return { ...base, completionV: null, mintedQ: null, evidence: [], availability: "Unavailable" as const, belowThreshold: null, note: QUIRQ_UNAVAILABLE_NOTE };
  }
  const evidence = r.checks.map(([label, weight, passed, detail], i) => ({ id: `${r.unitId}_c${i + 1}`, label, weight, passed, detail }));
  const completionV = round2(sum(evidence.filter((c) => c.passed === true).map((c) => c.weight)) / sum(evidence.map((c) => c.weight)));
  return {
    ...base,
    completionV,
    mintedQ: round1(completionV * r.budgetB),
    evidence,
    availability: "Available" as const,
    belowThreshold: completionV < QUIRQ_THRESHOLD,
    note: null,
  };
});

export type PortfolioWindow = {
  id: string;
  /** always shown with the numbers */
  window: string;
  windowDays: number;
  units: number;
  unitsUnavailable: number;
  potentialB: number;
  mintedQ: number;
  /** USD from the usage meter */
  totalCost: number;
  /** quirq efficiency ratio: quirqs per USD of total cost */
  QER: number;
  /** quirq velocity: quirqs per week, averaged over the window */
  QV: number;
  QVUnit: "quirqs/week";
  /** intervention rate: share of measured units with V below QUIRQ_THRESHOLD */
  IR: number;
  method: string;
  provenance: Provenance;
};

const measuredReadings = QUIRQ_READINGS.filter((r) => r.availability === "Available");
const recentQ = round1(sum(measuredReadings.map((r) => r.mintedQ ?? 0)));
const recentCost = round2(sum(measuredReadings.map((r) => r.costTotal ?? 0)));

export const PORTFOLIO_WINDOWS: PortfolioWindow[] = [
  {
    id: "pw_7d",
    window: `7 days to ${TODAY_LABEL}`,
    windowDays: 7,
    units: QUIRQ_READINGS.length,
    unitsUnavailable: QUIRQ_READINGS.length - measuredReadings.length,
    potentialB: sum(measuredReadings.map((r) => r.budgetB)),
    mintedQ: recentQ,
    totalCost: recentCost,
    QER: round1(recentQ / recentCost),
    QV: recentQ,
    QVUnit: "quirqs/week",
    IR: round2(measuredReadings.filter((r) => r.belowThreshold).length / measuredReadings.length),
    method: QUIRQ_METHOD,
    provenance: "mock",
  },
  {
    id: "pw_30d",
    window: `30 days to ${TODAY_LABEL}`,
    windowDays: 30,
    units: 64,
    unitsUnavailable: 9,
    potentialB: 960,
    mintedQ: 742,
    totalCost: 412,
    QER: round1(742 / 412),
    QV: round1((742 / 30) * 7),
    QVUnit: "quirqs/week",
    IR: 0.08,
    method: QUIRQ_METHOD,
    provenance: "mock",
  },
  {
    id: "pw_june",
    window: "June 2026",
    windowDays: 30,
    units: 1240,
    unitsUnavailable: 0,
    potentialB: 41300,
    mintedQ: 38000,
    totalCost: 6830,
    QER: round1(38000 / 6830),
    QV: Math.round((38000 / 30) * 7),
    QVUnit: "quirqs/week",
    IR: 0.06,
    method: QUIRQ_METHOD,
    provenance: "illustrative",
  },
];

/** Minted quirqs per day for the 30-day window (mock), aligned with USAGE_DAILY dates. */
export const QUIRQ_DAILY: { date: string; label: string; mintedQ: number | null }[] = (() => {
  const series = seededSeries(31337, 30, 10, 42, 1);
  return USAGE_DAILY.map((d, i) => ({ date: d.date, label: d.label, mintedQ: d.date === USAGE_GAP_DATE ? null : series[i] }));
})();

/** Hours-back calculator (Machine Speed). Hours, not quirqs. Illustrative. */
export const HOURS_BACK_DEFAULTS = {
  title: "Hours-back calculator (Machine Speed)",
  hoursPerWeek: 15,
  automationShare: 0.64,
  resultHours: round1(15 * 0.64),
  provenance: "illustrative" as Provenance,
};

/* ======================================================================== */
/* Inbox                                                                     */
/* ======================================================================== */

export type InboxStatus = "new" | "seen" | "done";

export type InboxItem = {
  id: string;
  kind:
    | "session.started"
    | "session.ended"
    | "github.review_requested"
    | "linear.assigned"
    | "gmail.unread"
    | "connector.attention"
    | "job.failed"
    | "share.received"
    | "todo.blocked"
    | "agent.post";
  source: "timeline" | "connections" | "jobs" | "sharing";
  status: InboxStatus;
  projectId: string | null;
  title: string;
  detail: string;
  actor: string;
  ts: string;
  ago: string;
  glyph: string;
};

const INBOX_SEEDS: Omit<InboxItem, "ts" | "ago">[] = [
  { id: "ib_01", kind: "github.review_requested", source: "connections", status: "new", projectId: "galileo", title: "Review requested: galileo #15", detail: "Files source: show folder listing", actor: "Kenji Sato", glyph: "GitPullRequest" },
  { id: "ib_02", kind: "session.started", source: "timeline", status: "new", projectId: "ops-runbooks", title: "Session started in ops-runbooks (OpenClaw)", detail: "Incident: Slack connector needs attention", actor: "Kenji Sato", glyph: "Play" },
  { id: "ib_03", kind: "job.failed", source: "jobs", status: "new", projectId: null, title: "Poll GitHub issues failed", detail: "Rate limited. Next run in 15m.", actor: "Jobs", glyph: "TriangleAlert" },
  { id: "ib_04", kind: "connector.attention", source: "connections", status: "new", projectId: null, title: "Slack needs attention", detail: "Sign in again to resume polling.", actor: "Slack", glyph: "Hash" },
  { id: "ib_05", kind: "linear.assigned", source: "connections", status: "new", projectId: "xo-space", title: "2 issues assigned to you in Linear", detail: "Status pill copy, Projects empty state", actor: "Linear", glyph: "SquareKanban" },
  { id: "ib_06", kind: "share.received", source: "sharing", status: "new", projectId: "research-notes", title: "Lena Fischer shared research-notes with you", detail: "Role: collaborator", actor: "Lena Fischer", glyph: "UserPlus" },
  { id: "ib_07", kind: "session.ended", source: "timeline", status: "seen", projectId: "galileo", title: "Session ended in galileo (Codex)", detail: "Give each source its own origin · 1h 20m", actor: "Codex", glyph: "Square" },
  { id: "ib_08", kind: "agent.post", source: "timeline", status: "seen", projectId: "landing", title: "OpenClaw posted a summary in landing", detail: "Renamed Deploy to Get started on pricing.", actor: "OpenClaw", glyph: "Bot" },
  { id: "ib_09", kind: "todo.blocked", source: "timeline", status: "seen", projectId: "billing-api", title: "Step blocked in billing-api", detail: "Reconcile June invoices: waiting on the June export", actor: "Codex", glyph: "CircleSlash" },
  { id: "ib_10", kind: "gmail.unread", source: "connections", status: "done", projectId: null, title: "3 new from Gmail", detail: "From Imani Brooks and 2 others", actor: "Gmail", glyph: "Mail" },
];

const INBOX_MIN = [30, 14, 15, 24, 60, 110, 180, 290, 1420, 2 * 1440 + 30];

export const INBOX: InboxItem[] = INBOX_SEEDS.map((item, i) => {
  const ts = minutesAgo(INBOX_MIN[i]);
  return { ...item, ts, ago: ago(ts) };
}).sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));

export const INBOX_NEW_COUNT = INBOX.filter((i) => i.status === "new").length;

/* ======================================================================== */
/* Jobs and runs                                                             */
/* ======================================================================== */

export type RunStatus = "ok" | "failed" | "running" | "skipped";

export type JobRun = {
  id: string;
  jobId: string;
  status: RunStatus;
  trigger: "schedule" | "manual";
  startedAt: string;
  started: string;
  /** null while running or when skipped */
  durationSec: number | null;
  duration: string | null;
  exit: number | null;
  reason: string | null;
  output: string;
};

export type Job = {
  id: string;
  name: string;
  schedule: string;
  cron: string;
  command: string[];
  enabled: boolean;
  projectId: string | null;
  nextRunAt: string | null;
  /** "Sat 3 Oct, 02:00" */
  nextRun: string | null;
  lastResult: { status: RunStatus; duration: string | null; exit: number | null; reason: string | null; ago: string } | null;
};

const RUN_SEEDS: [string, string, RunStatus, number, number | null, number | null, string | null, string, "schedule" | "manual"][] = [
  // id, job, status, started min ago, duration s, exit, reason, output
  ["run_301", "job_poll_github", "running", 0, null, null, null, "Polling quirq-ai/* for assigned issues…", "schedule"],
  ["run_300", "job_poll_github", "failed", 15, 2.4, 1, "rate_limited", "GitHub answered 403: secondary rate limit. Retrying next run.", "schedule"],
  ["run_299", "job_sync_peers", "ok", 30, 6.8, 0, null, "Applied 6 changes from 1 peer.", "schedule"],
  ["run_298", "job_poll_github", "ok", 30, 3.1, 0, null, "3 assigned issues, 1 review request.", "schedule"],
  ["run_297", "job_poll_github", "ok", 45, 2.9, 0, null, "3 assigned issues, 0 review requests.", "schedule"],
  ["run_296", "job_sync_peers", "ok", 90, 4.2, 0, null, "No changes.", "schedule"],
  ["run_295", "job_backup", "ok", 360, 134, 0, null, "Backed up 11 projects, 1.2 GB.", "schedule"],
  ["run_294", "job_nightly", "ok", 450, 41.2, 0, null, "132 passed in 41.2s.", "schedule"],
  ["run_293", "job_nightly", "ok", 450 + 1440, 39.8, 0, null, "132 passed in 39.8s.", "schedule"],
  ["run_292", "job_nightly", "ok", 450 + 2 * 1440, 40.5, 0, null, "131 passed in 40.5s.", "schedule"],
  ["run_291", "job_nightly", "failed", 450 + 3 * 1440, 37.1, 1, "tests_failed", "1 failed: engine/test_sessions.py::test_codex_mapping", "schedule"],
  ["run_290", "job_nightly", "ok", 450 + 3 * 1440 - 95, 40.9, 0, null, "131 passed in 40.9s.", "manual"],
  ["run_289", "job_weekly_report", "skipped", 4 * 1440 + 90, null, null, "disabled", "Job is turned off.", "schedule"],
];

export const JOB_RUNS: JobRun[] = RUN_SEEDS.map(([id, jobId, status, min, dur, exit, reason, output, trigger]) => {
  const startedAt = minutesAgo(min);
  return {
    id,
    jobId,
    status,
    trigger,
    startedAt,
    started: ago(startedAt),
    durationSec: dur,
    duration: dur === null ? null : formatDuration(dur),
    exit,
    reason,
    output,
  };
});

const JOB_SEEDS: Omit<Job, "nextRun" | "lastResult">[] = [
  { id: "job_nightly", name: "Nightly tests", schedule: "Every day at 02:00", cron: "0 2 * * *", command: ["pnpm", "test"], enabled: true, projectId: "xo-space", nextRunAt: "2026-10-03T02:00:00Z" },
  { id: "job_poll_github", name: "Poll GitHub issues", schedule: "Every 15 min", cron: "*/15 * * * *", command: ["xo", "connectors", "poll", "github"], enabled: true, projectId: null, nextRunAt: "2026-10-02T09:45:00Z" },
  { id: "job_sync_peers", name: "Sync peers", schedule: "Every hour", cron: "0 * * * *", command: ["xo", "sync", "--peers"], enabled: true, projectId: null, nextRunAt: "2026-10-02T10:00:00Z" },
  { id: "job_backup", name: "Back up projects", schedule: "Every day at 03:30", cron: "30 3 * * *", command: ["xo", "backup", "--all"], enabled: true, projectId: null, nextRunAt: "2026-10-03T03:30:00Z" },
  { id: "job_weekly_report", name: "Weekly usage report", schedule: "Mondays at 08:00", cron: "0 8 * * 1", command: ["xo", "usage", "report", "--week"], enabled: false, projectId: null, nextRunAt: null },
];

export const JOBS: Job[] = JOB_SEEDS.map((j) => {
  const last = JOB_RUNS.find((r) => r.jobId === j.id && r.status !== "running") ?? null;
  return {
    ...j,
    nextRun: j.nextRunAt ? formatDateTime(j.nextRunAt) : null,
    lastResult: last ? { status: last.status, duration: last.duration, exit: last.exit, reason: last.reason, ago: last.started } : null,
  };
});

/* ======================================================================== */
/* Secrets (masked placeholders only)                                        */
/* ======================================================================== */

export type SecretStatus = "Set" | "Not set" | "Needs attention";

export type Secret = {
  name: string;
  /** masked placeholder; never a real value */
  masked: string | null;
  scope: "space" | "project";
  projectId: string | null;
  usedBy: string[];
  status: SecretStatus;
  updated: string | null;
};

export const SECRETS: Secret[] = [
  { name: "ANTHROPIC_API_KEY", masked: "sk-…f3a9", scope: "space", projectId: null, usedBy: ["Claude Code", "OpenClaw"], status: "Set", updated: "12d ago" },
  { name: "OPENAI_API_KEY", masked: "sk-…7b2e", scope: "space", projectId: null, usedBy: ["Codex"], status: "Set", updated: "12d ago" },
  { name: "GITHUB_TOKEN", masked: "ghp_…c41d", scope: "space", projectId: null, usedBy: ["GitHub connector"], status: "Set", updated: "3d ago" },
  { name: "LINEAR_API_KEY", masked: "lin_…09fa", scope: "space", projectId: null, usedBy: ["Linear connector"], status: "Set", updated: "8d ago" },
  { name: "SLACK_BOT_TOKEN", masked: "xoxb-…5e10", scope: "space", projectId: null, usedBy: ["Slack connector"], status: "Needs attention", updated: "41d ago" },
  { name: "DATABASE_URL", masked: "postgres://…@db.example.com:5432/billing", scope: "project", projectId: "billing-api", usedBy: ["billing-api"], status: "Set", updated: "19d ago" },
  { name: "PAYMENTS_TEST_KEY", masked: "sk_test_…8c3d", scope: "project", projectId: "billing-api", usedBy: ["billing-api"], status: "Set", updated: "19d ago" },
  { name: "GEMINI_API_KEY", masked: null, scope: "space", projectId: null, usedBy: ["Gemini CLI"], status: "Not set", updated: null },
];

/* ======================================================================== */
/* Billing and pricing                                                       */
/* ======================================================================== */

export type SubscriptionState = "Trial active" | "Active" | "Payment overdue" | "Canceled";

const TRIAL_ENDS_AT = "2026-10-16T00:00:00Z";
const NEXT_INVOICE_AT = "2026-11-01T00:00:00Z";

export const SUBSCRIPTION_STATE_META: Record<SubscriptionState, { tone: ToneToken; blurb: string }> = {
  "Trial active": { tone: "blu", blurb: `Your trial ends ${formatDate(TRIAL_ENDS_AT)}. Add a payment method to keep hosted spaces running.` },
  Active: { tone: "grn", blurb: `Renews ${formatDate(NEXT_INVOICE_AT)}.` },
  "Payment overdue": { tone: "org", blurb: "Payment needs attention. Update your card to keep hosted spaces running." },
  Canceled: { tone: "ink-faint", blurb: "Hosted spaces stop at the end of the period. Local spaces keep working." },
};

export type Invoice = {
  id: string;
  number: string;
  period: string;
  issuedAt: string;
  issued: string;
  /** USD */
  amount: number;
  status: "Paid" | "Open" | "Overdue" | "Void";
};

export const INVOICES: Invoice[] = (
  [
    ["in_0009", "INV-2026-0009", "Oct 2026", "2026-10-01T00:00:00Z", 98, "Open"],
    ["in_0008", "INV-2026-0008", "Sep 2026", "2026-09-01T00:00:00Z", 98, "Paid"],
    ["in_0007", "INV-2026-0007", "Aug 2026", "2026-08-01T00:00:00Z", 147, "Paid"],
    ["in_0006", "INV-2026-0006", "Jul 2026", "2026-07-01T00:00:00Z", 147, "Paid"],
    ["in_0005", "INV-2026-0005", "Jun 2026", "2026-06-01T00:00:00Z", 49, "Void"],
    ["in_0004", "INV-2026-0004", "May 2026", "2026-05-01T00:00:00Z", 49, "Paid"],
  ] as const
).map(([id, number, period, issuedAt, amount, status]) => ({ id, number, period, issuedAt, issued: formatDate(issuedAt, { withYear: true }), amount, status }));

export type Billing = {
  plan: "Open source" | "Managed" | "Enterprise";
  pricePerSpace: number;
  interval: "month";
  state: SubscriptionState;
  trialEndsAt: string | null;
  trialEnds: string | null;
  trialDaysLeft: number | null;
  spacesIncluded: number;
  spacesRunning: number;
  seats: number;
  amountDue: number;
  nextInvoiceAt: string;
  nextInvoice: string;
  billingEmail: string;
  /** Visa test card number ending 4242, never a real card */
  paymentMethod: { brand: "Visa"; last4: "4242"; expMonth: number; expYear: number; holder: string; label: "Test card" } | null;
  invoices: Invoice[];
  provenance: Provenance;
};

export const BILLING: Billing = {
  plan: "Managed",
  pricePerSpace: 49,
  interval: "month",
  state: "Trial active",
  trialEndsAt: TRIAL_ENDS_AT,
  trialEnds: formatDate(TRIAL_ENDS_AT),
  trialDaysLeft: 14,
  spacesIncluded: 3,
  spacesRunning: SPACES.filter((s) => s.deployment === "hosted" && s.status === "Running").length,
  seats: 5,
  amountDue: 98,
  nextInvoiceAt: NEXT_INVOICE_AT,
  nextInvoice: formatDate(NEXT_INVOICE_AT),
  billingEmail: "billing@example.com",
  paymentMethod: { brand: "Visa", last4: "4242", expMonth: 12, expYear: 2028, holder: "Ada Moreno", label: "Test card" },
  invoices: INVOICES,
  provenance: "mock",
};

/** Same account, payment failed. */
export const BILLING_OVERDUE: Billing = {
  ...BILLING,
  state: "Payment overdue",
  trialEndsAt: null,
  trialEnds: null,
  trialDaysLeft: null,
  invoices: INVOICES.map((inv) => (inv.id === "in_0009" ? { ...inv, status: "Overdue" as const } : inv)),
};

/** Result screens: sentence case, no exclamation marks. */
export const BILLING_RESULTS = {
  subscriptionStarted: { title: "Subscription started", body: "Managed plan is active. Hosted spaces keep running.", tone: "grn" as ToneToken },
  paymentFailed: { title: "Payment failed", body: "Payment needs attention. Your card was declined; try another card.", tone: "org" as ToneToken },
  paymentMethodAdded: { title: "Payment method added", body: "Visa ending 4242 (test card) is now the default.", tone: "grn" as ToneToken },
};

export type PricingPlan = {
  id: "open-source" | "managed" | "enterprise";
  name: "Open source" | "Managed" | "Enterprise";
  /** blue = open source, green = managed, orange = enterprise */
  color: ColorToken;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: { label: string; kind: "primary" | "ghost"; external: boolean };
  highlighted: boolean;
};

export const PRICING_NOTE = "Illustrative pricing for the shapes catalog.";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "open-source",
    name: "Open source",
    color: "blu",
    price: "$0",
    cadence: "Free, self-hosted",
    tagline: "Run XO Space on your own machine.",
    features: ["Engine, Space API and Space dashboard", "Claude Code, Codex and OpenClaw runtimes", "Local projects, sessions and steps", "Community support"],
    cta: { label: "Read the install guide", kind: "ghost", external: true },
    highlighted: false,
  },
  {
    id: "managed",
    name: "Managed",
    color: "grn",
    price: "$49",
    cadence: "per space per month",
    tagline: "Hosted spaces that XO Swarm launches and manages.",
    features: ["Everything in Open source", "Hosted spaces with auto-stop", "Connectors with scheduled polling", "Usage and cost telemetry", "Email support"],
    cta: { label: "Get started", kind: "primary", external: false },
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    color: "org",
    price: "Custom",
    cadence: "annual agreement",
    tagline: "Private hosting, SSO and a Machine Speed build team.",
    features: ["Everything in Managed", "Bring your own cloud", "SSO and audit log", "quirq measurement with owner budgets", "Named support"],
    cta: { label: "Talk to us", kind: "ghost", external: false },
    highlighted: false,
  },
];

/* ======================================================================== */
/* File tree and file samples                                                */
/* ======================================================================== */

export type GitStatus = "modified" | "added" | "untracked" | "deleted" | "renamed" | null;

export type FileNode = {
  name: string;
  path: string;
  type: "folder" | "file";
  /** bytes; folders sum their children */
  size: number;
  language: string | null;
  git: GitStatus;
  children?: FileNode[];
};

type TreeSeed = string | [string, number, string | null, GitStatus?] | { dir: string; items: TreeSeed[] };

function buildTree(items: TreeSeed[], parent: string): FileNode[] {
  return items.map((it) => {
    if (typeof it === "object" && !Array.isArray(it)) {
      const path = `${parent}${it.dir}/`;
      const children = buildTree(it.items, path);
      const changed = children.some((c) => c.git !== null);
      return { name: it.dir, path, type: "folder" as const, size: sum(children.map((c) => c.size)), language: null, git: changed ? ("modified" as const) : null, children };
    }
    const [name, size, language, git] = typeof it === "string" ? [it, 0, null, null] : it;
    return { name, path: `${parent}${name}`, type: "file" as const, size, language, git: git ?? null };
  });
}

/** xo-space project tree (a sample of its 83 files). Folders with a changed child show "modified". */
const FILE_TREE_CHILDREN: FileNode[] = buildTree(
    [
      { dir: ".github", items: [{ dir: "workflows", items: [["ci.yml", 1240, "yaml"]] }] },
      {
        dir: "docs",
        items: [
          ["architecture.md", 8420, "markdown"],
          ["vocabulary.md", 5130, "markdown", "modified"],
        ],
      },
      {
        dir: "engine",
        items: [
          ["__init__.py", 112, "python"],
          ["sessions.py", 14280, "python"],
          ["todos.py", 6904, "python"],
          {
            dir: "runtimes",
            items: [
              ["claude_code.py", 9310, "python"],
              ["codex.py", 8122, "python"],
              ["openclaw.py", 7645, "python"],
            ],
          },
        ],
      },
      {
        dir: "space_ui",
        items: [
          { dir: "app", items: [["layout.tsx", 1480, "typescript"], ["page.tsx", 3920, "typescript"]] },
          {
            dir: "components",
            items: [
              ["project-card.tsx", 4210, "typescript"],
              ["session-list.tsx", 5876, "typescript", "modified"],
              ["status-pill.tsx", 1932, "typescript", "modified"],
            ],
          },
          {
            dir: "lib",
            items: [
              ["api.ts", 2788, "typescript"],
              ["status.ts", 1184, "typescript", "added"],
            ],
          },
        ],
      },
      { dir: "reports", items: [["usage-sept.csv", 2210, "csv"]] },
      {
        dir: "tests",
        items: [
          ["test_sessions.py", 7710, "python"],
          ["status.test.ts", 2468, "typescript", "untracked"],
        ],
      },
      [".env.example", 214, "dotenv"],
      ["AGENTS.md", 3302, "markdown"],
      ["README.md", 1046, "markdown"],
      ["package.json", 742, "json"],
      ["pyproject.toml", 618, "toml"],
    ],
    "",
);

export const FILE_TREE: FileNode = {
  name: "xo-space",
  path: "",
  type: "folder",
  size: sum(FILE_TREE_CHILDREN.map((c) => c.size)),
  language: null,
  git: "modified",
  children: FILE_TREE_CHILDREN,
};

/** Depth-first list of every node with its depth, for flat tree renderers. */
export function flattenTree(node: FileNode, depth = 0): { node: FileNode; depth: number }[] {
  const out: { node: FileNode; depth: number }[] = [];
  for (const child of node.children ?? []) {
    out.push({ node: child, depth });
    if (child.children) out.push(...flattenTree(child, depth + 1));
  }
  return out;
}

export type FileSample = { path: string; language: "markdown" | "typescript" | "json" | "csv"; size: number; content: string };

const README_MD = [
  "# xo-space",
  "",
  "Open-source environment software for XO: the engine, the Space API and the Space dashboard that run a space on your machine.",
  "",
  "## Quick start",
  "",
  "```sh",
  "pnpm install",
  "pnpm dev",
  "```",
  "",
  "The Space dashboard opens at http://localhost:5002.",
  "",
  "## What runs inside a space",
  "",
  "- **Projects**: folders with files, maintained context and optional Git history.",
  "- **Sessions**: agent conversations brokered to Claude Code, Codex or OpenClaw.",
  "- **Connectors**: GitHub, Linear and Slack, polled on a schedule you choose.",
  "",
  "## Space status",
  "",
  "| Status | Meaning |",
  "| --- | --- |",
  "| Starting | The runtime is starting and the Space API is not up yet. |",
  "| Running | The space is up and the Space API answers. |",
  "| Stopped | Nothing is running. Files stay on disk. |",
  "",
  "> A missing measurement reads Unavailable, never zero.",
  "",
].join("\n");

const STATUS_TS = [
  'export type SpaceStatus = "Creating" | "Starting" | "Running" | "Stopping" | "Stopped";',
  "",
  "export type ApiReading =",
  "  | { ok: true; status: SpaceStatus; cpu: number | null }",
  "  | { ok: false; error: string };",
  "",
  "/** Words the status pill shows for a Space API reading. */",
  "export function pillLabel(reading: ApiReading | undefined): string {",
  '  if (!reading || !reading.ok) return "Unavailable";',
  "  return reading.status;",
  "}",
  "",
  "/** CPU share as a percent, or Unavailable. Never a bare zero. */",
  "export function cpuLabel(reading: ApiReading | undefined): string {",
  '  if (!reading || !reading.ok || reading.cpu === null) return "Unavailable";',
  "  return `${Math.round(reading.cpu * 100)}%`;",
  "}",
  "",
].join("\n");

const PACKAGE_JSON = JSON.stringify(
  {
    name: "xo-space",
    version: "0.14.2",
    private: true,
    scripts: { dev: "next dev --port 5002", build: "next build", test: "vitest run", engine: "python -m engine" },
    dependencies: { next: "16.3.6", react: "19.3.0", "react-dom": "19.3.0" },
    devDependencies: { typescript: "^5", vitest: "^3" },
  },
  null,
  2,
);

const USAGE_CSV = [
  "date,tokens,cost_usd,messages,tool_calls,latency_p50_ms",
  ...USAGE_DAILY.filter((d) => d.date.startsWith("2026-09")).map((d) =>
    [d.date, d.tokens, d.cost.toFixed(2), d.messages, d.toolCalls, d.latencyP50Ms ?? ""].join(","),
  ),
  "",
].join("\n");

export const FILE_SAMPLES: Record<"readme" | "typescript" | "json" | "csv", FileSample> = {
  readme: { path: "README.md", language: "markdown", size: README_MD.length, content: README_MD },
  typescript: { path: "space_ui/lib/status.ts", language: "typescript", size: STATUS_TS.length, content: STATUS_TS },
  json: { path: "package.json", language: "json", size: PACKAGE_JSON.length, content: PACKAGE_JSON },
  csv: { path: "reports/usage-sept.csv", language: "csv", size: USAGE_CSV.length, content: USAGE_CSV },
};

/* ======================================================================== */
/* Chat transcript and history                                               */
/* ======================================================================== */

type ChatBase = { id: string; at: string; time: string };

export type ChatUserMessage = ChatBase & { kind: "user"; author: PersonId; text: string };
export type ChatAssistantMessage = ChatBase & { kind: "assistant"; runtime: RuntimeId; model: ModelId; text: string; streaming: boolean };
export type ToolCallStatus = "running" | "ok" | "error";
export type ChatToolCall = ChatBase & {
  kind: "tool_call";
  name: "Read" | "Grep" | "Edit" | "Write" | "Bash";
  input: Record<string, string | number | boolean>;
  output: string | null;
  status: ToolCallStatus;
  durationMs: number | null;
};
export type DiffLine = { type: "hunk" | "ctx" | "add" | "del"; text: string; oldNo: number | null; newNo: number | null };
export type ChatDiff = ChatBase & { kind: "diff"; path: string; additions: number; deletions: number; lines: DiffLine[] };
export type ChatFileCard = ChatBase & { kind: "file"; path: string; language: string; size: number; action: "created" | "edited" | "read" };
export type ChatApproval = ChatBase & {
  kind: "approval";
  title: string;
  command: string;
  reason: string;
  state: "pending" | "approved" | "denied";
  options: string[];
};
export type ChatError = ChatBase & { kind: "error"; title: string; detail: string; retryable: boolean };
export type ChatSteps = ChatBase & { kind: "steps"; steps: { content: string; status: TodoStatus }[] };

export type ChatMessage = ChatUserMessage | ChatAssistantMessage | ChatToolCall | ChatDiff | ChatFileCard | ChatApproval | ChatError | ChatSteps;

/** Number a unified diff: hunk lines reset counters from "@@ -a,b +c,d @@". */
function numberDiff(raw: [DiffLine["type"], string][]): DiffLine[] {
  let oldNo = 0;
  let newNo = 0;
  return raw.map(([type, text]) => {
    if (type === "hunk") {
      const m = /@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(text);
      oldNo = m ? Number(m[1]) : 1;
      newNo = m ? Number(m[2]) : 1;
      return { type, text, oldNo: null, newNo: null };
    }
    if (type === "add") return { type, text, oldNo: null, newNo: newNo++ };
    if (type === "del") return { type, text, oldNo: oldNo++, newNo: null };
    return { type, text, oldNo: oldNo++, newNo: newNo++ };
  });
}

const STATUS_PILL_DIFF = numberDiff([
  ["hunk", "@@ -1,9 +1,12 @@"],
  ["ctx", 'import { cn } from "@/lib/cn";'],
  ["add", 'import { pillLabel, type ApiReading } from "@/lib/status";'],
  ["ctx", ""],
  ["del", "export function StatusPill({ status }: { status?: string }) {"],
  ["del", "  const label = status ?? 0;"],
  ["add", "export function StatusPill({ reading }: { reading?: ApiReading }) {"],
  ["add", "  const label = pillLabel(reading);"],
  ["add", '  const live = label === "Running";'],
  ["ctx", "  return ("],
  ["del", '    <span className="pill">{label}</span>'],
  ["add", '    <span className={cn("pill", live && "pill-live")} role="status">'],
  ["add", "      {label}"],
  ["add", "    </span>"],
  ["ctx", "  );"],
  ["ctx", "}"],
]);

const t = (min: number) => {
  const at = minutesAgo(min);
  return { at, time: formatTime(at) };
};

export const CHAT_TRANSCRIPT: { session: Session; messages: ChatMessage[] } = {
  session: SESSION_BY_ID["df1a1a5b"],
  messages: [
    {
      id: "m01",
      kind: "user",
      author: "ada",
      ...t(76),
      text: "The status pill on the space card still shows 0 when the API is down. It should read Unavailable. Can you wire it to the Space API status?",
    },
    {
      id: "m02",
      kind: "assistant",
      runtime: "claude_code",
      model: "claude-opus",
      ...t(75),
      text: "I'll agree on what done looks like first, then read the current pill and the API client.",
      streaming: false,
    },
    {
      id: "m03",
      kind: "steps",
      ...t(75),
      steps: [
        { content: "Agree on the acceptance criteria", status: "completed" },
        { content: "Read the current status pill", status: "in_progress" },
        { content: "Wire Space API status pill", status: "pending" },
        { content: "Show Unavailable when the API is down", status: "pending" },
        { content: "Run the status tests", status: "pending" },
      ],
    },
    { id: "m04", kind: "tool_call", name: "Read", ...t(74), input: { file_path: "space_ui/components/status-pill.tsx" }, output: "Read 48 lines", status: "ok", durationMs: 38 },
    {
      id: "m05",
      kind: "tool_call",
      name: "Grep",
      ...t(73),
      input: { pattern: "apiStatus", path: "space_ui" },
      output: "space_ui/lib/api.ts:22\nspace_ui/components/status-pill.tsx:14",
      status: "ok",
      durationMs: 112,
    },
    {
      id: "m06",
      kind: "assistant",
      runtime: "claude_code",
      model: "claude-opus",
      ...t(70),
      text: "The pill reads `apiStatus` but falls back to `0` when the request fails. I'll add a small mapper in `lib/status.ts` so a failed request reads **Unavailable**, never zero, and pass the whole reading to the pill.",
      streaming: false,
    },
    { id: "m07", kind: "file", ...t(64), path: "space_ui/lib/status.ts", language: "typescript", size: 1184, action: "created" },
    { id: "m08", kind: "diff", ...t(58), path: "space_ui/components/status-pill.tsx", additions: 7, deletions: 3, lines: STATUS_PILL_DIFF },
    {
      id: "m09",
      kind: "approval",
      ...t(40),
      title: "Run the status tests?",
      command: "pnpm test status",
      reason: "Runs 14 tests in space_ui. No network access.",
      state: "approved",
      options: ["Allow once", "Always allow in this space", "Deny"],
    },
    {
      id: "m10",
      kind: "tool_call",
      name: "Bash",
      ...t(39),
      input: { command: "pnpm test status" },
      output: "13 passed, 1 failed (14)\nDuration 4.12s",
      status: "error",
      durationMs: 4120,
    },
    {
      id: "m11",
      kind: "error",
      ...t(39),
      title: "1 test failed",
      detail: 'status.test.ts > summary row > renders Unavailable when the API is down\nExpected "Unavailable", received "0"',
      retryable: true,
    },
    {
      id: "m12",
      kind: "user",
      author: "ada",
      ...t(12),
      text: "Good catch. The summary row in session-list uses the same fallback, fix that too.",
    },
    {
      id: "m13",
      kind: "assistant",
      runtime: "claude_code",
      model: "claude-opus",
      ...t(5),
      text: "One test still expects the old zero fallback in the summary row. Fixing the summary row next, then I'll rerun the tests.",
      streaming: true,
    },
    {
      id: "m14",
      kind: "tool_call",
      name: "Edit",
      ...t(4),
      input: { file_path: "space_ui/components/session-list.tsx", replace_all: false },
      output: null,
      status: "running",
      durationMs: null,
    },
  ],
};

/** Approval request still waiting on a person, for the pending state. */
export const CHAT_PENDING_APPROVAL: ChatApproval = {
  id: "m15",
  kind: "approval",
  ...t(0),
  title: "Allow a network request?",
  command: "curl -s http://space.localhost:4100/api/status",
  reason: "Reads the local Space API through galileo. Stays on this machine.",
  state: "pending",
  options: ["Allow once", "Always allow in this space", "Deny"],
};

export const CHAT_SUGGESTIONS: string[] = [
  "Summarize today's sessions",
  "What changed in galileo since yesterday?",
  "Which steps are blocked?",
  "Draft a runbook for the Slack sign-in",
];

export type ChatHistoryGroup = "Today" | "Yesterday" | "Previous 7 days" | "Older";

export type ChatHistoryItem = {
  sessionId: string;
  title: string;
  preview: string;
  projectId: string;
  runtime: RuntimeId;
  open: boolean;
  group: ChatHistoryGroup;
  lastActivity: string;
  lastActivityAt: string;
};

const TODAY_START = "2026-10-02T00:00:00Z";
const YESTERDAY_START = "2026-10-01T00:00:00Z";
const WEEK_START = "2026-09-25T00:00:00Z";

export const CHAT_HISTORY: ChatHistoryItem[] = [...SESSIONS]
  .sort((a, b) => (a.lastActivityAt < b.lastActivityAt ? 1 : -1))
  .map((s) => ({
    sessionId: s.id,
    title: s.title,
    preview: s.summary,
    projectId: s.projectId,
    runtime: s.runtime,
    open: s.open,
    group: (s.lastActivityAt >= TODAY_START
      ? "Today"
      : s.lastActivityAt >= YESTERDAY_START
        ? "Yesterday"
        : s.lastActivityAt >= WEEK_START
          ? "Previous 7 days"
          : "Older") as ChatHistoryGroup,
    lastActivity: s.lastActivity,
    lastActivityAt: s.lastActivityAt,
  }));

/* ======================================================================== */
/* Log lines                                                                 */
/* ======================================================================== */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogLine = {
  id: number;
  ts: string;
  /** "09:24:07" */
  time: string;
  level: LogLevel;
  source: string;
  message: string;
};

const LOG_SEEDS: [number, LogLevel, string, string][] = [
  // seconds before NOW_ISO
  [372, "info", "space-api", "GET /api/spaces/ws_2b81d0e4 200 in 14ms"],
  [365, "debug", "engine", "session df1a1a5b: turn 31 started (claude_code, claude-opus)"],
  [358, "info", "galileo", "source acme up at http://acme.localhost:4100/ (port 4173)"],
  [351, "warn", "galileo", "source storybook down: connection refused on port 6006"],
  [340, "info", "claude_code", "tool Read space_ui/components/session-list.tsx (212 lines)"],
  [322, "info", "space-api", "POST /api/sessions/df1a1a5b/todos 200 in 9ms"],
  [301, "info", "jobs", "job_sync_peers scheduled for 10:00"],
  [289, "debug", "engine", "map logical df1a1a5b -> provider conversation c-71f2"],
  [270, "info", "openclaw", "session a41f03be: retry attempt 1 of 3 for demo-pilot start"],
  [254, "warn", "openclaw", "demo-pilot: runtime did not answer in 30s, backing off 4s"],
  [241, "info", "openclaw", "session a41f03be: retry attempt 2 of 3"],
  [233, "info", "connector:github", "polled quirq-ai/* in 2.4s"],
  [232, "error", "connector:github", "403 secondary rate limit; next poll at 09:45"],
  [218, "info", "space-api", "GET /api/projects 200 in 22ms"],
  [205, "warn", "connector:slack", "token expired for #ops-alerts; status Needs attention"],
  [190, "info", "claude_code", "tool Edit space_ui/components/session-list.tsx"],
  [176, "debug", "engine", "fts index updated: 3 files, 18ms"],
  [160, "info", "galileo", "source notes (files ~/notes) listed 212 entries"],
  [148, "info", "space-api", "PATCH /api/todos/t_03 200 in 7ms"],
  [131, "error", "billing-api", "space billing-sandbox is Stopped; Space API Down"],
  [120, "info", "jobs", "run_301 started: Poll GitHub issues"],
  [104, "debug", "space-api", "usage rollup: 7 days recomputed in 31ms"],
  [96, "info", "claude_code", "session 7c2e91d0: step Collapse sources into a menu in progress"],
  [80, "info", "space-api", "GET /api/usage?window=7d 200 in 41ms"],
  [62, "warn", "engine", "latency telemetry missing for 2026-09-14; reporting Unavailable"],
  [47, "info", "openclaw", "session 9d4c2f68: waiting for Slack sign-in"],
  [33, "info", "galileo", "health check: 6 up, 3 down"],
  [18, "debug", "engine", "session df1a1a5b: 1,204,331 tokens so far"],
  [9, "info", "space-api", "GET /api/activity?limit=30 200 in 12ms"],
  [2, "info", "claude_code", "tool Edit running: space_ui/components/session-list.tsx"],
];

export const LOG_LINES: LogLine[] = LOG_SEEDS.map(([secAgo, level, source, message], i) => {
  const ts = new Date(NOW_MS - secAgo * 1000).toISOString().replace(".000Z", "Z");
  return { id: i + 1, ts, time: formatTime(ts, true), level, source, message };
});

export const LOG_LEVEL_META: Record<LogLevel, { label: string; tone: ToneToken }> = {
  debug: { label: "DEBUG", tone: "ink-faint" },
  info: { label: "INFO", tone: "blu" },
  warn: { label: "WARN", tone: "yel" },
  error: { label: "ERROR", tone: "red" },
};

/* ======================================================================== */
/* Knowledge graph                                                           */
/* ======================================================================== */

export type GraphNodeKind = "space" | "runtime" | "project" | "session" | "file";

export type GraphNode = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  color: ToneToken;
  /** radius hint in viewBox units */
  size: number;
  /** precomputed radial layout in GRAPH.viewBox */
  x: number;
  y: number;
  /** id of the record it stands for */
  ref: string;
  category: OrbitCategory | null;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: "holds" | "hosts" | "contains" | "runs" | "touches";
  weight: number;
};

const GRAPH_FILES: [string, string, number][] = [
  // session, path, edits
  ["df1a1a5b", "space_ui/components/status-pill.tsx", 4],
  ["df1a1a5b", "space_ui/lib/status.ts", 2],
  ["df1a1a5b", "space_ui/components/session-list.tsx", 1],
  ["2af7d3c8", "space_ui/components/project-card.tsx", 3],
  ["ses_9f1c2a", "gateway/router.js", 6],
  ["64d1c9b0", "telescope/telescope.js", 2],
  ["7c2e91d0", "bar/sources.js", 3],
  ["f0c5d218", "notes/papers/verification.md", 5],
  ["3d9e6a12", "src/camera.ts", 2],
];

export const GRAPH: { viewBox: string; width: number; height: number; spaceId: string; nodes: GraphNode[]; edges: GraphEdge[] } = (() => {
  const W = 960;
  const H = 720;
  const cx = W / 2;
  const cy = H / 2;
  const at = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: round1(cx + r * Math.cos(rad)), y: round1(cy + r * Math.sin(rad)) };
  };
  const space = CURRENT_SPACE;
  const projects = PROJECTS.filter((p) => p.spaceId === space.id);
  const sessions = SESSIONS.filter((s) => s.spaceId === space.id);
  const runtimes = RUNTIMES.filter((r) => sessions.some((s) => s.runtime === r.id));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edge = (source: string, target: string, kind: GraphEdge["kind"], weight: number) =>
    edges.push({ id: `${source}->${target}`, source, target, kind, weight });

  nodes.push({ id: `space:${space.id}`, label: space.name, kind: "space", color: "ink", size: 22, x: cx, y: cy, ref: space.id, category: null });

  runtimes.forEach((r, i) => {
    const pos = at(95, -45 + (i * 360) / runtimes.length);
    const count = sessions.filter((s) => s.runtime === r.id).length;
    nodes.push({ id: `runtime:${r.id}`, label: r.label, kind: "runtime", color: r.color, size: 14, ...pos, ref: r.id, category: null });
    edge(`space:${space.id}`, `runtime:${r.id}`, "hosts", count);
  });

  const sessionAngle = new Map<string, number>();
  projects.forEach((p, i) => {
    const angle = -90 + (i * 360) / projects.length;
    nodes.push({ id: `project:${p.id}`, label: p.displayName, kind: "project", color: p.color, size: round1(8 + p.sessions / 3), ...at(175, angle), ref: p.id, category: p.category });
    edge(`space:${space.id}`, `project:${p.id}`, "holds", p.sessions);
    const own = sessions.filter((s) => s.projectId === p.id);
    own.forEach((s, j) => {
      const a = angle + (j - (own.length - 1) / 2) * 13;
      sessionAngle.set(s.id, a);
      nodes.push({ id: `session:${s.id}`, label: s.title, kind: "session", color: RUNTIME_BY_ID[s.runtime].color, size: round1(4 + s.tokens / 400_000), ...at(255, a), ref: s.id, category: p.category });
      edge(`project:${p.id}`, `session:${s.id}`, "contains", 1);
      edge(`runtime:${s.runtime}`, `session:${s.id}`, "runs", round1(Math.max(0.1, s.tokens / 1_000_000)));
    });
  });

  GRAPH_FILES.forEach(([sessionId, path, edits], i) => {
    const base = sessionAngle.get(sessionId);
    if (base === undefined) return;
    const sameSession = GRAPH_FILES.slice(0, i).filter(([sid]) => sid === sessionId).length;
    const s = SESSION_BY_ID[sessionId];
    const fileId = `file:${s.projectId}/${path}`;
    nodes.push({
      id: fileId,
      label: path.split("/").pop() ?? path,
      kind: "file",
      color: "ink-dim",
      size: 3,
      ...at(322, base + (sameSession - 0.5) * 6),
      ref: `${s.projectId}/${path}`,
      category: PROJECT_BY_ID[s.projectId].category,
    });
    edge(`session:${sessionId}`, fileId, "touches", edits);
  });

  return { viewBox: `0 0 ${W} ${H}`, width: W, height: H, spaceId: space.id, nodes, edges };
})();

/* ======================================================================== */
/* Timeline swimlanes                                                        */
/* ======================================================================== */

export type SwimSegment = {
  id: string;
  /** minutes after 00:00 UTC */
  startMin: number;
  endMin: number;
  start: string;
  end: string;
  projectId: string;
  sessionId: string | null;
  label: string;
  status: "ran" | "error" | "waiting";
};

export type Swimlane = { runtime: RuntimeId; label: string; color: ColorToken; segments: SwimSegment[]; activeMin: number };

export const SWIMLANE_DAY = {
  date: "2026-10-01",
  label: formatDate("2026-10-01T00:00:00Z"),
  startMin: 0,
  endMin: 1440,
  ticks: [0, 180, 360, 540, 720, 900, 1080, 1260, 1440],
};

const LANE_SEEDS: [RuntimeId, [number, number, string, string | null, string, SwimSegment["status"]][]][] = [
  [
    "claude_code",
    [
      [420, 500, "xo-space", null, "Review open pull requests", "ran"],
      [710, 772, "space-drift", "3d9e6a12", "Orbit map: smoother camera easing", "ran"],
      [800, 815, "landing", null, "Footer contrast check", "error"],
      [880, 990, "research-notes", null, "Literature pass", "ran"],
      [1410, 1440, "research-notes", "f0c5d218", "Summarize verification papers", "ran"],
    ],
  ],
  [
    "codex",
    [
      [510, 605, "billing-api", "b8d2c4e7", "Reconcile June invoices", "waiting"],
      [630, 684, "xo-space", "91be2f6a", "Engine: session mapping tests", "ran"],
      [900, 960, "xo-swarm", null, "Coder adapter review", "ran"],
      [1080, 1125, "galileo", null, "Files source spike", "ran"],
    ],
  ],
  [
    "openclaw",
    [
      [500, 537, "xo-swarm", null, "Trial active banner copy", "ran"],
      [720, 749, "xo-docs", null, "Docs wording pass", "ran"],
      [1000, 1062, "ops-runbooks", null, "Rotate connector tokens", "ran"],
      [1200, 1260, "landing", null, "Pricing copy pass", "ran"],
    ],
  ],
  [
    "cursor",
    [
      [650, 672, "telescope", null, "Keyboard focus order", "ran"],
      [1100, 1134, "space-drift", null, "Particle field performance pass", "error"],
    ],
  ],
];

export const SWIMLANES: Swimlane[] = LANE_SEEDS.map(([runtime, segs]) => {
  const segments = segs.map(([startMin, endMin, projectId, sessionId, label, status], i) => ({
    id: `${runtime}_${i + 1}`,
    startMin,
    endMin,
    start: formatClock(startMin),
    end: endMin >= 1440 ? "24:00" : formatClock(endMin),
    projectId,
    sessionId,
    label,
    status,
  }));
  return {
    runtime,
    label: RUNTIME_BY_ID[runtime].label,
    color: RUNTIME_BY_ID[runtime].color,
    segments,
    activeMin: sum(segments.map((s) => s.endMin - s.startMin)),
  };
});

/* ======================================================================== */
/* Phone apps                                                                */
/* ======================================================================== */

export type PhoneApp = {
  id: string;
  label: string;
  /** lucide-react icon name */
  glyph: string;
  color: ToneToken;
  /** null hides the badge */
  badge: number | null;
  dock: boolean;
};

export const PHONE_APPS: PhoneApp[] = [
  { id: "files", label: "Files", glyph: "Folder", color: "cyn", badge: null, dock: true },
  { id: "chat", label: "Chat", glyph: "MessageSquare", color: "grn", badge: SESSIONS.filter((s) => s.open).length, dock: true },
  { id: "telescope", label: "Telescope", glyph: "Telescope", color: "blu", badge: GALILEO_SOURCES.filter((s) => !s.up).length, dock: false },
  { id: "usage", label: "Usage", glyph: "ChartColumn", color: "yel", badge: null, dock: false },
  { id: "setup", label: "Setup", glyph: "Settings2", color: "ink-dim", badge: null, dock: false },
  { id: "inbox", label: "Inbox", glyph: "Inbox", color: "org", badge: INBOX_NEW_COUNT, dock: true },
  { id: "projects", label: "Projects", glyph: "FolderKanban", color: "pur", badge: null, dock: false },
  { id: "terminal", label: "Terminal", glyph: "SquareTerminal", color: "ink", badge: null, dock: true },
  { id: "notes", label: "Notes", glyph: "NotebookPen", color: "yel", badge: null, dock: false },
  { id: "github", label: "GitHub", glyph: "GitPullRequest", color: "ink", badge: 1, dock: false },
  { id: "linear", label: "Linear", glyph: "SquareKanban", color: "blu", badge: 2, dock: false },
  { id: "slack", label: "Slack", glyph: "Hash", color: "pur", badge: 1, dock: false },
];

/* ======================================================================== */
/* Pipelines: deploy and the improvement loop                                */
/* ======================================================================== */

export type PipelineStatus = "completed" | "in_progress" | "pending" | "failed" | "skipped";

export type PipelineStage = {
  id: "provision" | "install" | "configure" | "start" | "verify";
  label: "Provision" | "Install" | "Configure" | "Start" | "Verify";
  status: PipelineStatus;
  detail: string;
  durationSec: number | null;
  duration: string | null;
};

const stage = (
  id: PipelineStage["id"],
  label: PipelineStage["label"],
  status: PipelineStatus,
  detail: string,
  durationSec: number | null,
): PipelineStage => ({ id, label, status, detail, durationSec, duration: durationSec === null ? null : formatDuration(durationSec) });

/** demo-pilot, currently Starting. */
export const DEPLOY_PIPELINE: { spaceId: string; stages: PipelineStage[] } = {
  spaceId: "ws_e5d7b302",
  stages: [
    stage("provision", "Provision", "completed", "Vercel Sandbox, iad1, 2 cores, 4 GB", 18),
    stage("install", "Install", "completed", "XO Space 0.14.2 and Claude Code 2.4.1", 52),
    stage("configure", "Configure", "completed", "1 project, 3 secrets, 2 connectors", 9),
    stage("start", "Start", "in_progress", "Starting the runtime and Space API…", null),
    stage("verify", "Verify", "pending", "Space API health check", null),
  ],
};

/** Same deploy, failed at Start. */
export const DEPLOY_PIPELINE_FAILED: { spaceId: string; stages: PipelineStage[]; failure: typeof SPACE_START_FAILURE } = {
  spaceId: "ws_e5d7b302",
  stages: [
    stage("provision", "Provision", "completed", "Vercel Sandbox, iad1, 2 cores, 4 GB", 18),
    stage("install", "Install", "completed", "XO Space 0.14.2 and Claude Code 2.4.1", 52),
    stage("configure", "Configure", "completed", "1 project, 3 secrets, 2 connectors", 9),
    stage("start", "Start", "failed", "Space could not start: runtime exited with code 1", 31),
    stage("verify", "Verify", "skipped", "Skipped because Start failed", null),
  ],
  failure: SPACE_START_FAILURE,
};

/** The quirq improvement loop, for cycle diagrams. */
export const IMPROVEMENT_LOOP: { id: string; label: string; detail: string; color: ColorToken }[] = [
  { id: "budget", label: "Set budget B", detail: "The owner sets potential quirqs before work runs.", color: "blu" },
  { id: "run", label: "Run", detail: "Agents work in the space on the unit of work.", color: "cyn" },
  { id: "snapshot", label: "Snapshot", detail: "Before and after snapshots of files and state.", color: "grn" },
  { id: "verify", label: "Verify", detail: "Weighted checks score completion V from 0 to 1.", color: "yel" },
  { id: "mint", label: "Mint", detail: "Minted quirqs Q = V · B.", color: "org" },
  { id: "improve", label: "Improve", detail: "Review units below threshold and adjust the next run.", color: "pur" },
];

/* ======================================================================== */
/* Small extras: glossary, commands, device sign-in                          */
/* ======================================================================== */

export const GLOSSARY: { term: string; definition: string; doNot: string }[] = [
  { term: "XO", definition: "The product identity: set up, deploy and manage spaces for agent work.", doNot: "Lowercase it or use it as a metric" },
  { term: "space", definition: "A configured environment where agents work with projects, tools and state; local or hosted.", doNot: "Call a space a quirq, a VM or a project" },
  { term: "project", definition: "A folder with files and maintained context for a body of work, optional tasks and Git history.", doNot: "Confuse with the space that holds it" },
  { term: "quirq", definition: "Unit of verified, owner-valued, delivered work; plural quirqs; minted Q = V · B.", doNot: "Equate with tokens, hours, cost, credits or task counts" },
  { term: "session", definition: "An agent conversation and execution history that can span turns and several tasks.", doNot: "Treat one session as one task" },
  { term: "step", definition: "A todo inside a session. The public label for the work is task; the record is a work item.", doNot: "Call a finished step an accepted outcome" },
  { term: "connector", definition: "An integration connected to a space with chosen actions and polling.", doNot: "Store credentials outside the space" },
  { term: "galileo source", definition: "A local port or files path that galileo gives its own origin.", doNot: "Render an unavailable source as zero" },
];

export type Command = { id: string; label: string; group: "Spaces" | "Projects" | "Sessions" | "Go to" | "Actions"; glyph: string; shortcut: string[] | null; hint: string | null };

export const COMMANDS: Command[] = [
  { id: "open-space", label: "Open space research-lab", group: "Spaces", glyph: "Box", shortcut: null, hint: "Running" },
  { id: "start-space", label: "Start space billing-sandbox", group: "Spaces", glyph: "Play", shortcut: null, hint: "Stopped" },
  { id: "copy-space-id", label: "Copy space ID", group: "Spaces", glyph: "Copy", shortcut: null, hint: "ws_2b81d0e4" },
  { id: "new-session", label: "New session", group: "Sessions", glyph: "MessageSquarePlus", shortcut: ["⌘", "N"], hint: null },
  { id: "resume-session", label: "Resume: Wire Space API status pill", group: "Sessions", glyph: "MessageSquare", shortcut: null, hint: "Claude Code" },
  { id: "open-project", label: "Open project xo-space", group: "Projects", glyph: "FolderOpen", shortcut: null, hint: "18 sessions" },
  { id: "search-files", label: "Search files", group: "Projects", glyph: "Search", shortcut: ["⌘", "P"], hint: null },
  { id: "goto-usage", label: "Usage", group: "Go to", glyph: "ChartColumn", shortcut: ["G", "U"], hint: null },
  { id: "goto-inbox", label: "Inbox", group: "Go to", glyph: "Inbox", shortcut: ["G", "I"], hint: `${INBOX_NEW_COUNT} new` },
  { id: "goto-connectors", label: "Connectors", group: "Go to", glyph: "Plug", shortcut: ["G", "C"], hint: null },
  { id: "toggle-theme", label: "Toggle theme", group: "Actions", glyph: "SunMoon", shortcut: ["⌘", "⇧", "L"], hint: null },
  { id: "sign-out", label: "Sign out", group: "Actions", glyph: "LogOut", shortcut: null, hint: null },
];

/** Device sign-in for a local space linking to an account. Fictional code. */
export const DEVICE_SIGN_IN = {
  code: "WDJB-MJHT",
  verifyUrl: "http://localhost:5002/device",
  expiresIn: "14m",
  account: CURRENT_USER.email,
};
