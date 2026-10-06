"use client";

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Bug,
  Building2,
  ChartPie,
  CreditCard,
  House,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings2,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { Segmented } from "@/components/ui/segmented";
import { CONNECTORS, CURRENT_USER, MEMBERS, SECRETS, SPACE_STATUS_META, SPACES, type Space } from "@/lib/fixtures";
import type { Tone } from "@/components/ui/tones";
import { DemoCell, DemoGrid, DemoStack, Readout, Surface } from "./demo-kit";
import { logoFor } from "./demo-data";
import { AccountMenu, type ThemeChoice } from "./account-menu";
import {
  SettingsNav,
  SetupStepper,
  Sidebar,
  SidebarCreateButton,
  SidebarEmptyRow,
  SidebarGroup,
  SidebarItem,
  SidebarScopeSwitcher,
  SidebarSkeleton,
  SidebarSpaceItem,
  SidebarThemeButton,
  type SidebarScope,
  type SidebarSpace,
} from "./sidebar-nav";

type Scope = "personal" | "org";
const SCOPES: SidebarScope<Scope>[] = [
  { id: "personal", label: "Personal spaces", description: "Your own spaces", icon: <UserRound /> },
  { id: "org", label: "Org spaces", description: "Shared with Acme Robotics", icon: <Building2 /> },
];

function toRow(s: Space): SidebarSpace {
  const meta = SPACE_STATUS_META[s.status];
  const tone = meta.tone;
  return {
    id: s.id,
    name: s.name,
    logo: <RuntimeLogo id={logoFor(s.runtime)} size={16} decorative />,
    status: s.status === "Running" ? "up" : s.status === "Stopped" ? "idle" : "busy",
    tone: tone === "ink" || tone === "ink-dim" || tone === "ink-faint" ? "neutral" : (tone as Tone),
    statusLabel: s.status,
    // Creating, Starting and Stopping pulse and block deletes.
    transitioning: meta.pulse,
  };
}

const ALL_ROWS = SPACES.map(toRow);
const USER = { name: CURRENT_USER.name, email: CURRENT_USER.email };

const PAGE_TITLE: Record<string, string> = { dashboard: "Dashboard", usage: "Usage", new: "New space", bug: "Report a bug" };

/** The page next to the sidebar: a crumb bar and a short summary of what is open. */
function MainPane({ scope, current, rows, toolbar }: { scope: Scope; current: string; rows: SidebarSpace[]; toolbar?: ReactNode }) {
  const space = SPACES.find((s) => s.id === current && rows.some((r) => r.id === s.id));
  const title = space?.name ?? PAGE_TITLE[current] ?? "Dashboard";
  return (
    // A container: next to the expanded sidebar on a phone the pane is a sliver, so only the toolbar stays.
    <div className="@container flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-[13px]">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-hair-soft px-3">
        {toolbar}
        <span className="min-w-0 truncate text-[13px] text-ink-dim @max-[180px]:hidden">
          {SCOPES.find((s) => s.id === scope)?.label} <span className="text-ink-faint">›</span> <span className="text-ink">{title}</span>
        </span>
      </div>
      <div className="dots flex-1 p-5 @max-[180px]:[&>*]:hidden">
        <h4 className="text-[18px] font-semibold tracking-[-0.02em]">{title}</h4>
        {space ? (
          <dl className="mt-3 grid max-w-[420px] grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 text-[12.5px]">
            <dt className="text-ink-faint">Status</dt>
            <dd className="text-ink">{space.status}</dd>
            <dt className="text-ink-faint">Host</dt>
            <dd className="truncate font-mono text-[12px] text-ink-dim">{space.host}</dd>
            <dt className="text-ink-faint">Runs on</dt>
            <dd className="text-ink-dim">{space.provider}</dd>
          </dl>
        ) : (
          <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-ink-dim">
            The sidebar keeps the scope, the main pages and every space one click away. The current row carries the lime bar.
          </p>
        )}
      </div>
    </div>
  );
}

