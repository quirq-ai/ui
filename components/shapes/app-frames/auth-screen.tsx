"use client";

// Sign-in screen: the account step before a hosted space loads. Black ground with grain, the
// XO mark, a centered card (title, provider button, email field) and a theme toggle top right,
// with the footnote that local Space use needs no account. Variants: sign in, sign up and the
// org join request that is pending. States: idle, submitting, error, redirecting.
import { useId, type FormEvent, type ReactNode } from "react";
import { Clock, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { RuntimeLogo, Spinner, StateChip, XOMark } from "@/components/ui";
import { GRAIN_STYLE } from "./_kit";
import { Menu } from "./menu";

export type AuthMode = "sign-in" | "sign-up" | "join-pending";
export type AuthStatus = "idle" | "submitting" | "error" | "redirecting";
export type AuthTheme = "dark" | "light";
export type ThemeChoice = "light" | "dark" | "system";

/* ----------------------------------------------------------------------------- theme toggle */

/** Icon button that opens Light, Dark and System. */
export function ThemeToggleMenu({ value, onChange, light = false }: { value: ThemeChoice; onChange: (v: ThemeChoice) => void; light?: boolean }) {
  return (
    <Menu
      label="Theme"
      align="end"
      light={light}
      triggerAriaLabel="Toggle theme"
      triggerClassName={cn(
        "relative grid size-9 place-items-center rounded-[10px]! border transition-colors",
        light ? "border-black/10 bg-white text-[#141414] hover:bg-black/[0.04]" : "border-hair bg-s1 text-ink hover:bg-s2",
      )}
      menuClassName="min-w-[150px]"
      trigger={
        <>
          <Sun aria-hidden="true" className={cn("size-[18px] transition-all duration-300", light ? "rotate-0 scale-100" : "-rotate-90 scale-0")} />
          <Moon aria-hidden="true" className={cn("absolute size-[18px] transition-all duration-300", light ? "rotate-90 scale-0" : "rotate-0 scale-100")} />
        </>
      }
      entries={[
        { id: "light", label: "Light", icon: <Sun />, checked: value === "light", onSelect: () => onChange("light") },
        { id: "dark", label: "Dark", icon: <Moon />, checked: value === "dark", onSelect: () => onChange("dark") },
        { id: "system", label: "System", icon: <Monitor />, checked: value === "system", onSelect: () => onChange("system") },
      ]}
    />
  );
}

/* ----------------------------------------------------------------------------- card */

export type AuthCardProps = {
  mode: AuthMode;
  status: AuthStatus;
  theme?: AuthTheme;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmitEmail: () => void;
  onProvider: (provider: "github") => void;
  onSwitchMode?: (mode: "sign-in" | "sign-up") => void;
  /** An email error shows under the field; a provider error shows above the providers. */
  error?: { on: "provider" | "email"; message: string } | null;
  /** Where the redirect goes: "research-lab". */
  destination?: string;
  /** For join-pending. */
  orgName?: string;
  onCancelRequest?: () => void;
};

/** The centered card. Provider first, then email; Enter submits. */
export function AuthCard({
  mode,
  status,
  theme = "dark",
  email,
  onEmailChange,
  onSubmitEmail,
  onProvider,
  onSwitchMode,
  error,
  destination = "your space",
  orgName = "Acme Robotics",
  onCancelRequest,
}: AuthCardProps) {
  const emailId = useId();
  const errId = useId();
  const light = theme === "light";
  const busy = status === "submitting";
  const card = cn(
    "w-full max-w-[380px] rounded-[16px] border p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]",
    light ? "border-black/10 bg-white text-[#141414]" : "border-hair bg-[#0f0f11] text-ink",
  );
  const dim = light ? "text-black/60" : "text-ink-dim";
  const faint = light ? "text-black/55" : "text-ink-faint";
  const secondaryBtn = cn(
    "inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-[10px]! border text-[13.5px] font-medium transition-colors disabled:opacity-60",
    light ? "border-black/12 bg-white text-[#141414] hover:bg-black/[0.03]" : "border-hair bg-s2 text-ink hover:border-hair-strong hover:bg-s3",
  );
  const primaryBtn = cn(
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full! text-[13.5px] font-semibold transition-colors disabled:opacity-70",
    light ? "bg-[#141414] text-white hover:bg-black" : "bg-ink text-black hover:bg-[#e8e8e6]",
  );

  if (mode === "join-pending") {
    return (
      <section aria-labelledby={`${emailId}-t`} className={card}>
        <div className="flex items-center gap-3">
          <span className={cn("grid size-8 place-items-center rounded-[8px]", light ? "bg-black/[0.05]" : "bg-s3")}>
            <Clock aria-hidden="true" className="size-4" />
          </span>
          <h2 id={`${emailId}-t`} className="flex-1 text-[16px] font-semibold tracking-[-0.01em]">
            Request pending
          </h2>
        </div>
        <p className={cn("mt-3 text-[13px] leading-relaxed", dim)}>
          You asked to join <strong className={light ? "text-[#141414]" : "text-ink"}>{orgName}</strong>. You&apos;ll get access once an owner approves it.
        </p>
        <div className="mt-3">
          <StateChip kind="membership" state="request_pending" />
        </div>
        <button type="button" onClick={onCancelRequest} disabled={busy} className={cn(secondaryBtn, "mt-5")}>
          {busy ? <Spinner size="sm" label={null} /> : null}
          {busy ? "Cancelling…" : "Cancel request"}
        </button>
      </section>
    );
  }

  if (status === "redirecting") {
    return (
      <section aria-live="polite" className={cn(card, "flex flex-col items-center py-10 text-center")}>
        <Spinner size="lg" label={null} />
        <h2 className="mt-4 text-[16px] font-semibold">Opening {destination}…</h2>
        <p className={cn("mt-1 text-[12.5px]", dim)}>Signed in as {email || "ada@example.com"}. Taking you to the space.</p>
      </section>
    );
  }

  const signUp = mode === "sign-up";
  const providerError = status === "error" && error?.on === "provider" ? error.message : null;
  const emailError = status === "error" && error?.on === "email" ? error.message : null;

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmitEmail();
  }

  return (
    <section aria-labelledby={`${emailId}-t`} className={card}>
      <h2 id={`${emailId}-t`} className="text-[20px] font-semibold tracking-[-0.02em]">
        {signUp ? "Create your XO account" : "Sign in to XO"}
      </h2>
      <p className={cn("mt-1 text-[13px]", dim)}>{signUp ? "Hosted spaces and sharing need an account." : "Welcome back. Pick how to sign in."}</p>

      {providerError ? (
        <p
          role="alert"
          className={cn("mt-4 rounded-[10px] border border-red/40 bg-red/[0.08] px-3 py-2 text-[12.5px]", light ? "text-[#b3241b]" : "text-[#ff7a70]")}
        >
          {providerError}
        </p>
      ) : null}

      <button type="button" onClick={() => onProvider("github")} disabled={busy} className={cn(secondaryBtn, "mt-5")}>
        <span className={cn("inline-flex", light && "invert")}>
          <RuntimeLogo id="github" size={16} decorative />
        </span>
        Continue with GitHub
      </button>

      <div className={cn("my-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]", faint)}>
        <span className={cn("h-px flex-1", light ? "bg-black/10" : "bg-hair")} />
        or
        <span className={cn("h-px flex-1", light ? "bg-black/10" : "bg-hair")} />
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={emailId} className={cn("text-[12.5px] font-medium", light ? "text-[#141414]" : "text-ink")}>
            Email
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="ada@example.com"
            value={email}
            disabled={busy}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? errId : undefined}
            onChange={(e) => onEmailChange(e.target.value)}
            className={cn(
              "h-10 w-full rounded-[10px]! border px-3 text-[13.5px] outline-none transition-colors disabled:opacity-60",
              light
                ? "border-black/15 bg-white text-[#141414] placeholder:text-black/35 focus:border-black/40"
                : "border-hair bg-s1 text-ink placeholder:text-ink-faint focus:border-white/30",
              emailError && "border-red/60!",
            )}
          />
          {emailError ? (
            <p id={errId} role="alert" className={cn("text-[12px]", light ? "text-[#c4271d]" : "text-[#ff7a70]")}>
              {emailError}
            </p>
          ) : null}
        </div>
        <button type="submit" disabled={busy} aria-busy={busy || undefined} className={primaryBtn}>
          {busy ? <Spinner size="sm" label={null} /> : null}
          {busy ? (signUp ? "Creating account…" : "Signing in…") : "Continue with email"}
        </button>
      </form>

      {onSwitchMode ? (
        <p className={cn("mt-4 text-center text-[12.5px]", dim)}>
          {signUp ? "Already have an account? " : "No account yet? "}
          <button
            type="button"
            onClick={() => onSwitchMode(signUp ? "sign-in" : "sign-up")}
            className={cn("rounded-[4px]! font-medium underline underline-offset-4", light ? "text-[#141414]" : "text-ink")}
          >
            {signUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      ) : null}
    </section>
  );
}

