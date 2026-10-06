import type { Shape } from "@/lib/types";
import { QuirqMeasurementDemo } from "./quirq-measurement-demo";
import { StatTileDemo } from "./stat-tile-demo";
import { TrendChartDemo } from "./trend-chart-demo";
import { BarChartDemo } from "./bar-chart-demo";
import { RadialChartsDemo } from "./radial-charts-demo";
import { CalculatorDemo } from "./calculator-demo";
import { UsageDashboardDemo } from "./usage-dashboard-demo";
import { AcceptanceReviewDemo } from "./acceptance-review-demo";

// Reusable pieces, for sample apps that compose these shapes.
export * from "./chart-kit";
export * from "./quirq-measurement";
export * from "./stat-tile";
export * from "./trend-chart";
export * from "./bar-chart";
export * from "./radial-charts";
export * from "./calculator";
export * from "./usage-dashboard";
export * from "./acceptance-review";

export const shapes: Shape[] = [
  {
    id: "quirq-measurement",
    name: "quirq measurement readout",
    purpose: "Report delivered work in quirqs with method and separate cost.",
    seenIn: [
      "landing:mint-rule-card",
      "landing:formula-callout",
      "landing:meter-comparison-cards",
      "viz:quirq-mint-flow",
      "viz:quirq-metric-readout",
      "viz:two-meters-comparison",
    ],
    variants: ["mint rule card", "formula callout", "two meters", "mint flow", "equation chip", "QER/QV/IR"],
    states: ["Available", "Unavailable", "mock", "illustrative"],
    Demo: QuirqMeasurementDemo,
  },
  {
    id: "stat-tile",
    name: "Stat tile and KPI row",
    purpose: "Headline number with label and note.",
    seenIn: [
      "space-ui:stat-card",
      "space-ui:metric-tiles",
      "swarm:kpi-stat-tile",
      "swarm:resource-metric-tiles",
      "client:stat-tile",
      "viz:metric-tile",
      "landing:stat-pair-cards",
    ],
    variants: ["hero", "4-up", "stat pair", "resource tiles", "mini"],
    states: ["value", "Unavailable when unknown", "skeleton", "loading", "offline"],
    Demo: StatTileDemo,
  },
  {
    id: "trend-chart",
    name: "Area, line and sparkline",
    purpose: "Volume and latency over time.",
    seenIn: [
      "space-ui:area-chart",
      "space-ui:chart-tooltip-legend",
      "swarm:area-trend-chart",
      "swarm:latency-band-chart",
      "client:usage-charts",
      "viz:token-activity-chart",
      "viz:sparkline",
      "viz:tenure-learning-curve",
      "landing:mini-sparkline",
    ],
    variants: ["tokens area", "latency band", "sparkline", "learning curve", "cost sparkline"],
    states: ["data", "gap reads Unavailable", "single point", "No data"],
    Demo: TrendChartDemo,
  },
  {
    id: "bar-chart",
    name: "Bar chart",
    purpose: "Daily, stacked and ranked bars.",
    seenIn: ["space-ui:bar-charts", "swarm:gradient-bar-chart", "viz:horizontal-bar-list", "landing:efficiency-bar-chart"],
    variants: ["daily cost", "stacked messages", "top models", "tools", "grey ramp"],
    states: ["data", "Unavailable row", "empty"],
    Demo: BarChartDemo,
  },
  {
    id: "radial-charts",
    name: "Rings, donut and gauge",
    purpose: "Share and ratio in circular form.",
    seenIn: ["space-ui:donut-chart", "space-ui:radial-gauge", "swarm:activity-rings-widget", "client:system-rings-widget", "landing:concentric-rings-viz"],
    variants: ["CPU/RAM/Disk rings", "token donut", "error gauge", "concentric radar"],
    states: ["ready", "loading", "could not read", "above threshold", "empty track"],
    Demo: RadialChartsDemo,
  },
  {
    id: "calculator",
    // spec name "Unit-of-work calculator", renamed per vocabularyFixes: the result is hours, not quirqs
    name: "Hours-back calculator (Machine Speed)",
    purpose: "Sliders drive a live result toward the ten-hour target.",
    seenIn: ["landing:range-slider-field", "landing:result-metric-hero", "landing:ms-calculator-panel"],
    variants: ["full", "compact"],
    states: ["below target blue", "target hit green"],
    Demo: CalculatorDemo,
  },
  {
    id: "usage-dashboard",
    name: "Usage dashboard and heatmap",
    purpose: "Window, KPIs, charts and heatmap for a space.",
    seenIn: ["landing:sessions-analytics-dashboard", "space-ui:calendar-heatmap", "swarm:usage-summary-strip"],
    variants: ["populated", "empty window"],
    states: ["refreshing"],
    Demo: UsageDashboardDemo,
  },
  {
    id: "acceptance-review",
    name: "Verification and acceptance review",
    purpose: "Show how V was scored from before and after snapshots against weighted checks, and let the owner accept the result.",
    seenIn: [
      "viz:object-state-chips (Customer result: Awaiting review, Accepted)",
      "viz:quirq-metric-readout (IR threshold)",
      "viz:quirq-mint-flow",
    ],
    variants: ["awaiting review", "accepted", "below threshold (counts toward IR)", "measurement unavailable"],
    states: ["Awaiting review", "Accepted", "Sent back", "Unavailable", "mock"],
    Demo: AcceptanceReviewDemo,
  },
];
