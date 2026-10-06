// Navigation: nav bars, tabs, sidebars, crumbs, pagers, docks and switchers.
// Reusable pieces live beside their demos and are re-exported at the bottom for sample apps.
import type { Shape } from "@/lib/types";
import { TopNavDemo } from "./top-nav-demo";
import { SiteFooterDemo } from "./site-footer-demo";
import { SegmentedDemo } from "./segmented-demo";
import { TabChipsDemo } from "./tab-chips-demo";
import { SidebarNavDemo } from "./sidebar-nav-demo";
import { BreadcrumbDemo } from "./breadcrumb-demo";
import { PaginationDemo } from "./pagination-demo";
import { CarouselDemo } from "./carousel-demo";
import { InlineLinksDemo } from "./inline-links-demo";
import { DockDemo } from "./dock-demo";
import { ScopeSwitcherDemo } from "./scope-switcher-demo";
import { AddressBarDemo } from "./address-bar-demo";
import { LoadMoreDemo } from "./load-more-demo";
import { AccountMenuDemo } from "./account-menu-demo";

export const shapes: Shape[] = [
  {
    id: "top-nav",
    name: "Top nav",
    purpose: "Global wayfinding with one CTA.",
    seenIn: ["landing:top-nav", "viz:site-navigation", "galileo:acme-site-header"],
    variants: ["Desktop", "Mobile menu", "Products menu", "Machine Speed head", "Third-party header"],
    states: ["Transparent at top", "Scrolled black/75 + hairline", "Active underline"],
    Demo: TopNavDemo,
  },
  {
    id: "site-footer",
    name: "Site footer",
    purpose: "Close every page with brand line and links.",
    seenIn: ["landing:site-footer", "landing:ms-page-chrome"],
    variants: ["quirq", "Machine Speed"],
    states: ["Link hover"],
    Demo: SiteFooterDemo,
  },
  {
    id: "segmented",
    name: "Segmented control and tabs",
    purpose: "Switch views or windows in place.",
    seenIn: [
      "space-ui:primary-pill-tabs",
      "space-ui:section-subnav",
      "space-ui:segmented-lens-switch",
      "swarm:segmented-tabs",
      "swarm:theme-toggle",
      "client:segmented-control",
      "viz:segmented-control",
    ],
    variants: ["Primary pill tabs with badge", "Underline sub-nav", "List | Graph | Tree", "Today | 7d | 30d | All", "Preview | Code", "Light | Dark | System", "Map | Dashboards | Chart"],
    states: ["Active", "Hover", "Disabled"],
    Demo: SegmentedDemo,
  },
  {
    id: "tab-chips",
    name: "Filter tab chips",
    purpose: "Mono chips that filter a list, with counts.",
    seenIn: ["landing:tab-chip-filter", "space-ui:filter-pill-strip", "viz:category-tabs", "galileo:nav-pill-link"],
    variants: ["Research filters", "Inbox status and source", "Year chips", "Category underline", "Sources pill"],
    states: ["On: ink fill", "Hover", "aria-current"],
    Demo: TabChipsDemo,
  },
  {
    id: "sidebar-nav",
    name: "Sidebar and section nav",
    purpose: "Left nav for spaces, settings and setup steps.",
    seenIn: [
      "swarm:sidebar-nav",
      "swarm:sidebar-space-item",
      "swarm:sidebar-scope-switcher",
      "swarm:sidebar-user-footer",
      "space-ui:setup-stepper-nav",
      "client:settings-section-nav",
    ],
    variants: ["My spaces with runtime logos", "Numbered setup stepper", "Settings sections", "Icon-collapsed"],
    states: ["Active", "Collapsed tooltips", "Empty"],
    Demo: SidebarNavDemo,
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    purpose: "Path context: space, section, item.",
    seenIn: ["space-ui:breadcrumb", "swarm:dynamic-breadcrumb", "galileo:breadcrumbs", "client:space-breadcrumb", "viz:hud-breadcrumb"],
    variants: ["App header", "Folder crumbs", "HUD layer crumb", "Space crumb with status dot"],
    states: ["Hover", "Copied"],
    Demo: BreadcrumbDemo,
  },
  {
    id: "pagination",
    name: "Pagination",
    purpose: "Page through tables and articles.",
    seenIn: ["space-ui:pagination", "swarm:table-pagination", "landing:prev-next-pager"],
    variants: ["Table pager", "Prev/next article cards"],
    states: ["Disabled ends", "Active page"],
    Demo: PaginationDemo,
  },
  {
    id: "carousel",
    name: "Carousel",
    purpose: "Browse cards sideways.",
    seenIn: ["landing:carousel-rail", "viz:command-center-carousel", "client:carousel-page-dots"],
    variants: ["Marketplace rail", "Command center coverflow", "Phone page dots"],
    states: ["Start, middle, end", "Front card glow"],
    Demo: CarouselDemo,
  },
  {
    id: "inline-links",
    name: "Arrow links and rung strip",
    purpose: "Quiet secondary navigation with arrows.",
    seenIn: ["landing:inline-arrow-link", "landing:link-rung-strip"],
    variants: ["Read the research →", "Circled ↗", "Back chevron", "3-col option ladder"],
    states: ["Hover arrow nudge 4px"],
    Demo: InlineLinksDemo,
  },
  {
    id: "dock",
    name: "Dock and action bar",
    purpose: "Persistent shortcut bar for modules or actions.",
    seenIn: ["swarm:liquid-glass-dock", "client:liquid-glass-dock", "client:navigator-dock", "viz:layer-action-bar", "viz:touch-control-pad"],
    variants: ["Liquid glass phone dock", "Navigator dock with project chips", "HUD action pills", "Touch pad"],
    states: ["Active", "Disabled when xo-space down"],
    Demo: DockDemo,
  },
  {
    id: "scope-switcher",
    name: "Source and root switcher",
    purpose: "Pick current source or graph root from a grouped menu.",
    seenIn: ["galileo:source-switcher", "galileo:source-menu", "space-ui:graph-root-picker"],
    variants: ["Ports / Files menu", "Graph root picker with search"],
    states: ["Loading", "Empty", "Current tinted"],
    Demo: ScopeSwitcherDemo,
  },
  {
    id: "address-bar",
    name: "Address bar and browser tabs",
    purpose: "Show and type where a framed app is; manage tabs.",
    seenIn: ["galileo:telescope-bar", "galileo:path-field", "client:browser-tab-strip", "client:browser-toolbar"],
    variants: ["Telescope bar", "In-app toolbar", "Tab strip"],
    states: ["Disabled before load", "Invalid address", "Tab unloaded"],
    Demo: AddressBarDemo,
  },
  {
    id: "load-more",
    name: "Show more and load older",
    purpose: "Extend a list in place without paging.",
    seenIn: [
      "landing:tab-chip-filter (expand toggle)",
      "space-ui:activity-event-feed (cursor pagination)",
      "space-ui:agent-runtime-row (Other agents disclosure)",
    ],
    variants: ["Read more news ↓ / Show fewer news ↑", "Load older activity (cursor)", "Other agents (2) disclosure"],
    states: ["More available", "Loading…", "End of list", "Collapsed"],
    Demo: LoadMoreDemo,
  },
  {
    id: "account-menu",
    name: "Account menu",
    purpose: "Show who is signed in and reach billing, theme and sign out.",
    seenIn: ["swarm:sidebar-user-footer", "swarm:dropdown-menu (Account: Billing, Log out)", "swarm:avatar-group"],
    variants: ["Sidebar footer expanded", "Collapsed avatar only", "Top-right avatar"],
    states: ["Open", "Signed out", "Avatar loading"],
    Demo: AccountMenuDemo,
  },
];

