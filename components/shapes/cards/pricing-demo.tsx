"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { PRICING_NOTE } from "@/lib/fixtures";
import { Button, ButtonLink } from "@/components/ui/button";
import { PaperPlanCard, PlanCard, PlanCardSkeleton, PricingTierCard, type PlanFeature } from "./pricing";
import { useLater } from "./_hooks";
import { DemoSection, DemoStack, Specimen } from "./_demo";

type PlanSpec = { id: "basic" | "pro" | "business"; name: string; subtitle: string; monthly: number; annual: number; features: PlanFeature[] };

const PLANS: PlanSpec[] = [
  {
    id: "basic",
    name: "Basic",
    subtitle: "For trying hosted spaces",
    monthly: 19,
    annual: 190,
    features: [
      { name: "1 always-on space", included: true },
      { name: "7-day space uptime", included: true },
      { name: "Usage and cost telemetry", included: true },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For builders running agents daily",
    monthly: 49,
    annual: 490,
    features: [
      { name: "3 always-on spaces", included: true },
      { name: "30-day space uptime", included: true },
      { name: "Usage and cost telemetry", included: true },
      { name: "Priority support", included: true },
    ],
  },
  {
    id: "business",
    name: "Business",
    subtitle: "For teams sharing spaces",
    monthly: 99,
    annual: 990,
    features: [
      { name: "10 always-on spaces", included: true },
      { name: "SSO and audit log", included: true },
      { name: "Shared projects", included: true },
      { name: "Priority support", included: true },
    ],
  },
];

const PRO = PLANS[1];

export function PricingDemo() {
  const later = useLater();
  const [annual, setAnnual] = useState(false);
  const [current, setCurrent] = useState<PlanSpec["id"] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [overdue, setOverdue] = useState<"overdue" | "paying" | "paid">("overdue");
  const [preview, setPreview] = useState<"ready" | "upgrading" | "done">("ready");

  return (
    <DemoStack>
      <DemoSection title="Tier cards · 2 up, 4 up when wide · equal height">
        <div className="@container">
        <div className="grid items-stretch gap-4 @xl:grid-cols-2 @6xl:grid-cols-4">
          <Specimen label="Self-hosted · $0">
            <PricingTierCard
              className="h-full"
              name="Self-hosted"
              tag="Free · open source"
              tone="blu"
              amount="$0"
              per=" /mo"
              bullets={["Unlimited spaces on your own machine", "Graph, timeline and sessions", "Any harness, any model", "Community support"]}
              cta={<div className="truncate rounded-full border border-white/20 px-3 py-3 text-center font-mono text-[10px] text-ink-dim">$ curl -fsSL quirq.ai/install | sh</div>}
            />
          </Specimen>
          <Specimen label="Pro · $20 · highlighted">
            <PricingTierCard
              className="h-full"
              highlighted
              name="Pro"
              tag="Managed"
              tone="grn"
              amount="$20"
              per=" /mo"
              bullets={["30 hosted spaces", "One-click deploy, hosted by us", "Custom templates and MCP integrations", "Spend tracking and agent comparison"]}
              cta={
                <ButtonLink href="#pricing" variant="primary" block>
                  Get started
                </ButtonLink>
              }
              note="30 days free"
            />
          </Specimen>
          <Specimen label="Max · $100">
            <PricingTierCard
              className="h-full"
              name="Max"
              tag="Managed"
              tone="grn"
              amount="$100"
              per=" /mo"
              bullets={["500 hosted spaces", "SSO, SAML and full audit trails", "Email and Slack support", "Priority capacity"]}
              cta={
                <ButtonLink href="#pricing" variant="ghost" block>
                  Get started
                </ButtonLink>
              }
              note="30 days free"
            />
          </Specimen>
          <Specimen label="Licensed · accent border">
            <PricingTierCard
              className="h-full"
              accent
              name="Licensed"
              tag="Enterprise"
              tone="org"
              amount="Custom"
              bullets={["The managed product on your infra", "White-label: your brand throughout", "Deployment support and pinned releases", "Named contact and response SLA"]}
              cta={
                <ButtonLink href="#pricing" variant="ghost" block>
                  Get in touch
                </ButtonLink>
              }
            />
          </Specimen>
        </div>
        </div>
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-org">{PRICING_NOTE}</p>
      </DemoSection>

      <DemoSection
        title="Plan cards · join plan"
        aside={
          <Button
            size="sm"
            variant="subtle"
            leadingIcon={<RotateCw />}
            onClick={() => {
              setCurrent(null);
              setBusy(null);
            }}
          >
            Reset
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <Specimen key={p.id} label={current === p.id ? "Current · active" : p.id === "pro" ? "Highlighted · trial" : "Default"}>
              <PlanCard
                className="h-full"
                id={`pl-${p.id}`}
                name={p.name}
                subtitle={p.subtitle}
                monthly={p.monthly}
                annual={p.annual}
                features={p.features}
                billedAnnually={annual}
                onBilledAnnuallyChange={setAnnual}
                state={current === p.id ? "current" : p.id === "pro" ? "highlighted" : "default"}
                trial={current === null}
                busy={busy === p.id}
                locked={current !== null || (busy !== null && busy !== p.id)}
                onAction={() => {
                  setBusy(p.id);
                  later(() => {
                    setBusy(null);
                    setCurrent(p.id);
                  }, 1200);
                }}
              />
            </Specimen>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">Prices are illustrative. Join a plan to see Subscribing… and then Current plan.</p>
      </DemoSection>

      <DemoSection title="Plan card states · overdue, current, subscribing, upgrade preview, loading">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Specimen label={overdue === "paid" ? "Paid · current" : "Payment overdue · pay now"}>
            <PlanCard
              className="h-full"
              id="pl-overdue"
              name={PRO.name}
              subtitle={PRO.subtitle}
              monthly={PRO.monthly}
              annual={PRO.annual}
              features={PRO.features}
              billedAnnually={false}
              state={overdue === "paid" ? "current" : "overdue"}
              busy={overdue === "paying"}
              onAction={() => {
                setOverdue("paying");
                later(() => setOverdue("paid"), 1200);
              }}
            />
          </Specimen>
          <Specimen label="Current · active plan">
            <PlanCard className="h-full" id="pl-current" name={PRO.name} subtitle={PRO.subtitle} monthly={PRO.monthly} annual={PRO.annual} features={PRO.features} billedAnnually={false} state="current" />
          </Specimen>
          <Specimen label="Subscribing · join in flight">
            <PlanCard className="h-full" id="pl-busy" name={PRO.name} subtitle={PRO.subtitle} monthly={PRO.monthly} annual={PRO.annual} features={PRO.features} billedAnnually={false} state="highlighted" trial busy />
          </Specimen>
          <Specimen label={preview === "done" ? "Upgraded · current" : "Upgrade preview · prorated"}>
            <PlanCard
              className="h-full"
              id="pl-upgrade"
              name={PRO.name}
              subtitle="Upgrade from Basic"
              monthly={PRO.monthly}
              annual={PRO.annual}
              features={PRO.features}
              billedAnnually={false}
              state={preview === "done" ? "current" : "upgrade"}
              amountDueToday={19.2}
              busy={preview === "upgrading"}
              onAction={() => {
                setPreview("upgrading");
                later(() => setPreview("done"), 1300);
              }}
            />
          </Specimen>
          <Specimen label="Upgrade preview · loading">
            <PlanCard className="h-full" id="pl-upgrade-loading" name={PRO.name} subtitle="Upgrade from Basic" monthly={PRO.monthly} annual={PRO.annual} features={PRO.features} billedAnnually={false} state="upgrade" amountDueToday={null} />
          </Specimen>
          <Specimen label="Skeleton card">
            <PlanCardSkeleton className="h-full" />
          </Specimen>
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">Prices are illustrative. Pay now and Upgrade to Pro run a sample flow; nothing is charged.</p>
      </DemoSection>
      <DemoSection title="Sample app plans · served by galileo">
        <div className="overflow-hidden rounded-[14px] border border-hair-strong">
          <div className="flex items-center gap-2 border-b border-hair bg-s2 px-3 py-2">
            <span aria-hidden="true" className="flex gap-1.5">
              <i className="size-2.5 rounded-full bg-white/15" />
              <i className="size-2.5 rounded-full bg-white/15" />
              <i className="size-2.5 rounded-full bg-white/15" />
            </span>
            <span className="mx-auto truncate rounded-[6px] bg-black/40 px-3 py-0.5 font-mono text-[11px] text-ink-dim">acme.localhost:4100/pricing</span>
          </div>
          <div className="grid gap-5 bg-[#f6f4ee] p-6 pt-8 md:grid-cols-3">
            <PaperPlanCard name="Free" amount="$0" per="per person" bullets={["Up to 3 people", "Notes and backlinks", "30 days of history"]} cta="Start free" />
            <PaperPlanCard
              featured
              badge="Most teams pick this"
              name="Team"
              amount="$8"
              per="per person / month"
              bullets={["Unlimited people", "Decision lists per project", "Full history"]}
              cta="Start a trial"
            />
            <PaperPlanCard name="Business" amount="$15" per="per person / month" bullets={["Everything in Team", "SSO and audit log", "Priority support"]} cta="Talk to us" />
          </div>
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">acme is a sample app with illustrative prices.</p>
      </DemoSection>
    </DemoStack>
  );
}
