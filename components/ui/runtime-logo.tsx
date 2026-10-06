// Logos: RuntimeLogo (agent runtimes and integrations; shipped SVGs from /logos rendered with
// <img>, simple monochrome inline glyphs for the rest), RuntimeTag (logo plus name chip) and
// XOMark (two pairs of chevrons: the X pair white, the O pair XO lime #83d63a). Server-safe.
// Runtime ids use the raw UI form (claude_code); "claude-code" is accepted as an alias.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type RuntimeId = "claude_code" | "codex" | "openclaw" | "cursor" | "hermes" | "gemini";
export type IntegrationId = "github" | "linear" | "slack" | "gmail" | "notion" | "google-drive" | "whatsapp" | "vercel" | "mcp";
export type VendorId = "anthropic" | "openai" | "onedrive";
export type LogoId = RuntimeId | IntegrationId | VendorId;
/** Spellings seen in the wild that resolve to a LogoId. */
export type LogoAlias = "claude-code" | "google_drive" | "gdrive";

export type LogoMeta = {
  label: string;
  kind: "runtime" | "integration" | "vendor";
  /** Who makes it, for "Powered by" lines and vendor tags. */
  vendor?: string;
  /** File under /public/logos when a shipped SVG exists. */
  file?: string;
  /** Vendor tint, used only on tags and legend dots, never on the logo itself. */
  color?: string;
};

export const LOGO_META: Record<LogoId, LogoMeta> = {
  claude_code: { label: "Claude Code", kind: "runtime", vendor: "Anthropic", file: "/logos/claude-code.svg", color: "#d7a75d" },
  codex: { label: "Codex", kind: "runtime", vendor: "OpenAI", file: "/logos/codex.svg", color: "#60a5fa" },
  openclaw: { label: "OpenClaw", kind: "runtime", vendor: "OpenClaw", file: "/logos/openclaw.svg", color: "#a8d94f" },
  cursor: { label: "Cursor", kind: "runtime", vendor: "Anysphere", file: "/logos/cursor.svg", color: "#7eb6ff" },
  hermes: { label: "Hermes Agent", kind: "runtime", vendor: "Nous Research", file: "/logos/hermes.svg", color: "#818cf8" },
  gemini: { label: "Gemini CLI", kind: "runtime", vendor: "Google", color: "#34d399" },
  github: { label: "GitHub", kind: "integration", file: "/logos/github.svg" },
  linear: { label: "Linear", kind: "integration" },
  slack: { label: "Slack", kind: "integration" },
  gmail: { label: "Gmail", kind: "integration" },
  notion: { label: "Notion", kind: "integration" },
  "google-drive": { label: "Google Drive", kind: "integration", file: "/logos/google-drive.svg" },
  whatsapp: { label: "WhatsApp", kind: "integration" },
  vercel: { label: "Vercel", kind: "integration", file: "/logos/vercel.svg" },
  mcp: { label: "MCP", kind: "integration", file: "/logos/mcp.svg" },
  anthropic: { label: "Anthropic", kind: "vendor", file: "/logos/anthropic.svg", color: "#fb923c" },
  openai: { label: "OpenAI", kind: "vendor", file: "/logos/openai.svg", color: "#60a5fa" },
  onedrive: { label: "OneDrive", kind: "integration", file: "/logos/onedrive.svg" },
};

export const RUNTIME_IDS: RuntimeId[] = ["claude_code", "codex", "openclaw", "cursor", "hermes", "gemini"];
export const INTEGRATION_IDS: IntegrationId[] = ["github", "linear", "slack", "gmail", "notion", "google-drive", "whatsapp", "vercel", "mcp"];

const ALIASES: Record<LogoAlias, LogoId> = { "claude-code": "claude_code", google_drive: "google-drive", gdrive: "google-drive" };

/** Normalizes an id or alias to a LogoId. */
export function resolveLogoId(id: LogoId | LogoAlias): LogoId {
  return (ALIASES as Record<string, LogoId>)[id] ?? (id as LogoId);
}

/** Display name for a runtime or integration id ("claude_code" reads "Claude Code"). */
export function logoLabel(id: LogoId | LogoAlias): string {
  return LOGO_META[resolveLogoId(id)].label;
}

/* Monochrome stand-in glyphs for logos with no shipped file. Deliberately simple, drawn on a
   24 grid in currentColor; they suggest the product, they do not reproduce a trademark. */
