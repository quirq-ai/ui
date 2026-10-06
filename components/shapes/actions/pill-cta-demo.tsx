"use client";

// Live demo for the pill CTA shape: every variant in its product context, the hover, focus
// and disabled states, galileo's Add with its in-flight state, and a click log.
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Lockup } from "@/components/brand/mark";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status";
import { GALILEO, GALILEO_SOURCES, PRICING_NOTE, PRICING_PLANS } from "@/lib/fixtures";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AdvisorCard, CtaBlock, PillCta } from "./pill-cta";
import { Caption, DemoSection, DemoStack, Specimen, Still } from "./demo-kit";

type Log = { label: string; count: number };

export function PillCtaDemo() {
  const [log, setLog] = useState<Log>({ label: "", count: 0 });
  const click = useCallback((label: string) => () => setLog((l) => ({ label, count: l.count + 1 })), []);

  return (
    <DemoStack>
      <ClickReadout log={log} />

      <DemoSection title="Variants">
        <Specimen label="Primary · ink pill" note="One per page. The deploy rung always reads Get started.">
          <PillCta onClick={click("Get started")}>Get started</PillCta>
        </Specimen>
        <Specimen label="Ghost · white/40 border" note="The primary's partner: whitepaper, docs, research.">
          <PillCta variant="ghost" onClick={click("Read the paper")}>
            Read the paper
          </PillCta>
        </Specimen>
        <Specimen label="Hero pair · primary + ghost">
          <div className="flex flex-wrap gap-4">
            <PillCta onClick={click("Get started")}>Get started</PillCta>
            <PillCta variant="ghost" onClick={click("Whitepaper")}>
              Whitepaper
            </PillCta>
          </div>
        </Specimen>

        <Specimen label="Green mono · marketplace card" layout="block">
          <AgentCard onCreate={click("Create agent")} />
        </Specimen>
        <Specimen label="Nav mono · top bar" layout="block">
          <NavBar onStart={click("Get started (nav)")} />
        </Specimen>
        <Specimen label="Lime Add · galileo Sources" layout="block">
          <GalileoAdd onAdd={click("Add")} />
        </Specimen>
      </DemoSection>

      <DemoSection title="Machine Speed square mono" cols={2}>
        <Specimen label="CTA block" layout="block">
          <CtaBlock
            headingId="pill-ms-cta"
            headingLevel="h4"
            kicker="Machine Speed"
            heading="Agentic workflows that hand you back ten hours a week."
            action={
              <PillCta variant="square" trailing="↗" onClick={click("Book your agentic audit")}>
                Book your agentic audit
              </PillCta>
            }
            note="Sample copy. Hours are illustrative, not a measurement."
          />
        </Specimen>
        <Specimen label="Work with card" layout="block">
          <AdvisorCard
            headingId="pill-ms-work"
            headingLevel="h4"
            media={<Avatar name="Mira Okafor" size="lg" />}
            heading="Work with Mira"
            tagline="Scopes, builds and runs agentic workflows with operations teams."
            action={
              <PillCta variant="square" size="compact" onClick={click("30 mins with Mira")}>
                30 mins with Mira
              </PillCta>
            }
          />
        </Specimen>
      </DemoSection>

      <DemoSection title="Sizes and widths" cols={2}>
        <Specimen label="Compact · md · lg">
          <PillCta size="compact" onClick={click("Get started (compact)")}>
            Get started
          </PillCta>
          <PillCta size="md" onClick={click("Get started (md)")}>
            Get started
          </PillCta>
          <PillCta size="lg" onClick={click("Get started (lg)")}>
            Get started
          </PillCta>
        </Specimen>
        <Specimen label="Wide · layers CTA · min 400px" layout="block">
          <PillCta wide variant="ghost" onClick={click("Run on your infra")}>
            Run on your infra
          </PillCta>
        </Specimen>
        <Specimen label="Full width compact · pricing" className="sm:col-span-2" layout="block">
          <PricingRow onPick={(label) => click(label)()} />
        </Specimen>
      </DemoSection>

      <DemoSection title="States" cols={4}>
        <Specimen label="Default">
          <PillCta onClick={click("Get started")}>Get started</PillCta>
        </Specimen>
        <Specimen label="Hover · lifts 2px" note="Machine Speed square: no lift, turns pure white.">
          <Still>
            <PillCta preview="hover">Get started</PillCta>
            <PillCta variant="ghost" preview="hover">
              Whitepaper
            </PillCta>
            <PillCta variant="square" size="compact" preview="hover">
              30 mins with Mira
            </PillCta>
          </Still>
        </Specimen>
        <Specimen label="Focus · 2px ink ring">
          <Still>
            <PillCta preview="focus">Get started</PillCta>
          </Still>
        </Specimen>
        <Specimen label="Disabled · .6">
          <PillCta disabled>Get started</PillCta>
          <PillCta variant="lime" disabled>
            Add
          </PillCta>
        </Specimen>
      </DemoSection>
    </DemoStack>
  );
}

/* ----------------------------------------------------------------------------- pieces */

