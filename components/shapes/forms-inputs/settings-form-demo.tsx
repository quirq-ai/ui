"use client";

import { DemoCell, DemoGrid } from "./_kit";
import { BrandingEditor, PathSettingsForm, ThemePicker, type ThemeOption } from "./settings-form";

const THEMES: ThemeOption[] = [
  { id: "grove", label: "Grove", swatches: ["#a8d94f", "#beb9ac", "#6f93ad"], description: "Moss green and warm neutrals.", ground: "#10120d", ink: "#ecebe4" },
  { id: "neon", label: "Neon", swatches: ["#f2a2d5", "#bb9aef", "#eac17a"], description: "Soft magenta, violet and amber on charcoal.", ground: "#151317", ink: "#f1ecf3" },
  { id: "midnight", label: "Midnight", swatches: ["#91adff", "#c5cfdf", "#aba0dc"], description: "Periwinkle blue and silver on near-black.", ground: "#0b0d14", ink: "#e6eaf3" },
  { id: "graphite", label: "Graphite", swatches: ["#e8e8e8", "#949494", "#303030"], description: "Quiet black and grey. Clear, simple and focused.", ground: "#111111", ink: "#ededed" },
  { id: "linen", label: "Linen", swatches: ["#a64d2f", "#d7d1c7", "#6f6a62"], description: "Warm white, soft stone and burnt orange.", ground: "#fffefa", ink: "#2a2622", light: true },
];

const PATHS = [
  {
    id: "projects",
    label: "Projects folder",
    value: "/Users/ada/xo-projects",
    placeholder: "/Users/you/xo-projects",
    hint: "Contains your project folders. Changing this does not move them.",
  },
  {
    id: "data",
    label: "Space data folder",
    value: "/Users/ada/.quirq",
    placeholder: "/Users/you/.quirq",
    hint: "Settings, credentials and activity data. Default: ~/.quirq/",
  },
];

export function SettingsFormDemo() {
  return (
    <DemoGrid>
      <DemoCell label="Branding · default mark · saved" note="Preview updates while typing">
        <BrandingEditor defaultName="Research lab" />
      </DemoCell>
      <DemoCell label="Branding · uploaded logo · unsaved changes">
        <BrandingEditor
          defaultName="Acme Robotics"
          draftName="Acme Robotics lab"
          defaultLogo={{ name: "acme-mark.svg", size: 4200, initials: "AR", color: "var(--org)" }}
        />
      </DemoCell>
      <DemoCell label="Theme swatches · unsaved" note="Pick a swatch or use the select" className="md:col-span-2">
        <ThemePicker themes={THEMES} savedId="grove" draftId="neon" />
      </DemoCell>
      <DemoCell label="Folder paths · local · pending restart">
        <PathSettingsForm
          paths={PATHS}
          mode="local"
          applyCommand="xo restart --apply-paths"
          draft={{ projects: "/Users/ada/work/xo-projects" }}
          pendingRestart
        />
      </DemoCell>
      <DemoCell label="Folder paths · managed container · error box">
        <PathSettingsForm
          paths={[
            { ...PATHS[0], value: "/home/coder/xo-projects", placeholder: "/home/coder/xo-projects" },
            { ...PATHS[1], value: "/home/coder/.quirq", placeholder: "/home/coder/.quirq", hint: "Settings, credentials and activity data. Default: ~/.quirq/" },
          ]}
          mode="managed"
          applyCommand="xo restart --apply-paths"
          draft={{ projects: "xo-projects" }}
          validateOnMount
        />
      </DemoCell>
    </DemoGrid>
  );
}
