"use client";

// DataTable: the sortable, paginated table behind spaces, sessions, files and ledgers.
// Mono uppercase head, tabular numerals, hairline rows, a focusable scroll region, sortable
// headers (aria-sort), whole-row open with a keyboard button in the row header, skeleton
// loading rows and an inline empty row. Also: Pager, TableToolbar and CSV export.
import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loaders";
import { SearchInput } from "@/components/ui/field";

export type SortDir = "asc" | "desc";
export type SortState = { id: string; dir: SortDir };

export type DataColumn<T> = {
  id: string;
  header: ReactNode;
  /** Keep the header for screen readers only (first cell of a comparison matrix). */
  srOnlyHeader?: boolean;
  /** Right aligned with tabular numerals. */
  numeric?: boolean;
  align?: "left" | "right";
  /** Sortable when a sortValue is given. */
  sortValue?: (row: T) => string | number | null;
  /** First sort direction when this header is chosen. Numbers usually start descending. */
  firstDir?: SortDir;
  cell: (row: T) => ReactNode;
  /** Render this column as the row header (th scope=row); it also carries the row open button. */
  rowHeader?: boolean;
  /** Hide the column below a breakpoint. */
  hideBelow?: "sm" | "md" | "lg";
  width?: number | string;
  className?: string;
};

/** app: Space dashboard tables; ledger: the roomier landing research and quarter ledger tables. CsvReader has its own look. */
export type TableLook = "app" | "ledger";
export type TableDensity = "compact" | "regular" | "roomy";

export type DataTableProps<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Accessible name for the table and its scroll region. */
  label: string;
  /** Visible caption under the table (counts, cost notes). */
  caption?: ReactNode;
  defaultSort?: SortState | null;
  /** Controlled sort. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Make the whole row open something (a detail panel, a page). */
  onRowOpen?: (row: T) => void;
  /** Accessible name of the row open button, such as "Open session df1a1a5b". */
  rowOpenLabel?: (row: T) => string;
  /** Id of the detail panel that row open toggles; adds aria-expanded and aria-controls. */
  rowDetailId?: string;
  /** Row that is open or selected. */
  activeKey?: string | null;
  /** Paint one row in its hover look (static demos). */
  hoverKey?: string | null;
  /** Rows to dim (closed items, done work). */
  mutedKey?: (row: T) => boolean;
  loading?: boolean;
  loadingRows?: number;
  /** Shown in a single row when there are no rows. */
  empty?: ReactNode;
  /** Horizontal scroll kicks in under this width. */
  minWidth?: number;
  look?: TableLook;
  density?: TableDensity;
  zebra?: boolean;
  stickyHeader?: boolean;
  /** Vertical scroll limit, such as "58dvh"; pair with stickyHeader. */
  maxHeight?: number | string;
  /** Draw the soft panel around the table. */
  framed?: boolean;
  className?: string;
};

const hide = { sm: "max-sm:hidden", md: "max-md:hidden", lg: "max-lg:hidden" } as const;

const headLook: Record<TableLook, string> = {
  app: "h-10 border-b border-hair font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-ink-faint",
  ledger: "border-b border-hair font-mono text-[9.5px] font-normal uppercase tracking-[0.16em] text-ink-dim",
};

const cellPad: Record<TableLook, Record<TableDensity, string>> = {
  app: { compact: "px-3 py-1.5", regular: "px-3 py-2.5", roomy: "px-4 py-3.5" },
  ledger: { compact: "px-4 py-3", regular: "px-5 py-4", roomy: "px-6 py-5" },
};

const headPad: Record<TableLook, string> = { app: "px-3", ledger: "px-5 py-4" };

const cellLook: Record<TableLook, string> = {
  app: "border-b border-hair-soft text-[13px] text-ink-dim",
  ledger: "border-b border-white/[0.05] text-[13px] text-ink-dim",
};

function compare(a: string | number | null, b: string | number | null, dir: SortDir): number {
  // missing values always sink to the bottom, whatever the direction
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const r = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "en-US");
  return dir === "asc" ? r : -r;
}

/** Sort rows with a column's sortValue. Stable; nulls last. */
export function sortRows<T>(rows: T[], columns: DataColumn<T>[], sort: SortState | null | undefined): T[] {
  if (!sort) return rows;
  const col = columns.find((c) => c.id === sort.id);
  if (!col?.sortValue) return rows;
  const get = col.sortValue;
  return rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => compare(get(x.row), get(y.row), sort.dir) || x.i - y.i)
    .map((x) => x.row);
}

