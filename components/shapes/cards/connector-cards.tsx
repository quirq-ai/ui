"use client";

// Connector cards: ConnectorCard (app tile, name and auth, status chip and account, one
// primary action, Actions and Polling drawers), NativeConnectorCard (built-in connectors
// with their own sign-in body: device code, remotes) and TelemetrySourceCard (a telemetry
// source, not a connector: collect switch, stats band, editable path band).
import { useId, useState, type ReactNode } from "react";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox, Input, Select } from "@/components/ui/field";
import { RuntimeLogo, type LogoAlias, type LogoId } from "@/components/ui/runtime-logo";
import { StateChip, type StateOf } from "@/components/ui/status";
import { Switch } from "@/components/ui/switch";
import { StatusDot } from "@/components/ui/status";

/* ----------------------------------------------------------------------------- status words */

/** Connector status words as they ship (space, not workspace, in new copy). */
export type ConnectorWord =
  | "Not connected"
  | "Checking…"
  | "On in this space"
  | "Off in this space"
  | "Needs attention"
  | "Sign-in pending"
  | "Unavailable";

export const CONNECTOR_STATE: Record<ConnectorWord, StateOf<"connector">> = {
  "Not connected": "not_connected",
  "Checking…": "checking",
  "On in this space": "on",
  "Off in this space": "off",
  "Needs attention": "needs_attention",
  "Sign-in pending": "sign_in_pending",
  Unavailable: "unavailable",
};

const PRIMARY: Record<ConnectorWord, string | null> = {
  "Not connected": "Connect",
  "Checking…": null,
  "On in this space": "Turn off here",
  "Off in this space": "Turn on here",
  "Needs attention": "Sign in again",
  "Sign-in pending": "Finish sign-in",
  Unavailable: null,
};

const CONNECTED: ConnectorWord[] = ["On in this space", "Off in this space", "Needs attention"];

const INTERVALS = ["5 min", "15 min", "30 min", "1 hour", "6 hours", "24 hours"];

/* ----------------------------------------------------------------------------- ConnectorCard */

export type ConnectorAction = { name: string; kind: "read" | "write"; on: boolean };

export type ConnectorCardProps = {
  logo: LogoId | LogoAlias;
  name: string;
  auth: string;
  description: string;
  status: ConnectorWord;
  account?: string | null;
  note?: string | null;
  actions: ConnectorAction[];
  collectors: string[];
  pollEvery?: string | null;
  lastPoll?: string | null;
  /** The last poll failed; shown in the danger tone. */
  lastPollError?: string | null;
  busy?: boolean;
  polling?: boolean;
  onPrimary?: () => void;
  onPollNow?: () => void;
  onDelete?: () => void;
  className?: string;
};

