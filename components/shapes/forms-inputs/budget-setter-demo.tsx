"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { CURRENT_USER, PEOPLE, PROJECTS, PROJECT_BY_ID, QUIRQ_READINGS, WORK_ITEMS } from "@/lib/fixtures";
import { formatQuirqs } from "@/lib/format";
import { DemoCell, DemoGrid } from "./_kit";
import { BudgetField, BudgetSetter, MintEquation } from "./budget-setter";
import { FormToast } from "./form-toast";
import { ProjectPicker } from "./pickers";
import { useTimers } from "./_timers";

const UNSET = WORK_ITEMS.find((w) => w.id === "wi_48")!; // galileo#17, backlog, no budget yet
const SET = WORK_ITEMS.find((w) => w.id === "wi_55")!; // space-drift#4, before work starts
const MEASURED = QUIRQ_READINGS.find((r) => r.unitId === "uow_118")!;
const UNMEASURED = QUIRQ_READINGS.find((r) => r.unitId === "uow_121")!;

const ownerOf = (projectId: string) => PEOPLE[PROJECT_BY_ID[projectId].owner].name;

function NewTaskForm() {
  const uid = useId();
  const later = useTimers();
  const [title, setTitle] = useState("Telescope: keep the bar readable at 390px");
  const [project, setProject] = useState<string | null>("telescope");
  const [budget, setBudget] = useState("12");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const n = Number(budget);
  const budgetOk = budget === "" || (Number.isInteger(n) && n >= 1 && n <= 100);

  return (
    <div className="flex flex-col gap-3">
      <form
        noValidate
        aria-labelledby={`${uid}-t`}
        className="flex flex-col gap-4 rounded-[14px] border border-hair bg-s2 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !project || !budgetOk) return;
          setBusy(true);
          later(() => {
            setBusy(false);
            setDone(budget ? `Budget B ${formatQuirqs(n)} potential, set by ${CURRENT_USER.name}.` : "Budget B not set. Set it before work starts to measure quirqs.");
          }, 700);
        }}
      >
        <h4 id={`${uid}-t`} className="text-[14px] font-semibold text-ink">
          New task
        </h4>
        <Field id={`${uid}-title`} label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="flex flex-col gap-1.5">
          <span id={`${uid}-p`} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
            Project
          </span>
          <ProjectPicker
            labelledBy={`${uid}-p`}
            aria-label="Project"
            value={project}
            onChange={setProject}
            options={PROJECTS.map((p) => ({ value: p.id, label: p.displayName, color: `var(--${p.color})`, meta: p.category }))}
          />
        </div>
        <BudgetField id={`${uid}-b`} value={budget} onChange={setBudget} />
        <div className="flex items-center gap-2 border-t border-hair-soft pt-4">
          <Button type="submit" variant="primary" size="sm" disabled={!title.trim() || !project || !budgetOk} loading={busy} loadingLabel="Creating…">
            Create task
          </Button>
        </div>
      </form>
      {done ? <FormToast tone="success" title="Task created" description={done} onDismiss={() => setDone(null)} /> : null}
    </div>
  );
}

export function BudgetSetterDemo() {
  return (
    <DemoGrid>
      <DemoCell label="Inline on a work item · unset" note="Type or drag; Enter saves">
        <BudgetSetter
          itemRef={`${PROJECT_BY_ID[UNSET.projectId].displayName}#${UNSET.number}`}
          title={UNSET.title}
          project={UNSET.repo}
          owner={ownerOf(UNSET.projectId)}
          state="unset"
          budget={null}
        />
      </DemoCell>
      <DemoCell label="Inline on a work item · set">
        <BudgetSetter
          itemRef={`${PROJECT_BY_ID[SET.projectId].displayName}#${SET.number}`}
          title={SET.title}
          project={SET.repo}
          owner={ownerOf(SET.projectId)}
          state="set"
          budget={15}
        />
      </DemoCell>
      <DemoCell label="Locked once work starts · measured">
        <BudgetSetter
          itemRef={MEASURED.unitId}
          title={MEASURED.title}
          project={MEASURED.projectId}
          owner={PEOPLE[MEASURED.owner].name}
          state="locked"
          budget={MEASURED.budgetB}
          lockedNote="the run started Fri 2 Oct, 08:14"
          result={{ v: MEASURED.completionV, q: MEASURED.mintedQ, cost: MEASURED.costTotal, provenance: MEASURED.provenance, method: MEASURED.method }}
        />
      </DemoCell>
      <DemoCell label="Locked · no measurement">
        <BudgetSetter
          itemRef={UNMEASURED.unitId}
          title={UNMEASURED.title}
          project={UNMEASURED.projectId}
          owner={PEOPLE[UNMEASURED.owner].name}
          state="locked"
          budget={UNMEASURED.budgetB}
          lockedNote="the run started 3h ago"
          result={{ v: null, q: null, cost: UNMEASURED.costTotal, provenance: UNMEASURED.provenance, method: UNMEASURED.method }}
        />
      </DemoCell>
      <DemoCell label="Field in a new task form">
        <NewTaskForm />
      </DemoCell>
      <DemoCell label="Mint rule · equation chip">
        <div className="flex flex-col gap-4 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-5">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="sm:border-r sm:border-hair sm:pr-5">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Potential, before the run</dt>
              <dd className="mt-3 font-mono text-[26px] leading-none text-ink">B</dd>
              <dd className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">The outcome budget, set by the human owner before the work runs.</dd>
            </div>
            <div>
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Minted, after verification</dt>
              <dd className="mt-3 font-mono text-[26px] leading-none text-ink">
                <span className="spec-text font-semibold">Q</span>
                <span className="mx-2 text-ink-faint">=</span>V<span className="mx-2 text-ink-faint">·</span>B
              </dd>
              <dd className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">Released by verification against before and after snapshots.</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 border-t border-hair-soft pt-4">
            <MintEquation />
            <MintEquation v={MEASURED.completionV} b={MEASURED.budgetB} q={MEASURED.mintedQ} />
            <MintEquation v={null} b={UNMEASURED.budgetB} q={null} />
          </div>
        </div>
      </DemoCell>
    </DemoGrid>
  );
}
