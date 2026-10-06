"use client";

// Two-pane file explorer: a crumb, a folder and file count, folders on the left and files
// on the right with size and modified time, and a Copy path menu on every row. Panes stack
// on narrow screens; a folder without subfolders shows the files pane alone.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Copy, CornerLeftUp, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes, plural } from "@/lib/format";
import { copyText } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/loaders";
import type { GitStatus } from "@/lib/fixtures";

/** A file or folder. Folder paths end with "/", relative to the project. */
export type FsNode = {
  name: string;
  path: string;
  type: "folder" | "file";
  size: number;
  git?: GitStatus;
  language?: string | null;
  /** "16m ago" */
  modified?: string;
  children?: FsNode[];
};

export type ExplorerState = "ready" | "loading" | "unavailable";

export type FileExplorerProps = {
  project: string;
  /** null when the project has no files yet */
  root: FsNode | null;
  /** starting folder, such as "space_ui/" ("" is the project root) */
  defaultPath?: string;
  state?: ExplorerState;
  /** why the listing is unavailable */
  unavailableReason?: string;
  /** where projects live on disk, for Copy full path; null when unknown */
  projectsFolder?: string | null;
  onOpenFile?: (path: string) => void;
  /** the selected file, highlighted */
  selectedPath?: string | null;
  className?: string;
};

function findFolder(root: FsNode, path: string): FsNode | null {
  if (!path) return root;
  let node: FsNode | undefined = root;
  const parts = path.replace(/\/$/, "").split("/");
  for (const part of parts) {
    node = node?.children?.find((c) => c.type === "folder" && c.name === part);
    if (!node) return null;
  }
  return node;
}

const parentOf = (path: string) => {
  const parts = path.replace(/\/$/, "").split("/");
  parts.pop();
  return parts.length ? `${parts.join("/")}/` : "";
};

function CopyPathMenu({
  relPath,
  fullPath,
  at,
  onDone,
  onClose,
}: {
  relPath: string;
  fullPath: string | null;
  /** viewport position: the menu is fixed so scrolling panes never clip it */
  at: { left: number; top: number };
  onDone: (message: string) => void;
  onClose: (refocus: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as Element).closest("[data-copy-anchor]")) onClose(false);
    };
    const onScroll = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose(false);
    };
    const onResize = () => onClose(false);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(ref.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? [])];
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      onClose(true);
    } else if (e.key === "Tab") onClose(false);
    else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && items.length) {
      e.preventDefault();
      items[(at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus({ preventScroll: true });
    }
  };
  const pick = async (label: string, value: string) => {
    const ok = await copyText(value);
    onClose(true);
    onDone(ok ? `${label} copied` : "Could not copy the path. Select it in a terminal instead.");
  };
  const item = (label: string, value: string | null, note: string) => (
    <button
      type="button"
      role="menuitem"
      disabled={!value}
      onClick={() => value && pick(label, value)}
      className="flex w-full flex-col items-start gap-0.5 rounded-[6px] px-2.5 py-[7px] text-left text-[12px] font-medium text-ink outline-none hover:bg-s3 focus-visible:bg-s3 disabled:cursor-default disabled:text-ink-faint"
    >
      <span>Copy {label.toLowerCase()}</span>
      <code className="max-w-full font-mono text-[11.5px] font-normal text-ink-faint [overflow-wrap:anywhere]">{value ?? note}</code>
    </button>
  );
  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Copy path"
      onKeyDown={onKey}
      style={{ left: at.left, top: at.top }}
      className="fixed z-[80] flex w-[min(300px,calc(100vw-16px))] flex-col gap-0.5 rounded-[9px] border border-hair bg-s2 p-[5px] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
    >
      {item("Relative path", relPath, "")}
      {item("Full path", fullPath, "Projects folder unknown")}
    </div>
  );
}

