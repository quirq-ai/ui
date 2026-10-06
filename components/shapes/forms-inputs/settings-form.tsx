"use client";

// Settings forms with a live preview: SettingsCard (head, italic status, body, Save and
// Reset), BrandingEditor (name and logo, previewed as the space header while you type),
// ThemePicker (named themes with three swatches each, a description and a mini dashboard
// preview) and PathSettingsForm (folder paths with In use or Pending restart badges, an
// error box and the command that applies them).
import { useId, useState, type ReactNode } from "react";
import { CircleAlert, ImageUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyField } from "@/components/ui/copy-button";
import { Field, Input, Select } from "@/components/ui/field";
import { XOMark } from "@/components/ui/runtime-logo";
import { formatBytes } from "@/lib/format";
import { useTimers } from "./_timers";
import { FormStyles } from "./_styles";

/* ============================================================================ SettingsCard */

/** "saved" means no unsaved edits: the xo-space cards read Saved whenever they are clean. */
export type SettingsStatus = "loading" | "dirty" | "saving" | "saved" | "error";

const statusText: Record<SettingsStatus, string> = {
  loading: "Loading…",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Could not save",
};
const statusCls: Record<SettingsStatus, string> = {
  loading: "text-ink-faint",
  dirty: "text-org",
  saving: "text-ink-dim",
  saved: "text-grn",
  error: "text-[#ff7a70]",
};

