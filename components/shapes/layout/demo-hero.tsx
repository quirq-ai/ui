"use client";

// Demo: heroes. Client component: replayable reveal, the space-drift intro flow, the wiki
// deep link and the third-party trial counter.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Wordmark } from "@/components/brand/mark";
import { Button, ButtonLink, Segmented, StatusDot } from "@/components/ui";
import { CURRENT_USER, PROJECT_BY_ID } from "@/lib/fixtures";
import { pluralize } from "@/lib/format";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { MonoMeta } from "./eyebrow";
import { AuroraHero, GhostWordsHero, SplitHero, StatementHero, WelcomeBanner, WikiWelcome } from "./hero";
import { IntroHero, ThirdPartyHero, type IntroStage } from "./hero-client";
import { Grain } from "./texture";

const NOTES = PROJECT_BY_ID["research-notes"];

export default function HeroDemo() {
  const [run, setRun] = useState(0);

  /* space-drift intro flow */
  const [stage, setStage] = useState<IntroStage>("idle");
  const [folder, setFolder] = useState<{ name: string; detail: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const t = timer;
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);
  function prepare() {
    setStage("preparing");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStage("flying"), 1400);
  }
  function jump(s: IntroStage) {
    if (timer.current) clearTimeout(timer.current);
    if (s !== "idle" && !folder) setFolder({ name: NOTES.displayName, detail: pluralize(NOTES.files, "file") });
    setStage(s);
  }

  /* wiki deep link */
  const [deep, setDeep] = useState<"none" | "01" | "02" | "03">("02");

  return (
    <div className="flex flex-col gap-10">
      {/* split prism */}
      <Specimen label="Split prism · staggered reveal" note="Wordmark, display headline, lede, pill and ghost pill. Copy rises in at .08s, .16s and .24s; the art at .1s.">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-[18px] border border-hair-soft bg-bg px-[clamp(18px,4vw,44px)] py-[clamp(24px,4vw,48px)]">
            <SplitHero
              titleAs="h3"
              reveal
              revealKey={run}
              idPrefix="hero-split"
              brand={<Wordmark height={46} className="mb-3" />}
              title={
                <>
                  Secure environments
                  <br />
                  for agentic workforces
                </>
              }
              sub="Any model. Any harness. Any cloud."
              actions={
                <>
                  <ButtonLink href="#hero" variant="primary" size="lg">
                    Get started
                  </ButtonLink>
                  <ButtonLink href="#hero" variant="ghost" size="lg">
                    Whitepaper
                  </ButtonLink>
                </>
              }
            />
          </div>
          <div>
            <Button size="sm" variant="secondary" leadingIcon={<RotateCcw />} onClick={() => setRun((r) => r + 1)}>
              Replay reveal
            </Button>
          </div>
        </div>
      </Specimen>

      {/* statement glow */}
      <SpecimenGrid cols={2}>
        <Specimen label="Statement glow" note="Spectral light blurred into a haze behind a centered statement.">
          <div className="overflow-hidden rounded-[18px] border border-hair-soft bg-bg">
            <StatementHero
              titleAs="h3"
              title="What is a quirq?"
              body={
                <>
                  More tokens does not equal more work. Machine-level observability and plain math find the true unit of work:{" "}
                  <b className="font-semibold text-white">the quirq</b>.
                </>
              }
              link={{ label: "Read the research", href: "#hero" }}
            />
          </div>
        </Specimen>
        <Specimen label="Statement · plain centered" note="Same shape with no glow.">
          <div className="overflow-hidden rounded-[18px] border border-hair-soft bg-bg">
            <StatementHero titleAs="h3" glow={false} title="Three layers. One shape." body="Observatory, environments and spaces: the view, the work, and the ground it runs on." />
          </div>
        </Specimen>
      </SpecimenGrid>

      {/* products aurora */}
      <Specimen label="Products aurora" note="Three layer-adjacent hues at 10 to 13% over #08080a.">
        <AuroraHero
          titleAs="h3"
          title="Launch a space"
          tail="for agent work."
          actions={
            <>
              <ButtonLink href="#hero" variant="primary" size="lg">
                Get started
              </ButtonLink>
              <ButtonLink href="#hero" variant="ghost" size="lg">
                Run on your infra
              </ButtonLink>
            </>
          }
        />
      </Specimen>

      {/* machine speed */}
      <Specimen label="Machine Speed · ghost words" note="Olive ground. Workflow names sit above and below the claim at rising opacities, as texture.">
        <div className="flex flex-col gap-2.5">
          <GhostWordsHero
            titleAs="h3"
            label="Machine Speed"
            above={["order recovery.", "cfo intelligence.", "sales machines."]}
            title="We help businesses run at"
            emphasis="machine speed."
            below={["subscription audits.", "agent loops.", "background workflows."]}
            lead="Agentic workflows that hand you back ten hours a week."
            body="Your software already moves at machine speed. Your operations do not. We build and run agentic workflows on the stack you already own, and every workflow reports the money it made or saved."
            art={<RefractionPlate />}
          />
          <MonoMeta kind="footnote" items={["Ten hours a week is an illustrative figure from the Hours-back calculator (Machine Speed). Hours, not quirqs."]} />
        </div>
      </Specimen>

      <DemoRule />

      {/* welcome banner */}
      <SpecimenGrid cols={2}>
        <Specimen label="App welcome banner · with name">
          <WelcomeBanner
            titleAs="h3"
            name={CURRENT_USER.name.split(" ")[0]}
            kicker="Agent command center"
            description="Launch agents, monitor usage, and jump back into active spaces."
            action={
              <ButtonLink href="#hero" size="sm" variant="secondary" leadingIcon={<Plus />}>
                New space
              </ButtonLink>
            }
          />
        </Specimen>
        <Specimen label="App welcome banner · without name">
          <WelcomeBanner
            titleAs="h3"
            name={null}
            kicker="Agent command center"
            description="Launch agents, monitor usage, and jump back into active spaces."
            action={
              <ButtonLink href="#hero" size="sm" variant="secondary" leadingIcon={<Plus />}>
                New space
              </ButtonLink>
            }
          />
        </Specimen>
      </SpecimenGrid>

      {/* space-drift */}
      <Specimen
        label="space-drift intro"
        note="Choose a folder, then Launch expedition. Preparing your ship… runs, and the intro hides once flying. The stage switch jumps between states."
      >
        <div className="flex flex-col gap-3">
          <div className="max-w-full self-start overflow-x-auto">
          <Segmented<IntroStage>
            aria-label="Intro stage"
            size="sm"
            value={stage}
            onChange={jump}
            options={[
              { value: "idle", label: "Choose" },
              { value: "picked", label: "Launch" },
              { value: "preparing", label: "Preparing" },
              { value: "flying", label: "Flying" },
            ]}
          />
          </div>
          <IntroHero
            titleAs="h3"
            kicker="A world in your projects folder"
            title="Your files."
            emphasis="In orbit."
            body="Repositories become planets. Folders become molecules. Fly between worlds, land, and open the atoms inside."
            note="Your files stay on this device. Nothing is uploaded."
            sample={{ label: "Explore sample folder", caption: "Fly gates. Land. Discover files. No folder access." }}
            stage={stage}
            folder={folder}
            onChooseFolder={() => {
              setFolder({ name: NOTES.displayName, detail: pluralize(NOTES.files, "file") });
              setStage("picked");
            }}
            onLaunch={prepare}
            onExploreSample={() => {
              setFolder({ name: "sample folder", detail: "fictional projects" });
              prepare();
            }}
            flyingOverlay={
              <div className="flex h-full flex-col justify-between p-4">
                <p className="m-0 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#c2c8e4] backdrop-blur">
                  <StatusDot status="up" size="xs" pulse />
                  Flying · {folder?.name ?? "sample folder"}
                </p>
                <div>
                  <Button size="sm" variant="ghost" onClick={() => jump("idle")}>
                    Show intro
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      </Specimen>

      {/* wiki */}
      <Specimen label="Wiki quickstart" note="Radial accent glow at top right. A deep-linked step gets a 2px accent outline.">
        <div className="flex flex-col gap-3">
          <div className="max-w-full self-start overflow-x-auto">
          <Segmented
            aria-label="Deep-linked step"
            size="sm"
            value={deep}
            onChange={setDeep}
            options={[
              { value: "none", label: "No deep link" },
              { value: "01", label: "Step 01" },
              { value: "02", label: "Step 02" },
              { value: "03", label: "Step 03" },
            ]}
          />
          </div>
          <WikiWelcome
            level={3}
            kicker="Space wiki"
            title="Welcome to XO Space"
            description="Start with your space, follow the work, and find the full guide when you need it."
            docs={{ label: "Open docs", href: "https://docs.quirq.ai/docs/space" }}
            highlight={deep === "none" ? undefined : deep}
            steps={[
              { n: "01", title: "Check your setup", body: "Confirm roots, runtime health and credentials.", action: <WikiAction label="Open Setup" /> },
              { n: "02", title: "Bring a project", body: "Add a folder and pin it so it sorts first.", action: <WikiAction label="Open Projects" /> },
              { n: "03", title: "Explore your work", body: "Follow sessions, steps and the timeline.", action: <WikiAction label="Open Timeline" /> },
            ]}
          />
        </div>
      </Specimen>

      {/* third party */}
      <SpecimenGrid cols={2}>
        <Specimen label="Third-party hero · 0 trials" note="Fictional app under telescope's bar. Click the CTA to count.">
          <GalileoFrame>
            <ThirdPartyHero
              titleAs="h3"
              eyebrow="Notes for small teams"
              title="Notes that link themselves."
              lede="Write in plain text. Acme Notes finds the people, projects and decisions you mention and connects them, so last month's meeting is one click from today's."
              cta="Start a 14-day trial"
              link={{ label: "See pricing", href: "#hero" }}
            />
          </GalileoFrame>
        </Specimen>
        <Specimen label="Third-party hero · n trials" note="Starts at two trials; each click adds one.">
          <GalileoFrame>
            <ThirdPartyHero
              titleAs="h3"
              eyebrow="Notes for small teams"
              title="Notes that link themselves."
              lede="Write in plain text. Acme Notes finds the people, projects and decisions you mention and connects them, so last month's meeting is one click from today's."
              cta="Start a 14-day trial"
              link={{ label: "See pricing", href: "#hero" }}
              initialCount={2}
            />
          </GalileoFrame>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}

/* Machine Speed plate: soft warm-to-cyan refraction on black, with grain. */
function RefractionPlate() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute -inset-[20%] rotate-[-18deg]"
        style={{
          filter: "blur(26px)",
          background: [
            "linear-gradient(90deg, transparent 30%, rgba(255,180,107,.55) 40%, transparent 47%)",
            "linear-gradient(90deg, transparent 44%, rgba(255,94,138,.55) 52%, transparent 58%)",
            "linear-gradient(90deg, transparent 55%, rgba(87,217,255,.5) 62%, transparent 70%)",
          ].join(", "),
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 45%, transparent 30%, #000 92%)" }} />
      <Grain opacity={0.08} />
    </div>
  );
}

function WikiAction({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex min-h-[26px] items-center gap-1 text-[12px] font-medium text-[#a8d94f] hover:underline">
      {label} <span aria-hidden="true">→</span>
    </button>
  );
}

function GalileoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-hair">
      <div className="flex items-center gap-2 border-b border-hair bg-[#111410] px-3 py-2">
        <StatusDot status="up" size="xs" />
        <span className="text-[12px] font-medium text-[#e8ede3]">acme</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-[#9ca693]">acme.localhost:4100</span>
      </div>
      {children}
    </div>
  );
}
