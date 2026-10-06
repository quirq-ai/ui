// Machine Speed: the implementation sub-brand on its own olive ground (#10120f) with one
// green (#b4e34a), one blue (#57b6ff) and hairlines for everything else. Faint text is lifted
// from the source #6b6e67 (3.6:1) to #808379 (4.9:1) so small copy passes AA; #6b6e67 stays
// for underlines and dots. Square mono buttons
// (radius 3) are its tell against quirq's pills. Skewed bars mark, split hero with ghost
// words, DEPLOYED badge, skewed node dots, counter-numbered plan list, .eq formula callout,
// person card, CTA block and footer. Server-safe; the calculator lives in its client file.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MSBars } from "./lockups";

export const MS = {
  bg: "#10120f",
  ink: "#e9eae6",
  dim: "#a8aba3",
  /** Faint text, AA on the olive ground. */
  faint: "#808379",
  /** Decoration only: link underlines, function dots. */
  rule: "#6b6e67",
  line: "rgba(233,234,230,0.12)",
  green: "#b4e34a",
  blue: "#57b6ff",
} as const;

/** Olive ground with the sub-brand's ink and a blue focus ring. Scope every Machine Speed piece inside it. */
export function MSSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-[rgba(233,234,230,0.12)] bg-[#10120f] text-[15px] leading-[1.7] text-[#e9eae6]",
        /* "!" so the blue ring beats the global ink focus outline inside the sub-brand */
        "[&_a:focus-visible]:outline-[#57b6ff]! [&_button:focus-visible]:outline-[#57b6ff]! [&_input:focus-visible]:outline-[#57b6ff]!",
        "[&_summary:focus-visible]:outline-[#57b6ff]! [&_div[tabindex]:focus-visible]:outline-[#57b6ff]!",
        className,
      )}
    >
      {children}
    </div>
  );
}

