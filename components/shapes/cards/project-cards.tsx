// Project and app cards: ProjectCard (org board grid card that opens a project), its
// skeleton, ManageProjectCard (pin, expand, copy, activity, share, GitHub, remove),
// CommandCard (visualizer carousel card with metrics and a sparkline), RolloutCard (stage
// segments, expandable), RepoLinkCard and GatewayAppCard (galileo app with versions).
// Server-safe; state lives in the parent.
import type { ReactNode } from "react";
import { Activity, ChevronRight, Folder, FolderGit2, Share2, Star, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { AvatarGroup, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/loaders";
import { RuntimeLogo, RuntimeTag, type LogoAlias, type LogoId } from "@/components/ui/runtime-logo";
import { StatusDot } from "@/components/ui/status";
import { pluralize } from "@/lib/format";

/* ----------------------------------------------------------------------------- ProjectCard */

export type ProjectCardProps = {
  name: string;
  description?: string;
  /** null: no owner on the roster. */
  ownerName: string | null;
  /** A folder with no .xo/ yet. */
  unscaffolded?: boolean;
  peers: string[];
  liveCount: number;
  sessions: number;
  category?: { label: string; color: string };
  /** "12d ago", "Sep 28" */
  when: string;
  pinned?: boolean;
  /** The project is open in a tab. */
  open?: boolean;
  onOpen?: () => void;
  onShare?: () => void;
  className?: string;
};

/** Grid card: owner, name, description, then people, chips and time. The whole card opens the project. */
export function ProjectCard({ name, description, ownerName, unscaffolded = false, peers, liveCount, sessions, category, when, pinned, open, onOpen, onShare, className }: ProjectCardProps) {
  return (
    <article
      className={cn(
        "group/pc relative flex min-w-0 flex-col gap-3 rounded-[16px] border bg-s1 p-3.5 transition-colors duration-150",
        open ? "border-white/30 bg-s2" : "border-hair hover:border-white/20 hover:bg-s2",
        className,
      )}
    >
      <header className="flex min-w-0 items-center gap-2">
        {ownerName ? <Avatar name={ownerName} size="xs" decorative /> : <span aria-hidden="true" className="size-5 rounded-full border border-dashed border-hair-strong" />}
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-dim">{ownerName ?? (unscaffolded ? "Not set up yet" : "No owner set")}</span>
        {pinned ? <Star role="img" aria-label="Pinned" className="size-3.5 fill-current text-yel" /> : null}
        {onShare ? (
          <IconButton
            aria-label={`Share ${name}`}
            size="xs"
            onClick={onShare}
            className="relative z-10 opacity-0 transition-opacity group-hover/pc:opacity-100 focus-visible:opacity-100"
          >
            <Users />
          </IconButton>
        ) : null}
      </header>
      <div className="min-w-0">
        <h4 className="text-[14px] font-medium leading-snug text-ink">
          <button
            type="button"
            onClick={onOpen}
            aria-pressed={open}
            className="line-clamp-2 rounded-[4px]! text-left after:absolute after:inset-0 after:rounded-[16px] after:content-['']"
          >
            {name}
          </button>
        </h4>
        {unscaffolded ? (
          <p className="mt-1 text-[12px] text-ink-faint">
            A folder with no <code className="font-mono text-[11px]">.xo/</code> yet.
          </p>
        ) : description ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-ink-dim">{description}</p>
        ) : null}
      </div>
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2">
        {peers.length ? <AvatarGroup names={peers} size="xs" max={3} /> : <span className="text-[11px] text-ink-faint">Only you</span>}
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {liveCount > 0 ? (
            <Badge size="xs" tone="grn" dot>
              {liveCount} live
            </Badge>
          ) : null}
          <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{pluralize(sessions, "session")}</span>
          {category ? (
            <span className="inline-flex items-center gap-1 rounded-[3px] border border-hair px-1.5 text-[10px] text-ink-dim">
              <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: category.color }} />
              {category.label}
            </span>
          ) : null}
          <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{when}</span>
        </div>
      </footer>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 rounded-[16px] border border-hair bg-s1 p-3.5">
      <div className="flex items-center gap-2">
        <Skeleton width={20} height={20} radius={999} />
        <Skeleton width={80} height={10} />
      </div>
      <Skeleton width="72%" height={14} />
      <Skeleton height={10} />
      <div className="flex items-center justify-between">
        <Skeleton width={64} height={20} radius={999} />
        <Skeleton width={90} height={10} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- ManageProjectCard */

export type ManageProjectCardProps = {
  name: string;
  /** Project id, shown mono and copyable. */
  projectId: string;
  path: string;
  pinned: boolean;
  expanded: boolean;
  shareOpen?: boolean;
  githubUrl?: string | null;
  details: { term: string; value: ReactNode; wide?: boolean }[];
  /** Children of the expanded area after the metadata (share panel, notices). */
  children?: ReactNode;
  busy?: boolean;
  onTogglePin?: () => void;
  onToggleExpand?: () => void;
  onViewActivity?: () => void;
  onShare?: () => void;
  onRemove?: () => void;
  detailsId: string;
  className?: string;
};

/** Settings row card for one project: identity on the left, actions on the right, details below. */
export function ManageProjectCard({
  name,
  projectId,
  path,
  pinned,
  expanded,
  shareOpen = false,
  githubUrl,
  details,
  children,
  busy = false,
  onTogglePin,
  onToggleExpand,
  onViewActivity,
  onShare,
  onRemove,
  detailsId,
  className,
}: ManageProjectCardProps) {
  return (
    <article
      data-pinned={pinned || undefined}
      className={cn(
        "min-w-0 rounded-[12px] border bg-s2 px-5 py-[18px] transition-colors duration-150",
        expanded ? "border-blu/35" : "border-hair-soft hover:border-hair",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="group/tg flex min-h-[46px] min-w-0 items-center gap-3 rounded-[6px]! text-left"
          >
            <ChevronRight aria-hidden="true" className={cn("size-3.5 shrink-0 text-ink-faint transition-transform duration-150", expanded && "rotate-90 text-blu")} />
            <span aria-hidden="true" className="grid size-[38px] shrink-0 place-items-center rounded-[9px] border border-hair-soft bg-bg text-ink-dim">
              <Folder className="size-[19px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-medium text-ink group-hover/tg:text-blu">{name}</span>
              <code className="block truncate font-mono text-[12px] text-ink-faint">{projectId}</code>
            </span>
          </button>
          <span className="flex shrink-0 flex-col">
            <CopyButton text={projectId} size="sm" aria-label={`Copy project ID ${projectId}`} announce="Project ID copied" />
            <CopyButton text={path} size="sm" aria-label={`Copy path ${path}`} announce="Project path copied" />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-hair-soft pt-3 md:border-0 md:pt-0">
          <Button size="sm" leadingIcon={<Activity />} onClick={onViewActivity} disabled={busy}>
            View activity
          </Button>
          <Button
            size="sm"
            leadingIcon={<Share2 />}
            onClick={onShare}
            aria-expanded={shareOpen}
            disabled={busy}
            className={shareOpen ? "border-blu/60! text-blu!" : undefined}
          >
            Share
          </Button>
          <span className="flex items-center gap-1.5 border-l border-hair-soft pl-3">
            <IconButton aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`} variant="outline" active={pinned} onClick={onTogglePin} disabled={busy} tip>
              <Star />
            </IconButton>
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${name} on GitHub (opens in a new tab)`}
                className="grid size-8 place-items-center rounded-[8px]! border border-hair text-ink-dim transition-colors hover:border-hair-strong hover:bg-s3"
              >
                <RuntimeLogo id="github" size={15} decorative />
              </a>
            ) : null}
            <IconButton aria-label={`Remove ${name}`} variant="danger" onClick={onRemove} disabled={busy} tip>
              <Trash2 />
            </IconButton>
          </span>
        </div>
      </div>
      {expanded ? (
        <div id={detailsId} className="mt-[18px] border-t border-hair-soft pt-5">
          <dl className="grid gap-x-7 gap-y-4 sm:grid-cols-3">
            {details.map((d) => (
              <div key={d.term} className={cn("min-w-0", d.wide && "sm:col-span-3")}>
                <dt className="mb-1 text-[12px] text-ink-faint">{d.term}</dt>
                <dd className="min-w-0 break-words text-[13px] text-ink-dim">{d.value}</dd>
              </div>
            ))}
          </dl>
          {children}
        </div>
      ) : null}
    </article>
  );
}

