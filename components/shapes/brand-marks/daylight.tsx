// Daylight register: calm people at rest in honest light, warm neutrals, soft haze, gentle
// 4% grain, a faint spectrum where the light splits. Drawn as inline SVG so the catalog
// ships no photographs; the real plates are photographs of real people. No chart or headline
// sits on a daylight plate; a mono caption runs beneath it. Server-safe.
import type { ReactNode } from "react";
import { mulberry32 } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { Grain } from "./kit";

export type DaylightSceneId = "trailhead" | "morning" | "hammock" | "lake";

export const DAYLIGHT_ALT: Record<DaylightSceneId, string> = {
  trailhead: "A hiker walks a ridge trail at sunrise above a sea of clouds; a laptop sits on a wooden table in the foreground.",
  morning: "A person sleeps in late morning light; a small spectrum falls on the wall and a laptop rests on the side table.",
  hammock: "A person reads in a hammock under trees in dappled afternoon light; a small laptop sits on a crate below.",
  lake: "A person fishes from a grassy lakeside at dawn, mist on the water; a closed laptop and a thermos wait on a folding table.",
};

export const DAYLIGHT_CAPTION: Record<DaylightSceneId, string> = {
  trailhead: "Early morning at the trailhead",
  morning: "Late morning, the work still running",
  hammock: "Afternoon in the hammock with a book",
  lake: "Dawn at the lake",
};

const SPECTRUM_STOPS = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#2fd2ff", "#2e9bff", "#bf5af2"];

