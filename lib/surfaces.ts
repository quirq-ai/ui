/** Product surfaces the inventory read, keyed by the seenIn prefix. */
export const SURFACES = {
  landing: { label: "quirq site", repo: "quirq/landing", color: "var(--ink)" },
  "space-ui": { label: "XO Space", repo: "xo-space/space_ui", color: "var(--org)" },
  swarm: { label: "XO Swarm", repo: "xo-swarm", color: "var(--grn)" },
  galileo: { label: "galileo · telescope", repo: "galileo", color: "var(--cyn)" },
  client: { label: "xo-client", repo: "xo-client-mvp", color: "var(--pur)" },
  viz: { label: "visualizers", repo: "xo-projects-visualizer · space-drift", color: "var(--blu)" },
} as const;

export type SurfaceKey = keyof typeof SURFACES;

/** "space-ui:graph-legend (light)" -> { key: "space-ui", ref: "graph-legend (light)" } */
export function parseSeenIn(entry: string): { key: SurfaceKey | null; ref: string } {
  const i = entry.indexOf(":");
  const key = (i > 0 ? entry.slice(0, i) : entry) as SurfaceKey;
  return { key: key in SURFACES ? key : null, ref: i > 0 ? entry.slice(i + 1) : entry };
}

/** Unique surfaces for a seenIn list, each with the refs that mention it. */
export function groupSeenIn(seenIn: string[]) {
  const out = new Map<SurfaceKey, string[]>();
  for (const s of seenIn) {
    const { key, ref } = parseSeenIn(s);
    if (!key) continue;
    out.set(key, [...(out.get(key) ?? []), ref]);
  }
  return [...out.entries()].map(([key, refs]) => ({ key, refs, ...SURFACES[key] }));
}
