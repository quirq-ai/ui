// galileo gateway page: the small page galileo makes on a source's own address to show one
// file (name, size, modified, Raw, then the body) in its own light and dark palette, plus the
// notes for files too large to show and kinds it cannot show. Server-safe, no hooks.
// Palette from galileo/src/server.mjs PAGE_CSS; dark uses XO lime as its accent.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";

export type GatewayScheme = "dark" | "light";

const PALETTE: Record<GatewayScheme, Record<string, string>> = {
  light: { "--g-bg": "#f7f8f4", "--g-fg": "#1b2016", "--g-muted": "#5f6a57", "--g-line": "#dfe4d8", "--g-accent": "#3f6e18", "--g-code": "#eef1ea" },
  dark: { "--g-bg": "#111410", "--g-fg": "#e8ede3", "--g-muted": "#9ca693", "--g-line": "#262c22", "--g-accent": "#83d63a", "--g-code": "#171b15" },
};

export type GatewayPageProps = {
  scheme?: GatewayScheme;
  /** Address shown in the strip above the page, such as http://notes.localhost:4100/plan.md */
  url: string;
  /** Page body: a file head plus text, media or a note. */
  children: ReactNode;
  /** Fixed body height in px; the page scrolls inside it. */
  height?: number;
  className?: string;
};

/** A source address framed with its URL, rendered in galileo's own page palette. */
export function GatewayPage({ scheme = "dark", url, children, height = 300, className }: GatewayPageProps) {
  return (
    <div
      className={cn("min-w-0 overflow-hidden rounded-[12px] border", scheme === "dark" ? "border-hair" : "border-black/10", className)}
      style={PALETTE[scheme] as CSSProperties}
    >
      <div className="flex items-center gap-2 border-b border-(--g-line) bg-(--g-bg) px-3 py-2">
        <span aria-hidden="true" className="flex gap-1">
          <span className="size-2 rounded-full bg-(--g-line)" />
          <span className="size-2 rounded-full bg-(--g-line)" />
          <span className="size-2 rounded-full bg-(--g-line)" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-(--g-code) px-3 py-0.5 text-center font-mono text-[11px] text-(--g-muted)">{url}</span>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label={`Page at ${url}`}
        className="scroll-thin overflow-auto bg-(--g-bg) px-4 py-4 text-[14px] leading-normal text-(--g-fg)"
        style={{ height, colorScheme: scheme }}
      >
        {children}
      </div>
    </div>
  );
}

const linkCls = "cursor-pointer text-(--g-accent) underline-offset-2 hover:underline";

/**
 * galileo's links: a real anchor when there is an address, a button when the caller handles
 * the action (a demo, or an app that intercepts it), and plain text when there is neither,
 * so nothing that does nothing looks like a link.
 */
function GatewayLink({ children, href, onClick, download }: { children: ReactNode; href?: string; onClick?: () => void; download?: boolean }) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={linkCls}>
        {children}
      </button>
    );
  }
  if (href) {
    return (
      <a href={href} download={download || undefined} className={linkCls}>
        {children}
      </a>
    );
  }
  return <span>{children}</span>;
}

export type GatewayFileHeadProps = {
  label: string;
  size: number;
  /** galileo stamp, such as 2026-10-02 09:12 */
  modified: string;
  /** Handles the Raw link in place; otherwise Raw links to rawHref. */
  onRaw?: () => void;
  rawHref?: string;
};

/** File head line: mono name, size and modified time, then Raw. */
export function GatewayFileHead({ label, size, modified, onRaw, rawHref = "?raw" }: GatewayFileHeadProps) {
  return (
    <p className="mb-3 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 text-[13px]">
      <span className="break-all font-mono text-[14px]">{label}</span>
      <span className="text-(--g-muted)">
        {formatBytes(size)} · {modified}
      </span>
      <GatewayLink href={rawHref} onClick={onRaw}>
        Raw
      </GatewayLink>
    </p>
  );
}

/** Text body: escaped, wrapped, on the code tint. Markdown is shown as text in galileo v0. */
export function GatewayText({ text }: { text: string }) {
  return (
    <pre className="m-0 whitespace-pre-wrap break-words rounded-[8px] border border-(--g-line) bg-(--g-code) px-4 py-3.5 font-mono text-[13px] leading-[1.55]" style={{ tabSize: 4 }}>
      {text}
    </pre>
  );
}

