// Guided tour and target marker pieces. TourCard is the coachmark (title, text, "1 of 6",
// Back and Next, close to skip) with an optional arrow; Spotlight cuts a lit window in a dim
// scrim around the target; TargetMarker is the space-drift objective marker (a 3D diamond on
// screen, an edge arrow off screen, a mint chip when cleared). Hook-free.
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";

/* ----------------------------------------------------------------------------- TourCard */

export type TourCardProps = {
  title: ReactNode;
  children: ReactNode;
  /** 1-based step number. */
  step: number;
  total: number;
  onBack?: () => void;
  onNext?: () => void;
  /** Close button: skips the tour. */
  onSkip?: () => void;
  /** Arrow pointing at the target: side of the card and its offset from the left edge in px. */
  arrow?: { side: "top" | "bottom"; offset: number } | null;
  titleId?: string;
  titleAs?: "h2" | "h3";
  /** Id for the primary button, so the tour can move focus to it between steps. */
  nextId?: string;
  className?: string;
  style?: CSSProperties;
};

/** Coachmark card with a step count and Back / Next. */
export function TourCard({ title, children, step, total, onBack, onNext, onSkip, arrow, titleId, titleAs: Title = "h3", nextId, className, style }: TourCardProps) {
  const last = step >= total;
  return (
    <div
      className={cn(
        "relative w-[min(280px,100%)] rounded-[16px] border border-hair-strong bg-[rgba(28,28,30,0.96)] p-4 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl",
        className,
      )}
      style={style}
    >
      {arrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute size-3 -translate-x-1/2 rotate-45 border-hair-strong bg-[rgb(28,28,30)]",
            arrow.side === "top" ? "-top-[7px] border-l border-t" : "-bottom-[7px] border-b border-r",
          )}
          style={{ left: arrow.offset }}
        />
      ) : null}
      {onSkip ? (
        <IconButton aria-label="Close tour" size="xs" shape="circle" onClick={onSkip} className="absolute right-2.5 top-2.5">
          <X />
        </IconButton>
      ) : null}
      <Title id={titleId} className="pr-7 text-[17px] font-semibold leading-snug tracking-[-0.015em]">
        {title}
      </Title>
      <div className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{children}</div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {step} of {total}
        </span>
        <div className="flex items-center gap-1.5">
          {step > 1 ? (
            <Button size="sm" variant="subtle" leadingIcon={<ArrowLeft />} onClick={onBack} className="rounded-full!">
              Back
            </Button>
          ) : null}
          <Button id={nextId} size="sm" variant="primary" trailingIcon={last ? <Check /> : <ArrowRight />} onClick={onNext}>
            {last ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- Spotlight */

export type SpotRect = { top: number; left: number; width: number; height: number };

/** Lit window around a target, with the rest of its container dimmed. Parent clips overflow. */
export function Spotlight({ rect, radius = 16, className }: { rect: SpotRect | null; radius?: number; className?: string }) {
  if (!rect) return <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 bg-black/55 transition-colors", className)} />;
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute transition-[top,left,width,height,border-radius] duration-500 ease-quirq", className)}
      style={{
        ...rect,
        borderRadius: radius,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.58), inset 0 0 0 2px rgba(255,255,255,0.22), 0 0 24px rgba(255,255,255,0.08)",
      }}
    />
  );
}

/* ----------------------------------------------------------------------------- TargetMarker */

export type MarkerState = "onscreen" | "offscreen-left" | "offscreen-right" | "cleared";

/** Faceted diamond in cyan, drawn as a small octahedron. */
export function Diamond({ size = 34, tone = "cyn" }: { size?: number; tone?: "cyn" | "grn" }) {
  const c = `var(--${tone})`;
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 40 56" aria-hidden="true" style={{ filter: `drop-shadow(0 0 8px color-mix(in srgb, ${c} 55%, transparent))` }}>
      <polygon points="20,2 4,26 20,31" fill={c} fillOpacity="0.62" />
      <polygon points="20,2 36,26 20,31" fill={c} fillOpacity="0.38" />
      <polygon points="4,26 20,31 20,54" fill={c} fillOpacity="0.26" />
      <polygon points="36,26 20,31 20,54" fill={c} fillOpacity="0.14" />
      <polygon points="20,2 36,26 20,54 4,26" fill="none" stroke={c} strokeWidth="1.2" />
      <line x1="4" y1="26" x2="36" y2="26" stroke={c} strokeOpacity="0.5" strokeWidth="0.8" />
    </svg>
  );
}

export type TargetMarkerProps = {
  /** "Flight gate 01" */
  label: string;
  /** "42 u" or "open E" */
  detail?: string;
  state: MarkerState;
  /** Keep the label's own case instead of uppercasing it (file names such as README.md). */
  keepCase?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Objective marker: diamond and chip on screen, edge arrow off screen, mint chip when cleared. */
export function TargetMarker({ label, detail, state, keepCase = false, className, style }: TargetMarkerProps) {
  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[4px] border px-1.5 py-1 font-mono text-[9.5px] tracking-[0.12em]",
        state === "cleared" ? "border-grn/50 bg-grn/15 text-grn" : "border-cyn/40 bg-[rgba(9,23,39,0.86)] text-cyn",
      )}
    >
      {state === "cleared" ? <Check aria-hidden="true" className="size-3" /> : <span aria-hidden="true">◇</span>}
      <span className={keepCase ? "tracking-[0.04em]" : "uppercase"}>{label}</span>
      {detail ? <span className="uppercase text-ink-dim">· {detail}</span> : null}
    </span>
  );
  if (state === "offscreen-left" || state === "offscreen-right") {
    const left = state === "offscreen-left";
    return (
      <div role="img" aria-label={`${label} is off screen to the ${left ? "left" : "right"}. Turn toward the beacon.`} className={cn("flex items-center gap-2", !left && "flex-row-reverse", className)} style={style}>
        <svg width="22" height="34" viewBox="0 0 22 34" aria-hidden="true" style={{ filter: "drop-shadow(0 0 6px rgba(47,210,255,0.7))" }} className={left ? "" : "rotate-180"}>
          <path d="M18 3 L4 17 L18 31" fill="none" stroke="var(--cyn)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="flex flex-col gap-1">
          {chip}
          <span className={cn("font-mono text-[9px] uppercase tracking-[0.12em] text-cyn/80", !left && "text-right")}>Turn toward beacon</span>
        </span>
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={state === "cleared" ? `${label} cleared` : `${label}${detail ? `, ${detail}` : ""}`}
      className={cn("flex flex-col items-center gap-1.5", className)}
      style={style}
    >
      <span className={cn("transition-transform duration-500", state === "cleared" && "scale-110")}>
        <Diamond tone={state === "cleared" ? "grn" : "cyn"} />
      </span>
      {chip}
    </div>
  );
}
