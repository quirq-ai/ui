"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Box,
  ChartColumn,
  Copy,
  FileText,
  FolderOpen,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link,
  LogOut,
  MessageSquare,
  MessageSquarePlus,
  Network,
  Play,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Share2,
  SunMoon,
  Wrench,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { KeyCombo } from "@/components/ui/kbd";
import { COMMANDS, PROJECTS } from "@/lib/fixtures";
import { CommandPalette, CommandPaletteDialog, PAGE_SEARCH_ID, type CommandItem } from "./command-palette";
import { DemoSection, DemoStatus, Example, Stage } from "./demo-kit";

const GLYPHS: Record<string, ReactNode> = {
  Box: <Box />,
  Play: <Play />,
  Copy: <Copy />,
  MessageSquarePlus: <MessageSquarePlus />,
  MessageSquare: <MessageSquare />,
  FolderOpen: <FolderOpen />,
  Search: <Search />,
  ChartColumn: <ChartColumn />,
  Inbox: <Inbox />,
  Plug: <Plug />,
  SunMoon: <SunMoon />,
  LogOut: <LogOut />,
};

const KEY_NAMES: Record<string, string> = { "⌘": "mod", "⇧": "shift" };

const ACTIONS: CommandItem[] = [
  { id: "refresh", label: "Refresh this page", group: "Actions", icon: <RefreshCw />, keywords: "reload update" },
  { id: "new-project", label: "New project", group: "Actions", icon: <Plus />, keywords: "create add" },
  { id: "copy-link", label: "Copy link to this page", group: "Actions", icon: <Link />, keywords: "url share" },
];

const PAGES: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", group: "Go to", icon: <LayoutDashboard />, keywords: "overview home map" },
  { id: "graph", label: "Graph", group: "Go to", icon: <Network />, keywords: "map nodes" },
  { id: "activity", label: "Activity", group: "Go to", icon: <Activity />, keywords: "feed timeline" },
  { id: "sharing", label: "Sharing", group: "Go to", icon: <Share2 />, keywords: "repos incoming access" },
  { id: "secrets", label: "Secrets", group: "Go to", icon: <KeyRound />, keywords: "environment credentials keys" },
  { id: "technical", label: "Technical details", group: "Go to", icon: <Wrench />, keywords: "machine local state server" },
];

const FROM_FIXTURE: CommandItem[] = COMMANDS.filter((c) => c.id !== "open-project").map((c) => ({
  id: c.id,
  label: c.label,
  group: c.group,
  icon: GLYPHS[c.glyph],
  hint: c.hint ?? undefined,
  shortcut: c.shortcut ? c.shortcut.map((k) => KEY_NAMES[k] ?? k) : undefined,
}));

const PROJECT_ITEMS: CommandItem[] = PROJECTS.map((p) => ({
  id: `project:${p.id}`,
  label: p.displayName,
  group: "Projects",
  icon: <FileText />,
  hint: "Project",
  keywords: `${p.category} ${p.description}`,
}));

const ALL = [...ACTIONS, ...FROM_FIXTURE, ...PAGES, ...PROJECT_ITEMS];
const WITHOUT_PROJECTS = [...ACTIONS, ...FROM_FIXTURE, ...PAGES];
const GROUPS = ["This page", "Actions", "Spaces", "Sessions", "Go to", "Projects"];

function Inline({ query, loading, page, items = ALL }: { query: string; loading?: boolean; page?: boolean; items?: CommandItem[] }) {
  const [ran, setRan] = useState("");
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <CommandPalette
        items={items}
        groupOrder={GROUPS}
        defaultQuery={query}
        loading={loading}
        pageScope={page ? "on this page" : null}
        className="max-h-[400px]!"
        onSelect={(item, q) => setRan(item.id === PAGE_SEARCH_ID ? `Searching this page for "${q}".` : `Ran: ${item.label}`)}
      />
      <DemoStatus className="text-center">{ran}</DemoStatus>
    </div>
  );
}

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <DemoSection title="Live · Cmd+K or Ctrl+K anywhere on this page">
        <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-keyshortcuts="Meta+K Control+K"
            className={buttonClasses({ variant: "secondary", size: "md", className: "gap-2 pl-3 pr-2 text-ink-dim hover:text-ink" })}
          >
            <Search aria-hidden="true" />
            <span>Search pages and projects</span>
            <KeyCombo keys={["mod", "K"]} size="xs" subtle />
          </button>
          <DemoStatus>{last || "Type a few letters: every word must appear, prefixes rank first."}</DemoStatus>
        </div>
      </DemoSection>

      <DemoSection title="Inline">
        <div className="grid gap-5 lg:grid-cols-2">
          <Example caption="Default · grouped results">
            <Stage align="top" className="min-h-[420px] lg:min-h-[470px]">
              <Inline query="" />
            </Stage>
          </Example>
          <Example caption="Fuzzy match" note='"sp st" finds Start space'>
            <Stage align="top" className="min-h-[300px] lg:min-h-[470px]">
              <Inline query="sp st" />
            </Stage>
          </Example>
          <Example caption="Variant · page-search row" note="When the page has its own filter">
            <Stage align="top" minHeight={330}>
              <Inline query="status" page />
            </Stage>
          </Example>
          <div className="grid gap-5">
            <Example caption="State · empty">
              <Stage align="top" minHeight={150} innerClassName="sm:pt-5!">
                <Inline query="zebra" />
              </Stage>
            </Example>
            <Example caption="State · loading" note="Projects not loaded yet">
              <Stage align="top" minHeight={150} innerClassName="sm:pt-5!">
                <Inline query="drift" loading items={WITHOUT_PROJECTS} />
              </Stage>
            </Example>
          </div>
        </div>
      </DemoSection>

      <CommandPaletteDialog
        open={open}
        onClose={() => setOpen(false)}
        items={ALL}
        groupOrder={GROUPS}
        pageScope="on this page"
        onSelect={(item, q) => {
          setLast(item.id === PAGE_SEARCH_ID ? `Searching this page for "${q}".` : `Ran: ${item.label}`);
          setOpen(false);
        }}
      />
    </div>
  );
}
