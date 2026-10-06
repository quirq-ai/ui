"use client";

// Timeline swimlanes with playback (XO Space Timeline, landing "Thirteen months" tile).
//  PlaybackScrubber: Play or Pause, the month readout, a range scrubber with ticks.
//  TimelineSwimlanes: one lane per department (by file) or per project (by project), a month
//    grid, dated dots, a sweep at the playback date, trace, zoom and pan. Prop-driven: pass
//    lanes, the full range and optional defaults; the component owns its view state.
// Gestures: select the plot, then scroll to zoom; drag to pan; Shift + scroll moves in time.
// Keyboard: arrows pan, + and - zoom, 0 resets, Escape clears a trace; the Trace select and the
// lane buttons start a trace without a pointer. Under a narrow width lane names move onto a strip
// above each lane so the plot keeps the full width.
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Pause, Play, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ColorToken } from "@/lib/fixtures";
import { formatDate, formatNumber, plural } from "@/lib/format";
import { IconButton, SearchInput, Segmented, Select, type SegmentedOption } from "@/components/ui";
import { dayMonthYear, monthStart, monthTick, monthYear, nextMonth } from "./shared";

/* ----------------------------------------------------------------------------- types */

export type SwimShape = "dot" | "ring" | "diamond";

export type SwimItem = {
  id: string;
  /** Epoch ms, UTC. */
  t: number;
  /** File path, or "3 commits this day". */
  label: string;
  /** Trace key, such as the project id. */
  group: string;
  groupLabel: string;
  shape?: SwimShape;
  /** Commits that day (by project). Sets the dot size. */
  weight?: number;
};

export type SwimLane = { id: string; name: string; tone: ColorToken; items: SwimItem[] };
export type SwimMode = "file" | "project";
export type SwimWindow = { start: number; end: number };
export type SwimMilestone = { t: number; label: string };

type Trace = { key: string; label: string; ids: Set<string>; list: SwimItem[] };

const MODE_OPTIONS: SegmentedOption<SwimMode>[] = [
  { value: "file", label: "By file" },
  { value: "project", label: "By project" },
];

const DAY = 86_400_000;
const MIN_SPAN = 21 * DAY;
const AXIS = 36;
const GAP = 8;
const PAD = 10;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ----------------------------------------------------------------------------- scrubber */

export type PlaybackScrubberProps = {
  playing: boolean;
  onTogglePlay: () => void;
  /** 0 to 1000 along the visible window. */
  value: number;
  onScrub: (value: number) => void;
  /** Month readout, such as "Aug 2026". */
  readout: string;
  /** Spoken date for the slider, such as "14 Aug 2026". */
  valueText: string;
  /** Tick labels spread along the track. */
  ticks: string[];
  /** Extra controls between Play and the readout (mode switch, clear trace). */
  children?: ReactNode;
  className?: string;
};

