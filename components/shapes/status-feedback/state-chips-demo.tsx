"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StateChip, stateMeta, type StateOf } from "@/components/ui/status";
import { TabChips } from "@/components/ui/segmented";
import {
  CONNECTORS,
  PROVENANCE_META,
  QUIRQ_UNAVAILABLE_NOTE,
  SPACE_START_FAILURE,
  SPACE_STATUS_META,
  SPACES,
  SUBSCRIPTION_STATE_META,
  TODOS,
  type ConnectorStatus,
  type SpaceStatus,
} from "@/lib/fixtures";
import { DemoGroup, DemoStack, Specimen } from "./parts";
import {
  SHARING_STATES,
  SharingChip,
  TODO_ORDER,
  TONE_GROUP,
  TONE_GROUP_META,
  TodoStatusRow,
  ToneChip,
  WithDetail,
  type SharingState,
  type ToneGroup,
} from "./state-chips";

const CONNECTOR_KEY: Record<ConnectorStatus, StateOf<"connector">> = {
  "Not connected": "not_connected",
  "Checking…": "checking",
  "On in this space": "on",
  "Off in this space": "off",
  "Needs attention": "needs_attention",
  "Sign-in pending": "sign_in_pending",
  Unavailable: "unavailable",
};

const SPACE_KEY: Record<SpaceStatus, StateOf<"space">> = {
  Creating: "creating",
  Starting: "starting",
  Running: "running",
  Stopping: "stopping",
  Stopped: "stopped",
};

const GROUP_EXAMPLES: Record<ToneGroup, { node: ReactNode; detail: string; key: string }[]> = {
  good: [
    { key: "g1", node: <StateChip kind="space" state="running" prefix="Hosted space" />, detail: SPACE_STATUS_META.Running.blurb },
    { key: "g2", node: <StateChip kind="connector" state="on" />, detail: "GitHub polls every 15 min." },
    { key: "g3", node: <StateChip kind="result" state="accepted" />, detail: "The owner accepted the result." },
  ],
  pending: [
    { key: "p1", node: <StateChip kind="todo" state="in_progress" />, detail: "Claude Code is working on this step." },
    { key: "p2", node: <StateChip kind="todo" state="blocked" />, detail: "Waiting on the June export from finance." },
    { key: "p3", node: <StateChip kind="membership" state="request_pending" />, detail: "Jonah Reyes asked to join 2h ago." },
  ],
  error: [
    { key: "e1", node: <StateChip kind="space" state="failed" />, detail: SPACE_START_FAILURE.body },
    { key: "e2", node: <ToneChip status="down">Connection failed</ToneChip>, detail: "Google Drive did not answer the token refresh." },
    { key: "e3", node: <StateChip kind="subscription" state="needs_attention" />, detail: SUBSCRIPTION_STATE_META["Payment overdue"].blurb },
  ],
  idle: [
    { key: "i1", node: <StateChip kind="space" state="stopped" />, detail: SPACE_STATUS_META.Stopped.blurb },
    { key: "i2", node: <StateChip kind="measurement" state="unavailable" prefix="Measurement" />, detail: QUIRQ_UNAVAILABLE_NOTE },
    { key: "i3", node: <StateChip kind="todo" state="cancelled" />, detail: "Moved to next month's close." },
  ],
};