/* ----------------------------------------------------------------------------- CommandCard */

export type CommandCardProps = {
  kicker: string;
  live: boolean;
  liveLabel?: string;
  title: string;
  metrics: { label: string; value: string }[];
  series: number[];
  footer: string;
  /** Front of the carousel: brighter border and glow. */
  front?: boolean;
  onOpen?: () => void;
  className?: string;
};

/** Visualizer command card: kicker, title, three mini metrics, sparkline, footer link. */
export function CommandCard({ kicker, live, liveLabel, title, metrics, series, footer, front = false, onOpen, className }: CommandCardProps) {
  const w = 420;
  const h = 84;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - 6 - ((v - min) / span) * (h - 14)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <article
      className={cn(
        "flex h-[300px] min-w-0 flex-col overflow-hidden rounded-[15px] border p-5 text-ink transition-[border-color,box-shadow,opacity] duration-300",
        "bg-[linear-gradient(145deg,#1c1d22_0%,#0a0a0d_100%)] shadow-[0_40px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
        front ? "border-pur/45 shadow-[0_50px_100px_rgba(0,0,0,0.55),0_0_42px_rgba(191,90,242,0.12)]" : "border-white/15",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint">
        <span className="truncate">{kicker}</span>
        <span className={cn("flex shrink-0 items-center gap-1.5", live ? "text-grn" : "text-ink-faint")}>
          <StatusDot status={live ? "up" : "idle"} size="xs" pulse={live} />
          {liveLabel ?? (live ? "Live" : "Idle")}
        </span>
      </div>
      <h4 className="mb-4 mt-3 truncate text-[21px] font-semibold">{title}</h4>
      <dl className="grid grid-cols-3 gap-[7px]">
        {metrics.map((m) => (
          <div key={m.label} className="min-w-0 rounded-[8px] border border-white/[0.07] bg-black/25 px-2.5 py-2">
            <dt className="mb-1 truncate font-mono text-[8px] uppercase tracking-[0.08em] text-ink-faint">{m.label}</dt>
            <dd className="truncate text-[15px] tabular-nums">{m.value}</dd>
          </div>
        ))}
      </dl>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2 h-[72px] w-full" aria-hidden="true">
        <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="rgba(191,90,242,0.12)" />
        <path d={line} fill="none" stroke="var(--pur)" strokeOpacity="0.8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <button
        type="button"
        onClick={onOpen}
        tabIndex={front ? 0 : -1}
        className="mt-auto flex min-w-0 items-center justify-between gap-3 rounded-[4px]! border-t border-white/[0.07] pt-2.5 text-left font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint hover:text-ink"
      >
        <span className="truncate">{footer}</span>
        <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
      </button>
    </article>
  );
}

/* ----------------------------------------------------------------------------- RolloutCard */

export type RolloutCardProps = {
  name: string;
  /** Category tint as a CSS color. */
  color: string;
  stage: string;
  /** 1 to total, how many stage segments are filled. */
  stageIndex: number;
  stageTotal?: number;
  ago: string;
  description: string;
  metrics: { label: string; value: string }[];
  runtime: LogoId | LogoAlias;
  expanded: boolean;
  onToggle?: () => void;
  onMore?: () => void;
  panelId: string;
  className?: string;
};

/** Compact project card for the rollout chart: stage segments, expands for detail. */
export function RolloutCard({ name, color, stage, stageIndex, stageTotal = 4, ago, description, metrics, runtime, expanded, onToggle, onMore, panelId, className }: RolloutCardProps) {
  return (
    <article
      className={cn(
        "min-w-0 rounded-[10px] border p-[11px] shadow-[0_12px_26px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.025)] transition-[border-color,background-color] duration-150",
        expanded ? "bg-s3" : "border-white/[0.13] bg-s2 hover:bg-s3",
        className,
      )}
      style={expanded ? { borderColor: `color-mix(in srgb, ${color} 48%, transparent)` } : undefined}
    >
      <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={panelId} className="grid w-full grid-cols-[28px_1fr_16px] items-center gap-2 rounded-[6px]! text-left">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-[8px] border border-hair bg-black/25 text-ink-dim">
          <FolderGit2 className="size-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-medium text-ink">{name}</span>
          <span className="mt-0.5 block truncate font-mono text-[9.5px] text-ink-faint">
            {stage} · {ago}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className={cn("size-3.5 text-ink-faint transition-transform", expanded && "rotate-90")} />
      </button>
      <div className="ml-[36px] mt-2.5 flex gap-1" role="img" aria-label={`Stage ${stageIndex} of ${stageTotal}: ${stage}`}>
        {Array.from({ length: stageTotal }, (_, i) => (
          <i key={i} className="h-[3px] w-[14px] rounded-[2px]" style={{ background: i < stageIndex ? `color-mix(in srgb, ${color} 72%, var(--ink))` : "rgba(255,255,255,0.09)" }} />
        ))}
      </div>
      {expanded ? (
        <div id={panelId} className="mt-3 border-t border-hair pt-3">
          <p className="text-[11.5px] leading-[1.5] text-ink-dim">{description}</p>
          <dl className="my-3 grid grid-cols-2 gap-[7px]">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-[6px] bg-black/20 p-2">
                <dt className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-faint">{m.label}</dt>
                <dd className="mt-0.5 text-[12.5px] tabular-nums text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between gap-2">
            <RuntimeTag id={runtime} />
            <button type="button" onClick={onMore} className="inline-flex items-center gap-1 rounded-[4px]! text-[11.5px] text-ink-dim hover:text-ink">
              More detail <ChevronRight aria-hidden="true" className="size-3" />
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/* ----------------------------------------------------------------------------- RepoLinkCard */

/** Linked GitHub repository: logo, repo name and URL. External, opens a new tab. */
export function RepoLinkCard({ name, url, className }: { name: string; url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/repo flex min-w-0 items-center gap-3 rounded-[12px]! border border-hair bg-s2 p-3.5 text-inherit no-underline transition-colors hover:border-hair-strong hover:bg-s3",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-s4">
        <RuntimeLogo id="github" size={18} decorative />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">{name}</span>
        <span className="block truncate font-mono text-[11.5px] text-ink-faint">{url.replace(/^https?:\/\//, "")}</span>
      </span>
      <span aria-hidden="true" className="text-ink-faint transition-transform group-hover/repo:-translate-y-0.5 group-hover/repo:translate-x-0.5">
        ↗
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/* ----------------------------------------------------------------------------- GatewayAppCard */

export type AppVersion = { id: string; label: string; detail: string };

export type GatewayAppCardProps = {
  name: string;
  url: string;
  up: boolean;
  detail: string;
  versions: AppVersion[];
  version: string;
  onVersionChange?: (id: string) => void;
  group: string;
  className?: string;
};

/** A galileo app with its versions. Pick a version; open the app at its own origin. */
export function GatewayAppCard({ name, url, up, detail, versions, version, onVersionChange, group, className }: GatewayAppCardProps) {
  return (
    <article className={cn("flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-hair bg-s2 p-4", className)}>
      <header className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-cyn/12 font-mono text-[13px] font-semibold uppercase text-cyn">
          {name.slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="flex items-center gap-2 text-[14px] font-medium text-ink">
            {name}
            <StatusDot status={up ? "up" : "down"} size="xs" label={up ? "Answering" : "Not answering"} />
          </h4>
          <p className="truncate font-mono text-[11.5px] text-ink-faint">{url}</p>
        </div>
      </header>
      <p className="text-[12px] text-ink-dim">{detail}</p>
      <fieldset className="min-w-0">
        <legend className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">Versions</legend>
        <div className="flex flex-col gap-1">
          {versions.map((v) => (
            <label
              key={v.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-[8px] border px-2.5 py-1.5 text-[12px] transition-colors",
                version === v.id ? "border-cyn/40 bg-cyn/[0.06] text-ink" : "border-transparent text-ink-dim hover:bg-s3",
              )}
            >
              <input
                type="radio"
                name={group}
                value={v.id}
                checked={version === v.id}
                onChange={() => onVersionChange?.(v.id)}
                className="size-3.5 appearance-none rounded-full! border border-hair-strong checked:border-[4px] checked:border-cyn"
              />
              <span className="font-mono">{v.label}</span>
              <span className="ml-auto truncate text-[11px] text-ink-faint">{v.detail}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {up ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px]! border border-hair bg-s3 text-[12.5px] font-medium text-ink transition-colors hover:border-hair-strong"
        >
          Open app <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        // not answering: no destination to follow, so it is a disabled control rather than a link
        <Button size="sm" block disabled title="The app is not answering.">
          Open app
        </Button>
      )}
    </article>
  );
}
