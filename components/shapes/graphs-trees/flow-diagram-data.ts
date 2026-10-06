// Flow diagram datasets. Product and work maps follow the terminology brief (arrows are
// roles, dashed arrows are intended and not validated); the routing picture and route map
// follow galileo's architecture and reference docs; the blueprint is illustrative.
import { GALILEO, GALILEO_SOURCES } from "@/lib/fixtures";
import type { DiagramEdge, DiagramGroup, DiagramNode } from "./diagram";
import type { BlueprintEdge, BlueprintNode, PipelineStep, RouteGroup } from "./flow-diagram";

/* ----------------------------------------------------------------- blueprint */

export const BLUEPRINT_NODES: BlueprintNode[] = [
  { id: "trigger", kind: "trigger", dot: "var(--blu)", title: "New orders, Shopify", sub: "webhook · every event", foot: "streaming · live", x: 24, y: 136, w: 170 },
  {
    id: "reconcile",
    kind: "agent node",
    dot: "#e9eae6",
    title: "Reconcile payments and inventory",
    sub: "tools: stripe · netsuite · 3PL",
    foot: "model: routed by XO",
    footAccent: true,
    x: 236,
    y: 136,
    w: 196,
  },
  { id: "exception", kind: "conditional", dot: "#a8aba3", title: "Exception found?", sub: "margin, stock or payment mismatch", foot: "2 caught overnight", x: 474, y: 136, w: 170 },
  {
    id: "recover",
    kind: "agent node",
    dot: "var(--blu)",
    title: "Recover the order",
    sub: "requote shipping · retry payment",
    foot: "→ decision to your phone · $12,400",
    footAccent: true,
    x: 690,
    y: 16,
    w: 170,
    highlight: true,
  },
  { id: "ledger", kind: "function", dot: "#6b6e67", title: "Update ledger and report", sub: "posts to the monthly number", foot: "✓ done · logged", x: 690, y: 254, w: 170 },
];

export const BLUEPRINT_EDGES: BlueprintEdge[] = [
  { from: "trigger", to: "reconcile", active: true },
  { from: "reconcile", to: "exception", active: true },
  { from: "exception", to: "recover", label: "true", active: true },
  { from: "exception", to: "ledger", label: "false" },
];

/** A second, smaller blueprint that is still a draft and not running. Illustrative. */
export const DRAFT_NODES: BlueprintNode[] = [
  { id: "overdue", kind: "trigger", dot: "var(--blu)", title: "Invoice overdue, Stripe", sub: "webhook · once a day", foot: "not listening yet", x: 24, y: 20, w: 170 },
  { id: "remind", kind: "agent node", dot: "#e9eae6", title: "Draft a friendly reminder", sub: "tools: stripe · gmail", foot: "model: routed by XO", footAccent: true, x: 236, y: 20, w: 196 },
  { id: "log", kind: "function", dot: "#6b6e67", title: "Log it to the CRM", sub: "one note per customer", foot: "no runs yet", x: 474, y: 20, w: 170 },
];

export const DRAFT_EDGES: BlueprintEdge[] = [
  { from: "overdue", to: "remind" },
  { from: "remind", to: "log" },
];

export const DRAFT_DESCRIPTION =
  "The invoice-reminders blueprint is a draft and is not running. A daily trigger on overdue Stripe invoices would feed an agent node that drafts a friendly reminder with Stripe and Gmail, on a model routed by XO, and a function would log one note per customer to the CRM. It has no runs yet.";

export const BLUEPRINT_DESCRIPTION =
  "The order-recovery blueprint runs in five steps. A trigger fires on every new Shopify order. An agent node reconciles payments and inventory using Stripe, NetSuite and the 3PL, on a model routed by XO. A conditional asks whether an exception was found: a margin, stock or payment mismatch, two caught overnight. If true, a second agent node recovers the order by requoting shipping and retrying payment, and sends a decision worth $12,400 to your phone. If false, a function updates the ledger and posts to the monthly number. Illustrative numbers.";

/* ----------------------------------------------------------------- product map */

