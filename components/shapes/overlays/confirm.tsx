// Destructive confirms: ConfirmPanel (alert dialog surface with checking and blocked
// states), InlineConfirm (row and pill forms), DangerZone (bordered red panel with action
// rows), TypeToConfirm (type the name to enable delete) and RemovalPanel (project removal
// with an access review). Hook-free and controlled; ConfirmDialog in confirm-dialog.tsx
// puts ConfirmPanel in a real alertdialog layer.
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Trash2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { LoadingLine } from "@/components/ui/loaders";
import { ModalNotice } from "./modal-panel";

/* ----------------------------------------------------------------------------- ConfirmPanel */

export type ConfirmState = "idle" | "checking" | "blocked";

export type ConfirmPanelProps = {
  /** "Delete space" */
  title: ReactNode;
  /** "Delete ops-copilot? This cannot be undone." */
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Shown on the confirm button while checking: "Checking…". */
  checkingLabel?: string;
  state?: ConfirmState;
  /** Why the action cannot run now (blocked state). */
  blockedReason?: ReactNode;
  icon?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  titleId?: string;
  descriptionId?: string;
  titleAs?: "h2" | "h3";
  className?: string;
};

/** Alert dialog surface: danger question, Cancel and a red confirm. Cancel takes focus first. */
export function ConfirmPanel({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  checkingLabel = "Checking…",
  state = "idle",
  blockedReason,
  icon = <Trash2 />,
  onConfirm,
  onCancel,
  titleId,
  descriptionId,
  titleAs: Title = "h2",
  className,
}: ConfirmPanelProps) {
  const checking = state === "checking";
  return (
    <div
      className={cn(
        "relative w-[min(420px,100%)] min-w-0 max-w-full rounded-[16px] border border-hair-strong bg-[#0f0f11] p-5 text-ink",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-red/30 bg-red/10 text-red [&_svg]:size-4"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <Title id={titleId} className="text-[15.5px] font-semibold leading-snug tracking-[-0.01em]">
            {title}
          </Title>
          <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-ink-dim">
            {description}
          </p>
        </div>
      </div>
      {state === "blocked" && blockedReason ? (
        <ModalNotice tone="warn" icon={<TriangleAlert />} className="mt-4">
          {blockedReason}
        </ModalNotice>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={checking} data-autofocus>
          {cancelLabel}
        </Button>
        <Button
          variant="danger"
          size="sm"
          leadingIcon={<Trash2 />}
          loading={checking}
          loadingLabel={checkingLabel}
          disabled={state === "blocked"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- InlineConfirm */

export type InlineConfirmProps = {
  /** "Revoke access for this user?" */
  question: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  busy?: boolean;
  /** row: sentence and app buttons; pill: compact mono uppercase pills. */
  variant?: "row" | "pill";
  /**
   * Focus Cancel when the confirm appears. Set it when a click swapped the action for this
   * confirm, so keyboard users keep their place; leave it off on first paint.
   */
  autoFocus?: boolean;
  className?: string;
};

/** Confirm in place of the action that asked, without a dialog. */
export function InlineConfirm({
  question,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
  variant = "row",
  autoFocus = false,
  className,
}: InlineConfirmProps) {
  if (variant === "pill") {
    return (
      <div role="group" aria-label="Confirm" className={cn("inline-flex flex-wrap items-center gap-2", className)}>
        {/* the question keeps its case: it often holds an id */}
        <span className="font-mono text-[11px] text-[#ff8a80]">{question}</span>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex h-6 items-center rounded-full! border border-red bg-red px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Working…" : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          autoFocus={autoFocus}
          data-autofocus
          className="inline-flex h-6 items-center rounded-full! border border-hair-strong px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-dim transition-colors hover:text-ink disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      </div>
    );
  }
  return (
    <div
      role="group"
      aria-label="Confirm"
      className={cn("flex min-w-0 flex-col items-start gap-2 sm:items-end", className)}
    >
      <span className="text-[12.5px] text-ink">{question}</span>
      <div className="flex flex-wrap gap-2">
        <Button variant="danger" size="sm" onClick={onConfirm} loading={busy} loadingLabel="Working…">
          {confirmLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy} autoFocus={autoFocus} data-autofocus>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- DangerZone */

/** Bordered red panel that holds irreversible actions. */
export function DangerZone({
  title = "Danger zone",
  titleAs: Title = "h3",
  children,
  className,
}: {
  title?: ReactNode;
  /** One level under the surrounding heading: h3 under a page or dialog title, h4 under an h3. */
  titleAs?: "h3" | "h4";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[12px] border border-red/35 bg-red/[0.035] p-4 sm:p-5", className)}>
      <Title className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#ff8a80]">{title}</Title>
      <div className="mt-3 flex flex-col divide-y divide-red/15">{children}</div>
    </section>
  );
}

/** One irreversible action: what it does and the button that does it. */
export function DangerZoneRow({ title, description, action }: { title: ReactNode; description: ReactNode; action: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1 basis-[220px]">
        <p className="text-[13px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-dim">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- TypeToConfirm */

export type TypeToConfirmProps = {
  /** The exact text to type, usually the project or space name. */
  name: string;
  value: string;
  onValueChange?: (value: string) => void;
  confirmLabel: string;
  busy?: boolean;
  busyLabel?: string;
  /** Blocked by something else (access review); the button stays off even when typed. */
  blocked?: boolean;
  onConfirm?: () => void;
  /** Secondary action beside the confirm ("Check access again"). */
  secondary?: ReactNode;
  id: string;
};

/** Typing the name enables the destructive button. */
export function TypeToConfirm({
  name,
  value,
  onValueChange,
  confirmLabel,
  busy = false,
  busyLabel = "Deleting…",
  blocked = false,
  onConfirm,
  secondary,
  id,
}: TypeToConfirmProps) {
  const matches = value === name;
  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (matches && !blocked && !busy) onConfirm?.();
      }}
    >
      <label htmlFor={id} className="text-[12.5px] text-ink-dim">
        Type <code className="rounded-[4px] bg-white/[0.06] px-1 py-0.5 font-mono text-[12px] text-ink">{name}</code> to confirm
      </label>
      <Input
        id={id}
        mono
        size="sm"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={busy}
        aria-describedby={`${id}-state`}
      />
      <span id={`${id}-state`} className="sr-only">
        {matches ? "Name matches." : "Name does not match yet."}
      </span>
      <div className="mt-1 flex flex-wrap gap-2">
        <Button type="submit" variant="danger" size="sm" leadingIcon={<Trash2 />} loading={busy} loadingLabel={busyLabel} disabled={!matches || blocked}>
          {confirmLabel}
        </Button>
        {secondary}
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------------------- RemovalPanel */

export type AccessMember = {
  id: string;
  name: string;
  /** Space or user id, shown in mono. */
  ref: string;
  role: string;
  self?: boolean;
  revoked?: boolean;
};

export type AccessReview =
  | { status: "checking" }
  | { status: "unverified"; message?: string }
  | { status: "checked"; members: AccessMember[]; blockers: string[] };

export type RemovalPanelProps = {
  title: ReactNode;
  /** The id being removed, shown in mono under the title. */
  subject: string;
  description: ReactNode;
  access: AccessReview;
  /** Action slot for one member row (Revoke access, or an InlineConfirm). */
  renderMemberAction?: (member: AccessMember) => ReactNode;
  /** Error from the last attempt. */
  error?: ReactNode;
  onCancel?: () => void;
  /** Usually a TypeToConfirm. */
  children?: ReactNode;
  titleId?: string;
  titleAs?: "h3" | "h4";
  className?: string;
};

/** Remove a project from this space after reviewing who still has access. */
export function RemovalPanel({
  title,
  subject,
  description,
  access,
  renderMemberAction,
  error,
  onCancel,
  children,
  titleId,
  titleAs: Title = "h3",
  className,
}: RemovalPanelProps) {
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex min-w-0 flex-col gap-4 rounded-[12px] border border-red/35 bg-red/[0.035] p-4 sm:p-5", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Title id={titleId} className="text-[14px] font-semibold text-ink">
            {title}
          </Title>
          <code className="font-mono text-[12px] text-ink-faint">{subject}</code>
        </div>
        {onCancel ? (
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </header>
      <p className="text-[12.5px] leading-relaxed text-ink-dim">{description}</p>

      <div aria-live="polite" className="flex flex-col gap-2">
        {access.status === "checking" ? (
          <LoadingLine>Checking project access…</LoadingLine>
        ) : access.status === "unverified" ? (
          <ModalNotice tone="error" icon={<CircleAlert />}>
            {access.message ?? "Access could not be verified. Try checking again."}
          </ModalNotice>
        ) : (
          <>
            {access.members.length > 0 ? (
              <>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Project access</p>
                <ul className="flex flex-col divide-y divide-hair-soft rounded-[10px] border border-hair-soft bg-black/30">
                  {access.members.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-ink">{m.name}</p>
                        <p className="text-[11.5px] text-ink-faint">
                          <code className="font-mono">{m.ref}</code> · {m.role}
                          {m.self ? " · You" : ""}
                          {m.revoked ? " · Revoked" : ""}
                        </p>
                      </div>
                      {renderMemberAction ? renderMemberAction(m) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {access.blockers.map((b) => (
              <ModalNotice key={b} tone="warn" icon={<TriangleAlert />}>
                {b}
              </ModalNotice>
            ))}
            {access.blockers.length === 0 ? (
              <p className="flex items-center gap-2 text-[12.5px] text-grn">
                <CircleCheck aria-hidden="true" className="size-4" />
                Access checked. This local project can be removed.
              </p>
            ) : null}
          </>
        )}
      </div>

      {error ? (
        <ModalNotice tone="error" icon={<CircleAlert />}>
          {error}
        </ModalNotice>
      ) : null}
      {children}
    </section>
  );
}
