"use client";

// Readers: TreeTable (an expandable folder tree with purpose, size and age columns, as the
// Technical details state tree shows it) and CsvReader (a bounded, paged preview of a CSV
// with row numbers, a sticky head, zebra rows and a header-row toggle).
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes, UNAVAILABLE } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { LoadingLine } from "@/components/ui/loaders";

/* ----------------------------------------------------------------------------- TreeTable */

export type TreeRow = {
  id: string;
  name: string;
  kind: "folder" | "file";
  purpose: string;
  /** bytes; null when the size cannot be read (renders Unavailable) */
  size: number | null;
  /** relative age, such as "12s ago" */
  age: string;
  /** value is hidden on screen, such as an env file */
  masked?: boolean;
  children?: TreeRow[];
};

export type TreeTableProps = {
  rows: TreeRow[];
  label: string;
  /** Folder ids open at first render. */
  defaultOpen?: string[];
  state?: "ready" | "loading" | "unavailable";
  /** Show the "Tree capped at N entries." footer. */
  cappedAt?: number | null;
  unavailableText?: ReactNode;
  className?: string;
};

/* container queries: the columns follow the table's own width, not the viewport */
const treeGrid =
  "grid grid-cols-[minmax(0,1fr)_64px] gap-x-3 @sm:grid-cols-[minmax(0,1fr)_64px_64px] @2xl:grid-cols-[minmax(200px,1.1fr)_minmax(160px,1fr)_72px_72px]";

