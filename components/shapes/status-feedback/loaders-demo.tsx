"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingLine, Spinner } from "@/components/ui/loaders";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { Segmented } from "@/components/ui/segmented";
import { StatusDot } from "@/components/ui/status";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatLatency, formatNumber, formatTokens } from "@/lib/format";
import { INBOX, PROJECTS, RUNTIMES, USAGE_SUMMARY } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack, Specimen } from "./parts";
import { CardSkeleton, IosRing, ListSkeleton, MotionFreeze, OrbitLoader, PillSkeleton, StatTileSkeleton } from "./loaders";

const LOGO: Record<string, LogoId> = { claude_code: "claude_code", codex: "codex", openclaw: "openclaw", cursor: "cursor", hermes: "hermes", gemini_cli: "gemini" };

export function LoadersDemo() {
  const [phase, setPhase] = useState<"loading" | "loaded">("loading");
  const [reduced, setReduced] = useState(false);
  const loading = phase === "loading";
  const week = USAGE_SUMMARY["7 days"];
  const runtimes = RUNTIMES.filter((r) => r.installed).slice(0, 3);
  const stats = [
    { k: "Tokens · 7 days", v: formatTokens(week.tokens) },
    { k: "Cost · 7 days", v: formatCurrency(week.cost) },
    { k: "Sessions", v: formatNumber(week.sessions) },
    { k: "Avg latency p50", v: formatLatency(week.avgLatencyMs) },
  ];

  return (
    <DemoStack>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-hair-soft bg-[#0f0f11] px-4 py-3">
        <Segmented
          size="sm"
          aria-label="Data state"
          value={phase}
          onChange={setPhase}
          options={[
            { value: "loading", label: "Loading" },
            { value: "loaded", label: "Loaded" },
          ]}
        />
        <Switch size="sm" label="Preview reduced motion" checked={reduced} onCheckedChange={setReduced} />
      </div>

      <MotionFreeze frozen={reduced} className="flex flex-col gap-8">
        <DemoGroup title="Row skeleton" hint="Rows keep the height of the rows they stand in for.">
          <div className="grid gap-3 lg:grid-cols-2">
            <Specimen label="project rows · 52px">
              {loading ? (
                <ListSkeleton rows={4} height={52} label="Loading projects" />
              ) : (
                <ul className="divide-y divide-hair-soft overflow-hidden rounded-[12px] border border-hair-soft">
                  {PROJECTS.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex h-[52px] min-w-0 items-center gap-3 px-3">
                      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-[7px] border border-hair bg-s3 font-mono text-[10px] uppercase text-ink-dim">
                        {p.displayName.slice(0, 2)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[12.5px] text-ink">{p.displayName}</span>
                        <span className="block truncate text-[11px] text-ink-faint">{p.description}</span>
                      </span>
                      <Badge size="xs" variant="outline">
                        {p.stage}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Specimen>
            <Specimen label="inbox rows · 44px">
              {loading ? (
                <ListSkeleton rows={5} height={44} leading="dot" label="Loading inbox" />
              ) : (
                <ul className="divide-y divide-hair-soft overflow-hidden rounded-[12px] border border-hair-soft">
                  {INBOX.slice(0, 5).map((i) => (
                    <li key={i.id} className="flex h-[44px] min-w-0 items-center gap-3 px-3">
                      <StatusDot status={i.status === "new" ? "busy" : "idle"} size="xs" />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{i.title}</span>
                      <span className="shrink-0 text-[11px] text-ink-faint">{i.ago}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Specimen>
          </div>
        </DemoGroup>

        <DemoGroup title="Card skeleton and stat tiles" hint="Switch to Loaded to see what they stand in for. Values are mock data.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? runtimes.map((r) => <CardSkeleton key={r.id} />)
              : runtimes.map((r) => (
                  <div key={r.id} className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair-soft bg-s1 p-4">
                    <div className="flex items-center gap-3">
                      <RuntimeLogo id={LOGO[r.id]} size={20} tile />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-ink">{r.label}</p>
                        <p className="truncate text-[11px] text-ink-faint">{r.vendor}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-dim">{r.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge size="sm" variant="outline" className="font-mono">
                        v{r.version}
                      </Badge>
                      <Badge size="sm">{formatNumber(r.sessions)} sessions</Badge>
                    </div>
                  </div>
                ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {loading
              ? stats.map((s) => <StatTileSkeleton key={s.k} />)
              : stats.map((s) => (
                  <div key={s.k} className="flex min-w-0 flex-col gap-1.5 rounded-[14px] border border-hair-soft bg-s1 p-4">
                    <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{s.k}</span>
                    <span className="truncate text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-ink">{s.v}</span>
                    <span className="text-[11px] text-ink-dim">Mock data</span>
                  </div>
                ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Caption className="mr-1">pill skeleton</Caption>
            {loading ? (
              <>
                <PillSkeleton width={112} />
                <PillSkeleton width={84} />
              </>
            ) : (
              <>
                <span className="inline-flex h-6 items-center gap-2 rounded-full border border-hair px-2.5 text-[11.5px] text-ink">
                  <StatusDot status="up" size="xs" /> Running
                </span>
                <span className="inline-flex h-6 items-center rounded-full border border-hair px-2.5 text-[11.5px] text-ink-dim">API: Up</span>
              </>
            )}
          </div>
        </DemoGroup>

        <DemoGroup title="Spinners" hint="Caption spinners say what is loading, with an ellipsis.">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Specimen label="caption spinner" bodyClassName="flex flex-col items-start gap-3">
              <LoadingLine>Loading spaces…</LoadingLine>
              <LoadingLine>Loading projects…</LoadingLine>
              <span role="status" className="inline-flex items-center gap-2 text-[12.5px] text-ink-dim">
                <Spinner size="sm" label={null} /> Loading space…
              </span>
            </Specimen>
            <Specimen label="in buttons · sizes" bodyClassName="flex flex-col items-start gap-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" loading loadingLabel="Creating…">
                  Create
                </Button>
                <Button size="sm" variant="primary" loading loadingLabel="Saving…">
                  Save
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" tone="grn" />
              </div>
            </Specimen>
            <Specimen label="iOS ring · list rows">
              <ul className="divide-y divide-hair-soft overflow-hidden rounded-[12px] bg-s2">
                {["Spaces", "Usage", "Billing"].map((row, i) => (
                  <li key={row} className="flex h-11 items-center justify-between px-3.5 text-[13px] text-ink">
                    {row}
                    {i === 0 ? <IosRing size={16} label="Loading spaces" /> : <ChevronRight aria-hidden="true" className="size-4 text-ink-faint" />}
                  </li>
                ))}
              </ul>
            </Specimen>
            <Specimen label="orbit ring · full view" bodyClassName="grid min-h-[140px] place-items-center">
              <OrbitLoader caption="Mapping xo-projects…" />
            </Specimen>
          </div>
        </DemoGroup>
      </MotionFreeze>

      <DemoGroup title="Loading and reduced motion" hint="Under reduced motion the shimmer and spin stop; the shapes stay so layout never jumps.">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="loading · animated">
            <div className="flex flex-col gap-3">
              <ListSkeleton rows={2} height={44} leading="avatar" label="Loading members" />
              <div className="flex items-center gap-4">
                <OrbitLoader size={28} />
                <Spinner size="lg" />
                <IosRing size={20} />
              </div>
            </div>
          </Specimen>
          <Specimen label="reduced motion · frozen">
            <MotionFreeze className="flex flex-col gap-3">
              <ListSkeleton rows={2} height={44} leading="avatar" label="Loading members" />
              <div className="flex items-center gap-4">
                <OrbitLoader size={28} />
                <Spinner size="lg" />
                <IosRing size={20} />
              </div>
            </MotionFreeze>
          </Specimen>
        </div>
      </DemoGroup>
    </DemoStack>
  );
}
