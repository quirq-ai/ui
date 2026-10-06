"use client";

// Collection tables built on DataTable: SpacesTable (XO Swarm spaces, with a mobile card
// layout, copy ID, delete with a row busy state and a pending status) and FilesTable (files
// and links added to a space, with loading, empty, error and opening states).
import type { ReactNode } from "react";
import { ExternalLink, FileText, FolderOpen, Link2, RotateCw, Trash2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import type { RuntimeId, SpaceStatus } from "@/lib/fixtures";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { LoadingLine, Skeleton } from "@/components/ui/loaders";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import { StateChip, StatusDot } from "@/components/ui/status";
import { DataTable, type DataColumn } from "./data-table";
import { logoFor } from "./demo-kit";

/* ----------------------------------------------------------------------------- SpacesTable */

export type SpaceTableRow = {
  id: string;
  name: string;
  host: string;
  /** personal: you own it; shared: someone shared it with you */
  role: "personal" | "shared";
  runtime: RuntimeId;
  /** null while the status read is in flight */
  status: SpaceStatus | "failed" | null;
};

export type SpacesTableProps = {
  rows: SpaceTableRow[];
  loading?: boolean;
  /** table, cards, or table on wide screens and cards under 640px */
  layout?: "auto" | "table" | "cards";
  onOpen?: (row: SpaceTableRow) => void;
  /** Shows the delete action when set. */
  onDelete?: (row: SpaceTableRow) => void;
  /** Row whose delete is in flight. */
  busyId?: string | null;
  activeId?: string | null;
  emptyText?: ReactNode;
  /** Table width before it scrolls sideways. */
  minWidth?: number;
  className?: string;
};

function SpaceStatusCell({ status }: { status: SpaceTableRow["status"] }) {
  if (status === null) {
    return (
      <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-faint" aria-label="Status loading">
        <StatusDot status="idle" pulse />
        <span aria-hidden="true" className="pulse rounded-full font-mono">
          …
        </span>
      </span>
    );
  }
  const state = status === "failed" ? "failed" : (status.toLowerCase() as Lowercase<SpaceStatus>);
  return <StateChip kind="space" state={state} />;
}

function RoleBadge({ role }: { role: SpaceTableRow["role"] }) {
  return (
    <Badge tone={role === "personal" ? "grn" : "neutral"} mono size="sm">
      {role}
    </Badge>
  );
}

function SpaceActions({ row, onDelete, busy }: { row: SpaceTableRow; onDelete?: (r: SpaceTableRow) => void; busy: boolean }) {
  return (
    <div data-row-stop className="flex items-center justify-end gap-1">
      <CopyButton text={row.id} variant="pill" size="sm" label="Copy ID" aria-label={`Copy space ID for ${row.name}`} announce="Space ID copied" />
      {onDelete ? (
        <IconButton aria-label={`Delete space ${row.name}`} variant="danger" size="sm" loading={busy} tip onClick={() => onDelete(row)}>
          <Trash2 />
        </IconButton>
      ) : null}
    </div>
  );
}

/** Spaces you own or were shared, with status, runtime and row actions. */
export function SpacesTable({ rows, loading = false, layout = "auto", onOpen, onDelete, busyId = null, activeId, emptyText = "No spaces found.", minWidth = 620, className }: SpacesTableProps) {
  const columns: DataColumn<SpaceTableRow>[] = [
    {
      id: "name",
      header: "Name",
      rowHeader: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex min-w-0 flex-col">
          <span className="font-medium text-ink">{r.name}</span>
          <span className="truncate font-mono text-[11px] text-ink-faint">{r.host}</span>
        </span>
      ),
    },
    { id: "role", header: "Role", sortValue: (r) => r.role, cell: (r) => <RoleBadge role={r.role} /> },
    { id: "runtime", header: "Runtime", sortValue: (r) => r.runtime, cell: (r) => <RuntimeTag id={logoFor(r.runtime)} /> },
    { id: "status", header: "Status", sortValue: (r) => r.status ?? null, cell: (r) => <SpaceStatusCell status={r.status} /> },
    {
      id: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (r) => <SpaceActions row={r} onDelete={onDelete} busy={busyId === r.id} />,
    },
  ];

  const table = (
    <DataTable
      label="Spaces"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      loading={loading}
      loadingRows={3}
      empty={loading ? undefined : emptyText}
      caption={loading ? <span role="status">Loading spaces…</span> : undefined}
      onRowOpen={onOpen}
      rowOpenLabel={(r) => `Open space ${r.name}`}
      activeKey={activeId}
      mutedKey={(r) => busyId === r.id}
      minWidth={minWidth}
      defaultSort={{ id: "name", dir: "asc" }}
    />
  );

  const cards = (
    <div className="flex flex-col gap-2">
      {loading ? (
        <>
          <p role="status" className="px-1 text-[12px] text-ink-faint">
            Loading spaces…
          </p>
          {[0, 1].map((i) => (
            <div key={i} className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-3.5">
              <Skeleton width="45%" height={12} radius={4} />
              <Skeleton width="70%" height={9} radius={4} className="mt-2" />
              <Skeleton width="38%" height={18} radius={6} className="mt-3" />
            </div>
          ))}
        </>
      ) : rows.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-hair px-4 py-6 text-center text-[13px] text-ink-faint">{emptyText}</p>
      ) : (
        rows.map((r) => (
          <article
            key={r.id}
            aria-label={r.name}
            className={cn(
              "rounded-[14px] border border-hair-soft bg-[#0f0f11] p-3.5 transition-colors hover:border-hair",
              activeId === r.id && "border-hair-strong",
              busyId === r.id && "opacity-55",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {onOpen ? (
                  <button type="button" onClick={() => onOpen(r)} className="rounded-[4px]! text-left text-[14px] font-medium text-ink hover:underline hover:underline-offset-4">
                    {r.name}
                  </button>
                ) : (
                  <h4 className="text-[14px] font-medium text-ink">{r.name}</h4>
                )}
                <p className="truncate font-mono text-[11px] text-ink-faint">{r.host}</p>
              </div>
              <SpaceStatusCell status={r.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RoleBadge role={r.role} />
              <RuntimeTag id={logoFor(r.runtime)} />
              <div className="ml-auto">
                <SpaceActions row={r} onDelete={onDelete} busy={busyId === r.id} />
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );

  if (layout === "table") return <div className={className}>{table}</div>;
  if (layout === "cards") return <div className={className}>{cards}</div>;
  return (
    <div className={className}>
      <div className="max-sm:hidden">{table}</div>
      <div className="sm:hidden">{cards}</div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- FilesTable */

export type FileTableRow = {
  id: string;
  name: string;
  /** short type tag: pdf, md, ts, json, csv, link */
  type: string;
  size: number | null;
  added: string;
  /** links open in a new tab; files open through a signed URL */
  href?: string;
};

export type FilesTableProps = {
  rows: FileTableRow[];
  state?: "ready" | "loading" | "error";
  onOpen?: (row: FileTableRow) => void;
  /** File whose signed URL is being fetched. */
  openingId?: string | null;
  onRetry?: () => void;
  errorText?: string;
  className?: string;
};

/** Files and links added to a space. Links open externally; files open through Open. */
export function FilesTable({ rows, state = "ready", onOpen, openingId = null, onRetry, errorText = "Could not load files. The space did not answer.", className }: FilesTableProps) {
  if (state === "loading") {
    return (
      <div className={cn("flex min-h-[180px] items-center justify-center rounded-[14px] border border-hair-soft bg-[#0f0f11]", className)}>
        <LoadingLine>Loading files…</LoadingLine>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div role="alert" className={cn("flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-[14px] border border-red/25 bg-red/[0.04] px-4 text-center", className)}>
        <TriangleAlert aria-hidden="true" className="size-5 text-red" />
        <p className="text-[13px] text-ink-dim">{errorText}</p>
        {onRetry ? (
          <Button size="sm" variant="secondary" leadingIcon={<RotateCw />} onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className={cn("flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-hair-strong bg-s1/70 px-4 text-center", className)}>
        <FolderOpen aria-hidden="true" className="size-6 text-ink-faint" />
        <p className="text-[14px] font-medium text-ink">No files yet</p>
        <p className="max-w-[36ch] text-[12.5px] text-ink-faint">Add a file or a link and agents in this space can read it.</p>
      </div>
    );
  }
  const columns: DataColumn<FileTableRow>[] = [
    {
      id: "type",
      header: "Type",
      width: 72,
      sortValue: (r) => r.type,
      cell: (r) => (
        <Badge mono size="xs" tone={r.type === "link" ? "blu" : "neutral"} icon={r.type === "link" ? <Link2 /> : <FileText />}>
          {r.type}
        </Badge>
      ),
    },
    {
      id: "name",
      header: "Name",
      rowHeader: true,
      sortValue: (r) => r.name.toLowerCase(),
      cell: (r) => <span className="block max-w-[420px] truncate font-medium text-ink">{r.name}</span>,
    },
    { id: "size", header: "Size", numeric: true, hideBelow: "sm", sortValue: (r) => r.size, cell: (r) => (r.type === "link" ? <span className="text-ink-faint">Link</span> : formatBytes(r.size)) },
    { id: "added", header: "Added", hideBelow: "md", cell: (r) => <span className="whitespace-nowrap text-ink-faint">{r.added}</span> },
    {
      id: "open",
      header: "Open",
      srOnlyHeader: true,
      align: "right",
      cell: (r) =>
        r.type === "link" && r.href ? (
          <a
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            data-row-stop
            aria-label={`Open link ${r.name} (opens in a new tab)`}
            className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[8px]! border border-hair bg-s2 px-2.5 text-[12px] text-ink transition-colors hover:border-hair-strong hover:bg-s3"
          >
            Open link <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        ) : (
          <span data-row-stop>
            <Button
              size="sm"
              variant="secondary"
              loading={openingId === r.id}
              loadingLabel="Opening…"
              aria-label={`Open ${r.name}`}
              onClick={() => onOpen?.(r)}
            >
              Open
            </Button>
          </span>
        ),
    },
  ];
  return (
    <DataTable
      className={className}
      label="Files"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      minWidth={330}
      defaultSort={{ id: "name", dir: "asc" }}
    />
  );
}
