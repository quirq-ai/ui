"use client";

// MediaStage: the reading stage for media files, as in the space-drift local reader and the
// galileo file page. Image (zoom out, fit, zoom in), SVG shown as inert source, audio
// (waveform scrubber), video (poster and transport), PDF (selectable page with a page input)
// plus loading and error notes. Nothing is fetched: callers pass inline art and text, and
// playback is simulated with a timer that starts only on a click.
import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, IconButton, Spinner } from "@/components/ui";
import { SourceView } from "./file-body";

export type MediaKind = "image" | "svg-source" | "audio" | "video" | "pdf";
export type MediaState = "loading" | "ready" | "error";

export type PdfPage = { heading?: string; paragraphs: string[] };

export type MediaStageProps = {
  kind: MediaKind;
  /** File name, used for accessible names. */
  name: string;
  state?: MediaState;
  /** Error copy; defaults to the reader's decode message for the kind. */
  errorMessage?: string;
  /** image: the picture itself (inline SVG or img) at its natural size. */
  art?: ReactNode;
  naturalWidth?: number;
  /** svg-source: the file text, shown escaped. */
  source?: string;
  /** audio and video: length in seconds. */
  durationSec?: number;
  /** audio: bar heights from 0 to 1. */
  waveform?: number[];
  /** video: poster render; receives the playback second so the frame can move. */
  poster?: (second: number) => ReactNode;
  /** pdf: page contents. */
  pages?: PdfPage[];
  /** Stage height in px. */
  minHeight?: number;
  className?: string;
};

const STAGE_BG = "radial-gradient(ellipse at center, #1b1b1f, #070708 70%)";

const DEFAULT_ERRORS: Record<MediaKind, string> = {
  image: "This image could not be decoded. Open the original image on your computer.",
  "svg-source": "This SVG could not be read. Open the original on your computer.",
  audio: "This browser cannot decode this media file or codec. Open the original in a media player on your computer.",
  video: "This browser cannot decode this media file or codec. Open the original in a media player on your computer.",
  pdf: "This PDF is encrypted or password protected. Open it in a desktop PDF reader.",
};

/** Status lines for a ready stage; PDF reports the page on screen (pdfStatus). */
const STATUS: Record<Exclude<MediaKind, "pdf">, string> = {
  image: "Read-only local media · nothing is uploaded.",
  "svg-source": "SVG source only · active markup is not rendered.",
  audio: "Read-only local media · nothing is uploaded.",
  video: "Read-only local media · nothing is uploaded.",
};

/** The PDF reader's status for the page on screen. */
function pdfStatus(page: number, total: number): string {
  return `Page ${page} of ${total} · read-only. Links, forms, scripts and very large embedded images are not rendered.`;
}

function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const toolBtn =
  "inline-flex h-7 items-center gap-1.5 rounded-[6px] border border-hair bg-white/[0.03] px-2.5 text-[11.5px] text-ink-dim transition-colors hover:border-hair-strong hover:bg-s3 hover:text-ink disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5";

/** The media reading stage with its tool row and status line. */
export function MediaStage({
  kind,
  name,
  state = "ready",
  errorMessage,
  art,
  naturalWidth = 640,
  source = "",
  durationSec = 120,
  waveform = [],
  poster,
  pages = [],
  minHeight = 300,
  className,
}: MediaStageProps) {
  const status =
    state === "loading"
      ? "Preparing local preview…"
      : state === "error"
        ? "Preview unavailable · Your original file is unchanged."
        : kind === "pdf"
          ? pdfStatus(1, Math.max(1, pages.length))
          : STATUS[kind];

  let body: ReactNode;

  if (state === "loading") {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-[12.5px] text-ink-dim" aria-busy="true">
        <Spinner size="lg" label={null} />
        <span>Preparing local preview…</span>
      </div>
    );
  } else if (state === "error") {
    body = (
      <div className="flex h-full items-center justify-center p-6">
        <p className="flex max-w-[46ch] items-start gap-2.5 text-[13px] leading-[1.7] text-[#ffbaad]">
          <CircleAlert aria-hidden="true" className="mt-[3px] size-4 shrink-0" />
          {errorMessage ?? DEFAULT_ERRORS[kind]}
        </p>
      </div>
    );
  } else if (kind === "image") {
    return (
      <ImageStage name={name} art={art} naturalWidth={naturalWidth} minHeight={minHeight} status={status} className={className} />
    );
  } else if (kind === "pdf") {
    return <PdfStage name={name} pages={pages} minHeight={minHeight} className={className} />;
  } else if (kind === "svg-source") {
    body = <SourceView text={source} language="text" label={`SVG source of ${name}`} className="h-full px-5 py-4" />;
  } else if (kind === "audio") {
    body = <AudioPlayer name={name} durationSec={durationSec} waveform={waveform} />;
  } else {
    body = <VideoPlayer name={name} durationSec={durationSec} poster={poster} />;
  }

  return (
    <StageShell status={status} minHeight={minHeight} className={className} plain={kind === "svg-source" && state === "ready"} error={state === "error"}>
      {body}
    </StageShell>
  );
}

