// Demo: rings, donut and gauge. CPU, memory and disk rings per space (ready, Unavailable,
// could not read, loading), token and model donuts (hover a slice or a legend row), the
// error gauge (healthy, above threshold, zero shows only the track, Unavailable) and the
// concentric radar of where each space runs.
import type { ReactNode } from "react";
import { CHAT_TRANSCRIPT, JOB_RUNS, SPACES, SPACE_BY_ID, USAGE_BY_MODEL, USAGE_SUMMARY, type Meter, type Space } from "@/lib/fixtures";
import { formatBytes, formatNumber } from "@/lib/format";
import { StateChip, type DotStatus } from "@/components/ui/status";
import { DemoCell, ProvenanceTag, formatValue } from "./chart-kit";
import { ActivityRings, ConcentricRadar, Donut, RadialGauge, type RingDatum } from "./radial-charts";

function meterDetail(m: Meter): string | undefined {
  if (m.used === null) return undefined;
  return m.unit === "cores" ? `${formatNumber(m.used, 1)} of ${m.total} cores` : `${formatBytes(m.used)} of ${formatBytes(m.total)}`;
}

function ringsFor(space: Space, opts: { diskError?: boolean } = {}): RingDatum[] {
  const u = space.usage;
  return [
    { key: "disk", label: "Disk", used: u.disk.used, total: u.disk.total, color: "var(--pur)", detail: meterDetail(u.disk), error: opts.diskError },
    { key: "memory", label: "Memory", used: u.memory.used, total: u.memory.total, color: "var(--grn)", detail: meterDetail(u.memory) },
    { key: "cpu", label: "CPU", used: u.cpu.used, total: u.cpu.total, color: "var(--cyn)", detail: meterDetail(u.cpu) },
  ];
}

const SPACE_STATE = { Creating: "creating", Starting: "starting", Running: "running", Stopping: "stopping", Stopped: "stopped" } as const;
const BLIP_STATUS: Record<Space["status"], DotStatus> = { Creating: "busy", Starting: "busy", Running: "up", Stopping: "busy", Stopped: "idle" };

function Card({ title, chip, children }: { title: string; chip?: ReactNode; children: ReactNode }) {
  return (
    <div className="h-full rounded-[16px] border border-hair-soft bg-[#141414] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-ink-dim">{title}</span>
        {chip}
      </div>
      {children}
    </div>
  );
}

