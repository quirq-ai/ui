// Art systems that feel and prove the thesis. Dream plates (night register: a lone figure,
// fractured light, heavy grain), instrument plates (dark chart with a finding headline),
// signal plates (one claim, a number pair), motion glyphs (one simple motion, plays once),
// prism art, deterministic generative thumbs, and the Shift Report caption that always ends
// in a quirq number. Teal is real or verified, orange is claimed or synthetic, grey is
// baseline. All inline SVG or CSS; nothing loads from the network. Server-safe.
import type { CSSProperties, ReactNode } from "react";
import { Mark } from "@/components/brand/mark";
import { mulberry32 } from "@/lib/fixtures";
import { formatNumber, plural } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DaylightScene, type DaylightSceneId } from "./daylight";
import { Grain, NOISE_URI } from "./kit";

const SPECTRUM_STOPS = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#2fd2ff", "#2e9bff", "#bf5af2"];
const TEAL = "#3fd0c9";
const AMBER = "#ffb547";

function Stops({ opacity = 1 }: { opacity?: number }) {
  return (
    <>
      {SPECTRUM_STOPS.map((c, i) => (
        <stop key={c} offset={`${(i / (SPECTRUM_STOPS.length - 1)) * 100}%`} stopColor={c} stopOpacity={opacity} />
      ))}
    </>
  );
}

/* ================================================================== dream plate */

export type DreamPlateProps = {
  uid?: string;
  /** Alt text; the dream plate is a feeling, so describe the scene. */
  alt?: string;
  className?: string;
};

/** Night register, 3:1: a reader in an archive beam, light splitting where it lands. */
export function DreamPlate({ uid = "dream", alt = "A lone reader stands in a beam of window light in a dark archive; where the beam meets the floor it splits into a faint spectrum.", className }: DreamPlateProps) {
  const u = uid;
  const rand = mulberry32(911);
  const books = Array.from({ length: 64 }, (_, i) => {
    const shelf = Math.floor(i / 16);
    const col = i % 16;
    const left = col < 8;
    const x = left ? 18 + col * 13 + rand() * 3 : 446 + (col - 8) * 17 + rand() * 3;
    const h = 18 + rand() * 12;
    const y = 40 + shelf * 38 - h;
    return { x: +x.toFixed(1), y: +y.toFixed(1), w: +(5 + rand() * 6).toFixed(1), h: +h.toFixed(1), tone: ["#13292a", "#183533", "#1f302a", "#10201f"][Math.floor(rand() * 4)] };
  });
  const dust = Array.from({ length: 36 }, () => {
    const t = rand();
    const y = 72 + t * 110;
    const spread = 24 + t * 50;
    const cx = 323 + t * 52;
    return { x: +(cx + (rand() - 0.5) * spread).toFixed(1), y: +y.toFixed(1), r: +(0.4 + rand() * 1.1).toFixed(2), o: +(0.3 + rand() * 0.6).toFixed(2) };
  });
  return (
    <div className={cn("relative aspect-[3/1] overflow-hidden bg-[#081113]", className)}>
      <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={alt}>
        <defs>
          <linearGradient id={`${u}-bg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1d1f" />
            <stop offset="100%" stopColor="#060d0e" />
          </linearGradient>
          <linearGradient id={`${u}-beam`} x1="0.4" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#ffd28f" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#ffb766" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffb766" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={`${u}-split`} x1="0" y1="0" x2="1" y2="0">
            <Stops opacity={0.75} />
          </linearGradient>
          <radialGradient id={`${u}-win`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffe2ad" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffe2ad" stopOpacity="0" />
          </radialGradient>
          <filter id={`${u}-soft`}>
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={`${u}-soft2`}>
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        <rect width="600" height="200" fill={`url(#${u}-bg)`} />
        {[0, 1, 2, 3].map((s) => (
          <g key={s}>
            <rect x="12" y={40 + s * 38} width="118" height="3" fill="#0f2223" />
            <rect x="440" y={40 + s * 38} width="150" height="3" fill="#0f2223" />
          </g>
        ))}
        {books.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.tone} />
        ))}
        <circle cx="323" cy="40" r="60" fill={`url(#${u}-win)`} />
        <rect x="300" y="10" width="46" height="60" fill="#ffd9a2" opacity="0.92" />
        <path d="M323 10 V70 M300 40 H346" stroke="#0d1d1f" strokeWidth="2.5" />
        <polygon points="300,70 346,70 430,192 320,192" fill={`url(#${u}-beam)`} filter={`url(#${u}-soft)`} style={{ mixBlendMode: "screen" }} />
        {dust.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#ffe3b0" opacity={d.o} />
        ))}
        <rect y="190" width="600" height="10" fill="#050b0c" />
        <ellipse cx="376" cy="191" rx="54" ry="3.2" fill={`url(#${u}-split)`} filter={`url(#${u}-soft2)`} />
        {/* the reader, rim lit on the beam side */}
        <g transform="translate(366 116)">
          <path d="M8 8 C12 8 14 12 14 18 L16 44 L15 74 L10 74 L9 48 L7 74 L2 74 L2 44 L0 20 C0 12 3 8 8 8 Z" fill="#040808" />
          <circle cx="8" cy="3" r="5.6" fill="#040808" />
          <path d="M13 14 L20 22 L26 18" stroke="#040808" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="22" y="13" width="9" height="7" fill="#e9d8b6" opacity="0.85" transform="rotate(-20 26 16)" />
          <path d="M12 6 C14 10 15 16 15.4 22 M16 44 L15.4 70" stroke={AMBER} strokeWidth="1" opacity="0.7" fill="none" />
        </g>
      </svg>
      <Grain opacity={0.14} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,transparent_55%,rgba(0,0,0,0.55))]" />
    </div>
  );
}

