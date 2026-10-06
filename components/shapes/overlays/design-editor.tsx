// DesignEditorPanel: telescope's design editor dialog. A live preview of the galileo bar
// on the left, the design controls on the right (accent, position, parts), a save status
// and a reset. Stacks to one column when narrow. Controlled and hook-free.
import type { CSSProperties, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Spinner } from "@/components/ui/loaders";

export type DesignAccent = "lime" | "grn" | "cyn" | "blu" | "pur" | "org" | "yel" | "red";
export type BarPosition = "top" | "bottom";

export const DESIGN_ACCENTS: { id: DesignAccent; label: string; color: string }[] = [
  { id: "lime", label: "XO lime", color: "#83d63a" },
  { id: "grn", label: "Green", color: "var(--grn)" },
  { id: "cyn", label: "Cyan", color: "var(--cyn)" },
  { id: "blu", label: "Blue", color: "var(--blu)" },
  { id: "pur", label: "Purple", color: "var(--pur)" },
  { id: "org", label: "Orange", color: "var(--org)" },
  { id: "yel", label: "Yellow", color: "var(--yel)" },
  { id: "red", label: "Red", color: "var(--red)" },
];

const accentColor = (id: DesignAccent) => DESIGN_ACCENTS.find((a) => a.id === id)?.color ?? "#83d63a";

export type DesignPart = { id: "sources" | "status" | "search"; label: string; on: boolean };

export type DesignEditorPanelProps = {
  /** App whose design this is, or null for the default design. */
  app: string | null;
  /** Saved file, such as .gateway/toolbars/acme.json. */
  file: string;
  /** Where the design comes from, in a sentence. */
  describe: ReactNode;
  accent: DesignAccent;
  onAccentChange?: (accent: DesignAccent) => void;
  position: BarPosition;
  onPositionChange?: (position: BarPosition) => void;
  parts: DesignPart[];
  onPartToggle?: (id: DesignPart["id"]) => void;
  /** Sources shown in the preview bar. */
  sources: { name: string; up: boolean }[];
  /** Status line: "Saving…", "Saved. acme has its own design." */
  status: ReactNode;
  saving?: boolean;
  resetLabel: string;
  canReset?: boolean;
  onReset?: () => void;
  onDone?: () => void;
  onClose?: () => void;
  titleId?: string;
  titleAs?: "h2" | "h3";
  idPrefix: string;
  className?: string;
};

