"use client";

// Pagination for tables and articles:
//  Pagination    ‹ Previous 1 … 3 [4] 5 … 12 Next ›  with an optional PAGE 4 OF 12 summary;
//                labels hide under 640px; disabled ends use aria-disabled
//  TablePager    Rows per page [10] · Page 1 of 3 · first, previous, next, last
//  PrevNextPager previous and next article cards with a nudging chevron
//  pageRange     the numbers and ellipses to show for a page
// Paging is client state: callers slice data they already hold, nothing refetches.
import type { MouseEvent, ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Ellipsis } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button";
import { Select } from "@/components/ui/field";

export type PageToken = number | "gap-start" | "gap-end";

/** Pages to render, as the space dashboard windows them: first, last, the current page with
    `siblings` on each side, and an ellipsis wherever pages are skipped (1 … 3 [4] 5 … 12). */
export function pageRange(page: number, count: number, siblings = 1): PageToken[] {
  if (count <= 0) return [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  const out: PageToken[] = [1];
  if (start > 2) out.push("gap-start");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < count - 1) out.push("gap-end");
  if (count > 1) out.push(count);
  return out;
}

const pageBtn =
  "inline-flex h-7 min-w-8 items-center justify-center gap-1 rounded-[8px]! border px-2 text-[12.5px] font-medium tabular-nums transition-colors [&_svg]:size-4";

export type PaginationProps = {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  /** Show the mono PAGE 4 OF 12 readout. */
  showSummary?: boolean;
  hrefFor?: (page: number) => string;
  "aria-label"?: string;
  className?: string;
};

/** Numbered pager with Previous and Next. */
export function Pagination({ page, pageCount, onPageChange, siblings = 1, showSummary = false, hrefFor, "aria-label": ariaLabel = "Pagination", className }: PaginationProps) {
  const href = (p: number) => (hrefFor ? hrefFor(p) : `#page-${p}`);
  const go = (p: number) => (e: MouseEvent) => {
    e.preventDefault();
    if (p < 1 || p > pageCount || p === page) return;
    onPageChange(p);
  };
  const atStart = page <= 1;
  const atEnd = page >= pageCount;
  return (
    <nav aria-label={ariaLabel} className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-2", className)}>
      <ul className="flex items-center gap-1">
        <li>
          <a
            href={href(page - 1)}
            aria-label="Go to previous page"
            aria-disabled={atStart || undefined}
            tabIndex={atStart ? -1 : undefined}
            onClick={go(page - 1)}
            className={cn(pageBtn, "border-transparent px-2.5 text-ink-dim hover:bg-s3 hover:text-ink", atStart && "pointer-events-none opacity-40")}
          >
            <ChevronLeft aria-hidden="true" />
            <span className="max-sm:hidden">Previous</span>
          </a>
        </li>
        {pageRange(page, pageCount, siblings).map((t) =>
          typeof t === "number" ? (
            <li key={t}>
              <a
                href={href(t)}
                aria-current={t === page ? "page" : undefined}
                aria-label={`Page ${t}`}
                onClick={go(t)}
                className={cn(
                  pageBtn,
                  t === page ? "border-hair-strong bg-white/[0.04] text-ink" : "border-transparent text-ink-dim hover:bg-s3 hover:text-ink",
                )}
              >
                {t}
              </a>
            </li>
          ) : (
            <li key={t}>
              <span aria-hidden="true" className="flex size-8 items-center justify-center text-ink-faint [&_svg]:size-4">
                <Ellipsis />
              </span>
              <span className="sr-only">More pages</span>
            </li>
          ),
        )}
        <li>
          <a
            href={href(page + 1)}
            aria-label="Go to next page"
            aria-disabled={atEnd || undefined}
            tabIndex={atEnd ? -1 : undefined}
            onClick={go(page + 1)}
            className={cn(pageBtn, "border-transparent px-2.5 text-ink-dim hover:bg-s3 hover:text-ink", atEnd && "pointer-events-none opacity-40")}
          >
            <span className="max-sm:hidden">Next</span>
            <ChevronRight aria-hidden="true" />
          </a>
        </li>
      </ul>
      {showSummary ? (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint" aria-live="polite">
          Page <span className="tabular-nums text-ink">{page}</span> of <span className="tabular-nums">{pageCount}</span>
        </p>
      ) : null}
    </nav>
  );
}

