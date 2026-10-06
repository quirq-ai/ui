// Live demo for the todo-checklist shape: steps grouped by session (completed, in progress,
// pending, blocked and cancelled) and the next step card for several sessions. Read only.
import { SESSION_BY_ID, TODOS, type TodoStatus } from "@/lib/fixtures";
import { RuntimeTag } from "@/components/ui/runtime-logo";
import { DemoBlock, logoFor } from "./demo-kit";
import { NextStepCard, STEP_STATUS, StepIcon, TodoGroup, pickNextStep, type StepItem } from "./todo-checklist";

const SESSION_IDS = [...new Set(TODOS.map((t) => t.sessionId))];

const stepsFor = (sessionId: string): StepItem[] =>
  TODOS.filter((t) => t.sessionId === sessionId).map((t) => ({ id: t.id, content: t.content, status: t.status, note: t.note, updated: t.updatedAgo }));

const LEFT = ["df1a1a5b", "a41f03be", "b8d2c4e7"];
const RIGHT = ["7c2e91d0", "9d4c2f68"];
const NEXT = ["df1a1a5b", "f0c5d218", "e19a7b33"];
const ORDER: TodoStatus[] = ["completed", "in_progress", "pending", "blocked", "cancelled"];

function Group({ id }: { id: string }) {
  const s = SESSION_BY_ID[id];
  return <TodoGroup sessionId={id} runtime={<RuntimeTag id={logoFor(s.runtime)} />} project={s.projectId} title={s.title} steps={stepsFor(id)} />;
}

export function TodoChecklistDemo() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <ul aria-label="Step statuses" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {ORDER.map((st) => (
            <li key={st} className="inline-flex items-center gap-1.5 text-[12px] text-ink-dim">
              <StepIcon status={st} decorative />
              {STEP_STATUS[st].label}
            </li>
          ))}
        </ul>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          {TODOS.length} steps across {SESSION_IDS.length} sessions · read only · mock data
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemoBlock label="Grouped by session · in progress, pending, blocked, cancelled">
          <div className="flex flex-col gap-4">
            {LEFT.map((id) => (
              <Group key={id} id={id} />
            ))}
          </div>
        </DemoBlock>
        <div className="flex min-w-0 flex-col gap-6">
          <DemoBlock label="Grouped by session · blocked on a person">
            <div className="flex flex-col gap-4">
              {RIGHT.map((id) => (
                <Group key={id} id={id} />
              ))}
            </div>
          </DemoBlock>
          <DemoBlock label="Next step · in progress first, then pending, else first">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {NEXT.map((id) => {
                const s = SESSION_BY_ID[id];
                const steps = stepsFor(id);
                return (
                  <NextStepCard
                    key={id}
                    step={pickNextStep(steps)}
                    detail={s.summary}
                    runtime={<RuntimeTag id={logoFor(s.runtime)} />}
                    project={`${s.projectId} · ${id}`}
                  />
                );
              })}
              <NextStepCard step={null} project="space-drift" />
            </div>
          </DemoBlock>
        </div>
      </div>
    </div>
  );
}