export function FileExplorer({
  project,
  root,
  defaultPath = "",
  state = "ready",
  unavailableReason = "Not available for the active agent",
  projectsFolder = "~/projects",
  onOpenFile,
  selectedPath = null,
  className,
}: FileExplorerProps) {
  const [cwd, setCwd] = useState(defaultPath);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuAt, setMenuAt] = useState({ left: 8, top: 8 });
  const [message, setMessage] = useState("");
  const anchors = useRef(new Map<string, HTMLButtonElement>());

  const folder = root ? findFolder(root, cwd) ?? root : null;
  const here = folder && folder !== root ? cwd : "";
  const dirs = (folder?.children ?? []).filter((c) => c.type === "folder");
  const files = (folder?.children ?? []).filter((c) => c.type === "file");
  const segments = here.replace(/\/$/, "").split("/").filter(Boolean);

  const closeMenu = (refocus: boolean) => {
    const at = menuFor;
    setMenuFor(null);
    if (refocus && at) anchors.current.get(at)?.focus({ preventScroll: true });
  };

  const copyButton = (path: string, name: string) => (
    <button
      type="button"
      data-copy-anchor
      ref={(el) => {
        if (el) anchors.current.set(path, el);
        else anchors.current.delete(path);
      }}
      aria-label={`Copy path of ${name}`}
      aria-haspopup="menu"
      aria-expanded={menuFor === path}
      onClick={(e) => {
        if (menuFor === path) {
          setMenuFor(null);
          return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        const w = Math.min(300, window.innerWidth - 16);
        const below = r.bottom + 4 + 120 < window.innerHeight;
        setMenuAt({ left: Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w)), top: below ? r.bottom + 4 : Math.max(8, r.top - 124) });
        setMenuFor(path);
      }}
      className={cn(
        "mr-1 grid size-[26px] shrink-0 place-items-center rounded-[6px] text-ink-faint transition-opacity hover:bg-s3 hover:text-ink focus-visible:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-70",
        menuFor === path ? "bg-s3 text-ink opacity-100" : "opacity-0",
      )}
    >
      <Copy aria-hidden="true" className="size-3.5" />
    </button>
  );

  const menu = (path: string) =>
    menuFor === path ? (
      <CopyPathMenu
        relPath={path.replace(/\/$/, "") || "."}
        fullPath={projectsFolder ? `${projectsFolder}/${project}/${path}`.replace(/\/$/, "") : null}
        at={menuAt}
        onDone={setMessage}
        onClose={closeMenu}
      />
    ) : null;

  const crumbs = (
    <nav aria-label="Folder path" className="mb-1.5 flex flex-wrap items-baseline gap-1 text-[12px] font-medium">
      {segments.length ? (
        <button type="button" onClick={() => setCwd("")} className="rounded-[4px] px-1 py-0.5 text-ink-faint hover:bg-s2 hover:text-ink">
          {project}
        </button>
      ) : (
        <b className="px-1 py-0.5 font-medium text-ink" aria-current="page">
          {project}
        </b>
      )}
      {segments.map((seg, i) => {
        const to = `${segments.slice(0, i + 1).join("/")}/`;
        const last = i === segments.length - 1;
        return (
          <span key={to} className="flex items-baseline gap-1">
            <span aria-hidden="true" className="text-ink-faint/60">
              /
            </span>
            {last ? (
              <b className="px-1 py-0.5 font-medium text-ink" aria-current="page">
                {seg}
              </b>
            ) : (
              <button type="button" onClick={() => setCwd(to)} className="rounded-[4px] px-1 py-0.5 text-ink-faint hover:bg-s2 hover:text-ink">
                {seg}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );

  let body;
  if (state === "loading") {
    body = (
      <div aria-busy="true">
        <p className="mb-3 text-[12px] text-ink-faint">Loading files…</p>
        <div className="space-y-2">
          {[78, 64, 70, 52].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton width={10} height={10} radius={999} />
              <Skeleton width={`${w}%`} height={12} />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (state === "unavailable") {
    body = (
      <p role="status" className="flex items-center gap-2 rounded-[9px] border border-org/30 bg-org/[0.06] px-3 py-2.5 text-[12.5px] text-ink-dim">
        <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-org" />
        {unavailableReason}
      </p>
    );
  } else if (!root || !(root.children?.length)) {
    body = <p className="rounded-[9px] border border-dashed border-hair-strong px-3 py-3 text-[12.5px] text-ink-faint">This project has no files yet.</p>;
  } else {
    const upRow = here ? (
      <div className="group/item flex items-center gap-0.5 rounded-[7px] hover:bg-s2">
        <button
          type="button"
          onClick={() => setCwd(parentOf(here))}
          className="grid min-w-0 flex-1 grid-cols-[14px_minmax(0,1fr)] items-baseline gap-2.5 rounded-[7px] px-[7px] py-[5px] text-left text-[13px] text-ink-faint"
          aria-label="Up one folder"
        >
          <CornerLeftUp aria-hidden="true" className="size-3 self-center" />
          <span>..</span>
        </button>
      </div>
    ) : null;
    body = (
      <>
        <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          {dirs.length} {plural(dirs.length, "folder")} · {files.length} {plural(files.length, "file")}
        </p>
        <div
          className={cn(
            "grid gap-4",
            dirs.length || here ? "@min-[640px]:grid-cols-[minmax(190px,270px)_minmax(0,1fr)]" : "grid-cols-1",
          )}
        >
          {dirs.length || here ? (
            <div
              role="list"
              aria-label="Folders"
              className="scroll-thin flex max-h-[220px] min-h-0 flex-col overflow-y-auto pr-1 @min-[640px]:max-h-[430px] @min-[640px]:border-r @min-[640px]:border-hair-soft @min-[640px]:pr-3"
            >
              {upRow}
              {dirs.map((d) => (
                <div key={d.path} role="listitem" className="group/item relative flex items-center gap-0.5 rounded-[7px] hover:bg-s2">
                  <button
                    type="button"
                    onClick={() => setCwd(d.path)}
                    className="grid min-w-0 flex-1 grid-cols-[14px_minmax(0,1fr)_auto] items-baseline gap-2.5 rounded-[7px] px-[7px] py-[5px] text-left text-[13px]"
                  >
                    <span aria-hidden="true" className="text-[9px] text-blu">
                      ▶
                    </span>
                    <span className="truncate text-ink">{d.name}</span>
                    <span className="whitespace-nowrap text-[12px] text-ink-faint tabular-nums">
                      {d.children?.length ?? 0} {plural(d.children?.length ?? 0, "item")}
                    </span>
                  </button>
                  {copyButton(d.path, d.name)}
                  {menu(d.path)}
                </div>
              ))}
            </div>
          ) : null}
          <div role="list" aria-label="Files" className="scroll-thin flex max-h-[430px] min-h-0 flex-col overflow-y-auto pr-1">
            {files.length ? (
              files.map((f, i) => (
                <div
                  key={f.path}
                  role="listitem"
                  className={cn(
                    "group/item relative flex items-center gap-0.5 rounded-[7px] hover:bg-s2",
                    i > 0 && "shadow-[inset_0_1px_0_var(--hair-soft)]",
                    selectedPath === f.path && "bg-s2",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onOpenFile?.(f.path)}
                    aria-current={selectedPath === f.path ? "true" : undefined}
                    className="grid min-w-0 flex-1 grid-cols-[14px_minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-0.5 rounded-[7px] px-[7px] py-[6px] text-left text-[13px] text-ink-dim group-hover/item:text-ink @min-[520px]:grid-cols-[14px_minmax(0,460px)_78px_84px] @min-[520px]:justify-start"
                  >
                    <span aria-hidden="true" className="text-ink-faint">
                      ·
                    </span>
                    <span className="truncate" title={f.name}>
                      {f.name}
                      {f.git ? (
                        <span className={cn("ml-2 font-mono text-[10px] uppercase", f.git === "modified" ? "text-org" : f.git === "added" ? "text-grn" : "text-blu")}>
                          {f.git === "modified" ? "M" : f.git === "added" ? "A" : f.git === "untracked" ? "U" : f.git.slice(0, 1).toUpperCase()}
                        </span>
                      ) : null}
                    </span>
                    <span className="col-start-2 whitespace-nowrap text-[12px] text-ink-faint tabular-nums @min-[520px]:col-start-auto @min-[520px]:text-right">
                      {formatBytes(f.size)}
                      <span className="@min-[520px]:hidden"> · {f.modified ?? "Unavailable"}</span>
                    </span>
                    <span className="hidden min-w-[70px] whitespace-nowrap text-right text-[12px] text-ink-faint tabular-nums @min-[520px]:inline">
                      {f.modified ?? "Unavailable"}
                    </span>
                  </button>
                  {copyButton(f.path, f.name)}
                  {menu(f.path)}
                </div>
              ))
            ) : (
              <p className="px-2 py-2 text-[12.5px] text-ink-faint">No files in this folder.</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cn("@container rounded-[14px] border border-hair-soft bg-[#08080a] p-3.5", className)}>
      {crumbs}
      {body}
      <p
        role="status"
        aria-live="polite"
        className={cn("text-[11.5px]", message.startsWith("Could not") ? "text-red" : "text-grn", message ? "mt-2" : "sr-only")}
      >
        {message}
      </p>
    </div>
  );
}
