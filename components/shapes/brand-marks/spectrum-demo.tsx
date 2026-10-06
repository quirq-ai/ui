import { Eyebrow } from "@/components/brand/mark";
import { PORTFOLIO_WINDOWS } from "@/lib/fixtures";
import { formatCurrency, formatNumber, formatPercent, formatQuirqs, formatRatio, plural } from "@/lib/format";
import { Caption, KeepCase, ProvenanceNote, Specimen } from "./kit";
import { MintRule, SpectrumBullets, SpectrumChip, SpectrumDash, SpectrumHairline, SpectrumQuote, SpectrumText } from "./spectrum";

export function SpectrumAccentsDemo() {
  const w = PORTFOLIO_WINDOWS[0];
  const minted = w.potentialB > 0 ? w.mintedQ / w.potentialB : 0;
  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Specimen label="Chip · 11px, radius 3.5" ground="black" center={false} bodyClassName="flex flex-col items-start justify-center gap-5">
          <div className="flex items-end gap-4">
            <SpectrumChip size={22} />
            <SpectrumChip />
            <SpectrumChip size={8} />
          </div>
          <Eyebrow>Unit of work</Eyebrow>
        </Specimen>

        <Specimen label="Dash · 46 x 2" ground="black" center={false} bodyClassName="flex flex-col items-start justify-center gap-5">
          <SpectrumDash width={92} height={4} />
          <Eyebrow rule>Measurement</Eyebrow>
        </Specimen>

        <Specimen label="Hairline · 1px at 50%" ground="black" center={false} padded={false}>
          <div className="flex h-[78px] items-end px-5 pb-4">
            <p className="text-[12.5px] text-ink-faint">Tokens meter consumption. quirqs meter delivery.</p>
          </div>
          <SpectrumHairline />
          <p className="py-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Copyright 2026 · <KeepCase>quirq</KeepCase> LLC
          </p>
        </Specimen>

        <Specimen label="Quote bar · 3px" ground="panel" center={false}>
          <SpectrumQuote
            cite={
              <>
                Research · The <KeepCase>quirq</KeepCase> calculus
              </>
            }
          >
            Tokens tell you what the work cost. A quirq tells you what it delivered.
          </SpectrumQuote>
        </Specimen>

        <Specimen label="Bullet · 6px square" ground="panel" center={false}>
          <SpectrumBullets
            items={[
              "Snapshot the space before and after the run",
              "Score completion V against weighted checks",
              <>
                Mint <span className="text-ink">Q = V · B</span>, never more than the budget
              </>,
            ]}
          />
        </Specimen>

        <Specimen
          label="Gradient text"
          aside={
            <>
              <KeepCase>quirq</KeepCase> · Q
            </>
          }
          ground="black" center={false} bodyClassName="flex flex-col items-start justify-center gap-4">
          <SpectrumText className="font-round text-[44px] font-semibold leading-none">quirq</SpectrumText>
          <p className="font-mono text-[22px] leading-none text-ink">
            <SpectrumText className="font-semibold">Q</SpectrumText>
            <span className="mx-2.5 text-ink-faint">=</span>V<span className="mx-2.5 text-ink-faint">·</span>B
          </p>
        </Specimen>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-2.5">
          <Caption>Mint rule · color is delivered value, grey is everything else</Caption>
          <MintRule />
        </div>
        <div className="flex flex-col gap-2.5">
          <Caption>In a readout</Caption>
          <div className="flex flex-1 flex-col gap-5 rounded-[18px] border border-hair-soft bg-[#0f0f11] p-5">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Cost</dt>
                <dd className="mt-2 text-[22px] font-[600] tabular-nums text-ink-dim">{formatCurrency(w.totalCost)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">QER</dt>
                <dd className="mt-2 text-[22px] font-[600] tabular-nums text-ink-dim">{formatRatio(w.QER)}</dd>
              </div>
              <div className="col-span-2 border-t border-hair-soft pt-4">
                <dt className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">
                  <SpectrumChip size={8} />
                  Minted Q
                </dt>
                <dd className="mt-2 text-[30px] font-[640] leading-none tabular-nums text-ink">{formatQuirqs(w.mintedQ, 1)}</dd>
              </div>
            </dl>
            <div>
              <div
                role="img"
                aria-label={`${formatQuirqs(w.mintedQ, 1)} minted of a ${formatNumber(w.potentialB, 1)} quirq budget, ${formatPercent(minted)}`}
                className="h-2 overflow-hidden rounded-[2px] bg-s4"
              >
                <div className="spec-bar h-full rounded-[2px]" style={{ width: `${minted * 100}%` }} />
              </div>
              <div className="mt-2 flex justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                <span>Minted {formatPercent(minted)}</span>
                <span className="tabular-nums">Budget B {formatNumber(w.potentialB, 1)}</span>
              </div>
            </div>
            <p className="text-[11.5px] leading-[1.6] text-ink-dim">
              {w.window} · {w.method} · {w.units - w.unitsUnavailable} of {w.units} {plural(w.units, "unit")} measured, the rest read Unavailable
            </p>
            <ProvenanceNote kind="mock" className="mt-auto">
              Sample window
            </ProvenanceNote>
          </div>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-[14px] border border-hair-soft bg-hair-soft sm:grid-cols-2">
        <div className="flex items-center gap-4 bg-[#070708] px-5 py-4">
          <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-[8px] border border-hair-soft bg-black">
            <SpectrumDash width={34} />
          </span>
          <span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-grn">Do</span>
            <span className="block text-[12.5px] leading-snug text-ink-dim">Small doses that point at the minted value</span>
          </span>
        </div>
        <div className="flex items-center gap-4 bg-[#070708] px-5 py-4">
          <span className="relative flex h-10 w-16 shrink-0 overflow-hidden rounded-[8px] border border-hair-soft" style={{ background: "var(--spectrum)" }}>
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[2px] w-[80px] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] bg-black" />
          </span>
          <span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-red">Don&rsquo;t</span>
            <span className="block text-[12.5px] leading-snug text-ink-dim">Fill large UI areas; art plates carry the full spectrum</span>
          </span>
        </div>
      </div>
    </div>
  );
}
