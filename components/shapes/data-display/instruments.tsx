// Instrument readouts and legends from the file-map visualizers: InstrumentPanel (law strip,
// subject, formula, mono dl with emitting and partial values), ElementLegend (formula string,
// dot legend with heat, shape legend), FlightReadout (state, speed, bar), OverlayLegendCard
// (gradient scale), WorldLabel (body label or atom chip) and TargetingReticle (idle, locked,
// fired). Server-safe; motion is transitions only.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Palette tokens the instruments draw with. */
export type InstrumentTone = "red" | "org" | "yel" | "grn" | "cyn" | "blu" | "pur" | "ink-dim" | "ink-faint";

const cssVar = (t: InstrumentTone) => `var(--${t})`;

/* ----------------------------------------------------------------------------- InstrumentPanel */

export type InstrumentValue = {
  id: string;
  label: string;
  value: string;
  /** Recent activity: shown in cyan with a glowing pip, and read as "emitting". */
  emitting?: boolean;
  /** Survey still running: prefixed with ≥ and read as "at least". */
  partial?: boolean;
};

export type InstrumentPanelProps = {
  /** "Astrophysics", "Chemistry", "Constants". */
  domain: string;
  /** Governing law in the strip: "a = −∇Φ". */
  law?: string;
  subject: string;
  meta?: string;
  /** Element formula under the subject. */
  formula?: ReactNode;
  values: InstrumentValue[];
  subhead?: string;
  subValues?: InstrumentValue[];
  headingAs?: "h3" | "h4" | "h5";
  className?: string;
};

