"use client";

// Sidebar and section nav:
//  Sidebar              aside shell with header, scrolling nav and footer; collapses to a 56px icon rail
//  SidebarScopeSwitcher Personal spaces / Org spaces tile with a radio menu
//  SidebarGroup         labelled group; the label hides in the icon rail
//  SidebarItem          link row: lime bar and gradient when current, tooltip when collapsed
//  SidebarSpaceItem     space row with its runtime logo and a kebab (Copy space ID, Delete space)
//  SidebarCreateButton  "+ New space" with the lime icon well
//  SidebarEmptyRow, SidebarSkeleton, SidebarThemeButton (cycles Light, Dark, System)
//  SetupStepper         numbered setup steps plus Manage links, column or compact tiles
//  SettingsNav          settings sections, vertical with a horizontal strip on narrow frames
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Copy, Ellipsis, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyText } from "@/components/ui/copy-button";
import { Skeleton, Spinner } from "@/components/ui/loaders";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import type { Tone } from "@/components/ui/tones";
import { DropdownMenu, MenuGroup, MenuItem, MenuSeparator } from "./menu";
import { THEME_LABEL, ThemeIcon, nextTheme, type ThemeChoice } from "./account-menu";

const RailContext = createContext(false);

/* ----------------------------------------------------------------------------- Sidebar */

export type SidebarProps = {
  collapsed?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  "aria-label": string;
  className?: string;
};

/** App sidebar shell. In the 56px rail every item shows only its icon and names itself in a tooltip. */
export function Sidebar({ collapsed = false, header, footer, children, "aria-label": ariaLabel, className }: SidebarProps) {
  return (
    <RailContext.Provider value={collapsed}>
      <aside
        data-collapsed={collapsed || undefined}
        className={cn(
          "flex shrink-0 flex-col border-r border-hair bg-[#0b0b0c] transition-[width] duration-200 ease-quirq",
          collapsed ? "w-14" : "w-64",
          className,
        )}
      >
        {header ? <div className={cn("shrink-0 p-2", collapsed && "px-1.5")}>{header}</div> : null}
        <nav aria-label={ariaLabel} className={cn("flex min-h-0 flex-1 flex-col gap-4 py-2", collapsed ? "overflow-visible px-1.5" : "scroll-thin overflow-y-auto px-2")}>
          {children}
        </nav>
        {footer ? <div className={cn("shrink-0 border-t border-hair-soft p-2", collapsed && "px-1.5")}>{footer}</div> : null}
      </aside>
    </RailContext.Provider>
  );
}

/** Right-side name tag for rail items. CSS only: shown on hover and keyboard focus, or always
    when the item carries data-tip (state samples). */
function RailTip({ children }: { children: ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 hidden -translate-y-1/2 whitespace-nowrap rounded-[6px] border border-hair-strong bg-s3 px-2 py-1 text-[11.5px] font-normal text-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)] group-hover/rail:block group-focus-visible/rail:block group-focus-within/rail:block group-data-[tip]/rail:block"
    >
      {children}
    </span>
  );
}

export function SidebarGroup({ label, children, action }: { label: string; children: ReactNode; action?: ReactNode }) {
  const rail = useContext(RailContext);
  return (
    <section aria-label={rail ? label : undefined} className="flex flex-col gap-0.5">
      {rail ? (
        <div aria-hidden="true" className="mx-2 mb-1 h-px bg-hair-soft" />
      ) : (
        <div className="flex h-7 items-center justify-between px-2">
          <h3 className="font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-ink-faint">{label}</h3>
          {action}
        </div>
      )}
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </section>
  );
}

/* ----------------------------------------------------------------------------- items */

const activeGradient = "bg-[linear-gradient(90deg,rgba(131,214,58,0.145),rgba(131,214,58,0.052)_64%,transparent)]";

const itemBase =
  "group/rail relative flex h-8 w-full min-w-0 items-center gap-2.5 rounded-[8px]! text-left text-[13px] transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-offset-[-2px]! [&_svg]:size-4 [&_svg]:shrink-0 " +
  "before:absolute before:left-1 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#83d63a] before:opacity-0 before:shadow-[0_0_12px_rgba(131,214,58,0.72)] before:transition-opacity";

