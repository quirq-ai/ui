// Datasets for the knowledge-graph demos, built from the shared fixtures with plain
// arithmetic (rounded), so the server and the browser compute the same layout.
import {
  FILE_TREE,
  ORBIT_CATEGORIES,
  PEOPLE,
  PROJECTS,
  PROJECT_BY_ID,
  RUNTIMES,
  SESSIONS,
  TODOS,
  type FileNode,
} from "@/lib/fixtures";
import { formatBytes, formatCurrency, formatTokens, pluralize } from "@/lib/format";
import type { KGEdge, KGHull, KGLegendItem, KGNode, KGSatelliteGroup } from "./knowledge-graph";
import { TAG_GLYPH, tagOf } from "./project-meta";

const r1 = (n: number) => Math.round(n * 10) / 10;
const polar = (cx: number, cy: number, r: number, deg: number, ry = r) => {
  const a = (deg * Math.PI) / 180;
  return { x: r1(cx + r * Math.cos(a)), y: r1(cy + ry * Math.sin(a)) };
};
const cssVar = (token: string) => `var(--${token})`;

/** Positions are in layout units; the camera frames whatever the nodes cover. */
export type GraphDataset = {
  nodes: KGNode[];
  edges: KGEdge[];
  hulls: KGHull[];
  legend: KGLegendItem[];
};

/* ----------------------------------------------------------------- project categories */

const CROSS_TIES: [string, string][] = [
  ["xo-space", "galileo"],
  ["galileo", "telescope"],
  ["xo-space", "xo-swarm"],
  ["ops-runbooks", "xo-swarm"],
  ["landing", "xo-docs"],
  ["research-notes", "space-drift"],
  ["demo-kit", "landing"],
  ["billing-api", "xo-swarm"],
];

function buildCategories(): GraphDataset {
  const cx = 480;
  const cy = 312;
  const nodes: KGNode[] = [{ id: "root", type: "root", label: "All projects", x: cx, y: cy, r: 24, color: "var(--ink)", kicker: "The center", detail: [`${PROJECTS.length} projects in 4 spaces`] }];
  const edges: KGEdge[] = [];
  const hulls: KGHull[] = [];

  ORBIT_CATEGORIES.forEach((cat, i) => {
    const angle = -90 + i * 72;
    const hub = polar(cx, cy, 300, angle, 166);
    const members = PROJECTS.filter((p) => p.category === cat.id);
    const hubId = `c:${cat.id}`;
    nodes.push({
      id: hubId,
      type: "hub",
      label: cat.id,
      ...hub,
      r: 15 + members.length * 1.5,
      color: cssVar(cat.color),
      hull: cat.id,
      countLabel: pluralize(members.length, "project"),
      kicker: "Category",
      detail: [cat.blurb, pluralize(members.reduce((s, p) => s + p.sessions, 0), "session")],
    });
    hulls.push({ id: cat.id, color: cssVar(cat.color) });
    edges.push({ source: "root", target: hubId, kind: "root" });

    members.forEach((p, j) => {
      const spread = members.length > 3 ? 30 : 36;
      const a = angle + (j - (members.length - 1) / 2) * spread;
      const dist = members.length > 2 ? (j % 2 ? 112 : 92) : 120;
      const pt = polar(hub.x, hub.y, dist, a);
      const tag = tagOf(p.id);
      nodes.push({
        id: `p:${p.id}`,
        type: "leaf",
        label: p.displayName,
        ...pt,
        r: r1(4.2 + Math.sqrt(p.sessions) * 0.85),
        color: cssVar(cat.color),
        glyph: TAG_GLYPH[tag],
        hull: cat.id,
        kicker: `${cat.id} · ${tag}`,
        detail: [
          `${pluralize(p.sessions, "session")} · ${p.openSessions} open`,
          `Last active ${p.lastActive}`,
          `Owner ${PEOPLE[p.owner].name}`,
        ],
      });
      edges.push({ source: hubId, target: `p:${p.id}`, kind: "tie" });
    });
  });

  for (const [a, b] of CROSS_TIES) edges.push({ source: `p:${a}`, target: `p:${b}`, kind: "x" });

  const legend: KGLegendItem[] = [
    ...ORBIT_CATEGORIES.map((c) => ({ label: c.id, swatch: cssVar(c.color) })),
    { label: "App", glyph: "disc" as const },
    { label: "One-pager", glyph: "ring" as const },
    { label: "Docs", glyph: "stack" as const },
    { label: "Slides", glyph: "slab" as const },
    { label: "Unknown", glyph: "diamond" as const, dim: true },
  ];
  return { nodes, edges, hulls, legend };
}

