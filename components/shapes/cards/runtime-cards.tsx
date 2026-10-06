"use client";

// Agent runtime cards: RuntimeMarketCard (logo banner, name and tag, powered by, setup
// level, features, Create space), RuntimePickerCard (Overview and Details tabs), TemplateCard
// (available or coming soon) and RuntimeSetupRow (selectable row with an agent details
// disclosure). SkillLevel and RuntimeBanner are exported for reuse.
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LOGO_META, RuntimeLogo, resolveLogoId, type LogoAlias, type LogoId } from "@/components/ui/runtime-logo";
import { Spinner } from "@/components/ui/loaders";

/* ----------------------------------------------------------------------------- SkillLevel */

/** Three 5px dots, green up to the level, then the setup label. */
export function SkillLevel({ level, label }: { level: 1 | 2 | 3; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[11.5px] text-ink-faint">
      <span className="flex gap-[3px]" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("size-[5px] rounded-full", i <= level ? "bg-grn" : "bg-white/20")} />
        ))}
      </span>
      <span>
        <span className="sr-only">Setup level {level} of 3: </span>
        {label}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------------------- RuntimeBanner */

/** Logo banner tinted with the runtime's vendor color. Decorative. */
export function RuntimeBanner({ id, height = 132, className }: { id: LogoId | LogoAlias; height?: number; className?: string }) {
  const key = resolveLogoId(id);
  const tint = LOGO_META[key].color ?? "#8f8a7e";
  return (
    <div
      aria-hidden="true"
      className={cn("relative grid place-items-center overflow-hidden border-b border-hair-soft", className)}
      style={{
        height,
        background: `radial-gradient(120% 140% at 50% -10%, color-mix(in srgb, ${tint} 30%, #0d0d10) 0%, #0d0d10 62%)`,
      }}
    >
      <div className="absolute inset-0 dots opacity-50" />
      <span className="relative grid size-[64px] place-items-center rounded-[16px] border border-white/15 bg-black/40 backdrop-blur-sm transition-transform duration-200 group-hover/rt:scale-110">
        <RuntimeLogo id={key} size={34} decorative />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------- RuntimeMarketCard */

export type CreateState = "idle" | "creating" | "created";

export type RuntimeMarketCardProps = {
  name: string;
  runtime: LogoId | LogoAlias;
  poweredBy: string;
  tag?: "Featured" | "New" | "Experimental";
  level: 1 | 2 | 3;
  levelLabel: string;
  features: string[];
  /** A space already runs this runtime. */
  inUse?: boolean;
  createState?: CreateState;
  onCreate?: () => void;
  onOpen?: () => void;
  className?: string;
};

/** Marketplace card. Lifts 3px on hover; the green CTA is the one green-filled button. */
export function RuntimeMarketCard({
  name,
  runtime,
  poweredBy,
  tag,
  level,
  levelLabel,
  features,
  inUse = false,
  createState = "idle",
  onCreate,
  onOpen,
  className,
}: RuntimeMarketCardProps) {
  return (
    <article
      className={cn(
        "group/rt flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-hair-soft bg-[#0f0f11] transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-white/20",
        className,
      )}
    >
      <RuntimeBanner id={runtime} />
      <div className="flex flex-1 flex-col gap-3 px-[22px] pb-[22px] pt-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="min-w-0 text-[17px] font-semibold leading-snug tracking-[-0.015em]">{name}</h4>
          {tag ? (
            <span
              className={cn(
                "mt-1.5 shrink-0 font-mono text-[8.5px] uppercase tracking-[0.14em]",
                tag === "Featured" ? "text-grn" : tag === "Experimental" ? "text-org" : "text-ink-faint",
              )}
            >
              {tag}
            </span>
          ) : null}
        </div>
        <p className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-dim">
          Powered by {poweredBy}
          {inUse ? (
            <Badge tone="grn" size="xs" dot>
              In use
            </Badge>
          ) : null}
        </p>
        <SkillLevel level={level} label={levelLabel} />
        <ul className="flex flex-1 flex-col gap-2 border-t border-hair-soft pt-3 text-[12px] leading-[1.5] text-ink-dim">
          {features.map((f) => (
            <li key={f} className="flex gap-1.5">
              <span aria-hidden="true">◇</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {createState === "created" ? (
          <button
            type="button"
            onClick={onOpen}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full! border border-grn/50 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-grn transition-colors hover:bg-grn/10"
          >
            Open space <ArrowRight aria-hidden="true" className="size-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreate}
            disabled={createState === "creating"}
            aria-busy={createState === "creating" || undefined}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full! bg-grn py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-black transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
          >
            {createState === "creating" ? (
              <>
                <Spinner size="xs" label={null} /> Creating…
              </>
            ) : (
              "Create space"
            )}
          </button>
        )}
        <span role="status" className="sr-only">
          {createState === "creating" ? `Creating a ${name} space` : createState === "created" ? `${name} space created` : ""}
        </span>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------- RuntimePickerCard */

export type RuntimePickerCardProps = {
  name: string;
  runtime: LogoId | LogoAlias;
  poweredBy: string;
  badge?: string;
  level: 1 | 2 | 3;
  levelLabel: string;
  overview: ReactNode;
  useCases: string[];
  createState?: CreateState;
  onCreate?: () => void;
  /** Shown once the space exists: Open space. */
  onOpen?: () => void;
  className?: string;
};

/** Create-flow picker with Overview and Details tabs (arrow keys, Home and End move between tabs) and one Create space CTA. */
export function RuntimePickerCard({
  name,
  runtime,
  poweredBy,
  badge,
  level,
  levelLabel,
  overview,
  useCases,
  createState = "idle",
  onCreate,
  onOpen,
  className,
}: RuntimePickerCardProps) {
  const [tab, setTab] = useState<"overview" | "details">("overview");
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = ["overview", "details"] as const;

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(tabs[next]);
    refs.current[next]?.focus();
  }

  return (
    <article
      className={cn(
        "group/rt flex min-w-0 flex-col gap-4 rounded-[14px] border bg-gradient-to-t from-white/[0.03] to-s2 p-5 transition-colors",
        createState === "created" ? "border-grn/50" : "border-hair hover:border-hair-strong",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[11px] border border-hair bg-s3 transition-transform duration-200 group-hover/rt:scale-110">
          <RuntimeLogo id={runtime} size={22} decorative />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
            {name}
            {badge ? (
              <Badge size="xs" tone={badge === "Experimental" ? "org" : "neutral"}>
                {badge}
              </Badge>
            ) : null}
          </h4>
          <p className="mt-0.5 text-[12px] text-ink-dim">Powered by {poweredBy}</p>
        </div>
      </header>
      <SkillLevel level={level} label={levelLabel} />
      <div>
        <div role="tablist" aria-label={`${name} details`} className="flex rounded-[9px] border border-hair bg-s1 p-[3px]">
          {tabs.map((t, i) => (
            <button
              key={t}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-tab-${t}`}
              role="tab"
              type="button"
              aria-selected={tab === t}
              aria-controls={`${base}-panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "h-7 flex-1 rounded-[6px]! text-[12px] font-medium capitalize transition-colors",
                tab === t ? "bg-s4 text-ink" : "text-ink-dim hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tabs.map((t) => (
          <div
            key={t}
            id={`${base}-panel-${t}`}
            role="tabpanel"
            aria-labelledby={`${base}-tab-${t}`}
            tabIndex={0}
            hidden={tab !== t}
            className="mt-3 min-h-[92px] rounded-[6px] text-[12.5px] text-ink-dim"
          >
            {t === "overview" ? (
              overview
            ) : (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Use cases</p>
                <ul className="flex flex-wrap gap-1.5">
                  {useCases.map((u) => (
                    <li key={u} className="rounded-[6px] border border-hair bg-white/[0.03] px-2 py-1 text-[11.5px] text-ink">
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-auto">
        {createState === "created" ? (
          <Button block onClick={onOpen} trailingIcon={<ArrowRight />} className="border-grn/50! text-grn! hover:bg-grn/10!">
            Open space
          </Button>
        ) : (
          <Button block loading={createState === "creating"} loadingLabel="Creating…" onClick={onCreate}>
            Create space
          </Button>
        )}
      </div>
      <span role="status" className="sr-only">
        {createState === "creating" ? `Creating a ${name} space` : createState === "created" ? `${name} space created` : ""}
      </span>
    </article>
  );
}

/* ----------------------------------------------------------------------------- TemplateCard */

export type TemplateCardProps = {
  name: string;
  badge?: "Beta" | "New" | "Coming soon";
  description: string;
  features: string[];
  icon: ReactNode;
  onLaunch?: () => void;
  className?: string;
};

/** Template gallery card. Coming soon is muted and has no CTA. */
export function TemplateCard({ name, badge, description, features, icon, onLaunch, className }: TemplateCardProps) {
  const soon = badge === "Coming soon";
  return (
    <article
      data-state={soon ? "coming-soon" : "available"}
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-[14px] border p-5",
        soon ? "border-dashed border-hair bg-s1/60 text-ink-dim" : "border-hair bg-gradient-to-t from-blu/[0.05] to-s2 shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-[9px] [&_svg]:size-[18px]", soon ? "bg-s3 text-ink-faint" : "bg-blu/15 text-blu")}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className={cn("flex flex-wrap items-center gap-2 text-[15px] font-semibold", soon ? "text-ink-dim" : "text-ink")}>
            {name}
            {badge ? (
              <Badge size="xs" tone={badge === "New" ? "grn" : badge === "Beta" ? "blu" : "neutral"} variant={soon ? "outline" : "soft"}>
                {badge}
              </Badge>
            ) : null}
          </h4>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-dim">{description}</p>
        </div>
      </header>
      <ul className="flex flex-wrap gap-1.5">
        {features.map((f) => (
          <li key={f} className="rounded-[6px] border border-hair px-2 py-0.5 text-[11px] text-ink-dim">
            {f}
          </li>
        ))}
      </ul>
      {soon ? null : (
        <div className="mt-auto pt-1">
          <Button size="sm" onClick={onLaunch} trailingIcon={<ArrowRight />}>
            Use template
          </Button>
        </div>
      )}
    </article>
  );
}

/* ----------------------------------------------------------------------------- RuntimeSetupRow */

export type RuntimeSetupRowProps = {
  runtime: LogoId | LogoAlias;
  name: string;
  /** Radio group name shared by the rows. */
  group: string;
  selected?: boolean;
  onSelect?: () => void;
  inUse?: boolean;
  installed: boolean;
  folderFound?: boolean;
  version?: string | null;
  details?: { term: string; value: ReactNode }[];
  action?: ReactNode;
  className?: string;
};

/** Selectable runtime row with status words and an Agent details disclosure. */
export function RuntimeSetupRow({
  runtime,
  name,
  group,
  selected = false,
  onSelect,
  inUse = false,
  installed,
  folderFound = false,
  version,
  details,
  action,
  className,
}: RuntimeSetupRowProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[9px] border p-[15px] transition-colors",
        selected ? "border-grn/40 bg-grn/[0.04]" : "border-hair-soft bg-s2 hover:border-hair",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 cursor-pointer items-center gap-3">
          <input
            type="radio"
            name={group}
            checked={selected}
            onChange={onSelect}
            disabled={!installed}
            className="size-4 shrink-0 cursor-[inherit] appearance-none rounded-full! border border-hair-strong bg-s1 checked:border-[5px] checked:border-grn disabled:opacity-40"
          />
          <span className="grid size-9 shrink-0 place-items-center rounded-[9px] border border-hair bg-s3">
            <RuntimeLogo id={runtime} size={18} decorative />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-ink">
              {name}
              {inUse ? (
                <Badge tone="grn" size="xs" dot>
                  In use
                </Badge>
              ) : null}
              {version ? <span className="font-mono text-[10.5px] text-ink-faint">v{version}</span> : null}
            </span>
            <span className="mt-0.5 block text-[12px] text-ink-dim">
              {installed ? (folderFound ? "Installed · Agent folder found" : "Installed · No agent folder yet") : "Not installed"}
            </span>
          </span>
        </label>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {details && details.length ? (
        <details className="group/det mt-3 border-t border-hair-soft pt-2.5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-[4px]! text-[12px] text-ink-dim hover:text-ink">
            <ChevronRight aria-hidden="true" className="size-3.5 transition-transform group-open/det:rotate-90" />
            Agent details
          </summary>
          <dl className="mt-2.5 grid gap-x-6 gap-y-1.5 pl-5 text-[12px] sm:grid-cols-[auto_1fr]">
            {details.map((d) => (
              <div key={d.term} className="contents">
                <dt className="text-ink-faint">{d.term}</dt>
                <dd className="min-w-0 break-words font-mono text-[11.5px] text-ink">{d.value}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
    </div>
  );
}
