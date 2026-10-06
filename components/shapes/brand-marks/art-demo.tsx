"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PEOPLE } from "@/lib/fixtures";
import { Caption, DemoSection, KeepCase, ProvenanceNote } from "./kit";
import { DreamPlate, GenerativeThumb, InstrumentPlate, MotionGlyph, PrismArt, ShiftReportCard, SignalPlate, type PrismKind, type ShiftReport, type ThumbSpec } from "./art";

const STUDIES = [
  { id: "pilot", label: "Pilot" },
  { id: "incurious", label: "Incurious" },
  { id: "self", label: "Self-sufficient" },
  { id: "point", label: "Point and call" },
  { id: "rtfm", label: "RTFM" },
];

const PRISMS: PrismKind[] = ["hero-prism", "spectrum-band", "quirq-glow", "burst"];

const BEAMS: ThumbSpec[] = [210, 28, 140, 280].map((hue) => ({ kind: "beam", hue }));
const GRADS: ThumbSpec[] = [0, 1, 2, 3, 4, 5].map((index) => ({ kind: "grad", index }));

const DAWN: ShiftReport = {
  subject: "XO",
  running: "14 spaces",
  when: "Early morning",
  person: PEOPLE.lena.name,
  role: PEOPLE.lena.title,
  activity: "is fishing",
  window: "overnight",
  quirqs: 3.2,
  interventions: 0,
};

const AFTERNOON: ShiftReport = {
  subject: "XO",
  running: "6 spaces",
  when: "Late afternoon",
  person: PEOPLE.kenji.name,
  role: PEOPLE.kenji.title,
  activity: "is on the ridge trail",
  window: "today",
  quirqs: 1.4,
  interventions: 2,
};

function specLabel(s: ThumbSpec) {
  return s.kind === "beam" ? `beam · hue ${s.hue}` : `grad · index ${s.index}`;
}

export function ArtPlatesDemo() {
  const [run, setRun] = useState(0);

  return (
    <div className="space-y-10">
      <DemoSection title="Dream plate" note="Night register · cards and social previews">
        <div className="overflow-hidden rounded-[14px] border border-hair-soft">
          <DreamPlate />
        </div>
        <Caption className="mt-2.5">Lone figure · fractured light · teal shadows, amber highlights · heavy grain · 3:1</Caption>
      </DemoSection>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <DemoSection title="Instrument plate" note="Article body only, never a preview">
          <InstrumentPlate
            headline="Replayed traffic reads as real to the model."
            subtitle="Test awareness by evaluation setting · quirq research, alignment environments"
            unit="% of runs where the model says it is being tested"
            bars={[
              { label: "Static benchmark", value: 99, display: "~99%", tone: "claimed", note: "Synthetic" },
              { label: "Replayed production traffic", value: 5.12, display: "5.12%", tone: "real", note: "Replay · ours" },
              { label: "Real traffic", value: 5.38, display: "5.38%", tone: "baseline", note: "Baseline" },
            ]}
            footnote={<ProvenanceNote kind="illustrative">Sample figure for the catalog</ProvenanceNote>}
          />
        </DemoSection>
        <DemoSection title="Signal plates" note="One claim, eight words at most">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <SignalPlate kicker="The decoy problem" left={{ value: "r = 0.91", tone: "real" }} joiner="vs" right={{ value: "0.54", tone: "claimed" }} />
            <SignalPlate kicker="Test awareness on replayed traffic" left={{ value: "~99%", tone: "claimed" }} joiner="→" right={{ value: "5.1%", tone: "real" }} />
          </div>
        </DemoSection>
      </div>

      <DemoSection title="Motion glyph" note="One simple motion, plays once">
        <MotionGlyph key={run} nodes={STUDIES} failedEdge={0} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Caption>Evidence map · five studies · the edge that failed in amber</Caption>
          <Button size="sm" variant="secondary" leadingIcon={<RotateCcw aria-hidden="true" />} onClick={() => setRun((r) => r + 1)}>
            Replay
          </Button>
        </div>
      </DemoSection>

      <DemoSection title="Prism art" note="Radial mask, screen blending; art carries the full spectrum, UI never does">
        <ul className="grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
          {PRISMS.map((k) => (
            <li key={k} className="space-y-2">
              <div className="overflow-hidden rounded-[14px] border border-hair-soft">
                <PrismArt kind={k} />
              </div>
              <Caption>
                <KeepCase>{k}</KeepCase>
              </Caption>
            </li>
          ))}
        </ul>
      </DemoSection>

      <DemoSection title="Generative thumbs" note="Deterministic from a spec, no assets">
        <ul className="grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
          {BEAMS.map((s) => (
            <li key={specLabel(s)} className="space-y-2">
              <GenerativeThumb spec={s} className="rounded-[12px] border border-hair-soft" />
              <Caption>{specLabel(s)}</Caption>
            </li>
          ))}
        </ul>
        <ul className="mt-5 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-6">
          {GRADS.map((s) => (
            <li key={specLabel(s)} className="space-y-2">
              <GenerativeThumb spec={s} className="rounded-[12px] border border-hair-soft" />
              <Caption>{specLabel(s)}</Caption>
            </li>
          ))}
        </ul>
      </DemoSection>

      <DemoSection title="Shift Report" note="A person, an hour, a receipt; the proof line is never rounded up">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2.5">
            <Caption>Social card · 1200 × 630</Caption>
            <ShiftReportCard report={DAWN} scene="lake" variant="social" uid="sr-social" />
          </div>
          <div className="space-y-2.5">
            <Caption>Print · text-free</Caption>
            <ShiftReportCard report={DAWN} scene="lake" variant="print" uid="sr-print" />
          </div>
        </div>
        <div className="mt-6 space-y-2.5">
          <Caption>Article header · honest proof line with interventions</Caption>
          <ShiftReportCard report={AFTERNOON} scene="trailhead" variant="header" uid="sr-header" />
        </div>
        <ProvenanceNote kind="illustrative" className="mt-4">
          Captions and quirq counts are examples; people are fictional
        </ProvenanceNote>
      </DemoSection>
    </div>
  );
}
