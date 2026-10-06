// Empty states: explain the absence and offer the next step. EmptyState (dashed card or
// placeholder well, icon tile, title, description, actions; default and sm; error tone),
// EmptyLine (inline muted sentence), TwoUpEmpty (side-by-side onboarding cards that stack)
// and OfflineState (the visualizer's full-view offline notice). Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- EmptyState */

export type EmptyStateProps = {
  /** 16 to 20px glyph; sits in a 40px tile. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary and secondary actions; one primary at most. */
  actions?: ReactNode;
  /** dashed: dashed card (space dashboard); placeholder: quiet filled well (swarm panes); bare: no box. */
  variant?: "dashed" | "placeholder" | "bare";
  size?: "md" | "sm";
  /** Error tone: red border and title for a failed load that left nothing to show. */
  tone?: "default" | "error";
  align?: "center" | "start";
  headingLevel?: "h3" | "h4" | "p";
  className?: string;
};

/** Absence with a reason and a next step: "No projects yet · Clone a Git repository…". */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  variant = "dashed",
  size = "md",
  tone = "default",
  align = "center",
  headingLevel: H = "h3",
  className,
}: EmptyStateProps) {
  const err = tone === "error";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        align === "center" ? "items-center text-center" : "items-start text-left",
        variant === "dashed" && ["rounded-[12px] border border-dashed bg-s2/60", err ? "border-red/40" : "border-hair-strong"],
        variant === "placeholder" && ["min-h-36 justify-center rounded-[12px] border bg-white/[0.02]", err ? "border-red/35" : "border-hair-soft"],
        variant !== "bare" && (size === "md" ? "px-[22px] py-[46px]" : "px-4 py-7"),
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "mb-3.5 inline-flex shrink-0 items-center justify-center rounded-[10px] border [&_svg]:size-[18px]",
            size === "md" ? "size-10" : "size-8 [&_svg]:size-4",
            err ? "border-red/35 bg-red/[0.08] text-red" : "border-hair bg-s3 text-ink-dim",
          )}
        >
          {icon}
        </span>
      ) : null}
      <H className={cn("font-semibold tracking-[-0.01em]", size === "md" ? "text-[15px]" : "text-[13.5px]", err ? "text-[#ff8a80]" : "text-ink")}>{title}</H>
      {description ? (
        <p className={cn("mt-1.5 max-w-[52ch] leading-relaxed", size === "md" ? "text-[12.5px]" : "text-[12px]", "text-ink-dim")}>{description}</p>
      ) : null}
      {actions ? <div className={cn("mt-4 flex flex-wrap items-center gap-2", align === "center" && "justify-center")}>{actions}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- EmptyLine */

/** Inline empty sentence inside a list or chart: "No tool telemetry." */
export function EmptyLine({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex min-w-0 items-center gap-2 text-[12.5px] text-ink-faint [&_svg]:size-3.5 [&_svg]:shrink-0", className)}>
      {icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/* ----------------------------------------------------------------------------- TwoUpEmpty */

export type TwoUpItem = { key: string; icon?: ReactNode; title: ReactNode; description: ReactNode; action?: ReactNode };

/** Two onboarding cards side by side; they stack into one column on narrow screens. */
export function TwoUpEmpty({ items, headingLevel: H = "h4", className }: { items: [TwoUpItem, TwoUpItem]; headingLevel?: "h3" | "h4"; className?: string }) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>
      {items.map((it) => (
        <div key={it.key} className="flex min-w-0 flex-col items-start rounded-[12px] border border-dashed border-hair-strong bg-s2/60 px-7 py-[34px]">
          {it.icon ? (
            <span aria-hidden="true" className="mb-3 inline-flex size-9 items-center justify-center rounded-[10px] border border-hair bg-s3 text-ink-dim [&_svg]:size-4">
              {it.icon}
            </span>
          ) : null}
          <H className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{it.title}</H>
          <p className="mt-1.5 max-w-[46ch] text-[12.5px] leading-relaxed text-ink-dim">{it.description}</p>
          {it.action ? <div className="mt-4 flex flex-wrap gap-2">{it.action}</div> : null}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- OfflineState */

/** Full-view offline notice: 68px icon circle, eyebrow, large title, one recovery action. */
export function OfflineState({
  icon,
  eyebrow,
  title,
  description,
  action,
  headingLevel: H = "h3",
  className,
}: {
  icon: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-0 place-items-center content-center px-6 py-10 text-center", className)}>
      <span aria-hidden="true" className="mb-6 grid size-[68px] place-items-center rounded-full border border-hair bg-[#0f0f11] text-ink-dim [&_svg]:size-6">
        {icon}
      </span>
      {eyebrow ? <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">{eyebrow}</p> : null}
      <H className="mt-3 text-balance text-[clamp(26px,4vw,40px)] font-medium leading-[1.05] tracking-[-0.025em] text-ink">{title}</H>
      <p className="mt-3.5 max-w-[520px] text-[13.5px] text-ink-dim">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
