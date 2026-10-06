// Bento grid: BentoGrid (3 columns, wide tiles span 2) and BentoTile (glass tile with title,
// copy and a bottom visualization), plus the tile visualizations from the landing bento,
// redrawn as inline SVG in neutral greys with green kept for success. Server-safe.
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RuntimeLogo, type LogoId } from "@/components/ui/runtime-logo";

/* ----------------------------------------------------------------------------- grid + tile */

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-[18px] md:grid-cols-3", className)}>{children}</div>;
}

export type BentoTileProps = {
  title: ReactNode;
  copy: ReactNode;
  /** Bottom visualization. */
  viz?: ReactNode;
  /** Spans two of the three columns from md up. */
  wide?: boolean;
  /** Viz sits flush on the bottom edge (charts) or centered with bottom padding (diagrams). */
  vizAlign?: "bottom" | "center";
  /** Minimum tile height from md up. */
  minHeight?: number;
  className?: string;
  style?: CSSProperties;
};

/** Glass tile: title, one or two lines of copy, a viz that fills the rest. Not a link. */
export function BentoTile({ title, copy, viz, wide = false, vizAlign = "center", minHeight = 420, className, style }: BentoTileProps) {
  return (
    <article
      className={cn("glass flex min-w-0 flex-col overflow-hidden px-[26px] pt-[27px] text-ink", wide && "md:col-span-2", className)}
      style={{ ...style, ["--tile-min" as string]: `${minHeight}px` }}
    >
      <div className="md:min-h-(--tile-min) flex flex-1 flex-col">
        <h4 className="text-[clamp(19px,2vw,24px)] font-semibold tracking-[-0.02em]">{title}</h4>
        <p className="mt-2 max-w-[52ch] text-[clamp(14px,1.3vw,16px)] leading-[1.45] text-white/55">{copy}</p>
        {viz ? (
          <div
            className={cn(
              "relative mt-[22px] flex flex-1",
              vizAlign === "bottom" ? "items-end" : "items-center justify-center pb-[26px]",
            )}
          >
            {viz}
          </div>
        ) : (
          <div className="pb-[26px]" />
        )}
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------- visualizations */

const GREY = "rgba(217,217,217,0.2)";

/** Stepped capacity bars with a green current bar: "Dynamic scaling". */
export function ScalingViz({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const w = 600;
  const h = 200;
  const gap = 8;
  const bw = (w - gap * (values.length - 1)) / values.length;
  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * (bw + gap) + bw / 2).toFixed(1)} ${(h - (v / max) * (h - 28) - 6).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full" role="img" aria-label="Capacity rising with demand, illustrative">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
      ))}
      {values.map((v, i) => {
        const bh = (v / max) * (h - 28);
        const last = i === values.length - 1;
        return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx="5" fill={last ? "var(--grn)" : GREY} opacity={last ? 0.9 : 1} />;
      })}
      <path d={line} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export type DeployStep = { label: string; state: "done" | "current" | "pending" };

