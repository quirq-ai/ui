"use client";

import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { JOBS, NOW_ISO } from "@/lib/fixtures";
import { DemoCell, DemoGrid } from "./_kit";
import { JobEditorWizard, SignInFlow, StepProgress, Stepper } from "./wizard";

const NIGHTLY = JOBS.find((j) => j.id === "job_nightly")!;

const BUILDER_STEPS = ["Basic information", "Character details", "Style", "Examples", "Adjectives", "Knowledge base", "JSON preview"];

export function WizardDemo() {
  return (
    <DemoGrid>
      <DemoCell label="Two-step sign-in" note="16 or more characters connect; shorter shows the error">
        <SignInFlow provider="Claude" verify={(code) => code.length >= 16} />
      </DemoCell>

      <DemoCell label="States · done, error, waiting, disabled">
        <div className="rounded-[14px] border border-hair bg-s2 p-5">
          <Stepper
            steps={[
              { id: "a", title: "Sign in with ChatGPT", state: "done", description: <span className="text-grn">Signed in</span> },
              {
                id: "b",
                title: "Enter sign-in code",
                state: "error",
                description: <span className="text-[#ff7a70]">Invalid code. Please make sure the full code was copied.</span>,
              },
              { id: "c", title: "Check the connection", state: "waiting", description: "Waiting for the Space API to answer…" },
              { id: "d", title: "Pick a default model", state: "disabled", description: "Available after the connection check." },
            ]}
          />
        </div>
      </DemoCell>

      <DemoCell label="Job editor presets" note="Next, Back; preview from a fixed now" className="md:col-span-2">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <JobEditorWizard nowIso={NOW_ISO} defaultName="Weekly usage report" defaultCommand="xo usage report --week" />
          <JobEditorWizard
            nowIso={NOW_ISO}
            defaultName={NIGHTLY.name}
            defaultCommand={NIGHTLY.command.join(" ")}
            defaultSchedule={{ kind: "scheduled", repeat: "daily", time: "02:00" }}
            defaultStep={1}
          />
        </div>
      </DemoCell>

      <DemoCell label="Step 2 of 7 progress" note="Agent builder" className="md:col-span-2">
        <StepProgress steps={BUILDER_STEPS} defaultStep={1}>
          {(i) =>
            i === 0 ? (
              <Field id="wz-agent-name" label="Agent name">
                <Input defaultValue="Ops helper" />
              </Field>
            ) : i === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="wz-bio" label="Bio" hint="One or two sentences.">
                  <Textarea rows={3} defaultValue="Keeps runbooks current and answers on-call questions for ops-copilot." />
                </Field>
                <Field id="wz-lore" label="Lore" aside="Optional">
                  <Textarea rows={3} defaultValue="Started as a checklist in ops-runbooks." />
                </Field>
              </div>
            ) : i === BUILDER_STEPS.length - 1 ? (
              <pre className="scroll-thin overflow-x-auto rounded-[10px] border border-hair-soft bg-black/50 p-3 font-mono text-[11.5px] leading-relaxed text-ink-dim">
                {`{\n  "name": "Ops helper",\n  "style": ["plain", "short"],\n  "knowledge": ["ops-runbooks"]\n}`}
              </pre>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {["plain", "short", "careful", "kind", "direct"].map((w) => (
                  <Badge key={w} size="md">
                    {w}
                  </Badge>
                ))}
              </div>
            )
          }
        </StepProgress>
      </DemoCell>
    </DemoGrid>
  );
}
