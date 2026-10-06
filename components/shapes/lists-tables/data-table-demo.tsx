"use client";

// Live demo for the data-table shape: every variant (spaces, sessions, files, quarter
// ledger, comparison matrix, folder listing, state tree, recent work, CSV reader) and the
// empty, loading and hover states, wired for sort, row open and CSV export.
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import {
  ACTIVITY,
  ACTIVITY_META,
  CURRENT_USER,
  FILE_SAMPLES,
  FILE_TREE,
  GALILEO_SOURCES,
  MODELS,
  PORTFOLIO_WINDOWS,
  PRICING_NOTE,
  PRICING_PLANS,
  PROJECT_BY_ID,
  RUNTIME_BY_ID,
  SESSIONS,
  SPACES,
  ago,
  minutesAgo,
  type Session,
} from "@/lib/fixtures";
import { formatCompact, formatCurrency, formatDateTime, formatNumber, formatRatio, pluralize } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import { StateChip } from "@/components/ui/status";
import { TabChips } from "@/components/ui/segmented";
import { DataTable, ExportCsvButton, Pager, TableToolbar, pageSummary, sortRows, toCsv, type DataColumn, type SortState } from "./data-table";
import { FilesTable, SpacesTable, type FileTableRow, type SpaceTableRow } from "./collection-tables";
import { ComparisonMatrix, FolderListing, KeyValueTable, RecentWorkTable, type FolderEntry, type RecentWorkRow } from "./static-tables";
import { CsvReader, TreeTable, parseCsv, type TreeRow } from "./readers";
import { DemoBlock, ProvenanceNote, logoFor } from "./demo-kit";

/* ============================================================================ sessions */

const PAGE_SIZE = 8;

/** Cursor reports usage only in part, so its sessions carry no cost (RUNTIME_CAPABILITIES). */
const costOf = (s: Session): number | null => (s.runtime === "cursor" ? null : s.cost);

const SESSION_COLUMNS: DataColumn<Session>[] = [
  {
    id: "started",
    header: "Started",
    rowHeader: true,
    firstDir: "desc",
    sortValue: (s) => s.startedAt,
    cell: (s) => <span className="whitespace-nowrap">{formatDateTime(s.startedAt)}</span>,
  },
  { id: "project", header: "Project", sortValue: (s) => s.projectId, cell: (s) => <span className="font-medium text-ink">{s.projectId}</span> },
  { id: "source", header: "Source", sortValue: (s) => RUNTIME_BY_ID[s.runtime].label, cell: (s) => <RuntimeTag id={logoFor(s.runtime)} dot /> },
  {
    id: "model",
    header: "Model",
    hideBelow: "md",
    sortValue: (s) => MODELS[s.model].label,
    cell: (s) => (
      <Badge mono size="xs" tone="neutral">
        {MODELS[s.model].label}
      </Badge>
    ),
  },
  { id: "tokens", header: "Tokens", numeric: true, firstDir: "desc", sortValue: (s) => s.tokens, cell: (s) => <span className="text-ink">{formatCompact(s.tokens)}</span> },
  {
    id: "cost",
    header: "Cost",
    numeric: true,
    firstDir: "desc",
    sortValue: costOf,
    cell: (s) => (costOf(s) === null ? <span className="text-ink-faint">Unavailable*</span> : formatCurrency(costOf(s))),
  },
  { id: "turns", header: "Turns", numeric: true, firstDir: "desc", hideBelow: "lg", sortValue: (s) => s.turns, cell: (s) => formatNumber(s.turns) },
  { id: "duration", header: "Duration", numeric: true, firstDir: "desc", sortValue: (s) => s.durationSec, cell: (s) => s.duration },
];

function sessionsCsv(rows: Session[]): string {
  return toCsv(
    ["session_id", "started_utc", "project", "source", "model", "tokens", "cost_usd", "turns", "tool_calls", "duration_sec"],
    rows.map((s) => [s.id, s.startedAt, s.projectId, s.runtime, s.model, s.tokens, costOf(s), s.turns, s.toolCalls, s.durationSec]),
  );
}

