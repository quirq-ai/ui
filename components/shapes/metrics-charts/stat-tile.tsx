// Stat tiles and KPI rows. Server-safe. StatTile (hero, stat and mini sizes; a missing
// value reads "Unavailable", never 0 or a dash), StatGrid (1, 2, 3, 4 or 6 up by container
// width), StatPair (two side-by-side cards that stack on phones), ResourceTiles (Up and
// Down service tiles with loading and offline states) and FactGrid (mono value over a
// tiny label, for drawers and world stats).
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { UNAVAILABLE } from "@/lib/format";
import { Skeleton } from "@/components/ui/loaders";
import { StatusDot } from "@/components/ui/status";
import { toneText, type Tone } from "@/components/ui/tones";
import { keepQuirq } from "./chart-kit";

/* ============================================================================ StatTile */

export type StatTileVariant = "hero" | "stat" | "mini";

export type StatTileProps = {
  label: ReactNode;
  icon?: ReactNode;
  /** formatted value; null renders "Unavailable" */
  value: string | null;
  /** unit after the value, such as "hours" or "quirqs" */
  unit?: ReactNode;
  /** chip beside the label, such as "7 days" */
  badge?: ReactNode;
  /** one line under the value */
  note?: ReactNode;
  /** why the value is missing; shown instead of the note when value is null */
  unavailableNote?: ReactNode;
  /** hero footer under a hairline: a secondary number and its label */
  footer?: { value: ReactNode; label: ReactNode };
  /** signed change or other trailing readout */
  delta?: ReactNode;
  /** a sparkline or meter under the value */
  trend?: ReactNode;
  variant?: StatTileVariant;
  /** label style: mono uppercase kicker (default) or plain sentence case */
  labelStyle?: "mono" | "plain";
  /** color the value with a tone, for the primary tile in a row */
  tone?: Tone;
  loading?: boolean;
  className?: string;
};

const valueSize: Record<StatTileVariant, string> = {
  hero: "text-[clamp(30px,4.2vw,38px)] tracking-[-0.025em]",
  stat: "text-[26px] tracking-[-0.02em]",
  mini: "text-[18px] tracking-[-0.01em]",
};

const pad: Record<StatTileVariant, string> = {
  hero: "px-5 py-[22px]",
  stat: "px-[18px] py-4",
  mini: "px-3.5 py-3",
};

