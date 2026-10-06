// Glass alert sheet: the phone-native modal used for a secret or a connect flow. GlassAlert
// is the 300px glass card (radius 34, 17px title, value well, 48px pills); GlassButton and
// GlassWell are its parts; MagicPathAlert is the connect flow in every state. Hook-free.
import type { ReactNode } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";

const wide = { fontVariationSettings: '"wdth" 100' } as const;

export type GlassAlertProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
  titleAs?: "h2" | "h3";
  /** The value well or form. */
  children?: ReactNode;
  /** Stack of GlassButtons. */
  actions?: ReactNode;
  className?: string;
};

/** 300px glass card with a title, a well and a stack of pill buttons. */
export function GlassAlert({ title, subtitle, titleId, titleAs: Title = "h2", children, actions, className }: GlassAlertProps) {
  return (
    <div className={cn("relative flex w-[min(300px,100%)] min-w-0 flex-col p-[14px] text-ink", className)} style={wide}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[34px] bg-[rgba(30,30,32,0.8)] shadow-[0_0_0_0.5px_rgba(255,255,255,0.22),0_8px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[34px] shadow-[inset_0_40px_10px_-40px_rgba(255,255,255,0.18),inset_0_-40px_10px_-40px_rgba(255,255,255,0.06)]"
      />
      <div className="relative flex flex-col gap-1.5 px-2 pb-5 pt-2">
        <Title id={titleId} className="text-[17px] [overflow-wrap:anywhere] font-[590] leading-[22px] tracking-[-0.43px] text-ink">
          {title}
        </Title>
        {subtitle ? <p className="text-[15px] leading-[20px] tracking-[-0.23px] text-ink-dim">{subtitle}</p> : null}
      </div>
      {children ? <div className="relative pb-[18px]">{children}</div> : null}
      {actions ? <div className="relative flex flex-col gap-2">{actions}</div> : null}
    </div>
  );
}

export type GlassButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "destructive" | "plain";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  /** Marks the button that takes focus when the sheet opens. */
  autoFocusTarget?: boolean;
  /** Focus on mount. Only set after a user action, never on first paint. */
  autoFocus?: boolean;
};

