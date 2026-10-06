"use client";

import { createElement, useRef, useState, type ComponentType } from "react";
import { cn } from "@/lib/cn";
import {
  CONNECTORS,
  COMMANDS,
  CURRENT_SPACE,
  INBOX,
  INBOX_NEW_COUNT,
  PEOPLE,
  PROJECTS,
  RUNTIMES,
  SESSIONS,
  TODAY_LABEL,
  type ConnectorStatus,
} from "@/lib/fixtures";
import { formatTokens } from "@/lib/format";
import { Avatar, Badge, RuntimeTag, Segmented, Skeleton, StateChip, StatusDot, TabChips } from "@/components/ui";
import { Glyph } from "./glyphs";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import {
  CommandPalette,
  ConnectionPill,
  ConsoleFooter,
  ConsoleShell,
  ConsoleToast,
  ConsoleTopbar,
  ServerStatusPill,
  SpaceMockTopbar,
  VisualizerTopbar,
  type ConnectionState,
  type ConsoleTab,
  type PaletteCommand,
  type ServerState,
} from "./console-shell";

const TABS: ConsoleTab[] = [
  { id: "projects", label: "Projects" },
  { id: "agents", label: "Agents" },
  { id: "inbox", label: "Inbox", count: INBOX_NEW_COUNT },
  { id: "setup", label: "Setup" },
];

const VIEW_LABEL: Record<string, string> = {
  projects: "Projects view",
  agents: "Agents view",
  inbox: "Inbox view",
  setup: "Setup view",
  wiki: "Wiki view",
};

const COMMAND_TAB: Record<string, string> = {
  "goto-inbox": "inbox",
  "goto-connectors": "setup",
  "goto-usage": "agents",
  "open-project": "projects",
  "resume-session": "agents",
  "new-session": "agents",
};

const PALETTE: PaletteCommand[] = COMMANDS.map((c) => ({ id: c.id, label: c.label, group: c.group, hint: c.hint }));

const SPACE_PROJECTS = PROJECTS.filter((p) => p.spaceId === CURRENT_SPACE.id);

const STATS = [
  `${SPACE_PROJECTS.length} projects`,
  `${RUNTIMES.filter((r) => r.installed).length} runtimes`,
  `${SESSIONS.filter((s) => s.spaceId === CURRENT_SPACE.id).length} sessions`,
  `mapped ${TODAY_LABEL}`,
  "data: Overview (mock)",
];

const CONNECTOR_KEY: Record<ConnectorStatus, "not_connected" | "checking" | "on" | "off" | "needs_attention" | "sign_in_pending" | "unavailable"> = {
  "Not connected": "not_connected",
  "Checking…": "checking",
  "On in this space": "on",
  "Off in this space": "off",
  "Needs attention": "needs_attention",
  "Sign-in pending": "sign_in_pending",
  Unavailable: "unavailable",
};

/* ----------------------------------------------------------------------------- views */

function ViewHead({ title, meta, chips }: { title: string; meta: string; chips?: string[] }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-hair-soft px-4 pb-3 pt-4 @4xl:px-6">
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        <p className="mt-0.5 text-[12px] text-ink-faint">{meta}</p>
      </div>
      {chips ? <TabChips aria-label={`${title} sections`} size="sm" scroll items={chips.map((c) => ({ id: c, label: c }))} defaultValue={chips[0]} /> : null}
    </div>
  );
}

