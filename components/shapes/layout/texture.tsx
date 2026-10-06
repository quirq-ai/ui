// Grain, glow and backdrop textures: fractal-noise film grain, card noise, blurred spectral
// glow, the visualizer dot grid, the HUD vignette, a seeded starfield and the prism art.
// All inline (SVG data URIs and CSS gradients), all decorative (aria-hidden), all
// deterministic. Server-safe. Brand rule: never put a decorative glow behind data.
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { mulberry32 } from "@/lib/fixtures";

export const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ----------------------------------------------------------------------------- Grain */

export type GrainProps = {
  /** 0.04 is the site value; raise it only to show the texture in a specimen. */
  opacity?: number;
  /** "fixed" covers the viewport (site overlay); "absolute" fills the nearest positioned parent. */
  position?: "fixed" | "absolute";
  /** Card thumbs use overlay blending at .35. */
  blend?: "normal" | "overlay";
  className?: string;
};

/** Fractal-noise film grain. Pointer-transparent and hidden from assistive tech. */
export function Grain({ opacity = 0.04, position = "absolute", blend = "normal", className }: GrainProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none",
        position === "fixed" ? "fixed -inset-[8%] z-[60] h-[116%] w-[116%]" : "absolute inset-0",
        blend === "overlay" && "mix-blend-overlay",
        className,
      )}
      style={{ backgroundImage: NOISE_URI, opacity }}
    />
  );
}

/* ----------------------------------------------------------------------------- BeamThumb */

/** Editorial card thumb: a diagonal light beam in one hue, with card noise on top. */
export function beamBackground(hue: number): string {
  const h2 = (hue + 45) % 360;
  return `linear-gradient(112deg, transparent 36%, hsla(${hue},70%,64%,.14) 47%, hsla(${h2},75%,72%,.2) 52%, transparent 64%), radial-gradient(130% 100% at 88% 118%, hsla(${hue},55%,48%,.11), transparent 58%), #0c0c0e`;
}

export function BeamThumb({ hue, noise = true, className }: { hue: number; noise?: boolean; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative aspect-[16/9.6] overflow-hidden", className)}>
      <div className="absolute inset-0" style={{ background: beamBackground(hue) }} />
      {noise ? <Grain opacity={0.35} blend="overlay" /> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- SpectralGlow */

export type SpectralGlowProps = {
  /** Overall strength; the landing glow sits at .6. */
  opacity?: number;
  /** Blur radius in px. */
  blur?: number;
  className?: string;
  style?: CSSProperties;
};

/** Spectral light blurred into a soft rainbow haze, masked to a centered ellipse. */
export function SpectralGlow({ opacity = 0.6, blur = 44, className, style }: SpectralGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      style={{
        opacity,
        filter: `blur(${blur}px) saturate(1.5)`,
        background: [
          "radial-gradient(24% 60% at 16% 52%, rgba(255,69,58,.95), transparent 72%)",
          "radial-gradient(24% 60% at 30% 46%, rgba(255,159,10,.85), transparent 72%)",
          "radial-gradient(24% 60% at 43% 54%, rgba(255,214,10,.7), transparent 72%)",
          "radial-gradient(24% 60% at 55% 48%, rgba(48,209,88,.75), transparent 72%)",
          "radial-gradient(24% 60% at 68% 54%, rgba(47,210,255,.85), transparent 72%)",
          "radial-gradient(24% 60% at 80% 48%, rgba(46,155,255,.9), transparent 72%)",
          "radial-gradient(20% 55% at 90% 52%, rgba(191,90,242,.95), transparent 72%)",
        ].join(", "),
        maskImage: "radial-gradient(60% 56% at 50% 50%, #000 24%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(60% 56% at 50% 50%, #000 24%, transparent 80%)",
        ...style,
      }}
    />
  );
}

/* ----------------------------------------------------------------------------- DotGrid */

export type DotGridProps = {
  /** Dot spacing in px (visualizer 14, app canvas 18). */
  spacing?: number;
  /** Fade the grid toward the edges. */
  mask?: boolean;
  /** Faint oversized circle outlines behind the grid (visualizer ambient). */
  rings?: boolean;
  /** Visualizer ground: radial slate light over a deep blue-black. */
  ground?: boolean;
  className?: string;
};

/** Ambient backdrop: 0.7px dots at low opacity, center-masked. Texture only. */
export function DotGrid({ spacing = 14, mask = true, rings = false, ground = false, className }: DotGridProps) {
  const fade = "radial-gradient(70% 65% at 50% 45%, #000 30%, transparent 82%)";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {ground ? (
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(80% 60% at 50% 18%, rgba(76,94,122,.11), transparent 70%), linear-gradient(180deg, #0d131c, #070a0f)" }}
        />
      ) : null}
      {rings ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" fill="none">
          <circle cx="400" cy="240" r="210" stroke="rgba(218,226,236,.05)" />
          <circle cx="400" cy="240" r="340" stroke="rgba(218,226,236,.04)" />
          <circle cx="400" cy="240" r="480" stroke="rgba(218,226,236,.03)" />
        </svg>
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.38,
          backgroundImage: "radial-gradient(rgba(218,226,236,.9) 0.7px, transparent 0.9px)",
          backgroundSize: `${spacing}px ${spacing}px`,
          maskImage: mask ? fade : undefined,
          WebkitMaskImage: mask ? fade : undefined,
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------- Vignette */

/** HUD vignette: darkens the top and bottom edges so overlaid chrome stays readable. */
export function Vignette({ strength = 1, className }: { strength?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity: strength,
        background:
          "linear-gradient(180deg, rgba(4,6,17,.84) 0%, rgba(4,6,17,.58) 16%, transparent 38%, transparent 62%, rgba(4,6,17,.58) 84%, rgba(4,6,17,.84) 100%)",
      }}
    />
  );
}

/* ----------------------------------------------------------------------------- Starfield */

type Star = { x: number; y: number; r: number; o: number };

function makeStars(seed: number, count: number): Star[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: Math.round(rnd() * 8000) / 10,
    y: Math.round(rnd() * 4800) / 10,
    r: Math.round((0.35 + rnd() * rnd() * 1.4) * 100) / 100,
    o: Math.round((0.25 + rnd() * 0.7) * 100) / 100,
  }));
}

