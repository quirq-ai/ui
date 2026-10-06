"use client";

// Demo: Term card with use and avoid. Product names, everyday work terms, setup terms and
// collision resolutions; filter by group and copy a term.
import { useState } from "react";
import { GLOSSARY } from "@/lib/fixtures";
import { TabChips } from "@/components/ui/segmented";
import { Caption } from "./demo-kit";
import { TermCard, TERM_GROUPS, type Term, type TermGroup } from "./term-card";

const fromGlossary = (term: string) => GLOSSARY.find((g) => g.term === term);

const TERMS: Term[] = [
  {
    id: "xo",
    term: "XO",
    group: "product",
    definition: fromGlossary("XO")?.definition ?? "",
    use: "Set up a space with XO, then open it from the Space dashboard.",
    avoid: ["xo as a lowercase brand", "Our XO score this week"],
  },
  {
    id: "xo-space",
    term: "XO Space",
    group: "product",
    definition: "Open-source environment software (engine, Space API and Space dashboard) that runs a space locally.",
    use: "XO Space runs research-lab on Ada's laptop.",
    avoid: ["The Space dashboard is a separate product"],
  },
  {
    id: "quirq",
    term: "quirq",
    group: "work",
    definition: fromGlossary("quirq")?.definition ?? "",
    use: "uow_118 minted 34 quirqs at V 0.85 on a budget of 40.",
    avoid: ["This space is a quirq", "1.2M tokens, or 1.2M quirqs", "Bill this run in quirqs of compute"],
    keepDistinct: "Tokens, hours, cost, credits and task counts.",
  },
  {
    id: "space",
    term: "space",
    group: "work",
    definition: fromGlossary("space")?.definition ?? "",
    use: "research-lab is a local space; ops-copilot is a hosted space.",
    avoid: ["Open your quirq", "Spin up a VM for the project"],
  },
  {
    id: "session",
    term: "session",
    group: "work",
    definition: fromGlossary("session")?.definition ?? "",
    use: "Session df1a1a5b worked on two tasks over 37 turns.",
    avoid: ["One session is one task"],
    keepDistinct: "A task: one task can involve several sessions.",
  },
  {
    id: "step",
    term: "step",
    group: "work",
    definition: fromGlossary("step")?.definition ?? "",
    use: "Step completed: Agree on the acceptance criteria.",
    avoid: ["Task completed (for a todo inside a session)"],
  },
  {
    id: "agent-software",
    term: "Agent software",
    group: "setup",
    definition: "Software running the agent loop, such as Claude Code, Codex or OpenClaw. Say runtime in technical docs.",
    use: "Pick the agent software this space should use.",
    avoid: ["Pick a model (when choosing Claude Code or Codex)"],
  },
  {
    id: "projects-folder",
    term: "Projects folder",
    group: "setup",
    definition: "The root folder that holds the space's project folders.",
    use: "Your projects folder is ~/projects.",
    avoid: ["Choose your workspace (in setup)"],
  },
  {
    id: "technical-details",
    term: "Technical details",
    group: "collision",
    definition: "The local state view for watcher files and roots. It is not a quirq measurement view.",
    collision: { existing: "the quirq state details view", convention: "Technical details" },
  },
  {
    id: "space-dashboard",
    term: "Space dashboard",
    group: "collision",
    definition: "The management interface of XO Space. Observability is a capability, not a product.",
    collision: { existing: "Space UI / Observatory", convention: "Space dashboard" },
  },
  {
    id: "trial-active",
    term: "Trial active",
    group: "collision",
    definition: "Subscription state during the free trial. The failure reads Payment needs attention.",
    collision: { existing: "Trialing · Past due", convention: "Trial active · Payment overdue" },
  },
  {
    id: "running",
    term: "Running",
    group: "collision",
    definition: "Space lifecycle: Creating, Starting, Running, Stopping, Stopped. Failure reads Space could not start.",
    collision: { existing: "Ready · Failed", convention: "Running · Space could not start" },
  },
];

const GROUP_ORDER: TermGroup[] = ["product", "work", "setup", "collision"];

export function TermCardDemo() {
  const [group, setGroup] = useState<string>("all");
  const shown = group === "all" ? TERMS : TERMS.filter((t) => t.group === group);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabChips
          size="sm"
          aria-label="Filter terms by group"
          value={group}
          onChange={(id) => setGroup(id)}
          items={[{ id: "all", label: "All", count: TERMS.length }, ...GROUP_ORDER.map((g) => ({ id: g, label: TERM_GROUPS[g].label, count: TERMS.filter((t) => t.group === g).length }))]}
        />
        <Caption>Interaction · filter by group, copy term</Caption>
      </div>
      <p role="status" className="sr-only">
        {shown.length} terms shown
      </p>
      <div className="@container">
        <ul className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
          {shown.map((t) => (
            <li key={t.id} className="flex">
              <TermCard term={t} className="w-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
