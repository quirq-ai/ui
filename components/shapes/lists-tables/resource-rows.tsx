"use client";

// Live resource rows: SourceGroup and SourceRow (galileo port and files sources with Open
// and Remove), PollingNote (the "checked 3s ago · every 5 s" line), ProjectRow (catalog row
// that opens into a three panel drawer) and FolderRow (folder app list row, locked when
// inaccessible). Rows share one anatomy: dot, name with mono detail, state text, actions.
import { useId, type ReactNode } from "react";
import { ChevronRight, Folder, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDot } from "@/components/ui/status";
import { toneSoft, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- sources */

export type SourceState = "answering" | "not answering" | "folder" | "file" | "missing";

export type SourceRowData = {
  name: string;
  /** localhost:4173 for ports, the path for files */
  detail: string;
  state: SourceState;
  /** the source's own origin */
  href: string;
};

const pill =
  "inline-flex h-[26px] items-center rounded-full! border border-hair bg-transparent px-[11px] text-[12.5px] text-ink-dim transition-colors disabled:pointer-events-none disabled:opacity-45";

export type SourceRowProps = {
  source: SourceRowData;
  onOpen?: (s: SourceRowData) => void;
  onRemove?: (s: SourceRowData) => void;
  /** DELETE in flight: Remove is disabled. */
  removing?: boolean;
  /** Error from the last remove attempt. */
  error?: string | null;
};

/** One galileo source: dot, name, mono detail, state, Open and Remove. */
export function SourceRow({ source, onOpen, onRemove, removing = false, error }: SourceRowProps) {
  const up = source.state === "answering" || source.state === "folder" || source.state === "file";
  return (
    <li className="@container border-b border-hair-soft last:border-b-0">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 px-3.5 py-3 @min-[560px]:grid-cols-[auto_minmax(90px,max-content)_minmax(0,1fr)_auto_auto]">
        <StatusDot status={up ? "up" : "down"} label={up ? `${source.name} is ${source.state}` : `${source.name}: ${source.state}`} />
        <a
          href={source.href}
          onClick={(e) => {
            if (onOpen) {
              e.preventDefault();
              onOpen(source);
            }
          }}
          className="min-w-0 truncate rounded-[4px]! text-[14px] font-[650] text-ink transition-colors hover:text-[#83d63a]"
        >
          {source.name}
        </a>
        <span className="col-start-2 row-start-2 min-w-0 truncate font-mono text-[12.5px] text-ink-faint @min-[560px]:col-start-auto @min-[560px]:row-start-auto">
          {source.detail}
          <span className={cn("font-sans @min-[560px]:hidden", !up && "text-[#e06c5a]")}> · {source.state}</span>
        </span>
        <span className={cn("whitespace-nowrap text-[13px] @max-[560px]:hidden", up ? "text-ink-dim" : "text-[#e06c5a]")}>{source.state}</span>
        <span className="col-start-3 row-span-2 row-start-1 flex items-center gap-1.5 @min-[560px]:col-start-auto @min-[560px]:row-span-1 @min-[560px]:row-start-auto">
          <a
            href={source.href}
            onClick={(e) => {
              if (onOpen) {
                e.preventDefault();
                onOpen(source);
              }
            }}
            className={cn(pill, "hover:border-[#83d63a] hover:text-[#83d63a]")}
          >
            Open
          </a>
          {onRemove ? (
            <button
              type="button"
              disabled={removing}
              aria-label={`Remove ${source.name}`}
              onClick={() => onRemove(source)}
              className={cn(pill, "hover:border-[#e06c5a] hover:text-[#e06c5a]")}
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          ) : null}
        </span>
      </div>
      {error ? (
        <p role="alert" className="px-3.5 pb-3 pl-[34px] text-[12px] text-[#e06c5a]">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export type SourceGroupProps = {
  title: string;
  /** Shown as a single muted row when the group has no sources. */
  emptyText: string;
  children?: ReactNode;
  count?: number;
  /** Right side of the heading, such as the polling note. */
  aside?: ReactNode;
  className?: string;
};

/** "Ports" or "Files": uppercase heading, then the rounded list. */
export function SourceGroup({ title, emptyText, children, count, aside, className }: SourceGroupProps) {
  const id = useId();
  const empty = count === 0;
  return (
    <section aria-labelledby={id} className={cn("min-w-0", className)}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 id={id} className="text-[12px] font-[650] uppercase tracking-[0.06em] text-ink-faint">
          {title}
        </h4>
        {aside}
      </div>
      <ul className="overflow-hidden rounded-[12px] border border-hair bg-[#111310]">
        {empty ? <li className="p-3.5 text-[14px] text-ink-dim">{emptyText}</li> : children}
      </ul>
    </section>
  );
}

/** "● Checked 3s ago · polls every 5 s while visible". Not a live region: it ticks too often to announce. */
export function PollingNote({ checked, every, active = true }: { checked: string; every: string; active?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
      <StatusDot status={active ? "busy" : "idle"} size="xs" pulse={active} halo={false} />
      <span>Checked {checked}</span>
      <span aria-hidden="true">·</span>
      <span>{active ? `polls every ${every}` : "polling paused"}</span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- ProjectRow */

export type ProjectRowData = {
  id: string;
  name: string;
  /** mono second label, such as the repo */
  slug: string;
  description: string;
  live: boolean;
  /** short counts line, such as "83 files · 18 sessions" */
  counts: string;
  lastActive: string;
  tone: Tone;
};

export type ProjectRowProps = {
  project: ProjectRowData;
  open?: boolean;
  onToggle?: (id: string) => void;
  /** Drawer content shown when open. */
  drawer?: ReactNode;
  /** Paint the hover look (static demos). */
  hover?: boolean;
};

/** Project catalog row: chevron, name and id, LIVE pill, counts, last active. Opens a drawer. */
export function ProjectRow({ project, open = false, onToggle, drawer, hover = false }: ProjectRowProps) {
  const drawerId = useId();
  return (
    <li
      className={cn(
        "@container rounded-[12px] border bg-s2 transition-colors",
        open ? "border-white/[0.24] bg-s3" : hover ? "border-hair" : "border-hair-soft hover:border-hair",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open && drawer ? drawerId : undefined}
        onClick={() => onToggle?.(project.id)}
        className="group/p grid w-full grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-[12px]! px-3.5 py-3 text-left @min-[640px]:grid-cols-[14px_minmax(0,1fr)_72px_180px_80px]"
      >
        <ChevronRight aria-hidden="true" className={cn("size-3.5 text-ink-faint transition-transform duration-150", open && "rotate-90")} />
        <span className="min-w-0">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className={cn("truncate text-[14px] font-medium transition-colors group-hover/p:text-[#83d63a]", hover ? "text-[#83d63a]" : "text-ink")}>{project.name}</span>
            <span className="truncate font-mono text-[11px] text-ink-faint">{project.slug}</span>
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-ink-dim">{project.description}</span>
        </span>
        <span className="justify-self-end @min-[640px]:justify-self-start">
          {project.live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-grn/30 bg-grn/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-grn">
              <StatusDot status="up" size="xs" halo={false} pulse />
              Live
            </span>
          ) : (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">Idle</span>
          )}
        </span>
        <span className="col-start-2 whitespace-nowrap font-mono text-[11.5px] tabular-nums text-ink-faint @min-[640px]:col-start-auto">
          {project.counts}
        </span>
        <span className="col-start-3 row-start-2 text-right font-mono text-[11.5px] tabular-nums text-ink-faint @min-[640px]:col-start-auto @min-[640px]:row-start-auto">
          {project.lastActive}
        </span>
      </button>
      {open && drawer ? (
        <div id={drawerId} className="border-t border-hair-soft px-3.5 pb-3.5 pt-3">
          {drawer}
        </div>
      ) : null}
    </li>
  );
}

/** 52px shimmer placeholders while the project catalog loads. */
export function ProjectRowSkeletons({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="skeleton h-[52px] rounded-[12px]!" />
      ))}
    </ul>
  );
}

/** Small titled panel used inside the project drawer. */
export function DrawerPanel({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-[10px] border border-hair-soft bg-black/30 p-3">
      <h5 className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {title}
        {count !== undefined ? <span className="tabular-nums">{count}</span> : null}
      </h5>
      <div className="text-[12.5px] text-ink-dim">{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- FolderRow */

export type FolderRowData = {
  id: string;
  name: string;
  /** description, or null while the project is still being scaffolded */
  description: string | null;
  tone: Tone;
  /** you cannot open it (not shared with you) */
  locked?: boolean;
  badge?: ReactNode;
};

/** Folder app list row: tinted folder tile, name, description, Open pill or lock. */
export function FolderRow({ folder, onOpen }: { folder: FolderRowData; onOpen?: (f: FolderRowData) => void }) {
  const content = (
    <>
      <span aria-hidden="true" className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] border", toneSoft[folder.tone])}>
        <Folder className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium text-ink">{folder.name}</span>
          {folder.badge}
        </span>
        <span className={cn("block truncate text-[12px] text-ink-faint", !folder.description && "italic")}>
          {folder.description ?? "Scaffolded, awaiting finalization"}
        </span>
      </span>
      {folder.locked ? (
        <span className="inline-flex items-center gap-1 text-[12px] text-ink-faint">
          <Lock aria-hidden="true" className="size-3.5" />
          <span className="max-sm:sr-only">No access</span>
          <span className="sr-only">: not shared with you</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-blu/15 px-2.5 py-1 text-[12px] font-medium text-blu transition-colors group-hover/f:bg-blu/25">
          Open
          <ChevronRight aria-hidden="true" className="size-3.5" />
        </span>
      )}
    </>
  );
  return (
    <li className="border-b border-hair-soft last:border-b-0">
      {folder.locked ? (
        <div className="flex items-center gap-3 px-3.5 py-2.5 opacity-75">
          {content}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpen?.(folder)}
          className="group/f flex w-full items-center gap-3 rounded-none! px-3.5 py-2.5 transition-colors hover:bg-white/[0.03]"
        >
          {content}
        </button>
      )}
    </li>
  );
}
