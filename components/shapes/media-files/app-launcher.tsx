"use client";

// App icon launcher: the home screen of a space, as in the XO Swarm space view and the
// xo-client phone. Pieces:
//   AppIconTile   one 64px tile and its label: app, add-on (sign-in or connector), restart or
//                 skill; badges for connected, unsupported, installed and counts; a loading
//                 veil; disabled until the space is running; pressed scale
//   SpaceWidget   the status widget on page 1: CPU, memory and disk rings
//   AppLauncher   pages of tiles: swipe or drag sideways, arrow keys move between tiles and
//                 pages, dots jump to a page; inactive pages are inert
//   LauncherDock  a glass dock row of tiles without labels
//   paginate      splits items into a short first page (under the widget) and full pages
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Ban, Check, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui";
import type { ToneToken } from "@/lib/fixtures";

/* ================================================================== tile */

export type LauncherTileKind = "app" | "addon" | "restart" | "skill";
export type LauncherTileStatus = "idle" | "connected" | "unsupported" | "loading" | "installed";
export type LauncherTone = ToneToken | "lime" | "neutral";

export type LauncherItem = {
  id: string;
  label: string;
  kind: LauncherTileKind;
  /** The glyph on the tile: a lucide icon, a runtime logo or the XO mark. */
  icon: ReactNode;
  tone?: LauncherTone;
  status?: LauncherTileStatus;
  /** Count badge (unread, open, down); null or 0 hides it. */
  badge?: number | null;
};

export type AppIconTileProps = Omit<LauncherItem, "id"> & {
  /** Not clickable yet: the space is not running, or the Space API is down. */
  disabled?: boolean;
  onActivate?: () => void;
  /** Show the pressed scale without a press (specimens). */
  pressed?: boolean;
  /** Dock tiles carry no visible label; the name stays accessible. */
  hideLabel?: boolean;
  className?: string;
};

const TONE_HEX: Record<string, string> = { lime: "#83d63a" };

function tileBackground(tone: LauncherTone): string {
  if (tone === "neutral" || tone === "ink" || tone === "ink-dim" || tone === "ink-faint") return "linear-gradient(155deg, #333337 0%, #161618 100%)";
  const c = TONE_HEX[tone] ?? `var(--${tone})`;
  return `linear-gradient(155deg, color-mix(in srgb, ${c} 46%, #202023) 0%, color-mix(in srgb, ${c} 14%, #0c0c0e) 100%)`;
}

function accessibleName(label: string, kind: LauncherTileKind, status: LauncherTileStatus): string {
  if (status === "unsupported") return `${label} not supported`;
  if (status === "loading") return kind === "skill" ? `Installing ${label}` : kind === "restart" ? `Restarting ${label}` : `Checking ${label}`;
  if (kind === "restart") return `Restart ${label.replace(/ Restart$/, "")}`;
  if (kind === "skill") return status === "installed" ? `${label} installed` : `Install ${label}`;
  if (kind === "addon") return status === "connected" ? `${label} connected` : `Connect ${label}`;
  return `Open ${label}`;
}