function SpectrumStops({ opacity = 1 }: { opacity?: number }) {
  return (
    <>
      {SPECTRUM_STOPS.map((c, i) => (
        <stop key={c} offset={`${(i / (SPECTRUM_STOPS.length - 1)) * 100}%`} stopColor={c} stopOpacity={opacity} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ scenes */

function Trailhead({ u }: { u: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6a46b" />
          <stop offset="45%" stopColor="#f5cd96" />
          <stop offset="68%" stopColor="#fbe5bf" />
        </linearGradient>
        <radialGradient id={`${u}-sun`} cx="0.82" cy="0.42" r="0.42">
          <stop offset="0%" stopColor="#fff8e4" />
          <stop offset="35%" stopColor="#ffe3ab" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffe3ab" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-ridge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a5a3c" />
          <stop offset="100%" stopColor="#35261a" />
        </linearGradient>
        <linearGradient id={`${u}-flare`} x1="0" y1="0" x2="1" y2="0">
          <SpectrumStops />
        </linearGradient>
        <filter id={`${u}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${u}-blur1`}>
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width="480" height="300" fill={`url(#${u}-sky)`} />
      <rect width="480" height="300" fill={`url(#${u}-sun)`} />
      <path d="M0 150 L40 139 L84 147 L132 128 L172 141 L222 133 L268 145 L318 135 L362 147 L418 129 L480 141 L480 178 L0 178Z" fill="#c4a27c" opacity="0.5" />
      <g filter={`url(#${u}-soft)`} fill="#fff4e0">
        <rect x="-20" y="160" width="520" height="40" opacity="0.9" />
        <ellipse cx="60" cy="160" rx="90" ry="16" />
        <ellipse cx="180" cy="166" rx="110" ry="14" />
        <ellipse cx="310" cy="157" rx="120" ry="18" />
        <ellipse cx="440" cy="164" rx="90" ry="14" />
      </g>
      <path d="M0 300 L0 238 C60 228 122 234 172 222 C232 208 282 194 332 174 C382 156 424 149 480 145 L480 300Z" fill={`url(#${u}-ridge)`} />
      <path d="M172 222 C232 208 282 194 332 174 C382 156 424 149 480 145" fill="none" stroke="#f6c98d" strokeWidth="2" opacity="0.55" />
      <path d="M262 300 C278 272 302 252 322 234 C344 214 362 198 384 186" fill="none" stroke="#dcbb8c" strokeWidth="7" strokeLinecap="round" opacity="0.55" />
      <path d="M262 300 C278 272 302 252 322 234 C344 214 362 198 384 186" fill="none" stroke="#f1d6aa" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <g stroke="#9a7650" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
        <path d="M300 270l-2-8M304 268l1-9M420 210l-2-7M424 209l1-8M210 260l-1-7M214 259l2-7" />
      </g>
      {/* the hiker */}
      <g transform="translate(364 140)" fill="#2b2018">
        <circle cx="6" cy="4" r="3.6" />
        <path d="M3 8.5 Q6 7.4 9 8.5 L10.2 22 L2.2 22 Z" />
        <rect x="-1.4" y="9" width="5.2" height="10.5" rx="2" />
        <path d="M3.6 22 L1.4 36 M8 22 L11.4 35" stroke="#2b2018" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M9.2 10.5 L12.4 19" stroke="#2b2018" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M9.6 9 L10.4 21.5" stroke="#ffd59a" strokeWidth="0.9" opacity="0.8" fill="none" />
      </g>
      {/* table, laptop and crate in the foreground */}
      <path d="M18 252 L172 241 L180 251 L26 264 Z" fill="#7b5236" />
      <path d="M26 264 L180 251 L180 256 L26 270 Z" fill="#5a3a24" />
      <path d="M36 268 V300 M168 255 V300" stroke="#45301f" strokeWidth="4" />
      <path d="M58 246 L120 241.5 L127 247.5 L65 252.5 Z" fill="#cfc9bf" />
      <path d="M60 245 L55 212 L113 207.5 L120 241.5 Z" fill="#262a2e" />
      <path d="M63 240 L59.4 215 L109.6 211 L114.6 237.6 Z" fill="#33424a" />
      <path d="M66 220 L92 218 M67 226 L100 223.5 M68 232 L86 230.6" stroke="#a8e0d4" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      <rect x="134" y="212" width="25" height="31" rx="1.5" fill="#9b6b40" />
      <rect x="134" y="212" width="25" height="5" fill="#b9854f" />
      {/* the flare splits into a faint spectrum */}
      <rect x="330" y="104" width="84" height="2.6" fill={`url(#${u}-flare)`} opacity="0.32" transform="rotate(-14 378 105)" filter={`url(#${u}-blur1)`} />
      <circle cx="304" cy="132" r="7" fill="none" stroke="#fff3d6" strokeWidth="1" opacity="0.5" />
    </>
  );
}

function Morning({ u }: { u: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}-wall`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#caa57a" />
          <stop offset="70%" stopColor="#ecd2ac" />
          <stop offset="100%" stopColor="#f6e2c2" />
        </linearGradient>
        <linearGradient id={`${u}-curtain`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f9eedb" />
          <stop offset="50%" stopColor="#fff8ea" />
          <stop offset="100%" stopColor="#ead6b4" />
        </linearGradient>
        <linearGradient id={`${u}-band`} x1="0" y1="0" x2="1" y2="0">
          <SpectrumStops opacity={0.85} />
        </linearGradient>
        <linearGradient id={`${u}-sheet`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6efe4" />
          <stop offset="100%" stopColor="#d9c8b0" />
        </linearGradient>
        <filter id={`${u}-blur`}>
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect width="480" height="300" fill={`url(#${u}-wall)`} />
      <path d="M140 18 L330 0 L330 176 L140 196 Z" fill="#fff1cf" opacity="0.32" />
      <rect x="182" y="32" width="13" height="66" fill={`url(#${u}-band)`} filter={`url(#${u}-blur)`} opacity="0.8" transform="rotate(4 188 65)" />
      <rect x="366" y="0" width="114" height="200" fill="#fff6e2" />
      <rect x="372" y="0" width="56" height="200" fill={`url(#${u}-curtain)`} />
      <path d="M384 0 V200 M398 0 V200 M412 0 V200" stroke="#e6d2ae" strokeWidth="1.2" opacity="0.7" />
      {/* side table, laptop and phone */}
      <rect x="388" y="152" width="96" height="70" fill="#a77a4e" />
      <rect x="388" y="152" width="96" height="6" fill="#c59766" />
      <path d="M402 152 L398 120 L452 116 L456 150 Z" fill="#262b2e" />
      <path d="M405 147 L402 124 L448 120.5 L451 145 Z" fill="#2f3b3a" />
      <path d="M408 129 L432 127 M409 135 L441 132.6 M410 141 L426 139.8" stroke="#8fe0b8" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <rect x="462" y="128" width="12" height="22" rx="2.5" fill="#1d2124" />
      <rect x="463.6" y="130.5" width="8.8" height="16" rx="1.4" fill="#d6ecff" opacity="0.85" />
      {/* bed and the sleeper */}
      <rect x="0" y="178" width="400" height="122" fill="#e7dccb" />
      <ellipse cx="330" cy="198" rx="80" ry="22" fill="#f2eadf" />
      <path d="M318 214 C340 220 372 220 404 214" fill="none" stroke="#d9cbb5" strokeWidth="2" opacity="0.7" />
      <path d="M248 210 C254 194 274 186 292 190 C300 192 304 198 304 208 Z" fill="#c98e69" />
      <ellipse cx="301" cy="195" rx="11" ry="8.5" fill="#c48965" />
      <path d="M296 197.5 q3 1.6 6 0" stroke="#7a4a32" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <g fill="#7f4426">
        <circle cx="312" cy="184" r="10" />
        <circle cx="324" cy="179" r="10" />
        <circle cx="334" cy="188" r="9" />
        <circle cx="321" cy="193" r="8" />
        <circle cx="306" cy="190" r="6.5" />
        <circle cx="336" cy="176" r="6.5" />
      </g>
      <g fill="#9a5a34" opacity="0.75">
        <circle cx="318" cy="175" r="3" />
        <circle cx="331" cy="184" r="2.6" />
        <circle cx="309" cy="181" r="2.2" />
      </g>
      <path d="M0 196 C60 166 140 168 200 182 C232 190 258 200 290 206 C330 214 370 214 400 212 L400 300 L0 300 Z" fill={`url(#${u}-sheet)`} />
      <path d="M30 206 C70 196 120 200 160 214 M60 238 C110 226 170 232 214 248 M120 270 C160 262 200 266 240 280 M280 240 C310 232 350 236 380 246" fill="none" stroke="#cbb79c" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </>
  );
}

function Hammock({ u }: { u: string }) {
  const rand = mulberry32(4207);
  const bokeh = Array.from({ length: 46 }, () => ({
    x: Math.round(rand() * 480),
    y: Math.round(rand() * 190),
    r: +(1.2 + rand() * 5).toFixed(1),
    o: +(0.18 + rand() * 0.5).toFixed(2),
  }));
  return (
    <>
      <defs>
        <linearGradient id={`${u}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3519" />
          <stop offset="100%" stopColor="#4a5a2a" />
        </linearGradient>
        <linearGradient id={`${u}-ray`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9b0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}-cloth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6ead0" />
          <stop offset="100%" stopColor="#d8c39c" />
        </linearGradient>
        <filter id={`${u}-blur`}>
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width="480" height="300" fill={`url(#${u}-bg)`} />
      <g filter={`url(#${u}-blur)`}>
        <circle cx="60" cy="40" r="70" fill="#1d2712" />
        <circle cx="210" cy="10" r="80" fill="#5b7330" opacity="0.7" />
        <circle cx="380" cy="60" r="90" fill="#1f2a13" />
        <circle cx="470" cy="190" r="70" fill="#56702d" opacity="0.6" />
        <circle cx="120" cy="230" r="80" fill="#2a3618" />
      </g>
      <path d="M480 0 L360 0 L160 300 L330 300 Z" fill={`url(#${u}-ray)`} />
      <g fill="#f8dc90">
        {bokeh.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} opacity={b.o} />
        ))}
      </g>
      <path d="M248 300 C252 262 254 236 250 212 L282 212 C280 238 282 266 290 300 Z" fill="#3b2a19" />
      <path d="M0 108 L46 132 M440 196 L480 186" stroke="#d9c9a5" strokeWidth="2" />
      <path d="M44 128 C150 230 318 252 444 194 L446 206 C320 272 140 252 36 140 Z" fill={`url(#${u}-cloth)`} />
      {/* the reader */}
      <path d="M168 156 C200 170 250 196 330 214 C320 226 290 232 250 226 C214 214 186 196 164 174 Z" fill="#f4eee2" />
      <circle cx="160" cy="152" r="11.5" fill="#c58b66" />
      <path d="M149 150 C150 138 166 134 172 144 C168 142 160 142 156 150 Z" fill="#2c1b12" />
      <g transform="rotate(-18 230 150)">
        <rect x="214" y="136" width="36" height="27" rx="1.5" fill="#f7efd9" />
        <path d="M232 136 V163" stroke="#cdb990" strokeWidth="1" />
        <path d="M218 143 H229 M218 148 H228 M235 143 H246 M235 148 H244" stroke="#b9a57e" strokeWidth="0.8" />
      </g>
      <circle cx="212" cy="160" r="4" fill="#c58b66" />
      <path d="M90 170 C130 210 230 236 320 236" fill="none" stroke="#fff6dd" strokeWidth="3" opacity="0.45" />
      <g fill="#fff4d6" opacity="0.55">
        <ellipse cx="120" cy="196" rx="14" ry="5" />
        <ellipse cx="300" cy="226" rx="18" ry="5" />
        <ellipse cx="380" cy="214" rx="10" ry="4" />
      </g>
      {/* crate and laptop */}
      <rect x="52" y="252" width="86" height="48" fill="#b0905f" />
      <path d="M52 266 H138 M52 282 H138" stroke="#8d6f45" strokeWidth="1.4" />
      <path d="M66 252 L62 226 L112 222 L116 250 Z" fill="#2f2f27" />
      <path d="M69 247 L66 229 L108 225.6 L111 244.5 Z" fill="#3e3d31" />
      <path d="M72 233 L94 231.4 M73 238 L101 236 M74 243 L88 242" stroke="#e4d59c" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

function Lake({ u }: { u: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9ad84" />
          <stop offset="55%" stopColor="#f7d8bb" />
          <stop offset="100%" stopColor="#fcebd8" />
        </linearGradient>
        <radialGradient id={`${u}-sun`} cx="0.24" cy="0.47" r="0.36">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="30%" stopColor="#ffe4bd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffe4bd" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1d2b5" />
          <stop offset="100%" stopColor="#9fa197" />
        </linearGradient>
        <linearGradient id={`${u}-shore`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66733d" />
          <stop offset="100%" stopColor="#36401f" />
        </linearGradient>
        <linearGradient id={`${u}-flare`} x1="0" y1="0" x2="1" y2="0">
          <SpectrumStops />
        </linearGradient>
        <filter id={`${u}-mist`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${u}-blur1`}>
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
      </defs>
      <rect width="480" height="300" fill={`url(#${u}-sky)`} />
      <rect width="480" height="300" fill={`url(#${u}-sun)`} />
      <path d="M0 148 C20 138 34 144 50 136 C66 130 78 142 96 138 C120 132 132 146 150 140 L190 142 C214 132 232 146 258 138 C282 132 300 144 326 136 C356 128 380 146 410 138 C440 132 460 142 480 136 L480 158 L0 158 Z" fill="#7e877c" opacity="0.6" />
      <rect x="0" y="154" width="480" height="96" fill={`url(#${u}-water)`} />
      <g fill="#fff3df" opacity="0.8">
        <rect x="100" y="160" width="26" height="2" rx="1" />
        <rect x="94" y="168" width="38" height="2" rx="1" />
        <rect x="104" y="177" width="20" height="2" rx="1" />
        <rect x="90" y="186" width="44" height="1.6" rx="0.8" />
      </g>
      <g filter={`url(#${u}-mist)`} fill="#fffaf2" opacity="0.75">
        <ellipse cx="80" cy="170" rx="110" ry="9" />
        <ellipse cx="300" cy="176" rx="140" ry="10" />
        <ellipse cx="450" cy="168" rx="80" ry="8" />
      </g>
      <path d="M0 300 L0 226 C80 214 170 222 250 216 C330 210 410 212 480 204 L480 300 Z" fill={`url(#${u}-shore)`} />
      <g stroke="#8a9a52" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
        <path d="M30 230l-2-9M36 229l1-8M200 222l-2-8M206 221l2-9M420 210l-2-8M426 209l1-8M330 214l-1-7" />
      </g>
      {/* the angler */}
      <g transform="translate(296 168)" fill="#2e2a24">
        <circle cx="7" cy="4" r="4" />
        <path d="M2 10 Q7 8 12 10 L13 30 L1 30 Z" />
        <path d="M4 30 L3 48 M10 30 L11 48" stroke="#2e2a24" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M11 13 L18 20" stroke="#2e2a24" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
      <path d="M313 188 L420 114" stroke="#3a352d" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M420 114 Q426 150 432 186" stroke="#fff8ea" strokeWidth="0.6" fill="none" opacity="0.8" />
      <ellipse cx="432" cy="188" rx="5" ry="1.2" fill="none" stroke="#fff3df" strokeWidth="0.6" opacity="0.8" />
      {/* folding table with a closed laptop and a thermos */}
      <path d="M118 236 L206 230 L210 236 L122 242 Z" fill="#c9b28c" />
      <path d="M126 242 L140 274 M204 236 L190 270 M140 242 L126 272 M192 236 L206 268" stroke="#6d5a3e" strokeWidth="2" />
      <path d="M138 233 L180 230 L182 233 L140 236 Z" fill="#5c5f63" />
      <rect x="188" y="214" width="9" height="20" rx="3" fill="#7c8f8a" />
      <rect x="188" y="214" width="9" height="4" rx="1.5" fill="#4d5a57" />
      {/* the flare splits into a faint spectrum */}
      <rect x="140" y="121" width="80" height="2.6" fill={`url(#${u}-flare)`} opacity="0.32" transform="rotate(10 183 121)" filter={`url(#${u}-blur1)`} />
      <circle cx="226" cy="150" r="6" fill="none" stroke="#fff3d6" strokeWidth="1" opacity="0.5" />
    </>
  );
}

const SCENES: Record<DaylightSceneId, (p: { u: string }) => ReactNode> = {
  trailhead: Trailhead,
  morning: Morning,
  hammock: Hammock,
  lake: Lake,
};

export type DaylightSceneProps = {
  scene: DaylightSceneId;
  /** Unique id prefix for the SVG gradients when one scene renders twice on a page. */
  uid?: string;
  /** Alt text override; null when decorative. */
  alt?: string | null;
  /** Film grain opacity; the brand default is 4%. */
  grain?: number;
  /** CSS aspect ratio; omit when the parent sizes the box. */
  aspect?: string;
  /** Fill a positioned parent (absolute inset 0) instead of flowing. */
  fill?: boolean;
  className?: string;
};

/** A daylight scene that fills its box (slice crop) with 4% grain over it. */
export function DaylightScene({ scene, uid, alt, grain = 0.04, aspect, fill = false, className }: DaylightSceneProps) {
  const Scene = SCENES[scene];
  const u = uid ?? `dl-${scene}`;
  const label = alt === undefined ? DAYLIGHT_ALT[scene] : alt;
  return (
    <div className={cn(fill ? "absolute inset-0" : "relative", "overflow-hidden bg-[#e8c9a0]", className)} style={aspect ? { aspectRatio: aspect } : undefined}>
      <svg
        viewBox="0 0 480 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role={label ? "img" : undefined}
        aria-label={label ?? undefined}
        aria-hidden={label ? undefined : true}
      >
        <Scene u={u} />
      </svg>
      <Grain opacity={grain} />
    </div>
  );
}

export type DaylightPlateProps = {
  scene: DaylightSceneId;
  /** Mono kicker before the caption, "Writings" by default. */
  kicker?: string;
  caption?: string;
  /** CSS aspect ratio of the image, 16/9.6 like the writing cards by default. */
  aspect?: string;
  uid?: string;
  className?: string;
};

/** Daylight portrait plate: the image, no overlay, and a mono caption beneath. */
export function DaylightPlate({ scene, kicker = "Writings", caption, aspect = "16 / 9.6", uid, className }: DaylightPlateProps) {
  return (
    <figure className={cn("min-w-0 overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]", className)}>
      <DaylightScene scene={scene} uid={uid} aspect={aspect} className="w-full" />
      <figcaption className="border-t border-hair-soft px-4 py-3 font-mono text-[10.5px] leading-[1.6] text-ink-faint">
        <span className="uppercase tracking-[0.14em] text-ink-dim">{kicker}</span>
        <span aria-hidden="true" className="mx-2">
          ·
        </span>
        <span className="tracking-[0.02em]">{caption ?? DAYLIGHT_CAPTION[scene]}</span>
      </figcaption>
    </figure>
  );
}
