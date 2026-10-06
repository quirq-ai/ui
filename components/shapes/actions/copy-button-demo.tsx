"use client";

// Live demo for copy buttons: the install command in its three landing forms, a space ID
// with a toast, the device sign-in code and the invite row, then idle, copied and error for
// every variant, and a simulated blocked clipboard that shows the real error path.
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { StateChip } from "@/components/ui/status";
import { DEVICE_SIGN_IN, INVITES, PEOPLE, PROJECT_BY_ID, SPACE_BY_ID } from "@/lib/fixtures";
import { CopyAction, CopyId, CopyToast, DeviceCode, InstallCommand, COPY_ERROR_MESSAGE, type Copier, type CopyStatus } from "./copy-actions";
import { Caption, DemoSection, DemoStack, Specimen, Stage } from "./demo-kit";

const INSTALL = "curl -fsSL quirq.ai/install | sh";

/** Stands in for a clipboard the browser refused (permissions, insecure origin). */
const blockedClipboard: Copier = async () => false;

type Toast = { id: number; message: string; tone: "ok" | "error" };

function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const show = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    seq.current += 1;
    setToast({ id: seq.current, message, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);
  return { toast, show, dismiss: () => setToast(null) };
}

export function CopyButtonDemo() {
  const space = SPACE_BY_ID["ws_7f3a9c21e4b0"];
  const project = PROJECT_BY_ID["xo-space"];
  const invite = INVITES[0];
  const inviteUrl = `${space.url}/invite/${invite.id}`;
  const clone = `git clone ${project.github?.url ?? "https://github.com/quirq-ai/xo-space"}.git`;
  const { toast, show, dismiss } = useToast();
  const onSpaceId = useCallback((ok: boolean) => show(ok ? "Space ID copied to clipboard" : "Could not copy the space ID", ok ? "ok" : "error"), [show]);

  return (
    <DemoStack>
      <DemoSection title="Variants · install command" cols={2}>
        <Specimen label="Full width pill · home" layout="block">
          <div className="glass p-4 sm:p-5">
            <p className="mb-4 text-[20px] font-bold">Get started</p>
            <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">Run in your shell</p>
            <InstallCommand variant="pill" command={INSTALL} />
          </div>
        </Specimen>
        <div className="flex min-w-0 flex-col gap-8">
          <Specimen label="Inline field · copy chip" layout="block">
            <InstallCommand variant="field" command={INSTALL} />
            <p className="mt-3 text-[12px] text-ink-faint">The command scrolls sideways inside the field and never wraps.</p>
          </Specimen>
          <Specimen label="Static display · pricing" layout="block">
            <InstallCommand variant="static" command={INSTALL} />
            <p className="mt-3 text-[12px] text-ink-faint">Display only, not interactive.</p>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Variants · IDs, codes and invites" cols={3}>
        <Specimen label="Space ID · toast" layout="block">
          <Stage className="relative min-h-[188px] overflow-hidden">
            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-[12.5px] text-ink-faint">
              <span>Spaces</span>
              <ChevronRight aria-hidden="true" className="size-3.5" />
              <span className="text-ink">{space.name}</span>
            </nav>
            <div className="mt-3">
              <CopyId label="Space ID" value={space.id} onResult={onSpaceId} />
            </div>
            <div className="mt-2">
              <StateChip kind="space" state="running" prefix="Hosted space" variant="plain" />
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end">
              {toast ? <CopyToast key={toast.id} message={toast.message} tone={toast.tone} onDismiss={dismiss} /> : null}
            </div>
          </Stage>
        </Specimen>
        <Specimen label="Device code" layout="block">
          <DeviceCode code={DEVICE_SIGN_IN.code} verifyUrl={DEVICE_SIGN_IN.verifyUrl} expiresIn={DEVICE_SIGN_IN.expiresIn} account={DEVICE_SIGN_IN.account} />
        </Specimen>
        <Specimen label="Copy invite · accent pill" layout="block">
          <Stage className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-ink">{invite.email}</p>
                <p className="text-[11.5px] text-ink-faint">
                  Invited by {PEOPLE[invite.invitedBy].name} · expires in {invite.expiresIn}
                </p>
              </div>
              <StateChip kind="membership" state="request_pending" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopyAction text={inviteUrl} variant="accent" label="Copy invite" announce="Invite link copied" />
              <CopyAction text={clone} variant="pill" label="Clone by hand" announce="Clone command copied" />
              <CopyAction text={invite.email} variant="pill" label="Copy" aria-label="Copy email" announce="Email copied" />
            </div>
          </Stage>
        </Specimen>
      </DemoSection>

      <DemoSection title="States · idle · copied 1.5 s · error" cols={1}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0 text-left">
            <caption className="sr-only">Copy button states by variant</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[110px] pb-3">
                  <Caption>Variant</Caption>
                </th>
                {(["idle", "copied", "error"] as CopyStatus[]).map((s) => (
                  <th key={s} scope="col" className="pb-3">
                    <Caption>{s}</Caption>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Icon", (s: CopyStatus) => <CopyAction text={space.id} status={s} aria-label="Copy space ID" tip={false} />],
                  ["Labelled", (s: CopyStatus) => <CopyAction text={DEVICE_SIGN_IN.code} variant="labelled" label="Copy code" status={s} />],
                  ["Pill", (s: CopyStatus) => <CopyAction text={clone} variant="pill" label="Copy" status={s} />],
                  ["Accent pill", (s: CopyStatus) => <CopyAction text={inviteUrl} variant="accent" label="Copy invite" status={s} />],
                  ["Install field", (s: CopyStatus) => <InstallCommand command={INSTALL} status={s} />],
                ] as const
              ).map(([name, render]) => (
                <tr key={name}>
                  <th scope="row" className="border-t border-hair-soft py-3 pr-4 align-middle text-[12.5px] font-normal text-ink-dim">
                    {name}
                  </th>
                  {(["idle", "copied", "error"] as CopyStatus[]).map((s) => (
                    <td key={s} className="border-t border-hair-soft py-3 pr-4 align-middle">
                      {render(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DemoSection>

      <DemoSection title="Error · clipboard blocked (simulated)" cols={2}>
        <Specimen label="Click to see the error path" layout="block">
          <BlockedSample text={space.id} />
        </Specimen>
        <Specimen label="Install command, blocked" layout="block">
          <InstallCommand command={INSTALL} copier={blockedClipboard} />
          <p className="mt-3 text-[12px] text-ink-faint">The chip turns red and reads Not copied for 3 s; the live region says {COPY_ERROR_MESSAGE}</p>
        </Specimen>
      </DemoSection>
    </DemoStack>
  );
}

function BlockedSample({ text }: { text: string }) {
  const [failed, setFailed] = useState(0);
  return (
    <Stage className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <CopyId label="Space ID" value={text} copier={blockedClipboard} onResult={(ok) => !ok && setFailed((n) => n + 1)} />
        <CopyAction text={text} variant="labelled" label="Copy space ID" copier={blockedClipboard} onResult={(ok) => !ok && setFailed((n) => n + 1)} />
      </div>
      <p className="min-h-[20px] text-[12.5px]" aria-hidden="true">
        {failed ? <span className="text-[#ff7a70]">{COPY_ERROR_MESSAGE}</span> : <span className="text-ink-faint">Nothing copied yet.</span>}
      </p>
    </Stage>
  );
}
