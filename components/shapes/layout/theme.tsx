// Light and themed surfaces: token sets for the quirq dark default and its light variant,
// the five Space themes (Grove, Neon, Midnight, Graphite, Linen) and the galileo page shell,
// plus a scoped specimen that renders the same shape under any of them. Server-safe.
//
// Theme tokens are written to --t-* custom properties on a wrapper, and --ink is reset too
// so the global focus ring stays visible on light surfaces.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ThemeId = "dark" | "light" | "space" | "quirq" | "midnight" | "graphite" | "linen" | "galileo-light" | "galileo-dark";

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  /** Shown in the picker under the swatches. */
  description: string;
  scheme: "dark" | "light";
  bg: string;
  bg2: string;
  bg3: string;
  line: string;
  lineSoft: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  accentInk: string;
  /** Live and success marks. */
  good: string;
  warn: string;
  /** Three picker swatches. */
  swatches: [string, string, string];
  /** XO mark: chevron colors and whether the lime glow is on. */
  mark: { outer: string; inner: string; glow: boolean };
  /** Brand font for the wordmark under this theme. */
  brandFont?: string;
};

const POPPINS = "Poppins, var(--font-sans)";

export const THEMES: Record<ThemeId, ThemeTokens> = {
  dark: {
    id: "dark",
    name: "Dark",
    description: "Default. Ink on black, spectrum in small doses.",
    scheme: "dark",
    bg: "#000000",
    bg2: "#0f0f11",
    bg3: "#1d1d1f",
    line: "rgba(255,255,255,.09)",
    lineSoft: "rgba(255,255,255,.055)",
    ink: "#f4f3f0",
    ink2: "#a3a39e",
    ink3: "#7d7d78",
    accent: "#f4f3f0",
    accentInk: "#000000",
    good: "#30d158",
    warn: "#ff9f0a",
    swatches: ["#f4f3f0", "#a3a39e", "#83d63a"],
    mark: { outer: "#ffffff", inner: "#83d63a", glow: true },
  },
  light: {
    id: "light",
    name: "Light",
    description: "Ink #08090A on paper, brand darkened to hsl(92, 60%, 28%).",
    scheme: "light",
    bg: "#f7f8f4",
    bg2: "#ffffff",
    bg3: "#eef1ea",
    line: "hsla(92, 35%, 40%, .22)",
    lineSoft: "hsla(92, 35%, 40%, .13)",
    ink: "#08090a",
    ink2: "#3b4234",
    ink3: "#5f6a57",
    accent: "hsl(92, 60%, 28%)",
    accentInk: "#fafafa",
    good: "hsl(92, 60%, 28%)",
    warn: "#9a5b00",
    swatches: ["#08090a", "hsl(92, 60%, 28%)", "hsl(92, 45%, 93%)"],
    mark: { outer: "#08090a", inner: "hsl(92, 60%, 28%)", glow: false },
  },
  space: {
    id: "space",
    name: "Grove",
    description: "Moss green and warm neutrals.",
    scheme: "dark",
    bg: "#0b0c0f",
    bg2: "#101318",
    bg3: "#161a20",
    line: "#242832",
    lineSoft: "#1b1f27",
    ink: "#e9e4d9",
    ink2: "#beb9ac",
    ink3: "#a6a094",
    accent: "#a8d94f",
    accentInk: "#0b0c0f",
    good: "#a8d94f",
    warn: "#e2ae5b",
    swatches: ["#a8d94f", "#beb9ac", "#6f93ad"],
    mark: { outer: "#ffffff", inner: "#83d63a", glow: true },
  },
  quirq: {
    id: "quirq",
    name: "Neon",
    description: "Soft magenta, violet and amber on charcoal.",
    scheme: "dark",
    bg: "#100f14",
    bg2: "#19161e",
    bg3: "#231e2a",
    line: "#39303f",
    lineSoft: "#2b2531",
    ink: "#f3ece4",
    ink2: "#d0c3cc",
    ink3: "#b1a2b4",
    accent: "#f2a2d5",
    accentInk: "#21141e",
    good: "#b7cc91",
    warn: "#eac17a",
    swatches: ["#f2a2d5", "#bb9aef", "#eac17a"],
    mark: { outer: "#f3ece4", inner: "#f3ece4", glow: false },
    brandFont: POPPINS,
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Periwinkle blue and silver on near-black.",
    scheme: "dark",
    bg: "#090c12",
    bg2: "#101620",
    bg3: "#192230",
    line: "#2a3548",
    lineSoft: "#1e2837",
    ink: "#eaf0fa",
    ink2: "#c5cfdf",
    ink3: "#9eacc3",
    accent: "#91adff",
    accentInk: "#10182c",
    good: "#92c9b4",
    warn: "#d8bc89",
    swatches: ["#91adff", "#c5cfdf", "#aba0dc"],
    mark: { outer: "#eaf0fa", inner: "#eaf0fa", glow: false },
    brandFont: POPPINS,
  },
  graphite: {
    id: "graphite",
    name: "Graphite",
    description: "Quiet black and grey. Clear, simple and focused.",
    scheme: "dark",
    bg: "#181818",
    bg2: "#212121",
    bg3: "#2d2d2d",
    line: "#424242",
    lineSoft: "#343434",
    ink: "#f3f3f3",
    ink2: "#d0d0d0",
    ink3: "#b0b0b0",
    accent: "#e8e8e8",
    accentInk: "#181818",
    good: "#d6d6d6",
    warn: "#eeeeee",
    swatches: ["#303030", "#949494", "#e8e8e8"],
    mark: { outer: "#f3f3f3", inner: "#f3f3f3", glow: false },
  },
  linen: {
    id: "linen",
    name: "Linen",
    description: "Warm white, soft stone and burnt orange.",
    scheme: "light",
    bg: "#f7f5f0",
    bg2: "#fffefa",
    bg3: "#eeebe4",
    line: "#d7d1c7",
    lineSoft: "#e6e1d8",
    ink: "#302b26",
    ink2: "#514a42",
    ink3: "#6c6359",
    accent: "#a64d2f",
    accentInk: "#fffefa",
    good: "#526b4c",
    warn: "#856018",
    swatches: ["#a64d2f", "#d7d1c7", "#fffefa"],
    mark: { outer: "#302b26", inner: "#302b26", glow: false },
  },
  "galileo-light": {
    id: "galileo-light",
    name: "galileo light",
    description: "galileo page shell under prefers-color-scheme: light.",
    scheme: "light",
    bg: "#f7f8f4",
    bg2: "#ffffff",
    bg3: "#eef1ea",
    line: "#dfe4d8",
    lineSoft: "#e9ede4",
    ink: "#1b2016",
    ink2: "#3c4535",
    ink3: "#5f6a57",
    accent: "#3f6e18",
    accentInk: "#ffffff",
    good: "#3f6e18",
    warn: "#8a5a00",
    swatches: ["#1b2016", "#3f6e18", "#eef1ea"],
    mark: { outer: "#1b2016", inner: "#3f6e18", glow: false },
  },
  "galileo-dark": {
    id: "galileo-dark",
    name: "galileo dark",
    description: "galileo page shell under prefers-color-scheme: dark.",
    scheme: "dark",
    bg: "#111410",
    bg2: "#171b15",
    bg3: "#1d2219",
    line: "#262c22",
    lineSoft: "#1f241b",
    ink: "#e8ede3",
    ink2: "#c3cbbb",
    ink3: "#9ca693",
    accent: "#83d63a",
    accentInk: "#111410",
    good: "#83d63a",
    warn: "#e2ae5b",
    swatches: ["#e8ede3", "#83d63a", "#171b15"],
    mark: { outer: "#e8ede3", inner: "#83d63a", glow: false },
  },
};