function StageShell({
  tools,
  status,
  minHeight,
  children,
  className,
  plain = false,
  error = false,
}: {
  tools?: ReactNode;
  status: string;
  minHeight: number;
  children: ReactNode;
  className?: string;
  plain?: boolean;
  error?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-hair bg-[#08080a]", className)}>
      {tools ? <div className="flex min-h-[42px] flex-wrap items-center gap-2 border-b border-hair-soft px-3 py-1.5">{tools}</div> : null}
      <div className="relative min-h-0 overflow-auto" style={{ height: minHeight, background: plain ? "#08080a" : STAGE_BG }}>
        {children}
      </div>
      <p role="status" className={cn("border-t border-hair-soft px-3.5 py-2 text-[11px]", error ? "text-[#ffbaad]" : "text-ink-faint")}>
        {status}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ image */

const ZOOMS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

function ImageStage({
  name,
  art,
  naturalWidth,
  minHeight,
  status,
  className,
}: {
  name: string;
  art: ReactNode;
  naturalWidth: number;
  minHeight: number;
  status: string;
  className?: string;
}) {
  // null is "Fit": the picture shrinks to the stage. A number is an explicit zoom.
  const [zoom, setZoom] = useState<number | null>(null);
  const current = zoom ?? 1;
  const step = (dir: 1 | -1) => {
    const idx = ZOOMS.findIndex((z) => z >= current - 0.001);
    const base = idx === -1 ? ZOOMS.length - 1 : idx;
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, base + dir))];
    setZoom(next);
  };
  const tools = (
    <>
      <button type="button" className={toolBtn} onClick={() => step(-1)} disabled={zoom !== null && zoom <= ZOOMS[0]}>
        Zoom out
      </button>
      <button type="button" className={toolBtn} onClick={() => setZoom(null)} aria-pressed={zoom === null}>
        Fit image
      </button>
      <button type="button" className={toolBtn} onClick={() => step(1)} disabled={zoom !== null && zoom >= ZOOMS[ZOOMS.length - 1]}>
        Zoom in
      </button>
      <span className="ml-1 font-mono text-[11px] tabular-nums text-ink-faint" aria-live="polite">
        {zoom === null ? "Fit" : `${Math.round(zoom * 100)}%`}
      </span>
    </>
  );
  return (
    <StageShell tools={tools} status={status} minHeight={minHeight} className={className}>
      <div
        tabIndex={0}
        role="region"
        aria-label={`${name} preview`}
        className={cn("flex min-h-full p-6", zoom === null ? "h-full items-center justify-center" : "w-max min-w-full items-center justify-center")}
      >
        <div
          className={cn("shrink-0 [&>svg]:h-auto [&>svg]:w-full", zoom === null && "max-h-full max-w-full")}
          style={zoom === null ? { width: naturalWidth, maxWidth: "100%" } : { width: Math.round(naturalWidth * zoom) }}
        >
          {art}
        </div>
      </div>
    </StageShell>
  );
}

/* ------------------------------------------------------------------ playback clock */

/** Simulated playback: a one-second timer that runs only while playing. */
function usePlayback(durationSec: number) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setTime((s) => {
        if (s + 1 >= durationSec) {
          setPlaying(false);
          return durationSec;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [playing, durationSec]);
  const toggle = () => {
    if (!playing && time >= durationSec) setTime(0);
    setPlaying((p) => !p);
  };
  const seek = (sec: number) => setTime(Math.min(durationSec, Math.max(0, Math.round(sec))));
  return { playing, time, toggle, seek };
}

function sliderKeys(e: KeyboardEvent<HTMLElement>, time: number, duration: number, seek: (s: number) => void) {
  const map: Record<string, number> = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 30, PageDown: -30 };
  if (e.key in map) {
    e.preventDefault();
    seek(time + map[e.key]);
  } else if (e.key === "Home") {
    e.preventDefault();
    seek(0);
  } else if (e.key === "End") {
    e.preventDefault();
    seek(duration);
  }
}

/* ------------------------------------------------------------------ audio */

