"use client";

// Live demo for icon buttons: the six named variants, sizes 24 to 40 in both shapes, the
// hover, pressed, focus and disabled states, and four product contexts (galileo's telescope
// bar, a project row, a closable panel and a phone app frame) where every control works.
// Toggles keep one name ("Pin xo-space") and report state through aria-pressed only.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Star, Trash2, TriangleAlert, X } from "lucide-react";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { StatusDot } from "@/components/ui/status";
import { GALILEO, GALILEO_SOURCES, PROJECT_BY_ID, SPACE_BY_ID, TODOS } from "@/lib/fixtures";
import { formatMonth } from "@/lib/format";
import { cn } from "@/lib/cn";
import { IconAction, IconActionLink, OpenExternalGlyph, ReloadGlyph, type IconActionSize } from "./icon-action";
import { useCopyAction } from "./copy-actions";
import { Caption, DemoSection, DemoStack, Specimen, Stage, Still } from "./demo-kit";

const SIZE_PX: Record<IconActionSize, number> = { xs: 24, sm: 28, md: 32, lg: 40 };
const SIZES = ["xs", "sm", "md", "lg"] as const;

/** After a user toggles a view, moves focus to the [data-focus-next] control inside box. */
function useFocusHandoff<T>(value: T) {
  const box = useRef<HTMLDivElement>(null);
  const armed = useRef(false);
  useEffect(() => {
    if (!armed.current) return;
    armed.current = false;
    box.current?.querySelector<HTMLElement>("[data-focus-next]")?.focus();
  }, [value]);
  return {
    box,
    arm: () => {
      armed.current = true;
    },
  };
}

/** Clears its timers on unmount. */
function useTimers() {
  const ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = ids.current;
    return () => list.forEach(clearTimeout);
  }, []);
  return (fn: () => void, ms: number) => {
    ids.current.push(setTimeout(fn, ms));
  };
}