/** The five Space themes in picker order. */
export const SPACE_THEME_IDS: ThemeId[] = ["space", "quirq", "midnight", "graphite", "linen"];

/** CSS custom properties for a theme scope. */
export function themeVars(t: ThemeTokens): CSSProperties {
  return {
    "--t-bg": t.bg,
    "--t-bg2": t.bg2,
    "--t-bg3": t.bg3,
    "--t-line": t.line,
    "--t-line-soft": t.lineSoft,
    "--t-ink": t.ink,
    "--t-ink2": t.ink2,
    "--t-ink3": t.ink3,
    "--t-accent": t.accent,
    "--t-accent-ink": t.accentInk,
    "--t-good": t.good,
    "--t-warn": t.warn,
    /* the global focus ring reads --ink */
    "--ink": t.ink,
    colorScheme: t.scheme,
  } as CSSProperties;
}

/** Wrapper that scopes a theme: children style themselves with the --t-* variables. */
export function ThemeScope({ theme, className, children, as: Tag = "div" }: { theme: ThemeTokens; className?: string; children: ReactNode; as?: "div" | "section" | "article" }) {
  return (
    <Tag data-theme={theme.id} style={themeVars(theme)} className={cn("bg-[var(--t-bg)] text-[var(--t-ink)]", className)}>
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- ThemedXOMark */

/** XO mark with theme colors: white and lime by default, #08090A and darkened lime on light,
    one ink color with no glow under Neon, Midnight, Graphite and Linen. */
export function ThemedXOMark({
  height = 18,
  outer,
  inner,
  glow = false,
  title = "XO",
}: {
  height?: number;
  outer: string;
  inner: string;
  glow?: boolean;
  title?: string | null;
}) {
  return (
    <svg
      height={height}
      width={(height * 460) / 192}
      viewBox="20 154 460 192"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className="shrink-0"
      style={glow ? { filter: "drop-shadow(0 0 9px rgba(131,214,58,.35))" } : undefined}
    >
      <g strokeWidth="15.38" strokeMiterlimit="10">
        <polyline stroke={outer} points="36.99 165.84 118.47 247.31 31.16 334.61" />
        <polyline stroke={outer} points="244.91 165.84 163.44 247.31 250.74 334.61" />
        <polyline stroke={inner} points="328.12 165.06 246.65 246.53 333.95 333.84" />
        <polyline stroke={inner} points="380.51 165.06 461.99 246.53 374.68 333.84" />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------------------- Swatches */

/** Three swatch dots with an inset 1px ring, as the theme picker shows them. */
export function ThemeSwatches({ theme, size = 14 }: { theme: ThemeTokens; size?: number }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-1">
      {theme.swatches.map((c, i) => (
        <i key={i} className="block rounded-full" style={{ width: size, height: size, background: c, boxShadow: "inset 0 0 0 1px #ffffff20, 0 0 0 1px rgba(0,0,0,.18)" }} />
      ))}
    </span>
  );
}

/* ----------------------------------------------------------------------------- ThemeSpecimen */

export type ThemeSpecimenProps = {
  theme: ThemeTokens;
  /** Product label next to the mark: "XO Space". */
  brand: string;
  kicker: string;
  title: string;
  status: string;
  facts: string[];
  meter: { label: string; valueText: string; ratio: number | null };
  primary: string;
  secondary: string;
  /** Show the theme name and swatches in a footer. */
  footer?: boolean;
  className?: string;
};

/** The same small space card rendered under one theme. */
export function ThemeSpecimen({ theme, brand, kicker, title, status, facts, meter, primary, secondary, footer = true, className }: ThemeSpecimenProps) {
  return (
    <ThemeScope theme={theme} as="article" className={cn("overflow-hidden rounded-[14px] border border-[var(--t-line)]", className)}>
      <div className="flex items-center gap-2 border-b border-[var(--t-line-soft)] px-4 py-2.5">
        <ThemedXOMark height={12} outer={theme.mark.outer} inner={theme.mark.inner} glow={theme.mark.glow} title={null} />
        <span className="text-[12.5px] font-semibold tracking-[0.01em]" style={{ fontFamily: theme.brandFont }}>
          {brand}
        </span>
      </div>
      <div className="flex flex-col gap-3 bg-[var(--t-bg2)] px-4 py-4">
        <div className="min-w-0">
          <p className="m-0 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--t-ink3)]">{kicker}</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <h4 className="m-0 truncate text-[16px] font-semibold tracking-[-0.01em]">{title}</h4>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--t-line)] px-2 py-0.5 text-[11px] text-[var(--t-ink)]">
              <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: "var(--t-good)", boxShadow: "0 0 0 3px color-mix(in srgb, var(--t-good) 18%, transparent)" }} />
              {status}
            </span>
          </div>
          <p className="m-0 mt-1 text-[12px] text-[var(--t-ink2)]">{facts.join(" · ")}</p>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
            <span className="text-[var(--t-ink2)]">{meter.label}</span>
            <span className="font-mono tabular-nums text-[var(--t-ink3)]">{meter.valueText}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--t-bg3)]" role="img" aria-label={`${meter.label}: ${meter.valueText}`}>
            {meter.ratio !== null ? <div className="h-full rounded-full bg-[var(--t-accent)]" style={{ width: `${Math.round(meter.ratio * 100)}%` }} /> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-[8px]! bg-[var(--t-accent)] px-3 text-[12px] font-semibold text-[var(--t-accent-ink)] transition-opacity hover:opacity-90"
          >
            {primary}
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-[8px]! border border-[var(--t-line)] bg-[var(--t-bg3)] px-3 text-[12px] text-[var(--t-ink)] transition-colors hover:border-[var(--t-ink3)]"
          >
            {secondary}
          </button>
        </div>
      </div>
      {footer ? (
        <div className="flex items-center justify-between gap-2 border-t border-[var(--t-line-soft)] px-4 py-2.5">
          <span className="min-w-0 truncate text-[11.5px] text-[var(--t-ink2)]">
            <span className="font-medium text-[var(--t-ink)]">{theme.name}</span>
            <span aria-hidden="true"> · </span>
            {theme.scheme === "light" ? "light" : "dark"}
          </span>
          <ThemeSwatches theme={theme} size={11} />
        </div>
      ) : null}
    </ThemeScope>
  );
}