export function StateChipsDemo() {
  const [filter, setFilter] = useState<string>("all");
  const todos = useMemo(
    () => [...TODOS].sort((a, b) => TODO_ORDER.indexOf(a.status) - TODO_ORDER.indexOf(b.status)),
    [],
  );
  const shown = filter === "all" ? todos : todos.filter((t) => t.status === filter);
  const counts = (s: string) => TODOS.filter((t) => t.status === s).length;

  return (
    // the ui StateChip sets leading-none on a truncating span, which clips descenders; lift it here
    <DemoStack className="[&_[data-state]_.truncate]:leading-[1.3]">
      <DemoGroup title="Tone groups" hint="Hover or focus a chip to read the detail behind the word.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(TONE_GROUP_META) as ToneGroup[]).map((g) => (
            <Specimen key={g} label={`${TONE_GROUP_META[g].label} · ${TONE_GROUP_META[g].blurb}`}>
              <div className="flex flex-col items-start gap-2">
                {GROUP_EXAMPLES[g].map((ex) => (
                  <WithDetail key={ex.key} id={`sc-group-${ex.key}`} detail={ex.detail}>
                    {ex.node}
                  </WithDetail>
                ))}
              </div>
            </Specimen>
          ))}
        </div>
      </DemoGroup>

      <DemoGroup title="Todo statuses" hint="Steps inside sessions. Finished steps are struck through.">
        <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          <TabChips
            size="sm"
            scroll
            aria-label="Filter steps by status"
            value={filter}
            onChange={setFilter}
            items={[
              { id: "all", label: "All", count: TODOS.length },
              ...TODO_ORDER.map((s) => ({ id: s, label: stateMeta("todo", s).label, count: counts(s) })),
            ]}
          />
          {/* scrollable, so it takes focus and arrow keys scroll it */}
          <div tabIndex={0} role="region" aria-label="Steps" className="scroll-thin mt-3 max-h-[300px] overflow-y-auto rounded-[6px]! pr-1">
            <ul className="divide-y divide-hair-soft">
              {shown.map((t) => (
                <li key={t.id}>
                  <TodoStatusRow id={`sc-${t.id}`} status={t.status} content={t.content} runtime={t.runtime} note={t.note} meta={t.updatedAgo} />
                </li>
              ))}
            </ul>
          </div>
          <p className="sr-only" role="status">
            {shown.length} {shown.length === 1 ? "step" : "steps"} shown
          </p>
        </div>
      </DemoGroup>

      <div className="grid gap-8 lg:grid-cols-2">
        <DemoGroup title="Space lifecycle">
          <div className="grid gap-3">
            <Specimen label="hosted space · creating → stopped · failure">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SPACE_KEY) as SpaceStatus[]).map((s) => (
                  <WithDetail key={s} id={`sc-life-${s}`} detail={SPACE_STATUS_META[s].blurb}>
                    <StateChip kind="space" state={SPACE_KEY[s]} prefix="Hosted space" />
                  </WithDetail>
                ))}
                <WithDetail id="sc-life-failed" detail={SPACE_START_FAILURE.body}>
                  <StateChip kind="space" state="failed" />
                </WithDetail>
              </div>
            </Specimen>
            <Specimen label="plain · table cells">
              <ul className="flex flex-col gap-2">
                {SPACES.map((s) => (
                  <li key={s.id} className="flex min-w-0 items-center justify-between gap-3 text-[12.5px]">
                    <span className="truncate font-mono text-ink-dim">{s.name}</span>
                    <StateChip kind="space" state={SPACE_KEY[s.status]} variant="plain" prefix={s.deployment === "hosted" ? "Hosted space" : "Local space"} />
                  </li>
                ))}
              </ul>
            </Specimen>
          </div>
        </DemoGroup>

        <DemoGroup title="Measurement and provenance">
          <div className="grid gap-3">
            <Specimen label="measurement · Available / Unavailable">
              <div className="flex flex-wrap gap-2">
                <WithDetail id="sc-meas-a" detail="V and B are recorded for this unit of work.">
                  <StateChip kind="measurement" state="available" prefix="Measurement" />
                </WithDetail>
                <WithDetail id="sc-meas-u" detail={QUIRQ_UNAVAILABLE_NOTE}>
                  <StateChip kind="measurement" state="unavailable" prefix="Measurement" />
                </WithDetail>
              </div>
              <p className="mt-2.5 text-[12px] text-ink-faint">Missing measurement reads Unavailable, never 0.</p>
            </Specimen>
            <Specimen label="provenance · live · mock · illustrative">
              <div className="flex flex-wrap gap-2">
                {(["live", "mock", "illustrative"] as const).map((p) => (
                  <WithDetail key={p} id={`sc-prov-${p}`} detail={PROVENANCE_META[p].note}>
                    <StateChip kind="provenance" state={p} />
                  </WithDetail>
                ))}
              </div>
            </Specimen>
          </div>
        </DemoGroup>
      </div>

      <DemoGroup title="Sharing state" hint="Blocked sharing states read amber; quiet ones stay grey.">
        <div className="flex flex-wrap gap-2 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          {(Object.keys(SHARING_STATES) as SharingState[]).map((s) => (
            <WithDetail key={s} id={`sc-share-${s}`} detail={SHARING_STATES[s].detail}>
              <SharingChip state={s} count={2} />
            </WithDetail>
          ))}
        </div>
      </DemoGroup>

      <DemoGroup title="Connector state" hint="Connection words per app, with the reason on hover or focus.">
        <ul className="grid gap-x-6 rounded-[14px] border border-hair-soft bg-[#0f0f11] px-4 py-1 md:grid-cols-2">
          {CONNECTORS.map((c) => (
            <li key={c.toolkit} className="flex min-w-0 items-center justify-between gap-3 border-b border-hair-soft py-2.5">
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] text-ink">{c.displayName}</span>
                <span className="block truncate text-[11px] text-ink-faint">{c.account ?? "No account linked"}</span>
              </span>
              <WithDetail id={`sc-conn-${c.toolkit}`} detail={c.note ?? c.description} align="end">
                <StateChip kind="connector" state={CONNECTOR_KEY[c.status]} />
              </WithDetail>
            </li>
          ))}
          <li className="flex flex-wrap items-center gap-2 py-2.5 md:col-span-2">
            <StateChip kind="connector" state="connected" />
            <StateChip kind="connector" state="configured" />
            <StateChip kind="connector" state="not_set" />
          </li>
        </ul>
      </DemoGroup>

      <DemoGroup title="Membership, subscription, result and failure">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Specimen label="membership">
            <div className="flex flex-col items-start gap-2">
              <StateChip kind="membership" state="request_pending" />
              <StateChip kind="membership" state="active_member" />
            </div>
          </Specimen>
          <Specimen label="subscription">
            <div className="flex flex-col items-start gap-2">
              <StateChip kind="subscription" state="trial_active" />
              <StateChip kind="subscription" state="active" />
              <StateChip kind="subscription" state="payment_overdue" />
            </div>
          </Specimen>
          <Specimen label="customer result">
            <div className="flex flex-col items-start gap-2">
              <StateChip kind="result" state="awaiting_review" prefix="Result" />
              <StateChip kind="result" state="accepted" prefix="Result" />
            </div>
          </Specimen>
          <Specimen label="failure">
            <div className="flex flex-col items-start gap-2">
              <StateChip kind="space" state="failed" />
              <ToneChip status="down">Connection failed</ToneChip>
              <StateChip kind="subscription" state="needs_attention" />
            </div>
          </Specimen>
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">
          Readiness is never inferred from payment, and a finished run is not an accepted result. Tone group of each dot:{" "}
          {(["up", "busy", "warn", "down", "idle"] as const).map((s, i) => (
            <span key={s}>
              {i ? ", " : ""}
              {s} is {TONE_GROUP[s]}
            </span>
          ))}
          .
        </p>
      </DemoGroup>
    </DemoStack>
  );
}
