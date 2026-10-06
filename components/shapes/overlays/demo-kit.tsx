// Demo scaffolding for the overlays category: mono captions, labelled examples, and a
// Stage that paints a dimmed product screen behind a static overlay so each surface reads
// in context. Hook-free and server-safe; nothing here is part of the reusable shapes.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { mulberry32 } from "@/lib/fixtures";

const captionCls = "font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint";

/** Small mono caption used above every example. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(captionCls, className)}>{children}</span>;
}

/** One labelled example: caption (and an optional note) over the content. */
export function Example({
  caption,
  note,
  children,
  className,
}: {
  caption: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("m-0 flex min-w-0 flex-col", className)}>
      <figcaption className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className={captionCls}>{caption}</span>
        {note ? <span className="text-[11.5px] leading-snug text-ink-faint">{note}</span> : null}
      </figcaption>
      {children}
    </figure>
  );
}

/** Section divider inside a demo: caption with a hairline. */
export function DemoSection({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className={captionCls}>{title}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-hair-soft" />
      </div>
      {children}
    </section>
  );
}

/* ----------------------------------------------------------------------------- Stage */

export type StageAlign = "center" | "right" | "top" | "start";

const alignCls: Record<StageAlign, string> = {
  center: "items-center justify-center p-3 sm:p-6",
  right: "items-stretch justify-end",
  top: "items-start justify-center p-3 pt-6 sm:p-6 sm:pt-8",
  start: "items-start justify-start p-3 sm:p-5",
};

/** Dimmed product screen behind a static overlay. Decorative layers are aria-hidden. It grows
    to fill its example, so stages in one grid row line up. */
export function Stage({
  children,
  align = "center",
  scrim = true,
  backdrop = "app",
  minHeight,
  className,
  innerClassName,
}: {
  children: ReactNode;
  align?: StageAlign;
  scrim?: boolean;
  backdrop?: "app" | "space" | "none";
  minHeight?: number;
  className?: string;
  innerClassName?: string;
}) {
  const style: CSSProperties | undefined = minHeight ? { minHeight } : undefined;
  return (
    <div
      className={cn("relative isolate flex grow flex-col overflow-hidden rounded-[14px] border border-hair-soft bg-[#09090a]", className)}
      style={style}
    >
      {backdrop === "app" ? <FauxApp /> : backdrop === "space" ? <FauxSpace /> : null}
      {scrim ? <div aria-hidden="true" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" /> : null}
      <div className={cn("relative flex min-h-0 min-w-0 flex-1", alignCls[align], innerClassName)}>{children}</div>
    </div>
  );
}

/** A quiet Space dashboard silhouette: top bar, sidebar and cards. */
export function FauxApp({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 flex flex-col", className)}>
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-hair-soft px-3">
        <span className="size-2 rounded-full bg-[#83d63a]/70" />
        <span className="h-2 w-16 rounded-full bg-white/[0.09]" />
        <span className="ml-auto h-5 w-24 rounded-full bg-white/[0.05]" />
        <span className="size-5 rounded-full bg-white/[0.07]" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[22%] max-w-[180px] shrink-0 flex-col gap-2.5 border-r border-hair-soft p-3 sm:flex">
          {[70, 54, 62, 48, 58, 40].map((w, i) => (
            <span key={i} className="h-2 rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="grid flex-1 auto-rows-[88px] grid-cols-2 gap-3 p-3 sm:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="rounded-[10px] border border-hair-soft bg-white/[0.025]" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* deterministic starfield, computed once at module load */
const STARS = (() => {
  const rng = mulberry32(4711);
  return Array.from({ length: 46 }, () => ({
    x: Math.round(rng() * 1000) / 10,
    y: Math.round(rng() * 1000) / 10,
    r: rng() > 0.85 ? 1.6 : 0.9,
    o: Math.round((0.25 + rng() * 0.55) * 100) / 100,
  }));
})();

/** Deep field behind the space-drift dialogs and HUD markers. */
export function FauxSpace({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background:
          "radial-gradient(120% 80% at 70% 20%, rgba(46,155,255,0.16), transparent 60%), radial-gradient(90% 70% at 10% 90%, rgba(191,90,242,0.12), transparent 60%), #04060d",
      }}
    >
      <svg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.18} fill="#fff" opacity={s.o} />
        ))}
      </svg>
      <div className="absolute left-[58%] top-[30%] size-28 rounded-full border border-blu/25 bg-[radial-gradient(circle_at_35%_35%,rgba(46,155,255,0.45),rgba(46,155,255,0.05)_70%)]" />
      <div className="absolute left-[18%] top-[62%] size-14 rounded-full border border-pur/25 bg-[radial-gradient(circle_at_35%_35%,rgba(191,90,242,0.4),rgba(191,90,242,0.04)_70%)]" />
    </div>
  );
}

/** Status line for demo results ("Closed. Focus returned to the button."). Polite live region. */
export function DemoStatus({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("min-h-[18px] text-[12px] text-ink-dim", className)}>
      {children}
    </p>
  );
}
