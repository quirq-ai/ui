"use client";

import { useId, useState } from "react";
import { Activity, CircleHelp, Cloud, Code, Copy, Globe, Info, Link, Lock, Pencil, Pin, RefreshCw, ShieldCheck, Trash2, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { StatusDot } from "@/components/ui/status";
import { copyText } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/format";
import { GALILEO_SOURCES, PROJECT_BY_ID, SPACES } from "@/lib/fixtures";
import { HoverCard, NodeCard, Popover, Tip } from "./tip";
import { DemoStatus, Example } from "./demo-kit";
import { useTimers } from "./demo-hooks";

const surface = "relative rounded-[14px] border border-hair-soft bg-[#0f0f11] p-4";
const XO = PROJECT_BY_ID["xo-space"];

/* ----------------------------------------------------------------------------- label tips */

type CopyTip = "idle" | "copying" | "copied" | "failed";
const COPY_TEXT: Record<CopyTip, string> = {
  idle: "Copy GitHub URL",
  copying: "Copying GitHub URL…",
  copied: "Copied",
  failed: "Could not copy GitHub URL",
};

function LabelTips() {
  const schedule = useTimers();
  const [pinned, setPinned] = useState(XO.pinned);
  const [copy, setCopy] = useState<CopyTip>("idle");
  const [status, setStatus] = useState("");
  return (
    <div className={cn(surface, "flex flex-col gap-4 pt-12")}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[13px] text-ink">{XO.displayName}</p>
          <p
            className="max-w-[220px] truncate text-[11.5px] text-ink-faint"
            title={XO.github?.url ?? ""}
          >
            {XO.github?.url}
          </p>
        </div>
        <div className="flex items-center gap-1" role="toolbar" aria-label={`${XO.displayName} actions`}>
          <Tip content="Copy project ID" describe={false}>
            <IconButton
              aria-label="Copy project ID"
              size="sm"
              onClick={async () => setStatus((await copyText(XO.id)) ? "Project ID copied." : "Could not copy the project ID.")}
            >
              <Copy />
            </IconButton>
          </Tip>
          <Tip content={pinned ? `Unpin ${XO.displayName}` : `Pin ${XO.displayName}`} describe={false}>
            <IconButton aria-label={`Pin ${XO.displayName}`} size="sm" active={pinned} onClick={() => setPinned(!pinned)}>
              <Pin />
            </IconButton>
          </Tip>
          <Tip content={COPY_TEXT[copy]} open={copy === "idle" ? undefined : true} describe={false}>
            <IconButton
              aria-label="Copy GitHub URL"
              size="sm"
              onClick={async () => {
                setCopy("copying");
                const ok = await copyText(XO.github?.url ?? "");
                schedule(() => setCopy(ok ? "copied" : "failed"), 450);
                schedule(() => setCopy("idle"), ok ? 1800 : 2600);
              }}
            >
              <Link />
            </IconButton>
          </Tip>
          <Tip content="Check GitHub for updated issues" describe={false}>
            <IconButton aria-label="Check GitHub for updated issues" size="sm" onClick={() => setStatus("Checked GitHub: 3 open work items (demo).")}>
              <RefreshCw />
            </IconButton>
          </Tip>
          <Tip content="Remove project" describe={false} align="end">
            <IconButton aria-label="Remove project" size="sm" variant="danger" onClick={() => setStatus("Remove opens the type-to-confirm panel.")}>
              <Trash2 />
            </IconButton>
          </Tip>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-hair-soft pt-3 text-[12.5px] text-ink-dim">
        Copy a skill for your agent
        <Tip content="Copy a short skill for your agent, so it can add, run and read jobs in this space.">
          <button
            type="button"
            aria-label="About agent skills"
            className="inline-grid size-5 place-items-center rounded-full! border border-hair-strong text-ink-faint transition-colors hover:text-ink [&_svg]:size-3"
          >
            <Info aria-hidden="true" />
          </button>
        </Tip>
      </div>
      <p role="status" className="sr-only">
        {copy === "idle" ? "" : COPY_TEXT[copy]}
      </p>
      <DemoStatus>{status || "Hover or focus an icon. Copy GitHub URL swaps its tip while it works."}</DemoStatus>
    </div>
  );
}

/* ----------------------------------------------------------------------------- shown and repositioned */

function Placement() {
  return (
    <div data-tip-boundary className={cn(surface, "flex min-h-[300px] flex-col gap-3")}>
      <div className="flex items-start justify-between gap-3">
        <Tip content="Flipped below" open placement="bottom" align="start">
          <Button size="sm">Top left</Button>
        </Tip>
        <Tip content="Flipped below, aligned right" open placement="bottom" align="end">
          <Button size="sm">Top right</Button>
        </Tip>
      </div>
      <div className="flex flex-1 items-end justify-center pb-3">
        <Tip content="Shown above, centered" open placement="top" align="center">
          <Button size="sm">Default</Button>
        </Tip>
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-hair-soft pt-3">
        <Tip content="Hovered tips pick their own side">
          <Button size="sm" variant="subtle">
            Hover left
          </Button>
        </Tip>
        <Tip content="This one aligns to the right edge on its own">
          <Button size="sm" variant="subtle">
            Hover right
          </Button>
        </Tip>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- help card with animation */

function TokenGif() {
  return (
    <svg viewBox="0 0 240 120" className="block h-auto w-full rounded-[8px] border border-hair-soft bg-[#0a0a0b]" role="img" aria-label="Animation: open Basic Information, then App-Level Tokens, then copy the xapp- token">
      <style>{`
        @keyframes ov-gif-cursor { 0%,10% { transform: translate(150px, 96px) } 30%,45% { transform: translate(52px, 30px) } 65%,100% { transform: translate(150px, 70px) } }
        @keyframes ov-gif-a { 0%,25% { opacity: 0 } 30%,60% { opacity: 1 } 65%,100% { opacity: 0 } }
        @keyframes ov-gif-b { 0%,60% { opacity: 0 } 65%,100% { opacity: 1 } }
        .ov-gif-cursor { animation: ov-gif-cursor 4.2s cubic-bezier(0.22,1,0.36,1) infinite }
        .ov-gif-a { animation: ov-gif-a 4.2s linear infinite }
        .ov-gif-b { animation: ov-gif-b 4.2s linear infinite }
        @media (prefers-reduced-motion: reduce) { .ov-gif-cursor, .ov-gif-a, .ov-gif-b { animation: none } .ov-gif-b { opacity: 1 } }
      `}</style>
      <rect x="0" y="0" width="80" height="120" fill="rgba(255,255,255,0.03)" />
      {[18, 32, 46, 60, 74].map((y, i) => (
        <rect key={y} x="10" y={y} width={i === 1 ? 56 : 44} height="6" rx="3" fill="rgba(255,255,255,0.12)" />
      ))}
      <rect className="ov-gif-a" x="6" y="27" width="68" height="16" rx="4" fill="rgba(47,210,255,0.18)" />
      <text x="92" y="26" fontSize="9" fill="#a3a39e" fontFamily="ui-monospace, monospace">
        App-Level Tokens
      </text>
      <rect x="92" y="34" width="136" height="22" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
      <rect className="ov-gif-b" x="92" y="62" width="136" height="22" rx="5" fill="rgba(48,209,88,0.1)" stroke="rgba(48,209,88,0.45)" />
      <text className="ov-gif-b" x="100" y="77" fontSize="9.5" fill="#30d158" fontFamily="ui-monospace, monospace">
        xapp-1-A0…example
      </text>
      <g className="ov-gif-cursor">
        <path d="M0 0 L0 12 L3.5 9 L6 14 L8 13 L5.5 8 L10 8 Z" fill="#f4f3f0" stroke="#000" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

function HelpCard() {
  const id = useId();
  const [pinned, setPinned] = useState(true);
  const card = (
    <span className="block rounded-[12px] border border-hair-strong bg-s2 p-3 text-left shadow-[0_14px_36px_rgba(0,0,0,0.55)]">
      <span className="block text-[13px] font-semibold text-ink">Slack app token</span>
      <span className="mt-1 block text-[12px] leading-relaxed text-ink-dim">
        Found in your Slack app under Basic Information, then App-Level Tokens. Starts with <code className="font-mono text-ink">xapp-</code>.
      </span>
      <span className="mt-2.5 block">
        <TokenGif />
      </span>
    </span>
  );
  return (
    <div className={cn(surface, "flex min-h-[390px] flex-col gap-3 sm:min-h-[340px]")}>
      <Field
        id={id}
        label="Slack app token"
        labelStyle="plain"
        aside={
          <HoverCard card={card} width={268} height={250} open={pinned ? true : undefined} placement="bottom" align="end">
            <button
              type="button"
              aria-label="Where to find the Slack app token"
              className="inline-grid size-5 place-items-center rounded-full! text-ink-faint transition-colors hover:text-ink [&_svg]:size-4"
            >
              <CircleHelp aria-hidden="true" />
            </button>
          </HoverCard>
        }
      >
        <Input mono placeholder="xapp-…" autoComplete="off" />
      </Field>
      <label className="mt-auto inline-flex items-center gap-2 text-[12px] text-ink-dim">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-[var(--ink)]" />
        Keep the card open (otherwise hover or focus the help icon)
      </label>
    </div>
  );
}

/* ----------------------------------------------------------------------------- graph node card */

const NODES = [
  { id: "root", label: "research-lab", x: 50, y: 18, r: 18, color: "ink" as const },
  { id: "eng", label: "Engineering", x: 24, y: 52, r: 13, color: "blu" as const },
  { id: "research", label: "Research", x: 76, y: 50, r: 11, color: "pur" as const },
  { id: "xo-space", label: "xo-space", x: 12, y: 84, r: 9, color: "blu" as const },
  { id: "galileo", label: "galileo", x: 36, y: 86, r: 8, color: "blu" as const },
  { id: "notes", label: "research-notes", x: 76, y: 86, r: 8, color: "pur" as const },
];
const EDGES: [string, string][] = [
  ["root", "eng"],
  ["root", "research"],
  ["eng", "xo-space"],
  ["eng", "galileo"],
  ["research", "notes"],
];

function nodeCard(id: string) {
  const space = SPACES.find((s) => s.name === "research-lab")!;
  if (id === "root") {
    return <NodeCard color="grn" kicker="The center" title={space.name} sub="Local space on Ada's laptop" rows={[{ term: "Holds", value: `${space.projects.length} projects` }]} foot="Click to focus · Double-click to expand" />;
  }
  if (id === "eng" || id === "research") {
    const name = id === "eng" ? "Engineering" : "Research";
    return (
      <NodeCard
        color={id === "eng" ? "blu" : "pur"}
        kicker="Cluster"
        title={name}
        sub={id === "eng" ? "Product code and services" : "Reading, experiments and visualizers"}
        rows={[{ term: "Holds", value: id === "eng" ? "3 projects" : "2 projects" }]}
        foot="Click to focus · Double-click to open or close"
      />
    );
  }
  const p = PROJECT_BY_ID[id === "notes" ? "research-notes" : id];
  return (
    <NodeCard
      color={p.color}
      kicker={`${p.category} · project`}
      title={p.displayName}
      rows={[
        { term: "Touched", value: formatDate(p.lastActiveAt, { withYear: true }) },
        { term: "Where", value: `${p.displayName}/README.md`, mono: true },
        { term: "Ties", value: `${p.peers.length + 1} connections · ${p.category}` },
      ]}
      foot="Click to focus · Double-click to expand"
    />
  );
}

function GraphCards() {
  const [status, setStatus] = useState("");
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <div className={cn(surface, "grid gap-4 md:grid-cols-[minmax(0,1fr)_262px] lg:grid-cols-[minmax(0,1fr)_262px_262px]")}>
      <div className="flex min-w-0 flex-col gap-3 md:row-span-2 lg:row-span-1">
        <div className="dots relative h-[260px] rounded-[10px] border border-hair-soft bg-black/40">
          <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {EDGES.map(([a, b]) => (
              <line key={a + b} x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} stroke="rgba(255,255,255,0.16)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          {NODES.map((n) => {
            const tint = n.color === "ink" ? "var(--ink)" : `var(--${n.color})`;
            return (
              <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                <HoverCard card={nodeCard(n.id)} width={262} height={190}>
                  <button
                    type="button"
                    aria-label={n.label}
                    onClick={() => setStatus(`Focused ${n.label}.`)}
                    onDoubleClick={() => setStatus(`Expanded ${n.label}.`)}
                    className="grid place-items-center rounded-full! border-2 border-black/60 transition-transform hover:scale-110"
                    style={{ width: n.r * 2, height: n.r * 2, background: tint, boxShadow: `0 0 0 4px color-mix(in srgb, ${tint} 18%, transparent)` }}
                  />
                </HoverCard>
                <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-ink-faint">
                  {n.label}
                </span>
              </div>
            );
          })}
        </div>
        <DemoStatus>{status || "Hover or focus a node. Click focuses it, double-click expands it."}</DemoStatus>
      </div>
      <div className="min-w-0">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Shown · leaf</p>
        {nodeCard("xo-space")}
      </div>
      <div className="min-w-0">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Shown · cluster</p>
        {nodeCard("eng")}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- value chips */

const CHIPS = [
  { icon: <Cloud />, label: "1-click setup in the cloud", tip: "XO Swarm starts a hosted space for you. No machine to prepare." },
  { icon: <Activity />, label: "Runs around the clock", tip: "Hosted spaces keep working until their auto-stop window ends." },
  { icon: <ShieldCheck />, label: "Private by default", tip: "Secrets and files stay inside the space. Nothing is shared unless you share it." },
  { icon: <Code />, label: "Open, inspectable architecture", tip: "XO Space is open source: engine, Space API and Space dashboard." },
];

function ValueChips() {
  return (
    <div className={cn(surface, "flex flex-col gap-5")}>
      <ul className="flex flex-wrap gap-2" aria-label="Why XO">
        {CHIPS.map((c) => (
          <li key={c.label}>
            <Tip content={c.tip}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full! border border-hair bg-white/[0.02] px-3 py-1.5 text-[12.5px] text-ink-dim transition-colors hover:bg-white/[0.06] hover:text-ink [&_svg]:size-4 [&_svg]:text-grn"
              >
                <span aria-hidden="true" className="inline-flex">
                  {c.icon}
                </span>
                {c.label}
              </button>
            </Tip>
          </li>
        ))}
      </ul>
      <div className="border-t border-hair-soft pt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Templates hero row</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-ink-dim [&_svg]:size-4 [&_svg]:text-grn">
          <li className="inline-flex items-center gap-1.5">
            <Zap aria-hidden="true" /> Zero setup
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Lock aria-hidden="true" /> Privacy first
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Globe aria-hidden="true" /> Global infrastructure
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- port popover */

function PortForm({ name, port, onDone }: { name: string; port: number; onDone: (port: number) => void }) {
  const id = useId();
  const schedule = useTimers();
  const [value, setValue] = useState(String(port));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  return (
    <form
      noValidate
      className="flex flex-col gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1024 || n > 65535) {
          setError("Enter a port from 1024 to 65535.");
          return;
        }
        setError(undefined);
        setBusy(true);
        schedule(() => {
          setBusy(false);
          onDone(n);
        }, 900);
      }}
    >
      <Field id={id} label="Port" error={error} hint={`galileo serves ${name} from this port.`}>
        <Input mono size="sm" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter port number" disabled={busy} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="primary" loading={busy} loadingLabel="Updating…">
          Update
        </Button>
      </div>
    </form>
  );
}

function PortPopovers() {
  const [ports, setPorts] = useState<Record<string, number>>(
    Object.fromEntries(GALILEO_SOURCES.filter((s) => s.type === "port").map((s) => [s.name, s.port ?? 0])),
  );
  const [status, setStatus] = useState("");
  const rows = GALILEO_SOURCES.filter((s) => s.type === "port").slice(0, 3);
  return (
    <div className={cn(surface, "flex min-h-[330px] flex-col gap-2")}>
      <ul className="flex flex-col divide-y divide-hair-soft">
        {rows.map((s, i) => (
          <li key={s.name} className="flex items-center gap-3 py-2.5">
            <StatusDot status={s.up ? "up" : "down"} label={s.up ? "Up" : "Down"} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[12.5px] text-ink">{s.name}</p>
              <p className="truncate text-[11.5px] text-ink-faint">{s.detail}</p>
            </div>
            <Popover
              label={`Port for ${s.name}`}
              align="end"
              width={250}
              defaultOpen={i === 0}
              triggerLabel={`Change port for ${s.name}, now ${ports[s.name]}`}
              trigger={
                <>
                  <span className="font-mono tabular-nums">:{ports[s.name]}</span>
                  <Pencil aria-hidden="true" />
                </>
              }
              triggerClassName="inline-flex h-7 items-center gap-1.5 rounded-[8px]! border border-hair bg-s2 px-2.5 text-[12px] text-ink-dim transition-colors hover:border-hair-strong hover:text-ink aria-expanded:border-hair-strong aria-expanded:text-ink [&_svg]:size-3.5"
            >
              {(close) => (
                <PortForm
                  name={s.name}
                  port={ports[s.name]}
                  onDone={(port) => {
                    setPorts((p) => ({ ...p, [s.name]: port }));
                    setStatus(`${s.name} now points at :${port}.`);
                    close();
                  }}
                />
              )}
            </Popover>
          </li>
        ))}
      </ul>
      <DemoStatus className="mt-auto">{status}</DemoStatus>
    </div>
  );
}

/* ----------------------------------------------------------------------------- demo */

export function TipDemo() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Example caption="Variant · label" note="Hover or focus; Esc hides">
        <LabelTips />
      </Example>
      <Example caption="State · shown · repositioned" note="Flips and aligns inside its boundary">
        <Placement />
      </Example>
      <Example caption="Variant · help with GIF" note="Animated inline SVG; still under reduced motion">
        <HelpCard />
      </Example>
      <Example caption="Variant · port popover" note="Click a port; Esc closes">
        <PortPopovers />
      </Example>
      <Example caption="Variant · graph node card" note="Hover or focus a node" className="lg:col-span-2">
        <GraphCards />
      </Example>
      <Example caption="Variant · value chips" note="Hover or focus a chip" className="lg:col-span-2">
        <ValueChips />
      </Example>
    </div>
  );
}