const DETAIL_ID = "session-detail";

function SessionDetail({ session, onClose }: { session: Session; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [session.id]);
  const cost = costOf(session);
  return (
    <section
      ref={ref}
      id={DETAIL_ID}
      tabIndex={-1}
      aria-labelledby="session-detail-title"
      className="rise rounded-[14px] border border-hair bg-s2 p-4 outline-none sm:p-5"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Session · {session.id}</p>
          <h4 id="session-detail-title" className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">
            {session.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <StateChip kind="run" state={session.open ? "running" : "ok"} label={session.open ? "Open" : "Ended"} />
          <IconButton aria-label="Close session details" size="sm" onClick={onClose}>
            <X />
          </IconButton>
        </div>
      </header>
      <KeyValueTable
        caption={`Details for session ${session.id}`}
        pairs={[
          ["Project", PROJECT_BY_ID[session.projectId]?.displayName ?? session.projectId],
          ["Source", <RuntimeTag key="rt" id={logoFor(session.runtime)} />],
          ["Model", MODELS[session.model].label],
          ["Started", `${formatDateTime(session.startedAt)} UTC · ${session.startedAgo}`],
          ["Last activity", session.lastActivity],
          ["Tokens", `${formatNumber(session.tokens)} (${formatCompact(session.inputTokens)} in · ${formatCompact(session.outputTokens)} out)`],
          ["Cost", cost === null ? "Unavailable: this source does not report cost" : `${formatCurrency(cost)} (mock estimate)`],
          ["Turns · tool calls", `${formatNumber(session.turns)} · ${formatNumber(session.toolCalls)}`],
          ["Duration", session.duration],
          ["Last message", session.summary],
        ]}
      />
      <p className="mt-3 text-[11.5px] text-ink-faint">Press Escape to close.</p>
    </section>
  );
}

function SessionsTable() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ id: "started", dir: "desc" });
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const terms = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const filtered = useMemo(
    () =>
      SESSIONS.filter((s) => {
        if (!terms.length) return true;
        const text = [s.id, s.title, s.projectId, s.runtime, RUNTIME_BY_ID[s.runtime].label, MODELS[s.model].label].join(" ").toLowerCase();
        return terms.every((t) => text.includes(t));
      }),
    [terms],
  );
  const sorted = useMemo(() => sortRows(filtered, SESSION_COLUMNS, sort), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const pageRows = sorted.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const openSession = open ? SESSIONS.find((s) => s.id === open) ?? null : null;
  const caption = terms.length
    ? `${pluralize(filtered.length, "matching session")} of ${SESSIONS.length} loaded`
    : `${SESSIONS.length} sessions loaded (all time)`;
  const wrap = useRef<HTMLDivElement>(null);

  /** Close the detail and put focus back on the row that opened it. */
  function close() {
    const id = open;
    setOpen(null);
    if (id) requestAnimationFrame(() => wrap.current?.querySelector<HTMLElement>(`[data-row-open="${id}"]`)?.focus());
  }

  return (
    <div
      ref={wrap}
      className="flex flex-col gap-3"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Sessions</h4>
          <p role="status" className="mt-0.5 text-[12.5px] text-ink-dim">
            {caption}
            {sorted.length > PAGE_SIZE ? ` · ${pageSummary(current, PAGE_SIZE, sorted.length).toLowerCase()}` : ""}
          </p>
        </div>
      </div>
      <TableToolbar
        query={query}
        onQuery={(q) => {
          setQuery(q);
          setPage(0);
        }}
        searchLabel="Search loaded sessions"
        placeholder="Search loaded sessions…"
        actions={<ExportCsvButton filename="sessions.csv" build={() => sessionsCsv(sorted)} />}
      />
      <DataTable
        label="Sessions"
        columns={SESSION_COLUMNS}
        rows={pageRows}
        rowKey={(s) => s.id}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(0);
        }}
        onRowOpen={(s) => setOpen((cur) => (cur === s.id ? null : s.id))}
        rowOpenLabel={(s) => `Session ${s.id}: ${s.title}`}
        rowDetailId={DETAIL_ID}
        activeKey={open}
        minWidth={640}
        empty={
          <span className="flex flex-col items-center gap-1">
            <span className="font-medium text-ink">No matching sessions</span>
            <span>No loaded sessions match this search for the selected sources.</span>
          </span>
        }
        caption="* Partial: Cursor reports usage in part, so its cost is Unavailable rather than counted as zero. Costs are mock estimates."
      />
      {sorted.length > PAGE_SIZE ? <Pager page={current} pages={pages} onPage={setPage} label="Session pages" /> : null}
      {openSession ? <SessionDetail session={openSession} onClose={close} /> : null}
    </div>
  );
}

