"use client";

// Copy: CopyButton (icon, labelled or mono pill; copies with navigator.clipboard and falls
// back to a hidden textarea; shows "Copied" for 1.6 s; announces the result in a polite live
// region) and CopyField (a mono value such as an install command or space ID with a copy
// chip; the value scrolls sideways and never wraps).
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type CopyState = "idle" | "copied" | "error";

const RESET_MS = 1600;

/** Writes text to the clipboard. Resolves false when every method fails. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the textarea path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function useCopy(text: string, onCopied?: () => void) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = useCallback(async () => {
    const ok = await copyText(text);
    setState(ok ? "copied" : "error");
    if (ok) onCopied?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), ok ? RESET_MS : RESET_MS * 2);
  }, [text, onCopied]);
  return { state, copy };
}

export type CopyButtonProps = {
  /** The exact text to place on the clipboard. */
  text: string;
  /** icon: square icon button; labelled: icon plus word; pill: mono uppercase COPY chip. */
  variant?: "icon" | "labelled" | "pill";
  size?: "sm" | "md";
  /** Visible word for labelled and pill variants. */
  label?: string;
  copiedLabel?: string;
  /** What is being copied, for the accessible name: "Copy space ID". */
  "aria-label"?: string;
  /** Message announced on success, such as "Space ID copied". */
  announce?: string;
  onCopied?: () => void;
  className?: string;
};

/** One-click copy with a visible and announced result. */
export function CopyButton({
  text,
  variant = "icon",
  size = "md",
  label = "Copy",
  copiedLabel = "Copied",
  "aria-label": ariaLabel,
  announce,
  onCopied,
  className,
}: CopyButtonProps) {
  const { state, copy } = useCopy(text, onCopied);
  const icon = state === "copied" ? <Check aria-hidden="true" /> : state === "error" ? <TriangleAlert aria-hidden="true" /> : <Copy aria-hidden="true" />;
  const word = state === "copied" ? copiedLabel : state === "error" ? "Could not copy" : label;
  const message = state === "copied" ? announce ?? copiedLabel : state === "error" ? "Could not copy. Select the text to copy it." : "";

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={variant === "icon" ? ariaLabel ?? label : ariaLabel}
        data-state={state}
        className={cn(
          "inline-flex shrink-0 items-center justify-center border transition-[background-color,border-color,color] duration-150",
          variant === "icon" && [
            "rounded-[8px]! border-transparent text-ink-dim hover:bg-s3 hover:text-ink",
            size === "sm" ? "size-7 [&_svg]:size-3.5" : "size-8 [&_svg]:size-4",
          ],
          variant === "labelled" && [
            "gap-1.5 rounded-[8px]! border-hair bg-s2 text-ink hover:border-hair-strong hover:bg-s3",
            size === "sm" ? "h-7 px-2.5 text-[12px] [&_svg]:size-3.5" : "h-8 px-3 text-[13px] [&_svg]:size-4",
          ],
          variant === "pill" && [
            "gap-1.5 rounded-full! border-hair bg-white/[0.04] font-mono font-medium uppercase tracking-[0.08em] text-ink-dim hover:border-hair-strong hover:text-ink",
            size === "sm" ? "h-[22px] px-2 text-[9.5px] [&_svg]:size-3" : "h-6 px-2.5 text-[10.5px] [&_svg]:size-3",
          ],
          state === "copied" && "text-grn! hover:text-grn!",
          state === "error" && "text-red! hover:text-red!",
          className,
        )}
      >
        {variant === "pill" && state === "idle" ? null : icon}
        {variant === "icon" ? null : <span>{word}</span>}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {message}
      </span>
    </>
  );
}

export type CopyFieldProps = {
  /** The value to show and copy. */
  value: string;
  /** Prefix shown but not copied, such as "$" for shell commands. */
  prompt?: ReactNode;
  /** Accessible name for the value, such as "Install command". */
  label: string;
  /** field: radius 10 inline field; pill: full outline pill (landing install). */
  shape?: "field" | "pill";
  announce?: string;
  className?: string;
};

/** Mono value with a copy chip: "$ curl -fsSL quirq.ai/install | sh  [COPY]". */
export function CopyField({ value, prompt, label, shape = "field", announce, className }: CopyFieldProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex w-full min-w-0 max-w-full items-center gap-2 border border-white/15 bg-white/[0.04] py-1.5 pl-3.5 pr-1.5",
        shape === "pill" ? "rounded-full" : "rounded-[10px]",
        className,
      )}
    >
      {/* focusable so keyboard users can scroll a long command sideways */}
      <code
        className="scroll-thin min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1 font-mono text-[12.5px] text-ink"
        tabIndex={0}
      >
        {prompt ? <span aria-hidden="true" className="mr-2 select-none text-ink-faint">{prompt}</span> : null}
        {value}
      </code>
      <CopyButton text={value} variant="pill" aria-label={`Copy ${label.toLowerCase()}`} announce={announce ?? `${label} copied`} />
    </div>
  );
}