const MS_BUTTON =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px]! border border-[#e9eae6] bg-[#e9eae6] px-[26px] py-[14px] font-mono text-[12.5px] font-semibold uppercase tracking-[0.07em] text-[#10120f] no-underline transition-colors duration-150 hover:border-white hover:bg-white";

/**
 * Square-ish mono CTA. Turns pure white on hover. Renders an anchor when href is set; with
 * external it opens a new tab and carries the ↗ (a plain button never shows the arrow).
 */
export function MSButton({
  href,
  external = false,
  children,
  className,
  ...rest
}: { href?: string; external?: boolean; children: ReactNode; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "href">) {
  if (href) {
    return (
      <a
        href={href}
        className={cn(MS_BUTTON, className)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
        {external ? (
          <>
            <span aria-hidden="true" className="font-normal">
              ↗
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </>
        ) : null}
      </a>
    );
  }
  return (
    <button type="button" className={cn(MS_BUTTON, className)} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

/** ● DEPLOYED: solid ms-blue badge, dark text, radius 5, bold mono. */
export function MSDeployedBadge({ children = "Deployed" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] bg-[#57b6ff] px-3 py-1 font-mono text-[10.5px] font-bold uppercase leading-none tracking-[0.1em] text-[#0a1018]">
      <span aria-hidden="true">●</span>
      {children}
    </span>
  );
}

/** 7px node dot skewed -10deg, as the blueprint canvas draws them. */
export function MSNodeDot({ color = MS.blue, size = 7, label }: { color?: string; size?: number; label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="inline-block shrink-0 rounded-[2px]"
      style={{ width: size, height: size, background: color, transform: "skewX(-10deg)" }}
    />
  );
}

export type MSPlanItem = { lead: string; body: string };

/** Counter-numbered list with hairlines, reading column 660px, body 17px lh 1.75. */
export function MSPlanList({ items, className }: { items: MSPlanItem[]; className?: string }) {
  return (
    <ol className={cn("list-none p-0", className)}>
      {items.map((it, i) => (
        <li key={it.lead} className="relative border-t border-[rgba(233,234,230,0.12)] py-[18px] pl-12 text-[15px] leading-[1.7] text-[#a8aba3] last:border-b">
          <span aria-hidden="true" className="absolute top-5 left-0 font-mono text-[13px] text-[#808379]">
            {i + 1}
          </span>
          <b className="mb-0.5 block font-semibold text-[#e9eae6]">{it.lead}</b>
          {it.body}
        </li>
      ))}
    </ol>
  );
}

/** .eq formula callout: wash, 3px blue left rule, computed values in blue mono. */
export function MSFormula({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("rounded-r-[8px] border-l-[3px] border-[#57b6ff] bg-white/[0.03] px-4 py-3.5 text-[14px] leading-[1.8] text-[#e9eae6] [&_b]:font-mono [&_b]:font-semibold [&_b]:text-[#57b6ff] [&_b]:tabular-nums", className)}>
      {children}
    </p>
  );
}

/** Head row: bars link home plus a quiet back link. */
export function MSPageHead({ homeHref = "/machine-speed", aside, onHome }: { homeHref?: string; aside?: ReactNode; onHome?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <header className="flex items-center justify-between gap-5 border-b border-[rgba(233,234,230,0.12)] px-[clamp(18px,4vw,36px)] py-5">
      <a href={homeHref} aria-label="MACHINE SPEED, home" onClick={onHome} className="inline-flex rounded-[4px] py-1">
        <MSBars />
      </a>
      {aside}
    </header>
  );
}

export type MSSplitHeroProps = {
  ghostAbove: string[];
  ghostBelow: string[];
  /** Heading text before the gradient words. */
  heading: string;
  /** The italic gradient clause: "machine speed." */
  emphasis: string;
  lead: string;
  body: string;
  /** Right column art (the refraction plate). */
  art: ReactNode;
};

const GHOST = ["text-[rgba(233,234,230,0.06)]", "text-[rgba(233,234,230,0.1)]", "text-[rgba(233,234,230,0.16)]"];

/** Split hero: ghost workflow names above and below the h1 at rising opacity, art on the right. */
export function MSSplitHero({ ghostAbove, ghostBelow, heading, emphasis, lead, body, art }: MSSplitHeroProps) {
  return (
    <div className="grid gap-[clamp(20px,3vw,40px)] p-[clamp(14px,2vw,20px)] lg:grid-cols-[minmax(0,1fr)_minmax(260px,40%)]">
      <div className="flex min-w-0 flex-col overflow-hidden px-[clamp(4px,2vw,24px)] py-6">
        <div className="relative py-6">
          <div aria-hidden="true" className="mb-4 w-[58%] text-right text-[clamp(16px,1.8vw,22px)] font-medium leading-[1.7] tracking-[-0.01em] max-lg:w-auto max-lg:text-left">
            {ghostAbove.map((g, i) => (
              <div key={g} className={cn("whitespace-nowrap", GHOST[i % 3], i === 0 && "italic")}>
                {g}
              </div>
            ))}
          </div>
          <p role="heading" aria-level={3} className="relative max-w-[15em] text-[clamp(28px,3.2vw,44px)] font-semibold leading-[1.18] tracking-[-0.015em]">
            {heading}{" "}
            <em className="bg-[linear-gradient(95deg,#ffb46b_0%,#ff5e8a_45%,#57d9ff_100%)] bg-clip-text text-transparent">{emphasis}</em>
          </p>
          {/* 58% as on the landing, but never so far right that the longest line is cut off */}
          <div aria-hidden="true" className="mt-4 ml-[min(58%,calc(100%-11.5em))] text-[clamp(16px,1.8vw,22px)] font-medium leading-[1.7] tracking-[-0.01em] max-lg:ml-0">
            {ghostBelow.map((g, i) => (
              <div key={g} className={cn("whitespace-nowrap", GHOST[2 - (i % 3)], i === 0 && "italic")}>
                {g}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 max-w-[560px]">
          <p className="mb-3 text-[17px] font-semibold text-[#e9eae6]">{lead}</p>
          <p className="text-[14.5px] leading-[1.7] text-[#a8aba3]">{body}</p>
        </div>
      </div>
      <div className="relative min-h-[300px] overflow-hidden rounded-[22px]">{art}</div>
    </div>
  );
}

/** Canvas bar of a running blueprint: title, quirq word and the DEPLOYED badge. */
export function MSBlueprintBar({ name, state = "running" }: { name: string; state?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(233,234,230,0.12)] bg-white/[0.02] px-4 py-2.5">
      <span className="font-mono text-[11px] tracking-[0.08em] text-[#a8aba3]">
        Blueprint: <b className="font-semibold text-[#e9eae6]">{name}</b> · {state}
      </span>
      <span className="flex items-center gap-3.5">
        <span className="font-mono text-[12px] tracking-[0.04em] text-[#808379]">quirq</span>
        <MSDeployedBadge />
      </span>
    </div>
  );
}

export type MSNode = { kind: string; dot: string; title: string; sub: string; foot: ReactNode; highlight?: boolean };

/** One blueprint node card with its skewed kind dot. */
export function MSNodeCard({ node }: { node: MSNode }) {
  return (
    <div className={cn("w-[176px] shrink-0 rounded-[9px] border bg-[#13160f] text-[11px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]", node.highlight ? "border-[rgba(87,182,255,0.45)]" : "border-[rgba(233,234,230,0.12)]")}>
      <div className="flex items-center gap-[7px] border-b border-[rgba(233,234,230,0.12)] px-[11px] py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#808379]">
        <MSNodeDot color={node.dot} />
        {node.kind}
      </div>
      <div className="px-[11px] py-[9px]">
        <p className="text-[12px] leading-[1.35] font-semibold text-[#e9eae6]">{node.title}</p>
        <p className="mt-[3px] text-[10px] leading-[1.5] text-[#808379]">{node.sub}</p>
      </div>
      <div className="border-t border-[rgba(233,234,230,0.12)] px-[11px] py-[7px] font-mono text-[9.5px] tracking-[0.03em] text-[#808379] [&_b]:font-semibold [&_b]:text-[#57b6ff]">{node.foot}</div>
    </div>
  );
}

/** CTA block: centered heading and the one square button. */
export function MSCtaBlock({ heading, cta }: { heading: string; cta: ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[rgba(233,234,230,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] px-[clamp(20px,4vw,40px)] pt-[clamp(36px,5vw,56px)] pb-[clamp(32px,5vw,48px)] text-center">
      <p className="mx-auto mb-7 max-w-[22em] text-[clamp(21px,2.6vw,28px)] font-semibold leading-[1.25] tracking-[-0.015em]">{heading}</p>
      {cta}
    </section>
  );
}

/** "Work with" person card: name, a one-line claim and a booking button. */
export function MSPersonCard({ name, tagline, cta }: { name: string; tagline: ReactNode; cta: ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[rgba(233,234,230,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] px-[clamp(20px,3vw,30px)] py-[clamp(24px,3vw,34px)]">
      <p className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em]">Work with {name}</p>
      <div className="mt-1.5 mb-6 text-[14.5px] leading-[1.6] text-[#a8aba3]">{tagline}</div>
      {cta}
    </section>
  );
}

/** Footer: small bars, © line with "quirq" in green lowercase, and plain links. */
export function MSFooter({ links, onNavigate }: { links: { label: string; href: string }[]; onNavigate?: (label: string, e: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <footer className="border-t border-[rgba(233,234,230,0.12)] px-[clamp(18px,4vw,36px)] pt-7 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-3.5">
          <MSBars size="small" label="MACHINE SPEED" />
          <span className="font-mono text-[11px] tracking-[0.06em] text-[#808379]">
            © 2026 MACHINE SPEED · built on <b className="font-semibold lowercase text-[#b4e34a]">quirq</b> technology
          </span>
        </div>
        <ul className="flex list-none flex-wrap gap-6 p-0 text-[13.5px]">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={onNavigate ? (e) => onNavigate(l.label, e) : undefined} className="rounded-[3px] text-[#a8aba3] underline decoration-[#6b6e67] underline-offset-4 transition-colors hover:text-[#e9eae6] hover:decoration-[#e9eae6]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
