// Base containers for the cards category: GlassCard (featured surfaces), SoftPanel (the
// default flat panel), SetupCard (app card with a head band), SectionCard (client section
// card) and CategoryInfoPanel (visualizer side panel). Server-safe; none of them is a link.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SurfaceElement = "div" | "section" | "article" | "aside";

/* ----------------------------------------------------------------------------- GlassCard */

export type GlassCardProps = {
  /** Mono kicker above the title. */
  kicker?: ReactNode;
  title?: ReactNode;
  /** Body copy under the title. */
  children?: ReactNode;
  /** Bottom area: a visualization, a command, actions. */
  footer?: ReactNode;
  /** bento: p 27/26/0 with the viz bleeding off the bottom; install: p 30, pb 34; rule: compact mint rule card. */
  layout?: "bento" | "install" | "rule";
  as?: SurfaceElement;
  className?: string;
  style?: CSSProperties;
};

const glassPad = {
  bento: "px-[26px] pt-[27px] pb-0",
  install: "p-[30px] pb-[34px]",
  rule: "px-6 py-5",
} as const;

/** Gradient glass, radius 20, hair-strong border. Reserved for featured surfaces. */
export function GlassCard({ kicker, title, children, footer, layout = "install", as: Tag = "div", className, style }: GlassCardProps) {
  return (
    <Tag className={cn("glass relative flex min-w-0 flex-col overflow-hidden text-ink", glassPad[layout], className)} style={style}>
      {kicker ? <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p> : null}
      {title ? (
        <h4
          className={cn(
            "font-semibold tracking-[-0.02em]",
            layout === "rule" ? "text-[16px]" : layout === "bento" ? "text-[clamp(19px,2vw,24px)]" : "text-[clamp(20px,2.2vw,26px)]",
          )}
        >
          {title}
        </h4>
      ) : null}
      {children ? (
        <div className={cn("mt-2 leading-[1.45] text-white/60", layout === "rule" ? "text-[13px]" : "text-[clamp(14px,1.3vw,16px)]")}>{children}</div>
      ) : null}
      {footer ? <div className={cn("relative flex flex-1 flex-col", layout === "bento" ? "mt-[22px] justify-end" : "mt-6")}>{footer}</div> : null}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- SoftPanel */

export type SoftPanelProps = {
  kicker?: ReactNode;
  children: ReactNode;
  /** callout: p 26/20; caption: kicker card; table: p 6 wrapper; form: two columns with an aside. */
  layout?: "callout" | "caption" | "table" | "form";
  /** Right column for the form layout. */
  aside?: ReactNode;
  as?: SurfaceElement;
  className?: string;
  style?: CSSProperties;
};

const softPad = {
  callout: "px-[26px] py-5",
  caption: "px-[26px] py-6",
  table: "p-1.5",
  form: "p-[clamp(20px,4vw,34px)]",
} as const;

/** Flat soft panel: #0f0f11, radius 18, hair-soft border. The default container. */
export function SoftPanel({ kicker, children, layout = "callout", aside, as: Tag = "div", className, style }: SoftPanelProps) {
  return (
    <Tag className={cn("min-w-0 rounded-[18px] border border-hair-soft bg-[#0f0f11] text-ink", softPad[layout], className)} style={style}>
      {layout === "form" ? (
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0">
            {kicker ? <p className="mb-3.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p> : null}
            {children}
          </div>
          {aside ? <aside className="min-w-0 md:border-l md:border-hair md:pl-8">{aside}</aside> : null}
        </div>
      ) : (
        <>
          {kicker ? <p className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p> : null}
          {children}
        </>
      )}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- SetupCard */

export type SurfaceStatusTone = "accent" | "amber" | "muted" | "danger";

const statusTone: Record<SurfaceStatusTone, string> = {
  accent: "text-grn",
  amber: "text-org",
  muted: "text-ink-faint",
  danger: "text-[#ff7a70]",
};

export type SetupCardProps = {
  title: ReactNode;
  /** Count chip after the title ("Saved secrets 4"). */
  count?: number;
  /** Italic status word at the right of the head ("In use", "Not checked"). */
  status?: { label: ReactNode; tone?: SurfaceStatusTone };
  /** One action in the head ("Manage secrets", "Add secret"). */
  action?: ReactNode;
  children?: ReactNode;
  /** Footer band with a top hairline. */
  footer?: ReactNode;
  titleId?: string;
  as?: SurfaceElement;
  className?: string;
};

/** App card: s2 fill, radius 12, a head band (padding 16 20) over a 20px body. */
export function SetupCard({ title, count, status, action, children, footer, titleId, as: Tag = "section", className }: SetupCardProps) {
  return (
    <Tag
      aria-labelledby={titleId}
      className={cn("flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-hair bg-s2 text-ink", className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-hair-soft px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <h4 id={titleId} className="truncate text-[14px] font-medium">
            {title}
          </h4>
          {count !== undefined ? (
            <span className="rounded-[6px] border border-hair-soft px-1.5 py-px font-mono text-[11px] tabular-nums text-ink-faint">{count}</span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {status ? <i className={cn("text-[12px] italic", statusTone[status.tone ?? "muted"])}>{status.label}</i> : null}
          {action}
        </div>
      </header>
      {children ? <div className="min-w-0 flex-1 p-5 text-[13px] text-ink-dim">{children}</div> : null}
      {footer ? <footer className="border-t border-hair-soft px-5 py-3.5">{footer}</footer> : null}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- SectionCard */

export type SectionCardProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  as?: SurfaceElement;
  className?: string;
};

/** Header, description, action, content and footer slots on a radius 14 card. */
export function SectionCard({ icon, title, description, action, children, footer, as: Tag = "section", className }: SectionCardProps) {
  return (
    <Tag className={cn("flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair bg-s1 p-5 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.4)]", className)}>
      <header className="flex items-start gap-3">
        {icon ? (
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-s3 text-ink-dim [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h4 className="text-[14px] font-semibold leading-snug">{title}</h4>
          {description ? <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children ? <div className="min-w-0 text-[13px] text-ink-dim">{children}</div> : null}
      {footer ? <footer className="flex flex-wrap items-center gap-2 border-t border-hair-soft pt-4">{footer}</footer> : null}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- CategoryInfoPanel */

export type InfoStat = { label: string; value: ReactNode };

export type CategoryInfoPanelProps = {
  kicker?: ReactNode;
  title: ReactNode;
  /** Category color as a CSS color (var(--blu)). */
  color?: string;
  description?: ReactNode;
  stats: InfoStat[];
  /** Quiet instruction at the bottom. */
  hint?: ReactNode;
  /** Cap the height; the panel then scrolls internally. */
  maxHeight?: number;
  className?: string;
};

/** Visualizer side panel: kicker, title, blurb, stat rows (dt 10px mono, dd 15px tabular). */
export function CategoryInfoPanel({ kicker = "Category", title, color, description, stats, hint, maxHeight, className }: CategoryInfoPanelProps) {
  return (
    <aside
      tabIndex={maxHeight ? 0 : undefined}
      aria-label={typeof title === "string" ? `${title} details` : undefined}
      className={cn(
        "scroll-thin min-w-0 overflow-y-auto rounded-[14px] border border-white/[0.12] bg-[rgba(8,10,14,0.9)] p-7 text-ink shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-[18px]",
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {color ? <span aria-hidden="true" className="size-2 rounded-full" style={{ background: color }} /> : null}
        {kicker}
      </p>
      <h4 className="mt-3 text-[24px] font-semibold leading-tight tracking-[-0.02em]">{title}</h4>
      {description ? <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{description}</p> : null}
      <dl className="mt-5 border-t border-hair">
        {stats.map((s) => (
          <div key={s.label} className="flex min-h-12 items-center justify-between gap-4 border-b border-hair-soft">
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">{s.label}</dt>
            <dd className="text-[15px] tabular-nums text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
      {hint ? <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">{hint}</p> : null}
    </aside>
  );
}
