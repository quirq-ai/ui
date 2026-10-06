// HUD instrument panels for the space-drift visualizer: HudPanel (glass instrument shell),
// MissionPanel (expedition counter, ring and progress), DemoMissionHud (objectives with
// playing, celebrating and complete phases), WorldSignaturePanel, FileSignalPanel,
// HudNote (tour note and activity line) and CourseChip. Server-safe; keys and state live
// in the parent.
import type { ReactNode } from "react";
import { Activity, Check, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/ui/kbd";

const EYEBROW = "font-mono text-[9px] uppercase tracking-[0.18em] text-white/50";

/** Glass instrument shell: hairline, deep glass fill, 18px blur. */
export function HudPanel({ children, className, label, as: Tag = "section" }: { children: ReactNode; className?: string; label?: string; as?: "section" | "aside" | "div" }) {
  return (
    <Tag
      aria-label={label}
      className={cn(
        "min-w-0 rounded-[10px] border border-white/[0.12] bg-[rgba(14,17,26,0.74)] text-ink shadow-[0_10px_36px_rgba(3,5,16,0.35)] backdrop-blur-[18px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- MissionPanel */

export type MissionPanelProps = {
  expedition: string;
  headline: string;
  body: ReactNode;
  charted: number;
  chartedTotal: number;
  landed: number;
  landedTotal: number;
  className?: string;
};

/** Expedition progress: charted counter with a ring, a track and landed bodies. Progress counts atoms and bodies together, as space-drift does. */
export function MissionPanel({ expedition, headline, body, charted, chartedTotal, landed, landedTotal, className }: MissionPanelProps) {
  const total = chartedTotal + landedTotal;
  const progress = total ? (Math.min(charted, chartedTotal) + Math.min(landed, landedTotal)) / total : 0;
  const pct = Math.round(progress * 100);
  const complete = charted >= chartedTotal && landed >= landedTotal;
  const circ = 2 * Math.PI * 13;
  return (
    <HudPanel label="Expedition progress" className={cn("w-full p-[19px] sm:max-w-[254px]", className)}>
      <p className={cn(EYEBROW, "flex items-center justify-between gap-3")}>
        <span>Expedition {expedition}</span>
        <span className={cn("text-[8px]", complete ? "text-grn" : "text-cyn")}>{complete ? "Complete" : "In progress"}</span>
      </p>
      <h4 className="mb-2.5 mt-5 text-[23px] font-normal tracking-[-0.03em]">{headline}</h4>
      <div className="text-[11.5px] leading-[1.7] text-white/65">{body}</div>
      <div className="my-5 flex items-center gap-2.5">
        <strong className="font-mono text-[33px] font-normal tabular-nums leading-none">{String(charted).padStart(2, "0")}</strong>
        <span className="text-[10px] text-white/50">
          / {String(chartedTotal).padStart(2, "0")} atoms charted
        </span>
        <svg viewBox="0 0 32 32" className="ml-auto w-[31px] -rotate-90" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#2a3040" strokeWidth="2" />
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke={complete ? "var(--grn)" : "var(--cyn)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-500 ease-quirq"
          />
        </svg>
      </div>
      <div
        role="progressbar"
        aria-label="Expedition progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-[3px] overflow-hidden rounded-full bg-white/10"
      >
        <i className={cn("block h-full rounded-full transition-[width] duration-500 ease-quirq", complete ? "bg-grn" : "bg-cyn")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2.5 flex justify-between font-mono text-[9.5px] text-white/50">
        <span>
          <b className="font-normal text-ink">{landed}</b> / {landedTotal} bodies landed
        </span>
        <span className="tabular-nums">{pct}%</span>
      </p>
    </HudPanel>
  );
}

/* ----------------------------------------------------------------------------- DemoMissionHud */

export type DemoPhase = "playing" | "celebrating" | "complete";

export type DemoMissionHudProps = {
  objectives: string[];
  /** Index of the current objective. */
  current: number;
  phase: DemoPhase;
  /** Line under the list, such as a meaning example. */
  meaning?: string;
  score?: string;
  /** Controls row: keycap buttons that the tutorial spotlights. */
  controls?: ReactNode;
  className?: string;
};

/** Sample mission HUD: objectives tick off; a 0.9 s celebration, then a cyan score when complete. */
export function DemoMissionHud({ objectives, current, phase, meaning, score, controls, className }: DemoMissionHudProps) {
  return (
    <section
      aria-label="Sample mission"
      className={cn(
        "w-full min-w-0 rounded-[11px] border p-[17px] text-ink transition-[border-color,background] duration-500 sm:max-w-[284px]",
        phase === "celebrating"
          ? "border-cyn/70 bg-[linear-gradient(155deg,rgba(18,72,78,0.95),rgba(8,24,30,0.98))]"
          : "border-[#3a4150] bg-[linear-gradient(155deg,rgba(26,30,40,0.98),rgba(12,14,20,0.98))]",
        className,
      )}
    >
      <p className={EYEBROW}>Sample mission</p>
      <h4 className="mt-2 text-[21px] font-medium tracking-[-0.02em]">{phase === "complete" ? "Mission complete." : "Learn to fly."}</h4>
      <ol className="mt-3 flex flex-col gap-1.5" aria-live="polite">
        {objectives.map((o, i) => {
          const done = i < current || phase === "complete";
          const now = i === current && phase !== "complete";
          return (
            <li key={o} className={cn("flex items-start gap-2 text-[12px] leading-[1.4]", done ? "text-white/45" : now ? "text-ink" : "text-white/35")}>
              <span aria-hidden="true" className={cn("mt-[3px] grid size-3 shrink-0 place-items-center rounded-full border", done ? "border-cyn bg-cyn text-black" : now ? "border-cyn" : "border-white/25")}>
                {done ? <Check strokeWidth={4} className="size-2" /> : null}
              </span>
              <span className={done ? "line-through decoration-white/25" : undefined}>
                {o}
                {done ? <span className="sr-only"> (done)</span> : now ? <span className="sr-only"> (current)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      {meaning ? <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-[1.55] text-white/55">{meaning}</p> : null}
      {phase === "complete" && score ? <p className="mt-3 font-mono text-[13px] leading-[1.5] text-cyn">{score}</p> : null}
      {controls ? <div className="mt-3.5 flex flex-wrap gap-2">{controls}</div> : null}
    </section>
  );
}

/** Tall keycap button for HUD controls (46px, 2px bottom border). */
export function HudKeyButton({ label, keyName, onClick, spotlight = false, disabled = false }: { label: string; keyName: string; onClick?: () => void; spotlight?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-keyshortcuts={keyName}
      className={cn(
        "flex h-[46px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[6px]! border border-b-2 px-3 text-[12px] transition-colors disabled:opacity-40",
        spotlight ? "border-cyn/70 border-b-cyn bg-cyn/10 text-ink shadow-[0_0_0_3px_rgba(47,210,255,0.15)]" : "border-white/15 border-b-white/30 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]",
      )}
    >
      {label}
      <Kbd size="xs" subtle>
        {keyName}
      </Kbd>
    </button>
  );
}

/* ----------------------------------------------------------------------------- WorldSignaturePanel */

export type WorldSignaturePanelProps = {
  /** null before a folder is connected: "Your next destination". */
  name: string | null;
  stats: { label: string; value: string | null }[];
  physics: boolean;
  onPhysicsChange?: (on: boolean) => void;
  note: string;
  className?: string;
};

/** World signature: bodies, emitting and total mass; legend and a Physics toggle. */
export function WorldSignaturePanel({ name, stats, physics, onPhysicsChange, note, className }: WorldSignaturePanelProps) {
  return (
    <HudPanel as="aside" label="World signature" className={cn("p-4", className)}>
      <p className={cn(EYEBROW, "flex items-center gap-2")}>
        World signature <ExternalLink aria-hidden="true" className="size-2.5" />
      </p>
      <h4 className={cn("mb-3.5 mt-3 text-[19px] font-normal", name ? "text-ink" : "text-white/55")}>{name ?? "Your next destination"}</h4>
      {stats.some((s) => s.value === null) ? (
        <dl className="flex flex-col">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 items-baseline justify-between gap-3 border-b border-white/[0.06] py-1.5 last:border-b-0">
              <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/45">{s.label}</dt>
              <dd className={cn("font-mono tabular-nums", s.value === null ? "text-[10px] text-white/45" : "text-[13px] text-ink")}>{s.value ?? "Unavailable"}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col-reverse">
              <dt className="mt-0.5 font-mono text-[8px] uppercase leading-tight tracking-[0.12em] text-white/45">{s.label}</dt>
              <dd className="truncate font-mono text-[17px] tabular-nums text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="my-3 flex flex-wrap gap-3 font-mono text-[9px] text-white/55">
        <span className="flex items-center gap-1.5">
          <i aria-hidden="true" className="size-1.5 rounded-full bg-cyn" />
          Excitation / light
        </span>
        <span className="flex items-center gap-1.5">
          <i aria-hidden="true" className="size-1.5 rounded-full bg-pur" />
          Mass / curvature
        </span>
      </p>
      <button
        type="button"
        aria-pressed={physics}
        onClick={() => onPhysicsChange?.(!physics)}
        className="flex items-center gap-2 rounded-[6px]! text-[11px] text-white/75 hover:text-ink"
      >
        <span aria-hidden="true" className={cn("inline-flex h-3.5 w-6 shrink-0 items-center rounded-full p-0.5 transition-colors", physics ? "bg-cyn/70" : "bg-white/15")}>
          <i className={cn("block size-2.5 rounded-full bg-white transition-transform", physics ? "translate-x-2.5" : "translate-x-0")} />
        </span>
        Physics <span className="font-mono text-[10px]">{physics ? "On" : "Off"}</span>
      </button>
      <p className="mt-3 text-[10.5px] leading-[1.55] text-white/55">{note}</p>
    </HudPanel>
  );
}

/* ----------------------------------------------------------------------------- FileSignalPanel */

export type FileSignalPanelProps = {
  status: string;
  distance: string;
  name: string;
  path: string;
  chips: string[];
  buttonLabel: string;
  disabled?: boolean;
  onOpen?: () => void;
  /** Flash the border when the signal is hit. */
  hit?: boolean;
  className?: string;
};

/** The nearest file signal: status, distance, name, path, chips and the open action. */
export function FileSignalPanel({ status, distance, name, path, chips, buttonLabel, disabled = false, onOpen, hit = false, className }: FileSignalPanelProps) {
  return (
    <HudPanel as="aside" label="File signal" className={cn("p-4 transition-[border-color] duration-300", hit && "border-cyn/70", className)}>
      <p className={cn(EYEBROW, "flex items-center justify-between gap-3")} role="status">
        <span className={hit ? "text-cyn" : undefined}>{status}</span>
        <span className="tabular-nums">{distance}</span>
      </p>
      <h4 className="mt-3 truncate text-[16px] font-normal">{name}</h4>
      <p className="truncate font-mono text-[9.5px] text-white/50">{path}</p>
      <p className="mt-2.5 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span key={c} className="rounded-[4px] bg-white/[0.07] px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-white/65">
            {c}
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        aria-keyshortcuts="E"
        className="mt-3.5 flex h-9 w-full items-center justify-center gap-2 rounded-[6px]! border border-b-2 border-cyn/45 border-b-cyn/80 bg-cyn/10 text-[12px] text-ink transition-colors hover:bg-cyn/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {buttonLabel}
        <Kbd size="xs" subtle>
          E
        </Kbd>
      </button>
    </HudPanel>
  );
}

/* ----------------------------------------------------------------------------- notes and course chip */

/** Tour note (panel) or activity line (glyph, no panel). */
export function HudNote({ kind, kicker, children, className }: { kind: "tour" | "activity"; kicker: string; children: ReactNode; className?: string }) {
  if (kind === "activity") {
    return (
      <div className={cn("flex items-start gap-2.5 text-ink", className)}>
        <Activity aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cyn" />
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/50">{kicker}</p>
          <p className="mt-0.5 text-[10.5px] text-white/70">{children}</p>
        </div>
      </div>
    );
  }
  return (
    <HudPanel className={cn("w-full p-4 sm:max-w-[260px]", className)}>
      <p className={EYEBROW}>{kicker}</p>
      <p className="mt-2 text-[12px] leading-[1.55] text-white/75">{children}</p>
    </HudPanel>
  );
}

/** Route chip: destination and distance with a cancel button. */
export function CourseChip({ destination, distance, onCancel, className }: { destination: string; distance: string; onCancel?: () => void; className?: string }) {
  return (
    <HudPanel as="div" className={cn("grid w-full max-w-[260px] grid-cols-[1fr_auto] items-center gap-x-3 px-3.5 py-2.5", className)}>
      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/50">Course set</span>
      <button type="button" onClick={onCancel} aria-label="Cancel course" className="row-span-3 grid size-[26px] place-items-center rounded-full! border border-white/20 text-white/70 hover:border-white/40 hover:text-ink">
        <X aria-hidden="true" className="size-3.5" />
      </button>
      <strong className="truncate text-[13px] font-medium">{destination}</strong>
      <span className="font-mono text-[9.5px] tabular-nums text-white/55">{distance}</span>
    </HudPanel>
  );
}
