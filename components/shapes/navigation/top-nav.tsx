"use client";

// Top nav: the fixed 64px glass bar from the quirq site (lockup, mono uppercase links, one
// white pill CTA), with a Products disclosure menu, a collapsed mobile menu, the scrolled
// style, the Machine Speed sub-brand head and the deliberately off-brand third-party header
// that galileo frames. Container queries decide desktop vs mobile, so the bar works inside
// any frame width, not just the viewport.
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Lockup } from "@/components/brand/mark";
import { cn } from "@/lib/cn";
import { toneBg, type Tone } from "@/components/ui/tones";
import { moveFocus, useDismiss } from "./menu";
import { MachineSpeedBars } from "./site-footer";

export type TopNavMenuItem = {
  label: string;
  description?: string;
  href: string;
  /** Tone dot: blue open source, green managed, orange enterprise. */
  tone?: Tone;
  /** Small mono tag, such as "Labs". */
  tag?: string;
  /** Section heading inside the panel. Items without a group come first; Labs sits apart from core products. */
  group?: string;
};

export type TopNavLink = {
  label: string;
  href: string;
  /** Marks the current page: ink color, hairline underline, aria-current. */
  current?: boolean;
  /** Opens in a new tab and shows ↗. */
  external?: boolean;
  /** Turns the link into a disclosure menu (Products). */
  menu?: TopNavMenuItem[];
};

export type TopNavProps = {
  links: TopNavLink[];
  /** The one primary action: the white pill. */
  cta?: { label: string; href: string };
  brand?: ReactNode;
  brandHref?: string;
  brandLabel?: string;
  /** Scrolled style: black/75 with a bottom hairline. Otherwise a gradient that fades to transparent. */
  scrolled?: boolean;
  /** auto: inline links when the frame is at least 760px wide; mobile: always collapsed. */
  layout?: "auto" | "mobile";
  /** Mobile menu open on first render (demos). */
  defaultMenuOpen?: boolean;
  /** Label of a dropdown open on first render (demos). */
  defaultDropdown?: string;
  /** fixed for a real page; sticky inside a scrolling frame; static in a catalog cell. */
  position?: "static" | "sticky" | "fixed";
  /** Called instead of following a link (demos). */
  onNavigate?: (href: string, label: string) => void;
  "aria-label"?: string;
  className?: string;
};

const linkText = "font-mono text-[11.5px] uppercase tracking-[0.13em] transition-colors";

