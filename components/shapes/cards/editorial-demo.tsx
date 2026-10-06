"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import { TabChips } from "@/components/ui/segmented";
import { EditorialCard, FeaturedStory, ToolLinkCard, WikiTopicCard, type EditorialCardData } from "./editorial";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const d = (iso: string) => formatDate(iso, { withYear: true, weekday: false });

type Post = { id: string; kind: "static" | "post" | "linked"; cta?: string; caption: string; data: EditorialCardData };

const POSTS: Post[] = [
  {
    id: "orientation-tax",
    kind: "linked",
    cta: "Read the study",
    caption: "Linked card · CTA footer",
    data: {
      tag: "Thoughts",
      num: "01",
      title: "The orientation tax",
      dek: "What a coding agent's first day on the job actually costs, and why the setup around it is the only lever.",
      date: d("2026-07-26"),
      read: "5 min",
      thumb: { kind: "beam", hue: 210 },
    },
  },
  {
    id: "snapshots",
    kind: "post",
    caption: "Post · arrow appears on hover",
    data: {
      tag: "Research",
      title: "Before and after snapshots",
      dek: "How verification compares two states of a project to score completion V from 0 to 1.",
      date: d("2026-08-12"),
      read: "7 min",
      thumb: { kind: "grad", index: 1 },
    },
  },
  {
    id: "budgets",
    kind: "static",
    caption: "Static card · not a link",
    data: {
      tag: "Thoughts",
      num: "02",
      title: "Budgets come first",
      dek: "Why the owner sets budget B before any work runs, and what changes when they do.",
      date: d("2026-08-30"),
      read: "4 min",
      thumb: { kind: "beam", hue: 28 },
    },
  },
  {
    id: "sources",
    kind: "static",
    caption: "Sample news · orange badge",
    data: {
      tag: "News",
      sample: true,
      title: "XO Space 0.14 adds galileo sources",
      dek: "Each local port or folder gets its own origin at name.localhost:4100.",
      date: d("2026-10-02"),
      read: "2 min",
      thumb: { kind: "grad", index: 3 },
    },
  },
  {
    id: "tokens",
    kind: "post",
    caption: "Post · prism art",
    data: {
      tag: "Research",
      title: "Tokens are not work",
      dek: "Usage measures what a run consumed. quirqs measure what it delivered, once verified.",
      date: d("2026-09-18"),
      read: "6 min",
      thumb: { kind: "prism", hue: 250 },
    },
  },
  {
    id: "runtimes",
    kind: "linked",
    cta: "Read the evidence map",
    caption: "Numbered series · linked",
    data: {
      tag: "Thoughts",
      num: "03",
      title: "One space, many runtimes",
      dek: "Claude Code, Codex and OpenClaw share the same projects, steps and history.",
      date: d("2026-09-24"),
      read: "5 min",
      thumb: { kind: "beam", hue: 150 },
    },
  },
];

const TAGS = ["Thoughts", "Research", "News"] as const;

const WIKI: { group: string; topics: { id: string; title: string; description: string }[] }[] = [
  {
    group: "Explore your space",
    topics: [
      { id: "projects", title: "Projects", description: "Folders with context, steps and Git history. Pin the ones you open most." },
      { id: "timeline", title: "Timeline", description: "Every session and step on one clock, per runtime." },
      { id: "agents", title: "Agents", description: "Compare agent runs: recorded tokens, tools, models and session details. Check source coverage and cost limits." },
    ],
  },
  {
    group: "Follow the work",
    topics: [
      { id: "inbox", title: "Inbox", description: "Mentions, review requests and failed jobs in one list." },
      { id: "observability", title: "Observability", description: "Usage, latency and cost from each telemetry source." },
      { id: "sharing", title: "Sharing", description: "Who can open a project, and what they can change." },
    ],
  },
  {
    group: "Configure and contribute",
    topics: [
      { id: "setup", title: "Setup and installation", description: "Runtimes, folders, secrets and updates for this space." },
      { id: "connectors", title: "Connectors", description: "GitHub, Linear, Slack and more, with actions and polling." },
      { id: "contribute", title: "Contribute", description: "Report a bug or send a change to XO Space." },
    ],
  },
];

