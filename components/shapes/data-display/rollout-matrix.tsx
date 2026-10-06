"use client";

// RolloutMatrix: stages across, lanes down, project cards in the cells. One card expands at a
// time (click, Enter or Space on its header; Escape collapses). Empty live cells are striped,
// other empty cells show a faint dash, and a filtered-out category shows the no-matches line.
// The grid scrolls sideways inside a focusable region on narrow screens, with the lane
// column pinned so every card keeps its lane.
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Activity, FolderOpen, ListChecks, Minus, Plus, Radio, User } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ColorToken } from "@/lib/fixtures";

export type RolloutStage = { id: string; step: number; title: string; note: string };
export type RolloutLaneKind = "human" | "assisted" | "live";
export type RolloutLane = { id: string; kind: RolloutLaneKind; title: string; note: string };

export type RolloutProject = {
  id: string;
  name: string;
  stageId: string;
  laneId: string;
  /** "4m ago" */
  latest: string;
  /** Category color for the progress segments and hover border. */
  color: ColorToken;
  blurb: string;
  stats: { label: string; value: string }[];
  /** Runtime chip in the expanded card, as a display name such as Claude Code. */
  runtime?: string;
};

export type RolloutMatrixProps = {
  stages: RolloutStage[];
  lanes: RolloutLane[];
  projects: RolloutProject[];
  /** Accent for stage header dots. */
  accent?: ColorToken;
  /** Controlled expanded card id; null for none. */
  expandedId?: string | null;
  defaultExpandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  /** Message when projects is empty: "No projects in Ops match this search." */
  emptyText?: string;
  label?: string;
  /** Heading level for the card names. */
  cardHeadingAs?: "h3" | "h4" | "h5";
  /** Draw the grid even when there are no projects (default), or show only the empty line. */
  showGrid?: boolean;
  className?: string;
};

const LANE_ICON: Record<RolloutLaneKind, ReactNode> = {
  human: <User />,
  assisted: <ListChecks />,
  live: <Radio />,
};

const LANE_BG: Record<RolloutLaneKind, string> = {
  human: "",
  assisted: "bg-white/[0.025]",
  live: "bg-white/[0.012]",
};

/* Opaque lane heads (header tint plus lane tint over the ground) so cards scroll under them. */
const LANE_HEAD_BG: Record<RolloutLaneKind, string> = {
  human: "bg-[#0b0c0e]",
  assisted: "bg-[#111214]",
  live: "bg-[#0e0f11]",
};

const COLOR_MIX: Record<ColorToken, string> = {
  red: "color-mix(in srgb, var(--red) 72%, var(--ink))",
  org: "color-mix(in srgb, var(--org) 72%, var(--ink))",
  yel: "color-mix(in srgb, var(--yel) 72%, var(--ink))",
  grn: "color-mix(in srgb, var(--grn) 72%, var(--ink))",
  cyn: "color-mix(in srgb, var(--cyn) 72%, var(--ink))",
  blu: "color-mix(in srgb, var(--blu) 72%, var(--ink))",
  pur: "color-mix(in srgb, var(--pur) 72%, var(--ink))",
};

function Segments({ filled, total, color, className }: { filled: number; total: number; color: ColorToken; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex gap-1", className)}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className="h-[3px] w-3 rounded-[2px]" style={{ background: i <= filled ? COLOR_MIX[color] : "rgba(255,255,255,0.08)" }} />
      ))}
    </span>
  );
}

