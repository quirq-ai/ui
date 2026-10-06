// Skeletons and spinners matched to the shape they stand in for. RowSkeleton and
// ListSkeleton (project rows 52px, inbox rows 44px), CardSkeleton, StatTileSkeleton,
// PillSkeleton, OrbitLoader (visualizer ring with a mono caption), IosRing (spoked activity
// indicator) and MotionFreeze (renders children as they look under reduced motion).
// Builds on the ui Skeleton and Spinner. Server-safe; motion is CSS only.
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/loaders";

/* one step brighter than the base shimmer so bones read on s1 and #0f0f11 panels */
const BONE: CSSProperties = {
  backgroundImage: "linear-gradient(90deg, var(--s3) 0%, var(--s4) 50%, var(--s3) 100%)",
  backgroundSize: "200% 100%",
};

/** A shimmer bone: the ui Skeleton with a lift for app panels. */
export function Bone({ style, ...rest }: ComponentProps<typeof Skeleton>) {
  return <Skeleton style={{ ...BONE, ...style }} {...rest} />;
}

/* ----------------------------------------------------------------------------- rows */

/** One list row placeholder: leading tile, two text lines, trailing pill. */
export function RowSkeleton({
  height = 52,
  leading = "tile",
  trailing = true,
  className,
}: {
  /** 52 for project rows, 44 for inbox rows. */
  height?: number;
  leading?: "tile" | "dot" | "avatar" | "none";
  trailing?: boolean;
  className?: string;
}) {
  const compact = height < 48;
  return (
    <div aria-hidden="true" className={cn("flex min-w-0 items-center gap-3 px-3", className)} style={{ height }}>
      {leading === "tile" ? <Bone width={compact ? 22 : 28} height={compact ? 22 : 28} radius={7} className="shrink-0" /> : null}
      {leading === "avatar" ? <Bone width={compact ? 22 : 28} height={compact ? 22 : 28} radius={999} className="shrink-0" /> : null}
      {leading === "dot" ? <Bone width={8} height={8} radius={999} className="shrink-0" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Bone height={compact ? 9 : 10} radius={4} className="w-[46%] max-w-[300px]" />
        {compact ? null : <Bone height={8} radius={4} className="w-[72%] max-w-[420px] opacity-70" />}
      </div>
      {trailing ? <Bone width={compact ? 44 : 58} height={compact ? 16 : 20} radius={999} className="shrink-0" /> : null}
    </div>
  );
}

/** A stack of row placeholders with hairline dividers, announced once as loading. */
export function ListSkeleton({ rows = 4, height = 52, leading = "tile", label = "Loading", className }: { rows?: number; height?: number; leading?: "tile" | "dot" | "avatar" | "none"; label?: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={cn("divide-y divide-hair-soft overflow-hidden rounded-[12px] border border-hair-soft", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <RowSkeleton key={i} height={height} leading={leading} trailing={i % 2 === 0} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- cards and tiles */

/** Card placeholder: icon tile and title, two body lines, footer pills. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair-soft bg-s1 p-4", className)}>
      <div className="flex items-center gap-3">
        <Bone width={32} height={32} radius={9} className="shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Bone height={10} radius={4} className="w-[55%]" />
          <Bone height={8} radius={4} className="w-[35%] opacity-70" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Bone height={8} radius={4} className="w-full" />
        <Bone height={8} radius={4} className="w-[62%]" />
      </div>
      <div className="flex gap-2">
        <Bone width={56} height={18} radius={999} />
        <Bone width={40} height={18} radius={999} />
      </div>
    </div>
  );
}

/** Stat tile placeholder: kicker, big number, delta line. */
export function StatTileSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex min-w-0 flex-col gap-2.5 rounded-[14px] border border-hair-soft bg-s1 p-4", className)}>
      <Bone height={8} radius={3} className="w-[45%]" />
      <Bone height={22} radius={6} className="w-[62%]" />
      <Bone height={8} radius={3} className="w-[38%] opacity-70" />
    </div>
  );
}

/** Pill placeholder for status pills and chips. */
export function PillSkeleton({ width = 96, className }: { width?: number; className?: string }) {
  return <Bone width={width} height={24} radius={999} className={className} />;
}

/* ----------------------------------------------------------------------------- spinners */

/** Visualizer loader: thin ring with a bright top arc and a mono uppercase caption. */
export function OrbitLoader({ caption, size = 44, className }: { caption?: ReactNode; size?: number; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-col items-center gap-[18px] text-center", className)}>
      <span
        aria-hidden="true"
        className="block rounded-full border border-white/[0.12] border-t-ink"
        style={{ width: size, height: size, animation: "q-spin 1.2s linear infinite" }}
      />
      {caption ? <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">{caption}</span> : <span className="sr-only">Loading</span>}
    </div>
  );
}

/** iOS style activity ring: 8 spokes fading around, stepped rotation. */
export function IosRing({ size = 20, label = "Loading", className }: { size?: number; label?: string | null; className?: string }) {
  return (
    <span role={label ? "status" : undefined} aria-hidden={label ? undefined : true} className={cn("inline-flex shrink-0 text-ink-dim", className)}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ animation: "q-spin 0.9s steps(8, end) infinite" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x="11"
            y="2"
            width="2.2"
            height="6"
            rx="1.1"
            fill="currentColor"
            opacity={(i + 1) / 8}
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

/* ----------------------------------------------------------------------------- reduced motion */

/** Shows children as reduced motion renders them: shimmer and spin stop, shapes stay. */
export function MotionFreeze({ frozen = true, children, className }: { frozen?: boolean; children: ReactNode; className?: string }) {
  return <div className={cn(frozen && "[&_*]:animate-none!", className)}>{children}</div>;
}
