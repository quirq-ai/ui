/** Category order and copy for the catalog. Shapes live in components/shapes/<id>/index.tsx. */
export const CATEGORY_META = [
  { id: "brand-marks", title: "Brand marks", blurb: "Identity pieces: quirq wordmark, XO mark, spectrum, lockups, icons and art." },
  { id: "layout", title: "Layout, type and texture", blurb: "Containers, kickers, headers, heroes, grain and disclosure." },
  { id: "actions", title: "Buttons and actions", blurb: "Pill CTAs, app buttons, icon buttons, copy and shortcuts." },
  { id: "navigation", title: "Navigation", blurb: "Nav bars, tabs, sidebars, crumbs, pagers, docks and switchers." },
  { id: "forms-inputs", title: "Forms and inputs", blurb: "Fields, pickers, toggles, flows for adding, sharing and signing in." },
  { id: "status-feedback", title: "Status and feedback", blurb: "Dots, badges, state words, toasts, banners and loading." },
  { id: "overlays", title: "Overlays", blurb: "Dialogs, confirms, drawers, sheets, menus, tooltips, palette, tours." },
  { id: "cards", title: "Cards and panels", blurb: "Surfaces, feature, editorial, runtime, pricing, project and control cards." },
  { id: "lists-tables", title: "Lists and tables", blurb: "Tables, grouped lists, live rows, numbered lists, boards and todos." },
  { id: "data-display", title: "Data display", blurb: "Facts, prose, terminals, instruments, matrices and avatars." },
  { id: "metrics-charts", title: "Metrics and charts", blurb: "quirq readouts, KPIs, trends, bars, rings, calculator and dashboards." },
  { id: "timelines-activity", title: "Timelines and activity", blurb: "Feeds, steppers and swimlanes over time." },
  { id: "graphs-trees", title: "Graphs, trees and diagrams", blurb: "Knowledge graphs, orbit maps, file trees and flow diagrams." },
  { id: "chat-threads", title: "Chat and agent transcript", blurb: "Conversation, tool markers, composer and history." },
  { id: "media-files", title: "Media and files", blurb: "File viewers, framed screenshots and app launchers." },
  { id: "app-frames", title: "App frames", blurb: "Composite shells that hold everything else." },
] as const;

export type CategoryId = (typeof CATEGORY_META)[number]["id"];
