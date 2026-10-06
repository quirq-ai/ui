"use client";

// ChatHistory: past conversations grouped by recency (Today, Yesterday, Previous 7 days,
// Older), each row naming its title, project and last activity. Two layouts: "sidebar" (the
// swarm org nav and the space dashboard chat side: New chat, Refresh history, search, compact
// rows) and "list" (a wider panel with the last message preview and runtime). States: loaded,
// loading (fixed-width skeleton rows, hydration safe), Space API down (muted note, the list
// retries on its own), empty and refreshing (current rows stay, dimmed). Arrow keys move
// between rows; Home and End jump.
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { MessageSquare, Plus, RotateCw, ServerOff, SquarePen } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/loaders";
import { StatusDot } from "@/components/ui/status";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { SearchInput } from "@/components/ui/field";

export type HistoryGroup = "Today" | "Yesterday" | "Previous 7 days" | "Older";
export const HISTORY_GROUPS: HistoryGroup[] = ["Today", "Yesterday", "Previous 7 days", "Older"];

export type HistoryRow = {
  id: string;
  title: string;
  group: HistoryGroup;
  /** Relative last activity, already formatted ("12m ago"). */
  time: string;
  /** Project display name. */
  project?: string;
  /** Runtime logo id for the list layout. */
  runtime?: LogoId;
  /** Runtime id as text for the sidebar meta line ("claude_code"). */
  runtimeLabel?: string;
  /** Last message, list layout only. */
  preview?: string;
  /** The session is open (an agent is still in it). */
  live?: boolean;
};

export type HistoryState = "ready" | "loading" | "down" | "empty";

export type ChatHistoryProps = {
  variant?: "sidebar" | "list";
  rows: HistoryRow[];
  state?: HistoryState;
  /** The open conversation; marked aria-current="true". */
  activeId?: string | null;
  onOpen?: (id: string) => void;
  onNewChat?: () => void;
  onRefresh?: () => void;
  /** Refresh in flight: rows stay on screen, dimmed, and the icon turns. */
  refreshing?: boolean;
  /** Show the "Search sessions…" filter (sidebar). */
  searchable?: boolean;
  /** Override the down note. */
  downMessage?: string;
  /** Heading for the list layout. */
  title?: ReactNode;
  "aria-label"?: string;
  className?: string;
};

const SKELETON_WIDTHS = ["72%", "58%", "84%", "64%", "76%"];

