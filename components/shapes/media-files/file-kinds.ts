// File kinds, limits and meta lines shared by every file viewer variant. Server-safe, no hooks.
// Kinds follow the readers in galileo (files.mjs), the Space dashboard previewer and the
// space-drift local reader: text renders as text, media in its own stage, the rest is a note.
import { NOW_ISO } from "@/lib/fixtures";
import { formatBytes, formatRelative } from "@/lib/format";

export type FileKind =
  | "markdown"
  | "code"
  | "json"
  | "csv"
  | "html"
  | "text"
  | "image"
  | "svg"
  | "audio"
  | "video"
  | "pdf"
  | "document"
  | "binary";

/** One file as a viewer receives it. Content is present for text kinds only. */
export type ViewerFile = {
  /** File name, such as README.md */
  name: string;
  /** Path shown under the name, such as xo-space/README.md */
  path: string;
  kind: FileKind;
  /** Bytes on disk. */
  size: number;
  /** ISO time of the last change; null when the source does not say. */
  modifiedAt: string | null;
  /** Text content for text kinds. */
  content?: string;
  /** The viewer shows only the first TRUNCATE_BYTES of this file. */
  truncated?: boolean;
  /** Language hint for source highlighting: ts, json, sh, md, csv. */
  language?: string;
};

/** One commit in a file's history, for the version picker. */
export type FileVersion = {
  /** Full or short commit hash; the picker shows seven characters. */
  hash: string;
  /** Relative time label, such as "2h ago". */
  ago: string;
  subject: string;
  /** The file as that commit left it. */
  content: string;
  size: number;
};

/** galileo shows text up to 2 MB; past it the page links to the raw file. */
export const TOO_LARGE_BYTES = 2 * 1024 * 1024;
/** The Space dashboard, xo-client and space-drift read the first 256 KB of large text. */
export const TRUNCATE_BYTES = 256 * 1024;

/** Extension without the dot, lowercase; "" when the name has none. */
export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

export const KIND_LABEL: Record<FileKind, string> = {
  markdown: "Markdown",
  code: "Source",
  json: "JSON",
  csv: "Table",
  html: "HTML",
  text: "Text",
  image: "Image",
  svg: "SVG",
  audio: "Audio",
  video: "Video",
  pdf: "PDF",
  document: "Document",
  binary: "Binary",
};

/** Kinds that have text the Source toggle can show. */
export function hasSource(kind: FileKind): boolean {
  return ["markdown", "code", "json", "csv", "html", "text", "svg"].includes(kind);
}

/** Kinds whose preview differs from their source. */
export function hasRendering(kind: FileKind): boolean {
  return kind === "markdown" || kind === "html" || kind === "csv";
}

/** Relative modified label against the fixed catalog clock. */
export function modifiedLabel(file: Pick<ViewerFile, "modifiedAt">): string {
  return file.modifiedAt ? formatRelative(file.modifiedAt, NOW_ISO) : "Modified time unavailable";
}

/** "galileo"-style stamp: 2026-10-02 09:12 (UTC, no locale data). */
export function modifiedStamp(file: Pick<ViewerFile, "modifiedAt">): string {
  return file.modifiedAt ? file.modifiedAt.slice(0, 16).replace("T", " ") : "Modified time unavailable";
}

/** The Space dashboard meta line: MARKDOWN · 1.0 KB · 16m ago · truncated. */
export function metaLine(file: ViewerFile, prefix: string[] = []): string {
  return [...prefix, KIND_LABEL[file.kind], formatBytes(file.size), modifiedLabel(file), file.truncated ? "truncated" : ""]
    .filter(Boolean)
    .join(" · ");
}
