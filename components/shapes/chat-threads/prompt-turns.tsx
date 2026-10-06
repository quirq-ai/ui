// PromptTurnList: what the person typed, one exchange per turn, with a Turn badge, the time and
// how many replies and tool calls followed before the next prompt. Includes the notes the
// session view shows instead of a list: loading, unsupported runtime and no transcript.
// Server-safe.
import type { ReactNode } from "react";
import { FileQuestion, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { LoadingLine } from "@/components/ui/loaders";
import { plural } from "@/lib/format";

export type PromptTurn = {
  turn: number;
  /** Display time, already formatted ("Fri 2 Oct, 08:14"). */
  at: string;
  text: string;
  /** Replies before the next prompt; omitted when the transcript does not say. */
  replies?: number;
  /** Tool calls before the next prompt; omitted when the transcript does not say. */
  toolCalls?: number;
  truncated?: boolean;
};

export type PromptTurnState = "ready" | "loading" | "unsupported" | "missing";

export type PromptTurnListProps = {
  turns: PromptTurn[];
  state?: PromptTurnState;
  /** Runtime name for the unsupported note ("Cursor"). */
  runtimeLabel?: string;
  /** Total turns in the session when only the newest are shown. */
  total?: number;
  className?: string;
};

function Note({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="mx-auto max-w-[44ch] py-6 text-center text-[12.5px] leading-relaxed text-ink-faint [&_svg]:size-3.5">
      <span aria-hidden="true" className="mr-2 inline-flex align-[-2px]">
        {icon}
      </span>
      {children}
    </p>
  );
}

/** Prompts by turn for one session. */
export function PromptTurnList({ turns, state = "ready", runtimeLabel = "this runtime", total, className }: PromptTurnListProps) {
  if (state === "loading") {
    return (
      <div className={cn("flex justify-center py-6", className)}>
        <LoadingLine>Loading prompts…</LoadingLine>
      </div>
    );
  }
  if (state === "unsupported") {
    return (
      <div className={className}>
        <Note icon={<Info />}>Prompt capture is not available for {runtimeLabel} sessions yet.</Note>
      </div>
    );
  }
  if (state === "missing") {
    return (
      <div className={className}>
        <Note icon={<FileQuestion />}>No transcript found for this session. Its log may have been cleaned up.</Note>
      </div>
    );
  }
  if (turns.length === 0) {
    return (
      <div className={className}>
        <Note icon={<Info />}>No typed prompts recorded in this session.</Note>
      </div>
    );
  }
  const count = total ?? turns.length;
  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-2 text-[12px] text-ink-faint">
        {count} {plural(count, "turn")} · one exchange per turn: your prompt plus every reply and tool call before the next prompt
        {total && total > turns.length ? ` · newest ${turns.length} shown` : ""}
      </p>
      <ol className="divide-y divide-hair-soft">
        {turns.map((p) => (
          <li key={p.turn} className="flex min-w-0 flex-col gap-1.5 py-3">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-faint">
              <Badge mono size="sm">
                Turn {p.turn}
              </Badge>
              <span className="font-mono text-[11px] tabular-nums">{p.at}</span>
              {p.replies !== undefined || p.toolCalls !== undefined ? (
                <span>
                  {/* a count the transcript did not report is left out, never shown as 0 */}
                  {[
                    p.replies !== undefined ? `${p.replies} ${plural(p.replies, "reply", "replies")}` : null,
                    p.toolCalls !== undefined ? `${p.toolCalls} ${plural(p.toolCalls, "tool call")}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              ) : null}
            </div>
            <p className="whitespace-pre-wrap break-words text-[12.5px] leading-[1.55] text-ink-dim">
              {p.text}
              {p.truncated ? <span className="italic text-ink-faint"> [… truncated]</span> : null}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
