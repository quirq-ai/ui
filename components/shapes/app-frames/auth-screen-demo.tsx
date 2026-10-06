"use client";

import { useRef, useState } from "react";
import { CURRENT_SPACE, CURRENT_USER, ORGANIZATIONS } from "@/lib/fixtures";
import { Button, Segmented } from "@/components/ui";
import { DemoSection, DemoStack, Hint, Specimen } from "./_kit";
import { AuthCard, AuthScreen, ThemeToggleMenu, type AuthCardProps, type AuthMode, type AuthStatus, type ThemeChoice } from "./auth-screen";

const ORG = ORGANIZATIONS.find((o) => o.kind === "Org spaces")?.name ?? "Acme Robotics";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const noop = () => {};

function LiveAuth() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<AuthCardProps["error"]>(null);
  const [choice, setChoice] = useState<ThemeChoice>("dark");
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* System resolves to dark here: the catalog is a dark page and render must stay deterministic. */
  const theme = choice === "light" ? "light" : "dark";

  function after(ms: number, fn: () => void) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  }

  function replay(next: AuthMode = mode) {
    if (timer.current) clearTimeout(timer.current);
    setMode(next);
    setStatus("idle");
    setError(null);
    setNote(null);
  }

  function signIn() {
    setError(null);
    setStatus("submitting");
    after(900, () => setStatus("redirecting"));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented<AuthMode>
          aria-label="Screen"
          size="sm"
          value={mode}
          onChange={(m) => replay(m)}
          options={[
            { value: "sign-in", label: "Sign in" },
            { value: "sign-up", label: "Sign up" },
            { value: "join-pending", label: "Org join pending" },
          ]}
        />
        <Button variant="subtle" size="sm" onClick={() => replay()} disabled={status === "idle" && !note}>
          Replay
        </Button>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint" aria-live="polite">
          State · {status}
        </span>
      </div>
      <AuthScreen
        theme={theme}
        className="min-h-[560px]"
        themeToggle={<ThemeToggleMenu value={choice} onChange={setChoice} light={theme === "light"} />}
      >
        <AuthCard
          mode={mode}
          status={status}
          theme={theme}
          email={email}
          error={error}
          destination={CURRENT_SPACE.name}
          orgName={ORG}
          onEmailChange={(v) => {
            setEmail(v);
            if (status === "error") setStatus("idle");
          }}
          onSubmitEmail={() => {
            if (!EMAIL_RE.test(email.trim())) {
              setError({ on: "email", message: "Enter an email address like ada@example.com." });
              setStatus("error");
              return;
            }
            signIn();
          }}
          onProvider={() => {
            /* the provider account signs in, whatever was typed */
            setEmail(CURRENT_USER.email);
            signIn();
          }}
          onSwitchMode={(m) => replay(m)}
          onCancelRequest={() => {
            setStatus("submitting");
            after(800, () => {
              setStatus("idle");
              setNote(`Request to join ${ORG} cancelled.`);
            });
          }}
        />
      </AuthScreen>
      <Hint>
        Continue with GitHub runs submitting then redirecting. Type an email and press Enter: an invalid one shows the field error. The
        top-right toggle switches the screen to light.
      </Hint>
      {note ? (
        <p role="status" className="text-[12px] text-ink-dim">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function StaticCard(props: Partial<AuthCardProps> & { mode: AuthMode; status: AuthStatus }) {
  return (
    <AuthCard
      email=""
      onEmailChange={noop}
      onSubmitEmail={noop}
      onProvider={noop}
      onSwitchMode={noop}
      onCancelRequest={noop}
      destination={CURRENT_SPACE.name}
      orgName={ORG}
      {...props}
    />
  );
}

export function AuthScreenDemo() {
  const [lightChoice, setLightChoice] = useState<ThemeChoice>("light");
  return (
    <DemoStack>
      <DemoSection title="Sign in · live">
        <LiveAuth />
      </DemoSection>
      <DemoSection title="Variants and states">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Specimen label="Sign in · submitting">
            <AuthScreen className="h-full py-8">
              <StaticCard mode="sign-in" status="submitting" email={CURRENT_USER.email} />
            </AuthScreen>
          </Specimen>
          <Specimen label="Sign in · error" note="provider did not finish">
            <AuthScreen className="h-full py-8">
              <StaticCard mode="sign-in" status="error" error={{ on: "provider", message: "GitHub sign-in did not finish. Try again." }} />
            </AuthScreen>
          </Specimen>
          <Specimen label="Redirecting">
            <AuthScreen className="h-full py-8">
              <StaticCard mode="sign-in" status="redirecting" email={CURRENT_USER.email} />
            </AuthScreen>
          </Specimen>
          <Specimen label="Sign up · idle">
            <AuthScreen className="h-full py-8">
              <StaticCard mode="sign-up" status="idle" />
            </AuthScreen>
          </Specimen>
          <Specimen label="Org join pending">
            <AuthScreen className="h-full py-8" footnote={null}>
              <StaticCard mode="join-pending" status="idle" />
            </AuthScreen>
          </Specimen>
          <Specimen label="Light theme · idle">
            <AuthScreen
              theme={lightChoice === "light" ? "light" : "dark"}
              className="h-full py-8"
              themeToggle={<ThemeToggleMenu value={lightChoice} onChange={setLightChoice} light={lightChoice === "light"} />}
            >
              <StaticCard mode="sign-in" status="idle" theme={lightChoice === "light" ? "light" : "dark"} />
            </AuthScreen>
          </Specimen>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
