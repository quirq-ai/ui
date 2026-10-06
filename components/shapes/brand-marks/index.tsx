import type { Shape } from "@/lib/types";
import { ArtPlatesDemo } from "./art-demo";
import { DaylightPlateDemo } from "./daylight-demo";
import { IconSetDemo } from "./icons-demo";
import { BrandLockupsDemo } from "./lockups-demo";
import { MachineSpeedDemo } from "./machine-speed-demo";
import { QuirqWordmarkDemo } from "./quirq-wordmark-demo";
import { SpectrumAccentsDemo } from "./spectrum-demo";
import { XOMarkDemo } from "./xo-mark-demo";

export const shapes: Shape[] = [
  {
    id: "quirq-wordmark",
    name: "quirq wordmark and q mark",
    purpose: "Identify quirq in hero, nav, footer and favicon.",
    seenIn: ["landing:quirq-wordmark-and-mark"],
    variants: ["hero 280px", "footer 130px", "nav lockup", "standalone 72px", "ghost q at 21% in viz", "spectrum gradient text", "favicon tile"],
    states: ["static"],
    Demo: QuirqWordmarkDemo,
  },
  {
    id: "xo-mark",
    name: "XO mark and product lockups",
    purpose: "Product identity: two chevron pairs, outer ink, inner XO lime.",
    seenIn: ["space-ui:xo-brand-mark", "swarm:xo-logo-mark", "galileo:brand-lockup"],
    variants: [
      "dark",
      "light (#08090A + hsl(92,60%,28%))",
      "themed (recolored to ink, no glow)",
      "galileo favicon tile",
      "breadcrumb home muted",
      "product lockup with status dot",
    ],
    states: ["lime glow", "muted until hover", "logo error falls back to mark"],
    Demo: XOMarkDemo,
  },
  {
    id: "spectrum-accents",
    name: "Spectrum accents",
    purpose: "Seven-hue spectrum in small doses marking verified value.",
    seenIn: ["landing:spectrum-accents"],
    variants: ["chip", "dash", "hairline", "bar", "bullet", "gradient text"],
    states: ["static"],
    Demo: SpectrumAccentsDemo,
  },
  {
    id: "brand-lockups",
    name: "Sub-brand, runtime and partner lockups",
    purpose: "Secondary identities: Machine Speed, runtimes, partners, attribution.",
    seenIn: ["landing:ms-bars-mark", "landing:logo-strip", "swarm:space-type-logo", "swarm:integration-icon-row", "viz:product-attribution-row"],
    variants: ["bars 7x22 / 5x15", "runtime mini mark", "integration icon row", "TRUSTED BY strip", "quirq × Partner", "A product by quirq.ai", "runtime wordmarks"],
    states: ["idle 55%", "hover 100%", "active 100%"],
    Demo: BrandLockupsDemo,
  },
  {
    id: "icon-set",
    name: "Line icon set",
    purpose: "Stroked 24px icons for nav, data types and controls.",
    seenIn: ["viz:line-icon-set"],
    variants: ["app, graph, live, session, task, timeline", "probe, land, atlas, reticle", "reload, open external"],
    states: ["inherits text color"],
    Demo: IconSetDemo,
  },
  {
    id: "art-plates",
    name: "Art plates, Shift Report and generative thumbs",
    purpose: "Image systems that feel and prove the thesis.",
    seenIn: ["landing:art-plate", "landing:shift-report-caption", "landing:generative-thumb"],
    variants: ["dream", "instrument", "signal", "motion glyph", "prism art", "beam(hue)", "grad(index)", "Shift Report social, header, print"],
    states: ["static", "motion glyph animates once"],
    Demo: ArtPlatesDemo,
  },
  {
    id: "machine-speed-surface",
    name: "Machine Speed sub-brand surface",
    purpose: "Show the sub-brand on its own olive ground with its own accents.",
    seenIn: [
      "landing:ms-page-chrome",
      "landing:ms-split-hero",
      "landing:ms-cta-block",
      "landing:ms-plan-list",
      "landing:status-badge (DEPLOYED)",
      "landing:status-dot (skewed node dots)",
      "landing:formula-callout (.eq)",
    ],
    variants: ["home", "calculator with disclosures", "CTA block"],
    states: ["static", "hover"],
    Demo: MachineSpeedDemo,
  },
  {
    id: "daylight-plate",
    name: "Daylight portrait plate",
    purpose: "The human image system for writings, alongside the dream and instrument plates.",
    seenIn: ["landing:art-plate (daylight portrait)"],
    variants: ["trailhead", "morning", "hammock"],
    states: ["static"],
    Demo: DaylightPlateDemo,
  },
];
