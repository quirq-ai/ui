"use client";

// File viewers. All of them read one file read-only and never change it.
//   ViewerBody          the body for a file kind: rendered Markdown, HTML frame, table or source
//   VersionPicker       the file's git history as a pill select ("Current version")
//   FloatingFileViewer  the Space dashboard previewer: a window floating over a view, dragged
//                       by its header, resized from its corner, closed with Esc from anywhere
//                       on its stage; a full sheet under 760px
//   FilePreviewPane     the xo-client pane: mono path, Preview / Code, Read only pill
//   FileReaderPanel     the space-drift local reader: eyebrow, title, toolbar, reading modes,
//                       status footer with an Esc hint
//   FileReaderDialog    FileReaderPanel in a native modal dialog (Esc and backdrop close it)
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, CircleAlert, Code, Download, Eye, FileQuestion, FileWarning, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes, formatDate } from "@/lib/format";
import { Button, CopyButton, IconButton, Kbd, Segmented, Spinner } from "@/components/ui";
import { CsvTable, HtmlFrame, MarkdownView, SourceView, TruncationBanner, ViewerNote } from "./file-body";
import { KIND_LABEL, TOO_LARGE_BYTES, extensionOf, hasRendering, hasSource, metaLine, type FileVersion, type ViewerFile } from "./file-kinds";

/* =================================================================== body */

export type ViewerMode = "preview" | "source";

export type ViewerBodyProps = {
  file: ViewerFile;
  mode?: ViewerMode;
  /** Wrap long source lines. */
  wrap?: boolean;
  /** Padding for text bodies; HTML frames always run edge to edge. */
  padded?: boolean;
  /** A CSV table fills the scroll area and scrolls itself; false lets it grow with its rows. */
  fill?: boolean;
  /** Copy for kinds with no text to show. */
  unsupportedText?: string;
  className?: string;
};

/** The body for one file: Markdown rendered, HTML in a sandboxed frame, CSV as a table, the rest as source. */
export function ViewerBody({
  file,
  mode = "preview",
  wrap = false,
  padded = true,
  fill = true,
  unsupportedText = "No text preview for this file type.",
  className,
}: ViewerBodyProps) {
  const text = file.content ?? "";
  if (!hasSource(file.kind)) {
    return (
      <ViewerNote icon={<FileQuestion />} className={className}>
        {unsupportedText}
      </ViewerNote>
    );
  }
  const pad = padded ? "px-5 py-4" : "";
  if (mode === "preview" && file.kind === "markdown") return <MarkdownView source={text} className={cn(pad, className)} />;
  if (mode === "preview" && file.kind === "html") return <HtmlFrame html={text} title={`${file.name} preview`} className={className} />;
  if (mode === "preview" && file.kind === "csv") return <CsvTable text={text} label={`${file.name} table`} className={cn(fill && "h-full", className)} />;
  const language = file.language ?? (file.kind === "json" ? "json" : file.kind === "code" ? "ts" : "text");
  return <SourceView text={text} language={language} wrap={wrap} label={`Source of ${file.name}`} className={cn(pad, className)} />;
}

/* =================================================================== version picker */

