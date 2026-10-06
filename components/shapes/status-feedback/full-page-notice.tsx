// Full-page notices and results: cover a whole view for 404, waiting, no data or a checkout
// result. FullPageNotice (eyebrow, large title, explanation, command, actions), ResultCard
// (icon well, title, body, countdown line, actions) and PageFrame (a mock browser viewport
// for demos). Server-safe; the live countdown and auto-refresh are in full-page-notice-live.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CopyField } from "@/components/ui/copy-button";
import { toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- PageFrame */

/** Mock viewport with an address bar, so a full-page notice can sit inside a demo grid. */
export function PageFrame({
  url,
  status,
  children,
  light = false,
  className,
  bodyClassName,
}: {
  url: string;
  /** Right side of the address bar, such as a status dot or "502". */
  status?: ReactNode;
  children: ReactNode;
  /** Light page (galileo sample app). */
  light?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair bg-[#0a0a0b]", className)}>
      <div className="flex min-w-0 items-center gap-2 border-b border-hair-soft bg-s1 px-3 py-2">
        <span aria-hidden="true" className="flex shrink-0 gap-1">
          <span className="size-2 rounded-full bg-white/10" />
          <span className="size-2 rounded-full bg-white/10" />
          <span className="size-2 rounded-full bg-white/10" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full border border-hair-soft bg-black/40 px-3 py-1 font-mono text-[11px] text-ink-dim">{url}</span>
        {status ? <span className="shrink-0 font-mono text-[10.5px] text-ink-faint">{status}</span> : null}
      </div>
      {/* the page fills the viewport so a notice can center in it */}
      <div className={cn("relative flex min-h-[300px] flex-1 flex-col *:flex-1", light ? "bg-[#fbfaf7] text-[#1c1c1a]" : "bg-[#070708]", bodyClassName)}>{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- FullPageNotice */

export type FullPageNoticeProps = {
  /** Mono uppercase line above the title ("NO DATA SOURCE", "502"). */
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  /** Shell command to run, shown in a copy field with a $ prompt. */
  command?: string;
  commandLabel?: string;
  actions?: ReactNode;
  /** Status line under the actions (auto-refresh, attempt count). */
  footer?: ReactNode;
  /** start: left-padded editorial (space dashboard); center: centered (galileo). */
  align?: "start" | "center";
  size?: "md" | "lg";
  /** Accent for the eyebrow. */
  tone?: Tone;
  headingLevel?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

/** A view-sized notice that says what is missing and the one thing to do next. */
export function FullPageNotice({
  eyebrow,
  title,
  children,
  command,
  commandLabel = "Command",
  actions,
  footer,
  align = "start",
  size = "md",
  tone = "neutral",
  headingLevel: H = "h3",
  className,
}: FullPageNoticeProps) {
  const center = align === "center";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center gap-3",
        center ? "items-center px-6 py-10 text-center" : "items-start py-10 pl-[clamp(20px,6vw,56px)] pr-6",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.2em]", tone === "neutral" ? "text-ink-faint" : toneText[tone])}>{eyebrow}</p>
      ) : null}
      <H
        className={cn(
          "max-w-[18ch] text-balance font-medium leading-[1.05] tracking-[-0.025em] text-ink",
          size === "lg" ? "text-[clamp(28px,4.4vw,44px)]" : "text-[clamp(22px,3vw,30px)]",
        )}
      >
        {title}
      </H>
      {children ? <div className="max-w-[54ch] text-[13px] leading-relaxed text-ink-dim [&_a]:text-ink [&_a]:underline-offset-4 hover:[&_a]:underline">{children}</div> : null}
      {command ? <CopyField value={command} prompt="$" label={commandLabel} announce="Command copied" className="w-full max-w-[440px]" /> : null}
      {actions ? <div className={cn("mt-1 flex flex-wrap items-center gap-2", center && "justify-center")}>{actions}</div> : null}
      {footer ? <div className="text-[11.5px] text-ink-faint">{footer}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- ResultCard */

export type ResultCardProps = {
  tone: "success" | "attention";
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  /** Countdown or redirect line ("Opening your spaces in 4s…"). */
  countdown?: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

/** Checkout result: icon well, sentence-case title (no exclamation marks), body, next step. */
export function ResultCard({ tone, icon, title, children, countdown, actions, headingLevel: H = "h3", className }: ResultCardProps) {
  const ok = tone === "success";
  return (
    <div className={cn("mx-auto flex w-full max-w-[400px] flex-col items-center rounded-[16px] border border-hair bg-s1 px-6 py-8 text-center", className)}>
      <span
        aria-hidden="true"
        className={cn("grid size-14 place-items-center rounded-full [&_svg]:size-6", ok ? "bg-grn/12 text-grn ring-1 ring-grn/25" : "bg-org/12 text-org ring-1 ring-org/25")}
      >
        {icon}
      </span>
      <H className="mt-4 text-[20px] font-semibold tracking-[-0.015em] text-ink">{title}</H>
      {children ? <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-ink-dim">{children}</p> : null}
      {countdown ? <div className="mt-4 text-[12px] text-ink-faint">{countdown}</div> : null}
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
