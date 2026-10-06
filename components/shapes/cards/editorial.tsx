// Editorial and topic cards: Thumb (generated prism art, no remote images), EditorialCard
// (static article card, or a whole-card link with an optional CTA footer), FeaturedStory
// (banner plus lead copy), ToolLinkCard (whitepaper cover or calculator viz) and
// WikiTopicCard (docs topic with two actions). Server-safe.
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- Thumb */

export type ThumbSpec = { kind: "beam"; hue: number } | { kind: "grad"; index: number } | { kind: "prism"; hue: number };

const GRADS = [
  "radial-gradient(140% 160% at 15% 10%, #7c2d3e 0%, #3b1524 45%, #12090f 100%)",
  "radial-gradient(140% 160% at 80% 0%, #3b3b8f 0%, #232055 45%, #0b0a18 100%)",
  "radial-gradient(140% 160% at 20% 90%, #1f6a5a 0%, #123a35 50%, #08110f 100%)",
  "radial-gradient(140% 160% at 85% 85%, #a2652a 0%, #4f2e14 50%, #150c05 100%)",
  "radial-gradient(140% 160% at 50% 0%, #6d3b8f 0%, #35204f 50%, #100a18 100%)",
  "radial-gradient(140% 160% at 0% 50%, #8f3b62 0%, #47203a 50%, #140a11 100%)",
];

function beamBg(hue: number): string {
  const h2 = (hue + 45) % 360;
  return `linear-gradient(112deg, transparent 36%, hsla(${hue},70%,64%,.16) 47%, hsla(${h2},75%,72%,.22) 52%, transparent 64%), radial-gradient(130% 100% at 88% 118%, hsla(${hue},55%,48%,.14), transparent 58%), #0c0c0e`;
}

function prismBg(hue: number): string {
  const stops = [0, 40, 80, 140, 200, 260].map((d) => `hsla(${(hue + d) % 360},70%,58%,.4)`);
  return `conic-gradient(from 210deg at 62% 58%, ${stops.join(", ")}, hsla(${hue},70%,58%,.4)), #060607`;
}

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Generated cover art. The hover zoom comes from a parent `group` (scale 1.04 over 700 ms). */
export function Thumb({ spec, ratio = "aspect-[16/9.6]", zoom = 1.04, className }: { spec: ThumbSpec; ratio?: string; zoom?: 1.03 | 1.04; className?: string }) {
  const background = spec.kind === "beam" ? beamBg(spec.hue) : spec.kind === "prism" ? prismBg(spec.hue) : GRADS[spec.index % GRADS.length];
  return (
    <div aria-hidden="true" className={cn("relative overflow-hidden", ratio, className)}>
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-700 ease-quirq",
          zoom === 1.04 ? "group-hover/ed:scale-[1.04]" : "group-hover/ed:scale-[1.03]",
        )}
        style={{ background }}
      />
      {spec.kind === "prism" ? (
        <div className="absolute inset-0 [background:radial-gradient(70%_80%_at_62%_58%,transparent_0%,rgba(6,6,7,0.2)_45%,#060607_80%)]" />
      ) : null}
      <div className="absolute inset-0 opacity-35 mix-blend-overlay" style={{ backgroundImage: NOISE }} />
    </div>
  );
}

/* ----------------------------------------------------------------------------- EditorialCard */

export type EditorialCardData = {
  tag: string;
  /** Series number such as "01". */
  num?: string;
  title: string;
  dek: string;
  date?: string;
  read?: string;
  thumb: ThumbSpec;
  /** Orange outlined "Sample" badge for placeholder news. */
  sample?: boolean;
};

export type EditorialCardProps = {
  data: EditorialCardData;
  /** When set, the whole card is one link. Without it the card is a static article. */
  href?: string;
  /** Footer that names the destination ("Read the study"). Only with href. */
  cta?: string;
  external?: boolean;
  className?: string;
};

const META = "font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint";

