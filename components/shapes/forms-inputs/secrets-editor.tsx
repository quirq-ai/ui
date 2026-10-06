"use client";

// Secrets editor. Values are write-only: once saved they are never shown again, only a mask.
// parseEnv (KEY=value lines from a pasted .env), EnvPasteComposer (paste, see "3 variables
// detected" with new or replaces per key, then save; merges by key), SecretRowList (key,
// state, mask, Replace and Remove with inline confirm; loading, load error and empty states),
// CredentialList (iOS-style grouped rows that expand into a credential detail) and
// ApiKeyPanel (a bring-your-own key: set, from environment, not set, replacing).
import { useId, useState, type ReactNode } from "react";
import { ChevronRight, KeyRound, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loaders";
import { StatusDot } from "@/components/ui/status";
import { pluralize } from "@/lib/format";
import { SecretInput } from "./text-fields";
import { useTimers } from "./_timers";

/* ============================================================================ parseEnv */

export type EnvEntry = { key: string; value: string; line: number };
export type EnvParse = { entries: EnvEntry[]; skipped: number[] };

const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Reads KEY=value lines. Blank lines and # comments are ignored; "export " is dropped; quotes are removed; a repeated key keeps its last value. */
export function parseEnv(text: string): EnvParse {
  const byKey = new Map<string, EnvEntry>();
  const skipped: number[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const body = line.replace(/^export\s+/, "");
    const eq = body.indexOf("=");
    const key = eq > 0 ? body.slice(0, eq).trim() : "";
    if (!KEY.test(key)) {
      skipped.push(i + 1);
      return;
    }
    let value = body.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    byKey.delete(key);
    byKey.set(key, { key, value, line: i + 1 });
  });
  return { entries: [...byKey.values()], skipped };
}

/** Mask for display: never the value, only its shape. */
export const MASK = "••••••";

/* ============================================================================ EnvPasteComposer */

export type EnvPasteComposerProps = {
  /** Keys that already exist (they will be replaced). */
  existingKeys: string[];
  /** Saves the entries; resolves to counts for the result toast. */
  onSave: (entries: EnvEntry[]) => { added: number; updated: number };
  delayMs?: number;
  defaultText?: string;
  className?: string;
};

