// Avatars: PeopleStack (overlapping initials with a +N chip, an empty "Not shared" line and a
// loading skeleton pill; the title lists every name), AgentBlob (a soft organic mark for an
// agent, shaped deterministically from its name, with the runtime logo inside) and PersonRow
// (avatar, name, detail and a trailing slot). Initials only: rosters never carry pictures.
// Server-safe and hydration stable: shapes and tints come from a string hash.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { mulberry32 } from "@/lib/fixtures";
import { Avatar, AvatarGroup, initialsFor, type AvatarSize } from "@/components/ui/avatar";
import { RuntimeLogo, type LogoAlias, type LogoId } from "@/components/ui/runtime-logo";
import { Skeleton } from "@/components/ui/loaders";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import { hashString, toneFor, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- PeopleStack */

const STACK_PX: Record<AvatarSize, number> = { xs: 20, sm: 24, md: 32, lg: 40, xl: 56 };

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export type PeopleStackProps = {
  names: string[];
  /** Faces before the +N chip: 3 on cards, 5 in the project pane. */
  max?: number;
  size?: AvatarSize;
  /** Shown when nobody is listed. */
  emptyText?: string;
  loading?: boolean;
  className?: string;
};

/** Who a project or space is shared with. Hover the stack to read every name. */
export function PeopleStack({ names, max = 3, size = "sm", emptyText = "Not shared", loading = false, className }: PeopleStackProps) {
  if (loading) {
    const px = STACK_PX[size];
    return (
      <span role="status" className={cn("inline-flex items-center", className)}>
        <Skeleton width={px * Math.min(max, 3) - (Math.min(max, 3) - 1) * 6 + 10} height={px} radius={999} />
        <span className="sr-only">Loading people</span>
      </span>
    );
  }
  if (names.length === 0) return <span className={cn("text-[11.5px] text-ink-faint", className)}>{emptyText}</span>;
  return (
    <span title={names.join(", ")} className={cn("inline-flex", className)}>
      <AvatarGroup names={names} max={max} size={size} label={`Shared with ${listNames(names)}`} />
    </span>
  );
}

/* ----------------------------------------------------------------------------- AgentBlob */

/** Closed smooth path through n jittered points on a circle (Catmull-Rom to cubic Bézier). */
function blobPath(seed: number, cx: number, cy: number, r: number, points = 7): string {
  const rng = mulberry32(seed);
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2 - Math.PI / 2;
    const rr = r * (0.84 + rng() * 0.16);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as const;
  });
  const f = (n: number) => n.toFixed(2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

export type AgentBlobProps = {
  /** Agent name; drives the shape, the tint and the accessible name. */
  name: string;
  /** Runtime logo in the middle; initials when omitted. */
  runtime?: LogoId | LogoAlias;
  tone?: Exclude<Tone, "neutral">;
  /** Edge length in px. */
  size?: number;
  status?: DotStatus;
  decorative?: boolean;
  className?: string;
};

/** Organic agent mark: same name, same shape, on every render and machine. */
export function AgentBlob({ name, runtime, tone, size = 40, status, decorative = false, className }: AgentBlobProps) {
  const h = hashString(name);
  const t = tone ?? toneFor(name);
  const gid = `agent-blob-${h.toString(36)}-${t}`;
  const d = blobPath(h, 20, 20, 18.5);
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
      title={decorative ? undefined : name}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className="absolute inset-0">
        <defs>
          <radialGradient id={gid} cx="35%" cy="30%" r="80%">
            <stop offset="0%" style={{ stopColor: `var(--${t})`, stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: `var(--${t})`, stopOpacity: 0.12 }} />
          </radialGradient>
        </defs>
        <path d={d} fill="var(--bg)" />
        <path d={d} fill={`url(#${gid})`} stroke={`var(--${t})`} strokeOpacity={0.45} strokeWidth={0.8} />
      </svg>
      <span className="relative inline-flex items-center justify-center">
        {runtime ? (
          <RuntimeLogo id={runtime} size={Math.round(size * 0.42)} decorative />
        ) : (
          <span aria-hidden="true" className="font-mono font-medium text-ink" style={{ fontSize: Math.max(9, Math.round(size * 0.28)) }}>
            {initialsFor(name)}
          </span>
        )}
      </span>
      {status ? (
        <span className="absolute bottom-0 right-0 inline-flex rounded-full bg-bg p-[2px]">
          <StatusDot status={status} size={size >= 40 ? "sm" : "xs"} halo={false} pulse={status === "busy"} />
        </span>
      ) : null}
    </span>
  );
}

/* ----------------------------------------------------------------------------- PersonRow */

export type PersonRowProps = {
  name: string;
  detail?: ReactNode;
  status?: DotStatus;
  size?: AvatarSize;
  trailing?: ReactNode;
  className?: string;
};

/** Avatar, name and a detail line, with a trailing slot for a role or state. Names and
    emails wrap instead of truncating, and the trailing slot drops below when the row is too
    narrow for both, so nobody is cut down to "jonah@example…" on a phone. */
export function PersonRow({ name, detail, status, size = "md", trailing, className }: PersonRowProps) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <div className="flex min-w-[min(100%,15rem)] flex-1 items-center gap-3">
        <Avatar name={name} size={size} status={status} decorative />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-[1.45] text-ink [overflow-wrap:break-word]">{name}</p>
          {detail ? <p className="text-[12px] leading-[1.45] text-ink-faint [overflow-wrap:break-word]">{detail}</p> : null}
        </div>
      </div>
      {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
    </div>
  );
}