/** Headline number with a label and a note. Never prints 0 for a missing measurement. */
export function StatTile({
  label,
  icon,
  value,
  unit,
  badge,
  note,
  unavailableNote,
  footer,
  delta,
  trend,
  variant = "stat",
  labelStyle = "mono",
  tone,
  loading = false,
  className,
}: StatTileProps) {
  const missing = value === null;
  return (
    <div
      aria-busy={loading || undefined}
      className={cn(
        "relative flex min-w-0 flex-col rounded-[14px] border border-hair-soft",
        variant === "hero" ? "bg-gradient-to-b from-white/[0.05] to-white/[0.012] shadow-[0_1px_2px_rgba(0,0,0,0.4)]" : "bg-[#0f0f11]",
        pad[variant],
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span
          className={cn(
            "flex min-w-0 items-center gap-1.5",
            labelStyle === "mono" ? "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint" : "text-[12.5px] text-ink-dim",
          )}
        >
          {icon ? <span aria-hidden="true" className="inline-flex shrink-0 text-ink-faint [&_svg]:size-3.5">{icon}</span> : null}
          <span className="truncate">{keepQuirq(label)}</span>
        </span>
        {badge ? (
          <span className="shrink-0 rounded-[6px] border border-hair bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-dim">
            {badge}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-3 flex flex-col gap-2.5">
          <span className="sr-only">Loading {typeof label === "string" ? label : "value"}</span>
          <Skeleton height={variant === "hero" ? 34 : variant === "stat" ? 24 : 16} width="58%" radius={6} />
          <Skeleton height={10} width="74%" radius={4} />
        </div>
      ) : (
        <>
          <p className={cn("flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1", variant === "mini" ? "mt-1.5" : "mt-2.5")}>
            <span
              className={cn(
                "leading-none",
                missing
                  ? "text-[15px] font-medium tracking-normal text-ink-faint"
                  : [valueSize[variant], tone ? toneText[tone] : "text-ink", variant === "mini" ? "font-mono font-medium" : "font-semibold"],
              )}
            >
              {missing ? UNAVAILABLE : value}
            </span>
            {unit && !missing ? <span className="text-[13px] text-ink-dim">{unit}</span> : null}
            {delta && !missing ? <span className="ml-auto">{delta}</span> : null}
          </p>
          {missing && unavailableNote ? (
            <p className="mt-2 text-[12px] leading-snug text-ink-faint">{unavailableNote}</p>
          ) : note ? (
            <p className={cn("leading-snug text-ink-dim", variant === "mini" ? "mt-1 text-[11px]" : "mt-2 text-[12px]")}>{note}</p>
          ) : null}
          {trend ? <div className="mt-3">{trend}</div> : null}
          {footer ? (
            <div className="mt-4 border-t border-hair-soft pt-3.5">
              <p className="text-[17px] font-semibold leading-none tracking-[-0.01em] text-ink">{footer.value}</p>
              <p className="mt-1.5 text-[12px] text-ink-dim">{footer.label}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ============================================================================ StatGrid */

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 @[420px]:grid-cols-2",
  3: "grid-cols-1 @[420px]:grid-cols-2 @[720px]:grid-cols-3",
  4: "grid-cols-1 @[340px]:grid-cols-2 @[760px]:grid-cols-4",
  6: "grid-cols-2 @[560px]:grid-cols-3 @[900px]:grid-cols-6",
} as const;

/** Responsive KPI row by container width: 4-up collapses to 2-up, then 1-up. */
export function StatGrid({
  cols = 4,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  cols?: keyof typeof gridCols;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("@container min-w-0", className)} role={ariaLabel ? "group" : undefined} aria-label={ariaLabel}>
      <div className={cn("grid gap-3", gridCols[cols])}>{children}</div>
    </div>
  );
}

/* ============================================================================ StatPair */

export type StatPairItem = { label: ReactNode; value: string | null; note?: ReactNode; tone?: Tone };

/** Two cards side by side (stacked on phones), as the calculator shows cost and value. */
export function StatPair({ items, live = false, className }: { items: [StatPairItem, StatPairItem]; live?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row", className)} aria-live={live ? "polite" : undefined}>
      {items.map((it, i) => (
        <div key={i} className="flex-1 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[22px]">
          <p className="text-[13px] leading-[1.5] text-ink-dim sm:min-h-[40px]">{it.label}</p>
          <p
            className={cn(
              "mt-2.5 font-semibold tracking-[-0.025em]",
              it.value === null ? "text-[16px] text-ink-faint" : ["text-[27px]", it.tone ? toneText[it.tone] : "text-ink"],
            )}
          >
            {it.value ?? UNAVAILABLE}
          </p>
          {it.note ? <p className="mt-1.5 text-[12px] leading-[1.5] text-ink-dim">{it.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

/* ============================================================================ ResourceTiles */

export type ResourceItem = {
  label: string;
  /** formatted value; null reads Unavailable */
  value: string | null;
  /** state of the value: up green, down red, otherwise plain */
  state?: "up" | "down" | "plain";
  mono?: boolean;
};

export type ResourceTilesProps = {
  items: ResourceItem[];
  status?: "ready" | "loading" | "offline";
  /** shown in place of the tiles when offline */
  offlineTitle?: string;
  offlineNote?: ReactNode;
  loadingLabel?: string;
  className?: string;
};

/** Small service tiles: value green when up, red when down, muted otherwise. */
export function ResourceTiles({
  items,
  status = "ready",
  offlineTitle = "No live metadata",
  offlineNote,
  loadingLabel = "Loading metadata…",
  className,
}: ResourceTilesProps) {
  if (status === "offline") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-hair-strong bg-s1/70 px-4 py-6 text-center", className)}>
        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink">
          <StatusDot status="idle" />
          {offlineTitle}
        </span>
        {offlineNote ? <p className="max-w-[36ch] text-[12px] text-ink-faint">{offlineNote}</p> : null}
      </div>
    );
  }
  return (
    <div className={cn("@container min-w-0", className)}>
      <dl className="grid grid-cols-1 gap-2 @[300px]:grid-cols-2 @[640px]:grid-cols-4" aria-busy={status === "loading" || undefined}>
        {items.map((it) => {
          const state = it.value === null ? "plain" : it.state ?? "plain";
          return (
            <div key={it.label} className="min-w-0 rounded-[10px] border border-hair-soft bg-white/[0.025] p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{it.label}</dt>
              <dd
                className={cn(
                  "mt-1.5 flex min-w-0 items-center gap-1.5 text-[13px] font-medium",
                  it.mono && "font-mono text-[12px]",
                  status === "loading" ? "text-ink-faint" : it.value === null ? "text-ink-faint" : state === "up" ? "text-grn" : state === "down" ? "text-red" : "text-ink",
                )}
              >
                {status === "loading" ? (
                  <Skeleton height={12} width="70%" radius={4} />
                ) : (
                  <>
                    {state !== "plain" ? <StatusDot status={state} size="xs" /> : null}
                    <span className="truncate">{it.value ?? UNAVAILABLE}</span>
                  </>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      {status === "loading" ? (
        <p role="status" className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          {loadingLabel}
        </p>
      ) : null}
    </div>
  );
}

/* ============================================================================ FactGrid */

export type Fact = { label: string; value: string | null; tone?: Tone };

/** Mono values over tiny tracked labels: world stats, drawer facts, rollout cards. */
export function FactGrid({ facts, cols = 3, size = "md", className }: { facts: Fact[]; cols?: 2 | 3 | 4; size?: "sm" | "md"; className?: string }) {
  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-[12px] border border-hair-soft bg-hair-soft",
        cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {facts.map((f) => (
        <div key={f.label} className={cn("flex min-w-0 flex-col-reverse bg-[#0b0b0d]", size === "sm" ? "px-3 py-2.5" : "px-3.5 py-3")}>
          <dt className="mt-1 truncate font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink-faint">{f.label}</dt>
          <dd
            className={cn(
              "truncate font-mono tabular-nums",
              size === "sm" ? "text-[14px]" : "text-[17px]",
              f.value === null ? "text-[12px] text-ink-faint" : f.tone ? toneText[f.tone] : "text-ink",
            )}
          >
            {f.value ?? UNAVAILABLE}
          </dd>
        </div>
      ))}
    </dl>
  );
}
