"use client";

import { useState } from "react";
import { Code, Eye, FolderTree, List, Monitor, Moon, Network, RotateCw, Sun } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { Kbd } from "@/components/ui/kbd";
import { INBOX_NEW_COUNT, WORK_ITEMS } from "@/lib/fixtures";
import { Caption, DemoCell, DemoGrid, DemoStack, Readout, Surface } from "./demo-kit";
import { ROOT_OPTIONS } from "./demo-data";
import { GraphRootPicker } from "./scope-switcher";
import { LensSwitch, PillTabs, SubNav, SubNavAction, ToggleGroup, ViewTabs, type SegmentItem } from "./segmented";

type Section = "projects" | "agents" | "inbox" | "setup";

const SECTIONS: SegmentItem<Section>[] = [
  { id: "projects", label: "Projects" },
  { id: "agents", label: "Agents" },
  { id: "inbox", label: "Inbox", count: INBOX_NEW_COUNT },
  { id: "setup", label: "Setup" },
];

const SUBNAV: Record<Section, SegmentItem[]> = {
  projects: [
    { id: "overview", label: "Overview" },
    { id: "data", label: "Data" },
    { id: "timeline", label: "Timeline" },
    { id: "manage", label: "Manage" },
  ],
  agents: [
    { id: "overview", label: "Overview" },
    { id: "sessions", label: "Sessions" },
    { id: "trends", label: "Trends" },
    { id: "configure", label: "Configure" },
  ],
  inbox: [
    { id: "items", label: "Items" },
    { id: "connections", label: "Connections" },
    { id: "jobs", label: "Jobs" },
    { id: "activity", label: "Activity" },
    { id: "sharing-activity", label: "Sharing activity" },
    { id: "sharing", label: "Sharing" },
  ],
  setup: [
    { id: "projects-folder", label: "Projects folder" },
    { id: "intelligence", label: "Intelligence layer" },
    { id: "connectors", label: "Connectors" },
    { id: "secrets", label: "Secrets" },
    { id: "jobs", label: "Jobs" },
    { id: "server", label: "Server" },
  ],
};

type Lens = "list" | "graph" | "tree";
const LENSES: SegmentItem<Lens>[] = [
  { id: "list", label: "List", icon: <List /> },
  { id: "graph", label: "Graph", icon: <Network /> },
  { id: "tree", label: "Tree", icon: <FolderTree /> },
];

const spaceItems = WORK_ITEMS.filter((w) => w.projectId === "xo-space");
const OPEN = spaceItems.filter((w) => w.status === "open").length;
const CLOSED = spaceItems.filter((w) => w.status === "closed").length;

