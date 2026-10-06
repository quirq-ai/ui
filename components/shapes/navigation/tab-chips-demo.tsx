"use client";

import { useState } from "react";
import { INBOX, ORBIT_CATEGORIES, PROJECT_BY_ID, type InboxItem } from "@/lib/fixtures";
import { Caption, DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { RESEARCH_POSTS, type ResearchCategory } from "./demo-data";
import { CategoryTabs, FilterChips, NavPill, StatusTrack } from "./tab-chips";

const NOTES = RESEARCH_POSTS;
const TOPICS: ResearchCategory[] = ["foundations", "accounting", "evidence", "experiments"];
const count = (t: ResearchCategory) => NOTES.filter((n) => n.category === t).length;

type Status = "open" | "done" | "all";
type Source = "all" | "issues" | "connections" | "space" | "sharing" | "agents";

const SOURCE_TEST: Record<Source, (i: InboxItem) => boolean> = {
  all: () => true,
  issues: (i) => i.kind === "github.review_requested" || i.kind === "linear.assigned" || i.kind === "todo.blocked",
  connections: (i) => i.source === "connections",
  space: (i) => i.source === "timeline" || i.source === "jobs",
  sharing: (i) => i.source === "sharing",
  agents: (i) => i.kind === "agent.post" || i.kind.startsWith("session."),
};
const STATUS_TEST: Record<Status, (i: InboxItem) => boolean> = {
  open: (i) => i.status !== "done",
  done: (i) => i.status === "done",
  all: () => true,
};

export function TabChipsDemo() {
  const [topic, setTopic] = useState<ResearchCategory | "all">("all");
  const [kind, setKind] = useState<"all-posts" | "news" | "thoughts">("all-posts");
  const [lens, setLens] = useState<"graph" | "timeline" | "sessions">("graph");
  const [status, setStatus] = useState<Status>("open");
  const [source, setSource] = useState<Source>("all");
  const [year, setYear] = useState<"all" | "2025" | "2026">("all");
  const [category, setCategory] = useState<string>("Engineering");
  const [onSources, setOnSources] = useState(true);

  const notes = topic === "all" ? NOTES : NOTES.filter((n) => n.category === topic);
  const inbox = INBOX.filter((i) => STATUS_TEST[status](i) && SOURCE_TEST[source](i));
  const projects = ORBIT_CATEGORIES.filter((c) => c.id === category).flatMap((c) => c.projects);

  return (
    <DemoStack>
      <DemoCell label="Research filters with counts · single select, client filter">
        <FilterChips<ResearchCategory | "all">
          aria-label="Filter research by topic"
          items={[{ id: "all", label: "All research", count: NOTES.length }, ...TOPICS.map((t) => ({ id: t, label: t, count: count(t) }))]}
          value={topic}
          onChange={setTopic}
        />
        <ol className="grid gap-px overflow-hidden rounded-[14px] border border-hair-soft bg-hair-soft sm:grid-cols-2" aria-live="polite">
          {notes.slice(0, 6).map((n, i) => (
            <li key={n.slug} className="flex items-baseline gap-3 bg-[#0f0f11] px-4 py-3">
              <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 text-[13.5px] text-ink">{n.title}</span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">{n.category}</span>
            </li>
          ))}
        </ol>
        <Readout label="Showing">{notes.length > 6 ? `6 of ${notes.length} notes` : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}</Readout>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Writings filter · small">
          <FilterChips
            size="sm"
            aria-label="Filter writings"
            items={[
              { id: "all-posts", label: "All posts" },
              { id: "news", label: "News" },
              { id: "thoughts", label: "Thoughts" },
            ]}
            value={kind}
            onChange={setKind}
          />
        </DemoCell>
        <DemoCell label="View switcher chips">
          <FilterChips
            size="sm"
            aria-label="Observatory view"
            items={[
              { id: "graph", label: "Graph" },
              { id: "timeline", label: "Timeline" },
              { id: "sessions", label: "Sessions" },
            ]}
            value={lens}
            onChange={setLens}
          />
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Inbox status (joined track) · source pills" note="Both filters narrow the same list.">
        <div className="flex flex-wrap items-center gap-3">
          <StatusTrack
            aria-label="Inbox status"
            items={[
              { id: "open", label: "Open", count: INBOX.filter(STATUS_TEST.open).length },
              { id: "done", label: "Done", count: INBOX.filter(STATUS_TEST.done).length },
              { id: "all", label: "All", count: INBOX.length },
            ]}
            value={status}
            onChange={setStatus}
          />
          <FilterChips
            variant="source"
            aria-label="Inbox source"
            items={(Object.keys(SOURCE_TEST) as Source[]).map((s) => ({
              id: s,
              label: s === "space" ? "Space" : s,
              count: INBOX.filter((i) => STATUS_TEST[status](i) && SOURCE_TEST[s](i)).length,
            }))}
            value={source}
            onChange={setSource}
          />
        </div>
        <ul className="overflow-hidden rounded-[12px] border border-hair-soft bg-[#0f0f11]" aria-live="polite">
          {inbox.length === 0 ? (
            <li className="px-4 py-4 text-[13px] text-ink-dim">Nothing here. Try another source.</li>
          ) : (
            inbox.slice(0, 4).map((i) => (
              <li key={i.id} className="flex items-center gap-3 border-b border-hair-soft px-4 py-2.5 last:border-b-0">
                <span
                  aria-hidden="true"
                  className={i.status === "new" ? "size-1.5 shrink-0 rounded-full bg-blu" : "size-1.5 shrink-0 rounded-full bg-ink-faint/50"}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{i.title}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">{i.ago}</span>
              </li>
            ))
          )}
        </ul>
        <Readout label="Matches">{`${inbox.length} of ${INBOX.length} items`}</Readout>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Year chips · radius 6">
          <FilterChips
            variant="year"
            aria-label="Timeline year"
            items={[
              { id: "all", label: "All dates" },
              { id: "2025", label: "2025" },
              { id: "2026", label: "2026" },
            ]}
            value={year}
            onChange={setYear}
          />
        </DemoCell>

        <DemoCell label="Sources pill · current · hover · default · hidden under 640px">
          <div className="flex flex-wrap items-center gap-4">
            <NavPill href="/sources" current={onSources} onClick={() => setOnSources((v) => !v)}>
              Sources
            </NavPill>
            <NavPill href="/sources" forceHover onClick={() => undefined}>
              Sources
            </NavPill>
            <NavPill href="/sources" onClick={() => undefined}>
              Sources
            </NavPill>
            <NavPill href="/sources" hideOnPhone onClick={() => undefined}>
              Sources
            </NavPill>
            <Caption as="span">{onSources ? "First is aria-current" : "Click the first pill"}</Caption>
          </div>
        </DemoCell>

        <DemoCell label="Chip states · on · hover · default · disabled" note="Static samples.">
          <div inert>
            <FilterChips
              aria-label="Chip state samples"
              items={[
                { id: "on", label: "On", count: 14 },
                { id: "hover", label: "Hover", count: 2 },
                { id: "default", label: "Default", count: 9 },
                { id: "disabled", label: "Disabled", count: 0, disabled: true },
              ]}
              value="on"
              hoverId="hover"
              onChange={() => undefined}
            />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Category underline tabs" note="The bar takes the category color.">
        <CategoryTabs
          aria-label="Project category"
          items={ORBIT_CATEGORIES.map((c) => ({ id: c.id, label: c.id, tone: c.color, count: c.projects.length }))}
          value={category}
          onChange={setCategory}
        />
        <p className="text-[13px] text-ink-dim" aria-live="polite">
          {projects.map((id) => PROJECT_BY_ID[id]?.displayName ?? id).join(" · ")}
        </p>
      </DemoCell>
    </DemoStack>
  );
}
