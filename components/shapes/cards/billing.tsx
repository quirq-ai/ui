// Billing summary cards: SubscriptionSummary (key and value rows with the subscription state
// chip), BillingNotice (org-managed, redundant plan and billing issue notices), UpgradeSummary
// (proration lines, subtotal and total with one confirm), PaymentMethodCard (card row with a
// kebab menu) and PaymentMethodsEmpty. Server-safe; CardMenu brings its own client boundary.
import type { ReactNode } from "react";
import { CircleAlert, CreditCard, EllipsisVertical, ExternalLink, RotateCw, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton, Spinner } from "@/components/ui/loaders";
import { StateChip, type StateOf } from "@/components/ui/status";
import { CardMenu } from "./card-menu";

/** Subscription words. "Canceled" is the fixture spelling; both spellings render the shared "Cancelled" chip. */
export type SubscriptionWord = "Active" | "Trial active" | "Payment overdue" | "Cancelled" | "Canceled";

const SUB_STATE: Record<SubscriptionWord, StateOf<"subscription">> = {
  Active: "active",
  "Trial active": "trial_active",
  "Payment overdue": "payment_overdue",
  Cancelled: "cancelled",
  Canceled: "cancelled",
};

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-hair-soft py-2 last:border-b-0">
      <dt className="text-[12.5px] text-ink-dim">{term}</dt>
      <dd className="text-right text-[13px] text-ink">{children}</dd>
    </div>
  );
}

/* ----------------------------------------------------------------------------- SubscriptionSummary */

export type SubscriptionSummaryProps = {
  plan: string;
  state: SubscriptionWord;
  /** "2 Oct 2026 to 1 Nov 2026" */
  period: string;
  /** Line under the rows: renews, trial ends, or what needs attention. */
  footnote: ReactNode;
  seats?: number;
  amountDue?: number | null;
  action?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
};

/** Plan, status, billing period and renewal as key and value rows. */
export function SubscriptionSummary({
  plan,
  state,
  period,
  footnote,
  seats,
  amountDue,
  action,
  loading = false,
  error,
  onRetry,
  title = "Your subscription",
  className,
}: SubscriptionSummaryProps) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-3 rounded-[14px] border bg-s1 p-5", state === "Payment overdue" && !loading && !error ? "border-org/35" : "border-hair", className)}>
      <h4 className="text-[13px] font-medium text-ink">{title}</h4>
      {loading ? (
        <div role="status" aria-label="Loading subscription" className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton width={80} height={12} />
              <Skeleton width={i === 1 ? 72 : 110} height={i === 1 ? 20 : 12} radius={i === 1 ? 6 : undefined} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-[10px] border border-red/40 bg-red/[0.06] p-4 text-center">
          <p className="text-[12.5px] text-[#ff7a70]">{error}</p>
          <Button size="sm" leadingIcon={<RotateCw />} onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <dl>
            <Row term="Plan">{plan}</Row>
            <Row term="Status">
              <StateChip kind="subscription" state={SUB_STATE[state]} />
            </Row>
            <Row term="Billing period">
              <span className="font-mono text-[12px] tabular-nums">{period}</span>
            </Row>
            {seats !== undefined ? <Row term="Seats">{seats}</Row> : null}
            {amountDue !== undefined ? (
              <Row term="Amount due">
                <span className={cn("font-mono tabular-nums", amountDue === null && "text-ink-faint")}>{formatCurrency(amountDue)}</span>
              </Row>
            ) : null}
          </dl>
          <p className={cn("text-[12px]", state === "Payment overdue" ? "text-org" : "text-ink-dim")}>{footnote}</p>
          {action ? <div className="pt-1">{action}</div> : null}
        </>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------------- BillingNotice */

export type BillingNoticeProps = {
  tone: "info" | "warn" | "danger";
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  /** Centered layout for "managed by your org" notices. */
  centered?: boolean;
  className?: string;
};

const noticeTone = {
  info: "border-hair bg-s1 text-ink",
  warn: "border-org/40 bg-org/[0.06] text-org",
  danger: "border-red/45 bg-red/[0.07] text-[#ff7a70]",
} as const;

/** Account-level billing notice. */
export function BillingNotice({ tone, icon, title, children, action, centered = false, className }: BillingNoticeProps) {
  return (
    <div role={tone === "danger" ? "alert" : undefined} className={cn("rounded-[12px] border p-4", noticeTone[tone], centered && "text-center", className)}>
      <div className={cn("flex gap-2.5", centered ? "flex-col items-center" : "items-start")}>
        <span aria-hidden="true" className={cn("shrink-0 [&_svg]:size-4", centered ? "grid size-9 place-items-center rounded-full bg-s3 text-ink-dim" : "mt-0.5")}>
          {icon ?? <CircleAlert />}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium">{title}</p>
          <p className="mt-1 text-[12px] leading-[1.55] text-ink-dim">{children}</p>
        </div>
      </div>
      {action ? <div className={cn("mt-3", centered ? "flex justify-center" : "")}>{action}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- UpgradeSummary */

export type InvoiceLine = { label: ReactNode; amount: number };

export type UpgradeSummaryProps = {
  /** "Bills monthly on the 2nd" */
  schedule: string;
  lines: InvoiceLine[];
  subtotal: number;
  total: number;
  /** Trial active: nothing is due today; this sentence replaces the breakdown. */
  trialNote?: ReactNode;
  loading?: boolean;
  confirming?: boolean;
  /** Without a card the confirm is replaced by an Add payment method action. */
  needsPaymentMethod?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  onAddPayment?: () => void;
  className?: string;
};

/** Upgrade invoice preview: proration lines, subtotal and total, then one confirm. */
export function UpgradeSummary({
  schedule,
  lines,
  subtotal,
  total,
  trialNote,
  loading = false,
  confirming = false,
  needsPaymentMethod = false,
  confirmLabel = "Confirm upgrade",
  onConfirm,
  onAddPayment,
  className,
}: UpgradeSummaryProps) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair bg-s1 p-5", className)}>
      <header className="flex items-baseline justify-between gap-3">
        <h4 className="text-[13px] font-medium text-ink">Summary</h4>
        <span className="text-[12px] text-ink-dim">{schedule}</span>
      </header>
      {trialNote ? (
        <p className="rounded-[10px] border border-blu/30 bg-blu/[0.06] p-3 text-[12.5px] leading-[1.55] text-ink">{trialNote}</p>
      ) : loading ? (
        <div role="status" aria-label="Loading the upgrade preview" className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between gap-4">
              <Skeleton width={i === 2 ? "30%" : "58%"} height={12} />
              <Skeleton width={56} height={12} />
            </div>
          ))}
        </div>
      ) : (
        <dl className="text-[13px]">
          {lines.map((l, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-1.5">
              <dt className="min-w-0 text-ink-dim">{l.label}</dt>
              <dd className={cn("shrink-0 font-mono tabular-nums", l.amount < 0 ? "text-grn" : "text-ink")}>{formatCurrency(l.amount)}</dd>
            </div>
          ))}
          <div className="mt-2 flex justify-between gap-4 border-t border-hair-soft pt-3">
            <dt className="text-ink-dim">Subtotal</dt>
            <dd className="font-mono tabular-nums text-ink">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 pt-1.5">
            <dt className="font-medium text-ink">Total due today</dt>
            <dd className="font-mono text-[15px] font-semibold tabular-nums text-ink">{formatCurrency(total)}</dd>
          </div>
        </dl>
      )}
      {needsPaymentMethod ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-org">Add a payment method before you upgrade.</p>
          <Button block leadingIcon={<CreditCard />} onClick={onAddPayment}>
            Add payment method
          </Button>
        </div>
      ) : (
        <Button variant="primary" block loading={confirming} loadingLabel="Upgrading…" disabled={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      )}
    </section>
  );
}

