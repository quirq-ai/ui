// Provenance and method: every number says where it came from and how it was made.
// ProvenanceBadge (live host, mock data, illustrative, sample, unavailable; hover or focus
// shows the source), MethodFootnote (provenance · method · unit · scope · window, linking to
// the method), MetaLine (byline, qualifier, reassurance), UnavailableValue (the word
// Unavailable with a link to the method) and QuarterLedger (illustrative QER table).
// Server-safe; the hover source uses the CSS-only Tooltip.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber, formatRatio } from "@/lib/format";
import { Tooltip } from "@/components/ui/tooltip";
import { StatusDot } from "@/components/ui/status";
import { toneOutline, toneSoft, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- ProvenanceBadge */

export type ProvenanceKind = "live" | "mock" | "illustrative" | "sample" | "unavailable";

export const PROVENANCE_BADGE: Record<ProvenanceKind, { label: string; tone: Tone; outline: boolean; source: string }> = {
  live: { label: "Live", tone: "grn", outline: false, source: "Read from a connected telemetry source." },
  mock: { label: "Mock data", tone: "yel", outline: false, source: "Sample data for this demo. Not a live measurement." },
  illustrative: { label: "Illustrative", tone: "org", outline: false, source: "Example numbers that show the method, not a result." },
  sample: { label: "Sample", tone: "org", outline: true, source: "A sample entry, not a published record." },
  unavailable: { label: "Unavailable", tone: "neutral", outline: true, source: "No source reported this value." },
};

export type ProvenanceBadgeProps = {
  kind: ProvenanceKind;
  /** Live host such as "localhost:5002"; replaces the word Live. */
  host?: string;
  /** Hover and focus text; defaults to the kind's note. */
  source?: string;
  /** Unique id for the tooltip so the badge is described by it. */
  id: string;
  size?: "sm" | "md";
  className?: string;
};

/** Mono badge that marks a number's provenance. Focus or hover it to read the source. */
export function ProvenanceBadge({ kind, host, source, id, size = "sm", className }: ProvenanceBadgeProps) {
  const meta = PROVENANCE_BADGE[kind];
  const text = kind === "live" && host ? host : meta.label;
  return (
    <Tooltip content={source ?? meta.source} id={`${id}-tip`} placement="top" align="start">
      <button
        type="button"
        className={cn(
          "inline-flex shrink-0 cursor-help items-center gap-1.5 whitespace-nowrap rounded-[3px]! border font-mono font-medium leading-none",
          kind === "live" && host ? "tracking-[0.02em]" : "uppercase tracking-[0.1em]",
          size === "sm" ? "h-[20px] px-1.5 text-[10px]" : "h-6 px-2 text-[10.5px]",
          meta.outline ? toneOutline[meta.tone] : toneSoft[meta.tone],
          className,
        )}
      >
        {kind === "live" ? <StatusDot status="up" size="xs" pulse halo={false} /> : null}
        {text}
      </button>
    </Tooltip>
  );
}

/* ----------------------------------------------------------------------------- MethodFootnote */

export type MethodFootnoteProps = {
  provenance: Exclude<ProvenanceKind, "unavailable" | "sample">;
  /** "v0" */
  method: string;
  unit: string;
  scope: string;
  window: string;
  /** Link to the method write-up. */
  href?: string;
  hrefLabel?: string;
  className?: string;
};

const FOOT_TONE: Record<MethodFootnoteProps["provenance"], string> = {
  live: "text-grn",
  mock: "text-yel",
  illustrative: "text-org",
};

/** Mono footnote under a chart or table: provenance · method · unit · scope · window. */
export function MethodFootnote({ provenance, method, unit, scope, window, href, hrefLabel = "Method", className }: MethodFootnoteProps) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[10.5px] leading-[1.6] tracking-[0.02em] text-ink-faint", className)}>
      <span className={cn("font-medium uppercase tracking-[0.12em]", FOOT_TONE[provenance])}>{PROVENANCE_BADGE[provenance].label}</span>
      <span aria-hidden="true">·</span>
      <span>method {method}</span>
      <span aria-hidden="true">·</span>
      <span>unit: {unit}</span>
      <span aria-hidden="true">·</span>
      <span>scope: {scope}</span>
      <span aria-hidden="true">·</span>
      <span>window: {window}</span>
      {href ? (
        <a href={href} className="ml-1 text-ink-dim underline decoration-hair-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">
          {hrefLabel} <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </p>
  );
}

/* ----------------------------------------------------------------------------- MetaLine */

export type MetaLineVariant = "byline" | "qualifier" | "reassurance";

/** Honest qualifier lines: byline (who and when), qualifier (what kind of number), reassurance (what happens next). */
export function MetaLine({ variant, children, className }: { variant: MetaLineVariant; children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono leading-[1.7]",
        variant === "byline" && "text-[10.5px] uppercase tracking-[0.16em] text-ink-dim",
        variant === "qualifier" && "text-[11px] tracking-[0.02em] text-ink-faint",
        variant === "reassurance" && "text-[10.5px] uppercase tracking-[0.12em] text-ink-faint",
        className,
      )}
    >
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------------------- UnavailableValue */

export type UnavailableValueProps = {
  label: string;
  /** Why there is no number: "No quirq measurement is available for this work." */
  note: string;
  href: string;
  hrefLabel?: string;
  size?: "sm" | "lg";
  className?: string;
};

/** The word Unavailable in place of a number, never a zero, with the reason and the method. */
export function UnavailableValue({ label, note, href, hrefLabel = "How this is measured", size = "lg", className }: UnavailableValueProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className={cn("mt-1.5 font-semibold tracking-[-0.02em] text-ink-dim", size === "lg" ? "text-[26px] leading-none" : "text-[15px]")}>Unavailable</p>
      <p className="mt-2 text-[12.5px] leading-[1.55] text-ink-dim">{note}</p>
      <a href={href} className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink">
        {hrefLabel} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

/* ----------------------------------------------------------------------------- QuarterLedger */

export type LedgerRow = { id: string; period: string; mintedQ: number | null; cost: number | null; qer: number | null };

export type QuarterLedgerProps = {
  rows: LedgerRow[];
  /** Region name and caption: "Quarter ledger, illustrative". */
  caption: string;
  /** Emphasize the QER column. */
  emphasizeQER?: boolean;
  footer?: ReactNode;
  className?: string;
};

/** Month, minted Q, all-in cost and QER. Scrolls sideways inside a focusable region. */
export function QuarterLedger({ rows, caption, emphasizeQER = true, footer, className }: QuarterLedgerProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div tabIndex={0} role="region" aria-label={caption} className="scroll-thin overflow-x-auto rounded-[14px] border border-hair-soft bg-[#0f0f11]">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-hair-soft bg-white/[0.03]">
              {["Month", "Minted Q", "All-in cost", "QER"].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cn("px-4 py-2.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-dim", i > 0 && "text-right")}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-hair-soft last:border-b-0">
                <th scope="row" className="px-4 py-2.5 text-[13px] font-normal text-ink">
                  {r.period}
                </th>
                <td className="px-4 py-2.5 text-right font-mono text-[12.5px] tabular-nums text-ink-dim">{formatNumber(r.mintedQ)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[12.5px] tabular-nums text-ink-dim">{formatCurrency(r.cost, 0)}</td>
                <td className={cn("px-4 py-2.5 text-right font-mono text-[12.5px] tabular-nums", emphasizeQER ? "font-semibold text-ink" : "text-ink-dim")}>
                  {formatRatio(r.qer)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
