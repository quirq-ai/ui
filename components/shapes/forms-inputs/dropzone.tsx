"use client";

// File dropzone: a dashed strip that takes dropped files or opens the file picker (it is a
// label for a real file input, so Enter and Space work), a staged list with sizes and
// remove buttons, an Upload and Clear row, per-file and overall progress, then a done line.
// Uploads are simulated with a timer; nothing leaves the browser.
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { CircleCheck, FileSpreadsheet, FileText, FileType2, Paperclip, Upload, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/loaders";
import { formatBytes, pluralize } from "@/lib/format";
import { FormStyles } from "./_styles";

export type StagedFile = { id: string; name: string; size: number };
export type DropzonePhase = "idle" | "staged" | "uploading" | "done";

export type FileDropzoneProps = {
  /** Where files land, for the done line: "research-lab". */
  destination: string;
  title?: string;
  hint?: string;
  accept?: string;
  /** false: knowledge base takes one file and a new one replaces it. */
  multiple?: boolean;
  maxBytes?: number;
  initialFiles?: StagedFile[];
  /** Start as if initialFiles were already uploaded ("done"); "Add more" then works as usual. */
  defaultDone?: boolean;
  onUpload?: (files: StagedFile[]) => void;
  /** Demo controls: hold a phase, the drag-over look, or a progress value. */
  forcePhase?: DropzonePhase;
  forceDragOver?: boolean;
  forceProgress?: number;
  className?: string;
};

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "xlsx") return <FileSpreadsheet aria-hidden="true" className="size-4 text-grn" />;
  if (ext === "pdf") return <FileType2 aria-hidden="true" className="size-4 text-red" />;
  return <FileText aria-hidden="true" className="size-4 text-blu" />;
}

