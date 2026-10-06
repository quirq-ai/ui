// Sequences and decision trees from galileo's architecture doc, with the acme source on
// its fixture port. Short labels ride on the arrows; the full wording is in the step list.
import { GALILEO, GALILEO_SOURCES } from "@/lib/fixtures";
import type { DecisionEdge, DecisionNode, DecisionTrace, SeqMessage, SeqParticipant } from "./sequence-diagram";

const P = GALILEO.port;
const ACME = GALILEO_SOURCES.find((s) => s.name === "acme");
const APP = ACME?.port ?? 4173;

/* ----------------------------------------------------------------- opening a source */

export const OPEN_PARTICIPANTS: SeqParticipant[] = [
  { id: "T", label: "telescope", sub: `localhost:${P}` },
  { id: "F", label: "its frame", sub: `acme.localhost:${P}` },
  { id: "G", label: "galileo", sub: `127.0.0.1:${P}` },
  { id: "A", label: "the app", sub: `localhost:${APP}` },
];

export const OPEN_MESSAGES: SeqMessage[] = [
  { from: "T", to: "T", label: "the address is /s/acme/pricing, so show acme at /pricing", short: "show acme at /pricing" },
  { from: "T", to: "F", label: `a frame of acme.localhost:${P}/pricing`, short: "a frame of acme/pricing" },
  { from: "F", to: "G", label: `GET /pricing, Host acme.localhost:${P}`, short: "GET /pricing" },
  { from: "G", to: "G", label: "routeForHost finds acme, a port source", short: "routeForHost: acme" },
  { from: "G", to: "A", label: `GET /pricing, Host localhost:${APP}, accept-encoding identity`, short: `GET /pricing, Host :${APP}` },
  { from: "A", to: "G", label: "200 text/html, with X-Frame-Options DENY and a strict CSP", short: "200 text/html, strict CSP", reply: true },
  {
    from: "G",
    to: "F",
    label: "framed by galileo alone, the policy loosened for one script, the body as it streams",
    short: "framed by galileo, streamed",
    reply: true,
  },
  { from: "G", to: "F", label: "after the last byte, the bridge's tag", short: "the bridge's tag", reply: true },
  { from: "F", to: "G", label: "GET /__xo/bridge.js", short: "GET /__xo/bridge.js" },
  { from: "F", to: "T", label: "postMessage, where: /pricing and the page's title", short: "postMessage: where /pricing", reply: true },
  { from: "T", to: "T", label: "the bar, the tab's title and the address follow", short: "bar and address follow" },
];

/* ----------------------------------------------------------------- the app is down */

export const DOWN_MESSAGES: SeqMessage[] = [
  { from: "F", to: "G", label: `GET /pricing, Host acme.localhost:${P}`, short: "GET /pricing" },
  { from: "G", to: "A", label: `proxy to :${APP}`, short: `proxy :${APP}` },
  { from: "A", to: "G", label: "nothing answers on the port", short: "nothing answers", reply: true },
  { from: "G", to: "F", label: "502, a page saying Waiting for acme that tries again every 2 seconds", short: "502 · Waiting for acme", reply: true },
];

/* ----------------------------------------------------------------- router history */

export const HISTORY_PARTICIPANTS: SeqParticipant[] = [
  { id: "U", label: "Person" },
  { id: "T", label: "telescope", sub: `localhost:${P}` },
  { id: "F", label: "the frame", sub: "one frame, reused" },
];

