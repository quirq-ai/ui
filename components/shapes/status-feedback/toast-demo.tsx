"use client";

import { useRef, useState } from "react";
import { ArrowRight, Copy, HardDrive, Layers, Mail, RotateCw, Save } from "lucide-react";
import { Button, ButtonGroup } from "@/components/ui/button";
import { copyText } from "@/components/ui/copy-button";
import { Kbd } from "@/components/ui/kbd";
import { CURRENT_SPACE, INBOX } from "@/lib/fixtures";
import { Caption, DemoGroup, DemoStack, Specimen } from "./parts";
import { DismissedSlot } from "./dismissed-slot";
import { AmbientToast, FloatingNotice, HudPrompt, PillToast, Toast, Toaster, usePillToast, useToasts } from "./toast";

const PILL_MESSAGES = ["Project cloned", "Access revoked", "Log path copied", "3 new from Gmail", "Downloaded agents-tools-7d-2026-10-02.csv"];

const gmail = INBOX.find((i) => i.kind === "gmail.unread");

/** Resolves (or rejects) after a fixed delay, so the promise chain is deterministic. */
function settle(ms: number, ok = true): Promise<void> {
  return new Promise((resolve, reject) => setTimeout(() => (ok ? resolve() : reject(new Error("500"))), ms));
}

