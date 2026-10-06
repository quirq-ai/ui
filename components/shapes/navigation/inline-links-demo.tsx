import { DemoCell, DemoGrid, DemoStack } from "./demo-kit";
import { RESEARCH_POSTS } from "./demo-data";
import { ArrowLink, CircleArrow, LinkedCard, RungStrip, type Rung } from "./inline-links";

const LADDER: Rung[] = [
  { num: "01", title: "Managed environment", desc: "We host and run it. Deploy in a click.", href: "#env", tone: "grn" },
  { num: "02", title: "Self-hosted install", desc: "One command. Open source. Your hardware.", href: "#cli", tone: "blu" },
  { num: "03", title: "Licensed", desc: "The managed product on your estate, your brand.", href: "#lic", tone: "org" },
];

const METHOD: Rung[] = [
  { num: "01", title: "The unit-of-work record", desc: "One uow per finished piece of work, with an owner and a budget B.", href: "#uow", tone: "blu" },
  { num: "02", title: "Verification by snapshot", desc: "Weighted checks on before and after snapshots give V.", href: "#verify", tone: "grn" },
];

const READ_ON: Rung[] = [
  { num: "01", title: "Foundations", desc: "What a quirq is, and what it is not.", href: "#foundations", tone: "blu" },
  { num: "02", title: "Accounting", desc: "QER, QV and IR with a window and a method.", href: "#accounting", tone: "grn" },
  { num: "03", title: "Evidence", desc: "Snapshots, checks and the owner's review.", href: "#evidence", tone: "org" },
  { num: "04", title: "Experiments", desc: "Nine trials and what they changed.", href: "#experiments", tone: "pur" },
];

const READING = RESEARCH_POSTS.slice(4, 7);

export function InlineLinksDemo() {
  return (
    <DemoStack>
      <DemoGrid>
        <DemoCell label="Text arrow · in-app → · hover nudges 4px">
          <div className="flex flex-col items-start gap-4 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-5">
            <ArrowLink href="/research">Read the research</ArrowLink>
            <ArrowLink href="/research" hovered>
              Read the research
            </ArrowLink>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Default, then hover</span>
          </div>
        </DemoCell>

        <DemoCell label="Mono · external ↗ · underlined · back chevron">
          <div className="flex flex-col items-start gap-4 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-5">
            <div className="flex flex-wrap gap-6">
              <ArrowLink href="/writings/agent-context" variant="mono">
                Read
              </ArrowLink>
              <ArrowLink href="/products" variant="mono">
                Open
              </ArrowLink>
            </div>
            <ArrowLink href="https://example.com/study" external>
              Read the study
            </ArrowLink>
            <ArrowLink href="https://example.com/canonical" variant="underline" external>
              Canonical version
            </ArrowLink>
            <ArrowLink href="/research" variant="back">
              Research
            </ArrowLink>
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoGrid>
        <DemoCell label="Circled ↗ · reading list" note="Hover a row: the circle brightens.">
          <ul className="overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11]">
            {READING.map((p, i) => (
              <li key={p.slug} className="border-b border-hair-soft last:border-b-0">
                <a href={`/research/${p.slug}`} className="group flex items-center gap-4 rounded-none! px-5 py-3.5 transition-colors hover:bg-white/[0.02] focus-visible:outline-offset-[-2px]!">
                  <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{p.title}</span>
                  <span className="font-mono text-[10.5px] text-ink-faint max-sm:hidden">{p.date}</span>
                  <CircleArrow size={i === 2 ? 22 : 26} />
                </a>
              </li>
            ))}
          </ul>
        </DemoCell>
        <DemoCell label="Linked card · arrow fades in on hover">
          <div className="grid gap-3 sm:grid-cols-2">
            <LinkedCard href="/writings/the-company-dashboard" kicker="Thoughts · 16 Sep" title="The company dashboard" meta="Why one view beats twelve tabs." />
            <LinkedCard href="https://example.com/whitepaper" external kicker="Whitepaper · PDF" title="Measuring delivered work" meta="The full method, 18 pages." />
          </div>
        </DemoCell>
      </DemoGrid>

      <DemoCell label="Rung strip · 3-col product ladder" note="Hover a rung: a 2% wash. Stacks on narrow frames.">
        <RungStrip aria-label="Ways to run XO" rungs={LADDER} />
      </DemoCell>

      <DemoCell label="Rung strip · 2-col · where the method comes from">
        <RungStrip aria-label="Where the method comes from" rungs={METHOD} columns={2} />
      </DemoCell>

      <DemoCell label="Rung strip · stacked on a phone" note="Rungs stack with top hairlines.">
        <div className="max-w-[360px]">
          <RungStrip aria-label="Ways to run XO, stacked" rungs={LADDER} />
        </div>
      </DemoCell>

      <DemoCell label="Rung strip · 4-col · read on">
        <RungStrip aria-label="Read on" rungs={READ_ON} columns={4} />
      </DemoCell>
    </DemoStack>
  );
}
