// Message rows: ChatMessageRow (avatar plus the turn's parts; the person's side reverses to
// the right), TurnHeader (who answered, with model and time) and ChatNote (the muted line a
// thread shows when there is nothing to render yet). Server-safe.
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/loaders";

export type ChatMessageRowProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** start = agent (left), end = person (right). */
  align?: "start" | "end";
  /** A 32px Avatar. The agent's sits at the top of its turn, the person's at the bottom. */
  avatar?: ReactNode;
  /** Name, model and time line above the parts. */
  header?: ReactNode;
  /** Small line under the parts, such as a send time. */
  footer?: ReactNode;
  children: ReactNode;
};

/** One turn: avatar and parts in the order they happened. */
export function ChatMessageRow({ align = "start", avatar, header, footer, className, children, ...rest }: ChatMessageRowProps) {
  const end = align === "end";
  return (
    <div data-align={align} className={cn("flex w-full min-w-0 gap-2.5 sm:gap-3", end && "flex-row-reverse", className)} {...rest}>
      {avatar ? <div className={cn("flex shrink-0", end ? "self-end" : "self-start")}>{avatar}</div> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {header ? (
          <div
            className={cn(
              "flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11.5px] leading-5 text-ink-faint",
              end && "justify-end",
            )}
          >
            {header}
          </div>
        ) : null}
        {children}
        {footer ? (
          <div className={cn("font-mono text-[10.5px] tabular-nums text-ink-faint", end ? "self-end pr-1" : "pl-0.5")}>{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export type TurnHeaderProps = {
  name: ReactNode;
  /** Model label, such as "Claude Opus". */
  model?: ReactNode;
  time?: string;
  /** Extra chip after the time ("Live", "Mock"). */
  trailing?: ReactNode;
};

/** "Claude Code · Claude Opus · 09:25" above an agent turn. */
export function TurnHeader({ name, model, time, trailing }: TurnHeaderProps) {
  return (
    <>
      <span className="font-medium text-ink-dim">{name}</span>
      {model ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{model}</span>
        </>
      ) : null}
      {time ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[10.5px] tabular-nums">{time}</span>
        </>
      ) : null}
      {trailing}
    </>
  );
}

export type ChatNoteProps = {
  children: ReactNode;
  icon?: ReactNode;
  /** Spinner in place of the icon, announced politely. */
  busy?: boolean;
  className?: string;
};

/** Muted note in an empty or loading thread: "No messages in this session yet." */
export function ChatNote({ children, icon, busy = false, className }: ChatNoteProps) {
  return (
    <p
      role={busy ? "status" : undefined}
      className={cn("flex max-w-[52ch] items-start gap-2 text-[12.5px] leading-snug text-ink-faint [&_svg]:size-3.5", className)}
    >
      {busy ? <Spinner size="xs" label={null} className="mt-[3px]" /> : icon ? <span aria-hidden="true" className="mt-[2px] inline-flex shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </p>
  );
}