export type VersionPickerProps = {
  versions: FileVersion[];
  /** "" is the working-tree file; otherwise the index of the picked version as a string. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function shorten(subject: string) {
  return subject.length > 44 ? `${subject.slice(0, 43)}…` : subject;
}

/** The file's git history as a dropdown. Picking a commit shows the document as that commit left it. */
export function VersionPicker({ versions, value, onChange, className }: VersionPickerProps) {
  return (
    <span className={cn("relative inline-flex min-w-0 max-w-[184px]", className)}>
      <select
        aria-label="File version"
        title="View an earlier version of this file"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full min-w-0 cursor-pointer appearance-none truncate rounded-full! border border-hair bg-s3 pl-3 pr-7 text-[11px] tracking-[0.02em] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
      >
        <option value="">Current version</option>
        {versions.map((v, i) => (
          <option key={v.hash} value={String(i)}>
            {`${v.hash.slice(0, 7)} · ${v.ago} · ${shorten(v.subject)}`}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-ink-faint" />
    </span>
  );
}

/** Pill toggle used in the window header (SOURCE / RENDERED). */
function PillToggle({ pressed, onClick, children, label }: { pressed: boolean; onClick: () => void; children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className="h-7 shrink-0 rounded-full! border border-hair px-3 text-[11px] uppercase tracking-[0.06em] text-ink-dim transition-colors hover:border-hair-strong hover:bg-s3 hover:text-ink"
    >
      {children}
    </button>
  );
}

/* =================================================================== floating window */

export type FloatingViewerState = "ready" | "loading" | "unreachable" | "no-preview" | "error";

export type FloatingFileViewerProps = {
  file: ViewerFile | null;
  open: boolean;
  onClose: () => void;
  /** What the Space API answered for this file. */
  state?: FloatingViewerState;
  errorMessage?: string;
  /** Git history, newest first. The picker appears only when there is one. */
  versions?: FileVersion[];
  /** Simulated latency for an uncached version, in ms. */
  versionDelayMs?: number;
  /** Name of the space product for the unreachable note. */
  serviceName?: string;
  className?: string;
};

const NARROW = "(max-width: 760px)";

/**
 * Floating previewer. Positions itself inside its nearest positioned ancestor: anchored top
 * right until the first drag, then wherever the header is dragged (clamped so the header
 * stays reachable). Resizable from the corner. Esc closes it while focus is anywhere on its
 * stage (the positioned ancestor), and focus returns to the control that was used last there.
 */
export function FloatingFileViewer({
  file,
  open,
  onClose,
  state = "ready",
  errorMessage,
  versions,
  versionDelayMs = 650,
  serviceName = "xo-space",
  className,
}: FloatingFileViewerProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const drag = useRef<{ dx: number; dy: number; pw: number; ph: number; w: number } | null>(null);
  const timers = useRef<number[]>([]);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [source, setSource] = useState(false);
  const [version, setVersion] = useState("");
  const [loadingHash, setLoadingHash] = useState<string | null>(null);
  const [cached, setCached] = useState<string[]>([]);
  // A new file starts on its current version, rendered. The window keeps its place.
  const [forPath, setForPath] = useState(file?.path ?? null);
  if ((file?.path ?? null) !== forPath) {
    setForPath(file?.path ?? null);
    setVersion("");
    setLoadingHash(null);
    setSource(false);
    setCached([]);
  }

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  // Keep the latest close handler for the stage listener below without re-binding it.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Esc closes the window from anywhere on its stage (the tree that opened it included), as
  // the Space dashboard does. Focus inside the window goes back to the last control outside
  // it, so closing never drops focus on the page.
  const lastOutside = useRef<HTMLElement | null>(null);
  const dismiss = useCallback(() => {
    const hadFocus = !!rootRef.current?.contains(document.activeElement);
    closeRef.current();
    const back = lastOutside.current;
    if (hadFocus && back?.isConnected) back.focus();
  }, []);
  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.parentElement;
    if (!root || !stage) return;
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && !root.contains(e.target)) lastOutside.current = e.target;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !open || e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    };
    stage.addEventListener("focusin", onFocusIn);
    stage.addEventListener("keydown", onKey);
    return () => {
      stage.removeEventListener("focusin", onFocusIn);
      stage.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  function pick(value: string) {
    setVersion(value);
    if (value === "" || !versions) {
      setLoadingHash(null);
      return;
    }
    const v = versions[Number(value)];
    if (!v || cached.includes(v.hash)) {
      setLoadingHash(null);
      return;
    }
    setLoadingHash(v.hash);
    const t = window.setTimeout(() => {
      setCached((c) => [...c, v.hash]);
      setLoadingHash((h) => (h === v.hash ? null : h));
    }, versionDelayMs);
    timers.current.push(t);
  }

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button,select,a,input")) return;
    if (window.matchMedia(NARROW).matches) return;
    const el = rootRef.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent) return;
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, pw: p.width, ph: p.height, w: r.width };
    setPos({ x: r.left - p.left, y: r.top - p.top });
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    const parent = rootRef.current?.offsetParent as HTMLElement | null;
    if (!d || !parent) return;
    const p = parent.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - p.left - d.dx, 64 - d.w), d.pw - 64);
    const y = Math.min(Math.max(e.clientY - p.top - d.dy, 0), d.ph - 48);
    setPos({ x: Math.round(x), y: Math.round(y) });
  }

  function onPointerUp() {
    drag.current = null;
    setDragging(false);
  }

  const picked = version !== "" && versions ? versions[Number(version)] : undefined;
  const shown: ViewerFile | null = file && picked ? { ...file, content: picked.content, size: picked.size, truncated: false } : file;
  const canToggle = !!shown && state === "ready" && hasRendering(shown.kind) && !loadingHash;
  const framed = !!shown && !source && shown.kind === "html" && state === "ready" && !loadingHash;

  let body: ReactNode;
  if (!shown) body = null;
  else if (state === "loading") body = <p className="text-[12.5px] text-ink-faint">loading…</p>;
  else if (state === "unreachable") body = <p className="text-[12.5px] text-ink-faint">{serviceName} is unreachable</p>;
  else if (state === "no-preview") body = <p className="text-[12.5px] text-ink-faint">No text preview for this file type.</p>;
  else if (state === "error") body = <p className="text-[12.5px] text-ink-faint">{errorMessage ?? "Could not read this file."}</p>;
  else if (loadingHash) body = <p className="text-[12.5px] text-ink-faint">loading version {loadingHash.slice(0, 7)}…</p>;
  else
    body = (
      <>
        <ViewerBody file={shown} mode={source ? "source" : "preview"} padded={false} fill={false} wrap className={framed ? undefined : "text-[13px]"} />
        {shown.truncated && !framed ? <p className="mt-4 text-[12.5px] text-ink-faint">Showing the first 256 KB of this file.</p> : null}
      </>
    );

  const meta = shown && state === "ready" && !loadingHash ? metaLine(shown, picked ? [`version ${picked.hash.slice(0, 7)}`, picked.ago] : []) : "";
  const style = (pos ? { "--fx": `${pos.x}px`, "--fy": `${pos.y}px` } : undefined) as CSSProperties | undefined;

  return (
    <aside
      ref={rootRef}
      aria-labelledby={titleId}
      inert={!open}
      data-open={open || undefined}
      style={style}
      className={cn(
        "absolute z-20 flex flex-col overflow-hidden border border-hair-strong bg-[rgba(17,17,19,0.975)] backdrop-blur-[18px]",
        "shadow-[0_18px_60px_rgba(0,0,0,.55),0_4px_14px_rgba(0,0,0,.35)]",
        "min-[761px]:h-[min(440px,calc(100%-32px))] min-[761px]:w-[min(580px,calc(100%-32px))] min-[761px]:min-h-[240px] min-[761px]:min-w-[320px] min-[761px]:max-h-[calc(100%-8px)] min-[761px]:max-w-full min-[761px]:resize min-[761px]:rounded-[13px]",
        "max-[760px]:inset-0",
        pos ? "min-[761px]:left-(--fx) min-[761px]:top-(--fy)" : "min-[761px]:right-4 min-[761px]:top-4",
        dragging ? "select-none transition-none" : "transition-[opacity,transform,visibility] duration-200 ease-quirq",
        open ? "visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible translate-y-2.5 scale-[.985] opacity-0",
        className,
      )}
    >
      <header
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "flex shrink-0 touch-none flex-wrap items-start gap-x-3.5 gap-y-2.5 border-b border-hair-soft px-4 pb-3 pt-3.5",
          dragging ? "cursor-grabbing" : "min-[761px]:cursor-grab",
        )}
      >
        <div className="min-w-0 flex-1 basis-[200px]">
          <b id={titleId} className="block truncate text-[15px] font-semibold leading-tight text-ink">
            {shown?.name ?? "No file"}
          </b>
          <code className="mt-[3px] block truncate font-sans text-[12px] text-ink-faint">{shown?.path ?? ""}</code>
          {meta ? <span className="mt-[5px] block font-sans text-[11px] uppercase tracking-[0.06em] text-ink-faint">{meta}</span> : null}
        </div>
        <div className="flex min-w-0 shrink-0 items-center gap-[7px] max-[480px]:w-full">
          {versions && versions.length > 0 && state === "ready" ? (
            <VersionPicker versions={versions} value={version} onChange={pick} className="max-[480px]:flex-1" />
          ) : null}
          {canToggle ? (
            <PillToggle pressed={source} onClick={() => setSource((s) => !s)} label={source ? "Show rendered file" : "Show source"}>
              {source ? "Rendered" : "Source"}
            </PillToggle>
          ) : null}
          <IconButton aria-label="Close preview" title="Close (Esc)" size="sm" onClick={dismiss} className="max-[480px]:ml-auto">
            <X />
          </IconButton>
        </div>
      </header>
      <div
        tabIndex={framed ? -1 : 0}
        role="region"
        aria-label={shown ? `${shown.name} contents` : "Preview"}
        aria-busy={state === "loading" || !!loadingHash || undefined}
        className={cn("scroll-thin min-h-0 flex-1", framed ? "overflow-hidden" : "overflow-auto px-5 pb-6 pt-4")}
      >
        {body}
      </div>
    </aside>
  );
}

