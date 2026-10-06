// Demo: area, line and sparkline charts. Tokens area, latency band (with the telemetry gap
// on 14 Sep reading Unavailable), sparklines (14 days, one point, no data), the tenure
// learning curve (illustrative benchmark) and cost sparkline cards. Hover any plot, or
// focus it and use the arrow keys.
import { QUIRQ_DAILY, USAGE_DAILY } from "@/lib/fixtures";
import { formatDayLabel } from "@/lib/format";
import { DemoCell, ProvenanceTag, formatValue } from "./chart-kit";
import { DeltaSparkCard, LearningCurve, Sparkline, TrendChart } from "./trend-chart";

/* The worked micro-benchmark from the docs: a 3,000-token floor plus cold-start intent cost
   that decays as memory accumulates. Interpolated in log space between the published
   checkpoints so the curve passes through every value in the table. */
const CHECKPOINTS = [
  { unit: 1, fresh: 5600, persistent: 5600 },
  { unit: 10, fresh: 5600, persistent: 3653 },
  { unit: 25, fresh: 5600, persistent: 3377 },
  { unit: 50, fresh: 5600, persistent: 3250 },
];

function learningSeries(): { fresh: number[]; persistent: number[] } {
  const floor = 3000;
  const fresh: number[] = [];
  const persistent: number[] = [];
  for (let u = 1; u <= 50; u++) {
    const k = CHECKPOINTS.findIndex((c) => c.unit >= u);
    const b = CHECKPOINTS[Math.max(1, k)];
    const a = CHECKPOINTS[Math.max(0, k - 1)];
    const t = a.unit === b.unit ? 0 : (Math.log(u) - Math.log(a.unit)) / (Math.log(b.unit) - Math.log(a.unit));
    const ea = Math.log(a.persistent - floor);
    const eb = Math.log(b.persistent - floor);
    fresh.push(5600);
    persistent.push(Math.round(floor + Math.exp(ea + (eb - ea) * Math.max(0, t))));
  }
  return { fresh, persistent };
}