/** One launcher tile: 64px icon, status badge, 11px label. */
export function AppIconTile({
  label,
  kind,
  icon,
  tone = "neutral",
  status = "idle",
  badge,
  disabled = false,
  onActivate,
  pressed = false,
  hideLabel = false,
  className,
}: AppIconTileProps) {
  const inert = disabled || status === "unsupported" || status === "loading";
  const name = accessibleName(label, kind, status) + (badge ? `, ${badge} new` : "");
  return (
    <button
      type="button"
      data-tile=""
      aria-label={name}
      aria-disabled={inert || undefined}
      disabled={disabled || status === "unsupported"}
      onClick={inert ? undefined : onActivate}
      className={cn(
        "group/tile flex w-16 shrink-0 select-none flex-col items-center gap-1.5 rounded-[16px]! outline-offset-4!",
        inert ? "cursor-not-allowed" : "cursor-pointer transition-transform duration-150 ease-quirq active:scale-90",
        (disabled || status === "unsupported") && "opacity-60",
        pressed && "scale-90",
        className,
      )}
    >
      <span className="relative block size-16">
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center overflow-hidden rounded-[16px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,.1),0_6px_18px_rgba(0,0,0,.35)] [&_svg]:size-7"
          style={{ background: tileBackground(tone) } as CSSProperties}
        >
          {icon}
          {status === "loading" ? (
            <span className="absolute inset-0 grid place-items-center bg-white/10 backdrop-blur-[1px]">
              <Spinner size="md" label={null} className="text-ink" />
            </span>
          ) : null}
        </span>
        {status === "connected" || status === "installed" ? (
          <span aria-hidden="true" className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-grn text-black shadow-sm">
            <Check className="size-2.5" strokeWidth={3.5} />
          </span>
        ) : null}
        {status === "unsupported" ? (
          <span aria-hidden="true" className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-ink text-red shadow-sm">
            <Ban className="size-3" strokeWidth={2.75} />
          </span>
        ) : null}
        {kind === "restart" && status !== "loading" ? (
          <span aria-hidden="true" className="absolute bottom-1 right-1 grid size-[18px] place-items-center rounded-full bg-black/65 text-org">
            <RotateCcw className="size-[11px]" strokeWidth={2.5} />
          </span>
        ) : null}
        {kind === "skill" && status === "idle" ? (
          <span aria-hidden="true" className="absolute bottom-1 right-1 grid size-[18px] place-items-center rounded-full bg-black/65 text-ink">
            <Plus className="size-3" strokeWidth={2.75} />
          </span>
        ) : null}
        {badge ? (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red px-1.5 font-mono text-[11px] font-semibold tabular-nums text-black shadow-[0_0_0_2px_#0b0b0d]"
          >
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          // line-clamp clips to the box, so the shadow stays tight enough not to show its edge
          "line-clamp-2 max-w-[76px] text-center text-[11px] font-medium leading-tight text-ink/90 [text-shadow:0_1px_4px_rgba(0,0,0,.85)]",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </span>
    </button>
  );
}

/* ================================================================== widget */

export type WidgetMeter = {
  label: string;
  /** Readout such as "2.1 / 10 cores"; ignored when ratio is null. */
  value: string;
  /** 0 to 1; null when the space reports nothing, which reads Unavailable. */
  ratio: number | null;
  /** CSS color for the ring. */
  color: string;
};

export type SpaceWidgetProps = {
  title: string;
  /** Line under the title, such as "Running · local". */
  subtitle?: ReactNode;
  meters: WidgetMeter[];
  className?: string;
};

/** Page-1 widget: concentric usage rings and their readouts. Missing readings say Unavailable. */
export function SpaceWidget({ title, subtitle, meters, className }: SpaceWidgetProps) {
  const radii = [44, 33, 22];
  return (
    <div className={cn("relative overflow-hidden rounded-[18px] border border-hair bg-[#141416]/90 px-3 py-3.5 backdrop-blur-md", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-blu/10 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <svg viewBox="0 0 104 104" className="size-[92px] shrink-0 -rotate-90" aria-hidden="true">
          {meters.slice(0, 3).map((m, i) => {
            const r = radii[i];
            const c = 2 * Math.PI * r;
            return (
              <g key={m.label}>
                <circle cx="52" cy="52" r={r} fill="none" stroke="#2e2e2e" strokeWidth="8" />
                {m.ratio !== null ? (
                  <circle
                    cx="52"
                    cy="52"
                    r={r}
                    fill="none"
                    stroke={m.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(0.02, Math.min(1, m.ratio)) * c} ${c}`}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">{title}</p>
          {subtitle ? <p className="truncate text-[11px] text-ink-faint">{subtitle}</p> : null}
          <dl className="mt-1.5 space-y-[3px]">
            {meters.map((m) => (
              <div key={m.label} className="flex min-w-0 items-baseline gap-1.5 text-[11px]">
                <dt className="flex shrink-0 items-center gap-1.5 text-ink-faint">
                  <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: m.color }} />
                  {m.label}
                </dt>
                <dd className={cn("min-w-0 truncate font-mono tabular-nums", m.ratio === null ? "text-ink-faint" : "text-ink")}>
                  {m.ratio === null ? "Unavailable" : m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== pages */

export type LauncherPage = {
  id: string;
  /** Read with the page position: "Page 2 of 3: Sign-ins and connectors". */
  label: string;
  items: LauncherItem[];
  /** Shown above the tiles, normally on page 1 only. */
  widget?: ReactNode;
};

/** Splits items into a first page of `first` tiles (under a widget) and pages of `per`. */
export function paginate(items: LauncherItem[], first: number, per: number): LauncherItem[][] {
  const pages: LauncherItem[][] = [items.slice(0, first)];
  for (let i = first; i < items.length; i += per) pages.push(items.slice(i, i + per));
  return pages.filter((p) => p.length > 0);
}

export type AppLauncherProps = {
  pages: LauncherPage[];
  /** Names the carousel: "research-lab apps". */
  label: string;
  /** Every tile disabled: the space is not running. */
  disabled?: boolean;
  /** Add-on and skill tiles disabled: the Space API is down. */
  addonsDisabled?: boolean;
  onActivate?: (item: LauncherItem) => void;
  columns?: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
};

const SWIPE_PX = 48;

/** Paged home screen of tiles with swipe, arrow keys and page dots. */
export function AppLauncher({
  pages,
  label,
  disabled = false,
  addonsDisabled = false,
  onActivate,
  columns = 4,
  page,
  defaultPage = 0,
  onPageChange,
  className,
}: AppLauncherProps) {
  const [inner, setInner] = useState(defaultPage);
  const current = Math.min(page ?? inner, pages.length - 1);
  const [dragX, setDragX] = useState(0);
  const start = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const focusAfter = useRef<"first" | "last" | null>(null);

  function go(next: number, focus: "first" | "last" | null = null) {
    const n = Math.min(pages.length - 1, Math.max(0, next));
    if (n === current) return;
    focusAfter.current = focus;
    if (page === undefined) setInner(n);
    onPageChange?.(n);
  }

  useEffect(() => {
    const which = focusAfter.current;
    if (!which) return;
    focusAfter.current = null;
    const tiles = Array.from(pageRefs.current[current]?.querySelectorAll<HTMLButtonElement>("[data-tile]:not(:disabled)") ?? []);
    (which === "first" ? tiles[0] : tiles[tiles.length - 1])?.focus();
  }, [current]);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || pages.length < 2) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    suppressClick.current = false;
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
      s.moved = true;
      e.currentTarget.setPointerCapture(s.id);
    }
    if (s.moved) {
      const atEdge = (current === 0 && dx > 0) || (current === pages.length - 1 && dx < 0);
      setDragX(atEdge ? dx * 0.3 : dx);
    }
  }
  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (s.moved) {
      suppressClick.current = true;
      const dx = e.clientX - s.x;
      if (dx <= -SWIPE_PX) go(current + 1);
      else if (dx >= SWIPE_PX) go(current - 1);
    }
    setDragX(0);
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>, pageIndex: number) {
    const tiles = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-tile]"));
    const at = tiles.indexOf(document.activeElement as HTMLButtonElement);
    if (at === -1) return;
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
    if (!(e.key in step) && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    if (e.key === "Home") return tiles.find((t) => !t.disabled)?.focus();
    if (e.key === "End") return [...tiles].reverse().find((t) => !t.disabled)?.focus();
    let next = at + step[e.key];
    while (next >= 0 && next < tiles.length && tiles[next].disabled) next += Math.sign(step[e.key]);
    if (next >= 0 && next < tiles.length) tiles[next].focus();
    else if (e.key === "ArrowRight" && pageIndex < pages.length - 1) go(pageIndex + 1, "first");
    else if (e.key === "ArrowLeft" && pageIndex > 0) go(pageIndex - 1, "last");
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={cn("flex min-h-0 w-full flex-col items-center", className)}>
      <div
        className="w-full flex-1 touch-pan-y overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div
          className={cn("flex h-full", dragX === 0 && "transition-transform duration-300 ease-quirq")}
          style={{ transform: `translateX(calc(${-current * 100}% + ${dragX}px))` }}
        >
          {pages.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Page ${i + 1} of ${pages.length}: ${p.label}`}
              inert={i !== current}
              className="flex w-full shrink-0 grow-0 basis-full flex-col items-center gap-4 px-1 pt-2"
            >
              {p.widget ? <div className="w-full max-w-[320px]">{p.widget}</div> : null}
              <div
                className="grid w-full content-start items-start justify-evenly gap-x-2 gap-y-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 64px)` }}
                onKeyDown={(e) => onGridKeyDown(e, i)}
              >
                {p.items.map((item) => {
                  const off = disabled || (addonsDisabled && (item.kind === "addon" || item.kind === "skill"));
                  return (
                    <AppIconTile
                      key={item.id}
                      label={item.label}
                      kind={item.kind}
                      icon={item.icon}
                      tone={item.tone}
                      status={item.status}
                      badge={item.badge}
                      disabled={off}
                      onActivate={() => onActivate?.(item)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex h-5 items-center justify-center gap-0.5">
        {pages.length > 1
          ? pages.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Page ${i + 1} of ${pages.length}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => go(i)}
                className="grid size-5 place-items-center rounded-full!"
              >
                <span aria-hidden="true" className={cn("size-1.5 rounded-full transition-colors duration-200", i === current ? "bg-ink" : "bg-ink/40")} />
              </button>
            ))
          : null}
      </div>
    </div>
  );
}

/* ================================================================== dock */

export type LauncherDockProps = {
  items: LauncherItem[];
  label: string;
  disabled?: boolean;
  onActivate?: (item: LauncherItem) => void;
  className?: string;
};

/** Glass dock under the pages: four tiles, names kept for screen readers only. */
export function LauncherDock({ items, label, disabled, onActivate, className }: LauncherDockProps) {
  return (
    <nav aria-label={label} className={cn("w-full rounded-[26px] border border-hair bg-white/[0.07] px-2 py-2.5 backdrop-blur-xl", className)}>
      <div className="flex items-center justify-evenly">
        {items.map((item) => (
          <AppIconTile key={item.id} {...item} hideLabel disabled={disabled} onActivate={() => onActivate?.(item)} />
        ))}
      </div>
    </nav>
  );
}
