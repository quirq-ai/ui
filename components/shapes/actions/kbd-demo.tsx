"use client";

// Live demo for keyboard hints: the ⌘K trigger (platform aware) with a small palette that
// answers ↑ ↓ ↵ and Esc, the "/" search hint that fades on focus, the palette footer, the
// WASD cluster, keys inside buttons, a controls manual, and a key tester where held keys
// light up. Shortcuts are scoped to this demo, never bound on the whole page.
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Box, FolderOpen, MessageSquarePlus, Pause, Search } from "lucide-react";
import { Kbd, KeyCombo } from "@/components/ui/kbd";
import { SearchInput } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { COMMANDS } from "@/lib/fixtures";
import { cn } from "@/lib/cn";
import { ControlsGrid, HintBar, KbdButton, KeyCluster, Keycap, ShortcutTrigger, platformKeys, type Platform } from "./keyboard-hints";
import { IconAction } from "./icon-action";
import { Caption, DemoSection, DemoStack, Specimen, Stage, Still } from "./demo-kit";

const PALETTE_HINTS = [
  { keys: ["up", "down"], label: "navigate" },
  { keys: ["enter"], label: "open" },
  { keys: ["esc"], label: "close" },
];

export function KbdDemo() {
  const [platform, setPlatform] = useState<Platform>("mac");
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <DemoStack>
      <DemoSection title="Variants">
        <Specimen label="⌘K · top bar trigger" className="sm:col-span-2" layout="block">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Segmented<Platform>
              aria-label="Platform"
              size="sm"
              value={platform}
              onChange={setPlatform}
              options={[
                { value: "mac", label: "Mac" },
                { value: "other", label: "Windows and Linux" },
              ]}
            />
            <span className="text-[12px] text-ink-faint">Off Mac the hint reads Ctrl K.</span>
          </div>
          <PaletteSample platform={platform} onChoose={setChosen} />
          <p aria-live="polite" className="mt-2 min-h-[18px] font-mono text-[11.5px] text-ink-faint">
            {chosen ? `Chose: ${chosen}` : null}
          </p>
        </Specimen>
        <Specimen label="/ · search, fades on focus" layout="block">
          <SearchInput aria-label="Search projects" kbd="/" placeholder="Search projects" />
          <p className="mt-2 text-[12px] text-ink-faint">Focus the field or type: the / hint fades out.</p>
        </Specimen>

        <Specimen label="Esc ↑ ↓ ↵ · palette footer" layout="block">
          <Stage className="py-3">
            <HintBar hints={PALETTE_HINTS} />
          </Stage>
        </Specimen>
        <Specimen label="WASD cluster">
          <KeyCluster top={["W"]} bottom={["A", "S", "D"]} caption="Thrust and steer" />
        </Specimen>
        <Specimen label="Inline in prose" layout="block">
          <p className="text-[13px] leading-[2] text-ink-dim">
            Press <Kbd size="xs">L</Kbd> to land or lift off · <Kbd size="xs">E</Kbd> to open a file · <KeyCombo keys={platformKeys(["mod", "K"], platform)} size="xs" /> to search.
          </p>
        </Specimen>

        <Specimen label="In-button chip" className="sm:col-span-2" layout="stack">
          <div className="flex flex-wrap items-center gap-2">
            <KbdButton variant="map" label="Atlas" keyHint="M" />
            <KbdButton variant="pill" label="Land" keyHint="L" />
            <KbdButton variant="pill" label="Overlay" keyHint="G" />
            <KbdButton variant="pill" label="Tours" keyHint="T" />
            <IconAction label="Pause" icon={<Pause />} variant="outline" shape="circle" size="sm" keyHint="P" />
          </div>
          <div className="w-full max-w-[280px]">
            <KbdButton variant="scan" label="Open file" keyHint="E" />
          </div>
        </Specimen>
        <Specimen label="Manual grid" layout="block">
          <ControlsGrid
            rows={[
              { keys: ["Shift"], label: "Boost" },
              { keys: ["Space"], label: "Brake" },
              { keys: ["Q", "Click"], label: "Probe" },
              { keys: ["Home", "C"], label: "Recenter" },
              { keys: ["Esc"], label: "Close" },
            ]}
          />
        </Specimen>
      </DemoSection>

      <DemoSection title="States" cols={3}>
        <Specimen label="Default">
          <Kbd>mod</Kbd>
          <Kbd>K</Kbd>
          <Kbd>/</Kbd>
          <Kbd>esc</Kbd>
          <Keycap>W</Keycap>
        </Specimen>
        <Specimen label="Fades on focus · rest, focusing, focused" layout="stack" note="The hint fades over 150 ms and stays hidden while the field holds text.">
          <Still>
            <FadeStep hint={1} />
            <FadeStep hint={0.35} focused />
            <FadeStep hint={0} focused value="status pill" />
          </Still>
        </Specimen>
        <Specimen label="Pressed · cyan, down 1px">
          <Still>
            <Keycap size="sm" pressed>
              K
            </Keycap>
            <Keycap pressed>W</Keycap>
            <KbdButton variant="pill" label="Land" keyHint="L" pressed />
            <KbdButton variant="map" label="Atlas" keyHint="M" pressed />
          </Still>
        </Specimen>
      </DemoSection>

      <DemoSection title="Try it · key tester" cols={1}>
        <KeyTester />
      </DemoSection>
    </DemoStack>
  );
}

