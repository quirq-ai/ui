// Demo: accordion and disclosure. Server component; the accordions are client islands and
// the disclosures are native <details>.
import { RUNTIME_BY_ID, HOURS_BACK_DEFAULTS, QUIRQ_THRESHOLD, CURRENT_SPACE } from "@/lib/fixtures";
import { formatPercent, pluralize } from "@/lib/format";
import { Field, Input, RuntimeLogo, StateChip } from "@/components/ui";
import { NumberedAccordion, LayerAccordion, type LayerItem } from "./accordion";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { DetailsBox, Disclosure, FaqItem } from "./disclosure";
import { Kicker, MonoMeta } from "./eyebrow";
import { AccentBar } from "./section";
import { DotGrid } from "./texture";

/* Runtimes that are both fixture ids and logo ids. */
const OTHER_AGENTS = ["codex", "openclaw"] as const;

const LAYERS: LayerItem[] = [
  {
    num: "01",
    name: "Observatory",
    tone: "blu",
    heading: "The view over everything",
    body: "Graph, timeline and sessions: what ran, what it cost, and what data it touched. Metered across runtimes, models, channels and outputs.",
  },
  {
    num: "02",
    name: "Environments",
    tone: "grn",
    heading: "Runtime, model, memory and tools",
    body: "Hermes, OpenClaw, n8n, Claude Code, Codex or your own. The environment packages any runtime with any model and ships a record it cannot fake.",
  },
  {
    num: "03",
    name: "Spaces",
    tone: "org",
    heading: "Your cloud or local devices",
    body: "From hyperscaler rails to your own racks and Macs. The same space runs anywhere Terraform reaches, on-prem or air-gapped.",
  },
];