export const HISTORY_MESSAGES: SeqMessage[] = [
  { from: "U", to: "F", label: "clicks Pricing inside the app", short: "clicks Pricing" },
  { from: "F", to: "F", label: "the frame loads /pricing, and the tab's history gains an entry", short: "loads /pricing" },
  { from: "F", to: "T", label: "the bridge: where, /pricing", short: "where: /pricing", reply: true },
  { from: "T", to: "T", label: "replaces its own address with /s/acme/pricing", short: "address /s/acme/pricing" },
  { from: "U", to: "T", label: "Back", short: "Back" },
  { from: "T", to: "F", label: "the browser takes the frame back to /", short: "frame back to /", reply: true },
  { from: "F", to: "T", label: "the bridge: where, /", short: "where: /", reply: true },
  { from: "T", to: "T", label: "replaces its address with /s/acme/", short: "address /s/acme/" },
  { from: "U", to: "T", label: "types /about in the path, Enter", short: "types /about, Enter" },
  { from: "T", to: "T", label: "adds /s/acme/about to history", short: "history + /s/acme/about" },
  { from: "T", to: "F", label: "location.replace to /about, with no entry of its own", short: "location.replace /about" },
  { from: "U", to: "T", label: "picks site from the source menu", short: "picks site" },
  { from: "T", to: "T", label: "adds /s/site/ to history", short: "history + /s/site/" },
  { from: "T", to: "F", label: `location.replace to site.localhost:${P}/, the same frame`, short: `replace site.localhost:${P}/` },
];

/* ----------------------------------------------------------------- request sorting */

export const SORT_NODES: DecisionNode[] = [
  { id: "req", label: "a request", kind: "start" },
  { id: "host", label: "its Host", kind: "decision" },
  { id: "own", label: "its path", kind: "decision" },
  { id: "tel", label: "telescope's page", kind: "result", tone: "blu" },
  { id: "assets", label: "telescope's files", kind: "result", tone: "blu" },
  { id: "api", label: "the sources API, own pages only", kind: "result", tone: "blu" },
  { id: "foreign", label: "421, and nothing else", kind: "result", tone: "red" },
  { id: "known", label: "a source?", kind: "decision" },
  { id: "missing", label: "a page listing the real sources (404)", kind: "result", tone: "org" },
  { id: "path", label: "its path", kind: "decision" },
  { id: "bridge", label: "the bridge", kind: "result", tone: "blu" },
  { id: "proxy", label: "proxied to the port", kind: "step" },
  { id: "files", label: "read from disk", kind: "result", tone: "grn" },
  { id: "up", label: "anything answers?", kind: "decision" },
  { id: "page", label: "the app's response", kind: "result", tone: "grn" },
  { id: "wait", label: "Waiting page, every 2 s (502)", kind: "result", tone: "org" },
];

export const SORT_EDGES: DecisionEdge[] = [
  { from: "req", to: "host" },
  { from: "host", to: "own", label: "localhost" },
  { from: "host", to: "foreign", label: "any other" },
  { from: "host", to: "known", label: "name.localhost" },
  { from: "own", to: "tel", label: "/, /s/…" },
  { from: "own", to: "assets", label: "…/telescope/*" },
  { from: "own", to: "api", label: "…/api/sources" },
  { from: "known", to: "missing", label: "no" },
  { from: "known", to: "path", label: "yes" },
  { from: "path", to: "bridge", label: "…/bridge.js" },
  { from: "path", to: "proxy", label: "port" },
  { from: "path", to: "files", label: "files" },
  { from: "proxy", to: "up" },
  { from: "up", to: "page", label: "yes" },
  { from: "up", to: "wait", label: "no" },
];

export const SORT_TRACES: DecisionTrace[] = [
  { id: "sources", label: `localhost:${P}/sources`, path: ["req", "host", "own", "tel"] },
  { id: "down", label: "acme, app down", path: ["req", "host", "known", "path", "proxy", "up", "wait"] },
  { id: "notes", label: "notes.localhost", path: ["req", "host", "known", "path", "files"] },
  { id: "foreign", label: "evil.example.com", path: ["req", "host", "foreign"] },
];

export const SORT_DESCRIPTION =
  "A request is sorted by its Host. localhost or 127.0.0.1 goes to galileo's own paths: telescope's page, telescope's files, or the sources API for galileo's own pages only. Any other host gets 421 and nothing else. A name.localhost host is checked against the sources: an unknown name gets a page listing the real sources; a known one is sorted by path: the bridge script, proxied to the port, or read from disk for a files source. When a proxied port does not answer, a page load gets a Waiting page that retries every 2 seconds.";

/* ----------------------------------------------------------------- files source */

