"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowRight,
  ChartColumn,
  Folder,
  FolderKanban,
  GitPullRequest,
  Hash,
  Inbox,
  MessageSquare,
  NotebookPen,
  Settings2,
  SquareKanban,
  SquareTerminal,
  Telescope,
} from "lucide-react";
import { RuntimeLogo } from "@/components/ui/runtime-logo";
import { Eyebrow } from "@/components/brand/mark";
import { CURRENT_SPACE, PHONE_APPS, PROJECT_BY_ID, RUNTIMES, SESSIONS, seededSeries, type PhoneApp } from "@/lib/fixtures";
import { formatCompact, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DemoCell, DemoGrid, DemoStack, Readout } from "./demo-kit";
import { logoFor } from "./demo-data";
import { Coverflow, SnapRail, SwipePages, type RailPosition } from "./carousel";

/* ------------------------------------------------------------------ rail cards */

const DIFFICULTY: Record<string, [number, string]> = {
  claude_code: [2, "Some technical setup"],
  codex: [2, "Some technical setup"],
  openclaw: [1, "No coding required"],
  cursor: [2, "Some technical setup"],
  hermes: [1, "No coding required"],
  gemini_cli: [2, "Some technical setup"],
};

function RuntimeCard({ r }: { r: (typeof RUNTIMES)[number] }) {
  const [dots, words] = DIFFICULTY[r.id];
  return (
    <article className="flex snap-start flex-col overflow-hidden rounded-[16px] border border-hair-soft bg-[#0f0f11] transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-white/20">
      <div
        className="dots flex h-[120px] items-center justify-center border-b border-hair-soft"
        style={{ background: `radial-gradient(ellipse 70% 90% at 50% 100%, var(--${r.color}) -60%, transparent 70%), #0d0d10` }}
      >
        <RuntimeLogo id={logoFor(r.id)} size={30} tile decorative />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[16px] font-semibold tracking-[-0.015em]">{r.label}</h4>
          <span className={cn("font-mono text-[8.5px] uppercase tracking-[0.14em]", r.inUse ? "text-grn" : "text-ink-faint")}>{r.inUse ? "Featured" : "New"}</span>
        </div>
        <p className="text-[12.5px] text-ink-dim">{r.vendor === "Open source" ? "Open source" : `Powered by ${r.vendor}`}</p>
        <p className="mt-auto flex items-center gap-2 text-[11.5px] text-ink-faint">
          <span className="flex gap-[3px]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn("size-1.5 rounded-full", i < dots ? "bg-ink-dim" : "bg-white/10")} />
            ))}
          </span>
          {words}
        </p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ coverflow cards */

type Scope = { id: string; name: string; description: string; tokens: number; sessions: number; live: number; seed: number };

const spaceSessions = SESSIONS.filter((s) => s.spaceId === CURRENT_SPACE.id);
const SCOPES: Scope[] = [
  {
    id: "space",
    name: CURRENT_SPACE.name,
    description: "The whole space",
    tokens: spaceSessions.reduce((a, s) => a + s.tokens, 0),
    sessions: spaceSessions.length,
    live: spaceSessions.filter((s) => s.open).length,
    seed: 41,
  },
  ...CURRENT_SPACE.projects.map((id, i) => {
    const own = SESSIONS.filter((s) => s.projectId === id);
    return {
      id,
      name: PROJECT_BY_ID[id].displayName,
      description: PROJECT_BY_ID[id].description,
      tokens: own.reduce((a, s) => a + s.tokens, 0),
      sessions: own.length,
      live: own.filter((s) => s.open).length,
      seed: 70 + i * 13,
    };
  }),
];

function spark(seed: number) {
  const pts = seededSeries(seed, 18, 8, 70);
  return pts.map((y, i) => `${i === 0 ? "M" : "L"}${(8 + (i * 264) / 17).toFixed(1)},${(76 - y).toFixed(1)}`).join(" ");
}