function ValueList({ values, label }: { values: InstrumentValue[]; label: string }) {
  return (
    <dl aria-label={label} className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-x-3 gap-y-[7px] text-[11.5px] leading-[1.5]">
      {values.map((v) => (
        <div key={v.id} className="contents">
          <dt className="text-ink-faint">{v.label}</dt>
          <dd data-emitting={v.emitting || undefined} className={cn("text-right font-mono text-[11px] tabular-nums [overflow-wrap:anywhere]", v.emitting ? "text-cyn" : "text-ink-dim")}>
            {/* color is not the only cue: emitting values carry a pip and a spoken word */}
            {v.emitting ? <span aria-hidden="true" className="mr-1.5 inline-block size-[5px] -translate-y-px rounded-full bg-cyn align-middle shadow-[0_0_6px_var(--cyn)]" /> : null}
            {v.partial ? (
              <>
                <span aria-hidden="true">≥ </span>
                <span className="sr-only">at least </span>
              </>
            ) : null}
            {v.value}
            {v.emitting ? <span className="sr-only">, emitting</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Dense physics readout for one body or atom. */
export function InstrumentPanel({ domain, law, subject, meta, formula, values, subhead, subValues, headingAs: H = "h3", className }: InstrumentPanelProps) {
  return (
    <aside aria-label={`${domain} instruments`} className={cn("min-w-0 rounded-[14px] border border-hair bg-[#0b0b0e]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)]", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint">{domain}</span>
        {law ? <span className="font-serif text-[13px] italic tracking-[0.06em] text-cyn">{law}</span> : null}
      </div>
      <H className="mt-3 truncate text-[19px] font-semibold tracking-[-0.02em] text-ink">{subject}</H>
      {meta ? <p className="mt-1 font-mono text-[10.5px] text-ink-faint">{meta}</p> : null}
      {formula ? <p className="mt-2.5 font-mono text-[10.5px] leading-[1.7] tracking-[0.02em] text-pur">{formula}</p> : null}
      <ValueList values={values} label={`${subject} readings`} />
      {subhead && subValues ? (
        <>
          <div className="mt-4 border-t border-hair-soft pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{subhead}</div>
          <ValueList values={subValues} label={subhead} />
        </>
      ) : null}
    </aside>
  );
}

/* ----------------------------------------------------------------------------- ElementLegend */

export type LegendShape = "disc" | "ring" | "stack" | "slab" | "diamond";

export type LegendItem = {
  id: string;
  /** Formula abbreviation: "src", "mk". */
  short?: string;
  label: string;
  count?: number;
  tone: InstrumentTone;
  shape?: LegendShape;
  /** 0 to 1: hotter items trend toward white. */
  heat?: number;
  /** Secondary entries read dimmer. */
  dim?: boolean;
};

export type ElementLegendProps = {
  items: LegendItem[];
  /** formula: "src 3 · mk 9"; dots: dot plus label; shapes: glyph plus label. */
  variant?: "formula" | "dots" | "shapes";
  label: string;
  className?: string;
};

function heatColor(tone: InstrumentTone, heat = 0): string {
  if (!heat) return cssVar(tone);
  const keep = Math.round(100 - Math.min(1, heat) * 72);
  return `color-mix(in srgb, ${cssVar(tone)} ${keep}%, #ffffff)`;
}

function ShapeGlyph({ shape, color }: { shape: LegendShape; color: string }) {
  const common = { stroke: color, strokeWidth: 1.4, fill: "none" } as const;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      {shape === "disc" ? <circle cx="7" cy="7" r="5" fill={color} /> : null}
      {shape === "ring" ? <circle cx="7" cy="7" r="4.6" {...common} /> : null}
      {shape === "stack" ? (
        <g {...common}>
          <rect x="2" y="2.5" width="10" height="3" rx="1" />
          <rect x="2" y="8.5" width="10" height="3" rx="1" />
        </g>
      ) : null}
      {shape === "slab" ? <rect x="1.5" y="4" width="11" height="6" rx="1.4" fill={color} /> : null}
      {shape === "diamond" ? <path d="M7 1.6 12.4 7 7 12.4 1.6 7Z" {...common} /> : null}
    </svg>
  );
}

/** Legend for map colors and shapes. */
export function ElementLegend({ items, variant = "dots", label, className }: ElementLegendProps) {
  if (variant === "formula") {
    return (
      <p aria-label={label} className={cn("font-mono text-[11.5px] leading-[1.8] text-ink-dim", className)}>
        {items.map((it, i) => (
          <span key={it.id} className="whitespace-nowrap">
            {i > 0 ? <span aria-hidden="true" className="text-ink-faint"> · </span> : null}
            <abbr title={it.label} className="no-underline" style={{ color: heatColor(it.tone, it.heat) }}>
              {it.short ?? it.label}
            </abbr>{" "}
            <span className="tabular-nums text-ink">{it.count ?? 0}</span>
          </span>
        ))}
      </p>
    );
  }
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-x-[18px] gap-y-2 text-[11.5px]", className)}>
      {items.map((it) => {
        const color = heatColor(it.tone, it.heat);
        return (
          <li key={it.id} className={cn("inline-flex items-center gap-1.5", it.dim ? "text-ink-faint" : "text-ink-dim")}>
            {variant === "shapes" && it.shape ? (
              <ShapeGlyph shape={it.shape} color={color} />
            ) : (
              <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full" style={{ background: color, opacity: it.dim ? 0.55 : 1 }} />
            )}
            {it.label}
            {it.count !== undefined ? <span className="font-mono tabular-nums text-ink-faint">{it.count}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- FlightReadout */

export type FlightReadoutProps = {
  /** "Cruising", "Boost engaged", "Captured by xo-space". Shown uppercase. */
  state: string;
  speed: number;
  max: number;
  unit?: string;
  /** Tints the state word: cyn for boost, org for warnings, ink-faint for paused. */
  tone?: InstrumentTone | "ink";
  className?: string;
};

/** Big mono speed with a 2px bar, centered. */
export function FlightReadout({ state, speed, max, unit = "u/s", tone = "ink", className }: FlightReadoutProps) {
  const v = Math.max(0, Math.round(speed));
  const pct = Math.min(100, (v / max) * 100);
  return (
    <div role="group" aria-label={`Flight: ${state}, ${v} ${unit}`} className={cn("inline-flex min-w-[112px] flex-col items-center text-center", className)}>
      <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.2em]" style={{ color: tone === "ink" ? "var(--ink-dim)" : cssVar(tone) }}>
        {state}
      </span>
      <span className="mt-1.5 flex items-baseline">
        <strong className="font-mono text-[38px] font-normal leading-none tracking-[-0.06em] tabular-nums text-ink">{String(v).padStart(3, "0")}</strong>
        <span className="ml-2 font-mono text-[10px] text-ink-faint">{unit}</span>
      </span>
      <span
        role="meter"
        aria-label="Speed"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={v}
        className="mt-2.5 block h-[2px] w-24 overflow-hidden bg-s4"
      >
        <span className="block h-full bg-cyn transition-[width] duration-300 ease-quirq" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------- OverlayLegendCard */

export type OverlayLegendCardProps = {
  /** "Curvature", "Temperature", "Light". */
  label: string;
  description: string;
  /** CSS colors from low to high. */
  stops: string[];
  /** Words under the bar ends. */
  ends?: [string, string];
  className?: string;
};

/** Gradient scale card for the active overlay. */
export function OverlayLegendCard({ label, description, stops, ends, className }: OverlayLegendCardProps) {
  const style: CSSProperties = { background: `linear-gradient(90deg, ${stops.join(", ")})` };
  return (
    <div role="group" aria-label={`${label} overlay legend`} className={cn("w-[235px] max-w-full rounded-[12px] border border-hair bg-[#0b0b0e]/95 p-[14px]", className)}>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-dim">{label}</span>
      <div aria-hidden="true" className="mb-2 mt-3 h-1 rounded-[6px]" style={style} />
      {ends ? (
        <div className="mb-2 flex justify-between font-mono text-[9.5px] text-ink-faint">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      ) : null}
      <p className="font-mono text-[10.5px] leading-[1.6] text-ink-faint">{description}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- WorldLabel */

export type WorldLabelProps = {
  /** body: unboxed sector label with a glow; chip: boxed, ellipsized atom name. */
  variant: "body" | "chip";
  name: string;
  /** "4.8 MB · emitting"; hidden on narrow screens. */
  meta?: string;
  emitting?: boolean;
  className?: string;
};

/** In-world label for a body or an atom. */
export function WorldLabel({ variant, name, meta, emitting, className }: WorldLabelProps) {
  if (variant === "chip") {
    return (
      <span
        title={name}
        className={cn(
          "inline-block max-w-[min(280px,65vw)] truncate rounded-[4px] border border-hair-strong bg-black/80 px-[7px] py-[5px] font-mono text-[11px] leading-none text-ink",
          className,
        )}
      >
        {name}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex min-w-0 max-w-full", className)}>
      <span className="inline-flex min-w-0 items-baseline gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.15em] text-ink [text-shadow:0_0_12px_rgba(0,0,0,0.9),0_0_2px_rgba(0,0,0,0.9)]">
        <span className="truncate">{name}</span>
        {meta ? <span className={cn("hidden shrink-0 normal-case tracking-[0.04em] sm:inline", emitting ? "text-cyn" : "text-ink-faint")}>{meta}</span> : null}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- TargetingReticle */

export type ReticleState = "idle" | "locked" | "fired";

export type TargetingReticleProps = {
  state: ReticleState;
  /** Target path, ellipsized under the reticle. */
  label?: string;
  className?: string;
};

const RETICLE_CLS: Record<ReticleState, string> = {
  idle: "opacity-45 text-ink-dim",
  locked: "opacity-100 text-cyn drop-shadow-[0_0_6px_color-mix(in_srgb,var(--cyn)_60%,transparent)]",
  fired: "opacity-100 scale-[1.35] text-org drop-shadow-[0_0_9px_color-mix(in_srgb,var(--org)_70%,transparent)]",
};

/** Center crosshair; locks onto a target and flashes when fired. */
export function TargetingReticle({ state, label, className }: TargetingReticleProps) {
  return (
    <span role="img" aria-label={`Reticle ${state}${label ? `: ${label}` : ""}`} className={cn("inline-flex min-w-0 max-w-full flex-col items-center gap-2", className)}>
      <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true" className={cn("transition-[opacity,transform,filter,color] duration-200 ease-quirq", RETICLE_CLS[state])}>
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      </svg>
      {label ? (
        <span className={cn("block w-full max-w-[220px] truncate text-center font-mono text-[9.5px] tracking-[0.04em]", state === "idle" ? "text-ink-faint" : "text-cyn")}>{label}</span>
      ) : null}
    </span>
  );
}