/* =================================================================== pane (xo-client) */

export type PaneState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "file"; file: ViewerFile }
  | { kind: "unsupported"; message: string }
  | { kind: "too-large"; size: number; onOpenRaw?: () => void }
  | { kind: "error"; message: string };

export type FilePreviewPaneProps = {
  /** Open path, shown in mono in the header; null shows the empty prompt. */
  path: string | null;
  state: PaneState;
  view: "rendered" | "source";
  onViewChange: (view: "rendered" | "source") => void;
  /** Narrow layouts: the Files button returns to the tree. */
  onBack?: () => void;
  className?: string;
};

/**
 * The project pane's preview: path, Preview / Code toggle, Read only pill, then the body.
 * Place it inside an `@container` element: below @2xl the Files back button shows, below @lg
 * the toggle shows icons only.
 */
export function FilePreviewPane({ path, state, view, onViewChange, onBack, className }: FilePreviewPaneProps) {
  const renderable = state.kind === "file" && hasRendering(state.file.kind);
  return (
    <section
      aria-label={path ? `Preview of ${path}` : "File preview"}
      className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[16px] border border-hair bg-s1", className)}
    >
      {path ? (
        <>
          <div className="flex shrink-0 items-center gap-2 border-b border-hair-soft px-3 py-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="-ml-1 inline-flex h-7 shrink-0 items-center gap-1 rounded-[6px]! px-1.5 text-[12px] text-ink-dim hover:bg-s3 hover:text-ink @2xl:hidden"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                Files
              </button>
            ) : null}
            <span className="min-w-0 truncate font-mono text-[12px] text-ink">{path}</span>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {renderable ? (
                <Segmented
                  size="sm"
                  aria-label="View"
                  value={view}
                  onChange={onViewChange}
                  options={[
                    { value: "rendered", label: <span className="hidden @lg:inline">Preview</span>, icon: <Eye />, "aria-label": "Preview" },
                    { value: "source", label: <span className="hidden @lg:inline">Code</span>, icon: <Code />, "aria-label": "Code" },
                  ]}
                />
              ) : null}
              <span className="whitespace-nowrap rounded-full border border-hair px-2 py-0.5 text-[10px] text-ink-faint">Read only</span>
            </div>
          </div>
          <PaneBody state={state} view={view} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-[12px] text-ink-faint">Select a file to preview it.</div>
      )}
    </section>
  );
}

