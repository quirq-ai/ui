// Static tables with their own looks: ComparisonMatrix (offerings by feature, first head
// cell sr-only), FolderListing (galileo files source listing with its read-only footnote),
// KeyValueTable (190px muted key column) and RecentWorkTable (ARIA grid of recent events).
// Server-safe: no hooks. Handlers are optional and only passed from client demos.
import type { MouseEvent, ReactNode } from "react";
import { File, Folder } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- ComparisonMatrix */

export type MatrixColumn = { title: ReactNode; tag: string; tone: Tone };
export type MatrixRow = { label: string; cells: ReactNode[] };

export type ComparisonMatrixProps = {
  columns: MatrixColumn[];
  rows: MatrixRow[];
  /** Screen reader name of the label column. */
  featureLabel?: string;
  caption: string;
  minWidth?: number;
  className?: string;
};

/** Offerings across the top, features down the side. Scrolls sideways on phones. */
export function ComparisonMatrix({ columns, rows, featureLabel = "Feature", caption, minWidth = 640, className }: ComparisonMatrixProps) {
  return (
    <div className={cn("min-w-0 rounded-[18px] border border-hair-soft bg-[#0f0f11] p-1.5", className)}>
      <div role="region" aria-label={caption} tabIndex={0} className="scroll-thin overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13.5px]" style={{ minWidth }}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[28%] px-5 py-[18px]">
                <span className="sr-only">{featureLabel}</span>
              </th>
              {columns.map((c, i) => (
                <th key={i} scope="col" className="border-b border-hair px-5 py-[18px] align-bottom text-[15px] font-semibold text-ink">
                  {c.title}
                  <span className={cn("mt-1.5 block font-mono text-[9px] font-normal uppercase tracking-[0.12em]", toneText[c.tone])}>
                    {c.tag}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="transition-colors hover:bg-white/[0.02]">
                <th
                  scope="row"
                  className="border-b border-white/[0.05] px-5 py-3.5 text-left font-mono text-[9.5px] font-normal uppercase tracking-[0.12em] text-ink-faint"
                >
                  {r.label}
                </th>
                {r.cells.map((cell, i) => (
                  <td key={i} className="border-b border-white/[0.05] px-5 py-3.5 text-ink-dim">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- FolderListing */

export type FolderEntry = {
  name: string;
  kind: "folder" | "file";
  /** bytes; folders show no size */
  size: number | null;
  /** already formatted, such as "2026-09-29 03:13" */
  modified: string;
  href: string;
};

export type FolderListingProps = {
  /** Folder name shown in the heading and footnote. */
  folder: string;
  /** Origin line, such as http://notes.localhost:4100/. */
  origin?: string;
  entries: FolderEntry[];
  /** Called instead of following the link (demos). */
  onOpen?: (entry: FolderEntry, e: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
};

/** galileo files source listing: Name, Size, Modified, then the read-only footnote. */
export function FolderListing({ folder, origin, entries, onOpen, className }: FolderListingProps) {
  const note = `Hidden files are never shown, and node_modules isn't listed. ${folder} is read only.`;
  return (
    <div className={cn("min-w-0 rounded-[14px] border border-hair-soft bg-[#0c0d0b] px-4 pb-4 pt-3.5", className)}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="font-mono text-[14px] text-ink">
          {folder}
          <span className="text-ink-faint">/</span>
        </h4>
        {origin ? <span className="truncate font-mono text-[11px] text-ink-faint">{origin}</span> : null}
      </div>
      {entries.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-hair px-3.5 py-4 text-[13px] text-ink-dim">
          This folder is empty. {note}
        </p>
      ) : (
        <>
          <div role="region" aria-label={`Files in ${folder}`} tabIndex={0} className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse">
              <caption className="sr-only">Files in {folder}</caption>
              <thead>
                <tr>
                  {["Name", "Size", "Modified"].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={cn(
                        "border-b border-hair px-2.5 py-[7px] text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-faint",
                        i === 0 ? "text-left" : "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.name} className="transition-colors hover:bg-white/[0.025]">
                    <td className="border-b border-hair-soft px-2.5 py-[7px]">
                      <a
                        href={e.href}
                        onClick={onOpen ? (ev) => onOpen(e, ev) : undefined}
                        className="inline-flex items-center gap-2 rounded-[4px]! font-mono text-[14px] text-ink underline-offset-4 hover:text-[#83d63a] hover:underline"
                      >
                        {e.kind === "folder" ? (
                          <Folder aria-hidden="true" className="size-3.5 text-ink-faint" />
                        ) : (
                          <File aria-hidden="true" className="size-3.5 text-ink-faint" />
                        )}
                        {e.name}
                        {e.kind === "folder" ? "/" : ""}
                      </a>
                    </td>
                    <td className="whitespace-nowrap border-b border-hair-soft px-2.5 py-[7px] text-right text-[13px] tabular-nums text-ink-faint">
                      {e.kind === "folder" ? <span className="sr-only">Folder</span> : formatBytes(e.size)}
                    </td>
                    <td className="whitespace-nowrap border-b border-hair-soft px-2.5 py-[7px] text-right font-mono text-[12.5px] tabular-nums text-ink-faint">
                      {e.modified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">{note}</p>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------- KeyValueTable */

export type KeyValueTableProps = {
  pairs: [string, ReactNode][];
  caption: string;
  className?: string;
};

/** Two-column detail table with a 190px muted key column; values wrap. */
export function KeyValueTable({ pairs, caption, className }: KeyValueTableProps) {
  return (
    <table className={cn("w-full border-collapse text-[13px]", className)}>
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {pairs.map(([k, v]) => (
          <tr key={k} className="border-b border-hair-soft last:border-b-0">
            <th scope="row" className="w-[38%] py-2 pr-4 text-left align-top text-[12.5px] font-normal text-ink-faint sm:w-[190px]">
              {k}
            </th>
            <td className="break-words py-2 align-top text-ink">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ----------------------------------------------------------------------------- RecentWorkTable */

export type RecentWorkRow = {
  id: string;
  what: ReactNode;
  runtime: ReactNode;
  project: string | null;
  when: string;
};

export type RecentWorkTableProps = {
  rows: RecentWorkRow[];
  label?: string;
  /** Rows open their project when set. */
  onOpen?: (row: RecentWorkRow) => void;
  /** Paint one row in its hover look (static demos). */
  hoverId?: string;
  emptyText?: string;
  className?: string;
};

/* container queries: What and When always; Project from 360px; Runtime from 500px of table width */
const workGrid =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 @min-[360px]:grid-cols-[minmax(0,1fr)_96px_56px] @min-[500px]:grid-cols-[minmax(0,1fr)_96px_96px_56px]";

/** Recent events as an ARIA table laid out on a grid: What, Runtime, Project, When. */
export function RecentWorkTable({ rows, label = "Recent work", onOpen, hoverId, emptyText = "No recent space events.", className }: RecentWorkTableProps) {
  if (rows.length === 0) {
    return <p className={cn("rounded-[12px] border border-dashed border-hair px-4 py-6 text-center text-[13px] text-ink-dim", className)}>{emptyText}</p>;
  }
  return (
    <div className={cn("@container min-w-0", className)}>
      <div role="table" aria-label={label} className="text-[12.5px]">
      <div role="rowgroup">
        <div role="row" className={cn(workGrid, "border-b border-hair px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint")}>
          <span role="columnheader">What</span>
          <span role="columnheader" className="@max-[500px]:hidden">
            Runtime
          </span>
          <span role="columnheader" className="@max-[360px]:hidden">
            Project
          </span>
          <span role="columnheader" className="text-right">
            When
          </span>
        </div>
      </div>
      <div role="rowgroup">
        {rows.map((r) => (
          <div
            key={r.id}
            role="row"
            className={cn(
              workGrid,
              "items-center border-b border-hair-soft px-3 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.025]",
              hoverId === r.id && "bg-white/[0.025]",
            )}
          >
            <span role="cell" className="line-clamp-2 min-w-0 break-words text-ink">
              {onOpen && r.project ? (
                <button type="button" onClick={() => onOpen(r)} className="max-w-full rounded-[4px]! text-left hover:underline hover:underline-offset-4">
                  {r.what}
                </button>
              ) : (
                r.what
              )}
            </span>
            <span role="cell" className="min-w-0 truncate text-ink-dim @max-[500px]:hidden">
              {r.runtime}
            </span>
            <span role="cell" className="min-w-0 truncate font-mono text-[11.5px] text-ink-dim @max-[360px]:hidden">
              {r.project ?? "space"}
            </span>
            <span role="cell" className="whitespace-nowrap text-right font-mono text-[11px] tabular-nums text-ink-faint">
              {r.when}
            </span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
