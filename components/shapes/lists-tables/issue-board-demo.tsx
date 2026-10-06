"use client";

// Live demo for the issue-board shape: the carousel lane board with a project select and
// refresh (open any card on GitHub), the issue list panel with filter and Check GitHub, and
// the loading, stale, error, no remote and empty lane states.
import { useEffect, useRef, useState } from "react";
import { PEOPLE, PROJECT_BY_ID, PROJECTS, WORK_ITEM_LABELS, WORK_ITEMS, type WorkItem } from "@/lib/fixtures";
import { Select } from "@/components/ui/field";
import { DemoBlock } from "./demo-kit";
import { IssueBoard, IssueListPanel, type BoardIssue, type BoardState, type IssueListState } from "./issue-board";

const toIssue = (w: WorkItem): BoardIssue => ({
  id: w.id,
  number: w.number,
  title: w.title,
  labels: w.labels.map((l) => ({ name: l, tone: WORK_ITEM_LABELS[l]?.color ?? "neutral" })),
  state: w.status,
  assignee: w.assignee ? PEOPLE[w.assignee].name : null,
  tracked: w.tracked,
  url: w.url,
  updated: w.updatedAgo,
});

const ISSUES_BY_PROJECT: Record<string, BoardIssue[]> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, WORK_ITEMS.filter((w) => w.projectId === p.id).map(toIssue)]),
);

const PICKABLE = ["all", "xo-space", "galileo", "xo-swarm", "landing", "research-notes"];
const ALL_ISSUES = WORK_ITEMS.map(toIssue);

function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
}

function BoardDemo() {
  const later = useLater();
  const [project, setProject] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [checked, setChecked] = useState("20m ago");
  const all = project === "all";
  const p = all ? null : PROJECT_BY_ID[project];
  const state: BoardState = all || p?.github ? "ready" : "no_remote";
  return (
    <IssueBoard
      repo={all ? "all quirq-ai repositories" : p?.github?.repo ?? null}
      issues={all ? ALL_ISSUES : ISSUES_BY_PROJECT[project] ?? []}
      state={state}
      checked={checked}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        later(() => {
          setRefreshing(false);
          setChecked("just now");
        }, 1000);
      }}
      picker={
        <div className="w-[180px]">
          <Select size="sm" aria-label="Project" value={project} onChange={(e) => setProject(e.target.value)}>
            {PICKABLE.map((id) => (
              <option key={id} value={id}>
                {id === "all" ? "All projects" : id}
              </option>
            ))}
          </Select>
        </div>
      }
    />
  );
}

function ListDemo() {
  const later = useLater();
  const [state, setState] = useState<IssueListState>("ready");
  const [checked, setChecked] = useState("20m ago");
  const project = PROJECT_BY_ID["xo-space"];
  return (
    <IssueListPanel
      repo={project?.github?.repo ?? null}
      issues={ISSUES_BY_PROJECT["xo-space"] ?? []}
      state={state}
      checked={checked}
      onCheck={() => {
        setState("asking");
        later(() => {
          setState("ready");
          setChecked("just now");
        }, 1100);
      }}
    />
  );
}

const LIST_STATES: { state: IssueListState; label: string }[] = [
  { state: "loading", label: "Loading" },
  { state: "no_remote", label: "No remote" },
  { state: "not_polled", label: "Not polled" },
  { state: "issues_off", label: "Issues off" },
];

export function IssueBoardDemo() {
  const galileo = PROJECT_BY_ID["galileo"];
  return (
    <div className="flex flex-col gap-10">
      <DemoBlock label="Carousel lanes · pick a project, refresh, open a card on GitHub" aside="Pick xo-space for an empty Todo lane">
        <BoardDemo />
      </DemoBlock>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <DemoBlock label="Issue list panel · filter, Open, Closed, All, Check GitHub">
          <ListDemo />
          <DemoBlock label="Issue list · last poll failed">
            <IssueListPanel repo={galileo?.github?.repo ?? null} issues={ISSUES_BY_PROJECT["galileo"] ?? []} state="failed" checked="5m ago" failure="rate_limited 5m ago" />
          </DemoBlock>
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-4">
          {LIST_STATES.map((s) => (
            <DemoBlock key={s.state} label={`Issue list · ${s.label}`}>
              <IssueListPanel repo={s.state === "no_remote" ? null : "quirq-ai/xo-docs"} issues={[]} state={s.state} />
            </DemoBlock>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-8">
          <DemoBlock label="Board · loading">
            <IssueBoard repo="quirq-ai/xo-swarm" issues={[]} state="loading" />
          </DemoBlock>
          <DemoBlock label="Board · error">
            <IssueBoard repo="quirq-ai/xo-swarm" issues={[]} state="error" onRefresh={() => undefined} />
          </DemoBlock>
          <DemoBlock label="Board · not fetched yet">
            <IssueBoard repo="quirq-ai/demo-kit" issues={[]} state="not_fetched" />
          </DemoBlock>
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <DemoBlock label="Board · stale mirror · empty lane">
            <IssueBoard repo="quirq-ai/landing" issues={(ISSUES_BY_PROJECT["landing"] ?? []).slice(0, 2)} state="stale" checked="3h ago" />
          </DemoBlock>
          <DemoBlock label="Board · no remote">
            <IssueBoard repo={null} issues={[]} state="no_remote" />
          </DemoBlock>
        </div>
      </div>
    </div>
  );
}
