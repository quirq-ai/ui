"use client";

// Budget B setter: the owner sets potential quirqs before the work runs. BudgetSetter sits
// inline on a work item (unset, set and still editable, locked once work starts; a locked
// item shows its verified result or "Unavailable"), BudgetField is the same control as a
// field in a new task form, and MintEquation is the compact "Q = V · B" chip. Type or drag;
// Enter saves. B is potential, never delivered work; cost is recorded separately.
import { useId, useState, type ReactNode } from "react";
import { Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatFixed, formatQuirqs, UNAVAILABLE } from "@/lib/format";
import { FormStyles } from "./_styles";
import { useTimers } from "./_timers";

/* ============================================================================ MintEquation */

/** "Q = V · B": spectrum on the minted side, monochrome on the budget. */
export function MintEquation({ v, b, q, className }: { v?: number | null; b?: number | null; q?: number | null; className?: string }) {
  const filled = v !== undefined || b !== undefined;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-[6px] border border-hair bg-black/40 px-2 py-1 font-mono text-[11.5px] text-ink-dim", className)}>
      <span className="spec-text font-semibold">Q</span>
      <span className="text-ink-faint">=</span>
      <span>V</span>
      <span className="text-ink-faint">·</span>
      <span>B</span>
      {filled ? (
        <>
          <span className="mx-1 h-3 w-px bg-hair-strong" aria-hidden="true" />
          <span className="text-ink">
            {q === null || v === null ? UNAVAILABLE : `${formatFixed(v ?? 0, 2)} · ${b ?? 0} = ${formatFixed(q ?? 0, q !== undefined && Number.isInteger(q) ? 0 : 1)}`}
          </span>
        </>
      ) : null}
    </span>
  );
}

/* ============================================================================ BudgetInput (shared) */

type BudgetInputProps = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  min: number;
  max: number;
  disabled?: boolean;
  describedBy?: string;
  invalid?: boolean;
};

/** Number box with a quirqs unit plus a slider over the same value. */
function BudgetInput({ id, value, onChange, onEnter, min, max, disabled, describedBy, invalid }: BudgetInputProps) {
  const n = Number(value);
  const sliderVal = Number.isFinite(n) && value !== "" ? Math.min(max, Math.max(min, n)) : min;
  const pct = ((sliderVal - min) / (max - min)) * 100;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <FormStyles />
      <div className="fi-ring flex h-9 w-[150px] items-center rounded-[10px] border border-hair bg-s1 pr-3 transition-colors hover:border-hair-strong">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              const next = Math.min(max, Math.max(min, (Number.isFinite(n) ? n : min) + (e.key === "ArrowUp" ? 1 : -1)));
              onChange(String(next));
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent pl-3 font-mono text-[15px] font-semibold tabular-nums text-ink focus-visible:outline-none! disabled:opacity-50"
        />
        <span className="text-[12px] text-ink-dim">quirqs</span>
      </div>
      <input
        type="range"
        aria-label="Budget B"
        aria-valuetext={`${sliderVal} quirqs potential`}
        min={min}
        max={max}
        value={sliderVal}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="fi-range min-w-[120px] flex-1"
        style={{
          background: `linear-gradient(to right, var(--ink-dim) 0%, var(--ink-dim) ${pct}%, rgba(255,255,255,0.14) ${pct}%, rgba(255,255,255,0.14) 100%)`,
          ["--fi-thumb" as string]: "var(--ink)",
        }}
      />
    </div>
  );
}

/* ============================================================================ BudgetSetter */

export type BudgetState = "unset" | "set" | "locked";

export type BudgetSetterProps = {
  /** "uow_120" or "galileo#17". */
  itemRef: string;
  title: string;
  project: string;
  owner: string;
  state: BudgetState;
  budget: number | null;
  min?: number;
  max?: number;
  presets?: number[];
  /** Locked: when work started, e.g. "the run started 3m ago". */
  lockedNote?: ReactNode;
  /** Locked and measured: V, minted Q and cost (USD, mock). null V means Unavailable. */
  result?: { v: number | null; q: number | null; cost: number | null; provenance: string; method: string } | null;
  onSave?: (b: number) => void;
  className?: string;
};

