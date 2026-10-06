"use client";

// ConfirmDialog: ConfirmPanel in a real alertdialog layer. Cancel is focused first,
// the backdrop does not dismiss, Escape cancels unless a check is running, and focus goes
// back to the button that asked.
import { useId } from "react";
import { Overlay } from "./overlay-core";
import { ConfirmPanel, type ConfirmPanelProps } from "./confirm";

export type ConfirmDialogProps = Omit<ConfirmPanelProps, "titleId" | "descriptionId" | "titleAs" | "onCancel"> & {
  open: boolean;
  onCancel: () => void;
};

/** Irreversible action confirm as a modal alertdialog. */
export function ConfirmDialog({ open, onCancel, state = "idle", ...panel }: ConfirmDialogProps) {
  const id = useId();
  return (
    <Overlay
      open={open}
      onClose={onCancel}
      role="alertdialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      closeOnEscape={state !== "checking"}
      className="w-[min(420px,100%)]"
    >
      <ConfirmPanel {...panel} className="w-full!" state={state} onCancel={onCancel} titleId={`${id}-title`} descriptionId={`${id}-desc`} />
    </Overlay>
  );
}