/* ----------------------------------------------------------------------------- fade steps */

/** Static search pill frozen at one point of the fade: hint opacity 1, mid-fade, gone. */
function FadeStep({ hint, focused = false, value }: { hint: number; focused?: boolean; value?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-full max-w-[260px] items-center rounded-full border bg-s1 pl-9 pr-11 text-[13px]",
        focused ? "border-white/30 outline-2 outline-offset-3 outline-ink outline-solid" : "border-hair",
      )}
    >
      <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
      {focused && !value ? <TextCaret /> : null}
      <span className={cn("truncate", value ? "text-ink" : "text-ink-faint")}>{value ?? "Search sessions"}</span>
      {focused && value ? <TextCaret /> : null}
      <Kbd subtle className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ opacity: hint }}>
        /
      </Kbd>
    </div>
  );
}

function TextCaret() {
  return <span aria-hidden="true" className="mx-px inline-block h-4 w-px shrink-0 bg-ink" />;
}

/* ----------------------------------------------------------------------------- palette */

const PALETTE_ITEMS = COMMANDS.filter((c) => ["open-space", "new-session", "open-project", "search-files"].includes(c.id));
const GLYPH = { Box, MessageSquarePlus, FolderOpen, Search } as const;

function PaletteSample({ platform, onChoose }: { platform: Platform; onChoose: (label: string) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function onListKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % PALETTE_ITEMS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + PALETTE_ITEMS.length) % PALETTE_ITEMS.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(PALETTE_ITEMS.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onChoose(PALETTE_ITEMS[active].label);
      close();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  return (
    <div
      onKeyDown={(e) => {
        // ⌘K or Ctrl K while focus is inside this demo toggles the palette.
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          if (open) close();
          else {
            setActive(0);
            setOpen(true);
          }
        }
      }}
    >
      <ShortcutTrigger
        ref={trigger}
        platform={platform}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        // While open, keep focus in the list so this click closes the palette instead of
        // blurring it closed and reopening it.
        onMouseDown={(e) => {
          if (open) e.preventDefault();
        }}
        onClick={() => {
          if (open) close();
          else {
            setActive(0);
            setOpen(true);
          }
        }}
      />
      {open ? (
        <div className="rise mt-2 w-full max-w-[420px] overflow-hidden rounded-[12px] border border-hair-strong bg-s2 shadow-[0_16px_40px_rgba(0,0,0,0.5)] has-[[role=listbox]:focus-visible]:border-ink/50">
          <div
            ref={list}
            id={`${id}-list`}
            role="listbox"
            tabIndex={0}
            aria-label="Commands"
            aria-activedescendant={`${id}-opt-${active}`}
            onKeyDown={onListKey}
            onBlur={(e) => {
              if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node | null)) setOpen(false);
            }}
            className="p-1.5 focus-visible:outline-none!"
          >
            {PALETTE_ITEMS.map((c, i) => {
              const Icon = GLYPH[c.glyph as keyof typeof GLYPH] ?? Search;
              return (
                <div
                  key={c.id}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChoose(c.label);
                    close();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px]",
                    i === active ? "bg-s4 text-ink" : "text-ink-dim",
                  )}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  {c.shortcut ? <KeyCombo keys={platformKeys(c.shortcut, platform)} size="xs" subtle /> : null}
                </div>
              );
            })}
          </div>
          <div className="border-t border-hair-soft px-3 py-2">
            <HintBar hints={PALETTE_HINTS} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- key tester */