export function IconButtonDemo() {
  const [pinned, setPinned] = useState(true);
  return (
    <DemoStack>
      <DemoSection title="Variants · hover or focus for the tooltip" cols={3}>
        <Specimen label="Pin · aria-pressed fills">
          <IconAction
            label="Pin xo-space"
            icon={<Star />}
            pressed={pinned}
            pressedTone="yel"
            onClick={() => setPinned((p) => !p)}
          />
          <span className="text-[12px] text-ink-faint">{pinned ? "Pinned" : "Not pinned"}</span>
        </Specimen>
        <Specimen label="Reload · galileo glyph">
          <ReloadSample />
        </Specimen>
        <Specimen label="Open external · new tab">
          <IconActionLink label="Open this source in a tab of its own" icon={<OpenExternalGlyph />} href={GALILEO_SOURCES[0].url} external />
          <span className="font-mono text-[11.5px] text-ink-faint">{GALILEO_SOURCES[0].url}</span>
        </Specimen>
        <Specimen label="Trash · red on hover">
          <IconAction label="Remove xo-space from this space" icon={<Trash2 />} variant="danger" />
        </Specimen>
        <Specimen label="Close · 28px circle">
          <IconAction label="Close panel" icon={<X />} variant="outline" shape="circle" size="sm" />
        </Specimen>
        <Specimen label="Glass back · over media">
          <div className="relative flex h-[72px] w-full max-w-[220px] items-center overflow-hidden rounded-[14px] border border-hair-soft px-3">
            <MediaArt />
            <IconAction label="Back" icon={<ChevronLeft />} variant="glass" shape="circle" size="md" tip="bottom" tipAlign="start" className="relative" />
          </div>
        </Specimen>
      </DemoSection>

      <DemoSection title="In context" cols={2}>
        <Specimen label="galileo · telescope bar" className="sm:col-span-2" layout="block">
          <TelescopeBar />
        </Specimen>
        <Specimen label="Project row · pin, copy GitHub URL, edit, remove" layout="block">
          <ProjectRow />
        </Specimen>
        <Specimen label="Panel · close circle and calendar chevrons" layout="block">
          <ClosablePanel />
        </Specimen>
        <Specimen label="Phone app frame · glass back" className="sm:col-span-2" layout="block">
          <PhoneFrame />
        </Specimen>
      </DemoSection>

      <DemoSection title="Sizes · 24 · 28 · 32 · 40" cols={2}>
        <Specimen label="Square · outline and ghost">
          {SIZES.map((s) => (
            <IconAction key={s} label={`Reload, ${SIZE_PX[s]}px`} icon={<ReloadGlyph />} size={s} variant="outline" />
          ))}
          {SIZES.map((s) => (
            <IconAction key={`g${s}`} label={`Edit, ${SIZE_PX[s]}px`} icon={<Pencil />} size={s} />
          ))}
        </Specimen>
        <Specimen label="Circle · solid and glass">
          {SIZES.map((s) => (
            <IconAction key={s} label={`Close, ${SIZE_PX[s]}px`} icon={<X />} size={s} variant="solid" shape="circle" />
          ))}
          {SIZES.map((s) => (
            <IconAction key={`g${s}`} label={`Back, ${SIZE_PX[s]}px`} icon={<ChevronLeft />} size={s} variant="glass" shape="circle" />
          ))}
        </Specimen>
      </DemoSection>

      <DemoSection title="States" cols={5}>
        <Specimen label="Default">
          <IconAction label="Reload this source" icon={<ReloadGlyph />} />
          <IconAction label="Remove" icon={<Trash2 />} variant="danger" />
        </Specimen>
        <Specimen label="Hover · bg s3, ink">
          <Still>
            <IconAction label="Reload this source" icon={<ReloadGlyph />} preview="hover" tip={false} />
            <IconAction label="Remove" icon={<Trash2 />} variant="danger" preview="hover" tip={false} />
          </Still>
        </Specimen>
        <Specimen label="Pressed · glyph fills">
          <Still>
            <IconAction label="Pin xo-space" icon={<Star />} pressed pressedTone="yel" tip={false} />
            <IconAction label="Pin xo-space" icon={<Star />} pressed tip={false} />
          </Still>
        </Specimen>
        <Specimen label="Focus · ring and tooltip">
          <Still>
            <span className="relative mt-8 inline-flex">
              <IconAction label="Reload this source" icon={<ReloadGlyph />} variant="outline" preview="focus" tip={false} />
              <TipBubble>Reload this source</TipBubble>
            </span>
          </Still>
        </Specimen>
        <Specimen label="Disabled · .35">
          <IconAction label="Reload this source" icon={<ReloadGlyph />} disabled />
          <IconActionLink label="Open this source in a tab of its own" icon={<OpenExternalGlyph />} disabled />
        </Specimen>
      </DemoSection>
    </DemoStack>
  );
}

/* ----------------------------------------------------------------------------- pieces */

/** The tooltip bubble drawn statically, as it shows on hover or focus. */
function TipBubble({ children }: { children: ReactNode }) {
  return (
    <span className="absolute bottom-full left-0 mb-2 w-max max-w-[200px] rounded-[6px] border border-hair-strong bg-s3 px-2 py-1 text-[11.5px] leading-snug text-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      {children}
    </span>
  );
}

function MediaArt() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 220 72" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ib-art" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2e9bff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#bf5af2" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff9f0a" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="220" height="72" fill="#0b0b0d" />
      <rect width="220" height="72" fill="url(#ib-art)" />
      <circle cx="170" cy="20" r="34" fill="#2fd2ff" opacity="0.18" />
      <path d="M0 58 C 50 40, 90 70, 140 48 S 210 40, 220 46 L220 72 L0 72Z" fill="#000" opacity="0.35" />
    </svg>
  );
}

function ReloadSample() {
  const later = useTimers();
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <>
      <IconAction
        label="Reload this source"
        icon={<ReloadGlyph className={cn(busy && "spin")} />}
        aria-busy={busy || undefined}
        onClick={() => {
          if (busy) return;
          setBusy(true);
          later(() => {
            setBusy(false);
            setCount((c) => c + 1);
          }, 900);
        }}
      />
      <span className="text-[12px] text-ink-faint" aria-live="polite">
        {busy ? "Reloading…" : count ? `Reloaded ${count}×` : "Not reloaded yet"}
      </span>
    </>
  );
}