/* ----------------------------------------------------------------------------- TablePager */

export type TablePagerProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizes?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  /** Phone: no first and last buttons, no "Rows per page" words. */
  compact?: boolean;
  /** Left side: "24 sessions". */
  summary?: ReactNode;
  className?: string;
};

/** Table footer pager: rows per page, page position and four step buttons. */
export function TablePager({
  page,
  pageCount,
  pageSize,
  pageSizes = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
  compact = false,
  summary,
  className,
}: TablePagerProps) {
  const atStart = page <= 1;
  const atEnd = page >= pageCount;
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-2", className)}>
      {summary ? <div className="text-[12.5px] text-ink-faint">{summary}</div> : <span />}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 whitespace-nowrap text-[12.5px] font-medium text-ink-dim">
            <span className={cn(compact && "sr-only")}>Rows per page</span>
            <span className="block w-[76px] shrink-0">
              <Select size="sm" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                {pageSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </span>
          </label>
        ) : null}
        <p className="whitespace-nowrap text-[12.5px] font-medium tabular-nums text-ink" aria-live="polite">
          Page {page} of {pageCount}
        </p>
        <div className="flex items-center gap-1.5" role="group" aria-label="Change page">
          {compact ? null : (
            <IconButton aria-label="Go to first page" variant="outline" disabled={atStart} onClick={() => onPageChange(1)}>
              <ChevronsLeft />
            </IconButton>
          )}
          <IconButton aria-label="Go to previous page" variant="outline" disabled={atStart} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft />
          </IconButton>
          <IconButton aria-label="Go to next page" variant="outline" disabled={atEnd} onClick={() => onPageChange(page + 1)}>
            <ChevronRight />
          </IconButton>
          {compact ? null : (
            <IconButton aria-label="Go to last page" variant="outline" disabled={atEnd} onClick={() => onPageChange(pageCount)}>
              <ChevronsRight />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- PrevNextPager */

export type PagerLink = { title: string; href: string };

/** Previous and next article cards. Either side may be missing; next stays on the right. */
export function PrevNextPager({
  previous,
  next,
  onNavigate,
  "aria-label": ariaLabel = "Previous and next",
  className,
}: {
  previous?: PagerLink;
  next?: PagerLink;
  onNavigate?: (l: PagerLink) => void;
  "aria-label"?: string;
  className?: string;
}) {
  const card = (l: PagerLink, dir: "previous" | "next") => {
    const back = dir === "previous";
    return (
      <a
        href={l.href}
        rel={back ? "prev" : "next"}
        onClick={(e) => {
          if (!onNavigate) return;
          e.preventDefault();
          onNavigate(l);
        }}
        className={cn(
          "group flex min-w-0 items-center gap-4 rounded-[14px]! border border-hair-soft bg-[#0f0f11] px-5 py-5 transition-colors hover:border-white/20",
          back ? "" : "flex-row-reverse text-right @[560px]:col-start-2",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 text-ink-dim transition-transform duration-200 ease-quirq [&_svg]:size-4",
            back ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
          )}
        >
          {back ? <ChevronLeft /> : <ChevronRight />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-dim">{back ? "Previous" : "Next"}</span>
          <span className="mt-2 block truncate text-[15.5px] font-semibold text-ink">{l.title}</span>
        </span>
      </a>
    );
  };
  return (
    <nav aria-label={ariaLabel} className={cn("@container", className)}>
      <div className="grid gap-3 @[560px]:grid-cols-2">
        {previous ? card(previous, "previous") : null}
        {next ? card(next, "next") : null}
      </div>
    </nav>
  );
}
