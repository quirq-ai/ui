// Keyboard hints: Kbd (one mono keycap) and KeyCombo (keys pressed together or in sequence,
// marked up as nested <kbd> per HTML). Named keys map to glyphs (mod and cmd to ⌘, enter to ↵)
// and to spoken names for screen readers. Server-safe; deterministic (no platform sniffing,
// pass "Ctrl" yourself for non-Mac copy).
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Glyph and spoken name for named keys. Anything else renders as given. */
export const KEY_GLYPHS: Record<string, { glyph: string; name: string }> = {
  mod: { glyph: "⌘", name: "Command" },
  cmd: { glyph: "⌘", name: "Command" },
  ctrl: { glyph: "Ctrl", name: "Control" },
  shift: { glyph: "⇧", name: "Shift" },
  alt: { glyph: "⌥", name: "Option" },
  opt: { glyph: "⌥", name: "Option" },
  enter: { glyph: "↵", name: "Enter" },
  return: { glyph: "↵", name: "Return" },
  esc: { glyph: "Esc", name: "Escape" },
  escape: { glyph: "Esc", name: "Escape" },
  tab: { glyph: "⇥", name: "Tab" },
  backspace: { glyph: "⌫", name: "Backspace" },
  delete: { glyph: "⌦", name: "Delete" },
  space: { glyph: "Space", name: "Space" },
  up: { glyph: "↑", name: "Up arrow" },
  down: { glyph: "↓", name: "Down arrow" },
  left: { glyph: "←", name: "Left arrow" },
  right: { glyph: "→", name: "Right arrow" },
  slash: { glyph: "/", name: "Slash" },
};

function resolve(key: string) {
  const hit = KEY_GLYPHS[key.toLowerCase()];
  return hit ?? { glyph: key.length === 1 ? key.toUpperCase() : key, name: key.length === 1 ? key.toUpperCase() : key };
}

export type KbdSize = "xs" | "sm" | "md";
const sizeCls: Record<KbdSize, string> = {
  xs: "h-4 min-w-4 px-1 text-[9px]",
  sm: "h-5 min-w-5 px-1.5 text-[10.5px]",
  md: "h-6 min-w-6 px-1.5 text-[12px]",
};

export type KbdProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** A named key ("mod", "enter", "esc", "up") or a literal ("K", "/", "E"). */
  children: string;
  size?: KbdSize;
  /** Show as held down (demo controls). */
  pressed?: boolean;
  /** Quieter cap for use inside buttons and inputs. */
  subtle?: boolean;
};

const capCls = "inline-flex shrink-0 items-center justify-center rounded-[4px] border font-mono font-medium leading-none tabular-nums";

/** One keycap. Screen readers hear the key name ("Command"), sighted users see the glyph. */
export function Kbd({ children, size = "sm", pressed = false, subtle = false, className, ...rest }: KbdProps) {
  const k = resolve(children);
  const named = k.name !== k.glyph;
  return (
    <kbd
      className={cn(
        capCls,
        sizeCls[size],
        pressed
          ? "translate-y-px border-blu/60 bg-blu/15 text-ink"
          : subtle
            ? "border-hair bg-white/[0.03] text-ink-faint"
            : "border-hair-strong bg-white/[0.05] text-ink-dim shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
      {...rest}
    >
      {named ? (
        <>
          {/* single symbol glyphs (⌘ ⇧ ↵) sit small in mono, so they get a size bump */}
          <span aria-hidden="true" className={cn(k.glyph.length === 1 && "text-[1.3em] leading-none")}>
            {k.glyph}
          </span>
          <span className="sr-only">{k.name}</span>
        </>
      ) : (
        k.glyph
      )}
    </kbd>
  );
}

export type KeyComboProps = {
  /** Keys in order, such as ["mod", "K"], or ["G", "P"] with mode "sequence". */
  keys: string[];
  /** "together" joins caps tightly (⌘K); "sequence" puts a faint "then" between them. */
  mode?: "together" | "sequence";
  size?: KbdSize;
  subtle?: boolean;
  /** Optional caption after the caps ("to search"). */
  children?: ReactNode;
  className?: string;
};

/** Shortcut made of several keys, with an optional caption: ⌘ K to search. */
export function KeyCombo({ keys, mode = "together", size = "sm", subtle, children, className }: KeyComboProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] text-ink-dim", className)}>
      <kbd className="inline-flex items-center gap-1 font-[inherit]">
        {keys.map((key, i) => (
          <span key={`${key}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && mode === "sequence" ? <span className="font-mono text-[10px] text-ink-faint">then</span> : null}
            <Kbd size={size} subtle={subtle}>
              {key}
            </Kbd>
          </span>
        ))}
      </kbd>
      {children ? <span>{children}</span> : null}
    </span>
  );
}