/** galileo's tab icon: the XO mark on galileo's ground (galileo/telescope/icon.svg). */
function XoTabMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 500 500" className="size-[22px] shrink-0 rounded-[6px]">
      <rect width="500" height="500" rx="112" fill="#0e110c" />
      <g fill="none" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
        <polyline stroke="#eef2ea" points="56 170 128 248 50 326" />
        <polyline stroke="#eef2ea" points="238 170 166 248 244 326" />
        <polyline stroke="#83d63a" points="322 170 250 248 328 326" />
        <polyline stroke="#83d63a" points="372 170 444 248 366 326" />
      </g>
    </svg>
  );
}

/** galileo's bar: switcher, path, reload, open in a tab of its own, Sources. */
function TelescopeBar() {
  const later = useTimers();
  const ports = GALILEO_SOURCES.filter((s) => s.type === "port");
  const [index, setIndex] = useState<number | null>(0);
  const [reloading, setReloading] = useState(false);
  const [checked, setChecked] = useState<string | null>(null);
  const source = index === null ? null : ports[index];

  return (
    <div className="overflow-hidden rounded-[14px] border border-hair bg-[#0c0e0b]">
      <div className="flex min-w-0 items-center gap-2 border-b border-hair-soft px-2.5 py-2">
        <span className="hidden items-center gap-2 pr-1 text-[13.5px] font-bold tracking-[-0.02em] text-[#83d63a] sm:inline-flex">
          <XoTabMark />
          {GALILEO.name}
        </span>
        <button
          type="button"
          onClick={() => {
            setChecked(null);
            setIndex((i) => (i === null ? 0 : (i + 1) % ports.length));
          }}
          className="inline-flex h-8 min-w-0 shrink items-center gap-2 rounded-[8px]! border border-hair px-2.5 text-[13px] text-ink transition-colors hover:border-hair-strong hover:bg-s2"
          aria-label={`Source: ${source ? source.name : "Sources"}. Switch source`}
        >
          {source ? <StatusDot status={source.up ? "up" : "down"} size="sm" /> : null}
          <span className="truncate">{source ? source.name : "Sources"}</span>
          <ChevronRight aria-hidden="true" className="size-3.5 rotate-90 text-ink-faint" />
        </button>
        <span
          aria-hidden="true"
          className={cn(
            "hidden h-8 min-w-0 flex-1 items-center rounded-[8px] border border-hair-soft bg-[#10140d] px-2.5 font-mono text-[12.5px] md:flex",
            source ? "text-ink" : "text-ink-faint opacity-60",
          )}
        >
          <span className="truncate">/</span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-0.5">
          <IconAction
            label="Reload this source"
            icon={<ReloadGlyph className={cn(reloading && "spin")} />}
            disabled={!source}
            aria-busy={reloading || undefined}
            onClick={() => {
              if (reloading) return;
              setReloading(true);
              later(() => {
                setReloading(false);
                setChecked("just now");
              }, 900);
            }}
          />
          <IconActionLink
            label="Open this source in a tab of its own"
            icon={<OpenExternalGlyph />}
            href={source?.url}
            external
            disabled={!source || !source.up}
            tipAlign="end"
          />
          <button
            type="button"
            onClick={() => setIndex(null)}
            aria-pressed={index === null}
            className={cn(
              "ml-1 h-[30px] rounded-full! border px-3 text-[13px] transition-colors",
              index === null ? "border-[#83d63a] text-[#83d63a]" : "border-[#83d63a]/25 text-ink hover:border-[#83d63a] hover:text-[#83d63a]",
            )}
          >
            Sources
          </button>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-3 text-[12.5px]" aria-live="polite">
        {source ? (
          <>
            <span className="text-ink">{source.name}</span>
            <span className="font-mono text-[11.5px] text-ink-faint">:{source.port}</span>
            <span className={source.up ? "text-ink-dim" : "text-[#ff7a70]"}>{source.detail}</span>
            <span className="text-ink-faint">· checked {checked ?? source.checkedAgo}</span>
          </>
        ) : (
          <span className="text-ink-faint">On the Sources page there is nothing to reload or open, so both icons are disabled.</span>
        )}
      </div>
    </div>
  );
}

