// Error panel: say what failed, reassure that data is intact, offer one recovery action.
// ErrorPanel covers load errors, crash fallbacks, failed maps and previews, a down space and
// unsupported features, in error, retrying and recovered states, with an optional mono
// "Technical details" disclosure and copy. The crash boundary is ViewBoundary in
// error-boundary.tsx. Server-safe (CopyButton carries its own client boundary).
import type { ReactNode } from "react";
import { ChevronRight, CircleCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { CopyButton } from "@/components/ui/copy-button";

export type ErrorPanelState = "error" | "retrying" | "recovered";

export type ErrorPanelProps = {
  /** Warning glyph in the icon tile; defaults to a triangle. */
  icon?: ReactNode;
  /** Names the failure: "Couldn't load projects". */
  title: ReactNode;
  /** One plain sentence on why. */
  cause?: ReactNode;
  /** Raw error text, shown mono under a disclosure with a copy button. */
  detail?: string;
  detailLabel?: string;
  /** "Your files are unchanged." */
  reassurance?: ReactNode;
  /** One recovery action, plus at most one secondary. */
  actions?: ReactNode;
  state?: ErrorPanelState;
  /** Title and body shown once recovered. */
  recovered?: { title: ReactNode; body?: ReactNode };
  /** card: bordered panel; page: centered inside a view; inline: no box. */
  layout?: "card" | "page" | "inline";
  /** coral: the visualizer's error card on a deep blue ground. */
  tone?: "default" | "coral";
  /** Open the technical details disclosure on first render. */
  detailOpen?: boolean;
  /** Extra content under the actions (recovered rows, a badge). */
  children?: ReactNode;
  headingLevel?: "h3" | "h4";
  className?: string;
};

/** Failure, cause, reassurance and one way forward. */
export function ErrorPanel({
  icon,
  title,
  cause,
  detail,
  detailLabel = "Technical details",
  detailOpen = false,
  reassurance,
  actions,
  state = "error",
  recovered,
  layout = "card",
  tone = "default",
  children,
  headingLevel: H = "h3",
  className,
}: ErrorPanelProps) {
  const ok = state === "recovered";
  const center = layout === "page";
  return (
    <div
      role={ok ? "status" : state === "retrying" ? "status" : undefined}
      aria-busy={state === "retrying" || undefined}
      data-state={state}
      className={cn(
        "flex min-w-0 flex-col gap-3",
        center && "items-center text-center",
        layout === "card" && tone === "default" && ["rounded-[14px] border bg-s1 p-5", ok ? "border-grn/30" : "border-red/25"],
        layout === "card" && tone === "coral" && "max-w-[480px] rounded-[8px] border border-[#ffad9b]/70 bg-[#14192e] p-[30px]",
        layout === "page" && "px-6 py-10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-grid size-9 shrink-0 place-items-center rounded-[10px] border [&_svg]:size-[18px]",
          ok ? "border-grn/30 bg-grn/10 text-grn" : tone === "coral" ? "border-[#ffad9b]/40 bg-[#ffad9b]/10 text-[#ffad9b]" : "border-red/30 bg-red/10 text-red",
        )}
      >
        {ok ? <CircleCheck /> : (icon ?? <TriangleAlert />)}
      </span>
      <div className={cn("min-w-0", center && "flex flex-col items-center")}>
        <H className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{ok && recovered ? recovered.title : title}</H>
        {ok ? (
          recovered?.body ? <p className="mt-1 max-w-[56ch] text-[12.5px] leading-relaxed text-ink-dim">{recovered.body}</p> : null
        ) : cause ? (
          <p className="mt-1 max-w-[56ch] text-[12.5px] leading-relaxed text-ink-dim">{cause}</p>
        ) : null}
      </div>
      {!ok && detail ? (
        <details open={detailOpen} className={cn("group w-full min-w-0 rounded-[10px] border border-hair-soft bg-black/40 text-left", center && "max-w-[460px]")}>
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[10px]! px-3 py-2 text-[12px] text-ink-dim hover:text-ink [&::-webkit-details-marker]:hidden">
            <ChevronRight aria-hidden="true" className="size-3.5 transition-transform group-open:rotate-90" />
            {detailLabel}
          </summary>
          <div className="flex items-start gap-2 border-t border-hair-soft px-3 py-2.5">
            {/* long lines scroll sideways, so the block takes focus for keyboard scrolling */}
            <pre
              tabIndex={0}
              aria-label={detailLabel}
              className="scroll-thin m-0 min-w-0 flex-1 overflow-x-auto whitespace-pre rounded-[4px]! font-mono text-[11px] leading-relaxed text-ink-dim"
            >
              {detail}
            </pre>
            <CopyButton text={detail} variant="icon" size="sm" aria-label="Copy error detail" announce="Error detail copied" />
          </div>
        </details>
      ) : null}
      {!ok && reassurance ? (
        <p className={cn("flex items-start gap-1.5 text-[12px] text-ink-faint", center && "justify-center")}>
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-grn/80" />
          <span>{reassurance}</span>
        </p>
      ) : null}
      {actions ? <div className={cn("flex flex-wrap items-center gap-2", center && "justify-center")}>{actions}</div> : null}
      {children}
    </div>
  );
}