function itemState(current: boolean, rail: boolean) {
  return cn(
    rail ? "justify-center px-0" : "px-2.5 pl-3",
    current
      ? cn(activeGradient, "font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_8px_18px_rgba(0,0,0,0.12)]", !rail && "before:opacity-100")
      : cn("text-ink/70 hover:text-ink", "hover:bg-[linear-gradient(90deg,rgba(131,214,58,0.09),rgba(131,214,58,0.03)_64%,transparent)]", !rail && "hover:before:opacity-70"),
  );
}

export type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  href: string;
  current?: boolean;
  onSelect?: () => void;
  /** Right side: a count or a status dot. Hidden in the rail. */
  trailing?: ReactNode;
  external?: boolean;
};

/** Navigation row. Current: lime bar on the left, a soft lime gradient and aria-current. */
export function SidebarItem({ icon, label, href, current = false, onSelect, trailing, external }: SidebarItemProps) {
  const rail = useContext(RailContext);
  return (
    <li className="relative">
      <a
        href={href}
        aria-current={current ? "page" : undefined}
        aria-label={rail ? label : undefined}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
        onClick={(e) => {
          if (!onSelect) return;
          e.preventDefault();
          onSelect();
        }}
        className={cn(itemBase, itemState(current, rail))}
      >
        <span aria-hidden="true" className={cn("inline-flex", current ? "text-ink" : "text-ink-dim")}>
          {icon}
        </span>
        {rail ? <RailTip>{label}</RailTip> : <span className="min-w-0 flex-1 truncate">{label}</span>}
        {!rail && external ? <span aria-hidden="true" className="text-[11px] text-ink-faint">↗</span> : null}
        {!rail && trailing ? <span className="shrink-0">{trailing}</span> : null}
      </a>
    </li>
  );
}

export type SidebarSpace = {
  id: string;
  name: string;
  /** Runtime logo or any glyph. */
  logo: ReactNode;
  status: DotStatus;
  /** Dot color when the lifecycle word has its own tone (Starting yellow, Stopping orange). */
  tone?: Tone;
  /** Status word for the dot and for blocked deletes: "Running", "Starting". */
  statusLabel: string;
  /** Creating, Starting and Stopping block deletes. */
  transitioning?: boolean;
};

export type SidebarSpaceItemProps = {
  space: SidebarSpace;
  current?: boolean;
  onOpen?: () => void;
  /** Owned spaces get the kebab; shared spaces do not. */
  owned?: boolean;
  onDelete?: (id: string) => void;
  /** Visual flag for the catalog: open the kebab on first render. */
  defaultMenuOpen?: boolean;
  /** In the rail, keep the name tag showing (state samples). */
  showTip?: boolean;
};

