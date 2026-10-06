"use client";

import { useRef, useState } from "react";
import { AppWindow, CircleDot, FileText, FolderKanban } from "lucide-react";
import { SPACE_BY_ID } from "@/lib/fixtures";
import { StateChip, XOMark } from "@/components/ui";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import { DockingWorkspace, EMPTY_LAYOUT, type DockLayout, type DockPane } from "./docking-workspace";
import { AppIframePane, type AppPaneState } from "./embedded-frame";
import { MiniChat, MiniFiles, MiniIssueBoard, MiniProjects, MiniSpaceDashboard } from "./mini-apps";

const SPACE = SPACE_BY_ID["ws_7f3a9c21e4b0"];

function SpacePane({ appName }: { appName: string }) {
  const [state, setState] = useState<AppPaneState>("ready");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <AppIframePane
      appName={appName}
      state={state}
      onReload={() => {
        setState("minting");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("ready"), 700);
      }}
      onOpenExternal={() => {}}
    >
      <MiniSpaceDashboard space={SPACE} />
    </AppIframePane>
  );
}

const PANES: DockPane[] = [
  { id: "issues", label: "Issue board", icon: <CircleDot />, render: () => <MiniIssueBoard /> },
  { id: "files", label: "Files", icon: <FileText />, render: () => <div className="scroll-thin h-full overflow-y-auto"><MiniFiles limit={24} /></div> },
  { id: "projects", label: "Projects", icon: <FolderKanban />, render: () => <div className="scroll-thin h-full overflow-y-auto"><MiniProjects /></div> },
  { id: "space", label: "Space", icon: <AppWindow />, render: () => <SpacePane appName="Space" /> },
  { id: "cowork", label: "Cowork", icon: <AppWindow />, render: () => <SpacePane appName="Cowork" /> },
];

const SPLIT: DockLayout = {
  tabsets: [
    { id: "ts-1", tabs: ["issues", "projects"], selected: "issues" },
    { id: "ts-2", tabs: ["files", "space"], selected: "files" },
  ],
  weights: [30, 40, 30],
};

function Toolbar() {
  return (
    <div className="flex min-w-0 items-center gap-2 px-1">
      <XOMark height={10} title="XO" />
      <span className="truncate font-mono text-[12.5px] text-ink">{SPACE.name}</span>
      <StateChip kind="space" state="running" className="@max-md:hidden!" />
    </div>
  );
}

const chat = <MiniChat />;

export function DockingWorkspaceDemo() {
  return (
    <DemoStack>
      <DemoSection title="Split · drag tabs, resize, toggle views">
        <DockingWorkspace panes={PANES} chat={chat} toolbar={<Toolbar />} initialLayout={SPLIT} storageKey="quirq-shapes:dock:v1" className="h-[520px]" />
        <Hint className="mt-3">
          Drag a tab onto another strip, or onto Split right. Drag a splitter or focus it and use the arrow keys. On a focused tab, Alt Shift
          Arrow moves it to the next column and Delete closes it. Views toggles panes; Reset layout restores the default. Your layout comes
          back after a reload as Layout restored.
        </Hint>
      </DemoSection>

      <DemoSection title="States">
        <div className="grid gap-6">
          <Specimen label="Dragging" note="drop indicators at 14% blue">
            <DockingWorkspace
              stackBelow={480}
              panes={PANES}
              chat={chat}
              toolbar={<Toolbar />}
              initialLayout={{ tabsets: [{ id: "ts-1", tabs: ["issues", "files"], selected: "issues" }], weights: [38, 62] }}
              previewDrag={{ paneId: "files", tabsetId: "ts-1", zone: "split" }}
              className="h-[380px]"
            />
          </Specimen>
          <Specimen label="Restored" note="from this browser">
            <DockingWorkspace
              stackBelow={480}
              panes={PANES}
              chat={chat}
              toolbar={<Toolbar />}
              initialLayout={{ tabsets: [{ id: "ts-1", tabs: ["space", "issues"], selected: "space" }], weights: [45, 55] }}
              showRestored
              className="h-[380px]"
            />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Empty and phone stack">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Specimen label="Empty · chat only" note="held to a readable column">
            <DockingWorkspace stackBelow={480} panes={PANES} chat={chat} toolbar={<Toolbar />} initialLayout={EMPTY_LAYOUT} className="h-[420px]" />
          </Specimen>
          <Specimen label="Phone stack" note="one tabset, chat first, no dragging">
            <DockingWorkspace
              stackBelow={480}
              panes={PANES}
              chat={chat}
              toolbar={<Toolbar />}
              mode="stack"
              initialLayout={{ tabsets: [{ id: "ts-1", tabs: ["issues", "files"], selected: "issues" }], weights: [30, 70] }}
              className="h-[420px] w-full max-w-[340px]"
            />
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
