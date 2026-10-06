"use client";

import { useState, type ReactNode } from "react";
import { GALILEO, GALILEO_SOURCES } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { ROOT_OPTIONS } from "./demo-data";
import { GraphRootPicker, SourceMenu, SourceSwitcher } from "./scope-switcher";

const FOOTER = { label: "Add or remove sources", href: "/sources" };
const PORTS_ONLY = GALILEO_SOURCES.filter((s) => s.type === "port").slice(0, 3);

function Stage({ children, tall = false, className }: { children: ReactNode; tall?: boolean; className?: string }) {
  return <div className={cn("rounded-[14px] border border-hair-soft bg-[#0a0a0c] p-3", tall && "min-h-[540px]", className)}>{children}</div>;
}

export function ScopeSwitcherDemo() {
  const [source, setSource] = useState<string | null>("acme");
  const [picked, setPicked] = useState<string | null>(null);
  const [root, setRoot] = useState<string | null>(null);
  const current = GALILEO_SOURCES.find((s) => s.name === source);

  return (
    <DemoStack>
      <DemoGrid>
        <DemoCell label="Ports / Files menu · pick navigates" note="↓ opens, arrows move, Esc closes.">
          <Stage tall>
            <SourceSwitcher
              sources={GALILEO_SOURCES}
              current={source}
              onPick={(name) => {
                setSource(name);
                setPicked(name);
              }}
              footer={{ ...FOOTER, onClick: () => setSource(null) }}
              menuWidth="min(420px, calc(100vw - 88px))"
              defaultOpen
            />
          </Stage>
          <Readout label="Showing">{current ? current.url : `${GALILEO.origin}/sources`}</Readout>
          {picked && current && !current.up ? <p className="text-[12px] text-[#ff7a70]">{current.name} is not answering: {current.detail}.</p> : null}
        </DemoCell>

        <DemoCell label="Graph root picker with search" note="Type to filter, ↑ ↓ then Enter. The match is highlighted.">
          <Stage className="min-h-[330px]">
            <div className="flex justify-end">
              <GraphRootPicker options={ROOT_OPTIONS} value={root} onChange={setRoot} defaultLabel="Categories" defaultOpen defaultQuery="re" />
            </div>
          </Stage>
          <Readout label="Graph root">{ROOT_OPTIONS.find((o) => o.id === root)?.label ?? "Categories (default)"}</Readout>
        </DemoCell>
      </DemoGrid>

      <DemoGrid>
        <DemoCell label="Current tinted · down source">
          <Stage>
            <SourceMenu sources={GALILEO_SOURCES.slice(0, 6)} current="storybook" footer={FOOTER} className="w-full" />
          </Stage>
        </DemoCell>
        <div className="flex min-w-0 flex-col gap-8">
          <DemoCell label="Only one group">
            <Stage>
              <SourceMenu sources={PORTS_ONLY} current="acme" className="w-full" />
            </Stage>
          </DemoCell>
          <DemoCell label="Empty · loading">
            <Stage>
              <div className="flex flex-col gap-3">
                <SourceMenu sources={[]} footer={FOOTER} className="w-full" />
                <SourceMenu sources={null} className="w-full" />
              </div>
            </Stage>
          </DemoCell>
        </div>
      </DemoGrid>

      <DemoCell label="Triggers · up · down · on Sources · disabled until the list loads" note="Hover: lime-tinted border.">
        <Stage>
          <div className="flex flex-wrap items-center gap-3">
            <SourceSwitcher sources={GALILEO_SOURCES} current="acme" onPick={() => undefined} />
            <SourceSwitcher sources={GALILEO_SOURCES} current="storybook" onPick={() => undefined} />
            <SourceSwitcher sources={GALILEO_SOURCES} current={null} onPick={() => undefined} />
            <SourceSwitcher sources={null} current={null} onPick={() => undefined} />
            <SourceSwitcher sources={null} current="acme" onPick={() => undefined} />
          </div>
        </Stage>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Graph root · loading roots…">
          <Stage className="min-h-[250px]">
            <GraphRootPicker options={null} value={null} onChange={() => undefined} defaultLabel="Categories" pinnedOpen align="start" />
          </Stage>
        </DemoCell>
        <DemoCell label="Graph root · could not load">
          <Stage className="min-h-[250px]">
            <GraphRootPicker options="error" value={null} onChange={() => undefined} defaultLabel="Categories" pinnedOpen align="start" />
          </Stage>
        </DemoCell>
        <DemoCell label="Graph root · no match in this space">
          <Stage className="min-h-[340px]">
            <GraphRootPicker options={ROOT_OPTIONS} value={null} onChange={() => undefined} defaultLabel="Categories" pinnedOpen defaultQuery="kubernetes" align="start" />
          </Stage>
        </DemoCell>
        <DemoCell label="Graph root · picked root, active row" note="The current root is bold; the active row takes bg-3.">
          <Stage className="min-h-[340px]">
            <GraphRootPicker options={ROOT_OPTIONS.slice(0, 4)} value={ROOT_OPTIONS[1]?.id ?? null} onChange={() => undefined} defaultLabel="Categories" pinnedOpen align="start" />
          </Stage>
        </DemoCell>
      </DemoGrid>
    </DemoStack>
  );
}
