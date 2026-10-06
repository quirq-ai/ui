// Framed screenshots for the landing: FramedMedia (product UI in a dark hair-strong frame,
// radius 8.5 or 20, ink or warm ground) and BrowserFrame (a grey browser shell with a mono
// URL pill, bottom-anchored inside a tile or standing alone), plus MediaTile, the bento tile
// that holds one. Screens are real product renders, never fake glow. Server-safe, no hooks.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FramedMediaProps = {
  /** The screen: an inline SVG render or an image with alt text. */
  children: ReactNode;
  /** sm 8.5px (space graph), lg 20px (environment view). */
  radius?: "sm" | "lg";
  /** ink #0b0d0c, or warm #1c1710 for the layers panel. */
  tone?: "ink" | "warm";
  /** Inset the screen inside the frame (panels inside a panel). */
  inset?: boolean;
  /** Optional caption under the frame. */
  caption?: ReactNode;
  className?: string;
};

/** Product UI in a dark frame with a hair-strong border. */
export function FramedMedia({ children, radius = "sm", tone = "ink", inset = false, caption, className }: FramedMediaProps) {
  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <div
        className={cn(
          "overflow-hidden border border-hair-strong",
          radius === "sm" ? "rounded-[8.5px]" : "rounded-[20px]",
          tone === "warm" ? "bg-[#1c1710]" : "bg-[#0b0d0c]",
          inset && (radius === "sm" ? "p-2" : "p-3"),
        )}
      >
        <div className={cn(inset && "overflow-hidden", inset && (radius === "sm" ? "rounded-[5px]" : "rounded-[12px]"))}>{children}</div>
      </div>
      {caption ? <figcaption className="mt-2.5 text-[12.5px] leading-snug text-ink-faint">{caption}</figcaption> : null}
    </figure>
  );
}

export type BrowserFrameProps = {
  /** Shown in the mono URL pill, such as quirq.ai */
  url: string;
  children: ReactNode;
  /** bottom: open at the bottom edge, for a tile that crops it. full: closed on every side. */
  anchor?: "bottom" | "full";
  className?: string;
};

/** Grey browser shell with a centered URL pill, as in the landing bento. */
export function BrowserFrame({ url, children, anchor = "bottom", className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 bg-[rgba(217,217,217,.2)] p-[9px]",
        anchor === "bottom" ? "self-end rounded-t-[15px] pb-0" : "rounded-[15px]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-[9px] flex h-4 w-[45%] min-w-[90px] items-center justify-center truncate rounded-[4px] bg-[rgba(178,178,178,.35)] font-mono text-[9px] text-white/50"
      >
        {url}
      </div>
      <div className={cn("overflow-hidden", anchor === "bottom" ? "rounded-t-[12px]" : "rounded-[12px]")}>{children}</div>
    </div>
  );
}

export type MediaTileProps = {
  title: ReactNode;
  body: ReactNode;
  /** The framed media, anchored to the bottom edge. */
  children: ReactNode;
  /** Small label above the title, such as "Mock data". */
  kicker?: ReactNode;
  className?: string;
};

/** Glass bento tile: title, body, then media anchored to the bottom edge. */
export function MediaTile({ title, body, children, kicker, className }: MediaTileProps) {
  return (
    <article className={cn("glass flex min-w-0 flex-col overflow-hidden px-[clamp(18px,3vw,26px)] pt-[clamp(20px,3vw,27px)] md:min-h-[420px]", className)}>
      {kicker ? <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p> : null}
      <h4 className="text-[clamp(19px,2vw,26px)] font-semibold tracking-[-0.015em] text-ink">{title}</h4>
      <p className="mt-2 max-w-[56ch] text-[clamp(14px,1.35vw,17px)] leading-[1.45] text-white/55">{body}</p>
      <div className="relative mt-[22px] flex flex-1 items-end justify-center">{children}</div>
    </article>
  );
}
