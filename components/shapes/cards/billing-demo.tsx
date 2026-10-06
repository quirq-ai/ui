"use client";

import { useState } from "react";
import { Building2, CircleAlert, RotateCw, TriangleAlert } from "lucide-react";
import { BILLING, BILLING_OVERDUE, BILLING_RESULTS } from "@/lib/fixtures";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { BillingNotice, PaymentMethodCard, PaymentMethodsEmpty, SubscriptionSummary, UpgradeFallback, UpgradeSummary } from "./billing";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

const dmy = (iso: string) => formatDate(iso, { withYear: true, weekday: false });
const PERIOD = `${dmy("2026-10-02T00:00:00Z")} to ${dmy(BILLING.nextInvoiceAt)}`;

type Card = { id: string; brand: string; last4: string; expMonth: number; expYear: number; label: string };

const START_CARDS: Card[] = [
  { id: "pm_visa", brand: "Visa", last4: BILLING.paymentMethod?.last4 ?? "4242", expMonth: BILLING.paymentMethod?.expMonth ?? 12, expYear: BILLING.paymentMethod?.expYear ?? 2028, label: "Test card" },
  { id: "pm_mc", brand: "Mastercard", last4: "4444", expMonth: 8, expYear: 2028, label: "Test card" },
];

export function BillingDemo() {
  const later = useLater();
  const [summaryState, setSummaryState] = useState<"ready" | "loading" | "error">("error");
  const [confirm, setConfirm] = useState<"idle" | "confirming" | "done">("idle");
  const [cards, setCards] = useState<Card[]>(START_CARDS);
  const [defaultId, setDefaultId] = useState("pm_visa");
  const [processing, setProcessing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  // when the default card is deleted, the first remaining card becomes the default
  const effectiveDefault = cards.some((c) => c.id === defaultId) ? defaultId : cards[0]?.id;

  return (
    <DemoStack>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-org">Mock billing data. Amounts are illustrative and nothing is charged.</p>
      <DemoSection title="Subscription · active, trial active, payment overdue, cancelled">
        <div className="grid gap-4 md:grid-cols-3">
          <Specimen label="Active">
            <SubscriptionSummary
              className="h-full"
              plan={BILLING.plan}
              state="Active"
              period={PERIOD}
              seats={BILLING.seats}
              footnote={`Renews on ${BILLING.nextInvoice}.`}
              action={
                <Button size="sm" variant="danger" block>
                  Cancel plan
                </Button>
              }
            />
          </Specimen>
          <Specimen label="Trial active">
            <SubscriptionSummary
              className="h-full"
              plan={BILLING.plan}
              state={BILLING.state}
              period={PERIOD}
              seats={BILLING.seats}
              footnote={`Trial ends ${BILLING.trialEnds}, ${BILLING.trialDaysLeft} days left. Add a payment method to keep hosted spaces running.`}
            />
          </Specimen>
          <Specimen label="Payment overdue">
            <SubscriptionSummary
              className="h-full"
              plan={BILLING_OVERDUE.plan}
              state={BILLING_OVERDUE.state}
              period={PERIOD}
              amountDue={BILLING_OVERDUE.amountDue}
              footnote="Payment needs attention. Update your card to keep hosted spaces running."
              action={
                <Button size="sm" variant="primary" block>
                  Update card
                </Button>
              }
            />
          </Specimen>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Specimen label="Cancelled">
            <SubscriptionSummary
              className="h-full"
              plan={BILLING.plan}
              state="Cancelled"
              period={PERIOD}
              footnote={`Hosted spaces keep running until ${BILLING.nextInvoice}, then stop.`}
              action={
                <Button size="sm" block>
                  Resubscribe
                </Button>
              }
            />
          </Specimen>
          <Specimen label="Loading">
            <SubscriptionSummary plan="" state="Active" period="" footnote="" loading />
          </Specimen>
          <Specimen label={summaryState === "error" ? "Error · retry" : summaryState === "loading" ? "Retrying" : "Recovered"}>
            <SubscriptionSummary
              plan={BILLING.plan}
              state="Active"
              period={PERIOD}
              footnote={`Renews on ${BILLING.nextInvoice}.`}
              loading={summaryState === "loading"}
              error={summaryState === "error" ? "Could not load your subscription. The billing service did not answer." : null}
              onRetry={() => {
                setSummaryState("loading");
                later(() => setSummaryState("ready"), 1100);
              }}
            />
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Notices · org managed, redundant plan, billing issue">
        <div className="grid gap-4 md:grid-cols-3">
          <BillingNotice tone="info" centered icon={<Building2 />} title="Billing is managed by Acme Robotics">
            Your org covers hosted spaces for every member. Ask an owner to change the plan.
          </BillingNotice>
          <BillingNotice
            tone="warn"
            icon={<TriangleAlert />}
            title="You are paying twice"
            action={
              <Button size="sm" variant="danger">
                Cancel personal plan
              </Button>
            }
          >
            You have an active personal Managed plan. Your org already covers you, so you can cancel it to avoid being charged.
          </BillingNotice>
          <BillingNotice tone="danger" icon={<CircleAlert />} title="Organization subscription issue">
            Your org&apos;s payment is overdue. Contact an org owner to resolve the billing issue.
          </BillingNotice>
        </div>
      </DemoSection>

      <DemoSection title="Upgrade invoice · active, trial active, fallback">
        <div className="grid gap-4 md:grid-cols-3">
          <Specimen label={confirm === "done" ? "Confirmed" : "Active · breakdown · confirm"}>
            {confirm === "done" ? (
              <UpgradeFallback
                title={BILLING_RESULTS.subscriptionStarted.title}
                action={
                  <Button size="sm" variant="subtle" onClick={() => setConfirm("idle")}>
                    Show the preview again
                  </Button>
                }
              >
                Pro is active. You paid {formatCurrency(19.2)} today. Mock result, nothing was charged.
              </UpgradeFallback>
            ) : (
              <UpgradeSummary
                schedule="Bills monthly on the 2nd"
                lines={[
                  { label: `Proration for Basic, ${formatDate("2026-10-02", { weekday: false })} to ${dmy("2026-11-01")}`, amount: -12.4 },
                  { label: "Proration for Pro", amount: 31.6 },
                ]}
                subtotal={19.2}
                total={19.2}
                confirming={confirm === "confirming"}
                onConfirm={() => {
                  setConfirm("confirming");
                  later(() => setConfirm("done"), 1300);
                }}
              />
            )}
          </Specimen>
          <Specimen label="Trial active · nothing due today">
            <UpgradeSummary
              schedule="Bills monthly on the 16th"
              lines={[]}
              subtotal={0}
              total={0}
              trialNote={`Nothing due today: Pro pricing starts when your trial ends on ${BILLING.trialEnds}.`}
            />
          </Specimen>
          <div className="flex flex-col gap-4">
            <Specimen label="Preview loading">
              <UpgradeSummary schedule="Bills monthly on the 2nd" lines={[]} subtotal={0} total={0} loading />
            </Specimen>
            <Specimen label="Fallback · no upgrade">
              <UpgradeFallback title="No upgrade available">You are already on the highest plan for personal spaces.</UpgradeFallback>
            </Specimen>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Specimen label="Requires a payment method">
            <UpgradeSummary
              schedule="Bills monthly on the 2nd"
              lines={[{ label: "Pro, first month", amount: 49 }]}
              subtotal={49}
              total={49}
              needsPaymentMethod
            />
          </Specimen>
          <Specimen label="Fallback · something went wrong">
            <UpgradeFallback
              title="Something went wrong"
              action={
                <Button size="sm" variant="secondary">
                  Try again
                </Button>
              }
            >
              The upgrade preview could not be loaded. Your plan has not changed.
            </UpgradeFallback>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection
        title="Payment methods · set default, delete, empty"
        aside={
          <Button
            size="sm"
            variant="subtle"
            leadingIcon={<RotateCw />}
            onClick={() => {
              setCards(START_CARDS);
              setDefaultId("pm_visa");
              setMessage("");
            }}
          >
            Reset cards
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex min-h-[230px] flex-col gap-2">
            {cards.length === 0 ? (
              <PaymentMethodsEmpty
                adding={adding}
                onAdd={() => {
                  setAdding(true);
                  later(() => {
                    setAdding(false);
                    setCards([START_CARDS[0]]);
                    setDefaultId(START_CARDS[0].id);
                    setMessage(BILLING_RESULTS.paymentMethodAdded.title);
                  }, 1000);
                }}
              />
            ) : (
              cards.map((c) => (
                <PaymentMethodCard
                  key={c.id}
                  brand={c.brand}
                  last4={c.last4}
                  expMonth={c.expMonth}
                  expYear={c.expYear}
                  label={c.label}
                  isDefault={c.id === effectiveDefault}
                  processing={processing === c.id}
                  onSetDefault={() => {
                    setProcessing(c.id);
                    later(() => {
                      setProcessing(null);
                      setDefaultId(c.id);
                      setMessage(`${c.brand} ending ${c.last4} is now the default`);
                    }, 1000);
                  }}
                  onDelete={() => {
                    setProcessing(c.id);
                    later(() => {
                      setProcessing(null);
                      setCards((list) => list.filter((x) => x.id !== c.id));
                      setMessage(`${c.brand} ending ${c.last4} removed`);
                    }, 900);
                  }}
                />
              ))
            )}
            <p role="status" className="min-h-5 font-mono text-[11px] text-ink-faint">
              {message}
            </p>
          </div>
          <Specimen label="Empty · dashed box">
            <PaymentMethodsEmpty />
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