/* ============================================================================ spaces */

const SPACE_ROWS: SpaceTableRow[] = SPACES.map((s) => ({
  id: s.id,
  name: s.name,
  host: s.host,
  role: s.owner === CURRENT_USER.id ? "personal" : "shared",
  runtime: s.runtime,
  status: s.status,
}));

/** What opening a space row does, in the space lifecycle words. */
function openNote(r: SpaceTableRow): string {
  if (r.status === "Running") return `Open space: ${r.name}`;
  if (r.status === "Stopped") return `${r.name} is stopped. Start space to open it.`;
  if (r.status === "failed") return `${r.name}: Space could not start. Try again from its page.`;
  if (r.status === null) return `${r.name}: status is still loading.`;
  return `${r.name} is ${r.status.toLowerCase()}. Open space once it is running.`;
}

function SpacesDemo() {
  const [rows, setRows] = useState(SPACE_ROWS);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const shown = rows.filter(
    (r) =>
      (filter === "all" || (filter === "running" ? r.status === "Running" : filter === "personal" ? r.role === "personal" : r.role === "shared")) &&
      (!query.trim() || r.name.includes(query.trim().toLowerCase())),
  );
  const filtered = filter !== "all" || query.trim() !== "";

  return (
    <div className="flex flex-col gap-3">
      <TableToolbar
        query={query}
        onQuery={setQuery}
        searchLabel="Filter spaces by name"
        placeholder="Filter spaces…"
        filters={
          <TabChips
            size="sm"
            aria-label="Show spaces"
            value={filter}
            onChange={setFilter}
            items={[
              { id: "all", label: "All", count: rows.length },
              { id: "running", label: "Running", count: rows.filter((r) => r.status === "Running").length },
              { id: "personal", label: "Personal", count: rows.filter((r) => r.role === "personal").length },
              { id: "shared", label: "Shared", count: rows.filter((r) => r.role === "shared").length },
            ]}
          />
        }
        actions={
          rows.length < SPACE_ROWS.length ? (
            <Button
              size="sm"
              variant="subtle"
              leadingIcon={<RotateCcw />}
              onClick={() => {
                setRows(SPACE_ROWS);
                setNote("Demo rows restored");
              }}
            >
              Restore demo rows
            </Button>
          ) : null
        }
      />
      <SpacesTable
        rows={shown}
        busyId={busy}
        activeId={active}
        emptyText={filtered ? "No spaces match this filter." : "No spaces found."}
        onOpen={(r) => {
          setActive(r.id);
          setNote(openNote(r));
        }}
        onDelete={(r) => {
          setBusy(r.id);
          setNote(`Deleting ${r.name}…`);
          timer.current = setTimeout(() => {
            setRows((list) => list.filter((x) => x.id !== r.id));
            setBusy(null);
            setNote(`Deleted ${r.name} from this demo`);
          }, 1100);
        }}
      />
      <p role="status" className="min-h-[18px] font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        {note}
      </p>
    </div>
  );
}

/* ============================================================================ files */

