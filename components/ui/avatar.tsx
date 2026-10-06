// Avatars: Avatar (initials from a name on a tint picked deterministically from the spectrum,
// optional status dot, optional runtime logo or custom glyph for agents, no remote images)
// and AvatarGroup (overlapping stack with a +N overflow chip). Server-safe and hydration
// stable: the hue comes from a string hash, never from randomness.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toneFor, type Tone } from "./tones";
import { StatusDot, type DotStatus } from "./status";
import { RuntimeLogo, type LogoAlias, type LogoId } from "./runtime-logo";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizePx: Record<AvatarSize, number> = { xs: 20, sm: 24, md: 32, lg: 40, xl: 56 };
const textCls: Record<AvatarSize, string> = {
  xs: "text-[8.5px]",
  sm: "text-[9.5px]",
  md: "text-[11.5px]",
  lg: "text-[13.5px]",
  xl: "text-[18px]",
};
const dotSize: Record<AvatarSize, "xs" | "sm" | "md" | "lg"> = { xs: "xs", sm: "xs", md: "sm", lg: "md", xl: "lg" };

/* Tints are mixed into the ground rather than made transparent, so overlapping faces in a
   group stay opaque and never show the avatar underneath. */
const tint: Record<Exclude<Tone, "neutral">, string> = {
  red: "bg-[color-mix(in_srgb,var(--red)_17%,var(--bg))] text-red border-red/35",
  org: "bg-[color-mix(in_srgb,var(--org)_17%,var(--bg))] text-org border-org/35",
  yel: "bg-[color-mix(in_srgb,var(--yel)_14%,var(--bg))] text-yel border-yel/30",
  grn: "bg-[color-mix(in_srgb,var(--grn)_15%,var(--bg))] text-grn border-grn/35",
  cyn: "bg-[color-mix(in_srgb,var(--cyn)_14%,var(--bg))] text-cyn border-cyn/30",
  blu: "bg-[color-mix(in_srgb,var(--blu)_17%,var(--bg))] text-blu border-blu/35",
  pur: "bg-[color-mix(in_srgb,var(--pur)_17%,var(--bg))] text-pur border-pur/35",
};

/** Initials for a name: "Ada Moreno" reads AM, "kenji" reads KE, "tomás@example.com" reads TO. */
export function initialsFor(name: string): string {
  const clean = name.trim().replace(/@.*$/, "");
  const words = clean.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  const first = Array.from(words[0])[0] ?? "";
  const last = Array.from(words[words.length - 1])[0] ?? "";
  return (first + last).toUpperCase();
}

export type AvatarProps = {
  /** Person or agent name; drives initials, hue and the accessible name. */
  name: string;
  size?: AvatarSize;
  /** Presence or run state, shown bottom right with a ground-colored ring. */
  status?: DotStatus;
  /** Agent avatar: show this runtime's logo instead of initials. */
  runtime?: LogoId | LogoAlias;
  /** Any glyph (a lucide icon) instead of initials. */
  glyph?: ReactNode;
  /** Agents read better square; people stay round. Defaults to square when runtime is set. */
  shape?: "circle" | "square";
  /** Force a tone instead of the hashed one. */
  tone?: Exclude<Tone, "neutral">;
  /** Render without an accessible name when the name is printed next to it. */
  decorative?: boolean;
  className?: string;
};

/** Initials or runtime glyph on a deterministic spectrum tint. */
export function Avatar({ name, size = "md", status, runtime, glyph, shape, tone, decorative = false, className }: AvatarProps) {
  const px = sizePx[size];
  const square = (shape ?? (runtime ? "square" : "circle")) === "square";
  const t = tone ?? toneFor(name);
  const content = runtime ? (
    <RuntimeLogo id={runtime} size={Math.round(px * 0.55)} decorative />
  ) : glyph ? (
    <span aria-hidden="true" className="inline-flex size-full items-center justify-center [&_svg]:size-[55%]">
      {glyph}
    </span>
  ) : (
    <span aria-hidden="true" className="font-mono font-medium leading-none tracking-[0.02em]">
      {initialsFor(name)}
    </span>
  );

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
      title={decorative ? undefined : name}
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
    >
      <span
        className={cn(
          "inline-flex size-full select-none items-center justify-center overflow-hidden border",
          square ? (size === "xl" ? "rounded-[12px]" : "rounded-[7px]") : "rounded-full",
          runtime ? "border-hair bg-s3 text-ink" : tint[t],
          textCls[size],
        )}
      >
        {content}
      </span>
      {status ? (
        <span className="absolute -bottom-px -right-px inline-flex rounded-full bg-bg p-[2px]">
          <StatusDot status={status} size={dotSize[size]} halo={false} pulse={status === "busy"} />
        </span>
      ) : null}
    </span>
  );
}

export type AvatarGroupProps = {
  /** Names in display order. */
  names: string[];
  /** How many to show before the +N chip. */
  max?: number;
  size?: AvatarSize;
  /** Group name for screen readers; defaults to a list of the names. */
  label?: string;
  className?: string;
};

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Overlapping avatars with an overflow chip: [AM][KS] +2. Read as one image named by
    every person in it; each face keeps a hover title for sighted users. */
export function AvatarGroup({ names, max = 3, size = "sm", label, className }: AvatarGroupProps) {
  const shown = names.slice(0, max);
  const hidden = names.slice(max);
  const px = sizePx[size];
  return (
    <span role="img" aria-label={label ?? listNames(names)} className={cn("inline-flex items-center", className)}>
      {shown.map((n, i) => (
        <span key={`${n}-${i}`} title={n} className={cn("inline-flex rounded-full ring-2 ring-bg", i > 0 && "-ml-1.5")}>
          <Avatar name={n} size={size} decorative />
        </span>
      ))}
      {hidden.length > 0 ? (
        <span
          title={hidden.join(", ")}
          className={cn(
            "-ml-1.5 inline-flex items-center justify-center rounded-full border border-hair bg-s3 px-1.5 font-mono font-medium tabular-nums text-ink-dim ring-2 ring-bg",
            textCls[size],
          )}
          style={{ height: px, minWidth: px }}
        >
          +{hidden.length}
        </span>
      ) : null}
    </span>
  );
}
