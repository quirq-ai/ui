"use client";

// Copy actions: one click puts a value on the clipboard and shows the result where the click
// happened (Copied for 1.5 s, or Could not copy), then announces it in a polite live region.
// CopyAction is the button (icon, labelled, mono pill, accent pill). InstallCommand is the
// landing install command (full width pill, inline field with a Copy chip, static display).
// CopyId is a labelled mono value such as a space ID. DeviceCode is the sign-in code card.
// CopyToast is the optional toast for surfaces that confirm with one.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyText } from "@/components/ui/copy-button";
import { Tooltip } from "@/components/ui/tooltip";

export type CopyStatus = "idle" | "copied" | "error";
/** Writes text somewhere and resolves true on success. Defaults to the clipboard. */
export type Copier = (text: string) => Promise<boolean>;

export const COPY_RESET_MS = 1500;
export const COPY_ERROR_MESSAGE = "Could not copy. Select the text to copy it.";

export type UseCopyActionOptions = {
  resetMs?: number;
  copier?: Copier;
  onResult?: (ok: boolean) => void;
};

/** Copy state machine: idle, copied for resetMs, error for twice that, then idle. */
export function useCopyAction(text: string, { resetMs = COPY_RESET_MS, copier = copyText, onResult }: UseCopyActionOptions = {}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const copy = useCallback(async () => {
    const ok = await copier(text);
    setStatus(ok ? "copied" : "error");
    onResult?.(ok);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), ok ? resetMs : resetMs * 2);
    return ok;
  }, [copier, text, onResult, resetMs]);
  return { status, copy };
}

function StatusGlyph({ status }: { status: CopyStatus }) {
  if (status === "copied") return <Check aria-hidden="true" />;
  if (status === "error") return <TriangleAlert aria-hidden="true" />;
  return <Copy aria-hidden="true" />;
}

/** Polite live region that says what happened. Silent for previews. */
function Announce({ message }: { message: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {message}
    </span>
  );
}

/* ----------------------------------------------------------------------------- CopyAction */

export type CopyActionVariant = "icon" | "labelled" | "pill" | "accent";

export type CopyActionProps = {
  /** The exact text placed on the clipboard. */
  text: string;
  /** icon: square glyph button; labelled: glyph plus word; pill: mono uppercase chip; accent: pill in ink. */
  variant?: CopyActionVariant;
  size?: "sm" | "md";
  /** Visible word: "Copy", "Copy invite", "Clone by hand". */
  label?: string;
  copiedLabel?: string;
  errorLabel?: string;
  /** Accessible name: "Copy space ID". Defaults to the label. */
  "aria-label"?: string;
  /** Announced on success: "Space ID copied". */
  announce?: string;
  /** Force a status for a static preview; disables the live region. */
  status?: CopyStatus;
  copier?: Copier;
  resetMs?: number;
  onResult?: (ok: boolean) => void;
  /** Icon variant only: show the label (or Copied) as a tooltip. */
  tip?: boolean;
  className?: string;
};

const pillBase =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full! border font-mono font-medium uppercase leading-none tracking-[0.08em] transition-[background-color,border-color,color] duration-150";

/* Frame and size per variant. Colors live in IDLE and RESULT so no two utilities compete. */
const FRAME: Record<CopyActionVariant, Record<"sm" | "md", string>> = {
  icon: {
    sm: "inline-flex shrink-0 items-center justify-center rounded-[7px]! border transition-[background-color,border-color,color] duration-150 size-[26px] [&_svg]:size-3.5",
    md: "inline-flex shrink-0 items-center justify-center rounded-[7px]! border transition-[background-color,border-color,color] duration-150 size-[30px] [&_svg]:size-[15px]",
  },
  labelled: {
    sm: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px]! border transition-[background-color,border-color,color] duration-150 h-7 px-2.5 text-[12px] [&_svg]:size-3.5",
    md: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px]! border transition-[background-color,border-color,color] duration-150 h-8 px-3 text-[13px] [&_svg]:size-4",
  },
  pill: {
    sm: `${pillBase} h-[22px] px-2 text-[9.5px] [&_svg]:size-3`,
    md: `${pillBase} h-6 px-2.5 text-[10.5px] [&_svg]:size-3`,
  },
  accent: {
    sm: `${pillBase} h-[22px] px-2 text-[9.5px] [&_svg]:size-3`,
    md: `${pillBase} h-6 px-2.5 text-[10.5px] [&_svg]:size-3`,
  },
};

