"use client";

// Improvement loop: five to eight stages on a ring, curved arrows between them, a return
// edge back to the first stage (labeled "next configuration"), an optional entry node above
// the ring, and a center that shows the tagline or the active stage's note and status.
import { useId, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/components/ui/tones";
import { toneColor } from "./parts";

export type StageStatus = "Working" | "Under validation" | "Planned";

export type CycleStage = {
  id: string;
  label: string;
  /** the stage's question or note, shown in the center */
  note: string;
  status?: StageStatus;
  tone?: Tone;
};

export type CycleDiagramProps = {
  stages: CycleStage[];
  tagline: string;
  /** label on the edge from the last stage back to the first */
  returnLabel?: string;
  /** a node above the ring that leads into the first stage, such as XO */
  entry?: { label: string; sub?: string };
  ariaLabel: string;
  /** no hover or keyboard; the center keeps the tagline */
  static?: boolean;
  defaultActive?: string | null;
  className?: string;
};

const STATUS_TONE: Record<StageStatus, Tone> = { Working: "grn", "Under validation": "org", Planned: "neutral" };

const V = 400;
const r1 = (n: number) => Math.round(n * 10) / 10;

export function CycleDiagram({
  stages,
  tagline,
  returnLabel = "next configuration",
  entry,
  ariaLabel,
  static: isStatic = false,
  defaultActive = null,
  className,
}: CycleDiagramProps) {
  const uid = useId();
  const [pinned, setPinned] = useState<string | null>(defaultActive);
  const [hover, setHover] = useState<string | null>(null);
  const [kbd, setKbd] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const activeId = isStatic ? null : (hover ?? focused ?? pinned);
  const active = stages.find((s) => s.id === activeId) ?? null;
  const n = stages.length;
  const cx = V / 2;
  const cy = entry ? 222 : 200;
  const R = entry ? 120 : 130;
  const at = (deg: number, r = R) => ({ x: r1(cx + r * Math.cos((deg * Math.PI) / 180)), y: r1(cy + r * Math.sin((deg * Math.PI) / 180)) });
  const angle = (i: number) => -90 + (i * 360) / n;
  const gap = Math.min(19, 120 / n + 3);
  const tabStop = kbd && stages.some((s) => s.id === kbd) ? kbd : (pinned ?? stages[0]?.id);

  const arcs = stages.map((s, i) => {
    const a1 = angle(i) + gap;
    const a2 = angle(i + 1) - gap;
    const p1 = at(a1);
    const p2 = at(a2);
    const t = ((a2 + 90) * Math.PI) / 180; // clockwise tangent
    const tip = `${p2.x},${p2.y} ${r1(p2.x - 7 * Math.cos(t) - 3.5 * Math.cos(t - Math.PI / 2))},${r1(p2.y - 7 * Math.sin(t) - 3.5 * Math.sin(t - Math.PI / 2))} ${r1(p2.x - 7 * Math.cos(t) + 3.5 * Math.cos(t - Math.PI / 2))},${r1(p2.y - 7 * Math.sin(t) + 3.5 * Math.sin(t - Math.PI / 2))}`;
    const closing = i === n - 1;
    return { id: s.id, d: `M${p1.x} ${p1.y} A${R} ${R} 0 0 1 ${p2.x} ${p2.y}`, tip, closing, from: s.id };
  });

  const move = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape") {
      setPinned(null);
      setHover(null);
      setFocused(null);
      return;
    }
    if (next === undefined) return;
    e.preventDefault();
    const id = stages[next].id;
    setKbd(id);
    document.querySelector<HTMLElement>(`[data-cycle="${CSS.escape(uid)}"] [data-stage="${CSS.escape(id)}"]`)?.focus();
  };

  return (
    <figure className={cn("@container m-0 min-w-0", className)}>
      <div data-cycle={uid} className="relative mx-auto aspect-square w-full max-w-[440px]" role="group" aria-label={ariaLabel}>
        <svg viewBox={`0 0 ${V} ${V}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--hair-soft)" />
          {arcs.map((a) => {
            const fromActive = activeId === a.from;
            const color = a.closing ? "var(--blu)" : fromActive ? toneColor(active?.tone ?? "blu") : "var(--ink-faint)";
            return (
              <g key={a.id} opacity={activeId && !fromActive && !a.closing ? 0.55 : 1} style={{ transition: "opacity 180ms var(--ease)" }}>
                <path d={a.d} fill="none" stroke={color} strokeWidth={fromActive ? 1.9 : 1.3} strokeDasharray={a.closing ? "5 4" : undefined} strokeLinecap="round" />
                <polygon points={a.tip} fill={color} />
              </g>
            );
          })}
          {entry ? (
            <g>
              <line x1={cx} y1={58} x2={cx} y2={cy - R - 22} stroke="var(--ink-faint)" strokeWidth={1.3} />
              <polygon points={`${cx},${cy - R - 16} ${cx - 3.5},${cy - R - 23} ${cx + 3.5},${cy - R - 23}`} fill="var(--ink-faint)" />
            </g>
          ) : null}
        </svg>

        {entry ? (
          <div
            className="absolute left-1/2 top-[3%] flex -translate-x-1/2 flex-col items-center rounded-[10px] border border-hair-strong bg-s1 px-3 py-1.5 text-center"
          >
            <span className="text-[12.5px] font-semibold text-ink">{entry.label}</span>
            {entry.sub ? <span className="whitespace-nowrap text-[10px] leading-tight text-ink-faint @min-[400px]:text-[10.5px]">{entry.sub}</span> : null}
          </div>
        ) : null}

        {stages.map((s, i) => {
          const p = at(angle(i));
          const on = activeId === s.id;
          const style = { left: `${(p.x / V) * 100}%`, top: `${(p.y / V) * 100}%` };
          const body = (
            <>
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: toneColor(s.tone ?? "neutral") }} />
              <span className="font-mono text-[9.5px] tabular-nums text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-tight">{s.label}</span>
            </>
          );
          const cls = cn(
            "absolute flex max-w-[124px] -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-2.5 py-1 text-left text-[11px] transition-[background-color,border-color,color] duration-150 @min-[400px]:max-w-none @min-[400px]:whitespace-nowrap @min-[400px]:text-[12px]",
            on ? "border-hair-strong bg-s3 text-ink shadow-[0_0_0_3px_rgba(46,155,255,0.18)]" : "border-hair bg-s2 text-ink-dim",
          );
          if (isStatic)
            return (
              <div key={s.id} className={cls} style={style}>
                {body}
              </div>
            );
          return (
            <button
              key={s.id}
              type="button"
              data-stage={s.id}
              tabIndex={s.id === tabStop ? 0 : -1}
              aria-pressed={pinned === s.id}
              aria-describedby={`${uid}-center`}
              className={cn(cls, "cursor-pointer hover:text-ink")}
              style={style}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => {
                setKbd(s.id);
                setFocused(s.id);
              }}
              onBlur={() => setFocused((f) => (f === s.id ? null : f))}
              onClick={() => setPinned((p) => (p === s.id ? null : s.id))}
              onKeyDown={(e) => move(e, i)}
            >
              {body}
            </button>
          );
        })}

        {returnLabel ? (
          <p className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 font-mono text-[10px] text-blu @min-[400px]:text-[10.5px]">
            <svg width="22" height="6" aria-hidden="true">
              <line x1="1" y1="3" x2="21" y2="3" stroke="var(--blu)" strokeDasharray="4 3" />
            </svg>
            {returnLabel}
          </p>
        ) : null}

        <div
          id={`${uid}-center`}
          aria-live="polite"
          className="absolute left-1/2 flex w-[46%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
          style={{ top: `${(cy / V) * 100}%` }}
        >
          {active ? (
            <>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
                {String(stages.indexOf(active) + 1).padStart(2, "0")} · {active.label}
              </span>
              <span className="text-[12px] leading-snug text-ink @min-[400px]:text-[13px]">{active.note}</span>
              {active.status ? (
                <Badge tone={STATUS_TONE[active.status]} dot size="xs" mono>
                  {active.status}
                </Badge>
              ) : null}
            </>
          ) : (
            <span className="text-[13px] font-semibold leading-snug tracking-[-0.01em] text-ink @min-[400px]:text-[15px]">{tagline}</span>
          )}
        </div>
      </div>
    </figure>
  );
}