export function SegmentedDemo() {
  const [section, setSection] = useState<Section>("projects");
  const [sub, setSub] = useState<Record<Section, string>>({ projects: "data", agents: "sessions", inbox: "items", setup: "connectors" });
  const [lens, setLens] = useState<Lens>("graph");
  const [root, setRoot] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [compact, setCompact] = useState<Section>("setup");
  const [mode, setMode] = useState<"file" | "project">("file");
  const [lens2, setLens2] = useState<Lens>("list");
  const [range, setRange] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [issues, setIssues] = useState<"open" | "closed" | "all">("open");
  const [preview, setPreview] = useState<"preview" | "code">("preview");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [logs, setLogs] = useState<"agent" | "build">("agent");
  const [view, setView] = useState<"map" | "dashboards" | "chart">("dashboards");
  const [view2, setView2] = useState<"map" | "dashboards" | "chart">("map");

  const route = `#/${section}/${sub[section]}${section === "projects" && sub.projects === "data" ? `/${lens}` : ""}`;

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 1400);
  };

  return (
    <DemoStack>
      <DemoCell
        label="Primary pill tabs with badge · underline sub-nav"
        note={
          <span className="inline-flex flex-wrap items-center gap-1">
            Focus the tabs, then press <Kbd size="xs">1</Kbd> <Kbd size="xs">2</Kbd> <Kbd size="xs">3</Kbd> <Kbd size="xs">4</Kbd>
          </span>
        }
      >
        <Surface clip={false}>
          <div className="flex justify-center rounded-t-[13px] border-b border-hair bg-[#0a0a0b] px-3 py-3">
            <PillTabs items={SECTIONS} value={section} onChange={setSection} aria-label="Space dashboard" shortcuts hrefFor={(id) => `#/${id}`} />
          </div>
          <SubNav
            items={SUBNAV[section]}
            value={sub[section]}
            onChange={(id) => setSub((s) => ({ ...s, [section]: id }))}
            aria-label={`${SECTIONS.find((s) => s.id === section)?.label} sections`}
            hrefFor={(id) => `#/${section}/${id}`}
            actions={
              <>
                <SubNavAction busy={refreshing} onClick={refresh} icon={<RotateCw />}>
                  {refreshing ? "Refreshing…" : "Refresh"}
                </SubNavAction>
                {section === "projects" ? (
                  <GraphRootPicker options={ROOT_OPTIONS} value={root} onChange={setRoot} defaultLabel="Categories" />
                ) : null}
              </>
            }
          />
          <div className="flex min-h-[132px] flex-col gap-4 px-4 py-5 sm:px-[26px]">
            {section === "projects" && sub.projects === "data" ? (
              <LensSwitch items={LENSES} value={lens} onChange={setLens} aria-label="Data view" hrefFor={(id) => `#/projects/data/${id}`} />
            ) : null}
            <p className="text-[13px] text-ink-dim">
              <span className="font-medium text-ink">{SECTIONS.find((s) => s.id === section)?.label}</span>
              {" · "}
              {SUBNAV[section].find((s) => s.id === sub[section])?.label}
              {section === "projects" && sub.projects === "data" ? ` · ${LENSES.find((l) => l.id === lens)?.label} view` : null}
            </p>
          </div>
        </Surface>
        <Readout label="Route">{route}</Readout>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Pill tabs · compact, scrollable strip" note="Active tab scrolls into view.">
          <div className="max-w-[230px]">
            <PillTabs items={SECTIONS} value={compact} onChange={setCompact} aria-label="Space dashboard, compact" size="compact" />
          </div>
        </DemoCell>

        <DemoCell label="States · active, hover, disabled" note="Static samples of each look.">
          {/* inert: a picture of the states, not a control to operate. */}
          <div inert>
            <LensSwitch
              items={[
                { id: "active", label: "Active" },
                { id: "hover", label: "Hover" },
                { id: "disabled", label: "Disabled", disabled: true },
              ]}
              value="active"
              hoverId="hover"
              onChange={() => undefined}
              aria-label="State samples"
            />
          </div>
        </DemoCell>

        <DemoCell label="Lens switch · By file | By project">
          <LensSwitch
            items={[
              { id: "file", label: "By file" },
              { id: "project", label: "By project" },
            ]}
            value={mode}
            onChange={setMode}
            aria-label="Timeline mode"
          />
        </DemoCell>

        <DemoCell label="Lens switch · disabled option" note="Tree has no files yet.">
          <LensSwitch
            items={LENSES.map((l) => (l.id === "tree" ? { ...l, disabled: true } : l))}
            value={lens2}
            onChange={setLens2}
            aria-label="Data view for billing-api"
          />
        </DemoCell>

        <DemoCell label="Toggle group · Today | 7 days | 30 days | All">
          <ToggleGroup
            items={[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 days" },
              { id: "30d", label: "30 days" },
              { id: "all", label: "All" },
            ]}
            value={range}
            onChange={setRange}
            aria-label="Time window"
          />
        </DemoCell>

        <DemoCell label="Toggle group · issue states with counts" note="xo-space work items.">
          <ToggleGroup
            variant="filled"
            items={[
              { id: "open", label: "Open", count: OPEN },
              { id: "closed", label: "Closed", count: CLOSED },
              { id: "all", label: "All", count: spaceItems.length },
            ]}
            value={issues}
            onChange={setIssues}
            aria-label="Issue state"
          />
        </DemoCell>

        <DemoCell label="Card tabs · Agent logs | Build logs">
          <Segmented
            size="sm"
            options={[
              { value: "agent", label: "Agent logs" },
              { value: "build", label: "Build logs" },
            ]}
            value={logs}
            onChange={setLogs}
            aria-label="Log stream"
            className="w-fit"
          />
        </DemoCell>

        <DemoCell label="Preview | Code">
          <div className="flex flex-col gap-3">
            <Segmented
              size="sm"
              options={[
                { value: "preview", label: "Preview", icon: <Eye /> },
                { value: "code", label: "Code", icon: <Code /> },
              ]}
              value={preview}
              onChange={setPreview}
              aria-label="File view"
              className="w-fit"
            />
            <div className="rounded-[10px] border border-hair-soft bg-s1 px-3.5 py-3 text-[12.5px]">
              {preview === "preview" ? (
                <p className="text-ink">
                  <b className="font-semibold">xo-space</b> <span className="text-ink-dim">runs a space locally: engine, Space API and Space dashboard.</span>
                </p>
              ) : (
                <code className="block whitespace-pre font-mono text-[11.5px] text-ink-dim">{"# xo-space\nRuns a space locally."}</code>
              )}
            </div>
          </div>
        </DemoCell>

        <DemoCell label="Light | Dark | System">
          <div className="flex items-center gap-3">
            <Segmented
              iconOnly
              options={[
                { value: "light", label: "Light", icon: <Sun /> },
                { value: "dark", label: "Dark", icon: <Moon /> },
                { value: "system", label: "System", icon: <Monitor /> },
              ]}
              value={theme}
              onChange={setTheme}
              aria-label="Theme"
            />
            <Caption as="span">Theme · {theme}</Caption>
          </div>
        </DemoCell>

        <DemoCell label="View tabs · Map | Dashboards | Chart">
          <ViewTabs
            items={[
              { id: "map", label: "Map" },
              { id: "dashboards", label: "Dashboards" },
              { id: "chart", label: "Chart" },
            ]}
            value={view}
            onChange={setView}
            aria-label="Visualizer view"
          />
        </DemoCell>

        <DemoCell label="View tabs · disabled" note="Chart has no data for this root.">
          <ViewTabs
            items={[
              { id: "map", label: "Map" },
              { id: "dashboards", label: "Dashboards" },
              { id: "chart", label: "Chart", disabled: true },
            ]}
            value={view2}
            onChange={setView2}
            aria-label="Visualizer view, chart unavailable"
          />
        </DemoCell>
      </DemoGrid>
    </DemoStack>
  );
}