/** Two-pane design editor: preview stage beside the controls. */
export function DesignEditorPanel({
  app,
  file,
  describe,
  accent,
  onAccentChange,
  position,
  onPositionChange,
  parts,
  onPartToggle,
  sources,
  status,
  saving = false,
  resetLabel,
  canReset = true,
  onReset,
  onDone,
  onClose,
  titleId,
  titleAs: Title = "h2",
  idPrefix,
  className,
}: DesignEditorPanelProps) {
  const name = app ?? "any app";
  return (
    <div
      className={cn(
        "@container relative w-[min(1040px,100%)] min-w-0 max-w-full overflow-hidden rounded-[16px] border border-hair-strong bg-[#0f0f11] text-ink",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="grid max-h-[min(780px,calc(100dvh-32px))] grid-cols-1 overflow-y-auto scroll-thin @[720px]:grid-cols-[minmax(0,1fr)_320px] @[720px]:overflow-hidden">
        <div className="flex min-w-0 flex-col gap-3 border-b border-hair-soft p-4 @[720px]:border-b-0 @[720px]:border-r sm:p-5">
          {/* room for the close button while the preview sits on top (one column) */}
          <div className="flex items-center gap-2 pr-8 @[720px]:pr-0">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">Preview</span>
            <span className="h-px flex-1 bg-hair-soft" aria-hidden="true" />
          </div>
          <BarPreview app={name} accent={accent} position={position} parts={parts} sources={sources} />
          <p className="text-[12px] leading-relaxed text-ink-faint">
            {app
              ? `How ${app} shows telescope with this design. Changes save as you make them.`
              : "How every app without its own design shows telescope. Changes save as you make them."}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-4 sm:p-5">
          <div className="pr-8">
            <Title id={titleId} className="text-[16px] font-semibold tracking-[-0.01em]">
              {app ? `${app}'s telescope` : "Default telescope"}
            </Title>
            <p className="mt-0.5 truncate font-mono text-[11.5px] text-ink-faint">{file}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-dim">{describe}</p>
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">Accent</legend>
            <div className="flex flex-wrap gap-2">
              {DESIGN_ACCENTS.map((a) => (
                <label key={a.id} className="relative cursor-pointer" title={a.label}>
                  <input
                    type="radio"
                    name={`${idPrefix}-accent`}
                    value={a.id}
                    checked={accent === a.id}
                    onChange={() => onAccentChange?.(a.id)}
                    className="peer sr-only"
                  />
                  <span className="sr-only">{a.label}</span>
                  <span
                    aria-hidden="true"
                    className="block size-7 rounded-full border border-black/40 ring-offset-2 ring-offset-[#0f0f11] transition-shadow peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink"
                    style={{ background: a.color } as CSSProperties}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <span id={`${idPrefix}-pos`} className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
              Position
            </span>
            <Segmented<BarPosition>
              aria-label="Bar position"
              size="sm"
              value={position}
              onChange={onPositionChange}
              options={[
                { value: "top", label: "Top" },
                { value: "bottom", label: "Bottom" },
              ]}
            />
          </div>

          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">Show in the bar</legend>
            {parts.map((p) => (
              <Checkbox key={p.id} label={p.label} checked={p.on} onChange={() => onPartToggle?.(p.id)} />
            ))}
          </fieldset>

          <div className="mt-auto flex flex-col gap-3 border-t border-hair-soft pt-4">
            <p role="status" className="flex min-h-5 items-center gap-2 text-[12px] text-ink-dim">
              {saving ? <Spinner size="xs" label={null} /> : <span aria-hidden="true" className="size-1.5 rounded-full bg-grn" />}
              {status}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="subtle" size="sm" onClick={onReset} disabled={!canReset}>
                {resetLabel}
              </Button>
              <Button variant="primary" size="sm" onClick={onDone}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
      {onClose ? (
        <IconButton aria-label="Close design editor" size="sm" onClick={onClose} className="absolute right-3 top-3">
          <X />
        </IconButton>
      ) : null}
    </div>
  );
}

/** Mini browser window with the telescope bar pinned top or bottom. */
export function BarPreview({
  app,
  accent,
  position,
  parts,
  sources,
}: {
  app: string;
  accent: DesignAccent;
  position: BarPosition;
  parts: DesignPart[];
  sources: { name: string; up: boolean }[];
}) {
  const color = accentColor(accent);
  const on = (id: DesignPart["id"]) => parts.some((p) => p.id === id && p.on);
  const upCount = sources.filter((s) => s.up).length;
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-[12px] border border-hair bg-s1">
      <div className="flex h-7 items-center gap-1.5 border-b border-hair-soft px-2.5">
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="ml-2 truncate rounded-full bg-white/[0.05] px-2.5 py-0.5 font-mono text-[10px] text-ink-faint">
          http://{app === "any app" ? "app" : app}.localhost:4100/
        </span>
      </div>
      <div className="relative flex h-[230px] flex-col gap-2.5 px-4 py-14">
        <span className="h-3 w-2/5 rounded-full bg-white/[0.08]" />
        <span className="h-2 w-4/5 rounded-full bg-white/[0.05]" />
        <span className="h-2 w-3/5 rounded-full bg-white/[0.05]" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <span className="h-12 rounded-[8px] bg-white/[0.04]" />
          <span className="h-12 rounded-[8px] bg-white/[0.04]" />
          <span className="h-12 rounded-[8px] bg-white/[0.04]" />
        </div>
        <div
          className={cn(
            "absolute inset-x-2 mx-auto flex w-fit max-w-full items-center gap-1 overflow-hidden rounded-full border border-white/12 bg-[rgba(18,18,20,0.94)] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-[top,bottom] duration-300",
            position === "top" ? "top-2.5" : "bottom-2.5",
          )}
        >
          <span
            className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold text-black"
            style={{ background: color }}
          >
            {app}
          </span>
          {on("sources")
            ? sources.map((s) => (
                <span key={s.name} className="inline-flex h-6 min-w-0 shrink items-center gap-1.5 rounded-full px-2 text-[11px] text-ink-dim">
                  <span className={cn("size-1.5 shrink-0 rounded-full", s.up ? "bg-grn" : "bg-red")} />
                  {/* sources give way first so the status and search stay visible in a narrow bar */}
                  <span className="min-w-0 truncate">{s.name}</span>
                </span>
              ))
            : null}
          {on("status") ? (
            <span className="inline-flex h-6 shrink-0 items-center rounded-full border-l border-hair px-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
              {upCount}/{sources.length} up
            </span>
          ) : null}
          {on("search") ? (
            <span className="inline-grid size-6 shrink-0 place-items-center rounded-full text-ink-dim" style={{ color }}>
              <Search className="size-3.5" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
