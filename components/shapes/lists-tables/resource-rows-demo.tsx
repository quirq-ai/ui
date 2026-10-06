"use client";

// Live demo for the resource-rows shape: galileo sources (Open, Remove, polling), project
// catalog rows with their drawer, a folder app list, polled connections (Poll now), jobs
// (Run now, Results), the inbox (new, seen, done, Mark seen) and the sharing rail (Apply).
import { useEffect, useRef, useState } from "react";
import {
  ACTIVITY,
  CONNECTORS,
  CURRENT_USER,
  GALILEO,
  GALILEO_SOURCES,
  INBOX,
  JOB_RUNS,
  JOBS,
  PROJECTS,
  SESSIONS,
  SPACE_BY_ID,
  TODOS,
  TODO_STATUS_META,
  type GalileoSource,
  type Job,
} from "@/lib/fixtures";
import { formatNumber, pluralize } from "@/lib/format";
import { Count } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { StatusDot } from "@/components/ui/status";
import { DemoBlock } from "./demo-kit";
import { DrawerPanel, FolderRow, PollingNote, ProjectRow, ProjectRowSkeletons, SourceGroup, SourceRow, type FolderRowData, type ProjectRowData, type SourceRowData } from "./resource-rows";
import {
  ConnectionRow,
  ConnectionsList,
  InboxRow,
  InboxSkeleton,
  JOB_RESULT_META,
  JobResultPill,
  JobRow,
  SharingRow,
  type ConnectionRowData,
  type InboxRowData,
  type JobResultKind,
  type JobRowData,
  type SharingRowData,
} from "./feed-rows";

function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
}

function Note({ children }: { children: string }) {
  return (
    <p role="status" className="min-h-[16px] font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">
      {children}
    </p>
  );
}

/* ============================================================================ sources */

const toRow = (s: GalileoSource): SourceRowData => ({
  name: s.name,
  detail: s.type === "port" ? `localhost:${s.port}` : s.path ?? "",
  state: s.type === "port" ? (s.up ? "answering" : "not answering") : s.up ? s.kind ?? "missing" : "missing",
  href: s.url,
});

