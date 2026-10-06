// Shared tone vocabulary for the ui primitives. Every class string is written out in
// full so Tailwind can see it at build time; never build these names dynamically.

/** Spectrum tones plus a neutral grey. Color is delivered value, grey is everything else. */
export type Tone = "neutral" | "red" | "org" | "yel" | "grn" | "cyn" | "blu" | "pur";

/** The seven saturated spectrum stops, in brand order. */
export const SPECTRUM_TONES = ["red", "org", "yel", "grn", "cyn", "blu", "pur"] as const satisfies readonly Tone[];

/** Text color per tone. */
export const toneText: Record<Tone, string> = {
  neutral: "text-ink-dim",
  red: "text-red",
  org: "text-org",
  yel: "text-yel",
  grn: "text-grn",
  cyn: "text-cyn",
  blu: "text-blu",
  pur: "text-pur",
};

/** Solid fill per tone (dots, progress fills). */
export const toneBg: Record<Tone, string> = {
  neutral: "bg-ink-faint",
  red: "bg-red",
  org: "bg-org",
  yel: "bg-yel",
  grn: "bg-grn",
  cyn: "bg-cyn",
  blu: "bg-blu",
  pur: "bg-pur",
};

/** Soft tint: 10 to 12 percent wash, 25 to 30 percent border, toned text. */
export const toneSoft: Record<Tone, string> = {
  neutral: "bg-white/[0.06] border-hair text-ink-dim",
  red: "bg-red/10 border-red/30 text-red",
  org: "bg-org/10 border-org/30 text-org",
  yel: "bg-yel/10 border-yel/25 text-yel",
  grn: "bg-grn/10 border-grn/30 text-grn",
  cyn: "bg-cyn/10 border-cyn/25 text-cyn",
  blu: "bg-blu/12 border-blu/30 text-blu",
  pur: "bg-pur/12 border-pur/30 text-pur",
};

/** Outline: transparent fill, toned border and text. */
export const toneOutline: Record<Tone, string> = {
  neutral: "bg-transparent border-hair-strong text-ink-dim",
  red: "bg-transparent border-red/55 text-red",
  org: "bg-transparent border-org/55 text-org",
  yel: "bg-transparent border-yel/50 text-yel",
  grn: "bg-transparent border-grn/55 text-grn",
  cyn: "bg-transparent border-cyn/50 text-cyn",
  blu: "bg-transparent border-blu/55 text-blu",
  pur: "bg-transparent border-pur/55 text-pur",
};

/** Solid: full tone fill with dark ink. Dark text on bright fills, never white. */
export const toneSolid: Record<Tone, string> = {
  neutral: "bg-ink border-ink text-black",
  red: "bg-red border-red text-black",
  org: "bg-org border-org text-black",
  yel: "bg-yel border-yel text-black",
  grn: "bg-grn border-grn text-black",
  cyn: "bg-cyn border-cyn text-black",
  blu: "bg-blu border-blu text-black",
  pur: "bg-pur border-pur text-black",
};

/** Small deterministic string hash (FNV-1a, 32 bit). Same input, same output, server and client. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Picks a spectrum tone for a name, stable across renders and machines. */
export function toneFor(name: string): Exclude<Tone, "neutral"> {
  return SPECTRUM_TONES[hashString(name.trim().toLowerCase()) % SPECTRUM_TONES.length];
}
