"use client";

import { useCallback, useId, useState, type ReactNode } from "react";
import { ChevronRight, KeyRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { SECRETS, type Secret } from "@/lib/fixtures";
import { MagicPathAlert, type MagicPathState } from "./glass-alert";
import { GlassAlertLayer, SecretAlert, type SecretMode } from "./glass-alert-layer";
import { DemoSection, Example } from "./demo-kit";
import { useTimers } from "./demo-hooks";
import { FocusScope } from "./demo-reopen";

/** Obviously fake values for the demo; the fixtures only hold masked placeholders. */
const DEMO_VALUES: Record<string, string> = {
  ANTHROPIC_API_KEY: "sk-example-not-a-real-key-f3a9",
  OPENAI_API_KEY: "sk-example-not-a-real-key-7b2e",
  GITHUB_TOKEN: "ghp_example0000000000c41d",
  LINEAR_API_KEY: "lin_example_09fa",
  SLACK_BOT_TOKEN: "xoxb-example-5e10",
  DATABASE_URL: "postgres://billing@db.example.com:5432/billing",
  PAYMENTS_TEST_KEY: "sk_test_example_8c3d",
};

/* ----------------------------------------------------------------------------- phone */

function Phone({ children, overlay, toast, className }: { children: ReactNode; overlay?: ReactNode; toast?: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto h-[540px] w-full max-w-[330px] overflow-hidden rounded-[42px] border border-hair-strong bg-[#050506] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),inset_0_0_0_6px_#111113]",
        className,
      )}
    >
      <div aria-hidden="true" className="flex h-11 items-end justify-between px-7 pb-1 font-mono text-[11px] text-ink-dim">
        <span>09:30</span>
        <span className="h-5 w-20 rounded-full bg-black" />
        <span>5G</span>
      </div>
      <div className="relative h-[calc(100%-44px)] overflow-hidden">{children}</div>
      <p
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute left-1/2 top-12 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-hair-strong bg-s3/95 px-3 py-1.5 text-[12px] text-ink shadow-lg transition-opacity duration-200",
          toast ? "opacity-100" : "opacity-0",
        )}
      >
        {toast}
      </p>
      {overlay}
    </div>
  );
}

