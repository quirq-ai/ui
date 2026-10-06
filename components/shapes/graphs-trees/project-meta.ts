// Demo-side project metadata shared by the graph and orbit demos: the artifact tag each
// project carries in the Space dashboard (App, One-pager, Docs, Slides, Unknown) and the
// matching graph glyph. Deterministic, derived from fixture ids only.
import type { KGGlyph } from "./knowledge-graph";

export type ProjectTag = "App" | "One-pager" | "Docs" | "Slides" | "Unknown";

export const PROJECT_TAG: Record<string, ProjectTag> = {
  "xo-space": "App",
  galileo: "App",
  "xo-swarm": "App",
  telescope: "App",
  landing: "One-pager",
  "billing-api": "App",
  "research-notes": "Docs",
  "space-drift": "Unknown",
  "ops-runbooks": "Docs",
  "xo-docs": "Docs",
  "demo-kit": "Slides",
};

export const TAG_GLYPH: Record<ProjectTag, KGGlyph> = {
  App: "disc",
  "One-pager": "ring",
  Docs: "stack",
  Slides: "slab",
  Unknown: "diamond",
};

export const tagOf = (projectId: string): ProjectTag => PROJECT_TAG[projectId] ?? "Unknown";
