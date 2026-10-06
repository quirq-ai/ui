// Lucide glyph lookup for fixture records that name an icon by string (PHONE_APPS, COMMANDS,
// INBOX). Server-safe. Unknown names fall back to a neutral app glyph.
import { createElement } from "react";
import {
  AppWindow,
  Bot,
  Box,
  ChartColumn,
  CircleSlash,
  Copy,
  FileText,
  Folder,
  FolderKanban,
  FolderOpen,
  GitPullRequest,
  Hash,
  Inbox,
  LogOut,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  NotebookPen,
  Play,
  Plug,
  Search,
  Settings2,
  Square,
  SquareKanban,
  SquareTerminal,
  SunMoon,
  Telescope,
  TriangleAlert,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

const GLYPHS: Record<string, LucideIcon> = {
  AppWindow,
  Bot,
  Box,
  ChartColumn,
  CircleSlash,
  Copy,
  FileText,
  Folder,
  FolderKanban,
  FolderOpen,
  GitPullRequest,
  Hash,
  Inbox,
  LogOut,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  NotebookPen,
  Play,
  Plug,
  Search,
  Settings2,
  Square,
  SquareKanban,
  SquareTerminal,
  SunMoon,
  Telescope,
  TriangleAlert,
  UserPlus,
};

/** Lucide component for a glyph name such as "Folder" or "ChartColumn". */
export function glyphFor(name: string): LucideIcon {
  return GLYPHS[name] ?? AppWindow;
}

/** Renders a named glyph. Decorative: the label next to it carries the meaning. */
export function Glyph({ name, className, strokeWidth }: { name: string; className?: string; strokeWidth?: number }) {
  return createElement(glyphFor(name), { "aria-hidden": true, className, strokeWidth });
}