/** Inline on a work item: set B before the run, then it locks. */
export function BudgetSetter({
  itemRef,
  title,
  project,
  owner,
  state: initial,
  budget: initialBudget,
  min = 1,
  max = 100,
  presets = [8, 15, 25, 40],
  lockedNote,
  result,
  onSave,
  className,
}: BudgetSetterProps) {
  const uid = useId();
  const later = useTimers();
  const [state, setState] = useState<BudgetState>(initial);
  const [budget, setBudget] = useState(initialBudget);
  const [editing, setEditing] = useState(initial === "unset");
  const [draft, setDraft] = useState(initialBudget === null ? "" : String(initialBudget));
  const [saving, setSaving] = useState(false);
  const n = Number(draft);
  const valid = draft !== "" && Number.isInteger(n) && n >= min && n <= max;

  function save() {
    if (!valid || saving) return;
    setSaving(true);
    later(() => {
      setSaving(false);
      setBudget(n);
      setState("set");
      setEditing(false);
      onSave?.(n);
    }, 600);
  }

  return (
    <article aria-labelledby={`${uid}-t`} className={cn("flex min-w-0 flex-col gap-4 rounded-[14px] border border-hair bg-s2 p-4 sm:p-5", className)}>
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
            {itemRef} · {project}
          </p>
          <h4 id={`${uid}-t`} className="mt-1 text-[14px] font-semibold leading-snug text-ink">
            {title}
          </h4>
        </div>
        <Avatar name={owner} size="sm" />
      </header>

      {state === "locked" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-dim">Budget B</span>
            <span className="font-mono text-[20px] font-semibold tabular-nums text-ink">{budget}</span>
            <span className="text-[12.5px] text-ink-dim">quirqs potential</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-ink-faint">
              <Lock aria-hidden="true" className="size-3.5" />
              Locked{lockedNote ? <>: {lockedNote}</> : null}
            </span>
          </div>
          {result ? (
            <div className="flex flex-col gap-2 rounded-[10px] border border-hair-soft bg-black/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <MintEquation v={result.v} b={budget} q={result.q} />
                <Badge size="xs" mono>
                  {result.provenance}
                </Badge>
              </div>
              {result.v === null ? (
                <p className="text-[12.5px] text-ink-dim">
                  <span className="text-ink">Minted: {UNAVAILABLE}.</span> No quirq measurement is available for this work.
                </p>
              ) : (
                <p className="text-[12.5px] text-ink-dim">
                  V = {formatFixed(result.v, 2)} · minted <span className="spec-text font-semibold">{formatQuirqs(result.q)}</span> · cost recorded separately ({formatCurrency(result.cost)}, mock)
                </p>
              )}
              <p className="font-mono text-[10.5px] text-ink-faint">{result.method}</p>
            </div>
          ) : null}
        </div>
      ) : editing ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label htmlFor={`${uid}-b`} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
            Budget B {state === "unset" ? <span className="normal-case tracking-normal text-ink-faint">· not set</span> : null}
          </label>
          <BudgetInput id={`${uid}-b`} value={draft} onChange={setDraft} onEnter={save} min={min} max={max} disabled={saving} describedBy={`${uid}-g`} invalid={draft !== "" && !valid} />
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Common budgets">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={draft === String(p)}
                disabled={saving}
                onClick={() => setDraft(String(p))}
                className={cn(
                  "h-7 rounded-full! border px-2.5 font-mono text-[11.5px] tabular-nums transition-colors",
                  draft === String(p) ? "border-ink bg-ink text-black" : "border-hair text-ink-dim hover:border-hair-strong hover:text-ink",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <p id={`${uid}-g`} className={cn("text-[12px] leading-snug", draft !== "" && !valid ? "text-[#ff7a70]" : "text-ink-faint")}>
            {draft !== "" && !valid ? `Use a whole number from ${min} to ${max}.` : "B is potential, not delivered. Nothing is minted by declaring it; verification releases Q = V · B."}
          </p>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" variant="primary" disabled={!valid} loading={saving} loadingLabel="Saving…">
              Save budget
            </Button>
            {state === "set" ? (
              <Button size="sm" variant="subtle" disabled={saving} onClick={() => setEditing(false)}>
                Cancel
              </Button>
            ) : null}
            <span className="ml-auto hidden text-[11.5px] text-ink-faint sm:inline">Enter saves</span>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[13px] text-ink-dim">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">Budget B</span>
            <span className="mx-2 font-mono text-[18px] font-semibold tabular-nums text-ink">{budget}</span>
            quirqs potential · set by <span className="text-ink">{owner}</span> before work starts
          </p>
          <Button size="sm" variant="subtle" leadingIcon={<Pencil aria-hidden="true" />} className="ml-auto" onClick={() => setEditing(true)}>
            Change
          </Button>
        </div>
      )}
    </article>
  );
}

/* ============================================================================ BudgetField */

export type BudgetFieldProps = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  className?: string;
};

/** Budget B as a field in a new task form. Empty means unset, which is allowed. */
export function BudgetField({ id, value, onChange, min = 1, max = 100, className }: BudgetFieldProps) {
  const n = Number(value);
  const invalid = value !== "" && (!Number.isInteger(n) || n < min || n > max);
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
          Budget B
        </label>
        <span className="text-[11.5px] text-ink-faint">Optional · set before work starts</span>
      </div>
      <BudgetInput id={id} value={value} onChange={onChange} min={min} max={max} describedBy={`${id}-g`} invalid={invalid} />
      <p id={`${id}-g`} className={cn("text-[12px] leading-snug", invalid ? "text-[#ff7a70]" : "text-ink-faint")}>
        {invalid ? `Use a whole number from ${min} to ${max}.` : "Potential quirqs for this task. It locks when the first run starts."}
      </p>
    </div>
  );
}
