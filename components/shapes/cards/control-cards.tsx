// Space control cards: SpaceControlCard (runtime banner, name and type, auto-stop timer,
// trial notice, status pill, Start, Stop, Open space, update), SpaceHeaderControls (status
// and API pills, Start or Stop, Space apps and Connections menus), RemoteSessionControl,
// ServerUpdateCard (check, update, restart) and WatcherPanel (live watcher pulse). Lifecycle
// words follow the space enum: Creating, Starting, Running, Stopping, Stopped, and
// "Space could not start". Server-safe; CardMenu carries its own client boundary.
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleArrowDown,
  CircleArrowUp,
  CircleHelp,
  Clock,
  LayoutGrid,
  Link2,
  Play,
  RefreshCw,
  Square,
  TriangleAlert,
  Unlink2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import { RuntimeLogo, RuntimeTag, type LogoAlias, type LogoId } from "@/components/ui/runtime-logo";
import { StatusDot } from "@/components/ui/status";
import { Tooltip } from "@/components/ui/tooltip";
import type { Tone } from "@/components/ui/tones";
import { CardMenu, type CardMenuItem } from "./card-menu";

/* ----------------------------------------------------------------------------- lifecycle */

export type SpaceLifecycle = "creating" | "starting" | "running" | "stopping" | "stopped" | "failed";

export const LIFECYCLE: Record<SpaceLifecycle, { label: string; tone: Tone; text: string; pulse: boolean; hint: string }> = {
  creating: { label: "Creating", tone: "blu", text: "text-blu", pulse: true, hint: "Provisioning the space." },
  starting: { label: "Starting", tone: "yel", text: "text-yel", pulse: true, hint: "Starting the runtime and Space API." },
  running: { label: "Running", tone: "grn", text: "text-grn", pulse: false, hint: "The space is up and the Space API answers." },
  stopping: { label: "Stopping", tone: "org", text: "text-org", pulse: true, hint: "Saving state and stopping." },
  stopped: { label: "Stopped", tone: "neutral", text: "text-ink-faint", pulse: false, hint: "Nothing is running. Files stay on disk. Start to bring it back." },
  failed: { label: "Space could not start", tone: "red", text: "text-[#ff7a70]", pulse: false, hint: "The runtime exited before the Space API answered." },
};

/** Timer urgency: normal over 60 minutes, warn under 60, critical under 15. */
export function stopUrgency(minutes: number): "normal" | "warn" | "critical" {
  return minutes < 15 ? "critical" : minutes < 60 ? "warn" : "normal";
}

const urgencyText = { normal: "text-ink-faint", warn: "text-org", critical: "text-[#ff7a70]" } as const;

/* ----------------------------------------------------------------------------- SpaceControlCard */

export type SpaceControlCardProps = {
  name: string;
  runtime: LogoId | LogoAlias;
  /** Mono type line under the name ("Claude Code · hosted · Coder"). */
  typeLabel: string;
  status: SpaceLifecycle;
  /** Running, but the agent has not connected yet. */
  agentConnecting?: boolean;
  /** Auto-stop timer; null when the space has no auto-stop. */
  stopsIn?: { label: string; minutes: number } | null;
  trial?: boolean;
  /** Shared users see status only: no Start or Stop. */
  canOperate?: boolean;
  outdated?: boolean;
  updating?: boolean;
  watch?: "live" | "connecting" | "disconnected";
  failure?: { body: string; details: string };
  onStart?: () => void;
  onStop?: () => void;
  onOpen?: () => void;
  onUpdate?: () => void;
  /** Banner height; compact for dense grids. */
  compact?: boolean;
  className?: string;
};

