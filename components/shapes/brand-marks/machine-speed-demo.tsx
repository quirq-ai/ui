"use client";

import { useState, type MouseEvent } from "react";
import { HOURS_BACK_DEFAULTS, PEOPLE } from "@/lib/fixtures";
import { ActionLog, Caption, ProvenanceNote } from "./kit";
import { PrismArt } from "./art";
import { MSHoursCalculator } from "./machine-speed-calculator";
import {
  MSBlueprintBar,
  MSButton,
  MSCtaBlock,
  MSFooter,
  MSNodeCard,
  MSNodeDot,
  MSPageHead,
  MSPersonCard,
  MSPlanList,
  MSSplitHero,
  MSSurface,
  type MSNode,
  type MSPlanItem,
} from "./machine-speed";

const HOW_WE_WORK: MSPlanItem[] = [
  { lead: "Agentic Audit.", body: "Thirty minutes on how your business actually runs. We name the workflow eating your week, size it in dollars, and send a one-page finding within 24 hours." },
  { lead: "Blueprint Sprint.", body: "One workflow built on your existing stack in two weeks, deployed with monitoring and fallbacks, handed over working." },
  { lead: "Run at machine speed.", body: "We operate what we built. Monthly report, monthly number. Land small, expand on evidence." },
];

const WHAT_WE_DO: MSPlanItem[] = [
  { lead: "Automate (or remove) your SaaS tools.", body: "Agents take over the work your subscriptions were bought for. Cancelled spend is cash." },
  { lead: "Deploy bespoke blueprints.", body: "Proven workflows (sales machine, CFO intelligence, order recovery) adapted to your operation." },
  { lead: "Drive efficiency into your AI spend.", body: "Cost per useful unit of work, instrumented across every model and agent you run." },
  { lead: "Enable product development with agentic tools.", body: "Agentic harnesses wired into the development loop." },
  { lead: "Open new customer acquisition channels.", body: "MCP integrations, skills, agents and loops that reach customers your funnel cannot." },
];

const NODES: MSNode[] = [
  { kind: "Trigger", dot: "#57b6ff", title: "New orders, Shopify", sub: "webhook · every event", foot: "streaming · live" },
  { kind: "Agent node", dot: "#e9eae6", title: "Reconcile payments and inventory", sub: "tools: stripe · netsuite · 3PL", foot: <>model: <b>routed by quirq</b></> },
  { kind: "Conditional", dot: "#a8aba3", title: "Exception found?", sub: "margin, stock or payment mismatch", foot: "2 caught overnight" },
  { kind: "Agent node", dot: "#57b6ff", title: "Recover the order", sub: "requote shipping · retry payment", foot: <b>→ decision to your phone</b>, highlight: true },
  { kind: "Function", dot: "#6b6e67", title: "Update ledger and report", sub: "posts to the monthly number", foot: "✓ done · logged" },
];

const FOOT_LINKS = [
  { label: "Ten-hour test", href: "/machine-speed/calculator" },
  { label: "quirq.ai", href: "/" },
  { label: "hello@example.com", href: "mailto:hello@example.com" },
];