/** Expandable tree with columns. Folder toggles take Enter, Space, ArrowRight and ArrowLeft. */
export function TreeTable({ rows, label, defaultOpen = [], state = "ready", cappedAt = null, unavailableText, className }: TreeTableProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));

  const flat = useMemo(() => {
    const out: { row: TreeRow; depth: number }[] = [];
    const walk = (list: TreeRow[], depth: number) => {
      for (const r of list) {
        out.push({ row: r, depth });
        if (r.children && open.has(r.id)) walk(r.children, depth + 1);
      }
    };
    walk(rows, 0);
    return out;
  }, [rows, open]);

  function setFolder(id: string, value: boolean) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFolder(id, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFolder(id, false);
    }
  }

  return (
    <div className={cn("@container min-w-0 overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]", className)}>
      <div role="table" aria-label={label} className="text-[12.5px]">
        <div role="rowgroup">
          <div role="row" className={cn(treeGrid, "border-b border-hair px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint")}>
            <span role="columnheader">Name</span>
            <span role="columnheader" className="@max-2xl:hidden">
              Purpose
            </span>
            <span role="columnheader" className="text-right @max-sm:hidden">
              Size
            </span>
            <span role="columnheader" className="text-right">
              Changed
            </span>
          </div>
        </div>
        <div role="rowgroup">
          {state === "loading" ? (
            <div role="row" className="px-4 py-6">
              <span role="cell">
                <LoadingLine>Reading the state directory…</LoadingLine>
              </span>
            </div>
          ) : state === "unavailable" || rows.length === 0 ? (
            <div role="row" className="px-4 py-6 text-[13px] text-ink-dim">
              <span role="cell">{unavailableText ?? "The state directory is empty or unavailable. Reconnect to the local server and refresh."}</span>
            </div>
          ) : (
            flat.map(({ row, depth }) => {
              const isFolder = row.kind === "folder";
              const isOpen = open.has(row.id);
              return (
                <div
                  key={row.id}
                  role="row"
                  className={cn(treeGrid, "min-h-[38px] items-center border-b border-hair-soft px-4 py-1.5 transition-colors last:border-b-0 hover:bg-white/[0.025]")}
                >
                  <span role="cell" className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: depth * 18 }}>
                    {isFolder ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Collapse" : "Expand"} ${row.name}`}
                        onClick={() => setFolder(row.id, !isOpen)}
                        onKeyDown={(e) => onKey(e, row.id)}
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px]! text-ink-faint hover:bg-s3 hover:text-ink"
                      >
                        <ChevronRight aria-hidden="true" className={cn("size-3.5 transition-transform duration-150", isOpen && "rotate-90")} />
                      </button>
                    ) : (
                      <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center text-ink-faint">
                        ·
                      </span>
                    )}
                    {isFolder ? (
                      isOpen ? (
                        <FolderOpen aria-hidden="true" className="size-3.5 shrink-0 text-ink-dim" />
                      ) : (
                        <Folder aria-hidden="true" className="size-3.5 shrink-0 text-ink-dim" />
                      )
                    ) : (
                      <File aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
                    )}
                    <span className={cn("truncate font-mono text-[12.5px]", isFolder ? "text-ink" : "text-ink-dim")}>{row.name}</span>
                    {row.masked ? (
                      <Badge mono size="xs" tone="org">
                        Masked
                      </Badge>
                    ) : null}
                  </span>
                  <span role="cell" className="min-w-0 truncate text-ink-dim @max-2xl:hidden">
                    {row.purpose}
                  </span>
                  <span role="cell" className="text-right font-mono text-[11.5px] tabular-nums text-ink-faint @max-sm:hidden">
                    {isFolder ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="sr-only">Folder</span>
                      </>
                    ) : row.size === null ? (
                      UNAVAILABLE
                    ) : (
                      formatBytes(row.size)
                    )}
                  </span>
                  <span role="cell" className="text-right font-mono text-[11.5px] tabular-nums text-ink-faint">
                    {row.age}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
      {cappedAt && state === "ready" ? (
        <p className="border-t border-hair-soft px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          Tree capped at {cappedAt} entries.
        </p>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- CsvReader */

export type CsvReaderProps = {
  /** File name for the caption, such as usage-sept.csv. */
  name: string;
  /** Parsed rows. Cells are text, never HTML. */
  rows: string[][];
  pageSize?: number;
  /** Start with the first row treated as headers. */
  defaultHeader?: boolean;
  /** CSV records in the source file (header included) before the preview was cut. Shows a truncation note when larger. */
  sourceRows?: number;
  maxHeight?: number | string;
  className?: string;
};

const NUMERIC = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/** Simple CSV split for previews: quoted fields with doubled quotes, commas, newlines. */
export function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    out.push(row);
  }
  return out.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** Read-only CSV preview with paging. Empty cells read Unavailable, never 0. */
export function CsvReader({ name, rows, pageSize = 12, defaultHeader = true, sourceRows, maxHeight = "58dvh", className }: CsvReaderProps) {
  const [header, setHeader] = useState(defaultHeader);
  const [page, setPage] = useState(0);
  const offset = header && rows.length ? 1 : 0;
  const total = Math.max(0, rows.length - offset);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages - 1);
  const begin = current * pageSize + offset;
  const end = Math.min(rows.length, begin + pageSize);
  const columns = Math.max(0, ...rows.map((r) => r.length));
  const id = `csv-${name.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section aria-labelledby={`${id}-title`} className={cn("min-w-0 overflow-hidden rounded-[8px] border border-[#aab8ff22] bg-[#0d1020]", className)}>
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#aab8ff18] px-3 py-2">
        <h4 id={`${id}-title`} className="mr-auto font-mono text-[12px] text-ink">
          {name}
        </h4>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-ink-dim">
          <input
            type="checkbox"
            checked={header}
            onChange={(e) => {
              setHeader(e.target.checked);
              setPage(0);
            }}
            className="size-3.5 accent-[#aab8ff]"
          />
          First row contains headers
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="h-6 rounded-[6px]! border border-[#aab8ff2a] px-2 text-[11.5px] text-ink-dim transition-colors hover:text-ink disabled:opacity-40"
          >
            Previous rows
          </button>
          <span role="status" className="min-w-[84px] text-center font-mono text-[11px] tabular-nums text-ink-faint">
            {total ? `${begin - offset + 1} to ${end - offset} of ${total}` : "No rows"}
          </span>
          <button
            type="button"
            disabled={end >= rows.length}
            onClick={() => setPage(current + 1)}
            className="h-6 rounded-[6px]! border border-[#aab8ff2a] px-2 text-[11.5px] text-ink-dim transition-colors hover:text-ink disabled:opacity-40"
          >
            Next rows
          </button>
        </div>
      </header>
      <div
        role="region"
        tabIndex={0}
        aria-label={`${name} table; scroll horizontally for more columns`}
        className="scroll-thin overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full min-w-[520px] border-collapse font-mono text-[12px]">
          <caption className="sr-only">
            {name} · {total} preview rows
          </caption>
          <thead className="sticky top-0 z-10">
            <tr>
              <th scope="col" className="w-12 border-b border-r border-[#aab8ff13] bg-[#1a213a] px-2.5 py-1.5 text-right font-normal text-ink-faint">
                Row
              </th>
              {Array.from({ length: columns }, (_, c) => (
                <th
                  key={c}
                  scope="col"
                  className="whitespace-nowrap border-b border-r border-[#aab8ff13] bg-[#1a213a] px-3 py-1.5 text-left font-medium text-ink last:border-r-0"
                >
                  {offset ? rows[0]?.[c] || `Column ${c + 1}` : `Column ${c + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(begin, end).map((r, i) => (
              <tr key={begin + i} className={cn("transition-colors hover:bg-[#aab8ff10]", i % 2 === 1 && "bg-[#aab8ff08]")}>
                <th scope="row" className="border-b border-r border-[#aab8ff13] px-2.5 py-1 text-right font-normal tabular-nums text-ink-faint">
                  {begin - offset + i + 1}
                </th>
                {Array.from({ length: columns }, (_, c) => {
                  const v = r[c] ?? "";
                  const num = NUMERIC.test(v);
                  return (
                    <td
                      key={c}
                      className={cn(
                        "whitespace-nowrap border-b border-r border-[#aab8ff13] px-3 py-1 last:border-r-0",
                        num ? "text-right tabular-nums text-ink" : "text-ink-dim",
                      )}
                    >
                      {v === "" ? <span className="text-[11px] italic text-ink-faint">{UNAVAILABLE}</span> : v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sourceRows !== undefined && sourceRows > rows.length ? (
        <p className="border-t border-[#aab8ff18] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          Truncated preview · first {total} of {sourceRows - offset} rows
        </p>
      ) : null}
    </section>
  );
}
