// Feature, launcher and route cards: FeatureCard (icon, title, one line, one CTA),
// LauncherTile (app launcher tile with Open), StepRow and BenefitCard (org onboarding) and
// PaperFeatureCard (light cards inside a galileo-served sample app). Server-safe; every
// card carries exactly one action and is never itself a link.
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { toneSoft, toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- FeatureCard */

export type FeatureCardProps = {
  icon?: ReactNode;
  /** Mono kicker above the title (Open source, Managed, Service). */
  kicker?: ReactNode;
  /** Kicker and icon tint. Blue open source, green managed, orange enterprise or service. */
  tone?: Tone;
  title: ReactNode;
  description: ReactNode;
  /** The single action: a Button or ButtonLink. */
  action?: ReactNode;
  /** Small line under the action ("Free · open source"). */
  footnote?: ReactNode;
  as?: "article" | "li" | "div";
  className?: string;
};

/** Icon, title, one line and one CTA. Border brightens on hover. */
export function FeatureCard({ icon, kicker, tone = "neutral", title, description, action, footnote, as: Tag = "article", className }: FeatureCardProps) {
  return (
    <Tag
      className={cn(
        "group/feature flex min-w-0 flex-col gap-3 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-6 text-ink transition-[border-color,background-color] duration-200 hover:border-white/20 hover:bg-[#121214]",
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className={cn("grid size-10 place-items-center rounded-[10px] border [&_svg]:size-[18px]", toneSoft[tone])}>
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        {kicker ? <p className={cn("mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em]", tone === "neutral" ? "text-ink-faint" : toneText[tone])}>{kicker}</p> : null}
        <h4 className="text-[17px] font-semibold tracking-[-0.015em]">{title}</h4>
        <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-dim">{description}</p>
      </div>
      {action ? <div className="mt-auto pt-2">{action}</div> : null}
      {footnote ? <p className="text-[11.5px] text-ink-faint">{footnote}</p> : null}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- LauncherTile */

export type LauncherTileProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Opens the area; the whole tile is the button. */
  onOpen?: () => void;
  /** Visible action word at the bottom. */
  actionLabel?: string;
  /** The area that is open now: tinted and announced as the current item. */
  active?: boolean;
  className?: string;
};

/** App launcher tile: one big target that opens an area of the space. */
export function LauncherTile({ icon, title, description, onOpen, actionLabel = "Open", active = false, className }: LauncherTileProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group/launch flex h-full w-full min-w-0 flex-col items-start gap-3 rounded-[14px]! border p-5 text-left transition-[border-color,background-color] duration-200",
        active ? "border-blu/45 bg-blu/[0.07]" : "border-hair bg-s2 hover:border-hair-strong hover:bg-s3",
        className,
      )}
    >
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-[9px] bg-s4 text-ink [&_svg]:size-[18px]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        <span className="mt-1 block text-[12.5px] leading-[1.5] text-ink-dim">{description}</span>
      </span>
      <span className={cn("mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium", active ? "text-blu" : "text-ink-dim group-hover/launch:text-blu")}>
        {actionLabel}
        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-150 group-hover/launch:translate-x-0.5" />
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------------------- StepRow / BenefitCard */

export type StepRowProps = { n: number; icon?: ReactNode; title: ReactNode; description?: ReactNode; done?: boolean };

/** Numbered onboarding step: faint number, green icon, title and one line. */
export function StepRow({ n, icon, title, description, done = false }: StepRowProps) {
  return (
    <li className="flex min-w-0 items-start gap-3.5 py-3">
      <span className="w-5 shrink-0 pt-0.5 text-right font-mono text-[11px] tabular-nums text-ink-faint">{String(n).padStart(2, "0")}</span>
      {icon ? (
        <span aria-hidden="true" className={cn("grid size-7 shrink-0 place-items-center rounded-[8px] [&_svg]:size-3.5", done ? "bg-grn/15 text-grn" : "bg-s3 text-grn")}>
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium text-ink">
          {title}
          {done ? <span className="sr-only"> (done)</span> : null}
        </p>
        {description ? <p className="mt-0.5 text-[12.5px] leading-[1.5] text-ink-dim">{description}</p> : null}
      </div>
    </li>
  );
}

export function BenefitCard({ icon, title, description }: { icon?: ReactNode; title: ReactNode; description: ReactNode }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-[12px] border border-grn/20 bg-grn/[0.05] p-4">
      {icon ? (
        <span aria-hidden="true" className="mt-0.5 text-grn [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-dim">{description}</p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- PaperFeatureCard */

/** Light card for sample apps that galileo serves (acme notes app). Static. */
export function PaperFeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[12px] border border-[#e6e2d8] bg-white p-6 text-[#1d1c1a] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(29,28,26,0.08)]">
      <h4 className="text-[16px] font-semibold tracking-[-0.01em]">{title}</h4>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-[#55524a]">{description}</p>
    </article>
  );
}