function LayersArt() {
  const plates = [
    { y: 34, c: "var(--blu)" },
    { y: 104, c: "var(--grn)" },
    { y: 174, c: "var(--org)" },
  ];
  return (
    <div className="flex h-full items-center justify-center rounded-[10px] bg-[#1c1710] p-6">
      <svg viewBox="0 0 220 280" className="h-auto w-[74%] max-w-[240px]" aria-hidden="true">
        {plates.map((p, i) => (
          <g key={i} transform={`translate(0 ${p.y})`}>
            <path d="M110 0 L210 42 L110 84 L10 42 Z" fill={p.c} fillOpacity="0.14" stroke={p.c} strokeOpacity="0.7" />
            <path d="M10 42 L10 52 L110 94 L210 52 L210 42 L110 84 Z" fill={p.c} fillOpacity="0.32" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AccordionDemo() {
  return (
    <div className="flex flex-col gap-10">
      {/* numbered workflow */}
      <Specimen
        label="Numbered workflow · single open"
        note="Collapsed rows sit at .5, .8 on hover, 1 on focus. Up and Down move between rows. Numbers are step order, not layer colors."
      >
        <div className="grid items-center gap-[clamp(24px,4vw,56px)] rounded-[18px] border border-hair-soft bg-bg p-[clamp(18px,3vw,32px)] md:grid-cols-2">
          <div className="relative hidden aspect-[941/871] overflow-hidden rounded-[8.5px] border border-hair-strong md:block">
            <DotGrid ground rings />
            <svg viewBox="0 0 400 370" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {[
                [200, 185, 6, "#f4f3f0"],
                [120, 110, 9, "var(--blu)"],
                [290, 120, 7, "var(--grn)"],
                [300, 260, 10, "var(--pur)"],
                [110, 270, 6, "var(--org)"],
                [210, 70, 5, "var(--yel)"],
              ].map(([x, y, r, c], i) => (
                <g key={i}>
                  <line x1="200" y1="185" x2={x} y2={y} stroke="rgba(218,226,236,.14)" />
                  <circle cx={x} cy={y} r={r} fill={c as string} opacity="0.9" />
                </g>
              ))}
            </svg>
          </div>
          <div className="min-w-0">
            <Kicker>How it works</Kicker>
            <h3 className="m-0 mb-8 mt-5 text-[clamp(26px,3.6vw,44px)] font-[660] leading-[1.12] tracking-[-0.028em]">
              Accelerate your
              <br />
              agent workflows
            </h3>
            <NumberedAccordion
              idPrefix="acc-num"
              headingAs="h4"
              items={[
                { num: "01", title: "Deploy a space", body: "Pick a runtime and a model. Running in about a minute." },
                { num: "02", title: "Manage your space", body: "Budgets, permissions and channels where your team already works." },
                { num: "03", title: "Observe productivity", body: "Look past token cost to QER, QV and IR, each shown with its window and method." },
              ]}
            />
          </div>
        </div>
      </Specimen>

      {/* layers */}
      <Specimen label="Three-layer with color rail" note="Layer colors: Observatory blue, Environments green, Spaces orange. The rail grows with the open layer.">
        <div className="rounded-[18px] border border-hair-soft bg-bg p-[clamp(18px,3vw,32px)]">
          <LayerAccordion idPrefix="acc-layers" headingAs="h4" items={LAYERS} art={<LayersArt />} />
        </div>
      </Specimen>

      <SpecimenGrid cols={2}>
        <Specimen label="Three-layer · mobile, no rail">
          <div className="mx-auto max-w-[380px] rounded-[18px] border border-hair-soft bg-bg p-4">
            <LayerAccordion idPrefix="acc-layers-m" headingAs="h4" rail={false} items={LAYERS} defaultOpen={1} />
          </div>
        </Specimen>

        <Specimen label="FAQ" note="Question rows divided by hairlines. Native details: Enter or Space toggles.">
          <div className="rounded-[18px] border border-hair-soft bg-[#0f0f11] px-5 pb-1">
            <FaqItem question="Can a space run on my own laptop?" defaultOpen>
              Yes. XO Space is open source: the engine, Space API and Space dashboard run locally, and nothing leaves the machine unless you connect
              something.
            </FaqItem>
            <FaqItem question="Where do connector credentials live?">Inside the space that uses them. Secrets show as masked names only.</FaqItem>
            <FaqItem question="Is a session the same as a task?" className="border-b-0">
              No. A session is an agent conversation and its history; it can span several tasks, and each todo inside it is a step.
            </FaqItem>
          </div>
        </Specimen>
      </SpecimenGrid>

      <DemoRule />

      <SpecimenGrid cols={2}>
        <Specimen label="Method details · quirq" note="Blue summary with a mono +/- marker. First item open.">
          <div className="rounded-[16px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3vw,26px)]">
            <Disclosure summary="How a quirq is minted" defaultOpen>
              <AccentBar tone="blu">
                Q &nbsp;=&nbsp; V &nbsp;·&nbsp; B
                <br />
                <span className="text-ink-dim">
                  V is verified completion (0 to 1) from weighted checks on before and after snapshots. B is the budget the owner set before the work
                  ran.
                </span>
              </AccentBar>
              <p className="m-0 mt-3">
                Units with V below {QUIRQ_THRESHOLD} count toward the intervention rate. Missing evidence reads Unavailable, never 0.
              </p>
            </Disclosure>
            <Disclosure summary="Why tokens are not delivered work" divided>
              Tokens measure what a session consumed. A run can spend a million tokens and deliver nothing an owner would accept.
            </Disclosure>
            <Disclosure summary="What the window and method say" divided>
              QER, QV and IR are always shown with the window they cover and the method that produced them.
            </Disclosure>
          </div>
        </Specimen>

        <Specimen label="Method details · Machine Speed" note="'+ ' and '- ' prefixes on the olive ground.">
          <div className="rounded-[16px] p-[clamp(18px,3vw,26px)]" style={{ background: "#10120f" }}>
            <Disclosure variant="machine-speed" summary="The equation, and the one assumption in it" defaultOpen>
              <AccentBar tone="grn" className="font-mono text-[12.5px]">
                Hours back a week = {HOURS_BACK_DEFAULTS.hoursPerWeek} hrs on repeating work × {formatPercent(HOURS_BACK_DEFAULTS.automationShare)}
                <br />= {HOURS_BACK_DEFAULTS.resultHours} hours
              </AccentBar>
              <MonoMeta kind="footnote" className="mt-3" items={["Illustrative. Hours, not quirqs."]} />
            </Disclosure>
            <Disclosure variant="machine-speed" summary="Why hours and not just cost" divided>
              Cost falling is easy to fake. The test that cannot be gamed is whether the hours actually left your week.
            </Disclosure>
            <Disclosure variant="machine-speed" summary="What ten hours a week is actually for" divided>
              Hours returned with nowhere to go are absorbed inside a fortnight. Decide where they go before the workflow ships.
            </Disclosure>
          </div>
        </Specimen>

        <Specimen label="Setup details boxes" note="Radius 9, soft line, ▸ chevron. Open boxes rule the summary off.">
          <div className="flex flex-col gap-3">
            <DetailsBox summary="Folder and connection details" defaultOpen>
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px]">
                <dt className="text-ink-faint">Projects folder</dt>
                <dd className="m-0 min-w-0 truncate font-mono text-ink">~/projects</dd>
                <dt className="text-ink-faint">Space API</dt>
                <dd className="m-0 min-w-0 truncate font-mono text-ink">{CURRENT_SPACE.url}</dd>
                <dt className="text-ink-faint">Status</dt>
                <dd className="m-0">
                  <StateChip kind="space" state="running" variant="plain" />
                </dd>
              </dl>
            </DetailsBox>
            <DetailsBox summary="Other agents" count={2}>
              <ul className="m-0 flex list-none flex-col gap-2 pl-0">
                {OTHER_AGENTS.map((id) => {
                  const r = RUNTIME_BY_ID[id];
                  return (
                    <li key={id} className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-ink">
                        <RuntimeLogo id={id} size={14} decorative />
                        {r.label}
                      </span>
                      <span className="font-mono text-[11px] text-ink-faint">
                        {r.version ? `v${r.version}` : "Not installed"} · {pluralize(r.sessions, "session")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </DetailsBox>
          </div>
        </Specimen>

        <Specimen label="Advanced settings · inline" note="An inline Advanced section inside a form; closed by default.">
          <form className="flex flex-col gap-3 rounded-[14px] border border-hair bg-s1 p-4" aria-label="Connector polling">
            <Field id="acc-poll-name" label="Connector">
              <Input defaultValue="GitHub" readOnly />
            </Field>
            <DetailsBox variant="inline" summary="Advanced">
              <div className="flex flex-col gap-3 pr-1">
                <Field id="acc-poll-interval" label="Poll interval" hint="Minutes between polls. 5 to 60.">
                  <Input type="number" min={5} max={60} defaultValue={15} mono trailing="min" />
                </Field>
                <Field id="acc-poll-port" label="Callback port">
                  <Input defaultValue="4100" mono inputMode="numeric" />
                </Field>
              </div>
            </DetailsBox>
          </form>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}