function HistorySkeleton({ variant }: { variant: "sidebar" | "list" }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-1 px-2 py-2">
      <Skeleton width={64} height={8} radius={3} className="mb-2 ml-2 mt-1" />
      {SKELETON_WIDTHS.map((w) => (
        <div key={w} className={cn("flex items-center gap-2.5 rounded-[8px] px-2", variant === "list" ? "h-14" : "h-11")}>
          <Skeleton width={16} height={16} radius={4} className="shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton height={10} radius={4} style={{ width: w }} />
            <Skeleton height={8} radius={4} style={{ width: "38%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Note({ icon, children, status = false }: { icon?: ReactNode; children: ReactNode; status?: boolean }) {
  return (
    <p role={status ? "status" : undefined} className="flex items-start gap-2 px-4 py-3 text-[12px] leading-snug text-ink-faint">
      {icon ? (
        <span aria-hidden="true" className="mt-px inline-flex shrink-0 [&_svg]:size-3.5">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </p>
  );
}

/** Chat history in a sidebar or a list panel. */
export function ChatHistory({
  variant = "sidebar",
  rows,
  state = "ready",
  activeId = null,
  onOpen,
  onNewChat,
  onRefresh,
  refreshing = false,
  searchable = false,
  downMessage = "Space API is not answering. Checking again every 10s.",
  title = "Chats",
  "aria-label": ariaLabel = "Chat history",
  className,
}: ChatHistoryProps) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();
  const filtered = q ? rows.filter((r) => `${r.title} ${r.project ?? ""}`.toLowerCase().includes(q)) : rows;
  const groups = HISTORY_GROUPS.map((g) => ({ label: g, rows: filtered.filter((r) => r.group === g) })).filter((g) => g.rows.length > 0);
  const sidebar = variant === "sidebar";
  const GroupHeading = sidebar ? "h3" : "h4";

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-history-row]") ?? []);
    if (buttons.length === 0) return;
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next = at;
    if (e.key === "ArrowDown") next = at < 0 ? 0 : Math.min(buttons.length - 1, at + 1);
    if (e.key === "ArrowUp") next = at < 0 ? 0 : Math.max(0, at - 1);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = buttons.length - 1;
    e.preventDefault();
    buttons[next]?.focus();
  }

  let body: ReactNode;
  if (state === "loading") {
    body = (
      <>
        <span role="status" className="sr-only">
          Loading chat history
        </span>
        <HistorySkeleton variant={variant} />
      </>
    );
  } else if (state === "down") {
    body = (
      <Note icon={<ServerOff />} status>
        {downMessage}
      </Note>
    );
  } else if (state === "empty" || rows.length === 0) {
    body = <Note icon={<MessageSquare />}>No conversations yet. Start a new chat and it shows up here.</Note>;
  } else if (groups.length === 0) {
    body = <Note>No sessions match “{query.trim()}”.</Note>;
  } else {
    body = (
      <div ref={listRef} onKeyDown={onKeyDown} className={cn("flex flex-col pb-2 transition-opacity", refreshing && "opacity-60")}>
        {groups.map((g) => (
          <section key={g.label} aria-label={g.label} className="pt-2">
            <GroupHeading className="px-4 pb-1 pt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
              {g.label}
            </GroupHeading>
            <ul className={cn("flex flex-col", sidebar ? "gap-0.5 px-2" : "divide-y divide-hair-soft")}>
              {g.rows.map((r) => (
                <li key={r.id}>
                  {sidebar ? (
                    <SidebarRow row={r} active={r.id === activeId} onOpen={onOpen} />
                  ) : (
                    <ListRow row={r} active={r.id === activeId} onOpen={onOpen} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  const refreshButton = onRefresh ? (
    <button
      type="button"
      onClick={onRefresh}
      disabled={refreshing || state === "loading"}
      aria-label={refreshing ? "Refreshing…" : "Refresh history"}
      title="Refresh history"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[9px]! border border-hair text-ink-dim transition-colors hover:border-hair-strong hover:bg-s2 hover:text-ink disabled:cursor-default disabled:hover:bg-transparent",
        sidebar ? "size-8" : "h-8 px-2.5 text-[12px]",
      )}
    >
      <RotateCw aria-hidden="true" className={cn("size-3.5", refreshing && "spin")} />
      {sidebar ? null : <span>{refreshing ? "Refreshing…" : "Refresh"}</span>}
    </button>
  ) : null;

  if (sidebar) {
    return (
      <nav aria-label={ariaLabel} aria-busy={refreshing || state === "loading" || undefined} className={cn("flex min-h-0 min-w-0 flex-col bg-s1", className)}>
        <div className="flex flex-col gap-2 p-3 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[9px]! border border-hair text-[12.5px] text-ink-dim transition-colors hover:border-hair-strong hover:bg-s2 hover:text-ink"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              New chat
            </button>
            {refreshButton}
          </div>
          {searchable ? (
            <SearchInput
              size="sm"
              shape="field"
              placeholder="Search sessions…"
              aria-label="Search sessions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={state !== "ready"}
            />
          ) : null}
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{body}</div>
      </nav>
    );
  }

  return (
    <section aria-label={ariaLabel} aria-busy={refreshing || state === "loading" || undefined} className={cn("flex min-w-0 flex-col", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-4 py-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
          {state === "ready" ? (
            <span className="font-mono text-[11px] tabular-nums text-ink-faint">
              {rows.length}
              <span className="sr-only"> {rows.length === 1 ? "conversation" : "conversations"}</span>
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {refreshButton}
          {onNewChat ? (
            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex h-8 items-center gap-1.5 rounded-[9px]! border border-hair bg-s2 px-2.5 text-[12px] text-ink transition-colors hover:border-hair-strong hover:bg-s3"
            >
              <SquarePen aria-hidden="true" className="size-3.5" />
              New chat
            </button>
          ) : null}
        </div>
      </header>
      {body}
    </section>
  );
}

function SidebarRow({ row, active, onOpen }: { row: HistoryRow; active: boolean; onOpen?: (id: string) => void }) {
  const meta = [row.project, row.runtimeLabel, row.time].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      data-history-row
      aria-current={active ? "true" : undefined}
      onClick={() => onOpen?.(row.id)}
      title={`${row.title} · ${row.time}`}
      className={cn(
        "group flex w-full min-w-0 items-start gap-2.5 rounded-[8px]! border px-2.5 py-2 text-left transition-colors",
        active ? "border-hair-soft bg-s3" : "border-transparent hover:bg-s2",
      )}
    >
      <MessageSquare aria-hidden="true" className={cn("mt-[3px] size-3.5 shrink-0", active ? "text-ink" : "text-ink-faint")} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-[12.5px] leading-5", active ? "text-ink" : "text-ink/85 group-hover:text-ink")}>{row.title || "Untitled"}</span>
        <span className="truncate text-[11.5px] leading-4 text-ink-faint">{meta}</span>
      </span>
      {row.live ? (
        <span className="mt-[7px] inline-flex shrink-0">
          <StatusDot status="up" size="xs" pulse label="Open session" />
        </span>
      ) : null}
    </button>
  );
}

function ListRow({ row, active, onOpen }: { row: HistoryRow; active: boolean; onOpen?: (id: string) => void }) {
  return (
    <button
      type="button"
      data-history-row
      aria-current={active ? "true" : undefined}
      onClick={() => onOpen?.(row.id)}
      className={cn(
        "group relative flex w-full min-w-0 items-start gap-3 rounded-none! px-4 py-3 text-left transition-colors",
        active ? "bg-s2" : "hover:bg-white/[0.025]",
      )}
    >
      {active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-ink" /> : null}
      <span className="mt-0.5 inline-grid size-7 shrink-0 place-items-center rounded-[8px] border border-hair bg-s3">
        {row.runtime ? <RuntimeLogo id={row.runtime} size={14} decorative /> : <MessageSquare aria-hidden="true" className="size-3.5 text-ink-faint" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13px] font-medium text-ink">{row.title || "Untitled"}</span>
          {row.live ? (
            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-grn">
              <StatusDot status="up" size="xs" pulse halo={false} />
              Open
            </span>
          ) : null}
        </span>
        {row.preview ? <span className="line-clamp-1 text-[12px] leading-snug text-ink-faint">{row.preview}</span> : null}
        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 text-[11.5px] text-ink-faint">
          {row.project ? <span className="font-mono text-[11px] text-ink-dim">{row.project}</span> : null}
          {row.project && row.runtimeLabel ? <span aria-hidden="true">·</span> : null}
          {row.runtimeLabel ? <span className="font-mono text-[11px]">{row.runtimeLabel}</span> : null}
        </span>
      </span>
      <span className="shrink-0 pt-0.5 font-mono text-[10.5px] tabular-nums text-ink-faint">{row.time}</span>
    </button>
  );
}