export { TopNav, MachineSpeedHead, ThirdPartyHeader } from "./top-nav";
export type { TopNavProps, TopNavLink, TopNavMenuItem, MachineSpeedHeadProps, ThirdPartyHeaderProps } from "./top-nav";
export { SiteFooter, MachineSpeedFooter, MachineSpeedBars, SOCIAL_GLYPHS } from "./site-footer";
export type { SiteFooterProps, FooterColumn, FooterLink, FooterSocial, MachineSpeedFooterProps } from "./site-footer";
export { PillTabs, SubNav, SubNavAction, LensSwitch, ToggleGroup, ViewTabs } from "./segmented";
export type { SegmentItem, PillTabsProps, SubNavProps, LensSwitchProps, ToggleGroupProps, ViewTabsProps } from "./segmented";
export { FilterChips, StatusTrack, CategoryTabs, NavPill } from "./tab-chips";
export type { FilterChip, FilterChipsProps, StatusTrackProps, CategoryTab, CategoryTabsProps, NavPillProps } from "./tab-chips";
export {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarSpaceItem,
  SidebarCreateButton,
  SidebarEmptyRow,
  SidebarSkeleton,
  SidebarThemeButton,
  SidebarScopeSwitcher,
  SetupStepper,
  SettingsNav,
} from "./sidebar-nav";
export type { SidebarProps, SidebarItemProps, SidebarSpace, SidebarSpaceItemProps, SidebarScope, SetupStep, SetupStepperProps, SettingsSection } from "./sidebar-nav";
export { Breadcrumb, XOHomeCrumb, SpaceCrumb, HudCrumb, RuntimeIdBadge } from "./breadcrumb";
export type { Crumb, BreadcrumbProps, SpaceCrumbProps, HudCrumbProps } from "./breadcrumb";
export { Pagination, TablePager, PrevNextPager, pageRange } from "./pagination";
export type { PaginationProps, TablePagerProps, PagerLink, PageToken } from "./pagination";
export { SnapRail, Coverflow, PageDots, SwipePages } from "./carousel";
export type { SnapRailProps, CoverflowProps, PageDotsProps, SwipePagesProps, RailPosition } from "./carousel";
export { ArrowLink, ArrowGlyph, CircleArrow, LinkedCard, RungStrip } from "./inline-links";
export type { ArrowLinkProps, LinkedCardProps, Rung } from "./inline-links";
export { GlassDock, NavigatorDock, ActionBar, TouchPad } from "./dock";
export type { GlassDockProps, DockApp, NavigatorDockProps, NavTab, ActionPill, TouchKey } from "./dock";
export { SourceSwitcher, SourceMenu, GraphRootPicker, sourceDetail } from "./scope-switcher";
export type { SourceLike, SourceMenuProps, SourceSwitcherProps, RootOption, GraphRootPickerProps } from "./scope-switcher";
export { PathField, TelescopeBar, BrowserToolbar, BrowserTabStrip, FramedPage } from "./address-bar";
export type { PathFieldProps, TelescopeBarProps, BrowserToolbarProps, BrowserTabInfo, BrowserTabStripProps } from "./address-bar";
export { LoadMoreRow, ExpandToggle, Disclosure, useFocusOnChange } from "./load-more";
export type { LoadMoreRowProps, ExpandToggleProps, DisclosureProps } from "./load-more";
export { AccountMenu, ThemeIcon, nextTheme, THEME_LABEL, THEME_ORDER } from "./account-menu";
export type { AccountMenuProps, AccountUser, AccountAction, ThemeChoice } from "./account-menu";
export { DropdownMenu, MenuItem, MenuGroup, MenuSeparator, MenuHeader, useDismiss, moveFocus } from "./menu";
export type { DropdownMenuProps, MenuItemProps, MenuTriggerProps } from "./menu";
