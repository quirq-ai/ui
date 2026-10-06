// Terminal output: TerminalFrame (hairline window with a mono title), TerminalTranscript
// ($ prompt, ✓ ok, → next, ✗ failed lines with emphasized spans) and GatewayLog (galileo CLI
// lines with a colored [prefix], an error line and its exit code). Server-safe. The pre is
// focusable because it scrolls sideways on narrow screens.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- TerminalFrame */

export type TerminalFrameProps = {
  title: string;
  /** Right side of the title bar: copy, follow, status. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Window chrome for terminal output: three quiet dots, a mono title, actions. */
export function TerminalFrame({ title, actions, children, className }: TerminalFrameProps) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-[12px] border border-hair bg-black/70", className)}>
      <div className="flex min-h-9 items-center gap-3 border-b border-hair-soft bg-white/[0.02] px-3.5 py-1">
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <i className="size-2 rounded-full bg-white/[0.14]" />
          <i className="size-2 rounded-full bg-white/[0.1]" />
          <i className="size-2 rounded-full bg-white/[0.07]" />
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-faint">{title}</span>
        {actions ? <span className="flex shrink-0 items-center gap-1.5">{actions}</span> : null}
      </div>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------- TerminalTranscript */

export type TranscriptKind = "prompt" | "ok" | "next" | "fail" | "plain" | "dim";

export type TranscriptLine = {
  kind: TranscriptKind;
  text: string;
  /** Substrings shown in full ink: commands, amounts, names. */
  strong?: string[];
};

const GLYPH: Record<TranscriptKind, { glyph: string; cls: string } | null> = {
  prompt: { glyph: "$", cls: "text-ink-faint" },
  ok: { glyph: "✓", cls: "text-grn" },
  next: { glyph: "→", cls: "text-blu" },
  fail: { glyph: "✗", cls: "text-red" },
  plain: null,
  dim: null,
};

function emphasize(text: string, strong: string[] | undefined): ReactNode {
  if (!strong || strong.length === 0) return text;
  const escaped = strong.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return parts.map((p, i) =>
    strong.includes(p) ? (
      <span key={i} className="text-ink">
        {p}
      </span>
    ) : (
      p
    ),
  );
}

export type TerminalTranscriptProps = {
  lines: TranscriptLine[];
  /** Accessible name for the output, such as "xo status output". */
  label: string;
  /** Blinking caret after the last line (waiting for input or still typing). */
  caret?: boolean;
  className?: string;
};

/** Static CLI transcript. Each line keeps its own row so whitespace survives. */
export function TerminalTranscript({ lines, label, caret = false, className }: TerminalTranscriptProps) {
  return (
    <pre
      tabIndex={0}
      role="group"
      aria-label={label}
      className={cn("scroll-thin overflow-x-auto whitespace-pre px-5 py-4 font-mono text-[12.5px] leading-[2] text-ink-dim", className)}
    >
      {lines.map((l, i) => {
        const g = GLYPH[l.kind];
        const last = i === lines.length - 1;
        return (
          <span key={i} className={cn("block", l.kind === "dim" && "text-ink-faint", caret && last && "caret")}>
            {g ? <span className={g.cls}>{g.glyph} </span> : null}
            <span className={l.kind === "prompt" ? "text-ink" : undefined}>{emphasize(l.text, l.strong)}</span>
          </span>
        );
      })}
    </pre>
  );
}

/* ----------------------------------------------------------------------------- GatewayLog */

export type GatewayLine = {
  /** "galileo", "sample-app" */
  prefix: string;
  text: string;
  level?: "info" | "error";
};

export type GatewayLogProps = {
  lines: GatewayLine[];
  /** Exit code shown after an error, such as 1. */
  exitCode?: number;
  label: string;
  className?: string;
};

const PREFIX_TONE: Record<string, string> = {
  galileo: "text-grn",
  "sample-app": "text-cyn",
};

/** galileo CLI output: colored [prefix], URLs in full ink, errors in red with the exit code. */
export function GatewayLog({ lines, exitCode, label, className }: GatewayLogProps) {
  return (
    <pre
      tabIndex={0}
      role="group"
      aria-label={label}
      className={cn("scroll-thin overflow-x-auto whitespace-pre px-5 py-4 font-mono text-[12px] leading-[1.95] text-ink-dim", className)}
    >
      {lines.map((l, i) => (
        <span key={i} className={cn("block", l.level === "error" && "text-[#ff7a70]")}>
          <span className={PREFIX_TONE[l.prefix] ?? "text-ink-faint"}>[{l.prefix}]</span>{" "}
          {l.text.split(/(https?:\/\/\S+)/g).map((part, k) =>
            /^https?:\/\//.test(part) ? (
              <span key={k} className={l.level === "error" ? undefined : "text-ink"}>
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
      ))}
      {exitCode !== undefined ? (
        <span className="mt-1 block text-ink-faint">
          process exited with code <span className={exitCode === 0 ? "text-grn" : "text-red"}>{exitCode}</span>
        </span>
      ) : null}
    </pre>
  );
}
