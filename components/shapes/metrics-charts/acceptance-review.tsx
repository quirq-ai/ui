"use client";

// Verification and acceptance review for one unit of work: the header (unit, project,
// owner, budget B), weighted checks that expand to their evidence, the before and after
// snapshot diff, computed V and minted Q = V · B, evidence links, and the owner's Accept or
// Send back (with a required note). Below threshold counts toward IR; an unavailable
// measurement can be sent back for evidence but never accepted, and never reads 0.
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, ChevronDown, CircleCheck, CircleDashed, CircleX, CornerUpLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { UNAVAILABLE } from "@/lib/format";
import type { Provenance } from "@/lib/fixtures";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { StateChip } from "@/components/ui/status";
import { ProvenanceTag, formatValue } from "./chart-kit";

const ACCEPT_CLS =
  "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px]! border border-grn/40 bg-grn/[0.1] px-2.5 " +
  "text-[12px] font-medium text-grn transition-colors duration-150 hover:border-grn/60 hover:bg-grn/[0.16] [&_svg]:size-3.5 " +
  "disabled:pointer-events-none disabled:opacity-40";

export type ReviewCheck = {
  id: string;
  label: string;
  /** relative weight; weights are normalized to their sum */
  weight: number;
  /** null when the check did not run */
  passed: boolean | null;
  detail: string;
};

export type SnapshotRow = { label: string; before: string; after: string };
export type EvidenceLink = { label: string; href: string };
export type ReviewDecision = "awaiting" | "accepted" | "sent_back";

export type AcceptanceReviewProps = {
  unitId: string;
  title: string;
  project: string;
  owner: string;
  /** the signed-in reviewer, named in the decision line */
  reviewer: string;
  budget: number;
  /** verified completion V; null when no measurement is available */
  completion: number | null;
  minted: number | null;
  threshold: number;
  checks: ReviewCheck[];
  snapshots: SnapshotRow[];
  evidence: EvidenceLink[];
  method: string;
  methodHref?: string;
  /** USD from the usage meter, kept separate */
  cost: number | null;
  provenance: Provenance;
  /** "3m ago" */
  measured: string;
  initialDecision?: ReviewDecision;
  initialNote?: string;
  unavailableNote?: string;
  onDecision?: (decision: ReviewDecision, note?: string) => void;
  className?: string;
};

