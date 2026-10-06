"use client";

// Demo: Instrument readouts and legends. Astrophysics and chemistry panels (emitting and
// partial values), element legends, the flight readout with live updates, the overlay
// legend (cycle with G or the layer switch), world labels and the targeting reticle.
import { useEffect, useState, type KeyboardEvent } from "react";
import { Crosshair, Pause, Play, Zap } from "lucide-react";
import { FILE_TREE, flattenTree, seededSeries } from "@/lib/fixtures";
import { formatBytes, formatFixed, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Kbd } from "@/components/ui/kbd";
import { Caption, Cell } from "./demo-kit";
import {
  ElementLegend,
  FlightReadout,
  InstrumentPanel,
  OverlayLegendCard,
  TargetingReticle,
  WorldLabel,
  type InstrumentTone,
  type LegendItem,
  type ReticleState,
} from "./instruments";

/* ----------------------------------------------------------------------------- data from the xo-space tree */

const nodes = flattenTree(FILE_TREE);
const files = nodes.filter((n) => n.node.type === "file").map((n) => n.node);
const folders = nodes.filter((n) => n.node.type === "folder").length;
const changed = files.filter((f) => f.git !== null);
const excitation = changed.reduce((a, f) => a + f.size, 0);

const GROUPS: { id: string; short: string; label: string; tone: InstrumentTone; langs: string[] }[] = [
  { id: "src", short: "src", label: "Source", tone: "cyn", langs: ["typescript", "python"] },
  { id: "mk", short: "mk", label: "Markup", tone: "org", langs: ["markdown"] },
  { id: "dat", short: "dat", label: "Data", tone: "pur", langs: ["json", "yaml", "toml", "csv"] },
  { id: "oth", short: "oth", label: "Other", tone: "ink-dim", langs: ["dotenv"] },
];

const FORMULA: LegendItem[] = GROUPS.map((g) => ({
  id: g.id,
  short: g.short,
  label: g.label,
  tone: g.tone,
  count: files.filter((f) => f.language && g.langs.includes(f.language)).length,
}));

const formulaText = FORMULA.map((f) => `${f.short} ${f.count}`).join(" · ");

const ASTRO = [
  { id: "mass", label: "Rest mass", value: formatBytes(FILE_TREE.size) },
  { id: "exc", label: "Excitation", value: formatBytes(excitation), emitting: true },
  { id: "eff", label: "Effective / rest", value: `× ${formatFixed((FILE_TREE.size + excitation) / FILE_TREE.size, 4)}` },
  { id: "hor", label: "Horizon radius", value: "38 units" },
  { id: "land", label: "Landing radius", value: "52 units" },
  { id: "lum", label: "Luminosity", value: "1.4K bytes/day", emitting: true },
  { id: "grav", label: "Surface gravity", value: "12 units/sec²" },
];

const status = files.find((f) => f.path === "space_ui/lib/status.ts");

/* ----------------------------------------------------------------------------- overlay modes */

type Overlay = "off" | "curvature" | "energy" | "light";

const OVERLAYS: Record<Exclude<Overlay, "off">, { label: string; description: string; stops: string[]; ends: [string, string] }> = {
  curvature: { label: "Curvature", description: "Signed curvature: cyan valleys to violet peaks.", stops: ["var(--cyn)", "var(--s3)", "var(--pur)"], ends: ["valley", "peak"] },
  energy: { label: "Energy", description: "Recent changes add energy; it cools over the day.", stops: ["var(--s2)", "var(--pur)", "var(--org)"], ends: ["cool", "hot"] },
  light: { label: "Light", description: "Emission versus reflected light. Only recent activity emits.", stops: ["#000000", "var(--cyn)", "var(--ink)"], ends: ["dark", "emitting"] },
};

const OVERLAY_ORDER: Overlay[] = ["off", "curvature", "energy", "light"];

/* ----------------------------------------------------------------------------- flight */

const SPEEDS = seededSeries(4242, 48, 0, 99);

function flightState(speed: number): { state: string; tone: InstrumentTone | "ink" } {
  if (speed < 4) return { state: "Holding position", tone: "ink" };
  if (speed < 28) return { state: "Drifting", tone: "ink" };
  if (speed < 72) return { state: "Cruising", tone: "ink" };
  return { state: "Boost engaged", tone: "cyn" };
}