const GLYPHS: Partial<Record<LogoId, ReactNode>> = {
  gemini: <path d="M12 2.5c.5 5.1 4.4 9 9.5 9.5-5.1.5-9 4.4-9.5 9.5-.5-5.1-4.4-9-9.5-9.5 5.1-.5 9-4.4 9.5-9.5Z" fill="currentColor" />,
  linear: (
    <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M5.2 13.6 10.4 18.8M4.6 9.8l9.6 9.6M6.6 6.6l10.8 10.8" />
    </g>
  ),
  slack: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
    </g>
  ),
  gmail: (
    <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.6 6.6 12 13l8.4-6.4" />
    </g>
  ),
  notion: (
    <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8.5 16.5v-9l7 9v-9" />
    </g>
  ),
  whatsapp: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4.2 20 5.4 16.4A8.5 8.5 0 1 1 8 19Z" />
      <path d="M9.2 8.4c-.4 2.6 2.2 5.8 5.3 6.6l1.1-1.3-1.9-1-.9.8c-1-.5-2-1.6-2.4-2.6l.8-.9-.9-1.9Z" strokeWidth="1.4" />
    </g>
  ),
};

export type RuntimeLogoProps = {
  id: LogoId | LogoAlias;
  /** Glyph size in px. */
  size?: number;
  /** Seat the logo on a rounded s3 tile (connector cards, runtime pickers). */
  tile?: boolean;
  /** Alt text override. Defaults to the product name. */
  label?: string;
  /** Hide from assistive tech when the name is printed next to the logo. */
  decorative?: boolean;
  className?: string;
};

/** Runtime or integration logo, monochrome ink on the dark ground. */
export function RuntimeLogo({ id, size = 16, tile = false, label, decorative = false, className }: RuntimeLogoProps) {
  const key = resolveLogoId(id);
  const meta = LOGO_META[key];
  const alt = decorative ? "" : label ?? meta.label;
  const glyph = GLYPHS[key];

  const mark = meta.file ? (
    // Shipped SVG from /public/logos; plain <img> keeps it static and dependency free.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={meta.file} alt={alt} width={size} height={size} draggable={false} className={cn("shrink-0 select-none", !tile && className)} />
  ) : glyph ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("shrink-0 text-ink", !tile && className)}
    >
      {glyph}
    </svg>
  ) : (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("inline-grid shrink-0 place-items-center rounded-[4px] bg-s4 font-mono font-medium text-ink", !tile && className)}
      style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.55)) }}
    >
      {meta.label.charAt(0)}
    </span>
  );

  if (!tile) return mark;
  const pad = Math.round(size * 0.5);
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-[10px] border border-hair bg-s3", className)}
      style={{ width: size + pad * 2, height: size + pad * 2 }}
    >
      {mark}
    </span>
  );
}

export type RuntimeTagProps = {
  id: LogoId | LogoAlias;
  /** Show the raw id (claude_code) in mono instead of the display name. */
  raw?: boolean;
  /** Leading 5px vendor-tint dot instead of the logo. */
  dot?: boolean;
  className?: string;
};

/** Runtime chip: logo (or vendor dot) plus name, radius 6. "Claude Code", "codex". */
export function RuntimeTag({ id, raw = false, dot = false, className }: RuntimeTagProps) {
  const key = resolveLogoId(id);
  const meta = LOGO_META[key];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-hair bg-white/[0.04] px-2 leading-none text-ink",
        raw ? "font-mono text-[10.5px]" : "text-[11.5px]",
        className,
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full" style={{ background: meta.color ?? "var(--ink-faint)" }} />
      ) : (
        <RuntimeLogo id={key} size={12} decorative />
      )}
      {raw ? key : meta.label}
    </span>
  );
}

export type XOMarkProps = {
  /** Height in px; width follows the mark's 2.4 : 1 proportion. */
  height?: number;
  /** Accessible name; pass null when a visible "XO" label sits next to it. */
  title?: string | null;
  /** Single-color mark in currentColor (for embossing or busy backgrounds). */
  mono?: boolean;
  className?: string;
};

/** XO mark: the X chevron pair white, the O pair lime. Polylines from brand/xo-logo.svg, cropped to the chevrons. */
export function XOMark({ height = 20, title = "XO", mono = false, className }: XOMarkProps) {
  const outer = mono ? "currentColor" : "#ffffff";
  const inner = mono ? "currentColor" : "#83d63a";
  return (
    <svg
      height={height}
      width={(height * 460) / 192}
      viewBox="20 154 460 192"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
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
