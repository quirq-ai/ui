"use client";

// Interactive heroes: IntroHero (space-drift welcome over the starfield: choose a folder,
// launch, prepare, then hide while flying) and ThirdPartyHero (the fictional Acme Notes page
// galileo serves, whose trial counter updates per click).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ExternalLink, Route } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui";
import type { HeadingTag } from "./hero";
import { Starfield, Vignette } from "./texture";

/* ----------------------------------------------------------------------------- IntroHero */

export type IntroStage = "idle" | "picked" | "preparing" | "flying";

export type IntroHeroProps = {
  kicker: string;
  title: ReactNode;
  /** Second line, set in Georgia italic in the accent. */
  emphasis: string;
  body: ReactNode;
  /** Privacy reassurance under the actions. */
  note: ReactNode;
  sample: { label: string; caption: string };
  stage: IntroStage;
  /** Folder chosen in the "picked" stage. */
  folder?: { name: string; detail: string } | null;
  onChooseFolder?: () => void;
  onLaunch?: () => void;
  onExploreSample?: () => void;
  /** Overlay shown while flying (HUD chip, "Show intro"). */
  flyingOverlay?: ReactNode;
  /** Unique prefix for the starfield gradient when several intros share a page. */
  idPrefix?: string;
  titleAs?: HeadingTag;
  className?: string;
};

const ACCENT = "#aab8ff";