export function RadialChartsDemo() {
  const ops = SPACE_BY_ID["ws_7f3a9c21e4b0"];
  const lab = SPACE_BY_ID["ws_2b81d0e4"];
  const billing = SPACE_BY_ID["ws_c40e19aa"];
  const pilot = SPACE_BY_ID["ws_e5d7b302"];
  const s = CHAT_TRANSCRIPT.session;

  /* token breakdown for session df1a1a5b: input split by cache behaviour (mock shares) */
  const fresh = Math.round(s.inputTokens * 0.22);
  const writes = Math.round(s.inputTokens * 0.25);
  const reads = s.inputTokens - fresh - writes;

  const toolCalls = USAGE_SUMMARY["7 days"].toolCalls;
  const toolErrors = 21;
  const finished = JOB_RUNS.filter((r) => r.status === "ok" || r.status === "failed");
  const failed = finished.filter((r) => r.status === "failed").length;

  const PROVIDER_RING: Record<Space["provider"], number> = { Laptop: 0, Docker: 1, Coder: 1, "Vercel Sandbox": 2 };
  const ANGLES: Record<string, number> = { ws_2b81d0e4: 300, ws_7f3a9c21e4b0: 62, ws_c40e19aa: 196, ws_e5d7b302: 128 };

  return (
    <div className="flex flex-col gap-10">
      <DemoCell caption="CPU, memory and disk rings · per space · ready, Unavailable, could not read, loading · mock">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card title={ops.name} chip={<StateChip kind="space" state={SPACE_STATE[ops.status]} />}>
            <ActivityRings rings={ringsFor(ops)} aria-label={`Resource use for ${ops.name}`} />
          </Card>
          <Card title={billing.name} chip={<StateChip kind="space" state={SPACE_STATE[billing.status]} />}>
            <ActivityRings rings={ringsFor(billing)} aria-label={`Resource use for ${billing.name}`} />
          </Card>
          <Card title={lab.name} chip={<StateChip kind="space" state={SPACE_STATE[lab.status]} />}>
            <ActivityRings rings={ringsFor(lab, { diskError: true })} aria-label={`Resource use for ${lab.name}`} />
          </Card>
          <Card title={pilot.name} chip={<StateChip kind="space" state={SPACE_STATE[pilot.status]} />}>
            <ActivityRings rings={ringsFor(pilot)} loading aria-label={`Resource use for ${pilot.name}`} />
          </Card>
        </div>
      </DemoCell>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.75fr)]">
        <DemoCell caption={`Token donut · session ${s.id} · hover a slice`}>
          <div className="h-full rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-ink">Token breakdown</span>
              <ProvenanceTag provenance="mock" />
            </div>
            <Donut
              size={190}
              legend="bottom"
              format="tokens"
              center={{ value: formatValue(s.tokens, "tokens"), label: "tokens" }}
              segments={[
                { key: "fresh", label: "Fresh input", value: fresh, color: "var(--blu)" },
                { key: "output", label: "Output", value: s.outputTokens, color: "var(--org)" },
                { key: "writes", label: "Cache writes", value: writes, color: "var(--pur)" },
                { key: "reads", label: "Cache reads", value: reads, color: "var(--cyn)" },
              ]}
              aria-label={`Token breakdown for session ${s.id}`}
            />
          </div>
        </DemoCell>
        <DemoCell caption="Models share · 30 days">
          <div className="h-full rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-ink">Models</span>
              <ProvenanceTag provenance="mock" />
            </div>
            <Donut
              size={190}
              legend="bottom"
              format="tokens"
              center={{ value: formatValue(USAGE_SUMMARY["30 days"].tokens, "tokens"), label: `${USAGE_BY_MODEL.length} models` }}
              segments={USAGE_BY_MODEL.map((m) => ({ key: m.model, label: m.label, value: m.tokens, color: `var(--${m.color})` }))}
              aria-label="Token share by model, 30 days"
            />
          </div>
        </DemoCell>
        <DemoCell caption="Empty track · no usage">
          <div className="flex h-full flex-col rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <span className="mb-2 text-[13px] font-semibold text-ink">demo-pilot</span>
            <div className="flex flex-1 items-center justify-center">
              <Donut size={170} legend="bottom" center={{ value: "", label: "" }} segments={[]} aria-label="Token breakdown for demo-pilot" />
            </div>
          </div>
        </DemoCell>
      </div>

      <DemoCell caption="Error gauge · healthy, above 10% threshold, zero shows only the track, Unavailable · mock">
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
            <span className="mb-1 self-start font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Tool errors · 7 days</span>
            <RadialGauge
              value={toolErrors / toolCalls}
              max={0.2}
              threshold={0.1}
              text={formatValue(toolErrors / toolCalls, "percent1")}
              label={`${toolErrors} errors of ${formatValue(toolCalls)}`}
              scale={["0%", "20%"]}
              aria-label="Tool error rate, 7 days"
            />
          </div>
          <div className="flex flex-col items-center rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
            <span className="mb-1 self-start font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Job runs failed</span>
            <RadialGauge
              value={failed / finished.length}
              max={0.2}
              threshold={0.1}
              text={formatValue(failed / finished.length, "percent1")}
              label={`${failed} of ${finished.length} finished runs`}
              scale={["0%", "20%"]}
              aria-label="Failed job runs"
            />
          </div>
          <div className="flex flex-col items-center rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
            <span className="mb-1 self-start font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Connector errors</span>
            <RadialGauge value={0} max={0.2} threshold={0.1} text="0%" label="0 errors of 661 calls" scale={["0%", "20%"]} aria-label="Connector error rate" />
          </div>
          <div className="flex flex-col items-center rounded-[14px] border border-hair-soft bg-[#0f0f11] px-3 py-4">
            <span className="mb-1 self-start font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{billing.name}</span>
            <RadialGauge value={null} max={0.2} threshold={0.1} text="" label="Space is Stopped" scale={["0%", "20%"]} aria-label={`Error rate for ${billing.name}`} />
          </div>
        </div>
      </DemoCell>

      <DemoCell caption="Concentric radar · where spaces run · hover, focus or tap a blip">
        <div className="grid items-center gap-6 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">Trust boundary</p>
            <p className="mt-2 text-[clamp(18px,2.2vw,22px)] font-semibold leading-tight tracking-[-0.02em] text-ink">The boundary follows the space.</p>
            <p className="mt-2 text-[13px] leading-[1.65] text-ink-dim">
              The same space runs on a laptop, in your own container host, or managed. Each ring is one step further from your machine; each blip is
              a space and its lifecycle state.
            </p>
          </div>
          <ConcentricRadar
            rings={["On your machine", "Your cloud", "Managed"]}
            blips={SPACES.map((sp) => ({
              id: sp.id,
              label: sp.name,
              ring: PROVIDER_RING[sp.provider],
              angle: ANGLES[sp.id] ?? 0,
              status: BLIP_STATUS[sp.status],
              detail: `${sp.provider} · ${sp.status}`,
            }))}
            aria-label="Spaces by where they run"
          />
        </div>
      </DemoCell>
    </div>
  );
}
