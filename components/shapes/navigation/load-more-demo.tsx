"use client";

import { useState } from "react";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { toneBg } from "@/components/ui/tones";
import { ACTIVITY, ACTIVITY_META, PROJECT_BY_ID, RUNTIMES, type ToneToken } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { DemoCell, DemoGrid, DemoStack } from "./demo-kit";
import { logoFor } from "./demo-data";
import { Disclosure, ExpandToggle, LoadMoreRow, useFocusOnChange } from "./load-more";

const PAGE = 8;

function dotFor(t: ToneToken) {
  return t === "ink" || t === "ink-dim" || t === "ink-faint" ? "bg-ink-faint" : toneBg[t];
}

const NEWS = [
  { date: "1 Oct", title: "XO Space 0.14.2: galileo sources get their own origins" },
  { date: "26 Sep", title: "Hours-back calculator moves to Machine Speed" },
  { date: "18 Sep", title: "Agent context research: the evidence so far" },
  { date: "9 Sep", title: "Hosted spaces now stop when idle" },
  { date: "2 Sep", title: "OpenClaw sessions show up in the Observatory" },
  { date: "21 Aug", title: "Space dashboard: one sub-nav for every section" },
];

export function LoadMoreDemo() {
  const [count, setCount] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [newsOpen, setNewsOpen] = useState(false);
  const register = useFocusOnChange(focusId);

  const rows = ACTIVITY.slice(0, count);
  const remaining = ACTIVITY.length - count;

  // Mock fetch: the next page arrives after a short wait, then focus moves to its first row.
  const loadOlder = () => {
    setLoading(true);
    window.setTimeout(() => {
      const first = ACTIVITY[count];
      setCount((c) => Math.min(ACTIVITY.length, c + PAGE));
      setLoading(false);
      if (first) setFocusId(first.id);
    }, 700);
  };

  const inUse = RUNTIMES.filter((r) => r.inUse);
  const others = RUNTIMES.filter((r) => r.installed && !r.inUse);

  return (
    <DemoStack>
      <DemoCell label="Load older activity · cursor pagination" note="Click to append 8 rows; focus moves to the first new one.">
        <div className="overflow-hidden rounded-[12px] border border-hair-soft bg-[#0f0f11]">
          <ol aria-label="Space activity" aria-busy={loading || undefined}>
            {rows.map((e) => (
              <li
                key={e.id}
                ref={register(e.id)}
                tabIndex={-1}
                className="grid grid-cols-[8px_minmax(0,1fr)] items-start gap-x-3.5 gap-y-1 border-b border-hair-soft px-[18px] py-3.5 last:border-b-0 focus-visible:outline-offset-[-2px]! sm:grid-cols-[8px_minmax(0,1fr)_auto]"
              >
                <span aria-hidden="true" className={cn("mt-[7px] size-2 rounded-full", dotFor(ACTIVITY_META[e.type].tone))} />
                <div className="min-w-0">
                  <p className="text-[13px] text-ink">
                    <span className="font-medium">{e.label}</span>
                    {e.projectId ? <span className="text-ink-dim"> · {PROJECT_BY_ID[e.projectId]?.displayName}</span> : null}
                  </p>
                  <p className="truncate text-[12px] text-ink-dim">{e.detail}</p>
                  <p className="font-mono text-[11px] text-ink-faint">
                    {e.actor}
                    {e.sessionId ? ` · Session ${e.sessionId}` : ""}
                  </p>
                </div>
                <p className="col-start-2 font-mono text-[11px] tabular-nums text-ink-faint sm:col-start-3 sm:text-right">
                  {e.time} <span className="text-ink-faint">· {e.ago}</span>
                </p>
              </li>
            ))}
          </ol>
          <LoadMoreRow
            state={loading ? "loading" : remaining > 0 ? "more" : "end"}
            label="Load older activity"
            remaining={remaining}
            onLoad={loadOlder}
            endLabel={`End of activity · ${ACTIVITY.length} events`}
          />
        </div>
        {count > PAGE ? (
          <button
            type="button"
            onClick={() => {
              setCount(PAGE);
              setFocusId(null);
            }}
            className="self-start rounded-[6px]! font-mono text-[11px] text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink"
          >
            Reset the feed
          </button>
        ) : null}
      </DemoCell>

      <DemoGrid>
        <DemoCell label="States · more available · loading… · unknown count · end of list">
          <div className="overflow-hidden rounded-[12px] border border-hair-soft bg-[#0f0f11]">
            <LoadMoreRow state="more" label="Load older activity" remaining={50} />
            <LoadMoreRow state="loading" label="Load older activity" />
            <LoadMoreRow state="more" label="Load newer" remaining={null} direction="up" />
            <LoadMoreRow state="end" label="" endLabel="End of activity · 30 events" />
          </div>
        </DemoCell>

        <DemoCell label="Read more news ↓ · show fewer news ↑">
          <ul id="nav-demo-news" className="flex flex-col">
            {(newsOpen ? NEWS : NEWS.slice(0, 3)).map((n) => (
              <li key={n.title} className="flex gap-4 border-b border-hair-soft py-2.5 text-[13.5px]">
                <span className="w-[52px] shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">{n.date}</span>
                <span className="text-ink">{n.title}</span>
              </li>
            ))}
          </ul>
          <ExpandToggle expanded={newsOpen} onToggle={() => setNewsOpen((o) => !o)} controls="nav-demo-news" moreLabel="Read more news" lessLabel="Show fewer news" className="self-start" />
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Other agents disclosure · collapsed until opened">
        <div className="flex flex-col gap-2">
          {inUse.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-[9px] border px-[15px] py-3",
                i === 0 ? "border-white/25 bg-white/[0.03]" : "border-hair-soft",
              )}
            >
              <RuntimeLogo id={logoFor(r.id)} size={18} tile decorative />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-ink">
                  {r.label} <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.12em] text-grn">In use</span>
                </p>
                <p className="text-[12px] text-ink-dim">Installed · {r.version} · {r.sessions} sessions</p>
              </div>
            </div>
          ))}
          <Disclosure label="Other agents" count={others.length}>
            <div className="flex flex-col gap-2">
              {others.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-[9px] border border-hair-soft px-[15px] py-3">
                  <RuntimeLogo id={logoFor(r.id)} size={18} tile decorative />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-ink">{r.label}</p>
                    <p className="text-[12px] text-ink-dim">Installed · {r.version} · not in use</p>
                  </div>
                </div>
              ))}
            </div>
          </Disclosure>
        </div>
      </DemoCell>
    </DemoStack>
  );
}