/** Global wayfinding bar with one CTA. */
export function TopNav({
  links,
  cta,
  brand,
  brandHref = "/",
  brandLabel = "quirq home",
  scrolled = false,
  layout = "auto",
  defaultMenuOpen = false,
  defaultDropdown,
  position = "static",
  onNavigate,
  "aria-label": ariaLabel = "Main",
  className,
}: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(defaultMenuOpen);
  const id = useId();
  const toggle = useRef<HTMLButtonElement | null>(null);
  const mobileOnly = layout === "mobile";

  // Escape closes the collapsed menu and returns focus to its toggle. While a Products panel
  // is open, Escape closes that panel first, so the menu stays until a second press.
  function onNavKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key !== "Escape" || !menuOpen) return;
    if ((e.target as HTMLElement).closest('[data-dropdown-open="true"]')) return;
    const t = toggle.current;
    if (!t || getComputedStyle(t).display === "none") return;
    e.preventDefault();
    setMenuOpen(false);
    t.focus();
  }

  const go = (href: string, label: string) => (e: MouseEvent) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(href, label);
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "@container z-30 w-full",
        position === "fixed" && "fixed inset-x-0 top-0",
        position === "sticky" && "sticky top-0",
        position === "static" && "relative",
        className,
      )}
    >
      <nav
        aria-label={ariaLabel}
        onKeyDown={onNavKeyDown}
        className={cn(
          "relative flex h-16 items-center justify-between gap-4 border-b px-[clamp(16px,4vw,32px)] backdrop-blur-xl transition-[background-color,border-color] duration-500",
          scrolled ? "border-hair-soft bg-black/75" : "border-transparent bg-gradient-to-b from-black/55 to-transparent",
        )}
      >
        <a href={brandHref} aria-label={brandLabel} onClick={go(brandHref, "Home")} className="flex shrink-0 items-center rounded-full!">
          {brand ?? <Lockup size={24} />}
        </a>

        <button
          ref={toggle}
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full! border border-hair-soft px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.13em] text-ink-dim transition-colors hover:text-ink",
            !mobileOnly && "@[760px]:hidden",
          )}
          aria-expanded={menuOpen}
          aria-controls={`${id}-links`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M2.5 1 11.5 9M11.5 1 2.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            ) : (
              <path d="M1 1h12M1 5h12M1 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            )}
          </svg>
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div
          id={`${id}-links`}
          className={cn(
            menuOpen ? "flex" : "hidden",
            "absolute inset-x-0 top-16 flex-col items-stretch border-b border-hair-soft bg-black/95 pb-4 pt-2 backdrop-blur-xl",
            !mobileOnly &&
              "@[760px]:static @[760px]:flex @[760px]:flex-row @[760px]:items-center @[760px]:gap-[26px] @[760px]:border-0 @[760px]:bg-transparent @[760px]:p-0 @[760px]:backdrop-blur-none",
          )}
        >
          {links.map((l) =>
            l.menu ? (
              <NavDropdown
                key={l.label}
                link={l}
                inline={!mobileOnly}
                defaultOpen={defaultDropdown === l.label}
                onNavigate={onNavigate ? (href, label) => { onNavigate(href, label); setMenuOpen(false); } : undefined}
              />
            ) : (
              <a
                key={l.label}
                href={l.href}
                onClick={go(l.href, l.label)}
                aria-current={l.current ? "page" : undefined}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
                className={cn(
                  linkText,
                  "px-[clamp(16px,4vw,32px)] py-3",
                  !mobileOnly && "@[760px]:border-b @[760px]:p-0 @[760px]:pb-0.5",
                  l.current ? "text-ink @[760px]:border-white/40" : "text-ink-dim hover:text-ink @[760px]:border-transparent",
                )}
              >
                {l.label}
                {l.external ? <span aria-hidden="true"> ↗</span> : null}
                {l.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            ),
          )}
          {cta ? (
            <a
              href={cta.href}
              onClick={go(cta.href, cta.label)}
              className={cn(
                "mx-[clamp(16px,4vw,32px)] mt-2 rounded-full! bg-ink px-4 py-2.5 text-center font-mono text-[11.5px] uppercase tracking-[0.13em] text-black transition-[transform,background-color] hover:-translate-y-px hover:bg-[#e8e8e6]",
                !mobileOnly && "@[760px]:mx-0 @[760px]:mt-0",
              )}
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

/** Ungrouped items first, then each named group in order of first appearance. */
function groupMenu(items: TopNavMenuItem[]): [string | undefined, TopNavMenuItem[]][] {
  const out = new Map<string | undefined, TopNavMenuItem[]>();
  for (const m of items) out.set(m.group, [...(out.get(m.group) ?? []), m]);
  return [...out.entries()].sort(([a], [b]) => (a === undefined ? -1 : b === undefined ? 1 : 0));
}

/** Products ▾ disclosure: a button that shows a small panel of links. */
function NavDropdown({
  link,
  inline,
  defaultOpen,
  onNavigate,
}: {
  link: TopNavLink;
  inline: boolean;
  defaultOpen: boolean;
  onNavigate?: (href: string, label: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const wrap = useRef<HTMLDivElement | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  useDismiss(open, (reason) => {
    setOpen(false);
    if (reason === "escape") button.current?.focus();
  }, [wrap]);

  const items = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a") ?? []);

  function onButtonKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => items()[0]?.focus());
    }
  }

  return (
    <div ref={wrap} data-dropdown-open={open} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKey}
        className={cn(
          linkText,
          "flex w-full items-center justify-between gap-1.5 px-[clamp(16px,4vw,32px)] py-3 text-left",
          inline && "@[760px]:w-auto @[760px]:border-b @[760px]:p-0 @[760px]:pb-0.5",
          link.current || open ? "text-ink @[760px]:border-white/40" : "text-ink-dim hover:text-ink @[760px]:border-transparent",
        )}
      >
        {link.label}
        <ChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          ref={panel}
          id={`${id}-panel`}
          onKeyDown={(e) => moveFocus(e, items())}
          className={cn(
            "rise mx-[clamp(16px,4vw,32px)] mb-2 flex flex-col gap-0.5 rounded-[14px] border border-hair bg-s1 p-1.5",
            inline &&
              "@[760px]:absolute @[760px]:-left-3 @[760px]:top-[calc(100%+22px)] @[760px]:mx-0 @[760px]:w-[min(380px,calc(100vw-32px))] @[760px]:rounded-[16px] @[760px]:border-hair-strong @[760px]:bg-[rgba(18,18,20,0.97)] @[760px]:p-2 @[760px]:shadow-[0_24px_60px_rgba(0,0,0,0.6)] @[760px]:backdrop-blur-md",
          )}
        >
          {groupMenu(link.menu ?? []).map(([group, entries], gi) => (
            <div key={group ?? "main"}>
              {group ? (
                <p id={`${id}-group-${gi}`} className="mx-3 mb-1 mt-2 border-t border-hair-soft pt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  {group}
                </p>
              ) : null}
              <ul aria-label={group ? undefined : link.label} aria-labelledby={group ? `${id}-group-${gi}` : undefined} className="flex flex-col gap-0.5">
                {entries.map((m) => (
                  <li key={m.label}>
                    <a
                      href={m.href}
                      onClick={(e) => {
                        if (!onNavigate) return;
                        e.preventDefault();
                        onNavigate(m.href, m.label);
                        setOpen(false);
                      }}
                      className="flex items-start gap-3 rounded-[10px]! px-3 py-2.5 transition-colors hover:bg-white/[0.05] focus-visible:outline-offset-[-2px]!"
                    >
                      <span aria-hidden="true" className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", m.tone ? toneBg[m.tone] : "bg-ink-faint")} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[14px] font-medium tracking-[-0.01em] text-ink">
                          {m.label}
                          {m.tag ? (
                            <span className="rounded-[3px] border border-hair px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-dim">{m.tag}</span>
                          ) : null}
                        </span>
                        {m.description ? <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-dim">{m.description}</span> : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Machine Speed */

export type MachineSpeedHeadProps = {
  homeHref?: string;
  backHref?: string;
  backLabel?: string;
  /** Mono crumb after the mark, such as "Ten-hour test". */
  page?: string;
  className?: string;
};

/** Page head for the Machine Speed sub-brand: bars home link and a quiet back link. Olive ground. */
export function MachineSpeedHead({
  homeHref = "/machine-speed",
  backHref = "/machine-speed",
  backLabel = "Back to Machine Speed",
  page,
  className,
}: MachineSpeedHeadProps) {
  return (
    <header className={cn("bg-[#10120f] text-[#e9eae6]", className)}>
      <div className="mx-auto flex max-w-[660px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-6">
        <div className="flex items-center gap-3.5">
          <a href={homeHref} aria-label="Machine Speed, home" className="inline-flex py-1 focus-visible:outline-[#57b6ff]!">
            <MachineSpeedBars />
          </a>
          {page ? <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#878a83]">{page}</span> : null}
        </div>
        <a
          href={backHref}
          className="text-[14px] text-[#e9eae6] underline decoration-[#6b6e67] underline-offset-4 transition-[text-decoration-color] hover:decoration-[#e9eae6] focus-visible:outline-[#57b6ff]!"
        >
          {backLabel}
        </a>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------------- third party */

export type ThirdPartyHeaderProps = {
  brand: string;
  brandHref?: string;
  links: { label: string; href: string }[];
  /** Label of the current link: ink and 600 weight, aria-current. */
  current: string;
  onCurrentChange?: (label: string) => void;
  cta?: { label: string; href: string };
  /** Called instead of following a link (demos and framed previews). */
  onNavigate?: (href: string, label: string) => void;
  className?: string;
};

/**
 * A third-party site header as galileo frames it (the Acme Notes sample app). Deliberately
 * off-brand: white ground, a warm hairline and its own blue accent, because it is not ours.
 */
export function ThirdPartyHeader({ brand, brandHref = "#", links, current, onCurrentChange, cta, onNavigate, className }: ThirdPartyHeaderProps) {
  const go = (href: string, label: string) => (e: MouseEvent) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(href, label);
  };
  return (
    <div className={cn("@container", className)}>
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#e6e2d8] bg-white px-[clamp(16px,4vw,32px)] py-4 font-sans text-[#1d2433]">
        <a href={brandHref} onClick={go(brandHref, brand)} className="text-[18px] font-bold text-[#1d2433] focus-visible:outline-[#3355d6]!">
          {brand}
        </a>
        <nav aria-label={`${brand} main`} className="order-3 flex w-full gap-5 @[520px]:order-none @[520px]:w-auto @[520px]:flex-1">
          {links.map((l) => {
            const on = l.label === current;
            return (
              <a
                key={l.label}
                href={l.href}
                aria-current={on ? "page" : undefined}
                onClick={(e) => {
                  go(l.href, l.label)(e);
                  onCurrentChange?.(l.label);
                }}
                className={cn(
                  "text-[15px] transition-colors focus-visible:outline-[#3355d6]!",
                  on ? "font-semibold text-[#1d2433]" : "text-[#5b6475] hover:text-[#1d2433]",
                )}
              >
                {l.label}
              </a>
            );
          })}
        </nav>
        {cta ? (
          <a
            href={cta.href}
            onClick={go(cta.href, cta.label)}
            className="ml-auto inline-flex items-center rounded-[8px]! bg-[#3355d6] px-3.5 py-[7px] text-[14px] font-semibold text-white focus-visible:outline-[#3355d6]!"
          >
            {cta.label}
          </a>
        ) : null}
      </header>
    </div>
  );
}