const IDLE: Record<CopyActionVariant, string> = {
  icon: "border-transparent text-ink-faint hover:border-hair-soft hover:bg-s3 hover:text-ink",
  labelled: "border-hair bg-s2 text-ink hover:border-hair-strong hover:bg-s3",
  pill: "border-hair bg-white/[0.03] text-ink-dim hover:border-hair-strong hover:text-ink",
  accent: "border-ink/70 bg-white/[0.07] text-ink hover:border-ink hover:bg-white/[0.12]",
};

const RESULT: Record<Exclude<CopyStatus, "idle">, string> = {
  copied: "border-grn/40 bg-grn/10 text-grn",
  error: "border-red/45 bg-red/10 text-[#ff7a70]",
};

/** One-click copy with a visible and announced result. */
export function CopyAction({
  text,
  variant = "icon",
  size = "md",
  label = "Copy",
  copiedLabel = "Copied",
  errorLabel = "Could not copy",
  "aria-label": ariaLabel,
  announce,
  status: forced,
  copier,
  resetMs,
  onResult,
  tip = true,
  className,
}: CopyActionProps) {
  const { status: live, copy } = useCopyAction(text, { copier, resetMs, onResult });
  const status = forced ?? live;
  const word = status === "copied" ? copiedLabel : status === "error" ? errorLabel : label;
  const message = forced ? "" : live === "copied" ? announce ?? copiedLabel : live === "error" ? COPY_ERROR_MESSAGE : "";
  const name = ariaLabel ?? label;

  const cls = cn(FRAME[variant][size], status === "idle" ? IDLE[variant] : RESULT[status], className);

  const button = (
    <button type="button" onClick={() => void copy()} aria-label={variant === "icon" ? name : ariaLabel} data-status={status} className={cls}>
      {variant === "pill" || variant === "accent" ? (status === "idle" ? null : <StatusGlyph status={status} />) : <StatusGlyph status={status} />}
      {variant === "icon" ? null : <span>{word}</span>}
    </button>
  );

  return (
    <>
      {variant === "icon" && tip ? (
        <Tooltip content={status === "idle" ? name : word} describe={false}>
          {button}
        </Tooltip>
      ) : (
        button
      )}
      <Announce message={message} />
    </>
  );
}

/* ----------------------------------------------------------------------------- InstallCommand */

export type InstallCommandProps = {
  command: string;
  /** Shown before the command and never copied. */
  prompt?: string;
  /**
   * pill: full width outline pill, the text itself swaps to "copied" (home install card).
   * field: inline field, radius 10, the command scrolls sideways beside a Copy chip.
   * static: display pill for pricing, not interactive.
   */
  variant?: "pill" | "field" | "static";
  /** Names the value: "Install command". */
  label?: string;
  status?: CopyStatus;
  copier?: Copier;
  onResult?: (ok: boolean) => void;
  className?: string;
};

/** The install command with one-click copy: "$ curl -fsSL quirq.ai/install | sh  [COPY]". */
export function InstallCommand({ command, prompt = "$", variant = "field", label = "Install command", status: forced, copier, onResult, className }: InstallCommandProps) {
  const { status: live, copy } = useCopyAction(command, { copier, onResult });
  const status = forced ?? live;
  const message = forced ? "" : live === "copied" ? `${label} copied to clipboard` : live === "error" ? COPY_ERROR_MESSAGE : "";

  if (variant === "static") {
    return (
      <p
        className={cn(
          "inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-white/20 px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-dim",
          className,
        )}
      >
        <span aria-hidden="true" className="text-ink-faint">
          {prompt}
        </span>
        <span className="truncate normal-case tracking-normal">{command}</span>
      </p>
    );
  }

  if (variant === "pill") {
    return (
      <>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label={`Copy the ${label.toLowerCase()}: ${command}`}
          data-status={status}
          className={cn(
            "block w-full truncate rounded-full! border px-4 py-[15px] text-center font-mono text-[clamp(11.5px,3vw,15px)] font-bold leading-tight sm:px-5 transition-[background-color,border-color,color] duration-150",
            status === "copied" ? "border-grn/60 text-grn" : status === "error" ? "border-red/50 text-[#ff7a70]" : "border-[#d9d9d9] text-white hover:bg-white/5",
            className,
          )}
        >
          {status === "copied" ? "copied" : status === "error" ? "could not copy" : command}
        </button>
        <Announce message={message} />
      </>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-status={status}
      className={cn(
        "group/copy flex w-full min-w-0 max-w-full items-center gap-3 rounded-[10px] border bg-white/[0.04] py-2 pl-4 pr-2 transition-colors duration-150",
        status === "error" ? "border-red/45" : status === "copied" ? "border-grn/40" : "border-white/15 hover:border-white/30",
        className,
      )}
    >
      {/* focusable so keyboard users can scroll a long command sideways */}
      <code tabIndex={0} className="scroll-thin min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1 font-mono text-[clamp(12px,1.3vw,13.5px)] text-ink">
        <span aria-hidden="true" className="mr-2 select-none text-ink-faint">
          {prompt}
        </span>
        {command}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={`Copy ${label.toLowerCase()}`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-[6px]! px-3.5 py-2 font-mono text-[10px] uppercase leading-none tracking-[0.16em] transition-colors duration-150 [&_svg]:size-3",
          status === "copied" ? "bg-grn/12 text-grn" : status === "error" ? "bg-red/12 text-[#ff7a70]" : "bg-white/[0.07] text-ink-dim group-hover/copy:text-ink",
        )}
      >
        {status === "idle" ? null : <StatusGlyph status={status} />}
        {status === "copied" ? "Copied" : status === "error" ? "Not copied" : "Copy"}
      </button>
      <Announce message={message} />
    </div>
  );
}

