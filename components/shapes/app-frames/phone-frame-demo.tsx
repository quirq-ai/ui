"use client";

import { useRef, useState, type ReactNode } from "react";
import { CURRENT_SPACE, PHONE_APPS, TODAY_LABEL } from "@/lib/fixtures";
import { StateChip } from "@/components/ui";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import {
  PhoneAppFrame,
  PhoneBody,
  PhoneHomeScreen,
  ResizablePhone,
  TABLET_WIDTH,
  type PhoneAppState,
} from "./phone-frame";
import { MiniChat, MiniFiles, MiniInbox, MiniProjects, MiniSources, MiniSpaceDashboard, MiniTerminal, MiniUsage } from "./mini-apps";

const TIME = "09:41";

/** Display title per phone app id. */
export const PHONE_APP_TITLE: Record<string, string> = Object.fromEntries(PHONE_APPS.map((a) => [a.id, a.label]));

/** The mock body each phone app opens to inside the phone (shared with the sidebar shell demo). */
export function phoneAppBody(id: string): ReactNode {
  switch (id) {
    case "chat":
      return <MiniChat composer={false} />;
    case "files":
      return <MiniFiles />;
    case "telescope":
      return <MiniSources />;
    case "usage":
      return <MiniUsage />;
    case "inbox":
      return <MiniInbox />;
    case "terminal":
      return <MiniTerminal />;
    case "projects":
      return <MiniProjects />;
    case "setup":
      return <MiniSpaceDashboard />;
    default:
      return (
        <div className="p-5 text-[12.5px] leading-relaxed text-ink-dim">
          {PHONE_APP_TITLE[id] ?? "This app"} opens here, inside the phone, at its own address in {CURRENT_SPACE.name}.
        </div>
      );
  }
}

function SpaceWidget() {
  return (
    <div className="mb-5 rounded-[20px] border border-white/12 bg-white/[0.1] px-4 py-3 backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">{TODAY_LABEL}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="truncate font-mono text-[14px] text-ink">{CURRENT_SPACE.name}</p>
        <StateChip kind="space" state="running" className="ml-auto" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- live phone */

function LivePhone() {
  const [app, setApp] = useState<string | null>(null);
  const [state, setState] = useState<PhoneAppState>("loading");
  const [stall, setStall] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [width, setWidth] = useState(370);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load() {
    setState("loading");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState(stall ? "stalled" : "ready"), stall ? 1600 : 700);
  }

  function open(id: string) {
    setApp(id);
    setNote(null);
    load();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-dim">
          <input type="checkbox" checked={stall} onChange={(e) => setStall(e.target.checked)} className="size-4 accent-[var(--ink)]" />
          Next app load stalls
        </label>
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {width} px · {width >= TABLET_WIDTH ? "tablet" : "phone"}
        </span>
      </div>
      <ResizablePhone height={620} onWidthChange={setWidth} label={`${CURRENT_SPACE.name} on a phone`}>
        {() =>
          app ? (
            <PhoneAppFrame
              title={PHONE_APP_TITLE[app] ?? app}
              state={state}
              time={TIME}
              onBack={() => setApp(null)}
              onReload={load}
              onOpenExternal={() => setNote(`${PHONE_APP_TITLE[app] ?? app} would open in a new browser tab. Off in the catalog.`)}
            >
              {phoneAppBody(app)}
            </PhoneAppFrame>
          ) : (
            <PhoneHomeScreen apps={PHONE_APPS} onOpenApp={open} time={TIME} header={<SpaceWidget />} />
          )
        }
      </ResizablePhone>
      <Hint>
        Drag either edge, or focus an edge and use the arrow keys (Shift for bigger steps, Home, End, Enter for 370 px). Tap an app to open
        it inside the phone; Back returns home.
      </Hint>
      {note ? (
        <p role="status" className="text-[12px] text-ink-dim">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

const STATIC_PHONE = "mx-auto w-full max-w-[330px]";

export function PhoneFrameDemo() {
  const [stalledKey, setStalledKey] = useState(0);
  return (
    <DemoStack>
      <DemoSection title="Phone · drag edges · in-phone apps">
        <LivePhone />
      </DemoSection>

      <DemoSection title="States">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Specimen label="In-phone app · loaded">
            <PhoneBody className={STATIC_PHONE} style={{ height: 540 }} label="Usage app inside the phone">
              <PhoneAppFrame title="Usage" state="ready" time={TIME} onBack={() => {}} onReload={() => {}} onOpenExternal={() => {}}>
                <MiniUsage />
              </PhoneAppFrame>
            </PhoneBody>
          </Specimen>
          <Specimen label="App stalled" note="frame never fired load">
            <PhoneBody className={STATIC_PHONE} style={{ height: 540 }} label="Stalled app inside the phone">
              <PhoneAppFrame
                key={stalledKey}
                title="Space dashboard"
                state="stalled"
                time={TIME}
                onBack={() => {}}
                onReload={() => setStalledKey((k) => k + 1)}
                onOpenExternal={() => {}}
              >
                <MiniSpaceDashboard />
              </PhoneAppFrame>
            </PhoneBody>
          </Specimen>
          <Specimen label="Dock disabled · Space API down">
            <PhoneBody className={STATIC_PHONE} style={{ height: 540 }} label="Home screen with the dock disabled">
              <PhoneHomeScreen apps={PHONE_APPS} time={TIME} dockDisabled />
            </PhoneBody>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Dragging and expanded">
        <div className="grid gap-6 lg:grid-cols-2">
          <Specimen label="Dragging" note="readout pill and lit edges">
            <ResizablePhone defaultWidth={330} height={480} forceDragging label="Phone while dragging">
              {() => <PhoneHomeScreen apps={PHONE_APPS} time={TIME} />}
            </ResizablePhone>
          </Specimen>
          <Specimen label="Expanded" note="fills the stage, edges hidden">
            <ResizablePhone defaultExpanded height={480} label="Expanded phone">
              {() => (
                <PhoneAppFrame title="Chat" state="ready" time={TIME} onBack={() => {}}>
                  <MiniChat composer={false} />
                </PhoneAppFrame>
              )}
            </ResizablePhone>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Tablet · 560 px">
        {/* fixed at 560 px so the tablet layout shows on any page width; narrow pages scroll it */}
        <div className="scroll-thin overflow-x-auto pb-2">
          <PhoneBody className="mx-auto w-[560px]" style={{ height: 460 }} label="Space on a tablet">
            <PhoneHomeScreen apps={PHONE_APPS} time={TIME} header={<SpaceWidget />} />
          </PhoneBody>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
