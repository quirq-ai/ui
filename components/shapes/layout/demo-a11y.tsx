"use client";

// Demo: focus ring, skip link and reduced motion. Client component: a focus readout for Tab
// and Shift+Tab, a hidden-title toggle and a simulated reduced-motion switch.
import { useState, type FocusEvent } from "react";
import { Button, KeyCombo, Kbd, Spinner, StatusDot, Switch } from "@/components/ui";
import { GRAPH, NOW_ISO, SESSIONS } from "@/lib/fixtures";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { FocusRing, SkipLink, VisuallyHidden } from "./a11y";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { RelativeTime } from "./eyebrow";
import { Reveal } from "./reveal";
import { DotGrid } from "./texture";
import { useReducedMotion } from "./use-motion";

const ROWS = SESSIONS.filter((s) => s.open).slice(0, 3);

function nameOf(el: Element | null): string {
  if (!el || !(el instanceof HTMLElement)) return "Nothing";
  const label = el.getAttribute("aria-label") || el.dataset.focusName || el.textContent || el.tagName.toLowerCase();
  const role = el.tagName === "A" ? "link" : el.tagName === "BUTTON" ? "button" : el.tagName === "TR" ? "row" : el.getAttribute("role") ?? el.tagName.toLowerCase();
  return `${label.replace(/\s+/g, " ").trim().slice(0, 48)} (${role})`;
}