function SourcesDemo() {
  const later = useLater();
  const [rows, setRows] = useState(() => GALILEO_SOURCES.map(toRow));
  const [removing, setRemoving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => (n + 1) % 5), 1000);
    return () => clearInterval(t);
  }, []);

  function remove(s: SourceRowData) {
    setRemoving(s.name);
    setErrors((e) => ({ ...e, [s.name]: "" }));
    later(() => {
      setRemoving(null);
      if (s.name === "billing") {
        setErrors((e) => ({ ...e, billing: "Could not remove billing: galileo answered 409. Try again." }));
      } else {
        setRows((list) => list.filter((r) => r.name !== s.name));
        setNote(`Removed ${s.name}`);
      }
    }, 900);
  }

  const ports = rows.filter((r) => r.state === "answering" || r.state === "not answering");
  const files = rows.filter((r) => !ports.includes(r));
  const render = (r: SourceRowData) => (
    <SourceRow key={r.name} source={r} removing={removing === r.name} error={errors[r.name] || null} onRemove={remove} onOpen={(x) => setNote(`Open ${x.href}`)} />
  );

  return (
    <div className="flex flex-col gap-8">
      <DemoBlock label="Source rows · ports · Open, Remove, polling" aside="Remove billing to see a failure">
        <SourceGroup title="Ports" count={ports.length} emptyText="No ports yet. Add one by its number, such as 5173." aside={<PollingNote checked={tick === 0 ? "just now" : `${tick}s ago`} every="5 s" />}>
          {ports.map(render)}
        </SourceGroup>
        <Note>{note || `galileo ${GALILEO.version} on port ${GALILEO.port} · each source gets ${GALILEO.pattern}`}</Note>
      </DemoBlock>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DemoBlock label="Source rows · files · narrow, detail on a second row">
          <SourceGroup title="Files" count={files.length} emptyText="No files yet. Add a file or a folder by its path, such as ~/notes.">
            {files.map(render)}
          </SourceGroup>
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-8">
          <DemoBlock label="Source group · empty">
            <SourceGroup title="Ports" count={0} emptyText="No ports yet. Add one by its number, such as 5173." />
          </DemoBlock>
          <DemoBlock label="Folder list · open, locked and scaffolded">
            <FolderListDemo />
          </DemoBlock>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================ projects */

const CATALOG = PROJECTS.slice(0, 5);

function projectRow(id: string): ProjectRowData {
  const p = PROJECTS.find((x) => x.id === id)!;
  return {
    id: p.id,
    name: p.displayName,
    slug: p.github?.repo ?? "local only",
    description: p.description,
    live: p.openSessions > 0,
    counts: `${formatNumber(p.files)} files · ${pluralize(p.sessions, "session")}`,
    lastActive: p.lastActive,
    tone: p.color,
  };
}

function ProjectDrawer({ id }: { id: string }) {
  const steps = TODOS.filter((t) => t.projectId === id);
  const open = SESSIONS.filter((s) => s.projectId === id && s.open);
  const events = ACTIVITY.filter((e) => e.projectId === id).slice(0, 3);
  return (
    <div className="grid grid-cols-1 gap-2.5 @min-[640px]:grid-cols-3">
      <DrawerPanel title="Steps" count={steps.length}>
        {steps.length ? (
          <ul className="flex flex-col gap-1">
            {steps.slice(0, 4).map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <StatusDot status={t.status === "completed" ? "up" : t.status === "in_progress" ? "busy" : t.status === "blocked" ? "warn" : "idle"} size="xs" halo={false} />
                <span className="truncate">{t.content}</span>
                <span className="sr-only">{TODO_STATUS_META[t.status].label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-faint">No steps recorded.</p>
        )}
      </DrawerPanel>
      <DrawerPanel title="Open sessions" count={open.length}>
        {open.length ? (
          <ul className="flex flex-col gap-1">
            {open.map((s) => (
              <li key={s.id} className="truncate">
                <span className="font-mono text-[11px] text-ink-faint">{s.id}</span> {s.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-faint">No open sessions.</p>
        )}
      </DrawerPanel>
      <DrawerPanel title="Recent events" count={events.length}>
        {events.length ? (
          <ul className="flex flex-col gap-1">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span className="truncate">{e.label}</span>
                <span className="shrink-0 font-mono text-[11px] text-ink-faint">{e.ago}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-faint">Nothing recent.</p>
        )}
      </DrawerPanel>
    </div>
  );
}

function ProjectsDemo() {
  const [open, setOpen] = useState<string | null>("xo-space");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = CATALOG.filter((p) => !q || p.id.includes(q) || p.description.toLowerCase().includes(q));
  const hidden = CATALOG.length - visible.length;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput size="sm" shape="field" aria-label="Filter projects" placeholder="Filter projects…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-[240px]" />
        <span role="status" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          {hidden ? `${hidden} hidden by filter` : `${CATALOG.length} projects`}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((p) => (
          <ProjectRow
            key={p.id}
            project={projectRow(p.id)}
            open={open === p.id}
            hover={p.id === "galileo" && open !== "galileo"}
            onToggle={(id) => setOpen((cur) => (cur === id ? null : id))}
            drawer={<ProjectDrawer id={p.id} />}
          />
        ))}
        {visible.length === 0 ? <li className="rounded-[12px] border border-dashed border-hair px-4 py-5 text-center text-[13px] text-ink-faint">No projects match this filter.</li> : null}
      </ul>
    </div>
  );
}

/* ============================================================================ folder list */

const FOLDERS: FolderRowData[] = ["xo-space", "galileo", "research-notes", "demo-kit", "billing-api"].map((id) => {
  const p = PROJECTS.find((x) => x.id === id)!;
  const space = SPACE_BY_ID[p.spaceId];
  const member = space?.members.includes(CURRENT_USER.id) ?? false;
  return {
    id,
    name: p.displayName,
    // demo-kit is still at Foundation: shown the way a just-scaffolded project reads
    description: p.stage === "Foundation" && p.id === "demo-kit" ? null : p.description,
    tone: p.color,
    locked: !member,
    badge: p.openSessions ? <Count value={p.openSessions} tone="grn" label="open sessions" /> : undefined,
  };
});

function FolderListDemo() {
  const [note, setNote] = useState("");
  return (
    <>
      <ul className="overflow-hidden rounded-[12px] border border-hair-soft bg-s1">
        {FOLDERS.map((f) => (
          <FolderRow key={f.id} folder={f} onOpen={(x) => setNote(`Open ${x.name} →`)} />
        ))}
      </ul>
      <Note>{note}</Note>
    </>
  );
}

/* ============================================================================ connections */

const POLLED: ConnectionRowData[] = CONNECTORS.filter((c) => c.pollEvery && c.status !== "Not connected").map((c) => ({
  id: c.toolkit,
  name: c.displayName,
  account: c.account,
  what: `${c.collectors.join(", ") || "Nothing chosen"} · every ${c.pollEvery}`,
  lastPoll: c.lastPolled ? `last poll ${c.lastPolled}` : "Not polled yet",
  error: c.status === "Needs attention" || (c.note && c.note.includes("rate limited")) ? c.note : null,
}));

function ConnectionsDemo() {
  const later = useLater();
  const [rows, setRows] = useState(POLLED);
  const [polling, setPolling] = useState<string | null>(null);
  const [note, setNote] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <ConnectionsList
        rows={rows}
        spaceName="research-lab"
        renderRow={(r) => (
          <ConnectionRow
            key={r.id}
            row={r}
            polling={polling === r.id}
            onPoll={(x) => {
              setPolling(x.id);
              later(() => {
                setPolling(null);
                setRows((list) => list.map((y) => (y.id === x.id ? { ...y, lastPoll: "last poll just now", error: y.id === "slack" ? y.error : null } : y)));
              }, 1200);
            }}
            onConfigure={(x) => setNote(`Open Setup → Connectors → ${x.name}`)}
          />
        )}
      />
      <Note>{note}</Note>
    </div>
  );
}

/* ============================================================================ jobs */

const RESULT_KIND: Record<string, JobResultKind> = { ok: "succeeded", failed: "failed", running: "running", skipped: "skipped" };

function toJob(j: Job): JobRowData {
  const last = JOB_RUNS.find((r) => r.jobId === j.id && r.status !== "running");
  return {
    id: j.id,
    name: j.name,
    description: j.projectId ? `Runs the ${j.projectId} suite before standup.` : undefined,
    command: j.command,
    cwd: j.projectId ? `~/projects/${j.projectId}` : "~/spaces/research-lab",
    schedule: j.schedule,
    enabled: j.enabled,
    nextRun: j.nextRun,
    result: j.lastResult
      ? {
          kind: RESULT_KIND[j.lastResult.status],
          ago: j.lastResult.ago,
          duration: j.lastResult.duration,
          exit: j.lastResult.exit,
          label: j.lastResult.status === "skipped" && j.lastResult.reason === "disabled" ? "Skipped (job is off)" : undefined,
        }
      : { kind: "never" },
    output: last?.output,
  };
}

function JobsDemo() {
  const later = useLater();
  const [jobs, setJobs] = useState(() => JOBS.map(toJob));
  const [note, setNote] = useState("");
  function run(job: JobRowData) {
    setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, result: { kind: "running" } } : j)));
    later(() => {
      setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, result: { kind: "succeeded", ago: "just now", duration: "2.1s", exit: 0 }, output: "Done in 2.1s, exit 0." } : j)));
    }, 1600);
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="overflow-hidden rounded-[12px] border border-hair-soft bg-s2">
        {jobs.slice(0, 3).map((j) => (
          <JobRow key={j.id} job={j} onRunNow={run} onEdit={(x) => setNote(`Edit ${x.name}`)} onDelete={(x) => setNote(`Delete ${x.name}? Confirm in Setup → Commands.`)} />
        ))}
      </ul>
      <Note>{note}</Note>
    </div>
  );
}