function ProjectRow() {
  const project = PROJECT_BY_ID["xo-space"];
  const [pinned, setPinned] = useState(project.pinned);
  const [removed, setRemoved] = useState(false);
  const { status: copied, copy } = useCopyAction(project.github?.url ?? "");

  if (removed) {
    return (
      <Stage className="flex min-h-[74px] flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-dim" role="status">
          Removed <span className="text-ink">{project.displayName}</span> from this space.
        </p>
        <button type="button" onClick={() => setRemoved(false)} className="rounded-[6px] text-[13px] text-ink underline-offset-4 hover:underline">
          Undo
        </button>
      </Stage>
    );
  }

  return (
    <Stage className="flex min-h-[74px] items-center gap-3">
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[9px] border border-hair bg-s3 font-mono text-[12px] text-blu">
        xs
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold">{project.displayName}</p>
        <p className="truncate text-[12px] text-ink-faint">
          {copied === "copied" ? <span className="text-grn">GitHub URL copied</span> : copied === "error" ? <span className="text-[#ff7a70]">Could not copy</span> : project.github?.repo}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconAction
          label={`Pin ${project.displayName}`}
          icon={<Star />}
          pressed={pinned}
          pressedTone="yel"
          size="sm"
          onClick={() => setPinned((p) => !p)}
        />
        <IconAction
          label="Copy GitHub URL"
          icon={copied === "copied" ? <Check /> : copied === "error" ? <TriangleAlert /> : <RuntimeLogo id="github" size={14} decorative />}
          size="sm"
          className={copied === "copied" ? "text-grn!" : copied === "error" ? "text-[#ff7a70]!" : undefined}
          onClick={() => void copy()}
        />
        <span role="status" className="sr-only">
          {copied === "copied" ? "GitHub URL copied" : copied === "error" ? "Could not copy. Select the text to copy it." : ""}
        </span>
        <IconAction label={`Edit ${project.displayName}`} icon={<Pencil />} variant="outline" size="sm" />
        <IconAction label={`Remove ${project.displayName} from this space`} icon={<Trash2 />} variant="danger" size="sm" tipAlign="end" onClick={() => setRemoved(true)} />
      </div>
    </Stage>
  );
}

function ClosablePanel() {
  const [open, setOpen] = useState(true);
  const [offset, setOffset] = useState(0);
  const { box, arm } = useFocusHandoff(open);
  const todos = TODOS.filter((t) => t.status === "in_progress" || t.status === "pending").slice(0, 2);
  // Date.UTC with fixed arguments: deterministic, no wall clock.
  const month = formatMonth(Date.UTC(2026, 9 + offset, 1));
  const toggle = (next: boolean) => {
    arm();
    setOpen(next);
  };

  return (
    <div ref={box}>
      {open ? (
        <PanelBody todos={todos} month={month} onShift={(d) => setOffset((o) => o + d)} onClose={() => toggle(false)} />
      ) : (
        <PanelClosed onReopen={() => toggle(true)} />
      )}
    </div>
  );
}

function PanelClosed({ onReopen }: { onReopen: () => void }) {
  return (
    <Stage className="flex min-h-[176px] flex-col items-start justify-center gap-3">
      <p className="text-[13px] text-ink-dim" role="status">
        Panel closed.
      </p>
      <button
        data-focus-next
        type="button"
        onClick={onReopen}
        className="inline-flex h-8 items-center gap-1.5 rounded-[8px]! border border-hair-strong px-3 text-[13px] text-ink-dim transition-colors hover:text-ink"
      >
        <Plus aria-hidden="true" className="size-4" /> Reopen panel
      </button>
    </Stage>
  );
}

