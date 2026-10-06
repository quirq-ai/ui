// Small app bodies that the frames host: chat, files, galileo sources, usage, inbox, terminal,
// projects, issue board and a compact Space dashboard. Each is prop driven with fixture
// defaults so the demos can drop them into a phone, a docked pane or an embedded frame.
// Server-safe: no hooks.
import { cn } from "@/lib/cn";
import {
  CHAT_TRANSCRIPT,
  CURRENT_SPACE,
  FILE_TREE,
  GALILEO_SOURCES,
  INBOX,
  LOG_LINES,
  LOG_LEVEL_META,
  PEOPLE,
  PROJECTS,
  USAGE_SUMMARY,
  WORK_ITEM_BOARD,
  WORK_ITEM_LABELS,
  flattenTree,
  type ChatMessage,
  type GalileoSource,
  type InboxItem,
  type LogLine,
  type Project,
  type Space,
  type SpaceStatus,
  type UsageRollup,
  type WorkItemColumn,
  type WorkItem,
} from "@/lib/fixtures";
import { formatBytes, formatCurrency, formatLatency, formatNumber, formatTokens } from "@/lib/format";
import { Avatar, RuntimeLogo, StateChip, StatusDot } from "@/components/ui";
import { Glyph } from "./glyphs";

const KICKER = "font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint";

/* ----------------------------------------------------------------------------- chat */

type TextMessage = Extract<ChatMessage, { kind: "user" | "assistant" }>;

const DEFAULT_CHAT = CHAT_TRANSCRIPT.messages.filter((m): m is TextMessage => m.kind === "user" || m.kind === "assistant").slice(0, 4);

/** Inline **strong** and `code` from transcript text, without a Markdown dependency. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
          <code key={i} className="rounded-[4px] bg-white/[0.06] px-1 font-mono text-[11.5px] text-ink">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Compact transcript: user and assistant turns plus a composer. */
