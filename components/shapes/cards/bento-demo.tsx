"use client";

import type { ReactNode } from "react";
import { USAGE_DAILY } from "@/lib/fixtures";
import { BentoGrid, BentoTile, ContextViz, CostViz, DeployStepsViz, EfficiencyViz, RadarViz, RuntimeViz, ScalingViz } from "./bento";
import { RevealItem, ReplayButton, useReplay } from "./reveal";
import { DemoSection, Specimen } from "./_demo";

type TileSpec = { key: string; caption: string; wide: boolean; title: string; copy: string; vizAlign: "bottom" | "center"; viz: ReactNode };

const TILES: TileSpec[] = [
  {
    key: "scaling",
    caption: "Wide · spans 2",
    wide: true,
    title: "Dynamic scaling",
    copy: "Spin up a space with the press of a button. Capacity, specs and location are provisioned for you.",
    vizAlign: "bottom",
    viz: <ScalingViz values={[18, 22, 21, 27, 31, 30, 38, 44, 41, 52, 58, 56, 66, 74, 80, 92]} />,
  },
  {
    key: "deploy",
    caption: "Narrow",
    wide: false,
    title: "Production-ready",
    copy: "Deploy to AWS, GCP, Azure or any Terraform compatible stack.",
    vizAlign: "center",
    viz: (
      <DeployStepsViz
        steps={[
          { label: "Merged to main", state: "done" },
          { label: "Pushed to GHCR", state: "done" },
          { label: "Promoted to :stable", state: "done" },
          { label: "Updating space", state: "current" },
          { label: "Listen for heartbeat", state: "pending" },
        ]}
      />
    ),
  },
  {
    key: "context",
    caption: "Narrow",
    wide: false,
    title: "Context optimization",
    copy: "The engine reads your goals and draws from your data.",
    vizAlign: "center",
    viz: <ContextViz />,
  },
  {
    key: "cost",
    caption: "Wide · spans 2",
    wide: true,
    title: "Unified cost observability",
    copy: "Every space reports cost, time spent and the steps your agents take, as they happen.",
    vizAlign: "bottom",
    viz: <CostViz series={USAGE_DAILY.map((d) => d.cost)} caption="Mock · 30 days" />,
  },
  {
    key: "runtime",
    caption: "Narrow",
    wide: false,
    title: "Universal runtime",
    copy: "Use any model, harness or framework inside your space.",
    vizAlign: "center",
    viz: <RuntimeViz chips={["Memory", "Context", "Skills", "Artifacts", "Git", "MCP"]} runtimes={["claude_code", "codex", "openclaw"]} />,
  },
  {
    key: "security",
    caption: "Narrow",
    wide: false,
    title: "Security compliances",
    copy: "Deploy under the compliance standards you already follow.",
    vizAlign: "center",
    viz: <RadarViz axes={["SSO", "Audit", "Secrets", "Network", "Data", "Access"]} values={[0.9, 0.78, 0.86, 0.7, 0.82, 0.74]} />,
  },
  {
    key: "efficiency",
    caption: "Narrow",
    wide: false,
    title: "Efficiency charts",
    copy: "See the ratio of human input to agent output.",
    vizAlign: "bottom",
    viz: <EfficiencyViz delta="+87%" window="Past 30 days" note="Illustrative" bars={[38, 41, 45, 50, 55, 61, 66, 77, 88, 100]} />,
  },
];

export function BentoGridDemo() {
  const { shown, replay } = useReplay();
  return (
    <DemoSection title="Bento · 3 columns, staggered reveal" aside={<ReplayButton onClick={replay} />}>
      <BentoGrid>
        {TILES.map((t, i) => (
          <RevealItem key={t.key} shown={shown} index={i} stagger={90} className={t.wide ? "md:col-span-2" : undefined}>
            <Specimen label={t.caption} className="h-full">
              <BentoTile title={t.title} copy={t.copy} viz={t.viz} vizAlign={t.vizAlign} minHeight={400} className="flex-1" />
            </Specimen>
          </RevealItem>
        ))}
      </BentoGrid>
    </DemoSection>
  );
}
