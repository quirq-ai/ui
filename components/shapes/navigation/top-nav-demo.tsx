"use client";

import { useState, type ReactNode } from "react";
import { Caption, DemoCell, DemoGrid, DemoStack, Readout, Surface } from "./demo-kit";
import { MachineSpeedHead, ThirdPartyHeader, TopNav, type TopNavLink, type TopNavMenuItem } from "./top-nav";

const PRODUCTS: TopNavMenuItem[] = [
  { label: "XO Space", description: "Open-source environment software that runs a space on your machine.", href: "#xo-space", tone: "blu" },
  { label: "XO Swarm", description: "Hosted management that launches and runs many spaces.", href: "#xo-swarm", tone: "grn" },
  { label: "Space Drift", description: "A visualizer that drifts through projects, sessions and files.", href: "#space-drift", tag: "Experiment", group: "Labs" },
];

function links(current: string | null): TopNavLink[] {
  return [
    { label: "Products", href: "/products", menu: PRODUCTS, current: current === "Products" },
    { label: "Research", href: "/research", current: current === "Research" },
    { label: "Machine Speed", href: "/machine-speed", external: true },
    { label: "Docs", href: "/docs", current: current === "Docs" },
  ];
}

const CTA = { label: "Get started", href: "/get-started" };

/** Dark hero art behind the bar so the transparent state reads. */
function Hero({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background:
          "radial-gradient(ellipse 70% 90% at 18% -10%, rgba(46,155,255,0.30), transparent 60%), radial-gradient(ellipse 60% 80% at 92% 0%, rgba(191,90,242,0.22), transparent 55%), #08080a",
      }}
    >
      {children}
    </div>
  );
}

function HeroCopy({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "px-[clamp(16px,4vw,32px)] pb-6 pt-5" : "px-[clamp(16px,4vw,32px)] pb-8 pt-8"}>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-dim">XO · spaces for agent work</p>
      <p className="mt-2 max-w-[30ch] text-[clamp(20px,2.6vw,28px)] font-semibold leading-[1.15] tracking-[-0.025em]">
        Secure environments for agent work, <span className="text-ink-dim">on any machine.</span>
      </p>
    </div>
  );
}

export function TopNavDemo() {
  const [current, setCurrent] = useState<string>("Research");
  const [last, setLast] = useState("/research");
  const [scrolled, setScrolled] = useState(false);
  const [tpCurrent, setTpCurrent] = useState("Product");

  const navigate = (href: string, label: string) => {
    setLast(href);
    if (["Products", "Research", "Docs"].includes(label)) setCurrent(label);
  };

  return (
    <DemoStack>
      <DemoCell label="Desktop · transparent at top · active underline" note="Click a link: the current one gets the hairline underline and aria-current.">
        <Surface>
          <Hero>
            <TopNav links={links(current)} cta={CTA} onNavigate={navigate} />
            <HeroCopy />
          </Hero>
        </Surface>
        <Readout label="Navigated to">{last}</Readout>
      </DemoCell>

      <DemoCell label="Scrolled · black/75 with bottom hairline">
        <Surface>
          <Hero>
            <TopNav links={links("Docs")} cta={CTA} scrolled onNavigate={() => undefined} />
            <HeroCopy compact />
          </Hero>
        </Surface>
      </DemoCell>

      <DemoCell label="Products menu · open · Labs kept apart" note="Arrow keys move through the panel, Esc closes it.">
        {/* The frame is a container: under 760px the bar collapses and the open menu needs the extra height. */}
        <div className="@container">
          <Surface className="min-h-[640px] @[760px]:min-h-[400px]">
            <Hero className="min-h-[640px] @[760px]:min-h-[400px]">
              <TopNav links={links("Products")} cta={CTA} defaultDropdown="Products" defaultMenuOpen onNavigate={navigate} />
            </Hero>
          </Surface>
        </div>
      </DemoCell>

      <DemoCell label="Scroll style · scroll inside the frame" note="Past 40px the bar turns black/75 and gains its hairline.">
        <div
          tabIndex={0}
          role="region"
          aria-label="Scrollable page preview"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}
          className="scroll-thin relative h-[300px] overflow-y-auto rounded-[14px] border border-hair bg-bg"
        >
          <TopNav links={links("Research")} cta={CTA} position="sticky" scrolled={scrolled} onNavigate={navigate} />
          <Hero className="-mt-16 pt-16">
            <HeroCopy />
          </Hero>
          <div className="space-y-4 px-[clamp(16px,4vw,32px)] py-8 text-[14px] leading-relaxed text-ink-dim">
            {SCROLL_COPY.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <Readout label="Bar style">{scrolled ? "Scrolled · black/75 + hairline" : "Top of page · gradient to transparent"}</Readout>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="Mobile menu · open" note="Collapsed under 760px of frame width.">
          <Surface className="mx-auto min-h-[330px] w-full max-w-[380px]">
            <Hero className="min-h-[330px]">
              <TopNav links={links("Research")} cta={CTA} layout="mobile" defaultMenuOpen onNavigate={navigate} />
            </Hero>
          </Surface>
        </DemoCell>
        <div className="flex min-w-0 flex-col gap-8">
          <DemoCell label="Machine Speed head" note="Sub-brand: olive ground, bars mark, underlined back link.">
            <Surface className="border-[rgba(233,234,230,0.12)]">
              <MachineSpeedHead page="Hours-back calculator" />
            </Surface>
          </DemoCell>
          <DemoCell label="Third-party header · inside telescope" note="Deliberately off-brand. Click Product, Pricing or About.">
            <Surface className="border-[#e6e2d8]">
              <ThirdPartyHeader
                brand="Acme Notes"
                brandHref="/"
                onNavigate={() => undefined}
                links={[
                  { label: "Product", href: "/" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "About", href: "/about" },
                ]}
                current={tpCurrent}
                onCurrentChange={setTpCurrent}
                cta={{ label: "Start free", href: "/pricing" }}
              />
              <div className="bg-[#fbfaf7] px-[clamp(16px,4vw,32px)] py-4 text-[13px] text-[#5b6475]">
                <Caption className="text-[#6b7180]">{tpCurrent} current</Caption>
                <p className="mt-1 text-[#1d2433]">Notes that link themselves.</p>
              </div>
            </Surface>
          </DemoCell>
        </div>
      </DemoGrid>
    </DemoStack>
  );
}

const SCROLL_COPY = [
  "A space is the environment where agents work with your projects, tools and state. It runs on a laptop, in a sandbox or in a hosted container, and the trust boundary goes with it.",
  "XO Space is the open-source software that runs one space. XO Swarm is the hosted management that launches many of them.",
  "Tokens meter what the work consumed. quirqs meter what was delivered, minted only after the before and after snapshots pass the owner's checks.",
  "Keep scrolling: the bar keeps its place and changes style once the page moves past 40px.",
];
