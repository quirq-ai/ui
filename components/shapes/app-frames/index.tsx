// App frames: composite shells that hold everything else. Reusable frames live beside their
// demos and are re-exported at the bottom so a sample app can import them from one place.
import type { Shape } from "@/lib/types";
import { ConsoleShellDemo } from "./console-shell-demo";
import { SidebarAppShellDemo } from "./sidebar-app-shell-demo";
import { PhoneFrameDemo } from "./phone-frame-demo";
import { DockingWorkspaceDemo } from "./docking-workspace-demo";
import { EmbeddedFrameDemo } from "./embedded-frame-demo";
import { HudCockpitDemo } from "./hud-cockpit-demo";
import { AuthScreenDemo } from "./auth-screen-demo";

export const shapes: Shape[] = [
  {
    id: "console-shell",
    name: "Space console shell",
    purpose: "Top bar, view and status footer for a space app.",
    seenIn: ["space-ui:app-topbar", "space-ui:footer-status-bar", "landing:space-app-topbar", "viz:visualizer-topbar"],
    variants: ["Space UI", "visualizer", "Space mock"],
    states: ["online", "offline"],
    Demo: ConsoleShellDemo,
  },
  {
    id: "sidebar-app-shell",
    name: "Sidebar app shell",
    purpose: "Sidebar, header and resizable info/app split.",
    seenIn: ["swarm:app-shell", "swarm:space-split-view"],
    variants: ["paid", "paywall", "narrow toggle"],
    states: ["mobile sheet"],
    Demo: SidebarAppShellDemo,
  },
  {
    id: "phone-frame",
    name: "Phone frame",
    purpose: "A space as a resizable phone with iOS chrome.",
    seenIn: ["client:phone-frame", "client:phone-screen-shell", "client:ios-status-bar", "client:in-phone-app-frame", "swarm:phone-app-frame"],
    variants: ["phone", "tablet", "expanded", "in-phone app"],
    states: ["dragging", "app stalled"],
    Demo: PhoneFrameDemo,
  },
  {
    id: "docking-workspace",
    name: "Docking workspace",
    purpose: "Panes side by side: chat, issues, files, apps.",
    seenIn: ["client:work-docking-layout", "swarm:org-docking-workspace"],
    variants: ["split", "phone stack", "empty"],
    states: ["dragging", "restored"],
    Demo: DockingWorkspaceDemo,
  },
  {
    id: "embedded-frame",
    name: "Embedded app frame",
    purpose: "One app at its own origin under a bar.",
    seenIn: ["galileo:telescope-app-frame", "galileo:source-frame", "swarm:app-iframe-pane", "client:browser-viewport-new-tab"],
    variants: ["telescope", "iframe pane", "browser new tab"],
    states: ["kept alive", "loading"],
    Demo: EmbeddedFrameDemo,
  },
  {
    id: "hud-cockpit",
    name: "HUD cockpit frame",
    purpose: "Full-bleed canvas with HUD header and footer.",
    seenIn: ["viz:space-drift-header", "viz:hud-footer-bar"],
    variants: ["desktop", "mobile"],
    states: ["no folder", "connected"],
    Demo: HudCockpitDemo,
  },
  {
    id: "auth-screen",
    name: "Sign-in screen",
    purpose: "Centered sign-in and sign-up for hosted features before a hosted space loads.",
    seenIn: ["swarm:app-shell (Auth layout variant)", "swarm:theme-toggle (auth icon dropdown)", "swarm:org-gate"],
    variants: ["sign in", "sign up", "org join pending"],
    states: ["idle", "submitting", "error", "redirecting"],
    Demo: AuthScreenDemo,
  },
];

/* Reusable frames for sample apps (components and types; constants stay in their client files). */
export {
  CommandPalette,
  ConnectionPill,
  ConsoleBrand,
  ConsoleFooter,
  ConsoleShell,
  ConsoleTabs,
  ConsoleToast,
  ConsoleTopbar,
  ServerStatusPill,
  SpaceMockTopbar,
  VisualizerTopbar,
  type ConnectionState,
  type ConsoleShellProps,
  type ConsoleTab,
  type ConsoleTopbarProps,
  type PaletteCommand,
  type ServerState,
  type SpaceMockTopbarProps,
  type VisualizerLens,
  type VisualizerTopbarProps,
} from "./console-shell";
export {
  AppSidebarNav,
  PaywallGate,
  ScopeSwitcher,
  ShellBreadcrumb,
  SidebarAppShell,
  SpaceSplitView,
  type AppSidebarNavProps,
  type ShellMode,
  type SidebarAppShellProps,
  type SidebarNavGroup,
  type SidebarNavItem,
  type SidebarRenderState,
  type SpaceSplitViewProps,
} from "./sidebar-app-shell";
export {
  IosStatusBar,
  PhoneAppFrame,
  PhoneBody,
  PhoneHomeScreen,
  PhoneWallpaper,
  ResizablePhone,
  type PhoneAppState,
  type PhoneHomeApp,
  type ResizablePhoneProps,
} from "./phone-frame";
export { DockingWorkspace, type DockLayout, type DockPane, type DockTabset, type DockingWorkspaceProps } from "./docking-workspace";
export {
  AppIframePane,
  BridgeReadout,
  BrowserNewTab,
  BrowserTabStrip,
  BrowserToolbar,
  SourceFrame,
  TelescopeBar,
  type AppPaneState,
  type BrowserTabInfo,
  type TelescopeBarProps,
} from "./embedded-frame";
export { AtlasDialog, HudCockpit, HudFooter, HudHeader, StarfieldCanvas, type HudBody, type HudSourceState } from "./hud-cockpit";
export { AuthCard, AuthScreen, ThemeToggleMenu, type AuthCardProps, type AuthMode, type AuthStatus, type AuthTheme } from "./auth-screen";
export { Menu, type MenuEntry, type MenuProps } from "./menu";
export {
  MiniChat,
  MiniFiles,
  MiniInbox,
  MiniIssueBoard,
  MiniProjects,
  MiniSources,
  MiniSpaceDashboard,
  MiniTerminal,
  MiniUsage,
} from "./mini-apps";