/** Media body: the picture at most full width, radius 6. */
export function GatewayMedia({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[6px] [&>svg]:h-auto [&>svg]:w-full">{children}</div>;
}

export type GatewayNoteProps = {
  children: ReactNode;
  /** Link words after the note, such as "Open it as it is". */
  action: string;
  onAction?: () => void;
  /** Link target when no handler is given; "?raw" in galileo. */
  href?: string;
  /** The unsupported note's link downloads the file. */
  download?: boolean;
};

/** Muted note with an inline action, for files galileo will not show. */
export function GatewayNote({ children, action, onAction, href, download }: GatewayNoteProps) {
  return (
    <p className="mt-5 text-[14px] text-(--g-muted)">
      {children}{" "}
      <GatewayLink href={href} onClick={onAction} download={download}>
        {action}
      </GatewayLink>
      .
    </p>
  );
}

/** The too-large note from galileo files.mjs: past 2 MB the page links to the file itself. */
export function tooLargeText(size: number): string {
  return `This file is ${formatBytes(size)}, too large to show here.`;
}

export type GatewayListingEntry = { name: string; folder: boolean; size: number; modified: string };

export type GatewayListingProps = {
  /** Path segments from the source root, such as ["notes", "drafts"]. */
  crumbs: string[];
  entries: GatewayListingEntry[];
  sourceName: string;
  /**
   * Handles a crumb or entry in place with its path from the source root ("" is the root,
   * folders end in "/"). Without it, crumbs and entries are plain links.
   */
  onOpen?: (path: string) => void;
};

/** Folder listing galileo makes when a folder has no index.html: crumbs, a table, the read-only note. */
export function GatewayListing({ crumbs, entries, sourceName, onOpen }: GatewayListingProps) {
  const here = crumbs.slice(1).map((c) => `${c}/`).join("");
  const crumbPath = (i: number) => crumbs.slice(1, i + 1).map((c) => `${c}/`).join("");
  return (
    <>
      <p className="mb-3 break-words font-mono text-[13px] text-(--g-muted)">
        {crumbs.map((c, i) => (
          <span key={`${c}-${i}`}>
            {i > 0 ? " / " : null}
            <GatewayLink href={`/${crumbPath(i)}`} onClick={onOpen ? () => onOpen(crumbPath(i)) : undefined}>
              {c}
            </GatewayLink>
          </span>
        ))}
      </p>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th scope="col" className="border-b border-(--g-line) px-2.5 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-(--g-muted)">
              Name
            </th>
            <th scope="col" className="border-b border-(--g-line) px-2.5 py-1.5 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-(--g-muted)">
              Size
            </th>
            <th scope="col" className="hidden border-b border-(--g-line) px-2.5 py-1.5 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-(--g-muted) sm:table-cell">
              Modified
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const name = `${e.name}${e.folder ? "/" : ""}`;
            return (
              <tr key={e.name}>
                <td className="break-all border-b border-(--g-line) px-2.5 py-1.5 font-mono text-left">
                  <GatewayLink href={encodeURIComponent(e.name) + (e.folder ? "/" : "")} onClick={onOpen ? () => onOpen(here + name) : undefined}>
                    {name}
                  </GatewayLink>
                </td>
                <td className="whitespace-nowrap border-b border-(--g-line) px-2.5 py-1.5 text-right tabular-nums text-(--g-muted)">{e.folder ? "" : formatBytes(e.size)}</td>
                <td className="hidden whitespace-nowrap border-b border-(--g-line) px-2.5 py-1.5 text-right tabular-nums text-(--g-muted) sm:table-cell">{e.modified}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-[13px] text-(--g-muted)">Hidden files are never shown, and node_modules isn&apos;t listed. {sourceName} is read only.</p>
    </>
  );
}

/** A galileo message page: the 22px heading and its paragraphs (waiting, no such source). */
export function GatewayMessage({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-3 text-[14px] leading-normal">
      <h4 className="mb-3 mt-2 text-[22px] font-semibold leading-tight tracking-[-0.01em]">{title}</h4>
      {children}
    </div>
  );
}
