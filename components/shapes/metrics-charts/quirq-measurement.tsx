// quirq measurement readouts. Server-safe. MintRuleCard (B before the run, Q = V · B after
// verification), FormulaCallout (quirq and Machine Speed skins), MeterCard and BridgeGrid
// (the input meter against the output meter), MintFlow and MintChip (budget, verification,
// minted) and QuirqReadout (Work delivered with QER, QV, IR and a separate cost).
// Rules: quirq is lowercase; a missing measurement reads Unavailable, never 0; every number
// states its method, unit, window and provenance; cost and tokens are a separate meter.
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { UNAVAILABLE } from "@/lib/format";
import type { Provenance } from "@/lib/fixtures";
import { Badge } from "@/components/ui/badge";
import { StateChip } from "@/components/ui/status";
import { ProvenanceTag, formatValue, keepQuirq } from "./chart-kit";

/* ============================================================================ MintRuleCard */

export type MintRuleCardProps = {
  /** optional worked example under the rule, such as uow_118 */
  example?: { unitId: string; budget: number; completion: number; minted: number; provenance: Provenance };
  className?: string;
};

/** The mint rule: the owner sets the potential, verification releases the minted amount. */
export function MintRuleCard({ example, className }: MintRuleCardProps) {
  return (
    <div className={cn("glass p-[clamp(20px,4vw,34px)]", className)}>
      <dl className="grid gap-8 sm:grid-cols-2 sm:gap-8">
        <div className="sm:border-r sm:border-hair sm:pr-8">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">Potential, before the run</dt>
          <dd>
            <p className="mt-4 font-mono text-[clamp(26px,3.6vw,38px)] leading-none tracking-[-0.02em] text-ink">B</p>
            <p className="mt-4 text-[13.5px] leading-[1.7] text-ink-dim">
              The outcome budget, set by the human owner before the work runs. Nothing is minted by declaring it.
            </p>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">Minted, after verification</dt>
          <dd>
            <p className="mt-4 font-mono text-[clamp(26px,3.6vw,38px)] leading-none tracking-[-0.02em] text-ink">
              <span className="spec-text font-semibold">Q</span>
              <span className="mx-3 text-ink-faint">=</span>V<span className="mx-3 text-ink-faint">·</span>B
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.7] text-ink-dim">
              Released by verification: the space captures the world before and after the run, then scores completion V against a weighted
              definition of done.
            </p>
          </dd>
        </div>
      </dl>
      {example ? (
        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border border-hair-soft bg-black/30 px-4 py-3">
          <span className="font-mono text-[11px] text-ink-faint">{example.unitId}</span>
          <span className="font-mono text-[13px] text-ink-dim">
            B {formatValue(example.budget)} <span className="text-ink-faint">→</span> Q = {formatValue(example.completion, "fixed2")} ·{" "}
            {formatValue(example.budget)} ={" "}
          </span>
          <span className="font-mono text-[13px] font-medium text-ink">{formatValue(example.minted, "quirqs1")}</span>
          <ProvenanceTag provenance={example.provenance} className="ml-auto" />
        </div>
      ) : null}
      <p className="mt-7 border-t border-hair-soft pt-5 font-mono text-[10px] uppercase leading-[1.8] tracking-[0.16em] text-ink-dim">
        V: verified completion, 0 to 1 · B: the owner&rsquo;s budget of value · Q: what the work actually minted
      </p>
    </div>
  );
}

/* ============================================================================ FormulaCallout */

export type FormulaCalloutProps = {
  /** quirq: blue rule on the black ground. machine-speed: the .eq block on the olive ground. */
  variant?: "quirq" | "machine-speed";
  kicker?: ReactNode;
  /** one equation per line; wrap computed values in <FormulaValue> */
  lines: ReactNode[];
  note?: ReactNode;
  id?: string;
  className?: string;
};

/** A live value inside a formula: blue mono, because blue means computed. */
export function FormulaValue({ children, variant = "quirq" }: { children: ReactNode; variant?: "quirq" | "machine-speed" }) {
  return <b className={cn("font-mono font-normal tabular-nums", variant === "quirq" ? "text-blu" : "text-[#57b6ff]")}>{children}</b>;
}

