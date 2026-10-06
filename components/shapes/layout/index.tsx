// Layout, type and texture: containers, kickers, headers, heroes, grain and disclosure.
// Every shape is prop-driven and imports only from components/ui, components/brand and lib.
import type { Shape } from "@/lib/types";
import SectionBandDemo from "./demo-section-band";
import EyebrowDemo from "./demo-eyebrow";
import PageHeaderDemo from "./demo-page-header";
import HeroDemo from "./demo-hero";
import GrainDemo from "./demo-grain";
import AccordionDemo from "./demo-accordion";
import ThemeDemo from "./demo-theme";
import A11yDemo from "./demo-a11y";

export const shapes: Shape[] = [
  {
    id: "section-band",
    name: "Section band and dividers",
    purpose: "Max-1180 container, section rhythm and hairline separators.",
    seenIn: ["landing:section-band", "space-ui:divider"],
    variants: ["default", "compact strip", "article 68ch", "middle-dot facts"],
    states: ["static"],
    Demo: SectionBandDemo,
  },
  {
    id: "eyebrow-meta",
    name: "Eyebrow kicker and mono meta",
    purpose: "Introduce sections; carry bylines, captions and relative times.",
    seenIn: ["landing:eyebrow-kicker", "landing:mono-meta-line", "viz:map-captions", "space-ui:relative-timestamp"],
    variants: ["plain", "numbered", "map caption with dot", "relative time with full-date title"],
    states: ["static", "revealed"],
    Demo: EyebrowDemo,
  },
  {
    id: "page-header",
    name: "Page header and toolbar",
    purpose: "Title, dim qualifier, summary and controls above a page or list.",
    seenIn: [
      "landing:two-tone-headline",
      "landing:page-header-with-filters",
      "landing:series-head",
      "space-ui:page-header",
      "space-ui:list-toolbar",
      "galileo:page-header",
      "client:phone-page-header",
      "viz:dashboard-detail-header",
    ],
    variants: ["marketing two-tone", "index with filters", "app 30px head", "phone 22px with refresh", "dashboard with time chip", "series head"],
    states: ["refreshing", "partial data note"],
    Demo: PageHeaderDemo,
  },
  {
    id: "hero",
    name: "Hero",
    purpose: "Claim, sub and one primary CTA with optional art.",
    seenIn: [
      "landing:home-hero",
      "landing:statement-glow-section",
      "landing:gradient-hero-panel",
      "landing:ms-split-hero",
      "swarm:welcome-hero",
      "viz:hero-intro",
      "galileo:acme-hero",
      "space-ui:wiki-welcome-quickstart",
    ],
    variants: [
      "split prism",
      "statement glow",
      "products aurora",
      "Machine Speed ghost words",
      "app welcome banner",
      "space-drift intro",
      "wiki quickstart",
      "third-party hero",
    ],
    states: ["staggered reveal"],
    Demo: HeroDemo,
  },
  {
    id: "grain-backdrop",
    name: "Grain, glow and reveal motion",
    purpose: "Analog texture and restrained entrance motion.",
    seenIn: ["landing:film-grain-overlay", "landing:scroll-reveal", "viz:ambient-backdrop"],
    variants: ["site grain", "card noise", "dot grid", "HUD vignette", "staggered reveal"],
    states: ["hidden until on", "reduced motion visible"],
    Demo: GrainDemo,
  },
  {
    id: "accordion",
    name: "Accordion and disclosure",
    purpose: "Reveal steps, layers or method one at a time.",
    seenIn: [
      "landing:numbered-accordion",
      "landing:layers-accordion",
      "landing:disclosure-accordion",
      "galileo:acme-faq-accordion",
      "space-ui:disclosure-details",
    ],
    variants: ["numbered workflow", "three-layer with rail", "method details", "FAQ", "Advanced settings"],
    states: ["open", "collapsed .5"],
    Demo: AccordionDemo,
  },
  {
    id: "theme-variants",
    name: "Light and themed surfaces",
    purpose: "Show the same shapes on a light theme and the alternate Space themes.",
    seenIn: [
      "space-ui:theme-picker-swatches",
      "space-ui:xo-brand-mark (light)",
      "galileo:galileo-page-shell (light)",
      "swarm:theme-toggle",
      "swarm:activity-rings-widget (light)",
    ],
    variants: ["dark (default)", "light (Linen, galileo light page, xo-mark light)", "Grove", "Neon (id quirq)", "Midnight", "Graphite"],
    states: ["system", "forced light", "forced dark"],
    Demo: ThemeDemo,
  },
  {
    id: "a11y-primitives",
    name: "Focus ring, skip link and reduced motion",
    purpose: "Make the focus rule and the reduced-motion rule visible.",
    seenIn: [
      "space-ui:page-header (visually hidden titles)",
      "landing:scroll-reveal",
      "landing:status-dot (pulse off for reduced motion)",
    ],
    variants: ["focus on pill", "focus on chip", "focus on table row", "reduced motion on"],
    states: ["focus-visible", "reduced motion"],
    Demo: A11yDemo,
  },
];