export function TrendChartDemo() {
  const days = USAGE_DAILY;
  const last14 = days.slice(-14);
  const lc = learningSeries();

  /* trailing 7-day cost per minted quirq, mock */
  const costPerQ = days.slice(6).map((_, k) => {
    const win = days.slice(k, k + 7);
    const q = QUIRQ_DAILY.slice(k, k + 7);
    let cost = 0;
    let minted = 0;
    win.forEach((d, j) => {
      const m = q[j].mintedQ;
      if (m !== null) {
        cost += d.cost;
        minted += m;
      }
    });
    return minted ? cost / minted : null;
  });
  const cpqFirst = costPerQ[0] ?? null;
  const cpqLast = costPerQ[costPerQ.length - 1] ?? null;
  const perSession = last14.map((d) => d.tokens / d.sessions);
  const ps7 = last14.slice(-7).reduce((a, d) => a + d.tokens, 0) / last14.slice(-7).reduce((a, d) => a + d.sessions, 0);
  const psPrev = last14.slice(0, 7).reduce((a, d) => a + d.tokens, 0) / last14.slice(0, 7).reduce((a, d) => a + d.sessions, 0);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <DemoCell caption="Tokens area · 30 days · gradient area, 2px line, end label">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Tokens over time</p>
                <p className="text-[12px] text-ink-dim">Daily token volume across every space · usage, not quirqs</p>
              </div>
              <ProvenanceTag provenance="mock" />
            </div>
            <TrendChart
              labels={days.map((d) => d.label)}
              axisLabels={days.map((d) => formatDayLabel(d.date))}
              series={[{ key: "tokens", label: "Tokens", color: "var(--blu)", values: days.map((d) => d.tokens), area: true }]}
              format="tokens"
              endLabel
              xTicks={6}
              aria-label="Daily tokens, 2 Sep to 1 Oct"
            />
          </div>
        </DemoCell>
        <DemoCell caption="Latency band · p50 line over the p50 to p95 band · gap reads Unavailable">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Performance</p>
                <p className="text-[12px] text-ink-dim">Response latency per day · 14 Sep has no telemetry</p>
              </div>
              <ProvenanceTag provenance="mock" />
            </div>
            <TrendChart
              labels={days.map((d) => d.label)}
              axisLabels={days.map((d) => formatDayLabel(d.date))}
              series={[{ key: "p50", label: "p50", color: "var(--ink)", values: days.map((d) => d.latencyP50Ms) }]}
              band={{ key: "band", label: "p50 to p95", color: "var(--pur)", lower: days.map((d) => d.latencyP50Ms), upper: days.map((d) => d.latencyP95Ms) }}
              format="latency"
              xTicks={6}
              aria-label="Daily response latency, p50 and p95"
            />
          </div>
        </DemoCell>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DemoCell caption="Sparkline · card strip · last 14 days">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Daily tokens</span>
              <span className="font-mono text-[13px] text-ink">{formatValue(last14[last14.length - 1].tokens, "tokens")}</span>
            </div>
            <Sparkline
              className="mt-4"
              height={84}
              values={last14.map((d) => d.tokens)}
              labels={last14.map((d) => d.label)}
              format="tokens"
              seriesLabel="Tokens"
              aria-label="Daily tokens, last 14 days"
            />
          </div>
        </DemoCell>
        <DemoCell caption="Sparkline · single point centered">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">demo-pilot · today</span>
              <span className="font-mono text-[13px] text-ink">{formatValue(312500, "tokens")}</span>
            </div>
            <Sparkline className="mt-4" height={84} values={[312500]} labels={["Fri 2 Oct"]} format="tokens" seriesLabel="Tokens" aria-label="Tokens today, one day of data" />
          </div>
        </DemoCell>
        <DemoCell caption="Sparkline · empty path · No activity yet">
          <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">billing-sandbox</span>
              <span className="font-mono text-[12px] text-ink-faint">Unavailable</span>
            </div>
            <Sparkline className="mt-4" height={84} values={[]} aria-label="Daily tokens for billing-sandbox" />
          </div>
        </DemoCell>
      </div>

      <DemoCell caption="Learning curve · line chart and comparison table · illustrative benchmark">
        <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4 sm:p-5">
          <LearningCurve
            title="Tenure: cost per unit decays toward the execution floor"
            note="Worked micro-benchmark over 50 similar units. Not customer evidence."
            fresh={lc.fresh}
            persistent={lc.persistent}
            checkpoints={CHECKPOINTS}
            totals={{ fresh: 308000, persistent: 181260 }}
            provenance="illustrative"
          />
        </div>
      </DemoCell>

      <div className="grid gap-6 sm:grid-cols-3">
        <DemoCell caption="Cost sparkline · decreasing cost · green">
          <DeltaSparkCard
            className="flex-1"
            label="Cost / quirq"
            delta={cpqFirst !== null && cpqLast !== null ? cpqLast / cpqFirst - 1 : null}
            values={costPerQ}
            labels={days.slice(6).map((d) => `7 days to ${formatDayLabel(d.date)}`)}
            format="currency"
            caption="Trailing 7 days"
            provenance="mock"
          />
        </DemoCell>
        <DemoCell caption="Cost sparkline · landing card · illustrative">
          <DeltaSparkCard
            className="flex-1"
            label="Cost / run"
            delta={-0.42}
            values={[1, 0.86, 0.77, 0.7, 0.66, 0.63, 0.61, 0.6, 0.59, 0.58]}
            labels={Array.from({ length: 10 }, (_, i) => `Run ${(i + 1) * 5}`)}
            format="currency"
            progress={0.42 / 0.5}
            caption="Rail: progress to −50%"
            provenance="illustrative"
          />
        </DemoCell>
        <DemoCell caption="Cost sparkline · rising usage · red">
          <DeltaSparkCard
            className="flex-1"
            label="Tokens / session"
            delta={ps7 / psPrev - 1}
            upIsGood={false}
            values={perSession}
            labels={last14.map((d) => d.label)}
            format="tokens"
            caption="vs previous 7 days"
            provenance="mock"
          />
        </DemoCell>
      </div>

      <DemoCell caption="No data · keeps the frame">
        <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          <p className="mb-4 text-[13.5px] font-semibold text-ink">Tokens over time · demo-pilot</p>
          <TrendChart labels={[]} series={[{ key: "tokens", label: "Tokens", color: "var(--blu)", values: [] }]} height={120} aria-label="Daily tokens for demo-pilot" />
        </div>
      </DemoCell>
    </div>
  );
}
