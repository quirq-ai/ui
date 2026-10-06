"use client";

import { useId, useRef, useState } from "react";
import { CURRENT_SPACE, PROJECTS } from "@/lib/fixtures";
import { Kbd, Segmented, Spinner } from "@/components/ui";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import { AtlasDialog, HudCockpit, HudFooter, HudHeader, StarfieldCanvas, type HudBody, type HudSourceState } from "./hud-cockpit";

const SPACE_PROJECTS = PROJECTS.filter((p) => p.spaceId === CURRENT_SPACE.id);
const SAMPLE_PROJECTS = PROJECTS.filter((p) => p.category === "Engineering").slice(0, 4);

function toBodies(list: typeof PROJECTS): HudBody[] {
  return list.map((p, i) => {
    const angle = i * 2.4 + 0.6;
    const radius = 110 + i * 34;
    return {
      id: p.id,
      label: p.displayName,
      color: p.color,
      size: Math.round(7 + Math.min(p.files, 320) / 24),
      x: Math.round(500 + Math.cos(angle) * radius * 1.5),
      y: Math.round(300 + Math.sin(angle) * radius * 0.75),
    };
  });
}

const BODIES = toBodies(SPACE_PROJECTS);
const SAMPLE_BODIES = toBodies(SAMPLE_PROJECTS);

const START = { x: 128, y: 4, z: -311 };

function coordsFor(body: HudBody | undefined) {
  if (!body) return START;
  return { x: body.x - 500, y: Math.round((300 - body.y) / 3), z: -body.size * 12 };
}

function Intro({ onConnect, onSample, scanning }: { onConnect: () => void; onSample: () => void; scanning: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center px-6 @min-[44rem]:px-12">
      <div className="max-w-[420px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aab8ff]">Local only · nothing is uploaded</p>
        <h2 className="mt-3 text-[clamp(26px,4cqw,40px)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">Fly through your files.</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-[#b9c1e0]">
          Choose a folder and its projects become planets. Recent changes add light and gravity. Files stay on this machine.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onConnect}
            disabled={scanning}
            className="inline-flex h-9 items-center gap-2 rounded-full! bg-ink px-4 text-[13px] font-semibold text-black transition-colors hover:bg-[#e8e8e6] disabled:opacity-70"
          >
            {scanning ? <Spinner size="sm" label={null} /> : null}
            {scanning ? "Scanning…" : "Choose a folder"}
          </button>
          <button
            type="button"
            onClick={onSample}
            className="h-9 rounded-full! border border-white/40 px-4 text-[13px] font-semibold text-ink transition-colors hover:border-white/75"
          >
            Play the sample mission
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveCockpit({
  initialSource = "none",
  initialTarget = null,
  sourcePicker = true,
  className = "h-[560px]",
}: {
  initialSource?: HudSourceState;
  initialTarget?: string | null;
  /** The No folder / Connected / Sample control above the frame. */
  sourcePicker?: boolean;
  className?: string;
}) {
  const [source, setSource] = useState<HudSourceState>(initialSource);
  const [scanning, setScanning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [atlas, setAtlas] = useState(false);
  const [help, setHelp] = useState(false);
  const [target, setTarget] = useState<string | null>(initialTarget);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const helpId = useId();

  const bodies = source === "connected" ? BODIES : source === "sample" ? SAMPLE_BODIES : [];
  const coords = coordsFor(bodies.find((b) => b.id === target));

  function connect() {
    setScanning(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setScanning(false);
      setSource("connected");
    }, 900);
  }

  function choose(next: HudSourceState) {
    setSource(next);
    setTarget(null);
    setAtlas(false);
  }

  const note =
    source === "none" ? "Choose a folder" : source === "sample" ? "Sample mission · fictional projects" : `${CURRENT_SPACE.name} · scanned just now`;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {sourcePicker ? (
        <Segmented<HudSourceState>
          aria-label="Source"
          size="sm"
          className="self-start"
          value={source}
          onChange={choose}
          options={[
            { value: "none", label: "No folder" },
            { value: "connected", label: "Connected" },
            { value: "sample", label: "Sample" },
          ]}
        />
      ) : null}
      <HudCockpit
        className={className}
        onEscape={() => (help ? setHelp(false) : setPaused((p) => !p))}
        onAtlasKey={() => bodies.length && setAtlas(true)}
        header={
          <HudHeader
            source={source}
            sourceLabel={`${CURRENT_SPACE.name} · ${BODIES.length} projects`}
            onConnect={connect}
            onHelp={() => setHelp((h) => !h)}
            helpOpen={help}
            helpId={helpId}
            githubHref="https://github.com/quirq-ai/space-drift"
          />
        }
        footer={
          <HudFooter
            coords={coords}
            note={note}
            atlasEnabled={bodies.length > 0}
            onAtlas={() => setAtlas(true)}
            paused={paused}
            onPause={() => setPaused((p) => !p)}
          />
        }
      >
        <StarfieldCanvas bodies={bodies} paused={paused} target={target} />
        {source === "none" ? <Intro onConnect={connect} onSample={() => choose("sample")} scanning={scanning} /> : null}
        {target ? (
          <p className="absolute left-4 top-4 rounded-[8px] border border-[rgba(170,184,255,0.25)] bg-black/50 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#dfe4ff] @min-[44rem]:left-9">
            Destination · {bodies.find((b) => b.id === target)?.label}
          </p>
        ) : null}
        {help ? (
          <aside
            id={helpId}
            aria-label="Flight manual"
            className="absolute right-4 top-4 z-10 w-[220px] max-w-[calc(100%-32px)] rounded-[12px] border border-[rgba(170,184,255,0.25)] bg-[#0a0c18]/95 p-3 text-[12px] text-[#b9c1e0] @min-[44rem]:right-9"
          >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#aab8ff]">Field notes</p>
            <dl className="grid grid-cols-[1fr_auto] gap-y-1.5">
              <dt>Choose a destination</dt>
              <dd>
                <Kbd size="xs">M</Kbd>
              </dd>
              <dt>Pause or resume</dt>
              <dd>
                <Kbd size="xs">esc</Kbd>
              </dd>
            </dl>
            <p className="mt-2 text-[11px] text-[#8f97b8]">Escape closes this first.</p>
          </aside>
        ) : null}
        {paused ? (
          <div className="absolute inset-0 grid place-items-center bg-black/45">
            <p role="status" className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#dfe4ff]">
              Paused · Esc resumes
            </p>
          </div>
        ) : null}
      </HudCockpit>
      <AtlasDialog
        open={atlas}
        onClose={() => setAtlas(false)}
        bodies={bodies}
        onPick={(id) => {
          setTarget(id);
          setAtlas(false);
        }}
      />
      {sourcePicker ? (
        <Hint>Click the canvas, then press M for the atlas (once a source exists) or Escape to pause. Choose a folder runs a short mock scan.</Hint>
      ) : null}
    </div>
  );
}

export function HudCockpitDemo() {
  return (
    <DemoStack>
      <DemoSection title="Desktop · no folder, connected, sample">
        <LiveCockpit />
      </DemoSection>
      <DemoSection title="Mobile · 70px header, condensed connection">
        <div className="grid gap-6 md:grid-cols-2">
          <Specimen label="Mobile · no folder" note="Atlas disabled until a source exists">
            <LiveCockpit sourcePicker={false} className="h-[460px] w-full max-w-[360px]" />
          </Specimen>
          <Specimen label="Mobile · connected" note="M opens the atlas">
            <LiveCockpit sourcePicker={false} initialSource="connected" initialTarget={BODIES[0]?.id ?? null} className="h-[460px] w-full max-w-[360px]" />
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