const FILE_ROWS: FileTableRow[] = [
  { id: "f1", name: FILE_SAMPLES.readme.path, type: "md", size: FILE_SAMPLES.readme.size, added: ago(minutesAgo(42)) },
  { id: "f2", name: FILE_SAMPLES.typescript.path, type: "ts", size: FILE_SAMPLES.typescript.size, added: ago(minutesAgo(130)) },
  { id: "f3", name: FILE_SAMPLES.json.path, type: "json", size: FILE_SAMPLES.json.size, added: ago(minutesAgo(1500)) },
  { id: "f4", name: FILE_SAMPLES.csv.path, type: "csv", size: FILE_SAMPLES.csv.size, added: ago(minutesAgo(2900)) },
  {
    id: "f5",
    name: "docs/architecture.md",
    type: "md",
    size: FILE_TREE.children?.find((c) => c.name === "docs")?.children?.[0]?.size ?? null,
    added: ago(minutesAgo(4400)),
  },
  { id: "f6", name: "Space setup guide", type: "link", size: null, added: ago(minutesAgo(8800)), href: "https://docs.example.com/spaces/setup" },
];

function FilesDemo() {
  const [opening, setOpening] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <FilesTable
        rows={FILE_ROWS}
        openingId={opening}
        onOpen={(r) => {
          setOpening(r.id);
          setNote("");
          timer.current = setTimeout(() => {
            setOpening(null);
            setNote(`${r.name} opened in the viewer`);
          }, 900);
        }}
      />
      <p role="status" className="min-h-[18px] font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        {note}
      </p>
    </div>
  );
}

/* ============================================================================ ledger and matrix */

type LedgerRow = { month: string; minted: number; cost: number };

const june = PORTFOLIO_WINDOWS.find((w) => w.id === "pw_june");
const LEDGER: LedgerRow[] = [
  { month: "April", minted: 15770, cost: 5020 },
  { month: "May", minted: 26310, cost: 6480 },
  { month: "June", minted: june?.mintedQ ?? 38000, cost: june?.totalCost ?? 6830 },
];

const LEDGER_COLUMNS: DataColumn<LedgerRow>[] = [
  { id: "month", header: "Month", rowHeader: true, cell: (r) => <span className="text-[14px] text-ink">{r.month}</span> },
  { id: "minted", header: "Minted Q", numeric: true, cell: (r) => <span className="text-[13px] text-ink">{formatNumber(r.minted)}</span> },
  { id: "cost", header: "All-in cost", numeric: true, cell: (r) => <span className="text-[13px]">{formatCurrency(r.cost, 0)}</span> },
  { id: "qer", header: "QER", numeric: true, cell: (r) => <span className="text-[13px] font-medium text-ink">{formatRatio(r.minted / r.cost)}</span> },
];

/** Research article table: one outcome, three runtimes, very different token counts (model-relativity). */
type ResearchRow = { runtime: string; tokens: number; cost: number; v: number };

const RESEARCH: ResearchRow[] = [
  { runtime: "Codex", tokens: 96100, cost: 0.33, v: 0.92 },
  { runtime: "Claude Code", tokens: 182400, cost: 0.61, v: 0.92 },
  { runtime: "OpenClaw", tokens: 411800, cost: 0.48, v: 0.92 },
];

const RESEARCH_COLUMNS: DataColumn<ResearchRow>[] = [
  { id: "runtime", header: "Runtime", rowHeader: true, cell: (r) => <span className="text-[14px] text-ink">{r.runtime}</span> },
  { id: "tokens", header: "Tokens", numeric: true, cell: (r) => <span className="text-[13px] font-medium text-ink">{formatNumber(r.tokens)}</span> },
  { id: "cost", header: "Cost", numeric: true, cell: (r) => <span className="text-[13px]">{formatCurrency(r.cost)}</span> },
  { id: "v", header: "V", numeric: true, cell: (r) => <span className="text-[13px]">{formatNumber(r.v, 2)}</span> },
];

const MATRIX_COLUMNS = PRICING_PLANS.map((p) => ({
  title: p.name,
  tone: p.color,
  tag: p.id === "managed" ? "Hosted by us" : p.id === "open-source" ? "Self-hosted" : "Your estate, your brand",
}));

