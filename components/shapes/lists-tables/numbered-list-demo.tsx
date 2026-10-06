"use client";

// Live demo for the numbered-list shape: reading list (with Start here and plain), plan
// lists (How we work, What we do), the gap-px hairline list and evidence tier grid with a
// replayable staggered reveal, and the feature dot list.
import { useState, type MouseEvent } from "react";
import { RotateCcw } from "lucide-react";
import { QUIRQ_METHOD } from "@/lib/fixtures";
import { Button } from "@/components/ui/button";
import { DemoBlock } from "./demo-kit";
import { FeatureDotList, HairlineGrid, HairlineList, PlanList, ReadingList, type ReadingItem } from "./numbered-list";

const GUIDES: ReadingItem[] = [
  { title: "The quirq", desc: "The unit of verified, owner-valued, delivered work, and why a token count cannot be it.", read: "2 min", start: true, href: "/research/the-quirq" },
  { title: "Unit of work", desc: "What a uow record holds: the budget B, the before and after snapshots, the checks and the verdict.", read: "3 min", href: "/research/unit-of-work" },
  { title: "The quirq calculus", desc: "Minted Q = V · B, and how QER, QV and IR follow from it with a window and a method.", read: "5 min", href: "/research/quirq-calculus" },
  { title: "The company dashboard", desc: "Reading quirqs per week next to cost, without rounding the proof line up.", read: "2 min", href: "/research/company-dashboard" },
  { title: "Validation", desc: "How V is scored from weighted checks, and when a reading is Unavailable instead of zero.", read: "3 min", href: "/research/validation" },
];

const MORE: ReadingItem[] = [
  { title: "Budgets before work", desc: "Why the owner sets B before a run, never after.", read: "4 min", date: "Sep 2026", href: "/research/budgets-before-work" },
  { title: "Interventions and IR", desc: "Counting the units that needed a person, per window.", read: "3 min", date: "Aug 2026", href: "/research/interventions" },
];

const HOW = [
  {
    lead: "Agentic Audit.",
    body: "Thirty minutes on how your business actually runs. We name the workflow eating your week, size it in dollars, and send a one-page written finding within 24 hours.",
  },
  {
    lead: "Blueprint Sprint.",
    body: "One workflow built on your existing stack in two weeks, deployed with monitoring and fallbacks, handed over working.",
  },
  { lead: "Run at machine speed.", body: "We operate what we built. Monthly report, monthly number, workflows compounding on one data layer." },
];

const WHAT = [
  { lead: "Automate (or remove) your SaaS tools.", body: "Agents take over the work your subscriptions were bought for. What they replace, you cancel." },
  { lead: "Deploy bespoke blueprints.", body: "Proven workflows adapted to your operation and pointed at the metric that matters this quarter." },
  { lead: "Drive efficiency into your AI spend.", body: "Cost per useful unit of work, instrumented across every model and agent you run." },
  { lead: "Enable product development with agentic tools.", body: "Your team ships faster with agent runtimes wired into the development loop." },
  { lead: "Open new acquisition channels.", body: "Custom models, MCP integrations, skills and agents that reach customers your funnel cannot." },
];

const BREAKS = [
  { title: "Non-monotonicity", note: "A verbose failure costs more than a terse success. A metric that rises when work goes badly cannot denominate it." },
  { title: "Model-relativity", note: "The same outcome costs 10x different token counts across models. A ruler made of rubber." },
  { title: "Value-blindness", note: "A $4 ticket and a $25,000 contract review are indistinguishable in the bill." },
];

const TIERS = [
  { kicker: "Sourced", note: "The token's physics." },
  { kicker: "Derived", note: "The mint rule and its bounds." },
  { kicker: "Measured", note: "E1 to E3, open harness." },
  { kicker: "Open", note: "Replication, prediction, governance." },
];

export function NumberedListDemo() {
  const [note, setNote] = useState("");
  const [replay, setReplay] = useState(0);
  const open = (item: ReadingItem, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setNote(`Open ${item.href} →`);
  };
  return (
    <div className="flex flex-col gap-10">
      <DemoBlock label="Reading list · Start here · hover row 02">
        <ReadingList items={GUIDES} onOpen={open} hoverIndex={1} />
        <p role="status" className="min-h-[16px] font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">
          {note}
        </p>
      </DemoBlock>

      <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
        <DemoBlock label="Reading list · plain, dated">
          <ReadingList items={MORE} onOpen={open} start={6} label="More guides" />
        </DemoBlock>
        <DemoBlock label="Feature dots · 3 items">
          <FeatureDotList
            items={[
              { title: "Observe productivity", copy: "Dashboards give you visibility down to the unit of work, per agent and per task.", tone: "blu" },
              { title: "Assess model leaks", copy: "See where your data went, and whether it stayed inside your boundary.", tone: "grn" },
              { title: "Calculate returns", copy: "Cost per quirq: trending, per team, per agent.", tone: "org" },
            ]}
          />
        </DemoBlock>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
        <DemoBlock label="Plan list · How we work (3)">
          <PlanList items={HOW} label="How we work" />
        </DemoBlock>
        <DemoBlock label="Plan list · What we do (5)">
          <PlanList items={WHAT} label="What we do" />
        </DemoBlock>
      </div>

      <DemoBlock label="Gap-px grid · 3 breaks and 4 evidence tiers · staggered reveal">
        <div key={replay} className="flex flex-col gap-4">
          <HairlineList items={BREAKS} reveal label="Three ways the token breaks as a denominator" />
          <HairlineGrid cells={TIERS} reveal label="Evidence tiers" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Method · {QUIRQ_METHOD}</p>
          <Button size="sm" variant="subtle" leadingIcon={<RotateCcw />} onClick={() => setReplay((n) => n + 1)}>
            Replay reveal
          </Button>
        </div>
      </DemoBlock>
    </div>
  );
}