export const FILES_NODES: DecisionNode[] = [
  { id: "req", label: `GET notes.localhost:${P}/drafts/plan.md`, kind: "start", w: 250, mono: true },
  { id: "method", label: "GET or HEAD?", kind: "decision", w: 120 },
  { id: "no405", label: "405: files are read only", kind: "result", tone: "red" },
  { id: "safe", label: "no hidden name, inside the source?", kind: "decision", w: 168 },
  { id: "nf", label: "404", kind: "result", tone: "org" },
  { id: "what", label: "what is there?", kind: "decision", w: 136 },
  { id: "index", label: "an index.html?", kind: "decision", w: 136 },
  { id: "html", label: "the file, with the bridge on a page load", kind: "result", tone: "blu" },
  { id: "listing", label: "a listing, hidden names left out", kind: "result", tone: "grn" },
  { id: "load", label: "a page load, without ?raw?", kind: "decision", w: 160 },
  { id: "view", label: "a page that shows the file", kind: "result", tone: "grn" },
  { id: "raw", label: "the file itself, its type, byte ranges", kind: "result", tone: "grn" },
];

export const FILES_EDGES: DecisionEdge[] = [
  { from: "req", to: "method" },
  { from: "method", to: "no405", label: "no" },
  { from: "method", to: "safe", label: "yes" },
  { from: "safe", to: "nf", label: "no" },
  { from: "safe", to: "what", label: "yes" },
  { from: "what", to: "html", label: "HTML" },
  { from: "what", to: "index", label: "a folder" },
  { from: "what", to: "load", label: "other" },
  { from: "index", to: "listing", label: "no" },
  { from: "index", to: "html", label: "yes" },
  { from: "load", to: "view", label: "yes" },
  { from: "load", to: "raw", label: "no" },
];

export const FILES_TRACES: DecisionTrace[] = [
  { id: "plan", label: "plan.md", path: ["req", "method", "safe", "what", "load", "view"] },
  { id: "folder", label: "a folder", path: ["req", "method", "safe", "what", "index", "listing"] },
  { id: "post", label: "POST", path: ["req", "method", "no405"] },
];

export const FILES_DESCRIPTION =
  "A files source answers only GET or HEAD, otherwise 405. A hidden name, or a path that leads outside the source once symlinks are followed, is 404. A folder serves its index.html with the bridge, or a listing galileo makes. An HTML file is served with the bridge on a page load. Any other file gets a page that shows it on a page load, or the file itself with its type and byte ranges.";

/* ----------------------------------------------------------------- CSP loosening */

export const CSP_NODES: DecisionNode[] = [
  { id: "policy", label: "a page's CSP, enforced or report-only", kind: "start", w: 260 },
  { id: "copy", label: "no script-src? default-src is copied into one, never widened", kind: "step", w: 260 },
  { id: "trusts", label: "trusts a nonce, a hash, 'strict-dynamic', or nothing?", kind: "decision", w: 240 },
  { id: "nonce", label: "galileo's nonce is added, and the tag carries it", kind: "result", tone: "grn", w: 160 },
  { id: "self", label: "lists 'self' or *?", kind: "decision", w: 150 },
  { id: "keep", label: "left as it is", kind: "result", tone: "neutral", w: 120 },
  { id: "add", label: "'self' is added: the bridge is same-origin", kind: "result", tone: "blu", w: 160 },
];

export const CSP_EDGES: DecisionEdge[] = [
  { from: "policy", to: "copy" },
  { from: "copy", to: "trusts" },
  { from: "trusts", to: "nonce", label: "yes" },
  { from: "trusts", to: "self", label: "no" },
  { from: "self", to: "keep", label: "yes" },
  { from: "self", to: "add", label: "no" },
];

export const CSP_TRACES: DecisionTrace[] = [
  { id: "nonce", label: "nonce policy", path: ["policy", "copy", "trusts", "nonce"] },
  { id: "inline", label: "'unsafe-inline' only", path: ["policy", "copy", "trusts", "self", "add"] },
];

export const CSP_DESCRIPTION =
  "Each policy on a page that gets the bridge is loosened just enough. With no script-src, default-src is copied into one, never widened. If script-src trusts a nonce, a hash or 'strict-dynamic', or allows nothing, galileo's nonce is added and the tag carries it. Otherwise, a policy that lists 'self' or * is left as it is, and any other gets 'self' added, since the bridge is same-origin.";
