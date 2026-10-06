"use client";

// Live demo for the file viewer: every variant (floating window, pane, modal, gateway page,
// media stage) and every state (loading, too large, unsupported, truncated), wired for the
// version picker, Source toggle, drag, Esc and the modal.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FileArchive, FileCode, FileImage, FileJson, FileSpreadsheet, FileText, FileType, FileWarning, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { FIXTURE_NOTE, GALILEO_SOURCES } from "@/lib/fixtures";
import { formatBytes } from "@/lib/format";
import { Button, Segmented, Switch } from "@/components/ui";
import { Caption, DemoSection, DemoStack, FootNote, Specimen } from "./_kit";
import { OrbitArt, ScreenPosterArt } from "./art";
import {
  BRIEF_MD,
  DEMO_FILES,
  DRAFTS_LISTING,
  GALILEO_BRIEF,
  GALILEO_NOTES,
  GALILEO_SHOTS,
  PDF_PAGES,
  PLAN_MD,
  README_VERSIONS,
  WAVEFORM,
} from "./demo-data";
import { hasSource, modifiedStamp, type FileKind, type ViewerFile } from "./file-kinds";
import {
  FilePreviewPane,
  FileReaderDialog,
  FileReaderPanel,
  FloatingFileViewer,
  readerStatus,
  type FloatingViewerState,
  type PaneState,
  type ReaderState,
  type ViewerMode,
} from "./file-viewer";
import { GatewayFileHead, GatewayListing, GatewayMedia, GatewayMessage, GatewayNote, GatewayPage, GatewayText, tooLargeText } from "./gateway-page";
import { MediaStage } from "./media-stage";
import { useTimers } from "./use-timers";

const KIND_ICON: Partial<Record<FileKind, ReactNode>> = {
  markdown: <FileText />,
  code: <FileCode />,
  json: <FileJson />,
  csv: <FileSpreadsheet />,
  html: <Globe />,
  image: <FileImage />,
  svg: <FileImage />,
  pdf: <FileType />,
  binary: <FileArchive />,
};

function FileRow({ file, active, onOpen, meta }: { file: ViewerFile; active: boolean; onOpen: () => void; meta?: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active || undefined}
      className={cn(
        "flex w-full min-w-0 items-center gap-2.5 rounded-[8px]! px-2.5 py-[7px] text-left text-[12.5px] transition-colors [&_svg]:size-3.5 [&_svg]:shrink-0",
        active ? "bg-s3 text-ink" : "text-ink-dim hover:bg-s2 hover:text-ink",
      )}
    >
      <span aria-hidden="true" className={active ? "text-ink" : "text-ink-faint"}>
        {KIND_ICON[file.kind] ?? <FileWarning />}
      </span>
      <span className="min-w-0 flex-1 truncate">{file.name}</span>
      <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-faint">{meta ?? formatBytes(file.size)}</span>
    </button>
  );
}

/* ================================================================= floating window */

const TREE: ViewerFile[] = [DEMO_FILES.readme, DEMO_FILES.status, DEMO_FILES.pkg, DEMO_FILES.html, DEMO_FILES.csv, DEMO_FILES.png, DEMO_FILES.architecture];

/** What the Space API answers for a file in this demo: architecture.md fails to read. */
function resolveFloating(f: ViewerFile, apiUp: boolean): FloatingViewerState {
  if (!apiUp) return "unreachable";
  if (f.path === DEMO_FILES.architecture.path) return "error";
  return hasSource(f.kind) ? "ready" : "no-preview";
}

