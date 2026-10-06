import type { Shape } from "@/lib/types";
import { FileViewerDemo } from "./file-viewer-demo";
import { FramedMediaDemo } from "./framed-media-demo";
import { AppLauncherDemo } from "./app-launcher-demo";

export const shapes: Shape[] = [
  {
    id: "file-viewer",
    name: "File viewer",
    purpose: "Read any file read-only.",
    seenIn: [
      "galileo:file-viewer",
      "galileo:galileo-page-shell",
      "space-ui:file-previewer-window",
      "client:file-preview-pane",
      "viz:file-viewer-modal",
      "viz:media-preview-stage",
    ],
    variants: ["floating window", "pane", "modal", "gateway page", "media stage"],
    states: ["loading", "too large", "unsupported", "truncated"],
    Demo: FileViewerDemo,
  },
  {
    id: "framed-media",
    name: "Framed screenshot",
    purpose: "Present product UI in a dark frame.",
    seenIn: ["landing:framed-media", "landing:browser-frame-mock", "landing:screenshot-tab-viewer"],
    variants: ["framed", "browser mock", "tab viewer"],
    states: ["crossfade"],
    Demo: FramedMediaDemo,
  },
  {
    id: "app-icon-grid",
    name: "App icon launcher",
    purpose: "Phone home screen of apps and add-ons.",
    seenIn: ["swarm:app-icon-launcher-grid", "client:home-screen-app-grid", "client:app-icon-tile", "client:addon-status-tile"],
    variants: ["app", "add-on", "restart"],
    states: ["disabled until running", "loading"],
    Demo: AppLauncherDemo,
  },
];
