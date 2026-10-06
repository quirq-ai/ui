"use client";

// HUD cockpit frame: Space Drift's full-bleed canvas between a HUD header (88px, 70px on narrow
// frames, with the brand, connection, Connect folder, source link and help) and a 54px footer
// (coordinates, scan note, Atlas with its M key, pause). M opens the atlas while focus is in the
// cockpit and Escape pauses the flight. The starfield is seeded, so render is deterministic.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CircleHelp, Crosshair, Map as MapIcon, Pause, Play, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { mulberry32, type ColorToken } from "@/lib/fixtures";
import { Mark } from "@/components/brand/mark";
import { Kbd, RuntimeLogo, StatusDot } from "@/components/ui";

const HUD_LINE = "border-[rgba(170,184,255,0.18)]";
const HUD_BG = "bg-[rgba(8,10,20,0.74)] backdrop-blur-md";

/* ----------------------------------------------------------------------------- starfield */

const STARS = (() => {
  const rng = mulberry32(4242);
  return Array.from({ length: 150 }, (_, i) => ({
    id: i,
    x: Math.round(rng() * 1600) - 300,
    y: Math.round(rng() * 1000) - 200,
    r: Math.round((0.35 + rng() * 1.1) * 100) / 100,
    o: Math.round((0.25 + rng() * 0.65) * 100) / 100,
  }));
})();

export type HudBody = { id: string; label: string; color: ColorToken; size: number; x: number; y: number };

/** Canvas width, in canvas units, kept in view on frames narrower than 5:3 so no body is cropped. */
const NARROW_SPAN = 920;

/**
 * Seeded starfield with optional bodies (projects as planets). Turns slowly unless paused.
 * Wide frames crop the 1000 x 600 canvas top and bottom; narrow frames widen the view instead
 * so every body stays inside. Labels and planets keep a readable size on small frames.
 */
