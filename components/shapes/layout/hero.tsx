// Heroes: claim, sub and one primary CTA, with optional art. Server-safe shells; the
// staggered reveal is the client Reveal, and the two interactive heroes (space-drift intro
// and the galileo sample app) live in hero-client.tsx.
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";
import { PrismArt, SpectralGlow } from "./texture";

export type HeadingTag = "h2" | "h3" | "h4" | "h5";

/* ----------------------------------------------------------------------------- SplitHero */

export type SplitHeroProps = {
  /** Wordmark or eyebrow above the headline. */
  brand?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  /** Primary pill then ghost pill. One primary per page. */
  actions?: ReactNode;
  /** Right column art; defaults to the prism. */
  art?: ReactNode;
  /** Stagger the copy in on mount (.08s, .16s, .24s; art at .1s). */
  reveal?: boolean;
  /** Bump to replay the reveal. */
  revealKey?: number;
  idPrefix?: string;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
};

/** Desktop split, mobile stacked: copy left, refraction art right. */
export function SplitHero({
  brand,
  title,
  sub,
  actions,
  art,
  reveal = false,
  revealKey = 0,
  idPrefix = "split",
  titleAs: Title = "h1",
  className,
}: SplitHeroProps) {
  const wrap = (d: number, children: ReactNode, c?: string) =>
    reveal ? (
      <Reveal key={`${revealKey}-${d}`} trigger="mount" delay={d} className={c}>
        {children}
      </Reveal>
    ) : (
      <div className={c}>{children}</div>
    );
  return (
    <header className={cn("@container relative grid items-center gap-8 overflow-hidden md:grid-cols-[1.02fr_.98fr] md:gap-5", className)}>
      <div className="relative z-[1] min-w-0">
        {brand ? wrap(0, brand) : null}
        {wrap(0.08, <Title className="m-0 text-[clamp(28px,5cqi,48px)] font-semibold leading-[1.18] tracking-[-0.02em]">{title}</Title>)}
        {sub ? wrap(0.16, <p className="m-0 mt-4 text-[clamp(16px,1.7vw,22px)] font-bold text-white/70">{sub}</p>) : null}
        {actions ? wrap(0.24, actions, "mt-8 flex flex-wrap gap-4") : null}
      </div>
      {wrap(
        0.1,
        art ?? <PrismArt idPrefix={`${idPrefix}-prism`} />,
        "relative mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center",
      )}
    </header>
  );
}

/* ----------------------------------------------------------------------------- StatementHero */

export type StatementHeroProps = {
  title: ReactNode;
  body?: ReactNode;
  /** Quiet in-app link with an arrow: "Read the research". */
  link?: { label: string; href: string };
  glow?: boolean;
  /** Heading level; h2 on a page, lower inside a catalog or a card. */
  titleAs?: HeadingTag;
  className?: string;
};

