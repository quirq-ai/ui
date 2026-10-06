"use client";

// Issue board: IssueBoard (header with project select and refresh, banners, three lanes),
// IssueLane (a sideways carousel of IssueCards with previous and next), IssueCard (opens
// the issue on GitHub in a new tab) and IssueListPanel (the compact rows view with filter,
// Open, Closed and All, and Check GitHub). Column rule: closed is Completed; open with an
// assignee is In progress; everything else is Todo.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, CircleDashed, CircleDotDashed, RotateCw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/field";
import { Skeleton, Spinner } from "@/components/ui/loaders";
import { Segmented } from "@/components/ui/segmented";
import { toneSoft, type Tone } from "@/components/ui/tones";

export type IssueColumn = "todo" | "in_progress" | "completed";

export type BoardIssue = {
  id: string;
  number: number;
  title: string;
  labels: { name: string; tone: Tone }[];
  state: "open" | "closed";
  assignee: string | null;
  /** linked to a session in this space */
  tracked: boolean;
  url: string;
  updated: string;
};

/** Closed is Completed; open with an assignee is In progress; otherwise Todo. */
export function columnFor(issue: Pick<BoardIssue, "state" | "assignee">): IssueColumn {
  if (issue.state === "closed") return "completed";
  return issue.assignee ? "in_progress" : "todo";
}

export const ISSUE_COLUMNS: { id: IssueColumn; label: string; empty: string; icon: ReactNode; accent: string }[] = [
  { id: "todo", label: "Todo", empty: "Nothing unassigned", icon: <CircleDashed aria-hidden="true" className="size-4 text-ink-faint" />, accent: "text-ink-faint" },
  {
    id: "in_progress",
    label: "In progress",
    empty: "Nobody is assigned to an open issue",
    icon: <CircleDotDashed aria-hidden="true" className="size-4 text-yel" />,
    accent: "text-yel",
  },
  { id: "completed", label: "Completed", empty: "Nothing closed", icon: <CircleCheck aria-hidden="true" className="size-4 text-grn" />, accent: "text-grn" },
];

/* ----------------------------------------------------------------------------- IssueCard */

/** One issue. Opens on GitHub in a new tab. */
export function IssueCard({ issue }: { issue: BoardIssue }) {
  const shown = issue.labels.slice(0, 2);
  const inProgress = columnFor(issue) === "in_progress";
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open issue #${issue.number} on GitHub: ${issue.title}`}
      className={cn(
        "flex h-full flex-col gap-1.5 rounded-[14px]! border bg-s2 px-3 py-3 transition-colors hover:border-hair-strong hover:bg-s3",
        inProgress ? "border-yel/35" : "border-hair",
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] text-ink-faint">#{issue.number}</span>
        {issue.tracked ? <span className="rounded-[3px] border border-hair px-1 font-mono text-[9px] leading-[14px] text-ink-dim">tracked</span> : null}
        {issue.assignee ? (
          <span className="ml-auto">
            <Avatar name={issue.assignee} size="xs" />
          </span>
        ) : null}
      </span>
      <span className="line-clamp-3 text-[13.5px] font-medium leading-snug text-ink">{issue.title}</span>
      {shown.length ? (
        <span className="mt-auto flex flex-wrap items-center gap-1 pt-0.5">
          {shown.map((l) => (
            <span key={l.name} className={cn("rounded-full border px-1.5 text-[10px] leading-[16px]", toneSoft[l.tone])}>
              {l.name}
            </span>
          ))}
          {issue.labels.length > shown.length ? <span className="text-[10px] text-ink-faint">+{issue.labels.length - shown.length}</span> : null}
        </span>
      ) : null}
    </a>
  );
}

/* ----------------------------------------------------------------------------- IssueLane */

export type IssueLaneProps = {
  column: (typeof ISSUE_COLUMNS)[number];
  issues: BoardIssue[];
  loading?: boolean;
};

