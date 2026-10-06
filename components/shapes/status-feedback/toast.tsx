"use client";

// Toasts: brief feedback that never takes focus. Toast (typed card with icon, title,
// description, optional action), Toaster plus useToasts (stack, auto-dismiss that pauses on
// hover or focus, promise chains), PillToast plus usePillToast (the space dashboard's
// 1.9 s uppercase pill), HudPrompt, FloatingNotice and AmbientToast.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { toneText, type Tone } from "@/components/ui/tones";

/* ----------------------------------------------------------------------------- kinds */

export type ToastKind = "success" | "info" | "warning" | "error" | "loading";

export const TOAST_KIND: Record<ToastKind, { icon: LucideIcon; tone: Tone; label: string }> = {
  success: { icon: CircleCheck, tone: "grn", label: "Success" },
  info: { icon: Info, tone: "blu", label: "Info" },
  warning: { icon: TriangleAlert, tone: "org", label: "Warning" },
  error: { icon: OctagonX, tone: "red", label: "Error" },
  loading: { icon: LoaderCircle, tone: "neutral", label: "Working" },
};

/* keyframes for the auto-dismiss timer bar; React hoists and dedupes this style tag */
function TimerKeyframes() {
  return (
    <style href="sf-toast-timer" precedence="low">
      {"@keyframes sf-toast-timer{from{transform:scaleX(1)}to{transform:scaleX(0)}}"}
    </style>
  );
}

/* ----------------------------------------------------------------------------- Toast */

export type ToastAction = { label: string; onClick: () => void };

export type ToastProps = {
  kind: ToastKind;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** Shows the close button. */
  onDismiss?: () => void;
  /** Auto-dismiss time in ms; draws the timer bar. null or undefined: no bar. */
  duration?: number | null;
  /** Freezes the timer bar (hover or focus on the stack). */
  paused?: boolean;
  /** Static timer position for showcases, 0 to 1; overrides the animation. */
  timerAt?: number;
  /** Visual phase: entering slides up from 8px, leaving fades out. */
  phase?: "entering" | "visible" | "leaving";
  className?: string;
};

