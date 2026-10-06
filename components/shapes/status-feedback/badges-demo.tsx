import { Search } from "lucide-react";
import { Badge, Count } from "@/components/ui/badge";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import type { Tone } from "@/components/ui/tones";
import { CONNECTORS, INBOX_NEW_COUNT, JOBS, MODELS, SESSION_BY_ID, WORK_ITEM_LABELS } from "@/lib/fixtures";
import { DemoGroup, DemoStack, Specimen } from "./parts";
import {
  AccountChip,
  ActionTag,
  ChipRow,
  FactChip,
  HttpChip,
  IntegrationChip,
  LabelPill,
  MarkerTag,
  RuntimeChip,
  TierTag,
} from "./badges";

const SESSION = SESSION_BY_ID["df1a1a5b"];

const VENDORS: { name: string; tone: Tone }[] = [
  { name: "Anthropic", tone: "org" },
  { name: "OpenAI", tone: "blu" },
  { name: "Cursor", tone: "pur" },
  { name: "Google", tone: "grn" },
  { name: "Nous", tone: "cyn" },
];

const HTTP: { status: number; method?: string; path?: string; note: string }[] = [
  { status: 201, method: "POST", path: "/__xo/api/sources", note: "Created notes" },
  { status: 200, method: "PUT", path: "/__xo/api/sources/acme", note: "Changed acme" },
  { status: 206, method: "GET", path: "/s/shots/demo.mp4", note: "Partial content" },
  { status: 304, method: "GET", path: "/s/brief/", note: "Not modified" },
  { status: 400, method: "POST", path: "/__xo/api/sources", note: "Bad name or location" },
  { status: 403, method: "POST", path: "/__xo/api/sources", note: "Only galileo's own pages may use this" },
  { status: 404, method: "GET", path: "/s/wiki/", note: "No such source" },
  { status: 405, method: "PUT", path: "/s/notes/todo.md", note: "Only GET and HEAD: files are read only" },
  { status: 413, method: "POST", path: "/__xo/api/sources", note: "Body too large" },
  { status: 415, method: "POST", path: "/__xo/api/sources", note: "Send JSON" },
  { status: 421, method: "GET", path: "/", note: "Misdirected request" },
  { status: 502, method: "GET", path: "/", note: "Waiting for storybook" },
];

const github = CONNECTORS.find((c) => c.toolkit === "github");

