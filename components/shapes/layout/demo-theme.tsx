"use client";

// Demo: light and themed surfaces. Client component: the Light, Dark, System switch, the
// Space theme picker with its save states, and the same card under every theme.
import { useEffect, useRef, useState } from "react";
import { CURRENT_SPACE, SPACES, type Meter, type Space } from "@/lib/fixtures";
import { formatBytes, formatFixed, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { SPACE_THEME_IDS, THEMES, ThemeScope, ThemeSpecimen, ThemedXOMark, UsageRings, type RingItem, type ThemeId, type ThemeTokens } from "./theme";
import { ThemeModeSwitch, ThemePicker, useResolvedScheme, type ThemeMode, type ThemeSaveStatus } from "./theme-client";
import { useSystemScheme } from "./use-motion";

function meterText(m: Meter): string {
  if (m.used === null) return "Unavailable";
  return m.unit === "cores" ? `${formatFixed(m.used, 1)} / ${m.total} cores` : `${formatBytes(m.used)} / ${formatBytes(m.total)}`;
}

function rings(space: Space): RingItem[] {
  const r = (label: RingItem["label"], m: Meter): RingItem => ({ label, ratio: m.used === null ? null : m.used / m.total, valueText: meterText(m) });
  return [r("CPU", space.usage.cpu), r("RAM", space.usage.memory), r("Disk", space.usage.disk)];
}

function specimenProps(space: Space) {
  const disk = space.usage.disk;
  return {
    brand: "XO Space",
    kicker: space.deployment === "local" ? "Local space" : "Hosted space",
    title: space.name,
    status: space.status,
    facts: [space.provider, pluralize(space.projects.length, "project")],
    meter: { label: "Disk", valueText: meterText(disk), ratio: disk.used === null ? null : disk.used / disk.total },
    primary: "Open space",
    secondary: "Stop",
  };
}

const MODE_STATES: { mode: ThemeMode; label: string }[] = [
  { mode: "system", label: "System" },
  { mode: "light", label: "Forced light" },
  { mode: "dark", label: "Forced dark" },
];

const GRID: { theme: ThemeTokens; note: string }[] = [
  { theme: THEMES.dark, note: "Default" },
  { theme: THEMES.light, note: "xo-mark light" },
  { theme: THEMES.space, note: "id space" },
  { theme: THEMES.quirq, note: "id quirq (stable theme id)" },
  { theme: THEMES.midnight, note: "id midnight" },
  { theme: THEMES.graphite, note: "id graphite" },
  { theme: THEMES.linen, note: "Light" },
  { theme: THEMES["galileo-light"], note: "galileo page" },
];

export default function ThemeDemo() {
  const base = specimenProps(CURRENT_SPACE);
  const unreported = SPACES.find((s) => s.usage.cpu.used === null) ?? CURRENT_SPACE;

  /* mode switch */
  const [mode, setMode] = useState<ThemeMode>("system");
  const scheme = useResolvedScheme(mode);
  const device = useSystemScheme();

  /* picker */
  const [saved, setSaved] = useState<ThemeId>("space");
  const [draft, setDraft] = useState<ThemeId>("space");
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const t = timer;
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);
  const status: ThemeSaveStatus = saving ? "saving" : draft !== saved ? "unsaved" : "saved";
  function save() {
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSaved(draft);
      setSaving(false);
    }, 900);
  }

  const modeLabel = mode === "system" ? `System · following your device: ${device}` : mode === "light" ? "Forced light" : "Forced dark";

  return (
    <div className="flex flex-col gap-10">
      <SpecimenGrid cols={2}>
        {/* light, dark, system */}
        <Specimen label="Light | Dark | System" note="System follows the device; Light and Dark force a scheme. The preview applies the result.">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ThemeModeSwitch value={mode} onChange={setMode} />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint" aria-live="polite">
                {modeLabel}
              </span>
            </div>
            <ul aria-label="Color mode states" className="m-0 grid list-none grid-cols-3 gap-2 pl-0">
              {MODE_STATES.map((m) => {
                const t = THEMES[m.mode === "system" ? device : m.mode];
                const current = m.mode === mode;
                return (
                  <li key={m.mode} aria-current={current ? "true" : undefined}>
                    <ThemeScope
                      theme={t}
                      className={cn(
                        "flex h-full min-w-0 flex-col gap-1.5 rounded-[10px] border px-2.5 py-2",
                        current ? "border-[var(--t-accent)] shadow-[0_0_0_1px_var(--t-accent)]" : "border-[var(--t-line)]",
                      )}
                    >
                      <ThemedXOMark height={10} outer={t.mark.outer} inner={t.mark.inner} glow={t.mark.glow} title={null} />
                      <span className="text-[11.5px] font-medium leading-tight">{m.label}</span>
                      <span className="text-[10.5px] leading-tight text-[var(--t-ink3)]">{m.mode === "system" ? `Device: ${device}` : "Ignores the device"}</span>
                    </ThemeScope>
                  </li>
                );
              })}
            </ul>
            <ThemeScope theme={THEMES[scheme]} className="flex flex-col gap-3 rounded-[16px] border border-[var(--t-line)] p-3">
              <ThemeSpecimen theme={THEMES[scheme]} {...base} footer={false} />
              <UsageRings mode={scheme} items={rings(CURRENT_SPACE)} title={`${CURRENT_SPACE.name} usage`} />
            </ThemeScope>
          </div>
        </Specimen>

        {/* picker */}
        <Specimen label="Space theme picker" note="Change the theme to see Unsaved changes, then Save theme: Saving…, then Saved.">
          <div className="flex flex-col gap-3">
            <ThemePicker
              idPrefix="tv-picker"
              themes={SPACE_THEME_IDS.map((id) => THEMES[id])}
              value={draft}
              onChange={setDraft}
              status={status}
              onSave={save}
            />
            <ThemeSpecimen theme={THEMES[draft]} {...base} />
          </div>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid cols={3}>
        <Specimen label="Picker · loading">
          <ThemePicker idPrefix="tv-picker-loading" themes={SPACE_THEME_IDS.map((id) => THEMES[id])} value="space" onChange={() => {}} status="loading" onSave={() => {}} />
        </Specimen>
        <Specimen label="XO mark · dark, light, themed" note="White and lime with glow; #08090A and darkened lime; one ink color under Neon, Midnight, Graphite and Linen.">
          <div className="grid grid-cols-3 overflow-hidden rounded-[14px] border border-hair-soft">
            {[THEMES.dark, THEMES.light, THEMES.quirq].map((t) => (
              <ThemeScope key={t.id} theme={t} className="flex flex-col items-center gap-2 px-2 py-5">
                <ThemedXOMark height={22} outer={t.mark.outer} inner={t.mark.inner} glow={t.mark.glow} title={`XO mark, ${t.name}`} />
                <span className="text-[11px] text-[var(--t-ink2)]">{t.name}</span>
              </ThemeScope>
            ))}
          </div>
        </Specimen>
        <Specimen label="Usage rings · light and dark" note="Light uses darker fills. A meter the space cannot report reads Unavailable.">
          <div className="flex flex-col gap-2">
            <UsageRings mode="light" items={rings(CURRENT_SPACE)} title={`${CURRENT_SPACE.name} usage`} />
            <UsageRings mode="dark" items={rings(unreported)} title={`${unreported.name} usage`} />
          </div>
        </Specimen>
      </SpecimenGrid>

      <DemoRule />

      <Specimen label="Same card under every theme" note="One shape, scoped tokens. Space themes keep stable ids so saved preferences survive.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GRID.map(({ theme, note }) => (
            <div key={theme.id} className="flex min-w-0 flex-col gap-2">
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {theme.name} · <span className="normal-case tracking-normal">{note}</span>
              </p>
              <ThemeSpecimen theme={theme} {...base} />
            </div>
          ))}
        </div>
      </Specimen>
    </div>
  );
}