function PanelBody({
  todos,
  month,
  onShift,
  onClose,
}: {
  todos: typeof TODOS;
  month: string;
  onShift: (delta: number) => void;
  onClose: () => void;
}) {
  return (
    <section
      aria-label="Steps panel"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="min-h-[176px] rounded-[14px] border border-hair-soft bg-s1"
    >
      <header className="flex items-center gap-2 border-b border-hair-soft px-3.5 py-2.5">
        <span className="text-[13px] font-semibold">Steps</span>
        <span className="font-mono text-[11px] text-ink-faint">{todos.length} open</span>
        <span className="ml-auto flex items-center gap-1">
          <IconAction label="Previous month" icon={<ChevronLeft />} size="xs" onClick={() => onShift(-1)} />
          <span className="min-w-[78px] text-center font-mono text-[11px] text-ink-dim" aria-live="polite">
            {month}
          </span>
          <IconAction label="Next month" icon={<ChevronRight />} size="xs" onClick={() => onShift(1)} />
          <IconAction
            data-focus-next
            label="Close panel"
            icon={<X />}
            variant="outline"
            shape="circle"
            size="sm"
            tipAlign="end"
            className="ml-1.5"
            onClick={onClose}
          />
        </span>
      </header>
      <ul className="divide-y divide-hair-soft">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px]">
            <StatusDot status={t.status === "in_progress" ? "busy" : "idle"} size="sm" />
            <span className="min-w-0 flex-1 truncate text-ink-dim">{t.content}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PhoneFrame() {
  const later = useTimers();
  const space = SPACE_BY_ID["ws_2b81d0e4"];
  const [view, setViewRaw] = useState<"app" | "home">("app");
  const [reloading, setReloading] = useState(false);
  const { box, arm } = useFocusHandoff(view);
  const setView = (v: "app" | "home") => {
    arm();
    setViewRaw(v);
  };

  return (
    <div ref={box} className="flex flex-wrap items-start gap-6">
      <div className="relative h-[260px] w-full max-w-[300px] overflow-hidden rounded-[30px] border border-hair-strong bg-black">
        {view === "app" ? (
          <>
            <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="ib-phone" cx="0.7" cy="0.2" r="0.9">
                  <stop offset="0" stopColor="#2e9bff" stopOpacity="0.5" />
                  <stop offset="0.55" stopColor="#bf5af2" stopOpacity="0.18" />
                  <stop offset="1" stopColor="#000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="300" height="260" fill="#070708" />
              <rect width="300" height="260" fill="url(#ib-phone)" />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x="20" y={150 + i * 24} width={220 - i * 40} height="9" rx="4.5" fill="#fff" opacity={0.08} />
              ))}
            </svg>
            <div className="relative flex items-center gap-2 p-3">
              <IconAction
                data-focus-next
                label="Back"
                icon={<ChevronLeft />}
                variant="glass"
                shape="circle"
                tip="bottom"
                tipAlign="start"
                onClick={() => setView("home")}
              />
              <span className="min-w-0 flex-1 truncate rounded-full border border-hair-strong bg-[rgba(30,30,32,0.72)] px-3 py-1.5 text-center text-[12.5px] backdrop-blur-md">
                Space dashboard
              </span>
              <IconAction
                label="Reload"
                icon={<ReloadGlyph className={cn(reloading && "spin")} />}
                variant="glass"
                shape="circle"
                tip="bottom"
                tipAlign="end"
                onClick={() => {
                  if (reloading) return;
                  setReloading(true);
                  later(() => setReloading(false), 900);
                }}
              />
            </div>
            <p className="relative px-5 pt-6 text-[20px] font-semibold tracking-[-0.01em]">{space.name}</p>
          </>
        ) : (
          <div className="flex h-full flex-col gap-4 p-5">
            <Caption>Apps</Caption>
            <div className="grid grid-cols-3 gap-3">
              <AppTile label="Space" onOpen={() => setView("app")} tone="text-blu" />
              <AppTile label="Files" tone="text-grn" />
              <AppTile label="Usage" tone="text-org" />
            </div>
            <p className="mt-auto text-[12px] text-ink-faint">Open Space to go back into the app frame.</p>
          </div>
        )}
      </div>
      <p className="min-w-[220px] flex-1 text-[12.5px] leading-relaxed text-ink-dim">
        Glass controls keep a 1px strong hairline and blur so they read over any art. Back returns to the app grid; reload spins while the frame reloads.
      </p>
    </div>
  );
}

function AppTile({ label, onOpen, tone }: { label: string; onOpen?: () => void; tone: string }): ReactNode {
  const inner = (
    <>
      <span aria-hidden="true" className={cn("grid size-11 place-items-center rounded-[12px] border border-hair bg-s2 font-mono text-[13px]", tone)}>
        {label.charAt(0)}
      </span>
      <span className="text-[11px] text-ink-dim">{label}</span>
    </>
  );
  return onOpen ? (
    <button data-focus-next type="button" onClick={onOpen} className="flex flex-col items-center gap-1.5 rounded-[12px]! p-1 hover:bg-white/[0.04]">
      {inner}
    </button>
  ) : (
    <div className="flex flex-col items-center gap-1.5 p-1 opacity-60">{inner}</div>
  );
}