/** Space row: runtime logo (dimmed until hover or current), name, status dot and a kebab. */
export function SidebarSpaceItem({ space, current = false, onOpen, owned = true, onDelete, defaultMenuOpen, showTip = false }: SidebarSpaceItemProps) {
  const rail = useContext(RailContext);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<"idle" | "checking" | "confirm" | "blocked">("idle");
  const copyTimer = useRef<number | null>(null);
  const checkTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      if (checkTimer.current) window.clearTimeout(checkTimer.current);
    },
    [],
  );

  const copy = async () => {
    const ok = await copyText(space.id);
    setCopied(ok);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  // Delete first checks the space state (the product asks the API), then confirms or refuses.
  const startDelete = () => {
    if (phase === "confirm") {
      onDelete?.(space.id);
      setPhase("idle");
      return;
    }
    setPhase("checking");
    checkTimer.current = window.setTimeout(() => setPhase(space.transitioning ? "blocked" : "confirm"), 700);
  };

  return (
    <li className="group/space relative">
      <a
        href={`#/spaces/${space.id}`}
        aria-current={current ? "page" : undefined}
        aria-label={rail ? `${space.name}, ${space.statusLabel}` : undefined}
        data-tip={(rail && showTip) || undefined}
        onClick={(e) => {
          e.preventDefault();
          onOpen?.();
        }}
        className={cn(itemBase, itemState(current, rail), !rail && owned && "pr-9")}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex w-5 shrink-0 justify-center transition-opacity",
            current ? "opacity-100" : "opacity-55 group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100",
          )}
        >
          {space.logo}
        </span>
        {rail ? (
          <RailTip>
            {space.name} · {space.statusLabel}
          </RailTip>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate">{space.name}</span>
            {copied ? (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-grn">
                <Check className="size-3!" aria-hidden="true" /> Copied
              </span>
            ) : (
              <StatusDot status={space.status} tone={space.tone} size="xs" pulse={space.transitioning} label={space.statusLabel} />
            )}
          </>
        )}
      </a>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Space ID copied" : ""}
      </span>
      {owned && !rail ? (
        <span className="absolute right-1 top-1">
          <DropdownMenu
            aria-label={`${space.name} actions`}
            side="bottom"
            align="end"
            width={236}
            defaultOpen={defaultMenuOpen}
            onOpenChange={(o) => {
              if (!o) setPhase("idle");
            }}
            trigger={(props, { open }) => (
              <button
                {...props}
                aria-label={`More actions for ${space.name}`}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-[6px]! text-ink-faint transition-[opacity,background-color,color] hover:bg-white/[0.08] hover:text-ink [&_svg]:size-4",
                  open || current ? "opacity-100" : "opacity-0 group-hover/space:opacity-100 group-focus-within/space:opacity-100 max-md:opacity-100",
                )}
              >
                <Ellipsis aria-hidden="true" />
              </button>
            )}
          >
            <MenuGroup label="Space actions">
              <MenuItem icon={<Copy />} hint={space.id} onSelect={copy}>
                Copy space ID
              </MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem
              icon={phase === "checking" ? <Spinner size="sm" label={null} /> : <Trash2 />}
              tone="danger"
              keepOpen={phase !== "confirm"}
              disabled={phase === "checking" || phase === "blocked"}
              description={
                phase === "checking"
                  ? "Checking…"
                  : phase === "confirm"
                    ? `Select again to delete ${space.name}. This cannot be undone.`
                    : phase === "blocked"
                      ? `Cannot delete while the space is ${space.statusLabel}. Wait until it finishes.`
                      : undefined
              }
              onSelect={startDelete}
            >
              {phase === "confirm" ? "Confirm delete" : "Delete space"}
            </MenuItem>
          </DropdownMenu>
        </span>
      ) : null}
    </li>
  );
}

/** "+ New space": hairline button with the lime icon well. Hidden by the caller when the plan does not allow it. */
export function SidebarCreateButton({ label = "New space", onClick }: { label?: string; onClick?: () => void }) {
  const rail = useContext(RailContext);
  return (
    <li className="mb-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={rail ? label : undefined}
        className={cn(
          "group/rail relative flex h-8 w-full items-center gap-2.5 rounded-[8px]! border border-hair bg-white/[0.04] text-[13px] font-medium text-ink/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-[background-color,border-color,color]",
          "hover:border-[rgba(131,214,58,0.2)] hover:bg-[linear-gradient(90deg,rgba(131,214,58,0.07),rgba(255,255,255,0.035)_68%,transparent)] hover:text-ink",
          rail ? "justify-center px-0" : "px-2",
        )}
      >
        <span
          aria-hidden="true"
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-bg text-[#83d63a]/85 shadow-[inset_0_0_0_1px_rgba(131,214,58,0.24)] transition-colors group-hover/rail:bg-[#83d63a]/12 group-hover/rail:text-[#83d63a] [&>svg]:size-3.5"
        >
          <Plus />
        </span>
        {rail ? <RailTip>{label}</RailTip> : label}
      </button>
    </li>
  );
}

/** Disabled placeholder row: "No spaces yet". The error tone adds an optional retry action. */
export function SidebarEmptyRow({
  children,
  tone = "empty",
  action,
}: {
  children: ReactNode;
  tone?: "empty" | "error";
  action?: { label: string; onClick: () => void };
}) {
  const rail = useContext(RailContext);
  if (rail) return null;
  return (
    <li
      aria-disabled={tone === "empty" ? "true" : undefined}
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex min-h-8 items-center justify-between gap-2 px-3 text-[12.5px]",
        tone === "error" ? "text-[#ff7a70]" : "italic text-ink-faint",
      )}
    >
      <span className="min-w-0">{children}</span>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 rounded-[6px]! px-1.5 py-0.5 text-[12px] font-medium not-italic text-ink underline decoration-hair-strong underline-offset-4 hover:decoration-ink"
        >
          {action.label}
        </button>
      ) : null}
    </li>
  );
}