const card = (id: string, x: number, y: number, title: string, sub: string, extra: Partial<DiagramNode> = {}): DiagramNode => ({
  id,
  x,
  y,
  w: 180,
  h: 54,
  title,
  sub,
  ...extra,
});

export const PRODUCT_MAP: { width: number; height: number; nodes: DiagramNode[]; edges: DiagramEdge[] } = {
  width: 880,
  height: 452,
  nodes: [
    card("xo", 350, 6, "XO", "Product identity", { kicker: "Identity", tone: "neutral" }),
    card("swarm", 30, 118, "XO Swarm", "Hosted management product", { kicker: "Managed", tone: "grn" }),
    card("space", 350, 118, "XO Space", "Environment software", { kicker: "Open source", tone: "blu" }),
    card("ms", 670, 118, "Machine Speed", "Implementation service", { kicker: "Service", tone: "org" }),
    card("hosted", 30, 250, "Hosted space", "Work environment", { tone: "grn" }),
    card("local", 350, 250, "Local space", "Work environment", { tone: "blu" }),
    card("workflow", 670, 250, "Customer workflow", "Scoped solution", { tone: "org" }),
    card("quirq", 190, 386, "quirq", "Work metric", { tone: "pur", kicker: "Measurement" }),
    card("improve", 520, 386, "Study, test and improve", "Intended loop", { tone: "neutral" }),
  ],
  edges: [
    { id: "xo-swarm", from: "xo", to: "swarm", fromSide: "bottom", toSide: "top" },
    { id: "xo-space", from: "xo", to: "space", fromSide: "bottom", toSide: "top" },
    { id: "swarm-hosted", from: "swarm", to: "hosted", label: "launches and manages", fromSide: "bottom", toSide: "top", tone: "grn" },
    { id: "space-hosted", from: "space", to: "hosted", label: "provides capabilities within", fromSide: "left", toSide: "right", labelAt: 0.55 },
    { id: "space-local", from: "space", to: "local", label: "runs locally as", fromSide: "bottom", toSide: "top" },
    { id: "ms-workflow", from: "ms", to: "workflow", label: "scopes and implements", fromSide: "bottom", toSide: "top", tone: "org" },
    { id: "hosted-quirq", from: "hosted", to: "quirq", label: "work measured in", style: "dashed", fromSide: "bottom", toSide: "top", tone: "pur" },
    { id: "local-quirq", from: "local", to: "quirq", style: "dashed", fromSide: "bottom", toSide: "top", tone: "pur" },
    { id: "quirq-improve", from: "quirq", to: "improve", label: "informs", style: "dashed", fromSide: "right", toSide: "left", tone: "pur" },
    { id: "improve-local", from: "improve", to: "local", label: "improves configuration", style: "dashed", fromSide: "top", toSide: "right", labelAt: 0.4 },
  ],
};

export const PRODUCT_MAP_DESCRIPTION =
  "XO is the product identity. XO Swarm launches and manages hosted spaces. XO Space provides capabilities within hosted spaces and runs locally as a local space. Machine Speed scopes and implements a customer workflow. Dashed, intended and not validated: work in hosted and local spaces is measured in quirqs, which inform study, test and improve, which improves the configuration of the spaces.";

/* ----------------------------------------------------------------- work map */