export const CATEGORY_GRAPH = buildCategories();

/** Steps (session todos) per project; a project's steps orbit it while it is focused. */
export const PROJECT_SATELLITES: KGSatelliteGroup[] = [...new Set(TODOS.map((t) => t.projectId))].map((projectId) => ({
  hostId: `p:${projectId}`,
  items: TODOS.filter((t) => t.projectId === projectId).map((t) => ({ id: t.id, label: t.content, status: t.status })),
}));

export const XO_SPACE_SATELLITES = PROJECT_SATELLITES.find((g) => g.hostId === "p:xo-space") as KGSatelliteGroup;

/* ----------------------------------------------------------------- sessions by harness */

const HARNESS_POS: Record<string, { x: number; y: number }> = {
  claude_code: { x: 300, y: 292 },
  codex: { x: 664, y: 168 },
  openclaw: { x: 676, y: 430 },
  cursor: { x: 476, y: 506 },
};

function buildHarness(): GraphDataset {
  const nodes: KGNode[] = [];
  const edges: KGEdge[] = [];
  const hulls: KGHull[] = [];
  const runtimes = RUNTIMES.filter((r) => SESSIONS.some((s) => s.runtime === r.id));

  for (const rt of runtimes) {
    const at = HARNESS_POS[rt.id];
    const own = SESSIONS.filter((s) => s.runtime === rt.id);
    const hubId = `h:${rt.id}`;
    nodes.push({
      id: hubId,
      type: "hub",
      label: rt.label,
      ...at,
      r: r1(12 + Math.sqrt(rt.sessions) * 0.75),
      color: cssVar(rt.color),
      hull: rt.id,
      countLabel: pluralize(rt.sessions, "session"),
      kicker: `${rt.vendor} · ${rt.kind}`,
      detail: [`${pluralize(rt.sessions, "session")} all time`, `${own.length} recent shown`],
    });
    hulls.push({ id: rt.id, color: cssVar(rt.color) });
    own.forEach((s, i) => {
      const pt = polar(at.x, at.y, 40 + 16 * Math.sqrt(i + 1), -90 + i * 137.5);
      const project = PROJECT_BY_ID[s.projectId];
      nodes.push({
        id: `s:${s.id}`,
        type: "leaf",
        label: s.title,
        ...pt,
        r: r1(Math.min(7.5, 3.4 + s.tokens / 380_000) + (s.open ? 0.8 : 0)),
        color: cssVar(rt.color),
        glyph: "disc",
        hull: rt.id,
        dim: !s.open,
        kicker: `${rt.label} · ${project.displayName}`,
        detail: [
          `${formatTokens(s.tokens)} · ${formatCurrency(s.cost)} (mock)`,
          `${s.turns} turns · ${s.duration}`,
          s.open ? `Open · active ${s.lastActivity}` : `Ended ${s.lastActivity}`,
        ],
      });
      edges.push({ source: hubId, target: `s:${s.id}`, kind: "tie" });
    });
  }

  // a session in one project ties to the next session in that project on another harness
  const byProject = new Map<string, typeof SESSIONS>();
  for (const s of SESSIONS) byProject.set(s.projectId, [...(byProject.get(s.projectId) ?? []), s]);
  for (const list of byProject.values()) {
    const sorted = [...list].sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].runtime !== sorted[i - 1].runtime) edges.push({ source: `s:${sorted[i - 1].id}`, target: `s:${sorted[i].id}`, kind: "x" });
    }
  }

  const legend: KGLegendItem[] = [
    ...runtimes.map((r) => ({ label: r.label, swatch: cssVar(r.color) })),
    { label: "open session", glyph: "disc" as const },
    { label: "ended session", glyph: "disc" as const, dim: true },
    { label: "same project", line: true },
  ];
  return { nodes, edges, hulls, legend };
}

export const HARNESS_GRAPH = buildHarness();

/* ----------------------------------------------------------------- file graph */

const LANG_COLOR: Record<string, string> = {
  typescript: "var(--blu)",
  python: "var(--yel)",
  markdown: "var(--pur)",
  csv: "var(--grn)",
};
const langColor = (lang: string | null) => (lang && LANG_COLOR[lang]) || "var(--ink-dim)";

function fileGlyph(f: FileNode): "disc" | "ring" | "diamond" {
  if (f.language === "markdown") return "ring";
  if (f.language === "csv" || /test/.test(f.name)) return "diamond";
  return "disc";
}

type Folder = { path: string; files: FileNode[]; parent: string | null };

