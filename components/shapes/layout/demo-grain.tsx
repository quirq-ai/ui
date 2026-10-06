"use client";

// Demo: grain, glow and reveal motion. Client component: opacity slider, vignette toggle,
// scroll reveal inside a contained scroller, replay and simulated reduced motion.
import { useId, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button, Switch } from "@/components/ui";
import { PROJECTS } from "@/lib/fixtures";
import { formatNumber, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { Kicker } from "./eyebrow";
import { Reveal } from "./reveal";
import { BeamThumb, DotGrid, Grain, SpectralGlow, Starfield, Vignette } from "./texture";
import { useReducedMotion } from "./use-motion";

const CARDS = PROJECTS.slice(0, 9);

export default function GrainDemo() {
  const sliderId = useId();
  const [grain, setGrain] = useState(4);
  const [vignette, setVignette] = useState(true);
  const [simReduce, setSimReduce] = useState(false);
  const [run, setRun] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const deviceReduce = useReducedMotion();
  const reduce = simReduce || deviceReduce;

  function replay() {
    scroller.current?.scrollTo({ top: 0 });
    setRun((r) => r + 1);
  }

  return (
    <div className="flex flex-col gap-10">
      <SpecimenGrid cols={2}>
        {/* site grain */}
        <Specimen label="Site grain · fixed noise at 4%" note="Fractal noise over the whole page. Raise the slider to see the texture; the site ships 4%.">
          <div className="flex flex-col gap-3">
            <div className="relative h-[180px] overflow-hidden rounded-[14px] border border-hair-soft bg-[#0c0c0e]">
              <div className="absolute inset-0" style={{ background: "radial-gradient(80% 90% at 30% 20%, #1d1d22, #050506 70%)" }} />
              <Grain opacity={grain / 100} />
              <div className="relative p-5">
                <Kicker>Observe</Kicker>
                <p className="m-0 mt-4 max-w-[22ch] text-[20px] font-semibold leading-tight tracking-[-0.02em]">Analog texture, never a pattern you notice.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor={sliderId} className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                Grain
              </label>
              <input
                id={sliderId}
                type="range"
                min={0}
                max={40}
                step={1}
                value={grain}
                onChange={(e) => setGrain(Number(e.target.value))}
                aria-valuetext={`${grain}%`}
                className="h-1 min-w-0 flex-1 cursor-pointer accent-[var(--blu)]"
              />
              <output htmlFor={sliderId} className="w-10 text-right font-mono text-[12px] tabular-nums text-ink-dim">
                {grain}%
              </output>
            </div>
          </div>
        </Specimen>

        {/* card noise */}
        <Specimen label="Card noise · .35 overlay" note="Editorial thumbs: a diagonal light beam with noise blended on top. Left without, right with.">
          <div className="grid grid-cols-2 gap-3">
            {[false, true].map((noise) => (
              <article key={String(noise)} className="flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]">
                <BeamThumb hue={205} noise={noise} />
                <div className="flex flex-col gap-1.5 p-3.5">
                  <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-faint">
                    <span className="text-ink-dim">Evidence</span>
                    <span>{noise ? "Noise" : "No noise"}</span>
                  </div>
                  <h4 className="m-0 text-[14px] font-semibold leading-snug tracking-[-0.01em]">Weighted checks beat raw line counts</h4>
                </div>
              </article>
            ))}
          </div>
        </Specimen>

        {/* spectral glow */}
        <Specimen label="Blurred spectral glow" note="Behind statements only. Never behind data.">
          <div className="relative h-[200px] overflow-hidden rounded-[14px] border border-hair-soft bg-bg">
            <SpectralGlow className="left-1/2 top-[22%] h-[56%] w-[130%] -translate-x-1/2" />
            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
              <p className="m-0 text-[clamp(22px,3vw,30px)] font-semibold tracking-[-0.03em]">What is a quirq?</p>
              <p className="m-0 mt-1.5 text-[13px] text-white/70">The unit of verified, delivered work.</p>
            </div>
          </div>
        </Specimen>

        {/* dot grid */}
        <Specimen label="Dot grid · visualizer ambient" note="14px grid of 0.7px dots at .38, center-masked, with faint oversized rings.">
          <div className="relative h-[200px] overflow-hidden rounded-[14px] border border-hair-soft">
            <DotGrid ground rings />
            <div className="absolute inset-x-4 bottom-3.5 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.17em] text-ink-faint">
              <span>Texture only</span>
              <span className="tabular-nums">{pluralize(PROJECTS.length, "project")}</span>
            </div>
          </div>
        </Specimen>
      </SpecimenGrid>

      {/* HUD vignette */}
      <Specimen label="HUD vignette" note="Top and bottom shade over the space-drift scene so flight chrome stays readable.">
        <div className="flex flex-col gap-3">
          <div className="relative h-[240px] overflow-hidden rounded-[14px] border border-hair-soft">
            <Starfield idPrefix="grain-stars" />
            {vignette ? <Vignette /> : null}
            <div className="absolute inset-x-4 top-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#c2c8e4]">
              <span>research-notes</span>
              <span className="tabular-nums">{formatNumber(PROJECTS.find((p) => p.id === "research-notes")?.files)} files</span>
            </div>
            <div className="absolute inset-x-4 bottom-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#c2c8e4]">
              <span>Layer · space</span>
              <span>M atlas · L land</span>
            </div>
          </div>
          <Switch size="sm" label="Vignette" labelPosition="end" checked={vignette} onCheckedChange={setVignette} />
        </div>
      </Specimen>

      <DemoRule />

      {/* reveal */}
      <Specimen
        label="Staggered reveal · on scroll"
        note="Scroll inside the box: cards rise 24px over 1s, staggered (i % 3) × .07s. Reduced motion keeps them visible with no transition."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button size="sm" variant="secondary" leadingIcon={<RotateCcw />} onClick={replay} disabled={reduce}>
              Replay
            </Button>
            <Switch size="sm" label="Simulate reduced motion" labelPosition="end" checked={simReduce} onCheckedChange={setSimReduce} />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              Device: {deviceReduce ? "reduce" : "no preference"}
            </span>
          </div>
          <div
            ref={scroller}
            tabIndex={0}
            role="region"
            aria-label="Scroll to reveal cards"
            className="scroll-thin h-[300px] overflow-y-auto overscroll-contain rounded-[14px] border border-hair-soft bg-bg p-4"
          >
            <p className="m-0 mb-4 text-[12.5px] text-ink-faint">Cards below the fold reveal as they enter this box.</p>
            <div key={run} className="grid gap-3 sm:grid-cols-3">
              {CARDS.map((p, i) => (
                <Reveal
                  key={p.id}
                  rootRef={scroller}
                  delay={(i % 3) * 0.07}
                  instant={reduce}
                  className="rounded-[12px] border border-hair-soft bg-[#0f0f11] p-4"
                >
                  <p className="m-0 font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-faint">
                    {p.category} · <span className="normal-case">--d {((i % 3) * 0.07).toFixed(2)}s</span>
                  </p>
                  <p className="m-0 mt-2 text-[14px] font-semibold">{p.displayName}</p>
                  <p className="m-0 mt-1 line-clamp-2 text-[12px] leading-snug text-ink-dim">{p.description}</p>
                </Reveal>
              ))}
            </div>
            <div className="h-6" aria-hidden="true" />
          </div>
        </div>
      </Specimen>

      <SpecimenGrid cols={3}>
        <Specimen label="State · hidden until on" note="Before it is observed: opacity 0, translateY 24px. Shown here as an outline.">
          <div className="relative h-[108px] rounded-[12px] border border-dashed border-hair-strong">
            <div className="absolute inset-x-4 top-4 translate-y-6 rounded-[10px] border border-hair-soft bg-[#0f0f11] p-3 opacity-[0.12]" aria-hidden="true">
              <p className="m-0 text-[13px] font-semibold">xo-space</p>
            </div>
            <code className="absolute bottom-2 left-3 font-mono text-[10.5px] text-ink-faint">data-rv=&quot;hidden&quot;</code>
          </div>
        </Specimen>
        <Specimen label="State · revealed" note="data-rv=&quot;on&quot;: full opacity, no offset.">
          <div className="relative h-[108px] rounded-[12px] border border-hair-soft">
            <div className="absolute inset-x-4 top-4 rounded-[10px] border border-hair-soft bg-[#0f0f11] p-3">
              <p className="m-0 text-[13px] font-semibold">xo-space</p>
            </div>
            <code className="absolute bottom-2 left-3 font-mono text-[10.5px] text-ink-faint">style=&#123;&#123; &quot;--d&quot;: &quot;.12s&quot; &#125;&#125;</code>
          </div>
        </Specimen>
        <Specimen label="State · reduced motion visible" note="Always visible, transition none, pulse off.">
          <div className={cn("relative h-[108px] rounded-[12px] border border-hair-soft")}>
            <Reveal instant className="absolute inset-x-4 top-4 rounded-[10px] border border-hair-soft bg-[#0f0f11] p-3">
              <p className="m-0 text-[13px] font-semibold">xo-space</p>
            </Reveal>
            <code className="absolute bottom-2 left-3 font-mono text-[10.5px] text-ink-faint">prefers-reduced-motion: reduce</code>
          </div>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}
