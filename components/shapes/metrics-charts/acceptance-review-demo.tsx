// Demo: verification and acceptance review. Five units cover every variant and state:
// awaiting review (uow_118), accepted (uow_120, illustrative), below threshold so it counts
// toward IR (uow_124), sent back with a note (uow_123) and measurement unavailable (uow_121).
// Expand a check for its evidence, accept, or send back with a note (Escape cancels the
// note); Reopen review undoes a decision.
import { CURRENT_USER, PEOPLE, QUIRQ_READINGS, QUIRQ_THRESHOLD, QUIRQ_UNAVAILABLE_NOTE, type QuirqReading } from "@/lib/fixtures";
import { DemoCell } from "./chart-kit";
import { AcceptanceReview, type ReviewDecision, type SnapshotRow } from "./acceptance-review";

const SNAPSHOTS: Record<string, SnapshotRow[]> = {
  uow_118: [
    { label: "Status pill, API down", before: "0", after: "Unavailable" },
    { label: "Bare 0 for a missing value", before: "2 found", after: "0 found" },
    { label: "Focus ring on the pill", before: "none", after: "2px ink" },
    { label: "Status tests", before: "12 of 14 pass", after: "13 of 14 pass" },
  ],
  uow_120: [
    { label: "Overflow at 390px", before: "64px", after: "0px" },
    { label: "Sources menu keys", before: "Escape ignored", after: "Enter, Escape" },
    { label: "Status dots", before: "hidden", after: "visible" },
  ],
  uow_124: [
    { label: "Start retries", before: "none", after: "3, with backoff" },
    { label: "After the last attempt", before: "spinner", after: "spinner" },
    { label: "Technical details link", before: "missing", after: "not checked" },
  ],
  uow_123: [
    { label: "Summaries in notes/papers", before: "0", after: "3" },
    { label: "Longest summary", before: "none", after: "274 words" },
    { label: "Method citations", before: "none", after: "none" },
  ],
  uow_121: [],
};

function reading(id: string): QuirqReading {
  const r = QUIRQ_READINGS.find((u) => u.unitId === id);
  if (!r) throw new Error(`Missing reading ${id}`);
  return r;
}

function Review({ id, initialDecision = "awaiting", initialNote }: { id: string; initialDecision?: ReviewDecision; initialNote?: string }) {
  const r = reading(id);
  return (
    <AcceptanceReview
      unitId={r.unitId}
      title={r.title}
      project={r.projectId}
      owner={PEOPLE[r.owner].name}
      reviewer={CURRENT_USER.name}
      budget={r.budgetB}
      completion={r.completionV}
      minted={r.mintedQ}
      threshold={QUIRQ_THRESHOLD}
      checks={r.evidence}
      snapshots={SNAPSHOTS[id] ?? []}
      evidence={[
        { label: `Session ${r.sessionIds[0]}`, href: `#${r.unitId}-checks` },
        ...(r.availability === "Available"
          ? [
              { label: "Snapshot S₀", href: `#${r.unitId}-checks` },
              { label: "Snapshot S₁", href: `#${r.unitId}-checks` },
            ]
          : []),
      ]}
      method="v0"
      methodHref="#quirq-method-v0"
      cost={r.costTotal}
      provenance={r.provenance}
      measured={r.measured}
      initialDecision={initialDecision}
      initialNote={initialNote}
      unavailableNote={QUIRQ_UNAVAILABLE_NOTE}
    />
  );
}

export function AcceptanceReviewDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoCell caption="Awaiting review · mock · expand a check, accept or send back">
        <Review id="uow_118" />
      </DemoCell>
      <div className="grid gap-6 xl:grid-cols-2">
        <DemoCell caption="Accepted · illustrative">
          <Review id="uow_120" initialDecision="accepted" />
        </DemoCell>
        <DemoCell caption="Below threshold · V under 0.70 counts toward IR">
          <Review id="uow_124" />
        </DemoCell>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DemoCell caption="Sent back · with the owner's note · mock">
          <Review id="uow_123" initialDecision="sent_back" initialNote="Cite the method for the third paper before this is accepted." />
        </DemoCell>
        <DemoCell caption="Measurement unavailable · live · cannot be accepted, never reads 0">
          <Review id="uow_121" />
        </DemoCell>
      </div>
    </div>
  );
}