function FloatingWindowSection() {
  const later = useTimers();
  const [file, setFile] = useState<ViewerFile>(DEMO_FILES.readme);
  const [open, setOpen] = useState(true);
  const [load, setLoad] = useState<FloatingViewerState>("ready");
  const [reachable, setReachable] = useState(true);
  const seq = useRef(0);

  function openFile(f: ViewerFile, apiUp = reachable) {
    const mine = ++seq.current;
    setFile(f);
    setOpen(true);
    setLoad("loading");
    later(() => {
      if (mine !== seq.current) return;
      setLoad(resolveFloating(f, apiUp));
    }, 480);
  }

  return (
    <DemoSection
      title="Floating window · Space dashboard"
      note="Opens over the Tree lens and keeps its place. Drag the header, resize from the corner, press Esc anywhere on the stage to close it. Under 760px it becomes a full sheet."
      aside={
        <Switch
          size="sm"
          label="Space API reachable"
          checked={reachable}
          onCheckedChange={(v) => {
            setReachable(v);
            if (open) openFile(file, v);
          }}
        />
      }
    >
      <div className="relative h-[540px] overflow-hidden rounded-[14px] border border-hair-soft bg-[#0a0a0b]">
        <div className="dots pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" aria-hidden="true">
          <g stroke="rgba(255,255,255,.07)" fill="none">
            <path d="M330 120 C 420 160, 470 260, 560 300 S 760 380, 860 330" />
            <path d="M330 420 C 430 380, 520 400, 600 300" />
            <path d="M600 300 L 720 180" />
          </g>
          {[
            [330, 120, "var(--org)"],
            [560, 300, "var(--ink-dim)"],
            [860, 330, "var(--cyn)"],
            [330, 420, "var(--grn)"],
            [720, 180, "var(--blu)"],
          ].map(([x, y, c]) => (
            <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="5" fill={c as string} opacity="0.6" />
          ))}
        </svg>
        <nav aria-label="xo-space files" className="absolute inset-y-0 left-0 w-full border-r border-hair-soft bg-[#0d0d0f]/95 p-3 sm:w-[264px]">
          <p className="px-2.5 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Projects · Tree</p>
          <p className="px-2.5 pb-3 text-[13px] font-medium text-ink">xo-space</p>
          <ul className="space-y-0.5">
            {TREE.map((f) => (
              <li key={f.path}>
                <FileRow file={f} active={open && file.path === f.path} onOpen={() => openFile(f)} />
              </li>
            ))}
          </ul>
          <p className="mt-4 px-2.5 text-[11.5px] leading-relaxed text-ink-faint">Pick a file to preview it. The view underneath never moves.</p>
        </nav>
        <FloatingFileViewer
          file={file}
          open={open}
          onClose={() => setOpen(false)}
          state={load}
          versions={file.path === DEMO_FILES.readme.path ? README_VERSIONS : undefined}
        />
      </div>
      <p className="mt-2.5 text-[12px] text-ink-faint">
        README.md has history: pick a commit in the version picker to read the file as that commit left it. architecture.md shows the read error; turn the Space API off to see the unreachable note.
      </p>
    </DemoSection>
  );
}

/* ================================================================= pane */

const BIG_JSON: ViewerFile = {
  name: "session-export.json",
  path: "reports/session-export.json",
  kind: "json",
  size: Math.round(3.4 * 1024 * 1024),
  modifiedAt: null,
};

const PANE_FILES: ViewerFile[] = [
  DEMO_FILES.readme,
  DEMO_FILES.status,
  DEMO_FILES.pkg,
  DEMO_FILES.csv,
  DEMO_FILES.html,
  DEMO_FILES.png,
  BIG_JSON,
  DEMO_FILES.architecture,
];

function resolvePane(f: ViewerFile): PaneState {
  if (f.path === DEMO_FILES.architecture.path) return { kind: "error", message: "The Space API did not answer in time. Try again." };
  if (f.path === BIG_JSON.path) return { kind: "too-large", size: f.size };
  if (!hasSource(f.kind)) return { kind: "unsupported", message: "No text preview for this file type." };
  return { kind: "file", file: f };
}

