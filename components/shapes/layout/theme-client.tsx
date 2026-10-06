"use client";

// Theme controls: ThemeModeSwitch (Light, Dark, System as a radiogroup) and ThemePicker
// (Space theme select with swatches, description and the save states Loading, Saving…,
// Unsaved changes and Saved).
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Segmented, Select, Spinner } from "@/components/ui";
import { ThemeSwatches, type ThemeId, type ThemeTokens } from "./theme";
import { useSystemScheme } from "./use-motion";

/* ----------------------------------------------------------------------------- ThemeModeSwitch */

export type ThemeMode = "light" | "dark" | "system";

/** Resolve a mode to a scheme, following the device for "system". Dark on the server. */
export function useResolvedScheme(mode: ThemeMode): "light" | "dark" {
  const system = useSystemScheme();
  return mode === "system" ? system : mode;
}

export function ThemeModeSwitch({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: ThemeMode;
  onChange: (m: ThemeMode) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Segmented<ThemeMode>
      aria-label="Color mode"
      size={size}
      value={value}
      onChange={onChange}
      className={className}
      options={[
        { value: "light", label: "Light", icon: <Sun aria-hidden="true" /> },
        { value: "dark", label: "Dark", icon: <Moon aria-hidden="true" /> },
        { value: "system", label: "System", icon: <Monitor aria-hidden="true" /> },
      ]}
    />
  );
}

/* ----------------------------------------------------------------------------- ThemePicker */

export type ThemeSaveStatus = "loading" | "unsaved" | "saving" | "saved";

const STATUS_COPY: Record<ThemeSaveStatus, string> = {
  loading: "Loading…",
  unsaved: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
};

export type ThemePickerProps = {
  themes: ThemeTokens[];
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  status: ThemeSaveStatus;
  onSave: () => void;
  idPrefix: string;
  className?: string;
};

/** Space theme setting: select, swatches and description, status, and Save theme. */
export function ThemePicker({ themes, value, onChange, status, onSave, idPrefix, className }: ThemePickerProps) {
  const current = themes.find((t) => t.id === value) ?? themes[0];
  const loading = status === "loading";
  const saving = status === "saving";
  return (
    <form
      className={cn("rounded-[14px] border border-hair bg-s1 p-4", className)}
      aria-busy={loading || saving}
      onSubmit={(e) => {
        e.preventDefault();
        if (status === "unsaved") onSave();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="m-0 text-[14px] font-medium">Theme</h4>
        <span
          role="status"
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em]",
            status === "unsaved" ? "text-[#e2ae5b]" : status === "saved" ? "text-[#a8d94f]" : "text-ink-faint",
          )}
        >
          {saving || loading ? <Spinner size="xs" label={null} /> : null}
          {STATUS_COPY[status]}
        </span>
      </div>
      <fieldset disabled={loading || saving} className="m-0 mt-3 min-w-0 border-0 p-0">
        <label htmlFor={`${idPrefix}-select`} className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
          Space theme
        </label>
        <p className="m-0 mt-1 text-[12px] text-ink-dim">Choose the colors and typography that feel right for you.</p>
        <Select
          id={`${idPrefix}-select`}
          aria-describedby={`${idPrefix}-desc`}
          className="mt-2.5"
          value={value}
          onChange={(e) => onChange(e.target.value as ThemeId)}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.id === "space" ? ": default" : t.scheme === "light" ? ": light" : ""}
            </option>
          ))}
        </Select>
        <div className="mt-3 flex items-center gap-3 rounded-[10px] border border-hair-soft bg-black/30 px-3 py-2.5">
          {loading ? <span className="h-3.5 w-12 rounded-full bg-s3" aria-hidden="true" /> : <ThemeSwatches theme={current} />}
          <p id={`${idPrefix}-desc`} className="m-0 min-w-0 text-[12px] text-ink-dim">
            {loading ? "Loading themes…" : current.description}
          </p>
        </div>
      </fieldset>
      <p className="m-0 mt-3 text-[11.5px] text-ink-faint">Your space name and logo stay the same. Save to apply immediately.</p>
      <div className="mt-3 flex gap-2">
        {/* aria-disabled, not disabled: the button keeps focus through Saving… and Saved */}
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          aria-disabled={status !== "unsaved" || undefined}
          aria-busy={saving || undefined}
          leadingIcon={saving ? <Spinner size="xs" label={null} /> : undefined}
        >
          {saving ? "Saving…" : "Save theme"}
        </Button>
      </div>
    </form>
  );
}