/** Sortable data table with optional whole-row open. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  label,
  caption,
  defaultSort = null,
  sort: sortProp,
  onSortChange,
  onRowOpen,
  rowOpenLabel,
  rowDetailId,
  activeKey,
  hoverKey,
  mutedKey,
  loading = false,
  loadingRows = 4,
  empty,
  minWidth = 560,
  look = "app",
  density = "regular",
  zebra = false,
  stickyHeader = false,
  maxHeight,
  framed = true,
  className,
}: DataTableProps<T>) {
  const [innerSort, setInnerSort] = useState<SortState | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : innerSort;
  const sorted = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);
  const headerIndex = Math.max(0, columns.findIndex((c) => c.rowHeader));

  function toggleSort(col: DataColumn<T>) {
    const next: SortState =
      sort && sort.id === col.id ? { id: col.id, dir: sort.dir === "asc" ? "desc" : "asc" } : { id: col.id, dir: col.firstDir ?? "asc" };
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
  }

  function onRowClick(e: MouseEvent<HTMLTableRowElement>, row: T) {
    if (!onRowOpen) return;
    const target = e.target as HTMLElement;
    // controls inside a row (copy, delete, links) keep their own click
    if (target.closest("[data-row-stop], a[href]")) return;
    onRowOpen(row);
  }

  return (
    <div
      className={cn(
        "min-w-0",
        framed && "rounded-[14px] border border-hair-soft bg-[#0f0f11] p-1.5",
        className,
      )}
    >
      {/* focusable so keyboard users can scroll wide tables sideways */}
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn("scroll-thin relative overflow-x-auto", maxHeight !== undefined && "overflow-y-auto")}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        <table
          className="w-full border-collapse text-left"
          style={{ minWidth }}
          aria-busy={loading || undefined}
          aria-label={label}
        >
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr>
              {columns.map((col) => {
                const active = sort?.id === col.id;
                const right = col.numeric || col.align === "right";
                const sortable = Boolean(col.sortValue) && !loading;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : sortable ? "none" : undefined}
                    className={cn(
                      "whitespace-nowrap align-middle",
                      headLook[look],
                      look === "ledger" ? cellPad.ledger[density] : headPad[look],
                      right && "text-right",
                      col.hideBelow && hide[col.hideBelow],
                    )}
                    style={col.width !== undefined ? { width: col.width } : undefined}
                  >
                    {col.srOnlyHeader ? (
                      <span className="sr-only">{col.header}</span>
                    ) : sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className={cn(
                          "group/sort -mx-1.5 inline-flex items-center gap-1.5 rounded-[6px]! px-1.5 py-1 uppercase transition-colors hover:bg-white/[0.05] hover:text-ink",
                          right && "flex-row-reverse",
                          active && "text-ink",
                        )}
                      >
                        <span>{col.header}</span>
                        {active ? (
                          sort!.dir === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3" />
                          ) : (
                            <ArrowDown aria-hidden="true" className="size-3" />
                          )
                        ) : (
                          <ArrowUpDown aria-hidden="true" className="size-3 opacity-45 group-hover/sort:opacity-90" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }, (_, r) => (
                  <tr key={`sk-${r}`}>
                    {columns.map((col, c) => (
                      <td
                        key={col.id}
                        className={cn(cellLook[look], cellPad[look][density], col.hideBelow && hide[col.hideBelow])}
                      >
                        <Skeleton
                          height={10}
                          radius={4}
                          className={cn((col.numeric || col.align === "right") && "ml-auto")}
                          width={c === headerIndex ? `${62 + ((r * 13) % 30)}%` : col.numeric ? 44 : `${48 + ((r * 7 + c * 11) % 36)}%`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-[13px] text-ink-dim">
                      {empty ?? "No rows."}
                    </td>
                  </tr>
                )
                : sorted.map((row, r) => {
                    const key = rowKey(row);
                    const active = activeKey === key;
                    const muted = mutedKey?.(row) ?? false;
                    return (
                      <tr
                        key={key}
                        data-state={active ? "selected" : undefined}
                        onClick={onRowOpen ? (e) => onRowClick(e, row) : undefined}
                        className={cn(
                          "transition-colors duration-150",
                          "hover:bg-white/[0.025]",
                          zebra && r % 2 === 1 && "bg-white/[0.022]",
                          hoverKey === key && "bg-white/[0.035]",
                          active && "bg-white/[0.05] hover:bg-white/[0.06]",
                          onRowOpen && "cursor-pointer",
                          muted && "opacity-55",
                          "[&:last-child>*]:border-b-0",
                        )}
                      >
                        {columns.map((col, c) => {
                          const right = col.numeric || col.align === "right";
                          const Cell = col.rowHeader ? "th" : "td";
                          const content = col.cell(row);
                          return (
                            <Cell
                              key={col.id}
                              scope={col.rowHeader ? "row" : undefined}
                              className={cn(
                                "align-middle font-normal",
                                cellLook[look],
                                cellPad[look][density],
                                right && "text-right",
                                col.numeric && "font-mono text-[12px] tabular-nums",
                                col.rowHeader && "text-ink",
                                col.hideBelow && hide[col.hideBelow],
                                col.className,
                              )}
                            >
                              {onRowOpen && c === headerIndex ? (
                                <button
                                  type="button"
                                  data-row-open={key}
                                  aria-label={rowOpenLabel?.(row)}
                                  aria-expanded={rowDetailId ? active : undefined}
                                  aria-controls={rowDetailId && active ? rowDetailId : undefined}
                                  className="-mx-1 rounded-[6px]! px-1 text-left font-[inherit] text-[inherit] hover:text-ink"
                                >
                                  {content}
                                </button>
                              ) : (
                                content
                              )}
                            </Cell>
                          );
                        })}
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
      {caption ? (
        <div className="px-3 pb-2 pt-3 text-[12px] leading-relaxed text-ink-faint">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Pager */

export type PagerProps = {
  /** Zero based. */
  page: number;
  pages: number;
  onPage: (page: number) => void;
  /** Left side summary, such as "Showing 1 to 8 of 24". Leave it out when the table header already says it. */
  summary?: ReactNode;
  label?: string;
  className?: string;
};

/** Previous, numbered pages and next. Pages are buttons; the current one has aria-current. */
export function Pager({ page, pages, onPage, summary, label = "Pages", className }: PagerProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2", className)}>
      {summary ? (
        <p role="status" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          {summary}
        </p>
      ) : null}
      <nav aria-label={label} className="ml-auto flex items-center gap-1">
        <IconButton aria-label="Previous page" size="sm" variant="outline" disabled={page <= 0} onClick={() => onPage(page - 1)}>
          <ChevronLeft />
        </IconButton>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-current={i === page ? "page" : undefined}
            aria-label={`Page ${i + 1}`}
            onClick={() => onPage(i)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-[8px]! border font-mono text-[11.5px] tabular-nums transition-colors",
              i === page ? "border-hair-strong bg-s3 text-ink" : "border-transparent text-ink-dim hover:bg-s2 hover:text-ink",
            )}
          >
            {i + 1}
          </button>
        ))}
        <IconButton aria-label="Next page" size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          <ChevronRight />
        </IconButton>
      </nav>
    </div>
  );
}

/** "Showing 9 to 16 of 24" from a zero-based page. */
export function pageSummary(page: number, pageSize: number, total: number): string {
  if (total === 0) return "No rows";
  const start = page * pageSize + 1;
  const end = Math.min(total, start + pageSize - 1);
  return `Showing ${start} to ${end} of ${new Intl.NumberFormat("en-US").format(total)}`;
}

/* ----------------------------------------------------------------------------- Toolbar */

export type TableToolbarProps = {
  /** Search box value; omit to drop the search box. */
  query?: string;
  onQuery?: (q: string) => void;
  searchLabel?: string;
  placeholder?: string;
  /** Filters or chips after the search. */
  filters?: ReactNode;
  /** Actions on the right (Export CSV, Refresh). */
  actions?: ReactNode;
  className?: string;
};

/** Filter row above a table: search, filters, actions. Wraps on narrow screens. */
export function TableToolbar({ query, onQuery, searchLabel = "Search rows", placeholder, filters, actions, className }: TableToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {onQuery ? (
        <SearchInput
          size="sm"
          shape="field"
          aria-label={searchLabel}
          placeholder={placeholder}
          value={query ?? ""}
          onChange={(e) => onQuery(e.target.value)}
          className="w-full sm:w-[260px]"
        />
      ) : null}
      {filters}
      {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- CSV */

type CsvCell = string | number | null | undefined;

function csvCell(v: CsvCell): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Rows to RFC 4180 CSV text. Missing values are empty cells, never 0. */
export function toCsv(header: string[], rows: CsvCell[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
}

/** Saves CSV text as a file in the browser. Call from an event handler only. */
export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Export CSV button with a polite announcement of the file name. */
export function ExportCsvButton({
  filename,
  build,
  label = "Export CSV",
}: {
  filename: string;
  /** Builds the CSV for every row behind the table, not just the visible page. */
  build: () => string;
  label?: string;
}) {
  const [done, setDone] = useState<string | null>(null);
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        leadingIcon={<Download />}
        title="Download every row of this table as CSV"
        onClick={() => {
          downloadCsv(filename, build());
          setDone(`Downloaded ${filename}`);
        }}
      >
        {label}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {done}
      </span>
    </>
  );
}
