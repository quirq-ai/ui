"use client";

import { useState, type KeyboardEvent } from "react";
import { RotateCw } from "lucide-react";
import { FILE_TREE, flattenTree, mulberry32 } from "@/lib/fixtures";
import { formatBytes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Segmented } from "@/components/ui/segmented";
import { CourseChip, DemoMissionHud, FileSignalPanel, HudKeyButton, HudNote, MissionPanel, WorldSignaturePanel, type DemoPhase } from "./hud-panels";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

/* seeded starfield: same dots on server and client */
const STARS = (() => {
  const r = mulberry32(2026);
  return Array.from({ length: 90 }, () => ({ x: r() * 1000, y: r() * 560, s: r() < 0.12 ? 1.6 : r() < 0.5 ? 1 : 0.6, o: 0.25 + r() * 0.6 }));
})();

const FILES = flattenTree(FILE_TREE)
  .map((f) => f.node)
  .filter((n) => n.type === "file" && n.size > 0)
  .slice(0, 8);

const TOTAL_BYTES = FILES.reduce((n, f) => n + f.size, 0);

const OBJECTIVES = [
  "Reach the first beacon.",
  "Turn through the next gate.",
  "Bring your ship to a stop.",
  "Approach the observatory.",
  "Land on the observatory.",
  "Open your first file.",
  "Reveal the field.",
  "Discover a signal.",
  "Return to space.",
];

type Signal = "detected" | "range" | "flight" | "hit";
const SIGNAL_WORD: Record<Signal, string> = { detected: "Signal detected", range: "Within scan range", flight: "Shot in flight", hit: "Signal hit" };

function Starfield() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="hud-neb" cx="65%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(47,210,255,0.10)" />
          <stop offset="60%" stopColor="rgba(191,90,242,0.05)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#hud-neb)" />
      {STARS.map((st, i) => (
        <circle key={i} cx={st.x.toFixed(1)} cy={st.y.toFixed(1)} r={st.s} fill="#fff" opacity={st.o.toFixed(2)} />
      ))}
      <circle cx="610" cy="300" r="46" fill="none" stroke="rgba(47,210,255,0.35)" strokeDasharray="3 6" />
      <circle cx="610" cy="300" r="18" fill="rgba(191,90,242,0.35)" />
    </svg>
  );
}