function CommandCard({ s, front }: { s: Scope; front: boolean }) {
  const d = spark(s.seed);
  return (
    <article className="overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#17171a,#0e0e10)] p-4">
      <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.14em]">
        <span className="text-ink-faint">Command center</span>
        <span className={s.live ? "text-grn" : "text-ink-faint"}>{s.live ? `${s.live} live` : "idle"}</span>
      </div>
      <h4 className="mt-2 truncate text-[18px] font-semibold tracking-[-0.02em]">{s.name}</h4>
      <dl className="mt-3 grid grid-cols-3 gap-2 border-y border-hair-soft py-2.5">
        {[
          ["Tokens", formatCompact(s.tokens)],
          ["Sessions", formatNumber(s.sessions)],
          ["Live", formatNumber(s.live)],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-faint">{k}</dt>
            <dd className="mt-0.5 font-mono text-[14px] tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <svg viewBox="0 0 280 84" className="mt-2 h-[64px] w-full" role="img" aria-label="Recent token activity, mock">
        <path d={`${d} L272,76 L8,76 Z`} fill={front ? "rgba(149,134,224,0.16)" : "rgba(255,255,255,0.05)"} />
        <path d={d} fill="none" stroke={front ? "#a99be8" : "var(--ink-faint)"} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex items-center justify-between gap-3 text-[11.5px] text-ink-faint">
        <span className="truncate">{s.description}</span>
        <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ phone */

const GLYPHS: Record<string, ComponentType<{ className?: string }>> = {
  Folder,
  MessageSquare,
  Telescope,
  ChartColumn,
  Settings2,
  Inbox,
  FolderKanban,
  SquareTerminal,
  NotebookPen,
  GitPullRequest,
  SquareKanban,
  Hash,
};

const TILE: Record<string, string> = {
  cyn: "from-cyn/35 to-cyn/10 text-cyn",
  grn: "from-grn/35 to-grn/10 text-grn",
  blu: "from-blu/35 to-blu/10 text-blu",
  yel: "from-yel/30 to-yel/10 text-yel",
  org: "from-org/35 to-org/10 text-org",
  pur: "from-pur/35 to-pur/10 text-pur",
  ink: "from-white/25 to-white/5 text-ink",
  "ink-dim": "from-white/15 to-white/5 text-ink-dim",
  "ink-faint": "from-white/10 to-white/5 text-ink-faint",
};

function AppIcon({ app }: { app: PhoneApp }) {
  const Glyph = GLYPHS[app.glyph] ?? Folder;
  return (
    <a href={`#/apps/${app.id}`} onClick={(e) => e.preventDefault()} className="group flex flex-col items-center gap-1.5 rounded-[14px]!">
      <span className={cn("relative flex size-12 items-center justify-center rounded-[14px] border border-white/10 bg-gradient-to-b", TILE[app.color])}>
        <Glyph className="size-5" aria-hidden="true" />
        {app.badge ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red px-1 font-mono text-[10px] font-semibold tabular-nums text-black">
            {app.badge}
            <span className="sr-only"> new</span>
          </span>
        ) : null}
      </span>
      <span className="text-[10.5px] text-ink-dim group-hover:text-ink">{app.label}</span>
    </a>
  );
}

const PAGES = [PHONE_APPS.slice(0, 9), PHONE_APPS.slice(9)];

export function CarouselDemo() {
  const [railPos, setRailPos] = useState<RailPosition>("start");
  const [front, setFront] = useState(0);
  const [opened, setOpened] = useState<string | null>(null);
  const [phonePage, setPhonePage] = useState(0);

  return (
    <DemoStack>
      <DemoCell label="Marketplace rail · arrows · start, middle, end" note="Scroll or use the arrows; they disable at the ends.">
        <SnapRail
          aria-label="Agent runtimes"
          itemMin={230}
          onPositionChange={setRailPos}
          heading={
            <h3 className="max-w-[26ch] text-[clamp(20px,2.4vw,28px)] font-semibold leading-[1.1] tracking-[-0.03em]">
              Choose your agent runtime, your model, your infra, <span className="text-ink-dim">and deploy in one click.</span>
            </h3>
          }
        >
          {RUNTIMES.map((r) => (
            <RuntimeCard key={r.id} r={r} />
          ))}
        </SnapRail>
        <Readout label="Rail position">{railPos}</Readout>
      </DemoCell>

      <DemoCell label="Command center coverflow · front card glow · wraparound" note="Arrows, dots, ← → keys or swipe. Numbers are mock.">
        <div className="text-center">
          <Eyebrow className="justify-center">The output layer</Eyebrow>
          <h3 className="mt-3 text-[clamp(28px,4vw,44px)] font-semibold leading-[0.95] tracking-[-0.03em]">Command centers</h3>
          <p className="mt-2 text-[14px] text-ink-dim">One operating view for every project, plus the whole space.</p>
        </div>
        <Coverflow
          aria-label="Project dashboards"
          items={SCOPES}
          index={front}
          onIndexChange={setFront}
          getLabel={(s) => s.name}
          onOpen={(s) => setOpened(s.name)}
          renderCard={(s, st) => <CommandCard s={s} front={st.front} />}
        />
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setOpened(SCOPES[front].name)}
            className="inline-flex h-9 items-center gap-2 rounded-full! border border-[rgba(149,134,224,0.42)] bg-[rgba(149,134,224,0.08)] px-4 text-[13px] font-medium text-ink transition-colors hover:bg-[rgba(149,134,224,0.16)]"
          >
            Open {SCOPES[front].name} <ArrowRight aria-hidden="true" className="size-3.5" />
          </button>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Choose a card · open the front dashboard</p>
          {opened ? <Readout label="Opened">{opened}</Readout> : null}
        </div>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Phone page dots · swipe between pages">
          <div className="mx-auto w-full max-w-[300px] rounded-[34px] border border-hair-strong bg-[linear-gradient(170deg,#141a2a,#0b0b10_55%,#140f1c)] p-4 pb-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-center justify-between px-2 font-mono text-[10px] tabular-nums text-ink-dim">
              <span>09:30</span>
              <span>{CURRENT_SPACE.name}</span>
            </div>
            <SwipePages
              aria-label="Home screen"
              index={phonePage}
              onIndexChange={setPhonePage}
              pages={PAGES.map((apps, i) => (
                <ul key={i} className="grid min-h-[236px] grid-cols-3 content-start gap-x-2 gap-y-4 px-2 py-1">
                  {apps.map((a) => (
                    <li key={a.id} className="flex justify-center">
                      <AppIcon app={a} />
                    </li>
                  ))}
                </ul>
              ))}
            />
          </div>
        </DemoCell>
        <DemoCell label="States · start, middle, end" note="Each rail disables the arrow with nowhere to go.">
          <div className="flex flex-col gap-3">
            {(["start", "middle", "end"] as const).map((p) => (
              <div key={p} className="rounded-[12px] border border-hair-soft bg-[#0f0f11] p-3">
                <SnapRail
                  size="sm"
                  itemMin={124}
                  initialPosition={p}
                  aria-label={`Runtimes, scrolled to the ${p}`}
                  heading={<span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{p}</span>}
                >
                  {RUNTIMES.map((r) => (
                    <span key={r.id} className="flex snap-start items-center gap-2 rounded-[10px] border border-hair-soft bg-bg px-2.5 py-2 text-[12px] text-ink-dim">
                      <RuntimeLogo id={logoFor(r.id)} size={16} decorative />
                      <span className="truncate">{r.label}</span>
                    </span>
                  ))}
                </SnapRail>
              </div>
            ))}
            <p className="text-[12.5px] text-ink-dim">
              Above, the coverflow shows the other states: the front card glows lavender, side cards drop to 62% saturation, and the ends wrap around.
            </p>
          </div>
        </DemoCell>
      </DemoGrid>
    </DemoStack>
  );
}
