// ConnectProviderBody: the "Connect GitHub" dialog body. Two sign-in methods in one
// dialog (token, device code) and every phase: idle, busy, awaiting a device approval,
// error and success. Controlled and hook-free; the caller owns the flow.
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, KeyRound, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { LoadingLine } from "@/components/ui/loaders";
import { Segmented } from "@/components/ui/segmented";
import { CopyButton } from "@/components/ui/copy-button";
import { ModalNotice } from "./modal-panel";

export type ConnectMethod = "token" | "device";

export type ConnectPhase =
  | { kind: "idle" }
  | { kind: "busy"; label?: string }
  | { kind: "awaiting"; code: string; url: string; urlLabel: string }
  | { kind: "error"; title: string; detail?: string }
  | { kind: "success"; account: string; detail?: string };

export type ConnectProviderBodyProps = {
  /** Display name: "GitHub". */
  provider: string;
  method: ConnectMethod;
  onMethodChange?: (method: ConnectMethod) => void;
  phase: ConnectPhase;
  token: string;
  onTokenChange?: (value: string) => void;
  tokenLabel?: string;
  tokenPlaceholder?: string;
  tokenHint?: ReactNode;
  /** Explains the device flow before it starts. */
  deviceIntro?: ReactNode;
  onSubmitToken?: () => void;
  onStartDevice?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
  /** Unique prefix for field ids. */
  idPrefix: string;
};

const actions = "mt-5 flex flex-wrap items-center justify-end gap-2";

/** Token or device-code sign-in for a provider, with busy, error and success states. */
export function ConnectProviderBody({
  provider,
  method,
  onMethodChange,
  phase,
  token,
  onTokenChange,
  tokenLabel = "Personal access token",
  tokenPlaceholder,
  tokenHint,
  deviceIntro,
  onSubmitToken,
  onStartDevice,
  onCancel,
  onDone,
  idPrefix,
}: ConnectProviderBodyProps) {
  const busy = phase.kind === "busy";

  if (phase.kind === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-3 text-center">
        <span className="grid size-11 place-items-center rounded-full border border-grn/35 bg-grn/10 text-grn">
          <CircleCheck aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-1 text-[15px] font-semibold text-ink">{provider} connected</p>
        <p className="text-[13px] text-ink-dim">
          Signed in as <span className="font-mono text-[12.5px] text-ink">{phase.account}</span>
        </p>
        {phase.detail ? <p className="max-w-[34ch] text-[12px] leading-relaxed text-ink-faint">{phase.detail}</p> : null}
        <div className={cn(actions, "w-full")}>
          <Button variant="primary" size="sm" onClick={onDone} data-autofocus>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Segmented<ConnectMethod>
        aria-label="Sign-in method"
        block
        size="sm"
        value={method}
        onChange={onMethodChange}
        options={[
          { value: "token", label: "Token", icon: <KeyRound />, disabled: busy && method !== "token" },
          { value: "device", label: "Device code", icon: <MonitorSmartphone />, disabled: busy && method !== "device" },
        ]}
      />

      {method === "token" ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (token.trim() && !busy) onSubmitToken?.();
          }}
        >
          <Field
            id={`${idPrefix}-token`}
            label={tokenLabel}
            labelStyle="plain"
            hint={tokenHint}
            error={phase.kind === "error" ? phase.title : undefined}
          >
            <Input
              type="password"
              mono
              autoComplete="new-password"
              spellCheck={false}
              placeholder={tokenPlaceholder}
              value={token}
              onChange={(e) => onTokenChange?.(e.target.value)}
              disabled={busy}
              data-autofocus
            />
          </Field>
          {phase.kind === "error" && phase.detail ? (
            <ModalNotice tone="error" icon={<CircleAlert />} className="mt-3">
              {phase.detail}
            </ModalNotice>
          ) : null}
          <div className={actions}>
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={busy}
              loadingLabel={phase.kind === "busy" ? phase.label ?? "Connecting…" : undefined}
              disabled={!token.trim()}
            >
              {phase.kind === "error" ? "Try again" : "Connect"}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          {phase.kind === "idle" ? (
            <p className="text-[13px] leading-relaxed text-ink-dim">{deviceIntro}</p>
          ) : phase.kind === "busy" ? (
            <LoadingLine className="py-2">{phase.label ?? `Asking ${provider} for a code…`}</LoadingLine>
          ) : phase.kind === "awaiting" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-2 rounded-[12px] border border-hair bg-white/[0.03] px-4 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Your code</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[22px] font-medium tracking-[0.2em] text-ink sm:text-[24px]">{phase.code}</code>
                  <CopyButton text={phase.code} size="sm" aria-label="Copy code" announce="Code copied" />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <LoadingLine>Waiting for approval</LoadingLine>
                <ButtonLink href={phase.url} external size="sm" variant="secondary">
                  {phase.urlLabel}
                </ButtonLink>
              </div>
            </div>
          ) : phase.kind === "error" ? (
            <ModalNotice tone="error" icon={<CircleAlert />} title={phase.title}>
              {phase.detail}
            </ModalNotice>
          ) : null}
          <div className={actions}>
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            {phase.kind === "idle" || phase.kind === "error" ? (
              <Button variant="primary" size="sm" onClick={onStartDevice}>
                {phase.kind === "error" ? "Try again" : "Start"}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