/** Keeps a size and its unit on one line. */
const nowrap = (text: string) => text.replace(/ /g, "\u00a0");

function PaneBody({ state, view }: { state: PaneState; view: "rendered" | "source" }) {
  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 p-4 text-[12px] text-ink-faint" aria-busy="true">
        <Spinner size="xs" label={null} />
        Loading…
      </div>
    );
  }
  if (state.kind === "unsupported") {
    return (
      <ViewerNote icon={<FileQuestion />} className="text-[12px]">
        {state.message}
      </ViewerNote>
    );
  }
  if (state.kind === "too-large") {
    return (
      <ViewerNote
        icon={<FileWarning />}
        title="Too large to show here"
        action={
          <Button size="sm" variant="secondary" leadingIcon={<Download />} onClick={state.onOpenRaw}>
            Open it as it is
          </Button>
        }
      >
        This file is {nowrap(formatBytes(state.size))}. The preview shows text files up to {nowrap(formatBytes(TOO_LARGE_BYTES))}.
      </ViewerNote>
    );
  }
  if (state.kind === "error") {
    return (
      <ViewerNote icon={<CircleAlert className="text-red/70" />} className="text-[12px]">
        {state.message}
      </ViewerNote>
    );
  }
  const { file } = state;
  // Rendered Markdown has no focusable scroller of its own, so the body takes the tab stop.
  const scrollsItself = !(view === "rendered" && file.kind === "markdown");
  return (
    <>
      {file.truncated ? <TruncationBanner /> : null}
      <div
        tabIndex={scrollsItself ? undefined : 0}
        role={scrollsItself ? undefined : "region"}
        aria-label={scrollsItself ? undefined : `${file.name} preview`}
        className={cn("scroll-thin min-h-0 flex-1", file.kind === "html" && view === "rendered" ? "overflow-hidden" : "overflow-auto")}
      >
        <ViewerBody file={file} mode={view === "rendered" ? "preview" : "source"} padded className={file.kind === "markdown" && view === "rendered" ? "text-[13px]" : undefined} />
      </div>
    </>
  );
}

