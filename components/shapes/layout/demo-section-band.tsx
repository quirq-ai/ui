// Demo: section band and dividers. Server component; the anchor scroller is a client island.
import type { ReactNode } from "react";
import { Copy, Power, RotateCw } from "lucide-react";
import { IconButton, RuntimeLogo, StateChip, Button, logoLabel, type LogoId } from "@/components/ui";
import { PRICING_PLANS, RUNTIME_BY_ID, SESSION_BY_ID, SPACE_START_FAILURE, CURRENT_SPACE } from "@/lib/fixtures";
import { formatCurrency, formatNumber, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AnchorScroller } from "./anchor-scroller";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { Kicker, MonoMeta } from "./eyebrow";
import { TwoToneHeading } from "./page-header";
import { AccentBar, Band, FactLine, FailureStrip, HairlineGrid, LabeledRule, Separator } from "./section";

const hatch = "repeating-linear-gradient(135deg, rgba(46,155,255,.16) 0 1px, transparent 1px 7px)";

const RUNS_ON: LogoId[] = ["claude_code", "codex", "openclaw", "cursor", "hermes", "gemini"];

const PLAN_TEXT: Record<string, string> = { blu: "text-blu", grn: "text-grn", org: "text-org" };

export default function SectionBandDemo() {
  const session = SESSION_BY_ID["df1a1a5b"];
  const claude = RUNTIME_BY_ID.claude_code;
  return (
    <div className="flex flex-col gap-10">
      {/* default band with measurement guides */}
      <Specimen label="Default · #pricing band · static" note="Max 1180, gutters clamp(20px, 5vw, 44px), padding clamp(88px, 12vh, 136px), scroll-margin-top 78px.">
        <div className="relative overflow-hidden rounded-[14px] border border-hair-soft bg-bg">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(88px,12vh,136px)]" style={{ background: hatch }}>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.14em] text-blu">
              pt clamp(88px, 12vh, 136px)
            </span>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(88px,12vh,136px)]" style={{ background: hatch }}>
            <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.14em] text-blu">
              pb clamp(88px, 12vh, 136px)
            </span>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(20px,5vw,44px)] border-r border-dashed border-blu/40" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(20px,5vw,44px)] border-l border-dashed border-blu/40" />
          <Band id="sb-pricing" aria-labelledby="sb-pricing-title">
            <Kicker>Pricing</Kicker>
            <TwoToneHeading id="sb-pricing-title" as="h3" size="page" lead="Pay per space." tail="Never per seat." className="mt-6" />
            <p className="m-0 mt-4 max-w-[60ch] text-[clamp(14px,1.6vw,17px)] text-ink-dim">
              Open source is free on your own machine. Managed spaces are {PRICING_PLANS[1].price} {PRICING_PLANS[1].cadence}.
            </p>
            <MonoMeta kind="qualifier" className="mt-4" items={["Illustrative pricing", "Deployment support included"]} />
          </Band>
        </div>
      </Specimen>

      <SpecimenGrid cols={2}>
        {/* compact strip */}
        <Specimen label="Compact strip · py-8" note="Logo and fact strips keep the container, drop the rhythm.">
          <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-bg">
            <Band spacing="compact" as="div" innerClassName="!px-5">
              <p className="m-0 mb-4 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">Runs with</p>
              <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-3 border-y border-hair py-4 pl-0">
                {RUNS_ON.map((id) => (
                  <li key={id} className="inline-flex items-center gap-2 text-[12.5px] text-ink-dim">
                    <RuntimeLogo id={id} size={16} decorative />
                    {logoLabel(id)}
                  </li>
                ))}
              </ul>
            </Band>
          </div>
        </Specimen>

        {/* hairline ladder */}
        <Specimen label="gap-px hairline grid" note="Three rungs divided by 1px gaps, never borders on every side.">
          <HairlineGrid cols={3} frame="open" surface="ground" as="ol" className="m-0 list-none pl-0">
            {PRICING_PLANS.map((p, i) => (
              <li key={p.id} className="flex flex-col gap-1 px-4 py-5">
                <span className={cn("font-mono text-[11px] tabular-nums", PLAN_TEXT[p.color])}>{String(i + 1).padStart(2, "0")}</span>
                <b className="text-[16px] font-semibold tracking-[-0.02em]">{p.name}</b>
                <span className="text-[12.5px] leading-snug text-ink-dim">{p.tagline}</span>
              </li>
            ))}
          </HairlineGrid>
        </Specimen>
      </SpecimenGrid>

      {/* article column */}
      <Specimen label="Article column · max 68ch" note="Long reads narrow to 68ch inside the same container.">
        <div className="overflow-hidden rounded-[14px] border border-hair-soft bg-bg">
          <Band spacing="compact" width="article" as="article" innerClassName="!py-9">
            <Kicker number="01" as="p">
              The two meters
            </Kicker>
            <h3 className="m-0 mt-5 text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.15] tracking-[-0.025em]">
              Tokens say what a space consumed. quirqs say what it delivered.
            </h3>
            <p className="m-0 mt-4 text-[15px] leading-[1.7] text-ink-dim">
              Session {session.id} in xo-space used {formatNumber(session.tokens)} tokens over {session.duration}, at a mock cost of{" "}
              {formatCurrency(session.cost)}. None of that is delivered work yet. A quirq is minted only when the owner&apos;s checks pass on the
              after snapshot, as Q = V · B.
            </p>
            <AccentBar spectrum className="mt-5">
              The usage meter and the quirq meter never mix. A session can burn a million tokens and mint nothing until its checks pass.
            </AccentBar>
            <MonoMeta kind="footnote" className="mt-4" items={["Session figures are mock data for this catalog."]} />
          </Band>
        </div>
      </Specimen>

      <DemoRule />

      {/* middle-dot facts and the divider family */}
      <SpecimenGrid cols={2}>
        <Specimen label="Middle-dot facts" note="Source facts, set off with ' · ' pseudo separators.">
          <div className="flex flex-col gap-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="flex items-center gap-2.5">
              <RuntimeLogo id="claude_code" size={18} tile />
              <span className="text-[14px] font-semibold">{claude.label}</span>
            </div>
            <FactLine
              aria-label={`${claude.label} facts`}
              items={["Installed", "Agent folder found", `Version ${claude.version}`, pluralize(claude.sessions, "session")]}
            />
            <FactLine mono aria-label="Space facts" items={[CURRENT_SPACE.name, CURRENT_SPACE.provider, CURRENT_SPACE.host]} />
          </div>
        </Specimen>

        <Specimen label="Separators · horizontal and vertical" note="1px only. Icon action groups take a left border.">
          <div className="flex flex-col gap-4 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            <div className="flex h-8 items-center gap-3 text-[12.5px] text-ink-dim">
              <span className="text-ink">Projects</span>
              <Separator orientation="vertical" />
              <span>Sessions</span>
              <Separator orientation="vertical" />
              <span>Inbox</span>
            </div>
            <Separator decorative={false} weight="soft" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[13px] font-medium">{CURRENT_SPACE.name}</span>
                <StateChip kind="space" state="running" />
              </div>
              <div role="group" aria-label="Space actions" className="flex items-center gap-0.5 border-l border-hair pl-2">
                <IconButton aria-label="Copy space ID" size="sm" tip>
                  <Copy />
                </IconButton>
                <IconButton aria-label="Restart space" size="sm" tip>
                  <RotateCw />
                </IconButton>
                <IconButton aria-label="Stop space" size="sm" tip variant="danger">
                  <Power />
                </IconButton>
              </div>
            </div>
            <LabeledRule aside="3 projects">Shared with you</LabeledRule>
          </div>
        </Specimen>

        <Specimen label="Accent left bar · 2px" note="The only line heavier than 1px, besides failure strips.">
          <AccentBar tone="blu">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-blu">Live</span>
            <p className="m-0 mt-1 text-[13px] text-ink">Watcher cursor advanced 4m ago. 18 events read from the xo-space timeline.</p>
          </AccentBar>
        </Specimen>

        <Specimen label="Failure strip · 3px" note="Reserved for failures.">
          <FailureStrip
            title={SPACE_START_FAILURE.title}
            action={
              <Button size="sm" variant="secondary" leadingIcon={<RotateCw />}>
                {SPACE_START_FAILURE.action}
              </Button>
            }
          >
            {SPACE_START_FAILURE.body}
          </FailureStrip>
        </Specimen>
      </SpecimenGrid>

      <DemoRule />

      {/* anchor smooth scroll */}
      <Specimen
        label="Interaction · anchor smooth scroll"
        note="Anchors scroll this page smoothly and land under the bar (scroll-margin-top). Reduced motion jumps instead; focus moves to the section."
      >
        <AnchorScroller
          aria-label="Sample page with in-page anchors"
          brand="XO"
          sections={[
            {
              id: "sb-a-how",
              label: "How it works",
              content: (
                <AnchorBody kicker="How it works" title="Pick a runtime and a model." tail="Running in about a minute.">
                  A space holds your projects, tools and state. Launch it on a laptop or let XO Swarm host it.
                </AnchorBody>
              ),
            },
            {
              id: "sb-a-pricing",
              label: "Pricing",
              content: (
                <AnchorBody kicker="Pricing" title="Pay per space." tail="Never per seat.">
                  {PRICING_PLANS.map((p) => `${p.name} ${p.price}`).join(" · ")}. Illustrative pricing.
                </AnchorBody>
              ),
            },
            {
              id: "sb-a-oss",
              label: "Open source",
              content: (
                <AnchorBody kicker="Open source" title="Run XO Space yourself." tail="Engine, API and dashboard.">
                  One command installs it on your own hardware. Community support.
                </AnchorBody>
              ),
            },
            {
              id: "sb-a-contact",
              label: "Get in touch",
              content: (
                <AnchorBody kicker="Get in touch" title="Tell us what you're running." tail="We'll take it from there.">
                  Anywhere else? Tell us where it needs to run.
                </AnchorBody>
              ),
            },
          ]}
        />
      </Specimen>
    </div>
  );
}

function AnchorBody({ kicker, title, tail, children }: { kicker: string; title: string; tail: string; children: ReactNode }) {
  return (
    <div>
      <Kicker>{kicker}</Kicker>
      <h3 data-anchor-heading tabIndex={-1} className="m-0 mt-4 text-[clamp(20px,2.4vw,26px)] font-semibold leading-tight tracking-[-0.02em]">
        {title} <span className="text-ink-dim">{tail}</span>
      </h3>
      <p className="m-0 mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-ink-dim">{children}</p>
    </div>
  );
}