const ALL_KINDS = Object.keys(JOB_RESULT_META) as JobResultKind[];

/* ============================================================================ inbox */

function InboxDemo() {
  const later = useLater();
  const [items, setItems] = useState<InboxRowData[]>(() =>
    INBOX.map((i) => ({
      id: i.id,
      kind: i.kind,
      status: i.status,
      title: i.title,
      detail: `${i.detail}\nFrom ${i.actor}`,
      project: i.projectId,
      when: i.ago,
      failure: i.kind === "job.failed" || i.kind === "connector.attention",
    })),
  );
  const [filter, setFilter] = useState<"open" | "done" | "all">("all");
  const [open, setOpen] = useState<string | null>(INBOX[1]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const counts = {
    new: items.filter((i) => i.status === "new").length,
    open: items.filter((i) => i.status !== "done").length,
    done: items.filter((i) => i.status === "done").length,
  };
  const shown = items.filter((i) => (filter === "all" ? true : filter === "done" ? i.status === "done" : i.status !== "done"));
  const set = (id: string, status: InboxRowData["status"]) => setItems((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">Inbox</span>
        <span role="status" className="text-[12.5px] text-ink-dim">
          {counts.new} new · {counts.open} open · {counts.done} done
        </span>
        <span className="flex-1" />
        <Segmented
          size="sm"
          aria-label="Show inbox items"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "Open" },
            { value: "done", label: "Done" },
            { value: "all", label: "All" },
          ]}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || counts.new === 0}
          loading={busy}
          loadingLabel="Marking…"
          onClick={() => {
            setBusy(true);
            later(() => {
              setItems((list) => list.map((i) => (i.status === "new" ? { ...i, status: "seen" } : i)));
              setBusy(false);
            }, 700);
          }}
        >
          Mark all seen
        </Button>
      </div>
      {shown.length ? (
        <ul className="flex flex-col gap-2">
          {shown.map((i) => (
            <InboxRow
              key={i.id}
              item={i}
              busy={busy}
              open={open === i.id}
              onToggle={(id) => setOpen((cur) => (cur === id ? null : id))}
              onMarkSeen={(id) => set(id, "seen")}
              onMarkDone={(id) => set(id, "done")}
            />
          ))}
        </ul>
      ) : (
        <EmptyInbox text={filter === "done" ? "Nothing done yet." : "Nothing in the inbox."} />
      )}
    </div>
  );
}

