// Demo: eyebrow kicker and mono meta. Server component with a client replay island.
import { ACTIVITY, INBOX, NOW_ISO, ORBIT_CATEGORIES, PROJECTS, toneVar } from "@/lib/fixtures";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { DemoRule, Specimen, SpecimenGrid } from "./demo-kit";
import { Kicker, MapCaption, MonoMeta, RelativeTime, type MissingTime } from "./eyebrow";
import { ReplayStage } from "./replay-stage";
import { DotGrid } from "./texture";

const TODAY_LONG = formatDate(NOW_ISO, { withYear: true, weekday: false }); // "2 Oct 2026"

const MISSING: { label: string; word: MissingTime }[] = [
  { label: "Last sync", word: "Never" },
  { label: "Started", word: "Unknown" },
  { label: "Finished", word: "Not recorded" },
  { label: "Last checked", word: "Time unavailable" },
];

export default function EyebrowDemo() {
  const inbox = INBOX.slice(0, 4);
  const activity = ACTIVITY.slice(0, 3);
  const latest = ACTIVITY[0];
  return (
    <div className="flex flex-col gap-10">
      {/* the full sample line */}
      <Specimen label="Section opener" note="Numbered kicker, headline, then the mono byline with a relative time.">
        <div className="rounded-[18px] border border-hair-soft bg-[#0f0f11] p-[clamp(18px,3vw,28px)]">
          <Kicker number="02" rule as="p">
            The mint rule
          </Kicker>
          <h3 className="m-0 mt-5 max-w-[24ch] text-[clamp(22px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.028em]">
            Minted by verification. <span className="text-ink-dim">Never by assertion.</span>
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
            <MonoMeta items={["All xo-projects", TODAY_LONG]} />
            <span aria-hidden="true" className="font-mono text-[10.5px] text-ink-faint opacity-70">
              ·
            </span>
            <RelativeTime iso={latest.ts} now={NOW_ISO} />
          </div>
        </div>
      </Specimen>

      <SpecimenGrid cols={3}>
        <Specimen label="Plain">
          <div className="flex flex-col gap-4">
            <Kicker>How it works</Kicker>
            <Kicker>Open source</Kicker>
            <Kicker rule>Get in touch</Kicker>
          </div>
        </Specimen>
        <Specimen label="Numbered">
          <div className="flex flex-col gap-4">
            <Kicker number="01">The two meters</Kicker>
            <Kicker number="02" rule>
              The mint rule
            </Kicker>
            <Kicker number="03" chip={false}>
              Evidence
            </Kicker>
          </div>
        </Specimen>
        <Specimen label="As heading" note="When the kicker is the only title, it is the heading.">
          <Kicker as="h3" rule>
            Further reading
          </Kicker>
          <ul className="m-0 mt-4 flex list-none flex-col gap-2 pl-0 text-[13px] text-ink-dim">
            <li>Q = V · B, worked through one unit of work</li>
            <li>Why tokens are not delivered work</li>
          </ul>
        </Specimen>
      </SpecimenGrid>

      <DemoRule />

      <SpecimenGrid cols={2}>
        <Specimen label="Mono meta lines" note="Byline, qualifier, reassurance and method footnote. Honest qualifiers are brand behavior.">
          <dl className="m-0 grid gap-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            {(
              [
                ["Byline", <MonoMeta key="b" kind="byline" items={["XO Labs", "Draft v3", "July 2026"]} />],
                ["Qualifier", <MonoMeta key="q" kind="qualifier" items={["Pricing on application. Deployment support included."]} />],
                ["Reassurance", <MonoMeta key="r" kind="reassurance" items={["Anywhere else? Tell us where it needs to run."]} />],
                ["Footnote", <MonoMeta key="f" kind="footnote" items={["Illustrative arithmetic exhibiting the full calculation chain, not measurement."]} />],
              ] as const
            ).map(([term, node]) => (
              <div key={term} className="grid gap-1 sm:grid-cols-[96px_1fr] sm:gap-3">
                <dt className="text-[11.5px] text-ink-faint">{term}</dt>
                <dd className="m-0 min-w-0">{node}</dd>
              </div>
            ))}
          </dl>
        </Specimen>

        <Specimen label="Map caption with dot" note="Small uppercase captions over a canvas: overview kicker, focus edge label, legend.">
          <div className="relative h-[220px] overflow-hidden rounded-[14px] border border-hair-soft">
            <DotGrid ground rings />
            <svg aria-hidden="true" viewBox="0 0 400 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
              {ORBIT_CATEGORIES.map((c, i) => {
                const a = (i / ORBIT_CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
                const x = 200 + Math.cos(a) * 72;
                const y = 116 + Math.sin(a) * 46;
                return (
                  <g key={c.id}>
                    <line x1="200" y1="116" x2={x} y2={y} stroke="rgba(218,226,236,.12)" />
                    <circle cx={x} cy={y} r={4 + c.projects.length * 1.6} fill={toneVar(c.color)} opacity="0.85" />
                  </g>
                );
              })}
              <circle cx="200" cy="116" r="5" fill="#f4f3f0" />
            </svg>
            <div className="absolute inset-x-4 top-3.5">
              <MapCaption dot="#72d1b2" label={`All xo-projects · ${TODAY_LONG}`} />
            </div>
            <div className="absolute inset-x-4 bottom-10">
              <MapCaption label="Choose a category to explore" count={`${PROJECTS.length} projects mapped`} />
            </div>
            <div className="absolute inset-x-4 bottom-3.5">
              <MapCaption label="Projects · sessions · events" />
            </div>
          </div>
        </Specimen>
      </SpecimenGrid>

      <DemoRule />

      <SpecimenGrid cols={2}>
        <Specimen label="Relative time with full-date title · right-aligned column" note="Hover or focus a time to see the exact UTC date. Escape hides it.">
          <ul className="m-0 list-none divide-y divide-hair-soft rounded-[14px] border border-hair-soft bg-[#0f0f11] pl-0">
            {inbox.map((item) => (
              <li key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13px] text-ink">{item.title}</p>
                  <p className="m-0 truncate text-[12px] text-ink-faint">{item.detail}</p>
                </div>
                <RelativeTime iso={item.ts} now={NOW_ISO} layout="column" align="end" />
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen label="Relative time · two-line column" note="Activity rows set the absolute time over the relative one.">
          <ul className="m-0 list-none divide-y divide-hair-soft rounded-[14px] border border-hair-soft bg-[#0f0f11] pl-0">
            {activity.map((e) => (
              <li key={e.id} className="grid grid-cols-[128px_1fr] items-start gap-3 px-4 py-2.5">
                <RelativeTime iso={e.ts} now={NOW_ISO} layout="stacked" />
                <div className="min-w-0">
                  <p className="m-0 text-[13px] text-ink">{e.label}</p>
                  <p className="m-0 truncate text-[12px] text-ink-faint">
                    {e.actor} · {e.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Specimen>

        <Specimen label="Missing times" note="Words, never 0 or a blank.">
          <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
            {MISSING.map((m) => (
              <div key={m.word} className="min-w-0">
                <dt className="text-[11.5px] text-ink-faint">{m.label}</dt>
                <dd className="m-0 mt-0.5">
                  <RelativeTime iso={null} now={NOW_ISO} missing={m.word} />
                </dd>
              </div>
            ))}
          </dl>
        </Specimen>

        <Specimen label="States · static and revealed" note="Revealed kickers rise 24px and fade in, staggered by --d.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={cn("rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4")}>
              <p className="m-0 mb-3 text-[11.5px] text-ink-faint">Static</p>
              <Kicker>Observe</Kicker>
            </div>
            <div className="rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4">
              <p className="m-0 mb-3 text-[11.5px] text-ink-faint">Revealed</p>
              <ReplayStage
                stagger={0.08}
                className="flex flex-col gap-3"
                replayLabel="Replay"
                items={[
                  <Kicker key="k">The product</Kicker>,
                  <MonoMeta key="m" items={[pluralize(PROJECTS.length, "project"), TODAY_LONG]} />,
                ]}
              />
            </div>
          </div>
        </Specimen>
      </SpecimenGrid>
    </div>
  );
}
