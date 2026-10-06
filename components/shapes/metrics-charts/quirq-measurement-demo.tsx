// Demo: quirq measurement readouts. Every variant (mint rule card, formula callout, two
// meters, mint flow, QER/QV/IR) and every state (Available, Unavailable, mock and
// illustrative provenance), fed from the quirq readings and portfolio windows fixtures.
import { Gauge, Leaf, Zap } from "lucide-react";
import { PORTFOLIO_WINDOWS, QUIRQ_METHOD, QUIRQ_READINGS, QUIRQ_UNAVAILABLE_NOTE, SESSION_BY_ID } from "@/lib/fixtures";
import { formatNumber, formatPercent } from "@/lib/format";
import { DemoCell } from "./chart-kit";
import { BridgeGrid, FormulaCallout, FormulaValue, MeterCard, MintChip, MintFlow, MintRuleCard, QuirqReadout, QuirqReadoutLine } from "./quirq-measurement";

const METHOD = "v0";
const METHOD_HREF = "#quirq-method-v0";

const reading = (id: string) => {
  const r = QUIRQ_READINGS.find((u) => u.unitId === id);
  if (!r) throw new Error(`Missing reading ${id}`);
  return r;
};

export function QuirqMeasurementDemo() {
  const u118 = reading("uow_118");
  const u121 = reading("uow_121");
  const u122 = reading("uow_122");
  const [w7, w30, june] = PORTFOLIO_WINDOWS;
  const passed = u118.evidence.filter((c) => c.passed === true).length;
  const s118 = SESSION_BY_ID[u118.sessionIds[0]];

  return (
    <div className="flex flex-col gap-10">
      <DemoCell caption="Mint rule card · B before the run, Q = V · B after verification">
        <MintRuleCard
          example={
            u118.completionV !== null && u118.mintedQ !== null
              ? { unitId: u118.unitId, budget: u118.budgetB, completion: u118.completionV, minted: u118.mintedQ, provenance: u118.provenance }
              : undefined
          }
        />
      </DemoCell>

      <div className="grid gap-6 md:grid-cols-2">
        <DemoCell caption="Formula callout · quirq · live values in blue">
          <FormulaCallout
            className="flex-1"
            id="quirq-method-v0"
            kicker={`Method ${QUIRQ_METHOD}`}
            lines={[
              <>
                V = Σ passed weights / Σ weights = <FormulaValue>{u118.completionV?.toFixed(2)}</FormulaValue>
              </>,
              <>
                Q = V · B = {u118.completionV?.toFixed(2)} · {u118.budgetB} = <FormulaValue>{u118.mintedQ} quirqs</FormulaValue>
              </>,
            ]}
            note={`${u118.unitId}: ${passed} of ${u118.evidence.length} weighted checks passed against the before and after snapshots. The agent never produces its own evidence.`}
          />
        </DemoCell>
        <DemoCell caption="Formula callout · Machine Speed (.eq) · illustrative">
          <FormulaCallout
            className="flex-1"
            variant="machine-speed"
            kicker="Hours-back calculator (Machine Speed)"
            lines={[
              <>
                Hours back a week = hours on repeating work × <FormulaValue variant="machine-speed">64%</FormulaValue>
              </>,
              <>What it is worth = hours back × 48 working weeks × your hourly rate</>,
            ]}
            note="Illustrative defaults: 15 hrs × 64% = 9.6 hours. The result is hours, not quirqs."
          />
        </DemoCell>
      </div>

      <DemoCell caption="Two meters · input meter and output meter · revealed with stagger">
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <MeterCard
              index={0}
              kicker="The input meter"
              name="Token"
              accent="dim"
              lead="Counts compute, scales with energy, prices inference."
              note="It measures what was consumed, never what was delivered. Tokens, credits and cost stay on this meter."
              formula="E ≈ 2·P·N / η"
            />
            <MeterCard
              index={1}
              kicker="The output meter"
              name="quirq"
              accent="spectrum"
              lead="Counts verified outcome, budgeted by a human owner."
              note="Read against all-in cost, it gives a ratio the token bill cannot express: value produced per dollar of everything the work consumed."
              formula="Q = V · B"
            />
          </div>
          <BridgeGrid
            items={[
              { icon: <Gauge />, title: "Is the program paying?", ratio: "quirqs / $ all-in (QER)", description: "Minted quirqs over inference, compute, storage and human minutes." },
              { icon: <Zap />, title: "Value per unit of energy", ratio: "quirqs / kWh", description: "Energy estimated from the same token counts the bill already keeps." },
              { icon: <Leaf />, title: "Value per unit of carbon", ratio: "quirqs / tonne CO₂", description: "Energy times grid carbon intensity, read against delivered work." },
            ]}
          />
        </div>
      </DemoCell>

      <DemoCell caption="Mint flow · horizontal pipeline · Potential, Minted, Unavailable">
        <div className="flex flex-col gap-3">
          <MintFlow
            unitId={u118.unitId}
            stage="potential"
            budget={u118.budgetB}
            completion={null}
            minted={null}
            evidence={`${u118.evidence.length} weighted checks queued for the after snapshot`}
            method={METHOD}
            methodHref={METHOD_HREF}
            cost={u118.costTotal}
            provenance={u118.provenance}
          />
          <MintFlow
            unitId={u118.unitId}
            stage="minted"
            budget={u118.budgetB}
            completion={u118.completionV}
            minted={u118.mintedQ}
            evidence={`${passed} of ${u118.evidence.length} weighted checks passed`}
            method={METHOD}
            methodHref={METHOD_HREF}
            cost={u118.costTotal}
            provenance={u118.provenance}
          />
          <MintFlow
            unitId={u121.unitId}
            stage="unavailable"
            budget={u121.budgetB}
            completion={u121.completionV}
            minted={u121.mintedQ}
            method={METHOD}
            cost={u121.costTotal}
            provenance={u121.provenance}
          />
        </div>
      </DemoCell>

      <DemoCell caption="Compact equation chip · V · B">
        <div className="flex flex-wrap items-center gap-2">
          <MintChip completion={u118.completionV} budget={u118.budgetB} minted={u118.mintedQ} />
          <MintChip completion={u122.completionV} budget={u122.budgetB} minted={u122.mintedQ} />
          <MintChip completion={u121.completionV} budget={u121.budgetB} minted={u121.mintedQ} />
        </div>
      </DemoCell>

      <div className="grid gap-6 lg:grid-cols-2">
        <DemoCell caption="QER / QV / IR · Available · mock · 30 days">
          <QuirqReadout
            minted={w30.mintedQ}
            window={w30.window}
            method={METHOD}
            methodHref={METHOD_HREF}
            provenance={w30.provenance}
            scope={`${w30.units} units · ${w30.unitsUnavailable} unavailable · B ${w30.potentialB}`}
            qer={w30.QER}
            qv={w30.QV}
            ir={w30.IR}
            cost={w30.totalCost}
          />
        </DemoCell>
        <DemoCell caption="QER / QV / IR · Available · mock · 7 days">
          <QuirqReadout
            minted={w7.mintedQ}
            window={w7.window}
            method={METHOD}
            methodHref={METHOD_HREF}
            provenance={w7.provenance}
            scope={`${w7.units} units · ${w7.unitsUnavailable} unavailable · IR threshold V < 0.70`}
            qer={w7.QER}
            qv={w7.QV}
            ir={w7.IR}
            cost={w7.totalCost}
          />
        </DemoCell>
        <DemoCell caption="QER / QV / IR · illustrative · June 2026">
          <QuirqReadout
            minted={june.mintedQ}
            window={june.window}
            method={METHOD}
            methodHref={METHOD_HREF}
            provenance={june.provenance}
            scope={`${formatNumber(june.units)} units · B ${formatNumber(june.potentialB)}`}
            qer={june.QER}
            qv={june.QV}
            ir={june.IR}
            cost={june.totalCost}
          />
        </DemoCell>
        <DemoCell caption="Unavailable · never zero">
          <QuirqReadout
            minted={null}
            window={w7.window}
            method={METHOD}
            provenance={u121.provenance}
            scope={`${u121.unitId} · ${u121.projectId} · no checks recorded`}
            cost={u121.costTotal}
            unavailableNote={QUIRQ_UNAVAILABLE_NOTE}
          />
        </DemoCell>
      </div>

      <DemoCell caption="Readout line · one unit · Available and Unavailable">
        <div className="flex flex-col gap-2 rounded-[14px] border border-hair-soft bg-[#0f0f11] px-4 py-3.5">
          <QuirqReadoutLine
            minted={u118.mintedQ}
            budget={u118.budgetB}
            completion={u118.completionV}
            method={METHOD}
            provenance={u118.provenance}
            cost={u118.costTotal}
            time={s118?.duration}
          />
          <QuirqReadoutLine
            minted={u121.mintedQ}
            budget={u121.budgetB}
            completion={u121.completionV}
            method={METHOD}
            provenance={u121.provenance}
            cost={u121.costTotal}
          />
          <p className="text-[11.5px] text-ink-faint">IR counts measured units with V below 0.70: {formatPercent(w7.IR)} over 7 days, {formatPercent(w30.IR)} over 30 days.</p>
        </div>
      </DemoCell>
    </div>
  );
}
