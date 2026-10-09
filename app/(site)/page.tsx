import { ArrowRight } from "lucide-react";
import { Eyebrow, Wordmark } from "@/components/brand/mark";
import {
  Badge,
  Button,
  ButtonLink,
  CopyField,
  Field,
  Input,
  Kbd,
  Panel,
  PanelHeader,
  ProgressBar,
  Segmented,
  StatusPill,
  Switch,
  Tooltip,
  type Tone,
} from "@/components/ui";
import { site } from "@/lib/site";

const TONES: Tone[] = ["neutral", "red", "org", "yel", "grn", "cyn", "blu", "pur"];

/* Starter page: replace it with your app. The sections below show the brand and
   the primitives in components/ui so you can see what is available. */
export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 opacity-[0.2] blur-[90px]"
          style={{ background: "conic-gradient(from 180deg at 50% 50%, #ff453a, #ff9f0a, #ffd60a, #30d158, #2fd2ff, #2e9bff, #bf5af2, #ff453a)" }}
        />
        <div className="relative mx-auto max-w-[var(--max)] px-[clamp(20px,5vw,44px)] pb-16 pt-[clamp(64px,11vh,120px)]">
          <Eyebrow rule>{site.title}</Eyebrow>
          <h1 className="mt-6 max-w-[860px] text-[clamp(38px,5.6vw,70px)] font-[620] leading-[1.03] tracking-[-0.035em]">
            Start here. <span className="text-ink-dim">Brand, tokens and primitives are already wired.</span>
          </h1>
          <p className="mt-6 max-w-[620px] text-[clamp(15px,1.7vw,18px)] text-ink-dim">
            Edit <code className="font-mono text-[0.9em] text-ink">app/(site)/page.tsx</code> to begin, and{" "}
            <code className="font-mono text-[0.9em] text-ink">lib/site.ts</code> to rename the project.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#components" variant="primary" size="lg" trailingIcon={<ArrowRight aria-hidden="true" />}>
              See the components
            </ButtonLink>
            <ButtonLink href={site.repo} variant="ghost" size="lg" target="_blank" rel="noopener">
              View on GitHub
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="components" aria-labelledby="components-title" className="mx-auto max-w-[var(--max)] scroll-mt-24 px-[clamp(20px,5vw,44px)] py-12">
        <Eyebrow rule>Components</Eyebrow>
        <h2 id="components-title" className="mt-5 text-[clamp(26px,3.4vw,40px)] font-[660] leading-[1.1] tracking-[-0.028em]">
          What ships in the box. <span className="text-ink-dim">Import it all from @/components/ui.</span>
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Panel variant="glass" padding="lg">
            <PanelHeader kicker="Brand" title="Marks and type" />
            <div className="mt-6 flex items-center gap-6">
              <Wordmark height={44} />
              <span className="spec-text text-[32px] font-[660] tracking-[-0.02em]">spectrum</span>
            </div>
            <p className="mt-5 text-[13px] text-ink-dim">
              System grotesque for body, <span className="font-mono">IBM Plex Mono</span> for labels and numbers,{" "}
              <span className="font-round">Quicksand</span> for the logotype.
            </p>
          </Panel>

          <Panel padding="lg">
            <PanelHeader kicker="Actions" title="Buttons" />
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button variant="primary">Get started</Button>
              <Button variant="ghost">Learn more</Button>
              <Button>Secondary</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="danger">Remove</Button>
              <Button loading>Saving</Button>
            </div>
          </Panel>

          <Panel padding="lg">
            <PanelHeader kicker="Status" title="Badges and state" />
            <div className="mt-6 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <Badge key={t} tone={t} dot={t !== "neutral"}>
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill status="up" label="Running" pulse />
              <StatusPill status="warn" label="Needs attention" />
              <StatusPill status="down" label="Stopped" />
              <StatusPill status="idle" label="Idle" />
            </div>
            <div className="mt-5">
              <ProgressBar value={64} label="Setup" />
            </div>
          </Panel>

          <Panel padding="lg">
            <PanelHeader kicker="Inputs" title="Fields and controls" />
            <div className="mt-6 space-y-4">
              <Field id="starter-name" label="Project name" hint="Lowercase, no spaces.">
                <Input id="starter-name" defaultValue="my-project" mono />
              </Field>
              <Segmented
                aria-label="View"
                defaultValue="list"
                options={[
                  { value: "list", label: "List" },
                  { value: "graph", label: "Graph" },
                  { value: "tree", label: "Tree" },
                ]}
              />
              <Switch label="Send usage reports" defaultChecked />
              <CopyField value="pnpm install && pnpm dev" prompt="$" label="Run locally" />
              <p className="flex items-center gap-2 text-[13px] text-ink-dim">
                Search with <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
                <Tooltip content="Tooltips work on hover and focus">
                  <button type="button" className="rounded-md border border-hair px-2 py-0.5 text-[12px] text-ink-dim">
                    Hover me
                  </button>
                </Tooltip>
              </p>
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
