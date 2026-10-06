import type { Shape } from "@/lib/types";
import { PanelSurfaceDemo } from "./surfaces-demo";
import { BentoGridDemo } from "./bento-demo";
import { FeatureCardsDemo } from "./feature-demo";
import { EditorialCardDemo } from "./editorial-demo";
import { AgentRuntimeDemo } from "./runtime-demo";
import { PricingDemo } from "./pricing-demo";
import { BillingDemo } from "./billing-demo";
import { ProjectCardDemo } from "./project-card-demo";
import { ProjectDetailDemo } from "./project-detail-demo";
import { ConnectorCardDemo } from "./connector-demo";
import { ControlCardDemo } from "./control-demo";
import { HudPanelsDemo } from "./hud-demo";

export const shapes: Shape[] = [
  {
    id: "panel-surface",
    name: "Glass card and soft panel",
    purpose: "Base containers: glass for featured, soft for default.",
    seenIn: ["landing:glass-card", "landing:soft-panel", "space-ui:card-surface", "client:section-card", "viz:category-info-panel"],
    variants: ["glass", "soft", "setup card", "section card", "info panel"],
    states: ["static", "revealed"],
    Demo: PanelSurfaceDemo,
  },
  {
    id: "bento-grid",
    name: "Bento grid",
    purpose: "Feature tiles with mini visualizations.",
    seenIn: ["landing:bento-grid"],
    variants: ["wide", "narrow"],
    states: ["staggered reveal"],
    Demo: BentoGridDemo,
  },
  {
    id: "feature-cards",
    name: "Feature, launcher and route cards",
    purpose: "Explain an area and open it, or choose a path.",
    seenIn: [
      "viz:route-chooser-cards",
      "swarm:launcher-tile-card",
      "client:feature-launcher-card",
      "swarm:org-onboarding-steps",
      "swarm:org-gate",
      "landing:install-card",
      "galileo:acme-feature-cards",
    ],
    variants: ["route chooser", "phone launcher", "org steps", "org gate", "install card", "feature grid"],
    states: ["hover", "searching", "sending", "creating", "error", "request pending", "copied"],
    Demo: FeatureCardsDemo,
  },
  {
    id: "editorial-card",
    name: "Editorial and topic card",
    purpose: "Grid unit for notes, news, guides and docs topics.",
    seenIn: ["landing:editorial-card", "landing:featured-story", "landing:tool-link-card", "space-ui:wiki-topic-card"],
    variants: ["featured lead", "post", "linked card", "tool card", "wiki topic"],
    states: ["hover zoom", "hidden by filter", "highlighted"],
    Demo: EditorialCardDemo,
  },
  {
    id: "agent-runtime-card",
    name: "Agent runtime card",
    purpose: "Pick or inspect a runtime for a space.",
    seenIn: ["landing:agent-card", "swarm:agent-runtime-card", "swarm:template-gallery-card", "space-ui:agent-runtime-row"],
    variants: ["marketplace", "create picker", "setup row", "template"],
    states: ["Featured", "In use", "Experimental", "creating", "created", "coming soon", "checking agents", "could not check"],
    Demo: AgentRuntimeDemo,
  },
  {
    id: "pricing",
    name: "Pricing plan card",
    purpose: "Compare tiers and subscribe.",
    seenIn: ["landing:pricing-tier-card", "swarm:pricing-plan-card", "galileo:acme-pricing-plans"],
    variants: ["Self-hosted $0", "Pro $20", "Max $100", "Licensed custom", "plan card"],
    states: ["highlighted", "current", "payment overdue", "upgrade preview", "subscribing", "loading"],
    Demo: PricingDemo,
  },
  {
    id: "billing",
    name: "Billing summary",
    purpose: "Subscription, proration and payment methods.",
    seenIn: ["swarm:subscription-summary", "swarm:upgrade-summary-invoice", "swarm:payment-method-card"],
    variants: ["subscription", "upgrade invoice", "payment method"],
    states: ["Active", "Trial active", "Payment overdue", "Cancelled", "loading", "error", "empty"],
    Demo: BillingDemo,
  },
  {
    id: "project-card",
    name: "Project and app card",
    purpose: "One project or app with status, people and actions.",
    seenIn: [
      "swarm:project-card-grid",
      "swarm:github-repo-link-card",
      "client:project-card",
      "client:gateway-app-card",
      "space-ui:manage-project-card",
      "viz:command-card",
      "viz:rollout-project-card",
    ],
    variants: ["grid card", "manage card", "command card", "rollout card", "app card with versions", "repo link"],
    states: ["live", "pinned", "expanded", "loading", "error", "empty"],
    Demo: ProjectCardDemo,
  },
  {
    id: "project-detail",
    name: "Project detail header",
    purpose: "Identity, owner, sharing and manifest of one project.",
    seenIn: ["swarm:project-detail-pane", "client:project-detail-header", "client:project-identity-block"],
    variants: ["pane", "phone block"],
    states: ["loading", "gone", "read-only", "error"],
    Demo: ProjectDetailDemo,
  },
  {
    id: "connector-card",
    name: "Connector card",
    purpose: "Connect a tool or telemetry source to a space.",
    seenIn: ["space-ui:connector-card", "space-ui:connector-drawers", "space-ui:native-connector-card", "space-ui:telemetry-source-card"],
    variants: ["toolkit", "native connector", "telemetry source"],
    states: ["Not connected", "On in this space", "Off in this space", "Needs attention", "Sign-in pending", "Checking…", "Unavailable", "no match", "collection off", "source not found"],
    Demo: ConnectorCardDemo,
  },
  {
    id: "control-card",
    name: "Space control card",
    purpose: "Run a space: status, start/stop, timer, update.",
    seenIn: [
      "swarm:workspace-control-card",
      "swarm:space-header-controls",
      "client:remote-session-control",
      "space-ui:server-update-card",
      "space-ui:watcher-activity-panel",
    ],
    variants: ["space card", "header controls", "remote session", "server update", "watcher"],
    states: ["Creating", "Starting", "Running", "Stopping", "Stopped", "Space could not start", "updating", "stalled"],
    Demo: ControlCardDemo,
  },
  {
    id: "hud-panels",
    name: "HUD instrument panels",
    purpose: "Mission progress, signals and course in glass HUD.",
    seenIn: [
      "viz:mission-progress-panel",
      "viz:demo-mission-hud",
      "viz:world-signature-panel",
      "viz:file-signal-panel",
      "viz:ambient-note-card",
      "viz:course-set-chip",
    ],
    variants: ["expedition", "scored mission", "world signature", "file signal", "course chip", "tour note"],
    states: ["in progress", "celebrating", "complete", "before connection", "hidden during demo"],
    Demo: HudPanelsDemo,
  },
];