function EmptyInbox({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-hair bg-s2 px-5 py-8 text-center">
      <b className="block text-[15px] font-semibold text-ink">{text}</b>
      <p className="mx-auto mt-1.5 max-w-[52ch] text-[12.5px] leading-relaxed text-ink-faint">{sub ?? "New sessions, steps, connector updates and job results land here."}</p>
    </div>
  );
}

/* ============================================================================ sharing */

const SHARED: SharingRowData[] = ["telescope", "research-notes", "xo-space"].map((id, i) => {
  const p = PROJECTS.find((x) => x.id === id)!;
  return {
    id,
    name: p.displayName,
    repo: p.github ? p.github.repo : `peer · ${p.peers.length} ${p.peers.length === 1 ? "person" : "people"}`,
    checked: i === 0 ? "1m ago" : i === 1 ? "4m ago" : "12m ago",
    pending: i === 0 ? 2 : 0,
  };
});

function SharingDemo() {
  const later = useLater();
  const [rows, setRows] = useState(SHARED);
  const [selected, setSelected] = useState<string>("telescope");
  const [applying, setApplying] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <h5 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Shared projects</h5>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <SharingRow
            key={r.id}
            row={r}
            selected={selected === r.id}
            applying={applying === r.id}
            onSelect={setSelected}
            onApply={(x) => {
              setApplying(x.id);
              later(() => {
                setRows((list) => list.map((y) => (y.id === x.id ? { ...y, pending: 0, checked: "just now" } : y)));
                setApplying(null);
              }, 1200);
            }}
          />
        ))}
      </ul>
      <div className="rounded-[12px] border border-dashed border-hair px-3.5 py-3 text-[12.5px] text-ink-faint">
        Incoming: nothing shared from this machine yet. Use “+ Share a project” above.
      </div>
    </div>
  );
}

/* ============================================================================ demo */

export function ResourceRowsDemo() {
  return (
    <div className="flex flex-col gap-10">
      <SourcesDemo />

      <DemoBlock label="Project rows · open, hover, filter">
        <ProjectsDemo />
      </DemoBlock>
      <DemoBlock label="Project rows · loading">
        <ProjectRowSkeletons count={2} />
      </DemoBlock>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DemoBlock label="Polled connections · Poll now, errors">
          <ConnectionsDemo />
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-6">
          <DemoBlock label="Polled connections · loading">
            <ConnectionsList rows={[]} state="loading" renderRow={() => null} />
          </DemoBlock>
          <DemoBlock label="Polled connections · unreachable">
            <ConnectionsList rows={[]} state="unreachable" spaceName="research-lab" renderRow={() => null} />
          </DemoBlock>
          <DemoBlock label="Polled connections · empty">
            <ConnectionsList rows={[]} renderRow={() => null} />
          </DemoBlock>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <DemoBlock label="Job rows · full Setup row · Run now, Results">
          <JobsDemo />
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-6">
          <DemoBlock label="Job rows · compact Inbox row">
            <ul className="overflow-hidden rounded-[12px] border border-hair-soft bg-s2">
              {JOBS.slice(3, 5).map((j) => (
                <JobRow key={j.id} job={toJob(j)} variant="compact" />
              ))}
            </ul>
          </DemoBlock>
          <DemoBlock label="Job results · every state">
            <div className="flex flex-wrap gap-2">
              {ALL_KINDS.map((k) => (
                <JobResultPill key={k} result={{ kind: k, ago: k === "never" || k === "running" ? undefined : "3h ago" }} />
              ))}
            </div>
          </DemoBlock>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <DemoBlock label="Inbox rows · new, seen, done · open a row, Mark seen">
          <InboxDemo />
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-6">
          <DemoBlock label="Inbox · loading">
            <InboxSkeleton count={3} />
          </DemoBlock>
          <DemoBlock label="Inbox · stale">
            <div className="rounded-r-[10px] border-l-[3px] border-red bg-s2 px-4 py-3 text-[12.5px] text-ink-dim">
              research-lab is unreachable · showing the last good read
            </div>
          </DemoBlock>
          <DemoBlock label="Inbox · empty">
            <EmptyInbox text="Nothing in the inbox." />
          </DemoBlock>
          <DemoBlock label="Sharing rail · Apply, selected, in sync">
            <SharingDemo />
          </DemoBlock>
        </div>
      </div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Mock data · times relative to Fri 2 Oct, 09:30 UTC</p>
    </div>
  );
}
