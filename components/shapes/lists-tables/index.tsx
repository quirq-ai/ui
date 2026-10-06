// lists-tables: tables, grouped lists, live rows, numbered lists, boards and todos.
// Each shape's reusable components live in their own file; demos feed them fixture data.
import type { Shape } from "@/lib/types";
import { DataTableDemo } from "./data-table-demo";
import { SettingsListDemo } from "./settings-list-demo";
import { ResourceRowsDemo } from "./resource-rows-demo";
import { NumberedListDemo } from "./numbered-list-demo";
import { IssueBoardDemo } from "./issue-board-demo";
import { TodoChecklistDemo } from "./todo-checklist-demo";

export const shapes: Shape[] = [
  {
    id: "data-table",
    name: "Data table and ledger",
    purpose: "Sortable, paginated tables.",
    seenIn: [
      "landing:data-table",
      "landing:comparison-matrix",
      "space-ui:data-table",
      "space-ui:state-tree-table",
      "swarm:spaces-data-table",
      "swarm:deployments-table",
      "swarm:files-table",
      "client:files-data-table",
      "galileo:file-listing-table",
      "viz:recent-work-table",
      "viz:data-table-reader",
    ],
    variants: ["spaces", "sessions", "files", "quarter ledger", "comparison matrix", "folder listing", "state tree", "recent work", "CSV reader"],
    states: ["empty", "loading", "hover"],
    Demo: DataTableDemo,
  },
  {
    id: "settings-list",
    name: "Inset grouped settings list",
    purpose: "iOS list of providers, channels, checklist.",
    seenIn: ["swarm:ios-grouped-list", "swarm:setup-checklist", "swarm:provider-connect-row", "client:ios-inset-grouped-list", "client:provider-connection-row"],
    variants: ["models", "channels", "data sources", "checklist 0/4", "connection row"],
    states: ["connected", "unsupported", "loading"],
    Demo: SettingsListDemo,
  },
  {
    id: "resource-rows",
    name: "Resource and inbox rows",
    purpose: "Live rows for sources, projects, jobs, inbox.",
    seenIn: [
      "galileo:source-list-group",
      "galileo:source-row",
      "space-ui:project-catalog-row",
      "space-ui:polled-connections-list",
      "space-ui:job-row",
      "space-ui:inbox-item-row",
      "space-ui:sharing-rail-row",
      "client:folder-app-list",
    ],
    variants: ["source", "project row", "folder list", "polled connection", "job", "inbox item", "sharing rail"],
    states: ["new/seen/done", "failed", "polling"],
    Demo: ResourceRowsDemo,
  },
  {
    id: "numbered-list",
    name: "Numbered and hairline lists",
    purpose: "Ordered guides, plans and features.",
    seenIn: ["landing:reading-list-row", "landing:ms-plan-list", "landing:hairline-cell-grid", "landing:feature-dot-list"],
    variants: ["reading list", "plan list", "gap-px grid", "feature dots"],
    states: ["hover"],
    Demo: NumberedListDemo,
  },
  {
    id: "issue-board",
    name: "Issue board",
    purpose: "Work items in Todo, In Progress, Completed.",
    seenIn: ["swarm:issue-kanban-board", "client:issue-kanban-board", "client:issue-card", "space-ui:github-issues-panel"],
    variants: ["carousel lanes", "issue list panel"],
    states: ["stale", "no remote", "empty lane"],
    Demo: IssueBoardDemo,
  },
  {
    id: "todo-checklist",
    name: "Todo checklist and task card",
    purpose: "What each session planned and how far it got.",
    seenIn: ["client:todo-checklist", "viz:task-card"],
    variants: ["grouped by session", "next step"],
    states: ["completed", "in progress", "pending", "blocked", "cancelled"],
    Demo: TodoChecklistDemo,
  },
];
