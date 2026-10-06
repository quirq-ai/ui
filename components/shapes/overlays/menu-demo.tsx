"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  ChevronDown,
  Copy,
  Ellipsis,
  EyeOff,
  FileCode2,
  LayoutGrid,
  RotateCcw,
  Settings2,
  Square,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button";
import { StateChip } from "@/components/ui/status";
import { Segmented } from "@/components/ui/segmented";
import { copyText } from "@/components/ui/copy-button";
import { formatBytes } from "@/lib/format";
import { FILE_TREE, PROJECTS, SPACES, flattenTree } from "@/lib/fixtures";
import { ContextMenu, Menu, type MenuEntry } from "./menu";
import { ConfirmDialog } from "./confirm-dialog";
import { DemoStatus, Example } from "./demo-kit";

const iconTrigger =
  "inline-grid size-8 place-items-center rounded-[8px]! border border-hair bg-s2 text-ink-dim transition-colors hover:border-hair-strong hover:bg-s3 hover:text-ink aria-expanded:bg-s3 aria-expanded:text-ink [&_svg]:size-4";

const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("relative rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4", className)}>{children}</div>
);

/* ----------------------------------------------------------------------------- space actions */

const OPS = SPACES.find((s) => s.name === "ops-copilot")!;

function SpaceActions() {
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState(false);
  const items: MenuEntry[] = [
    { kind: "label", id: "name", label: OPS.name },
    { kind: "item", id: "open", label: "Open space", icon: <ArrowUpRight /> },
    { kind: "item", id: "copy", label: "Copy space ID", icon: <Copy />, hint: `${OPS.id.slice(0, 7)}…${OPS.id.slice(-4)}` },
    { kind: "item", id: "stop", label: "Stop space", icon: <Square /> },
    { kind: "separator", id: "sep" },
    { kind: "item", id: "delete", label: "Delete space", icon: <Trash2 />, destructive: true },
  ];
  return (
    <Card className="min-h-[300px]">
      <div className="flex items-center gap-3 rounded-[10px] border border-hair-soft bg-white/[0.02] px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-ink">{OPS.name}</p>
          <p className="truncate font-mono text-[11.5px] text-ink-faint">{OPS.host}</p>
        </div>
        <StateChip kind="space" state="running" className="max-[420px]:hidden" />
        <Menu
          label="Space actions"
          triggerLabel={`Actions for ${OPS.name}`}
          trigger={<Ellipsis aria-hidden="true" />}
          triggerClassName={iconTrigger}
          align="end"
          defaultOpen
          defaultActiveId="copy"
          items={items}
          onSelect={async (id) => {
            if (id === "copy") setStatus((await copyText(OPS.id)) ? "Space ID copied." : "Could not copy the space ID.");
            else if (id === "open") setStatus(`Opening ${OPS.name} (demo).`);
            else if (id === "stop") setStatus(`${OPS.name} would stop here. Demo only.`);
            else if (id === "delete") setDeleting(true);
          }}
        />
      </div>
      <DemoStatus className="absolute bottom-3 left-4 right-4">{status}</DemoStatus>
      <ConfirmDialog
        open={deleting}
        onCancel={() => setDeleting(false)}
        title="Delete space"
        description={`Delete ${OPS.name}? This cannot be undone.`}
        confirmLabel="Delete space"
        onConfirm={() => {
          setDeleting(false);
          setStatus("Demo only: nothing was deleted.");
        }}
      />
    </Card>
  );
}

/* ----------------------------------------------------------------------------- views checklist */

const VIEWS = [
  { id: "projects", label: "Projects" },
  { id: "browser", label: "Browser" },
  { id: "issues", label: "Issue board" },
  { id: "files", label: "Files" },
] as const;
type ViewId = (typeof VIEWS)[number]["id"];

