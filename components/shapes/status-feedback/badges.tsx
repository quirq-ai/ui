// Badges, tags and mono chips: small static labels for type, tier, role and count.
// Built on the ui Badge and Count. Adds the product-specific chips: TierTag, MarkerTag,
// HttpChip, IntegrationChip, ChipRow, LabelPill, FactChip, AccountChip, ActionTag and
// RuntimeChip. None of these are interactive. Server-safe.
import type { ReactNode } from "react";
import { Ban } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { RuntimeLogo, type LogoAlias, type LogoId } from "@/components/ui/runtime-logo";
import { toneBg, toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- TierTag */

export type Tier = "open-source" | "managed" | "enterprise";

/** Color is semantic: blue open source, green managed, orange enterprise. */
export const TIER_META: Record<Tier, { label: string; tone: Tone }> = {
  "open-source": { label: "Free · open source", tone: "blu" },
  managed: { label: "Managed", tone: "grn" },
  enterprise: { label: "Enterprise", tone: "org" },
};

export function TierTag({ tier, variant = "outline", className }: { tier: Tier; variant?: "outline" | "soft" | "solid"; className?: string }) {
  const t = TIER_META[tier];
  return (
    <Badge tone={t.tone} variant={variant} mono size="md" className={className}>
      {t.label}
    </Badge>
  );
}

/* ----------------------------------------------------------------------------- MarkerTag */

export type Marker = "featured" | "new" | "sample" | "start-here" | "interactive" | "deployed" | "local-only" | "beta" | "coming-soon" | "not-supported";

/** Card markers from the landing and app chrome: FEATURED, NEW, SAMPLE, ● DEPLOYED, LOCAL ONLY. */
export function MarkerTag({ kind, className }: { kind: Marker; className?: string }) {
  switch (kind) {
    case "featured":
      return <span className={cn("font-mono text-[9px] uppercase tracking-[0.14em] text-grn", className)}>Featured</span>;
    case "new":
      return <span className={cn("font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint", className)}>New</span>;
    case "interactive":
      return <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em] text-grn", className)}>Interactive</span>;
    case "sample":
      return (
        <Badge tone="org" variant="outline" mono className={className}>
          Sample
        </Badge>
      );
    case "start-here":
      return (
        <Badge tone="grn" variant="outline" mono className={className}>
          Start here
        </Badge>
      );
    case "deployed":
      return (
        <span
          className={cn(
            "inline-flex h-[18px] items-center gap-1 rounded-[5px] bg-[#57b6ff] px-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#0a1018]",
            className,
          )}
        >
          <span aria-hidden="true" className="size-[5px] rounded-full bg-[#0a1018]" />
          Deployed
        </span>
      );
    case "local-only":
      return (
        <span className={cn("inline-flex items-center border border-hair-strong px-1.5 py-[3px] font-mono text-[8.5px] uppercase leading-none tracking-[0.12em] text-ink-dim", className)}>
          Local only
        </span>
      );
    case "beta":
      return (
        <Badge tone="neutral" variant="outline" mono className={className}>
          Beta
        </Badge>
      );
    case "coming-soon":
      return (
        <Badge tone="neutral" variant="outline" className={className}>
          Coming soon
        </Badge>
      );
    case "not-supported":
      return (
        <Badge tone="red" variant="soft" mono icon={<Ban />} className={cn("rounded-full!", className)}>
          Not supported
        </Badge>
      );
  }
}

/* ----------------------------------------------------------------------------- HttpChip */

export type HttpChipProps = {
  status: number;
  method?: string;
  path?: string;
  /** Short reason, such as "Only GET and HEAD: files are read only". */
  note?: ReactNode;
  className?: string;
};

/** Status code tone: 2xx green, 3xx grey, 4xx and 5xx red. */
export function httpTone(status: number): Tone {
  if (status >= 200 && status < 300) return "grn";
  if (status >= 300 && status < 400) return "neutral";
  return "red";
}

/** One gateway exchange in mono: POST /__xo/api/sources → 201, with an optional reason. */
export function HttpChip({ status, method, path, note, className }: HttpChipProps) {
  const tone = httpTone(status);
  return (
    <span className={cn("inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] leading-none", className)}>
      {method ? <span className="shrink-0 text-ink-faint">{method}</span> : null}
      {path ? <span className="min-w-0 truncate text-ink-dim">{path}</span> : null}
      {method || path ? (
        <span aria-hidden="true" className="text-ink-faint">
          →
        </span>
      ) : null}
      <Badge tone={tone} variant={tone === "neutral" ? "outline" : "soft"} mono size="sm" className="tabular-nums">
        {status}
      </Badge>
      {note ? <span className="min-w-0 font-sans text-[11.5px] text-ink-dim">{note}</span> : null}
    </span>
  );
}

/* ----------------------------------------------------------------------------- IntegrationChip and ChipRow */

/** Static integration or runtime chip with its glyph. Deliberately not a link. */
export function IntegrationChip({ id, label, className }: { id?: LogoId | LogoAlias; label: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center gap-2 rounded-[6px] border border-hair bg-white/[0.03] px-2.5 text-[12px] text-ink-dim", className)}>
      {id ? <RuntimeLogo id={id} size={14} decorative /> : null}
      {label}
    </span>
  );
}

/** Mono kicker followed by a wrapping row of plain chips: "Runs on Google Cloud · Azure · Nebius". */
export function ChipRow({ kicker, items, className }: { kicker?: ReactNode; items: ReactNode[]; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2.5", className)}>
      {kicker ? <span className="mr-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{kicker}</span> : null}
      {items.map((it, i) => (
        <span key={i} className="inline-flex h-6 shrink-0 items-center rounded-[6px] border border-hair-soft bg-s2 px-2 text-[11.5px] text-ink-dim">
          {it}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Small tags */

/** Issue label: lowercase with a tone dot. */
export function LabelPill({ name, tone, className }: { name: string; tone: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-hair bg-black/40 px-2 text-[11px] lowercase text-ink-dim", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", toneBg[tone])} />
      {name}
    </span>
  );
}

/** Uppercase fact: "2 ACCOUNTS", "TWO DESTINATIONS", "MASKED". */
export function FactChip({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-[4px] border px-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.06em]",
        tone === "neutral" ? "border-hair text-ink-dim" : [toneText[tone], "border-current/35 bg-current/[0.06]"],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Connection account: sentence case, truncates instead of wrapping. */
export function AccountChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 max-w-[200px] items-center rounded-[4px] border border-hair bg-s2 px-1.5 text-[11px] text-ink", className)}>
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Connector action category: READ (blue) or WRITE (amber). */
export function ActionTag({ kind, className }: { kind: "read" | "write"; className?: string }) {
  return (
    <Badge tone={kind === "read" ? "blu" : "org"} variant="outline" mono size="xs" className={className}>
      {kind}
    </Badge>
  );
}

/** Landing runtime chip: solid grey, mono bold, radius 6. */
export function RuntimeChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-[6px] bg-[#565656] px-2.5 py-1 font-mono text-[13px] font-bold leading-[1.2] text-white/80", className)}>
      {children}
    </span>
  );
}