function collectFolders(node: FileNode, parentGroup: string | null, out: Folder[]) {
  for (const c of node.children ?? []) {
    if (c.type !== "folder") continue;
    const files = (c.children ?? []).filter((x) => x.type === "file");
    const key = c.path.replace(/\/$/, "");
    if (files.length) out.push({ path: key, files, parent: parentGroup });
    collectFolders(c, files.length ? key : parentGroup, out);
  }
}

const TOUCHED_TOGETHER: [string, string][] = [
  ["space_ui/components/status-pill.tsx", "space_ui/lib/status.ts"],
  ["space_ui/components/session-list.tsx", "space_ui/components/status-pill.tsx"],
  ["tests/status.test.ts", "space_ui/lib/status.ts"],
  ["tests/test_sessions.py", "engine/sessions.py"],
  ["space_ui/components/project-card.tsx", "space_ui/app/page.tsx"],
  ["docs/vocabulary.md", "README.md"],
];

function buildFiles(): GraphDataset {
  const cx = 480;
  const cy = 300;
  const project = PROJECT_BY_ID["xo-space"];
  const nodes: KGNode[] = [
    {
      id: "hub:xo-space",
      type: "hub",
      label: project.displayName,
      x: cx,
      y: cy,
      r: 17,
      color: "var(--blu)",
      countLabel: pluralize(project.files, "file"),
      kicker: "Project",
      detail: [project.description, `Branch ${project.branch}`],
    },
  ];
  const edges: KGEdge[] = [];
  const folders: Folder[] = [];
  collectFolders(FILE_TREE, null, folders);

  folders.forEach((fo, i) => {
    const angle = -90 + (i * 360) / folders.length;
    const g = polar(cx, cy, 300, angle, 206);
    const gid = `g:${fo.path}`;
    const size = fo.files.reduce((s, f) => s + f.size, 0);
    nodes.push({
      id: gid,
      type: "group",
      label: fo.path,
      ...g,
      r: r1(7 + fo.files.length * 1.2),
      color: "var(--ink-dim)",
      kicker: "Folder",
      detail: [`${pluralize(fo.files.length, "file")} · ${formatBytes(size)}`],
    });
    edges.push({ source: fo.parent ? `g:${fo.parent}` : "hub:xo-space", target: gid, kind: fo.parent ? "tie" : "root" });
    fo.files.forEach((f, j) => {
      const a = angle + (j - (fo.files.length - 1) / 2) * 26;
      const pt = polar(g.x, g.y, 52, a);
      nodes.push({
        id: `f:${f.path}`,
        type: "leaf",
        label: f.name,
        ...pt,
        r: r1(4 + Math.sqrt(f.size) / 30),
        color: langColor(f.language),
        glyph: fileGlyph(f),
        cluster: gid,
        kicker: `${fo.path} · ${fileGlyph(f) === "ring" ? "document" : fileGlyph(f) === "diamond" ? "experiment" : "code"}`,
        detail: [formatBytes(f.size), f.git ? `Git: ${f.git}` : "Git: unchanged"],
      });
      edges.push({ source: gid, target: `f:${f.path}`, kind: "tie" });
    });
  });

  const rootFiles = (FILE_TREE.children ?? []).filter((c) => c.type === "file");
  rootFiles.forEach((f, j) => {
    const pt = polar(cx, cy, 104, -90 + 20 + (j * 360) / rootFiles.length, 84);
    nodes.push({
      id: `f:${f.path}`,
      type: "leaf",
      label: f.name,
      ...pt,
      r: r1(4 + Math.sqrt(f.size) / 30),
      color: langColor(f.language),
      glyph: fileGlyph(f),
      kicker: `xo-space · ${fileGlyph(f) === "ring" ? "document" : "code"}`,
      detail: [formatBytes(f.size), f.git ? `Git: ${f.git}` : "Git: unchanged"],
    });
    edges.push({ source: "hub:xo-space", target: `f:${f.path}`, kind: "tie" });
  });

  for (const [a, b] of TOUCHED_TOGETHER) edges.push({ source: `f:${a}`, target: `f:${b}`, kind: "x" });

  const legend: KGLegendItem[] = [
    { label: "TypeScript", swatch: "var(--blu)" },
    { label: "Python", swatch: "var(--yel)" },
    { label: "Markdown", swatch: "var(--pur)" },
    { label: "CSV", swatch: "var(--grn)" },
    { label: "Config", swatch: "var(--ink-dim)" },
    { label: "code", glyph: "disc" as const },
    { label: "document", glyph: "ring" as const },
    { label: "experiment", glyph: "diamond" as const },
  ];
  return { nodes, edges, hulls: [], legend };
}

export const FILE_GRAPH = buildFiles();
export const FILE_GRAPH_CLOSED = ["g:engine/runtimes", "g:.github/workflows"];
