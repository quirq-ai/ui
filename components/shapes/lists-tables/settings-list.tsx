"use client";

// Inset grouped settings list (iOS style) in quirq tokens: GroupedList (uppercase caption,
// rounded group, inset separators, footer), GroupedRow (52px row with icon tile, title,
// value and accessory), KeyRow (a row that expands into a masked key field with Save),
// ProviderRow (connect a data source: connected, needs auth, error, loading; stacks under
// 520px of container width) and SetupChecklist (n of m complete, done or not configured rows).
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { Ban, Check, ChevronRight, CircleCheck, Circle, Eye, EyeOff, RotateCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";
import { Skeleton, Spinner } from "@/components/ui/loaders";

/* ----------------------------------------------------------------------------- GroupedList */

export type GroupedListProps = {
  /** Uppercase caption above the group ("OAuth subscriptions"). */
  caption?: ReactNode;
  /** Small note under the group. */
  footer?: ReactNode;
  /** Render n skeleton rows instead of children. */
  loadingRows?: number;
  children?: ReactNode;
  className?: string;
};

/** Rounded group of rows with inset hairlines between them. */
export function GroupedList({ caption, footer, loadingRows, children, className }: GroupedListProps) {
  const id = useId();
  return (
    <section aria-labelledby={caption ? id : undefined} className={cn("min-w-0", className)}>
      {caption ? (
        <h4 id={id} className="mb-1.5 px-4 text-[11.5px] font-medium uppercase tracking-[0.06em] text-ink-faint">
          {caption}
        </h4>
      ) : null}
      <ul
        aria-busy={loadingRows ? true : undefined}
        className="@container overflow-hidden rounded-[14px] border border-hair bg-s1 [&>li+li]:before:absolute [&>li+li]:before:left-[60px] [&>li+li]:before:right-0 [&>li+li]:before:top-0 [&>li+li]:before:h-px [&>li+li]:before:bg-hair-soft"
      >
        {loadingRows
          ? Array.from({ length: loadingRows }, (_, i) => (
              <li key={i} className="relative flex h-[52px] items-center gap-3 px-4" aria-hidden="true">
                <Skeleton width={30} height={30} radius={8} />
                <Skeleton width={`${34 + ((i * 17) % 30)}%`} height={11} radius={4} />
                <Skeleton width={64} height={11} radius={4} className="ml-auto" />
              </li>
            ))
          : children}
      </ul>
      {loadingRows ? (
        <p role="status" className="sr-only">
          Loading
        </p>
      ) : null}
      {footer ? <p className="mt-1.5 px-4 text-[12px] leading-snug text-ink-faint">{footer}</p> : null}
    </section>
  );
}

/** 30px tile for a row icon or logo. */
export function RowTile({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "org" | "blu" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-[30px] shrink-0 items-center justify-center rounded-[8px] border [&_svg]:size-4",
        tone === "org" ? "border-org/30 bg-org/15 text-org" : tone === "blu" ? "border-blu/30 bg-blu/15 text-blu" : "border-hair bg-s3 text-ink-dim",
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------- GroupedRow */

export type GroupedRowProps = {
  /** Ref to the row's li, for callers that manage focus. */
  ref?: Ref<HTMLLIElement>;
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right side value text ("Connected", "1/2"). */
  value?: ReactNode;
  valueTone?: "dim" | "faint" | "grn" | "red" | "blu";
  /** chevron for drill-in rows, check for chosen rows, or any node (a button, a pill). */
  accessory?: "chevron" | "check" | "none" | ReactNode;
  /** Row is a button. */
  onClick?: () => void;
  /** Row-level busy spinner (saving, connecting). */
  busy?: boolean;
  /** Red line under the title. */
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
};

const valueToneCls = { dim: "text-ink-dim", faint: "text-ink-faint", grn: "text-grn", red: "text-red", blu: "text-blu" } as const;

/** One 52px row. A row with onClick is a full-width button. */
export function GroupedRow({ ref, icon, title, subtitle, value, valueTone = "dim", accessory = "none", onClick, busy, error, disabled, className }: GroupedRowProps) {
  const acc =
    accessory === "chevron" ? (
      <ChevronRight aria-hidden="true" className="size-4 text-ink-faint/70 transition-transform group-hover/row:translate-x-0.5" />
    ) : accessory === "check" ? (
      <Check role="img" aria-label="Selected" className="size-4 text-grn" />
    ) : accessory === "none" ? null : (
      accessory
    );
  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15px] tracking-[-0.01em] text-ink">{title}</span>
        {subtitle ? <span className="block truncate text-[12.5px] text-ink-faint">{subtitle}</span> : null}
        {error ? <span className="block truncate text-[12px] text-red">{error}</span> : null}
      </span>
      {value !== undefined ? <span className={cn("shrink-0 text-[14px] tracking-[-0.01em]", valueToneCls[valueTone])}>{value}</span> : null}
      {busy ? <Spinner size="sm" label="Working" className="text-ink-dim" /> : null}
      {acc ? <span className="inline-flex shrink-0 items-center">{acc}</span> : null}
    </>
  );
  const rowCls = cn("group/row flex min-h-[52px] w-full items-center gap-3 px-4 py-2", className);
  return (
    <li ref={ref} className="relative">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || busy}
          className={cn(rowCls, "rounded-none! transition-colors hover:bg-white/[0.035] disabled:cursor-default disabled:hover:bg-transparent")}
        >
          {body}
        </button>
      ) : (
        <div className={cn(rowCls, disabled && "opacity-60")}>{body}</div>
      )}
    </li>
  );
}