const TESTER_KEYS = new Set(["W", "A", "S", "D", "Shift", "Space", "Q", "C", "E", "L"]);

function keyName(e: KeyboardEvent<HTMLElement>): string {
  if (e.key === " ") return "Space";
  if (e.key === "Shift") return "Shift";
  return e.key.length === 1 ? e.key.toUpperCase() : e.key;
}

function KeyTester() {
  const [held, setHeld] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);
  const has = (k: string) => held.includes(k);

  const press = (k: string) => {
    setHeld((h) => (h.includes(k) ? h : [...h, k]));
    setLast(k);
  };
  const release = (k: string) => setHeld((h) => h.filter((x) => x !== k));

  const pointerKey = (k: string) => ({
    onPointerDown: () => press(k),
    onPointerUp: () => release(k),
    onPointerLeave: () => release(k),
  });

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label="Key tester. Focus here and hold W, A, S, D, Shift, Space, Q, C, E or L."
      onKeyDown={(e) => {
        const k = keyName(e);
        if (!TESTER_KEYS.has(k) || e.metaKey || e.ctrlKey || e.altKey) return;
        // Space on a focused button inside belongs to that button.
        if (k === "Space" && e.target !== e.currentTarget) return;
        e.preventDefault();
        press(k);
      }}
      onKeyUp={(e) => {
        const k = keyName(e);
        if (TESTER_KEYS.has(k)) release(k);
      }}
      onBlur={() => setHeld([])}
      className="group/tester rounded-[14px]! border border-dashed border-hair bg-s1 p-5 transition-colors focus-visible:border-hair-strong"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Caption>Click or tab here, then hold keys</Caption>
        <span aria-live="polite" className="font-mono text-[11.5px] text-ink-faint">
          {held.length ? `Holding ${held.join(" + ")}` : last ? `Last key ${last}` : "Waiting for a key"}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-6">
        <div className="touch-none">
          <div className="inline-flex flex-col items-center gap-[3px]">
            <div className="flex gap-[3px]">
              <span {...pointerKey("W")}>
                <Keycap size="lg" pressed={has("W")}>
                  W
                </Keycap>
              </span>
            </div>
            <div className="flex gap-[3px]">
              {["A", "S", "D"].map((k) => (
                <span key={k} {...pointerKey(k)}>
                  <Keycap size="lg" pressed={has(k)}>
                    {k}
                  </Keycap>
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Thrust and steer</p>
        </div>
        <ul className="flex flex-col gap-2.5 text-[12px] text-ink-dim">
          {(
            [
              ["Shift", "Boost"],
              ["Space", "Brake"],
              ["Q", "Probe"],
              ["C", "Recenter"],
            ] as const
          ).map(([k, label]) => (
            <li key={k} className="flex items-center gap-2.5">
              <span {...pointerKey(k)} className="touch-none">
                <Keycap size="md" pressed={has(k)} wide={k.length > 1}>
                  {k}
                </Keycap>
              </span>
              {label}
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-2">
          <KbdButton variant="pill" label="Land" keyHint="L" aria-keyshortcuts="L" pressed={has("L")} onClick={() => setLast("L")} />
          <div className="w-[180px]">
            <KbdButton variant="scan" label="Open file" keyHint="E" aria-keyshortcuts="E" pressed={has("E")} onClick={() => setLast("E")} />
          </div>
        </div>
      </div>
    </div>
  );
}