function PaneSection() {
  const later = useTimers();
  const [path, setPath] = useState<string>(DEMO_FILES.readme.path);
  const [pane, setPane] = useState<PaneState>({ kind: "file", file: DEMO_FILES.readme });
  const [view, setView] = useState<"rendered" | "source">("rendered");
  const [narrow, setNarrow] = useState<"tree" | "preview">("tree");
  const seq = useRef(0);

  function select(f: ViewerFile) {
    const mine = ++seq.current;
    setPath(f.path);
    setNarrow("preview");
    setPane({ kind: "loading" });
    later(() => {
      if (mine === seq.current) setPane(resolvePane(f));
    }, 420);
  }

  return (
    <DemoSection title="Pane · xo-client project files" note="Tree and preview side by side; on narrow screens they take turns. Preview and Code is kept across files.">
      <div className="@container">
        <div className="flex h-[460px] gap-3">
          <nav
            aria-label="Project files"
            className={cn("flex w-[244px] shrink-0 flex-col rounded-[16px] border border-hair bg-s1 p-2 @max-2xl:w-full", narrow === "preview" && "@max-2xl:hidden")}
          >
            <p className="px-2.5 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">xo-space · files</p>
            <ul className="scroll-thin min-h-0 flex-1 space-y-0.5 overflow-auto">
              {PANE_FILES.map((f) => (
                <li key={f.path}>
                  <FileRow file={f} active={path === f.path} onOpen={() => select(f)} />
                </li>
              ))}
            </ul>
          </nav>
          <FilePreviewPane
            path={path}
            state={pane}
            view={view}
            onViewChange={setView}
            onBack={() => setNarrow("tree")}
            className={cn("flex-1", narrow === "tree" && "@max-2xl:hidden")}
          />
        </div>
      </div>
    </DemoSection>
  );
}

/* ================================================================= modal */

const SNAPSHOT_DB: ViewerFile = {
  name: "space-snapshot.sqlite",
  path: "research-notes/data/space-snapshot.sqlite",
  kind: "binary",
  size: 6_815_744,
  modifiedAt: "2026-09-30T17:41:00Z",
};

const READER_FILES: ViewerFile[] = [
  DEMO_FILES.readme,
  DEMO_FILES.status,
  DEMO_FILES.pkg,
  DEMO_FILES.csv,
  DEMO_FILES.png,
  DEMO_FILES.pdf,
  DEMO_FILES.svg,
  SNAPSHOT_DB,
];

const READER_STATE_OPTIONS: { value: ReaderState; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "opening", label: "Opening" },
  { value: "time-limit", label: "Time limit" },
  { value: "error", label: "Could not open" },
];

/** The reader's own message when opening takes too long. */
const READER_OPEN_ERROR = "The file took too long to open. Close this viewer and press E to retry.";

function readerMedia(f: ViewerFile, uid: string): ReactNode {
  if (f.kind === "image") {
    return <MediaStage kind="image" name={f.name} art={<OrbitArt uid={uid} title={f.name} />} naturalWidth={640} minHeight={330} />;
  }
  if (f.kind === "pdf") return <MediaStage kind="pdf" name={f.name} pages={PDF_PAGES} minHeight={380} />;
  if (f.kind === "svg") return <MediaStage kind="svg-source" name={f.name} source={f.content} minHeight={300} />;
  return null;
}

function ModalSection() {
  const [path, setPath] = useState(DEMO_FILES.readme.path);
  const [mode, setMode] = useState<ViewerMode>("preview");
  const [state, setState] = useState<ReaderState>("ready");
  const [dialog, setDialog] = useState(false);
  const file = READER_FILES.find((f) => f.path === path) ?? DEMO_FILES.readme;
  const reader = { file, state, errorMessage: READER_OPEN_ERROR, mode, onModeChange: setMode };

  return (
    <DemoSection
      title="Modal · space-drift local reader"
      note="Preview and Source for text, a media reader for the rest, a note for kinds it cannot read. Esc or the backdrop closes the modal."
      aside={
        <Button size="sm" variant="secondary" onClick={() => setDialog(true)}>
          Open {file.name} in a modal
        </Button>
      }
    >
      <div className="mb-3 flex flex-col gap-2.5">
        <div role="group" aria-label="File to read" className="scroll-thin flex gap-1.5 overflow-x-auto pb-1">
          {READER_FILES.map((f) => {
            const on = f.path === path;
            return (
              <button
                key={f.path}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setPath(f.path);
                  setMode("preview");
                }}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full! border px-3 font-mono text-[11px] transition-colors [&_svg]:size-3",
                  on ? "border-ink bg-ink text-black" : "border-hair bg-white/[0.04] text-ink-dim hover:border-white/[0.22] hover:text-ink",
                )}
              >
                <span aria-hidden="true">{KIND_ICON[f.kind] ?? <FileWarning />}</span>
                {f.name}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Caption>Reader state</Caption>
          <Segmented<ReaderState> aria-label="Reader state" size="sm" value={state} onChange={setState} options={READER_STATE_OPTIONS} />
        </div>
      </div>
      <FileReaderPanel {...reader} media={readerMedia(file, "orbit-inline")} height={600} headingLevel={4} />
      <FileReaderDialog open={dialog} onClose={() => setDialog(false)} {...reader} media={readerMedia(file, "orbit-dialog")} />
    </DemoSection>
  );
}

