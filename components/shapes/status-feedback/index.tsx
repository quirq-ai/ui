import type { Shape } from "@/lib/types";
import { StatusDotDemo } from "./status-dot-demo";
import { BadgesDemo } from "./badges-demo";
import { StateChipsDemo } from "./state-chips-demo";
import { ToastDemo } from "./toast-demo";
import { StatusStripDemo } from "./status-strip-demo";
import { EmptyStateDemo } from "./empty-state-demo";
import { FullPageNoticeDemo } from "./full-page-notice-demo";
import { LoadersDemo } from "./loaders-demo";
import { ProgressDemo } from "./progress-demo";
import { ErrorStateDemo } from "./error-state-demo";

export const shapes: Shape[] = [
  {
    id: "status-dot",
    name: "Status dot and pill",
    purpose: "One saturated mark for live, down or pending.",
    seenIn: [
      "landing:status-dot",
      "landing:dot-meter",
      "space-ui:status-dot-pip",
      "swarm:status-dot-pill",
      "galileo:status-dot",
      "client:status-dot",
      "viz:connection-status-pill",
    ],
    variants: ["up/down/idle/busy", "pulse", "difficulty ●○○", "LIVE/PARTIAL/OFFLINE pill", "split status | API"],
    states: ["up", "down", "idle", "pulse"],
    Demo: StatusDotDemo,
  },
  {
    id: "badges",
    name: "Badges, tags and mono chips",
    purpose: "Small labels for type, tier, role and count.",
    seenIn: [
      "landing:status-badge",
      "landing:mono-chip",
      "space-ui:badge",
      "space-ui:tag-and-count-pills",
      "swarm:badge-set",
      "client:badges-and-chips",
      "viz:badges-and-chips",
      "galileo:http-response-chip",
    ],
    variants: ["tier tags", "runtime badges", "FEATURED / NEW / SAMPLE", "integration chips", "count pills", "HTTP chips", "LOCAL ONLY"],
    states: ["static"],
    Demo: BadgesDemo,
  },
  {
    id: "state-chips",
    name: "Object state chips",
    purpose: "Specific state words per object, never a universal Active.",
    seenIn: ["space-ui:todo-status-chip", "space-ui:status-pill-with-dot", "viz:object-state-chips"],
    variants: ["todo statuses", "space lifecycle", "measurement Available/Unavailable", "sharing state", "connector state"],
    states: ["good", "pending", "error", "idle"],
    Demo: StateChipsDemo,
  },
  {
    id: "toast",
    name: "Toast",
    purpose: "Brief feedback that does not take focus.",
    seenIn: ["space-ui:toast-and-floating-notice", "swarm:toast", "client:toast", "viz:toast", "viz:layer-prompt"],
    variants: ["success/info/warning/error", "promise chain", "HUD prompt", "floating notice"],
    states: ["entering", "auto-dismiss"],
    Demo: ToastDemo,
  },
  {
    id: "status-strip",
    name: "Alert banner and status strip",
    purpose: "Inline notice with a next action.",
    seenIn: [
      "space-ui:alert-banner",
      "space-ui:sharing-status-strip",
      "space-ui:usage-reporting-status",
      "swarm:callout-banner",
      "swarm:notification-bar",
      "galileo:inline-alert",
      "galileo:acme-dev-banner",
      "client:inline-alert-banner",
      "client:space-status-strip",
      "landing:proving-grounds-strip",
    ],
    variants: ["destructive", "amber stale", "trial", "announcement bar", "dev build", "space status line", "proving grounds dashed strip"],
    states: ["with or without action"],
    Demo: StatusStripDemo,
  },
  {
    id: "empty-state",
    name: "Empty state",
    purpose: "Explain absence and the next step.",
    seenIn: [
      "space-ui:empty-state",
      "space-ui:two-up-empty-cards",
      "swarm:empty-state",
      "galileo:empty-state",
      "client:empty-loading-error-states",
      "viz:empty-offline-error-states",
    ],
    variants: ["inline line", "dashed card", "two-up onboarding", "offline"],
    states: ["empty", "error tone"],
    Demo: EmptyStateDemo,
  },
  {
    id: "full-page-notice",
    name: "Full-page notice and result",
    purpose: "Cover a view for 404, waiting, no data or checkout result.",
    seenIn: [
      "space-ui:full-page-notice",
      "galileo:missing-route",
      "galileo:waiting-page",
      "galileo:unknown-source-page",
      "galileo:acme-quote-footer-404",
      "client:not-found-page",
      "swarm:result-status-card",
    ],
    variants: ["Nothing here", "Waiting for source", "No source called X", "No data source", "subscription result", "404"],
    states: ["auto-refresh 2s", "countdown"],
    Demo: FullPageNoticeDemo,
  },
  {
    id: "loaders",
    name: "Skeletons and spinners",
    purpose: "Shape-matched placeholders and busy indicators.",
    seenIn: ["space-ui:skeleton-and-spinner", "swarm:skeleton-loaders", "swarm:loading-spinners", "client:skeleton-placeholders", "viz:loading-orbit-spinner"],
    variants: ["row skeleton", "card skeleton", "iOS ring", "caption spinner"],
    states: ["loading", "reduced motion"],
    Demo: LoadersDemo,
  },
  {
    id: "progress",
    name: "Progress",
    purpose: "Determinate or indeterminate completion.",
    seenIn: ["space-ui:progress-bar", "viz:progress-meters"],
    variants: ["linear", "indeterminate", "segmented stage", "ring arc"],
    states: ["animating", "complete"],
    Demo: ProgressDemo,
  },
  {
    id: "error-state",
    name: "Error panel and crash boundary",
    purpose: "Say what failed, reassure the user their data is intact, and offer one recovery action.",
    seenIn: [
      "client:empty-loading-error-states",
      "viz:empty-offline-error-states",
      "space-ui:full-page-notice (view mount error bulkhead)",
      "swarm:empty-state (Workspace is down)",
    ],
    // spec examples in parentheses are the demo titles; the short names keep the spec row compact
    variants: ["load error", "view crash boundary", "map failed", "preview unavailable", "space down", "unsupported feature"],
    states: ["error", "retrying", "recovered"],
    Demo: ErrorStateDemo,
  },
];