/** Thumb, mono tag and number, title, dek, date and read time. */
export function EditorialCard({ data, href, cta, external, className }: EditorialCardProps) {
  const body = (
    <>
      <Thumb spec={data.thumb} />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between gap-3 font-mono text-[9.5px] uppercase tracking-[0.15em] text-ink-faint">
          <span className="flex items-center gap-2 text-ink-dim">
            {data.tag}
            {data.sample ? (
              <span className="rounded-[3px] border border-org/55 px-1 py-px text-[8.5px] tracking-[0.12em] text-org">Sample</span>
            ) : null}
          </span>
          {data.num ? <span className="tabular-nums">{data.num}</span> : null}
        </div>
        <h4 className="text-[18px] font-semibold leading-[1.3] tracking-[-0.015em] text-ink">{data.title}</h4>
        <p className="flex-1 text-[13.5px] leading-[1.55] text-ink-dim">{data.dek}</p>
        {data.date || data.read ? (
          <div className={cn("flex items-center justify-between gap-3 pt-1", META)}>
            <span>{data.date}</span>
            <span className="flex items-center gap-2">
              {data.read ? `${data.read} read` : null}
              {href && !cta ? (
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover/ed:translate-x-0 group-hover/ed:opacity-100 group-focus-visible/ed:opacity-100"
                />
              ) : null}
            </span>
          </div>
        ) : null}
        {href && cta ? (
          <div className="mt-1 flex items-center justify-between border-t border-hair-soft pt-3.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-dim transition-colors group-hover/ed:text-ink">
            <span>{cta}</span>
            <span aria-hidden="true" className="grid size-[22px] place-items-center rounded-full border border-hair text-[10px] transition-colors group-hover/ed:border-white/30">
              ↗
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
  const shell = "group/ed flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair-soft bg-[#0f0f11] transition-colors duration-200 hover:border-white/20";
  if (!href) return <article className={cn(shell, className)}>{body}</article>;
  return (
    <a
      href={href}
      className={cn(shell, "rounded-[14px]! text-inherit no-underline", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
    >
      {body}
    </a>
  );
}

/* ----------------------------------------------------------------------------- FeaturedStory */

export type FeaturedStoryProps = {
  kicker: string;
  title: string;
  dek: string;
  readLine: string;
  thumb: ThumbSpec;
  /** The whole block is one link when set; otherwise it is an announcement. */
  href?: string;
  /** Extra mono label next to the kicker ("Latest"). */
  badge?: string;
  className?: string;
};

/** Banner left, lead copy right. Banner zooms 1.03 and the arrow nudges on hover. */
export function FeaturedStory({ kicker, title, dek, readLine, thumb, href, badge, className }: FeaturedStoryProps) {
  const inner = (
    <>
      <div className="overflow-hidden rounded-[16px] border border-hair-soft">
        <Thumb spec={thumb} ratio="aspect-video" zoom={1.03} />
      </div>
      <div className="min-w-0">
        <span className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-dim">
          <span aria-hidden="true" className="size-[7px] rounded-[2px] spec-bar" />
          {kicker}
          {badge ? <span className="text-ink-faint">· {badge}</span> : null}
        </span>
        <h4 className="mt-3.5 text-[clamp(22px,2.6vw,30px)] font-semibold leading-[1.22] tracking-[-0.02em] text-ink">{title}</h4>
        <p className="mt-4 max-w-[560px] text-[14.5px] leading-[1.62] text-ink-dim">{dek}</p>
        <span className="mt-5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
          {readLine}
          {href ? <ArrowRight aria-hidden="true" className="size-3 transition-transform duration-300 group-hover/ed:translate-x-1" /> : null}
        </span>
      </div>
    </>
  );
  const shell = "group/ed grid items-center gap-[clamp(20px,4vw,46px)] md:grid-cols-[1.05fr_0.95fr]";
  if (!href) return <article className={cn(shell, className)}>{inner}</article>;
  return (
    <a href={href} className={cn(shell, "rounded-[16px]! text-inherit no-underline", className)}>
      {inner}
    </a>
  );
}

/* ----------------------------------------------------------------------------- ToolLinkCard */

export type ToolLinkCardProps = {
  href: string;
  title: string;
  description: string;
  /** Left mono meta line and right action word. */
  meta: ReactNode;
  action: string;
  cover: { kind: "paper"; kicker: string; title: string } | { kind: "chart"; label: string; delta: string; note?: string };
  className?: string;
};

/** Cover plus copy, the whole card one link. Paper is the only cream surface in the system. */
export function ToolLinkCard({ href, title, description, meta, action, cover, className }: ToolLinkCardProps) {
  return (
    <a
      href={href}
      className={cn(
        "group/ed flex min-w-0 items-stretch overflow-hidden rounded-[14px]! border border-hair bg-[#0f0f11] text-inherit no-underline transition-colors duration-200 hover:border-white/25",
        className,
      )}
    >
      {cover.kind === "paper" ? (
        <div aria-hidden="true" className="flex w-[120px] flex-none flex-col bg-[#efede6] px-4 pb-3 pt-4 text-[#17171a] sm:w-[160px]">
          <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-[#5f5a4b]">{cover.kicker}</p>
          <p className="mb-2 mt-1.5 text-[11px] font-bold leading-[1.25] tracking-[-0.01em]">{cover.title}</p>
          {["95%", "86%", "91%", "55%"].map((w, i) => (
            <div key={i} className={cn("h-1 rounded-[2px]", i < 2 ? "bg-black/15" : "bg-black/10", i < 3 && "mb-1")} style={{ width: w }} />
          ))}
        </div>
      ) : (
        <div aria-hidden="true" className="flex w-[120px] flex-none flex-col justify-center border-r border-hair bg-[#101014] px-4 py-3.5 sm:w-[160px]">
          <div className="flex justify-between font-mono text-[7px] uppercase tracking-[0.15em]">
            <span className="text-ink-dim">{cover.label}</span>
            <span className="text-grn">{cover.delta}</span>
          </div>
          <svg viewBox="0 0 140 44" className="mb-1.5 mt-[7px] w-full">
            <line x1="0" y1="7" x2="140" y2="7" stroke="rgba(255,255,255,.25)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M0 9 C 28 26, 52 33, 140 35" fill="none" stroke="var(--grn)" strokeWidth="2" />
            <circle cx="137" cy="35" r="2.5" fill="var(--grn)" />
          </svg>
          <div className="relative h-[3px] rounded-[2px] bg-white/15">
            <div className="absolute inset-y-0 left-0 w-[28%] rounded-[2px] bg-grn" />
            <div className="absolute left-[28%] top-[-3px] size-[9px] rounded-full bg-grn" />
          </div>
          {cover.note ? <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.15em] text-org">{cover.note}</p> : null}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-5 py-[18px]">
        <h4 className="text-[16px] font-semibold tracking-[-0.015em] text-ink">{title}</h4>
        <p className="text-[12.5px] leading-[1.5] text-ink-dim">{description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-faint">{meta}</span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink transition-transform duration-200 group-hover/ed:translate-x-0.5">
            {action} →
          </span>
        </div>
      </div>
    </a>
  );
}

/* ----------------------------------------------------------------------------- WikiTopicCard */

export type WikiTopicCardProps = {
  title: string;
  description: string;
  docHref: string;
  docLabel?: string;
  /** Docs live on another site: opens a new tab and shows ↗ instead of →. */
  external?: boolean;
  onOpenView?: () => void;
  viewLabel?: string;
  /** Ringed when the topic matches the current view or a search. */
  highlighted?: boolean;
  className?: string;
};

/** Docs topic: title, two lines, a docs link and an Open view action. Not a link itself. */
export function WikiTopicCard({ title, description, docHref, docLabel = "Open docs", external = false, onOpenView, viewLabel = "Open view", highlighted = false, className }: WikiTopicCardProps) {
  return (
    <article
      data-highlighted={highlighted || undefined}
      className={cn(
        "flex min-w-0 flex-col rounded-[10px] border bg-s2 px-4 pb-3 pt-3.5 transition-colors duration-150",
        highlighted ? "border-blu/45 shadow-[0_0_0_3px_rgba(46,155,255,0.12)]" : "border-hair-soft hover:border-hair",
        className,
      )}
    >
      <h4 className="mb-1.5 text-[15px] font-medium leading-snug text-ink">{title}</h4>
      <p className="text-[12px] leading-[1.6] text-ink-dim">{description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2.5">
        <a
          href={docHref}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
          className="inline-flex min-h-[30px] items-center gap-1 rounded-[4px]! text-[12px] font-medium text-blu underline-offset-[3px] hover:text-ink hover:underline"
        >
          {docLabel} <span aria-hidden="true">{external ? "↗" : "→"}</span>
          {external ? <span className="sr-only">(opens in a new tab)</span> : null}
        </a>
        <button
          type="button"
          onClick={onOpenView}
          className="inline-flex min-h-[30px] items-center gap-1.5 rounded-[6px]! border border-hair px-2 py-1 text-[11.5px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:bg-s3 hover:text-ink"
        >
          {viewLabel} <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