/* ----------------------------------------------------------------------------- UsageRings */

export type RingItem = {
  label: "CPU" | "RAM" | "Disk";
  /** 0 to 1, or null when the space cannot report it. */
  ratio: number | null;
  /** "2.1 / 10 cores" */
  valueText: string;
};

const RING_FILLS = {
  dark: { CPU: "#00f8ce", RAM: "#b8fe19", Disk: "#ff3388", track: "#2e2e2e", bg: "#141414", ink: "#f4f3f0", dim: "#a3a39e" },
  light: { CPU: "#03aa8e", RAM: "#678d0e", Disk: "#ff3388", track: "#e5e5e5", bg: "#f3f3f3", ink: "#141414", dim: "#5c5c58" },
} as const;

/** Swarm activity rings: Disk outside, RAM, CPU inside. Light uses darker fills. */
export function UsageRings({ mode, items, title = "Space usage" }: { mode: "dark" | "light"; items: RingItem[]; title?: string }) {
  const c = RING_FILLS[mode];
  const order: RingItem["label"][] = ["Disk", "RAM", "CPU"];
  const sorted = order.map((l) => items.find((i) => i.label === l)).filter((i): i is RingItem => Boolean(i));
  return (
    <figure className="m-0 flex flex-wrap items-center gap-4 rounded-[14px] p-4" style={{ background: c.bg, color: c.ink }}>
      <svg viewBox="0 0 100 100" className="size-[84px] shrink-0 -rotate-90" aria-hidden="true">
        {sorted.map((it, i) => {
          const r = 42 - i * 12;
          const len = 2 * Math.PI * r;
          const fill = c[it.label];
          return (
            <g key={it.label}>
              <circle cx="50" cy="50" r={r} fill="none" stroke={c.track} strokeWidth="9" />
              {it.ratio !== null ? (
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={fill}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0.02, it.ratio) * len} ${len}`}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="min-w-[150px] flex-1 text-[12px] leading-[1.55]">
        <span className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em]" style={{ color: c.dim }}>
          {title}
        </span>
        {sorted.map((it) => (
          <span key={it.label} className="flex flex-wrap items-baseline gap-x-2">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: c[it.label] }} />
              <span className="font-medium">{it.label}</span>
            </span>
            <span className="font-mono text-[11.5px] tabular-nums" style={{ color: c.dim }}>
              {it.ratio === null ? "Unavailable" : `${(it.ratio * 100).toFixed(1)}% · ${it.valueText}`}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
