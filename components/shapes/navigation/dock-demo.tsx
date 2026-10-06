"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpToLine,
  ChartColumn,
  Crosshair,
  Folder,
  FolderKanban,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  OctagonPause,
  PlaneLanding,
  Route,
  Satellite,
  Settings2,
  SlidersHorizontal,
  SquareKanban,
} from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { StatusPill } from "@/components/ui/status";
import { CURRENT_SPACE, PROJECT_BY_ID } from "@/lib/fixtures";
import { Caption, DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { SpaceCrumb } from "./breadcrumb";
import { ActionBar, GlassDock, NavigatorDock, TouchPad, type DockApp, type NavTab } from "./dock";

const APPS: DockApp[] = [
  { id: "overview", label: "Overview", href: "/setup/overview", icon: <LayoutDashboard />, tile: "linear-gradient(160deg,#2e9bff,#1b4f9c)" },
  { id: "files", label: "Files", href: "/work", icon: <Folder />, tile: "linear-gradient(160deg,#2fd2ff,#11708a)" },
  { id: "secrets", label: "Secrets", href: "/secrets", icon: <KeyRound />, tile: "linear-gradient(160deg,#3a3a40,#17171a)" },
  { id: "usage", label: "Usage", href: "/usage", icon: <ChartColumn />, tile: "linear-gradient(160deg,#ff9f0a,#94560a)" },
];

const WALLPAPER =
  "radial-gradient(ellipse 80% 70% at 20% 10%, rgba(46,155,255,0.45), transparent 60%), radial-gradient(ellipse 70% 70% at 90% 40%, rgba(191,90,242,0.38), transparent 60%), radial-gradient(ellipse 80% 60% at 40% 110%, rgba(48,209,88,0.3), transparent 60%), #0b0b12";

const PINNED: NavTab[] = [
  { id: "projects", label: "Projects", icon: <FolderKanban />, pinned: true },
  { id: "work", label: "Work", icon: <SquareKanban />, pinned: true },
  { id: "browser", label: "Browser", icon: <Globe />, pinned: true },
  { id: "settings", label: "Settings", icon: <Settings2 />, pinned: true },
];
const OPENABLE = ["xo-space", "galileo", "telescope", "research-notes"];

type Altitude = "orbit" | "surface" | "far";

const TOUCH = [
  { id: "left", label: "Steer left", icon: <ArrowLeft /> },
  { id: "thrust", label: "Thrust forward", icon: <ArrowUp /> },
  { id: "right", label: "Steer right", icon: <ArrowRight /> },
  { id: "reverse", label: "Reverse thrust", icon: <ArrowDown /> },
  { id: "brake", label: "Brake", icon: <OctagonPause /> },
  { id: "rise", label: "Rise", icon: <ArrowUpToLine />, kbd: "R" },
  { id: "descend", label: "Descend", icon: <ArrowDownToLine />, kbd: "F" },
  { id: "open", label: "Open the node nearby", icon: <Crosshair />, kbd: "E" },
  { id: "probe", label: "Fire probe", icon: <Satellite />, kbd: "Q" },
  { id: "land", label: "Land or lift off", icon: <PlaneLanding />, kbd: "L" },
  { id: "overlay", label: "Cycle overlay", icon: <Layers />, kbd: "G" },
  { id: "tours", label: "Open tours", icon: <Route />, kbd: "T" },
];

export function DockDemo() {
  const [app, setApp] = useState("files");
  const [tabs, setTabs] = useState<NavTab[]>([...PINNED, ...OPENABLE.slice(0, 3).map((id) => ({ id, label: PROJECT_BY_ID[id].displayName }))]);
  const [active, setActive] = useState("xo-space");
  const [alt, setAlt] = useState<Altitude>("orbit");
  const [details, setDetails] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [touch, setTouch] = useState<string | null>(null);

  const close = (id: string) => {
    const i = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (active === id) setActive(next[Math.max(0, i - 1)]?.id ?? "projects");
  };
  const reopen = () => {
    const missing = OPENABLE.find((id) => !tabs.some((t) => t.id === id));
    if (!missing) return;
    setTabs([...tabs, { id: missing, label: PROJECT_BY_ID[missing].displayName }]);
    setActive(missing);
  };

  const land = alt === "surface" ? "Lift off" : "Land";

  return (
    <DemoStack>
      <DemoGrid>
        <DemoCell label="Liquid glass dock · tap opens · active dot">
          <div className="flex h-[200px] flex-col justify-end rounded-[22px] border border-hair p-4" style={{ background: WALLPAPER }}>
            <GlassDock apps={APPS} active={app} onOpen={setApp} aria-label="Space apps" />
          </div>
          <Readout label="Opened">{APPS.find((a) => a.id === app)?.label}</Readout>
        </DemoCell>
        <DemoCell label="Disabled · xo-space is down" note="Links stop working and leave the tab order.">
          <div className="flex h-[200px] flex-col justify-between rounded-[22px] border border-hair p-4" style={{ background: WALLPAPER }}>
            <StatusPill status="down" label="Space API" detail="Down" className="self-start" />
            <GlassDock apps={APPS} disabled aria-label="Space apps, unavailable" />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Navigator dock · project tabs" note="← → move between tabs. Middle-click, Delete or × closes an opened tab.">
        <div className="dots flex min-h-[150px] flex-col items-center justify-end gap-3 rounded-[16px] border border-hair-soft bg-[#0a0a0c] px-3 pb-4 pt-10">
          <NavigatorDock
            crumb={
              <>
                <span className="sm:hidden">
                  <SpaceCrumb name={CURRENT_SPACE.name} host={CURRENT_SPACE.host} status="up" mode="mock" compact />
                </span>
                <span className="max-sm:hidden">
                  <SpaceCrumb name={CURRENT_SPACE.name} host={CURRENT_SPACE.host} status="up" mode="mock" />
                </span>
              </>
            }
            tabs={tabs}
            active={active}
            onShow={setActive}
            onClose={close}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Readout label="Showing">{tabs.find((t) => t.id === active)?.label ?? "Projects"}</Readout>
          {tabs.length < PINNED.length + OPENABLE.length ? (
            <button
              type="button"
              onClick={reopen}
              className="rounded-[6px]! font-mono text-[11px] text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink"
            >
              Open another project
            </button>
          ) : null}
        </div>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="HUD action pills · key badges" note="Land swaps to Lift off on a surface; out of range it is disabled.">
          <div className="flex flex-col gap-4">
            <Segmented
              size="sm"
              className="self-start"
              options={[
                { value: "orbit", label: "In orbit" },
                { value: "surface", label: "On surface" },
                { value: "far", label: "Out of range" },
              ]}
              value={alt}
              onChange={setAlt}
              aria-label="Ship position"
            />
            <div className="rounded-[12px] border border-hair-soft bg-[#05060a] p-3">
              <ActionBar
                aria-label="Layer actions"
                onAction={(id) => {
                  if (id === "details") setDetails((d) => !d);
                  else if (id === "land") {
                    setAlt(alt === "surface" ? "orbit" : "surface");
                    setLastAction(land);
                  } else setLastAction(id === "constants" ? "Physics constants" : id === "overlay" ? "Overlay" : "Tours");
                }}
                actions={[
                  { id: "land", label: land, kbd: "L", disabled: alt === "far" },
                  { id: "overlay", label: "Overlay", kbd: "G" },
                  { id: "tours", label: "Tours", kbd: "T" },
                  { id: "constants", icon: <SlidersHorizontal />, "aria-label": "Open physics constants" },
                  { id: "details", label: "Details", expanded: details },
                ]}
              />
              {details ? (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-hair-soft pt-3 font-mono text-[11px]">
                  <dt className="text-ink-faint">Root</dt>
                  <dd className="text-ink">{CURRENT_SPACE.name}</dd>
                  <dt className="text-ink-faint">Layer</dt>
                  <dd className="text-ink">{alt === "surface" ? "Surface" : "Space"}</dd>
                </dl>
              ) : null}
            </div>
            {lastAction ? <Readout label="Last action">{lastAction}</Readout> : null}
          </div>
        </DemoCell>

        <DemoCell label="Touch control pad" note="Shown on touch screens, hidden on desktop in the product.">
          <div className="rounded-[12px] border border-hair-soft bg-[#05060a] p-3">
            <TouchPad aria-label="Flight controls" keys={TOUCH} active={touch} onPress={setTouch} />
          </div>
          {touch ? <Readout label="Pressed">{TOUCH.find((k) => k.id === touch)?.label}</Readout> : <Caption>Tap a control</Caption>}
        </DemoCell>
      </DemoGrid>
    </DemoStack>
  );
}