/* ================================================================= gateway */

type RawKey = "plan" | "brief" | "image";

/** Under a page in raw mode: the way back to galileo's file page (the browser's Back). */
function BackToPage({ onBack }: { onBack: () => void }) {
  return (
    <Button size="sm" variant="subtle" onClick={onBack} className="self-start">
      Back to the file page
    </Button>
  );
}

function GatewaySection() {
  const [raw, setRaw] = useState<Partial<Record<RawKey, boolean>>>({});
  const [visit, setVisit] = useState<string | null>(null);
  const toggle = (key: RawKey, on: boolean) => setRaw((r) => ({ ...r, [key]: on }));
  const rawSuffix = (key: RawKey) => (raw[key] ? "?raw" : "");
  const exportUrl = `${GALILEO_NOTES.url}exports/session-export.json`;
  const zipUrl = `${GALILEO_NOTES.url}archive.zip`;
  return (
    <DemoSection
      title="Gateway page · galileo"
      note="The page galileo makes on a source's own address. Markdown shows as text in v0. Raw serves the file as it is."
    >
      <div className="grid gap-x-5 gap-y-7 md:grid-cols-2">
        <Specimen label={raw.plan ? "dark · raw mode via ?raw" : "dark · text file"}>
          <GatewayPage scheme="dark" url={`${GALILEO_NOTES.url}plan.md${rawSuffix("plan")}`}>
            {raw.plan ? (
              <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.5]">{PLAN_MD}</pre>
            ) : (
              <>
                <GatewayFileHead label="plan.md" size={PLAN_MD.length} modified="2026-10-02 09:12" onRaw={() => toggle("plan", true)} />
                <GatewayText text={PLAN_MD} />
              </>
            )}
          </GatewayPage>
          {raw.plan ? <BackToPage onBack={() => toggle("plan", false)} /> : null}
        </Specimen>
        <Specimen label={raw.brief ? "light · raw mode via ?raw" : "light · single file source"}>
          <GatewayPage scheme="light" url={`${GALILEO_BRIEF.url}${rawSuffix("brief")}`}>
            {raw.brief ? (
              <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.5]">{BRIEF_MD}</pre>
            ) : (
              <>
                <GatewayFileHead label="BRIEF.md" size={BRIEF_MD.length} modified="2026-10-02 07:48" onRaw={() => toggle("brief", true)} />
                <GatewayText text={BRIEF_MD} />
              </>
            )}
          </GatewayPage>
          {raw.brief ? <BackToPage onBack={() => toggle("brief", false)} /> : null}
        </Specimen>
        <Specimen label={raw.image ? "image · raw mode via ?raw" : "image"}>
          <GatewayPage scheme="dark" url={`${GALILEO_SHOTS.url}lunar-orbit.png${rawSuffix("image")}`} height={330}>
            {raw.image ? (
              <OrbitArt uid="orbit-gateway-raw" title="lunar-orbit.png" className="mx-auto w-full" />
            ) : (
              <>
                <GatewayFileHead label="lunar-orbit.png" size={DEMO_FILES.png.size} modified={modifiedStamp(DEMO_FILES.png)} onRaw={() => toggle("image", true)} />
                <GatewayMedia>
                  <OrbitArt uid="orbit-gateway" title="lunar-orbit.png" />
                </GatewayMedia>
              </>
            )}
          </GatewayPage>
          {raw.image ? <BackToPage onBack={() => toggle("image", false)} /> : null}
        </Specimen>
        <Specimen label="folder listing · notes/drafts">
          <GatewayPage scheme="dark" url={`${GALILEO_NOTES.url}drafts/`} height={330}>
            <GatewayListing crumbs={["notes", "drafts"]} entries={DRAFTS_LISTING} sourceName="notes" onOpen={(p) => setVisit(`${GALILEO_NOTES.url}${p}`)} />
          </GatewayPage>
        </Specimen>
        <Specimen label="waiting · tries again every 2 seconds">
          <WaitingPage />
        </Specimen>
        <Specimen label="no such source">
          <GatewayPage scheme="light" url="http://previews.localhost:4100/" height={276}>
            <GatewayMessage title="No source called “previews”">
              <p>Sources on this galileo:</p>
              <ul className="list-disc space-y-0.5 pl-5 font-mono text-[13px]">
                {GALILEO_SOURCES.slice(0, 5).map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
              </ul>
              <p className="text-(--g-muted)">Add one on the Sources page.</p>
            </GatewayMessage>
          </GatewayPage>
        </Specimen>
        <Specimen label="too large · over 2 MB">
          <GatewayPage scheme="dark" url={exportUrl} height={170}>
            <GatewayFileHead label="exports/session-export.json" size={BIG_JSON.size} modified="2026-10-01 18:20" onRaw={() => setVisit(`${exportUrl}?raw`)} />
            <GatewayNote action="Open it as it is" onAction={() => setVisit(`${exportUrl}?raw`)}>
              {tooLargeText(BIG_JSON.size)}
            </GatewayNote>
          </GatewayPage>
        </Specimen>
        <Specimen label="unsupported binary">
          <GatewayPage scheme="light" url={zipUrl} height={170}>
            <GatewayFileHead label="archive.zip" size={18_204_113} modified="2026-09-12 08:02" onRaw={() => setVisit(`${zipUrl}?raw`)} />
            <GatewayNote action="Download it" onAction={() => setVisit(`${zipUrl}?raw (download)`)}>
              galileo can&apos;t show this kind of file.
            </GatewayNote>
          </GatewayPage>
        </Specimen>
      </div>
      <p role="status" className="mt-4 min-h-[18px] break-all font-mono text-[11.5px] text-ink-faint">
        {visit ? `Link followed: ${visit}` : "Links on these pages stay in the demo: follow one to see where it goes."}
      </p>
    </DemoSection>
  );
}