function ProjectsView() {
  return (
    <div>
      <ViewHead title="Projects" meta={`${SPACE_PROJECTS.length} projects in ${CURRENT_SPACE.name} · mock data`} chips={["Overview", "Data", "Timeline", "Manage"]} />
      <ul className="grid @xl:grid-cols-2 @4xl:grid-cols-3">
        {SPACE_PROJECTS.map((p) => (
          <li key={p.id} className="px-4 py-3.5 shadow-[inset_-1px_-1px_0_var(--hair-soft)] @4xl:px-6">
            <div className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-[2px]" style={{ background: `var(--${p.color})` }} aria-hidden="true" />
              <span className="truncate font-mono text-[13px] text-ink">{p.displayName}</span>
              {p.openSessions > 0 ? <StatusDot status="up" pulse size="xs" label={`${p.openSessions} open session`} /> : null}
              <span className="ml-auto shrink-0 text-[11px] text-ink-faint">{p.lastActive}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-dim">{p.description}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {p.category} · {p.sessions} sessions · {p.openWorkItems} open
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AgentsView() {
  const rows = SESSIONS.filter((s) => s.spaceId === CURRENT_SPACE.id).slice(0, 7);
  return (
    <div>
      <ViewHead title="Agents" meta="Sessions in this space · newest first · mock data" chips={["Overview", "Sessions", "Trends", "Configure"]} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[12.5px]">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <th scope="col" className="px-4 py-2 font-medium @4xl:px-6">Session</th>
              <th scope="col" className="px-3 py-2 font-medium">Runtime</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Tokens</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Duration</th>
              <th scope="col" className="px-4 py-2 text-right font-medium @4xl:px-6">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-hair-soft">
                <td className="max-w-[260px] px-4 py-2.5 @4xl:px-6">
                  <span className="flex items-center gap-2">
                    {s.open ? <StatusDot status="up" pulse size="xs" label="Open" /> : <StatusDot status="idle" size="xs" label="Ended" />}
                    <span className="truncate text-ink">{s.title}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <RuntimeTag id={s.runtime === "gemini_cli" ? "gemini" : s.runtime} />
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-dim">{formatTokens(s.tokens)}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-dim">{s.duration}</td>
                <td className="px-4 py-2.5 text-right text-ink-faint @4xl:px-6">{s.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InboxView() {
  return (
    <div>
      <ViewHead title="Inbox" meta={`${INBOX_NEW_COUNT} new · ${INBOX.length} items`} chips={["Items", "Connections", "Jobs", "Activity"]} />
      <ul>
        {INBOX.slice(0, 7).map((item) => (
          <li key={item.id} className="flex items-start gap-3 border-b border-hair-soft px-4 py-3 @4xl:px-6">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] border border-hair bg-s2 text-ink-dim">
              <Glyph name={item.glyph} className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-[13px]", item.status === "new" ? "font-medium text-ink" : "text-ink-dim")}>{item.title}</p>
              <p className="truncate text-[12px] text-ink-faint">{item.detail}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StateChip kind="inbox" state={item.status} />
              <span className="text-[11px] text-ink-faint">{item.ago}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SetupView() {
  return (
    <div>
      <ViewHead title="Setup" meta={`${CURRENT_SPACE.name} · ${CURRENT_SPACE.host} · XO Space ${CURRENT_SPACE.version}`} chips={["Space", "Runtimes", "Connectors", "Secrets"]} />
      <div className="grid gap-px bg-hair-soft @4xl:grid-cols-2">
        <section aria-label="Runtimes" className="bg-[#08080a] px-4 py-3 @4xl:px-6">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Runtimes</h3>
          <ul className="flex flex-col gap-2">
            {RUNTIMES.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center gap-2.5 text-[12.5px]">
                <RuntimeTag id={r.id === "gemini_cli" ? "gemini" : r.id} />
                <span className="font-mono text-[11px] text-ink-faint">{r.version ?? "Not installed"}</span>
                <span className="ml-auto text-[11.5px] text-ink-dim">{r.inUse ? "In use" : "Installed"}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Connectors" className="bg-[#08080a] px-4 py-3 @4xl:px-6">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Connectors</h3>
          <ul className="flex flex-col gap-2">
            {CONNECTORS.slice(0, 5).map((c) => (
              <li key={c.toolkit} className="flex items-center gap-2.5 text-[12.5px]">
                <span className="w-[86px] shrink-0 truncate text-ink">{c.displayName}</span>
                <StateChip kind="connector" state={CONNECTOR_KEY[c.status]} label={c.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function WikiView() {
  return (
    <div className="px-4 py-4 @4xl:px-6">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Space wiki</h2>
      <p className="mt-1 max-w-[62ch] text-[12.5px] leading-relaxed text-ink-dim">
        How this space is set up: where projects live, which runtimes are installed and how connectors poll. Pages are Markdown files in
        the projects folder.
      </p>
    </div>
  );
}

function ViewSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4 px-4 py-4 @4xl:px-6">
      <span className="sr-only">Loading view</span>
      <Skeleton width={160} height={16} />
      <Skeleton width="40%" height={10} />
      <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={72} radius={10} />
        ))}
      </div>
    </div>
  );
}

const VIEWS: Record<string, ComponentType> = {
  projects: ProjectsView,
  agents: AgentsView,
  inbox: InboxView,
  setup: SetupView,
  wiki: WikiView,
};

/* ----------------------------------------------------------------------------- live shell */

function LiveConsole() {
  const [tab, setTab] = useState("projects");
  const [loading, setLoading] = useState(false);
  const [server, setServer] = useState<ServerState>("online");
  const [refreshing, setRefreshing] = useState(false);
  const [palette, setPalette] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  /* views load lazily: a short skeleton the first moment a view mounts */
  function go(id: string) {
    if (id === tab) return;
    setTab(id);
    setLoading(true);
    later(() => setLoading(false), 380);
  }

  function say(msg: string) {
    setToast(msg);
    later(() => setToast(null), 1600);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented<ServerState>
          aria-label="Server state"
          size="sm"
          value={server}
          onChange={setServer}
          options={[
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
            { value: "checking", label: "Checking" },
          ]}
        />
        <Hint>Click inside the frame, then press 1 to 4 to switch views, or ⌘K and / to search.</Hint>
      </div>
      <ConsoleShell
        className="h-[560px]"
        viewLabel={VIEW_LABEL[tab]}
        tabCount={TABS.length}
        onSelectIndex={(i) => go(TABS[i].id)}
        onOpenSearch={() => setPalette(true)}
        topbar={
          <ConsoleTopbar
            tabs={TABS}
            active={tab}
            onTabChange={go}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              later(() => {
                setRefreshing(false);
                say("Page refreshed");
              }, 900);
            }}
            onOpenSearch={() => setPalette(true)}
            wikiActive={tab === "wiki"}
            onWiki={() => go("wiki")}
            githubHref="https://github.com/quirq-ai/xo-space"
          />
        }
        footer={<ConsoleFooter server={<ServerStatusPill state={server} />} stats={STATS} />}
        overlay={
          <>
            <CommandPalette
              open={palette}
              onClose={() => setPalette(false)}
              commands={PALETTE}
              onRun={(c) => {
                const target = COMMAND_TAB[c.id];
                if (target) go(target);
                else say(c.label);
              }}
            />
            <ConsoleToast message={toast} />
          </>
        }
      >
        {loading ? <ViewSkeleton /> : createElement(VIEWS[tab])}
      </ConsoleShell>
    </div>
  );
}

/* ----------------------------------------------------------------------------- visualizer */

const LENSES = [
  { id: "map", label: "Map", searchPlaceholder: "Search projects" },
  { id: "dashboards", label: "Dashboards", searchPlaceholder: "Search dashboards" },
  { id: "chart", label: "Chart", searchPlaceholder: "Search charts" },
];

function LiveVisualizer() {
  const [lens, setLens] = useState("map");
  const [connection, setConnection] = useState<ConnectionState>("live");
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = PROJECTS.filter((p) => !query || p.displayName.includes(query.trim().toLowerCase()));
  return (
    <div className="flex flex-col gap-3">
      <Segmented<ConnectionState>
        aria-label="Connection"
        size="sm"
        className="self-start"
        value={connection}
        onChange={setConnection}
        options={[
          { value: "connecting", label: "Connecting" },
          { value: "live", label: "Live" },
          { value: "partial", label: "Partial" },
          { value: "offline", label: "Offline" },
        ]}
      />
      <div className="overflow-hidden rounded-[14px] border border-hair bg-[#08080a]">
        <VisualizerTopbar
          lenses={LENSES}
          lens={lens}
          onLensChange={setLens}
          connection={connection}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setRefreshing(false), 900);
          }}
          query={query}
          onQueryChange={setQuery}
        />
        <div className="dots flex min-h-[150px] flex-wrap content-start gap-2 p-4">
          {shown.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">No projects match “{query}”.</p>
          ) : (
            shown.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-2 rounded-full border border-hair bg-s1 px-3 py-1 font-mono text-[11.5px] text-ink-dim">
                <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: `var(--${p.color})` }} />
                {p.displayName}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const SEGMENTS = ["Graph", "Timeline", "Six degrees", "Sessions", "Projects", "Chat"];

function LiveSpaceMock() {
  const [seg, setSeg] = useState("Graph");
  return (
    <div className="overflow-hidden rounded-[14px] border border-hair bg-[#0b0c0a]">
      <SpaceMockTopbar
        segments={SEGMENTS}
        active={seg}
        onChange={setSeg}
        root="xo-projects"
        searchPlaceholder="Search 27 artifacts…"
        stats={["27 artifacts", "4 clusters", "48 links", "14 cross-ties"]}
      />
      <div className="grid min-h-[120px] place-items-center p-6 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{seg} view · landing mock</p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function ConsoleShellDemo() {
  const owner = PEOPLE[CURRENT_SPACE.owner];
  return (
    <DemoStack>
      <DemoSection
        title="Space UI · online and offline"
        aside={
          <span className="inline-flex items-center gap-2 text-[12px] text-ink-faint">
            <Avatar name={owner.name} size="xs" decorative /> {CURRENT_SPACE.name} · local
          </span>
        }
      >
        <LiveConsole />
      </DemoSection>

      <DemoSection title="Footer server pill">
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-5">
            <Specimen label="Online" note="lime pip with glow">
              <div className="overflow-hidden rounded-[12px] border border-hair">
                <ConsoleFooter server={<ServerStatusPill state="online" />} />
              </div>
            </Specimen>
            <Specimen label="Checking" note="grey pip while the first poll runs">
              <div className="overflow-hidden rounded-[12px] border border-hair">
                <ConsoleFooter server={<ServerStatusPill state="checking" />} />
              </div>
            </Specimen>
            <Hint>
              The pill polls the server status every 5 s. A page can check the server but cannot start it, so offline offers the shell
              command instead of a button that would fail.
            </Hint>
          </div>
          <Specimen label="Offline · start popover open" note="Copy command reads Copied for 1.4 s">
            <div className="flex h-[270px] flex-col justify-end">
              <div className="rounded-[12px] border border-hair">
                <ConsoleFooter server={<ServerStatusPill state="offline" defaultOpen />} />
              </div>
            </div>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Visualizer · lens-aware search">
        <LiveVisualizer />
        <div className="mt-4 flex flex-wrap gap-2.5">
          {(["connecting", "live", "partial", "offline"] as const).map((c) => (
            <ConnectionPill key={c} state={c} />
          ))}
          <Badge tone="neutral" mono size="md">
            Refresh spins 900 ms while loading
          </Badge>
        </div>
      </DemoSection>

      <DemoSection title="Space mock · landing">
        <LiveSpaceMock />
      </DemoSection>
    </DemoStack>
  );
}