function ClickReadout({ log }: { log: Log }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-hair-soft bg-s1 px-4 py-3">
      <Caption>Interaction · click any button</Caption>
      <p role="status" aria-live="polite" className="font-mono text-[12px] text-ink-dim">
        {log.count === 0 ? (
          "No clicks yet"
        ) : (
          <>
            <span className="text-ink">{log.label}</span>
            <span className="text-ink-faint"> · {formatNumber(log.count)} {log.count === 1 ? "click" : "clicks"}</span>
          </>
        )}
      </p>
    </div>
  );
}

function AgentCard({ onCreate }: { onCreate: () => void }) {
  return (
    <article className="flex w-full max-w-[300px] flex-col gap-3 rounded-[16px] border border-hair bg-card p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-[10px] border border-hair bg-s3 font-mono text-[13px] text-grn">
          OR
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-[15px] font-semibold leading-tight">Ops runbook agent</h4>
          <p className="text-[12px] text-ink-faint">OpenClaw · managed</p>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5 border-t border-hair-soft pt-3 text-[12px] leading-[1.5] text-ink-dim">
        <li>
          <span aria-hidden="true">◇ </span>Reads incidents from Linear
        </li>
        <li>
          <span aria-hidden="true">◇ </span>Drafts the runbook update
        </li>
      </ul>
      <PillCta variant="green" block onClick={onCreate}>
        Create agent
      </PillCta>
    </article>
  );
}

function NavBar({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-[14px] border border-hair-soft bg-black/60 px-4 py-2.5">
      <Lockup size={20} />
      <PillCta variant="nav" onClick={onStart}>
        Get started
      </PillCta>
    </div>
  );
}

const fieldCls =
  "h-[38px] w-full min-w-0 rounded-[9px] border border-hair bg-s1 px-3 font-mono text-[13px] text-ink placeholder:text-ink-faint " +
  "transition-colors hover:border-hair-strong focus:border-hair-strong";

/**
 * galileo Add: the request is in flight for 1.2 s. Meanwhile the button reads Adding…, sits
 * at .6 and swallows clicks, but keeps focus so a keyboard user is not dropped on the page.
 */
function GalileoAdd({ onAdd }: { onAdd: () => void }) {
  const [name, setName] = useState("drafts");
  const [location, setLocation] = useState("~/drafts");
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const taken = new Set([...GALILEO_SOURCES.map((s) => s.name), ...added]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    onAdd();
    const n = name.trim().toLowerCase();
    if (!n || !location.trim()) {
      setError("Give the source a name and a port or path.");
      return;
    }
    if (taken.has(n)) {
      setError(`A source named ${n} already exists. Pick another name.`);
      return;
    }
    setError(null);
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      setAdded((a) => [...a, n]);
    }, 1200);
  }

  const last = added[added.length - 1];
  const showAdded = Boolean(last) && !busy && !error;

  return (
    <form onSubmit={submit} noValidate className="w-full rounded-[14px] border border-hair-soft bg-[#0c0e0b] p-4" aria-label="Add a galileo source">
      <div className="flex flex-wrap items-end gap-2.5">
        <label className="flex min-w-[90px] flex-1 flex-col gap-1.5">
          <span className="text-[12px] text-ink-dim">Name</span>
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} autoComplete="off" />
        </label>
        <label className="flex min-w-[120px] flex-[2] flex-col gap-1.5">
          <span className="text-[12px] text-ink-dim">Port or path</span>
          <input className={fieldCls} value={location} onChange={(e) => setLocation(e.target.value)} spellCheck={false} autoComplete="off" />
        </label>
        <PillCta type="submit" variant="lime" busy={busy} busyLabel="Adding…">
          Add
        </PillCta>
      </div>
      <div className="mt-3 min-h-[38px] text-[12.5px] leading-snug">
        {/* persistent polite region, so the success line is announced when it appears */}
        <div role="status">
          {showAdded && last ? (
            <p className="flex flex-wrap items-center gap-x-2 text-ink-dim">
              <StatusDot status="up" size="sm" />
              Added <span className="text-ink">{last}</span>
              <span className="font-mono text-[11.5px] text-ink-faint">{GALILEO.pattern.replace("<name>", last)}</span>
            </p>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-[#ff7a70]">
            {error}
          </p>
        ) : showAdded ? null : (
          <p className="text-ink-faint">A number is a port on this machine. A path is a file or a folder, which galileo only reads.</p>
        )}
      </div>
    </form>
  );
}

function PricingRow({ onPick }: { onPick: (label: string) => void }) {
  return (
    <div className="w-full">
      <div className="grid w-full gap-3 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex min-w-0 flex-col gap-3 rounded-[14px] border bg-card p-4",
              plan.highlighted ? "border-hair-strong" : "border-hair-soft",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-semibold">{plan.name}</span>
              <Badge tone={plan.color} size="xs" mono dot>
                {plan.price}
              </Badge>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-faint">{plan.tagline}</p>
            <PillCta
              variant={plan.cta.kind}
              size="compact"
              block
              className="mt-auto"
              trailing={plan.cta.external ? "↗" : undefined}
              onClick={() => onPick(plan.cta.label)}
            >
              {plan.cta.label}
            </PillCta>
          </div>
        ))}
      </div>
      <Caption className="mt-3">{PRICING_NOTE}</Caption>
    </div>
  );
}