/** One lane: header with count and arrows, then a sideways list of cards. */
export function IssueLane({ column, issues, loading = false }: IssueLaneProps) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  function measure() {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }
  useEffect(() => {
    measure();
    const el = track.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [issues.length, loading]);

  const scroll = (dir: 1 | -1) => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.current?.scrollBy({ left: dir * 252, behavior: still ? "auto" : "smooth" });
  };
  const labelId = useId();

  return (
    <section aria-labelledby={labelId} className="flex min-w-0 flex-col gap-2">
      <header className="flex items-center gap-2 px-1">
        {column.icon}
        <h4 id={labelId} className="text-[13.5px] font-medium text-ink">
          {column.label}
        </h4>
        <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-ink-dim">
          {loading ? <span aria-label="Loading">…</span> : issues.length}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <IconButton aria-label={`Scroll ${column.label} back`} size="xs" shape="circle" variant="outline" disabled={edges.start} onClick={() => scroll(-1)}>
            <ChevronLeft />
          </IconButton>
          <IconButton aria-label={`Scroll ${column.label} forward`} size="xs" shape="circle" variant="outline" disabled={edges.end} onClick={() => scroll(1)}>
            <ChevronRight />
          </IconButton>
        </span>
      </header>
      {!loading && issues.length === 0 ? (
        <p className="flex min-h-[96px] items-center justify-center rounded-[14px] border border-dashed border-hair text-[12px] text-ink-faint">{column.empty}</p>
      ) : (
        <ul ref={track} onScroll={measure} aria-label={`${column.label} issues`} className="scroll-thin flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1.5">
          {loading
            ? [0, 1, 2].map((i) => (
                <li key={i} className="w-[240px] shrink-0 snap-start rounded-[14px] border border-hair bg-s2 p-3" aria-hidden="true">
                  <Skeleton width={48} height={9} radius={3} />
                  <Skeleton height={12} radius={4} className="mt-2.5" />
                  <Skeleton width="66%" height={12} radius={4} className="mt-1.5" />
                </li>
              ))
            : issues.map((issue) => (
                <li key={issue.id} className="w-[240px] shrink-0 snap-start">
                  <IssueCard issue={issue} />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------------- IssueBoard */

export type BoardState = "ready" | "loading" | "stale" | "error" | "no_remote" | "issues_off" | "not_fetched";

const EMPTY_BOARD: Partial<Record<BoardState, string>> = {
  no_remote: "This project has no GitHub remote, so there are no issues to mirror.",
  issues_off: "Issues are turned off for this repository.",
  not_fetched: "This project's issues haven't been fetched yet. Refresh to pull them now.",
};

export type IssueBoardProps = {
  issues: BoardIssue[];
  /** "quirq-ai/xo-space" */
  repo: string | null;
  state?: BoardState;
  /** Project picker node (a Select). */
  picker?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** "checked 20m ago" */
  checked?: string;
  errorText?: string;
  className?: string;
};

/** Work items in Todo, In progress and Completed lanes. */
export function IssueBoard({ issues, repo, state = "ready", picker, onRefresh, refreshing = false, checked, errorText, className }: IssueBoardProps) {
  const tracked = issues.filter((i) => i.tracked).length;
  const empty = EMPTY_BOARD[state];
  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-[18px] border border-hair-soft bg-[#0f0f11] p-4 sm:p-5", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Issues</h3>
          <p role="status" className="mt-0.5 text-[12.5px] text-ink-dim">
            {state === "loading"
              ? "Loading issues…"
              : state === "error"
                ? `${repo ?? "No GitHub remote"} · issues unavailable`
                : repo && !empty
                ? `${issues.length} ${issues.length === 1 ? "issue" : "issues"} in ${repo} · ${tracked} tracked${checked ? ` · checked ${checked}` : ""}`
                : repo ?? "No GitHub remote"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {picker}
          <Button size="sm" variant="secondary" leadingIcon={<RotateCw />} loading={refreshing} loadingLabel="Refreshing…" onClick={onRefresh} disabled={state === "no_remote"}>
            Refresh
          </Button>
        </div>
      </header>
      {state === "stale" ? (
        <p className="flex items-start gap-2 rounded-[10px] border border-yel/30 bg-yel/[0.07] px-3 py-2 text-[12.5px] text-yel">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          The mirror is stale. Showing issues from the last good read{checked ? `, checked ${checked}` : ""}.
        </p>
      ) : null}
      {state === "error" ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-[10px] border border-red/30 bg-red/[0.07] px-3 py-2 text-[12.5px] text-red">
          <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">{errorText ?? "Could not read issues. GitHub answered 403: rate limited."}</span>
          <Button size="sm" variant="danger" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      ) : null}
      {empty ? (
        <p className="rounded-[14px] border border-dashed border-hair px-4 py-8 text-center text-[13px] text-ink-dim">{empty}</p>
      ) : state === "error" ? null : (
        <div className="flex flex-col gap-5">
          {ISSUE_COLUMNS.map((col) => (
            <IssueLane key={col.id} column={col} loading={state === "loading"} issues={issues.filter((i) => columnFor(i) === col.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------------- IssueListPanel */

export type IssueListState = "ready" | "loading" | "asking" | "no_remote" | "not_polled" | "issues_off" | "failed";

export type IssueListPanelProps = {
  repo: string | null;
  issues: BoardIssue[];
  state?: IssueListState;
  checked?: string;
  /** "rate_limited 5m ago" */
  failure?: string;
  onCheck?: () => void;
  className?: string;
};

const LIST_STATE_TEXT: Partial<Record<IssueListState, string>> = {
  loading: "Loading issues…",
  asking: "Asking GitHub…",
  no_remote: "No github.com remote. Add a GitHub origin to include this project's issues.",
  not_polled: "Not polled yet.",
  issues_off: "Issues are turned off for this repository on GitHub.",
};

/** Compact issue rows: dot, number, title, labels, state, when. */
export function IssueListPanel({ repo, issues, state = "ready", checked, failure, onCheck, className }: IssueListPanelProps) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<"open" | "closed" | "all">("open");
  const open = issues.filter((i) => i.state === "open");
  const closed = issues.filter((i) => i.state === "closed");
  const q = query.trim().toLowerCase();
  const pool = show === "open" ? open : show === "closed" ? closed : issues;
  const rows = pool.filter((i) => !q || i.title.toLowerCase().includes(q) || String(i.number).includes(q));
  const tracked = open.filter((i) => i.tracked).length;
  const message = LIST_STATE_TEXT[state];

  return (
    <section className={cn("@container min-w-0 rounded-[14px] border border-hair-soft bg-s1", className)}>
      <header className="flex flex-col gap-2.5 border-b border-hair-soft px-3.5 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h4 className="text-[13.5px] font-medium text-ink">
            Issues <span className="text-ink-faint">·</span> <span className="font-mono text-[12px] text-ink-dim">{repo ?? "no remote"}</span>
          </h4>
          {state === "ready" || state === "failed" ? (
            <span className="text-[12px] text-ink-faint">
              {open.length} open · {tracked} tracked{checked ? ` · checked ${checked}` : ""}
            </span>
          ) : null}
        </div>
        {state === "ready" || state === "failed" ? (
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput size="sm" shape="field" aria-label="Filter issues" placeholder="Filter issues…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[180px]" />
            <Segmented
              size="sm"
              aria-label="Issue state"
              value={show}
              onChange={setShow}
              options={[
                { value: "open", label: `Open ${open.length}` },
                { value: "closed", label: `Closed ${closed.length}` },
                { value: "all", label: `All ${issues.length}` },
              ]}
            />
            <Button size="sm" variant="secondary" className="ml-auto" onClick={onCheck}>
              Check GitHub
            </Button>
          </div>
        ) : null}
        {state === "failed" && failure ? <p className="text-[12px] text-red">Last poll failed: {failure}</p> : null}
      </header>
      {message ? (
        <p role="status" className="flex items-center gap-2 px-3.5 py-4 text-[12.5px] text-ink-dim">
          {state === "loading" || state === "asking" ? <Spinner size="sm" label={null} /> : null}
          {message}
        </p>
      ) : rows.length === 0 ? (
        <p role="status" className="px-3.5 py-4 text-[12.5px] text-ink-dim">
          {q ? `Nothing matches '${query.trim()}'.` : show === "open" ? "No open issues." : show === "closed" ? "No closed issues." : "No issues."}
        </p>
      ) : (
        <ul>
          {rows.map((i) => (
            <li key={i.id} className={cn("border-b border-hair-soft last:border-b-0", i.state === "closed" && "opacity-55")}>
              <a
                href={i.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid min-h-[38px] grid-cols-[8px_42px_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-none! px-3.5 py-2 text-[12.5px] transition-colors hover:bg-white/[0.025] @min-[640px]:grid-cols-[8px_42px_minmax(0,1fr)_auto_auto_auto]"
              >
                <span aria-hidden="true" className={cn("size-2 rounded-full border", i.state === "open" ? "border-grn" : "border-ink-faint bg-ink-faint/40")} />
                <span className="font-mono text-[11px] text-ink-faint">#{i.number}</span>
                <span className="min-w-0 text-ink @max-[480px]:line-clamp-2 @min-[480px]:truncate">
                  {i.title}
                  <span className="sr-only"> ({i.state})</span>
                </span>
                <span className="hidden items-center gap-1 @min-[640px]:flex">
                  {i.labels.map((l) => (
                    <span key={l.name} className="rounded-full bg-bg px-1.5 text-[11px] leading-[17px] text-ink-dim">
                      {l.name}
                    </span>
                  ))}
                </span>
                <span className="hidden whitespace-nowrap text-[11.5px] @min-[640px]:block">
                  {i.state === "open" && i.assignee ? <span className="text-yel">in progress · {i.assignee.split(" ")[0]}</span> : <span className="text-ink-faint">{i.state === "closed" ? "closed" : "unassigned"}</span>}
                </span>
                <span className="whitespace-nowrap text-right font-mono text-[11px] text-ink-faint">{i.updated}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