/* ----------------------------------------------------------------------------- screen */

export type AuthScreenProps = {
  theme?: AuthTheme;
  /** Top-right control, usually ThemeToggleMenu. */
  themeToggle?: ReactNode;
  children: ReactNode;
  footnote?: ReactNode;
  className?: string;
};

/** Ground, grain, XO mark lockup, the card and the footnote, centered. */
export function AuthScreen({
  theme = "dark",
  themeToggle,
  children,
  footnote = "Basic local use does not need an account.",
  className,
}: AuthScreenProps) {
  const light = theme === "light";
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col items-center justify-center gap-6 overflow-hidden rounded-[14px] border px-4 py-12",
        light ? "border-black/10 bg-[#f4f3f0] [color-scheme:light]" : "border-hair bg-black",
        className,
      )}
    >
      <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", light ? "opacity-[0.06]" : "opacity-[0.05]")} style={GRAIN_STYLE} />
      {themeToggle ? <div className="absolute right-4 top-4 z-10">{themeToggle}</div> : null}
      <div className={cn("relative flex items-center gap-2.5", light ? "text-[#141414]" : "text-ink")}>
        <span className={cn("grid place-items-center rounded-[10px] px-2.5 py-2", light ? "bg-[#141414]" : "")}>
          <XOMark height={18} title="XO" />
        </span>
      </div>
      <div className="relative flex w-full justify-center">{children}</div>
      {footnote ? <p className={cn("relative max-w-[380px] text-center text-[12px]", light ? "text-black/60" : "text-ink-faint")}>{footnote}</p> : null}
    </div>
  );
}
