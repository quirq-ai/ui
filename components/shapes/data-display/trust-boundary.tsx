// Trust boundary: what stays on this machine and what leaves the space.
// TrustSplit (two railed columns: local vs portable, or stays local vs sent), UsageReportingStatus
// (on, blocked, pending, off), BoundaryDiagram (two origins and the messages allowed across),
// LocalOnlyTag, LocalHeaderStrip (product header with the FILES STAY LOCAL tag) and
// AttributionRow. Server-safe: CopyButton carries its own client boundary.
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { LoadingLine } from "@/components/ui/loaders";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import type { Tone } from "@/components/ui/tones";
import { Mark } from "@/components/brand/mark";
import { PathText } from "./path-text";

/* ----------------------------------------------------------------------------- rails */

/** local = machine-local (blue), portable = travels with the project (green), sent = leaves the space (orange). */
export type TrustRail = "local" | "portable" | "sent";

const RAIL: Record<TrustRail, { text: string; border: string; bar: string; tone: Tone }> = {
  local: { text: "text-blu", border: "border-blu/45", bar: "bg-blu", tone: "blu" },
  portable: { text: "text-grn", border: "border-grn/45", bar: "bg-grn", tone: "grn" },
  sent: { text: "text-org", border: "border-org/45", bar: "bg-org", tone: "org" },
};

/* ----------------------------------------------------------------------------- TrustSplit */

export type TrustRow = {
  id: string;
  /** Path or item name. */
  label: string;
  /** What it holds or why. */
  detail?: string;
  mono?: boolean;
  /** Right side: a status ("1 present · 37 tracked") or a tag such as LocalOnlyTag. */
  status?: ReactNode;
  /** Adds a copy button for the label. */
  copy?: boolean;
};

export type TrustSide = {
  id: string;
  /** "Machine-local · ephemeral", "Stays local". */
  kicker: string;
  title: string;
  /** Count pill: "7 files", "12 projects". */
  count?: string;
  /** Root path shown under the head, with a copy button. */
  path?: string;
  blurb?: ReactNode;
  rail: TrustRail;
  rows: TrustRow[];
};

export type TrustSplitProps = {
  sides: [TrustSide, TrustSide];
  /** Heading level for each side title; match the surrounding page outline. */
  headingAs?: "h3" | "h4" | "h5";
  /** Shows the loading line instead of the rows. */
  loading?: boolean;
  loadingText?: string;
  "aria-label"?: string;
  className?: string;
};

