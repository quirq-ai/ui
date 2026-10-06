import type { Shape } from "@/lib/types";
import { DefinitionGridDemo } from "./demo-definition-grid";
import { ArticleDemo } from "./demo-article";
import { TerminalDemo } from "./demo-terminal";
import { InstrumentsDemo } from "./demo-instruments";
import { RolloutMatrixDemo } from "./demo-rollout-matrix";
import { AvatarsDemo } from "./demo-avatars";
import { ProvenanceDemo } from "./demo-provenance";
import { TrustBoundaryDemo } from "./demo-trust-boundary";
import { TermCardDemo } from "./demo-term-card";

export const shapes: Shape[] = [
  {
    id: "definition-grid",
    name: "Definition grid",
    purpose: "Label/value facts with copy.",
    seenIn: [
      "landing:definition-grid",
      "space-ui:metadata-definition-grid",
      "space-ui:identity-panel",
      "space-ui:root-path-strip",
      "space-ui:storage-map-split",
      "galileo:file-meta-head",
      "viz:glossary-term-card",
    ],
    variants: ["metadata", "identity", "root path", "storage split", "file meta", "glossary term"],
    states: ["loading", "not recorded", "error"],
    Demo: DefinitionGridDemo,
  },
  {
    id: "article",
    name: "Article and markdown prose",
    purpose: "Long-form reading.",
    seenIn: ["landing:article-header", "landing:article-body-blocks", "space-ui:markdown-prose", "viz:markdown-reader"],
    variants: ["research article", "markdown preview", "local reader"],
    states: ["preview / source"],
    Demo: ArticleDemo,
  },
  {
    id: "log-terminal",
    name: "Terminal, logs and code",
    purpose: "CLI output, live logs, highlighted code.",
    seenIn: ["landing:terminal-transcript", "swarm:machine-log-viewer", "galileo:cli-log", "viz:code-reader"],
    variants: ["status transcript", "log viewer", "gateway log", "code reader"],
    states: ["streaming", "idle", "loading", "offline"],
    Demo: TerminalDemo,
  },
  {
    id: "instrument-readout",
    name: "Instrument readouts and legends",
    purpose: "Dense physics readouts and legends.",
    seenIn: [
      "viz:instrument-readout-panel",
      "viz:element-legend",
      "viz:flight-readout",
      "viz:overlay-legend-card",
      "viz:world-labels",
      "viz:targeting-reticle",
    ],
    variants: ["astrophysics", "chemistry", "flight", "overlay legend", "element legend", "labels", "reticle"],
    states: ["emitting", "≥ partial"],
    Demo: InstrumentsDemo,
  },
  {
    id: "rollout-matrix",
    name: "Rollout matrix",
    purpose: "Stage x lane matrix of projects.",
    seenIn: ["viz:rollout-matrix"],
    variants: ["lane tints"],
    states: ["empty cell", "no matches"],
    Demo: RolloutMatrixDemo,
  },
  {
    id: "avatars",
    name: "Avatars and group",
    purpose: "Identify people and agents.",
    seenIn: ["swarm:avatar-group", "client:avatar-group"],
    variants: ["single", "group", "agent blob"],
    states: ["loading"],
    Demo: AvatarsDemo,
  },
  {
    id: "provenance-method-note",
    name: "Provenance label and method footnote",
    purpose: "Mark every number as live, mock, illustrative or sample, and state its method, unit, scope and window.",
    seenIn: [
      "landing:mono-meta-line (method footnote, reassurance)",
      "client:space-breadcrumb (mock data vs live host badge)",
      "landing:status-badge (sample)",
      "landing:data-table (illustrative QER)",
      "viz:empty-offline-error-states (measurement unavailable)",
    ],
    variants: [
      "live host badge (localhost:5002)",
      "mock data badge",
      "illustrative ledger note",
      "sample card badge",
      "method footnote under a chart",
      "Unavailable with a link to the method",
    ],
    states: ["live", "mock", "illustrative", "unavailable"],
    Demo: ProvenanceDemo,
  },
  {
    id: "trust-boundary",
    name: "Local vs sent trust panel",
    purpose: "Show what stays on this machine and what leaves the space.",
    seenIn: [
      "space-ui:storage-map-split",
      "space-ui:usage-reporting-status",
      "galileo:architecture-diagrams (trust boundaries)",
      "viz:space-drift-header (LOCAL ONLY)",
      "viz:product-attribution-row",
    ],
    variants: [
      "storage map: local vs portable",
      "usage reporting: on, blocked, pending, off",
      "trust boundary diagram: localhost vs acme.localhost",
      "FILES STAY LOCAL header tag",
    ],
    states: ["on", "blocked", "pending", "off"],
    Demo: TrustBoundaryDemo,
  },
  {
    id: "term-card",
    name: "Term card with use and avoid",
    purpose: "Teach one term: its definition, correct use and the older wording it replaces.",
    seenIn: ["viz:glossary-term-card"],
    variants: ["product name", "everyday work term", "setup term", "collision resolution"],
    states: ["static"],
    Demo: TermCardDemo,
  },
];
