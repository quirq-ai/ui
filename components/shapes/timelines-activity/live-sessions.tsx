// Open sessions disclosure (XO Space activity view): a native <details> whose summary carries
// the live count and the checking / refreshing / unavailable words. Server-safe; the browser
// handles open and close, Enter and Space included.
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { Spinner } from "@/components/ui";

export type LiveSession = {
  id: string;
  /** Agent or session title shown in bold. */
  title: string;
  /** Runtime display name, such as "Claude Code". */
  runtime: string | null;
  /** Project name; hidden when the disclosure is already scoped to one project. */
  projectLabel?: string | null;
  openedAt: string;
  lastActiveAt: string;
};

export type LiveSessionsDisclosureProps = {
  /** null means the open sessions could not be read: "Open sessions unavailable". */
  sessions: LiveSession[] | null;
  /** A read is in flight: "Checking open sessions…" or "Refreshing… · 2 open sessions". */
  checking?: boolean;
  defaultOpen?: boolean;
  /** Show each session's project (an unscoped, space-wide list). */
  showProject?: boolean;
  /** Override the empty note. */
  emptyNote?: ReactNode;
  className?: string;
};

function summaryText(sessions: LiveSession[] | null, checking: boolean): string {
  const base = sessions === null ? "Open sessions unavailable" : `${sessions.length} open ${sessions.length === 1 ? "session" : "sessions"}`;
  if (!checking) return base;
  return sessions === null ? "Checking open sessions…" : `Refreshing… · ${base}`;
}

/** Disclosure listing live sessions with opened and last active times and the session id. */
export function LiveSessionsDisclosure({
  sessions,
  checking = false,
  defaultOpen = false,
  showProject = true,
  emptyNote = "No open sessions are reported for this selection.",
  className,
}: LiveSessionsDisclosureProps) {
  const unavailable = sessions === null;
  return (
    <details open={defaultOpen} className={cn("group mb-4 rounded-[10px] border border-hair-soft bg-s2", className)}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-2 rounded-[10px] px-[15px] py-3 text-[12px] text-ink-dim transition-colors hover:text-ink",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <ChevronRight
          aria-hidden="true"
          className={cn("size-3.5 shrink-0 transition-transform duration-150 group-open:rotate-90", unavailable ? "text-ink-faint" : "text-grn")}
        />
        {checking ? <Spinner size="xs" label={null} className="text-ink-faint" /> : null}
        <span className="min-w-0">{summaryText(sessions, checking)}</span>
      </summary>
      {sessions && sessions.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {sessions.map((s) => (
            <li key={s.id} className="grid gap-[7px] border-t border-hair-soft px-[15px] py-3 text-[12px] [overflow-wrap:anywhere]">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <b className="font-medium text-ink">{s.title}</b>
                {s.runtime ? <span className="text-ink-dim">{s.runtime}</span> : null}
                {showProject && s.projectLabel ? <span className="text-ink-faint">{s.projectLabel}</span> : null}
              </div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ink-faint">
                <span>
                  Opened{" "}
                  <time dateTime={s.openedAt} className="tabular-nums">
                    {formatDateTime(s.openedAt)}
                  </time>
                </span>
                <span>
                  Last active{" "}
                  <time dateTime={s.lastActiveAt} className="tabular-nums">
                    {formatDateTime(s.lastActiveAt)}
                  </time>
                </span>
              </div>
              <code className="font-mono text-[11.5px] leading-normal text-ink-faint">{s.id}</code>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 border-t border-hair-soft px-[15px] py-3 text-[12px] text-ink-faint">
          {unavailable ? (checking ? "Checking this selection…" : "Try Refresh to check again.") : checking ? "Checking this selection…" : emptyNote}
        </p>
      )}
    </details>
  );
}