const MATRIX_ROWS = [
  { label: "Where it runs", cells: ["Your machine", "Our cloud", "Your cloud or on-prem"] },
  { label: "Who operates it", cells: ["You do", "We do", "Your team, with our support"] },
  { label: "One-click deploy", cells: ["CLI", "Yes", "Yes, inside your estate"] },
  { label: "Observability", cells: ["Full", "Full", "Full"] },
  { label: "Branding", cells: ["XO", "XO", "Yours"] },
  { label: "Support", cells: ["Community", "Email", "Named support"] },
];

/* ============================================================================ folder and recent */

const stamp = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
const notes = GALILEO_SOURCES.find((s) => s.name === "notes");
const NOTES_URL = notes?.url ?? "http://notes.localhost:4100/";

const FOLDER: FolderEntry[] = [
  { name: "drafts", kind: "folder", size: null, modified: stamp(minutesAgo(1116)), href: `${NOTES_URL}drafts/` },
  { name: "glossary.md", kind: "file", size: 1229, modified: stamp(minutesAgo(4697)), href: `${NOTES_URL}glossary.md` },
  { name: "index.md", kind: "file", size: 529, modified: stamp(minutesAgo(4697)), href: `${NOTES_URL}index.md` },
  { name: "papers.md", kind: "file", size: 2867, modified: stamp(minutesAgo(4697)), href: `${NOTES_URL}papers.md` },
  { name: "snapshots.md", kind: "file", size: 2048, modified: stamp(minutesAgo(4697)), href: `${NOTES_URL}snapshots.md` },
  { name: "weighted-checks.md", kind: "file", size: 3379, modified: stamp(minutesAgo(4573)), href: `${NOTES_URL}weighted-checks.md` },
];

function describe(e: (typeof ACTIVITY)[number]): string {
  switch (e.type) {
    case "file.edited":
      return `Edited ${e.detail}`;
    case "todo.completed":
      return `Step completed: ${e.detail}`;
    case "session.started":
      return `Started a session: ${e.detail}`;
    case "session.ended":
      return `Ended a session ${e.detail.replace(/^Ended /, "")}`;
    default:
      return `${ACTIVITY_META[e.type].label}: ${e.detail}`;
  }
}

/** The newest events a runtime did inside a session, as the visualizer's recent work table lists them. */
const RECENT: RecentWorkRow[] = ACTIVITY.filter((e) => e.runtime !== null)
  .slice(0, 8)
  .map((e) => ({
    id: e.id,
    what: describe(e),
    runtime: e.runtime ? RUNTIME_BY_ID[e.runtime].label : e.actor,
    project: e.projectId,
    when: e.ago,
  }));

function FolderAndRecent() {
  const [note, setNote] = useState("");
  const [recentNote, setRecentNote] = useState("");
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <DemoBlock label="Folder listing · galileo files source">
          <FolderListing
            folder="notes"
            origin={NOTES_URL}
            entries={FOLDER}
            onOpen={(entry, e) => {
              e.preventDefault();
              setNote(`Would open ${entry.href}`);
            }}
          />
          <p role="status" className="min-h-[16px] font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">
            {note}
          </p>
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-8">
          <DemoBlock label="Folder listing · empty folder">
            <FolderListing folder="drafts" origin={`${NOTES_URL}drafts/`} entries={[]} />
          </DemoBlock>
          <DemoBlock label="Recent work · empty">
            <RecentWorkTable rows={[]} />
          </DemoBlock>
        </div>
      </div>
      <DemoBlock label="Recent work · hover (second row) · open a row" aside="8 newest events">
        <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-2">
          <RecentWorkTable rows={RECENT} hoverId={RECENT[1]?.id} onOpen={(r) => setRecentNote(`Open project ${r.project} →`)} />
        </div>
        <p role="status" className="min-h-[16px] font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">
          {recentNote}
        </p>
      </DemoBlock>
    </div>
  );
}

/* ============================================================================ state tree */

