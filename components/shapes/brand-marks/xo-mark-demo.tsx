"use client";

import { useState, type MouseEvent } from "react";
import { SPACES } from "@/lib/fixtures";
import { ActionLog, Caption, DemoSection, Specimen } from "./kit";
import { LineIcon } from "./icons";
import { BreadcrumbHomeMark, GalileoBrandLink, GalileoTile, XOChevrons, XOLogo, XOProductLockup, XOSquare, XO_LIME } from "./xo-mark";

/* Six spokes around the root mark, precomputed so render stays free of trig. */
const SPOKES = [
  { x: 295, y: 121, c: "var(--blu)" },
  { x: 207, y: 168, c: "var(--ink-faint)" },
  { x: 92, y: 148, c: "var(--blu)" },
  { x: 65, y: 79, c: "var(--ink-faint)" },
  { x: 153, y: 32, c: "var(--blu)" },
  { x: 268, y: 52, c: "var(--ink-faint)" },
];

export function XOMarkDemo() {
  const [log, setLog] = useState<string | null>(null);
  const space = SPACES.find((s) => s.name === "ops-copilot") ?? SPACES[0];
  const go = (msg: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLog(msg);
  };

  return (
    <div className="space-y-10">
      <DemoSection title="Colorways" note="Outer pair ink, inner pair XO lime · xo-logo.svg, xo-logo-light.svg, themes.css">
        <div className="grid gap-5 md:grid-cols-3">
          <Specimen label="Dark" aside="white + #83d63a" ground="black" minHeight={150}>
            <XOLogo height={44} glow title="XO, dark" />
          </Specimen>
          <Specimen label="Light" aside="#08090A + hsl(92,60%,28%)" ground="paper" minHeight={150}>
            <XOLogo height={44} variant="light" title="XO, light" />
          </Specimen>
          <Specimen label="Themed" aside="ink, no glow · graphite, linen" ground="none" center={false} padded={false} minHeight={150} bodyClassName="grid grid-rows-2">
            <div className="flex items-center justify-center bg-[#1d1d1f] text-[#f4f3f0]">
              <XOProductLockup variant="themed" product="Space" />
            </div>
            <div className="flex items-center justify-center bg-[#f3efe6] text-[#2a2620]">
              <XOProductLockup variant="themed" product="Space" />
            </div>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="Product lockups" note="Mark beside the product word; click a home mark">
        <div className="grid gap-5 lg:grid-cols-2">
          <Specimen label="Space topbar · XO Space · ops-copilot" aside="space-ui" ground="none" center={false} padded={false} bodyClassName="bg-s2">
            <div className="flex h-14 items-center gap-5 overflow-hidden border-b border-hair px-4 text-ink">
              <a href="#xo-mark" onClick={go("Space brand → Overview (/)")} aria-label="XO Space home" className="flex min-w-0 shrink items-center rounded-[6px]">
                <XOProductLockup product="Space" context={space.name} status="up" statusLabel="Running" />
              </a>
              <span className="ml-auto hidden shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim sm:inline">
                {space.provider} · {space.status}
              </span>
            </div>
            <div className="grid gap-px bg-hair-soft sm:grid-cols-2">
              <div className="flex flex-col gap-2 bg-s1 px-4 py-3.5">
                <Caption>Custom name and logo</Caption>
                <XOProductLockup
                  product="Acme Ops"
                  customLogo={
                    <span aria-hidden="true" className="grid size-[22px] place-items-center rounded-[6px] bg-org font-mono text-[11px] font-medium text-black">
                      A
                    </span>
                  }
                />
              </div>
              <div className="flex flex-col gap-2 bg-s1 px-4 py-3.5">
                <Caption>Logo error fallback</Caption>
                <XOProductLockup product="Acme Ops" />
              </div>
            </div>
          </Specimen>

          <Specimen label="Swarm breadcrumb · 28px home, muted until hover" aside="swarm" ground="none" center={false} padded={false} bodyClassName="bg-black">
            <nav aria-label="Breadcrumb" className="flex h-14 items-center border-b border-hair-soft px-4">
              <ol className="flex min-w-0 items-center gap-2 text-[13px] text-ink-dim">
                <li className="flex items-center">
                  <BreadcrumbHomeMark onClick={go("Breadcrumb home → / (demo)")} />
                </li>
                <li aria-hidden="true" className="text-ink-faint">
                  /
                </li>
                <li>Spaces</li>
                <li aria-hidden="true" className="text-ink-faint">
                  /
                </li>
                <li aria-current="page" className="truncate font-medium text-ink">
                  {space.name}
                </li>
              </ol>
            </nav>
            <div className="grid grid-cols-3 gap-px bg-hair-soft">
              {(
                [
                  ["Full", "full"],
                  ["Muted 55%", "muted"],
                  ["Light theme", "light"],
                ] as const
              ).map(([label, kind]) => (
                <div key={kind} className={kind === "light" ? "flex flex-col items-center gap-2 bg-[#f4f3f0] px-3 py-3.5" : "flex flex-col items-center gap-2 bg-s1 px-3 py-3.5"}>
                  {kind === "light" ? (
                    <BreadcrumbHomeMark theme="light" tone="full" onClick={go("Light breadcrumb home → / (demo)")} />
                  ) : (
                    <BreadcrumbHomeMark tone={kind === "full" ? "full" : "muted-hover"} onClick={go(`${label} home mark → / (demo)`)} />
                  )}
                  <Caption className={kind === "light" ? "text-[#5c5c57]" : undefined}>{label}</Caption>
                </div>
              ))}
            </div>
          </Specimen>

          <Specimen label="galileo bar · 22px tile, radius 6, gap 8" aside="galileo" ground="galileo" center={false} padded={false}>
            <header aria-label="telescope" className="flex h-12 items-center gap-2.5 border-b border-[rgba(238,242,234,0.09)] bg-[#0a0d08] pr-2.5 pl-3">
              <GalileoBrandLink onClick={go("galileo brand → Sources page (demo)")} />
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-[8px] border border-[rgba(131,214,58,0.22)] bg-[#10140d] px-2.5 text-[13px]">
                  <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-[#83d63a]" />
                  <span className="truncate">acme</span>
                </span>
                <span className="hidden h-8 min-w-0 flex-1 items-center rounded-[8px] border border-[rgba(238,242,234,0.09)] bg-[#10140d] px-2.5 font-mono text-[12px] text-[#9ca693] sm:inline-flex">
                  /
                </span>
              </div>
              <span className="inline-flex size-8 items-center justify-center text-[#9ca693]" aria-hidden="true">
                <LineIcon name="reload" size={16} strokeWidth={1.6} />
              </span>
              <span className="inline-flex size-8 items-center justify-center text-[#9ca693]" aria-hidden="true">
                <LineIcon name="open-external" size={16} strokeWidth={1.6} />
              </span>
            </header>
            <div className="flex flex-wrap items-center gap-6 px-4 py-4">
              <div className="flex items-center gap-3">
                <header aria-label="telescope, narrow" className="flex h-10 w-[150px] items-center gap-2 rounded-[8px] border border-[rgba(238,242,234,0.09)] bg-[#0a0d08] px-2.5">
                  <GalileoBrandLink iconOnly onClick={go("galileo icon → Sources page (demo)")} />
                  <span className="h-6 flex-1 rounded-[6px] border border-[rgba(131,214,58,0.22)] bg-[#10140d]" aria-hidden="true" />
                </header>
                <Caption className="text-[#9ca693]">Icon only on mobile</Caption>
              </div>
              <div className="flex items-end gap-3 rounded-[10px] border border-[rgba(238,242,234,0.09)] bg-[#151a12] px-3 py-2.5">
                <GalileoTile size={48} title="galileo favicon" />
                <GalileoTile size={32} />
                <GalileoTile size={16} />
                <Caption className="text-[#9ca693]">Favicon</Caption>
              </div>
            </div>
          </Specimen>

          <Specimen label="Root mark in the graph canvas" aside="space-ui graph" ground="black" padded={false} bodyClassName="dots">
            <svg viewBox="0 0 360 200" className="h-[200px] w-full" role="img" aria-label="Graph canvas with the XO mark at the root and six spokes">
              {SPOKES.map((p, i) => (
                <g key={i}>
                  <line x1="180" y1="100" x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.14)" />
                  <circle cx={p.x} cy={p.y} r="5" fill={p.c} stroke="#000" strokeWidth="2" />
                </g>
              ))}
              <circle cx="180" cy="100" r="17" fill="#0d0d0d" stroke="rgba(131,214,58,0.45)" />
              <g transform="translate(166 94) scale(0.0608) translate(-20 -155)">
                <XOChevrons outer="#ffffff" inner={XO_LIME} strokeWidth={26} />
              </g>
            </svg>
          </Specimen>
        </div>
      </DemoSection>

      <DemoSection title="States" note="Lime glow by default; themed marks drop it">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Specimen label="Lime glow" aside="drop-shadow 9px" ground="black">
            <XOLogo height={30} glow title="XO with glow" />
          </Specimen>
          <Specimen label="No glow" aside="custom logo, themed" ground="black">
            <XOLogo height={30} title="XO without glow" />
          </Specimen>
          <Specimen label="Muted until hover" aside="55%" ground="black">
            <BreadcrumbHomeMark size={44} onClick={go("Muted home mark → / (demo)")} />
          </Specimen>
          <Specimen label="Square" aside="dark · light" ground="none" center={false} padded={false} bodyClassName="grid grid-cols-2">
            <span className="flex items-center justify-center bg-black py-6">
              <XOSquare size={40} title="XO square, dark" />
            </span>
            <span className="flex items-center justify-center bg-[#f4f3f0] py-6">
              <XOSquare size={40} variant="light" title="XO square, light" />
            </span>
          </Specimen>
        </div>
      </DemoSection>

      <ActionLog message={log} />
    </div>
  );
}
