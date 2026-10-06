// Keyboard hints that teach shortcuts inline: ShortcutTrigger (the ⌘K search trigger, Ctrl K
// off Mac), HintBar (palette footer: ↑↓ navigate, ↵ open, Esc close), Keycap and KeyCluster
// (the WASD block with a pressed state), KbdButton (Open file [E], Atlas [M], action pills)
// and ControlsGrid (a manual of keys and what they do). Built on the shared Kbd and KeyCombo.
// Server-safe: no hooks; pass the platform in, never sniff it during render.
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd, KeyCombo, KEY_GLYPHS } from "@/components/ui/kbd";

export type Platform = "mac" | "other";

/** Maps "mod" to Ctrl and Option to Alt off Mac, so copy reads right on every platform. */
export function platformKeys(keys: string[], platform: Platform): string[] {
  if (platform === "mac") return keys;
  return keys.map((k) => {
    const l = k.toLowerCase();
    if (l === "mod" || l === "cmd" || k === "⌘") return "Ctrl";
    if (l === "alt" || l === "opt" || k === "⌥") return "Alt";
    if (k === "⇧") return "Shift";
    return k;
  });
}

/** aria-keyshortcuts value ("Meta+K", "Control+Shift+L") for keys as shown. */
function ariaKeys(keys: string[]): string {
  const names: Record<string, string> = {
    mod: "Meta",
    cmd: "Meta",
    "⌘": "Meta",
    ctrl: "Control",
    shift: "Shift",
    "⇧": "Shift",
    alt: "Alt",
    opt: "Alt",
    "⌥": "Alt",
    esc: "Escape",
    enter: "Enter",
    space: "Space",
  };
  return keys.map((k) => names[k.toLowerCase()] ?? (k.length === 1 ? k.toUpperCase() : k)).join("+");
}

/* ----------------------------------------------------------------------------- ShortcutTrigger */

export type ShortcutTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Visible label, hidden when compact. */
  label?: string;
  /** Shortcut keys, named or literal. */
  keys?: string[];
  platform?: Platform;
  /** Icon and keys only (narrow top bars). The label stays as the accessible name. */
  compact?: boolean;
  /** Show the hover look without interaction. */
  preview?: "hover";
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Top bar trigger for the command palette: icon, label and the ⌘K hint. Sets
 * aria-keyshortcuts, so bind the shortcut wherever this trigger is used.
 */
export function ShortcutTrigger({
  label = "Search or jump to",
  keys = ["mod", "K"],
  platform = "mac",
  compact = false,
  preview,
  className,
  type = "button",
  ...rest
}: ShortcutTriggerProps) {
  const shown = platformKeys(keys, platform);
  const spoken = shown.map((k) => KEY_GLYPHS[k.toLowerCase()]?.name ?? k).join(" ");
  return (
    <button
      type={type}
      aria-label={compact ? `${label} (${spoken})` : undefined}
      aria-keyshortcuts={ariaKeys(shown)}
      className={cn(
        "group/trig inline-flex h-8 max-w-full shrink-0 items-center gap-2 rounded-[8px]! border px-2.5 text-[12.5px] transition-[background-color,border-color,color] duration-150",
        preview === "hover" ? "border-hair bg-s3 text-ink-dim" : "border-hair-soft bg-s1 text-ink-faint hover:border-hair hover:bg-s3 hover:text-ink-dim",
        className,
      )}
      {...rest}
    >
      <Search aria-hidden="true" className="size-3.5 shrink-0" />
      {compact ? null : <span className="truncate">{label}</span>}
      <KeyCombo keys={shown} size="xs" subtle className={cn(!compact && "ml-3")} />
    </button>
  );
}

/* ----------------------------------------------------------------------------- HintBar */

export type Hint = { keys: string[]; label: string; mode?: "together" | "sequence" };

