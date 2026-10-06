// Demo-only data derived from the shared fixtures. Components never import this file.
import {
  CURRENT_SPACE,
  FILE_TREE,
  ORBIT_CATEGORIES,
  PROJECTS,
  flattenTree,
  type RuntimeId as FixtureRuntimeId,
} from "@/lib/fixtures";
import type { LogoId } from "@/components/ui/runtime-logo";
import type { RootOption } from "./scope-switcher";

/** Fixture runtime ids to logo ids (gemini_cli ships as the gemini glyph). */
export function logoFor(runtime: FixtureRuntimeId): LogoId {
  return runtime === "gemini_cli" ? "gemini" : runtime;
}

/** Graph roots for the current space: its projects, the five categories and a few files. */
export const ROOT_OPTIONS: RootOption[] = [
  ...PROJECTS.filter((p) => p.spaceId === CURRENT_SPACE.id).map((p) => ({ id: `project:${p.id}`, label: p.displayName, kind: "Project" })),
  ...ORBIT_CATEGORIES.map((c) => ({ id: `category:${c.id}`, label: c.id, kind: "Category" })),
  ...flattenTree(FILE_TREE)
    .map((n) => n.node)
    .filter((n) => n.type === "file" && /\.(md|ts|tsx|py)$/.test(n.name))
    .slice(0, 6)
    .map((n) => ({ id: `file:${n.path}`, label: n.name, kind: n.name.split(".").pop()!.toUpperCase() })),
];

export type ResearchCategory = "foundations" | "accounting" | "evidence" | "experiments";

/** Fictional research notes for filter and pager demos. 2 + 2 + 1 + 9 = 14. */
export const RESEARCH_POSTS: { slug: string; title: string; category: ResearchCategory; date: string }[] = [
  { slug: "what-counts-as-a-unit-of-work", title: "What counts as a unit of work", category: "foundations", date: "2 Sep" },
  { slug: "budget-before-the-run", title: "Set the budget before the run", category: "foundations", date: "9 Sep" },
  { slug: "cost-per-delivered-unit", title: "Cost per delivered unit, all in", category: "accounting", date: "11 Sep" },
  { slug: "the-company-dashboard", title: "The company dashboard", category: "accounting", date: "16 Sep" },
  { slug: "agent-context-evidence", title: "Agent context research: the evidence so far", category: "evidence", date: "18 Sep" },
  { slug: "snapshot-diff-methods", title: "Comparing snapshot diff methods", category: "experiments", date: "19 Sep" },
  { slug: "weighted-checks", title: "Weighted checks beat raw line counts", category: "experiments", date: "21 Sep" },
  { slug: "ten-hour-test", title: "The ten-hour test on one workflow", category: "experiments", date: "22 Sep" },
  { slug: "intervention-rate", title: "Reading the intervention rate", category: "experiments", date: "24 Sep" },
  { slug: "runtime-swap", title: "Swapping runtimes mid-project", category: "experiments", date: "25 Sep" },
  { slug: "below-threshold", title: "What happens below threshold", category: "experiments", date: "27 Sep" },
  { slug: "two-models-one-space", title: "Two models, one space", category: "experiments", date: "29 Sep" },
  { slug: "cold-start", title: "Cold starts and the first quirq", category: "experiments", date: "30 Sep" },
  { slug: "owner-valued", title: "Owner-valued work in practice", category: "experiments", date: "1 Oct" },
];
