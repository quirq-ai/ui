// Secondary identities: the Machine Speed bars, space-type mini marks (the runtime a space
// was launched with), runtime wordmarks on dark and light, integration icon rows with
// tooltips, the monochrome partner strip, quirq x Partner, and the "A product by quirq.ai"
// attribution row. Third-party marks stay monochrome so their color never enters the
// palette. Glyphs drawn here are simple stand-ins, not reproductions. Server-safe.
import type { ReactNode } from "react";
import { Lockup } from "@/components/brand/mark";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { LineIcon } from "./icons";
import { XOLogo } from "./xo-mark";

/* ------------------------------------------------------------------ Machine Speed bars */

/** Machine Speed wordmark: three skewed bars. Pass a label when it stands alone. */
export function MSBars({ size = "default", label, color = "#e9eae6", className }: { size?: "default" | "small"; label?: string; color?: string; className?: string }) {
  const w = size === "small" ? 5 : 7;
  const h = size === "small" ? 15 : 22;
  return (
    <span
      className={cn("inline-flex shrink-0 gap-1", className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {[0, 1, 2].map((i) => (
        <i key={i} className="block rounded-[1.5px]" style={{ width: w, height: h, background: color, transform: "skewX(-24deg)" }} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ stand-in glyphs */

const GLYPH: Record<"telegram" | "discord" | "vscode" | "antigravity" | "nebius", ReactNode> = {
  telegram: <path d="M21 4.5 3.5 11.3l5.6 2 2.1 6.2 3.1-3.6 4.6 3.4L21 4.5ZM9.1 13.3l8.4-6.1-6.3 7.4" />,
  discord: (
    <>
      <path d="M7.5 6.5c1.4-.6 2.9-1 4.5-1s3.1.4 4.5 1c1.8 2.6 2.7 5.6 2.5 9-1.4 1.1-3 1.9-4.6 2.3l-.9-1.7M7.5 6.5c-1.8 2.6-2.7 5.6-2.5 9 1.4 1.1 3 1.9 4.6 2.3l.9-1.7" />
      <circle cx="9.4" cy="12.3" r="1" />
      <circle cx="14.6" cy="12.3" r="1" />
    </>
  ),
  vscode: <path d="M16.5 3.5 20.5 5.5v13l-4 2-9-8.2-3.5 2.7-1-1V10l1-1 3.5 2.7 9-8.2Zm0 4.6L11 12l5.5 3.9V8.1Z" />,
  antigravity: (
    <>
      <path d="M4 19.5c2.2-.4 3.4-2.3 4.4-5.1L10.6 8c.4-1.2.8-2.5 1.4-2.5s1 1.3 1.4 2.5l2.2 6.4c1 2.8 2.2 4.7 4.4 5.1" />
      <circle cx="12" cy="13.5" r="1.1" />
    </>
  ),
  nebius: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8.5 16V8l7 8V8" />
    </>
  ),
};

function StandIn({ name, size }: { name: keyof typeof GLYPH; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {GLYPH[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ integration glyphs */

export type IntegrationGlyphId =
  | "xo"
  | "whatsapp"
  | "telegram"
  | "slack"
  | "discord"
  | "claude"
  | "chatgpt"
  | "vscode"
  | "cursor"
  | "antigravity"
  | "github"
  | "linear"
  | "notion"
  | "gmail"
  | "google-drive"
  | "vercel"
  | "mcp";

const LOGO_FOR: Partial<Record<IntegrationGlyphId, LogoId>> = {
  whatsapp: "whatsapp",
  slack: "slack",
  claude: "anthropic",
  chatgpt: "openai",
  cursor: "cursor",
  github: "github",
  linear: "linear",
  notion: "notion",
  gmail: "gmail",
  "google-drive": "google-drive",
  vercel: "vercel",
  mcp: "mcp",
};

/** One monochrome integration or channel glyph, always decorative. */
export function IntegrationGlyph({ id, size = 18 }: { id: IntegrationGlyphId; size?: number }) {
  if (id === "xo") return <XOLogo height={Math.round(size * 0.5)} weight="chrome" title={null} className="my-[3px]" />;
  const logo = LOGO_FOR[id];
  if (logo) return <RuntimeLogo id={logo} size={size} decorative />;
  return <StandIn name={id as keyof typeof GLYPH} size={size} />;
}

export type IntegrationItem = { id: IntegrationGlyphId; name: string };

/** Icon row at 60%, each icon brightening to 100% and scaling 110% on hover, with a tooltip. */
export function IntegrationIconRow({ items, size = 18, className }: { items: IntegrationItem[]; size?: number; className?: string }) {
  return (
    <ul className={cn("flex list-none flex-wrap items-center gap-2 p-0", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <Tooltip content={item.name} placement="bottom" describe={false}>
            <span
              role="img"
              aria-label={item.name}
              tabIndex={0}
              className="inline-flex cursor-default rounded-[4px] text-ink opacity-60 transition-all duration-150 hover:scale-110 hover:opacity-100 focus-visible:scale-110 focus-visible:opacity-100"
            >
              <IntegrationGlyph id={item.id} size={size} />
            </span>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ space type mini marks */

export type SpaceType = "openclaw" | "nebius-openclaw" | "hermes" | "claude-code" | "xo-cowork" | "antigravity" | "codex" | "default";

export const SPACE_TYPE_LABEL: Record<SpaceType, string> = {
  openclaw: "OpenClaw",
  "nebius-openclaw": "Nebius OpenClaw",
  hermes: "Hermes Agent",
  "claude-code": "Claude Code",
  "xo-cowork": "XO Cowork",
  antigravity: "Antigravity",
  codex: "Codex",
  default: "Agent",
};

const SPACE_TYPE_LOGO: Partial<Record<SpaceType, LogoId>> = {
  openclaw: "openclaw",
  hermes: "hermes",
  "claude-code": "claude_code",
  codex: "codex",
};

export type SpaceTypeMarkProps = {
  type: SpaceType;
  /** Active space: 100%. Otherwise 55% until its row (a .group) is hovered or focused. */
  active?: boolean;
  /** Glyph size in px; the sidebar slot is 20 x 28, collapsed 16. */
  size?: number;
  /** Light app theme: logos flip to dark ink. */
  theme?: "dark" | "light";
  className?: string;
};

/** The mini mark for the runtime a space runs, in a 20 x 28 slot. Names itself for screen readers. */
export function SpaceTypeMark({ type, active = false, size = 18, theme = "dark", className }: SpaceTypeMarkProps) {
  const logo = SPACE_TYPE_LOGO[type];
  const label = SPACE_TYPE_LABEL[type];
  return (
    <span
      title={label}
      className={cn(
        "inline-flex h-5 w-7 shrink-0 items-center justify-center transition-opacity duration-150",
        active ? "opacity-100" : "opacity-[0.55] group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100",
        theme === "light" ? "text-[#08090A] [&_img]:invert" : "text-ink",
        className,
      )}
    >
      {type === "xo-cowork" || type === "default" ? (
        <XOLogo height={Math.round(size * 0.5)} weight="chrome" variant={theme} title={null} />
      ) : logo ? (
        <RuntimeLogo id={logo} size={size} decorative />
      ) : (
        <StandIn name={type === "nebius-openclaw" ? "nebius" : "antigravity"} size={size} />
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ runtime wordmarks */

/** Runtime mark plus its name, for light or dark grounds (logos invert on light). */
export function RuntimeWordmark({ id, theme = "dark", size = 18, className }: { id: "claude_code" | "codex" | "openclaw" | "cursor" | "hermes"; theme?: "dark" | "light"; size?: number; className?: string }) {
  const label = { claude_code: "Claude Code", codex: "Codex", openclaw: "OpenClaw", cursor: "Cursor", hermes: "Hermes Agent" }[id];
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap font-[600] tracking-[-0.01em]", theme === "light" ? "text-[#08090A] [&_img]:invert" : "text-ink", className)} style={{ fontSize: size * 0.9 }}>
      <RuntimeLogo id={id} size={size} decorative />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ partners */

export type PartnerWord = { name: string; /** typographic stand-in style */ face?: "sans" | "bold" | "mono" | "round" | "wide" | "lower" };

const FACE: Record<NonNullable<PartnerWord["face"]>, string> = {
  sans: "font-sans font-[600] tracking-[-0.02em]",
  bold: "font-sans font-[800] tracking-[-0.03em]",
  mono: "font-mono font-medium tracking-[0.02em]",
  round: "font-round font-bold tracking-[0.01em]",
  wide: "font-sans font-[600] uppercase tracking-[0.22em] text-[0.8em]",
  lower: "font-sans font-[700] lowercase tracking-[-0.01em]",
};

/** TRUSTED BY strip: monochrome partner names at 60%, wrapping on mobile, one row on desktop. */
export function PartnerStrip({ partners, label = "Trusted by", className }: { partners: PartnerWord[]; label?: string; className?: string }) {
  return (
    <section aria-label={label} className={cn("min-w-0", className)}>
      <p className="mb-5 text-center text-[12px] font-bold uppercase tracking-[0.4em] text-white/45">{label}</p>
      <ul className="flex list-none flex-wrap items-center justify-center gap-x-9 gap-y-4 p-0 xl:flex-nowrap xl:justify-between xl:gap-x-4">
        {partners.map((p) => (
          <li key={p.name} className={cn("whitespace-nowrap text-[19px] leading-none text-white opacity-60", FACE[p.face ?? "sans"])}>
            {p.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "quirq × Partner": the quirq lockup, a thin times sign and the partner name. */
export function PartnerLockup({ partner, face = "sans", className }: { partner: string; face?: PartnerWord["face"]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3.5 text-white", className)} aria-label={`quirq × ${partner}`} role="img">
      <Lockup size={24} />
      <span aria-hidden="true" className="text-[18px] font-light text-ink-faint">
        ×
      </span>
      <span aria-hidden="true" className={cn("text-[19px] leading-none", FACE[face])}>
        {partner}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ attribution */

export type AttributionRowProps = {
  href?: string;
  /** auto: inline when its container is 600px or wider, stacked below that (as Space Drift at 700px). */
  layout?: "auto" | "inline" | "stacked";
  /** quirq: brand greys. drift: Space Drift's header palette (#94a3c4, #bec9e6, cyan #68e4ef). */
  tone?: "quirq" | "drift";
  agentNote?: string;
  privacyNote?: string;
  className?: string;
};

const ATTR_TONE = {
  quirq: { text: "text-ink-faint", strong: "text-ink-dim", soft: "text-ink-dim", hover: "hover:text-ink group-hover:text-ink", arrow: "text-ink-dim", pip: "bg-cyn", lock: "text-cyn" },
  drift: {
    text: "text-[#94a3c4]",
    strong: "text-[#bec9e6]",
    soft: "text-[#bec9e6]",
    hover: "hover:text-[#eef2ff] group-hover:text-[#eef2ff]",
    arrow: "text-[#aab8ff]",
    pip: "bg-[#68e4ef]",
    lock: "text-[#68e4ef]",
  },
} as const;

const ATTR_LAYOUT = {
  inline: "flex-row flex-wrap items-center justify-between gap-x-[18px] gap-y-1.5",
  stacked: "flex-col items-start gap-1.5",
  auto: "flex-col items-start gap-px @[600px]:flex-row @[600px]:items-center @[600px]:justify-between @[600px]:gap-[18px]",
} as const;

/** "A product by quirq.ai ↗ · (●) 100% of this repo is written and managed by agents. · (lock) We don't collect or store your file data." */
export function AttributionRow({
  href = "https://quirq.ai",
  layout = "auto",
  tone = "quirq",
  agentNote = "100% of this repo is written and managed by agents.",
  privacyNote = "We don’t collect or store your file data.",
  className,
}: AttributionRowProps) {
  const t = ATTR_TONE[tone];
  return (
    <div className={cn("@container min-w-0", className)}>
      <div className={cn("flex min-w-0 text-[10px] leading-[1.5]", t.text, ATTR_LAYOUT[layout])}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("group inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] no-underline transition-colors", t.text, t.hover)}
        >
          A product by <strong className={cn("font-medium transition-colors", t.strong, t.hover)}>quirq.ai</strong>
          <span className={cn("ml-[3px] inline-flex", t.arrow)}>
            <LineIcon name="external-link" size={12} />
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <span className="flex items-center gap-[7px]">
          <span aria-hidden="true" className={cn("size-1 shrink-0 rounded-full", t.pip)} />
          {agentNote}
        </span>
        <span className={cn("flex items-center gap-1.5", t.soft)}>
          <span className={cn("inline-flex", t.lock)}>
            <LineIcon name="lock" size={12} />
          </span>
          {privacyNote}
        </span>
      </div>
    </div>
  );
}
