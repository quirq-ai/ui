"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark } from "@/components/brand/mark";
import { cn } from "@/lib/cn";

const LINKS = [{ href: "/shapes", label: "All shapes" }];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-[clamp(20px,4vw,44px)] backdrop-blur-xl transition-colors duration-500",
        scrolled ? "border-b border-hair-soft bg-black/75" : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent",
      )}
    >
      <Link href="/" aria-label="quirq shapes home" className="flex items-center gap-2.5">
        <Mark size={26} />
        <span className="font-round text-[19px] font-semibold tracking-[0.01em]">quirq</span>
        <span className="rounded-md border border-hair px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
          shapes
        </span>
      </Link>

      <button
        className="inline-flex items-center gap-2 rounded-full border border-hair-soft px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.13em] text-ink-dim md:hidden"
        aria-expanded={open}
        aria-controls="site-links"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
          <path d="M1 1h12M1 5h12M1 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Menu
      </button>

      <div
        id="site-links"
        className={cn(
          open ? "flex" : "hidden",
          "absolute inset-x-0 top-16 flex-col border-b border-hair-soft bg-black/95 pb-4 pt-2 backdrop-blur-xl md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0",
        )}
      >
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "px-[clamp(20px,5vw,44px)] py-3 font-mono text-[11.5px] uppercase tracking-[0.13em] transition-colors md:border-b md:p-0 md:pb-0.5",
                active ? "text-ink md:border-white/40" : "text-ink-dim hover:text-ink md:border-transparent",
              )}
            >
              {l.label}
            </Link>
          );
        })}
        <a
          href="https://github.com/quirq-ai/ui"
          target="_blank"
          rel="noopener"
          className="px-[clamp(20px,5vw,44px)] py-3 font-mono text-[11.5px] uppercase tracking-[0.13em] text-ink-dim transition-colors hover:text-ink md:p-0"
        >
          GitHub ↗
        </a>
        <Link
          href="/shapes/brand-marks"
          onClick={() => setOpen(false)}
          className="mx-[clamp(20px,5vw,44px)] mt-2 inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-[#e8e8e6] md:m-0"
        >
          Start browsing →
        </Link>
      </div>
    </nav>
  );
}