/** Vertical pipeline of mono steps with dots on a rail: "Production-ready". */
export function DeployStepsViz({ steps }: { steps: DeployStep[] }) {
  return (
    <ol className="relative flex w-full flex-col gap-[9px]" aria-label="Deploy steps">
      <span aria-hidden="true" className="absolute bottom-5 left-[10.5px] top-5 w-[5px] bg-[#303030]" />
      {steps.map((s) => (
        <li key={s.label} className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className={cn(
              "relative z-[1] size-[26px] shrink-0 rounded-full",
              s.state === "done" && "bg-[#246136]",
              s.state === "current" && "bg-grn shadow-[0_0_0_4px_rgba(48,209,88,0.18)]",
              s.state === "pending" && "bg-[#636464]",
            )}
          />
          <span className="min-w-0 flex-1 truncate rounded-[6px] bg-[rgba(217,217,217,0.2)] px-4 py-2.5 font-mono text-[12.5px] text-white/70">
            {s.label}
            <span className="sr-only">{s.state === "done" ? ", done" : s.state === "current" ? ", in progress" : ", pending"}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Alternating message pills: "Context optimization". */
export function ContextViz({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="flex w-full flex-col justify-center gap-[14px]">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className={cn("h-[40px] w-[64%] rounded-[20px]", i % 2 === 0 ? "self-end bg-[rgba(217,217,217,0.2)]" : "self-start bg-[#d9d9d9]")} />
      ))}
    </div>
  );
}

/** Browser frame with a mini cost dashboard: "Unified cost observability". */
export function CostViz({ series, label = "quirq.ai", caption }: { series: number[]; label?: string; caption?: ReactNode }) {
  const max = Math.max(...series);
  const w = 560;
  const h = 150;
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => [i * step, h - (v / max) * (h - 16) - 4] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <div className="w-full rounded-t-[15px] bg-[rgba(217,217,217,0.2)] p-[9px] pb-0">
      <div aria-hidden="true" className="mx-auto mb-[9px] flex h-4 w-[45%] items-center justify-center rounded-[4px] bg-[rgba(178,178,178,0.35)] font-mono text-[9px] text-white/50">
        {label}
      </div>
      <div className="rounded-t-[12px] bg-[#0b0b0c] px-4 pt-3.5">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">
          <span>Cost per day</span>
          {caption ? <span>{caption}</span> : null}
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 block h-auto w-full" role="img" aria-label="Daily cost trend, mock data">
          <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="rgba(217,217,217,0.08)" />
          <path d={line} fill="none" stroke="rgba(217,217,217,0.75)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx={pts[pts.length - 1][0] - 2} cy={pts[pts.length - 1][1]} r="4" fill="var(--grn)" />
        </svg>
      </div>
    </div>
  );
}

/** Capability chips over a fan-out tree into runtime tiles: "Universal runtime". */
export function RuntimeViz({ chips, runtimes }: { chips: string[]; runtimes: LogoId[] }) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ul className="flex max-w-[300px] flex-wrap justify-center gap-2" aria-label="Capabilities">
        {chips.map((c) => (
          <li key={c} className="rounded-[6px] bg-[#565656] px-2.5 py-1 font-mono text-[12px] font-bold text-white/80">
            {c}
          </li>
        ))}
      </ul>
      <svg viewBox="0 0 200 52" className="w-[200px]" aria-hidden="true">
        <path d="M100 0 V18 M30 52 V30 H170 V52 M100 18 V52" fill="none" stroke="rgba(217,217,217,0.35)" strokeWidth="2" />
      </svg>
      <ul className="-mt-2 flex gap-2.5" aria-label="Runtimes">
        {runtimes.map((r) => (
          <li key={r} className="grid size-[76px] place-items-center rounded-[8px] bg-[rgba(217,217,217,0.2)]">
            <RuntimeLogo id={r} size={30} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Radar of compliance areas: "Security compliances". */
export function RadarViz({ axes, values }: { axes: string[]; values: number[] }) {
  const cx = 130;
  const cy = 118;
  const r = 92;
  const n = axes.length;
  const pt = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f] as const;
  };
  const ring = (f: number) => axes.map((_, i) => pt(i, f).map((v) => v.toFixed(1)).join(",")).join(" ");
  const shape = values.map((v, i) => pt(i, v).map((x) => x.toFixed(1)).join(",")).join(" ");
  return (
    <svg viewBox="-16 0 292 240" className="w-full max-w-[290px]" role="img" aria-label={`Coverage across ${axes.join(", ")}, illustrative`}>
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(217,217,217,0.18)" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(217,217,217,0.12)" />;
      })}
      <polygon points={shape} fill="rgba(48,209,88,0.16)" stroke="var(--grn)" strokeWidth="1.6" />
      {axes.map((a, i) => {
        const [x, y] = pt(i, 1.17);
        return (
          <text key={a} x={x} y={y + 3} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="rgba(255,255,255,0.6)">
            {a}
          </text>
        );
      })}
    </svg>
  );
}

/** Ramp of grey bars under a headline delta: "Efficiency charts". */
export function EfficiencyViz({
  delta,
  window,
  bars,
  note,
  label = "Cost efficiency",
}: {
  delta: string;
  /** Measurement window, stacked at the right of the delta ("Past 30 days"). */
  window: string;
  bars: number[];
  /** Provenance line such as "Illustrative". */
  note?: string;
  label?: string;
}) {
  return (
    <div className="w-full rounded-t-[20px] bg-[rgba(217,217,217,0.2)] p-[22px] pb-0">
      <div className="font-mono text-[15px] font-bold uppercase tracking-wide text-white/55">{label}</div>
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[30px] font-bold text-grn">{delta}</span>
        <span className="mt-1 max-w-[8ch] text-right font-mono text-[11px] font-bold uppercase leading-[1.15] text-white/50">{window}</span>
      </div>
      {note ? <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">{note}</p> : null}
      <div aria-hidden="true" className="mt-4 flex h-[120px] items-end gap-[9px]">
        {bars.map((b, i) => (
          <span key={i} className="flex-1 rounded-t-[6px]" style={{ height: `${b}%`, background: `hsl(0 0% ${40 + (i / (bars.length - 1)) * 45}%)` }} />
        ))}
      </div>
    </div>
  );
}
