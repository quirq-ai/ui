"use client";

// Modal: ModalPanel inside the Overlay layer. Escape and the close button call onClose,
// focus returns to the opener, and a busy dialog can hide its close and ignore Escape.
import { useId } from "react";
import { Overlay } from "./overlay-core";
import { MODAL_WIDTHS, ModalPanel, type ModalPanelProps } from "./modal-panel";

export type ModalProps = Omit<ModalPanelProps, "titleId" | "descriptionId" | "onClose" | "titleAs"> & {
  open: boolean;
  onClose: () => void;
  /** Escape and backdrop clicks close (default). Off while busy. */
  dismissible?: boolean;
  initialFocus?: string;
};

/** Focused task dialog: connect, settings, atlas, tours, manual. */
export function Modal({ open, onClose, dismissible = true, initialFocus, hideClose, description, ...panel }: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = description ? `${id}-desc` : undefined;
  return (
    <Overlay
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      closeOnEscape={dismissible}
      closeOnBackdrop={dismissible}
      initialFocus={initialFocus}
      className={MODAL_WIDTHS[panel.size ?? "md"]}
    >
      <ModalPanel
        {...panel}
        className={panel.className ? `${panel.className} w-full!` : "w-full!"}
        description={description}
        titleId={titleId}
        descriptionId={descriptionId}
        onClose={onClose}
        hideClose={hideClose ?? !dismissible}
      />
    </Overlay>
  );
}