/* =================================================================== reader (space-drift) */

export type ReaderState = "opening" | "ready" | "error" | "time-limit";

export type FileReaderPanelProps = {
  file: ViewerFile;
  /** Mono eyebrow above the title. */
  eyebrow?: string;
  state?: ReaderState;
  errorMessage?: string;
  mode?: ViewerMode;
  onModeChange?: (mode: ViewerMode) => void;
  /** Replaces the text body, for media readers. */
  media?: ReactNode;
  onClose?: () => void;
  /** Words after the Esc key in the footer. */
  escHint?: string;
  /** Status override for the footer. */
  status?: string;
  /** Total height in px when used inline; dialogs fill their box. */
  height?: number;
  titleId?: string;
  /** Heading level for the file name: h2 in a dialog, deeper when the panel sits inside a page. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
};

/** The local reader's footer lines, word for word. */
export const READER_STATUS = {
  opening: "Opening local file…",
  ready: "Read-only · Your file stays on this computer.",
  truncated: "First 256 KiB shown · Preview may be incomplete · Original file unchanged.",
  timeLimit: "Preview time limit reached · Original file unchanged.",
  error: "Could not open file. Return to flight and try again.",
} as const;

/** The footer line for a reader state; truncated files say so once they are open. */
export function readerStatus(state: ReaderState, truncated = false): string {
  if (state === "opening") return READER_STATUS.opening;
  if (state === "error") return READER_STATUS.error;
  if (state === "time-limit") return READER_STATUS.timeLimit;
  return truncated ? READER_STATUS.truncated : READER_STATUS.ready;
}

const READER_NO_PREVIEW = "No preview for this file type yet. Open it in its usual application from your file manager.";
const READER_TIME_BUDGET = "This file exceeded the preview time budget. Open the original in its usual application.";

/** The local reader layout: identity, toolbar, reading modes, the body and a status footer. */
export function FileReaderPanel({
  file,
  eyebrow = "Space drift / local reader",
  state = "ready",
  errorMessage,
  mode = "preview",
  onModeChange,
  media,
  onClose,
  escHint = "Back to flight",
  status,
  height,
  titleId,
  headingLevel = 2,
  className,
}: FileReaderPanelProps) {
  const autoId = useId();
  const headingId = titleId ?? autoId;
  const [wrap, setWrap] = useState(false);
  const text = hasSource(file.kind);
  // A preview that runs out of time falls back to source, as the reader does.
  const effective: ViewerMode = state === "time-limit" ? "source" : mode;
  const showModes = state === "ready" && !media && text && !!onModeChange;
  const showTools = (state === "ready" || state === "time-limit") && !media && text && effective === "source";
  const ext = extensionOf(file.name).toUpperCase() || KIND_LABEL[file.kind].toUpperCase();
  const date = file.modifiedAt ? formatDate(file.modifiedAt, { weekday: false }) : "Unknown modified date";
  const footer = status ?? readerStatus(state, file.truncated);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  let body: ReactNode;
  if (state === "opening") {
    body = <ViewerNote icon={<Spinner size="md" label={null} />}>Opening your file…</ViewerNote>;
  } else if (state === "error") {
    body = (
      <ViewerNote icon={<CircleAlert />} tone="error">
        {errorMessage ?? "This file could not be opened."}
      </ViewerNote>
    );
  } else if (state === "time-limit" && (media || !text)) {
    body = <ViewerNote icon={<FileWarning />}>{READER_TIME_BUDGET}</ViewerNote>;
  } else if (media) {
    body = <div className="p-4">{media}</div>;
  } else {
    body = (
      <ViewerBody
        file={file}
        mode={effective}
        wrap={wrap}
        padded
        unsupportedText={READER_NO_PREVIEW}
        className={cn(file.kind === "markdown" && effective === "preview" && "mx-auto max-w-[72ch] px-7 py-6 text-[14px] leading-[1.75]")}
      />
    );
  }

  return (
    <div
      className={cn("flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-hair-strong bg-[#0f0f11] text-ink", className)}
      style={height ? { height } : undefined}
    >
      <div className="flex items-start justify-between gap-5 border-b border-hair-soft px-5 pb-4 pt-5 sm:px-7">
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-ink-faint">{eyebrow}</p>
          <Heading id={headingId} className="mb-1.5 mt-2.5 break-words text-[clamp(20px,2.4vw,25px)] font-medium leading-tight tracking-[-0.025em]">
            {file.name}
          </Heading>
          <p className="select-text break-all font-mono text-[11px] leading-[1.6] text-ink-faint">{file.path}</p>
        </div>
        {onClose ? (
          <IconButton aria-label="Close file and return to flight" title="Return to flight (Escape)" variant="outline" shape="circle" size="lg" onClick={onClose}>
            <X />
          </IconButton>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-hair-soft bg-white/[0.015] px-5 py-2.5 sm:px-7">
        <span className="font-mono text-[10px] tracking-[0.04em] text-ink-faint">
          {ext}
          {"  /  "}
          {formatBytes(file.size)}
          {"  /  "}
          {date}
        </span>
        <CopyButton text={file.path} variant="labelled" size="sm" label="Copy path" copiedLabel="Path copied" announce="Relative path copied." />
      </div>
      {showModes || showTools ? (
        <div className="flex min-h-[48px] flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-2 sm:px-7">
          {showModes ? (
            <div role="group" aria-label="Reading mode" className="flex gap-[3px] rounded-[7px] border border-hair bg-black/40 p-[3px]">
              {(["preview", "source"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => onModeChange?.(m)}
                  className={cn(
                    "rounded-[4px]! px-3.5 py-1.5 text-[12px] capitalize transition-colors",
                    mode === m ? "bg-white/[0.1] text-ink" : "text-ink-dim hover:text-ink",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          {showTools ? (
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton text={file.content ?? ""} variant="labelled" size="sm" label="Copy source" copiedLabel="Source copied" announce="Source copied." />
              <button
                type="button"
                aria-pressed={wrap}
                onClick={() => setWrap((w) => !w)}
                className={cn(
                  "h-7 rounded-[8px]! border px-2.5 text-[12px] transition-colors",
                  wrap ? "border-cyn/50 bg-s2 text-cyn" : "border-hair bg-s2 text-ink-dim hover:border-hair-strong hover:bg-s3 hover:text-ink",
                )}
              >
                Wrap lines
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        tabIndex={0}
        role="region"
        aria-label="File preview"
        aria-busy={state === "opening" || undefined}
        className={cn("scroll-thin flex min-h-0 flex-1 flex-col bg-black/60", file.kind === "html" && effective === "preview" ? "overflow-hidden" : "overflow-auto")}
      >
        {body}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 border-t border-hair-soft px-5 py-3 text-[11px] leading-[1.6] text-ink-faint sm:px-7">
        <span role="status" aria-live="polite" className={cn(state === "error" && "text-[#ffbaad]")}>
          {footer}
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Kbd size="xs">esc</Kbd> {escHint}
        </span>
      </div>
    </div>
  );
}

export type FileReaderDialogProps = Omit<FileReaderPanelProps, "onClose" | "height" | "titleId" | "headingLevel"> & {
  open: boolean;
  onClose: () => void;
};

/** FileReaderPanel in a native modal dialog: focus is trapped, Esc and the backdrop close it. */
export function FileReaderDialog({ open, onClose, ...panel }: FileReaderDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto h-[min(760px,90dvh)] w-[min(1040px,calc(100vw-24px))] max-w-none overflow-visible bg-transparent p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-[9px]"
    >
      {open ? <FileReaderPanel {...panel} titleId={titleId} onClose={onClose} className="h-full shadow-[0_40px_150px_rgba(0,0,0,.8)]" /> : null}
    </dialog>
  );
}