export function InstrumentsDemo() {
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);
  const [overlay, setOverlay] = useState<Overlay>("curvature");
  const [reticle, setReticle] = useState<ReticleState>("idle");

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setTick((n) => (n + 1) % SPEEDS.length), 1000);
    return () => clearInterval(t);
  }, [live]);

  useEffect(() => {
    if (reticle !== "fired") return;
    const t = setTimeout(() => setReticle("locked"), 650);
    return () => clearTimeout(t);
  }, [reticle]);

  const speed = SPEEDS[tick];
  const flight = flightState(speed);
  const lum = 1.4 + ((tick * 7) % 10) / 100;

  function cycleOverlay(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key.toLowerCase() !== "g" || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    setOverlay((o) => OVERLAY_ORDER[(OVERLAY_ORDER.indexOf(o) + 1) % OVERLAY_ORDER.length]);
  }

  const astroLive = ASTRO.map((v) =>
    v.id === "lum" ? { ...v, value: `${formatFixed(lum, 2)}K bytes/day` } : v,
  ).concat({ id: "esc", label: "Escape / ship speed", value: `21 / ${formatNumber(speed)} units/sec`, emitting: false });

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Cell label="Variant · astrophysics · state emitting (live)">
          <InstrumentPanel
            domain="Astrophysics"
            law="a = −∇Φ"
            subject="xo-space"
            meta={`Project · ${files.length} files · ${folders} folders`}
            formula={formulaText}
            values={astroLive}
          />
        </Cell>
        <Cell label="Variant · chemistry · state ≥ partial">
          <InstrumentPanel
            domain="Chemistry"
            law="a = −∇U"
            subject={status?.name ?? "status.ts"}
            meta="Molecule · space_ui/lib"
            values={[
              { id: "m", label: "Mass", value: formatBytes(status?.size ?? null) },
              { id: "c", label: "Charge", value: "+1 · added" },
              { id: "t", label: "Temperature", value: "Hot · 2m", emitting: true },
              { id: "b", label: "Bonds", value: "3 imports" },
            ]}
            subhead="This body / same matter"
            subValues={[
              { id: "a", label: "Atoms surveyed", value: `${formatNumber(files.length)} files`, partial: true },
              { id: "h", label: "Hot atoms", value: `${changed.length} changed`, emitting: true },
              { id: "s", label: "Survey", value: "68% read", partial: true },
            ]}
          />
        </Cell>
        <Cell label="Variant · element legend">
          <div className="space-y-5 rounded-[14px] border border-hair bg-[#0b0b0e]/95 p-4">
            <div>
              <Caption className="mb-2">Formula string</Caption>
              <ElementLegend variant="formula" items={FORMULA} label="Element formula for xo-space" />
            </div>
            <div>
              <Caption className="mb-2">Two-dot legend</Caption>
              <ElementLegend
                label="Map channels"
                items={[
                  { id: "exc", label: "Excitation / light", tone: "cyn" },
                  { id: "mass", label: "Mass / curvature", tone: "pur" },
                ]}
              />
            </div>
            <div>
              <Caption className="mb-2">Shape legend</Caption>
              <ElementLegend
                variant="shapes"
                label="Shapes"
                items={[
                  { id: "app", label: "App", tone: "cyn", shape: "disc" },
                  { id: "one", label: "One-pager", tone: "org", shape: "ring" },
                  { id: "docs", label: "Docs", tone: "pur", shape: "stack" },
                  { id: "slides", label: "Slides", tone: "blu", shape: "slab" },
                  { id: "unk", label: "Unknown", tone: "ink-dim", shape: "diamond" },
                ]}
              />
            </div>
            <div>
              <Caption className="mb-2">Type legend</Caption>
              <ElementLegend
                label="Types"
                items={[
                  { id: "out", label: "Output", tone: "grn" },
                  { id: "inbox", label: "Inbox", tone: "blu" },
                  { id: "ses", label: "Sessions", tone: "ink-dim", dim: true },
                  { id: "sys", label: "System", tone: "ink-faint", dim: true },
                ]}
              />
            </div>
            <div>
              <Caption className="mb-2">State · hotter atoms trend toward white</Caption>
              <ElementLegend
                label="Heat"
                items={[
                  { id: "h0", label: "Cold", tone: "cyn", heat: 0 },
                  { id: "h1", label: "Warm", tone: "cyn", heat: 0.4 },
                  { id: "h2", label: "Hot", tone: "cyn", heat: 0.75 },
                  { id: "h3", label: "Hottest", tone: "cyn", heat: 1 },
                ]}
              />
            </div>
          </div>
        </Cell>
      </div>

      <div className="space-y-3">
        <Caption>Variant · flight · interaction live update</Caption>
        <div className="flex flex-col items-center gap-5 rounded-[14px] border border-hair bg-[#07080a] px-4 py-6 sm:flex-row sm:justify-between">
          <div className="dots flex min-h-[132px] w-full flex-1 items-center justify-center rounded-[12px] border border-hair-soft">
            <FlightReadout state={flight.state} speed={speed} max={99} tone={flight.tone} />
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-2 sm:flex-col">
            <Button size="sm" variant="secondary" leadingIcon={live ? <Pause /> : <Play />} onClick={() => setLive((l) => !l)}>
              {live ? "Pause readings" : "Resume readings"}
            </Button>
            <span className="text-center font-mono text-[10.5px] text-ink-faint">Mock readings · 1 per second</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ["Awaiting pilot", 0, "ink-faint"],
              ["Landing", 12, "org"],
              ["Captured by xo-space", 4, "cyn"],
              ["Skimming galileo", 64, "ink"],
              ["Flight paused", 0, "ink-faint"],
            ] as [string, number, InstrumentTone | "ink"][]
          ).map(([state, v, tone]) => (
            <div key={state} className="flex min-w-0 justify-center rounded-[12px] border border-hair-soft bg-black/40 px-2 py-4">
              <FlightReadout state={state} speed={v} max={99} tone={tone} className="min-w-0 max-w-full [&>span:first-child]:max-w-full [&>span:first-child]:truncate" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label="Variant · overlay legend (pick a layer, or press G while the switch has focus)">
          <div role="group" aria-label="Overlay controls" aria-keyshortcuts="G" onKeyDown={cycleOverlay} className="space-y-4 rounded-[14px] border border-hair bg-[#07080a] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Segmented<Overlay>
                size="sm"
                aria-label="Space overlay"
                value={overlay}
                onChange={setOverlay}
                options={OVERLAY_ORDER.map((o) => ({ value: o, label: o === "off" ? "Off" : OVERLAYS[o].label }))}
              />
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-faint">
                <Kbd size="xs">G</Kbd> cycles
              </span>
            </div>
            <div className="dots flex min-h-[132px] items-center justify-center rounded-[12px] border border-hair-soft p-3">
              {overlay === "off" ? (
                <p role="status" className="font-mono text-[11px] text-ink-faint">
                  Overlay off. The legend is hidden.
                </p>
              ) : (
                <OverlayLegendCard {...OVERLAYS[overlay]} />
              )}
            </div>
          </div>
        </Cell>
        <Cell label="Overlay legend · surface layer (temperature, bonds)">
          <div className="flex flex-wrap gap-3">
            <OverlayLegendCard label="Temperature" description="Cold blue to hot coral: activity agitates a molecule." stops={["var(--blu)", "var(--pur)", "var(--red)"]} ends={["cold", "hot"]} />
            <OverlayLegendCard label="Bonds" description="Shared imports draw a bond between atoms." stops={["var(--s3)", "var(--blu)", "var(--grn)"]} ends={["none", "strong"]} />
          </div>
        </Cell>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label="Variant · labels (body label, atom chip)">
          <div className="dots relative flex min-h-[170px] flex-col items-center justify-center gap-5 overflow-hidden rounded-[14px] border border-hair bg-[#07080a] p-4">
            <div className="flex flex-col items-center gap-2">
              <span aria-hidden="true" className="size-12 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--cyn),color-mix(in_srgb,var(--blu)_40%,black)_70%)] shadow-[0_0_30px_color-mix(in_srgb,var(--cyn)_35%,transparent)]" />
              <WorldLabel variant="body" name="xo-space" meta={`${formatBytes(FILE_TREE.size)} · emitting`} emitting />
            </div>
            <div className="flex max-w-full flex-wrap justify-center gap-2">
              <WorldLabel variant="chip" name="usage-sept.csv" />
              <WorldLabel variant="chip" name="space_ui/components/session-list.tsx" />
            </div>
          </div>
        </Cell>
        <Cell label="Variant · reticle (idle, locked, fired)">
          <div className="space-y-3 rounded-[14px] border border-hair bg-[#07080a] p-4">
            <div className="grid grid-cols-3 gap-2">
              {(["idle", "locked", "fired"] as ReticleState[]).map((s) => (
                <div key={s} className="flex min-w-0 flex-col items-center gap-2 rounded-[10px] border border-hair-soft bg-black/40 px-2 py-4">
                  <TargetingReticle state={s} label="reports/usage-sept.csv" className="w-full" />
                  <Caption>{s}</Caption>
                </div>
              ))}
            </div>
            <div className="dots flex min-h-[96px] items-center justify-center rounded-[10px] border border-hair-soft">
              <TargetingReticle state={reticle} label={reticle === "idle" ? undefined : "space_ui/lib/status.ts"} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" leadingIcon={<Crosshair />} onClick={() => setReticle((r) => (r === "idle" ? "locked" : "idle"))}>
                {reticle === "idle" ? "Lock target" : "Release target"}
              </Button>
              <Button size="sm" variant="secondary" leadingIcon={<Zap />} onClick={() => setReticle("fired")} disabled={reticle === "idle"}>
                Fire probe
              </Button>
            </div>
          </div>
        </Cell>
      </div>
    </div>
  );
}