export default function A11yDemo() {
  const [focused, setFocused] = useState("Nothing yet. Press Tab.");
  const [showTitle, setShowTitle] = useState(false);
  const [simReduce, setSimReduce] = useState(false);
  const device = useReducedMotion();
  const reduce = simReduce || device;
  const [run, setRun] = useState(0);
  const [opened, setOpened] = useState<string | null>(null);

  const onFocusCapture = (e: FocusEvent<HTMLDivElement>) => setFocused(nameOf(e.target));

  return (
    <div className="flex flex-col gap-10">
      <div onFocusCapture={onFocusCapture} className="flex flex-col gap-8">
        {/* focus readout */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-hair-soft bg-s1 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-dim">
            <KeyCombo keys={["tab"]}>next</KeyCombo>
            <KeyCombo keys={["shift", "tab"]}>previous</KeyCombo>
          </div>
          <p className="m-0 min-w-0 font-mono text-[11.5px] text-ink-dim" aria-hidden="true">
            Focused: <span className="text-ink">{focused}</span>
          </p>
        </div>

        <SpecimenGrid cols={2}>
          {/* skip link */}
          <Specimen label="Skip to content · revealed on Tab" note="Tab into the frame: the first stop is the skip link. Enter jumps past the nav to the content.">
            <div className="relative overflow-hidden rounded-[14px] border border-hair-soft bg-bg">
              <SkipLink href="#a11y-content" position="absolute" />
              <nav aria-label="Sample navigation" className="flex flex-wrap items-center gap-1 border-b border-hair-soft px-4 py-3">
                <span className="mr-3 text-[13px] font-semibold">XO Space</span>
                {["Projects", "Sessions", "Inbox", "Setup"].map((l) => (
                  <button key={l} type="button" className="rounded-full! px-2.5 py-1 text-[12px] text-ink-dim hover:text-ink">
                    {l}
                  </button>
                ))}
              </nav>
              <div id="a11y-content" tabIndex={-1} data-focus-name="Sample content" className="scroll-mt-24 px-4 py-5">
                <p className="m-0 text-[15px] font-semibold">Sessions</p>
                <p className="m-0 mt-1 text-[12.5px] text-ink-dim">{ROWS.length} open sessions in this space.</p>
              </div>
            </div>
          </Specimen>
          <Specimen label="Skip link · focused (static)" note="White pill, black text, pinned top left above everything.">
            <div className="relative h-[150px] overflow-hidden rounded-[14px] border border-hair-soft bg-bg">
              <span className="absolute left-3 top-3 z-[2]">
                <FocusRing radius={999}>
                  <span className="inline-flex rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                    Skip to content
                  </span>
                </FocusRing>
              </span>
              <div className="mt-[58px] opacity-40" aria-hidden="true">
                <div className="flex items-center gap-3 border-y border-hair-soft px-4 py-3">
                  <span className="text-[13px] font-semibold">XO Space</span>
                  <span className="text-[12px] text-ink-dim">Projects · Sessions · Inbox · Setup</span>
                </div>
                <p className="m-0 px-4 pt-3 text-[13px] font-semibold">Sessions</p>
              </div>
            </div>
          </Specimen>
        </SpecimenGrid>

        <DemoRule />

        {/* focus specimens */}
        <SpecimenGrid cols={3}>
          <Specimen label="Focus on pill" note="Live pill, then the ring drawn statically: 2px solid ink, offset 3px.">
            <div className="flex flex-wrap items-center gap-5">
              <Button variant="primary">Get started</Button>
              <FocusRing radius={999}>
                <span className="inline-flex h-8 items-center rounded-full bg-ink px-[18px] text-[13px] font-semibold text-black">Get started</span>
              </FocusRing>
            </div>
          </Specimen>
          <Specimen label="Focus on chip" note="Mono filter chips take the same ring.">
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                aria-pressed="false"
                className="inline-flex h-9 items-center rounded-full! border border-hair bg-white/[0.04] px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim hover:text-ink"
              >
                Evidence <span className="ml-[7px] opacity-75">4</span>
              </button>
              <FocusRing radius={999}>
                <span className="inline-flex h-9 items-center rounded-full border border-hair bg-white/[0.04] px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                  Evidence <span className="ml-[7px] opacity-75">4</span>
                </span>
              </FocusRing>
            </div>
          </Specimen>
          <Specimen label="Focus on table row" note="Rows that open something are focusable; the ring wraps the row.">
            <div className="overflow-x-auto rounded-[12px] border border-hair-soft">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <caption className="sr-only">Open sessions</caption>
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    <th scope="col" className="px-3 py-2 font-normal">
                      Session
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-normal">
                      Tokens
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((s, i) => (
                    <tr
                      key={s.id}
                      tabIndex={0}
                      data-focus-name={s.title}
                      aria-current={opened === s.id ? "true" : undefined}
                      onClick={() => setOpened(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpened(s.id);
                        }
                      }}
                      className={cn(
                        "cursor-pointer border-t border-hair-soft hover:bg-white/[0.03] focus-visible:-outline-offset-2 aria-[current=true]:bg-white/[0.05]",
                        i === 1 && "outline-2 -outline-offset-2 outline-solid outline-ink",
                      )}
                    >
                      <td className="max-w-[160px] truncate px-3 py-2 text-ink">{s.title}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-ink-dim">{formatNumber(s.tokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="m-0 mt-2 text-[11.5px] text-ink-faint" aria-live="polite">
              {opened ? `Opened session ${opened}. ` : "Enter opens a row. "}Second row shows the ring statically.
            </p>
          </Specimen>
        </SpecimenGrid>
      </div>

      <DemoRule />

      <SpecimenGrid cols={2}>
        {/* hidden title */}
        <Specimen label="Visually hidden title · canvas page" note="Canvas pages carry a heading for screen readers only. Toggle to see where it sits.">
          <div className="flex flex-col gap-3">
            <section aria-labelledby="a11y-graph-title" className="relative h-[200px] overflow-hidden rounded-[14px] border border-hair-soft">
              {showTitle ? (
                <h3
                  id="a11y-graph-title"
                  className="absolute left-3 top-3 z-[2] m-0 rounded-[6px] border border-dashed border-blu/70 bg-black/70 px-2 py-1 text-[12.5px] font-medium text-ink"
                >
                  Knowledge graph of research-lab
                </h3>
              ) : (
                <VisuallyHidden as="h3" id="a11y-graph-title">
                  Knowledge graph of research-lab
                </VisuallyHidden>
              )}
              <DotGrid ground />
              <svg viewBox="0 0 960 720" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
                {GRAPH.edges.slice(0, 30).map((e, i) => {
                  const a = GRAPH.nodes.find((n) => n.id === e.source);
                  const b = GRAPH.nodes.find((n) => n.id === e.target);
                  if (!a || !b) return null;
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(218,226,236,.14)" strokeWidth="2" />;
                })}
                {GRAPH.nodes.map((n) => (
                  <circle key={n.id} cx={n.x} cy={n.y} r={n.size} fill={`var(--${n.color})`} opacity="0.85" />
                ))}
              </svg>
            </section>
            <Switch size="sm" label="Show hidden title" labelPosition="end" checked={showTitle} onCheckedChange={setShowTitle} />
          </div>
        </Specimen>

        {/* reduced motion */}
        <Specimen label="Reduced motion on" note="Content shows at once, the live pulse stops, spinners hold still. Simulate it, or set it on your device.">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-ink-dim">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status="warn" pulse={!reduce} />
                  Proving Grounds
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className={cn(reduce && "[&_.spin]:animate-none")}>
                    <Spinner size="sm" label={null} />
                  </span>
                  {reduce ? "Loading (static)" : "Loading"}
                </span>
                <span className="inline-flex items-center gap-2">
                  Updated <RelativeTime iso="2026-10-02T09:26:00Z" now={NOW_ISO} />
                </span>
              </div>
              <Reveal key={run} trigger="mount" instant={reduce} className="rounded-[10px] border border-hair-soft bg-black/40 px-3 py-2.5 text-[12.5px]">
                {reduce ? "Shown immediately: no rise, no fade." : "Rises 24px and fades in over 1s."}
              </Reveal>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Switch size="sm" label="Simulate reduced motion" labelPosition="end" checked={simReduce} onCheckedChange={setSimReduce} />
              <Button size="sm" variant="subtle" onClick={() => setRun((r) => r + 1)} disabled={reduce}>
                Replay
              </Button>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                Device: {device ? "reduce" : "no preference"} <Kbd size="xs">{device ? "on" : "off"}</Kbd>
              </span>
            </div>
          </div>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}