/* ================================================================== instrument plate */

export type InstrumentBar = { label: string; value: number; display: string; tone: "real" | "claimed" | "baseline"; note?: string };

const TONE_FILL = { real: TEAL, claimed: AMBER, baseline: "#6b6b68" } as const;

export type InstrumentPlateProps = {
  /** The finding, not the topic. */
  headline: string;
  /** Grey subtitle with the source. */
  subtitle: string;
  /** Axis unit, for example "% of runs where the model says it is being tested". */
  unit: string;
  bars: InstrumentBar[];
  /** Upper bound of the axis. */
  max?: number;
  ticks?: number[];
  footnote?: ReactNode;
  className?: string;
};

/** Dark-ground chart in the house style: rounded finding headline, grey source, mono notes. */
export function InstrumentPlate({ headline, subtitle, unit, bars, max = 100, ticks = [0, 25, 50, 75, 100], footnote, className }: InstrumentPlateProps) {
  return (
    <figure className={cn("rounded-[14px] border border-hair-soft bg-[#0a0b0c] p-[clamp(18px,3vw,28px)]", className)}>
      <figcaption>
        <p className="font-round text-[clamp(19px,2.2vw,24px)] font-bold leading-[1.2] tracking-[-0.01em] text-ink">{headline}</p>
        <p className="mt-1.5 text-[12.5px] text-ink-faint">{subtitle}</p>
      </figcaption>
      <div className="mt-6" role="img" aria-label={`${unit}: ${bars.map((b) => `${b.label} ${b.display}`).join(", ")}`}>
        <div className="space-y-4" aria-hidden="true">
          {bars.map((b) => (
            <div key={b.label} className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(0,170px)_minmax(0,1fr)] sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-ink">{b.label}</p>
                {b.note ? <p className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: TONE_FILL[b.tone] }}>{b.note}</p> : null}
              </div>
              <div className="relative h-7">
                <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${Math.max(0.6, (b.value / max) * 100)}%`, background: TONE_FILL[b.tone], opacity: b.tone === "baseline" ? 0.7 : 0.9 }} />
                <span
                  className="absolute top-1/2 -translate-y-1/2 font-mono text-[12px] tabular-nums text-ink"
                  style={b.value / max > 0.8 ? { right: `calc(${100 - (b.value / max) * 100}% + 8px)`, color: "#071010" } : { left: `calc(${(b.value / max) * 100}% + 8px)` }}
                >
                  {b.display}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid sm:grid-cols-[minmax(0,170px)_minmax(0,1fr)] sm:gap-x-4" aria-hidden="true">
          <span className="hidden sm:block" />
          <div className="relative h-5 border-t border-hair">
            {ticks.map((t) => (
              <span key={t} className="absolute top-1 -translate-x-1/2 font-mono text-[10px] tabular-nums text-ink-faint first:translate-x-0 last:-translate-x-full" style={{ left: `${(t / max) * 100}%` }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{unit}</p>
      {footnote ? <div className="mt-4 border-t border-hair-soft pt-3">{footnote}</div> : null}
    </figure>
  );
}

/* ================================================================== signal plate */

export type SignalTerm = { value: string; tone: "real" | "claimed" | "baseline" };

export type SignalPlateProps = {
  /** One kicker line, eight words at most. */
  kicker: string;
  left: SignalTerm;
  joiner: "vs" | "→";
  right: SignalTerm;
  className?: string;
};

/** Card and social preview art: one claim, a big number pair, almost no words. */
export function SignalPlate({ kicker, left, joiner, right, className }: SignalPlateProps) {
  return (
    <div
      role="img"
      aria-label={`${kicker}: ${left.value} ${joiner === "vs" ? "versus" : "to"} ${right.value}`}
      className={cn("relative flex aspect-[16/9.6] flex-col justify-between overflow-hidden rounded-[14px] border border-hair-soft bg-[#090b0d] p-[clamp(16px,2.6vw,24px)]", className)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_20%_100%,rgba(63,208,201,0.12),transparent_60%)]" />
      <p className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">{kicker}</p>
      <p className="relative flex flex-wrap items-baseline gap-x-[0.35em] font-round text-[clamp(30px,4.4vw,46px)] font-bold leading-none tracking-[-0.02em]">
        <span style={{ color: TONE_FILL[left.tone] }}>{left.value}</span>
        <span className="text-[0.55em] font-medium text-ink-faint">{joiner}</span>
        <span style={{ color: TONE_FILL[right.tone] }}>{right.value}</span>
      </p>
      <Grain opacity={0.06} />
    </div>
  );
}

/* ================================================================== motion glyph */

export type GlyphNode = { id: string; label: string };

export type MotionGlyphProps = {
  /** Five or so nodes on a timeline, oldest first. */
  nodes: GlyphNode[];
  /** Index of the edge (from node i to i + 1) that did not replicate. */
  failedEdge?: number;
  stamp?: string;
  /** Draw once on mount. Reduced motion shows the end state at once. */
  animate?: boolean;
  className?: string;
};

const GLYPH_CSS = `
@keyframes bm-draw{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}
@keyframes bm-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
@keyframes bm-stamp{from{opacity:0;transform:rotate(-8deg) scale(1.7)}to{opacity:1;transform:rotate(-8deg) scale(1)}}
@keyframes bm-fade{from{opacity:0}to{opacity:1}}
.bm-g-draw{stroke-dasharray:var(--len);animation:bm-draw .9s cubic-bezier(.22,1,.36,1) both}
.bm-g-pop{transform-box:fill-box;transform-origin:center;animation:bm-pop .45s cubic-bezier(.22,1,.36,1) both}
.bm-g-stamp{transform-box:fill-box;transform-origin:center;animation:bm-stamp .5s cubic-bezier(.22,1,.36,1) both}
.bm-g-fade{animation:bm-fade .5s ease both}
`;

/** Evidence map: study nodes on a timeline, the edge that failed stamped in amber. */
export function MotionGlyph({ nodes, failedEdge = 0, stamp = "DID NOT REPLICATE", animate = true, className }: MotionGlyphProps) {
  const n = nodes.length;
  const x = (i: number) => 66 + (i * 468) / Math.max(1, n - 1);
  const y = 118;
  const a = (cls: string, delay: number) => (animate ? { className: cls, style: { animationDelay: `${delay}s` } } : {});
  return (
    <div className={cn("relative overflow-hidden rounded-[14px] border border-hair-soft bg-[#0b1020]", className)}>
      {animate ? (
        <style href="bm-motion-glyph" precedence="default">
          {GLYPH_CSS}
        </style>
      ) : null}
      <div tabIndex={0} role="group" aria-label="Evidence map, scrolls sideways on narrow screens" className="scroll-thin overflow-x-auto focus-visible:outline-offset-[-2px]">
      <svg viewBox="0 0 600 175" className="block h-auto w-full min-w-[540px]" role="img" aria-label={`Evidence map: ${nodes.map((d) => d.label).join(", then ")}. The step from ${nodes[failedEdge]?.label} to ${nodes[failedEdge + 1]?.label} is stamped ${stamp.toLowerCase()}.`}>
        <line x1="40" y1={y} x2="560" y2={y} stroke="rgba(238,240,250,0.22)" strokeWidth="1" {...a("bm-g-fade", 0)} />
        {nodes.slice(0, -1).map((_, i) => {
          const x1 = x(i);
          const x2 = x(i + 1);
          const failed = i === failedEdge;
          const d = `M${x1} ${y - 8} C ${x1 + 30} ${y - 70}, ${x2 - 30} ${y - 70}, ${x2} ${y - 8}`;
          const len = Math.round((x2 - x1) * 1.35);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={failed ? AMBER : "#eef0fa"}
              strokeWidth={failed ? 1.6 : 1.3}
              strokeLinecap="round"
              opacity={failed ? 1 : 0.85}
              {...(animate
                ? { className: "bm-g-draw", style: { "--len": len, animationDelay: `${0.2 + i * 0.22}s` } as CSSProperties }
                : {})}
            />
          );
        })}
        {nodes.map((d, i) => (
          <g key={d.id} {...a("bm-g-pop", 0.05 + i * 0.22)}>
            <circle cx={x(i)} cy={y} r="7" fill="#0b1020" stroke={i === failedEdge ? AMBER : "#eef0fa"} strokeWidth="1.5" />
            {i === failedEdge ? <path d={`M${x(i) - 4} ${y - 4} L${x(i) + 4} ${y + 4} M${x(i) + 4} ${y - 4} L${x(i) - 4} ${y + 4}`} stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" /> : <circle cx={x(i)} cy={y} r="2.4" fill="#eef0fa" />}
            <text x={x(i)} y={y + 30} textAnchor="middle" fill={i === failedEdge ? AMBER : "rgba(238,240,250,0.75)"} fontSize="9" letterSpacing="0.6" style={{ fontFamily: "var(--font-mono)" }}>
              {d.label.toUpperCase()}
            </text>
          </g>
        ))}
        <g {...a("bm-g-stamp", 0.22 * n + 0.15)} transform={animate ? undefined : `rotate(-8 ${(x(failedEdge) + x(failedEdge + 1)) / 2} ${y - 62})`}>
          <rect x={(x(failedEdge) + x(failedEdge + 1)) / 2 - 62} y={y - 74} width="124" height="22" rx="3" fill="#0b1020" stroke={AMBER} strokeWidth="1.3" />
          <text x={(x(failedEdge) + x(failedEdge + 1)) / 2} y={y - 59} textAnchor="middle" fill={AMBER} fontSize="9.5" fontWeight="600" letterSpacing="1.4" style={{ fontFamily: "var(--font-mono)" }}>
            {stamp}
          </text>
        </g>
      </svg>
      </div>
    </div>
  );
}

/* ================================================================== prism art */

export type PrismKind = "hero-prism" | "spectrum-band" | "quirq-glow" | "burst";

export const PRISM_ALT: Record<PrismKind, string> = {
  "hero-prism": "Glass rings refracting light into a spectrum on black.",
  "spectrum-band": "A white beam enters a prism and leaves as a band of spectrum.",
  "quirq-glow": "The quirq mark glowing with a spectrum halo.",
  burst: "Rays of spectrum bursting from a bright point.",
};

/** Prism and refraction art with a radial mask and screen blending, for heroes and section art. */
export function PrismArt({ kind, uid, className }: { kind: PrismKind; uid?: string; className?: string }) {
  const u = uid ?? `prism-${kind}`;
  const rand = mulberry32(kind.length * 977);
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-black", className)}>
      <svg
        viewBox="0 0 300 300"
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(closest-side,#000_62%,transparent_98%)]"
        role="img"
        aria-label={PRISM_ALT[kind]}
      >
        <defs>
          <linearGradient id={`${u}-s`} x1="0" y1="0" x2="1" y2="0">
            <Stops />
          </linearGradient>
          <linearGradient id={`${u}-sv`} x1="0" y1="0" x2="0" y2="1">
            <Stops />
          </linearGradient>
          <linearGradient id={`${u}-sd`} x1="0" y1="0" x2="1" y2="1">
            <Stops />
          </linearGradient>
          <filter id={`${u}-b8`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={`${u}-b3`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <radialGradient id={`${u}-core`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fff6e6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {kind === "hero-prism" ? (
          <g style={{ mixBlendMode: "screen" }}>
            {[
              { rx: 104, ry: 56, rot: -28, g: "s" },
              { rx: 96, ry: 60, rot: 32, g: "sv" },
              { rx: 84, ry: 40, rot: 78, g: "sd" },
            ].map((r, i) => (
              <g key={i} transform={`rotate(${r.rot} 150 150)`}>
                <ellipse cx="150" cy="150" rx={r.rx} ry={r.ry} fill="none" stroke={`url(#${u}-${r.g})`} strokeWidth="20" opacity="0.55" filter={`url(#${u}-b8)`} />
                <ellipse cx="150" cy="150" rx={r.rx} ry={r.ry} fill="none" stroke={`url(#${u}-${r.g})`} strokeWidth="5" opacity="0.9" filter={`url(#${u}-b3)`} />
                <ellipse cx="150" cy="150" rx={r.rx - 4} ry={r.ry - 4} fill="none" stroke="#ffffff" strokeWidth="0.9" opacity="0.55" />
              </g>
            ))}
            <circle cx="214" cy="104" r="10" fill={`url(#${u}-core)`} />
            <circle cx="96" cy="196" r="7" fill={`url(#${u}-core)`} />
          </g>
        ) : null}

        {kind === "spectrum-band" ? (
          <g style={{ mixBlendMode: "screen" }}>
            <path d="M10 166 L128 148" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" filter={`url(#${u}-b3)`} />
            <path d="M10 166 L128 148" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <polygon points="150,96 196,176 104,176" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
            <polygon points="168,140 300,108 300,196 168,156" fill={`url(#${u}-sv)`} opacity="0.85" filter={`url(#${u}-b8)`} />
            <polygon points="168,142 300,120 300,184 168,154" fill={`url(#${u}-sv)`} opacity="0.9" filter={`url(#${u}-b3)`} />
          </g>
        ) : null}

        {kind === "quirq-glow" ? (
          <g>
            {SPECTRUM_STOPS.map((c, i) => {
              const ang = (i / SPECTRUM_STOPS.length) * Math.PI * 2;
              return <circle key={c} cx={(150 + Math.cos(ang) * 38).toFixed(1)} cy={(150 + Math.sin(ang) * 38).toFixed(1)} r="46" fill={c} opacity="0.55" filter={`url(#${u}-b8)`} style={{ mixBlendMode: "screen" }} />;
            })}
            <circle cx="150" cy="150" r="64" fill="#000" opacity="0.55" filter={`url(#${u}-b8)`} />
            <g transform="translate(108 108) scale(1.01)" color="#f4f3f0">
              <Mark size={84} />
            </g>
          </g>
        ) : null}

        {kind === "burst" ? (
          <g style={{ mixBlendMode: "screen" }}>
            {Array.from({ length: 30 }, (_, i) => {
              const ang = (i / 30) * 360 + rand() * 6;
              const len = 70 + rand() * 80;
              const w = 2 + rand() * 5;
              return (
                <polygon
                  key={i}
                  points={`150,${150 - w * 0.2} ${150 + len},${150 - w} ${150 + len},${150 + w} 150,${150 + w * 0.2}`}
                  fill={SPECTRUM_STOPS[i % SPECTRUM_STOPS.length]}
                  opacity={(0.35 + rand() * 0.5).toFixed(2)}
                  transform={`rotate(${ang.toFixed(1)} 150 150)`}
                  filter={`url(#${u}-b3)`}
                />
              );
            })}
            <circle cx="150" cy="150" r="28" fill={`url(#${u}-core)`} />
          </g>
        ) : null}
      </svg>
    </div>
  );
}