export function MiniChat({
  messages = DEFAULT_CHAT,
  title = CHAT_TRANSCRIPT.session.title,
  composer = true,
  className,
}: {
  messages?: TextMessage[];
  title?: string;
  composer?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-hair-soft px-4 py-2.5">
        <RuntimeLogo id="claude_code" size={14} decorative />
        <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">{title}</p>
        <StatusDot status="up" pulse size="xs" label="Session open" />
      </div>
      <ol className="scroll-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {messages.map((m) =>
          m.kind === "user" ? (
            <li key={m.id} className="ml-auto max-w-[86%] rounded-[14px] rounded-br-[4px] bg-s3 px-3 py-2 text-[12.5px] leading-relaxed text-ink">
              <Inline text={m.text} />
            </li>
          ) : (
            <li key={m.id} className="flex max-w-[92%] gap-2 text-[12.5px] leading-relaxed text-ink-dim">
              <span className="mt-0.5 shrink-0">
                <Avatar name="Claude Code" runtime="claude_code" size="xs" decorative />
              </span>
              <span>
                <Inline text={m.text} />
              </span>
            </li>
          ),
        )}
      </ol>
      {composer ? (
        <div className="border-t border-hair-soft p-2.5">
          <label className="flex items-center gap-2 rounded-[12px] border border-hair bg-s1 px-3 py-2">
            <span className="sr-only">Message</span>
            <input placeholder="Ask Claude Code…" className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none" />
          </label>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- files */

const GIT_MARK: Record<string, { mark: string; tone: string }> = {
  modified: { mark: "M", tone: "text-yel" },
  added: { mark: "A", tone: "text-grn" },
  untracked: { mark: "U", tone: "text-cyn" },
  deleted: { mark: "D", tone: "text-red" },
  renamed: { mark: "R", tone: "text-blu" },
};

/** Depth-first file list with sizes and Git marks. */
export function MiniFiles({ limit = 16, className }: { limit?: number; className?: string }) {
  const rows = flattenTree(FILE_TREE).slice(1, limit + 1);
  return (
    <ul className={cn("py-1.5 font-mono text-[12px]", className)} aria-label={`${FILE_TREE.name} files`}>
      {rows.map(({ node, depth }) => {
        const git = node.git ? GIT_MARK[node.git] : null;
        return (
          <li key={node.path} className="flex items-center gap-2 px-3 py-[5px] hover:bg-white/[0.03]" style={{ paddingLeft: 12 + (depth - 1) * 14 }}>
            <Glyph name={node.type === "folder" ? "Folder" : "FileText"} className={cn("size-3.5 shrink-0", node.type === "folder" ? "text-cyn" : "text-ink-faint")} />
            <span className={cn("min-w-0 flex-1 truncate", node.type === "folder" ? "text-ink" : "text-ink-dim")}>{node.name}</span>
            <span className="shrink-0 text-[10.5px] text-ink-faint tabular-nums">{formatBytes(node.size)}</span>
            <span className={cn("w-3 shrink-0 text-center text-[10.5px]", git?.tone)}>{git?.mark ?? ""}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- galileo sources */

/** galileo sources, grouped Ports then Files, with up or down dots. */
export function MiniSources({
  sources = GALILEO_SOURCES,
  onOpen,
  className,
}: {
  sources?: GalileoSource[];
  onOpen?: (name: string) => void;
  className?: string;
}) {
  const groups: [string, GalileoSource[]][] = [
    ["Ports", sources.filter((s) => s.type === "port")],
    ["Files", sources.filter((s) => s.type === "files")],
  ];
  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      {groups.map(([title, list]) => (
        <section key={title} aria-label={title}>
          <h3 className={cn(KICKER, "mb-1.5")}>{title}</h3>
          <ul className="overflow-hidden rounded-[12px] border border-hair bg-s1">
            {list.map((s) => (
              <li key={s.name} className="border-b border-hair-soft last:border-b-0">
                <button
                  type="button"
                  onClick={() => onOpen?.(s.name)}
                  disabled={!onOpen}
                  className="flex w-full items-center gap-2.5 rounded-none! px-3 py-2 text-left text-[12.5px] transition-colors enabled:hover:bg-white/[0.03] disabled:cursor-default"
                >
                  <StatusDot status={s.up ? "up" : "down"} size="xs" label={s.up ? "Up" : "Down"} />
                  <span className="font-medium text-ink">{s.name}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-faint">{s.port ? `:${s.port}` : s.path}</span>
                  <span className={cn("shrink-0 text-[11px]", s.up ? "text-ink-faint" : "text-[#ff7a70]")}>{s.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- usage */

/** Usage meter tiles for a window. Tokens and cost, never quirqs. */
export function MiniUsage({ rollup = USAGE_SUMMARY["7 days"], className }: { rollup?: UsageRollup; className?: string }) {
  const tiles = [
    { k: "Tokens", v: formatTokens(rollup.tokens, false) },
    { k: "Cost", v: formatCurrency(rollup.cost) },
    { k: "Sessions", v: formatNumber(rollup.sessions) },
    { k: "Latency p50", v: formatLatency(rollup.avgLatencyMs) },
  ];
  return (
    <div className={cn("p-4", className)}>
      <p className={KICKER}>
        Last {rollup.window} · {rollup.provenance}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        {tiles.map((t) => (
          <div key={t.k} className="rounded-[12px] border border-hair bg-s1 px-3 py-2.5">
            <dt className="text-[11px] text-ink-faint">{t.k}</dt>
            <dd className="mt-0.5 font-mono text-[15px] tabular-nums text-ink">{t.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">
        {rollup.daysWithoutLatency > 0
          ? `${rollup.daysWithoutLatency} ${rollup.daysWithoutLatency === 1 ? "day" : "days"} without latency telemetry ${rollup.daysWithoutLatency === 1 ? "is" : "are"} left out, not counted as zero.`
          : "Every day in the window has latency telemetry."}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------------- inbox */

export function MiniInbox({ items = INBOX.slice(0, 6), className }: { items?: InboxItem[]; className?: string }) {
  return (
    <ul className={cn("py-1", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2.5 border-b border-hair-soft px-4 py-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] border border-hair bg-s2 text-ink-dim">
            <Glyph name={item.glyph} className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-[12.5px]", item.status === "new" ? "font-medium text-ink" : "text-ink-dim")}>{item.title}</span>
            <span className="block truncate text-[11.5px] text-ink-faint">
              {item.detail} · {item.ago}
            </span>
          </span>
          {item.status === "new" ? <StatusDot status="busy" size="xs" label="New" className="mt-2" /> : null}
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- terminal */

export function MiniTerminal({ lines = LOG_LINES.slice(-12), className }: { lines?: LogLine[]; className?: string }) {
  return (
    <pre className={cn("scroll-thin overflow-x-auto px-3 py-3 font-mono text-[11px] leading-[1.7] text-ink-dim", className)}>
      {lines.map((l) => (
        <span key={l.id} className="block whitespace-pre">
          <span className="text-ink-faint">{l.time} </span>
          <span style={{ color: `var(--${LOG_LEVEL_META[l.level].tone})` }}>{LOG_LEVEL_META[l.level].label.padEnd(5)}</span>{" "}
          <span className="text-ink">{l.source}</span> {l.message}
        </span>
      ))}
    </pre>
  );
}

/* ----------------------------------------------------------------------------- projects */

export function MiniProjects({ projects = PROJECTS.slice(0, 8), className }: { projects?: Project[]; className?: string }) {
  return (
    <ul className={cn("py-1", className)}>
      {projects.map((p) => (
        <li key={p.id} className="flex items-center gap-2.5 border-b border-hair-soft px-4 py-2.5 text-[12.5px]">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-[2px]" style={{ background: `var(--${p.color})` }} />
          <span className="min-w-0 flex-1 truncate font-mono text-ink">{p.displayName}</span>
          <span className="hidden shrink-0 text-[11px] text-ink-faint sm:inline">{p.category}</span>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-dim">{p.openWorkItems} open</span>
          <Avatar name={PEOPLE[p.owner].name} size="xs" />
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- issue board */

export function MiniIssueBoard({
  board = WORK_ITEM_BOARD,
  className,
}: {
  board?: { column: WorkItemColumn; items: WorkItem[] }[];
  className?: string;
}) {
  return (
    <div className={cn("scroll-thin flex h-full gap-2.5 overflow-x-auto p-3", className)}>
      {board.map((col) => (
        <section key={col.column} aria-label={col.column} className="flex w-[196px] shrink-0 flex-col gap-2 rounded-[10px] bg-white/[0.025] p-2">
          <h3 className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            {col.column}
            <span className="tabular-nums">{col.items.length}</span>
          </h3>
          <ul className="flex flex-col gap-1.5">
            {col.items.slice(0, 4).map((w) => (
              <li key={w.id} className="rounded-[8px] border border-hair bg-s2 px-2.5 py-2">
                <p className="text-[12px] leading-snug text-ink">{w.title}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-1 font-mono text-[10px] text-ink-faint">
                  #{w.number}
                  {w.labels.slice(0, 2).map((l) => (
                    <span key={l} className="rounded-[3px] border border-hair px-1" style={{ color: `var(--${WORK_ITEM_LABELS[l]?.color ?? "ink-dim"})` }}>
                      {l}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Space dashboard */

/** Space lifecycle status to its StateChip key. */
export const SPACE_STATE: Record<SpaceStatus, "creating" | "starting" | "running" | "stopping" | "stopped"> = {
  Creating: "creating",
  Starting: "starting",
  Running: "running",
  Stopping: "stopping",
  Stopped: "stopped",
};

/** A compact Space dashboard: the app a Space pane or in-phone frame loads. */
export function MiniSpaceDashboard({ space = CURRENT_SPACE, className }: { space?: Space; className?: string }) {
  const projects = PROJECTS.filter((p) => p.spaceId === space.id);
  return (
    <div className={cn("flex flex-col gap-3 p-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[13px] text-ink">{space.name}</p>
        <StateChip kind="space" state={SPACE_STATE[space.status]} />
        <span className="font-mono text-[11px] text-ink-faint">{space.host}</span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {projects.slice(0, 4).map((p) => (
          <li key={p.id} className="rounded-[10px] border border-hair bg-s1 px-3 py-2">
            <p className="truncate font-mono text-[12px] text-ink">{p.displayName}</p>
            <p className="mt-0.5 text-[11px] text-ink-faint">
              {p.sessions} sessions · {p.lastActive}
            </p>
          </li>
        ))}
      </ul>
      <p className={KICKER}>Mock data</p>
    </div>
  );
}
