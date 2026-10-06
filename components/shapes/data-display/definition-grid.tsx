// Definition grid: label and value facts with an optional copy button per value.
// DefinitionGrid (grid, rows or lead layout), IdentityPanel (space identity plus account
// connections), RootPathStrip (host and container roots with access state) and FileMetaHead
// (galileo file name, size, modified time and a Raw link). Server-safe: CopyButton carries
// its own client boundary. Layouts respond to their container, not the viewport.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton, Spinner } from "@/components/ui/loaders";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import { toneText, type Tone } from "@/components/ui/tones";
import { PathText } from "./path-text";

/* ----------------------------------------------------------------------------- DefinitionGrid */

/** ready shows the value; loading a skeleton (or a "Loading…" line); not-recorded and error a quiet message. */
export type DefinitionState = "ready" | "loading" | "not-recorded" | "error";

export type DefinitionItem = {
  id: string;
  label: ReactNode;
  value?: ReactNode;
  /** Exact text for the clipboard. Omit for no copy button. */
  copy?: string;
  /** Noun for the copy button and its announcement: "space ID" reads "Copy space ID". */
  copyLabel?: string;
  /** Mono value for IDs, paths and branches. */
  mono?: boolean;
  /** Span every column (descriptions, repository links). */
  wide?: boolean;
  state?: DefinitionState;
  /** Message for loading ("Loading…"), not-recorded ("No GitHub remote recorded.") or error. */
  stateText?: string;
  /** Second line under the value, such as "Keep distinct from: a task". */
  note?: ReactNode;
  /** lead layout: label color. */
  labelTone?: Tone;
  /** lead layout: bold opening sentence before the value. */
  lead?: ReactNode;
};

export type DefinitionGridProps = {
  items: DefinitionItem[];
  /** grid: label over value in columns. rows: label left, value right, hairline rows. lead: colored mono labels beside prose. */
  layout?: "grid" | "rows" | "lead";
  /** grid layout: most columns at full width. */
  columns?: 2 | 3;
  /** Mono uppercase labels (default), quiet sans labels, or mono terms kept in their own case (glossaries). */
  labelStyle?: "mono" | "plain" | "term";
  "aria-label"?: string;
  className?: string;
};

const labelCls = {
  mono: "font-mono text-[10px] font-normal uppercase leading-[1.5] tracking-[0.14em] text-ink-faint",
  plain: "text-[12px] leading-[1.5] text-ink-faint",
  term: "font-mono text-[12.5px] font-medium leading-[1.5] text-ink",
} as const;

