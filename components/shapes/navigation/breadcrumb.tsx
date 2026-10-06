"use client";

// Breadcrumbs: path context from space to section to item.
//  Breadcrumb  app header and folder crumbs: chevron or slash separators, ancestors are links,
//              the last crumb is the page (aria-current), optional badge and trailing copy
//  SpaceCrumb  the XO mark with the space's status dot, its name, a copy-host button and a
//              data-source badge (mock data, or the host when live); mark only when compact
//  HudCrumb    visualizer layer crumb: live pip, then SPACE / CATEGORY / ROOT in tiny mono
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyText } from "@/components/ui/copy-button";
import { XOMark } from "@/components/ui/runtime-logo";

export type Crumb = {
  label: ReactNode;
  href?: string;
  /** Click handler for ancestors (navigate up without a page load). */
  onSelect?: () => void;
  /** Badge after the label: a runtime chip or a session id. */
  badge?: ReactNode;
  /** Leading glyph (home mark, folder icon). */
  icon?: ReactNode;
  /** Accessible name when the label is only an icon. */
  "aria-label"?: string;
};

export type BreadcrumbProps = {
  items: Crumb[];
  /** chevron: app headers (›); slash: folder paths (/). */
  separator?: "chevron" | "slash";
  /** app: 13px sans; folder: mono 13px with hover wells, wraps anywhere. */
  variant?: "app" | "folder";
  /** After the last crumb: a copy button. */
  trailing?: ReactNode;
  /** Show this ancestor in its hover look (static state samples). */
  hoverIndex?: number;
  "aria-label"?: string;
  className?: string;
};

/** Path trail. Ancestors navigate up; the last crumb names the current page. */
export function Breadcrumb({ items, separator = "chevron", variant = "app", trailing, hoverIndex, "aria-label": ariaLabel = "Breadcrumb", className }: BreadcrumbProps) {
  const folder = variant === "folder";
  return (
    <nav aria-label={ariaLabel} className={cn("min-w-0", className)}>
      <ol
        className={cn(
          "flex flex-wrap items-center",
          folder ? "gap-0.5 font-mono text-[13px] text-ink-dim [overflow-wrap:anywhere]" : "gap-x-2.5 gap-y-1 text-[13px] text-ink-dim",
        )}
      >
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="inline-flex min-w-0 items-center gap-x-2.5">
              {i > 0 ? (
                <span aria-hidden="true" role="presentation" className={cn("shrink-0 text-ink-faint", folder && "px-0.5")}>
                  {separator === "slash" ? "/" : <ChevronRight className="size-3.5" />}
                </span>
              ) : null}
              {last ? (
                <span aria-current="page" className={cn("inline-flex min-w-0 items-center gap-2 text-ink", folder && "px-1.5 py-0.5")}>
                  {c.icon}
                  {c["aria-label"] ? <span className="sr-only">{c["aria-label"]}</span> : null}
                  <span className={cn(!folder && "truncate")}>{c.label}</span>
                  {c.badge}
                  {trailing}
                </span>
              ) : (
                <a
                  href={c.href ?? "#"}
                  aria-label={c["aria-label"]}
                  onClick={(e) => {
                    if (!c.onSelect) return;
                    e.preventDefault();
                    c.onSelect();
                  }}
                  data-hover={i === hoverIndex || undefined}
                  className={cn(
                    "group/crumb inline-flex min-w-0 items-center gap-2 transition-colors hover:text-ink data-[hover]:text-ink",
                    folder ? "rounded-[6px]! px-1.5 py-0.5 hover:bg-s2 data-[hover]:bg-s2" : "rounded-[4px]!",
                  )}
                >
                  {c.icon}
                  {c.label !== null && c.label !== undefined ? <span className={cn(!folder && "truncate")}>{c.label}</span> : null}
                  {c.badge}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** XO home crumb: full opacity when it is the only crumb, 55% otherwise until hovered. */
export function XOHomeCrumb({ alone = false }: { alone?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex transition-opacity duration-200",
        alone ? "opacity-100" : "opacity-55 group-hover/crumb:opacity-100 group-focus-visible/crumb:opacity-100 group-data-[hover]/crumb:opacity-100",
      )}
    >
      <XOMark height={13} title={null} />
    </span>
  );
}

/* ----------------------------------------------------------------------------- SpaceCrumb */

export type SpaceCrumbProps = {
  name: string;
  host: string;
  /** up: answering; down: nothing answers; checking: before the first probe. */
  status: "up" | "down" | "checking";
  /** Where the data comes from: the mock, or the live host. */
  mode: "mock" | "live";
  /** Phone: keep only the mark; its label still names the space. */
  compact?: boolean;
  /** Show the copy button in its copied state (static state samples). */
  copied?: boolean;
  className?: string;
};

const STATUS_HINT = {
  up: (mode: "mock" | "live", host: string) => (mode === "mock" ? "Running on mock data" : `Answering at ${host}`),
  down: (_: "mock" | "live", host: string) => `Nothing is answering at ${host}`,
  checking: (_: "mock" | "live", host: string) => `Checking ${host}`,
};

/** XO mark with the space status, then the space name, a copy-host button and the data badge. */
export function SpaceCrumb({ name, host, status, mode, compact = false, copied, className }: SpaceCrumbProps) {
  const hint = STATUS_HINT[status](mode, host);
  return (
    <nav aria-label="Space" className={cn("inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-1", className)}>
      <span
        role="img"
        tabIndex={0}
        title={hint}
        aria-label={`${name}: ${hint}`}
        className="relative flex size-10 shrink-0 items-center justify-center rounded-[12px]! border border-hair bg-s2"
      >
        <XOMark height={12} title={null} />
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-1.5 right-1.5 size-2 rounded-full ring-2 ring-s2",
            status === "up" ? "bg-[#83d63a]" : status === "down" ? "bg-red" : "pulse bg-ink-faint text-ink-faint",
          )}
        />
      </span>
      {compact ? null : (
        <>
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
          <span aria-current="page" title={name} className="min-w-0 max-w-[20ch] truncate text-[13.5px] text-ink/80">
            {name}
          </span>
          <CopyHostButton value={host} label="Space host" forceCopied={copied} />
          <span
            className={cn(
              "inline-flex h-5 shrink-0 items-center rounded-[4px] border px-1.5 font-mono text-[10.5px]",
              mode === "mock" ? "border-org/30 bg-org/10 text-org" : "border-grn/30 bg-grn/10 text-grn",
            )}
          >
            {mode === "mock" ? "mock data" : host}
          </span>
        </>
      )}
    </nav>
  );
}