/* ================================================================== generative thumbs */

export type ThumbSpec = { kind: "beam"; hue: number } | { kind: "grad"; index: number };

export const THUMB_GRADS = [
  "radial-gradient(140% 160% at 15% 10%, #7c2d3e 0%, #3b1524 45%, #12090f 100%)",
  "radial-gradient(140% 160% at 80% 0%, #3b3b8f 0%, #232055 45%, #0b0a18 100%)",
  "radial-gradient(140% 160% at 20% 90%, #1f6a5a 0%, #123a35 50%, #08110f 100%)",
  "radial-gradient(140% 160% at 85% 85%, #a2652a 0%, #4f2e14 50%, #150c05 100%)",
  "radial-gradient(140% 160% at 50% 0%, #6d3b8f 0%, #35204f 50%, #100a18 100%)",
  "radial-gradient(140% 160% at 0% 50%, #8f3b62 0%, #47203a 50%, #140a11 100%)",
];

/** Diagonal light beam on near-black, tinted by hue. Deterministic, no assets. */
export function beamBg(hue: number): string {
  const h2 = (hue + 45) % 360;
  return `linear-gradient(112deg, transparent 36%, hsla(${hue},70%,64%,.14) 47%, hsla(${h2},75%,72%,.2) 52%, transparent 64%), radial-gradient(130% 100% at 88% 118%, hsla(${hue},55%,48%,.11), transparent 58%), #0c0c0e`;
}