/** Small uppercase pill used for "Not supported" and similar row notes. */
export function RowPill({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-s3 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-faint [&_svg]:size-3">
      {icon}
      {children}
    </span>
  );
}

/** Connect button that flips to a green check once connected; "Not supported" pill otherwise. */
export function ConnectAccessory({
  state,
  onConnect,
  name,
}: {
  state: "connected" | "available" | "connecting" | "unsupported";
  onConnect?: () => void;
  name: string;
}) {
  if (state === "unsupported") {
    return (
      <RowPill icon={<Ban aria-hidden="true" />}>
        Not supported
      </RowPill>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      {state === "connected" ? <CircleCheck role="img" aria-label={`${name} connected`} className="size-4 text-grn" /> : null}
      <Button size="sm" variant="secondary" loading={state === "connecting"} loadingLabel="Connecting…" onClick={onConnect} aria-label={`${state === "connected" ? "Reconnect" : "Connect"} ${name}`}>
        {state === "connected" ? "Reconnect" : "Connect"}
      </Button>
    </span>
  );
}

/* ----------------------------------------------------------------------------- KeyRow */

export type KeyRowProps = {
  icon?: ReactNode;
  label: string;
  connected: boolean;
  /** Masked placeholder of the saved value, such as sk-…f3a9. Never a real value. */
  masked?: string | null;
  placeholder?: string;
  /** Called with the typed value; resolve to finish saving. */
  onSave?: (value: string) => Promise<void> | void;
  defaultExpanded?: boolean;
};

/** API key row: tap expands into a masked field with Save and Cancel. Escape cancels. */
export function KeyRow({ icon, label, connected, masked, placeholder = "Paste an API key", onSave, defaultExpanded = false }: KeyRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  const rowRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Where focus goes after the next expand or collapse; null on first render. */
  const focusNext = useRef<"field" | "row" | null>(null);

  useEffect(() => {
    if (focusNext.current === "field") inputRef.current?.focus();
    if (focusNext.current === "row") rowRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    focusNext.current = null;
  }, [expanded]);

  function open() {
    focusNext.current = "field";
    setExpanded(true);
  }

  function close() {
    focusNext.current = "row";
    setExpanded(false);
    setError(null);
    setValue("");
    setShow(false);
  }

  async function save() {
    const v = value.trim();
    if (!v) {
      setError("Enter a key first.");
      return;
    }
    if (/\s/.test(v)) {
      setError("A key cannot contain spaces.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave?.(v);
    } catch {
      setSaving(false);
      setError("Could not save the key. Try again.");
      return;
    }
    setSaving(false);
    close();
  }

  if (!expanded) {
    return (
      <GroupedRow
        ref={rowRef}
        icon={icon}
        title={label}
        subtitle={connected && masked ? <span className="font-mono">{masked}</span> : undefined}
        value={connected ? "Connected" : "Not connected"}
        valueTone={connected ? "dim" : "faint"}
        accessory="chevron"
        onClick={open}
      />
    );
  }
  return (
    <li ref={rowRef} className="relative bg-white/[0.025] px-4 py-3">
      <div
        className="flex flex-col gap-3"
        onKeyDown={(e) => {
          if (e.key === "Escape" && !saving) {
            e.stopPropagation();
            close();
          }
        }}
      >
        <div className="flex items-center gap-3">
          {icon}
          <label htmlFor={fieldId} className="text-[15px] font-medium tracking-[-0.01em] text-ink">
            {label} API key
          </label>
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              id={fieldId}
              type={show ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={value}
              placeholder={placeholder}
              disabled={saving}
              aria-invalid={error ? true : undefined}
              aria-describedby={`${fieldId}-note`}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
              }}
              className="h-9 w-full rounded-[10px]! border border-hair bg-s1 pl-3 pr-10 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:border-white/30 aria-[invalid=true]:border-red/60"
            />
            <IconButton
              aria-label={show ? "Hide key" : "Show key"}
              size="xs"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              onClick={() => setShow((s) => !s)}
            >
              {show ? <EyeOff /> : <Eye />}
            </IconButton>
          </div>
          <Button size="md" variant="secondary" loading={saving} loadingLabel="Saving…" onClick={() => void save()}>
            Save
          </Button>
        </div>
        <p id={`${fieldId}-note`} role={error ? "alert" : undefined} className={cn("text-[12px]", error ? "text-red" : "text-ink-faint")}>
          {error ?? "Saved to this space only. The value is never shown again."}
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={close}
          className="w-fit rounded-[4px]! text-[14px] text-blu hover:underline hover:underline-offset-4 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </li>
  );
}

/* ----------------------------------------------------------------------------- ProviderRow */

export type ProviderState = "connected" | "needs_auth" | "error" | "loading";

export type ProviderRowProps = {
  icon: ReactNode;
  name: string;
  label: string;
  state: ProviderState;
  /** Account shown when connected. */
  account?: string | null;
  /** Error detail, truncated with a title. */
  detail?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRetry?: () => void;
  /** Wrap in a li (inside GroupedList) or a div. */
  as?: "li" | "div";
};

/** Provider you can connect: icon tile, name and label, then the action. Stacks under 520px of
    container width, where Connect goes full width. Needs an @container ancestor (GroupedList has one). */
export function ProviderRow({ icon, name, label, state, account, detail, onConnect, onDisconnect, onRetry, as: Tag = "li" }: ProviderRowProps) {
  return (
    <Tag className="relative flex min-w-0 flex-col gap-3 p-4 transition-colors hover:bg-white/[0.025] @min-[520px]:flex-row @min-[520px]:items-center @min-[520px]:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-hair bg-s3">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-ink">{name}</div>
          <div className="truncate text-[12px] text-ink-faint">{state === "connected" && account ? account : label}</div>
          {state === "error" && detail ? (
            <div title={detail} className="max-w-[340px] truncate text-[12px] text-red">
              {detail}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 @min-[520px]:justify-end">
        {state === "connected" ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-grn">
              <CircleCheck aria-hidden="true" className="size-4" />
              Connected
            </span>
            <Button size="sm" variant="subtle" onClick={onDisconnect} aria-label={`Disconnect ${name}`}>
              Disconnect
            </Button>
          </>
        ) : state === "error" ? (
          <>
            <span className="text-[12.5px] text-red">Could not connect</span>
            <IconButton aria-label={`Retry ${name}`} variant="outline" size="sm" tip onClick={onRetry}>
              <RotateCw />
            </IconButton>
          </>
        ) : (
          <Button size="sm" variant="secondary" block loading={state === "loading"} loadingLabel="Connecting…" onClick={onConnect} className="@min-[520px]:w-auto">
            Connect {name}
          </Button>
        )}
      </div>
    </Tag>
  );
}

/* ----------------------------------------------------------------------------- SetupChecklist */

export type ChecklistItem = {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  done: boolean;
};

export type SetupChecklistProps = {
  title?: string;
  description?: string;
  items: ChecklistItem[];
  /** Row press: open that setup section. */
  onOpen?: (item: ChecklistItem) => void;
  className?: string;
};

/** "Setup checklist 0 / 4": a row per section, done or not configured. */
export function SetupChecklist({
  title = "Setup checklist",
  description = "Configure each section to bring this space online.",
  items,
  onOpen,
  className,
}: SetupChecklistProps) {
  const done = items.filter((i) => i.done).length;
  return (
    <section className={cn("rounded-[14px] border border-hair bg-s1 p-4 sm:p-5", className)}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[14px] font-semibold text-ink">{title}</h4>
          <p className="mt-0.5 text-[12px] text-ink-faint">{description}</p>
        </div>
        <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink-dim">
          <span aria-hidden="true">
            {done} / {items.length}
          </span>
          <span className="sr-only">
            {done} of {items.length} complete
          </span>
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-hair-soft">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen?.(item)}
              className="group/row -mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-[8px]! px-2 py-3 text-left transition-colors hover:bg-white/[0.035]"
            >
              {item.done ? (
                <CircleCheck role="img" aria-label="Done" className="size-5 shrink-0 text-grn" />
              ) : (
                <Circle role="img" aria-label="Not configured" className="size-5 shrink-0 text-ink-faint" />
              )}
              <span aria-hidden="true" className="inline-flex shrink-0 text-ink-faint [&_svg]:size-4">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium leading-tight text-ink">{item.label}</span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-faint">{item.description}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-faint/70 transition-transform group-hover/row:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