/** Equation callout with a 3px blue rule. Blue marks the computed, interactive values. */
export function FormulaCallout({ variant = "quirq", kicker, lines, note, id, className }: FormulaCalloutProps) {
  const ms = variant === "machine-speed";
  return (
    <div
      id={id}
      className={cn(
        "min-w-0 scroll-mt-24 rounded-[16px] border p-5",
        ms ? "border-[rgba(233,234,230,0.12)] bg-[#10120f] text-[#e9eae6]" : "border-hair-soft bg-[#0f0f11] text-ink",
        className,
      )}
    >
      {kicker ? (
        <p className={cn("mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em]", ms ? "text-[#a8aba3]" : "text-ink-faint")}>{keepQuirq(kicker)}</p>
      ) : null}
      <div
        className={cn(
          "overflow-x-auto rounded-r-[8px] border-l-[3px] px-4 py-3.5 text-[14px] leading-[1.8]",
          ms ? "border-[#57b6ff] bg-white/[0.03]" : "border-blu bg-white/[0.03]",
        )}
      >
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      {note ? <p className={cn("mt-3 text-[12.5px] leading-[1.65]", ms ? "text-[#a8aba3]" : "text-ink-dim")}>{note}</p> : null}
    </div>
  );
}

/* ============================================================================ Meters */

export type MeterCardProps = {
  kicker: string;
  /** "Token" or "quirq" */
  name: string;
  lead: ReactNode;
  note?: ReactNode;
  /** the input meter stays grey; the output meter wears the spectrum */
  accent: "dim" | "spectrum";
  /** formula or unit line under the note */
  formula?: ReactNode;
  /** stagger index for the reveal */
  index?: number;
  className?: string;
};

/** One of the two meters. Same component, color carries the argument. */
export function MeterCard({ kicker, name, lead, note, accent, formula, index = 0, className }: MeterCardProps) {
  return (
    <div
      className={cn("rise flex min-w-0 flex-col rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(20px,3vw,28px)]", className)}
      style={{ animationDelay: `${index * 0.09}s` } as CSSProperties}
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p>
      <p
        className={cn(
          "mt-3 w-fit font-round text-[clamp(30px,4vw,40px)] font-semibold leading-none tracking-[-0.01em]",
          accent === "spectrum" ? "spec-text" : "text-ink-dim",
        )}
      >
        {name}
      </p>
      <p className="mt-4 text-[15px] font-medium leading-snug text-ink">{lead}</p>
      {note ? <p className="mt-2 text-[13px] leading-[1.65] text-ink-dim">{note}</p> : null}
      {formula ? (
        <p className="mt-auto pt-5">
          <span className="inline-block rounded-[8px] border border-hair-soft bg-black/30 px-2.5 py-1.5 font-mono text-[12px] text-ink-dim">{formula}</span>
        </p>
      ) : null}
    </div>
  );
}

export type Bridge = { icon?: ReactNode; title: ReactNode; ratio: ReactNode; description: ReactNode };

