"use client";

import { useState, type MouseEvent } from "react";
import { Eyebrow } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { ActionLog, Caption, KeepCase, Specimen } from "./kit";
import { GhostMark, NavLockup, QuirqFavicon, QuirqMark, QuirqWordmark, SpectrumWord } from "./quirq-wordmark";

const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Research", href: "/research" },
  { label: "Writings", href: "/writings" },
  { label: "Enterprise", href: "/enterprise", external: true },
];

/* A small graph drawn behind the ghost q: the q is texture, the nodes carry the data. */
const VIZ_NODES = [
  { x: 64, y: 58, r: 5, c: "var(--blu)" },
  { x: 150, y: 40, r: 4, c: "var(--ink-dim)" },
  { x: 214, y: 92, r: 6, c: "var(--grn)" },
  { x: 120, y: 120, r: 4, c: "var(--ink-dim)" },
  { x: 44, y: 142, r: 4, c: "var(--org)" },
  { x: 190, y: 160, r: 5, c: "var(--ink-dim)" },
];
const VIZ_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 2],
  [3, 4],
  [3, 5],
  [2, 5],
];

export function QuirqWordmarkDemo() {
  const [log, setLog] = useState<string | null>(null);
  const home = (where: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLog(`${where} lockup → home (/) · demo stays on this page`);
  };
  const nav = (label: string, href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLog(`${label} → ${href} (demo)`);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Specimen label="Hero · min(280px, 58%)" aside="landing hero" ground="black" center={false} padded={false} bodyClassName="p-[clamp(20px,4vw,40px)]">
          <QuirqWordmark size="hero" className="mb-1" />
          <p className="text-[clamp(24px,3vw,36px)] font-semibold leading-[1.18] tracking-[-0.02em]">
            Secure environments
            <br />
            for agentic workforces
          </p>
          <p className="mt-3 text-[clamp(15px,1.5vw,18px)] font-bold text-white/70">Any model. Any harness. Any cloud.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setLog("Get started → app (demo)")}>
              Get started
            </Button>
            <Button variant="ghost" onClick={() => setLog("Whitepaper → /whitepaper (demo)")}>
              Whitepaper
            </Button>
          </div>
        </Specimen>

        <Specimen label="Standalone mark · 72px" aside="above install eyebrow" ground="black" center={false} bodyClassName="flex flex-col justify-center">
          <QuirqMark size={72} className="mb-6" />
          <Eyebrow>Open source</Eyebrow>
          <p className="mt-3 text-[clamp(22px,2.4vw,28px)] font-[640] leading-[1.15] tracking-[-0.02em]">
            Install on your
            <br />
            local hardware
          </p>
        </Specimen>
      </div>

      <Specimen label="Nav lockup · 26px mark + Quicksand 19px" aside="links home" ground="black" center={false} padded={false}>
        <nav aria-label="Demo site" className="flex h-16 items-center justify-between gap-4 border-b border-hair-soft bg-gradient-to-b from-black/55 to-transparent px-5">
          <NavLockup href="/" onClick={home("Nav")} />
          <div className="flex items-center gap-6">
            <ul className="hidden list-none items-center gap-[26px] p-0 md:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={nav(l.label, l.href)}
                    className="rounded-[4px] font-mono text-[11.5px] uppercase tracking-[0.13em] text-ink-dim no-underline transition-colors hover:text-ink"
                  >
                    {l.label}
                    {l.external ? <span aria-hidden="true"> ↗</span> : null}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setLog("Get started → app (demo)")}
              className="rounded-full! bg-ink px-4 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.13em] text-black transition-colors hover:bg-[#e8e8e6]"
            >
              Get started
            </button>
          </div>
        </nav>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
          <span className="flex items-center gap-3">
            <NavLockup href="/" size={20} onClick={home("Compact")} />
            <Caption>20px in dense chrome</Caption>
          </span>
          <span className="flex items-center gap-3">
            <NavLockup href="/" size={32} onClick={home("Large")} />
            <Caption>32px on a splash</Caption>
          </span>
        </div>
      </Specimen>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Specimen label="Footer · 130px" ground="black" center={false} padded={false}>
          <div className="px-5 pt-5 pb-4">
            <QuirqWordmark size="footer" />
            <p className="mt-4 text-[12px] leading-[1.7] text-ink-faint">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
                Tokens meter consumption. <KeepCase>quirqs</KeepCase> meter delivery.
              </span>
            </p>
          </div>
          <div className="h-px opacity-50" style={{ background: "var(--spectrum)" }} aria-hidden="true" />
          <p className="py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Copyright 2026 · <KeepCase>quirq</KeepCase> LLC
          </p>
        </Specimen>

        <Specimen label="Favicon tile" aside="64 · 32 · 16" ground="panel" center={false} bodyClassName="flex flex-col items-center justify-center gap-5">
          <div className="flex items-end gap-4">
            <QuirqFavicon size={64} />
            <QuirqFavicon size={32} title={null} />
            <QuirqFavicon size={16} title={null} />
          </div>
          <div className="flex w-full max-w-[210px] items-center gap-2 rounded-t-[9px] border border-b-0 border-hair bg-s3 px-3 py-2">
            <QuirqFavicon size={14} title={null} />
            <span className="truncate text-[12px] text-ink">quirq shapes</span>
            <span aria-hidden="true" className="ml-auto text-[11px] text-ink-faint">
              ×
            </span>
          </div>
        </Specimen>

        <Specimen label="Ghost q · 21%" aside="in viz" ground="black" padded={false} bodyClassName="dots">
          <div className="relative h-[200px] w-full">
            <GhostMark size={176} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <svg viewBox="0 0 260 200" className="absolute inset-0 h-full w-full" role="img" aria-label="Sample graph of six nodes drawn over the ghost q">
              {VIZ_EDGES.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={VIZ_NODES[a].x} y1={VIZ_NODES[a].y} x2={VIZ_NODES[b].x} y2={VIZ_NODES[b].y} stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              ))}
              {VIZ_NODES.map((n, i) => (
                <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.c} stroke="#000" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </Specimen>

        <Specimen label="Spectrum text" aside="meter card" ground="none" center={false} padded={false} bodyClassName="glass flex flex-col justify-center p-5">
          <dl className="grid grid-cols-2 gap-3.5">
            <div className="border-r border-hair pr-3.5">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Input meter</dt>
              <dd className="mt-3 font-round text-[21px] font-semibold leading-none text-ink-dim">tokens</dd>
              <dd className="mt-2 text-[11.5px] leading-[1.5] text-ink-faint">Compute consumed</dd>
            </div>
            <div>
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim">Output meter</dt>
              <dd className="mt-3">
                <SpectrumWord size={21} />
              </dd>
              <dd className="mt-2 text-[11.5px] leading-[1.5] text-ink-faint">Work delivered</dd>
            </div>
          </dl>
        </Specimen>
      </div>

      <div className="grid gap-px overflow-hidden rounded-[14px] border border-hair-soft bg-hair-soft sm:grid-cols-3">
        {[
          { rule: "Always lowercase, even at sentence start", ok: true, sample: "quirq" },
          { rule: "White on black, never recolored", ok: true, sample: "mark" },
          { rule: "Not capitalized, not tinted", ok: false, sample: "Quirq" },
        ].map((r) => (
          <div key={r.rule} className="flex items-center gap-4 bg-[#070708] px-5 py-4">
            <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-[8px] border border-hair-soft bg-black">
              {r.sample === "mark" ? (
                <QuirqMark size={22} />
              ) : (
                <span className={r.ok ? "font-round text-[17px] font-semibold text-white" : "font-round text-[17px] font-semibold text-grn line-through decoration-red/80"}>{r.sample}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className={r.ok ? "font-mono text-[10px] uppercase tracking-[0.14em] text-grn" : "font-mono text-[10px] uppercase tracking-[0.14em] text-red"}>{r.ok ? "Do" : "Don't"}</span>
              <span className="block text-[12.5px] leading-snug text-ink-dim">{r.rule}</span>
            </span>
          </div>
        ))}
      </div>

      <ActionLog message={log} />
    </div>
  );
}
