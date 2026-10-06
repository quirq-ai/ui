// Spectrum accents: the seven-hue gradient (#ff453a to #bf5af2, 90deg) in small doses. Color
// is delivered value, grey is everything else, so the spectrum marks the minted side only and
// never fills a large area in UI. Chip, dash, hairline, quote bar, bullet and text. Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const SPECTRUM = "var(--spectrum)";

/** 11px rounded square, the eyebrow chip. */
export function SpectrumChip({ size = 11, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0", className)}
      style={{ width: size, height: size, borderRadius: size * 0.32, background: SPECTRUM, backgroundSize: "300% 100%" }}
    />
  );
}

/** 46 x 2 dash that trails an eyebrow with the rule modifier. */
export function SpectrumDash({ width = 46, height = 2, className }: { width?: number; height?: number; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block shrink-0 rounded-[2px] opacity-90", className)} style={{ width, height, background: SPECTRUM }} />;
}

/** 1px full-width hairline at 50%, the landing footer divider. */
export function SpectrumHairline({ opacity = 0.5, className }: { opacity?: number; className?: string }) {
  return <div aria-hidden="true" className={cn("h-px w-full", className)} style={{ background: SPECTRUM, opacity }} />;
}

/** Pull quote with a 3px spectrum bar on its leading edge. */
export function SpectrumQuote({ children, cite, className }: { children: ReactNode; cite?: ReactNode; className?: string }) {
  return (
    <figure className={cn("flex gap-4", className)}>
      <span aria-hidden="true" className="w-[3px] shrink-0 rounded-[2px]" style={{ background: "linear-gradient(180deg, #ff453a, #ff9f0a, #ffd60a, #30d158, #2fd2ff, #2e9bff, #bf5af2)" }} />
      <div className="min-w-0">
        <blockquote className="text-[17px] leading-[1.5] tracking-[-0.01em] text-ink">{children}</blockquote>
        {cite ? <figcaption className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{cite}</figcaption> : null}
      </div>
    </figure>
  );
}

/** List with 6px spectrum square bullets. */
export function SpectrumBullets({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("list-none space-y-2.5 p-0", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-baseline gap-3 text-[13.5px] leading-[1.55] text-ink-dim">
          <span aria-hidden="true" className="relative top-[-1px] inline-block size-[6px] shrink-0 rounded-[1.5px]" style={{ background: SPECTRUM, backgroundSize: "300% 100%", backgroundPosition: `${(i * 37) % 100}% 0` }} />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Spectrum as text fill, for "quirq" and for Q in Q = V · B. */
export function SpectrumText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("spec-text", className)}>{children}</span>;
}

/** The mint rule: budget B in grey, minted Q in spectrum. */
export function MintRule({ className }: { className?: string }) {
  return (
    <div className={cn("glass p-[clamp(20px,3.5vw,34px)]", className)}>
      <dl className="grid gap-8 sm:grid-cols-2">
        <div className="sm:border-r sm:border-hair sm:pr-8">
          <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Potential, before the run</dt>
          <dd>
            <p className="mt-4 font-mono text-[clamp(26px,3.4vw,36px)] leading-none tracking-[-0.02em] text-ink">B</p>
            <p className="mt-4 text-[13px] leading-[1.7] text-ink-dim">The outcome budget, set by the human owner before the work runs. Nothing is minted by declaring it.</p>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Minted, after verification</dt>
          <dd>
            <p className="mt-4 font-mono text-[clamp(26px,3.4vw,36px)] leading-none tracking-[-0.02em] text-ink">
              <SpectrumText className="font-semibold">Q</SpectrumText>
              <span className="mx-3 text-ink-faint">=</span>V<span className="mx-3 text-ink-faint">·</span>B
            </p>
            <p className="mt-4 text-[13px] leading-[1.7] text-ink-dim">
              Released by verification: the space captures the world before and after the run, then scores completion V against a weighted definition of done.
            </p>
          </dd>
        </div>
      </dl>
      <p className="mt-7 border-t border-hair-soft pt-4 font-mono text-[10px] uppercase leading-[1.8] tracking-[0.16em] text-ink-dim">
        V: verified completion, 0 to 1 · B: the owner&rsquo;s budget of value · Q: what the work actually minted
      </p>
    </div>
  );
}