/** One toast card. Presentational: the Toaster owns timing and the live region. */
export function Toast({ kind, title, description, action, onDismiss, duration, paused = false, timerAt, phase = "visible", className }: ToastProps) {
  const k = TOAST_KIND[kind];
  const Icon = k.icon;
  const tint = k.tone === "neutral" ? "text-ink-dim" : toneText[k.tone];
  const showTimer = timerAt !== undefined || (duration !== null && duration !== undefined && kind !== "loading");
  return (
    <div
      data-kind={kind}
      className={cn(
        "relative grid w-full max-w-[360px] grid-cols-[16px_minmax(0,1fr)] items-start gap-x-2.5 overflow-hidden rounded-[12px] border border-hair-strong",
        "bg-[rgba(29,29,31,0.97)] py-3 pl-3.5 text-left shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-md",
        "transition-[opacity,transform] duration-200 ease-quirq",
        onDismiss ? "pr-10" : "pr-3.5",
        phase === "entering" && "translate-y-2 opacity-50",
        phase === "leaving" && "translate-y-1 opacity-0",
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-px size-4", tint, kind === "loading" && "spin")} />
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-snug text-ink">
          <span className="sr-only">{k.label}: </span>
          {title}
        </p>
        {description ? <p className="mt-0.5 text-[12px] leading-snug text-ink-dim">{description}</p> : null}
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 inline-flex h-6 items-center rounded-[6px]! border border-hair bg-white/[0.04] px-2 text-[11.5px] font-medium text-ink transition-colors hover:border-hair-strong hover:bg-white/[0.08]"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-[6px]! text-ink-faint transition-colors hover:bg-white/[0.08] hover:text-ink"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
      {showTimer ? (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.05]">
          {timerAt !== undefined ? (
            <span className={cn("block h-full origin-left bg-current opacity-70", tint)} style={{ transform: `scaleX(${timerAt})` }} />
          ) : (
            <>
              <TimerKeyframes />
              <span
                key={kind}
                className={cn("block h-full origin-left bg-current opacity-70", tint)}
                style={{ animation: `sf-toast-timer ${duration}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
              />
            </>
          )}
        </span>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- useToasts */

export type ToastInput = {
  kind: ToastKind;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** ms before auto-dismiss; null keeps it until dismissed. Defaults by kind. */
  duration?: number | null;
};

export type ToastItem = ToastInput & { id: number; leaving: boolean; duration: number | null };

const DEFAULT_DURATION: Record<ToastKind, number | null> = { success: 4000, info: 4000, warning: 6000, error: 8000, loading: null };

type Resolvable<T> = Omit<ToastInput, "kind"> | ((value: T) => Omit<ToastInput, "kind">);

/** Toast queue: push, update, dismiss, and promise chains (loading then success or error). */
export function useToasts(limit = 4) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const set = timers.current;
    return () => set.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      setToasts((xs) => xs.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      later(() => setToasts((xs) => xs.filter((t) => t.id !== id)), 220);
    },
    [later],
  );

  const push = useCallback(
    (input: ToastInput) => {
      const id = ++seq.current;
      const duration = input.duration === undefined ? DEFAULT_DURATION[input.kind] : input.duration;
      setToasts((xs) => [...xs, { ...input, id, duration, leaving: false }].slice(-limit));
      return id;
    },
    [limit],
  );

  const update = useCallback((id: number, patch: Partial<ToastInput>) => {
    setToasts((xs) =>
      xs.map((t) =>
        t.id === id
          ? { ...t, ...patch, duration: patch.duration !== undefined ? patch.duration : patch.kind ? DEFAULT_DURATION[patch.kind] : t.duration }
          : t,
      ),
    );
  }, []);

  const promise = useCallback(
    <T,>(p: Promise<T>, msgs: { loading: Omit<ToastInput, "kind">; success: Resolvable<T>; error: Resolvable<unknown> }) => {
      const id = push({ ...msgs.loading, kind: "loading", duration: null });
      p.then(
        (v) => update(id, { action: undefined, description: undefined, ...(typeof msgs.success === "function" ? msgs.success(v) : msgs.success), kind: "success" }),
        (e: unknown) => update(id, { action: undefined, description: undefined, ...(typeof msgs.error === "function" ? msgs.error(e) : msgs.error), kind: "error" }),
      );
      return id;
    },
    [push, update],
  );

  const clear = useCallback(() => setToasts([]), []);

  return { toasts, push, update, dismiss, promise, clear };
}

/* ----------------------------------------------------------------------------- Toaster */

function ToastEntry({ item, paused, onDismiss }: { item: ToastItem; paused: boolean; onDismiss: (id: number) => void }) {
  const remaining = useRef<number | null>(item.duration);
  const startedAt = useRef(0);
  const [entered, setEntered] = useState(false);

  // a new duration (loading turned into success) restarts the clock
  useEffect(() => {
    remaining.current = item.duration;
  }, [item.duration, item.kind]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (item.leaving || paused || remaining.current === null) return;
    startedAt.current = Date.now();
    const t = setTimeout(() => onDismiss(item.id), remaining.current);
    return () => {
      clearTimeout(t);
      if (remaining.current !== null) remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    };
  }, [paused, item.id, item.leaving, item.kind, item.duration, onDismiss]);

  return (
    <Toast
      kind={item.kind}
      title={item.title}
      description={item.description}
      action={item.action}
      duration={item.duration}
      paused={paused}
      phase={item.leaving ? "leaving" : entered ? "visible" : "entering"}
      onDismiss={() => onDismiss(item.id)}
    />
  );
}

export type ToasterProps = {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
  /** fixed: viewport corner (apps); contained: corner of the nearest positioned parent (demos). */
  position?: "fixed" | "contained";
  className?: string;
};

/**
 * The stack. One polite live region announces each new toast without moving focus. Hover or
 * focus inside pauses every timer; Escape while focus is in the stack dismisses the newest.
 * When the focused toast goes away, focus parks on the stack instead of falling to the page.
 */
export function Toaster({ toasts, onDismiss, position = "fixed", className }: ToasterProps) {
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLElement>(null);
  const close = useCallback(
    (id: number) => {
      const el = region.current;
      if (el && el.contains(document.activeElement)) el.focus();
      onDismiss(id);
    },
    [onDismiss],
  );
  return (
    <section
      ref={region}
      tabIndex={-1}
      aria-label="Notifications"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(e) => {
        const live = toasts.filter((t) => !t.leaving);
        if (e.key === "Escape" && live.length) {
          e.stopPropagation();
          close(live[live.length - 1].id);
        }
      }}
      className={cn(
        "pointer-events-none z-50 rounded-[12px]!",
        position === "fixed" ? "fixed bottom-4 right-4 left-4 sm:left-auto" : "absolute bottom-3 right-3 left-3 sm:left-auto",
        className,
      )}
    >
      <div role="status" aria-live="polite" aria-atomic="false" aria-relevant="additions text">
        <ol className="flex flex-col items-end gap-2">
          {toasts.map((t) => (
            <li key={t.id} className="pointer-events-auto flex w-full justify-end sm:w-[360px]">
              <ToastEntry item={t} paused={paused} onDismiss={close} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------- PillToast */

/** Space dashboard toast: one uppercase pill, bottom center, hides after 1.9 s. */
export function PillToast({ children, on = true, className }: { children: ReactNode; on?: boolean; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none max-w-full rounded-full border border-hair bg-s3 px-4 py-[7px] text-center text-[11px] uppercase leading-[1.3] tracking-[0.06em] text-ink-dim",
        "transition-[opacity,transform] duration-300 ease-quirq",
        on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Drives a PillToast: show(message) turns it on and hides it again after `ms`. */
export function usePillToast(ms = 1900) {
  const [state, setState] = useState<{ message: ReactNode; on: boolean }>({ message: "", on: false });
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (t.current) clearTimeout(t.current);
  }, []);
  const show = useCallback(
    (message: ReactNode) => {
      if (t.current) clearTimeout(t.current);
      setState({ message, on: true });
      t.current = setTimeout(() => setState((s) => ({ ...s, on: false })), ms);
    },
    [ms],
  );
  return { ...state, show };
}

/* ----------------------------------------------------------------------------- HUD prompt, notices */

/** Space Drift layer prompt: 10px mono on a dark wash, next to the reticle in the shot variant. */
export function HudPrompt({ children, variant = "default", className }: { children: ReactNode; variant?: "default" | "shot"; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "inline-flex max-w-[min(490px,70vw)] flex-wrap items-center gap-x-1.5 gap-y-1 rounded-[5px] bg-[rgba(8,11,24,0.6)] px-3 py-2 font-mono text-[10px] uppercase leading-[1.6] tracking-[0.08em] backdrop-blur-sm",
        variant === "shot" ? "border border-cyn/30 text-cyn" : "border border-hair-soft text-ink-dim",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Quiet notice that floats over a view until the person acts (Atlas: projects changed). */
export function FloatingNotice({ children, action, onDismiss, className }: { children: ReactNode; action?: ReactNode; onDismiss?: () => void; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex max-w-[420px] items-start gap-3 rounded-[10px] border border-hair bg-s2 px-3.5 py-2.5 text-[12px] leading-snug text-ink-dim shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {action}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss notice"
          onClick={onDismiss}
          className="-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-[5px]! text-ink-faint hover:bg-white/[0.08] hover:text-ink"
        >
          <X aria-hidden="true" className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

/** Ambient event toast from the visualizers: one plain sentence on a cool wash. */
export function AmbientToast({ children, on = true, className }: { children: ReactNode; on?: boolean; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "max-w-full rounded-[4px] border border-blu/30 bg-[rgba(18,24,44,0.96)] px-5 py-3 text-[11.5px] leading-snug text-ink",
        "transition-[opacity,transform] duration-300 ease-quirq",
        on ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
