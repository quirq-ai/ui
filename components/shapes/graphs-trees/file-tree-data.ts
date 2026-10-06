// File tree demo data: the xo-space fixture tree, three more project trees for the
// growth tree, deterministic modified times, and the preview samples.
import { FILE_SAMPLES, FILE_TREE, ago, minutesAgo, type FileNode } from "@/lib/fixtures";
import { hashString } from "@/components/ui/tones";
import type { FsNode } from "./file-explorer";
import type { PreviewSource } from "./file-tree-preview";

type Seed = string | [string, number] | { dir: string; items: Seed[] };

/** Deterministic "16m ago" per path, so every render agrees. */
const modifiedFor = (path: string) => ago(minutesAgo(3 + (hashString(path) % 2600)));

function withTimes(node: FileNode): FsNode {
  return {
    name: node.name,
    path: node.path,
    type: node.type,
    size: node.size,
    git: node.git,
    language: node.language,
    modified: modifiedFor(node.path || node.name),
    children: node.children?.map(withTimes),
  };
}

function fromSeeds(items: Seed[], parent: string): FsNode[] {
  return items.map((it) => {
    if (typeof it === "object" && !Array.isArray(it)) {
      const path = `${parent}${it.dir}/`;
      const children = fromSeeds(it.items, path);
      return { name: it.dir, path, type: "folder" as const, size: children.reduce((s, c) => s + c.size, 0), modified: modifiedFor(path), children };
    }
    const [name, size] = typeof it === "string" ? [it, 640 + (hashString(it) % 4000)] : it;
    return { name, path: `${parent}${name}`, type: "file" as const, size, modified: modifiedFor(`${parent}${name}`) };
  });
}

const project = (name: string, items: Seed[]): FsNode => {
  const children = fromSeeds(items, "");
  return { name, path: "", type: "folder", size: children.reduce((s, c) => s + c.size, 0), modified: modifiedFor(name), children };
};

/** xo-space with modified times, plus a small HTML report for the HTML preview. */
export const XO_SPACE_TREE: FsNode = (() => {
  const base = withTimes(FILE_TREE);
  const reports = base.children?.find((c) => c.name === "reports");
  if (reports?.children) {
    reports.children = [
      ...reports.children,
      { name: "status-card.html", path: "reports/status-card.html", type: "file", size: 1388, language: "html", git: "untracked", modified: modifiedFor("reports/status-card.html") },
    ];
    reports.size = reports.children.reduce((s, c) => s + c.size, 0);
  }
  return base;
})();

export const GALILEO_TREE = project("galileo", [
  { dir: "data", items: [["sources.json", 612]] },
  { dir: "docs", items: [["ARCHITECTURE.md", 11840], ["DECISIONS.md", 6420], ["REFERENCE.md", 9310]] },
  { dir: "src", items: [["files.mjs", 7210], ["inject.mjs", 5480], ["server.mjs", 12930], ["sources.mjs", 6870]] },
  { dir: "telescope", items: [["bridge.js", 2140], ["telescope.css", 3380], ["telescope.js", 9920]] },
  ["README.md", 4310],
  ["package.json", 512],
]);

export const BILLING_TREE = project("billing-api", [
  { dir: "docs", items: [["invoices.md", 2210]] },
  { dir: "src", items: [["reconcile.py", 8840]] },
  { dir: "tests", items: [["test_reconcile.py", 4120]] },
  ["README.md", 1432],
  ["requirements.txt", 188],
]);

export const LANDING_TREE = project("landing", []);

/** A project with files and no folders, for the files-only layout. */
export const DEMO_KIT_TREE = project("demo-kit", [["README.md", 1210], ["pilot-script.md", 3480], ["seed-usage.json", 22140], ["walkthrough.mp4", 18_874_368]]);

/** The projects folder the growth tree starts from. */
export const PROJECTS_FOLDER: FsNode = {
  name: "Projects folder",
  path: "",
  type: "folder",
  size: 0,
  children: [
    { ...BILLING_TREE, path: "billing-api/" },
    { ...GALILEO_TREE, path: "galileo/" },
    { ...LANDING_TREE, path: "landing/" },
    { ...XO_SPACE_TREE, name: "xo-space", path: "xo-space/" },
  ],
};

const STATUS_HTML = [
  "<!doctype html>",
  '<html lang="en"><head><meta charset="utf-8"><title>Space status</title>',
  "<style>body{margin:0;font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#111;padding:20px}",
  ".card{border:1px solid #ddd;border-radius:12px;padding:16px 18px;max-width:340px}",
  "h1{font-size:15px;margin:0 0 4px}p{margin:0;color:#555}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#1a9e47;margin-right:6px}",
  "dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:12px 0 0}dt{color:#777}dd{margin:0}</style></head>",
  '<body><div class="card"><h1><span class="dot"></span>research-lab · Running</h1>',
  "<p>Local space on this laptop. Mock data.</p>",
  "<dl><dt>Space API</dt><dd>Up</dd><dt>CPU</dt><dd>Unavailable</dd><dt>Projects</dt><dd>5</dd></dl></div></body></html>",
].join("\n");

/** Preview sources keyed by project-relative path. Anything else is unsupported. */
export const PREVIEWS: Record<string, PreviewSource> = {
  [FILE_SAMPLES.readme.path]: { language: "markdown", content: FILE_SAMPLES.readme.content },
  [FILE_SAMPLES.typescript.path]: { language: "typescript", content: FILE_SAMPLES.typescript.content },
  [FILE_SAMPLES.json.path]: { language: "json", content: FILE_SAMPLES.json.content },
  [FILE_SAMPLES.csv.path]: { language: "csv", content: FILE_SAMPLES.csv.content },
  "reports/status-card.html": { language: "html", content: STATUS_HTML },
};