/** Card thumb from a spec: beam(hue) or grad(index), with an overlay noise at 35%. */
export function GenerativeThumb({ spec, className }: { spec: ThumbSpec; className?: string }) {
  const background = spec.kind === "beam" ? beamBg(spec.hue) : THUMB_GRADS[((spec.index % THUMB_GRADS.length) + THUMB_GRADS.length) % THUMB_GRADS.length];
  return (
    <div aria-hidden="true" className={cn("relative aspect-[16/9.6] overflow-hidden", className)}>
      <div className="absolute inset-0" style={{ background }} />
      <div className="absolute inset-0 opacity-35 mix-blend-overlay" style={{ backgroundImage: NOISE_URI }} />
    </div>
  );
}

/* ================================================================== Shift Report */

export type ShiftReport = {
  /** Product subject of line one: "XO". */
  subject: string;
  /** What is running, with its count: "14 spaces". */
  running: string;
  /** The hour the caption names. */
  when: string;
  person: string;
  role: string;
  /** Present tense, after the role: "is fishing". */
  activity: string;
  /** "overnight", "this afternoon". */
  window: string;
  /** Minted quirqs, printed as measured, never rounded up. */
  quirqs: number;
  quirqDigits?: number;
  interventions: number;
};

/** The three-line caption block. The proof line ends in the unit. */
export function ShiftReportCaption({ report, size = "md", className }: { report: ShiftReport; size?: "sm" | "md" | "lg"; className?: string }) {
  const text = size === "lg" ? "text-[clamp(16px,2vw,21px)]" : size === "sm" ? "text-[12.5px]" : "text-[14.5px]";
  const q = formatNumber(report.quirqs, report.quirqDigits ?? 1);
  return (
    <div className={cn("space-y-1 leading-[1.45]", text, className)}>
      <p>
        <b className="font-[700]">{report.subject}</b> is running {report.running}.
      </p>
      <p>
        <b className="font-[700]">{report.when}</b>
        <span className="mx-1.5 opacity-50">|</span>
        {report.person} <span className="rounded-[3px] bg-white/[0.14] px-1.5 py-px font-mono text-[0.78em] tracking-[0.02em]">{report.role}</span> {report.activity}.
      </p>
      <p className="italic opacity-85">
        verified {report.window}: {q} {plural(report.quirqs, "quirq")} · {report.interventions} {plural(report.interventions, "intervention")}
      </p>
    </div>
  );
}

