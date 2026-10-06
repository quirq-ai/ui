// Progress: determinate or indeterminate completion. Linear bars come from the ui
// ProgressBar (determinate, indeterminate sweep, segmented). This file adds ProgressRing
// (32px arc), StageBar (per-stage colored segments with labels), StageDots (stage header
// strip) and Sliver (the 3px by 120px clone sweep). Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneBg, type Tone } from "@/components/ui/tones";

const toneVarOf = (tone: Tone) => (tone === "neutral" ? "var(--ink-faint)" : `var(--${tone})`);

/* ----------------------------------------------------------------------------- ProgressRing */

export type ProgressRingProps = {
  /** null renders an empty track and reads "Unavailable". */
  value: number | null;
  max?: number;
  size?: number;
  stroke?: number;
  tone?: Tone | "ink";
  /** Accessible name, such as "Atoms charted". */
  label: string;
  /** Center content; defaults to the percent. Pass null for none. */
  center?: ReactNode | null;
  valueText?: string;
  className?: string;
};

/** Arc ring (expedition counter): track plus a stroked arc from 12 o'clock. */
export function ProgressRing({ value, max = 100, size = 32, stroke = 3, tone = "blu", label, center, valueText, className }: ProgressRingProps) {
  const unavailable = value === null;
  const pct = unavailable || max <= 0 ? 0 : Math.min(Math.max(value / max, 0), 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = tone === "ink" ? "var(--ink)" : toneVarOf(tone);
  const text = unavailable ? "Unavailable" : valueText ?? `${Math.round(pct * 100)}%`;
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={unavailable ? undefined : 0}
      aria-valuemax={unavailable ? undefined : max}
      aria-valuenow={unavailable ? undefined : value}
      aria-valuetext={text}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
        {unavailable ? null : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className="transition-[stroke-dashoffset,stroke] duration-500 ease-quirq"
          />
        )}
      </svg>
      {center === null ? null : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-mono text-[10px] tabular-nums text-ink" style={{ fontSize: Math.max(8, size * 0.24) }}>
          {center ?? (unavailable ? "?" : `${Math.round(pct * 100)}`)}
        </span>
      )}
    </span>
  );
}

/* ----------------------------------------------------------------------------- StageBar */

export type Stage = { id: string; label: string; state: "done" | "active" | "failed" | "todo"; tone?: Tone };

const STAGE_FILL: Record<Stage["state"], string> = {
  done: "bg-grn",
  active: "bg-blu",
  failed: "bg-red",
  todo: "bg-white/[0.09]",
};

/** Segmented stage bar: one segment per stage, colored by state (or its own tone), labels below. */
export function StageBar({ stages, label, valueText, showLabels = true, className }: { stages: Stage[]; label: string; valueText?: string; showLabels?: boolean; className?: string }) {
  const done = stages.filter((s) => s.state === "done").length;
  const text = valueText ?? `${String(done).padStart(2, "0")} / ${String(stages.length).padStart(2, "0")}`;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
        <span className="min-w-0 truncate text-ink-dim">{label}</span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink">{text}</span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={stages.length} aria-valuenow={done} aria-valuetext={text} className="flex h-1.5 gap-[3px]">
        {stages.map((s) => (
          <span
            key={s.id}
            className={cn(
              "h-full flex-1 rounded-[2px]",
              s.state !== "todo" && s.tone ? toneBg[s.tone] : STAGE_FILL[s.state],
              s.state === "active" && "animate-pulse",
            )}
          />
        ))}
      </div>
      {showLabels ? (
        <ol className="mt-1.5 flex gap-[3px]" aria-hidden="true">
          {stages.map((s) => (
            <li key={s.id} className={cn("min-w-0 flex-1 truncate text-[10.5px]", s.state === "failed" ? "text-red" : s.state === "todo" ? "text-ink-faint" : "text-ink-dim")}>
              {s.label}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- StageDots */

/** Stage header strip: done dots, a wider current pill, then empty dots. */
export function StageDots({ total, current, tone = "blu", label, className }: { total: number; /** 1-based. */ current: number; tone?: Tone; label: string; className?: string }) {
  return (
    <span role="img" aria-label={`${label}: stage ${current} of ${total}`} className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        return (
          <span
            key={n}
            className={cn(
              "h-1.5 rounded-full transition-[width] duration-300",
              n === current ? cn("w-3.5", toneBg[tone]) : n < current ? cn("w-1.5 opacity-60", toneBg[tone]) : "w-1.5 bg-white/[0.14]",
            )}
          />
        );
      })}
    </span>
  );
}

/* ----------------------------------------------------------------------------- Sliver */

/** Indeterminate sliver for unknown-length work (cloning): a short track with a sweeping bar. */
export function Sliver({ label, width = 120, tone = "ink", className }: { label: string; width?: number; tone?: Tone | "ink"; className?: string }) {
  const color = tone === "ink" ? "var(--ink)" : toneVarOf(tone);
  return (
    <span role="progressbar" aria-label={label} aria-busy="true" className={cn("relative inline-block h-[3px] shrink-0 overflow-hidden rounded-[2px] bg-white/[0.09]", className)} style={{ width }}>
      <style href="sf-sliver" precedence="low">
        {"@keyframes sf-sliver{from{transform:translateX(-100%)}to{transform:translateX(265%)}}"}
      </style>
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[38%] rounded-[2px]" style={{ background: color, animation: "sf-sliver 1.4s cubic-bezier(0.65,0,0.35,1) infinite" }} />
    </span>
  );
}