/** Show how V was scored and let the owner accept the minted result or send it back. */
export function AcceptanceReview({
  unitId,
  title,
  project,
  owner,
  reviewer,
  budget,
  completion,
  minted,
  threshold,
  checks,
  snapshots,
  evidence,
  method,
  methodHref,
  cost,
  provenance,
  measured,
  initialDecision = "awaiting",
  initialNote,
  unavailableNote = "No quirq measurement is available for this work.",
  onDecision,
  className,
}: AcceptanceReviewProps) {
  const uid = useId();
  const [decision, setDecision] = useState<ReviewDecision>(initialDecision);
  const [note, setNote] = useState(initialNote ?? "");
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [announce, setAnnounce] = useState("");
  const sendBackBtn = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const unavailable = completion === null || minted === null;
  const below = !unavailable && completion < threshold;
  const totalWeight = checks.reduce((a, c) => a + c.weight, 0) || 1;
  const passedWeight = checks.filter((c) => c.passed === true).reduce((a, c) => a + c.weight, 0);
  const passedCount = checks.filter((c) => c.passed === true).length;

  function decide(d: ReviewDecision, n?: string) {
    setDecision(d);
    setNote(n ?? "");
    setComposing(false);
    setAnnounce(d === "accepted" ? `Accepted ${unitId}` : d === "sent_back" ? `Sent ${unitId} back` : `Review of ${unitId} reopened`);
    onDecision?.(d, n);
  }

  function startSendBack() {
    setComposing(true);
    setError(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function cancelSendBack() {
    setComposing(false);
    setDraft("");
    setError(false);
    requestAnimationFrame(() => sendBackBtn.current?.focus());
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) {
      setError(true);
      textareaRef.current?.focus();
      return;
    }
    decide("sent_back", draft.trim());
    setDraft("");
  }

  function onFormKey(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      cancelSendBack();
    }
  }

  return (
    <article className={cn("@container min-w-0 rounded-[16px] border border-hair-soft bg-[#0f0f11]", className)} aria-labelledby={`${uid}-title`}>
      {/* unit header */}
      <header className="flex flex-col gap-3 border-b border-hair-soft p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-ink-dim">{unitId}</span>
          <span aria-hidden="true" className="text-ink-faint">·</span>
          <span className="font-mono text-[11px] text-ink-dim">{project}</span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {unavailable ? (
              <StateChip kind="measurement" state="unavailable" prefix="Measurement" />
            ) : decision === "accepted" ? (
              <StateChip kind="result" state="accepted" />
            ) : decision === "sent_back" ? (
              <StateChip kind="result" state="awaiting_review" label="Sent back" />
            ) : (
              <StateChip kind="result" state="awaiting_review" />
            )}
            {below ? (
              <Badge tone="org" size="md">
                Below threshold · counts toward IR
              </Badge>
            ) : null}
            <ProvenanceTag provenance={provenance} />
          </div>
        </div>
        <h4 id={`${uid}-title`} className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {title}
        </h4>
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Owner</dt>
            <Avatar name={owner} size="xs" decorative />
            <dd className="text-ink-dim">{owner}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-ink-faint">Budget B</dt>
            <dd className="font-mono text-ink">{formatValue(budget)} potential quirqs</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-ink-faint">Measured</dt>
            <dd className="text-ink-dim">{measured}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-px bg-hair-soft @[720px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* weighted checks */}
        <section className="min-w-0 bg-[#0f0f11] p-4 sm:p-5" aria-labelledby={`${uid}-checks`} id={`${unitId}-checks`}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h5 id={`${uid}-checks`} className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              Weighted checks
            </h5>
            {checks.length ? (
              <span className="font-mono text-[11px] tabular-nums text-ink-dim">
                {passedCount} of {checks.length} passed
              </span>
            ) : null}
          </div>
          {checks.length === 0 ? (
            <p className="rounded-[10px] border border-dashed border-hair-strong px-3 py-4 text-[12.5px] text-ink-dim">
              No checks were recorded for this unit, so V cannot be scored. {unavailableNote}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {checks.map((c) => {
                const expanded = open === c.id;
                const share = c.weight / totalWeight;
                return (
                  <li key={c.id} className={cn("rounded-[10px] border transition-colors", expanded ? "border-hair bg-white/[0.025]" : "border-transparent")}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`${uid}-${c.id}`}
                      onClick={() => setOpen(expanded ? null : c.id)}
                      className="grid w-full grid-cols-[18px_minmax(0,1fr)_auto_14px] items-center gap-2.5 rounded-[10px]! px-2.5 py-2 text-left hover:bg-white/[0.03]"
                    >
                      {c.passed === true ? (
                        <CircleCheck aria-hidden="true" className="size-4 text-grn" />
                      ) : c.passed === false ? (
                        <CircleX aria-hidden="true" className="size-4 text-red" />
                      ) : (
                        <CircleDashed aria-hidden="true" className="size-4 text-ink-faint" />
                      )}
                      <span className="min-w-0 text-[12.5px] leading-snug text-ink">
                        {c.label}
                        <span className="sr-only">, {c.passed === true ? "passed" : c.passed === false ? "failed" : "did not run"}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="hidden h-1 w-12 overflow-hidden rounded-full bg-white/[0.08] sm:block">
                          <span className={cn("block h-full rounded-full", c.passed === true ? "bg-grn" : "bg-ink-faint")} style={{ width: `${share * 100}%` }} />
                        </span>
                        <span className="w-9 text-right font-mono text-[11px] tabular-nums text-ink-dim">
                          <span className="sr-only">weight </span>
                          {formatValue(share, "percent")}
                        </span>
                      </span>
                      <ChevronDown aria-hidden="true" className={cn("size-3.5 text-ink-faint transition-transform duration-150", expanded && "rotate-180")} />
                    </button>
                    <div id={`${uid}-${c.id}`} hidden={!expanded} className="px-2.5 pb-2.5 pl-[38px]">
                      <p className="text-[12px] leading-relaxed text-ink-dim">{c.detail}</p>
                      <p className="mt-1.5 font-mono text-[11px] text-ink-faint">
                        {c.passed === true
                          ? `Adds ${formatValue(share, "fixed2")} to V`
                          : c.passed === false
                            ? "Adds 0.00 to V · failed in the after snapshot"
                            : "Adds 0.00 to V · check did not run"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* snapshots and the computed result */}
        <section className="flex min-w-0 flex-col gap-4 bg-[#0f0f11] p-4 sm:p-5" aria-labelledby={`${uid}-snap`}>
          <div>
            <h5 id={`${uid}-snap`} className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              Before and after
            </h5>
            {snapshots.length ? (
              <div className="scroll-thin overflow-x-auto rounded-[10px] border border-hair-soft">
                <table className="w-full min-w-[260px] table-fixed border-collapse text-[12px]">
                  <colgroup>
                    <col className="w-[34%]" />
                    <col className="w-[31%]" />
                    <col className="w-[35%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-hair-soft text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                      <th scope="col" className="px-2 py-2 sm:px-3 font-normal">
                        State
                      </th>
                      <th scope="col" className="px-2 py-2 sm:px-3 font-normal">
                        Before S₀
                      </th>
                      <th scope="col" className="px-2 py-2 sm:px-3 font-normal">
                        After S₁
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots.map((s) => {
                      const changed = s.before !== s.after;
                      return (
                        <tr key={s.label} className="border-b border-hair-soft last:border-0">
                          <th scope="row" className="px-2 py-2 sm:px-3 text-left font-normal text-ink-dim">
                            {s.label}
                          </th>
                          <td className={cn("break-words px-2 py-2 sm:px-3 font-mono text-[11.5px]", changed ? "bg-red/[0.06] text-[#ff8a80]" : "text-ink-dim")}>
                            <span aria-hidden="true">{changed ? "− " : ""}</span>
                            {s.before}
                          </td>
                          <td className={cn("break-words px-2 py-2 sm:px-3 font-mono text-[11.5px]", changed ? "bg-grn/[0.07] text-grn" : "text-ink-dim")}>
                            <span aria-hidden="true">{changed ? "+ " : ""}</span>
                            {s.after}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-[10px] border border-dashed border-hair-strong px-3 py-4 text-[12.5px] text-ink-dim">No snapshots were captured.</p>
            )}
          </div>

          <div className="rounded-[12px] border border-hair-soft bg-black/30 p-3.5">
            <dl className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Computed V</dt>
                <dd className={cn("mt-1.5 font-mono", unavailable ? "text-[13px] text-ink-faint" : "text-[20px] text-blu")}>
                  {unavailable ? UNAVAILABLE : formatValue(completion, "fixed2")}
                </dd>
                {!unavailable ? (
                  <dd className="mt-1 text-[11px] text-ink-faint">
                    {formatValue(passedWeight / totalWeight, "fixed2")} of weight passed · threshold {formatValue(threshold, "fixed2")}
                  </dd>
                ) : null}
              </div>
              <div className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Minted Q = V · B</dt>
                <dd className={cn("mt-1.5 font-mono", unavailable ? "text-[13px] text-ink-faint" : "text-[20px] text-ink")}>
                  {unavailable ? UNAVAILABLE : formatValue(minted, "quirqs1")}
                </dd>
                {!unavailable ? (
                  <dd className="mt-1 text-[11px] text-ink-faint">
                    {formatValue(completion, "fixed2")} · {formatValue(budget)} = {formatValue(minted, "decimal1")}
                  </dd>
                ) : null}
              </div>
            </dl>
            <p className="mt-3 border-t border-hair-soft pt-2.5 text-[11.5px] text-ink-faint">
              Cost <span className="font-mono text-ink-dim">{formatValue(cost, "currency")}</span> on the usage meter, recorded separately.
              {methodHref ? (
                <>
                  {" "}
                  <a href={methodHref} className="whitespace-nowrap text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink">
                    Method {method} →
                  </a>
                </>
              ) : (
                <> Method {method}.</>
              )}
            </p>
          </div>
        </section>
      </div>

      {/* evidence and the decision */}
      <footer className="flex flex-col gap-3 border-t border-hair-soft p-4 sm:p-5">
        <div className="flex flex-col gap-3 @[560px]:flex-row @[560px]:items-center @[560px]:justify-between">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]" aria-label="Evidence">
            {evidence.map((e) => (
              <li key={e.label}>
                <a href={e.href} className="text-ink-dim underline decoration-hair-strong underline-offset-4 hover:text-ink hover:decoration-ink">
                  {e.label} →
                </a>
              </li>
            ))}
          </ul>
          {decision === "awaiting" && !composing ? (
            <div className="flex flex-wrap items-center gap-2 @[560px]:justify-end">
              <button ref={sendBackBtn} type="button" onClick={startSendBack} className={buttonClasses({ variant: "subtle", size: "sm" })}>
                <CornerUpLeft aria-hidden="true" />
                {unavailable ? "Ask for evidence" : "Send back"}
              </button>
              <button
                type="button"
                disabled={unavailable}
                aria-describedby={unavailable ? `${uid}-why` : undefined}
                onClick={() => decide("accepted")}
                className={ACCEPT_CLS}
              >
                <Check aria-hidden="true" />
                {unavailable ? "Accept" : `Accept ${formatValue(minted, "quirqs1")}`}
              </button>
            </div>
          ) : null}
        </div>
        {unavailable && decision === "awaiting" && !composing ? (
          <p id={`${uid}-why`} className="text-[11.5px] text-ink-faint">
            Nothing to accept until a measurement is available. {unavailableNote}
          </p>
        ) : null}

        {composing ? (
          <form onSubmit={submit} onKeyDown={onFormKey} className="flex flex-col gap-2 rounded-[12px] border border-hair bg-black/30 p-3" noValidate>
            <label htmlFor={`${uid}-note`} className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-dim">
              {unavailable ? "What evidence is missing" : "What needs to change"}
            </label>
            <textarea
              ref={textareaRef}
              id={`${uid}-note`}
              rows={2}
              value={draft}
              required
              aria-invalid={error || undefined}
              aria-describedby={`${uid}-note-hint`}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(false);
              }}
              placeholder={unavailable ? "Attach before and after snapshots and name the checks." : "The status tests still fail on the summary row."}
              className={cn(
                "w-full resize-y rounded-[10px] border bg-s1 px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint",
                error ? "border-red/60" : "border-hair",
              )}
            />
            <p id={`${uid}-note-hint`} className={cn("text-[11.5px]", error ? "text-red" : "text-ink-faint")}>
              {error ? "Add a note so the agent knows what to fix." : "The note goes back to the session with the failed checks. Escape cancels."}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="subtle" size="sm" onClick={cancelSendBack}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" size="sm" leadingIcon={<CornerUpLeft />}>
                Send back
              </Button>
            </div>
          </form>
        ) : null}

        {decision !== "awaiting" ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-hair-soft bg-white/[0.02] px-3.5 py-2.5">
            <p className="text-[12.5px] text-ink-dim">
              {decision === "accepted" ? (
                <>
                  <span className="text-grn">Accepted</span> by {reviewer} · {formatValue(minted, "quirqs1")} minted to {project}
                </>
              ) : (
                <>
                  <span className="text-org">Sent back</span> by {reviewer}
                  {note ? <> · &ldquo;{note}&rdquo;</> : null}
                </>
              )}
            </p>
            <Button variant="subtle" size="sm" leadingIcon={<RotateCcw />} onClick={() => decide("awaiting")}>
              Reopen review
            </Button>
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </footer>
    </article>
  );
}
