// Demo: bar charts. Daily cost columns, stacked message breakdown, ranked top models,
// tools and MCP servers, the grey-ramp quirq card, and the empty states. Hover any column
// or row; focus a column chart and use the arrow keys.
import type { ReactNode } from "react";
import { QUIRQ_DAILY, USAGE_BY_MODEL, USAGE_DAILY, USAGE_SUMMARY } from "@/lib/fixtures";
import { formatDayLabel } from "@/lib/format";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { DemoCell, ProvenanceTag, formatValue } from "./chart-kit";
import { ColumnChart, RampBars, RankedBarList } from "./bar-chart";

/* Tool mix for the 30-day window, mock. Counts are shares of the rollup's tool calls. */
const TOOL_SHARES: [string, number][] = [
  ["Read", 0.29],
  ["Bash", 0.23],
  ["Edit", 0.17],
  ["Grep", 0.11],
  ["Write", 0.07],
  ["TodoWrite", 0.05],
  ["WebFetch", 0.04],
  ["Glob", 0.04],
];

const MCP_CALLS: { id: "github" | "linear" | "slack" | "notion"; label: string; calls: number | null }[] = [
  { id: "github", label: "github", calls: 412 },
  { id: "linear", label: "linear", calls: 188 },
  { id: "slack", label: "slack", calls: 61 },
  { id: "notion", label: "notion", calls: null },
];

function Frame({ title, sub, children, provenance = "mock" }: { title: string; sub: string; children: ReactNode; provenance?: "mock" | "illustrative" }) {
  return (
    <div className="flex-1 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink">{title}</p>
          <p className="text-[12px] text-ink-dim">{sub}</p>
        </div>
        <ProvenanceTag provenance={provenance} />
      </div>
      {children}
    </div>
  );
}

export function BarChartDemo() {
  const week = USAGE_DAILY.slice(-7);
  const fortnight = USAGE_DAILY.slice(-14);
  const weekCost = week.reduce((a, d) => a + d.cost, 0);
  const weekTokens = week.reduce((a, d) => a + d.tokens, 0);
  const perM = (weekCost / weekTokens) * 1_000_000;
  const toolTotal = USAGE_SUMMARY["30 days"].toolCalls;

  /* minted quirqs per day, trailing 7-day average, sampled into 10 bars (mock) */
  const avg = QUIRQ_DAILY.slice(6).map((_, k) => {
    const vals = QUIRQ_DAILY.slice(k, k + 7)
      .map((d) => d.mintedQ)
      .filter((v): v is number => v !== null);
    return { label: `7 days to ${formatDayLabel(QUIRQ_DAILY[k + 6].date)}`, value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 };
  });
  const picks = Array.from({ length: 10 }, (_, i) => avg[Math.round((i * (avg.length - 1)) / 9)]);
  const lift = picks[picks.length - 1].value / picks[0].value - 1;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <DemoCell caption="Daily cost · single series · tooltip footnote">
          <Frame title="Daily cost" sub="Estimated from the usage meter · last 7 days">
            <ColumnChart
              labels={week.map((d) => d.label)}
              axisLabels={week.map((d) => formatDayLabel(d.date))}
              series={[{ key: "cost", label: "Cost ($)", color: "var(--cyn)", values: week.map((d) => d.cost) }]}
              format="currency"
              footnote={`≈ ${formatValue(perM, "currency")} per 1M tokens · mock pricing`}
              emphasizeLast
              aria-label="Daily estimated cost, last 7 days"
            />
          </Frame>
        </DemoCell>
        <DemoCell caption="Stacked messages · user, assistant, tools · 2px gaps">
          <Frame title="Message breakdown" sub="Per day · last 14 days">
            <ColumnChart
              labels={fortnight.map((d) => d.label)}
              axisLabels={fortnight.map((d) => formatDayLabel(d.date))}
              series={[
                { key: "user", label: "User", color: "var(--blu)", values: fortnight.map((d) => Math.round(d.messages * 0.44)) },
                { key: "assistant", label: "Assistant", color: "var(--pur)", values: fortnight.map((d) => d.messages - Math.round(d.messages * 0.44)) },
                { key: "tools", label: "Tool calls", color: "var(--cyn)", values: fortnight.map((d) => d.toolCalls) },
              ]}
              format="number"
              xTicks={5}
              maxBar={18}
              aria-label="Messages and tool calls per day, last 14 days"
            />
          </Frame>
        </DemoCell>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DemoCell caption="Top models · ranked · label | track | value">
          <Frame title="Top models by tokens" sub="30 days · hover a row">
            <RankedBarList
              ranked
              items={USAGE_BY_MODEL.map((m) => ({
                id: m.model,
                label: m.label,
                value: m.tokens,
                color: `var(--${m.color})`,
                meta: `${formatValue(m.share, "percent")}`,
              }))}
              format="tokens"
              aria-label="Top models by tokens, 30 days"
            />
          </Frame>
        </DemoCell>
        <DemoCell caption="Tools · top 7, the rest fold into Other">
          <Frame title="Tools by calls" sub={`30 days · ${formatValue(toolTotal)} calls`}>
            <RankedBarList
              items={TOOL_SHARES.map(([name, share]) => ({ id: name, label: name, value: Math.round(toolTotal * share), meta: formatValue(share, "percent") }))}
              max={7}
              foldOther
              color="var(--cyn)"
              format="number"
              aria-label="Tool calls by tool, 30 days"
            />
          </Frame>
        </DemoCell>
        <DemoCell caption="MCP servers · min bar 3% · Unavailable row">
          <Frame title="MCP servers by calls" sub="30 days · notion has no telemetry">
            <RankedBarList
              items={MCP_CALLS.map((m) => ({ id: m.id, label: m.label, value: m.calls, icon: <RuntimeLogo id={m.id} size={14} decorative /> }))}
              color="var(--pur)"
              format="number"
              aria-label="MCP server calls, 30 days"
            />
          </Frame>
        </DemoCell>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <DemoCell caption="Grey ramp · one green number · hover a bar">
          <RampBars
            kicker="quirqs minted per day"
            headline={`${lift >= 0 ? "+" : "−"}${formatValue(Math.abs(lift), "percent")}`}
            window={"Past\n30 days"}
            values={picks.map((p) => p.value)}
            labels={picks.map((p) => p.label)}
            format="decimal1"
            provenance="mock"
            footnote="Trailing 7-day average. Grey is the window; color is the delivered change."
            aria-label="quirqs minted per day, trailing 7-day average, past 30 days"
          />
        </DemoCell>
        <div className="grid gap-6 sm:grid-cols-2">
          <DemoCell caption="Empty · columns">
            <Frame title="Daily cost" sub="billing-sandbox · Stopped">
              <ColumnChart labels={[]} series={[{ key: "cost", label: "Cost", color: "var(--cyn)", values: [] }]} height={120} emptyMessage="No usage data in this window" aria-label="Daily cost for billing-sandbox" />
            </Frame>
          </DemoCell>
          <DemoCell caption="Empty · ranked list">
            <Frame title="Top models by tokens" sub="demo-pilot · Starting">
              <RankedBarList items={[]} emptyMessage="No model telemetry." aria-label="Top models for demo-pilot" />
            </Frame>
          </DemoCell>
        </div>
      </div>
    </div>
  );
}