export type ShiftReportCardProps = {
  report: ShiftReport;
  scene: DaylightSceneId;
  variant: "social" | "header" | "print";
  uid?: string;
  /** Edition label for prints: "The Quiet Shift, №01". */
  edition?: string;
  className?: string;
};

/** One Shift Report unit as a social card (caption on the image), article header or text-free print. */
export function ShiftReportCard({ report, scene, variant, uid, edition = "The Quiet Shift, №01", className }: ShiftReportCardProps) {
  if (variant === "social") {
    return (
      <figure className={cn("relative aspect-[1200/630] overflow-hidden rounded-[14px] border border-hair-soft", className)}>
        <DaylightScene scene={scene} uid={uid} fill />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-[clamp(12px,3vw,24px)] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
          <ShiftReportCaption report={report} size="sm" className="max-[420px]:text-[11px]" />
        </figcaption>
      </figure>
    );
  }
  if (variant === "header") {
    return (
      <figure className={cn("overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]", className)}>
        <DaylightScene scene={scene} uid={uid} aspect="3 / 1" className="w-full" />
        <figcaption className="px-[clamp(16px,3vw,28px)] py-5 text-ink">
          <ShiftReportCaption report={report} size="lg" />
        </figcaption>
      </figure>
    );
  }
  return (
    <figure className={cn("overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]", className)}>
      <div className="bg-[#efe9df] p-[clamp(10px,2.4vw,22px)]">
        <DaylightScene scene={scene} uid={uid} aspect="16 / 9" className="w-full shadow-[0_10px_30px_rgba(0,0,0,0.25)]" />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-hair-soft px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
        <span className="text-ink-dim">{edition}</span>
        <span>Text-free · 3840 × 2160</span>
      </figcaption>
    </figure>
  );
}