/** Three cards that divide the two meters: quirqs per dollar, per kWh, per tonne CO2. */
export function BridgeGrid({ items, startIndex = 2, className }: { items: Bridge[]; startIndex?: number; className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {items.map((b, i) => (
        <li
          key={i}
          className="rise flex min-w-0 flex-col gap-2 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4"
          style={{ animationDelay: `${(startIndex + i) * 0.09}s` } as CSSProperties}
        >
          <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            {b.icon ? (
              <span aria-hidden="true" className="inline-flex size-7 items-center justify-center rounded-[8px] border border-hair bg-s2 text-ink-dim [&_svg]:size-3.5">
                {b.icon}
              </span>
            ) : null}
            {b.title}
          </span>
          <span className="font-mono text-[12px] text-blu">{b.ratio}</span>
          <span className="text-[12.5px] leading-snug text-ink-dim">{b.description}</span>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================================ MintFlow */

export type MintStage = "potential" | "minted" | "unavailable";

export type MintFlowProps = {
  unitId: string;
  stage: MintStage;
  budget: number;
  /** verified completion 0 to 1; null before verification or when unavailable */
  completion: number | null;
  minted: number | null;
  /** "3 of 4 weighted checks passed" */
  evidence?: ReactNode;
  method: string;
  methodHref?: string;
  /** USD from the usage meter; recorded separately */
  cost: number | null;
  provenance: Provenance;
  className?: string;
};

function FlowNode({ kicker, value, sub, tone }: { kicker: string; value: ReactNode; sub: ReactNode; tone: "budget" | "verify" | "minted" | "off" }) {
  return (
    <div
      className={cn(
        "relative min-w-0 flex-1 rounded-[12px] border px-4 py-3.5",
        tone === "minted" ? "border-hair-strong bg-gradient-to-b from-white/[0.06] to-white/[0.015]" : tone === "off" ? "border-dashed border-hair-strong bg-transparent" : "border-hair-soft bg-[#0f0f11]",
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{kicker}</p>
      <p className="mt-2 text-[20px] font-semibold leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-2 text-[11.5px] leading-snug text-ink-dim">{sub}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center text-ink-faint sm:w-6">
      <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
    </span>
  );
}

/** Horizontal pipeline: budget B, verification V, minted Q, with cost recorded on the side. */
export function MintFlow({ unitId, stage, budget, completion, minted, evidence, method, methodHref, cost, provenance, className }: MintFlowProps) {
  const off = stage === "unavailable";
  return (
    <div className={cn("min-w-0 rounded-[16px] border border-hair-soft bg-black/25 p-4", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-ink-dim">{unitId}</span>
        {stage === "potential" ? (
          <Badge tone="neutral" size="md" dot>
            Potential
          </Badge>
        ) : (
          <StateChip kind="measurement" state={off ? "unavailable" : "available"} label={off ? "Unavailable" : "Minted"} />
        )}
        <ProvenanceTag provenance={provenance} className="ml-auto" />
      </div>
      <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-stretch">
        <FlowNode kicker="Budget B" value={<span className="font-mono">{formatValue(budget)}</span>} sub="potential quirqs, set by the owner" tone="budget" />
        <FlowArrow />
        <FlowNode
          kicker="Verify V"
          tone={off ? "off" : "verify"}
          value={
            stage === "minted" && completion !== null ? (
              <span className="font-mono text-blu">{formatValue(completion, "fixed2")}</span>
            ) : (
              <span className="text-[14px] font-medium text-ink-faint">{off ? UNAVAILABLE : "Awaiting checks"}</span>
            )
          }
          sub={off ? "No method or evidence recorded" : evidence ?? "Weighted checks on before and after snapshots"}
        />
        <FlowArrow />
        <FlowNode
          kicker="Minted Q = V · B"
          tone={off ? "off" : stage === "minted" ? "minted" : "verify"}
          value={
            stage === "minted" && minted !== null ? (
              <span className="flex items-baseline gap-1.5">
                <span className="spec-text font-mono">{formatValue(minted, "decimal1")}</span>
                <span className="text-[13px] font-normal text-ink-dim">quirqs</span>
              </span>
            ) : (
              <span className="text-[14px] font-medium text-ink-faint">{off ? UNAVAILABLE : "Not minted yet"}</span>
            )
          }
          sub={off ? "Not reported as zero" : stage === "minted" ? "released by verification" : "mints after verification"}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-hair-soft pt-3 text-[12px] text-ink-dim">
        <span>
          Cost recorded separately · <span className="font-mono text-ink">{formatValue(cost, "currency")}</span> <span className="text-ink-faint">usage meter</span>
        </span>
        {methodHref ? (
          <a href={methodHref} className="inline-flex items-center gap-1 text-ink underline-offset-4 hover:underline">
            Method {method} <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className="font-mono text-ink-faint">method {method}</span>
        )}
      </div>
    </div>
  );
}

/** Compact equation chip "V · B": the minted amount with its two factors. */
export function MintChip({ completion, budget, minted, className }: { completion: number | null; budget: number; minted: number | null; className?: string }) {
  const off = completion === null || minted === null;
  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-2 overflow-hidden rounded-full border px-3 font-mono text-[11.5px]",
        off ? "border-dashed border-hair-strong text-ink-faint" : "border-hair bg-white/[0.03] text-ink-dim",
        className,
      )}
    >
      <span className="text-ink-faint">V · B</span>
      <span aria-hidden="true" className="h-3 w-px bg-hair-strong" />
      {off ? (
        <span>{UNAVAILABLE}</span>
      ) : (
        <span className="truncate">
          {formatValue(completion, "fixed2")} · {formatValue(budget)} = <span className="font-medium text-ink">{formatValue(minted, "quirqs1")}</span>
        </span>
      )}
    </span>
  );
}

/* ============================================================================ QuirqReadout */

export type QuirqReadoutProps = {
  heading?: string;
  /** minted quirqs in the window; null reads the Unavailable sentence */
  minted: number | null;
  /** "30 days to Fri 2 Oct" */
  window: string;
  method: string;
  methodHref?: string;
  provenance: Provenance;
  /** "64 units · 9 unavailable" */
  scope?: ReactNode;
  qer?: number | null;
  qv?: number | null;
  ir?: number | null;
  /** USD from the usage meter */
  cost?: number | null;
  /** extra metric cells, such as Time or quirqs per kWh */
  extra?: { label: string; value: string | null; hint?: string }[];
  unavailableNote?: string;
  /** small trend (sparkline) beside the headline */
  trend?: ReactNode;
  className?: string;
};

function Metric({ label, value, hint }: { label: string; value: string | null; hint?: string }) {
  return (
    <div className="min-w-0 bg-[#0b0b0d] px-3.5 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
      <dd className={cn("mt-1.5 truncate font-mono tabular-nums", value === null ? "text-[12px] text-ink-faint" : "text-[16px] text-ink")}>{value ?? UNAVAILABLE}</dd>
      {hint ? <dd className="mt-1 truncate text-[11px] text-ink-faint">{hint}</dd> : null}
    </div>
  );
}

/** "Work delivered" readout with method, window, provenance, QER, QV, IR and cost as a separate meter. */
export function QuirqReadout({
  heading = "Work delivered",
  minted,
  window,
  method,
  methodHref,
  provenance,
  scope,
  qer,
  qv,
  ir,
  cost,
  extra = [],
  unavailableNote = "No quirq measurement is available for this work.",
  trend,
  className,
}: QuirqReadoutProps) {
  const off = minted === null;
  return (
    <section className={cn("@container min-w-0 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(16px,2.6vw,22px)]", className)} aria-label={`${heading}, ${window}`}>
      <header className="flex flex-wrap items-center gap-2">
        <h4 className="text-[13.5px] font-semibold text-ink">{heading}</h4>
        <StateChip kind="measurement" state={off ? "unavailable" : "available"} />
        <ProvenanceTag provenance={provenance} />
        <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{window}</span>
      </header>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {off ? (
            <p className="max-w-[34ch] text-[15px] leading-snug text-ink-dim">{unavailableNote}</p>
          ) : (
            <p className="flex items-baseline gap-2">
              <span className="text-[clamp(34px,5vw,44px)] font-semibold leading-none tracking-[-0.03em] text-ink">{formatValue(minted, "decimal1")}</span>
              <span className="spec-text font-round text-[17px] font-semibold">{minted === 1 ? "quirq" : "quirqs"}</span>
            </p>
          )}
          <p className="mt-2 text-[12px] text-ink-faint">
            {scope ? <>{scope} · </> : null}
            {methodHref ? (
              <a href={methodHref} className="text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink hover:decoration-ink">
                method {method} →
              </a>
            ) : (
              <>method {method}</>
            )}
          </p>
        </div>
        {trend && !off ? <div className="w-full max-w-[220px] sm:w-[200px]">{trend}</div> : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-hair-soft bg-hair-soft @[600px]:grid-cols-4">
        <Metric label="QER" value={off || qer == null ? null : formatValue(qer, "ratio")} hint="quirqs per $ all-in" />
        <Metric label="QV" value={off || qv == null ? null : formatValue(qv, "decimal1")} hint="quirqs per week" />
        <Metric label="IR" value={off || ir == null ? null : formatValue(ir, "percent")} hint="units below threshold" />
        <Metric label="Cost" value={cost == null ? null : formatValue(cost, cost >= 100 ? "currency0" : "currency")} hint="separate meter" />
        {extra.map((m) => (
          <Metric key={m.label} label={m.label} value={m.value} hint={m.hint} />
        ))}
      </dl>
    </section>
  );
}

/** One-line readout: "Work delivered: 34 quirqs (B 40, V 0.85, method v0, mock) · Cost $4.18". */
export function QuirqReadoutLine({
  minted,
  budget,
  completion,
  method,
  provenance,
  cost,
  time,
  className,
}: {
  minted: number | null;
  budget: number;
  completion: number | null;
  method: string;
  provenance: Provenance;
  cost: number | null;
  time?: string;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-dim", className)}>
      <span className="text-ink">Work delivered:</span>
      {minted === null ? (
        <span className="text-ink-faint">{UNAVAILABLE}</span>
      ) : (
        <span className="font-mono text-ink">{formatValue(minted, "quirqs1")}</span>
      )}
      <span className="font-mono text-[12px] text-ink-faint">
        (B {formatValue(budget)}, V {formatValue(completion, "fixed2")}, method {method}, {provenance})
      </span>
      <span aria-hidden="true" className="text-ink-faint">·</span>
      <span>
        Cost <span className="font-mono text-ink">{formatValue(cost, "currency")}</span>
      </span>
      {time ? (
        <>
          <span aria-hidden="true" className="text-ink-faint">·</span>
          <span>
            Time <span className="font-mono text-ink">{time}</span>
          </span>
        </>
      ) : null}
    </p>
  );
}
