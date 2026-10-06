// Line icon set: stroked 24px icons, round caps, currentColor. Three families from the real
// products: the projects visualizer (1.7 stroke), the Space Drift sprite (1.75) and galileo's
// bar controls (1.6, redrawn from its 16 grid). Decorative by default (aria-hidden); the
// control that holds an icon carries the accessible name. Server-safe.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type IconFamily = "visualizer" | "drift" | "galileo";

type IconDef = { family: IconFamily; body: ReactNode };

const ICONS = {
  /* visualizer, xo-projects-visualizer/js/icons.js */
  app: { family: "visualizer", body: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M4 9h16M9 9v11" /></> },
  arrow: { family: "visualizer", body: <path d="m9 18 6-6-6-6" /> },
  back: { family: "visualizer", body: <path d="m15 18-6-6 6-6" /> },
  close: { family: "visualizer", body: <path d="m6 6 12 12M18 6 6 18" /> },
  code: { family: "visualizer", body: <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /> },
  document: { family: "visualizer", body: <><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></> },
  folder: { family: "visualizer", body: <path d="M3 7h7l2 2h9v10H3z" /> },
  graph: { family: "visualizer", body: <><circle cx="6" cy="7" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="16" cy="18" r="2" /><path d="m8 7 8-1M7 9l8 7M17 8l-1 8" /></> },
  live: { family: "visualizer", body: <><circle cx="12" cy="12" r="3" /><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" /></> },
  search: { family: "visualizer", body: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></> },
  session: { family: "visualizer", body: <path d="M4 5h16v12H8l-4 3z" /> },
  task: { family: "visualizer", body: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></> },
  timeline: { family: "visualizer", body: <path d="M4 12h4l2-6 4 12 2-6h4" /> },

  /* Space Drift sprite, space-drift/public/icons.svg */
  probe: { family: "drift", body: <><circle cx="15" cy="9" r="5" /><path d="m11.5 12.5-8 8M3 13l4-4m4 12 4-4M15 7v4m-2-2h4" /></> },
  land: { family: "drift", body: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /> },
  atlas: { family: "drift", body: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" /><path d="M9 4v14M15 6v14" /></> },
  reticle: { family: "drift", body: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /><circle cx="12" cy="12" r="1" /></> },
  layers: { family: "drift", body: <path d="m3 8 9-5 9 5-9 5Zm0 5 9 5 9-5M3 18l9 5 9-5" /> },
  route: { family: "drift", body: <><circle cx="5" cy="5" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h5" /></> },
  activity: { family: "drift", body: <><path d="M5 7a7 7 0 0 1 14 0M8.5 7a3.5 3.5 0 0 1 7 0M5 17a7 7 0 0 0 14 0m-10.5 0a3.5 3.5 0 0 0 7 0" /><path d="M3 12h5l2-3 4 6 2-3h5" /></> },
  constants: { family: "drift", body: <path d="M5 3v7m0 4v7M12 3v11m0 4v3M19 3v3m0 4v11M2 10h6m1 8h6m1-12h6" /> },
  help: { family: "drift", body: <><path d="M9.4 8.3a2.75 2.75 0 0 1 5.3 1c0 2-2.7 2.3-2.7 4.2" /><path d="M12 17h.01" /></> },
  lock: { family: "drift", body: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></> },
  cross: { family: "drift", body: <path d="M12 5v14M5 12h14" /> },
  copy: { family: "drift", body: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></> },
  "external-link": { family: "drift", body: <path d="M7 17 18 6M7 6h11v11" /> },
  pause: { family: "drift", body: <path d="M9 5v14M15 5v14" /> },
  play: { family: "drift", body: <path d="m8 5 11 7-11 7Z" /> },
  brake: { family: "drift", body: <rect x="6" y="6" width="12" height="12" rx="2" /> },
  "steer-left": { family: "drift", body: <path d="M18 20v-7a6 6 0 0 0-6-6H4m5-5L4 7l5 5" /> },
  "steer-right": { family: "drift", body: <path d="M6 20v-7a6 6 0 0 1 6-6h8m-5-5 5 5-5 5" /> },
  "arrow-up": { family: "drift", body: <path d="M12 20V4m-7 7 7-7 7 7" /> },
  "arrow-down": { family: "drift", body: <path d="M12 4v16m-7-7 7 7 7-7" /> },
  "arrow-left": { family: "drift", body: <path d="M20 12H4m7-7-7 7 7 7" /> },
  "arrow-right": { family: "drift", body: <path d="M4 12h16m-7-7 7 7-7 7" /> },

  /* galileo bar controls, galileo/telescope/index.html, scaled from 16 to 24 */
  reload: { family: "galileo", body: <path d="M19.5 12a7.5 7.5 0 1 1-2.25-5.4M19.5 3.75v4.5H15" /> },
  "open-external": { family: "galileo", body: <path d="M14.25 4.5h5.25v5.25M19.5 4.5l-8.25 8.25M16.5 14.25v5.25h-12v-12h5.25" /> },
} satisfies Record<string, IconDef>;

export type LineIconName = keyof typeof ICONS;

/** Default stroke per family, as each product ships it. */
export const FAMILY_STROKE: Record<IconFamily, number> = { visualizer: 1.7, drift: 1.75, galileo: 1.6 };

export const FAMILY_LABEL: Record<IconFamily, string> = {
  visualizer: "Visualizer",
  drift: "Space Drift",
  galileo: "galileo controls",
};

/** Every icon name, grouped by family, in source order. */
export const LINE_ICON_GROUPS: { family: IconFamily; names: LineIconName[] }[] = (["visualizer", "drift", "galileo"] as const).map((family) => ({
  family,
  names: (Object.keys(ICONS) as LineIconName[]).filter((n) => ICONS[n].family === family),
}));

export function iconFamily(name: LineIconName): IconFamily {
  return ICONS[name].family;
}

export type LineIconProps = {
  name: LineIconName;
  /** px; 18 is the visualizer default, Space Drift uses 12 to 19. */
  size?: number;
  /** Overrides the family default (1.6 to 1.75). */
  strokeWidth?: number;
  /** Gives the icon role=img and a name; leave unset when a control already names it. */
  title?: string;
  className?: string;
};

/** A 24-grid line icon in currentColor. */
export function LineIcon({ name, size = 18, strokeWidth, title, className }: LineIconProps) {
  const def = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? FAMILY_STROKE[def.family]}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("shrink-0", className)}
    >
      {def.body}
    </svg>
  );
}