export const WORK_MAP: { width: number; height: number; nodes: DiagramNode[]; edges: DiagramEdge[] } = {
  width: 880,
  height: 494,
  nodes: [
    card("space", 350, 6, "A space", "Work environment", { tone: "org", kicker: "Space" }),
    card("skills", 680, 6, "Skills", "Reusable guidance"),
    card("project", 16, 154, "Project", "Files and maintained context"),
    card("agent", 350, 154, "Agent", "Configured AI software", { tone: "blu" }),
    card("job", 680, 154, "Job", "Saved executable action"),
    card("task", 16, 296, "Task", "Work to complete"),
    card("runtime", 470, 296, "Agent runtime", "Execution software"),
    card("run", 680, 296, "Run", "One execution attempt"),
    card("session", 262, 430, "Session", "History of agent work"),
    card("model", 480, 430, "Model", "AI capability"),
    card("tools", 690, 430, "Tools", "Available actions"),
  ].map((n) => ({ ...n, w: n.id === "tools" || n.id === "model" ? 170 : 180 })),
  edges: [
    { id: "w1", from: "space", to: "project", label: "contains project copies", fromSide: "left", toSide: "top", labelAt: 0.45 },
    { id: "w2", from: "space", to: "agent", label: "supports work through", fromSide: "bottom", toSide: "top" },
    { id: "w3", from: "space", to: "job", label: "can define", fromSide: "bottom", toSide: "top", labelAt: 0.45 },
    { id: "w4", from: "project", to: "task", label: "organizes", fromSide: "bottom", toSide: "top" },
    { id: "w5", from: "agent", to: "task", label: "works on", fromSide: "left", toSide: "right" },
    { id: "w6", from: "agent", to: "session", label: "records work in", fromSide: "bottom", toSide: "top", labelAt: 0.55 },
    { id: "w7", from: "session", to: "task", label: "can relate to multiple tasks", style: "dashed", fromSide: "left", toSide: "bottom", labelAt: 0.62 },
    { id: "w8", from: "agent", to: "runtime", label: "operates through", fromSide: "bottom", toSide: "top", labelAt: 0.62 },
    { id: "w9", from: "runtime", to: "model", label: "uses", fromSide: "bottom", toSide: "top" },
    { id: "w10", from: "runtime", to: "tools", label: "calls", fromSide: "bottom", toSide: "top" },
    { id: "w11", from: "skills", to: "agent", label: "guides", fromSide: "bottom", toSide: "right", labelAt: 0.6 },
    { id: "w12", from: "job", to: "run", label: "executes as", fromSide: "bottom", toSide: "top" },
  ],
};

export const WORK_MAP_DESCRIPTION =
  "A space contains project copies, supports work through agents and can define jobs. A project organizes tasks. An agent works on tasks, records work in sessions and operates through an agent runtime, which uses models and calls tools. Skills guide the agent. A session can relate to multiple tasks. A job executes as a run.";

/* ----------------------------------------------------------------- request routing */

const APP_PORT = GALILEO_SOURCES.find((s) => s.name === "acme")?.port ?? 4173;

export const ROUTING: { width: number; height: number; nodes: DiagramNode[]; edges: DiagramEdge[]; groups: DiagramGroup[] } = {
  width: 900,
  height: 360,
  groups: [
    { id: "tab", label: `a browser tab on localhost:${GALILEO.port}`, x: 6, y: 14, w: 246, h: 330, tone: "blu" },
    { id: "galileo", label: `galileo, 127.0.0.1:${GALILEO.port}`, x: 276, y: 14, w: 430, h: 330, tone: "grn" },
  ],
  nodes: [
    { id: "bar", x: 28, y: 70, w: 202, h: 58, kicker: "telescope", title: "the bar and router" },
    { id: "frame", x: 28, y: 214, w: 202, h: 58, kicker: "a frame", title: `acme.localhost:${GALILEO.port}/pricing`, mono: true },
    { id: "route", x: 296, y: 150, w: 132, h: 58, kicker: "routeForHost", title: "which source" },
    { id: "own", x: 548, y: 50, w: 140, h: 62, title: "galileo's own host", sub: "telescope, the sources API" },
    { id: "proxy", x: 548, y: 150, w: 140, h: 58, title: "proxy and tunnel" },
    { id: "files", x: 548, y: 254, w: 140, h: 58, title: "files, read only" },
    { id: "list", x: 740, y: 52, w: 152, h: 58, shape: "store", kicker: "kept", title: "data/sources.json", mono: true },
    { id: "app", x: 740, y: 150, w: 152, h: 58, title: "an app", sub: `localhost:${APP_PORT}` },
    { id: "disk", x: 740, y: 254, w: 152, h: 58, title: "a folder or a file", sub: "~/notes" },
  ],
  edges: [
    { id: "r1", from: "bar", to: "route", fromSide: "right", toSide: "left" },
    { id: "r2", from: "frame", to: "route", fromSide: "right", toSide: "left" },
    { id: "r3", from: "route", to: "own", label: `localhost:${GALILEO.port}`, fromSide: "right", toSide: "left", tone: "grn" },
    { id: "r4", from: "route", to: "proxy", label: "a port source", fromSide: "right", toSide: "left", tone: "grn" },
    { id: "r5", from: "route", to: "files", label: "a files source", fromSide: "right", toSide: "left", tone: "grn" },
    { id: "r6", from: "proxy", to: "app", fromSide: "right", toSide: "left" },
    { id: "r7", from: "files", to: "disk", fromSide: "right", toSide: "left" },
    { id: "r8", from: "own", to: "list", fromSide: "right", toSide: "left" },
    { id: "r9", from: "frame", to: "bar", label: "the bridge: where the page is", style: "dotted", fromSide: "top", toSide: "bottom", tone: "blu" },
  ],
};