export function ToastDemo() {
  const { toasts, push, dismiss, promise, clear } = useToasts(3);
  const pill = usePillToast(1900);
  const pillIdx = useRef(0);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const [specimenToast, setSpecimenToast] = useState(true);
  const [notice, setNotice] = useState(true);

  const saveSecrets = (attempt: number) => {
    setSaveAttempt(attempt);
    promise(settle(1400, attempt > 0), {
      loading: { title: "Saving secrets…" },
      success: { title: "Secrets saved", description: "3 secrets updated in research-lab." },
      error: {
        title: "Could not save secrets",
        description: "The Space API answered 500. Nothing was changed.",
        action: { label: "Try again", onClick: () => saveSecrets(attempt + 1) },
      },
    });
  };

  return (
    <DemoStack>
      <DemoGroup title="Live stack" hint="Toasts never take focus. Hover the stack or Tab into it to pause the timers; Escape there dismisses the newest.">
        <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-black/50">
          <div className="flex flex-col gap-3 border-b border-hair-soft bg-[#0f0f11] px-4 py-3">
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-[12.5px] text-ink">
                Space dashboard <span className="text-ink-faint">· {CURRENT_SPACE.name}</span>
              </p>
              <Caption>{saveAttempt > 0 ? `save attempt ${saveAttempt + 1}` : "mock actions"}</Caption>
            </div>
            <ButtonGroup aria-label="Trigger a toast">
              <Button
                size="sm"
                leadingIcon={<Copy />}
                onClick={async () => {
                  const ok = await copyText(CURRENT_SPACE.id);
                  push(ok ? { kind: "success", title: "Space ID copied", description: CURRENT_SPACE.id } : { kind: "error", title: "Could not copy", description: "Select the ID and copy it by hand." });
                }}
              >
                Copy space ID
              </Button>
              <Button
                size="sm"
                leadingIcon={<Mail />}
                onClick={() => push({ kind: "info", title: gmail?.title ?? "3 new from Gmail", description: gmail?.detail })}
              >
                Poll Gmail
              </Button>
              <Button size="sm" leadingIcon={<Layers />} onClick={() => push({ kind: "warning", title: "8 tabs is the limit", description: "Close one to open another." })}>
                Open a 9th tab
              </Button>
              <Button size="sm" leadingIcon={<Save />} onClick={() => saveSecrets(0)}>
                Save secrets
              </Button>
              <Button
                size="sm"
                leadingIcon={<RotateCw />}
                onClick={() =>
                  promise(settle(1800), {
                    loading: { title: "Restarting OpenClaw gateway…" },
                    success: { title: "OpenClaw gateway restarted", description: "Sessions reconnect on their next turn." },
                    error: { title: "Gateway did not restart" },
                  })
                }
              >
                Restart gateway
              </Button>
              <Button
                size="sm"
                leadingIcon={<HardDrive />}
                onClick={() =>
                  promise(settle(1500), {
                    loading: { title: "Connecting Google Drive…" },
                    success: { title: "Google Drive connected", description: "Remote “gdrive-personal” is ready." },
                    error: { title: "Connection failed" },
                  })
                }
              >
                Connect Drive
              </Button>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  pill.show(PILL_MESSAGES[pillIdx.current % PILL_MESSAGES.length]);
                  pillIdx.current += 1;
                }}
              >
                Pill toast
              </Button>
              <Button size="sm" variant="subtle" onClick={clear} disabled={!toasts.length}>
                Clear
              </Button>
            </ButtonGroup>
          </div>
          <div className="relative min-h-[330px]">
            <div className="dots pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
            {toasts.length === 0 && !pill.on ? (
              <p className="pointer-events-none absolute inset-x-4 top-[42%] text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                Pick an action above · toasts stack in the corner
              </p>
            ) : null}
            <div className="pointer-events-none absolute inset-x-3 bottom-4 flex justify-center sm:bottom-6">
              <PillToast on={pill.on}>{pill.message}</PillToast>
            </div>
            <Toaster toasts={toasts} onDismiss={dismiss} position="contained" className="bottom-16 sm:bottom-3" />
          </div>
        </div>
      </DemoGroup>

      <DemoGroup title="success / info / warning / error">
        <div className="grid gap-3 md:grid-cols-2">
          <Specimen label="success">
            <Toast kind="success" title="Space ID copied" description={CURRENT_SPACE.id} />
          </Specimen>
          <Specimen label="info">
            <Toast kind="info" title="Added docs" description="Opens at docs.localhost:4100" />
          </Specimen>
          <Specimen label="warning">
            <Toast kind="warning" title="8 tabs is the limit" description="Close one to open another." />
          </Specimen>
          <Specimen label="error · with action">
            <Toast kind="error" title="Could not save secrets" description="The Space API answered 500. Nothing was changed." action={{ label: "Try again", onClick: () => saveSecrets(1) }} />
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Promise chain and states">
        <div className="grid gap-3 lg:grid-cols-2">
          <Specimen label="promise · loading then success or error">
            <div className="flex flex-col gap-2">
              <Toast kind="loading" title="Restarting Hermes gateway…" />
              <ArrowRight aria-hidden="true" className="ml-4 size-3.5 rotate-90 text-ink-faint" />
              <Toast kind="success" title="Hermes gateway restarted" />
              <Caption className="mt-1">or</Caption>
              <Toast kind="error" title="Gateway did not restart" description="Port 4310 is in use. Stop the other process and try again." />
            </div>
          </Specimen>
          <Specimen label="entering · visible · auto-dismiss">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Caption>entering · rises 8px</Caption>
                <Toast kind="info" title="Cleared 4 saved entries" phase="entering" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Caption>visible · timer at 35% · close button</Caption>
                {specimenToast ? (
                  <Toast kind="success" title="Google Drive connected" description="Remote “gdrive-personal” is ready." timerAt={0.35} onDismiss={() => setSpecimenToast(false)} />
                ) : (
                  <DismissedSlot label="Toast dismissed" onRestore={() => setSpecimenToast(true)} className="max-w-[360px]" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Caption>auto-dismiss · 4 s, paused on hover</Caption>
                <Toast kind="success" title="Project cloned" description="galileo is in the projects folder." timerAt={0.06} />
              </div>
            </div>
          </Specimen>
        </div>
      </DemoGroup>

      <DemoGroup title="Pill, HUD prompt and floating notice">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Specimen label="pill toast · space dashboard" bodyClassName="flex flex-col items-center gap-2.5 py-2">
            <PillToast>Project cloned</PillToast>
            <PillToast>Access revoked</PillToast>
            <Caption>auto hides after 1.9 s</Caption>
          </Specimen>
          <Specimen label="HUD prompt · default · shot" bodyClassName="flex flex-col items-start gap-2.5">
            <HudPrompt>Connect a folder to discover its system.</HudPrompt>
            <HudPrompt>
              <Kbd size="xs">L</Kbd> Land on observatory
            </HudPrompt>
            <HudPrompt variant="shot">
              Captured · <Kbd size="xs">L</Kbd> Land on orbital-engine
            </HudPrompt>
            <HudPrompt variant="shot">
              <Kbd size="xs">E</Kbd> README.md · Open
            </HudPrompt>
          </Specimen>
          <Specimen label="floating notice · ambient event" bodyClassName="flex flex-col items-start gap-2.5">
            {notice ? (
              <FloatingNotice onDismiss={() => setNotice(false)}>Projects changed. Use Refresh at the top of the page to reload the map.</FloatingNotice>
            ) : (
              <DismissedSlot label="Notice dismissed" onRestore={() => setNotice(true)} className="max-w-[420px]" />
            )}
            <AmbientToast>observatory brightened: a commit landed.</AmbientToast>
            <AmbientToast>Tour JSON copied. Paste it into .space/tours to share it.</AmbientToast>
          </Specimen>
        </div>
      </DemoGroup>
    </DemoStack>
  );
}
