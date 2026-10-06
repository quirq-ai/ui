// Inline SVG stand-ins for media files in the viewer demos: an orbit plate (an image file), a
// product screen poster (a video file) and the source of an SVG file that readers show as
// inert text. Server-safe and deterministic: every coordinate is fixed or derived from data.
import { cn } from "@/lib/cn";

/** Planet, orbit rings and moons on a dark plate: the "lunar-orbit.png" image file. */
export function OrbitArt({
  className,
  title = "Lunar orbit plate",
  uid = "orbit-art",
}: {
  className?: string;
  title?: string | null;
  /** Unique prefix for gradient ids; pass a different one per instance on a page. */
  uid?: string;
}) {
  const id = uid;
  const moons = [
    { r: 132, a: -28, s: 7, c: "var(--cyn)" },
    { r: 176, a: 142, s: 5, c: "var(--ink)" },
    { r: 214, a: 64, s: 9, c: "var(--org)" },
    { r: 214, a: 238, s: 4, c: "var(--pur)" },
  ];
  return (
    <svg
      viewBox="0 0 640 400"
      width={640}
      height={400}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn("block h-auto max-w-full", className)}
    >
      <defs>
        <radialGradient id={`${id}-sky`} cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#141922" />
          <stop offset="1" stopColor="#050506" />
        </radialGradient>
        <radialGradient id={`${id}-planet`} cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset="0.45" stopColor="#2e6fb8" />
          <stop offset="1" stopColor="#0a1a33" />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="30%" cy="26%" r="95%">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>
        <linearGradient id={`${id}-spec`} x1="0" x2="1">
          <stop offset="0" stopColor="#ff453a" />
          <stop offset="0.2" stopColor="#ff9f0a" />
          <stop offset="0.36" stopColor="#ffd60a" />
          <stop offset="0.52" stopColor="#30d158" />
          <stop offset="0.68" stopColor="#2fd2ff" />
          <stop offset="0.84" stopColor="#2e9bff" />
          <stop offset="1" stopColor="#bf5af2" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill={`url(#${id}-sky)`} />
      {Array.from({ length: 46 }, (_, i) => {
        const x = (i * 137.5) % 640;
        const y = (i * 71.3 + (i % 5) * 19) % 400;
        return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 1.4 : 0.8} fill="#f4f3f0" opacity={0.18 + (i % 4) * 0.12} />;
      })}
      <g transform="translate(320 200)">
        {[132, 176, 214].map((r) => (
          <ellipse key={r} rx={r} ry={r * 0.36} fill="none" stroke="rgba(255,255,255,.14)" strokeDasharray={r === 176 ? "3 6" : undefined} />
        ))}
        <ellipse rx="214" ry="77" fill="none" stroke={`url(#${id}-spec)`} strokeOpacity="0.55" strokeWidth="1.2" />
        <circle r="64" fill={`url(#${id}-planet)`} />
        <circle r="64" fill={`url(#${id}-shade)`} />
        {moons.map((m, i) => {
          const rad = (m.a * Math.PI) / 180;
          return <circle key={i} cx={Math.round(m.r * Math.cos(rad))} cy={Math.round(m.r * 0.36 * Math.sin(rad))} r={m.s} fill={m.c} />;
        })}
      </g>
      <text x="24" y="376" fill="rgba(244,243,240,.55)" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="2">
        LUNAR ORBIT · PLATE 03
      </text>
    </svg>
  );
}

/** A product screen used as a video poster. `focus` highlights one row (moves while playing). */
export function ScreenPosterArt({ focus = 0, className }: { focus?: number; className?: string }) {
  const rows = ["Wire Space API status pill", "Bar UI: collapse sources", "Launchpad: retry failed starts", "Runbook: rotate tokens", "Give each source its own origin"];
  const tones = ["var(--org)", "var(--org)", "var(--grn)", "var(--grn)", "var(--cyn)"];
  const on = ((focus % rows.length) + rows.length) % rows.length;
  return (
    <svg viewBox="0 0 640 360" className={cn("block h-full w-full", className)} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="640" height="360" fill="#0b0b0d" />
      <rect x="0" y="0" width="150" height="360" fill="#101012" />
      <rect x="20" y="24" width="64" height="8" rx="4" fill="rgba(255,255,255,.5)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="20" y={62 + i * 26} width={i === 1 ? 96 : 70 + (i % 3) * 12} height="7" rx="3.5" fill={i === 1 ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.18)"} />
      ))}
      <text x="176" y="44" fill="#f4f3f0" fontSize="15" fontWeight="600" fontFamily="-apple-system, Segoe UI, sans-serif">
        Sessions
      </text>
      <text x="176" y="64" fill="#7d7d78" fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="1.5">
        RESEARCH-LAB · 4 OPEN
      </text>
      {rows.map((r, i) => {
        const y = 88 + i * 50;
        const active = i === on;
        return (
          <g key={r}>
            <rect x="170" y={y} width="446" height="40" rx="9" fill={active ? "#1d1d1f" : "#141416"} stroke={active ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.06)"} />
            <circle cx="190" cy={y + 20} r="4" fill={tones[i]} />
            <text x="204" y={y + 24} fill={active ? "#f4f3f0" : "#a3a39e"} fontSize="12" fontFamily="-apple-system, Segoe UI, sans-serif">
              {r}
            </text>
            <rect x={540} y={y + 15} width={56} height={10} rx={5} fill={active ? "rgba(46,155,255,.55)" : "rgba(255,255,255,.1)"} />
          </g>
        );
      })}
    </svg>
  );
}

/** SVG file source. Readers show SVG as inert text: active markup is never rendered. */
export const BLUE_PLANET_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">',
  "  <defs>",
  '    <radialGradient id="p" cx="38%" cy="34%" r="70%">',
  '      <stop offset="0" stop-color="#7cc4ff"/>',
  '      <stop offset="1" stop-color="#0a1a33"/>',
  "    </radialGradient>",
  "  </defs>",
  '  <ellipse cx="60" cy="60" rx="56" ry="20" fill="none" stroke="#2fd2ff" stroke-opacity=".5"/>',
  '  <circle cx="60" cy="60" r="34" fill="url(#p)"/>',
  '  <circle cx="104" cy="52" r="4" fill="#ff9f0a"/>',
  "</svg>",
  "",
].join("\n");
