// Alert banners and status strips: inline notices with a next action. AlertBanner (tinted
// box, icon, title, body, actions, optional dismiss), AnnouncementBar, DevBuildBanner,
// StatusLine (one-line space status strip), UsageReportingStatus, ProvingGroundsStrip and
// InlineAlert (galileo's red form line). Presentational and hook-free; callers own state.
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, OctagonX, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDot, type DotStatus } from "@/components/ui/status";
import { Spinner } from "@/components/ui/loaders";

/* ----------------------------------------------------------------------------- AlertBanner */

export type AlertTone = "error" | "warn" | "good" | "info" | "neutral" | "busy";

const ALERT_TONE: Record<AlertTone, { box: string; icon: string; title: string; glyph: LucideIcon | null }> = {
  error: { box: "border-red/40 bg-red/[0.06]", icon: "text-red", title: "text-[#ff8a80]", glyph: OctagonX },
  warn: { box: "border-org/35 bg-org/[0.07]", icon: "text-org", title: "text-[#ffc266]", glyph: TriangleAlert },
  good: { box: "border-grn/30 bg-grn/[0.06]", icon: "text-grn", title: "text-ink", glyph: CircleCheck },
  info: { box: "border-blu/30 bg-blu/[0.06]", icon: "text-blu", title: "text-ink", glyph: Info },
  neutral: { box: "border-hair bg-s2", icon: "text-ink-dim", title: "text-ink", glyph: CircleAlert },
  busy: { box: "border-hair bg-s2", icon: "text-ink-dim", title: "text-ink", glyph: null },
};

export type AlertBannerProps = {
  tone?: AlertTone;
  /** Replaces the tone glyph. Pass null for no icon. */
  icon?: ReactNode | null;
  title: ReactNode;
  children?: ReactNode;
  /** Buttons on the right; they wrap under the text on narrow screens. */
  actions?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** alert for failures that just happened, status for progress; omit for static notices. */
  role?: "alert" | "status";
  /** Single line: title and body run inline (setup status alerts). */
  inline?: boolean;
  className?: string;
};

