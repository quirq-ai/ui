"use client";

// Live demo for the app icon launcher: the XO Swarm space home screen (apps, sign-ins,
// connectors and a skill across three pages, with the status widget on page 1), the
// xo-client phone home screen with count badges and a dock, and every tile variant and state.
import { useState, type ReactNode } from "react";
import {
  AppWindow,
  ChartColumn,
  CodeXml,
  Folder,
  FolderKanban,
  GitPullRequest,
  Hash,
  Inbox,
  MessageSquare,
  MessagesSquare,
  NotebookPen,
  Settings2,
  SquareKanban,
  SquareTerminal,
  Telescope,
  WandSparkles,
} from "lucide-react";
import { CURRENT_SPACE, FIXTURE_NOTE, PHONE_APPS, RUNTIME_BY_ID, type PhoneApp, type SpaceStatus } from "@/lib/fixtures";
import { formatBytes } from "@/lib/format";
import { RuntimeLogo, Segmented, StateChip, Switch, XOMark } from "@/components/ui";
import { CAPTION, Caption, DemoSection, DemoStack, FootNote } from "./_kit";
import { useTimers } from "./use-timers";
import { cn } from "@/lib/cn";
import {
  AppIconTile,
  AppLauncher,
  LauncherDock,
  SpaceWidget,
  paginate,
  type LauncherItem,
  type LauncherTileStatus,
  type WidgetMeter,
} from "./app-launcher";

/* ------------------------------------------------------------------ glyphs */

const letter = (s: string) => <span className="font-mono text-[19px] font-semibold tracking-[-0.04em]">{s}</span>;
const logo = (id: Parameters<typeof RuntimeLogo>[0]["id"]) => <RuntimeLogo id={id} size={28} decorative />;

/** Where a tile comes from in the XO Swarm grid; page names are built from these. */
type Group = "Workspace apps" | "Sign-ins" | "Connectors" | "Skills";

type Seed = Omit<LauncherItem, "status"> & { group: Group; connected?: boolean; unsupported?: boolean };

/** Workspace apps from the space (Coder-native), then sign-ins, connectors and skills. */
const APPS: Seed[] = [
  { id: "vscode", label: "VS Code", kind: "app", icon: <CodeXml />, tone: "blu", group: "Workspace apps" },
  { id: "terminal", label: "Terminal", kind: "app", icon: <SquareTerminal />, tone: "neutral", group: "Workspace apps" },
  { id: "cursor", label: "Cursor", kind: "app", icon: logo("cursor"), tone: "neutral", group: "Workspace apps" },
  { id: "web-vscode", label: "Web VS Code", kind: "app", icon: <AppWindow />, tone: "cyn", group: "Workspace apps" },
  { id: "space", label: "Space", kind: "app", icon: <XOMark height={18} title={null} />, tone: "neutral", group: "Workspace apps" },
  { id: "cowork", label: "Cowork", kind: "app", icon: <MessagesSquare />, tone: "grn", group: "Workspace apps" },
  { id: "openclaw-gateway", label: "OpenClaw Gateway", kind: "app", icon: logo("openclaw"), tone: "lime", group: "Workspace apps" },
  { id: "openclaw-restart", label: "OpenClaw Restart", kind: "restart", icon: logo("openclaw"), tone: "org", group: "Workspace apps" },
  { id: "hermes-dashboard", label: "Hermes Dashboard", kind: "app", icon: logo("hermes"), tone: "pur", group: "Workspace apps" },
  { id: "hermes-restart", label: "Hermes Restart", kind: "restart", icon: logo("hermes"), tone: "org", group: "Workspace apps" },
];

const ADDONS: Seed[] = [
  { id: "claude", label: "Claude", kind: "addon", icon: logo("anthropic"), tone: "org", group: "Sign-ins", connected: true },
  { id: "openai", label: "OpenAI", kind: "addon", icon: logo("openai"), tone: "neutral", group: "Sign-ins" },
  { id: "google", label: "Google", kind: "addon", icon: letter("G"), tone: "blu", group: "Sign-ins", unsupported: true },
  { id: "gdrive", label: "Google Drive", kind: "addon", icon: logo("google-drive"), tone: "yel", group: "Connectors" },
  { id: "onedrive", label: "OneDrive", kind: "addon", icon: logo("onedrive"), tone: "blu", group: "Connectors" },
  { id: "github", label: "GitHub", kind: "addon", icon: logo("github"), tone: "neutral", group: "Connectors", connected: true },
  { id: "vercel", label: "Vercel", kind: "addon", icon: logo("vercel"), tone: "neutral", group: "Connectors" },
  { id: "magicpath", label: "MagicPath", kind: "addon", icon: <WandSparkles />, tone: "pur", group: "Connectors" },
];