const STATE_TREE: TreeRow[] = [
  {
    id: "cache",
    name: "cache",
    kind: "folder",
    purpose: "Ephemeral activity heartbeats",
    size: null,
    age: "12s ago",
    children: [
      { id: "cache/heartbeat.json", name: "heartbeat.json", kind: "file", purpose: "Watcher liveness", size: 214, age: "12s ago" },
      { id: "cache/open-now.json", name: "open-now.json", kind: "file", purpose: "Open now heartbeat for each project", size: 1434, age: "12s ago" },
    ],
  },
  {
    id: "config",
    name: "config",
    kind: "folder",
    purpose: "Saved settings for this space",
    size: null,
    age: "6h ago",
    children: [
      { id: "config/credentials.env", name: "credentials.env", kind: "file", purpose: "Saved environment values", size: 1126, age: "2d ago", masked: true },
      { id: "config/connectors.json", name: "connectors.json", kind: "file", purpose: "Connector choices and polling", size: 2355, age: "3d ago" },
      { id: "config/jobs.json", name: "jobs.json", kind: "file", purpose: "Saved jobs and schedules", size: 1946, age: "6h ago" },
    ],
  },
  {
    id: "cursors",
    name: "cursors",
    kind: "folder",
    purpose: "Read cursors so feeds resume where they stopped",
    size: null,
    age: "3m ago",
    children: [
      { id: "cursors/activity.cursor", name: "activity.cursor", kind: "file", purpose: "Activity feed position", size: 96, age: "3m ago" },
      { id: "cursors/inbox.cursor", name: "inbox.cursor", kind: "file", purpose: "Inbox feed position", size: 88, age: "3m ago" },
    ],
  },
  {
    id: "locks",
    name: "locks",
    kind: "folder",
    purpose: "Coordination locks",
    size: null,
    age: "1m ago",
    children: [{ id: "locks/sync.lock", name: "sync.lock", kind: "file", purpose: "Held while peers sync", size: 64, age: "1m ago" }],
  },
  { id: "watcher.log", name: "watcher.log", kind: "file", purpose: "Watcher log, rotated daily", size: null, age: "1m ago" },
];

/* ============================================================================ states */

const col = (id: string) => SESSION_COLUMNS.find((c) => c.id === id) as DataColumn<Session>;

/** "Top sessions": the heaviest sessions by tokens, as the Space dashboard ranks them. */
const TOP_COLUMNS: DataColumn<Session>[] = [
  { ...col("project"), rowHeader: true },
  { ...col("source"), hideBelow: "sm" },
  col("tokens"),
  { ...col("cost"), hideBelow: "sm" },
];
const TOP_WIDE: DataColumn<Session>[] = [{ ...col("project"), rowHeader: true }, col("source"), col("model"), col("tokens"), col("cost"), col("duration")];
const TOP_ROWS = [...SESSIONS].sort((a, b) => b.tokens - a.tokens).slice(0, 5);

/* ============================================================================ demo */

const CSV_ROWS = parseCsv(FILE_SAMPLES.csv.content);
const CSV_PREVIEW = CSV_ROWS.slice(0, 25);