function Cockpit() {
  const later = useLater();
  const [mode, setMode] = useState<"expedition" | "demo">("expedition");
  const [charted, setCharted] = useState(2);
  const [landed, setLanded] = useState(1);
  const [signal, setSignal] = useState<Signal>("range");
  const [fileIdx, setFileIdx] = useState(0);
  const [course, setCourse] = useState<string | null>("observatory · signals");
  const [physics, setPhysics] = useState(true);
  const [current, setCurrent] = useState(5);
  const [phase, setPhase] = useState<DemoPhase>("playing");
  const [last, setLast] = useState<string>("");

  const file = FILES[fileIdx % FILES.length];
  const busy = signal === "flight";

  function open() {
    if (busy) return;
    setSignal("flight");
    setLast("E: fire to open");
    later(() => {
      setSignal("hit");
      setCharted((c) => Math.min(c + 1, 5));
    }, 600);
    later(() => {
      setSignal("range");
      setFileIdx((i) => i + 1);
    }, 1500);
  }
  function land() {
    setLanded((l) => (l >= 3 ? l : l + 1));
    setLast("L: land / lift off");
  }
  function advance() {
    if (phase === "complete") return;
    setPhase("celebrating");
    later(() => {
      if (current >= OBJECTIVES.length - 1) {
        setPhase("complete");
      } else {
        setCurrent((c) => c + 1);
        setPhase("playing");
      }
    }, 900);
  }
  function reset() {
    setCharted(0);
    setLanded(0);
    setSignal("detected");
    setCurrent(0);
    setPhase("playing");
    setCourse("observatory · signals");
    setLast("Reset");
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const k = e.key.toLowerCase();
    if (k === "e") {
      e.preventDefault();
      if (mode === "demo") advance();
      else open();
    } else if (k === "l") {
      e.preventDefault();
      if (mode === "demo") advance();
      else land();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          aria-label="Flight mode"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: "expedition", label: "Expedition" },
            { value: "demo", label: "Sample mission" },
          ]}
        />
        <Button size="sm" variant="subtle" leadingIcon={<RotateCw />} onClick={reset}>
          Reset
        </Button>
      </div>
      <div
        role="group"
        aria-label="Cockpit. Press E to open nearby or fire from range, L to land or lift off."
        aria-keyshortcuts="E L"
        tabIndex={0}
        onKeyDown={onKey}
        className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[#05060a] p-3 sm:p-5"
      >
        <Starfield />
        <div className="relative grid gap-4 lg:grid-cols-[254px_1fr_284px]">
          <div className="flex flex-col gap-3">
            {mode === "expedition" ? (
              <>
                <MissionPanel
                  expedition="01"
                  headline="Chart the unknown."
                  body={
                    <>
                      Chart five atoms. Land on three worlds.
                      <br />
                      <Kbd size="xs" subtle>
                        L
                      </Kbd>{" "}
                      land / lift off ·{" "}
                      <Kbd size="xs" subtle>
                        E
                      </Kbd>{" "}
                      open nearby or fire from range.
                    </>
                  }
                  charted={charted}
                  chartedTotal={5}
                  landed={landed}
                  landedTotal={3}
                />
                <HudNote kind="tour" kicker="Guided tour">
                  Start here. Each atom is a real file; the viewer reads it without changing it.
                </HudNote>
              </>
            ) : (
              <DemoMissionHud
                objectives={OBJECTIVES}
                current={current}
                phase={phase}
                meaning="Every atom represents a real file. The viewer reads it without changing it."
                score={`${OBJECTIVES.length} objectives cleared · 2 files scanned`}
                controls={
                  <>
                    <HudKeyButton label="Land" keyName="L" onClick={advance} spotlight={current === 4 && phase === "playing"} disabled={phase === "complete"} />
                    <HudKeyButton label="Open file" keyName="E" onClick={advance} spotlight={current === 5 && phase === "playing"} disabled={phase === "complete"} />
                  </>
                }
              />
            )}
          </div>
          <div className="flex min-h-[120px] flex-col items-center gap-4 py-1">
            {course ? (
              <CourseChip destination={course} distance="184 units" onCancel={() => setCourse(null)} />
            ) : (
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">No course set</p>
            )}
            <p role="status" className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
              {last ? `Last input · ${last}` : "Focus the cockpit, then press E or L"}
            </p>
            <HudNote kind="activity" kicker="The world is listening" className="mt-auto self-start">
              Edits in this folder ripple into the map.
            </HudNote>
          </div>
          <div className="scroll-thin flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-0.5">
            <WorldSignaturePanel
              name="Kepler sample"
              physics={physics}
              onPhysicsChange={setPhysics}
              stats={[
                { label: "Bodies", value: String(FILES.length) },
                { label: "Emitting", value: String(FILES.filter((f) => f.git).length) },
                { label: "Total mass", value: formatBytes(TOTAL_BYTES) },
              ]}
              note="Bytes give mass. Changes add excitation; light fades as it cools."
            />
            {mode === "expedition" ? (
              <FileSignalPanel
                status={SIGNAL_WORD[signal]}
                distance={signal === "detected" ? "62 u" : "14 u"}
                name={file.name}
                path={file.path}
                chips={[file.language ?? "file", formatBytes(file.size), file.git ?? "unchanged"]}
                buttonLabel={signal === "flight" ? "Firing…" : signal === "detected" ? "Aim ship or approach" : "Open file"}
                disabled={signal === "detected" || busy}
                hit={signal === "hit"}
                onOpen={open}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => (mode === "demo" ? advance() : setSignal((s) => (s === "detected" ? "range" : s)))}>
          {mode === "demo" ? "Next objective" : "Approach the signal"}
        </Button>
        {mode === "expedition" ? (
          <Button size="sm" onClick={land}>
            Land <Kbd size="xs" subtle>L</Kbd>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function HudPanelsDemo() {
  return (
    <DemoStack>
      <DemoSection title="Cockpit · E open, L land · mission hidden during the sample mission">
        <Cockpit />
      </DemoSection>
      <DemoSection title="Panel states">
        <div className="grid gap-4 sm:grid-cols-2">
          <Specimen label="Mission · complete">
            <MissionPanel expedition="01" headline="Chart the unknown." body="Chart five atoms. Land on three worlds." charted={5} chartedTotal={5} landed={3} landedTotal={3} />
          </Specimen>
          <Specimen label="World · before connection">
            <WorldSignaturePanel
              name={null}
              physics
              stats={[
                { label: "Bodies", value: null },
                { label: "Emitting", value: null },
                { label: "Total mass", value: null },
              ]}
              note="Connect a folder to create your world."
            />
          </Specimen>
          <Specimen label="File signal · charted">
            <FileSignalPanel
              status="Charted signal"
              distance="9 u"
              name="README.md"
              path="observatory/README.md"
              chips={["markup", "1.2 KB", "modified"]}
              buttonLabel="Open file"
            />
          </Specimen>
          <Specimen label="File signal · detected, open disabled until in range">
            <FileSignalPanel
              status="Signal detected"
              distance="62 u"
              name="index.html"
              path="observatory/index.html"
              chips={["markup", "4.1 KB", "unchanged"]}
              buttonLabel="Aim ship or approach"
              disabled
            />
          </Specimen>
          <Specimen label="Demo mission · celebrating (0.9 s)">
            <DemoMissionHud objectives={OBJECTIVES.slice(0, 4)} current={2} phase="celebrating" />
          </Specimen>
          <Specimen label="Demo mission · complete">
            <DemoMissionHud objectives={OBJECTIVES.slice(0, 4)} current={4} phase="complete" score="4 objectives cleared · 1 file scanned" />
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