function AudioPlayer({ name, durationSec, waveform }: { name: string; durationSec: number; waveform: number[] }) {
  const { playing, time, toggle, seek } = usePlayback(durationSec);
  const progress = durationSec > 0 ? time / durationSec : 0;
  const bars = waveform.length ? waveform : [0.4];
  return (
    <div className="flex h-full items-center justify-center p-5">
      <div className="w-full max-w-[480px] rounded-[14px] border border-hair bg-s1/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <IconButton aria-label={playing ? `Pause ${name}` : `Play ${name}`} variant="solid" shape="circle" size="lg" onClick={toggle}>
            {playing ? <Pause /> : <Play />}
          </IconButton>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{name}</p>
            <p className="font-mono text-[11px] tabular-nums text-ink-faint">
              {clock(time)} / {clock(durationSec)}
            </p>
          </div>
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Seek ${name}`}
          aria-valuemin={0}
          aria-valuemax={durationSec}
          aria-valuenow={time}
          aria-valuetext={`${clock(time)} of ${clock(durationSec)}`}
          onKeyDown={(e) => sliderKeys(e, time, durationSec, seek)}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * durationSec);
          }}
          className="mt-4 flex h-12 cursor-pointer items-center gap-[2px] rounded-[6px]"
        >
          {bars.map((h, i) => {
            const played = (i + 0.5) / bars.length <= progress;
            return (
              <span
                key={i}
                aria-hidden="true"
                className={cn("min-w-0 flex-1 rounded-full transition-colors", played ? "bg-blu" : "bg-white/20")}
                style={{ height: `${Math.max(8, Math.round(h * 100))}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ video */

function VideoPlayer({ name, durationSec, poster }: { name: string; durationSec: number; poster?: (second: number) => ReactNode }) {
  const { playing, time, toggle, seek } = usePlayback(durationSec);
  const [muted, setMuted] = useState(false);
  const pct = durationSec > 0 ? (time / durationSec) * 100 : 0;
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="relative aspect-video w-full max-w-[560px] overflow-hidden rounded-[10px] border border-hair bg-black">
        <div className="absolute inset-0">{poster ? poster(time) : null}</div>
        {!playing && time === 0 ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Play ${name}`}
            className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full! border border-hair-strong bg-black/55 text-ink backdrop-blur-md transition-transform hover:scale-105"
          >
            <Play className="ml-0.5 size-6" aria-hidden="true" />
          </button>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-2.5 pb-2 pt-6">
          <IconButton aria-label={playing ? "Pause" : "Play"} size="sm" variant="ghost" onClick={toggle} className="text-ink">
            {playing ? <Pause /> : <Play />}
          </IconButton>
          <div
            role="slider"
            tabIndex={0}
            aria-label={`Seek ${name}`}
            aria-valuemin={0}
            aria-valuemax={durationSec}
            aria-valuenow={time}
            aria-valuetext={`${clock(time)} of ${clock(durationSec)}`}
            onKeyDown={(e) => sliderKeys(e, time, durationSec, seek)}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - r.left) / r.width) * durationSec);
            }}
            className="relative h-4 min-w-0 flex-1 cursor-pointer"
          >
            <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/25" aria-hidden="true" />
            <span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink" style={{ width: `${pct}%` }} aria-hidden="true" />
            <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${pct}%` }} aria-hidden="true" />
          </div>
          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-dim">
            {clock(time)} / {clock(durationSec)}
          </span>
          <IconButton aria-label={muted ? "Unmute" : "Mute"} size="sm" variant="ghost" onClick={() => setMuted((m) => !m)} active={muted} className="text-ink">
            {muted ? <VolumeX /> : <Volume2 />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pdf */

function PdfStage({ name, pages, minHeight, className }: { name: string; pages: PdfPage[]; minHeight: number; className?: string }) {
  const total = Math.max(1, pages.length);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("1");
  const go = (n: number) => {
    const next = Math.min(total, Math.max(1, Math.round(n)));
    setPage(next);
    setDraft(String(next));
  };
  const current = pages[page - 1];
  const inputId = useId();
  const tools = (
    <>
      <Button size="sm" variant="secondary" leadingIcon={<ChevronLeft />} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
        Prev
      </Button>
      <label htmlFor={inputId} className="text-[11.5px] text-ink-faint">
        Page
      </label>
      <input
        id={inputId}
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={() => go(Number(draft) || page)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go(Number(draft) || page);
          if (e.key === "ArrowUp") {
            e.preventDefault();
            go(page + 1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            go(page - 1);
          }
        }}
        className="h-7 w-12 rounded-[6px] border border-hair bg-s1 px-2 text-center font-mono text-[12px] tabular-nums text-ink"
      />
      <span className="font-mono text-[11.5px] tabular-nums text-ink-faint">/ {total}</span>
      <Button size="sm" variant="secondary" trailingIcon={<ChevronRight />} onClick={() => go(page + 1)} disabled={page >= total} aria-label="Next page">
        Next
      </Button>
    </>
  );
  return (
    <StageShell tools={tools} status={pdfStatus(page, total)} minHeight={minHeight} className={className}>
      <div className="flex min-h-full justify-center p-5">
        <article
          aria-label={`${name}, page ${page} of ${total}`}
          className="relative w-full max-w-[380px] select-text bg-white px-7 pb-10 pt-8 text-[#1b1b1d] shadow-[0_12px_40px_rgba(0,0,0,.55)]"
          style={{ aspectRatio: "8.5 / 11" }}
        >
          {current?.heading ? <h4 className="mb-3 text-[15px] font-semibold leading-snug tracking-[-0.01em]">{current.heading}</h4> : null}
          {current?.paragraphs.map((p, i) => (
            <p key={i} className="mb-2.5 text-[10.5px] leading-[1.65] text-[#3a3a3e]">
              {p}
            </p>
          ))}
          <span className="absolute inset-x-0 bottom-3.5 text-center font-mono text-[9px] tabular-nums text-[#8a8a90]">
            {page} / {total}
          </span>
        </article>
      </div>
    </StageShell>
  );
}