/** One connector in the grid. Rows share a height so buttons line up; a drawer opens below. */
export function ConnectorCard({
  logo,
  name,
  auth,
  description,
  status,
  account,
  note,
  actions,
  collectors,
  pollEvery,
  lastPoll,
  lastPollError,
  busy = false,
  polling = false,
  onPrimary,
  onPollNow,
  onDelete,
  className,
}: ConnectorCardProps) {
  const [drawer, setDrawer] = useState<"actions" | "polling" | null>(null);
  const [acts, setActs] = useState(actions);
  const [cols, setCols] = useState<Record<string, boolean>>(Object.fromEntries(collectors.map((c) => [c, true])));
  const [collect, setCollect] = useState(true);
  const [every, setEvery] = useState(pollEvery ?? "15 min");
  const [saved, setSaved] = useState(false);
  const uid = useId();
  const connected = CONNECTED.includes(status);
  const primary = PRIMARY[status];
  const toggle = (d: "actions" | "polling") => setDrawer((cur) => (cur === d ? null : d));

  return (
    <article
      data-status={CONNECTOR_STATE[status]}
      className={cn(
        "relative flex min-h-[200px] min-w-0 flex-col overflow-hidden rounded-[12px] border bg-s2 transition-colors duration-150",
        status === "On in this space" ? "border-grn/25" : status === "Needs attention" ? "border-org/30" : "border-hair hover:border-hair-strong",
        className,
      )}
    >
      <header className="flex flex-col gap-3 px-4 pb-2.5 pt-4">
        <div className={cn("flex min-w-0 items-center gap-[11px]", account && onDelete && "pr-9")}>
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-white/[0.07] bg-s3">
            <RuntimeLogo id={logo} size={20} decorative />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-[14px] font-semibold leading-snug">{name}</h4>
            <span className="mt-0.5 block text-[12px] text-ink-faint">{auth}</span>
          </div>
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5">
          <StateChip kind="connector" state={CONNECTOR_STATE[status]} />
          {account ? (
            <span className="max-w-full truncate rounded-full border border-hair px-2 py-0.5 text-[11px] text-ink-dim">{account}</span>
          ) : null}
        </div>
      </header>
      {account && onDelete ? (
        <IconButton aria-label={`Delete the ${name} connection from your account`} variant="danger" size="sm" onClick={onDelete} className="absolute right-3.5 top-3.5 border-hair!">
          <Trash2 />
        </IconButton>
      ) : null}
      <div className="min-w-0 flex-1 px-4">
        <p className="text-[13px] leading-[1.5] text-ink-dim">{description}</p>
        {note ? (
          <p className={cn("mt-2 text-[12px] leading-[1.45]", status === "Needs attention" ? "text-org" : status === "Unavailable" ? "text-[#ff7a70]" : "text-ink-faint")}>{note}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-4 pt-3.5">
        {primary ? (
          <Button
            size="sm"
            variant={status === "Not connected" || status === "Sign-in pending" || status === "Needs attention" ? "primary" : "secondary"}
            loading={busy}
            loadingLabel="Working…"
            onClick={onPrimary}
          >
            {primary}
          </Button>
        ) : status === "Unavailable" ? (
          <Button size="sm" leadingIcon={<RefreshCw />} loading={busy} loadingLabel="Checking…" onClick={onPrimary}>
            Try again
          </Button>
        ) : null}
        {connected ? (
          <>
            <Button size="sm" variant={drawer === "actions" ? "secondary" : "subtle"} aria-expanded={drawer === "actions"} aria-controls={`${uid}-actions`} onClick={() => toggle("actions")}>
              Actions
            </Button>
            <Button size="sm" variant={drawer === "polling" ? "secondary" : "subtle"} aria-expanded={drawer === "polling"} aria-controls={`${uid}-polling`} onClick={() => toggle("polling")}>
              Polling
            </Button>
          </>
        ) : null}
      </div>

      {drawer === "actions" ? (
        <div id={`${uid}-actions`} data-drawer="actions" className="scroll-thin max-h-[340px] overflow-auto border-t border-hair-soft bg-black/10 px-4 pb-4 pt-3">
          <p className="mb-2.5 text-[12px] leading-[1.5] text-ink-faint">Turn an action off to keep it out of the agent&apos;s toolset.</p>
          <div className="flex flex-col gap-2">
            {acts.map((a, i) => (
              <Checkbox
                key={a.name}
                checked={a.on}
                onChange={() => setActs((list) => list.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
                label={<span className="text-[12.5px]">{a.name}</span>}
                trailing={
                  <Badge size="xs" mono variant="outline" tone={a.kind === "read" ? "blu" : "org"}>
                    {a.kind}
                  </Badge>
                }
                className="w-full"
              />
            ))}
          </div>
        </div>
      ) : null}

      {drawer === "polling" ? (
        <div id={`${uid}-polling`} data-drawer="polling" className="flex flex-col gap-2.5 border-t border-hair-soft bg-black/10 px-4 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Checkbox checked={collect} onChange={() => setCollect((v) => !v)} label={<span className="text-[12.5px]">Collect into Inbox</span>} />
            <label htmlFor={`${uid}-every`} className="text-[12px] text-ink-dim">
              Every
            </label>
            <Select id={`${uid}-every`} size="sm" value={every} onChange={(e) => setEvery(e.target.value)} className="w-[110px]!" disabled={!collect}>
              {INTERVALS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </Select>
          </div>
          {account ? (
            <p className="text-[12px] text-ink-faint">
              Polling as <span className="break-all text-ink-dim">{account}</span>
            </p>
          ) : null}
          {collectors.map((c) => (
            <Checkbox key={c} checked={cols[c]} disabled={!collect} onChange={() => setCols((x) => ({ ...x, [c]: !x[c] }))} label={<span className="text-[12.5px]">{c}</span>} />
          ))}
          <div className="mt-1 flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSaved(true);
              }}
            >
              Save
            </Button>
            <Button size="sm" loading={polling} loadingLabel="Polling…" onClick={onPollNow} disabled={!collect}>
              Poll now
            </Button>
          </div>
          <p role="status" className={cn("text-[12px]", lastPollError ? "text-[#ff7a70]" : "text-ink-faint")}>
            {saved ? `Saved. Polling every ${every}.` : lastPollError ? `Last poll failed: ${lastPollError}` : lastPoll ? `Last poll ${lastPoll}` : "Not polled yet"}
          </p>
        </div>
      ) : null}
    </article>
  );
}

/* ----------------------------------------------------------------------------- NativeConnectorCard */

export type NativeConnectorCardProps = {
  logo: LogoId | LogoAlias;
  name: string;
  state: StateOf<"connector">;
  stateLabel?: string;
  description: string;
  account?: string | null;
  /** Extra body: a device code, a remotes list, a token field. */
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Built-in connector with its own sign-in body under the description. */
export function NativeConnectorCard({ logo, name, state, stateLabel, description, account, children, actions, className }: NativeConnectorCardProps) {
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-[12px] border bg-s2",
        state === "connected" || state === "configured" ? "border-grn/25" : state === "sign_in_pending" ? "border-yel/25" : "border-hair",
        className,
      )}
    >
      <header className="flex items-start gap-[11px] px-4 pb-2 pt-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-white/[0.07] bg-s3">
          <RuntimeLogo id={logo} size={20} decorative />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
            {name}
            <StateChip kind="connector" state={state} label={stateLabel} />
          </h4>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-dim">{description}</p>
          {account ? <p className="mt-1 font-mono text-[11.5px] text-ink-faint">{account}</p> : null}
        </div>
      </header>
      {children ? <div className="border-t border-hair-soft bg-black/10 px-4 py-3.5">{children}</div> : null}
      {actions ? <div className="mt-auto flex flex-wrap gap-1.5 px-4 pb-4 pt-3">{actions}</div> : null}
    </article>
  );
}

/* ----------------------------------------------------------------------------- TelemetrySourceCard */

export type TelemetryState = "on" | "off" | "pending" | "down";

const TELEMETRY_WORD: Record<TelemetryState, string> = { on: "Collecting", off: "Paused", pending: "Starting", down: "Not found" };

export type TelemetrySourceCardProps = {
  logo: LogoId | LogoAlias;
  label: string;
  vendor: string;
  /** Vendor tint, used on the tag only. */
  vendorColor: string;
  state: TelemetryState;
  enabled: boolean;
  onEnabledChange?: (on: boolean) => void;
  busy?: boolean;
  sessions: number | null;
  tokens: number | null;
  /** null when the source does not report cost: reads Unavailable. */
  cost: number | null;
  envKey?: string | null;
  path: string;
  problem?: string | null;
  onSavePath?: (path: string) => void;
  className?: string;
};

/** A telemetry source (not a connector): header band, stats band, path band. */
export function TelemetrySourceCard({
  logo,
  label,
  vendor,
  vendorColor,
  state,
  enabled,
  onEnabledChange,
  busy = false,
  sessions,
  tokens,
  cost,
  envKey,
  path,
  problem,
  onSavePath,
  className,
}: TelemetrySourceCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(path);
  const uid = useId();
  const off = state === "off";
  return (
    <article data-collection={state} className={cn("flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-hair bg-s2", className)}>
      <header className="flex items-center gap-3 border-b border-hair-soft px-4 py-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-s3">
          <RuntimeLogo id={logo} size={18} decorative />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h4 className="flex flex-wrap items-center gap-2 text-[14px] font-semibold leading-tight">
            {label}
            <span
              className="rounded-[3px] border px-1.5 py-px text-[10.5px] font-medium"
              style={{ color: vendorColor, borderColor: `color-mix(in srgb, ${vendorColor} 40%, transparent)`, background: `color-mix(in srgb, ${vendorColor} 10%, transparent)` }}
            >
              {vendor}
            </span>
          </h4>
          <p className="flex items-center gap-1.5 text-[12px] text-ink-dim">
            <StatusDot status={state === "on" ? "up" : state === "down" ? "down" : state === "pending" ? "warn" : "idle"} size="xs" pulse={state === "pending"} halo={false} />
            {TELEMETRY_WORD[state]}
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} busy={busy} aria-label={`Collect from ${label}`} />
      </header>
      <dl className={cn("grid grid-cols-3 gap-3 px-4 pb-3.5 pt-3 transition-opacity", off && "opacity-55")}>
        {[
          ["Sessions", formatNumber(sessions)],
          ["Tokens", formatCompact(tokens)],
          ["Cost", cost === null ? "Unavailable" : `~${formatCurrency(cost, cost >= 1000 ? 0 : 2)}`],
        ].map(([t, v]) => (
          <div key={t} className="min-w-0">
            <dt className="text-[12px] text-ink-dim">{t}</dt>
            <dd className={cn("mt-0.5 truncate font-semibold tabular-nums", v === "Unavailable" ? "text-[12.5px] font-normal text-ink-faint" : "text-[15px] text-ink")}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className={cn("mt-auto flex flex-col gap-2 border-t border-hair-soft bg-s3/45 px-4 py-2.5", off && "opacity-55")}>
        {editing ? (
          <>
            <div className="flex min-w-0 items-center gap-2.5">
              <label htmlFor={`${uid}-path`} className="shrink-0 font-mono text-[11.5px] text-ink-dim">
                {envKey}
              </label>
              <Input id={`${uid}-path`} size="sm" mono value={draft} onChange={(e) => setDraft(e.target.value)} />
            </div>
            <div className="flex justify-end gap-1.5">
              <Button
                size="sm"
                variant="subtle"
                onClick={() => {
                  setDraft(path);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onSavePath?.(draft);
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          </>
        ) : (
          <div className="flex min-h-7 min-w-0 items-center gap-2.5">
            <span className="shrink-0 font-mono text-[11.5px] text-ink-dim">{envKey ?? "auto"}</span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-ink" title={path}>
              {envKey ? path : "Discovered automatically"}
            </span>
            {envKey ? (
              <IconButton aria-label={`Edit ${envKey} path`} variant="outline" size="xs" onClick={() => setEditing(true)}>
                <Pencil />
              </IconButton>
            ) : null}
          </div>
        )}
        {problem ? <p className="text-[12px] leading-[1.45] text-[#ff7a70]">{problem}</p> : null}
      </div>
    </article>
  );
}