export function BadgesDemo() {
  const savedJobs = JOBS.length;
  const labels = ["bug", "ui", "enhancement", "copy", "a11y", "blocked"].map((k) => WORK_ITEM_LABELS[k]);
  return (
    <DemoStack>
      <DemoGroup title="Tier tags and markers" hint="Color is semantic: blue open source, green managed, orange enterprise or sample.">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="tier tags · comparison columns">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <TierTag tier="open-source" />
                <TierTag tier="managed" />
                <TierTag tier="enterprise" />
              </div>
              <div className="flex flex-wrap gap-2">
                <TierTag tier="open-source" variant="soft" />
                <TierTag tier="managed" variant="solid" />
                <TierTag tier="enterprise" variant="soft" />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                <Badge variant="outline">Open source</Badge>
                <Badge variant="outline">Hosted by us</Badge>
                <Badge variant="outline">Your estate, your brand</Badge>
                <span className="text-[11px] font-semibold text-grn">30 days free</span>
              </div>
            </div>
          </Specimen>
          <Specimen label="FEATURED / NEW / SAMPLE / START HERE / DEPLOYED / LOCAL ONLY">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
              <MarkerTag kind="featured" />
              <MarkerTag kind="new" />
              <MarkerTag kind="sample" />
              <MarkerTag kind="start-here" />
              <MarkerTag kind="interactive" />
              <MarkerTag kind="deployed" />
              <MarkerTag kind="local-only" />
              <MarkerTag kind="beta" />
              <MarkerTag kind="coming-soon" />
              <MarkerTag kind="not-supported" />
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Runtime badges and integration chips" hint="Static by design: chips never look like links.">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="runtime badges · raw id · vendor tint">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <RuntimeTag id="claude_code" raw />
                <RuntimeTag id="codex" raw />
                <RuntimeTag id="openclaw" raw />
                <RuntimeTag id="cursor" raw dot />
              </div>
              <div className="flex flex-wrap gap-2">
                <RuntimeTag id="claude_code" />
                <RuntimeTag id="codex" />
                <RuntimeTag id="openclaw" />
                <RuntimeTag id="hermes" />
                <RuntimeTag id="gemini" />
              </div>
              <div className="flex flex-wrap gap-2">
                {VENDORS.map((v) => (
                  <Badge key={v.name} tone={v.tone} variant="soft" size="md">
                    {v.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <RuntimeChip>claude</RuntimeChip>
                <RuntimeChip>codex</RuntimeChip>
                <RuntimeChip>openclaw</RuntimeChip>
              </div>
            </div>
          </Specimen>
          <Specimen label="integration chips · kicker rows">
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-wrap gap-2.5">
                <IntegrationChip id="github" label="GitHub" />
                <IntegrationChip id="vercel" label="Vercel" />
                <IntegrationChip id="google-drive" label="Google Drive" />
                <IntegrationChip id="onedrive" label="OneDrive" />
                <IntegrationChip id="cursor" label="Cursor" />
                <IntegrationChip id="mcp" label="MCP" />
              </div>
              <ChipRow kicker="Runs on" items={["Google Cloud", "Azure", "Nebius", "Nvidia", "AMD", "Groq"]} />
              <ChipRow kicker="Cost" items={["Inference", "Compute", "API calls", "Storage", "Environment amortization", "Human minutes"]} />
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="App badges, tags and counts">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Specimen label="session badges · default · secondary · outline · mono · destructive">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="grn" variant="solid" size="md">
                Live
              </Badge>
              <Badge variant="outline" size="md">
                7 days
              </Badge>
              <Badge size="md">{MODELS[SESSION.model].label}</Badge>
              <Badge size="md">Turn {SESSION.turns}</Badge>
              <Badge size="md" icon={<Search />}>
                status pill
              </Badge>
              <Badge size="md" variant="outline" className="font-mono">
                {SESSION.id}
              </Badge>
              <Badge tone="red" size="md">
                Offline
              </Badge>
            </div>
          </Specimen>
          <Specimen label="issue labels · facts · accounts">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => (
                  <LabelPill key={l.name} name={l.name} tone={l.color} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <FactChip>2 accounts</FactChip>
                <AccountChip>{github?.account ?? "Unavailable"}</AccountChip>
                <AccountChip>ada@example.com</AccountChip>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <ActionTag kind="read" />
                <ActionTag kind="write" />
                <FactChip tone="grn">Repeating</FactChip>
                <FactChip>One time</FactChip>
                <FactChip tone="blu">Composio</FactChip>
                <FactChip tone="org">Masked</FactChip>
              </div>
            </div>
          </Specimen>
          <Specimen label="count pills · roles · plan">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-dim">
                <span className="inline-flex items-center gap-1.5">
                  Saved jobs <Count value={savedJobs} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Polled apps <Count value={4} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Inbox <Count value={INBOX_NEW_COUNT} tone="ink" label="new" />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Events <Count value={1204} max={999} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Sessions <Count value={null} />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="grn" variant="solid">
                  personal
                </Badge>
                <Badge>shared</Badge>
                <Badge variant="outline">owner</Badge>
                <Badge variant="outline">collaborator</Badge>
                <Badge tone="grn" variant="soft" size="xs">
                  Has access
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="grn" variant="solid" size="md">
                  Current plan
                </Badge>
                <Badge tone="blu" size="md" dot>
                  Trial active
                </Badge>
                <Badge tone="org" size="md" dot>
                  Payment overdue
                </Badge>
                <FactChip tone="grn">Live</FactChip>
                <FactChip tone="org">Stalled</FactChip>
                <FactChip>Paused</FactChip>
              </div>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="HTTP chips" hint="galileo gateway answers: 2xx green, 3xx grey, 4xx and 5xx red.">
        <ul className="grid gap-x-6 gap-y-2.5 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4 lg:grid-cols-2">
          {HTTP.map((h) => (
            <li key={`${h.status}-${h.path}`} className="min-w-0">
              <HttpChip status={h.status} method={h.method} path={h.path} note={h.note} />
            </li>
          ))}
        </ul>
      </DemoGroup>
    </DemoStack>
  );
}