function AppSidebar({
  collapsed,
  current,
  setCurrent,
  rows,
  setRows,
  theme,
  setTheme,
  scope,
  setScope,
  tipFor,
}: {
  /** Space whose rail name tag stays open (static sample). */
  tipFor?: string;
  collapsed: boolean;
  current: string;
  setCurrent: (id: string) => void;
  rows: SidebarSpace[];
  setRows: (r: SidebarSpace[]) => void;
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  scope: Scope;
  setScope: (s: Scope) => void;
}) {
  return (
    <Sidebar
      collapsed={collapsed}
      aria-label="Spaces"
      header={<SidebarScopeSwitcher scopes={SCOPES} value={scope} onChange={setScope} />}
      footer={
        <div className="flex flex-col gap-1">
          <ul>
            <li>
              <SidebarThemeButton theme={theme} onChange={setTheme} />
            </li>
          </ul>
          <AccountMenu user={USER} variant={collapsed ? "collapsed" : "sidebar"} theme={theme} onThemeChange={setTheme} className={collapsed ? "self-center" : undefined} />
        </div>
      }
    >
      <SidebarGroup label="Agents">
        <SidebarCreateButton onClick={() => setCurrent("new")} />
        <SidebarItem icon={<House />} label="Dashboard" href="#/" current={current === "dashboard"} onSelect={() => setCurrent("dashboard")} />
        <SidebarItem icon={<ChartPie />} label="Usage" href="#/usage" current={current === "usage"} onSelect={() => setCurrent("usage")} />
      </SidebarGroup>
      <SidebarGroup label="My spaces">
        {rows.length === 0 ? <SidebarEmptyRow>No spaces yet</SidebarEmptyRow> : null}
        {rows.map((r) => (
          <SidebarSpaceItem
            key={r.id}
            space={r}
            current={current === r.id}
            showTip={r.id === tipFor}
            onOpen={() => setCurrent(r.id)}
            onDelete={(id) => {
              setRows(rows.filter((x) => x.id !== id));
              if (current === id) setCurrent("dashboard");
            }}
          />
        ))}
      </SidebarGroup>
      <SidebarGroup label="Shared with me">
        <SidebarEmptyRow>No shared spaces yet</SidebarEmptyRow>
      </SidebarGroup>
      <SidebarGroup label="Resources">
        <SidebarItem icon={<RuntimeLogo id="github" size={16} decorative />} label="GitHub" href="https://example.com/github" external />
        <SidebarItem icon={<BookOpen />} label="Docs" href="https://example.com/docs" external />
        <SidebarItem icon={<Bug />} label="Report a bug" href="#/feedback" onSelect={() => setCurrent("bug")} />
      </SidebarGroup>
    </Sidebar>
  );
}

type SetupState = "good" | "pending" | "error";
const STEP1: Record<SetupState, { text: string; tone: SetupState }> = {
  good: { text: "Folders set", tone: "good" },
  pending: { text: "Apply changes", tone: "pending" },
  error: { text: "Check folders", tone: "error" },
};

function setupGroups(state: SetupState) {
  return [
    {
      title: "Set up",
      steps: [
        { id: "projects-folder", number: 1, label: "Projects folder", status: STEP1[state] },
        { id: "intelligence", number: 2, label: "Intelligence layer", status: { text: "Agent set · Activity off", tone: "good" as const } },
      ],
    },
    {
      title: "Manage",
      steps: [
        { id: "connectors", label: "Connectors", description: "Apps, access and polling" },
        { id: "secrets", label: "Secrets", description: "Environment values" },
        { id: "jobs", label: "Jobs", description: "Scheduled and manual commands" },
        { id: "server", label: "Server", description: "Updates and restart" },
      ],
    },
  ];
}