/** Control card for one space (the "workspace control card" in XO Swarm). */
export function SpaceControlCard({
  name,
  runtime,
  typeLabel,
  status,
  agentConnecting = false,
  stopsIn,
  trial = false,
  canOperate = true,
  outdated = false,
  updating = false,
  watch = "live",
  failure,
  onStart,
  onStop,
  onOpen,
  onUpdate,
  compact = false,
  className,
}: SpaceControlCardProps) {
  const meta = LIFECYCLE[status];
  const connecting = status === "running" && agentConnecting;
  const tone: Tone = connecting ? "org" : meta.tone;
  const textCls = connecting ? "text-org" : meta.text;
  const transitioning = status === "starting" || status === "stopping" || status === "creating";
  const isUp = status === "running" || status === "starting";
  const urgency = stopsIn ? stopUrgency(stopsIn.minutes) : "normal";

  return (
    <article className={cn("@container flex min-w-0 flex-col gap-3 rounded-[14px] border border-hair bg-s1 p-3 text-ink", className)}>
      <div
        aria-hidden="true"
        className={cn("relative grid place-items-center overflow-hidden rounded-[10px] border border-hair bg-gradient-to-t from-white/[0.05] to-s2", compact ? "h-20" : "aspect-video")}
      >
        <div className="dots absolute inset-0 opacity-60" />
        <span className={cn("relative flex items-center gap-3", status === "stopped" && "opacity-55 grayscale")}>
          <RuntimeLogo id={runtime} size={compact ? 26 : 40} decorative />
        </span>
      </div>

      <div>
        <h4 className="truncate text-[17px] font-bold leading-tight">{name}</h4>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="font-mono text-[11.5px] text-ink-faint">{typeLabel}</p>
          {stopsIn && status === "running" ? (
            <p className={cn("flex items-center gap-1 text-[12px]", urgencyText[urgency])}>
              <Clock aria-hidden="true" className="size-3" />
              Stops in {stopsIn.label}
            </p>
          ) : null}
        </div>
      </div>

      {trial && status === "running" ? (
        <div className="flex gap-2 rounded-[10px] border border-yel/25 bg-yel/[0.05] p-2.5">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-yel" />
          <p className="text-[12px] leading-[1.45] text-ink-dim">
            <b className="font-medium text-yel">Trial space.</b> It stops after 24 hours.{" "}
            <a href="#pricing" className="rounded-[3px]! font-medium text-ink underline underline-offset-2 hover:text-yel">
              Upgrade your plan
            </a>{" "}
            to keep it running for 30 days.
          </p>
        </div>
      ) : null}

      {status === "failed" && failure ? (
        <div role="alert" className="rounded-[10px] border border-red/35 bg-red/[0.06] p-2.5 text-[12px] leading-[1.45] text-ink-dim">
          <p>{failure.body}</p>
          <details className="mt-1.5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer list-none rounded-[3px]! text-[11.5px] text-ink underline underline-offset-2">Technical details</summary>
            <pre className="scroll-thin mt-2 overflow-x-auto rounded-[6px] bg-black/50 p-2 font-mono text-[11px] text-ink-dim">{failure.details}</pre>
          </details>
        </div>
      ) : null}

      {canOperate && ((isUp && outdated) || updating) ? (
        <Button
          size="sm"
          leadingIcon={<CircleArrowUp />}
          loading={updating}
          loadingLabel="Updating…"
          disabled={transitioning}
          onClick={onUpdate}
          className="border-org/60! text-org! hover:bg-org/10!"
        >
          Update and restart
        </Button>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <div role="status" className="flex min-w-0 flex-1 shrink-0 basis-[190px] items-center gap-2 rounded-[8px] border border-hair px-2 py-[5px]">
          <StatusDot tone={tone} size="xs" pulse={meta.pulse || connecting} />
          <p className={cn("min-w-0 font-mono text-[12px] leading-tight", textCls)}>
            {meta.label}
            {connecting ? <span className="block text-[10.5px] text-ink-dim">Agent connecting…</span> : null}
          </p>
          {watch === "connecting" ? <Spinner size="xs" label="Reconnecting to live status" className="ml-auto text-ink-faint" /> : null}
          {watch === "disconnected" ? (
            <span className="ml-auto inline-flex text-ink-faint" title="Live status disconnected">
              <Unlink2 aria-label="Live status disconnected" className="size-3" />
            </span>
          ) : null}
        </div>
        {canOperate ? (
          <div className="ml-auto flex shrink-0 gap-2">
            {status === "running" ? (
              <>
                {onOpen ? (
                  <Button size="sm" variant="primary" onClick={onOpen} trailingIcon={<ArrowRight />} disabled={updating}>
                    Open space
                  </Button>
                ) : null}
                <Button size="sm" variant="danger" leadingIcon={<Square />} onClick={onStop} disabled={updating}>
                  Stop
                </Button>
              </>
            ) : status === "stopping" ? (
              <Button size="sm" variant="danger" loading loadingLabel="Stop">
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                leadingIcon={status === "failed" ? <RefreshCw /> : <Play />}
                loading={status === "starting" || status === "creating"}
                loadingLabel="Start"
                onClick={onStart}
                className="border-grn/45! text-grn! hover:bg-grn/10!"
              >
                {status === "failed" ? "Try again" : "Start"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Loading, error and not-found stand-ins for the control card. */
export function SpaceControlMessage({ kind, message }: { kind: "loading" | "error" | "missing"; message?: string }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn("flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[14px] border p-6 text-center", kind === "missing" ? "border-dashed border-hair-strong" : "border-hair bg-s1")}
    >
      {kind === "loading" ? (
        <span className="flex items-center gap-2 text-[13px] text-ink-dim">
          <Spinner size="sm" label={null} /> Loading space…
        </span>
      ) : kind === "error" ? (
        <>
          <p className="text-[13px] text-[#ff7a70]">Error loading space</p>
          <p className="text-[12px] text-ink-faint">{message}</p>
        </>
      ) : (
        <p className="text-[13px] text-ink-faint">No space found</p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------- SpaceHeaderControls */

export type ApiState = "up" | "down" | "unknown";

const API: Record<ApiState, { icon: ReactNode; label: string; text: string; hint: string }> = {
  up: { icon: <CircleArrowUp />, label: "API: Up", text: "text-grn", hint: "Space API answers: file, project and chat calls work." },
  down: { icon: <CircleArrowDown />, label: "API: Down", text: "text-[#ff7a70]", hint: "Space API is not answering. The space may still be starting." },
  unknown: { icon: <CircleHelp />, label: "API: Unavailable", text: "text-ink-faint", hint: "The Space API has not been reached yet." },
};

function HeaderPill({ hint, children, id }: { hint: string; children: ReactNode; id: string }) {
  return (
    <Tooltip content={hint} id={id} placement="bottom" align="start">
      <span tabIndex={0} className="flex h-8 items-center gap-1.5 rounded-[8px]! border border-hair px-2 font-mono text-[11.5px] [&_svg]:size-3.5">
        {children}
      </span>
    </Tooltip>
  );
}

export type SpaceHeaderControlsProps = {
  status: SpaceLifecycle;
  api: ApiState;
  apps: CardMenuItem[];
  connections: CardMenuItem[];
  onStart?: () => void;
  onStop?: () => void;
  idPrefix: string;
  className?: string;
};

/** Header bar for a space: status and API pills, Start or Stop, apps and connections menus. Icons only on phones. */
export function SpaceHeaderControls({ status, api, apps, connections, onStart, onStop, idPrefix, className }: SpaceHeaderControlsProps) {
  const meta = LIFECYCLE[status];
  const a = API[api];
  const transitioning = status === "starting" || status === "stopping" || status === "creating";
  const running = status === "running";
  const apiDown = api !== "up";
  return (
    <div role="toolbar" aria-label="Space controls" className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <HeaderPill hint={meta.hint} id={`${idPrefix}-st`}>
          <StatusDot tone={meta.tone} size="xs" pulse={meta.pulse} />
          <span className={cn("hidden sm:inline", meta.text)}>{meta.label}</span>
          <span className="sr-only sm:hidden">{meta.label}</span>
        </HeaderPill>
        <HeaderPill hint={a.hint} id={`${idPrefix}-api`}>
          <span aria-hidden="true" className={cn("inline-flex", a.text)}>
            {a.icon}
          </span>
          <span className={cn("hidden sm:inline", a.text)}>{a.label}</span>
          <span className="sr-only sm:hidden">{a.label}</span>
        </HeaderPill>
      </div>
      {running ? (
        <Button size="sm" variant="danger" leadingIcon={<Square />} onClick={onStop} aria-label="Stop space">
          <span className="hidden sm:inline">Stop</span>
        </Button>
      ) : (
        <Button
          size="sm"
          leadingIcon={<Play />}
          loading={transitioning}
          loadingLabel={<span className="hidden sm:inline">{meta.label}</span>}
          onClick={onStart}
          aria-label="Start space"
          className="border-grn/45! text-grn! hover:bg-grn/10!"
        >
          <span className="hidden sm:inline">Start</span>
        </Button>
      )}
      <CardMenu
        aria-label="Space apps"
        heading="Space apps"
        align="start"
        triggerClassName="h-7 gap-1.5 rounded-[8px]! border-hair bg-s2 px-2.5 text-[12px] text-ink hover:border-hair-strong hover:bg-s3 [&_svg]:size-3.5"
        trigger={
          <>
            <LayoutGrid aria-hidden="true" />
            <span className="hidden sm:inline">Space apps</span>
            <ChevronDown aria-hidden="true" />
          </>
        }
        items={apps}
        disabled={!running}
        title={!running ? "Start the space to open its apps." : undefined}
      />
      <CardMenu
        aria-label="Connections"
        heading="Connections"
        align="end"
        triggerClassName="h-7 gap-1.5 rounded-[8px]! border-hair bg-s2 px-2.5 text-[12px] text-ink hover:border-hair-strong hover:bg-s3 [&_svg]:size-3.5"
        trigger={
          <>
            <Link2 aria-hidden="true" />
            <span className="hidden sm:inline">Connections</span>
            <ChevronDown aria-hidden="true" />
          </>
        }
        items={connections}
        disabled={apiDown}
        title={apiDown ? "Space API is down: wait for it to come up." : undefined}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- RemoteSessionControl */

export type RemoteSessionControlProps = {
  runtime: LogoId | LogoAlias;
  title: string;
  spaceName: string;
  state: "running" | "connecting" | "stopped";
  elapsed: string;
  busy?: boolean;
  onStop?: () => void;
  onResume?: () => void;
  className?: string;
};

/** A session running in a remote space, with Stop or Resume. */
export function RemoteSessionControl({ runtime, title, spaceName, state, elapsed, busy = false, onStop, onResume, className }: RemoteSessionControlProps) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-3 rounded-[12px] border border-hair bg-s2 p-3", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-s3">
        <RuntimeLogo id={runtime} size={18} decorative />
      </span>
      <div className="min-w-[180px] flex-1">
        <p className="truncate text-[13px] font-medium text-ink">{title}</p>
        <p className="flex items-center gap-1.5 truncate font-mono text-[11px] text-ink-faint">
          <StatusDot status={state === "running" ? "up" : state === "connecting" ? "busy" : "idle"} size="xs" pulse={state === "connecting"} halo={false} />
          {state === "running" ? "Running" : state === "connecting" ? "Connecting…" : "Stopped"} · {spaceName} · {elapsed}
        </p>
      </div>
      {state === "stopped" ? (
        <Button size="sm" leadingIcon={<Play />} loading={busy} loadingLabel="Resuming…" onClick={onResume}>
          Resume
        </Button>
      ) : (
        <Button size="sm" variant="danger" leadingIcon={<Square />} loading={busy} loadingLabel="Stopping…" disabled={state === "connecting"} onClick={onStop}>
          Stop session
        </Button>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------- ServerUpdateCard */

export type UpdateState = "not_checked" | "checking" | "up_to_date" | "behind" | "blocked" | "updating" | "updated" | "error";

const UPDATE_BADGE: Record<UpdateState, { label: string; cls: string }> = {
  not_checked: { label: "Not checked", cls: "text-ink-faint" },
  checking: { label: "Checking", cls: "text-blu" },
  up_to_date: { label: "Up to date", cls: "text-grn" },
  behind: { label: "3 behind", cls: "text-org" },
  blocked: { label: "Blocked", cls: "text-org" },
  updating: { label: "Updating", cls: "text-blu" },
  updated: { label: "Restart needed", cls: "text-org" },
  error: { label: "Error", cls: "text-[#ff7a70]" },
};

export type Commit = { sha: string; date: string; subject: string };

export type ServerUpdateCardProps = {
  state: UpdateState;
  installed: Commit;
  branch: string;
  latest?: Commit;
  behind?: number;
  /** Why an update is blocked: local changes or local commits. */
  blockedReason?: string;
  error?: string;
  onCheck?: () => void;
  onUpdate?: () => void;
  onRestart?: () => void;
  className?: string;
};

function CommitLine({ c }: { c: Commit }) {
  return (
    <>
      <code className="font-mono text-[11.5px] text-ink">{c.sha}</code> · {c.date} · {c.subject}
    </>
  );
}

/** Updates card: installed commit, what the check found, and the next action. */
export function ServerUpdateCard({ state, installed, branch, latest, behind = 0, blockedReason, error, onCheck, onUpdate, onRestart, className }: ServerUpdateCardProps) {
  const badge = state === "behind" ? { ...UPDATE_BADGE.behind, label: `${behind} behind` } : UPDATE_BADGE[state];
  return (
    <section className={cn("flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-hair bg-s2", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5">
        <h4 className="text-[14px] font-medium text-ink">Updates</h4>
        <i className={cn("text-[12px] italic", badge.cls)}>{badge.label}</i>
      </header>
      <div role="status" className="flex flex-col gap-1.5 px-5 py-4 text-[12px] leading-[1.55] text-ink-dim">
        {state === "checking" || state === "updating" ? (
          <p className="flex items-center gap-2">
            <Spinner size="xs" label={null} />
            {state === "checking" ? "Checking for updates…" : "Updating Space…"}
          </p>
        ) : state === "not_checked" ? (
          <p>Check for a newer version of Space.</p>
        ) : state === "error" ? (
          <p className="text-[#ff7a70]">{error ?? "The version check failed."}</p>
        ) : (
          <>
            <p>
              <b className="font-medium text-ink">Installed</b> <CommitLine c={installed} /> <span className="text-ink-faint">on {branch}</span>
            </p>
            {state === "up_to_date" ? <p>You have the latest version.</p> : null}
            {(state === "behind" || state === "blocked") && latest ? (
              <>
                <p>
                  <b className="font-medium text-ink">Latest</b> <CommitLine c={latest} />
                </p>
                <p>
                  {behind} {behind === 1 ? "commit" : "commits"} behind{state === "blocked" && blockedReason ? ` · ${blockedReason}` : ""}.
                </p>
                {state === "blocked" ? <p className="text-org">Save your local changes before updating.</p> : null}
              </>
            ) : null}
            {state === "updated" && latest ? (
              <>
                <p>
                  <b className="font-medium text-ink">Updated</b> <CommitLine c={latest} /> ({behind} commits).
                </p>
                <p className="text-org">Restart to load the new version.</p>
              </>
            ) : null}
          </>
        )}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-4">
        {state === "updated" ? (
          <Button size="sm" variant="primary" leadingIcon={<RefreshCw />} onClick={onRestart}>
            Restart server
          </Button>
        ) : (
          <>
            <Button size="sm" onClick={onCheck} loading={state === "checking"} loadingLabel="Checking…" disabled={state === "updating"}>
              Check for updates
            </Button>
            {state === "behind" ? (
              <Button size="sm" variant="primary" onClick={onUpdate}>
                Update now
              </Button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- WatcherPanel */

export type WatcherRow = { project: string; runtime: LogoId | LogoAlias; open: number; ago: string; live: boolean };

export type WatcherPanelProps = {
  state: "live" | "stalled";
  /** Tooltip for the stalled badge: when the watcher last ticked. */
  stalledSince?: string;
  stats: { label: string; value: string }[];
  rows: WatcherRow[];
  config: { label: string; value: string }[];
  credentials: string[];
  className?: string;
};

/** Live watcher pulse: stats, project rows, runtime and credentials. */
export function WatcherPanel({ state, stalledSince, stats, rows, config, credentials, className }: WatcherPanelProps) {
  return (
    <section className={cn("flex min-w-0 flex-col overflow-hidden rounded-[15px] border border-hair bg-s2/85", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Live pulse</p>
          <h4 className="mt-1 text-[20px] font-medium leading-tight text-ink">Watcher activity</h4>
        </div>
        {state === "live" ? (
          <span className="flex items-center gap-1.5 rounded-[3px] border border-grn/35 bg-grn/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-grn">
            <StatusDot status="up" size="xs" pulse halo={false} /> Live
          </span>
        ) : (
          <Tooltip content={`The watcher is on but has not ticked since ${stalledSince ?? "it started"}.`} placement="bottom" align="end">
            <span tabIndex={0} className="rounded-[3px]! border border-red/45 bg-red/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#ff7a70]">
              Stalled
              <span className="sr-only">: the watcher is on but has not ticked since {stalledSince ?? "it started"}.</span>
            </span>
          </Tooltip>
        )}
      </header>
      <dl className="grid grid-cols-3 border-y border-hair-soft">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("min-w-0 px-3 py-3 sm:px-5", i > 0 && "border-l border-hair-soft")}>
            <dt className="text-[11.5px] leading-tight text-ink-faint">{s.label}</dt>
            <dd className={cn("mt-1 font-medium tabular-nums", s.value === "Unavailable" ? "text-[12px] leading-[25px] text-ink-dim" : "text-[17px] text-ink")}>{s.value}</dd>
          </div>
        ))}
      </dl>
      {rows.length ? (
        <ul className="flex flex-col px-5 py-2">
          {rows.map((r) => (
            <li key={r.project} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-hair-soft py-2.5 text-[12.5px] last:border-b-0 sm:grid-cols-[auto_1fr_auto_auto_64px]">
              <StatusDot status={r.live ? "up" : "idle"} size="xs" />
              <span className="truncate text-ink">{r.project}</span>
              <span className="hidden sm:inline-flex">
                <RuntimeTag id={r.runtime} />
              </span>
              <span className="font-mono text-[11.5px] tabular-nums text-ink-dim">{r.open} open</span>
              <span className="text-right font-mono text-[11px] tabular-nums text-ink-faint">{r.ago}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-5 text-[12.5px] text-ink-faint">No project activity snapshots have been written yet.</p>
      )}
      <div className="border-t border-hair-soft px-5 py-4">
        <p className="flex items-center justify-between text-[13px] font-medium text-ink">
          Runtime and credentials
          <span className="font-mono text-[11px] font-normal text-ink-faint">{credentials.length} configured</span>
        </p>
        <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-3">
          {config.map((c) => (
            <div key={c.label} className="min-w-0">
              <dt className="text-ink-faint">{c.label}</dt>
              <dd className="truncate text-ink">{c.value}</dd>
            </div>
          ))}
        </dl>
        {credentials.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {credentials.map((c) => (
              <li key={c} className="rounded-[6px] border border-hair bg-black/30 px-2 py-1 font-mono text-[11px] text-ink-dim">
                {c} <span aria-label="value hidden">••••</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[12px] text-ink-faint">No environment credentials are saved.</p>
        )}
      </div>
    </section>
  );
}
