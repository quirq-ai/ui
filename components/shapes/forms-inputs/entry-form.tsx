"use client";

// Add and create forms. AddSourceForm (galileo: name plus port or path, the name suggested
// from a path until typed by hand, every rule from the gateway with its exact words),
// AddAppForm (name, version, port or URL, with a live "Opens at" line), CloneProjectForm
// (repository URL and folder name; everything locks while cloning), ProviderChannelBuilder
// ("+ Add Anthropic" buttons that expand into key fields), CreateSpaceForm (name rules,
// runtime, providers, channel and volume), TemplateDeployForm (template, size and storage,
// then copyable results) and ContactForm (landing: required fields, deploy target, send).
// Submits are simulated with timers so the demos can show submitting, error and success.
import { Fragment, useId, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, CircleAlert, CircleCheck, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { CopyField } from "@/components/ui/copy-button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/loaders";
import { StateChip } from "@/components/ui/status";
import { Switch } from "@/components/ui/switch";
import { FormToast, type FormToastTone } from "./form-toast";
import { NumberStepper, SecretInput } from "./text-fields";
import { RadioCardGroup, type RadioCardOption } from "./toggles";
import { useTimers } from "./_timers";
import { FormStyles } from "./_styles";

type Toast = { tone: FormToastTone; title: ReactNode; description?: ReactNode } | null;

/* ============================================================================ AddSourceForm */

export type SourceDraft = { name: string; kind: "port" | "path"; port: number | null; path: string | null; url: string };

const SOURCE_NAME = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** galileo's suggestion: "~/out/report.html" gives "report"; ports are never auto-named. */
export function suggestSourceName(location: string): string {
  const t = location.trim();
  if (!t || /^\d+$/.test(t) || t.includes("://")) return "";
  const base = t.replace(/\/+$/, "").split("/").pop() ?? "";
  const stem = base.replace(/^\.+/, "").replace(/\.[^.]+$/, "");
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The gateway's own checks, in its words. Returns the first problem or null. */
export function validateSource(
  name: string,
  location: string,
  { existing = [], gatewayPort = 4100 }: { existing?: string[]; gatewayPort?: number } = {},
): { field: "name" | "location"; message: string } | null {
  const where = location.trim();
  const n = name.trim();
  if (!where) return { field: "location", message: "Give a port, such as 5173, or a path, such as ~/notes." };
  if (/^\d+$/.test(where)) {
    const port = Number(where);
    if (port < 1 || port > 65535) return { field: "location", message: `${where} is not a port: use 1 to 65535` };
    if (port === gatewayPort) return { field: "location", message: `${port} is galileo's own port` };
  } else if (where.includes("://")) {
    return { field: "location", message: `"${where}" is not on this machine: give a port, such as 5173, or a path` };
  } else if (!where.startsWith("~") && !where.startsWith("/")) {
    return { field: "location", message: `Give a full path, such as ~/${where} or /Users/me/${where}` };
  }
  if (!n) return { field: "name", message: "Give the source a name, such as web." };
  if (!SOURCE_NAME.test(n))
    return { field: "name", message: `"${n}" can't be a source name: use lowercase letters, digits and dashes, starting and ending with a letter or digit` };
  if (existing.includes(n)) return { field: "name", message: `"${n}" is already a source: pick another name` };
  return null;
}

export type AddSourceFormProps = {
  existing?: string[];
  gatewayPort?: number;
  onAdd?: (source: SourceDraft) => void;
  delayMs?: number;
  defaultName?: string;
  defaultLocation?: string;
  /** Run the checks on first render, to show an error state. */
  validateOnMount?: boolean;
  /** Hold the submitting look (Add disabled at 60%). */
  submitting?: boolean;
  className?: string;
};

const galileoInput =
  "h-[38px] w-full min-w-0 rounded-[9px]! border border-white/10 bg-[#10140d] px-3 font-mono text-[14px] text-ink placeholder:text-ink-faint " +
  "transition-colors hover:border-white/20 focus:border-[#83d63a] aria-invalid:border-red/60 disabled:opacity-60";
const galileoLabel = "text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-dim";

/** galileo: add a port or a files source. */
export function AddSourceForm({
  existing = [],
  gatewayPort = 4100,
  onAdd,
  delayMs = 650,
  defaultName = "",
  defaultLocation = "",
  validateOnMount = false,
  submitting: forceSubmitting = false,
  className,
}: AddSourceFormProps) {
  const uid = useId();
  const later = useTimers();
  const [name, setName] = useState(defaultName);
  const [location, setLocation] = useState(defaultLocation);
  const [touched, setTouched] = useState(defaultName !== "" && defaultName !== suggestSourceName(defaultLocation));
  const [error, setError] = useState(() => (validateOnMount ? validateSource(defaultName, defaultLocation, { existing, gatewayPort }) : null));
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<SourceDraft | null>(null);
  const submitting = busy || forceSubmitting;

  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateSource(name, location, { existing, gatewayPort });
    setError(problem);
    setAdded(null);
    if (problem) {
      document.getElementById(`${uid}-${problem.field}`)?.focus();
      return;
    }
    setBusy(true);
    const where = location.trim();
    const isPort = /^\d+$/.test(where);
    const draft: SourceDraft = {
      name: name.trim(),
      kind: isPort ? "port" : "path",
      port: isPort ? Number(where) : null,
      path: isPort ? null : where,
      url: `http://${name.trim()}.localhost:${gatewayPort}/`,
    };
    later(() => {
      setBusy(false);
      setAdded(draft);
      setName("");
      setLocation("");
      setTouched(false);
      onAdd?.(draft);
    }, delayMs);
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-busy={submitting || undefined}
      className={cn("rounded-[14px] border p-4", className)}
      style={{ borderColor: "rgba(131,214,58,0.22)", background: "#151a12" }}
    >
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2.5">
        <div className="flex min-w-[140px] flex-col gap-1.5" style={{ flex: "0 1 180px" }}>
          <label htmlFor={`${uid}-name`} className={galileoLabel}>
            Name
          </label>
          <input
            id={`${uid}-name`}
            placeholder="notes"
            autoComplete="off"
            spellCheck={false}
            value={name}
            disabled={submitting}
            aria-invalid={error?.field === "name" || undefined}
            aria-describedby={error?.field === "name" ? `${uid}-error` : `${uid}-hint`}
            onChange={(e) => {
              setName(e.target.value);
              setTouched(e.target.value !== "");
            }}
            className={galileoInput}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5" style={{ flex: "1 1 280px" }}>
          <label htmlFor={`${uid}-location`} className={galileoLabel}>
            Port or path
          </label>
          <input
            id={`${uid}-location`}
            placeholder="5173, or ~/notes"
            autoComplete="off"
            spellCheck={false}
            value={location}
            disabled={submitting}
            aria-invalid={error?.field === "location" || undefined}
            aria-describedby={error?.field === "location" ? `${uid}-error` : `${uid}-hint`}
            onChange={(e) => {
              setLocation(e.target.value);
              if (!touched) setName(suggestSourceName(e.target.value));
            }}
            className={galileoInput}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-[38px] shrink-0 rounded-[9px]! bg-[#83d63a] px-5 text-[13.5px] font-semibold text-black transition-[filter,opacity] hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>
      <p id={`${uid}-hint`} className="mt-2.5 text-[12px] leading-snug text-ink-dim">
        A number is a port on this machine. A path is a file or a folder, which galileo only reads.
      </p>
      {error ? (
        <p id={`${uid}-error`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-[#ff7a70]">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {error.message}
        </p>
      ) : null}
      {added ? (
        <p role="status" className="rise mt-1.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-ink-dim">
          <CircleCheck aria-hidden="true" className="size-3.5 text-[#83d63a]" />
          Added <span className="font-mono text-ink">{added.name}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[12px]">{added.url}</span>
        </p>
      ) : null}
    </form>
  );
}

/* ============================================================================ AddAppForm */

const APP_NAME = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const short = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export type AddAppFormProps = {
  gatewayPort?: number;
  onAdd?: (app: { name: string; version: string | null; upstream: string; url: string }) => void;
  delayMs?: number;
  className?: string;
};

/** Add a dev server by its port, or a deployment by its URL, at its own address. */
export function AddAppForm({ gatewayPort = 4100, onAdd, delayMs = 600, className }: AddAppFormProps) {
  const uid = useId();
  const later = useTimers();
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [upstream, setUpstream] = useState("");
  const [error, setError] = useState<{ field: "name" | "version" | "upstream"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const n = name.trim().toLowerCase();
  const v = version.trim().toLowerCase();
  const draft = !n
    ? { ok: false as const, field: "name" as const, reason: "Name the app" }
    : !APP_NAME.test(n)
      ? { ok: false as const, field: "name" as const, reason: "Names use lowercase letters, digits and inner dashes" }
      : v && !APP_NAME.test(v)
        ? { ok: false as const, field: "version" as const, reason: "Versions use lowercase letters, digits and inner dashes" }
        : { ok: true as const, url: `http://${v ? `${v}.` : ""}${n}.localhost:${gatewayPort}/` };

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.ok) return setError({ field: draft.field, message: draft.reason });
    const up = upstream.trim();
    const port = /^\d+$/.test(up) ? Number(up) : null;
    if (port === null && !/^https:\/\/\S+$/.test(up)) return setError({ field: "upstream", message: "Give a dev server's port, such as 5173, or a deployment's https URL" });
    if (port !== null && (port < 1 || port > 65535)) return setError({ field: "upstream", message: `${up} is not a port: use 1 to 65535` });
    setError(null);
    setBusy(true);
    later(() => {
      setBusy(false);
      setToast({ tone: "success", title: `Added ${n}`, description: `Opens at ${short(draft.url)}` });
      onAdd?.({ name: n, version: v || null, upstream: up, url: draft.url });
      setName("");
      setVersion("");
      setUpstream("");
    }, delayMs);
  }

  const fieldLabel = "text-[11px] font-medium text-ink-dim";
  const input = "h-8 w-full min-w-0 rounded-[8px]! border border-hair bg-s1 px-2.5 font-mono text-[12px] text-ink placeholder:text-ink-faint transition-colors hover:border-hair-strong focus:border-white/30 aria-invalid:border-red/60 disabled:opacity-50";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <form noValidate onSubmit={submit} className="flex flex-col gap-3 rounded-[16px] border border-hair bg-s2 px-4 py-3.5" aria-labelledby={`${uid}-title`}>
        <h4 id={`${uid}-title`} className="text-[13.5px] font-semibold text-ink">
          Add an app
        </h4>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex w-40 max-w-full flex-col gap-1">
            <span className={fieldLabel}>Name</span>
            <input
              className={input}
              placeholder="docs"
              spellCheck={false}
              autoComplete="off"
              value={name}
              disabled={busy}
              aria-invalid={error?.field === "name" || undefined}
              aria-describedby={`${uid}-help`}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
            />
          </label>
          <label className="flex w-28 flex-col gap-1">
            <span className={fieldLabel}>Version</span>
            <input
              className={input}
              placeholder="main"
              spellCheck={false}
              autoComplete="off"
              value={version}
              disabled={busy}
              aria-invalid={error?.field === "version" || undefined}
              aria-describedby={`${uid}-help`}
              onChange={(e) => {
                setVersion(e.target.value);
                setError(null);
              }}
            />
          </label>
          <label className="flex min-w-40 flex-1 flex-col gap-1">
            <span className={fieldLabel}>Port or URL</span>
            <input
              className={input}
              placeholder="5173"
              spellCheck={false}
              autoComplete="off"
              value={upstream}
              disabled={busy}
              aria-invalid={error?.field === "upstream" || undefined}
              aria-describedby={`${uid}-help`}
              onChange={(e) => {
                setUpstream(e.target.value);
                setError(null);
              }}
            />
          </label>
          <Button type="submit" size="sm" variant="secondary" disabled={!name.trim() || !upstream.trim()} loading={busy} loadingLabel="Adding…" className="h-8">
            Add
          </Button>
        </div>
        <p id={`${uid}-help`} role={error ? "alert" : undefined} className={cn("text-[12px] leading-snug", error ? "text-[#ff7a70]" : "text-ink-faint")}>
          {error?.message ??
            (draft.ok
              ? `Opens at ${short(draft.url)}. Adding a version to an app that exists keeps its other versions.`
              : `Opens at name.localhost:${gatewayPort}. A dev server's port, or a deployment's URL.`)}
        </p>
      </form>
      {toast ? <FormToast {...toast} onDismiss={() => setToast(null)} autoHideMs={6000} /> : null}
    </div>
  );
}

/* ============================================================================ CloneProjectForm */

export type CloneProjectFormProps = {
  /** Where project folders live: "~/xo-projects". */
  projectsFolder: string;
  onClone?: (url: string, folder: string) => void;
  onCancel?: () => void;
  delayMs?: number;
  /** Simulated result: a clean clone, or one with a warning notice. */
  outcome?: "ok" | "warning";
  defaultUrl?: string;
  className?: string;
};

const GIT_URL = /^(https:\/\/\S+?(\.git)?|git@[\w.-]+:[\w./-]+?(\.git)?)$/;
const FOLDER = /^[A-Za-z0-9._-]+$/;
const folderFromUrl = (url: string) =>
  url
    .trim()
    .replace(/\/+$/, "")
    .split(/[/:]/)
    .pop()
    ?.replace(/\.git$/, "") ?? "";

/** "Add a project": clone a repository into the projects folder. */
export function CloneProjectForm({ projectsFolder, onClone, onCancel, delayMs = 1600, outcome = "ok", defaultUrl = "", className }: CloneProjectFormProps) {
  const uid = useId();
  const later = useTimers();
  const [url, setUrl] = useState(defaultUrl);
  const [folder, setFolder] = useState(folderFromUrl(defaultUrl));
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; folder?: string }>({});
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<NonNullable<Toast>[]>([]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!GIT_URL.test(url.trim())) next.url = "Enter a Git repository URL.";
    if (!FOLDER.test(folder.trim())) next.folder = "Use letters, numbers, hyphens, underscores or dots for the folder name.";
    setErrors(next);
    if (next.url || next.folder) {
      document.getElementById(`${uid}-${next.url ? "url" : "folder"}`)?.focus();
      return;
    }
    setBusy(true);
    setToasts([]);
    later(() => {
      setBusy(false);
      const done: NonNullable<Toast>[] = [{ tone: "success", title: "Project cloned", description: `${folder.trim()} is in ${projectsFolder}/${folder.trim()}.` }];
      if (outcome === "warning") done.push({ tone: "warn", title: "Cloned with a notice", description: "Git LFS files were skipped. Run git lfs pull in the project folder." });
      setToasts(done);
      onClone?.(url.trim(), folder.trim());
    }, delayMs);
  }

  function reset() {
    setUrl("");
    setFolder("");
    setTouched(false);
    setErrors({});
    onCancel?.();
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <form noValidate onSubmit={submit} aria-labelledby={`${uid}-title`} aria-busy={busy || undefined} className="@container flex flex-col gap-4 rounded-[12px] border border-hair-soft bg-black/60 p-5">
        <div>
          <h4 id={`${uid}-title`} className="text-[14px] font-semibold text-ink">
            Add a project
          </h4>
          <p className="mt-0.5 text-[12.5px] text-ink-dim">Clones into {projectsFolder}. The folder name is taken from the URL until you change it.</p>
        </div>
        <div className="grid gap-4 @lg:grid-cols-2">
          <Field id={`${uid}-url`} label="Repository URL" error={errors.url}>
            <Input
              mono
              placeholder="https://github.com/owner/project.git"
              value={url}
              disabled={busy}
              onChange={(e) => {
                setUrl(e.target.value);
                if (!touched) setFolder(folderFromUrl(e.target.value));
              }}
            />
          </Field>
          <Field id={`${uid}-folder`} label="Folder name" error={errors.folder} hint={folder ? `${projectsFolder}/${folder}` : undefined}>
            <Input
              mono
              placeholder="project"
              value={folder}
              disabled={busy}
              onChange={(e) => {
                setFolder(e.target.value);
                setTouched(e.target.value !== "");
              }}
            />
          </Field>
        </div>
        {busy ? <ProgressBar indeterminate label="Cloning…" size="xs" tone="blu" /> : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" size="sm" loading={busy} loadingLabel="Cloning…">
            Clone project
          </Button>
          <Button variant="subtle" size="sm" disabled={busy} onClick={reset}>
            Cancel
          </Button>
        </div>
      </form>
      {toasts.map((t, i) => (
        <FormToast key={i} {...t} onDismiss={() => setToasts((all) => all.filter((x) => x !== t))} />
      ))}
    </div>
  );
}

/* ============================================================================ ProviderChannelBuilder */

export type BuilderField = { key: string; label: string; placeholder: string; help?: ReactNode };
export type BuilderOption = { id: string; label: string; icon?: ReactNode; fields: BuilderField[]; note?: ReactNode };

export type ProviderChannelBuilderProps = {
  label: ReactNode;
  hint?: ReactNode;
  options: BuilderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
};

/** "AI provider: [+ Add Anthropic] [+ Add OpenAI]": each choice expands into its key fields. */
export function ProviderChannelBuilder({ label, hint, options, value, defaultValue = [], onChange, error, disabled, className }: ProviderChannelBuilderProps) {
  const uid = useId();
  const [inner, setInner] = useState(defaultValue);
  const added = value ?? inner;
  const set = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const remaining = options.filter((o) => !added.includes(o.id));

  return (
    <div role="group" aria-labelledby={`${uid}-label`} aria-describedby={error ? `${uid}-error` : undefined} className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <div>
        <p id={`${uid}-label`} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
          {label}
        </p>
        {hint ? <p className="mt-1 text-[12px] text-ink-faint">{hint}</p> : null}
      </div>
      {options
        .filter((o) => added.includes(o.id))
        .map((o) => (
          <div key={o.id} className="rise flex flex-col gap-3 rounded-[12px] border border-hair bg-s1 p-3">
            <div className="flex items-center gap-2">
              {o.icon ? <span aria-hidden="true" className="inline-flex">{o.icon}</span> : null}
              <span className="text-[13px] font-medium text-ink">{o.label}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${o.label}`}
                onClick={() => set(added.filter((x) => x !== o.id))}
                className="ml-auto inline-flex size-7 items-center justify-center rounded-[7px]! text-ink-faint transition-colors hover:bg-red/10 hover:text-red disabled:opacity-40"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>
            {o.note ? <p className="text-[12px] leading-snug text-ink-dim">{o.note}</p> : null}
            {o.fields.map((f) => (
              <Field key={f.key} id={`${uid}-${o.id}-${f.key}`} label={f.label} hint={f.help}>
                <SecretInput placeholder={f.placeholder} disabled={disabled} noun={f.label.toLowerCase()} />
              </Field>
            ))}
          </div>
        ))}
      {remaining.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {remaining.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => set([...added, o.id])}
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px]! border border-dashed border-hair-strong px-2.5 text-[12.5px] text-ink-dim transition-colors hover:border-white/35 hover:bg-s2 hover:text-ink disabled:opacity-40"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              {o.icon ? <span aria-hidden="true" className="inline-flex">{o.icon}</span> : null}
              Add {o.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? (
        <p id={`${uid}-error`} role="alert" className="flex items-center gap-1.5 text-[12px] text-[#ff7a70]">
          <CircleAlert aria-hidden="true" className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ============================================================================ CreateSpaceForm */

export type CreateSpaceFormProps = {
  runtimes: { value: string; label: string }[];
  providers: BuilderOption[];
  channels: BuilderOption[];
  existingNames?: string[];
  defaultName?: string;
  /** Builder choices already added (expanded) on first render. */
  defaultProviders?: string[];
  defaultChannels?: string[];
  onCreate?: (space: { name: string; runtime: string; providers: string[]; channels: string[]; volumeGb: number }) => void;
  delayMs?: number;
  className?: string;
};

const RESERVED = ["new", "create"];

export function validateSpaceName(raw: string, existing: string[] = []): string | null {
  const name = raw.trim();
  if (!name) return "Give the space a name.";
  if (name.length > 32) return "Space name must be 32 characters or less.";
  if (RESERVED.includes(name.toLowerCase())) return "Space name cannot be 'new' or 'create'.";
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(name)) return "Use lowercase letters, digits and dashes, starting and ending with a letter or digit.";
  if (existing.includes(name)) return `A space named ${name} already exists.`;
  return null;
}

/** Create a hosted space: name, runtime, at least one AI provider, optional channel, volume. */
export function CreateSpaceForm({
  runtimes,
  providers,
  channels,
  existingNames = [],
  defaultName = "",
  defaultProviders = [],
  defaultChannels = [],
  onCreate,
  delayMs = 1200,
  className,
}: CreateSpaceFormProps) {
  const uid = useId();
  const later = useTimers();
  const [name, setName] = useState(defaultName);
  const [runtime, setRuntime] = useState(runtimes[0]?.value ?? "");
  const [prov, setProv] = useState<string[]>(defaultProviders);
  const [chan, setChan] = useState<string[]>(defaultChannels);
  const [volume, setVolume] = useState(4);
  const [errors, setErrors] = useState<{ name?: string; providers?: string }>({});
  const [phase, setPhase] = useState<"idle" | "creating" | "started" | "done">("idle");
  const busy = phase === "creating";

  function submit(e: FormEvent) {
    e.preventDefault();
    const next = { name: validateSpaceName(name, existingNames) ?? undefined, providers: prov.length ? undefined : "Add at least one AI provider." };
    setErrors(next);
    if (next.name || next.providers) {
      if (next.name) document.getElementById(`${uid}-name`)?.focus();
      return;
    }
    setPhase("creating");
    later(() => setPhase("started"), delayMs);
    later(() => {
      setPhase("done");
      onCreate?.({ name: name.trim(), runtime, providers: prov, channels: chan, volumeGb: volume });
    }, delayMs * 3);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <form noValidate onSubmit={submit} aria-labelledby={`${uid}-title`} aria-busy={busy || undefined} className="flex flex-col gap-5 rounded-[14px] border border-hair bg-s2 p-5">
        <div>
          <h4 id={`${uid}-title`} className="text-[15px] font-semibold text-ink">
            Create a space
          </h4>
          <p className="mt-0.5 text-[12.5px] text-ink-dim">A hosted space XO Swarm launches and manages.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${uid}-name`} label="Space name" error={errors.name} hint="32 characters or fewer." required>
            <Input mono placeholder="ops-copilot" value={name} disabled={busy} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field id={`${uid}-runtime`} label="Runtime">
            <Select value={runtime} disabled={busy} onChange={(e) => setRuntime(e.target.value)}>
              {runtimes.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <ProviderChannelBuilder
          label="AI provider"
          hint="Keys stay in the space. Placeholders only in this demo."
          options={providers}
          value={prov}
          onChange={(ids) => {
            setProv(ids);
            if (ids.length) setErrors((x) => ({ ...x, providers: undefined }));
          }}
          error={errors.providers}
          disabled={busy}
        />
        <ProviderChannelBuilder label="Notification channel" hint="Optional. Where the agent sends updates." options={channels} value={chan} onChange={setChan} disabled={busy} />
        <Field id={`${uid}-volume`} label="Volume size (GB)" hint="2 to 20 GB.">
          <NumberStepper min={2} max={20} value={volume} onChange={setVolume} unit="GB" noun="volume size" disabled={busy} />
        </Field>
        <div className="flex flex-wrap items-center gap-3 border-t border-hair-soft pt-4">
          <Button type="submit" variant="primary" size="sm" loading={busy} loadingLabel="Creating…">
            Create space
          </Button>
          {phase === "started" ? <StateChip kind="space" state="starting" /> : phase === "done" ? <StateChip kind="space" state="running" /> : busy ? <StateChip kind="space" state="creating" /> : null}
        </div>
      </form>
      {phase === "started" ? <FormToast tone="info" title="Space setup started" description={`${name.trim()} is starting. This takes about a minute.`} /> : null}
      {phase === "done" ? (
        <FormToast tone="success" title="Space setup completed" description={`${name.trim()} is running with ${volume} GB of storage.`} onDismiss={() => setPhase("idle")} />
      ) : null}
    </div>
  );
}

/* ============================================================================ TemplateDeployForm */

export type TemplateDeployFormProps = {
  template: { name: string; description: string; icon?: ReactNode };
  sizes: RadioCardOption<string>[];
  defaultName: string;
  /** Host pattern for the result, such as "{name}.spaces.example.com". */
  hostPattern: string;
  existingNames?: string[];
  onDeploy?: (r: { name: string; size: string; persistent: boolean; storageGb: number }) => void;
  delayMs?: number;
  /** Size cards per row from the sm breakpoint. */
  sizeColumns?: 1 | 2 | 3;
  /** Extra copyable values on the result panel, after the address (a sign-in email, an admin user). */
  resultFields?: { label: string; value: string }[];
  className?: string;
};

/** Deploy a template as a new space, then hand back copyable results. */
export function TemplateDeployForm({
  template,
  sizes,
  defaultName,
  hostPattern,
  existingNames = [],
  onDeploy,
  delayMs = 1400,
  sizeColumns = 1,
  resultFields = [],
  className,
}: TemplateDeployFormProps) {
  const uid = useId();
  const later = useTimers();
  const [name, setName] = useState(defaultName);
  const [size, setSize] = useState(sizes[0]?.value ?? "small");
  const [persistent, setPersistent] = useState(true);
  const [storage, setStorage] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "deploying" | "ready">("idle");
  const busy = phase === "deploying";
  const host = hostPattern.replace("{name}", name.trim());

  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateSpaceName(name, existingNames);
    setError(problem);
    if (problem) return;
    setPhase("deploying");
    later(() => {
      setPhase("ready");
      onDeploy?.({ name: name.trim(), size, persistent, storageGb: storage });
    }, delayMs);
  }

  if (phase === "ready") {
    return (
      <div role="status" className={cn("rise flex flex-col gap-4 rounded-[14px] border border-grn/25 bg-s2 p-5", className)}>
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-grn/12 text-grn">
            <CircleCheck aria-hidden="true" className="size-[18px]" />
          </span>
          <div>
            <h4 className="text-[15px] font-semibold text-ink">Deployment ready</h4>
            <p className="mt-0.5 text-[12.5px] text-ink-dim">
              {template.name} is running in <span className="font-mono text-ink">{name.trim()}</span>. Copy what you need now.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Address</span>
          <CopyField value={`https://${host}`} label="Space address" />
          {resultFields.map((f) => (
            <Fragment key={f.label}>
              <span className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{f.label}</span>
              <CopyField value={f.value} label={f.label} />
            </Fragment>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" trailingIcon={<ArrowUpRight aria-hidden="true" />}>
            Open space
          </Button>
          <Button variant="subtle" size="sm" onClick={() => setPhase("idle")}>
            Deploy another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby={`${uid}-title`} aria-busy={busy || undefined} className={cn("flex flex-col gap-5 rounded-[14px] border border-hair bg-s2 p-5", className)}>
      <div className="flex items-start gap-3">
        {template.icon ? <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-hair bg-s3">{template.icon}</span> : null}
        <div>
          <h4 id={`${uid}-title`} className="text-[15px] font-semibold text-ink">
            Deploy {template.name}
          </h4>
          <p className="mt-0.5 text-[12.5px] text-ink-dim">{template.description}</p>
        </div>
      </div>
      <Field id={`${uid}-name`} label="Space name" error={error ?? undefined} hint={name.trim() ? `Opens at ${host}` : undefined}>
        <Input mono value={name} disabled={busy} onChange={(e) => setName(e.target.value)} />
      </Field>
      <RadioCardGroup name={`${uid}-size`} legend="Instance size" options={sizes.map((s) => ({ ...s, disabled: s.disabled || busy }))} value={size} onChange={setSize} columns={sizeColumns} />
      <div className="flex flex-col gap-3 rounded-[12px] border border-hair-soft bg-black/30 p-3.5">
        <Switch checked={persistent} onCheckedChange={setPersistent} disabled={busy} label="Persistent storage" description="Files survive a stop and start." />
        {persistent ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[12.5px] text-ink-dim">Storage</span>
            <NumberStepper min={1} max={50} value={storage} onChange={setStorage} unit="GB" noun="storage" size="sm" disabled={busy} aria-label="Storage in GB" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-hair-soft pt-4">
        <Button type="submit" variant="primary" size="sm" loading={busy} loadingLabel="Deploying…">
          Deploy
        </Button>
        {busy ? (
          <div className="w-32">
            <ProgressBar indeterminate aria-label="Deploying" size="xs" tone="grn" />
          </div>
        ) : null}
      </div>
    </form>
  );
}

/* ============================================================================ ContactForm */

export type ContactFormProps = {
  targets: string[];
  onSend?: (msg: { name: string; email: string; company: string; target: string; message: string }) => void;
  delayMs?: number;
  /** Aside content: inbox, links, a note. */
  aside?: ReactNode;
  className?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Landing contact: required fields with inline errors, a deploy target, then Send. */
export function ContactForm({ targets, onSend, delayMs = 1100, aside, className }: ContactFormProps) {
  const uid = useId();
  const later = useTimers();
  const [vals, setVals] = useState({ name: "", email: "", company: "", target: targets[0] ?? "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const busy = phase === "sending";
  const set = (k: keyof typeof vals) => (v: string) => setVals((x) => ({ ...x, [k]: v }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!vals.name.trim()) next.name = "Add your name.";
    if (!EMAIL.test(vals.email.trim())) next.email = "Add a work email, such as ada@example.com.";
    if (!vals.message.trim()) next.message = "Tell us what you are trying to do.";
    setErrors(next);
    const first = (["name", "email", "message"] as const).find((k) => next[k]);
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setPhase("sending");
    later(() => {
      setPhase("sent");
      onSend?.(vals);
    }, delayMs);
  }

  return (
    <div className={cn("grid gap-8 lg:grid-cols-3", className)}>
      <FormStyles />
      <div className="lg:col-span-2">
        {phase === "sent" ? (
          <div role="status" className="rise flex min-h-[320px] flex-col items-start justify-center gap-3 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-7">
            <CircleCheck aria-hidden="true" className="size-6 text-grn" />
            <p className="text-[20px] font-semibold tracking-[-0.01em] text-ink">Message sent</p>
            <p className="max-w-[46ch] text-[14px] text-ink-dim">
              Thanks, {vals.name.trim().split(" ")[0]}. We reply within one business day at <span className="font-mono text-ink">{vals.email.trim()}</span>.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>
              Send another
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} aria-label="Contact" aria-busy={busy || undefined} className="flex flex-col gap-5 rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3vw,28px)]">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${uid}-name`} label="Name" error={errors.name} required>
                <Input size="lg" autoComplete="name" value={vals.name} disabled={busy} onChange={(e) => set("name")(e.target.value)} />
              </Field>
              <Field id={`${uid}-email`} label="Work email" error={errors.email} required>
                <Input size="lg" type="email" autoComplete="email" value={vals.email} disabled={busy} onChange={(e) => set("email")(e.target.value)} />
              </Field>
            </div>
            <Field id={`${uid}-company`} label="Company" aside="Optional">
              <Input size="lg" autoComplete="organization" value={vals.company} disabled={busy} onChange={(e) => set("company")(e.target.value)} />
            </Field>
            <fieldset className="min-w-0">
              <legend className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">Where it needs to run</legend>
              <div className="flex flex-wrap gap-2">
                {targets.map((t) => (
                  <label
                    key={t}
                    className={cn(
                      "fi-ring-any inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-[13px] transition-colors",
                      vals.target === t ? "border-ink bg-ink font-medium text-black" : "border-hair-strong text-ink-dim hover:border-white/40 hover:text-ink",
                    )}
                  >
                    <input type="radio" name={`${uid}-target`} value={t} checked={vals.target === t} disabled={busy} onChange={() => set("target")(t)} className="sr-only" />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field id={`${uid}-message`} label="What are you trying to do?" error={errors.message} required>
              <Textarea rows={4} value={vals.message} disabled={busy} onChange={(e) => set("message")(e.target.value)} />
            </Field>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" variant="primary" size="lg" loading={busy} loadingLabel="Sending…">
                Send
              </Button>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">We reply within one business day</span>
            </div>
          </form>
        )}
      </div>
      {aside ? <aside className="flex flex-col gap-4 text-[13.5px] leading-relaxed text-ink-dim">{aside}</aside> : null}
    </div>
  );
}