const STORYBOOK = GALILEO_SOURCES.find((s) => s.name === "storybook")!;

/** galileo's waiting page: nothing answers on the port, so it tries again every 2 seconds. */
function WaitingPage() {
  const [attempt, setAttempt] = useState(1);
  useEffect(() => {
    const t = window.setInterval(() => setAttempt((a) => a + 1), 2000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <GatewayPage scheme="dark" url={STORYBOOK.url} height={276}>
      <GatewayMessage title={`Waiting for ${STORYBOOK.name}`}>
        <p>
          Nothing answers on port {STORYBOOK.port} yet (ECONNREFUSED). galileo starts nothing: start the app, and this page tries again every 2
          seconds.
        </p>
        <p className="flex items-center gap-2 font-mono text-[12px] text-(--g-muted)" aria-live="off">
          <span aria-hidden="true" className="pulse size-1.5 rounded-full bg-(--g-accent) text-(--g-accent)" />
          Attempt {attempt}
        </p>
      </GatewayMessage>
    </GatewayPage>
  );
}

/* ================================================================= media stage */

function MediaSection() {
  return (
    <DemoSection title="Media stage" note="Image, audio, video and PDF read locally, nothing uploaded. SVG is shown as inert source. Errors read in soft red.">
      <div className="grid gap-x-5 gap-y-7 md:grid-cols-2">
        <Specimen label="image · zoom out, fit, zoom in">
          <MediaStage kind="image" name="lunar-orbit.png" art={<OrbitArt uid="orbit-stage" title="lunar-orbit.png" />} naturalWidth={640} minHeight={300} />
        </Specimen>
        <Specimen label="pdf · page input, selectable text">
          <MediaStage kind="pdf" name="verification-notes.pdf" pages={PDF_PAGES} minHeight={300} />
        </Specimen>
        <Specimen label="audio · ready">
          <MediaStage kind="audio" name="standup-recap.m4a" durationSec={138} waveform={WAVEFORM} minHeight={290} />
        </Specimen>
        <Specimen label="video · ready">
          <MediaStage kind="video" name="dashboard-walkthrough.mp4" durationSec={94} poster={(s) => <ScreenPosterArt focus={Math.floor(s / 4)} />} minHeight={290} />
        </Specimen>
        <Specimen label="svg · inert source">
          <MediaStage kind="svg-source" name="blue-planet.svg" source={DEMO_FILES.svg.content} minHeight={220} />
        </Specimen>
        <Specimen label="video · error (codec)">
          <MediaStage kind="video" name="screen-capture.mov" state="error" minHeight={220} />
        </Specimen>
        <Specimen label="image · loading">
          <MediaStage kind="image" name="graph-view.png" state="loading" minHeight={200} />
        </Specimen>
        <Specimen label="pdf · error (encrypted)">
          <MediaStage kind="pdf" name="invoice-june.pdf" state="error" minHeight={200} />
        </Specimen>
      </div>
    </DemoSection>
  );
}

/* ================================================================= states */

const READER_STATES: { label: string; state: ReaderState; file: ViewerFile }[] = [
  { label: "opening", state: "opening", file: DEMO_FILES.readme },
  { label: "ready", state: "ready", file: DEMO_FILES.readme },
  { label: "truncated", state: "ready", file: DEMO_FILES.csv },
  { label: "time limit", state: "time-limit", file: DEMO_FILES.pkg },
  { label: "could not open", state: "error", file: DEMO_FILES.architecture },
];

function StatesSection() {
  const [view, setView] = useState<"rendered" | "source">("rendered");
  const [rawNote, setRawNote] = useState(false);
  return (
    <DemoSection title="States" note="The four reading states every variant handles, with their exact words.">
      <div className="@container">
        <div className="grid gap-x-5 gap-y-7 md:grid-cols-2">
          <Specimen label="loading">
            <FilePreviewPane path="xo-space/docs/architecture.md" state={{ kind: "loading" }} view={view} onViewChange={setView} className="h-[250px]" />
          </Specimen>
          <Specimen label="too large">
            <FilePreviewPane
              path={BIG_JSON.path}
              state={{ kind: "too-large", size: BIG_JSON.size, onOpenRaw: () => setRawNote(true) }}
              view={view}
              onViewChange={setView}
              className="h-[250px]"
            />
            {rawNote ? (
              <p role="status" className="text-[12px] text-ink-faint">
                The raw file opens in its usual app. Nothing is uploaded.
              </p>
            ) : null}
          </Specimen>
          <Specimen label="unsupported">
            <FilePreviewPane
              path={DEMO_FILES.png.path}
              state={{ kind: "unsupported", message: "No text preview for this file type." }}
              view={view}
              onViewChange={setView}
              className="h-[250px]"
            />
          </Specimen>
          <Specimen label="truncated">
            <FilePreviewPane path={DEMO_FILES.csv.path} state={{ kind: "file", file: DEMO_FILES.csv }} view={view} onViewChange={setView} className="h-[250px]" />
          </Specimen>
        </div>
      </div>
      <div className="mt-8">
        <Caption className="mb-2.5">Reader status lines · local reader footer</Caption>
        <ul className="divide-y divide-hair-soft overflow-hidden rounded-[12px] border border-hair bg-[#0f0f11]">
          {READER_STATES.map((r) => (
            <li key={r.label} className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
              <span className="flex items-baseline justify-between gap-3 sm:w-[112px] sm:shrink-0">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{r.label}</span>
                <span className="font-mono text-[10.5px] text-ink-faint sm:hidden">{r.file.name}</span>
              </span>
              <span className={cn("min-w-0 flex-1 text-[12px]", r.state === "error" ? "text-[#ffbaad]" : "text-ink-dim")}>{readerStatus(r.state, r.file.truncated)}</span>
              <span className="hidden font-mono text-[10.5px] text-ink-faint sm:inline">{r.file.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </DemoSection>
  );
}

/* ================================================================= demo */

export function FileViewerDemo() {
  return (
    <DemoStack>
      <FloatingWindowSection />
      <PaneSection />
      <ModalSection />
      <GatewaySection />
      <MediaSection />
      <StatesSection />
      <FootNote>{FIXTURE_NOTE} Files, sizes and times are sample content.</FootNote>
    </DemoStack>
  );
}