function copyNoun(item: DefinitionItem): string {
  if (item.copyLabel) return item.copyLabel;
  return typeof item.label === "string" ? item.label.toLowerCase() : "value";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The value cell body for every state. */
export function DefinitionValue({ item }: { item: DefinitionItem }) {
  const state = item.state ?? "ready";
  if (state === "loading") {
    return item.stateText ? (
      <span className="inline-flex items-center gap-2 text-ink-dim">
        <Spinner size="xs" label={null} />
        {item.stateText}
      </span>
    ) : (
      <span className="flex h-[21px] items-center">
        <Skeleton width={item.wide ? 220 : 128} height={10} radius={4} />
        <span className="sr-only">Loading</span>
      </span>
    );
  }
  if (state === "not-recorded") return <span className="text-ink-faint">{item.stateText ?? "Not recorded"}</span>;
  if (state === "error") return <span className="text-[#ff7a70]">{item.stateText ?? "Could not load this value."}</span>;
  return (
    <span className={cn("min-w-0 [overflow-wrap:anywhere]", item.mono ? "font-mono text-[12px] leading-[1.75] text-ink" : "text-ink")}>
      {item.value}
    </span>
  );
}

function CopyFor({ item }: { item: DefinitionItem }) {
  if (!item.copy || (item.state && item.state !== "ready")) return null;
  const noun = copyNoun(item);
  return (
    <CopyButton
      text={item.copy}
      size="sm"
      aria-label={`Copy ${noun}`}
      announce={`${capitalize(noun)} copied`}
      className="-my-1 text-ink-faint"
    />
  );
}

/** Label and value facts: metadata, identity, config rows, glossary rows. */
export function DefinitionGrid({ items, layout = "grid", columns = 3, labelStyle = "mono", "aria-label": ariaLabel, className }: DefinitionGridProps) {
  if (layout === "lead") {
    return (
      <dl aria-label={ariaLabel} className={cn("grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 gap-y-4 text-[14px]", className)}>
        {items.map((it) => (
          <div key={it.id} className="contents">
            <dt className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", it.labelTone ? toneText[it.labelTone] : "text-ink-dim")}>{it.label}</dt>
            <dd className="min-w-0 leading-[1.6] text-ink-dim">
              {it.lead ? <b className="font-semibold text-ink">{it.lead}</b> : null} {it.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (layout === "rows") {
    return (
      <div className={cn("@container min-w-0", className)}>
        <dl aria-label={ariaLabel} className="divide-y divide-hair-soft">
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-1 gap-x-6 gap-y-1 py-3 first:pt-0 last:pb-0 @md:grid-cols-[minmax(120px,168px)_minmax(0,1fr)]">
              <dt className={cn(labelCls[labelStyle], "pt-[3px]")}>{it.label}</dt>
              <dd className="min-w-0 text-[13px] leading-[1.6]">
                <div className="flex items-start justify-between gap-2">
                  <DefinitionValue item={it} />
                  <CopyFor item={it} />
                </div>
                {it.note ? <p className="mt-1 text-[12px] leading-[1.55] text-ink-faint">{it.note}</p> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className={cn("@container min-w-0", className)}>
      <dl
        aria-label={ariaLabel}
        className={cn(
          "grid grid-cols-1 gap-x-7 gap-y-[18px] @md:grid-cols-2",
          columns === 3 && "@3xl:grid-cols-3",
        )}
      >
        {items.map((it) => (
          <div key={it.id} className={cn("min-w-0", it.wide && "@md:col-span-2 @3xl:col-span-2")}>
            <dt className={cn(labelCls[labelStyle], "mb-1.5")}>{it.label}</dt>
            <dd className="flex min-w-0 items-start gap-1.5 text-[13px] leading-[1.6]">
              <DefinitionValue item={it} />
              <CopyFor item={it} />
            </dd>
            {it.note ? <p className="mt-1 text-[12px] leading-[1.55] text-ink-faint">{it.note}</p> : null}
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ----------------------------------------------------------------------------- IdentityPanel */

export type IdentityConnectionState = "connected" | "not_configured" | "rejected" | "unable" | "checking";

export const IDENTITY_STATE_META: Record<IdentityConnectionState, { label: string; dot: DotStatus; tone: Tone; pulse?: boolean }> = {
  connected: { label: "Connected", dot: "up", tone: "grn" },
  not_configured: { label: "Not configured", dot: "idle", tone: "neutral" },
  rejected: { label: "Authentication rejected", dot: "down", tone: "red" },
  unable: { label: "Unable to verify", dot: "warn", tone: "org" },
  checking: { label: "Checking…", dot: "busy", tone: "blu", pulse: true },
};

export type IdentityConnection = {
  id: string;
  title: string;
  state: IdentityConnectionState;
  /** "User ID: user_2abcd", "@ada-moreno · Environment (GITHUB_PAT)". */
  detail?: ReactNode;
  icon?: ReactNode;
};

export type IdentityPanelProps = {
  title?: string;
  /** Space facts on the left: Space ID, name, owner. */
  rows: DefinitionItem[];
  /** Account links on the right, separated by hairlines. */
  connections: IdentityConnection[];
  /** Heading level for the panel title; connection names sit one level below. */
  headingAs?: "h3" | "h4";
  className?: string;
};

/** Read-only identity: what this space is and which accounts were verified. */
export function IdentityPanel({ title = "Space identity", rows, connections, headingAs: H = "h3", className }: IdentityPanelProps) {
  const Sub = H === "h3" ? "h4" : "h5";
  return (
    <section aria-label={title} className={cn("@container min-w-0 rounded-[14px] border border-hair bg-s1", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-hair-soft px-4 py-3 sm:px-5">
        <H className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink">{title}</H>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Read only</span>
      </header>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-4 py-4 sm:px-5 @2xl:grid-cols-2">
        <DefinitionGrid items={rows} layout="rows" aria-label="Space" />
        <ul className="min-w-0 divide-y divide-hair-soft border-t border-hair-soft @2xl:border-t-0">
          {connections.map((c) => {
            const meta = IDENTITY_STATE_META[c.state];
            return (
              <li key={c.id} className="py-3 first:pt-3 last:pb-0 @2xl:first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <Sub className="inline-flex items-center gap-2 text-[13px] font-medium text-ink">
                    {c.icon ? <span aria-hidden="true" className="inline-flex text-ink-dim [&_svg]:size-3.5">{c.icon}</span> : null}
                    {c.title}
                  </Sub>
                  <span role="status" className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", meta.tone === "neutral" ? "text-ink-dim" : toneText[meta.tone])}>
                    <StatusDot status={meta.dot} size="xs" pulse={meta.pulse} halo={false} />
                    {meta.label}
                  </span>
                </div>
                {c.detail ? <p className="mt-1 text-[12px] leading-[1.55] text-ink-dim [overflow-wrap:anywhere]">{c.detail}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- RootPathStrip */

export type RootAccess = "readwrite" | "readonly" | "unavailable";

const ACCESS_META: Record<RootAccess, { label: string; dot: DotStatus; halo: boolean }> = {
  readwrite: { label: "Readable & writable", dot: "up", halo: true },
  readonly: { label: "Read-only", dot: "warn", halo: false },
  unavailable: { label: "Unavailable", dot: "idle", halo: false },
};

export type RootPathStripProps = {
  hostRoot?: string | null;
  containerRoot?: string | null;
  access: RootAccess;
  /** Amber follow-up after the access word, such as "New roots waiting for installer". */
  note?: string;
  /** When set the strip reads "State unavailable" with this message. */
  error?: string;
  className?: string;
};

function PathCell({ label, value, copyNoun }: { label: string; value: string | null | undefined; copyNoun?: string }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <span className="flex min-w-0 items-center gap-1">
        {value ? (
          <code title={value} className="min-w-0 truncate font-mono text-[12.5px] text-ink">
            {value}
          </code>
        ) : (
          <span className="text-[13px] text-ink-faint">Not reported by this runtime</span>
        )}
        {value && copyNoun ? (
          <CopyButton text={value} size="sm" aria-label={`Copy ${copyNoun}`} announce={`${capitalize(copyNoun)} copied`} className="-my-1.5 text-ink-faint" />
        ) : null}
      </span>
    </div>
  );
}

/** Host root, container root and access state on one strip; stacks in narrow containers. */
export function RootPathStrip({ hostRoot, containerRoot, access, note, error, className }: RootPathStripProps) {
  if (error) {
    return (
      <div role="status" className={cn("rounded-[12px] border border-hair bg-s1/80 px-4 py-[13px]", className)}>
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">State unavailable</span>
        <span className="text-[13px] text-ink-dim">{error}</span>
      </div>
    );
  }
  const meta = ACCESS_META[access];
  return (
    <div className={cn("@container min-w-0", className)}>
      <div
        className={cn(
          "grid grid-cols-1 items-center gap-x-[18px] gap-y-3 rounded-[12px] border bg-s1/80 px-4 py-[13px] @2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]",
          access === "readwrite" ? "border-hair" : "border-org/25",
        )}
      >
        <PathCell label="Host root" value={hostRoot} copyNoun="host root" />
        <PathCell label="Container root" value={containerRoot} copyNoun="container root" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusDot status={meta.dot} size="sm" halo={meta.halo} />
          <span className={cn("font-mono text-[10.5px] font-medium uppercase tracking-[0.1em]", access === "readwrite" ? "text-ink" : access === "readonly" ? "text-org" : "text-ink-dim")}>
            {meta.label}
          </span>
          {note ? <em className="border-l border-hair pl-2 text-[11.5px] font-medium not-italic text-org">{note}</em> : null}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- FileMetaHead */

export type FileMetaHeadProps = {
  /** Basename for a single-file source, relative path for a file inside a folder source. */
  label: string;
  size: string;
  modified: string;
  rawHref: string;
  className?: string;
};

/** galileo file head: name, size and modified time, and a Raw link. Wraps on narrow widths. */
export function FileMetaHead({ label, size, modified, rawHref, className }: FileMetaHeadProps) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 text-[13px]", className)}>
      <span className="min-w-0 font-mono text-[14px] text-ink [overflow-wrap:anywhere]">
        <PathText path={label} />
      </span>
      <span className="font-mono text-[12px] tabular-nums text-ink-dim">
        {size} · {modified}
      </span>
      <a href={rawHref} className="text-ink underline decoration-hair-strong underline-offset-[3px] transition-colors hover:decoration-ink">
        Raw
      </a>
    </p>
  );
}
