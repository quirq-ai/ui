// Demo: Provenance label and method footnote. Live host, mock data, illustrative and sample
// badges (hover or focus for the source), a chart with its method footnote, the illustrative
// quarter ledger, an Unavailable reading that links to the method, and the method itself.
import { CURRENT_SPACE, PORTFOLIO_WINDOWS, QUIRQ_DAILY, QUIRQ_METHOD, QUIRQ_READINGS, QUIRQ_THRESHOLD, QUIRQ_UNAVAILABLE_NOTE, SPACE_BY_ID, TODAY_LABEL } from "@/lib/fixtures";
import { formatCurrency, formatFixed, formatNumber, formatQuirqs, formatDayLabel, formatPercent, formatRatio } from "@/lib/format";
import { Caption, Cell } from "./demo-kit";
import { MetaLine, MethodFootnote, ProvenanceBadge, QuarterLedger, UnavailableValue, type LedgerRow } from "./provenance";

const METHOD_HREF = "#provenance-method";
const june = PORTFOLIO_WINDOWS.find((w) => w.id === "pw_june")!;
const LEDGER: LedgerRow[] = [
  { id: "apr", period: "April", mintedQ: 15770, cost: 5020, qer: 15770 / 5020 },
  { id: "may", period: "May", mintedQ: 26310, cost: 6480, qer: 26310 / 6480 },
  { id: "jun", period: "June", mintedQ: june.mintedQ, cost: june.totalCost, qer: june.QER },
];

const measured = QUIRQ_READINGS.find((r) => r.unitId === "uow_118")!;
const missing = QUIRQ_READINGS.find((r) => r.unitId === "uow_121")!;
const demoPilot = SPACE_BY_ID["ws_e5d7b302"];

/* ----------------------------------------------------------------------------- chart */