/** Secrets screen. Rows are buttons when onOpen is set; otherwise a quiet backdrop. */
function SecretsScreen({ secrets, onOpen }: { secrets: Secret[]; onOpen?: (s: Secret) => void }) {
  return (
    <div className="flex h-full flex-col px-4 pb-4" aria-hidden={onOpen ? undefined : true}>
      <p className="px-1 pt-2 text-[11px] text-ink-faint">research-lab</p>
      <p className="px-1 text-[26px] font-semibold tracking-[-0.03em] text-ink">Secrets</p>
      <ul className="scroll-thin mt-3 min-h-0 shrink divide-y divide-hair-soft overflow-y-auto rounded-[16px] bg-white/[0.05]">
        {secrets.map((s) => {
          const inner = (
            <>
              <KeyRound aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[12.5px] text-ink">{s.name}</span>
                <span className={cn("block text-[11px]", s.status === "Set" ? "text-ink-faint" : s.status === "Needs attention" ? "text-org" : "text-ink-faint")}>
                  {s.masked ?? "Not set"} · {s.status}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
            </>
          );
          return (
            <li key={s.name}>
              {onOpen ? (
                <button
                  type="button"
                  onClick={() => onOpen(s)}
                  disabled={!s.masked}
                  className="flex w-full items-center gap-3 rounded-none! px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-50"
                >
                  {inner}
                </button>
              ) : (
                <div className="flex items-center gap-3 px-3.5 py-2.5">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Static scene: phone, quiet secrets list, scrim (tap closes) and a sheet; reopen after closing. */
function Scene({ children }: { children: (close: () => void, notify: (m: string) => void) => ReactNode }) {
  const schedule = useTimers();
  const [open, setOpen] = useState(true);
  const [round, setRound] = useState(0);
  const [toast, setToast] = useState("");
  const notify = (m: string) => {
    setToast(m);
    schedule(() => setToast(""), 1800);
  };
  const close = () => setOpen(false);
  // Stable callback so the Reopen button takes focus once, when it appears.
  const focusSelf = useCallback((el: HTMLButtonElement | null) => el?.focus({ preventScroll: true }), []);
  return (
    <Phone
      toast={toast}
      overlay={
        <div className="absolute inset-0 z-20 flex items-center justify-center p-3">
          {open ? (
            <>
              <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-black/45" />
              <div key={round} className="relative flex w-full justify-center">
                <FocusScope>{children(close, notify)}</FocusScope>
              </div>
            </>
          ) : (
            <button
              type="button"
              ref={focusSelf}
              onClick={() => {
                setRound((r) => r + 1);
                setOpen(true);
              }}
              className="relative rounded-full! border border-hair-strong bg-s3 px-4 py-2 text-[13px] text-ink transition-colors hover:bg-s4"
            >
              Reopen sheet
            </button>
          )}
        </div>
      }
    >
      <SecretsScreen secrets={SECRETS.slice(0, 6)} />
    </Phone>
  );
}

/* ----------------------------------------------------------------------------- flows */

function LivePhone() {
  const schedule = useTimers();
  const titleId = useId();
  const [secrets, setSecrets] = useState<Secret[]>(SECRETS);
  const [open, setOpen] = useState<Secret | null>(null);
  const [toast, setToast] = useState("");
  const notify = (m: string) => {
    setToast(m);
    schedule(() => setToast(""), 1800);
  };
  return (
    <Phone
      toast={toast}
      overlay={
        <GlassAlertLayer open={open !== null} onClose={() => setOpen(null)} labelledBy={titleId}>
          {open ? (
            <SecretAlert
              key={open.name}
              name={open.name}
              value={DEMO_VALUES[open.name] ?? "example-value"}
              titleId={titleId}
              onClose={() => setOpen(null)}
              onNotice={notify}
              onDelete={() => {
                setSecrets((xs) => xs.filter((x) => x.name !== open.name));
                setOpen(null);
                notify(`Deleted ${open.name} (demo)`);
              }}
            />
          ) : null}
        </GlassAlertLayer>
      }
    >
      <SecretsScreen secrets={secrets} onOpen={setOpen} />
    </Phone>
  );
}

function MagicPathFlow({ initial, close }: { initial: MagicPathState; close: () => void }) {
  const idPrefix = useId();
  const schedule = useTimers();
  const [state, setState] = useState<MagicPathState>(initial);
  const [code, setCode] = useState(initial === "paste_code" ? "mp_7KQ2-example" : "");
  return (
    <MagicPathAlert
      idPrefix={idPrefix}
      titleAs="h3"
      state={state}
      code={code}
      onCodeChange={setCode}
      onCancel={close}
      onDone={close}
      onInstall={() => {
        setState("installing");
        schedule(() => setState("sign_in"), 1200);
      }}
      onOpenSignIn={() => setState("paste_code")}
      onFinish={() => setState(code.trim().length >= 6 ? "connected" : "error")}
      onLogOut={() => {
        setCode("");
        setState("sign_in");
      }}
      onRetry={() => {
        setState("checking");
        schedule(() => setState("sign_in"), 900);
      }}
    />
  );
}

const SECRET_STATES: { mode: SecretMode; name: string; caption: string }[] = [
  { mode: "masked", name: "OPENAI_API_KEY", caption: "State · masked" },
  { mode: "revealed", name: "DATABASE_URL", caption: "State · revealed" },
  { mode: "editing", name: "DATABASE_URL", caption: "State · editing" },
];

const MAGIC_STATES: { state: MagicPathState; caption: string }[] = [
  { state: "checking", caption: "MagicPath · checking" },
  { state: "not_installed", caption: "MagicPath · not installed" },
  { state: "sign_in", caption: "MagicPath · sign in" },
  { state: "paste_code", caption: "MagicPath · paste code" },
  { state: "connected", caption: "MagicPath · connected" },
  { state: "error", caption: "MagicPath · error" },
];

/* ----------------------------------------------------------------------------- demo */

export function GlassAlertDemo() {
  return (
    <div className="flex flex-col gap-10">
      <DemoSection title="Variant · secret detail">
        <div className="grid gap-6 sm:grid-cols-2">
          <Example caption="Live · tap a secret" note="Scrim or Esc closes">
            <LivePhone />
          </Example>
          {SECRET_STATES.map((s) => (
            <Example key={s.mode} caption={s.caption}>
              <Scene>
                {(close, notify) => (
                  <SecretAlert
                    titleAs="h3"
                    name={s.name}
                    value={DEMO_VALUES[s.name]}
                    initialMode={s.mode}
                    onClose={close}
                    onDelete={() => {
                      close();
                      notify(`Deleted ${s.name} (demo)`);
                    }}
                    onNotice={notify}
                  />
                )}
              </Scene>
            </Example>
          ))}
        </div>
      </DemoSection>
      <DemoSection title="Variant · MagicPath connect">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MAGIC_STATES.map((m) => (
            <Example key={m.state} caption={m.caption}>
              <Scene>{(close) => <MagicPathFlow initial={m.state} close={close} />}</Scene>
            </Example>
          ))}
        </div>
      </DemoSection>
    </div>
  );
}
