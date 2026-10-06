"use client";

// Demo: Rollout matrix. Filter by category and search, expand a card (click, Enter, Space;
// Escape collapses), empty cells (striped live, dash elsewhere) and the no-matches state.
import { useMemo, useState } from "react";
import { PROJECTS, PROJECT_LANES, PROJECT_STAGES, ORBIT_CATEGORIES, RUNTIME_BY_ID, SESSIONS, type ColorToken, type ProjectLane } from "@/lib/fixtures";
import { formatNumber, pluralize } from "@/lib/format";
import { TabChips } from "@/components/ui/segmented";
import { SearchInput } from "@/components/ui/field";
import { Caption, Cell } from "./demo-kit";
import { RolloutLegend, RolloutMatrix, type RolloutLane, type RolloutLaneKind, type RolloutProject, type RolloutStage } from "./rollout-matrix";

const KIND: Record<ProjectLane, RolloutLaneKind> = { "Human-led": "human", "Agent-assisted": "assisted", "Live agent": "live" };

const STAGES: RolloutStage[] = PROJECT_STAGES.map((s) => ({ id: s.id, step: s.step, title: s.id, note: s.blurb }));
const LANES: RolloutLane[] = PROJECT_LANES.map((l) => ({ id: l.id, kind: KIND[l.id], title: l.id, note: l.blurb }));

const ROLLOUT: (RolloutProject & { category: string })[] = PROJECTS.map((p) => {
  const own = SESSIONS.filter((s) => s.projectId === p.id).sort((a, b) => (a.lastActivityAt < b.lastActivityAt ? 1 : -1));
  const runtimeId = (own.find((s) => s.open) ?? own[0])?.runtime;
  return {
    id: p.id,
    name: p.displayName,
    category: p.category,
    stageId: p.stage,
    laneId: p.lane,
    latest: p.lastActive,
    color: p.color,
    blurb: p.description,
    runtime: runtimeId ? RUNTIME_BY_ID[runtimeId].label : undefined,
    stats: [
      { label: "Sessions", value: formatNumber(p.sessions) },
      { label: "Open sessions", value: formatNumber(p.openSessions) },
      { label: "Files", value: formatNumber(p.files) },
      { label: "Open work items", value: formatNumber(p.openWorkItems) },
    ],
  };
});

export function RolloutMatrixDemo() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>("xo-space");

  const cat = ORBIT_CATEGORIES.find((c) => c.id === category);
  const accent: ColorToken = cat?.color ?? "blu";
  const label = cat ? cat.id : "all categories";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROLLOUT.filter((p) => (category === "all" || p.category === category) && (!q || `${p.name} ${p.id}`.toLowerCase().includes(q)));
  }, [category, query]);

  const live = shown.filter((p) => p.laneId === "Live agent").length;
  const assisted = shown.filter((p) => p.laneId === "Agent-assisted").length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <TabChips
          size="sm"
          aria-label="Project categories"
          value={category}
          onChange={(id) => setCategory(id)}
          items={[{ id: "all", label: "All", count: ROLLOUT.length }, ...ORBIT_CATEGORIES.map((c) => ({ id: c.id, label: c.id, count: c.projects.length }))]}
        />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Space rollout</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-ink">
              {cat ? cat.id : "All projects"} <span className="text-ink-dim">· live operating state</span>
            </p>
            <p className="mt-1 text-[12.5px] text-ink-dim">
              <strong className="font-semibold text-ink">{live}</strong> live · <strong className="font-semibold text-ink">{assisted}</strong> assisted ·{" "}
              {Math.max(0, shown.length - live - assisted)} human-led
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <SearchInput aria-label="Search projects" placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} size="sm" className="lg:w-[260px]" />
            <RolloutLegend className="lg:flex-nowrap" />
          </div>
        </div>
      </div>

      <Cell label="Variant · lane tints · interaction expand a card (Enter, Space, Escape) · state empty cell (striped in live, dash elsewhere)">
        <RolloutMatrix
          stages={STAGES}
          lanes={LANES}
          projects={shown}
          accent={accent}
          expandedId={expanded}
          onExpandedChange={setExpanded}
          emptyText={query.trim() ? `No projects in ${label} match this search.` : `No projects in ${label}.`}
          label={`Rollout matrix, ${pluralize(shown.length, "project")}`}
        />
      </Cell>

      <div className="space-y-3">
        <Caption>State · no matches</Caption>
        <RolloutMatrix stages={STAGES} lanes={LANES} projects={[]} showGrid={false} emptyText="No projects in Ops match “stripe”." label="Rollout matrix, no matches" />
      </div>
    </div>
  );
}