export function DataTableDemo() {
  const [statesSort, setStatesSort] = useState<SortState>({ id: "tokens", dir: "desc" });
  return (
    <div className="flex flex-col gap-10">
      <DemoBlock label="Sessions · sort, paginate, open a row, export CSV">
        <SessionsTable />
      </DemoBlock>

      <DemoBlock label="Spaces · filter, copy ID, delete (row busy), open">
        <SpacesDemo />
      </DemoBlock>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DemoBlock label="Spaces · mobile cards · pending status and failure">
          <SpacesTable
            layout="cards"
            rows={[
              { ...SPACE_ROWS[1], status: "Running" },
              { ...SPACE_ROWS[3], status: "failed" },
              { ...SPACE_ROWS[0], status: null },
            ]}
          />
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-6">
          <DemoBlock label="Spaces · loading">
            <SpacesTable layout="table" rows={[]} loading minWidth={400} />
          </DemoBlock>
          <DemoBlock label="Spaces · empty">
            <SpacesTable layout="table" rows={[]} minWidth={400} />
          </DemoBlock>
        </div>
      </div>

      <DemoBlock label="Files · open a file (opening), open a link">
        <FilesDemo />
      </DemoBlock>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <DemoBlock label="Files · loading">
          <FilesTable rows={[]} state="loading" />
        </DemoBlock>
        <DemoBlock label="Files · empty">
          <FilesTable rows={[]} />
        </DemoBlock>
        <DemoBlock label="Files · error">
          <FilesTable rows={[]} state="error" onRetry={() => undefined} />
        </DemoBlock>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <DemoBlock label="Quarter ledger · QER emphasized">
            <DataTable
              label="A worked quarter: minted quirqs, all-in cost and the quirq efficiency ratio"
              look="ledger"
              density="compact"
              columns={LEDGER_COLUMNS}
              rows={LEDGER}
              rowKey={(r) => r.month}
              minWidth={340}
            />
            <ProvenanceNote kind="illustrative">
              Window: one calendar month per row · QER = minted quirqs per USD of all-in cost · method {june?.method}
            </ProvenanceNote>
          </DemoBlock>
          <DemoBlock label="Research table · one outcome, three runtimes">
            <DataTable
              label="One support ticket solved to the same verified completion on three runtimes"
              look="ledger"
              density="compact"
              columns={RESEARCH_COLUMNS}
              rows={RESEARCH}
              rowKey={(r) => r.runtime}
              minWidth={340}
            />
            <ProvenanceNote kind="illustrative">Same V on each run · tokens and cost are usage, never quirqs</ProvenanceNote>
          </DemoBlock>
        </div>
        <DemoBlock label="Comparison matrix · 3 offerings × 6 rows">
          <ComparisonMatrix caption="How the three XO offerings compare" columns={MATRIX_COLUMNS} rows={MATRIX_ROWS} minWidth={520} />
          <ProvenanceNote kind="illustrative">{PRICING_NOTE}</ProvenanceNote>
        </DemoBlock>
      </div>

      <FolderAndRecent />

      <DemoBlock label="Technical details · state tree · expand folders (arrow keys work)" aside="On disk now · mock">
        <TreeTable label="State tree" rows={STATE_TREE} defaultOpen={["cache", "config"]} cappedAt={500} />
      </DemoBlock>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DemoBlock label="State tree · loading · columns collapse when narrow">
          <TreeTable label="State tree" rows={[]} state="loading" />
        </DemoBlock>
        <DemoBlock label="State tree · unavailable">
          <TreeTable label="State tree" rows={[]} state="unavailable" />
        </DemoBlock>
      </div>

      <DemoBlock label="CSV reader · zebra, sticky head, truncated preview" aside="Gap day reads Unavailable">
        <CsvReader name={FILE_SAMPLES.csv.path.split("/").pop() ?? "usage.csv"} rows={CSV_PREVIEW} sourceRows={CSV_ROWS.length} pageSize={14} maxHeight={480} />
      </DemoBlock>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemoBlock label="State · loading">
          <DataTable label="Top sessions loading" columns={TOP_COLUMNS} rows={[]} rowKey={(s) => s.id} loading loadingRows={4} minWidth={240} />
        </DemoBlock>
        <DemoBlock label="State · empty">
          <DataTable
            label="Top sessions in this window"
            columns={TOP_COLUMNS}
            rows={[]}
            rowKey={(s) => s.id}
            minWidth={240}
            empty={
              <span className="flex flex-col items-center gap-1">
                <span className="font-medium text-ink">No sessions in this window</span>
                <span>Widen the time window or turn on more sources.</span>
              </span>
            }
          />
        </DemoBlock>
        <DemoBlock label="State · hover (second row) · top sessions by tokens" className="lg:col-span-2">
          <DataTable
            label="Top sessions by tokens"
            columns={TOP_WIDE}
            rows={TOP_ROWS}
            rowKey={(s) => s.id}
            hoverKey={TOP_ROWS[1]?.id}
            sort={statesSort}
            onSortChange={setStatesSort}
            minWidth={520}
            density="compact"
          />
        </DemoBlock>
      </div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        Mock data · times are UTC · tokens and cost are a usage meter, never quirqs
      </p>
    </div>
  );
}