export function SidebarNavDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState("ws_2b81d0e4");
  const [rows, setRows] = useState<SidebarSpace[]>(ALL_ROWS);
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [scope, setScope] = useState<Scope>("personal");
  const [step, setStep] = useState("projects-folder");
  const [setupState, setSetupState] = useState<SetupState>("pending");
  const [tileStep, setTileStep] = useState("intelligence");
  const [section, setSection] = useState("members");
  const [retried, setRetried] = useState(false);


  return (
    <DemoStack>
      <DemoCell
        label="My spaces with runtime logos · expanded and icon-collapsed"
        note="Toggle the rail. Kebab: Copy space ID, Delete space (blocked while a space is Starting)."
      >
        <Surface clip={false} className="flex h-[740px]">
          <AppSidebar
            collapsed={collapsed}
            current={current}
            setCurrent={setCurrent}
            rows={rows}
            setRows={setRows}
            theme={theme}
            setTheme={setTheme}
            scope={scope}
            setScope={setScope}
          />
          <MainPane
            scope={scope}
            current={current}
            rows={rows}
            toolbar={
              <IconButton aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} size="sm" onClick={() => setCollapsed((c) => !c)} tip="bottom">
                {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </IconButton>
            }
          />
        </Surface>
        <Readout label="Theme">{theme}</Readout>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Icon-collapsed · tooltips" note="Hover or focus an icon; demo-pilot shows its tag.">
          <Surface clip={false} className="flex h-[620px]">
            <AppSidebar
              collapsed
              tipFor="ws_e5d7b302"
              current="ws_7f3a9c21e4b0"
              setCurrent={() => undefined}
              rows={ALL_ROWS}
              setRows={() => undefined}
              theme="dark"
              setTheme={() => undefined}
              scope="org"
              setScope={() => undefined}
            />
            <MainPane scope="org" current="ws_7f3a9c21e4b0" rows={ALL_ROWS} />
          </Surface>
        </DemoCell>

        <DemoCell label="Loading · empty · error" note="The account row loads with the list.">
          <Surface className="flex h-[620px]">
            <Sidebar
              aria-label="Spaces, loading"
              className="w-full"
              header={<SidebarScopeSwitcher scopes={SCOPES} value="personal" onChange={() => undefined} />}
              footer={<AccountMenu user={USER} loading variant="sidebar" theme="dark" onThemeChange={() => undefined} />}
            >
              <SidebarGroup label="Agents">
                <SidebarCreateButton />
                <SidebarItem icon={<House />} label="Dashboard" href="#/" current onSelect={() => undefined} />
                <SidebarItem icon={<ChartPie />} label="Usage" href="#/usage" onSelect={() => undefined} />
              </SidebarGroup>
              <SidebarGroup label="My spaces">
                <SidebarSkeleton />
              </SidebarGroup>
              <SidebarGroup label="Shared with me">
                <SidebarEmptyRow>No shared spaces yet</SidebarEmptyRow>
              </SidebarGroup>
              <SidebarGroup label="Org spaces">
                {retried ? (
                  <SidebarSkeleton rows={2} />
                ) : (
                  <SidebarEmptyRow tone="error" action={{ label: "Retry", onClick: () => setRetried(true) }}>
                    Could not load spaces.
                  </SidebarEmptyRow>
                )}
              </SidebarGroup>
            </Sidebar>
          </Surface>
        </DemoCell>

        <DemoCell label="Numbered setup stepper · column">
          <div className="flex flex-col gap-4">
            <Segmented
              size="sm"
              options={[
                { value: "good", label: "Folders set" },
                { value: "pending", label: "Pending" },
                { value: "error", label: "Error" },
              ]}
              value={setupState}
              onChange={setSetupState}
              aria-label="Step 1 state"
              className="self-start"
            />
            <SetupStepper groups={setupGroups(setupState)} value={step} onChange={setStep} />
          </div>
        </DemoCell>

        <div className="flex min-w-0 flex-col gap-8">
          <DemoCell label="Setup stepper · compact tiles on phones">
            <div className="max-w-[340px]">
              <SetupStepper layout="tiles" groups={setupGroups("good")} value={tileStep} onChange={setTileStep} aria-label="Setup, compact" />
            </div>
          </DemoCell>

          <DemoCell label="Settings sections">
            <div className="flex flex-col gap-4 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-3 sm:flex-row">
              <SettingsNav
                value={section}
                onChange={setSection}
                className="sm:w-[200px] sm:shrink-0"
                sections={[
                  { id: "general", label: "General", icon: <Settings2 /> },
                  { id: "members", label: "Members", icon: <Users />, count: MEMBERS.length },
                  { id: "billing", label: "Billing", icon: <CreditCard /> },
                  { id: "connectors", label: "Connectors", icon: <Plug />, count: CONNECTORS.length },
                  { id: "secrets", label: "Secrets", icon: <KeyRound />, count: SECRETS.length },
                  { id: "danger", label: "Danger zone", icon: <TriangleAlert />, tone: "danger" },
                ]}
              />
              <p className="min-w-0 flex-1 px-1 py-2 text-[13px] text-ink-dim">
                <span className="font-medium capitalize text-ink">{section === "danger" ? "Danger zone" : section}</span> for research-lab.
              </p>
            </div>
          </DemoCell>
        </div>
      </DemoGrid>
    </DemoStack>
  );
}