/** Centered display statement over a blurred spectral glow. */
export function StatementHero({ title, body, link, glow = true, titleAs: Title = "h2", className }: StatementHeroProps) {
  return (
    <section className={cn("relative overflow-hidden px-5 py-[clamp(48px,7vw,84px)] text-center", className)}>
      {glow ? <SpectralGlow className="left-1/2 top-[8%] h-[54%] w-[130%] -translate-x-1/2" opacity={0.62} blur={40} /> : null}
      <div className="relative z-[1]">
        <Title className="m-0 text-[clamp(32px,5.25vw,64px)] font-semibold leading-[1.15] tracking-[-0.03em]">{title}</Title>
        {body ? (
          <p className="mx-auto mb-0 mt-4 max-w-[46ch] text-[clamp(15px,1.8vw,22px)] font-medium leading-[1.55] text-white/70">{body}</p>
        ) : null}
        {link ? (
          <a
            href={link.href}
            className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-white/55 transition-colors hover:text-white"
          >
            {link.label}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- AuroraHero */

export const AURORA_BG =
  "radial-gradient(120% 90% at 50% -10%, rgba(46,155,255,.13), transparent 60%), radial-gradient(90% 70% at 12% 100%, rgba(48,209,88,.10), transparent 60%), radial-gradient(90% 70% at 88% 90%, rgba(191,90,242,.10), transparent 60%), #08080a";

/** Products hero panel: aurora of three layer-adjacent hues at 10 to 13% on #08080a. */
export function AuroraHero({
  title,
  tail,
  actions,
  titleAs: Title = "h2",
  className,
}: {
  title: ReactNode;
  tail?: ReactNode;
  actions?: ReactNode;
  titleAs?: HeadingTag;
  className?: string;
}) {
  return (
    <section
      className={cn("relative overflow-hidden rounded-[22px] border border-hair-soft px-6 py-[clamp(48px,8vw,88px)] text-center", className)}
      style={{ background: AURORA_BG }}
    >
      <Title className="m-0 text-[clamp(32px,5.6vw,72px)] font-semibold leading-[0.98] tracking-[-0.045em]">
        {title}
        {tail ? (
          <>
            <br />
            <span className="text-ink-dim">{tail}</span>
          </>
        ) : null}
      </Title>
      {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{actions}</div> : null}
    </section>
  );
}

/* ----------------------------------------------------------------------------- GhostWordsHero */

export type GhostWordsHeroProps = {
  /** Sub-brand identity next to the bars mark. */
  label: string;
  /** Workflow names above the headline, faintest first. */
  above: string[];
  title: ReactNode;
  /** Gradient italic emphasis at the end of the headline. */
  emphasis: string;
  below: string[];
  lead: ReactNode;
  body?: ReactNode;
  /** Right plate; collapses under the copy on narrow screens. */
  art?: ReactNode;
  titleAs?: HeadingTag;
  className?: string;
};

const GHOST = ["rgba(233,234,230,.06)", "rgba(233,234,230,.1)", "rgba(233,234,230,.16)"];

/** Machine Speed split hero on the olive ground: workflow names as ghost texture around the claim. */
export function GhostWordsHero({ label, above, title, emphasis, below, lead, body, art, titleAs: Title = "h2", className }: GhostWordsHeroProps) {
  return (
    <header
      className={cn("grid gap-5 rounded-[18px] p-4 md:grid-cols-[1fr_minmax(220px,36%)]", className)}
      style={{ background: "#10120f", color: "#e9eae6" } as CSSProperties}
    >
      <div className="flex min-w-0 flex-col px-2 py-4 sm:px-4">
        <span role="img" aria-label={label} className="inline-flex gap-1">
          {[0, 1, 2].map((i) => (
            <i key={i} className="block h-[18px] w-[6px] -skew-x-[24deg] rounded-[1.5px]" style={{ background: "#e9eae6" }} />
          ))}
        </span>
        <div className="relative flex flex-1 flex-col justify-center py-8">
          <div aria-hidden="true" className="mb-3 self-start text-right text-[clamp(15px,2vw,22px)] font-medium leading-[1.6] tracking-[-0.01em] sm:w-[58%]">
            {above.map((w, i) => (
              <div key={w} className={cn("whitespace-nowrap", i === 0 && "italic")} style={{ color: GHOST[i % 3] }}>
                {w}
              </div>
            ))}
          </div>
          <Title className="relative z-[2] m-0 max-w-[15em] text-[clamp(26px,3.4vw,42px)] font-semibold leading-[1.18] tracking-[-0.015em]">
            {title}{" "}
            <em
              className="not-italic sm:italic"
              style={{
                background: "linear-gradient(95deg, #ffb46b 0%, #ff5e8a 45%, #57d9ff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {emphasis}
            </em>
          </Title>
          <div aria-hidden="true" className="mt-3 text-[clamp(15px,2vw,22px)] font-medium leading-[1.6] tracking-[-0.01em] sm:ml-[42%]">
            {below.map((w, i) => (
              <div key={w} className={cn("whitespace-nowrap", i === 0 && "italic")} style={{ color: GHOST[2 - (i % 3)] }}>
                {w}
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-[560px]">
          <p className="m-0 text-[17px] font-semibold">{lead}</p>
          {body ? <p className="m-0 mt-2 text-[14px] leading-[1.7]" style={{ color: "#a6a8a0" }}>{body}</p> : null}
        </div>
      </div>
      {art ? <div className="relative min-h-[220px] overflow-hidden rounded-[16px]">{art}</div> : null}
    </header>
  );
}

/* ----------------------------------------------------------------------------- WelcomeBanner */

export type WelcomeBannerProps = {
  /** First name; omit and the greeting drops the comma. */
  name?: string | null;
  kicker: string;
  description: ReactNode;
  action?: ReactNode;
  titleAs?: HeadingTag;
  className?: string;
};

/** App welcome banner: green kicker chip, greeting, one line of orientation, one action. */
export function WelcomeBanner({ name, kicker, description, action, titleAs: Title = "h2", className }: WelcomeBannerProps) {
  const display = name?.trim();
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-grn/25 p-5 pl-6",
        "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-grn before:content-['']",
        className,
      )}
      style={{ background: "linear-gradient(135deg, rgba(48,209,88,.10), #0d0d0d 46%, #000 100%)" }}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="m-0 inline-flex items-center gap-2 rounded-[6px] border border-grn/25 bg-grn/10 px-2 py-1 text-[12px] font-medium text-grn">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-grn" />
            {kicker}
          </p>
          <div className="space-y-1">
            <Title className="m-0 text-[clamp(22px,2.4vw,30px)] font-semibold leading-tight tracking-[-0.015em]">
              Welcome back{display ? `, ${display}` : ""}
            </Title>
            <p className="m-0 max-w-2xl text-[13.5px] leading-relaxed text-ink-dim">{description}</p>
          </div>
        </div>
        {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- WikiWelcome */

export type QuickstartStep = { n: string; title: string; body: string; action?: ReactNode };

export type WikiWelcomeProps = {
  kicker: string;
  title: ReactNode;
  description: ReactNode;
  docs?: { label: string; href: string };
  steps: QuickstartStep[];
  /** Deep-linked step: gets the 2px accent outline. */
  highlight?: string;
  /** Title level; the Quickstart head and step titles sit one and two levels below. */
  level?: 2 | 3;
  className?: string;
};

/** Space wiki welcome: radial accent glow at top right, title, docs link and three quickstart steps. */
export function WikiWelcome({ kicker, title, description, docs, steps, highlight, level = 2, className }: WikiWelcomeProps) {
  const [H1, H2, H3] = (level === 2 ? ["h2", "h3", "h4"] : ["h3", "h4", "h5"]) as [HeadingTag, HeadingTag, HeadingTag];
  return (
    <section
      className={cn("relative overflow-hidden rounded-[14px] border border-hair-soft p-5 sm:p-6", className)}
      style={{ background: "radial-gradient(60% 80% at 100% 0%, rgba(131,214,58,.07), transparent 60%), #0b0c0f" }}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="m-0 mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{kicker}</p>
          <H1 className="m-0 text-[clamp(26px,3.6vw,36px)] font-medium leading-[1.12] tracking-[-0.02em]">{title}</H1>
          <p className="m-0 mt-2 max-w-[78ch] text-[13px] leading-relaxed text-ink-dim">{description}</p>
        </div>
        {docs ? (
          <a
            href={docs.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-hair bg-s2 px-3 py-2.5 text-[12px] text-ink transition-colors hover:border-hair-strong"
          >
            {docs.label}
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
      <div className="mt-5 rounded-[12px] border border-hair bg-s1 px-4 py-3 sm:px-[18px]">
        <H2 className="m-0 mb-2.5 text-[14px] font-medium">Quickstart</H2>
        <ol className="m-0 grid list-none gap-0 p-0 sm:grid-cols-3 sm:gap-[22px]">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className={cn(
                "flex min-w-0 gap-[11px] rounded-[8px]",
                i > 0 && "max-sm:mt-3 max-sm:border-t max-sm:border-hair-soft max-sm:pt-3",
                highlight === s.n && "outline-2 outline-offset-4 outline-[#a8d94f] outline-solid",
              )}
              aria-current={highlight === s.n ? "true" : undefined}
            >
              <span className="mt-px font-mono text-[11px] text-[#a8d94f] tabular-nums">{s.n}</span>
              <div className="min-w-0">
                <H3 className="m-0 text-[12.5px] font-medium">{s.title}</H3>
                <p className="m-0 mb-1.5 mt-1 text-[12px] leading-[1.55] text-ink-faint">{s.body}</p>
                {s.action}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