/** Paste a .env block, review what was detected, save it in one go. */
export function EnvPasteComposer({ existingKeys, onSave, delayMs = 900, defaultText = "", className }: EnvPasteComposerProps) {
  const uid = useId();
  const later = useTimers();
  const [text, setText] = useState(defaultText);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { entries, skipped } = parseEnv(text);

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <label htmlFor={`${uid}-paste`} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
        Paste .env
      </label>
      <textarea
        id={`${uid}-paste`}
        rows={4}
        spellCheck={false}
        autoComplete="off"
        value={text}
        disabled={saving}
        aria-describedby={`${uid}-detected`}
        placeholder={"ANTHROPIC_API_KEY=sk-ant-…\nGITHUB_TOKEN=ghp_…"}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
        }}
        className="scroll-thin min-h-[96px] w-full resize-y rounded-[10px]! border border-hair bg-black/50 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint transition-colors hover:border-hair-strong focus:border-white/30 disabled:opacity-50"
      />
      <div id={`${uid}-detected`} aria-live="polite" className="flex flex-col gap-2">
        <p className="text-[12.5px] text-ink-dim">
          {entries.length ? <span className="text-ink">{pluralize(entries.length, "variable")} detected</span> : "Nothing detected yet. One KEY=value per line."}
          {skipped.length ? <span className="text-org"> · {skipped.length === 1 ? `line ${skipped[0]}` : `lines ${skipped.join(", ")}`} skipped: not KEY=value</span> : null}
        </p>
        {entries.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {entries.map((e) => {
              const replaces = existingKeys.includes(e.key);
              return (
                <li key={e.key} className="inline-flex h-6 items-center gap-1.5 rounded-[6px] border border-hair bg-s1 pl-2 pr-1 font-mono text-[11px] text-ink">
                  {e.key}
                  <Badge size="xs" tone={replaces ? "org" : "grn"}>
                    {replaces ? "replaces" : "new"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          disabled={!entries.length}
          loading={saving}
          loadingLabel="Saving…"
          onClick={() => {
            setSaving(true);
            later(() => {
              const { added, updated } = onSave(entries);
              setSaving(false);
              setText("");
              const parts = [added ? `${added} added` : null, updated ? `${updated} updated` : null].filter(Boolean);
              setResult(parts.length ? parts.join(", ") : "No changes: every pasted key already had the same value.");
            }, delayMs);
          }}
        >
          {entries.length ? `Save ${pluralize(entries.length, "secret")}` : "Save secrets"}
        </Button>
        {result ? (
          <p role="status" className="rise inline-flex items-center gap-1.5 text-[12.5px] text-grn">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            {result}
          </p>
        ) : (
          <p className="text-[12px] text-ink-faint">Values are write-only after saving.</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================================ SecretRowList */

export type SecretState = "configured" | "not_set" | "needs_attention";

export type SecretRow = {
  key: string;
  state: SecretState;
  /** Shape-only hint such as "sk-…f3a9"; null hides it. */
  hint?: string | null;
  usedBy?: string[];
  updated?: string | null;
};

const stateMeta: Record<SecretState, { label: string; dot: "up" | "idle" | "warn" }> = {
  configured: { label: "Configured", dot: "up" },
  not_set: { label: "Empty", dot: "idle" },
  needs_attention: { label: "Needs attention", dot: "warn" },
};

export type SecretRowListProps = {
  rows: SecretRow[];
  onReplace?: (key: string, value: string) => void;
  onRemove?: (key: string) => void;
  loading?: boolean;
  /** Load failure message; shows a red tinted box with Try again. */
  loadError?: ReactNode;
  onRetry?: () => void;
  /** Key currently saving, to show the saving look. */
  savingKey?: string | null;
  emptyTitle?: ReactNode;
  emptyBody?: ReactNode;
  className?: string;
};

/** Key, state, mask, Replace, Remove. Replace opens a write-only field; Remove asks first. */
export function SecretRowList({
  rows,
  onReplace,
  onRemove,
  loading = false,
  loadError = null,
  onRetry,
  savingKey = null,
  emptyTitle = "No secrets added.",
  emptyBody = "Add an environment key and its value.",
  className,
}: SecretRowListProps) {
  const uid = useId();
  const later = useTimers();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(savingKey);

  if (loading) {
    return (
      <div role="status" aria-label="Loading credentials" className={cn("overflow-hidden rounded-[12px] border border-hair", className)}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-hair-soft px-5 py-3.5 last:border-0">
            <Skeleton width={150} height={10} />
            <Skeleton width={56} height={10} className="ml-auto" />
            <Skeleton width={64} height={22} radius={7} />
          </div>
        ))}
        <span className="sr-only">Loading credentials…</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className={cn("flex flex-wrap items-center gap-3 rounded-[12px] border border-red/30 bg-red/[0.07] px-4 py-3.5", className)}>
        <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-red" />
        <p className="min-w-0 flex-1 basis-[180px] text-[12.5px] text-[#ff9a92]">{loadError}</p>
        {onRetry ? (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={cn("flex flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-hair-strong px-5 py-8 text-center", className)}>
        <KeyRound aria-hidden="true" className="mb-1 size-5 text-ink-faint" />
        <p className="text-[13px] font-medium text-ink">{emptyTitle}</p>
        <p className="text-[12.5px] text-ink-dim">{emptyBody}</p>
      </div>
    );
  }

  return (
    <ul className={cn("overflow-hidden rounded-[12px] border border-hair", className)} aria-label="Secrets">
      {rows.map((r) => {
        const meta = stateMeta[r.state];
        const isEditing = editing === r.key;
        const isConfirming = confirming === r.key;
        const isBusy = busy === r.key;
        return (
          <li key={r.key} className="border-b border-hair-soft last:border-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1 basis-[180px]">
                <p className="truncate font-mono text-[12.5px] text-ink">{r.key}</p>
                {r.usedBy?.length ? <p className="truncate text-[11.5px] text-ink-faint">Used by {r.usedBy.join(", ")}</p> : null}
              </div>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-dim">
                <StatusDot status={meta.dot} size="xs" />
                {meta.label}
              </span>
              <code className="w-[64px] font-mono text-[12px] text-ink-faint">{r.state === "not_set" ? "not set" : MASK}</code>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => {
                    setConfirming(null);
                    setEditing(isEditing ? null : r.key);
                    setDraft("");
                  }}
                  aria-expanded={isEditing}
                  aria-controls={isEditing ? `${uid}-${r.key}-edit` : undefined}
                >
                  {r.state === "not_set" ? "Set" : "Replace"}
                </Button>
                {r.state !== "not_set" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isBusy}
                    onClick={() => {
                      setEditing(null);
                      setConfirming(isConfirming ? null : r.key);
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
            {isEditing || isBusy ? (
              <form
                id={`${uid}-${r.key}-edit`}
                className="rise flex flex-wrap items-center gap-2 border-t border-hair-soft bg-black/30 px-4 py-3 sm:px-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  setBusy(r.key);
                  later(() => {
                    onReplace?.(r.key, draft.trim());
                    setBusy(null);
                    setEditing(null);
                    setDraft("");
                  }, 800);
                }}
              >
                <label htmlFor={`${uid}-${r.key}-value`} className="sr-only">
                  New value for {r.key}
                </label>
                <div className="min-w-0 flex-1 basis-[200px]">
                  <SecretInput
                    id={`${uid}-${r.key}-value`}
                    placeholder={r.hint ? `${r.hint.split("…")[0]}…` : "New value"}
                    value={isBusy && !isEditing ? "example-value" : draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={isBusy}
                    noun="new value"
                    autoFocus={isEditing}
                  />
                </div>
                <Button type="submit" size="sm" variant="primary" disabled={!draft.trim() && !isBusy} loading={isBusy} loadingLabel="Saving…">
                  {r.state === "not_set" ? "Save secret" : "Replace value"}
                </Button>
                <Button size="sm" variant="subtle" disabled={isBusy} onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </form>
            ) : null}
            {isConfirming ? (
              <div role="alertdialog" aria-label={`Remove ${r.key}`} className="rise flex flex-wrap items-center gap-2 border-t border-red/20 bg-red/[0.05] px-4 py-3 sm:px-5">
                <TriangleAlert aria-hidden="true" className="size-3.5 text-red" />
                <p className="min-w-0 flex-1 text-[12.5px] text-ink-dim">
                  Remove <span className="font-mono text-ink">{r.key}</span>? The saved value cannot be recovered.
                </p>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setConfirming(null);
                    onRemove?.(r.key);
                  }}
                >
                  Remove
                </Button>
                <Button size="sm" variant="subtle" onClick={() => setConfirming(null)} autoFocus>
                  Keep
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ============================================================================ CredentialList */

export type CredentialListProps = {
  rows: SecretRow[];
  title?: ReactNode;
  footnote?: ReactNode;
  /** Expanded on first render. */
  defaultOpen?: string | null;
  onReplace?: (key: string, value: string) => void;
  className?: string;
};

/** iOS-style grouped list. Each row expands into a credential detail with a write-only Replace. */
export function CredentialList({ rows, title, footnote, defaultOpen = null, onReplace, className }: CredentialListProps) {
  const uid = useId();
  const later = useTimers();
  const [open, setOpen] = useState<string | null>(defaultOpen);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  return (
    <section className={cn("min-w-0", className)} aria-labelledby={title ? `${uid}-t` : undefined}>
      {title ? (
        <h4 id={`${uid}-t`} className="mb-2 px-4 text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
          {title}
        </h4>
      ) : null}
      <ul className="overflow-hidden rounded-[12px] bg-s2">
        {rows.map((r, i) => {
          const isOpen = open === r.key;
          const panel = `${uid}-${r.key}`;
          return (
            <li key={r.key} className={cn(i > 0 && "border-t border-hair-soft")}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={isOpen ? panel : undefined}
                onClick={() => {
                  setOpen(isOpen ? null : r.key);
                  setDraft("");
                  setSavedKey(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-s3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[13px] text-ink">{r.key}</span>
                  <span className="block font-mono text-[12px] tracking-[0.12em] text-ink-faint">{r.state === "not_set" ? "Not set" : "••••••••"}</span>
                </span>
                {r.state === "needs_attention" ? <StatusDot status="warn" label="Needs attention" /> : null}
                <ChevronRight aria-hidden="true" className={cn("size-4 shrink-0 text-ink-faint transition-transform duration-150", isOpen && "rotate-90")} />
              </button>
              {isOpen ? (
                <div id={panel} className="rise flex flex-col gap-3 border-t border-hair-soft bg-black/25 px-4 py-3.5">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
                    <dt className="text-ink-faint">State</dt>
                    <dd className="text-right text-ink">{stateMeta[r.state].label}</dd>
                    <dt className="text-ink-faint">Used by</dt>
                    <dd className="truncate text-right text-ink">{r.usedBy?.join(", ") || "Nothing yet"}</dd>
                    <dt className="text-ink-faint">Updated</dt>
                    <dd className="text-right text-ink">{r.updated ?? "Never"}</dd>
                  </dl>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!draft.trim()) return;
                      setSaving(true);
                      later(() => {
                        onReplace?.(r.key, draft.trim());
                        setSaving(false);
                        setDraft("");
                        setSavedKey(r.key);
                      }, 800);
                    }}
                  >
                    <label htmlFor={`${panel}-v`} className="text-[12px] text-ink-dim">
                      {r.state === "not_set" ? "Value" : "Replace value"}
                    </label>
                    <SecretInput id={`${panel}-v`} placeholder="Paste the new value" value={draft} onChange={(e) => setDraft(e.target.value)} disabled={saving} noun="value" />
                    <div className="flex items-center gap-2">
                      <Button type="submit" size="sm" variant="primary" disabled={!draft.trim()} loading={saving} loadingLabel="Saving…">
                        Save
                      </Button>
                      {savedKey === r.key ? (
                        <span role="status" className="text-[12px] text-grn">
                          Saved. The old value is gone.
                        </span>
                      ) : null}
                    </div>
                  </form>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {footnote ? <p className="mt-2 px-4 text-[11.5px] leading-snug text-ink-faint">{footnote}</p> : null}
    </section>
  );
}

/* ============================================================================ ApiKeyPanel */

export type ApiKeyState = "set" | "env" | "not_set";

export type ApiKeyPanelProps = {
  title: string;
  /** Environment variable it can come from. */
  envVar: string;
  state: ApiKeyState;
  /** What the key unlocks, shown under the title. */
  description: ReactNode;
  /** Start in the Replacing state. */
  defaultReplacing?: boolean;
  onSave?: (value: string) => void;
  onRemove?: () => void;
  className?: string;
};

/** Bring-your-own key: shows where it comes from, with Replace and Remove when it is ours to change. */
export function ApiKeyPanel({ title, envVar, state: initial, description, defaultReplacing = false, onSave, onRemove, className }: ApiKeyPanelProps) {
  const uid = useId();
  const later = useTimers();
  const [state, setState] = useState(initial);
  const [replacing, setReplacing] = useState(defaultReplacing);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const chip =
    state === "not_set" ? (
      <Badge tone="neutral" dot size="md">
        Not set
      </Badge>
    ) : (
      <Badge tone="grn" dot size="md">
        Configured
      </Badge>
    );

  return (
    <section
      aria-labelledby={`${uid}-t`}
      className={cn("flex min-w-0 flex-col gap-3 rounded-[12px] border bg-s2 p-4", state === "set" ? "border-grn/25" : "border-hair", className)}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-hair bg-s3", state === "not_set" ? "text-ink-faint" : "text-grn")}>
          <KeyRound aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1 basis-[180px]">
          <h4 id={`${uid}-t`} className="text-[13.5px] font-semibold text-ink">
            {title}
          </h4>
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-dim">
            {description}{" "}
            {state === "env" ? (
              <>
                Key held on this machine only, from <code className="font-mono text-[11.5px] text-ink">{envVar}</code>.
              </>
            ) : state === "set" ? (
              "Key held on this machine only."
            ) : null}
          </p>
        </div>
        {chip}
      </div>
      {replacing ? (
        <form
          className="rise flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            setSaving(true);
            later(() => {
              setSaving(false);
              setReplacing(false);
              setState("set");
              setDraft("");
              onSave?.(draft.trim());
            }, 800);
          }}
        >
          <label htmlFor={`${uid}-v`} className="sr-only">
            {title}
          </label>
          <div className="min-w-0 flex-1 basis-[200px]">
            <SecretInput id={`${uid}-v`} placeholder="Paste the key" value={draft} onChange={(e) => setDraft(e.target.value)} disabled={saving} noun="key" autoFocus={!defaultReplacing} />
          </div>
          <Button type="submit" size="sm" variant="primary" disabled={!draft.trim()} loading={saving} loadingLabel="Saving…">
            Save key
          </Button>
          <Button size="sm" variant="subtle" disabled={saving} onClick={() => setReplacing(false)}>
            Cancel
          </Button>
        </form>
      ) : state === "env" ? (
        <p className="text-[12px] text-ink-faint">Set in the environment, so it cannot be replaced or removed here.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={state === "not_set" ? "primary" : "secondary"} onClick={() => setReplacing(true)}>
            {state === "not_set" ? "Add key" : "Replace"}
          </Button>
          {state === "set" ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setState("not_set");
                onRemove?.();
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
