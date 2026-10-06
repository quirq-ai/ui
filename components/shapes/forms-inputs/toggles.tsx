"use client";

// Switches, checkboxes and radio cards: SwitchRow (a settings row whose save can be async;
// the thumb spins while it saves), SettingsList (hairline-divided rows on a panel),
// SourceCheckboxGroup (session sources as checkable chips; offline sources are muted with a
// reason; none selected shows an empty note), RadioCardGroup (native radios as cards with an
// icon, title and description; arrow keys move) and OnOffToggle (the compact HUD toggle with
// an ON or OFF readout).
import { useId, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { FormStyles } from "./_styles";

/* ----------------------------------------------------------------------------- SwitchRow */

export type SwitchRowProps = {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  /** Return a promise to show the busy thumb until the save settles. */
  onCheckedChange?: (next: boolean) => void | Promise<void>;
  /** Force the busy look (a save already in flight). */
  busy?: boolean;
  disabled?: boolean;
  /** Short note under the description while saving or after an error. */
  status?: ReactNode;
  className?: string;
};

/** Settings row with immediate effect. */
export function SwitchRow({ label, description, checked, defaultChecked = false, onCheckedChange, busy = false, disabled, status, className }: SwitchRowProps) {
  const [inner, setInner] = useState(defaultChecked);
  const [saving, setSaving] = useState(false);
  const on = checked ?? inner;

  async function change(next: boolean) {
    if (checked === undefined) setInner(next);
    const result = onCheckedChange?.(next);
    if (result && typeof (result as Promise<void>).then === "function") {
      setSaving(true);
      try {
        await result;
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Switch
        checked={on}
        onCheckedChange={change}
        busy={busy || saving}
        disabled={disabled}
        label={label}
        description={description}
      />
      {busy || saving || status ? (
        <p role="status" className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          {busy || saving ? "Saving…" : status}
        </p>
      ) : null}
    </div>
  );
}

/** Hairline-divided settings rows on a soft panel. */
export function SettingsList({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[14px] border border-hair bg-s1", className)}>
      <FormStyles />
      {title ? <h4 className="border-b border-hair-soft px-4 py-3 text-[13px] font-semibold text-ink">{title}</h4> : null}
      <div className="fi-rows divide-y divide-hair-soft">{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- SourceCheckboxGroup */

export type SourceOption = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** False mutes the chip and blocks it; give a reason. */
  available?: boolean;
  /** Why it cannot be picked: "Cursor is not running on this machine." */
  reason?: string;
  /** Short badge for an unavailable source. */
  badge?: string;
};

export type SourceCheckboxGroupProps = {
  legend?: string;
  sources: SourceOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  /** Shown when nothing is selected. */
  emptyMessage?: ReactNode;
  className?: string;
};

/** "SOURCES [✓] Claude Code [✓] Codex [ ] Cursor offline". */
export function SourceCheckboxGroup({
  legend = "Sources",
  sources,
  value,
  defaultValue = [],
  onChange,
  emptyMessage = "No session sources selected. Pick at least one to list sessions.",
  className,
}: SourceCheckboxGroupProps) {
  const uid = useId();
  const [inner, setInner] = useState(defaultValue);
  const selected = value ?? inner;

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    if (value === undefined) setInner(next);
    onChange?.(next);
  }

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="sr-only">{legend}</legend>
      <FormStyles />
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden="true" className="mr-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
          {legend}
        </span>
        {sources.map((s) => {
          const available = s.available !== false;
          const on = available && selected.includes(s.id);
          const tipId = `${uid}-${s.id}-tip`;
          return (
            <label
              key={s.id}
              className={cn(
                "fi-ring-any group/src relative inline-flex h-8 items-center gap-2 rounded-[8px] border py-1.5 pl-3 pr-2.5 text-[12.5px] transition-colors",
                available ? "cursor-pointer" : "cursor-not-allowed",
                on ? "border-hair-strong bg-s3 text-ink" : "border-hair bg-s1 text-ink-dim hover:border-hair-strong hover:text-ink",
                !available && "opacity-55 hover:border-hair hover:text-ink-dim",
              )}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={on}
                disabled={!available}
                aria-describedby={available ? undefined : tipId}
                onChange={() => toggle(s.id)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                  on ? "border-ink bg-ink text-black" : "border-hair-strong bg-transparent",
                )}
              >
                {on ? <Check strokeWidth={3} className="size-3" /> : null}
              </span>
              {s.icon ? <span aria-hidden="true" className={cn("inline-flex", !available && "grayscale")}>{s.icon}</span> : null}
              <span className="whitespace-nowrap">{s.label}</span>
              {!available ? (
                <Tooltip content={s.reason ?? "Unavailable"} id={tipId} describe={false} placement="top" align="end">
                  <span
                    tabIndex={0}
                    className="inline-flex h-[18px] items-center rounded-[3px] border border-hair bg-white/[0.04] px-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
                  >
                    {s.badge ?? "offline"}
                  </span>
                </Tooltip>
              ) : null}
            </label>
          );
        })}
      </div>
      {selected.filter((id) => sources.some((s) => s.id === id && s.available !== false)).length === 0 ? (
        <p role="status" className="mt-3 rounded-[10px] border border-dashed border-hair-strong px-3 py-2.5 text-[12.5px] text-ink-dim">
          {emptyMessage}
        </p>
      ) : null}
    </fieldset>
  );
}

/* ----------------------------------------------------------------------------- RadioCardGroup */

export type RadioCardOption<T extends string> = {
  value: T;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Right side note such as "Default". */
  badge?: ReactNode;
  disabled?: boolean;
};

export type RadioCardGroupProps<T extends string> = {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  options: RadioCardOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  columns?: 1 | 2 | 3;
  className?: string;
};

/** Exclusive choice where each option needs a line of explanation. Native radios, so arrow keys move. */
export function RadioCardGroup<T extends string>({
  name,
  legend,
  hint,
  options,
  value,
  defaultValue,
  onChange,
  columns = 2,
  className,
}: RadioCardGroupProps<T>) {
  const [inner, setInner] = useState<T | undefined>(defaultValue);
  const current = value ?? inner;
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-1 text-[13px] font-medium text-ink">{legend}</legend>
      <FormStyles />
      {hint ? <p className="mb-3 text-[12px] text-ink-dim">{hint}</p> : <div className="mb-2.5" />}
      <div className={cn("grid gap-2.5", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3")}>
        {options.map((o) => {
          const checked = current === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "fi-ring-any relative flex min-w-0 items-start gap-3 rounded-[12px] border p-3.5 transition-[border-color,background-color] duration-150",
                checked ? "border-white/40 bg-s2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "border-hair bg-s1 hover:border-hair-strong",
                o.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                disabled={o.disabled}
                onChange={() => {
                  if (value === undefined) setInner(o.value);
                  onChange?.(o.value);
                }}
                className="sr-only"
              />
              {o.icon ? (
                <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-hair bg-s3">
                  {o.icon}
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium leading-5 text-ink">
                  {o.title}
                  {o.badge}
                </span>
                {o.description ? <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">{o.description}</span> : null}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  checked ? "border-ink bg-ink" : "border-hair-strong",
                )}
              >
                {checked ? <span className="size-1.5 rounded-full bg-black" /> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ----------------------------------------------------------------------------- OnOffToggle */

export type OnOffToggleProps = {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (on: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** Compact HUD toggle: tiny track, label, then a mono ON or OFF readout. */
export function OnOffToggle({ label, checked, defaultChecked = false, onCheckedChange, disabled, className }: OnOffToggleProps) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => {
        if (checked === undefined) setInner(!on);
        onCheckedChange?.(!on);
      }}
      className={cn(
        "group/oo inline-flex h-7 items-center gap-2 rounded-[7px]! px-1.5 text-[12px] text-ink-dim transition-colors hover:bg-white/[0.04] hover:text-ink",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-3 w-[22px] shrink-0 rounded-full transition-colors duration-200",
          on ? "bg-blu/45" : "bg-s4",
        )}
      >
        <span
          className={cn(
            "absolute left-px top-px size-2.5 rounded-full transition-transform duration-200 ease-quirq",
            on ? "translate-x-2.5 bg-blu" : "translate-x-0 bg-ink-faint",
          )}
        />
      </span>
      <span>{label}</span>
      <span aria-hidden="true" className={cn("w-6 text-left font-mono text-[9px] tracking-[0.12em]", on ? "text-blu" : "text-ink-faint")}>
        {on ? "ON" : "OFF"}
      </span>
    </button>
  );
}