/** Play or Pause, readout and a range scrubber with ticks. Controlled. */
export function PlaybackScrubber({ playing, onTogglePlay, value, onScrub, readout, valueText, ticks, children, className }: PlaybackScrubberProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
        {children}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-pressed={playing}
            onClick={onTogglePlay}
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[8px]! border border-ink bg-ink px-3.5 text-[12px] font-semibold text-black transition-colors hover:bg-[#e8e8e6]"
          >
            {playing ? <Pause aria-hidden="true" className="size-3 fill-current" /> : <Play aria-hidden="true" className="size-3 fill-current" />}
            {playing ? "Pause" : "Play"}
          </button>
          <span className="min-w-[76px] text-right font-mono text-[13px] tabular-nums text-ink">
            <span className="sr-only">Playback date </span>
            {readout}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(clamp(value, 0, 1000))}
          aria-label="Playback date"
          aria-valuetext={valueText}
          onChange={(e) => onScrub(Number(e.target.value))}
          className={cn(
            "block h-5 w-full cursor-ew-resize appearance-none bg-transparent",
            "[&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-hair-strong",
            "[&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-[13px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(244,243,240,0.16)]",
            "[&::-moz-range-track]:h-px [&::-moz-range-track]:bg-hair-strong",
            "[&::-moz-range-thumb]:size-[13px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:shadow-[0_0_0_4px_rgba(244,243,240,0.16)]",
          )}
        />
        <div aria-hidden="true" className="mt-0.5 flex justify-between gap-2 font-mono text-[10.5px] tabular-nums tracking-[0.06em] text-ink-faint">
          {ticks.map((t, i) => (
            <span key={i} className={cn("whitespace-nowrap", i > 0 && i < ticks.length - 1 && "hidden sm:inline")}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Five ticks across a window: the ends carry the year. */
export function windowTicks(win: SwimWindow): string[] {
  return [0, 0.25, 0.5, 0.75, 1].map((f, i) => monthTick(win.start + f * (win.end - win.start), i === 0 || i === 4));
}

/* ----------------------------------------------------------------------------- swimlanes */

export type TimelineSwimlanesProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** By file: dated files per lane (first Git commit). */
  fileLanes: SwimLane[];
  /** By project: commit days per lane. Omit to hide the mode switch. */
  projectLanes?: SwimLane[];
  /** The full axis. */
  range: SwimWindow;
  milestones?: SwimMilestone[];
  /** Nouns for the summary: lanes are departments by file and projects by project. */
  laneNoun?: { file: string; project: string };
  defaultMode?: SwimMode;
  /** Playback date; defaults to the end of the range. */
  defaultNow?: number;
  /** Visible window; defaults to the full range. */
  defaultWindow?: SwimWindow;
  /** Trace on load (by file only): an item group such as a project id, or "lane:<lane id>". */
  defaultTrace?: string | null;
  defaultFilter?: string;
  /** Show the lane filter box. */
  filterable?: boolean;
  /** Show the Trace select: the keyboard path to a trace (by file only). */
  traceable?: boolean;
  /** Hide the gesture hint row (small state thumbnails). */
  hideHint?: boolean;
  laneHeight?: number;
  /** Below this component width (px) lane names move onto a strip above each lane. */
  stackBelow?: number;
  className?: string;
};

type Placed = { it: SwimItem; x: number; y: number; r: number; lane: SwimLane };

/** Height of the name strip above each lane in the stacked (narrow) layout. */
const LABEL_STRIP = 22;

const r2 = (n: number) => Math.round(n * 100) / 100;

/** A lane key ("lane:Engineering") traces the whole lane; any other key traces one item group. */
function buildTrace(key: string, lanes: SwimLane[]): Trace | null {
  const lane = lanes.find((l) => `lane:${l.id}` === key);
  const items = lane ? lane.items : lanes.flatMap((l) => l.items.filter((i) => i.group === key));
  if (!lane && !items.length) return null;
  const list = [...items].sort((a, b) => a.t - b.t);
  return { key, label: lane ? lane.name : items[0].groupLabel, ids: new Set(list.map((i) => i.id)), list };
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/** Lanes over months with playback, trace, zoom and pan. */
export function TimelineSwimlanes({
  title,
  description,
  fileLanes,
  projectLanes,
  range,
  milestones = [],
  laneNoun = { file: "project", project: "project" },
  defaultMode = "file",
  defaultNow,
  defaultWindow,
  defaultTrace = null,
  defaultFilter = "",
  filterable = true,
  traceable = true,
  hideHint = false,
  laneHeight = 60,
  stackBelow = 400,
  className,
}: TimelineSwimlanesProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [mode, setMode] = useState<SwimMode>(projectLanes ? defaultMode : "file");
  const [win, setWinState] = useState<SwimWindow>(defaultWindow ?? range);
  const [now, setNowState] = useState<number>(defaultNow ?? range.end);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState(defaultFilter);
  const [traceKey, setTraceKey] = useState<string | null>(defaultTrace);
  const [hover, setHover] = useState<Placed | null>(null);
  /* measured after mount; the fixed first values keep the server and client render identical */
  const [width, setWidth] = useState(720);
  const [rootWidth, setRootWidth] = useState(720);
  const [panning, setPanning] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const nowRef = useRef(now);
  const winRef = useRef(win);
  const drag = useRef<{ id: number; x0: number; start0: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const setNow = useCallback((v: number) => {
    nowRef.current = v;
    setNowState(v);
  }, []);
  const setWin = useCallback(
    (w: SwimWindow) => {
      const span = clamp(w.end - w.start, MIN_SPAN, range.end - range.start);
      const start = clamp(w.start, range.start, range.end - span);
      const next = { start, end: start + span };
      winRef.current = next;
      setWinState(next);
      setNow(clamp(nowRef.current, next.start, next.end));
    },
    [range.start, range.end, setNow],
  );

  /* measure the component (stacked or side labels) and the plot (the SVG draws at its real width) */
  useEffect(() => {
    const root = rootRef.current;
    const plot = plotRef.current;
    if (!root || !plot) return;
    const ro = new ResizeObserver(() => {
      const rw = Math.round(root.getBoundingClientRect().width);
      const pw = Math.round(plot.getBoundingClientRect().width);
      if (rw > 0) setRootWidth(rw);
      if (pw > 0) setWidth(pw);
    });
    ro.observe(root);
    ro.observe(plot);
    return () => ro.disconnect();
  }, []);

  /* playback: about eight seconds across the visible window */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const step = () => {
      const w = winRef.current;
      const next = Math.min(w.end, nowRef.current + (w.end - w.start) / 480);
      setNow(next);
      if (next >= w.end) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, setNow]);

  const allLanes = mode === "project" && projectLanes ? projectLanes : fileLanes;
  const q = filter.trim().toLowerCase();
  const lanes = useMemo(() => allLanes.filter((l) => !q || l.name.toLowerCase().includes(q)), [allLanes, q]);
  const trace = useMemo(() => (mode === "file" && traceKey ? buildTrace(traceKey, fileLanes) : null), [mode, traceKey, fileLanes]);
  const traceOptions = useMemo(() => {
    const groups = new Map<string, string>();
    for (const l of fileLanes) for (const it of l.items) if (!groups.has(it.group)) groups.set(it.group, it.groupLabel);
    return {
      lanes: fileLanes.filter((l) => l.items.length).map((l) => ({ value: `lane:${l.id}`, label: l.name })),
      groups: [...groups].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "en-US")),
    };
  }, [fileLanes]);

  const stacked = rootWidth < stackBelow;
  const strip = stacked ? LABEL_STRIP : 0;
  const pitch = laneHeight + GAP + strip;
  const span = win.end - win.start;
  const innerW = Math.max(40, width - PAD * 2);
  const xOf = useCallback((t: number) => PAD + ((t - win.start) / (win.end - win.start)) * innerW, [win.start, win.end, innerW]);
  const bandTop = (li: number) => AXIS + li * pitch + strip;
  const height = AXIS + Math.max(1, lanes.length) * pitch - GAP + 6;

  /* layout: beeswarm by file, sized dots on a baseline by project */
  const placed = useMemo<Placed[][]>(() => {
    const margin = span * 0.02;
    return lanes.map((lane, li) => {
      const cy = AXIS + li * pitch + strip + laneHeight / 2;
      const items = lane.items.filter((it) => it.t >= win.start - margin && it.t <= win.end + margin);
      if (mode === "project") {
        return items.map((it) => ({ it, lane, x: xOf(it.t), y: cy, r: clamp(1.8 + Math.sqrt(it.weight ?? 1) * 1.2, 2, laneHeight * 0.3) }));
      }
      const maxRow = Math.max(1, Math.floor((laneHeight / 2 - 6) / 8));
      const taken: { x: number; row: number }[] = [];
      return items.map((it) => {
        const x = xOf(it.t);
        let row = 0;
        let guard = 0;
        while (taken.some((p) => p.row === row && Math.abs(p.x - x) < 9) && guard++ < 40) {
          row = row > 0 ? -row : -row + 1;
          if (Math.abs(row) > maxRow) {
            row = 0;
            break;
          }
        }
        taken.push({ x, row });
        return { it, lane, x, y: cy + row * 8, r: it.shape === "diamond" ? 3.4 : 3.2 };
      });
    });
  }, [lanes, mode, win.start, win.end, span, laneHeight, pitch, strip, xOf]);

  /* the trace line: a soft curve through one project's items in date order, under the dots. A
     whole-lane trace skips it: the lane already stands out and a line through every dot is noise. */
  const tracePath = useMemo(() => {
    if (!trace || trace.key.startsWith("lane:")) return null;
    const pts = placed
      .flat()
      .filter((p) => trace.ids.has(p.it.id))
      .sort((a, b) => a.it.t - b.it.t || a.x - b.x);
    if (pts.length < 2) return null;
    let d = `M ${r2(pts[0].x)} ${r2(pts[0].y)}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const my = r2((a.y + b.y) / 2);
      d += ` C ${r2(a.x)} ${my}, ${r2(b.x)} ${my}, ${r2(b.x)} ${r2(b.y)}`;
    }
    return d;
  }, [trace, placed]);

  /* month grid: a label only where it fits after the previous one and inside the plot */
  const months = useMemo(() => {
    const out: { t: number; x: number; label: string | null; year: boolean }[] = [];
    let lastEnd = -Infinity;
    let first = true;
    for (let m = monthStart(win.start); m <= win.end; m = nextMonth(m)) {
      if (m < win.start) continue;
      const jan = new Date(m).getUTCMonth() === 0;
      const x = xOf(m);
      const text = monthTick(m, jan || first);
      const w = text.length * 6.6 + 6;
      const fits = x + 3 >= lastEnd + 8 && x + 3 + w <= width;
      if (fits) lastEnd = x + 3 + w;
      out.push({ t: m, x, label: fits ? text : null, year: jan });
      first = false;
    }
    return out;
  }, [win.start, win.end, width, xOf]);

  /* summary: totals for the lanes and the window; playback and trace only dim dots */
  const inWindow = (it: SwimItem) => it.t >= win.start && it.t <= win.end;
  const itemCount = lanes.reduce((sum, l) => sum + (mode === "project" ? l.items.filter(inWindow).reduce((s, it) => s + (it.weight ?? 1), 0) : l.items.filter(inWindow).length), 0);
  const withData = lanes.filter((l) => l.items.length > 0).length;
  const noun = mode === "project" ? laneNoun.project : laneNoun.file;
  const nouns = plural(2, noun);
  const missingKind = mode === "project" ? "commit data" : "dated files";
  const range0 = `${dayMonthYear(win.start)} to ${dayMonthYear(win.end)}`;
  let summary: string;
  let context: string;
  if (!lanes.length) {
    summary = allLanes.length ? `No matching ${nouns}` : "No projects mapped";
    context = allLanes.length ? `Try a different ${noun} name.` : "Project dates will appear when Git data is available.";
  } else {
    const lanesText = q ? `${lanes.length} of ${allLanes.length} mapped ${plural(allLanes.length, noun)}` : `${lanes.length} mapped ${plural(lanes.length, noun)}`;
    summary = `${formatNumber(itemCount)} ${mode === "project" ? plural(itemCount, "commit") : `dated ${plural(itemCount, "file")}`} · ${lanesText} · ${range0}`;
    if (!withData) context = `No ${missingKind} in these mapped ${nouns}.`;
    else if (!itemCount) context = `No ${mode === "project" ? "commits" : "dated files"} in this date range.`;
    else context = mode === "project" ? "Dot size shows commits per day." : "File dates mark their first Git commit.";
    const missing = lanes.length - withData;
    if (missing && withData) context += ` ${missing} ${plural(missing, noun)} without ${missingKind}.`;
  }
  let traceText: string | null = null;
  if (trace) {
    const list = trace.list;
    if (!list.length) traceText = `${trace.label} has no dated files to trace.`;
    else {
      const m0 = monthYear(list[0].t);
      const m1 = monthYear(list[list.length - 1].t);
      traceText = `${trace.label}: ${list.length} dated ${plural(list.length, "file")} in trace · ${m0 === m1 ? m0 : `${m0} to ${m1}`}.`;
    }
  }
  /* spoken once per change: a trace, or the filter result; zoom and pan stay quiet */
  const announcement = traceText ?? (q ? summary : "");

  const milestone = [...milestones].reverse().find((m) => m.t <= now);
  const years = useMemo(() => {
    const out: number[] = [];
    for (let y = new Date(range.start).getUTCFullYear(); y <= new Date(range.end).getUTCFullYear(); y++) out.push(y);
    return out;
  }, [range.start, range.end]);
  const yearWindow = (y: number): SwimWindow => ({ start: Math.max(range.start, Date.UTC(y, 0, 1)), end: Math.min(range.end, Date.UTC(y + 1, 0, 1)) });
  const isAll = win.start <= range.start && win.end >= range.end;

  /* actions */
  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (nowRef.current >= winRef.current.end - DAY) setNow(winRef.current.start);
    setPlaying(true);
  }
  function scrub(v: number) {
    setPlaying(false);
    setNow(win.start + (v / 1000) * span);
  }
  function zoom(factor: number, around = win.start + span / 2) {
    setPlaying(false);
    setWin({ start: around - (around - win.start) * factor, end: around + (win.end - around) * factor });
  }
  function pan(ms: number) {
    setWin({ start: win.start + ms, end: win.end + ms });
  }
  function changeMode(m: SwimMode) {
    setMode(m);
    setHover(null);
    if (m === "project") setTraceKey(null);
  }
  /** Start (or clear) a trace. Like the space timeline, a trace plays from a week before its
      first date, after resetting a zoom that could hide it; reduced motion skips the playback. */
  function startTrace(key: string | null) {
    setHover(null);
    setTraceKey(key);
    if (!key) return;
    const next = buildTrace(key, fileLanes);
    if (!next?.list.length) return;
    if (!isAll) setWin(range);
    if (prefersReducedMotion()) return;
    setNow(Math.max(range.start, next.list[0].t - 7 * DAY));
    setPlaying(true);
  }
  function selectItem(p: Placed) {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (mode === "file") startTrace(traceKey === p.it.group ? null : p.it.group);
    else {
      setPlaying(false);
      setNow(p.it.t);
    }
  }

  /* wheel: zoom around the pointer once the plot is selected (or with ctrl), pan with shift */
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const engaged = document.activeElement === el || e.ctrlKey || e.metaKey;
      if (!engaged) return;
      e.preventDefault();
      const w = winRef.current;
      const s = w.end - w.start;
      const rect = el.getBoundingClientRect();
      const inner = Math.max(40, rect.width - PAD * 2);
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const d = e.deltaX || e.deltaY;
        setWin({ start: w.start + (d * s) / inner, end: w.end + (d * s) / inner });
        return;
      }
      setPlaying(false);
      const t = w.start + clamp((e.clientX - rect.left - PAD) / inner, 0, 1) * s;
      const f = Math.exp(e.deltaY * 0.0016);
      setWin({ start: t - (t - w.start) * f, end: t + (w.end - t) * f });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setWin]);

  /* drag to pan, with 4px of slack so a click on a dot stays a click */
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    suppressClick.current = false;
    drag.current = { id: e.pointerId, x0: e.clientX, start0: win.start, moved: false };
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (e.buttons === 0) {
      drag.current = null;
      setPanning(false);
      return;
    }
    const dx = e.clientX - d.x0;
    if (!d.moved) {
      if (Math.abs(dx) <= 4) return;
      d.moved = true;
      suppressClick.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setPanning(true);
      setPlaying(false);
      setHover(null);
    }
    const w = winRef.current;
    const s = w.end - w.start;
    const start = d.start0 - (dx * s) / innerW;
    setWin({ start, end: start + s });
  }
  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current && drag.current.id === e.pointerId) {
      if (!drag.current.moved) suppressClick.current = false;
      drag.current = null;
      setPanning(false);
    }
  }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = span * 0.1;
    if (e.key === "ArrowLeft") pan(-step);
    else if (e.key === "ArrowRight") pan(step);
    else if (e.key === "+" || e.key === "=" || e.key === "ArrowUp") zoom(0.8);
    else if (e.key === "-" || e.key === "_" || e.key === "ArrowDown") zoom(1.25);
    else if (e.key === "0" || e.key === "Home") setWin(range);
    else if (e.key === "Escape" && traceKey) setTraceKey(null);
    else return;
    e.preventDefault();
  }

  const scrubValue = ((now - win.start) / span) * 1000;
  const summaryId = `${uid}-summary`;
  const hintId = `${uid}-hint`;
  const clipId = `${uid}-clip`;
  const sweepX = xOf(now);
  const laneTrace = (lane: SwimLane) => {
    if (mode !== "file" || !lane.items.length) return undefined;
    const key = `lane:${lane.id}`;
    return () => startTrace(trace?.key === key ? null : key);
  };
  const showTraceSelect = traceable && mode === "file" && traceOptions.groups.length > 0;

  return (
    <div ref={rootRef} className={cn("@container min-w-0", className)}>
      {title || description ? (
        <div className="mb-3">
          {title ? <h4 className="m-0 text-[clamp(18px,2vw,22px)] font-semibold tracking-[-0.02em] text-ink">{title}</h4> : null}
          {description ? <p className="m-0 mt-1 max-w-[62ch] text-[12.5px] leading-relaxed text-ink-dim">{description}</p> : null}
        </div>
      ) : null}

      <div id={summaryId} className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[12px] leading-relaxed">
        <span className="text-ink-dim [overflow-wrap:anywhere]">{summary}</span>
        <span className="text-ink-faint">{traceText ?? context}</span>
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <PlaybackScrubber
        playing={playing}
        onTogglePlay={togglePlay}
        value={scrubValue}
        onScrub={scrub}
        readout={monthYear(now)}
        valueText={dayMonthYear(now)}
        ticks={windowTicks(win)}
      >
        {filterable ? (
          <SearchInput
            size="sm"
            shape="field"
            placeholder={`Filter ${nouns}…`}
            aria-label={`Filter timeline lanes by ${noun} name`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-[170px]! max-w-full"
          />
        ) : null}
        {projectLanes ? (
          <Segmented aria-label="Timeline mode" size="sm" value={mode} onChange={changeMode} options={MODE_OPTIONS} />
        ) : null}
        {showTraceSelect ? (
          <Select
            size="sm"
            aria-label={`Trace a ${laneNoun.file === "project" ? "lane" : laneNoun.file} or project`}
            value={trace?.key ?? ""}
            onChange={(e) => startTrace(e.target.value || null)}
            className="w-[176px]! max-w-full"
          >
            <option value="">No trace</option>
            {traceOptions.lanes.length ? (
              <optgroup label={laneNoun.file === "project" ? "Lanes" : capitalize(plural(2, laneNoun.file))}>
                {traceOptions.lanes.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : null}
            <optgroup label="Projects">
              {traceOptions.groups.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          </Select>
        ) : null}
        {trace ? (
          <button
            type="button"
            onClick={() => startTrace(null)}
            className="inline-flex h-7 items-center gap-1.5 rounded-[8px] border border-hair bg-s2 px-2.5 text-[12px] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink"
          >
            <X aria-hidden="true" className="size-3.5" />
            Clear trace
          </button>
        ) : null}
      </PlaybackScrubber>

      <div className="mt-2 flex min-h-[30px] flex-wrap items-center gap-x-3 gap-y-2">
        {years.length > 1 || !isAll ? (
          <div role="group" aria-label="Jump to a year" className="flex flex-wrap gap-1">
            <YearChip active={isAll} onClick={() => setWin(range)}>
              All dates
            </YearChip>
            {years.map((y) => {
              const yw = yearWindow(y);
              return (
                <YearChip key={y} active={!isAll && win.start === yw.start && win.end === yw.end} onClick={() => setWin(yw)}>
                  {y}
                </YearChip>
              );
            })}
          </div>
        ) : null}
        <div className="flex items-center gap-1">
          <IconButton aria-label="Zoom out" size="xs" variant="outline" onClick={() => zoom(1.25)} disabled={isAll}>
            <ZoomOut />
          </IconButton>
          <IconButton aria-label="Zoom in" size="xs" variant="outline" onClick={() => zoom(0.8)} disabled={span <= MIN_SPAN + DAY}>
            <ZoomIn />
          </IconButton>
        </div>
        {hideHint ? null : (
          <p id={hintId} className="m-0 ml-auto hidden text-[12px] text-ink-faint @3xl:block">
            Select the plot, then scroll to zoom · drag to pan · Shift + scroll to move in time
          </p>
        )}
      </div>

      {milestone ? (
        <p className="m-0 mt-1.5 min-h-[18px] text-[12px] text-ink-dim">
          <span aria-hidden="true" className="text-ink-faint">
            ◆{" "}
          </span>
          Milestone · {milestone.label}
        </p>
      ) : null}

      <div className="mt-2 flex min-w-0 gap-2">
        {/* lane names beside the plot (wide) */}
        {!stacked && lanes.length ? (
          <div className="w-[104px] shrink-0 @2xl:w-[128px]" style={{ paddingTop: AXIS }}>
            {lanes.map((lane) => (
              <div key={lane.id} className="flex items-center" style={{ height: laneHeight, marginBottom: GAP }}>
                <LaneLabel lane={lane} mode={mode} traced={trace?.key === `lane:${lane.id}`} onTrace={laneTrace(lane)} />
              </div>
            ))}
          </div>
        ) : null}

        <div className="relative min-w-0 flex-1">
          {/* lane names on a strip above each lane (narrow); above the plot so the buttons take clicks */}
          {stacked && lanes.length ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[1]">
              {lanes.map((lane, li) => (
                <div key={lane.id} className="absolute inset-x-0 flex items-center" style={{ top: AXIS + li * pitch, height: strip }}>
                  <LaneLabel lane={lane} mode={mode} traced={trace?.key === `lane:${lane.id}`} onTrace={laneTrace(lane)} inline />
                </div>
              ))}
            </div>
          ) : null}

          {/* plot */}
          <div
            ref={plotRef}
            tabIndex={0}
            role="group"
            aria-roledescription="timeline plot"
            aria-label="Project timeline. Arrow keys pan, plus and minus zoom, 0 resets, Escape clears a trace."
            aria-describedby={hideHint ? summaryId : `${summaryId} ${hintId}`}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={() => setHover(null)}
            className={cn("relative touch-pan-y select-none overflow-hidden rounded-[10px]", panning ? "cursor-grabbing" : "cursor-grab")}
          >
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMin meet" className="block" aria-hidden="true">
              <defs>
                <clipPath id={clipId}>
                  <rect x={0} y={AXIS - 6} width={width} height={height - AXIS + 6} />
                </clipPath>
              </defs>

              {/* lane bands */}
              {lanes.map((lane, li) => {
                const y = bandTop(li);
                const live = lane.items.length > 0;
                return (
                  <g key={lane.id}>
                    <rect
                      x={1}
                      y={y}
                      width={width - 2}
                      height={laneHeight}
                      rx={8}
                      fill={live ? `var(--${lane.tone})` : "#000"}
                      fillOpacity={live ? 0.045 : 0.3}
                      stroke={live ? "none" : "var(--hair)"}
                      strokeDasharray={live ? undefined : "2 4"}
                    />
                    {!live ? (
                      <text
                        x={width / 2}
                        y={y + laneHeight / 2 + 4}
                        textAnchor="middle"
                        className="fill-ink-faint font-mono text-[10.5px] tracking-[0.08em]"
                      >
                        {mode === "project" ? "NO COMMIT DATA" : "NO DATED FILES"}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {/* month grid */}
              {months.map((m) => (
                <g key={m.t}>
                  <line x1={m.x} x2={m.x} y1={AXIS - 6} y2={height} stroke="var(--ink)" strokeOpacity={m.year ? 0.16 : 0.06} strokeDasharray="1 4" />
                  {m.label ? (
                    <text x={m.x + 3} y={13} className="fill-ink-faint font-mono text-[10px] tracking-[0.06em]">
                      {m.label}
                    </text>
                  ) : null}
                </g>
              ))}

              {/* milestones on the axis */}
              {milestones
                .filter((m) => m.t >= win.start && m.t <= win.end)
                .map((m) => (
                  <rect
                    key={m.t}
                    x={xOf(m.t) - 3}
                    y={AXIS - 14}
                    width={6}
                    height={6}
                    transform={`rotate(45 ${xOf(m.t)} ${AXIS - 11})`}
                    fill={m.t <= now ? "var(--ink-dim)" : "var(--s4)"}
                  >
                    <title>{m.label}</title>
                  </rect>
                ))}

              {/* data */}
              <g clipPath={`url(#${clipId})`}>
                {mode === "project"
                  ? lanes.map((lane, li) =>
                      lane.items.length ? (
                        <line
                          key={lane.id}
                          x1={0}
                          x2={width}
                          y1={bandTop(li) + laneHeight / 2}
                          y2={bandTop(li) + laneHeight / 2}
                          stroke={`var(--${lane.tone})`}
                          strokeOpacity={0.18}
                        />
                      ) : null,
                    )
                  : null}
                {tracePath ? <path d={tracePath} fill="none" stroke="var(--ink)" strokeOpacity={0.4} strokeWidth={1.2} strokeLinecap="round" /> : null}
                {placed.flat().map((p) => {
                  const born = p.it.t <= now;
                  let op = born ? 0.85 : 0.08;
                  if (trace) op = trace.ids.has(p.it.id) ? (born ? 1 : 0.06) : born ? 0.1 : 0.03;
                  const color = `var(--${p.lane.tone})`;
                  const common = {
                    opacity: op,
                    onPointerEnter: () => setHover(p),
                    onPointerLeave: () => setHover((h) => (h === p ? null : h)),
                    onClick: () => selectItem(p),
                    className: "cursor-pointer",
                  };
                  if (p.it.shape === "diamond")
                    return <rect key={p.it.id} x={p.x - 2.7} y={p.y - 2.7} width={5.4} height={5.4} transform={`rotate(45 ${p.x} ${p.y})`} fill={color} {...common} />;
                  if (p.it.shape === "ring")
                    return <circle key={p.it.id} cx={p.x} cy={p.y} r={p.r - 0.6} fill="none" stroke={color} strokeWidth={1.4} {...common} />;
                  return <circle key={p.it.id} cx={p.x} cy={p.y} r={p.r} fill={color} {...common} />;
                })}
              </g>

              {/* sweep at the playback date */}
              {now >= win.start && now <= win.end ? (
                <line x1={sweepX} x2={sweepX} y1={AXIS - 6} y2={height} stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.2} strokeDasharray="2 4" />
              ) : null}

              {!lanes.length ? (
                <text x={width / 2} y={AXIS + laneHeight / 2 + 4} textAnchor="middle" className="fill-ink-dim text-[13px]">
                  {allLanes.length ? `No ${noun} matches the filter.` : "No projects mapped yet."}
                </text>
              ) : null}
            </svg>

            {hover ? <HoverCard p={hover} mode={mode} traced={trace?.key === hover.it.group} width={width} height={height} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A lane's name and count: two lines beside the plot, or one line on the stacked strip. With
    onTrace it is a toggle button that traces the whole lane. */
function LaneLabel({ lane, mode, traced, onTrace, inline = false }: { lane: SwimLane; mode: SwimMode; traced: boolean; onTrace?: () => void; inline?: boolean }) {
  const count = mode === "project" ? lane.items.reduce((s, it) => s + (it.weight ?? 1), 0) : lane.items.length;
  const countText = lane.items.length === 0 ? (mode === "project" ? "No commits" : "No files") : `${formatNumber(count)} ${plural(count, mode === "project" ? "commit" : "file")}`;
  const color = lane.items.length ? `var(--${lane.tone})` : "var(--ink-faint)";
  const body = inline ? (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="truncate text-[12px] font-medium italic leading-tight" style={{ color }}>
        {lane.name}
      </span>
      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint">{countText}</span>
    </span>
  ) : (
    <>
      <span className="line-clamp-2 block break-words text-[11.5px] font-medium italic leading-tight @2xl:text-[12.5px]" style={{ color }}>
        {lane.name}
      </span>
      <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint">{countText}</span>
    </>
  );
  const box = inline ? "pointer-events-auto inline-flex max-w-full items-center rounded-[6px] px-1.5 py-0.5" : "block w-full min-w-0 rounded-[8px] px-1.5 py-1 text-left";
  if (!onTrace) return <div className={box}>{body}</div>;
  return (
    <button
      type="button"
      aria-pressed={traced}
      aria-label={`Trace ${lane.name}`}
      onClick={onTrace}
      className={cn(box, "transition-colors hover:bg-white/[0.04]", traced && "bg-white/[0.06] ring-1 ring-hair-strong")}
    >
      {body}
    </button>
  );
}

function YearChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-[28px] items-center rounded-[6px] border px-2.5 font-mono text-[11px] tabular-nums transition-colors",
        active ? "border-ink/40 bg-white/[0.07] text-ink" : "border-hair-soft text-ink-faint hover:border-hair-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function HoverCard({ p, mode, traced, width, height }: { p: Placed; mode: SwimMode; traced: boolean; width: number; height: number }) {
  const cardW = Math.min(210, width - 8);
  const left = clamp(p.x - cardW / 2, 4, Math.max(4, width - cardW - 4));
  const below = p.y < height / 2;
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-[10px] border border-hair-strong bg-[#121214]/95 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur"
      style={{ left, width: cardW, top: below ? p.y + 12 : undefined, bottom: below ? undefined : height - p.y + 12 }}
    >
      <p className="m-0 truncate font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ color: `var(--${p.lane.tone})` }}>
        {mode === "project" ? `${p.lane.name} · git` : `${p.lane.name} · ${p.it.groupLabel}`}
      </p>
      <p className="m-0 mt-1 text-[13px] font-semibold text-ink">{formatDate(p.it.t, { withYear: true })}</p>
      <p className="m-0 mt-0.5 truncate font-mono text-[11px] text-ink-dim">{p.it.label}</p>
      <p className="m-0 mt-2 text-[11px] text-ink-faint">{mode === "project" ? "Select to move playback here" : traced ? "Select to clear the trace" : `Select to trace ${p.it.groupLabel}`}</p>
    </div>
  );
}
