// Side sheet and detail drawer pieces: DrawerPanel (right sheet with a plain header or a
// tinted poster header, scrolling sections, footer, and a loading state), DrawerSection,
// DrawerFacts, DrawerRow and RunResult. Hook-free; Drawer in drawer-layer.tsx puts the
// panel in a real modal layer that slides in from the right.
import type { CSSProperties, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button";
import { LoadingLine, Skeleton } from "@/components/ui/loaders";
import { StateChip } from "@/components/ui/status";
import type { ColorToken } from "@/lib/fixtures";

export type DrawerPanelProps = {
  title: ReactNode;
  titleId?: string;
  titleAs?: "h2" | "h3";
  /** Mono uppercase line above the title ("ENGINEERING"). */
  kicker?: ReactNode;
  /** Line under the title (a date, a path, "Latest 20 runs · newest first"). */
  subtitle?: ReactNode;
  /** Icon tile at the start of a plain header. */
  icon?: ReactNode;
  /** Tinted poster header (graph inspector) in this spectrum color. */
  poster?: ColorToken;
  /** Extra content inside the poster, under the title (satellite dots, chips). */
  posterExtra?: ReactNode;
  /** Chips under the header ("● Live agent", "4 · Orchestrate"). */
  badges?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  footer?: ReactNode;
  /** Show a loading view instead of the sections: "Loading xo-space…". */
  loading?: string | null;
  children?: ReactNode;
  className?: string;
};

/** Right sheet for one item: header, sections that scroll, footer action. */
export function DrawerPanel({
  title,
  titleId,
  titleAs: Title = "h2",
  kicker,
  subtitle,
  icon,
  poster,
  posterExtra,
  badges,
  onClose,
  closeLabel = "Close",
  footer,
  loading,
  children,
  className,
}: DrawerPanelProps) {
  const posterStyle: CSSProperties | undefined = poster
    ? { background: `linear-gradient(155deg, color-mix(in srgb, var(--${poster}) 24%, transparent), color-mix(in srgb, var(--${poster}) 3%, transparent) 68%)` }
    : undefined;
  return (
    <aside
      aria-labelledby={titleId}
      className={cn(
        "relative flex h-full w-[min(400px,100%)] min-w-0 max-w-full flex-col border-l border-hair-strong bg-[rgba(15,15,17,0.97)] text-ink backdrop-blur-xl",
        "shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      {poster ? (
        <header className="shrink-0 border-b border-hair-soft px-5 pb-5 pt-7 pr-12" style={posterStyle}>
          {kicker ? <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">{kicker}</p> : null}
          <Title id={titleId} className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.025em]">
            {title}
          </Title>
          {subtitle ? <p className="mt-1 text-[12.5px] text-ink-dim">{subtitle}</p> : null}
          {posterExtra ? <div className="mt-3">{posterExtra}</div> : null}
        </header>
      ) : (
        <header className="flex shrink-0 items-start gap-3 border-b border-hair-soft px-5 pb-4 pt-5 pr-12">
          {icon ? (
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-hair bg-black/60 text-ink-dim [&_svg]:size-[18px]">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            {kicker ? <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{kicker}</p> : null}
            <Title id={titleId} className="mt-0.5 truncate text-[17px] font-semibold tracking-[-0.015em]">
              {title}
            </Title>
            {subtitle ? <p className="mt-0.5 text-[12px] text-ink-faint">{subtitle}</p> : null}
          </div>
        </header>
      )}
      {badges && !loading ? <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-hair-soft px-5 py-3">{badges}</div> : null}
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex flex-col gap-5">
            <LoadingLine>{loading}</LoadingLine>
            <Skeleton lines={3} />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton height={54} />
              <Skeleton height={54} />
              <Skeleton height={54} />
              <Skeleton height={54} />
            </div>
            <Skeleton lines={2} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">{children}</div>
        )}
      </div>
      {footer && !loading ? (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-hair-soft px-5 py-3">{footer}</footer>
      ) : null}
      {onClose ? (
        <IconButton aria-label={closeLabel} size="sm" variant="outline" onClick={onClose} className="absolute right-3 top-3">
          <X />
        </IconButton>
      ) : null}
    </aside>
  );
}

/** Labelled block inside a drawer: "TODOS · 5", "CONNECTIONS". */
export function DrawerSection({
  label,
  aside,
  headingAs: Heading = "h3",
  children,
  className,
}: {
  label: ReactNode;
  aside?: ReactNode;
  /** One level under the drawer title: h3 under an h2, h4 under an h3. */
  headingAs?: "h3" | "h4";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <Heading className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{label}</Heading>
        {aside ? <span className="text-[11.5px] text-ink-faint">{aside}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** Two-column fact grid. Missing values render "Unavailable" in a quieter tone. */
export function DrawerFacts({ items }: { items: { term: string; value: ReactNode; unavailable?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {items.map((f) => (
        <div key={f.term} className="rounded-[10px] border border-hair-soft bg-white/[0.02] px-3 py-2.5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{f.term}</dt>
          <dd className={cn("mt-1 text-[15px] font-medium tabular-nums", f.unavailable ? "text-[13px] font-normal text-ink-faint" : "text-ink")}>
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Row with a leading icon, a title, a quiet line under it and something on the right. */
export function DrawerRow({
  icon,
  title,
  sub,
  trailing,
  highlight = false,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  trailing?: ReactNode;
  /** Brief accent fill, as when the matching satellite on the map is clicked. */
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[10px] px-2.5 py-2 transition-[background-color,box-shadow] duration-300",
        highlight ? "bg-blu/[0.16] shadow-[inset_0_0_0_1px_rgba(46,155,255,0.45)]" : "hover:bg-white/[0.03]",
        className,
      )}
    >
      {icon ? <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0 text-ink-faint [&_svg]:size-4">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <div className="text-[13px] leading-snug text-ink">{title}</div>
        {sub ? <div className="mt-0.5 text-[11.5px] text-ink-faint">{sub}</div> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export type RunResultProps = {
  status: "ok" | "failed" | "running" | "skipped";
  /** "41.2s"; null while running. */
  duration: string | null;
  /** "02:00:00 → 02:00:41" */
  window: string;
  trigger: string;
  exit: number | null;
  reason?: string | null;
  output: string;
};

/** One command run: status and duration, times, trigger and exit code, output tail. */
export function RunResult({ status, duration, window, trigger, exit, reason, output }: RunResultProps) {
  return (
    <article className="flex flex-col gap-1.5 border-t border-hair-soft pt-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <StateChip kind="run" state={status} />
        <span className="font-mono text-[12px] tabular-nums text-ink">{duration ?? "Running"}</span>
      </div>
      <p className="font-mono text-[11.5px] tabular-nums text-ink-dim">{window}</p>
      <p className="text-[11.5px] text-ink-faint">
        {trigger} · exit {exit === null ? "Unavailable" : exit}
        {reason ? ` · ${reason}` : ""}
      </p>
      <pre className="scroll-thin mt-1 overflow-x-auto whitespace-pre-wrap rounded-[8px] border border-hair-soft bg-black/50 px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-dim">
        {output}
      </pre>
    </article>
  );
}