/** space-drift welcome: big light headline, one primary action, a sample route, and a privacy note. */
export function IntroHero({
  kicker,
  title,
  emphasis,
  body,
  note,
  sample,
  stage,
  folder,
  onChooseFolder,
  onLaunch,
  onExploreSample,
  flyingOverlay,
  idPrefix = "intro",
  titleAs: Title = "h2",
  className,
}: IntroHeroProps) {
  const flying = stage === "flying";
  const preparing = stage === "preparing";
  const primary = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const prevStage = useRef(stage);

  /* Stage changes swap the primary button and make the intro inert while flying, so focus
     would fall to the body. Hand it to the flight overlay while flying, and to the primary
     action otherwise. Focus that sits elsewhere on the page (a stage switch) is left alone. */
  useEffect(() => {
    const was = prevStage.current;
    prevStage.current = stage;
    if (was === stage) return;
    const active = document.activeElement;
    const lost = !active || active === document.body;
    const inside = active ? (section.current?.contains(active) ?? false) : false;
    if (!lost && !inside) return;
    if (stage === "flying") overlay.current?.focus({ preventScroll: true });
    else if (lost || was === "flying") primary.current?.focus({ preventScroll: true });
  }, [stage]);

  return (
    <section ref={section} className={cn("relative isolate min-h-[420px] overflow-hidden rounded-[16px] border border-hair-soft", className)}>
      <Starfield idPrefix={`${idPrefix}-stars`} />
      <Vignette strength={flying ? 0.6 : 1} />
      <div
        aria-hidden={flying || undefined}
        inert={flying}
        className={cn(
          "relative z-[1] flex max-w-[560px] flex-col px-6 py-10 transition-opacity duration-[400ms] sm:px-10",
          flying && "pointer-events-none opacity-0",
        )}
      >
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
          {kicker}
        </p>
        <Title className="m-0 mt-4 text-[clamp(40px,7vw,70px)] font-normal leading-[0.98] tracking-[-0.055em] text-[#eef0ff]">
          {title}
          <br />
          <em className="text-[1.16em] font-normal italic tracking-[-0.04em]" style={{ color: ACCENT, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {emphasis}
          </em>
        </Title>
        <p className="m-0 mt-5 max-w-[42ch] text-[12.5px] leading-[1.8] text-[#c2c8e4]">{body}</p>

        <div className="mt-7 flex flex-col items-start gap-3">
          {stage === "idle" ? (
            <button
              ref={primary}
              type="button"
              onClick={onChooseFolder}
              className="inline-flex h-10 items-center gap-2 rounded-full! bg-[#eef0ff] px-5 text-[13.5px] font-semibold text-[#080b18] transition-colors hover:bg-white"
            >
              Choose a folder
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </button>
          ) : (
            /* aria-disabled while preparing, so the focused button keeps focus */
            <button
              ref={primary}
              type="button"
              onClick={() => {
                if (stage === "picked") onLaunch?.();
              }}
              aria-disabled={stage !== "picked" || undefined}
              aria-busy={preparing || undefined}
              className="inline-flex h-10 items-center gap-2 rounded-full! bg-[#eef0ff] px-5 text-[13.5px] font-semibold text-[#080b18] transition-colors hover:bg-white aria-disabled:cursor-wait aria-disabled:opacity-80"
            >
              {preparing ? (
                <>
                  <Spinner size="sm" label={null} />
                  Preparing your ship…
                </>
              ) : (
                "Launch expedition"
              )}
            </button>
          )}
          {folder && stage !== "idle" ? (
            <p className="m-0 font-mono text-[11px] tracking-[0.04em] text-[#c2c8e4]">
              Folder: <span className="text-[#eef0ff]">{folder.name}</span>
              <span aria-hidden="true" className="px-1.5 opacity-60">
                ·
              </span>
              {folder.detail}
            </p>
          ) : null}
          {stage === "idle" ? (
            <button
              type="button"
              onClick={onExploreSample}
              className="group inline-flex max-w-full items-center gap-3 rounded-[12px]! border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-left backdrop-blur-sm transition-colors hover:border-white/30"
            >
              <Route aria-hidden="true" className="size-4 shrink-0" style={{ color: ACCENT }} />
              <span className="flex min-w-0 flex-col">
                <span className="text-[13px] font-medium text-[#eef0ff]">{sample.label}</span>
                <small className="text-[11.5px] text-[#9aa2c8]">{sample.caption}</small>
              </span>
              <span aria-hidden="true" className="ml-1 text-[#9aa2c8] transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </button>
          ) : null}
        </div>
        <p className="m-0 mt-6 text-[11.5px] text-[#9aa2c8]">{note}</p>
      </div>
      {flying && flyingOverlay ? (
        <div ref={overlay} tabIndex={-1} role="group" aria-label="Flight view" className="absolute inset-0 z-[2]">
          {flyingOverlay}
        </div>
      ) : null}
    </section>
  );
}

/* ----------------------------------------------------------------------------- ThirdPartyHero */

export type ThirdPartyHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  cta: string;
  link: { label: string; href: string };
  /** Trials started before this render; drives the counter copy. */
  initialCount?: number;
  titleAs?: HeadingTag;
  className?: string;
};

function trialsCopy(n: number): string {
  if (n === 0) return "No trials started from this page yet.";
  return `${n} ${n === 1 ? "trial" : "trials"} started from this page.`;
}

/** A third-party app's own hero, as galileo serves it (light page, its own palette). */
export function ThirdPartyHero({ eyebrow, title, lede, cta, link, initialCount = 0, titleAs: Title = "h2", className }: ThirdPartyHeroProps) {
  const [count, setCount] = useState(initialCount);
  return (
    /* --ink drives the global focus ring, so a light page keeps a visible (dark) ring */
    <section className={cn("bg-[#fbfaf6] px-6 py-10 text-[#1d2330] sm:px-10", className)} style={{ "--ink": "#1d2330" } as CSSProperties}>
      <p className="m-0 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[#3355d6]">{eyebrow}</p>
      <Title className="m-0 mt-3 text-[clamp(30px,5vw,48px)] font-bold leading-[1.08] tracking-[-0.02em]">{title}</Title>
      <p className="m-0 mt-4 max-w-[34em] text-[clamp(15px,1.8vw,18px)] leading-[1.55] text-[#5b6475]">{lede}</p>
      <div className="mt-7 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="inline-flex h-11 items-center rounded-[10px]! bg-[#3355d6] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2945b8]"
        >
          {cta}
        </button>
        <a href={link.href} className="text-[15px] font-semibold text-[#3355d6] underline-offset-4 hover:underline">
          {link.label}
        </a>
      </div>
      <p aria-live="polite" className="m-0 mt-5 text-[13.5px] text-[#5b6475]">
        {trialsCopy(count)}
      </p>
    </section>
  );
}
