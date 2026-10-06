"use client";

// GlassAlertLayer puts a glass alert over a phone screen: a scrim that closes on tap,
// Escape, a Tab trap, focus kept inside when a step swaps its buttons, and focus back to the
// row that opened it. It is contained (absolute inside its phone frame), not portalled.
// SecretAlert is the secret detail sheet with its masked, revealed and editing modes.
import { useId, useRef, useState, type ReactNode } from "react";
import { Copy, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyText } from "@/components/ui/copy-button";
import { trapTab, useFocusRescue, useFocusReturn } from "./overlay-core";
import { GlassAlert, GlassButton, GlassWell } from "./glass-alert";

export type GlassAlertLayerProps = {
  open: boolean;
  onClose: () => void;
  /** Id of the alert title. */
  labelledBy?: string;
  children: ReactNode;
  className?: string;
};

/** Contained scrim plus a centered sheet. Tap the scrim or press Escape to close. */
export function GlassAlertLayer({ open, onClose, labelledBy, children, className }: GlassAlertLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusReturn(ref, open);
  useFocusRescue(ref, open, true);
  if (!open) return null;
  return (
    <div
      className={cn("absolute inset-0 z-20 flex items-center justify-center p-3", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
          return;
        }
        trapTab(e, ref.current);
      }}
    >
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-black/45 transition-opacity duration-200 starting:opacity-0" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative flex w-full justify-center outline-none transition-[opacity,transform] duration-200 ease-quirq starting:scale-95 starting:opacity-0"
      >
        {children}
      </div>
    </div>
  );
}

export type SecretMode = "masked" | "revealed" | "editing";

export type SecretAlertProps = {
  name: string;
  /** "Environment variable" */
  kind?: string;
  /** Demo placeholder value; never a real secret. */
  value: string;
  initialMode?: SecretMode;
  titleId?: string;
  titleAs?: "h2" | "h3";
  onClose?: () => void;
  onSave?: (value: string) => void;
  onDelete?: () => void;
  /** Report a result outside the sheet ("Copied DATABASE_URL"). */
  onNotice?: (message: string) => void;
};

/** Secret detail: masked value with reveal, copy, edit and delete. */
export function SecretAlert({
  name,
  kind = "Environment variable",
  value,
  initialMode = "masked",
  titleId,
  titleAs,
  onClose,
  onSave,
  onDelete,
  onNotice,
}: SecretAlertProps) {
  const id = useId();
  const [mode, setMode] = useState<SecretMode>(initialMode);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  // Set by a user action only, so nothing takes focus on first paint.
  const [moved, setMoved] = useState(false);
  const editing = mode === "editing";

  const switchTo = (next: SecretMode) => {
    setMode(next);
    setMoved(true);
  };
  const cancelEdit = () => {
    setDraft(current);
    switchTo("masked");
  };

  return (
    <GlassAlert
      title={name}
      subtitle={kind}
      titleId={titleId}
      titleAs={titleAs}
      actions={
        editing ? (
          <>
            <GlassButton
              key="save"
              variant="primary"
              onClick={() => {
                setCurrent(draft);
                switchTo("revealed");
                onSave?.(draft);
                onNotice?.(`Saved ${name}`);
              }}
            >
              Save
            </GlassButton>
            <GlassButton key="cancel-edit" onClick={cancelEdit}>
              Cancel
            </GlassButton>
          </>
        ) : (
          <>
            <GlassButton
              key="copy"
              variant="primary"
              icon={<Copy />}
              autoFocusTarget
              autoFocus={moved}
              onClick={async () => {
                const ok = await copyText(current);
                onNotice?.(ok ? `Copied ${name}` : `Could not copy ${name}`);
              }}
            >
              Copy value
            </GlassButton>
            <GlassButton
              key="edit"
              icon={<Pencil />}
              onClick={() => {
                setDraft(current);
                switchTo("editing");
              }}
            >
              Edit value
            </GlassButton>
            <GlassButton key="delete" variant="destructive" icon={<Trash2 />} onClick={onDelete}>
              Delete
            </GlassButton>
            <GlassButton key="close" onClick={onClose}>
              Cancel
            </GlassButton>
          </>
        )
      }
    >
      <GlassWell className={cn(editing && "items-stretch rounded-[22px] py-3")}>
        {editing ? (
          <>
            <label htmlFor={`${id}-value`} className="sr-only">
              Value for {name}
            </label>
            <textarea
              id={`${id}-value`}
              data-autofocus
              autoFocus={moved}
              value={draft}
              rows={3}
              spellCheck={false}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancelEdit();
                }
              }}
              className="min-w-0 flex-1 resize-none rounded-[10px]! bg-transparent font-mono text-[15px] leading-5 tracking-[-0.23px] text-ink outline-none"
            />
          </>
        ) : (
          <>
            <span
              className={cn(
                "min-w-0 flex-1 break-all font-mono text-[16px] leading-5 tracking-[-0.3px]",
                mode === "revealed" ? "text-ink" : "text-ink-dim",
              )}
            >
              {mode === "revealed" ? current : "••••••••"}
            </span>
            <button
              type="button"
              aria-label={mode === "revealed" ? "Hide value" : "Reveal value"}
              aria-pressed={mode === "revealed"}
              onClick={() => setMode(mode === "revealed" ? "masked" : "revealed")}
              className="inline-grid size-8 shrink-0 place-items-center rounded-full! text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink [&_svg]:size-4"
            >
              {mode === "revealed" ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </>
        )}
      </GlassWell>
    </GlassAlert>
  );
}
