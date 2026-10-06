"use client";

// Chat history demo: the sidebar wired to a preview (open a row, refresh, start a new chat,
// search, arrow keys between rows), the list layout, and the loading, Space API down, empty
// and refreshing states. Every list is scoped to one space, research-lab, as in the product.
import { useState } from "react";
import { MessageSquare, SquarePen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { StatusDot } from "@/components/ui/status";
import { CURRENT_SPACE, MODELS, PEOPLE, SESSION_BY_ID } from "@/lib/fixtures";
import { DemoCell, DemoGroup } from "./demo-kit";
import { HISTORY_ROWS } from "./demo-data";
import { ChatHistory, type HistoryRow } from "./history";
import { renderInline } from "./prose";
import { useTimers } from "./use-timers";

const BY_ID: Record<string, HistoryRow> = Object.fromEntries(HISTORY_ROWS.map((r) => [r.id, r]));
const RECENT = HISTORY_ROWS.filter((r) => r.group === "Today" || r.group === "Yesterday");

function useRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const { schedule } = useTimers();
  function refresh() {
    setRefreshing(true);
    schedule(() => setRefreshing(false), 1400);
  }
  return { refreshing, refresh };
}

function Preview({ row }: { row: HistoryRow | null }) {
  if (!row) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="inline-grid size-10 place-items-center rounded-[12px] border border-hair bg-s2 text-ink-dim">
          <SquarePen aria-hidden="true" className="size-4" />
        </span>
        <p className="text-[14px] font-medium text-ink">New chat</p>
        <p className="max-w-[40ch] text-[12.5px] leading-relaxed text-ink-faint">
          Pick a project and send a prompt. The conversation appears under Today once the first turn lands.
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full min-w-0 flex-col gap-4 p-5 sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-grid size-9 shrink-0 place-items-center rounded-[10px] border border-hair bg-s3">
          {row.runtime ? <RuntimeLogo id={row.runtime} size={16} decorative /> : <MessageSquare aria-hidden="true" className="size-4" />}
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">{row.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] text-ink-faint">
            <span>{row.project}</span>
            <span aria-hidden="true">·</span>
            <span>{row.runtimeLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{row.time}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {row.live ? (
          <Badge tone="grn" dot>
            Open session
          </Badge>
        ) : (
          <Badge>Closed</Badge>
        )}
        <Badge className="font-mono">{row.id}</Badge>
        <Badge mono>{row.group}</Badge>
      </div>
      <blockquote className="border-l-2 border-hair-strong pl-3 text-[13px] leading-relaxed text-ink-dim">{renderInline(row.preview ?? "")}</blockquote>
      <SessionFacts id={row.id} />
      <p className="mt-auto flex items-center gap-2 text-[11.5px] text-ink-faint">
        <StatusDot status="up" size="xs" />
        {CURRENT_SPACE.name} · {CURRENT_SPACE.status}
      </p>
    </div>
  );
}

/** The session behind a history row: model, turns, tool calls, duration, start and owner. */
function SessionFacts({ id }: { id: string }) {
  const session = SESSION_BY_ID[id];
  if (!session) return null;
  const facts: [string, string][] = [
    ["Model", MODELS[session.model].label],
    ["Turns", String(session.turns)],
    ["Tool calls", String(session.toolCalls)],
    ["Duration", session.duration],
    ["Started", session.startedAgo],
    ["Owner", PEOPLE[session.owner].name],
  ];
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Session · mock data</p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-hair-soft bg-hair-soft sm:grid-cols-3">
        {facts.map(([term, value]) => (
          <div key={term} className="flex min-w-0 flex-col gap-0.5 bg-[#0f0f11] px-3 py-2">
            <dt className="text-[11px] text-ink-faint">{term}</dt>
            <dd className="truncate font-mono text-[12px] tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SidebarWithPreview() {
  const [active, setActive] = useState<string | null>("df1a1a5b");
  const { refreshing, refresh } = useRefresh();
  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-hair-soft bg-[#0f0f11] md:h-[540px] md:flex-row">
      <ChatHistory
        variant="sidebar"
        rows={HISTORY_ROWS}
        activeId={active}
        onOpen={setActive}
        onNewChat={() => setActive(null)}
        onRefresh={refresh}
        refreshing={refreshing}
        searchable
        className="h-[380px] border-b border-hair-soft md:h-full md:w-[284px] md:shrink-0 md:border-b-0 md:border-r"
      />
      <div aria-live="polite" className="min-w-0 flex-1">
        <Preview row={active ? (BY_ID[active] ?? null) : null} />
      </div>
    </div>
  );
}

function ListLayout() {
  const [active, setActive] = useState<string | null>(RECENT[1]?.id ?? null);
  const { refreshing, refresh } = useRefresh();
  return (
    <div className="overflow-hidden rounded-[18px] border border-hair-soft bg-[#0f0f11]">
      <ChatHistory
        variant="list"
        title={`Recent chats in ${CURRENT_SPACE.name}`}
        rows={RECENT}
        activeId={active}
        onOpen={setActive}
        onRefresh={refresh}
        refreshing={refreshing}
        onNewChat={() => setActive(null)}
      />
    </div>
  );
}

export function HistoryDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoGroup title="Sidebar" note={`${CURRENT_SPACE.name} · open a row, refresh, search, or use arrow keys between rows`}>
        <SidebarWithPreview />
      </DemoGroup>
      <DemoGroup title="List" note="Today and yesterday, with the last message">
        <ListLayout />
      </DemoGroup>
      <DemoGroup title="States">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DemoCell caption="loading" surface={false}>
            <ChatHistory variant="sidebar" rows={[]} state="loading" onNewChat={() => {}} onRefresh={() => {}} className="h-[240px] overflow-hidden rounded-[14px] border border-hair-soft md:h-[300px]" />
          </DemoCell>
          <DemoCell caption="space api down" surface={false}>
            <ChatHistory variant="sidebar" rows={[]} state="down" onNewChat={() => {}} onRefresh={() => {}} className="h-[190px] overflow-hidden rounded-[14px] border border-hair-soft md:h-[300px]" />
          </DemoCell>
          <DemoCell caption="empty" surface={false}>
            <ChatHistory variant="sidebar" rows={[]} state="empty" onNewChat={() => {}} onRefresh={() => {}} className="h-[190px] overflow-hidden rounded-[14px] border border-hair-soft md:h-[300px]" />
          </DemoCell>
          <DemoCell caption="refreshing" surface={false}>
            <ChatHistory
              variant="sidebar"
              rows={RECENT.slice(0, 4)}
              activeId={RECENT[0]?.id}
              refreshing
              onNewChat={() => {}}
              onRefresh={() => {}}
              className="h-[240px] overflow-hidden rounded-[14px] border border-hair-soft md:h-[300px]"
            />
          </DemoCell>
        </div>
      </DemoGroup>
    </div>
  );
}
