// Demo records for the media-files category, built from the shared fixtures. Viewer files,
// a README history for the version picker, a sandboxed HTML report, PDF pages and an audio
// waveform. Everything is mock and deterministic. Not exported from the category index.
import {
  FILE_SAMPLES,
  GALILEO_SOURCES,
  QUIRQ_METHOD,
  QUIRQ_THRESHOLD,
  QUIRQ_UNAVAILABLE_NOTE,
  USAGE_DAILY,
  USAGE_SUMMARY,
  minutesAgo,
  seededSeries,
} from "@/lib/fixtures";
import { formatCurrency, formatNumber, formatTokens } from "@/lib/format";
import { BLUE_PLANET_SVG } from "./art";
import type { FileVersion, ViewerFile } from "./file-kinds";
import type { PdfPage } from "./media-stage";

const README = FILE_SAMPLES.readme.content;

/* ------------------------------------------------------------ html report */

const last30 = USAGE_SUMMARY["30 days"];
const REPORT_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Usage report</title>
<style>
body{margin:0;padding:28px 30px;font:14px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:#1b1b1d;background:#fff}
h1{font-size:22px;margin:0 0 4px;letter-spacing:-.01em}
.sub{color:#6b6b70;font-size:12px;margin:0 0 20px}
.tag{display:inline-block;font:600 10px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#a35c00;background:#fff2df;border-radius:3px;padding:4px 6px;margin-left:8px;vertical-align:3px}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:22px}
.k{border:1px solid #e6e6e8;border-radius:10px;padding:12px}
.k b{display:block;font-size:19px;letter-spacing:-.01em}
.k span{font-size:11px;color:#6b6b70}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #eee}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
</style></head><body>
<h1>September usage <span class="tag">Mock data</span></h1>
<p class="sub">research-lab · 30 days to 1 Oct · tokens and cost are the usage meter, not quirqs</p>
<div class="grid">
<div class="k"><b>${formatTokens(last30.tokens)}</b><span>Tokens</span></div>
<div class="k"><b>${formatCurrency(last30.cost)}</b><span>Cost</span></div>
<div class="k"><b>${formatNumber(last30.messages)}</b><span>Messages</span></div>
</div>
<table><thead><tr><th>Day</th><th class="n">Tokens</th><th class="n">Cost</th><th class="n">Messages</th></tr></thead><tbody>
${USAGE_DAILY.slice(-8)
  .map((d) => `<tr><td>${d.date}</td><td class="n">${formatNumber(d.tokens)}</td><td class="n">${formatCurrency(d.cost)}</td><td class="n">${formatNumber(d.messages)}</td></tr>`)
  .join("\n")}
</tbody></table>
</body></html>
`;

/* ------------------------------------------------------------ files */

export const DEMO_FILES = {
  readme: {
    name: "README.md",
    path: "xo-space/README.md",
    kind: "markdown",
    size: FILE_SAMPLES.readme.size,
    modifiedAt: minutesAgo(16),
    content: README,
    language: "md",
  },
  status: {
    name: "status.ts",
    path: "xo-space/space_ui/lib/status.ts",
    kind: "code",
    size: FILE_SAMPLES.typescript.size,
    modifiedAt: minutesAgo(9),
    content: FILE_SAMPLES.typescript.content,
    language: "ts",
  },
  pkg: {
    name: "package.json",
    path: "xo-space/package.json",
    kind: "json",
    size: FILE_SAMPLES.json.size,
    modifiedAt: minutesAgo(2900),
    content: FILE_SAMPLES.json.content,
    language: "json",
  },
  csv: {
    name: "usage-2026.csv",
    path: "xo-space/reports/usage-2026.csv",
    kind: "csv",
    size: Math.round(1.8 * 1024 * 1024),
    modifiedAt: minutesAgo(410),
    content: FILE_SAMPLES.csv.content,
    truncated: true,
    language: "csv",
  },
  html: {
    name: "usage-sept.html",
    path: "xo-space/reports/usage-sept.html",
    kind: "html",
    size: REPORT_HTML.length,
    modifiedAt: minutesAgo(380),
    content: REPORT_HTML,
    language: "html",
  },
  png: {
    name: "lunar-orbit.png",
    path: "space-drift/assets/lunar-orbit.png",
    kind: "image",
    size: 412_380,
    modifiedAt: minutesAgo(5800),
  },
  pdf: {
    name: "verification-notes.pdf",
    path: "research-notes/papers/verification-notes.pdf",
    kind: "pdf",
    size: 1_284_906,
    modifiedAt: minutesAgo(600),
  },
  svg: {
    name: "blue-planet.svg",
    path: "space-drift/assets/blue-planet.svg",
    kind: "svg",
    size: BLUE_PLANET_SVG.length,
    modifiedAt: minutesAgo(5900),
    content: BLUE_PLANET_SVG,
  },
  architecture: {
    name: "architecture.md",
    path: "xo-space/docs/architecture.md",
    kind: "markdown",
    size: 8420,
    modifiedAt: minutesAgo(1440),
  },
} satisfies Record<string, ViewerFile>;

/* ------------------------------------------------------------ README history */

function upTo(marker: string): string {
  const at = README.indexOf(marker);
  return at > 0 ? README.slice(0, at).trimEnd() + "\n" : README;
}

export const README_VERSIONS: FileVersion[] = [
  {
    hash: "a1b2c3d9e04f",
    ago: "2h ago",
    subject: "Describe what runs inside a space",
    content: upTo("## Space status"),
    size: upTo("## Space status").length,
  },
  {
    hash: "9f8e7d6c5b4a",
    ago: "1d ago",
    subject: "Add a quick start that opens the Space dashboard",
    content: upTo("## What runs inside a space"),
    size: upTo("## What runs inside a space").length,
  },
  {
    hash: "4c3b2a190817",
    ago: "6d ago",
    subject: "Initial README",
    content: upTo("## Quick start"),
    size: upTo("## Quick start").length,
  },
];

/* ------------------------------------------------------------ galileo pages */

export const GALILEO_NOTES = GALILEO_SOURCES.find((s) => s.name === "notes")!;
export const GALILEO_BRIEF = GALILEO_SOURCES.find((s) => s.name === "brief")!;
export const GALILEO_SHOTS = GALILEO_SOURCES.find((s) => s.name === "shots")!;

export const PLAN_MD = [
  "# plan",
  "",
  "Ship galileo v0 before xo-client resumes.",
  "",
  "- [x] Give each source its own origin",
  "- [x] Files sources: read only, hidden names never served",
  "- [ ] telescope: collapse sources on narrow screens",
  "- [ ] Health checks for port sources",
  "",
  "Open question: should a folder with index.html serve it, or the listing?",
  "",
].join("\n");

export const BRIEF_MD = [
  "# galileo",
  "",
  "**The inspector of a space: the apps and files on this machine, one at a time, under one bar.**",
  "",
  "galileo keeps a list of sources (apps on ports of this machine, and files or folders",
  "on it), gives each its own address, and serves telescope, the bar that shows them.",
  "",
  "    acme.localhost:4100   ->  localhost:4173  (a port, proxied)",
  "    notes.localhost:4100  ->  ~/notes         (files, read only)",
  "",
].join("\n");

export const DRAFTS_LISTING: { name: string; folder: boolean; size: number; modified: string }[] = [
  { name: "figures", folder: true, size: 0, modified: "2026-09-30 17:41" },
  { name: "agents-and-budgets.md", folder: false, size: 6_140, modified: "2026-10-02 08:55" },
  { name: "verification-v0.md", folder: false, size: 11_382, modified: "2026-10-01 21:12" },
  { name: "quirq-terminology.md", folder: false, size: 4_406, modified: "2026-09-28 10:03" },
  { name: "reading-list.txt", folder: false, size: 918, modified: "2026-09-21 14:30" },
];

/* ------------------------------------------------------------ media */

export const WAVEFORM: number[] = seededSeries(4242, 72, 0.12, 1, 2);

export const PDF_PAGES: PdfPage[] = [
  {
    heading: "Verification notes",
    paragraphs: [
      "A quirq is a unit of verified, owner-valued, delivered work. The owner sets a budget B before the work runs; verification scores completion V from 0 to 1; the minted amount is Q = V · B.",
      `Method: ${QUIRQ_METHOD}. A unit below V = ${QUIRQ_THRESHOLD} counts as an intervention.`,
      "Tokens and cost are a separate usage meter. They are never quirqs, and they never stand in for V.",
    ],
  },
  {
    heading: "Snapshots",
    paragraphs: [
      "Each unit takes a snapshot before and after the run. Checks compare the two and carry a weight; V is the weighted share of checks that passed.",
      "A check that did not run is not a failure and not a pass. It is excluded and the reading says so.",
    ],
  },
  {
    heading: "Missing measurement",
    paragraphs: [
      `When no evidence exists the reading is Unavailable, never zero. Copy: "${QUIRQ_UNAVAILABLE_NOTE}"`,
      "Mock and illustrative numbers carry a label with method, unit and scope.",
    ],
  },
  {
    heading: "Open questions",
    paragraphs: [
      "How should a reviewer override a check, and how is that recorded against V?",
      "Which windows should QER, QV and IR default to in the Space dashboard?",
    ],
  },
];