export const ROUTING_DESCRIPTION =
  `A browser tab on localhost:4100 holds telescope, the bar and router, and a frame showing acme.localhost:4100/pricing. Both send requests to galileo on 127.0.0.1:4100, where routeForHost picks the source: localhost:4100 goes to galileo's own host (telescope and the sources API, which keeps data/sources.json); a port source goes through the proxy and tunnel to an app on localhost:${APP_PORT}; a files source is read from a folder or file such as ~/notes, read only. The frame tells the bar where the page is through the bridge.`;

/* ----------------------------------------------------------------- pipeline strip */

export const WATCHER_PIPELINE = (paused: boolean): PipelineStep[] => [
  { step: "01", label: "Inputs", title: "Native sessions", caption: "Mounted CLI stores" },
  { step: "02", label: "Process", title: "Watcher", caption: paused ? "Paused" : "Every 1s · all stores", variant: "live" },
  { step: "03", label: "State", title: ".quirq + .xo", caption: "Local control · portable history", variant: "state" },
  { step: "04", label: "Views", title: "Local APIs", caption: "Timeline · projects · this map" },
];

/* ----------------------------------------------------------------- runtime tree */

export const RUNTIME_CAPABILITIES_CHIPS = ["Memory", "Context", "Skills", "Artifacts", "Documents", "Git", "Integrations", "MCP"];

/* ----------------------------------------------------------------- route map */

const P = GALILEO.port;
export const ROUTE_GROUPS: RouteGroup[] = [
  {
    id: "hosts",
    label: "Hosts",
    note: "Any other host is what a page elsewhere sends when it points its own name at this machine, so it learns nothing.",
    rows: [
      { from: `localhost:${P}`, to: "/sources" },
      { from: `localhost:${P}/sources`, to: "the Sources page" },
      { from: `localhost:${P}/s/acme/pricing`, to: "the source acme at /pricing, under telescope's bar" },
      { from: `acme.localhost:${P}/pricing`, to: "the source itself, at its own address" },
      { from: `<unknown>.localhost:${P}`, to: "a page listing the sources", code: "404" },
      { from: "any other host", to: "nothing else", code: "421" },
    ],
  },
  {
    id: "telescope",
    label: "telescope",
    note: "On galileo's own host: localhost, 127.0.0.1 or [::1], on galileo's port.",
    rows: [
      { from: "GET /, /sources, /s/…", to: "telescope's page (HEAD too)" },
      { from: "GET /__xo/telescope/telescope.js", to: "telescope's files (HEAD too)" },
      { from: "GET /__xo/health", to: "{ ok, sources }: the names, cheap enough to poll" },
      { from: "anything else", to: "not found", code: "404" },
    ],
  },
  {
    id: "api",
    label: "Sources API",
    note: "Answers galileo's own pages only. Changes must be JSON, 64 KB at most.",
    rows: [
      { from: "GET /__xo/api/sources", to: "{ sources }: every source with its address and state", code: "200" },
      { from: "POST /__xo/api/sources", to: "adds a source, or points a name somewhere else", code: "201" },
      { from: "DELETE /__xo/api/sources/:name", to: "removes a source: { ok }", code: "200" },
      { from: "DELETE an unknown name", to: "nothing to remove", code: "404" },
    ],
  },
];
