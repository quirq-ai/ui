// Agent and person prose for chat: a tiny, deterministic inline renderer for `code` and
// **bold** (enough for transcript text, no markdown dependency) plus ChatProse, the agent's
// paragraph block with an optional streaming caret. Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* A token may run to the end of the text unclosed: while a turn streams, a half-typed
   `code or **bold renders formatted instead of flickering between raw and styled. */
const TOKEN = /(`[^`]+(?:`|$)|\*\*[^*]+(?:\*\*|$))/g;

/** Inline code and bold from plain text. Everything else renders as typed. */
export function renderInline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.length > 1 && part.startsWith("`")) {
      return (
        <code key={i} className="rounded-[4px] border border-hair-soft bg-s3 px-1 py-px font-mono text-[0.88em]">
          {part.slice(1, part.endsWith("`") ? -1 : undefined)}
        </code>
      );
    }
    if (part.length > 2 && part.startsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, part.length > 4 && part.endsWith("**") ? -2 : undefined)}
        </strong>
      );
    }
    return part;
  });
}

export type ChatProseProps = {
  /** Paragraphs are split on blank lines; single newlines are kept. */
  text: string;
  /** Draws the block caret after the last character while the turn is still arriving. */
  streaming?: boolean;
  /** Dimmed tone for reasoning and system prose. */
  tone?: "ink" | "dim";
  className?: string;
};

/** Agent prose on the left of a thread: 13.5px, 1.6 leading, capped at 76ch. */
export function ChatProse({ text, streaming = false, tone = "ink", className }: ChatProseProps) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-[76ch] flex-col gap-2 break-words text-[13.5px] leading-[1.6]",
        tone === "ink" ? "text-ink/90" : "text-ink-dim",
        className,
      )}
    >
      {paragraphs.map((p, i) => (
        <p key={i} className={cn("whitespace-pre-wrap", streaming && i === paragraphs.length - 1 && "caret")}>
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}
