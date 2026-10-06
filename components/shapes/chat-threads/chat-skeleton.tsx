// Chat placeholders: ChatBubbleSkeleton (the landing bento's empty bubbles, person right and
// translucent, agent left and solid) and TranscriptSkeleton (shimmer turns while a stored
// conversation loads). Fixed widths only, so server and client render the same. Server-safe.
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/loaders";

export type ChatBubbleSkeletonProps = {
  /** Number of bubbles; they alternate person, agent, person. */
  count?: number;
  /** Bubble height in px. */
  height?: number;
  className?: string;
};

/** Text-free bubbles that suggest a conversation (marketing art, not a loading state). */
export function ChatBubbleSkeleton({ count = 5, height = 40, className }: ChatBubbleSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("flex w-full flex-col justify-center gap-3", className)}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "block w-[64%] rounded-[20px]",
            i % 2 === 0 ? "self-end bg-[rgba(217,217,217,0.2)]" : "self-start bg-[#d9d9d9]",
          )}
          style={{ height }}
        />
      ))}
    </div>
  );
}

const TURNS: { side: "agent" | "person"; widths: string[] }[] = [
  { side: "person", widths: ["58%"] },
  { side: "agent", widths: ["92%", "84%", "46%"] },
  { side: "person", widths: ["36%"] },
  { side: "agent", widths: ["88%", "62%"] },
];

export type TranscriptSkeletonProps = {
  /** Visible caption under the shimmer; also the status text for screen readers. */
  label?: string;
  className?: string;
};

/** Shimmer turns shaped like a transcript, with an announced caption. */
export function TranscriptSkeleton({ label = "Loading conversation…", className }: TranscriptSkeletonProps) {
  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      {TURNS.map((turn, i) =>
        turn.side === "person" ? (
          <div key={i} className="flex justify-end">
            <Skeleton height={36} radius={18} style={{ width: turn.widths[0] }} />
          </div>
        ) : (
          <div key={i} className="flex gap-3">
            <Skeleton width={32} height={32} radius={8} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
              <Skeleton width={120} height={10} radius={4} />
              {turn.widths.map((w, j) => (
                <Skeleton key={j} height={11} radius={4} style={{ width: w }} />
              ))}
            </div>
          </div>
        ),
      )}
      <p role="status" className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
    </div>
  );
}
