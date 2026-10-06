"use client";

import { useState, type ReactNode } from "react";
import { ChartPie, House, LogOut, Plus, UserPlus } from "lucide-react";
import {
  CURRENT_USER,
  ORGANIZATIONS,
  PEOPLE,
  PHONE_APPS,
  PRICING_NOTE,
  PRICING_PLANS,
  SPACES,
  SPACE_BY_ID,
  type Space,
  type SpaceStatus,
} from "@/lib/fixtures";
import { formatBytes, formatFixed } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Avatar, AvatarGroup, Button, IconButton, ProgressBar, StateChip, type DotStatus } from "@/components/ui";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import { MiniTerminal, SPACE_STATE } from "./mini-apps";
import { PhoneAppFrame, PhoneBody, PhoneHomeScreen } from "./phone-frame";
import { PHONE_APP_TITLE, phoneAppBody } from "./phone-frame-demo";
import {
  AppSidebarNav,
  PaywallGate,
  ScopeSwitcher,
  ShellBreadcrumb,
  SidebarAppShell,
  SpaceSplitView,
  type SidebarNavGroup,
  type SidebarRenderState,
} from "./sidebar-app-shell";

const STATUS_DOT: Record<SpaceStatus, DotStatus> = {
  Creating: "busy",
  Starting: "busy",
  Running: "up",
  Stopping: "busy",
  Stopped: "idle",
};

const SCOPES = ORGANIZATIONS.map((o) => ({ id: o.id, name: o.name, kind: o.kind }));

function navGroups(activeId: string): SidebarNavGroup[] {
  const mine = SPACES.filter((s) => s.owner === CURRENT_USER.id || s.members.includes(CURRENT_USER.id));
  const own = mine.filter((s) => s.owner === CURRENT_USER.id);
  const shared = mine.filter((s) => s.owner !== CURRENT_USER.id);
  const row = (s: Space) => ({
    id: s.id,
    label: s.name,
    status: STATUS_DOT[s.status],
    active: s.id === activeId,
    trailing: s.deployment === "local" ? "local" : s.status === "Running" ? null : s.status,
  });
  return [
    {
      id: "agents",
      label: "Agents",
      items: [
        { id: "new", label: "New space", icon: <Plus />, emphasis: true },
        { id: "dashboard", label: "Dashboard", icon: <House />, active: activeId === "dashboard" },
        { id: "usage", label: "Usage", icon: <ChartPie />, active: activeId === "usage" },
      ],
    },
    { id: "mine", label: "My spaces", items: own.map(row) },
    { id: "shared", label: "Spaces shared with me", items: shared.map(row) },
  ];
}

function UserFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 rounded-[10px] p-1.5", collapsed && "justify-center")}>
      <Avatar name={CURRENT_USER.name} size="md" status="up" />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">{CURRENT_USER.name}</span>
            <span className="block truncate text-[11px] text-ink-faint">{CURRENT_USER.email}</span>
          </span>
          <IconButton aria-label="Sign out" size="sm">
            <LogOut />
          </IconButton>
        </>
      ) : null}
    </div>
  );
}

function useSidebar(initialActive: string) {
  const [active, setActive] = useState(initialActive);
  const [scope, setScope] = useState("personal");
  const render = ({ collapsed, close }: SidebarRenderState) => (
    <AppSidebarNav
      collapsed={collapsed}
      header={<ScopeSwitcher scopes={SCOPES} value={scope} onChange={setScope} collapsed={collapsed} />}
      groups={navGroups(active)}
      footer={<UserFooter collapsed={collapsed} />}
      onSelect={(id) => {
        if (id !== "new") setActive(id);
        close();
      }}
    />
  );
  return { active, render };
}

/* ----------------------------------------------------------------------------- space info and app */

function Meter({ label, used, total, unit }: { label: string; used: number | null; total: number; unit: "cores" | "bytes" }) {
  const text =
    used === null
      ? "Unavailable"
      : unit === "cores"
        ? `${formatFixed(used, 1)} of ${total} cores`
        : `${formatBytes(used)} of ${formatBytes(total)}`;
  return <ProgressBar label={label} value={used} max={total} valueText={text} size="xs" tone={used !== null && used / total > 0.8 ? "org" : "ink"} />;
}

function SpaceInfo({ space }: { space: Space }) {
  const owner = PEOPLE[space.owner];
  const rows: [string, ReactNode][] = [
    ["Host", <span key="h" className="font-mono text-[12px]">{space.host}</span>],
    ["Provider", `${space.provider}${space.region ? ` · ${space.region}` : ""}`],
    ["Owner", owner.name],
    ["Members", <AvatarGroup key="m" names={space.members.map((m) => PEOPLE[m].name)} size="xs" />],
    ["Version", <span key="v" className="font-mono text-[12px]">XO Space {space.version}</span>],
    ["Auto-stop", space.stopsIn ? `in ${space.stopsIn}` : "Off"],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[14px] border border-hair bg-s1 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-mono text-[15px] text-ink">{space.name}</h3>
          <StateChip kind="space" state={SPACE_STATE[space.status]} prefix={space.deployment === "hosted" ? "Hosted space" : "Local space"} />
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{space.description}</p>
        <dl className="mt-3 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[12.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-faint">{k}</dt>
              <dd className="min-w-0 truncate text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid gap-3 rounded-[14px] border border-hair bg-s1 p-4">
        <Meter label="CPU" {...space.usage.cpu} />
        <Meter label="Memory" {...space.usage.memory} />
        <Meter label="Disk" {...space.usage.disk} />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Mock data</p>
      </div>
      <section aria-label="Machine logs" className="overflow-hidden rounded-[14px] border border-hair bg-black/50">
        <h3 className="border-b border-hair-soft px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Machine logs</h3>
        <MiniTerminal className="max-h-[180px] overflow-y-auto" />
      </section>
    </div>
  );
}

