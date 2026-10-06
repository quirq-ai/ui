"use client";

import { useEffect, useRef, useState } from "react";
import { Field, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/loaders";
import { SPACE_BY_ID, JOBS } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { DemoCell, DemoGrid, DemoRule, FOCUS_LOOK } from "./_kit";
import {
  CommandField,
  InlineInput,
  NumberStepper,
  ReadOnlyEnvField,
  ReportBugForm,
  SecretInput,
  type ReportStatus,
} from "./text-fields";

const OPS = SPACE_BY_ID["ws_7f3a9c21e4b0"];
const NIGHTLY = JOBS.find((j) => j.id === "job_nightly")!;

const BUG_DRAFT =
  "<p>The <b>Running</b> pill stays green after I stop ops-copilot.</p><ul><li>Open the space list</li><li>Stop the space</li></ul>";

function ReportBugDemo() {
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [outcome, setOutcome] = useState<"sends" | "fails">("sends");
  const [round, setRound] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[12px] text-ink-faint">Next send</span>
        <Segmented
          size="sm"
          aria-label="Outcome of the next send"
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: "sends", label: "Succeeds" },
            { value: "fails", label: "Fails" },
          ]}
        />
      </div>
      <ReportBugForm
        key={round}
        status={status}
        defaultHtml={round === 0 ? BUG_DRAFT : ""}
        onSubmit={() => {
          setStatus("submitting");
          timer.current = setTimeout(() => setStatus(outcome === "fails" ? "error" : "success"), 1100);
        }}
        onReset={() => {
          setStatus("idle");
          setRound((r) => r + 1);
        }}
      />
    </div>
  );
}

export function TextFieldsDemo() {
  return (
    <div>
      <DemoGrid>
        <DemoCell label="Mono · command" note="Enter submits, Esc cancels">
          <Field id="tf-command" label="Command" hint="Runs in the project folder. Shift+Enter adds a line.">
            <CommandField defaultValue="git status --short" />
          </Field>
        </DemoCell>

        <DemoCell label="Read-only env" note="Set by the space, copy only">
          <div className="flex flex-col gap-2.5">
            <ReadOnlyEnvField name="NEXT_PUBLIC_XO_SPACE_NAME" value={OPS.name} />
            <ReadOnlyEnvField name="XO_SPACE_ID" value={OPS.id} />
          </div>
        </DemoCell>

        <DemoCell label="Password reveal" className="md:col-span-2">
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
            <Field id="tf-key-hidden" label="ANTHROPIC_API_KEY" hint="Hidden · starts with sk-ant-">
              <SecretInput defaultValue="sk-ant-example-0000" placeholder="sk-ant-…" noun="API key" />
            </Field>
            <Field id="tf-key-revealed" label="Gateway token" hint="Revealed · copy works">
              <SecretInput defaultValue="gw_example_7f3a9c21" defaultRevealed revealStyle="text" copyable noun="gateway token" />
            </Field>
            <Field
              id="tf-key-saving"
              label="OPENROUTER_API_KEY"
              hint={
                <span className="inline-flex items-center gap-1.5">
                  <Spinner size="xs" label={null} /> Saving · disabled until it settles
                </span>
              }
            >
              <SecretInput defaultValue="sk-or-example-0000" disabled placeholder="sk-or-…" noun="API key" />
            </Field>
            <Field id="tf-key-error" label="GITHUB_PAT" error="A token starts with ghp_ or github_pat_.">
              <SecretInput defaultValue="gh-example" defaultRevealed placeholder="ghp_…" noun="token" />
            </Field>
          </div>
        </DemoCell>

        <DemoCell label="Number stepper" note="Joined, clamps on blur">
          <div className="flex flex-col gap-5">
            <Field id="tf-volume" label="Volume size (GB)" hint="2 to 20 GB. Type a value or use the buttons.">
              <NumberStepper min={2} max={20} defaultValue={4} unit="GB" noun="volume size" />
            </Field>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] text-ink-faint">At min · minus off</span>
                <NumberStepper min={2} max={20} defaultValue={2} unit="GB" noun="volume size" aria-label="Volume size at minimum" size="sm" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] text-ink-faint">At max · plus off</span>
                <NumberStepper min={2} max={20} defaultValue={20} unit="GB" noun="volume size" aria-label="Volume size at maximum" size="sm" />
              </div>
            </div>
          </div>
        </DemoCell>

        <DemoCell label="Number with unit · inline in sentence">
          <div className="flex flex-col gap-5">
            <Field id="tf-interval" label="Check every" hint="0.25 to 60 seconds. Default: 1.">
              <Input type="number" min={0.25} max={60} step={0.25} defaultValue={1} mono className="max-w-[240px]" trailing={<span className="pr-1.5">seconds</span>} />
            </Field>
            <div className="rounded-[12px] border border-hair-soft bg-black/30 px-4 py-3.5 text-[13px] leading-[2.3] text-ink-dim">
              <p>
                Check every
                <InlineInput type="number" min={0.25} max={60} step={0.25} defaultValue={1} widthCh={3} aria-label="Check interval in seconds" />
                seconds, and keep the last
                <InlineInput type="number" min={5} max={500} defaultValue={30} widthCh={3} aria-label="Runs to keep" />
                runs.
              </p>
              <p>
                Run <span className="text-ink">{NIGHTLY.name}</span> every day at
                <InlineInput inputMode="numeric" maxLength={5} defaultValue="02:00" widthCh={5} aria-label="Run time, 24-hour" />
                UTC.
              </p>
            </div>
          </div>
        </DemoCell>

        <DemoCell label="Rich text" note="Empty disables Submit" className="md:col-span-2 xl:col-span-1">
          <ReportBugDemo />
        </DemoCell>

        <DemoCell label="Plain fields" note="Label, hint, helper">
          <div className="flex flex-col gap-5">
            <Field id="tf-space-name" label="Space name" hint="Lowercase letters, digits and dashes. 32 characters or fewer." required>
              <Input mono defaultValue="ops-copilot" />
            </Field>
            <Field id="tf-description" label="Description" labelStyle="plain" aside="Optional">
              <Input defaultValue={OPS.description} />
            </Field>
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoRule />

      <DemoGrid cols={3}>
        <DemoCell label="State · focus">
          <Field id="tf-focus" label="Port" hint="Keyboard focus draws a 2px ink ring, offset 3px.">
            <Input mono defaultValue="5173" className={cn(FOCUS_LOOK, "border-white/30")} />
          </Field>
        </DemoCell>
        <DemoCell label="State · invalid">
          <Field id="tf-invalid" label="Port" error="70000 is not a port: use 1 to 65535">
            <Input mono defaultValue="70000" />
          </Field>
        </DemoCell>
        <DemoCell label="State · disabled">
          <Field id="tf-disabled" label="Port" hint="Locked while the space is starting.">
            <Input mono defaultValue="5002" disabled />
          </Field>
        </DemoCell>
      </DemoGrid>
    </div>
  );
}