/** 48px pill. Primary is blue with dark text; destructive is red text on the grey fill. */
export function GlassButton({ children, icon, variant = "secondary", onClick, disabled, loading, type = "button", autoFocusTarget, autoFocus }: GlassButtonProps) {
  return (
    <button
      type={type}
      autoFocus={autoFocus}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-autofocus={autoFocusTarget || undefined}
      className={cn(
        "relative inline-flex w-full items-center justify-center gap-2 rounded-full! font-[590] tracking-[-0.43px] transition-[background-color,opacity] duration-150 [&_svg]:size-4",
        "disabled:opacity-50",
        variant === "plain" ? "h-9 text-[15px] text-blu hover:text-[#6cb8ff]" : "h-12 px-4 text-[17px]",
        variant === "primary" && "bg-blu text-black hover:bg-[#55aeff]",
        variant === "secondary" && "bg-[rgba(120,120,128,0.16)] text-ink hover:bg-[rgba(120,120,128,0.26)]",
        variant === "destructive" && "bg-[rgba(120,120,128,0.16)] text-red hover:bg-[rgba(120,120,128,0.26)]",
      )}
      style={wide}
    >
      {loading ? <Spinner size="sm" label={null} /> : icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}

/** Rounded value well (radius 26) on the grey fill. */
export function GlassWell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-[52px] items-center gap-2 rounded-[26px] bg-[rgba(120,120,128,0.16)] px-4 py-2", className)} style={wide}>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------- MagicPath */

export type MagicPathState = "checking" | "not_installed" | "installing" | "sign_in" | "paste_code" | "connected" | "error";

export type MagicPathAlertProps = {
  state: MagicPathState;
  code: string;
  onCodeChange?: (code: string) => void;
  error?: string;
  onInstall?: () => void;
  onOpenSignIn?: () => void;
  onFinish?: () => void;
  onLogOut?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  onDone?: () => void;
  titleId?: string;
  titleAs?: "h2" | "h3";
  idPrefix: string;
};

/** Connect MagicPath: checking, install, sign in, paste code, connected and error. */
export function MagicPathAlert({
  state,
  code,
  onCodeChange,
  error = "The code was not accepted. Start sign-in again.",
  onInstall,
  onOpenSignIn,
  onFinish,
  onLogOut,
  onRetry,
  onCancel,
  onDone,
  titleId,
  titleAs,
  idPrefix,
}: MagicPathAlertProps) {
  const well = (() => {
    switch (state) {
      case "checking":
        return (
          <GlassWell>
            <Spinner size="sm" label={null} />
            <span className="text-[15px] text-ink-dim">Checking MagicPath…</span>
          </GlassWell>
        );
      case "not_installed":
        return (
          <GlassWell>
            <span className="text-[15px] leading-snug text-ink-dim">MagicPath is not installed in this space yet.</span>
          </GlassWell>
        );
      case "installing":
        return (
          <GlassWell>
            <Spinner size="sm" label={null} />
            <span className="text-[15px] text-ink-dim">Installing the MagicPath skill…</span>
          </GlassWell>
        );
      case "sign_in":
        return (
          <GlassWell>
            <span className="text-[15px] leading-snug text-ink-dim">Sign-in opens in a new tab. Come back with the code it shows.</span>
          </GlassWell>
        );
      case "paste_code":
        return (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-code`} className="sr-only">
              Paste your code
            </label>
            <input
              id={`${idPrefix}-code`}
              value={code}
              onChange={(e) => onCodeChange?.(e.target.value)}
              placeholder="Paste your code"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={`${idPrefix}-code-help`}
              className="h-[52px] w-full rounded-[26px]! border-0 bg-[rgba(120,120,128,0.16)] px-4 font-mono text-[15px] text-ink placeholder:text-ink-faint"
            />
            <p id={`${idPrefix}-code-help`} className="px-2 text-[13px] leading-snug text-ink-faint">
              Paste the code you received after approving. A full callback URL also works.
            </p>
            <GlassButton variant="plain" onClick={onOpenSignIn}>
              Re-open sign-in
            </GlassButton>
          </div>
        );
      case "connected":
        return (
          <GlassWell>
            <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-grn" />
            <span className="text-[15px] leading-snug text-ink">Connected as your MagicPath account.</span>
          </GlassWell>
        );
      case "error":
        return (
          <GlassWell>
            <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-red" />
            <span role="alert" className="text-[15px] leading-snug text-red">
              {error}
            </span>
          </GlassWell>
        );
    }
  })();

  const actions = (() => {
    switch (state) {
      case "checking":
        return <GlassButton onClick={onCancel}>Cancel</GlassButton>;
      case "not_installed":
      case "installing":
        return (
          <>
            <GlassButton variant="primary" onClick={onInstall} loading={state === "installing"} autoFocusTarget>
              {state === "installing" ? "Installing…" : "Install MagicPath"}
            </GlassButton>
            <GlassButton onClick={onCancel} disabled={state === "installing"}>
              Cancel
            </GlassButton>
          </>
        );
      case "sign_in":
        return (
          <>
            <GlassButton variant="primary" onClick={onOpenSignIn} autoFocusTarget>
              Open MagicPath
            </GlassButton>
            <GlassButton onClick={onCancel}>Cancel</GlassButton>
          </>
        );
      case "paste_code":
        return (
          <>
            <GlassButton variant="primary" onClick={onFinish} disabled={!code.trim()}>
              Finish
            </GlassButton>
            <GlassButton onClick={onCancel}>Cancel</GlassButton>
          </>
        );
      case "connected":
        return (
          <>
            <GlassButton variant="primary" onClick={onDone} autoFocusTarget>
              Done
            </GlassButton>
            <GlassButton variant="destructive" onClick={onLogOut}>
              Log out
            </GlassButton>
          </>
        );
      case "error":
        return (
          <>
            <GlassButton variant="primary" onClick={onRetry} autoFocusTarget>
              Retry
            </GlassButton>
            <GlassButton onClick={onCancel}>Cancel</GlassButton>
          </>
        );
    }
  })();

  return (
    <GlassAlert
      title="Connect MagicPath"
      subtitle="Design and export UI components with your MagicPath account."
      titleId={titleId}
      titleAs={titleAs}
      actions={actions}
    >
      {well}
    </GlassAlert>
  );
}
