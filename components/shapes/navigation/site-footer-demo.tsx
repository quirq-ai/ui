import { DemoCell, DemoGrid, DemoStack, Surface } from "./demo-kit";
import { MachineSpeedFooter, SiteFooter, SOCIAL_GLYPHS, type FooterColumn } from "./site-footer";

const COLUMNS: FooterColumn[] = [
  {
    title: "Site",
    links: [
      { label: "Products", href: "/products" },
      { label: "Research", href: "/research" },
      { label: "Writings", href: "/writings" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Get started", href: "/get-started" },
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "Hours-back calculator", href: "/calculator" },
      { label: "llm.txt", href: "/llm.txt", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Machine Speed", href: "/machine-speed", external: true },
      { label: "XO Labs", href: "https://example.com/xo-labs", external: true },
      { label: "Contact", href: "mailto:hello@example.com" },
    ],
  },
];

const SOCIAL = [
  { label: "quirq on X", href: "https://example.com/quirq-on-x", icon: SOCIAL_GLYPHS.x },
  { label: "quirq on Instagram", href: "https://example.com/quirq-on-instagram", icon: SOCIAL_GLYPHS.instagram },
];

const footer = {
  tagline: "Tokens meter consumption. quirqs meter delivery.",
  blurb: "One space, many runtimes. Any model, any cloud, any hardware.",
  columns: COLUMNS,
  copyright: "Copyright 2026 · quirq LLC",
};

export function SiteFooterDemo() {
  return (
    <DemoStack>
      <DemoCell label="quirq · 3 columns" note="Hover a link: ink-dim to ink. Social icons go from 70% to full opacity.">
        <Surface>
          <SiteFooter {...footer} social={SOCIAL} />
        </Surface>
      </DemoCell>

      <DemoGrid>
        <DemoCell label="quirq · 2 columns on narrow frames">
          <Surface className="mx-auto w-full max-w-[380px]">
            <SiteFooter {...footer} />
          </Surface>
        </DemoCell>

        <div className="flex min-w-0 flex-col gap-8">
          <DemoCell label="Link hover · default and hover">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] px-5 py-4">
              <span className="flex items-center gap-2 text-[13.5px] text-ink-dim">
                Writings <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">default</span>
              </span>
              <span className="flex items-center gap-2 text-[13.5px] text-ink">
                Writings <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">hover</span>
              </span>
              <span className="flex items-center gap-2 text-[#e9eae6]">
                <span className="text-[13.5px] underline decoration-[#e9eae6] underline-offset-4">quirq.ai</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Machine Speed hover</span>
              </span>
            </div>
          </DemoCell>

          <DemoCell label="Machine Speed" note="Sub-brand footer on the olive ground.">
            <Surface className="border-[rgba(233,234,230,0.12)]">
              <MachineSpeedFooter
                links={[
                  { label: "Ten-hour test", href: "/machine-speed/calculator" },
                  { label: "quirq.ai", href: "/", external: true },
                  { label: "hello@example.com", href: "mailto:hello@example.com" },
                ]}
              />
            </Surface>
          </DemoCell>
        </div>
      </DemoGrid>
    </DemoStack>
  );
}
