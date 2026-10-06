"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { ACTIVITY, SESSIONS } from "@/lib/fixtures";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Caption, DemoSection } from "./kit";
import { FAMILY_LABEL, FAMILY_STROKE, LINE_ICON_GROUPS, LineIcon, iconFamily, type LineIconName } from "./icons";

type SizeOpt = "12" | "15" | "18" | "24";
type StrokeOpt = "family" | "1.6" | "1.75";
type ToneOpt = "ink" | "dim" | "grn" | "blu";

const TONE_CLASS: Record<ToneOpt, string> = { ink: "text-ink", dim: "text-ink-dim", grn: "text-grn", blu: "text-blu" };

/* the 24 grid behind the inspector glyph */
const GRID = Array.from({ length: 25 }, (_, i) => i);

export function IconSetDemo() {
  const [size, setSize] = useState<SizeOpt>("18");
  const [stroke, setStroke] = useState<StrokeOpt>("family");
  const [tone, setTone] = useState<ToneOpt>("ink");
  const [picked, setPicked] = useState<LineIconName>("live");

  const sw = (name: LineIconName) => (stroke === "family" ? FAMILY_STROKE[iconFamily(name)] : Number(stroke));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2.5">
          <Caption>Size</Caption>
          <Segmented<SizeOpt>
            aria-label="Icon size"
            size="sm"
            value={size}
            onChange={setSize}
            options={[
              { value: "12", label: "12" },
              { value: "15", label: "15" },
              { value: "18", label: "18" },
              { value: "24", label: "24" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <Caption>Stroke</Caption>
          <Segmented<StrokeOpt>
            aria-label="Stroke width"
            size="sm"
            value={stroke}
            onChange={setStroke}
            options={[
              { value: "family", label: "As shipped" },
              { value: "1.6", label: "1.6" },
              { value: "1.75", label: "1.75" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <Caption>Text color</Caption>
          <Segmented<ToneOpt>
            aria-label="Inherited text color"
            size="sm"
            value={tone}
            onChange={setTone}
            options={[
              { value: "ink", label: "Ink" },
              { value: "dim", label: "Dim" },
              { value: "grn", label: "Green" },
              { value: "blu", label: "Blue" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-7">
          {LINE_ICON_GROUPS.map((g) => (
            <DemoSection key={g.family} title={FAMILY_LABEL[g.family]} note={`${FAMILY_STROKE[g.family]} stroke · ${g.names.length} icons`}>
              <ul className={cn("grid grid-cols-3 gap-2 min-[460px]:grid-cols-4 sm:grid-cols-5 xl:grid-cols-6", TONE_CLASS[tone])}>
                {g.names.map((name) => (
                  <li key={name} className="min-w-0">
                    <button
                      type="button"
                      aria-pressed={picked === name}
                      onClick={() => setPicked(name)}
                      className={cn(
                        "flex h-[84px] w-full flex-col items-center justify-center gap-2.5 rounded-[10px]! border transition-colors",
                        picked === name ? "border-hair-strong bg-s3" : "border-hair-soft bg-[#0b0b0c] hover:border-hair hover:bg-s2",
                      )}
                    >
                      <LineIcon name={name} size={Number(size)} strokeWidth={sw(name)} />
                      <span className="max-w-full truncate px-1.5 font-mono text-[10px] text-ink-faint">{name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </DemoSection>
          ))}
        </div>

        <aside aria-label="Selected icon" className="h-fit rounded-[14px] border border-hair-soft bg-s1 p-4 lg:sticky lg:top-24">
          <Caption>Inspector · 24 grid</Caption>
          <div className={cn("relative mx-auto mt-3 aspect-square w-full max-w-[200px]", TONE_CLASS[tone])}>
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {GRID.map((i) => (
                <g key={i}>
                  <line x1={i} y1="0" x2={i} y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="0.04" />
                  <line x1="0" y1={i} x2="24" y2={i} stroke="rgba(255,255,255,0.1)" strokeWidth="0.04" />
                </g>
              ))}
              <rect x="2" y="2" width="20" height="20" fill="none" stroke="rgba(46,155,255,0.35)" strokeWidth="0.06" strokeDasharray="0.3 0.3" />
            </svg>
            <LineIcon name={picked} size={200} strokeWidth={sw(picked)} className="relative h-full w-full" title={`${picked} icon`} />
          </div>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px]">
            <dt className="text-ink-faint">Name</dt>
            <dd className="font-mono text-ink">{picked}</dd>
            <dt className="text-ink-faint">Family</dt>
            <dd className="text-ink-dim">{FAMILY_LABEL[iconFamily(picked)]}</dd>
            <dt className="text-ink-faint">Stroke</dt>
            <dd className="font-mono tabular-nums text-ink-dim">{sw(picked)}</dd>
            <dt className="text-ink-faint">Caps</dt>
            <dd className="text-ink-dim">Round, currentColor</dd>
          </dl>
          <p className="mt-3 rounded-[8px] border border-hair-soft bg-black px-2.5 py-2 font-mono text-[11px] text-ink-dim">
            {`<LineIcon name="${picked}" />`}
          </p>
        </aside>
      </div>

      <DemoSection title="In context" note="Icons stay aria-hidden; the control carries the name">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2.5">
            <Caption>Icon buttons with names</Caption>
            <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-hair-soft bg-s1 p-2.5">
              <IconButton aria-label="Reload this source" tip>
                <LineIcon name="reload" size={16} />
              </IconButton>
              <IconButton aria-label="Open this source in a tab of its own" tip>
                <LineIcon name="open-external" size={16} />
              </IconButton>
              <IconButton aria-label="Search" tip>
                <LineIcon name="search" size={16} />
              </IconButton>
              <IconButton aria-label="Land" tip>
                <LineIcon name="land" size={16} />
              </IconButton>
              <IconButton aria-label="Open atlas" tip>
                <LineIcon name="atlas" size={16} />
              </IconButton>
            </div>
          </div>
          <div className="space-y-2.5">
            <Caption>Nav rows · inherit text color</Caption>
            <ul className="rounded-[12px] border border-hair-soft bg-s1 p-1.5 text-[13px]">
              {(
                [
                  ["graph", "Graph", true],
                  ["timeline", "Timeline", false],
                  ["session", "Sessions", false],
                  ["task", "Tasks", false],
                ] as const
              ).map(([icon, label, on]) => (
                <li key={icon} className={cn("flex items-center gap-2.5 rounded-[8px] px-2.5 py-1.5", on ? "bg-s3 text-ink" : "text-ink-dim")}>
                  <LineIcon name={icon} size={16} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2.5">
            <Caption>Data type markers</Caption>
            <ul className="space-y-2 rounded-[12px] border border-hair-soft bg-s1 p-3 text-[12.5px]">
              <li className="flex items-center gap-2.5 text-grn">
                <LineIcon name="live" size={16} />
                <span className="text-ink">Live · {pluralize(SESSIONS.filter((x) => x.open).length, "open session")}</span>
              </li>
              <li className="flex items-center gap-2.5 text-blu">
                <LineIcon name="timeline" size={16} />
                <span className="text-ink">Timeline · {pluralize(ACTIVITY.length, "event")}</span>
              </li>
              <li className="flex items-center gap-2.5 text-cyn">
                <LineIcon name="lock" size={14} />
                <span className="text-ink-dim">Files stay on this device</span>
              </li>
            </ul>
          </div>
        </div>
      </DemoSection>
    </div>
  );
}