/** Three shimmer rows with an icon square, matched to space rows. */
export function SidebarSkeleton({ rows = 3 }: { rows?: number }) {
  const rail = useContext(RailContext);
  return (
    <li aria-hidden="true" className="flex flex-col gap-0.5">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className={cn("flex h-8 items-center gap-2.5", rail ? "justify-center" : "px-3")}>
          <Skeleton width={16} height={16} radius={4} />
          {rail ? null : <Skeleton height={9} radius={4} style={{ width: `${[62, 48, 70][i % 3]}%` }} />}
        </span>
      ))}
    </li>
  );
}

/** Theme row that cycles Light, Dark and System; its tooltip says what comes next. */
export function SidebarThemeButton({ theme, onChange }: { theme: ThemeChoice; onChange: (t: ThemeChoice) => void }) {
  const rail = useContext(RailContext);
  const tip = `Switch to ${THEME_LABEL[nextTheme(theme)].toLowerCase()} mode`;
  return (
    <button
      type="button"
      onClick={() => onChange(nextTheme(theme))}
      aria-label={`Theme: ${THEME_LABEL[theme]}. ${tip}`}
      title={rail ? undefined : tip}
      className={cn(itemBase, itemState(false, rail))}
    >
      <span aria-hidden="true" className="inline-flex text-ink-dim">
        <ThemeIcon theme={theme} />
      </span>
      {rail ? <RailTip>{tip}</RailTip> : <span className="min-w-0 flex-1 truncate">{THEME_LABEL[theme]}</span>}
    </button>
  );
}

/* ----------------------------------------------------------------------------- scope switcher */

export type SidebarScope<T extends string = string> = { id: T; label: string; description: string; icon: ReactNode };

/** Scope tile at the top of the sidebar: Personal spaces or Org spaces. */
export function SidebarScopeSwitcher<T extends string>({
  scopes,
  value,
  onChange,
  defaultOpen,
}: {
  scopes: SidebarScope<T>[];
  value: T;
  onChange: (id: T) => void;
  defaultOpen?: boolean;
}) {
  const rail = useContext(RailContext);
  const active = scopes.find((s) => s.id === value) ?? scopes[0];
  return (
    <DropdownMenu
      aria-label="Spaces"
      block
      defaultOpen={defaultOpen}
      side={rail ? "right" : "bottom"}
      width={rail ? 240 : "100%"}
      trigger={(props, { open }) => (
        <button
          {...props}
          aria-label={`${active.label}: switch scope`}
          className={cn(
            "group/rail relative flex h-12 w-full min-w-0 items-center gap-2.5 rounded-[10px]! text-left transition-colors hover:bg-white/[0.05]",
            rail ? "justify-center" : "px-2",
            open && "bg-white/[0.07]",
          )}
        >
          <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#83d63a] text-[#10140d] [&_svg]:size-4">
            {active.icon}
          </span>
          {rail ? (
            <RailTip>{active.label}</RailTip>
          ) : (
            <>
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-[13px] font-semibold text-ink">{active.label}</span>
                <span className="truncate text-[11.5px] text-ink-faint">{active.description}</span>
              </span>
              <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
            </>
          )}
        </button>
      )}
    >
      <MenuGroup label="Spaces">
        {scopes.map((s) => (
          <MenuItem
            key={s.id}
            kind="radio"
            checked={s.id === value}
            icon={<span className="inline-flex size-6 items-center justify-center rounded-[6px] border border-hair [&_svg]:size-3.5!">{s.icon}</span>}
            description={s.description}
            onSelect={() => onChange(s.id)}
          >
            {s.label}
          </MenuItem>
        ))}
      </MenuGroup>
    </DropdownMenu>
  );
}

/* ----------------------------------------------------------------------------- SetupStepper */

export type SetupStep = {
  id: string;
  label: string;
  /** Numbered steps show their number; manage links show a chevron. */
  number?: number;
  /** Short state line under the label. */
  status?: { text: string; tone?: "good" | "pending" | "error" };
  /** Description for manage links (hidden in tiles). */
  description?: string;
};

export type SetupStepperProps = {
  groups: { title: string; steps: SetupStep[] }[];
  value: string;
  onChange: (id: string) => void;
  /** column: 220px sticky column; tiles: 3-up compact grid with descriptions hidden. */
  layout?: "column" | "tiles";
  "aria-label"?: string;
  className?: string;
};