/** Fallback when there is nothing to preview or the preview failed. */
export function UpgradeFallback({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col items-center gap-3 rounded-[14px] border border-dashed border-hair-strong bg-s1/70 p-6 text-center">
      <h4 className="text-[14px] font-medium text-ink">{title}</h4>
      <p className="max-w-[36ch] text-[12.5px] leading-[1.55] text-ink-dim">{children}</p>
      {action}
    </section>
  );
}

/* ----------------------------------------------------------------------------- PaymentMethodCard */

export type PaymentMethodCardProps = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  /** "Test card" for fixtures; shown as a quiet tag. */
  label?: string;
  processing?: boolean;
  onSetDefault?: () => void;
  onDelete?: () => void;
  className?: string;
};

/** One saved card with Default badge, expiry and a kebab menu. */
export function PaymentMethodCard({ brand, last4, expMonth, expYear, isDefault, label, processing = false, onSetDefault, onDelete, className }: PaymentMethodCardProps) {
  const name = `${brand} ending ${last4}`;
  return (
    <div className={cn("flex min-w-0 items-start justify-between gap-3 rounded-[10px] border border-hair bg-s2 p-3", className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        <CreditCard aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-dim" />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
            <span>
              {brand} <span className="font-mono tracking-[0.08em]">•••• {last4}</span>
            </span>
            {isDefault ? <Badge size="xs">Default</Badge> : null}
            {label ? (
              <Badge size="xs" tone="org" variant="outline" mono>
                {label}
              </Badge>
            ) : null}
          </p>
          <p className="mt-0.5 font-mono text-[11.5px] tabular-nums text-ink-faint">
            Expires {String(expMonth).padStart(2, "0")}/{expYear}
          </p>
        </div>
      </div>
      {processing ? (
        <span className="grid size-8 place-items-center text-ink-dim">
          <Spinner size="sm" label={`Updating ${name}`} />
        </span>
      ) : (
        <CardMenu
          aria-label={`Actions for ${name}`}
          trigger={<EllipsisVertical aria-hidden="true" />}
          items={[
            ...(isDefault ? [] : [{ id: "default", label: "Set as default", icon: <Star />, onSelect: onSetDefault }]),
            { id: "delete", label: "Delete", icon: <Trash2 />, danger: true, onSelect: onDelete },
          ]}
        />
      )}
    </div>
  );
}

/** Dashed empty state for the payment methods list. */
export function PaymentMethodsEmpty({ onAdd, adding = false }: { onAdd?: () => void; adding?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-hair-strong p-5 text-center">
      <CreditCard aria-hidden="true" className="size-7 text-ink-faint" />
      <p className="text-[12.5px] text-ink-dim">No payment methods added</p>
      <Button size="sm" variant="subtle" leadingIcon={<ExternalLink />} loading={adding} loadingLabel="Opening…" onClick={onAdd}>
        Add payment method
      </Button>
    </div>
  );
}