/** Palette footer: "↑ ↓ navigate · ↵ open · Esc close". */
export function HintBar({ hints, className }: { hints: Hint[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-ink-faint", className)}>
      {hints.map((h) => (
        <li key={h.label} className="inline-flex items-center gap-1.5">
          <kbd className="inline-flex items-center gap-1 font-[inherit]">
            {h.keys.map((k, i) => (
              <span key={`${k}-${i}`} className="inline-flex items-center gap-1">
                {i > 0 && h.mode === "sequence" ? <span className="font-mono text-[10px]">then</span> : null}
                <Kbd size="xs" subtle>
                  {k}
                </Kbd>
              </span>
            ))}
          </kbd>
          <span>{h.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------------------- Keycap */

export type KeycapSize = "sm" | "md" | "lg";
const capSize: Record<KeycapSize, string> = {
  sm: "h-[21px] px-[5px] text-[9.5px]",
  md: "h-7 px-1.5 text-[11px]",
  lg: "h-9 px-2 text-[12.5px]",
};
const capMin: Record<KeycapSize, string> = { sm: "min-w-[21px]", md: "min-w-7", lg: "min-w-9" };

/* keys that read better as a symbol than as a word on a keycap */
const SYMBOL_KEYS = new Set(["mod", "cmd", "alt", "opt", "enter", "return", "tab", "backspace", "delete", "up", "down", "left", "right"]);

/** Larger keycap for clusters and manuals. Pressed lights it in cyan and drops it 1px. */
export function Keycap({ children, size = "md", pressed = false, wide = false, className }: { children: string; size?: KeycapSize; pressed?: boolean; wide?: boolean; className?: string }) {
  const key = children.toLowerCase();
  const named = SYMBOL_KEYS.has(key) ? KEY_GLYPHS[key] : undefined;
  return (
    <kbd
      data-pressed={pressed || undefined}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-[4px] border font-mono font-medium uppercase leading-none tracking-[0.04em] transition-[background-color,border-color,color,transform] duration-100",
        capSize[size],
        wide ? "min-w-[64px]" : capMin[size],
        pressed
          ? "translate-y-px border-cyn/70 bg-cyn/20 text-ink shadow-[0_0_0_3px_rgba(47,210,255,0.12)]"
          : "border-blu/30 bg-blu/[0.06] text-[#bec9e6] shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]",
        className,
      )}
    >
      {named ? (
        <>
          <span aria-hidden="true" className={cn(named.glyph.length === 1 && "text-[1.3em] leading-none")}>
            {named.glyph}
          </span>
          <span className="sr-only">{named.name}</span>
        </>
      ) : (
        children
      )}
    </kbd>
  );
}

/* ----------------------------------------------------------------------------- KeyCluster */

export type KeyClusterProps = {
  /** Keys above, centered: ["W"]. */
  top: string[];
  /** Keys below: ["A", "S", "D"]. */
  bottom: string[];
  /** Keys currently held, matched case-insensitively. */
  pressed?: string[];
  size?: KeycapSize;
  /** Mono caption to the right: "Thrust and steer". */
  caption?: ReactNode;
  className?: string;
};

/** WASD style block: one row centered over another, with a caption. */
export function KeyCluster({ top, bottom, pressed = [], size = "md", caption, className }: KeyClusterProps) {
  const held = new Set(pressed.map((k) => k.toLowerCase()));
  return (
    <div className={cn("inline-flex items-center gap-4", className)}>
      <div className="inline-flex flex-col items-center gap-[3px]" aria-label={`${[...top, ...bottom].join(" ")} keys`} role="group">
        <div className="flex gap-[3px]">
          {top.map((k) => (
            <Keycap key={k} size={size} pressed={held.has(k.toLowerCase())}>
              {k}
            </Keycap>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {bottom.map((k) => (
            <Keycap key={k} size={size} pressed={held.has(k.toLowerCase())}>
              {k}
            </Keycap>
          ))}
        </div>
      </div>
      {caption ? <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{caption}</span> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- KbdButton */

export type KbdButtonVariant = "scan" | "pill" | "map";

export type KbdButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  /** The key that does the same thing: "E". */
  keyHint: string;
  /**
   * scan: full width outline in blue, label left and key right ("Open file  E").
   * pill: compact action pill, key first ("L  Land").
   * map: glass button, label then key ("Atlas  M").
   */
  variant?: KbdButtonVariant;
  /** Show as held (the key is down). */
  pressed?: boolean;
  icon?: ReactNode;
};

/**
 * A button that carries its keyboard shortcut as a chip. The chip only teaches the key; pass
 * aria-keyshortcuts as well when the surface actually binds it.
 */
export function KbdButton({ label, keyHint, variant = "pill", pressed = false, icon, className, type = "button", ...rest }: KbdButtonProps) {
  const chip = (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-[3px] border px-1 font-mono text-[9.5px] font-medium uppercase leading-none transition-colors duration-100",
        pressed
          ? "translate-y-px border-cyn/70 bg-cyn/20 text-ink"
          : variant === "scan"
            ? "border-blu/45 bg-blu/10 text-blu"
            : "border-hair-strong bg-white/[0.04] text-ink-dim",
      )}
    >
      {keyHint}
    </kbd>
  );
  return (
    <button
      type={type}
      data-pressed={pressed || undefined}
      className={cn(
        "inline-flex max-w-full shrink-0 items-center whitespace-nowrap border transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px",
        variant === "scan" &&
          cn(
            "w-full justify-between gap-3 rounded-[3px]! px-3 py-2 text-[11px] text-blu",
            pressed ? "border-blu bg-blu/20" : "border-blu/45 bg-blu/[0.08] hover:border-blu hover:bg-blu/15",
          ),
        variant === "pill" &&
          cn(
            "gap-2 rounded-[5px]! px-2.5 py-1.5 text-[11.5px]",
            pressed ? "border-hair-strong bg-s3 text-ink" : "border-hair bg-s1 text-ink-dim hover:border-hair-strong hover:text-ink",
          ),
        variant === "map" &&
          cn(
            "gap-2.5 rounded-[9px]! px-3 py-2 text-[12px] backdrop-blur-md",
            pressed ? "border-hair-strong bg-[rgba(52,52,56,0.85)] text-ink" : "border-white/20 bg-[rgba(16,21,29,0.9)] text-ink-dim hover:border-white/35 hover:text-ink",
          ),
        className,
      )}
      {...rest}
    >
      {variant === "pill" ? chip : null}
      {icon ? <span aria-hidden="true" className="inline-flex [&_svg]:size-3.5">{icon}</span> : null}
      <span className="truncate">{label}</span>
      {variant === "pill" ? null : chip}
    </button>
  );
}

/* ----------------------------------------------------------------------------- ControlsGrid */

export type ControlRow = { keys: string[]; label: string; alt?: string };

/** Manual of controls: keycaps on the left, what they do on the right. */
export function ControlsGrid({ rows, className }: { rows: ControlRow[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5", className)}>
      {rows.map((r) => (
        <div key={r.label} className="contents">
          <dt className="flex flex-wrap items-center gap-1">
            {r.keys.map((k, i) => (
              <span key={`${k}-${i}`} className="inline-flex items-center gap-1">
                {i > 0 ? <span className="font-mono text-[9px] text-ink-faint">/</span> : null}
                <Keycap size="sm" wide={k.length > 3}>
                  {k}
                </Keycap>
              </span>
            ))}
          </dt>
          <dd className="text-[12px] text-ink-dim">
            {r.label}
            {r.alt ? <span className="text-ink-faint"> · {r.alt}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