/** Drop, browse, remove, then upload with progress. */
export function FileDropzone({
  destination,
  title,
  hint = "PDF, Markdown or CSV · up to 25 MB each",
  accept = ".pdf,.md,.csv",
  multiple = true,
  maxBytes = 25 * 1024 * 1024,
  initialFiles = [],
  defaultDone = false,
  onUpload,
  forcePhase,
  forceDragOver = false,
  forceProgress,
  className,
}: FileDropzoneProps) {
  const uid = useId();
  const counter = useRef(0);
  const [files, setFiles] = useState<StagedFile[]>(defaultDone ? [] : initialFiles);
  const [over, setOver] = useState(false);
  const [phaseState, setPhase] = useState<DropzonePhase>(defaultDone ? "done" : initialFiles.length ? "staged" : "idle");
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(defaultDone ? initialFiles.length : 0);
  const phase = forcePhase ?? phaseState;
  const shownProgress = forceProgress ?? progress;
  const dragOver = forceDragOver || over;

  useEffect(() => {
    if (phaseState !== "uploading") return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 7)), 140);
    return () => clearInterval(t);
  }, [phaseState]);

  useEffect(() => {
    if (phaseState !== "uploading" || progress < 100) return;
    const t = setTimeout(() => {
      setUploaded(files.length);
      onUpload?.(files);
      setFiles([]);
      setPhase("done");
    }, 250);
    return () => clearTimeout(t);
  }, [phaseState, progress, files, onUpload]);

  function add(list: FileList | null) {
    if (!list || !list.length) return;
    const incoming = Array.from(list).map((f) => {
      counter.current += 1;
      return { id: `${f.name}-${f.size}-${counter.current}`, name: f.name, size: f.size };
    });
    setFiles((cur) => (multiple ? [...cur, ...incoming] : incoming.slice(0, 1)));
    setPhase("staged");
  }

  const tooBig = files.filter((f) => f.size > maxBytes);
  const ok = files.filter((f) => f.size <= maxBytes);
  const totalBytes = ok.reduce((a, f) => a + f.size, 0);
  const busy = phase === "uploading";

  function onDrag(e: DragEvent<HTMLLabelElement>, entering: boolean) {
    e.preventDefault();
    if (busy) return;
    if (entering) setOver(true);
    else if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <FormStyles />
      {title ? <p className="text-[13.5px] font-medium text-ink">{title}</p> : null}

      {phase === "done" ? (
        <div role="status" className="rise flex flex-wrap items-center gap-3 rounded-[12px] border border-grn/25 bg-grn/[0.05] px-4 py-3.5">
          <CircleCheck aria-hidden="true" className="size-4 text-grn" />
          <p className="min-w-0 flex-1 text-[13px] text-ink">
            {pluralize(uploaded, "file")} added to <span className="font-mono">{destination}</span>
          </p>
          <Button size="sm" variant="subtle" disabled={forcePhase === "done"} onClick={() => setPhase("idle")}>
            Add more
          </Button>
        </div>
      ) : (
        <label
          onDragEnter={(e) => onDrag(e, true)}
          onDragOver={(e) => onDrag(e, true)}
          onDragLeave={(e) => onDrag(e, false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            if (!busy) add(e.dataTransfer.files);
          }}
          className={cn(
            "fi-ring-any flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed px-4 py-6 text-center transition-[border-color,background-color] duration-150",
            dragOver ? "border-blu/70 bg-blu/[0.07]" : "border-hair-strong bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.035]",
            busy && "pointer-events-none opacity-50",
          )}
        >
          <input
            type="file"
            className="sr-only"
            accept={accept}
            multiple={multiple}
            disabled={busy}
            aria-describedby={`${uid}-hint`}
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />
          <span className={cn("mb-1 inline-flex size-9 items-center justify-center rounded-full border", dragOver ? "border-blu/50 text-blu" : "border-hair text-ink-dim")}>
            <Upload aria-hidden="true" className="size-4" />
          </span>
          <span className="text-[13px] text-ink">
            {dragOver ? "Drop to stage" : multiple ? "Drop files here or " : "Drop a file here or "}
            {dragOver ? null : <span className="font-medium underline decoration-white/30 underline-offset-4">browse</span>}
          </span>
          <span id={`${uid}-hint`} className="text-[12px] text-ink-faint">
            {hint}
          </span>
        </label>
      )}

      {files.length > 0 && phase !== "done" ? (
        <>
          <ul aria-label="Staged files" className="flex flex-col gap-1.5">
            {files.map((f) => {
              const big = f.size > maxBytes;
              return (
                <li key={f.id} className={cn("flex flex-col gap-1.5 rounded-[10px] border px-3 py-2", big ? "border-red/35 bg-red/[0.05]" : "border-hair bg-s1")}>
                  <div className="flex items-center gap-2.5">
                    {iconFor(f.name)}
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{f.name}</span>
                    <span className={cn("shrink-0 font-mono text-[11.5px] tabular-nums", big ? "text-[#ff7a70]" : "text-ink-faint")}>
                      {big ? `${formatBytes(f.size)} · over ${formatBytes(maxBytes)}` : formatBytes(f.size)}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={`Remove ${f.name}`}
                      onClick={() => {
                        const next = files.filter((x) => x.id !== f.id);
                        setFiles(next);
                        if (!next.length) setPhase("idle");
                      }}
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-[6px]! text-ink-faint transition-colors hover:bg-s3 hover:text-ink disabled:opacity-30"
                    >
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                  {phase === "uploading" && !big ? <ProgressBar value={shownProgress} size="xs" tone="blu" showValue={false} aria-label={`Uploading ${f.name}`} /> : null}
                </li>
              );
            })}
          </ul>
          {phase === "uploading" ? (
            <ProgressBar
              value={shownProgress}
              tone="blu"
              size="sm"
              label={`Uploading ${pluralize(ok.length, "file")}…`}
              valueText={`${formatBytes((totalBytes * shownProgress) / 100)} of ${formatBytes(totalBytes)}`}
            />
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              leadingIcon={<Paperclip aria-hidden="true" />}
              disabled={!ok.length}
              loading={busy}
              loadingLabel="Uploading…"
              onClick={() => {
                setFiles(ok);
                setProgress(0);
                setPhase("uploading");
              }}
            >
              Upload {pluralize(ok.length, "file")}
            </Button>
            <Button
              size="sm"
              variant="subtle"
              disabled={busy}
              onClick={() => {
                setFiles([]);
                setPhase("idle");
              }}
            >
              Clear
            </Button>
            {tooBig.length ? <span className="text-[12px] text-[#ff7a70]">{pluralize(tooBig.length, "file")} too large, left out</span> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
