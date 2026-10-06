// Site footer: closes every page with the wordmark, a mono tagline, link columns, the
// spectrum hairline (the only color in the footer) and a copyright row. Also the Machine
// Speed sub-brand footer. Server-safe; hover states are CSS only.
import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/mark";
import { cn } from "@/lib/cn";

export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { title: string; links: FooterLink[] };
export type FooterSocial = { label: string; href: string; icon: ReactNode };

export type SiteFooterProps = {
  /** Mono uppercase line under the wordmark. */
  tagline: string;
  /** Plain sentence under the tagline. */
  blurb?: string;
  columns: FooterColumn[];
  social?: FooterSocial[];
  /** Mono uppercase copyright row under the spectrum hairline. */
  copyright: string;
  className?: string;
};

/** Mono kickers are uppercase, but quirq is always lowercase: exempt the word from the transform. */
function keepQuirqLowercase(text: string): ReactNode {
  return text.split(/(quirqs?)/i).map((part, i) =>
    /^quirqs?$/i.test(part) ? (
      <span key={i} className="normal-case">
        {part.toLowerCase()}
      </span>
    ) : (
      part
    ),
  );
}

/** quirq site footer. Columns go 2 up on narrow frames and 3 up from 520px. */
export function SiteFooter({ tagline, blurb, columns, social, copyright, className }: SiteFooterProps) {
  return (
    <footer className={cn("@container border-t border-hair-soft bg-bg", className)}>
      <div className="grid gap-10 px-[clamp(16px,5vw,44px)] py-12 @[760px]:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <Link href="/" aria-label="quirq home" className="inline-flex text-ink">
            <Wordmark height={34} title="quirq" />
          </Link>
          <p className="mt-5 max-w-[440px] text-[12.5px] leading-[1.7] text-ink-faint">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em]">{keepQuirqLowercase(tagline)}</span>
            {blurb ? (
              <>
                <br />
                {blurb}
              </>
            ) : null}
          </p>
          {social && social.length ? (
            <ul className="mt-6 flex gap-4" aria-label="quirq elsewhere">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="inline-flex text-ink opacity-70 transition-opacity hover:opacity-100 [&_svg]:size-[22px]"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-8 @[520px]:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <h3 className="mb-1 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-ink-faint">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
                      className="text-[13.5px] text-ink-dim transition-colors hover:text-ink"
                    >
                      {l.label}
                      {l.external ? <span aria-hidden="true" className="ml-1 text-[11px] text-ink-faint">↗</span> : null}
                      {l.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="spec-bar h-px opacity-50" aria-hidden="true" />
      <p className="px-4 py-3 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{copyright}</p>
    </footer>
  );
}

/** Machine Speed wordmark: three skewed bars. Named when it stands alone. */
export function MachineSpeedBars({ small = false, label }: { small?: boolean; label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0", small ? "gap-[3px]" : "gap-1")}
    >
      {[0, 1, 2].map((i) => (
        <i
          key={i}
          className={cn("block -skew-x-[24deg] rounded-[1.5px] bg-[#e9eae6]", small ? "h-[15px] w-[5px]" : "h-[22px] w-[7px]")}
        />
      ))}
    </span>
  );
}

export type MachineSpeedFooterProps = {
  /** Year in the mono credit line next to the bars; the word quirq renders in Machine Speed lime. */
  year?: number;
  links: FooterLink[];
  className?: string;
};

/** Machine Speed footer: bars, a mono credit line and underlined links on the olive ground.
    The faint text is lifted from the sub-brand's #6b6e67 to #878a83 so it clears 4.5:1. */
export function MachineSpeedFooter({ year = 2026, links, className }: MachineSpeedFooterProps) {
  return (
    <footer className={cn("bg-[#10120f] text-[#e9eae6]", className)}>
      <div className="mx-auto max-w-[660px] border-t border-[rgba(233,234,230,0.12)] px-6 pb-12 pt-9">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-3.5">
            <MachineSpeedBars small label="Machine Speed" />
            <span className="font-mono text-[11px] tracking-[0.06em] text-[#878a83]">
              © {year} MACHINE SPEED · built on <b className="font-semibold lowercase text-[#b4e34a]">quirq</b> technology
            </span>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
                  className="text-[#a8aba3] underline decoration-[#6b6e67] underline-offset-4 transition-colors hover:text-[#e9eae6] hover:decoration-[#e9eae6] focus-visible:outline-[#57b6ff]!"
                >
                  {l.label}
                  {l.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

/** Simple monochrome social glyphs, drawn on a 24 grid in currentColor. Stand-ins, not trademarks. */
export const SOCIAL_GLYPHS = {
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 4.5 19 19.5M19 4.5 5 19.5" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
} as const;