function SideColumn({ side, loading, loadingText, H }: { side: TrustSide; loading: boolean; loadingText: string; H: "h3" | "h4" | "h5" }) {
  const rail = RAIL[side.rail];
  return (
    <article aria-label={`${side.kicker}: ${side.title}`} className="relative min-w-0 px-4 pb-3 pt-4 sm:px-5">
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-0.5 opacity-70", rail.bar)} />
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={cn("mb-1 block font-mono text-[10px] font-medium uppercase tracking-[0.14em]", rail.text)}>{side.kicker}</span>
          <H className="text-[17px] font-semibold leading-tight tracking-[-0.015em] text-ink">{side.title}</H>
        </div>
        {side.count ? (
          <b className="shrink-0 rounded-full border border-hair px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-dim">
            {side.count}
          </b>
        ) : null}
      </header>
      {side.path ? (
        <div className="mt-3 flex min-w-0 items-center gap-1 rounded-[8px] border border-hair-soft bg-black/40 py-1 pl-2.5 pr-1">
          <code title={side.path} className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink-dim">
            {side.path}
          </code>
          <CopyButton text={side.path} size="sm" aria-label={`Copy ${side.title} path`} announce="Path copied" className="text-ink-faint" />
        </div>
      ) : null}
      {side.blurb ? <p className="mt-3 text-[12.5px] leading-[1.6] text-ink-dim">{side.blurb}</p> : null}
      {loading ? (
        <div className="py-6">
          <LoadingLine>{loadingText}</LoadingLine>
        </div>
      ) : (
        <div
          tabIndex={side.rows.length > 4 ? 0 : undefined}
          role={side.rows.length > 4 ? "region" : undefined}
          aria-label={side.rows.length > 4 ? `${side.title} items` : undefined}
          className={cn("scroll-thin mt-3 max-h-[285px] overflow-y-auto border-l-2 pl-3", rail.border)}
        >
          <ul className="divide-y divide-hair-soft">
            {side.rows.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1">
                    {r.mono ? (
                      <code className="min-w-0 font-mono text-[12px] text-ink [overflow-wrap:anywhere]">
                        <PathText path={r.label} />
                      </code>
                    ) : (
                      <span className="min-w-0 text-[13px] text-ink">{r.label}</span>
                    )}
                    {r.copy ? (
                      <CopyButton text={r.label} size="sm" aria-label={`Copy ${r.label}`} announce="Path copied" className="-my-1.5 shrink-0 text-ink-faint" />
                    ) : null}
                  </div>
                  {r.detail ? <p className="mt-0.5 text-[12px] leading-[1.5] text-ink-faint">{r.detail}</p> : null}
                </div>
                {r.status ? <span className="shrink-0 pt-px text-[11px] text-ink-dim">{r.status}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

/** Two columns with colored rails: local vs portable storage, or what stays local vs what is sent. */
export function TrustSplit({
  sides,
  headingAs = "h3",
  loading = false,
  loadingText = "Mapping watcher outputs…",
  "aria-label": ariaLabel,
  className,
}: TrustSplitProps) {
  return (
    <section aria-label={ariaLabel} aria-busy={loading || undefined} className={cn("@container min-w-0", className)}>
      <div className="grid grid-cols-1 overflow-hidden rounded-[14px] border border-hair bg-s1 @2xl:grid-cols-2">
        <SideColumn side={sides[0]} loading={loading} loadingText={loadingText} H={headingAs} />
        <div className="border-t border-hair-soft @2xl:border-l @2xl:border-t-0">
          <SideColumn side={sides[1]} loading={loading} loadingText={loadingText} H={headingAs} />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- UsageReportingStatus */

export type ReportingState = "on" | "blocked" | "pending" | "off";

export const REPORTING_META: Record<ReportingState, { dot: DotStatus; tone?: Tone; pulse?: boolean; text: string }> = {
  on: { dot: "up", text: "Daily totals: tokens, cost, sessions and tools. Prompts, responses and files stay local." },
  blocked: { dot: "down", text: "XO_API_KEY was rejected. Replace or remove it; nothing is sent." },
  pending: { dot: "busy", tone: "yel", pulse: true, text: "Key saved; waiting for verification. Nothing is sent yet." },
  off: { dot: "idle", text: "No XO_API_KEY. Nothing is sent." },
};

export type UsageReportingStatusProps = {
  state: ReportingState;
  /** Shown when on: "Thu 1 Oct". */
  lastSent?: string;
  /** In-app link to the trust page. */
  href?: string;
  hrefLabel?: string;
  /** Right side control, such as a Switch. */
  control?: ReactNode;
  className?: string;
};

/** One line that says whether usage totals leave the machine, and when they last did. */
export function UsageReportingStatus({ state, lastSent, href, hrefLabel = "What leaves your machine", control, className }: UsageReportingStatusProps) {
  const meta = REPORTING_META[state];
  return (
    <div className={cn("grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 rounded-[10px] border border-hair bg-s1 px-[18px] py-4", className)}>
      <span className="pt-[7px]">
        <StatusDot status={meta.dot} tone={meta.tone} pulse={meta.pulse} size="sm" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          {/* Only the interactive line is a live region; static examples stay quiet. */}
          <p role={control ? "status" : undefined} className="text-[13px] font-semibold leading-6 text-ink">
            Usage reporting: {state}
          </p>
          {control ? <div className="shrink-0">{control}</div> : null}
        </div>
        <p className="mt-0.5 text-[12.5px] leading-[1.6] text-ink-dim">
          {meta.text}
          {state === "on" && lastSent ? <> Last sent {lastSent}.</> : null}
        </p>
        {href ? (
          <a href={href} className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink">
            {hrefLabel} <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- BoundaryDiagram */

export type BoundaryZone = {
  /** "localhost:4100" */
  origin: string;
  title: string;
  items: string[];
  rail: TrustRail;
};

export type BoundaryMessage = {
  id: string;
  /** toRight crosses from the first zone to the second. */
  direction: "toRight" | "toLeft";
  label: string;
  detail?: string;
  /** dotted for the bridge, solid for requests. */
  dotted?: boolean;
};

export type BoundaryDiagramProps = {
  zones: [BoundaryZone, BoundaryZone];
  messages: BoundaryMessage[];
  boundaryLabel?: string;
  className?: string;
};

function Zone({ zone }: { zone: BoundaryZone }) {
  const rail = RAIL[zone.rail];
  return (
    <div className={cn("min-w-0 rounded-[12px] border bg-s1 p-4", rail.border)}>
      <span className={cn("block font-mono text-[11px] font-medium tracking-[0.02em]", rail.text)}>{zone.origin}</span>
      <p className="mt-1 text-[14px] font-semibold text-ink">{zone.title}</p>
      <ul className="mt-2.5 space-y-1.5">
        {zone.items.map((it) => (
          <li key={it} className="flex gap-2 text-[12px] leading-[1.5] text-ink-dim">
            <span aria-hidden="true" className={cn("mt-[7px] size-1 shrink-0 rounded-full", rail.bar)} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two origins side by side (stacked when narrow) and the only messages allowed between them. */
export function BoundaryDiagram({ zones, messages, boundaryLabel = "Origin boundary", className }: BoundaryDiagramProps) {
  return (
    <figure className={cn("@container min-w-0", className)}>
      <div className="grid grid-cols-1 items-stretch gap-3 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <Zone zone={zones[0]} />
        <div className="relative flex min-w-0 flex-col justify-center rounded-[12px] border border-dashed border-hair-strong px-3 py-3">
          <span className="mb-2 block text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{boundaryLabel}</span>
          <ol className="space-y-2">
            {messages.map((m, i) => (
              <li key={m.id} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-right font-mono text-[10px] tabular-nums text-ink-faint">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    {m.direction === "toLeft" ? (
                      <ArrowLeft aria-hidden="true" className="size-3.5 shrink-0 rotate-90 text-ink-dim @2xl:rotate-0" />
                    ) : null}
                    <span className={cn("h-px min-w-3 flex-1", m.dotted ? "border-t border-dotted border-ink-dim" : "bg-ink-dim/70")} aria-hidden="true" />
                    {m.direction === "toRight" ? (
                      <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 rotate-90 text-ink-dim @2xl:rotate-0" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-[12px] leading-[1.45] text-ink">
                    {m.label}
                    {m.detail ? <span className="text-ink-faint"> · {m.detail}</span> : null}
                  </span>
                  <span className="sr-only">{m.direction === "toRight" ? `from ${zones[0].origin} to ${zones[1].origin}` : `from ${zones[1].origin} to ${zones[0].origin}`}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <Zone zone={zones[1]} />
      </div>
    </figure>
  );
}

/* ----------------------------------------------------------------------------- tags and rows */

/** Blue outlined LOCAL ONLY tag with a lock. */
export function LocalOnlyTag({ children = "Local only", size = "sm" }: { children?: ReactNode; size?: "xs" | "sm" | "md" }) {
  return (
    <Badge tone="blu" variant="outline" mono size={size} icon={<Lock />}>
      {children}
    </Badge>
  );
}

export type LocalHeaderState = "none" | "connected" | "sample";

export type LocalHeaderStripProps = {
  product: string;
  state: LocalHeaderState;
  /** Connected folder path, such as "~/notes". */
  folder?: string;
  /** "212 files". */
  detail?: string;
  action?: ReactNode;
  className?: string;
};

/** Product header with the connection line and the local-only tag. */
export function LocalHeaderStrip({ product, state, folder, detail, action, className }: LocalHeaderStripProps) {
  const line =
    state === "none" ? "No folder connected" : state === "sample" ? "Sample folder · fictional files" : `${folder ?? "Folder"}${detail ? ` · ${detail}` : ""}`;
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-hair-soft bg-black/50 px-4 py-3", className)}>
      <span className="inline-flex shrink-0 items-center gap-2.5 text-ink">
        <Mark size={18} />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.3em]">{product}</span>
      </span>
      <span className="inline-flex min-w-0 items-center gap-2 text-[12.5px] text-ink-dim">
        <StatusDot status={state === "connected" ? "up" : state === "sample" ? "warn" : "idle"} size="xs" />
        <span className="min-w-0 truncate font-mono text-[12px]">{line}</span>
      </span>
      <LocalOnlyTag>Files stay local</LocalOnlyTag>
      {action ? <span className="ml-auto shrink-0">{action}</span> : null}
    </div>
  );
}

export type AttributionRowProps = {
  byLabel: string;
  byHref: string;
  items: { id: string; icon?: ReactNode; text: ReactNode }[];
  className?: string;
};

/** "A product by quirq.ai ↗ · claims" row: inline when wide, stacked when narrow. */
export function AttributionRow({ byLabel, byHref, items, className }: AttributionRowProps) {
  return (
    <div className={cn("@container min-w-0", className)}>
      <ul className="flex flex-col gap-x-4 gap-y-1.5 text-[11.5px] leading-[1.5] text-ink-faint @2xl:flex-row @2xl:flex-wrap @2xl:items-center">
        <li>
          A product by{" "}
          <a href={byHref} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-dim transition-colors hover:text-ink">
            {byLabel} <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-1.5 @2xl:before:mr-2.5 @2xl:before:text-ink-faint @2xl:before:content-['·']">
            {it.icon ? <span aria-hidden="true" className="inline-flex text-cyn [&_svg]:size-3">{it.icon}</span> : null}
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