function ProjectCard({
  project,
  stageIndex,
  stages,
  laneKind,
  expanded,
  onToggle,
  H,
}: {
  project: RolloutProject;
  stageIndex: number;
  stages: RolloutStage[];
  laneKind: RolloutLaneKind;
  expanded: boolean;
  onToggle: () => void;
  H: "h3" | "h4" | "h5";
}) {
  const bodyId = `rollout-${project.id}-detail`;
  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape" && expanded) {
      e.stopPropagation();
      onToggle();
      (e.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
    }
  }
  return (
    <article
      onKeyDown={onKeyDown}
      className={cn(
        "group/card rounded-[10px] border bg-s2 shadow-[0_12px_26px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.025)] transition-[border-color,background-color] duration-150",
        expanded ? "bg-s3" : "border-hair hover:bg-s3",
      )}
      style={expanded ? { borderColor: `color-mix(in srgb, var(--${project.color}) 48%, var(--hair))` } : undefined}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={onToggle}
        className="grid w-full grid-cols-[26px_minmax(0,1fr)_14px] items-center gap-2 rounded-[10px]! p-[10px] pb-0 text-left"
      >
        <span className="grid size-[26px] place-items-center rounded-[8px] border border-hair bg-black/25 text-ink-dim [&_svg]:size-3.5" aria-hidden="true">
          {laneKind === "live" ? <Activity /> : stageIndex > 1 ? <ListChecks /> : <FolderOpen />}
        </span>
        <span className="min-w-0">
          <H className="truncate text-[12.5px] font-semibold text-ink">{project.name}</H>
          <span className="mt-0.5 block truncate text-[10.5px] text-ink-faint">
            <span className="sr-only">{stages[stageIndex]?.title} · </span>Active {project.latest}
          </span>
        </span>
        <span aria-hidden="true" className="text-ink-dim [&_svg]:size-3.5">
          {expanded ? <Minus /> : <Plus />}
        </span>
      </button>
      <Segments filled={stageIndex} total={stages.length} color={project.color} className="ml-[44px] mt-2.5 pb-[10px]" />
      <div id={bodyId} hidden={!expanded} className="mx-[10px] mb-[10px] border-t border-hair-soft pt-3">
        <p className="text-[11.5px] leading-[1.5] text-ink-dim">{project.blurb}</p>
        <dl className="my-3 grid grid-cols-2 gap-1.5">
          {project.stats.map((s) => (
            <div key={s.label} className="rounded-[6px] bg-black/25 px-2 py-1.5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">{s.label}</dt>
              <dd className="mt-0.5 font-mono text-[12px] tabular-nums text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
        {project.runtime ? (
          <span className="inline-flex rounded-[5px] border border-hair px-1.5 py-1 font-mono text-[10px] leading-none text-ink-dim">{project.runtime}</span>
        ) : null}
      </div>
    </article>
  );
}

/** Stage by lane matrix of projects with expandable cards. */
export function RolloutMatrix({
  stages,
  lanes,
  projects,
  accent = "blu",
  expandedId,
  defaultExpandedId = null,
  onExpandedChange,
  emptyText = "No projects match this view.",
  label = "Rollout matrix",
  cardHeadingAs = "h3",
  showGrid = true,
  className,
}: RolloutMatrixProps) {
  const [inner, setInner] = useState<string | null>(defaultExpandedId);
  const open = expandedId !== undefined ? expandedId : inner;

  function toggle(id: string) {
    const next = open === id ? null : id;
    if (expandedId === undefined) setInner(next);
    onExpandedChange?.(next);
  }

  return (
    <div className={cn("min-w-0", className)}>
      {showGrid || projects.length > 0 ? (
        /* The scroller clips the rounded corners, so the grid itself stays unclipped and the
           sticky lane column can pin against the scroller. */
        <div tabIndex={0} role="region" aria-label={`${label}, scrolls sideways`} className="scroll-thin overflow-x-auto rounded-[13px] border border-hair">
          <div
            role="table"
            aria-label={label}
            className="grid min-w-[860px] bg-[#07080a]/80"
            style={{ gridTemplateColumns: `148px repeat(${stages.length}, minmax(176px, 1fr))` }}
          >
            <div role="row" className="contents">
              <div role="columnheader" className="sticky left-0 z-[2] flex min-h-[84px] flex-col justify-center border-b border-r border-hair bg-[#0b0c0e] px-3.5 py-4">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-ink-faint">Rollout order</span>
                <strong className="mt-2 font-mono text-[10px] font-medium text-ink-dim">first → last</strong>
              </div>
              {stages.map((s, i) => (
                <div
                  key={s.id}
                  role="columnheader"
                  className={cn("grid min-h-[84px] grid-cols-[26px_minmax(0,1fr)] gap-x-2.5 border-b border-hair bg-white/[0.018] px-3.5 py-4", i < stages.length - 1 && "border-r")}
                >
                  <span className="grid size-[23px] place-items-center rounded-[7px] bg-ink font-mono text-[10.5px] font-bold text-black">{s.step}</span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">{s.title}</p>
                    <p className="mt-1 text-[10.5px] leading-[1.4] text-ink-faint">{s.note}</p>
                    <Segments filled={i} total={stages.length} color={accent} className="mt-2" />
                  </div>
                </div>
              ))}
            </div>

            {lanes.map((lane, li) => {
              const inLane = projects.filter((p) => p.laneId === lane.id);
              const lastLane = li === lanes.length - 1;
              return (
                <div key={lane.id} role="row" className="contents">
                  <div role="rowheader" className={cn("sticky left-0 z-[2] min-h-[152px] border-r border-hair p-3.5", !lastLane && "border-b", LANE_HEAD_BG[lane.kind])}>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mb-3.5 grid size-[31px] place-items-center rounded-[9px] border bg-black/20 [&_svg]:size-[15px]",
                        lane.kind === "live" ? "border-grn/40 text-grn" : lane.kind === "assisted" ? "border-blu/35 text-blu" : "border-hair text-ink-dim",
                      )}
                    >
                      {LANE_ICON[lane.kind]}
                    </span>
                    <p className="text-[13px] font-semibold text-ink">{lane.title}</p>
                    <p className="mt-1.5 text-[10.5px] leading-[1.45] text-ink-faint">{lane.note}</p>
                    <strong className="mt-3 block font-mono text-[10.5px] font-medium tabular-nums text-ink-dim">
                      {inLane.length} {inLane.length === 1 ? "project" : "projects"}
                    </strong>
                  </div>
                  {stages.map((s, si) => {
                    const entries = inLane.filter((p) => p.stageId === s.id);
                    const empty = entries.length === 0;
                    return (
                      <div
                        key={s.id}
                        role="cell"
                        data-stage={s.id}
                        className={cn(
                          "relative flex min-h-[152px] flex-col gap-2 p-2.5",
                          si < stages.length - 1 && "border-r border-hair",
                          !lastLane && "border-b border-hair",
                          LANE_BG[lane.kind],
                          empty && lane.kind === "live" && "bg-[repeating-linear-gradient(-45deg,transparent,transparent_9px,rgba(255,255,255,0.02)_9px,rgba(255,255,255,0.02)_18px)]",
                        )}
                      >
                        {entries.map((p) => (
                          <ProjectCard
                            key={p.id}
                            project={p}
                            stageIndex={si}
                            stages={stages}
                            laneKind={lane.kind}
                            expanded={open === p.id}
                            onToggle={() => toggle(p.id)}
                            H={cardHeadingAs}
                          />
                        ))}
                        {empty ? (
                          lane.kind === "live" ? (
                            <span className="sr-only">No live projects at this stage</span>
                          ) : (
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                              <span aria-hidden="true" className="block h-px w-3.5 bg-white/15" />
                              <span className="sr-only">No projects</span>
                            </span>
                          )
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {projects.length === 0 ? (
        <p role="status" className={cn(showGrid && "mt-3", "rounded-[10px] border border-dashed border-hair-strong bg-s1/70 px-4 py-3 text-center text-[13px] text-ink-dim")}>
          {emptyText}
        </p>
      ) : null}
    </div>
  );
}

/** Legend for the three lanes, matching the cell tints. */
export function RolloutLegend({ className }: { className?: string }) {
  const items: { kind: RolloutLaneKind; label: string; cls: string }[] = [
    { kind: "human", label: "Human-led", cls: "border-hair bg-white/[0.02]" },
    { kind: "assisted", label: "Agent-assisted", cls: "border-hair bg-white/[0.07]" },
    { kind: "live", label: "Live agent", cls: "border-grn/45 bg-grn/[0.12]" },
  ];
  return (
    <ul aria-label="Operating state legend" className={cn("flex flex-wrap gap-x-[18px] gap-y-2 text-[11px] text-ink-dim", className)}>
      {items.map((it) => (
        <li key={it.kind} className="inline-flex items-center gap-[7px]">
          <i aria-hidden="true" className={cn("h-2 w-[18px] rounded-[3px] border", it.cls)} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