/** Tinted inline notice: radius 10, 12 by 16 padding, icon, title, body and one next action. */
export function AlertBanner({ tone = "neutral", icon, title, children, actions, onDismiss, dismissLabel = "Dismiss", role, inline = false, className }: AlertBannerProps) {
  const t = ALERT_TONE[tone];
  const Glyph = t.glyph;
  const iconNode =
    icon === null ? null : icon !== undefined ? (
      icon
    ) : tone === "busy" ? (
      <Spinner size="md" label={null} />
    ) : Glyph ? (
      <Glyph aria-hidden="true" className={cn("size-4", t.icon)} />
    ) : null;
  return (
    <div
      role={role}
      data-tone={tone}
      className={cn("relative flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2.5 rounded-[10px] border px-4 py-3", t.box, onDismiss && "pr-11", className)}
    >
      {iconNode ? <span className={cn("mt-0.5 inline-flex shrink-0", t.icon)}>{iconNode}</span> : null}
      <div className={cn("min-w-0 flex-1 basis-[220px] text-[12.5px] leading-relaxed", inline && "flex flex-wrap items-baseline gap-x-2")}>
        <p className={cn("font-semibold", t.title)}>{title}</p>
        {children ? <div className={cn("text-ink-dim", !inline && "mt-0.5")}>{children}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 self-center">{actions}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="absolute right-2.5 top-2.5 inline-flex size-6 items-center justify-center rounded-[6px]! text-ink-faint transition-colors hover:bg-white/[0.08] hover:text-ink"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- AnnouncementBar */

/** Full-width announcement above the app header: one sentence, one link, dismiss. */
export function AnnouncementBar({ children, kicker = "New", action, onDismiss, className }: { children: ReactNode; kicker?: ReactNode; action?: ReactNode; onDismiss?: () => void; className?: string }) {
  return (
    <div className={cn("relative flex min-w-0 items-center justify-center gap-x-3 gap-y-1 border-b border-hair-soft bg-s2 px-10 py-2.5 text-[13px] font-medium text-ink", className)}>
      <span aria-hidden="true" className="spec-bar absolute inset-x-0 bottom-0 h-px opacity-50" />
      <p className="flex min-w-0 flex-wrap items-baseline justify-center gap-x-2 text-center">
        {kicker ? <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-grn">{kicker}</span> : null}
        <span className="text-ink-dim">{children}</span>
        {action}
      </p>
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={onDismiss}
          className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-[6px]! text-ink-faint transition-colors hover:bg-white/[0.08] hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- DevBuildBanner */

/** galileo sample app: light amber bar that marks a dev build. */
export function DevBuildBanner({ children = "Dev build: changes not yet live", className }: { children?: ReactNode; className?: string }) {
  return (
    <div role="note" className={cn("border-b border-[#f0d58a] bg-[#fff4d6] px-6 py-2 text-[14px] font-semibold text-[#7a5200]", className)}>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------- StatusLine */

/** One-line status strip: a state chip, facts set off with middle dots, trailing controls. */
export function StatusLine({ lead, items, trailing, className }: { lead?: ReactNode; items: ReactNode[]; trailing?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] border border-hair-soft bg-s2 px-3 py-2 text-[12px] text-ink-dim", className)}>
      {lead}
      <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            {i > 0 ? (
              <span aria-hidden="true" className="text-ink-faint">
                ·
              </span>
            ) : null}
            {it}
          </span>
        ))}
      </p>
      {trailing ? <div className="ml-auto flex flex-wrap items-center gap-2">{trailing}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- UsageReportingStatus */

export type UsageReportingState = "on" | "blocked" | "pending" | "off";

const REPORTING: Record<UsageReportingState, { word: string; status: DotStatus; pulse?: boolean }> = {
  on: { word: "on", status: "up" },
  blocked: { word: "blocked", status: "down" },
  pending: { word: "pending", status: "busy", pulse: true },
  off: { word: "off", status: "idle" },
};

/** Setup row that says what leaves the machine: dot, state, plain explanation, link. */
export function UsageReportingStatus({ state, children, link, className }: { state: UsageReportingState; children: ReactNode; link?: ReactNode; className?: string }) {
  const r = REPORTING[state];
  return (
    <div className={cn("grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 rounded-[10px] border border-hair px-[18px] py-4", className)}>
      <span className="mt-[7px]">
        <StatusDot status={r.status} pulse={r.pulse} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">Usage reporting: {r.word}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-dim">{children}</p>
        {link ? <div className="mt-1.5 text-[12px]">{link}</div> : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- ProvingGroundsStrip */

/** Landing strip for live external trials: dashed orange border, pulsing pill, partner list. */
export function ProvingGroundsStrip({
  title,
  body,
  partners,
  className,
}: {
  title: ReactNode;
  body: ReactNode;
  /** Partner lockups keep quirq lowercase with a × sign. */
  partners: { pair: string; what: string }[];
  className?: string;
}) {
  return (
    <section className={cn("grid items-start gap-6 rounded-[16px] border border-dashed border-org/30 px-[clamp(18px,3.5vw,34px)] py-[26px] md:grid-cols-[.9fr_1.1fr] md:gap-10", className)}>
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-org/35 px-[13px] py-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-org">
          <span aria-hidden="true" className="size-[7px] animate-pulse rounded-full bg-org" />
          Proving Grounds
        </p>
        <h4 className="mb-1.5 mt-3 text-[19px] font-semibold tracking-[-0.015em] text-ink">{title}</h4>
        <p className="text-[13px] leading-[1.6] text-ink-dim">{body}</p>
      </div>
      <ul className="min-w-0 space-y-[9px] border-l border-org/25 pl-5 md:mt-1">
        {partners.map(({ pair, what }) => (
          <li key={pair} className="font-mono text-[10px] leading-[1.7] tracking-[0.12em] text-org">
            {pair}:<span className="ml-1.5 font-sans text-[12.5px] tracking-normal text-ink-dim">{what}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ----------------------------------------------------------------------------- InlineAlert */

/** galileo form error: one red 13px line under the form, cleared on the next valid submit. */
export function InlineAlert({ children, id, live = true, className }: { children: ReactNode; id?: string; /** Announce as an alert (false for static examples). */ live?: boolean; className?: string }) {
  return (
    <p id={id} role={live ? "alert" : undefined} className={cn("m-0 basis-full text-[13px] text-[#ff7a70]", className)}>
      {children}
    </p>
  );
}