function ViewsChecklist() {
  const [on, setOn] = useState<Record<ViewId, boolean>>({ projects: true, browser: false, issues: true, files: true });
  const items: MenuEntry[] = [
    { kind: "label", id: "l", label: "Work views" },
    ...VIEWS.map((v) => ({ kind: "checkbox" as const, id: v.id, label: v.label, checked: on[v.id] })),
    { kind: "separator", id: "sep" },
    { kind: "item", id: "reset", label: "Reset layout", icon: <RotateCcw /> },
  ];
  const shown = VIEWS.filter((v) => on[v.id]);
  return (
    <Card className="min-h-[300px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Menu
          label="Views"
          trigger={
            <>
              <LayoutGrid aria-hidden="true" />
              Views
              <ChevronDown aria-hidden="true" />
            </>
          }
          width={208}
          defaultOpen
          defaultActiveId="browser"
          items={items}
          onCheckedChange={(id, checked) => setOn((o) => ({ ...o, [id]: checked }))}
          onSelect={(id) => {
            if (id === "reset") setOn({ projects: true, browser: true, issues: true, files: true });
          }}
        />
        <div aria-label="Layout preview" role="img" className="grid w-[min(220px,100%)] grid-cols-2 gap-1.5">
          {shown.length ? (
            shown.map((v) => (
              <span key={v.id} className="rounded-[6px] border border-hair bg-white/[0.04] px-2 py-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">
                {v.label}
              </span>
            ))
          ) : (
            <span className="col-span-2 rounded-[6px] border border-dashed border-hair-strong px-2 py-3 text-center text-[11px] text-ink-faint">No views</span>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------------------- copy path */

const FILES = flattenTree(FILE_TREE)
  .filter(({ node }) => node.type === "file" && node.path.startsWith("space_ui/"))
  .map(({ node }) => node);

type FolderState = "known" | "loading" | "unknown";
type PathStyle = "posix" | "windows";

function CopyPath() {
  const [folder, setFolder] = useState<FolderState>("known");
  const [style, setStyle] = useState<PathStyle>("posix");
  const [status, setStatus] = useState("");
  const rel = (p: string) => (style === "windows" ? p.replaceAll("/", "\\") : p);
  const full = (p: string) => (style === "windows" ? `C:\\Users\\ada\\xo-projects\\xo-space\\${rel(p)}` : `/Users/ada/xo-projects/xo-space/${p}`);

  return (
    <Card className="flex min-h-[300px] flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Segmented<FolderState>
          aria-label="Projects folder"
          size="sm"
          value={folder}
          onChange={setFolder}
          options={[
            { value: "known", label: "Folder known" },
            { value: "loading", label: "Loading" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
        <Segmented<PathStyle>
          aria-label="Path style"
          size="sm"
          value={style}
          onChange={setStyle}
          options={[
            { value: "posix", label: "macOS" },
            { value: "windows", label: "Windows" },
          ]}
        />
      </div>
      <ContextMenu
        label="File actions"
        width={300}
        openOnClick
        defaultTarget={{ id: FILES[2]?.path ?? "", x: 96, y: 3 * 34 + 6, activeId: "full" }}
        getItems={(path) => [
          { kind: "item", id: "rel", label: "Copy relative path", icon: <Copy />, hint: rel(path) },
          {
            kind: "item",
            id: "full",
            label: "Copy full path",
            icon: <Copy />,
            hint: folder === "known" ? full(path) : folder === "loading" ? "Loading…" : "Projects folder unknown",
            disabled: folder !== "known",
          },
        ]}
        onSelect={async (id, path) => {
          const text = id === "rel" ? rel(path) : full(path);
          setStatus((await copyText(text)) ? `Copied ${text}` : "Could not copy the path.");
        }}
      >
        <ul aria-label="xo-space files" className="flex flex-col">
          {FILES.slice(0, 6).map((f) => (
            <li key={f.path}>
              <button
                type="button"
                data-context-id={f.path}
                aria-haspopup="menu"
                aria-keyshortcuts="Shift+F10"
                className="flex h-[34px] w-full items-center gap-2.5 rounded-[7px]! px-2 text-left transition-colors hover:bg-white/[0.04]"
              >
                <FileCode2 aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-dim">{rel(f.path)}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">{formatBytes(f.size)}</span>
              </button>
            </li>
          ))}
        </ul>
      </ContextMenu>
      <DemoStatus className="mt-auto truncate">{status || "Click or right-click a file, or focus it and press Shift+F10."}</DemoStatus>
    </Card>
  );
}

/* ----------------------------------------------------------------------------- column sort */

type Col = "name" | "sessions" | "active";
const COLS: { id: Col; label: string }[] = [
  { id: "name", label: "Project" },
  { id: "sessions", label: "Sessions" },
  { id: "active", label: "Last active" },
];
const ROWS = PROJECTS.slice(0, 5);

function ColumnSort() {
  const [sort, setSort] = useState<{ col: Col; dir: "asc" | "desc" } | null>(null);
  const [hidden, setHidden] = useState<Col[]>([]);
  const cols = COLS.filter((c) => !hidden.includes(c.id));
  const value = (p: (typeof ROWS)[number], c: Col) => (c === "name" ? p.displayName : c === "sessions" ? p.sessions : p.lastActiveAt);
  const rows = sort
    ? [...ROWS].sort((a, b) => {
        const x = value(a, sort.col);
        const y = value(b, sort.col);
        const n = x < y ? -1 : x > y ? 1 : 0;
        return sort.dir === "asc" ? n : -n;
      })
    : ROWS;

  const sortItems = (c: Col): MenuEntry[] => [
    { kind: "item", id: "asc", label: "Asc", icon: <ArrowUp /> },
    { kind: "item", id: "desc", label: "Desc", icon: <ArrowDown /> },
    ...(c === "name"
      ? []
      : ([
          { kind: "separator", id: "sep" },
          { kind: "item", id: "hide", label: "Hide", icon: <EyeOff /> },
        ] as MenuEntry[])),
  ];

  return (
    <Card className="min-h-[300px]">
      <div className="mb-2 flex justify-end">
        <Menu
          label="View options"
          align="end"
          width={190}
          trigger={
            <>
              <Settings2 aria-hidden="true" />
              View
            </>
          }
          items={[
            { kind: "label", id: "l", label: "Toggle columns" },
            ...COLS.map((c) => ({ kind: "checkbox" as const, id: c.id, label: c.label, checked: !hidden.includes(c.id), disabled: c.id === "name" })),
          ]}
          onCheckedChange={(id, checked) => setHidden((h) => (checked ? h.filter((x) => x !== id) : [...h, id as Col]))}
        />
      </div>
      <div>
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-hair-soft">
              {cols.map((c) => (
                <th key={c.id} scope="col" className="py-1.5 pr-2 font-normal" aria-sort={sort?.col === c.id ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                  <Menu
                    label={`${c.label} column`}
                    width={160}
                    defaultOpen={c.id === "sessions"}
                    defaultActiveId="desc"
                    trigger={
                      <>
                        {c.label}
                        {sort?.col === c.id ? sort.dir === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" /> : <ArrowUpDown aria-hidden="true" />}
                      </>
                    }
                    triggerClassName={cn(buttonClasses({ variant: "subtle", size: "sm" }), "-ml-2.5 aria-expanded:bg-s3 aria-expanded:text-ink")}
                    items={sortItems(c.id)}
                    onSelect={(id) => {
                      if (id === "hide") setHidden((h) => [...h, c.id]);
                      else setSort({ col: c.id, dir: id as "asc" | "desc" });
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-hair-soft last:border-0">
                {cols.map((c) => (
                  <td key={c.id} className={cn("py-2 pr-2", c.id === "name" ? "font-mono text-ink" : "tabular-nums text-ink-dim")}>
                    {c.id === "name" ? p.displayName : c.id === "sessions" ? p.sessions : p.lastActive}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function MenuDemo() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Example caption="Variant · space actions · state · open" note="Arrows, Home, End, a letter, Esc">
        <SpaceActions />
      </Example>
      <Example caption="Variant · views checklist · state · checked" note="Stays open on select">
        <ViewsChecklist />
      </Example>
      <Example caption="Variant · copy path (context menu)" note="Full path waits for the projects folder">
        <CopyPath />
      </Example>
      <Example caption="Variant · column sort" note="Asc, Desc, Hide, View options">
        <ColumnSort />
      </Example>
    </div>
  );
}
