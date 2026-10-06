// Demo data for the timeline swimlanes shape. Derived from the shared fixtures (projects,
// orbit categories, the xo-space file tree) with the seeded mulberry32 PRNG, so the server and
// the browser compute the same dates. Mock data: file dates stand for each file's first Git
// commit, and commit days stand for each project's Git history.
import { FILE_TREE, NOW_MS, ORBIT_CATEGORIES, PROJECT_BY_ID, flattenTree, mulberry32 } from "@/lib/fixtures";
import type { SwimItem, SwimLane, SwimMilestone, SwimShape, SwimWindow } from "./swimlanes";

const DAY = 86_400_000;
const dayFloor = (ms: number) => Math.floor(ms / DAY) * DAY;

/** Thirteen months: 1 Sep 2025 to the fixture now (Fri 2 Oct 2026). */
export const SWIM_RANGE: SwimWindow = { start: Date.UTC(2025, 8, 1), end: NOW_MS };

/** When each project's history begins. Projects are fictional; dates are mock. */
const PROJECT_START: Record<string, number> = {
  "xo-swarm": Date.UTC(2025, 8, 8),
  "xo-docs": Date.UTC(2025, 9, 14),
  landing: Date.UTC(2025, 10, 3),
  "ops-runbooks": Date.UTC(2025, 11, 2),
  "research-notes": Date.UTC(2026, 0, 12),
  "xo-space": Date.UTC(2026, 1, 9),
  "billing-api": Date.UTC(2026, 2, 16),
  "space-drift": Date.UTC(2026, 4, 4),
  galileo: Date.UTC(2026, 5, 22),
  telescope: Date.UTC(2026, 6, 13),
  "demo-kit": Date.UTC(2026, 7, 24),
};

const XO_SPACE_FILES = flattenTree(FILE_TREE)
  .filter((n) => n.node.type === "file")
  .map((n) => n.node.path.replace(/^xo-space\//, ""));

const GENERIC_FILES = [
  "AGENTS.md",
  "README.md",
  "PLAN.md",
  "package.json",
  "src/index.ts",
  "src/routes.ts",
  "src/config.ts",
  "docs/notes.md",
  "tests/smoke.test.ts",
  "src/lib/client.ts",
  "scripts/dev.sh",
  "src/lib/format.ts",
  "CHANGELOG.md",
  "src/server.ts",
  "docs/decisions.md",
  "OBJECTIVES.md",
];

function shapeFor(path: string): SwimShape {
  const base = path.split("/").pop() ?? path;
  if (["AGENTS.md", "PLAN.md", "OBJECTIVES.md"].includes(base)) return "diamond";
  if (base.endsWith(".md")) return "ring";
  return "dot";
}

/** Seed from a project id, so each project keeps its own stable sequence. */
function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Dated files for one project: bursts of first commits between its start and last activity. */
function filesFor(projectId: string): SwimItem[] {
  const p = PROJECT_BY_ID[projectId];
  const start = PROJECT_START[projectId];
  const end = Math.min(Date.parse(p.lastActiveAt), SWIM_RANGE.end);
  const rng = mulberry32(seedOf(projectId));
  const count = Math.min(14, Math.max(4, Math.round(p.files / 7)));
  const pool = projectId === "xo-space" ? XO_SPACE_FILES : GENERIC_FILES;
  const bursts = [0.02, 0.35 + rng() * 0.2, 0.8 + rng() * 0.18];
  const out: SwimItem[] = [];
  for (let i = 0; i < count; i++) {
    const burst = i < 3 ? bursts[0] : bursts[1 + Math.floor(rng() * 2)];
    const f = Math.min(1, Math.max(0, burst + (rng() - 0.5) * 0.14));
    const t = dayFloor(start + (end - start) * f);
    const path = pool[i % pool.length];
    out.push({ id: `${projectId}:${i}`, t, label: path, group: projectId, groupLabel: p.displayName, shape: shapeFor(path) });
  }
  return out.sort((a, b) => a.t - b.t);
}

/** By file: one lane per department, files from every project in it. */
export const FILE_LANES: SwimLane[] = ORBIT_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.id,
  tone: c.color,
  items: c.projects.flatMap(filesFor).sort((a, b) => a.t - b.t),
}));

/** Commit days for one project. Projects without a Git remote have no history. */
function commitsFor(projectId: string): SwimItem[] {
  const p = PROJECT_BY_ID[projectId];
  if (!p.github) return [];
  const start = PROJECT_START[projectId];
  const end = Math.min(Date.parse(p.lastActiveAt), SWIM_RANGE.end);
  const rng = mulberry32(seedOf(projectId) ^ 0x5bd1e995);
  const out: SwimItem[] = [];
  let heat = 0.5;
  for (let t = dayFloor(start); t <= end; t += DAY) {
    heat = Math.min(0.95, Math.max(0.05, heat + (rng() - 0.5) * 0.35));
    if (rng() < heat * 0.2) {
      const n = 1 + Math.floor(rng() ** 3 * 7);
      out.push({ id: `${projectId}:c${t}`, t, label: `${n} ${n === 1 ? "commit" : "commits"} this day`, group: projectId, groupLabel: p.displayName, weight: n });
    }
  }
  return out;
}

const PROJECT_LANE_IDS = ["xo-docs", "landing", "xo-space", "billing-api", "galileo", "research-notes"];

/** By project: one lane per project with its Git commit days. research-notes has no remote. */
export const PROJECT_LANES: SwimLane[] = PROJECT_LANE_IDS.map((id) => ({
  id,
  name: PROJECT_BY_ID[id].displayName,
  tone: PROJECT_BY_ID[id].color,
  items: commitsFor(id),
}));

/** First commits worth marking on the axis. */
export const SWIM_MILESTONES: SwimMilestone[] = ["xo-swarm", "landing", "xo-space", "galileo", "telescope"].map((id) => ({
  t: PROJECT_START[id],
  label: `${PROJECT_BY_ID[id].displayName} first commit`,
}));
