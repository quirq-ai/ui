// Pricing plan cards: PricingTierCard (marketing tier: name and tier tag, amount /mo, arrow
// bullets, one CTA, free note) and PlanCard (billing app plan with a trial badge, billed
// annually switch, feature checks and a CTA that follows the subscription state), plus
// PlanCardSkeleton. Server-safe; handlers come from the parent.
import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loaders";
import { Switch } from "@/components/ui/switch";
import { toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- PricingTierCard */

export type PricingTierCardProps = {
  name: string;
  /** Mono tier tag at the right ("Free · open source", "Managed", "Enterprise"). */
  tag: string;
  /** Blue open source, green managed, orange enterprise. */
  tone: Tone;
  amount: string;
  /** " /mo"; omit for Custom. */
  per?: string;
  bullets: string[];
  /** The one CTA: a command pill, a Button or a ButtonLink. */
  cta: ReactNode;
  /** Green line under the CTA ("30 days free"). */
  note?: string;
  /** Tinted border for the licensed tier. */
  accent?: boolean;
  /** Brighter border and a lift for the recommended tier. */
  highlighted?: boolean;
  className?: string;
};

/** Marketing tier: equal height in its grid, arrow bullets, one CTA. */
export function PricingTierCard({ name, tag, tone, amount, per, bullets, cta, note, accent, highlighted, className }: PricingTierCardProps) {
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-[16px] border bg-[#0f0f11] p-7 text-ink",
        accent ? "border-org/30" : highlighted ? "border-white/25 bg-[#121214]" : "border-hair-soft",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[17px] font-semibold">{name}</h4>
        <span className={cn("text-right font-mono text-[8.5px] uppercase tracking-[0.14em]", toneText[tone])}>{tag}</span>
      </div>
      <p className={cn("font-bold tracking-[-0.03em] tabular-nums", per ? "text-[34px]" : "text-[26px] leading-[51px]")}>
        {amount}
        {per ? <span className="text-[13px] font-normal tracking-normal text-ink-faint">{per}</span> : null}
      </p>
      <ul className="mt-1 flex flex-1 flex-col text-[12.5px] leading-[1.95] text-ink-dim">
        {bullets.map((b) => (
          <li key={b} className="flex gap-1.5">
            <span aria-hidden="true">→</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {cta}
      {note ? <p className="text-center text-[11px] font-semibold text-grn">{note}</p> : <p aria-hidden="true" className="h-[16.5px]" />}
    </article>
  );
}

/* ----------------------------------------------------------------------------- PlanCard */

export type PlanFeature = { name: string; included: boolean };

export type PlanCardState = "default" | "highlighted" | "current" | "overdue" | "upgrade";

export type PlanCardProps = {
  id: string;
  name: string;
  subtitle: string;
  monthly: number;
  annual: number;
  billedAnnually: boolean;
  onBilledAnnuallyChange?: (on: boolean) => void;
  features: PlanFeature[];
  state?: PlanCardState;
  /** Shows "Free 30-day trial" while the account has never subscribed. */
  trial?: boolean;
  /** Upgrade preview: amount due today in USD; null while the preview loads. */
  amountDueToday?: number | null;
  /** Subscribing, paying or upgrading. */
  busy?: boolean;
  /** Disable the CTA because another plan is active or busy. */
  locked?: boolean;
  ctaLabel?: string;
  onAction?: () => void;
  className?: string;
};

const ring: Record<PlanCardState, string> = {
  default: "border-hair",
  highlighted: "border-hair-strong shadow-[0_0_0_2px_rgba(255,255,255,0.1)]",
  current: "border-grn/50 shadow-[0_0_0_2px_rgba(48,209,88,0.28)]",
  overdue: "border-org/50 shadow-[0_0_0_2px_rgba(255,159,10,0.25)]",
  upgrade: "border-hair-strong shadow-[0_0_0_2px_rgba(255,255,255,0.1)]",
};

/** Billing-app plan card. The CTA reads Join, Upgrade, Current plan or Pay now by state. */
export function PlanCard({
  id,
  name,
  subtitle,
  monthly,
  annual,
  billedAnnually,
  onBilledAnnuallyChange,
  features,
  state = "default",
  trial = false,
  amountDueToday,
  busy = false,
  locked = false,
  ctaLabel,
  onAction,
  className,
}: PlanCardProps) {
  const price = billedAnnually && state !== "overdue" ? annual : monthly;
  const per = billedAnnually && state !== "overdue" ? "/ year" : "/ month";

  const cta =
    state === "overdue" ? (
      <Button variant="primary" size="lg" block loading={busy} loadingLabel="Paying…" onClick={onAction}>
        Pay now
      </Button>
    ) : state === "upgrade" ? (
      <Button variant="primary" size="lg" block loading={busy} loadingLabel="Upgrading…" disabled={amountDueToday === null} onClick={onAction}>
        Upgrade to {name}
      </Button>
    ) : state === "current" ? (
      <Button size="lg" block disabled className="border-grn/40! text-grn!" leadingIcon={<Check />}>
        Current plan
      </Button>
    ) : (
      <Button
        variant={state === "highlighted" ? "primary" : "secondary"}
        size="lg"
        block
        loading={busy}
        loadingLabel="Subscribing…"
        disabled={locked}
        onClick={onAction}
      >
        {ctaLabel ?? `Join ${name} plan`}
      </Button>
    );

  return (
    <article className={cn("flex min-w-0 flex-col gap-6 rounded-[14px] border bg-s1 p-6 text-ink transition-shadow duration-200 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]", ring[state], className)}>
      <header>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-[17px] font-semibold">{name}</h4>
          <div className="flex flex-wrap gap-1.5">
            {trial && state !== "current" && state !== "overdue" ? <Badge size="sm">Free 30-day trial</Badge> : null}
            {state === "current" ? (
              <Badge size="sm" tone="grn" variant="solid">
                Current plan
              </Badge>
            ) : null}
            {state === "overdue" ? (
              <Badge size="sm" tone="org" dot>
                Payment overdue
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="mt-1 text-[12.5px] text-ink-dim">{subtitle}</p>
      </header>

      <div className="flex flex-col gap-3">
        {state === "upgrade" ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[30px] font-bold tabular-nums text-ink-faint line-through">{formatCurrency(price)}</span>
            {amountDueToday === null || amountDueToday === undefined ? (
              <span className="inline-flex items-center">
                <Skeleton width={96} height={32} />
                <span className="sr-only">Loading the amount due today</span>
              </span>
            ) : (
              <span className="text-[30px] font-bold tabular-nums">{formatCurrency(amountDueToday)}</span>
            )}
            <span className="text-[12.5px] text-ink-dim">due today · then billed normally</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[34px] font-bold tracking-[-0.02em] tabular-nums">{formatCurrency(price)}</span>
            <span className="text-[12.5px] text-ink-dim">{per}</span>
          </div>
        )}
        {state !== "overdue" ? (
          <Switch id={`${id}-annual`} size="sm" checked={billedAnnually} onCheckedChange={onBilledAnnuallyChange} label="Billed annually" labelPosition="end" />
        ) : (
          <p className="text-[12.5px] text-org">Payment needs attention. Pay the open invoice to keep hosted spaces running.</p>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {features.map((f) => (
          <li key={f.name} className={cn("flex items-center gap-2.5 text-[13px]", !f.included && "opacity-45")}>
            {f.included ? <Check aria-hidden="true" className="size-4 shrink-0 text-ink" /> : <X aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />}
            <span>
              {f.name}
              {f.included ? null : <span className="sr-only"> (not included)</span>}
            </span>
          </li>
        ))}
      </ul>

      <div>{cta}</div>
    </article>
  );
}

/** Loading placeholder shaped like a PlanCard. */
export function PlanCardSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Loading plan" className={cn("flex min-w-0 flex-col gap-6 rounded-[14px] border border-hair bg-s1 p-6", className)}>
      <div className="flex flex-col gap-2">
        <Skeleton width={128} height={20} />
        <Skeleton width={190} height={14} />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton width={150} height={36} />
        <Skeleton width={120} height={18} />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton width="72%" height={16} />
      </div>
      <Skeleton height={44} radius={999} />
    </div>
  );
}

/* ----------------------------------------------------------------------------- PaperPlanCard */

export type PaperPlanCardProps = {
  name: string;
  amount: string;
  per: string;
  bullets: string[];
  cta: string;
  /** Featured plan: 2px accent border, a badge and the filled button. */
  featured?: boolean;
  badge?: string;
  onAction?: () => void;
};

/** Light plan card for sample apps served by galileo (acme). Quiet buttons except the featured one. */
export function PaperPlanCard({ name, amount, per, bullets, cta, featured = false, badge, onAction }: PaperPlanCardProps) {
  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col gap-3 rounded-[12px] bg-white p-6 text-[#1d1c1a]",
        featured ? "border-2 border-[#3355d6]" : "border border-[#e6e2d8]",
      )}
    >
      {badge ? (
        <span className="absolute -top-3 left-6 rounded-full bg-[#3355d6] px-2.5 py-0.5 text-[11px] font-semibold text-white">{badge}</span>
      ) : null}
      <h4 className="text-[15px] font-semibold">{name}</h4>
      <p className="flex items-baseline gap-1.5">
        <span className="text-[32px] font-bold leading-none tabular-nums">{amount}</span>
        <span className="text-[12.5px] text-[#6b675d]">{per}</span>
      </p>
      <ul className="flex flex-1 flex-col gap-1.5 text-[13px] text-[#45423b]">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAction}
        className={cn(
          "rounded-[8px]! px-[18px] py-[11px] text-[13.5px] font-semibold transition-colors",
          featured ? "bg-[#3355d6] text-white hover:bg-[#2b48b8]" : "bg-[#eef1fb] text-[#3355d6] hover:bg-[#e2e7f8]",
        )}
      >
        {cta}
      </button>
    </article>
  );
}