function SpaceApps() {
  const [app, setApp] = useState<string | null>(null);
  return (
    <PhoneBody className="h-full w-full" label="Space apps">
      {app ? (
        <PhoneAppFrame title={PHONE_APP_TITLE[app] ?? app} state="ready" time="09:41" onBack={() => setApp(null)}>
          {phoneAppBody(app)}
        </PhoneAppFrame>
      ) : (
        <PhoneHomeScreen apps={PHONE_APPS} time="09:41" onOpenApp={setApp} />
      )}
    </PhoneBody>
  );
}

function Pricing() {
  return (
    <ul className="grid w-full max-w-[860px] gap-3 @2xl:grid-cols-3">
      {PRICING_PLANS.map((p) => (
        <li key={p.id} className={cn("flex flex-col rounded-[14px] border p-4", p.highlighted ? "border-hair-strong bg-s2" : "border-hair bg-s1")}>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: `var(--${p.color})` }} />
            <h3 className="text-[14px] font-semibold text-ink">{p.name}</h3>
          </div>
          <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">{p.price}</p>
          <p className="text-[12px] text-ink-faint">{p.cadence}</p>
          <p className="mt-1 text-[12.5px] text-ink-dim">{p.tagline}</p>
          <ul className="mt-3 flex flex-1 flex-col gap-1 text-[12px] text-ink-dim">
            {p.features.slice(0, 3).map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          <Button variant={p.cta.kind === "primary" ? "primary" : "ghost"} size="sm" className="mt-4 self-start">
            {p.cta.label}
            {p.cta.external ? <span aria-hidden="true"> ↗</span> : null}
          </Button>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- full shell */

function ShareSpace() {
  return (
    <Button variant="secondary" size="sm" leadingIcon={<UserPlus />} title="Share space">
      <span className="sr-only @xl:not-sr-only">Share space</span>
    </Button>
  );
}

function SwarmShell({
  spaceId,
  paid = true,
  mode = "auto",
  defaultCollapsed,
  defaultSheetOpen,
  className,
}: {
  spaceId: string;
  paid?: boolean;
  mode?: "auto" | "desktop" | "mobile";
  defaultCollapsed?: boolean;
  defaultSheetOpen?: boolean;
  className?: string;
}) {
  const sidebar = useSidebar(spaceId);
  const space = SPACE_BY_ID[sidebar.active] ?? SPACE_BY_ID[spaceId];
  const isSpace = Boolean(SPACE_BY_ID[sidebar.active]);
  return (
    <SidebarAppShell
      className={className}
      mode={mode}
      defaultCollapsed={defaultCollapsed}
      defaultSheetOpen={defaultSheetOpen}
      sidebar={sidebar.render}
      header={
        isSpace ? (
          <ShellBreadcrumb spaceName={space.name} spaceId={space.id} runtime={space.runtime === "gemini_cli" ? "gemini" : space.runtime} />
        ) : (
          <p className="text-[13px] font-medium capitalize text-ink">{sidebar.active}</p>
        )
      }
      actions={isSpace ? <ShareSpace /> : null}
    >
      {!paid ? (
        <PaywallGate note={PRICING_NOTE}>
          <Pricing />
        </PaywallGate>
      ) : isSpace ? (
        <SpaceSplitView key={space.id} running={space.status === "Running"} info={<SpaceInfo space={space} />} app={<SpaceApps />} />
      ) : (
        <div className="grid flex-1 place-items-center p-6 text-center text-[12.5px] text-ink-faint">
          {sidebar.active === "usage" ? "Usage for every space you own · mock data" : "Your spaces at a glance"}
        </div>
      )}
    </SidebarAppShell>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function SidebarAppShellDemo() {
  const local = SPACES.find((s) => s.deployment === "local" && s.status === "Running") ?? SPACES[0];
  const stopped = SPACES.find((s) => s.status === "Stopped") ?? SPACES[0];
  return (
    <DemoStack>
      <DemoSection title="Paid · full app layout, resizable split">
        <SwarmShell spaceId={local.id} className="h-[600px]" />
        <Hint className="mt-3">
          The sidebar toggle collapses to an icon rail. Drag the grip between the details and the apps, or focus it and use the arrow keys
          (Home, End, Enter resets to 370 px). Pick another space in the sidebar.
        </Hint>
      </DemoSection>

      <DemoSection title="Paywall · unpaid account">
        <SwarmShell spaceId={local.id} paid={false} mode="desktop" defaultCollapsed className="h-[560px]" />
        <Hint className="mt-3">The shell stays; the content is replaced by the plans until the account has a subscription.</Hint>
      </DemoSection>

      <DemoSection title="Narrow toggle and mobile sheet">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Specimen label="Narrow toggle layout" note="under 617 px, measured">
            <SwarmShell spaceId={local.id} mode="desktop" defaultCollapsed className="h-[560px] max-w-[580px]" />
          </Specimen>
          <Specimen label="Mobile sheet" note="Escape or the backdrop closes it">
            <SwarmShell spaceId={local.id} mode="mobile" defaultSheetOpen className="h-[560px] w-full max-w-[360px]" />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Stopped space · info only">
        <SwarmShell spaceId={stopped.id} mode="desktop" defaultCollapsed className="h-[560px]" />
        <Hint className="mt-3">A stopped space has no app panel to place, so its details take the full width at any size.</Hint>
      </DemoSection>
    </DemoStack>
  );
}