export type SettingsCardProps = {
  title: ReactNode;
  description?: ReactNode;
  status: SettingsStatus;
  /** Override the status words, e.g. "Pending restart". */
  statusLabel?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Settings card: head with an italic status, then fields, then actions. */
export function SettingsCard({ title, description, status, statusLabel, children, footer, className }: SettingsCardProps) {
  const uid = useId();
  return (
    <section aria-labelledby={`${uid}-t`} className={cn("flex min-w-0 flex-col rounded-[14px] border border-hair bg-s2", className)}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hair-soft px-5 py-3.5">
        <div className="min-w-0">
          <h4 id={`${uid}-t`} className="text-[14px] font-semibold text-ink">
            {title}
          </h4>
          {description ? <p className="mt-0.5 text-[12px] text-ink-dim">{description}</p> : null}
        </div>
        <p role="status" className={cn("text-[12px] italic", statusCls[status])}>
          {statusLabel ?? statusText[status]}
        </p>
      </header>
      <div className="@container flex flex-col gap-5 p-5">{children}</div>
      {footer ? <footer className="flex flex-wrap items-center gap-2 border-t border-hair-soft px-5 py-3.5">{footer}</footer> : null}
    </section>
  );
}

/* ============================================================================ BrandingEditor */

export type BrandLogo = { name: string; size: number; initials: string; color: string };

export type BrandingEditorProps = {
  defaultName: string;
  /** null shows the XO mark. */
  defaultLogo?: BrandLogo | null;
  /** What Reset to defaults returns to. */
  factoryName?: string;
  /** Start with these unsaved edits applied, to show the dirty state. */
  draftName?: string;
  onSave?: (b: { name: string; logo: BrandLogo | null }) => void;
  maxLogoBytes?: number;
  className?: string;
};

function LogoTile({ logo, size = 40 }: { logo: BrandLogo | null; size?: number }) {
  if (!logo) {
    return (
      <span className="inline-flex shrink-0 items-center justify-center rounded-[10px] border border-hair bg-black" style={{ width: size, height: size }}>
        <XOMark height={Math.round(size * 0.32)} title={null} />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-[10px] font-mono text-[13px] font-semibold text-black"
      style={{ width: size, height: size, background: logo.color }}
    >
      {logo.initials}
    </span>
  );
}

/** Space name and logo, previewed as the header while you type. */
export function BrandingEditor({
  defaultName,
  defaultLogo = null,
  factoryName = "Research lab",
  draftName,
  onSave,
  maxLogoBytes = 512 * 1024,
  className,
}: BrandingEditorProps) {
  const uid = useId();
  const later = useTimers();
  const [saved, setSaved] = useState({ name: defaultName, logo: defaultLogo });
  const [name, setName] = useState(draftName ?? defaultName);
  const [logo, setLogo] = useState<BrandLogo | null>(defaultLogo);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "saving">("idle");

  const dirty = name !== saved.name || logo?.name !== saved.logo?.name;
  const status: SettingsStatus = phase === "saving" ? "saving" : dirty ? "dirty" : "saved";

  function save() {
    setPhase("saving");
    later(() => {
      setSaved({ name, logo });
      setPhase("idle");
      onSave?.({ name, logo });
    }, 800);
  }

  return (
    <SettingsCard
      title="Branding"
      description="Shown in the space header and on shared links."
      status={status}
      className={className}
      footer={
        <>
          <Button variant="primary" size="sm" disabled={!dirty || !name.trim()} loading={phase === "saving"} loadingLabel="Saving…" onClick={save}>
            Save branding
          </Button>
          <Button
            variant="subtle"
            size="sm"
            leadingIcon={<RotateCcw aria-hidden="true" />}
            disabled={phase === "saving" || (name === factoryName && !logo)}
            onClick={() => {
              setName(factoryName);
              setLogo(null);
              setFileError(null);
            }}
          >
            Reset to defaults
          </Button>
        </>
      }
    >
      <FormStyles />
      <div className="grid gap-6 @lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <Field id={`${uid}-name`} label="Space name" hint="Up to 40 characters." required>
            <Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} disabled={phase === "saving"} />
          </Field>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span id={`${uid}-logo-label`} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
              Space logo
            </span>
            <div className="flex min-w-0 items-center gap-2.5">
              <label className="fi-ring-any inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] border border-hair bg-s3 px-2.5 text-[12.5px] text-ink transition-colors hover:border-hair-strong hover:bg-s4">
                <ImageUp aria-hidden="true" className="size-3.5" />
                Choose file
                <input
                  type="file"
                  accept="image/png,image/svg+xml"
                  className="sr-only"
                  aria-labelledby={`${uid}-logo-label`}
                  aria-describedby={`${uid}-logo-hint`}
                  disabled={phase === "saving"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    if (f.size > maxLogoBytes) {
                      setFileError(`Logo must be ${formatBytes(maxLogoBytes)} or smaller.`);
                      return;
                    }
                    setFileError(null);
                    const stem = f.name.replace(/\.[^.]+$/, "");
                    setLogo({ name: f.name, size: f.size, initials: stem.slice(0, 2).toUpperCase(), color: "var(--cyn)" });
                  }}
                />
              </label>
              <span className="min-w-0 truncate font-mono text-[12px] text-ink-dim">{logo ? `${logo.name} · ${formatBytes(logo.size)}` : "No file · XO mark"}</span>
            </div>
            {fileError ? (
              <p id={`${uid}-logo-hint`} role="alert" className="flex items-center gap-1.5 text-[12px] text-[#ff7a70]">
                <CircleAlert aria-hidden="true" className="size-3.5" />
                {fileError}
              </p>
            ) : (
              <p id={`${uid}-logo-hint`} className="text-[12px] text-ink-faint">
                PNG or SVG, square, up to {formatBytes(maxLogoBytes)}.
              </p>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Preview</span>
          <div className="flex min-w-0 items-center gap-3 rounded-[10px] border border-hair-soft bg-black p-[18px]">
            <LogoTile logo={logo} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{name.trim() || "Untitled space"}</p>
              <p className="text-[12px] text-ink-faint">Your space header</p>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ============================================================================ ThemePicker */

export type ThemeOption = {
  id: string;
  label: string;
  /** Accent, neutral, secondary. */
  swatches: [string, string, string];
  description: string;
  /** Preview ground and text. */
  ground: string;
  ink: string;
  light?: boolean;
};

export type ThemePickerProps = {
  themes: ThemeOption[];
  /** Saved theme id. */
  savedId: string;
  /** Start on a different, unsaved choice. */
  draftId?: string;
  onSave?: (id: string) => void;
  className?: string;
};

function Swatches({ colors }: { colors: [string, string, string] }) {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      {colors.map((c, i) => (
        <span key={i} className="size-3.5 rounded-full shadow-[inset_0_0_0_1px_#ffffff20]" style={{ background: c }} />
      ))}
    </span>
  );
}

/** Pick a theme: select, swatches, description and a live preview. */
export function ThemePicker({ themes, savedId, draftId, onSave, className }: ThemePickerProps) {
  const uid = useId();
  const later = useTimers();
  const [saved, setSaved] = useState(savedId);
  const [current, setCurrent] = useState(draftId ?? savedId);
  const [phase, setPhase] = useState<"idle" | "saving">("idle");
  const theme = themes.find((t) => t.id === current) ?? themes[0];
  const dirty = current !== saved;
  const status: SettingsStatus = phase === "saving" ? "saving" : dirty ? "dirty" : "saved";
  const [accent, neutral, secondary] = theme.swatches;

  return (
    <SettingsCard
      title="Space theme"
      description="Colors for the Space dashboard on this machine."
      status={status}
      className={className}
      footer={
        <>
          <Button
            variant="primary"
            size="sm"
            disabled={!dirty}
            loading={phase === "saving"}
            loadingLabel="Saving…"
            onClick={() => {
              setPhase("saving");
              later(() => {
                setSaved(current);
                setPhase("idle");
                onSave?.(current);
              }, 700);
            }}
          >
            Save theme
          </Button>
          <Button variant="subtle" size="sm" disabled={!dirty || phase === "saving"} onClick={() => setCurrent(saved)}>
            Revert
          </Button>
        </>
      }
    >
      <div className="grid gap-6 @lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <Field id={`${uid}-theme`} label="Theme">
            <Select value={current} onChange={(e) => setCurrent(e.target.value)} disabled={phase === "saving"}>
              {themes.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                  {i === 0 ? " · default" : t.light ? " · light" : ""}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-start gap-3">
            <Swatches colors={theme.swatches} />
            <p className="text-[12.5px] leading-snug text-ink-dim">{theme.description}</p>
          </div>
          <ul className="mt-1 grid grid-cols-5 gap-1.5" aria-label="All themes">
            {themes.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-pressed={t.id === current}
                  aria-label={t.label}
                  title={t.label}
                  onClick={() => setCurrent(t.id)}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-[8px]! border transition-colors",
                    t.id === current ? "border-white/45" : "border-hair hover:border-hair-strong",
                  )}
                  style={{ background: t.ground }}
                >
                  <span className="size-2.5 rounded-full" style={{ background: t.swatches[0] }} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Preview</span>
          <div
            aria-label={`${theme.label} preview`}
            role="img"
            className="flex h-[148px] overflow-hidden rounded-[10px] border border-hair-soft transition-colors duration-300"
            style={{ background: theme.ground, color: theme.ink }}
          >
            <div className="flex w-[30%] flex-col gap-1.5 border-r p-2.5" style={{ borderColor: `${neutral}33` }}>
              <span className="h-1.5 w-8 rounded-full" style={{ background: accent }} />
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-1.5 rounded-full" style={{ background: i === 1 ? `${accent}aa` : `${neutral}40`, width: `${70 - i * 9}%` }} />
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              <span className="text-[11px] font-semibold" style={{ color: theme.ink }}>
                research-lab
              </span>
              <div className="flex gap-1.5">
                <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: accent, color: theme.light ? "#fffefa" : "#0b0b0b" }}>
                  Running
                </span>
                <span className="rounded-full border px-2 py-0.5 text-[9px]" style={{ borderColor: `${secondary}80`, color: secondary }}>
                  3 sessions
                </span>
              </div>
              <div className="mt-auto flex items-end gap-1">
                {[38, 52, 30, 64, 46, 70, 58].map((h, i) => (
                  <span key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h * 0.55}px`, background: i === 5 ? accent : `${secondary}66` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ============================================================================ PathSettingsForm */

export type PathSetting = { id: string; label: string; value: string; hint: ReactNode; placeholder?: string };

export type PathSettingsFormProps = {
  paths: PathSetting[];
  /** local: restart the server here; managed: the container restarts from XO Swarm. */
  mode: "local" | "managed";
  /** Shell command that applies saved paths (local mode). */
  applyCommand: string;
  /** Start with these edits applied (id to value). */
  draft?: Record<string, string>;
  /** Start in the Pending restart state. */
  pendingRestart?: boolean;
  /** Check the starting values right away, to show the error box. */
  validateOnMount?: boolean;
  className?: string;
};

const ABS = /^(~\/|\/)[^\0]*$/;

function checkPaths(paths: PathSetting[], vals: Record<string, string>): string | null {
  const bad = paths.find((p) => !ABS.test((vals[p.id] ?? "").trim()));
  return bad ? `${bad.label} needs a full path, such as ~/xo-projects or /Users/ada/xo-projects.` : null;
}

/** Folder settings. Saving marks them Pending restart until the space restarts. */
export function PathSettingsForm({ paths, mode, applyCommand, draft, pendingRestart = false, validateOnMount = false, className }: PathSettingsFormProps) {
  const uid = useId();
  const later = useTimers();
  const [inUse, setInUse] = useState(() => Object.fromEntries(paths.map((p) => [p.id, p.value])) as Record<string, string>);
  // Pending restart: the edits are already saved but the running space still uses the old paths.
  const [saved, setSaved] = useState<Record<string, string>>(() => (pendingRestart ? { ...inUse, ...draft } : inUse));
  const [vals, setVals] = useState<Record<string, string>>(() => ({ ...inUse, ...draft }));
  const [pending, setPending] = useState(pendingRestart);
  const [error, setError] = useState<string | null>(() => (validateOnMount ? checkPaths(paths, { ...inUse, ...draft }) : null));
  const [phase, setPhase] = useState<"idle" | "saving" | "restarting">("idle");
  const dirty = paths.some((p) => vals[p.id] !== saved[p.id]);

  function save() {
    const problem = checkPaths(paths, vals);
    setError(problem);
    if (problem) return;
    setPhase("saving");
    later(() => {
      setSaved({ ...vals });
      setPending(true);
      setPhase("idle");
    }, 700);
  }

  function restart() {
    setPhase("restarting");
    later(() => {
      setInUse({ ...saved });
      setPending(false);
      setPhase("idle");
    }, 1400);
  }

  const status: SettingsStatus = phase === "saving" ? "saving" : dirty ? "dirty" : "saved";

  return (
    <SettingsCard
      title="Folders"
      description={mode === "local" ? "Where this space keeps projects and its own data." : "Paths inside the hosted space's container."}
      status={status}
      statusLabel={phase === "restarting" ? "Restarting…" : !dirty && pending ? "Saved · pending restart" : undefined}
      className={className}
      footer={
        <>
          <Button variant="primary" size="sm" disabled={!dirty} loading={phase === "saving"} loadingLabel="Saving…" onClick={save}>
            Save folders
          </Button>
          <Button variant="subtle" size="sm" disabled={!dirty || phase !== "idle"} onClick={() => setVals({ ...saved })}>
            Discard
          </Button>
        </>
      }
    >
      {paths.map((p) => {
        const isPending = pending && saved[p.id] !== inUse[p.id];
        return (
          <Field
            key={p.id}
            id={`${uid}-${p.id}`}
            label={p.label}
            hint={p.hint}
            aside={isPending ? <Badge tone="org" size="sm" dot>Pending restart</Badge> : <Badge tone="grn" size="sm" dot>In use</Badge>}
          >
            <Input mono placeholder={p.placeholder} value={vals[p.id]} disabled={phase !== "idle"} onChange={(e) => setVals((v) => ({ ...v, [p.id]: e.target.value }))} />
          </Field>
        );
      })}
      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-[10px] border border-red/30 bg-red/[0.07] px-3 py-2.5 text-[12.5px] text-[#ff9a92]">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </div>
      ) : null}
      {pending ? (
        <div className="flex flex-col gap-2.5 rounded-[10px] border border-org/25 bg-org/[0.06] p-3">
          {mode === "local" ? (
            <>
              <p className="text-[12.5px] text-ink-dim">Restart the server to apply. Or run this in a terminal:</p>
              <CopyField value={applyCommand} prompt="$" label="Apply command" />
              <div>
                <Button size="sm" loading={phase === "restarting"} loadingLabel="Restarting…" onClick={restart}>
                  Apply and restart
                </Button>
              </div>
            </>
          ) : (
            <p className="text-[12.5px] text-ink-dim">Applies when the space restarts. Stop and start it from XO Swarm; files stay on disk.</p>
          )}
        </div>
      ) : null}
    </SettingsCard>
  );
}