export function MachineSpeedDemo() {
  const [log, setLog] = useState<string | null>(null);
  const advisor = PEOPLE.mira;
  const stop = (msg: string) => (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    setLog(msg);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2.5">
        <Caption>Home · split hero, blueprint, plan lists</Caption>
        <MSSurface>
          <MSPageHead
            onHome={stop("Machine Speed bars → home (demo)")}
            aside={
              <nav aria-label="Machine Speed" className="flex items-center gap-5 text-[13.5px]">
                <a href="/machine-speed/calculator" onClick={stop("Ten-hour test → calculator (demo)")} className="hidden rounded-[3px] text-[#a8aba3] no-underline hover:text-[#e9eae6] sm:inline">
                  Ten-hour test
                </a>
                <MSButton onClick={stop("Book your Agentic Audit (demo)")} className="px-4 py-2 text-[11px]">
                  Book an audit
                </MSButton>
              </nav>
            }
          />
          <MSSplitHero
            ghostAbove={["order recovery.", "cfo intelligence.", "sales machines."]}
            ghostBelow={["subscription audits.", "agent loops.", "background workflows."]}
            heading="We help businesses run at"
            emphasis="machine speed."
            lead="Agentic workflows that hand you back ten hours a week."
            body="Your software already moves at machine speed. Your operations do not. We build and run agentic workflows on the stack you already own, and every workflow reports the money it made or saved."
            art={<PrismArt kind="hero-prism" uid="ms-hero-prism" className="absolute inset-0 h-full w-full [&>svg]:scale-125" />}
          />

          <div className="mx-[clamp(14px,2vw,20px)] mb-6 overflow-hidden rounded-[12px] border border-[rgba(233,234,230,0.12)] bg-[#0b0d0a]">
            <MSBlueprintBar name="order-recovery" />
            <div tabIndex={0} role="group" aria-label="Order recovery blueprint, scrolls sideways" className="scroll-thin overflow-x-auto focus-visible:outline-offset-[-2px]">
              <div className="flex w-max items-center gap-0 bg-[radial-gradient(rgba(233,234,230,0.07)_1px,transparent_1px)] bg-[length:22px_22px] px-5 py-6">
                {NODES.map((n, i) => (
                  <div key={n.title} className="flex items-center">
                    <MSNodeCard node={n} />
                    {i < NODES.length - 1 ? (
                      <span aria-hidden="true" className="flex w-8 items-center">
                        <span className="h-px flex-1 bg-[rgba(87,182,255,0.55)]" />
                        <span className="size-1.5 rounded-full bg-[rgba(87,182,255,0.85)]" />
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgba(233,234,230,0.12)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#808379]">
              <span className="flex items-center gap-2"><MSNodeDot color="#57b6ff" /> Trigger or action</span>
              <span className="flex items-center gap-2"><MSNodeDot color="#e9eae6" /> Agent node</span>
              <span className="flex items-center gap-2"><MSNodeDot color="#a8aba3" /> Conditional</span>
              <span className="flex items-center gap-2"><MSNodeDot color="#6b6e67" /> Function</span>
            </div>
          </div>

          <div className="grid gap-8 px-[clamp(18px,4vw,36px)] pb-8 lg:grid-cols-2">
            <section>
              <h3 className="mb-4 text-[19px] font-semibold tracking-[-0.01em]">How we work</h3>
              <MSPlanList items={HOW_WE_WORK} />
            </section>
            <section>
              <h3 className="mb-4 text-[19px] font-semibold tracking-[-0.01em]">What we do</h3>
              <MSPlanList items={WHAT_WE_DO} />
            </section>
          </div>
        </MSSurface>
      </div>

      <div className="space-y-2.5">
        <Caption>Calculator with disclosures · {HOURS_BACK_DEFAULTS.title}</Caption>
        <MSSurface>
          <MSPageHead
            onHome={stop("Machine Speed bars → home (demo)")}
            aside={
              <a href="/machine-speed" onClick={stop("Back to Machine Speed (demo)")} className="rounded-[3px] text-[13.5px] text-[#a8aba3] no-underline hover:text-[#e9eae6]">
                Back to Machine Speed
              </a>
            }
          />
          <div className="mx-auto max-w-[660px] px-[clamp(16px,4vw,24px)] pt-8 pb-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#808379]">The ten-hour test</p>
            <p role="heading" aria-level={3} className="mt-2 text-[clamp(26px,3.6vw,34px)] font-semibold leading-[1.18] tracking-[-0.02em]">
              Get 10 hours back
            </p>
            <p className="mt-3 mb-7 text-[15px] leading-[1.7] text-[#a8aba3]">
              An estimate of what the repeating work in your business costs you, and how much of your week you could get back. Default: {HOURS_BACK_DEFAULTS.hoursPerWeek} hrs × {Math.round(HOURS_BACK_DEFAULTS.automationShare * 100)}% = {HOURS_BACK_DEFAULTS.resultHours} hours.
            </p>
            <MSHoursCalculator defaultHours={HOURS_BACK_DEFAULTS.hoursPerWeek} />
            <p className="mt-7 border-t border-[rgba(233,234,230,0.12)] pt-5 text-[12.5px] leading-[1.7] text-[#808379]">
              Method: work is counted per finished unit against a definition of done and costed all-in. These figures are an illustration from the numbers you entered; nothing here has been measured in your business. The result is hours, not quirqs. Assumes 48 working weeks.
            </p>
            <ProvenanceNote kind="illustrative" className="mt-3" />
          </div>
        </MSSurface>
      </div>

      <div className="space-y-2.5">
        <Caption>CTA block · person card · footer · hover a button for pure white</Caption>
        <MSSurface>
          <div className="grid gap-5 p-[clamp(14px,3vw,28px)] lg:grid-cols-[1.4fr_1fr]">
            <MSCtaBlock
              heading="Agentic workflows that hand you back ten hours a week."
              cta={
                <MSButton href="https://example.com/machine-speed/audit" external onClick={stop("Book your Agentic Audit ↗ example.com (demo)")}>
                  Book your Agentic Audit
                </MSButton>
              }
            />
            <MSPersonCard
              name={advisor.name.split(" ")[0]}
              tagline={
                <>
                  Advised companies to generate $48M in sales.
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#808379]">Fictional advisor · illustrative figure</span>
                </>
              }
              cta={
                <MSButton onClick={stop(`30 mins with ${advisor.name.split(" ")[0]} (demo)`)}>30 mins with {advisor.name.split(" ")[0]}</MSButton>
              }
            />
          </div>
          <MSFooter
            links={FOOT_LINKS}
            onNavigate={(label, e) => {
              e.preventDefault();
              setLog(`Footer link: ${label} (demo)`);
            }}
          />
        </MSSurface>
      </div>

      <ActionLog message={log} idle="Click a button or link to try it" />
    </div>
  );
}