export function EditorialCardDemo() {
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState("agents");
  const counts = Object.fromEntries(TAGS.map((t) => [t, POSTS.filter((p) => p.data.tag === t).length]));
  const hidden = POSTS.filter((p) => filter !== "all" && p.data.tag !== filter).length;

  return (
    <DemoStack>
      <DemoSection title="Featured lead">
        <div className="flex flex-col gap-8">
          <Specimen label="Research lead · whole block is a link · hover zoom 1.03">
            <FeaturedStory
              href="#editorial-card"
              kicker="Foundations"
              title="The quirq"
              dek="The unit of measurement for AI's business impact: budgeted by a human, minted by verification, dual to the token."
              readLine="2 min read"
              thumb={{ kind: "prism", hue: 200 }}
            />
          </Specimen>
          <Specimen label="Writings announcement · not a link">
            <FeaturedStory
              kicker="News"
              badge="Latest"
              title="Defining agentic workforce environments"
              dek="A space holds the runtime, memory, files and tools an agent needs. Here is how we draw the line between a space and the projects inside it."
              readLine={`${d("2026-08-01")} · 2 min read`}
              thumb={{ kind: "beam", hue: 300 }}
            />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection
        title="Posts · grid 1 / 2 / 3"
        aside={
          <TabChips
            aria-label="Filter posts by topic"
            size="sm"
            value={filter}
            onChange={setFilter}
            items={[{ id: "all", label: "All", count: POSTS.length }, ...TAGS.map((t) => ({ id: t, label: t, count: counts[t] }))]}
          />
        }
      >
        <p role="status" className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          {hidden ? `${hidden} hidden by filter` : "Showing every post"}
        </p>
        <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((p) => (
            <div key={p.id} hidden={filter !== "all" && p.data.tag !== filter} className="min-w-0">
              <Specimen label={p.caption} className="h-full">
                <EditorialCard data={p.data} href={p.kind === "static" ? undefined : `#post-${p.id}`} cta={p.cta} className="h-full" />
              </Specimen>
            </div>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="Tool cards · whole card links">
        <div className="grid gap-[22px] md:grid-cols-2">
          <Specimen label="Whitepaper cover · paper surface">
            <ToolLinkCard
              href="#whitepaper"
              cover={{ kind: "paper", kicker: "Whitepaper · v3", title: "quirq: a unit of work for intelligence" }}
              title="The whitepaper"
              description="A quirq is minted, never self-reported: a budgeted outcome, before and after snapshots, and verification that mints delivered work."
              meta="XO Labs · 2026"
              action="Read"
            />
          </Specimen>
          <Specimen label="Calculator viz · illustrative">
            <ToolLinkCard
              href="#hours-back"
              cover={{ kind: "chart", label: "Cost / run", delta: "-42%", note: "Illustrative" }}
              title="Hours-back calculator (Machine Speed)"
              description="The ten-hour test: what repeating work costs you now, and how many hours a week come back. The result is hours, not quirqs."
              meta={<span className="text-grn">Interactive</span>}
              action="Open"
            />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Wiki topics · docs open in a new tab ↗, Open view highlights">
        <div className="flex flex-col gap-5">
          {WIKI.map((g) => (
            <div key={g.group}>
              <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{g.group}</p>
              <div className="grid gap-3 md:grid-cols-3">
                {g.topics.map((t) => (
                  <WikiTopicCard
                    key={t.id}
                    title={t.title}
                    description={t.description}
                    docHref={`https://docs.example.com/space/${t.id}`}
                    external
                    highlighted={view === t.id}
                    onOpenView={() => setView(t.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          <p role="status" className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            Highlighted: {WIKI.flatMap((g) => g.topics).find((t) => t.id === view)?.title}
          </p>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