const statusTone = { good: "text-ink-faint", pending: "text-org", error: "text-[#ff7a70]" } as const;

/** Setup navigation: numbered steps, then ongoing Manage sections. */
export function SetupStepper({ groups, value, onChange, layout = "column", "aria-label": ariaLabel = "Setup", className }: SetupStepperProps) {
  const tiles = layout === "tiles";
  return (
    <nav aria-label={ariaLabel} className={cn(tiles ? "grid grid-cols-3 gap-1.5" : "flex w-[220px] max-w-full flex-col gap-1", className)}>
      {groups.map((g, gi) => (
        <div key={g.title} role="group" aria-label={g.title} className={tiles ? "contents" : "flex flex-col gap-1"}>
          <p
            className={cn(
              "font-medium uppercase tracking-[0.06em] text-ink-faint",
              tiles ? "col-span-3 mx-0.5 mt-2 text-[10.5px] first:mt-0" : cn("mx-3 mb-[7px] text-[11px]", gi === 0 ? "mt-0" : "mt-[18px]"),
            )}
          >
            {g.title}
          </p>
          {g.steps.map((s) => {
            const on = s.id === value;
            return (
              <a
                key={s.id}
                href={`#/setup/${s.id}`}
                aria-current={on ? "step" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(s.id);
                }}
                className={cn(
                  "flex min-w-0 items-center rounded-[10px]! border text-left transition-colors focus-visible:outline-offset-[-2px]!",
                  tiles ? "flex-col justify-center gap-1.5 px-1.5 py-2.5 text-center" : "gap-3 p-3",
                  on
                    ? "border-[rgba(131,214,58,0.22)] bg-[rgba(131,214,58,0.07)] text-ink"
                    : tiles
                      ? "border-hair-soft bg-s1 text-ink-dim hover:border-hair hover:bg-s2"
                      : "border-transparent text-ink-dim hover:border-hair-soft hover:bg-s2",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full border text-[11px] font-medium tabular-nums",
                    tiles ? "size-5" : "size-[23px]",
                    on ? "border-[#83d63a] text-[#a6dd73]" : "border-hair text-ink-faint",
                  )}
                >
                  {s.number ?? "›"}
                </span>
                <span className="min-w-0">
                  <b className={cn("block font-medium", tiles ? "truncate text-[11px]" : "text-[13px]")}>{s.label}</b>
                  {!tiles && (s.status || s.description) ? (
                    <small className={cn("mt-[3px] block text-[12px] leading-[1.35]", s.status ? statusTone[s.status.tone ?? "good"] : "text-ink-faint")}>
                      {s.status ? s.status.text : s.description}
                    </small>
                  ) : null}
                </span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/* ----------------------------------------------------------------------------- SettingsNav */

export type SettingsSection = { id: string; label: string; icon: ReactNode; count?: number; tone?: "danger" };

/** Settings section nav: a vertical list, or a sideways strip on phones (layout "auto"). */
export function SettingsNav({
  sections,
  value,
  onChange,
  layout = "auto",
  "aria-label": ariaLabel = "Settings",
  className,
}: {
  sections: SettingsSection[];
  value: string;
  onChange: (id: string) => void;
  /** vertical: list; strip: one scrolling row; auto: strip under 640px, list above. */
  layout?: "vertical" | "strip" | "auto";
  "aria-label"?: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex min-w-0 gap-1",
        layout === "vertical" && "flex-col",
        layout === "strip" && "scroll-thin overflow-x-auto pb-1",
        layout === "auto" && "scroll-thin overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0",
        className,
      )}
    >
      {sections.map((s) => {
        const on = s.id === value;
        return (
          <a
            key={s.id}
            href={`#/settings/${s.id}`}
            aria-current={on ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onChange(s.id);
            }}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[8px]! px-2.5 text-[13px] transition-colors focus-visible:outline-offset-[-2px]! [&_svg]:size-4",
              on ? "bg-s3 font-medium text-ink" : "text-ink-dim hover:bg-s2 hover:text-ink",
              s.tone === "danger" && !on && "text-[#ff7a70] hover:text-[#ff958c]",
            )}
          >
            <span aria-hidden="true" className="inline-flex">{s.icon}</span>
            <span className="flex-1">{s.label}</span>
            {s.count !== undefined ? <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">{s.count}</span> : null}
          </a>
        );
      })}
    </nav>
  );
}