function DailyChart() {
  const W = 600;
  const H = 120;
  const values = QUIRQ_DAILY.map((d) => d.mintedQ);
  const max = Math.max(...values.map((v) => v ?? 0));
  const step = W / values.length;
  const bar = step * 0.62;
  const gap = QUIRQ_DAILY.find((d) => d.mintedQ === null);
  const total = values.reduce<number>((a, v) => a + (v ?? 0), 0);
  return (
    <figure className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <figcaption className="text-[13px] font-semibold text-ink">Minted quirqs per day</figcaption>
        <span className="font-mono text-[11px] tabular-nums text-ink-dim">{formatQuirqs(Math.round(total))} in 30 days</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Minted quirqs per day from ${QUIRQ_DAILY[0].label} to ${QUIRQ_DAILY[QUIRQ_DAILY.length - 1].label}, mock data. ${gap ? `${gap.label} is Unavailable.` : ""}`}
        className="mt-3 block h-[120px] w-full"
      >
        <defs>
          <pattern id="dd-gap" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="rgba(255,255,255,0.02)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
          </pattern>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.05)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {values.map((v, i) => {
          const x = i * step + (step - bar) / 2;
          if (v === null) return <rect key={i} x={x} y={8} width={bar} height={H - 8} fill="url(#dd-gap)" rx="1.5" />;
          const h = Math.max(2, (v / max) * (H - 10));
          return <rect key={i} x={x} y={H - h} width={bar} height={h} rx="1.5" fill="var(--blu)" opacity={i >= values.length - 7 ? 1 : 0.55} />;
        })}
      </svg>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>{formatDayLabel(QUIRQ_DAILY[0].date)}</span>
        {gap ? (
          <span className="inline-flex items-center gap-1.5">
            <i aria-hidden="true" className="inline-block size-2 rounded-[2px] border border-hair-strong bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.2)_0_2px,transparent_2px_4px)]" />
            {formatDayLabel(gap.date)} · Unavailable
          </span>
        ) : null}
        <span>{formatDayLabel(QUIRQ_DAILY[QUIRQ_DAILY.length - 1].date)}</span>
      </div>
    </figure>
  );
}

export function ProvenanceDemo() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Caption>Variant · badges · state live, mock, illustrative, sample, unavailable (hover or focus for the source)</Caption>
        <div className="flex flex-wrap items-center gap-2.5 rounded-[14px] border border-hair bg-s1 p-4">
          <ProvenanceBadge id="pv-live" kind="live" host={CURRENT_SPACE.host} source={`Read from the Space API at ${CURRENT_SPACE.host}. Checked just now.`} />
          <ProvenanceBadge id="pv-mock" kind="mock" />
          <ProvenanceBadge id="pv-illus" kind="illustrative" />
          <ProvenanceBadge id="pv-sample" kind="sample" />
          <ProvenanceBadge id="pv-unav" kind="unavailable" source={`${demoPilot.name} is Starting; its Space API has not answered yet.`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label="Variant · live host badge vs mock data badge (breadcrumb)">
          <div className="space-y-2 rounded-[14px] border border-hair bg-s1 p-4">
            <nav aria-label="Breadcrumb, live" className="flex flex-wrap items-center justify-between gap-2">
              <ol className="flex items-center gap-2 text-[13px]">
                <li className="text-ink-dim">{CURRENT_SPACE.name}</li>
                <li aria-hidden="true" className="text-ink-faint">/</li>
                <li aria-current="page" className="text-ink">Usage</li>
              </ol>
              <ProvenanceBadge id="pv-crumb-live" kind="live" host={CURRENT_SPACE.host} />
            </nav>
            <hr className="border-hair-soft" />
            <nav aria-label="Breadcrumb, mock" className="flex flex-wrap items-center justify-between gap-2">
              <ol className="flex items-center gap-2 text-[13px]">
                <li className="text-ink-dim">{demoPilot.name}</li>
                <li aria-hidden="true" className="text-ink-faint">/</li>
                <li aria-current="page" className="text-ink">Usage</li>
              </ol>
              <ProvenanceBadge id="pv-crumb-mock" kind="mock" source="Seeded demo data for pilot walkthroughs." />
            </nav>
          </div>
        </Cell>
        <Cell label="Variant · sample card badge">
          <article className="rounded-[14px] border border-hair bg-s1 p-4">
            <div className="flex items-center gap-2">
              <ProvenanceBadge id="pv-card-sample" kind="sample" source="A sample changelog entry for the catalog." />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{TODAY_LABEL}</span>
            </div>
            <h3 className="mt-2.5 text-[15px] font-semibold text-ink">Hosted spaces stop after 24 idle hours</h3>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-dim">Idle hosted spaces save state and stop. Files stay on disk; Start space brings them back.</p>
          </article>
        </Cell>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Cell label="Variant · method footnote under a chart">
          <div className="rounded-[14px] border border-hair bg-s1 p-4">
            <DailyChart />
            <MethodFootnote
              provenance="mock"
              method="v0"
              unit="quirqs"
              scope={CURRENT_SPACE.name}
              window={`30 days to ${TODAY_LABEL}`}
              href={METHOD_HREF}
              className="mt-4 border-t border-hair-soft pt-3"
            />
          </div>
        </Cell>
        <div className="space-y-6">
          <Cell label="Reading · available, mock">
            <div className="rounded-[14px] border border-hair bg-s1 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Minted Q · {measured.unitId}</p>
                <ProvenanceBadge id="pv-reading" kind={measured.provenance} />
              </div>
              <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">{formatQuirqs(measured.mintedQ, 1)}</p>
              <p className="mt-2 text-[12.5px] text-ink-dim">
                V {formatFixed(measured.completionV, 2)} · B {formatNumber(measured.budgetB)} · cost {formatCurrency(measured.costTotal)}
              </p>
            </div>
          </Cell>
          <Cell label="Variant · Unavailable with a link to the method">
            <div className="rounded-[14px] border border-hair bg-s1 p-4">
              <div className="flex items-start justify-between gap-2">
                <UnavailableValue label={`Minted Q · ${missing.unitId}`} note={missing.note ?? QUIRQ_UNAVAILABLE_NOTE} href={METHOD_HREF} />
                <ProvenanceBadge id="pv-reading-live" kind="live" source="Live session, but no evidence checks ran." />
              </div>
            </div>
          </Cell>
        </div>
      </div>

      <Cell label="Variant · illustrative ledger note (QER emphasized)">
        <QuarterLedger
          rows={LEDGER}
          caption="Quarter ledger, illustrative"
          footer={
            <div className="space-y-1.5">
              <MetaLine variant="qualifier">Illustrative arithmetic exhibiting the full calculation chain, not measurement.</MetaLine>
              <MethodFootnote provenance="illustrative" method="v0" unit="quirqs per USD" scope="one managed space" window="April to June 2026" href={METHOD_HREF} />
            </div>
          }
        />
      </Cell>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label="Meta lines · byline, qualifier, reassurance">
          <div className="space-y-2 rounded-[14px] border border-hair bg-s1 p-4">
            <MetaLine variant="byline">XO Labs · Draft v3 · July 2026</MetaLine>
            <MetaLine variant="qualifier">
              QER {formatRatio(june.QER)} · QV {formatQuirqs(june.mintedQ)} per {june.windowDays} days · IR {formatPercent(june.IR)} · window {june.window} · method v0 ·
              illustrative
            </MetaLine>
            <MetaLine variant="reassurance">Pricing on application. Deployment support included.</MetaLine>
            <MetaLine variant="reassurance">Anywhere else? Tell us where it needs to run.</MetaLine>
          </div>
        </Cell>
        <section id="provenance-method" aria-labelledby="provenance-method-title" className="scroll-mt-24 rounded-[14px] border border-hair bg-s1 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Method</p>
          <h3 id="provenance-method-title" className="mt-1.5 text-[15px] font-semibold text-ink">
            How quirqs are measured
          </h3>
          <dl className="mt-3 space-y-2 text-[12.5px] leading-[1.55]">
            {[
              ["Method", QUIRQ_METHOD],
              ["Unit", "quirqs, minted Q = V · B"],
              ["Budget B", "Potential quirqs the owner sets before the work runs."],
              ["Completion V", "Passed check weight over total weight, 0 to 1."],
              ["Threshold", `V below ${formatFixed(QUIRQ_THRESHOLD, 1)} counts toward the intervention rate.`],
              ["No checks", "The reading is Unavailable, never zero."],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint pt-[3px]">{k}</dt>
                <dd className="text-ink-dim">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