const SKILLS: Seed[] = [{ id: "okx", label: "OKX", kind: "skill", icon: letter("OKX"), tone: "neutral", group: "Skills" }];

const SEEDS: Seed[] = [...APPS, ...ADDONS, ...SKILLS];
const GROUP_OF = new Map(SEEDS.map((s) => [s.id, s.group]));

/** "Workspace apps", "Workspace apps and sign-ins", "Sign-ins, connectors and skills". */
function pageLabel(items: LauncherItem[]): string {
  const groups = [...new Set(items.map((i) => GROUP_OF.get(i.id) ?? "Workspace apps"))];
  const words = groups.map((g, i) => (i === 0 ? g : g.toLowerCase()));
  return words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

const RESTART_NAME: Record<string, string> = { "openclaw-restart": "OpenClaw gateway", "hermes-restart": "Hermes gateway" };

/* ------------------------------------------------------------------ phone shell */

function PhoneShell({ children, label, time = "09:30" }: { children: ReactNode; label: string; time?: string }) {
  return (
    <div className="relative mx-auto flex h-[640px] w-full max-w-[352px] flex-col overflow-hidden rounded-[36px] border border-hair-strong bg-[#060607] p-3 shadow-[0_30px_80px_rgba(0,0,0,.6)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-blu/20 blur-3xl" />
        <div className="absolute -right-20 top-64 size-64 rounded-full bg-pur/15 blur-3xl" />
        <div className="absolute bottom-0 left-10 size-56 rounded-full bg-grn/10 blur-3xl" />
      </div>
      <div className="relative flex items-center justify-between px-4 pb-3 pt-1 font-mono text-[11px] tabular-nums text-ink-dim">
        <span>{time}</span>
        <span className="truncate pl-3">{label}</span>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ swarm launcher */

function meterRatio(used: number | null, total: number) {
  return used === null ? null : used / total;
}

function SwarmLauncher() {
  const later = useTimers();
  const [status, setStatus] = useState<SpaceStatus>("Running");
  const [apiUp, setApiUp] = useState(true);
  const [probing, setProbing] = useState(false);
  const [connected, setConnected] = useState<string[]>(SEEDS.filter((a) => a.connected).map((a) => a.id));
  const [busy, setBusy] = useState<string[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [log, setLog] = useState("Tap an app to open it. Swipe for sign-ins, connectors and skills.");
  const [page, setPage] = useState(0);

  const running = status === "Running";
  const space = CURRENT_SPACE;

  function changeStatus(next: SpaceStatus) {
    setStatus(next);
    if (next === "Running") {
      setProbing(true);
      setLog("Space is Running. Checking sign-ins and connectors…");
      later(() => {
        setProbing(false);
        setLog("Sign-ins and connectors checked.");
      }, 1200);
    } else {
      setLog(`Space is ${next}. Apps open when it is Running.`);
    }
  }

  function work(id: string, ms: number, done: () => void) {
    setBusy((b) => [...b, id]);
    later(() => {
      setBusy((b) => b.filter((x) => x !== id));
      done();
    }, ms);
  }

  function activate(item: LauncherItem) {
    if (item.kind === "restart") {
      const name = RESTART_NAME[item.id] ?? item.label;
      setLog(`Restarting ${name}…`);
      work(item.id, 1400, () => setLog(`${name} restarted`));
    } else if (item.kind === "skill") {
      setLog(`Installing ${item.label}…`);
      work(item.id, 1500, () => {
        setInstalled((s) => [...s, item.id]);
        setLog(`${item.label} installed`);
      });
    } else if (item.kind === "addon") {
      if (connected.includes(item.id)) {
        setLog(`${item.label} is connected. Manage it in Setup.`);
      } else {
        setLog(`Connecting ${item.label}…`);
        work(item.id, 1200, () => {
          setConnected((c) => [...c, item.id]);
          setLog(`${item.label} connected`);
        });
      }
    } else {
      setLog(`Opening ${item.label} in a new tab…`);
    }
  }

  function statusOf(s: Seed): LauncherTileStatus {
    if (busy.includes(s.id)) return "loading";
    if (s.kind === "skill") return installed.includes(s.id) ? "installed" : "idle";
    if (s.kind !== "addon") return "idle";
    if (running && apiUp && probing) return "loading";
    if (s.unsupported && running && apiUp) return "unsupported";
    return connected.includes(s.id) && running && apiUp ? "connected" : "idle";
  }

  const items: LauncherItem[] = SEEDS.map((s) => ({
    id: s.id,
    label: s.label,
    kind: s.kind,
    icon: s.icon,
    tone: s.tone,
    status: statusOf(s),
  }));
  const chunks = paginate(items, 8, 9);
  const meters: WidgetMeter[] = [
    { label: "Disk", value: `${formatBytes(space.usage.disk.used)} / ${formatBytes(space.usage.disk.total)}`, ratio: meterRatio(space.usage.disk.used, space.usage.disk.total), color: "var(--pur)" },
    { label: "Memory", value: `${formatBytes(space.usage.memory.used)} / ${formatBytes(space.usage.memory.total)}`, ratio: meterRatio(space.usage.memory.used, space.usage.memory.total), color: "var(--grn)" },
    { label: "CPU", value: `${space.usage.cpu.used} / ${space.usage.cpu.total} cores`, ratio: meterRatio(space.usage.cpu.used, space.usage.cpu.total), color: "var(--cyn)" },
  ].map((m) => (running ? m : { ...m, ratio: null }));
  const pages = chunks.map((chunk, i) => ({
    id: `p${i}`,
    label: pageLabel(chunk),
    items: chunk,
    widget:
      i === 0 ? (
        <SpaceWidget
          title={space.name}
          subtitle={`${status} · ${space.deployment} · ${RUNTIME_BY_ID[space.runtime].label}`}
          meters={meters}
        />
      ) : undefined,
  }));

  const stateId = status.toLowerCase() as "running" | "starting" | "stopped";

  return (
    <div className="flex min-w-0 flex-col items-center gap-4">
      <div className="flex w-full max-w-[352px] flex-col gap-3">
        <Segmented<SpaceStatus>
          aria-label="Space status"
          size="sm"
          block
          value={status}
          onChange={changeStatus}
          options={[
            { value: "Running", label: "Running" },
            { value: "Starting", label: "Starting" },
            { value: "Stopped", label: "Stopped" },
          ]}
        />
        <Switch size="sm" label="Space API up" checked={apiUp} onCheckedChange={setApiUp} disabled={!running} />
      </div>
      <PhoneShell label={`${space.name} · ${space.host}`}>
        <div className="flex items-center justify-center pb-3">
          <StateChip
            kind="space"
            state={stateId}
            prefix={space.deployment === "local" ? "Local space" : "Hosted space"}
            className="[&>span:last-child]:leading-[1.3]"
          />
        </div>
        <AppLauncher
          label={`${space.name} apps`}
          pages={pages}
          page={page}
          onPageChange={setPage}
          disabled={!running}
          addonsDisabled={running && !apiUp}
          onActivate={activate}
          className="flex-1"
        />
      </PhoneShell>
      <p role="status" aria-live="polite" className="min-h-[20px] max-w-[352px] text-center text-[12px] text-ink-dim">
        {log}
      </p>
      {running && !apiUp ? <p className="max-w-[352px] text-center text-[11.5px] text-ink-faint">Sign-ins, connectors and skills need the Space API. Workspace apps still open.</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ client phone */

const GLYPHS: Record<string, ReactNode> = {
  Folder: <Folder />,
  MessageSquare: <MessageSquare />,
  Telescope: <Telescope />,
  ChartColumn: <ChartColumn />,
  Settings2: <Settings2 />,
  Inbox: <Inbox />,
  FolderKanban: <FolderKanban />,
  SquareTerminal: <SquareTerminal />,
  NotebookPen: <NotebookPen />,
  GitPullRequest: <GitPullRequest />,
  SquareKanban: <SquareKanban />,
  Hash: <Hash />,
};

const toItem = (a: PhoneApp): LauncherItem => ({ id: a.id, label: a.label, kind: "app", icon: GLYPHS[a.glyph], tone: a.color, badge: a.badge });

function ClientHome() {
  const [log, setLog] = useState("Badges count open sessions, new inbox items and sources that are down.");
  const home = PHONE_APPS.filter((a) => !a.dock).map(toItem);
  const dock = PHONE_APPS.filter((a) => a.dock).map(toItem);
  return (
    <div className="flex min-w-0 flex-col items-center gap-4">
      <PhoneShell label="xo-client">
        <AppLauncher
          label="Home screen"
          pages={[{ id: "home", label: "Home", items: home }]}
          onActivate={(item) => setLog(`Opened ${item.label}`)}
          className="mt-2 flex-1"
        />
        <LauncherDock label="Dock" items={dock} onActivate={(item) => setLog(`Opened ${item.label}`)} />
      </PhoneShell>
      <p role="status" aria-live="polite" className="min-h-[20px] max-w-[352px] text-center text-[12px] text-ink-dim">
        {log}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ tile specimens */

const SPECIMENS: { caption: string; node: ReactNode }[] = [
  { caption: "app", node: <AppIconTile label="VS Code" kind="app" icon={<CodeXml />} tone="blu" /> },
  { caption: "app · pressed", node: <AppIconTile label="Terminal" kind="app" icon={<SquareTerminal />} pressed /> },
  { caption: "add-on · connected", node: <AppIconTile label="GitHub" kind="addon" icon={logo("github")} status="connected" /> },
  { caption: "add-on · not connected", node: <AppIconTile label="Vercel" kind="addon" icon={logo("vercel")} /> },
  { caption: "add-on · unsupported", node: <AppIconTile label="Google" kind="addon" icon={letter("G")} tone="blu" status="unsupported" /> },
  { caption: "add-on · loading", node: <AppIconTile label="OpenAI" kind="addon" icon={logo("openai")} status="loading" /> },
  { caption: "restart", node: <AppIconTile label="OpenClaw Restart" kind="restart" icon={logo("openclaw")} tone="org" /> },
  { caption: "restart · loading", node: <AppIconTile label="Hermes Restart" kind="restart" icon={logo("hermes")} tone="org" status="loading" /> },
  { caption: "skill · install", node: <AppIconTile label="OKX" kind="skill" icon={letter("OKX")} /> },
  { caption: "skill · installed", node: <AppIconTile label="OKX" kind="skill" icon={letter("OKX")} status="installed" /> },
  { caption: "disabled until running", node: <AppIconTile label="Cowork" kind="app" icon={<MessagesSquare />} tone="grn" disabled /> },
  { caption: "count badge", node: <AppIconTile label="Inbox" kind="app" icon={<Inbox />} tone="org" badge={6} /> },
];

export function AppLauncherDemo() {
  return (
    <DemoStack>
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
        <DemoSection title="Space home · XO Swarm" note="Page 1 carries the status widget. Drag or swipe sideways, use the dots, or arrow keys from a tile.">
          <SwarmLauncher />
        </DemoSection>
        <DemoSection title="Phone home · xo-client" note="One page of apps with count badges from the data, and a dock.">
          <ClientHome />
        </DemoSection>
      </div>
      <DemoSection title="Tile variants and states">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-3 gap-y-6">
          {SPECIMENS.map((s) => (
            <figure key={s.caption} className="m-0 flex min-w-0 flex-col items-center gap-2 text-center">
              <figcaption className={cn(CAPTION, "flex min-h-[34px] items-end justify-center")}>{s.caption}</figcaption>
              <div className="grid h-[124px] w-full place-items-center rounded-[14px] border border-hair-soft bg-[radial-gradient(ellipse_at_top,#17171a,#09090a_70%)] px-2 py-3">
                {s.node}
              </div>
            </figure>
          ))}
        </div>
        <Caption className="mt-4">Tiles are 64px with 11px labels. Disabled tiles sit at 60% until the space is Running.</Caption>
      </DemoSection>
      <FootNote>{FIXTURE_NOTE} Meters, sign-ins and badge counts are sample values.</FootNote>
    </DemoStack>
  );
}