/** Copies the host; the icon turns into a check for 1.5s and the result is announced. */
function CopyHostButton({ value, label, forceCopied = false }: { value: string; label: string; forceCopied?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const shown = forceCopied ? "copied" : state;
  const copy = async () => {
    const ok = await copyText(value);
    setState(ok ? "copied" : "error");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1500);
  };
  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        title={`Copy ${value}`}
        data-state={shown}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-[6px]! transition-colors hover:bg-s3 [&_svg]:size-3.5",
          shown === "copied" ? "text-grn" : shown === "error" ? "text-red" : "text-ink-dim hover:text-ink",
        )}
      >
        {shown === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? `${label} copied` : state === "error" ? `Could not copy the ${label.toLowerCase()}` : ""}
      </span>
    </>
  );
}

/* ----------------------------------------------------------------------------- HudCrumb */

export type HudCrumbProps = {
  segments: string[];
  /** Live pip with a glow; off reads as paused. */
  live?: boolean;
  className?: string;
};

/** Visualizer HUD crumb: ● SPACE / RESEARCH / RESEARCH-LAB. 9px mono, tracked wide. */
export function HudCrumb({ segments, live = true, className }: HudCrumbProps) {
  return (
    <nav aria-label="Layer" className={cn("inline-flex max-w-full items-center gap-2.5 rounded-full border border-hair-soft bg-black/60 px-3.5 py-2 backdrop-blur", className)}>
      <span
        role="img"
        aria-label={live ? "Live" : "Paused"}
        className={cn(
          "size-[7px] shrink-0 rounded-full",
          live ? "pulse bg-[#83d63a] text-[#83d63a] shadow-[0_0_10px_rgba(131,214,58,0.8)]" : "bg-ink-faint",
        )}
      />
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 font-mono text-[9px] uppercase leading-[1.6] tracking-[1.6px] text-ink-dim">
        {segments.map((s, i) => (
          <li key={`${s}-${i}`} className="inline-flex items-center gap-x-2">
            {i > 0 ? <span aria-hidden="true" className="text-[#536181]">/</span> : null}
            <span aria-current={i === segments.length - 1 ? "location" : undefined} className={i === segments.length - 1 ? "text-ink" : undefined}>
              {s}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Raw runtime id chip for crumbs ("claude_code"), tinted per runtime family. */
export function RuntimeIdBadge({ id, tone }: { id: string; tone: "red" | "org" | "yel" | "grn" | "blu" | "pur" | "cyn" }): ReactNode {
  const cls = {
    red: "border-red/30 bg-red/10 text-red",
    org: "border-org/30 bg-org/10 text-org",
    yel: "border-yel/25 bg-yel/10 text-yel",
    grn: "border-grn/30 bg-grn/10 text-grn",
    blu: "border-blu/30 bg-blu/12 text-blu",
    pur: "border-pur/30 bg-pur/12 text-pur",
    cyn: "border-cyn/25 bg-cyn/10 text-cyn",
  }[tone];
  return <span className={cn("inline-flex h-5 shrink-0 items-center rounded-[4px] border px-1.5 font-mono text-[10.5px]", cls)}>{id}</span>;
}