/* ----------------------------------------------------------------------------- CopyId */

export type CopyIdProps = {
  /** "Space ID" */
  label: string;
  value: string;
  /** Announced and passed on: "Space ID copied". */
  announce?: string;
  status?: CopyStatus;
  copier?: Copier;
  onResult?: (ok: boolean) => void;
  /** inline: label, value and icon in a row; chip: value in a bordered chip. */
  layout?: "inline" | "chip";
  className?: string;
};

/** A labelled mono identifier with an icon copy button. */
export function CopyId({ label, value, announce, status, copier, onResult, layout = "chip", className }: CopyIdProps) {
  return (
    <div className={cn("inline-flex max-w-full min-w-0 items-center gap-2", className)}>
      <span className="shrink-0 text-[12px] text-ink-faint">{label}</span>
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-0.5",
          layout === "chip" && "rounded-[8px] border border-hair bg-s1 py-0.5 pl-2.5 pr-0.5",
        )}
      >
        <code className="truncate font-mono text-[12.5px] text-ink">{value}</code>
        <CopyAction
          text={value}
          size="sm"
          aria-label={`Copy ${label.charAt(0).toLowerCase()}${label.slice(1)}`}
          announce={announce ?? `${label} copied`}
          status={status}
          copier={copier}
          onResult={onResult}
        />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------- DeviceCode */

export type DeviceCodeProps = {
  code: string;
  verifyUrl: string;
  expiresIn: string;
  account?: string;
  status?: CopyStatus;
  copier?: Copier;
  onResult?: (ok: boolean) => void;
  className?: string;
};

/** Device sign-in: a large code to type on the other device, with copy. */
export function DeviceCode({ code, verifyUrl, expiresIn, account, status, copier, onResult, className }: DeviceCodeProps) {
  return (
    <div className={cn("min-w-0 rounded-[14px] border border-hair-soft bg-s1 p-4", className)}>
      <p className="text-[13px] text-ink-dim">Enter this code on the device page</p>
      <p className="mt-0.5 break-words font-mono text-[12px] text-ink">{verifyUrl}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <code className="rounded-[10px] border border-hair bg-black/40 px-4 py-2.5 font-mono text-[clamp(20px,3vw,26px)] font-medium tracking-[0.18em] text-ink">
          {code}
        </code>
        <CopyAction text={code} variant="labelled" label="Copy code" announce="Device code copied" status={status} copier={copier} onResult={onResult} />
      </div>
      <p className="mt-3 text-[12px] text-ink-faint">
        Expires in {expiresIn}
        {account ? (
          <>
            {" "}
            · signs in as <span className="text-ink-dim">{account}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- CopyToast */

export type CopyToastProps = {
  message: ReactNode;
  tone?: "ok" | "error";
  onDismiss?: () => void;
  className?: string;
};

/** Small confirmation toast: "Space ID copied to clipboard". Position it from the parent. */
export function CopyToast({ message, tone = "ok", onDismiss, className }: CopyToastProps) {
  return (
    <div
      className={cn(
        "rise pointer-events-auto flex max-w-full items-center gap-2.5 rounded-[10px] border bg-s3 py-2 pl-3 pr-1.5 text-[12.5px] text-ink shadow-[0_12px_32px_rgba(0,0,0,0.5)]",
        tone === "ok" ? "border-hair-strong" : "border-red/40",
        className,
      )}
    >
      {tone === "ok" ? <Check aria-hidden="true" className="size-4 shrink-0 text-grn" /> : <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-[#ff7a70]" />}
      <span className="min-w-0 truncate">{message}</span>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="ml-1 grid size-6 shrink-0 place-items-center rounded-[6px]! text-ink-faint hover:bg-s4 hover:text-ink">
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