export function StarfieldCanvas({ bodies = [], paused = false, target }: { bodies?: HudBody[]; paused?: boolean; target?: string | null }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const nebulaId = `hud-nebula-${uid}`;
  const shadeId = `hud-shade-${uid}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* first render (server and hydration) uses the plain cover view; the measured frame refines it */
  const aspect = box && box.w > 0 && box.h > 0 ? box.w / box.h : null;
  const narrow = aspect !== null && aspect < 1000 / 600;
  const vbX = narrow ? 500 - NARROW_SPAN / 2 : 0;
  const vbY = narrow ? Math.round(300 - NARROW_SPAN / aspect / 2) : 0;
  const viewBox = narrow ? `${vbX} ${vbY} ${NARROW_SPAN} ${Math.round(NARROW_SPAN / aspect)}` : "0 0 1000 600";
  const unitsPerPx = box && box.w > 0 ? (narrow ? NARROW_SPAN : 1000) / box.w : 1;
  const labelSize = Math.max(11, Math.round(10 * unitsPerPx));
  const minRadius = 4 * unitsPerPx;

  return (
    <svg ref={svgRef} viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <radialGradient id={nebulaId} gradientUnits="userSpaceOnUse" cx="300" cy="210" r="700">
          <stop offset="0%" stopColor="rgba(46,155,255,0.22)" />
          <stop offset="55%" stopColor="rgba(191,90,242,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id={shadeId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
      </defs>
      <rect x="-600" y="-600" width="2200" height="1800" fill="#04050a" />
      <rect x="-600" y="-600" width="2200" height="1800" fill={`url(#${nebulaId})`} />
      <g
        style={{
          /* view-box origins sit at the viewBox corner, so the turn stays centered on the canvas middle */
          transformOrigin: `${500 - vbX}px ${300 - vbY}px`,
          transformBox: "view-box",
          animation: "q-spin 240s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {STARS.map((s) => (
          <circle key={s.id} cx={s.x} cy={s.y} r={s.r * Math.min(unitsPerPx, 2)} fill="#e8ecff" opacity={s.o} />
        ))}
      </g>
      {bodies.map((b) => {
        const r = Math.max(b.size, minRadius);
        return (
          <g key={b.id} transform={`translate(${b.x} ${b.y})`}>
            <circle r={r * 2.4} fill="none" stroke={`var(--${b.color})`} strokeOpacity={target === b.id ? 0.75 : 0.18} strokeDasharray={`${2 * unitsPerPx} ${5 * unitsPerPx}`} strokeWidth={unitsPerPx} />
            <circle r={r} fill={`var(--${b.color})`} opacity={0.9} />
            <circle r={r} fill={`url(#${shadeId})`} />
            <text y={r * 2.4 + labelSize * 1.3} textAnchor="middle" fill="#c9cfe8" fontSize={labelSize} fontFamily="var(--font-mono)" letterSpacing={labelSize * 0.11}>
              {b.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------------------------------------------------------------- header and footer */

export type HudSourceState = "none" | "connected" | "sample";

export type HudHeaderProps = {
  source: HudSourceState;
  /** "research-lab · 11 projects" when connected. */
  sourceLabel?: string;
  onConnect?: () => void;
  onHelp?: () => void;
  helpOpen?: boolean;
  /** id of the help panel the help button controls. */
  helpId?: string;
  githubHref?: string;
};

/** Fixed-height HUD header: mark and SPACE DRIFT, connection with LOCAL ONLY, Connect folder, source and help. */
export function HudHeader({ source, sourceLabel, onConnect, onHelp, helpOpen, helpId, githubHref }: HudHeaderProps) {
  const connection = source === "none" ? "No folder connected" : source === "sample" ? "Sample projects folder" : sourceLabel ?? "Folder connected";
  return (
    <header className={cn("relative z-10 flex h-[70px] shrink-0 items-center gap-2.5 border-b px-[18px] @min-[44rem]:h-[88px] @min-[44rem]:gap-6 @min-[44rem]:px-9", HUD_LINE, HUD_BG)}>
      <a href="#drift" onClick={(e) => e.preventDefault()} aria-label="Space Drift home" className="flex min-w-0 items-center gap-2 rounded-[6px]! text-ink @min-[44rem]:gap-3">
        <Mark size={26} className="text-[#aab8ff] @min-[44rem]:size-[34px]" />
        <span className="truncate text-[13px] font-semibold tracking-[2px] @min-[44rem]:text-[19px] @min-[44rem]:tracking-[5px]">SPACE DRIFT</span>
      </a>
      <div className="ml-auto flex min-w-0 items-center gap-2 text-[11px] text-[#b9c1e0]">
        <StatusDot status={source === "none" ? "idle" : source === "sample" ? "warn" : "up"} size="sm" label={connection} />
        <span className="hidden truncate @min-[44rem]:inline">{connection}</span>
        <span className="hidden rounded-[3px] border border-[rgba(170,184,255,0.3)] px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.14em] text-[#aab8ff] @min-[56rem]:inline">
          {source === "sample" ? "SAMPLE" : "LOCAL ONLY"}
        </span>
      </div>
      <button
        type="button"
        onClick={onConnect}
        aria-label={source === "none" ? "Connect folder" : "Change folder"}
        title={source === "none" ? "Choose a local folder" : "Choose another folder"}
        className="shrink-0 rounded-full! border border-[rgba(170,184,255,0.45)] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#dfe4ff] transition-colors hover:bg-[rgba(170,184,255,0.12)] @min-[44rem]:px-4 @min-[44rem]:text-[10.5px]"
      >
        {source === "none" ? (
          <>
            <span className="@min-[44rem]:hidden">Connect</span>
            <span className="hidden @min-[44rem]:inline">Connect folder</span>
          </>
        ) : (
          "Change"
        )}
      </button>
      {githubHref ? (
        <a
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Space Drift on GitHub (opens in a new tab)"
          title="View source on GitHub"
          className="hidden size-8 shrink-0 place-items-center rounded-full! text-[#b9c1e0] hover:text-ink @min-[36rem]:grid"
        >
          <RuntimeLogo id="github" size={16} decorative />
        </a>
      ) : null}
      <button
        type="button"
        onClick={onHelp}
        aria-label="Open flight manual"
        aria-expanded={helpOpen}
        aria-controls={helpOpen ? helpId : undefined}
        title="Flight manual"
        className="grid size-8 shrink-0 place-items-center rounded-full! text-[#b9c1e0] hover:text-ink"
      >
        <CircleHelp aria-hidden="true" className="size-[18px]" />
      </button>
    </header>
  );
}

export type HudFooterProps = {
  coords: { x: number; y: number; z: number };
  note: string;
  atlasEnabled: boolean;
  onAtlas: () => void;
  paused: boolean;
  onPause: () => void;
};

function pad(n: number) {
  const s = String(Math.abs(n)).padStart(4, "0");
  return n < 0 ? `-${s}` : s;
}

/** 54px HUD footer: coordinates, the scan note, Atlas (M) and pause. */
export function HudFooter({ coords, note, atlasEnabled, onAtlas, paused, onPause }: HudFooterProps) {
  return (
    <footer className={cn("relative z-10 flex h-[54px] shrink-0 items-center gap-2 border-t px-3.5 @min-[30rem]:gap-3 @min-[30rem]:px-[18px] font-mono text-[10px] tracking-[1px] text-[#b9c1e0] @min-[44rem]:px-9", HUD_LINE, HUD_BG)}>
      <div className="flex min-w-0 items-center gap-2.5 @min-[44rem]:w-[30%]">
        <Crosshair aria-hidden="true" className="size-3 shrink-0 text-[#aab8ff]" />
        <span className="truncate tabular-nums tracking-[0.3px] @min-[30rem]:tracking-[1px]" aria-label={`Position X ${coords.x}, Y ${coords.y}, Z ${coords.z}`}>
          X {pad(coords.x)} Y {pad(coords.y)} Z {pad(coords.z)}
        </span>
      </div>
      <p className="mx-auto hidden min-w-0 truncate uppercase @min-[44rem]:block">
        {note}
        <span aria-hidden="true" className="mx-2.5">
          ·
        </span>
        Files stay local
      </p>
      <button
        type="button"
        onClick={onAtlas}
        disabled={!atlasEnabled}
        aria-keyshortcuts="M"
        aria-label="Atlas"
        title={atlasEnabled ? "Atlas (M)" : "Connect a folder to use the atlas"}
        className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-[8px]! px-2 py-1 text-[11px] uppercase text-[#dfe4ff] transition-colors hover:bg-[rgba(170,184,255,0.1)] disabled:cursor-not-allowed disabled:opacity-40 @min-[44rem]:ml-0"
      >
        <MapIcon aria-hidden="true" className="size-4" />
        <span className="hidden @min-[30rem]:inline">Atlas</span>
        <Kbd size="xs" subtle>
          M
        </Kbd>
      </button>
      <button
        type="button"
        onClick={onPause}
        aria-pressed={paused}
        aria-label={paused ? "Resume flight" : "Pause flight"}
        aria-keyshortcuts="Escape"
        className="grid size-8 shrink-0 place-items-center rounded-full! text-[#dfe4ff] hover:bg-[rgba(170,184,255,0.1)]"
      >
        {paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
      </button>
    </footer>
  );
}

/* ----------------------------------------------------------------------------- atlas */

export type AtlasDialogProps = {
  open: boolean;
  onClose: () => void;
  bodies: HudBody[];
  onPick: (id: string) => void;
};

/** Native modal dialog: search the bodies and pick a destination. Escape closes it. */
export function AtlasDialog({ open, onClose, bodies, onPick }: AtlasDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const q = query.trim().toLowerCase();
  const shown = q ? bodies.filter((b) => b.label.toLowerCase().includes(q)) : bodies;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[16px] border border-[rgba(170,184,255,0.25)] bg-[#0a0c18] p-0 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#aab8ff]">Space atlas</p>
            <h2 id={titleId} className="mt-1 text-[20px] font-semibold tracking-[-0.01em]">
              Explore the system.
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close atlas" className="grid size-8 place-items-center rounded-full! text-ink-dim hover:bg-white/[0.06] hover:text-ink">
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-[12.5px] text-ink-dim">Choose a body to fly to. Projects are planets; their size follows their files.</p>
        <label className="mt-3 flex items-center gap-2 rounded-[10px] border border-hair bg-black/40 px-3">
          <Search aria-hidden="true" className="size-4 text-ink-faint" />
          <span className="sr-only">Find a project</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a project…"
            className="h-9 w-full bg-transparent text-[13px] outline-none placeholder:text-ink-faint focus-visible:outline-none"
          />
        </label>
        <ul className="scroll-thin mt-3 max-h-[220px] overflow-y-auto">
          {shown.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onPick(b.id)}
                className="flex w-full items-center gap-3 rounded-[8px]! px-2 py-2 text-left text-[13px] hover:bg-white/[0.05]"
              >
                <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: `var(--${b.color})` }} />
                <span className="flex-1 font-mono">{b.label}</span>
                <span className="font-mono text-[10.5px] text-ink-faint">fly to</span>
              </button>
            </li>
          ))}
          {shown.length === 0 ? <li className="px-2 py-4 text-[12.5px] text-ink-faint">No body matches “{query}”.</li> : null}
        </ul>
        <p className="mt-3 border-t border-hair-soft pt-3 text-[11.5px] text-ink-faint">Routes are simulated. Your files stay exactly where they are.</p>
      </div>
    </dialog>
  );
}

/* ----------------------------------------------------------------------------- cockpit */

export type HudCockpitProps = {
  header: ReactNode;
  footer: ReactNode;
  /** The canvas: starfield, bodies, overlays. */
  children: ReactNode;
  /** Escape inside the cockpit. */
  onEscape?: () => void;
  /** M inside the cockpit. */
  onAtlasKey?: () => void;
  label?: string;
  className?: string;
};

/** Full-bleed canvas between the HUD bars. Keys act only while focus is inside the cockpit. */
export function HudCockpit({ header, footer, children, onEscape, onAtlasKey, label = "Space Drift flight view", className }: HudCockpitProps) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest("dialog")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape?.();
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      onAtlasKey?.();
    }
  }
  return (
    <div onKeyDown={onKey} className={cn("@container relative flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair bg-[#04050a]", className)}>
      {header}
      <div
        role="group"
        aria-label={`${label}. Press M for the atlas, Escape to pause.`}
        aria-keyshortcuts="M Escape"
        tabIndex={0}
        className={cn(
          "relative min-h-0 flex-1 focus-visible:outline-none!",
          /* the canvas layers are positioned and would paint over an outline, so the ring is an overlay */
          "focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:z-30 focus-visible:after:rounded-[2px] focus-visible:after:shadow-[inset_0_0_0_2px_var(--ink)]",
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