const STARS = makeStars(4100, 150);

/** Seeded starfield over the space-drift night (#080b18). Same stars on server and client. */
export function Starfield({ className, tint = "#aab8ff", idPrefix = "starfield" }: { className?: string; tint?: string; idPrefix?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 800 480"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`${idPrefix}-nebula`} cx="0.7" cy="0.3" r="0.55">
          <stop offset="0" stopColor={tint} stopOpacity="0.1" />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="480" fill="#080b18" />
      <rect width="800" height="480" fill={`url(#${idPrefix}-nebula)`} />
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i % 9 === 0 ? tint : "#e8ecff"} opacity={s.o} />
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------------------- PrismArt */

/** Iridescent glass ribbon refracting the full spectrum on black. Pass a unique idPrefix
    when more than one sits on a page. */
export function PrismArt({ idPrefix = "prism", className }: { idPrefix?: string; className?: string }) {
  const id = (s: string) => `${idPrefix}-${s}`;
  const spectrum = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#2fd2ff", "#2e9bff", "#bf5af2"];
  return (
    <svg aria-hidden="true" viewBox="0 0 600 600" className={cn("h-full w-full", className)} fill="none">
      <defs>
        <linearGradient id={id("spec")} x1="0" y1="1" x2="1" y2="0">
          {spectrum.map((c, i) => (
            <stop key={c} offset={i / (spectrum.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#dfe8ff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("fade")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="0.96" stopColor="#000" />
        </radialGradient>
        <mask id={id("mask")}>
          <rect width="600" height="600" fill={`url(#${id("fade")})`} />
        </mask>
        <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id={id("halo")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g mask={`url(#${id("mask")})`} style={{ mixBlendMode: "screen" }}>
        {/* incoming white beam */}
        <path d="M30 330 L262 296" stroke="#f4f3f0" strokeWidth="5" strokeLinecap="round" opacity="0.85" filter={`url(#${id("halo")})`} />
        <path d="M30 330 L262 296" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
        {/* refracted fan */}
        {spectrum.map((c, i) => (
          <path
            key={c}
            d={`M300 300 L590 ${170 + i * 44}`}
            stroke={c}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.55"
            filter={`url(#${id("halo")})`}
          />
        ))}
        {spectrum.map((c, i) => (
          <path key={`${c}-core`} d={`M300 300 L590 ${170 + i * 44}`} stroke={c} strokeWidth="2.2" strokeLinecap="round" opacity="0.95" />
        ))}
        {/* glass ribbon: a twisted band, soft glow underneath and a sharp body on top */}
        <path
          d="M120 470 C 210 420, 230 200, 330 150 C 400 115, 450 160, 500 120"
          stroke={`url(#${id("spec")})`}
          strokeWidth="96"
          strokeLinecap="round"
          opacity="0.32"
          filter={`url(#${id("soft")})`}
        />
        <path
          d="M120 470 C 210 420, 230 200, 330 150 C 400 115, 450 160, 500 120"
          stroke={`url(#${id("spec")})`}
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M128 462 C 214 410, 238 206, 332 160 C 398 128, 448 168, 494 130"
          stroke={`url(#${id("glass")})`}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path d="M262 296 L338 226 L352 344 Z" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
