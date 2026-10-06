import type { Shape } from "@/lib/types";
import { ModalDemo } from "./modal-demo";
import { ConfirmDemo } from "./confirm-demo";
import { DrawerDemo } from "./drawer-demo";
import { GlassAlertDemo } from "./glass-alert-demo";
import { MenuDemo } from "./menu-demo";
import { TipDemo } from "./tip-demo";
import { CommandPaletteDemo } from "./command-palette-demo";
import { TourDemo } from "./tour-demo";

// Reusable pieces, exported for apps built from the catalog.
export { Overlay, useFocusReturn, useFocusRescue, useOutsidePointer, useScrollLock, trapTab, focusables } from "./overlay-core";
export { Modal } from "./modal";
export { ModalPanel, ModalFooter, ModalNotice, MODAL_WIDTHS } from "./modal-panel";
export { ConnectProviderBody } from "./connect-provider";
export { SettingsPanel, SettingsGroup, MemberRow } from "./settings-dialog";
export { DesignEditorPanel, BarPreview, DESIGN_ACCENTS } from "./design-editor";
export { AtlasBody, ToursBody, ManualBody } from "./drift-dialogs";
export { ConfirmPanel, InlineConfirm, DangerZone, DangerZoneRow, TypeToConfirm, RemovalPanel } from "./confirm";
export { ConfirmDialog } from "./confirm-dialog";
export { DrawerPanel, DrawerSection, DrawerFacts, DrawerRow, RunResult } from "./drawer";
export { Drawer } from "./drawer-layer";
export { GlassAlert, GlassButton, GlassWell, MagicPathAlert } from "./glass-alert";
export { GlassAlertLayer, SecretAlert } from "./glass-alert-layer";
export { Menu, MenuSurface, ContextMenu } from "./menu";
export { Tip, HoverCard, NodeCard, Popover, placeLayer } from "./tip";
export { CommandPalette, CommandPaletteDialog, scoreCommand, PAGE_SEARCH_ID } from "./command-palette";
export { TourCard, Spotlight, TargetMarker, Diamond } from "./tour";

export const shapes: Shape[] = [
  {
    id: "modal",
    name: "Modal dialog",
    purpose: "Focused tasks: connect, settings, atlas, tours.",
    seenIn: [
      "swarm:modal-dialog",
      "swarm:settings-dialog-sidenav",
      "client:connect-provider-dialog",
      "client:telescope-design-editor",
      "viz:atlas-dialog",
      "viz:tours-dialog",
      "viz:flight-manual-dialog",
    ],
    variants: ["connect provider", "settings with side nav", "design editor", "atlas", "tours", "manual"],
    states: ["busy", "error", "success"],
    Demo: ModalDemo,
  },
  {
    id: "destructive-confirm",
    name: "Destructive confirm and danger zone",
    purpose: "Confirm irreversible actions.",
    seenIn: ["swarm:destructive-confirm", "space-ui:inline-confirm", "space-ui:danger-removal-panel", "client:danger-zone-panel"],
    variants: ["alert dialog", "inline confirm", "type name", "danger zone panel"],
    states: ["checking", "blocked"],
    Demo: ConfirmDemo,
  },
  {
    id: "side-drawer",
    name: "Side sheet and detail drawer",
    purpose: "Inspect one item beside the current view.",
    seenIn: [
      "space-ui:graph-detail-side-panel",
      "space-ui:run-results-drawer",
      "swarm:side-sheet",
      "viz:project-detail-drawer",
      "landing:entity-detail-panel",
    ],
    variants: ["graph inspector", "project drawer", "run results", "billing sheet", "entity panel"],
    states: ["open", "loading"],
    Demo: DrawerDemo,
  },
  {
    id: "ios-alert-sheet",
    name: "Glass alert sheet",
    purpose: "Phone-native modal for a secret or connect flow.",
    seenIn: ["swarm:ios-alert-sheet", "client:ios-alert-sheet"],
    variants: ["secret detail", "MagicPath connect"],
    states: ["masked", "revealed", "editing"],
    Demo: GlassAlertDemo,
  },
  {
    id: "menus",
    name: "Dropdown and context menus",
    purpose: "Contextual actions and options.",
    seenIn: ["swarm:dropdown-menu", "client:dropdown-menu", "space-ui:context-menu"],
    variants: ["space actions", "views checklist", "copy path", "column sort"],
    states: ["open", "checked"],
    Demo: MenuDemo,
  },
  {
    id: "tooltip",
    name: "Tooltip, hover card, popover",
    purpose: "Name icons and preview items on hover.",
    seenIn: [
      "space-ui:tooltip",
      "space-ui:graph-hover-card",
      "swarm:tooltip-hovercard",
      "swarm:popover-form",
      "swarm:icon-tooltip-chips",
      "client:tooltip",
      "client:inline-help-hover-card",
      "landing:graph-node-tooltip",
    ],
    variants: ["label", "help with GIF", "graph node card", "value chips", "port popover"],
    states: ["shown", "repositioned"],
    Demo: TipDemo,
  },
  {
    id: "command-palette",
    name: "Command palette",
    purpose: "Global jump-to for pages, projects and actions.",
    seenIn: ["space-ui:command-palette"],
    variants: ["page-search row"],
    states: ["empty", "loading"],
    Demo: CommandPaletteDemo,
  },
  {
    id: "tour",
    name: "Guided tour and target marker",
    purpose: "First-run coachmarks and objective markers.",
    seenIn: ["swarm:guided-tour", "client:onboarding-tour", "viz:demo-target-marker"],
    variants: ["phone tour", "mission markers"],
    states: ["step n", "offscreen arrow"],
    Demo: TourDemo,
  },
];
