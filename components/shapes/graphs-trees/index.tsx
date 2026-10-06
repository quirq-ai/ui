import type { Shape } from "@/lib/types";
import { KnowledgeGraphDemo } from "./knowledge-graph-demo";
import { OrbitMapDemo } from "./orbit-map-demo";
import { FileTreeDemo } from "./file-tree-demo";
import { FlowDiagramDemo } from "./flow-diagram-demo";
import { SequenceDiagramDemo } from "./sequence-demo";
import { CycleDiagramDemo } from "./cycle-demo";

export const shapes: Shape[] = [
  {
    id: "knowledge-graph",
    name: "Knowledge and session graph",
    purpose: "Map sessions, projects, files and ties.",
    seenIn: [
      "landing:observatory-session-graph",
      "space-ui:force-directed-knowledge-graph",
      "space-ui:graph-legend",
      "space-ui:graph-focus-overlays",
      "space-ui:todo-satellite-orbit",
    ],
    variants: ["sessions by harness", "project categories", "file graph"],
    states: ["focused", "settling"],
    Demo: KnowledgeGraphDemo,
  },
  {
    id: "orbit-map",
    name: "Radial orbit map",
    purpose: "Categories, projects and satellites around a core.",
    seenIn: ["viz:radial-orbit-map", "viz:category-focus-map"],
    variants: ["overview", "category focus", "single project", "empty category"],
    states: ["search muting", "hover"],
    Demo: OrbitMapDemo,
  },
  {
    id: "file-tree",
    name: "File tree and explorer",
    purpose: "Browse project folders lazily.",
    seenIn: [
      "space-ui:horizontal-growth-tree",
      "space-ui:two-pane-file-explorer",
      "swarm:file-tree-preview",
      "client:file-tree-browser",
    ],
    variants: ["growth tree", "two-pane", "tree + preview", "files only"],
    states: ["loading", "empty", "unavailable", "filter no match", "preview error", "unsupported", "no selection"],
    Demo: FileTreeDemo,
  },
  {
    id: "flow-diagram",
    name: "Flow and architecture diagram",
    purpose: "Show how work, data and products connect.",
    seenIn: [
      "landing:blueprint-canvas",
      "landing:runtime-stack-viz",
      "galileo:architecture-diagrams",
      "galileo:route-map",
      "space-ui:pipeline-flow",
      "viz:product-map-diagram",
      "viz:work-map-diagram",
    ],
    variants: ["blueprint canvas", "product map", "work map", "request routing", "pipeline strip", "runtime tree", "route map"],
    states: ["running", "deployed", "draft", "watcher paused"],
    Demo: FlowDiagramDemo,
  },
  {
    id: "sequence-diagram",
    name: "Sequence and decision diagram",
    purpose: "Show who talks to whom, step by step, and how a request gets sorted in gateway and runtime flows.",
    seenIn: ["galileo:architecture-diagrams", "galileo:route-map"],
    variants: [
      "sequence: opening a source",
      "sequence: router history",
      "decision tree: request sorting",
      "decision tree: files source",
      "decision tree: CSP loosening",
    ],
    states: ["static", "step highlighted", "traced path"],
    Demo: SequenceDiagramDemo,
  },
  {
    id: "cycle-diagram",
    name: "Improvement loop diagram",
    purpose: "Show the closed loop from work to measurement to a kept or reversed change.",
    seenIn: ["viz:improvement-loop", "viz:product-map-diagram"],
    variants: ["start to improve", "short loop", "foundation loop", "quirq minting loop"],
    states: ["static", "active stage"],
    Demo: CycleDiagramDemo,
  },
];
