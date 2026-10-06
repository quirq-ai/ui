"use client";

// Drawer: DrawerPanel in a modal layer that slides in from the right. Escape, the close
// button or a backdrop click closes it, and focus goes back to the row that opened it.
import { useId } from "react";
import { Overlay } from "./overlay-core";
import { DrawerPanel, type DrawerPanelProps } from "./drawer";

export type DrawerProps = Omit<DrawerPanelProps, "titleId" | "onClose"> & {
  open: boolean;
  onClose: () => void;
};

/** Detail drawer for one item beside the current view. */
export function Drawer({ open, onClose, className, ...panel }: DrawerProps) {
  const id = useId();
  return (
    <Overlay open={open} onClose={onClose} placement="right" aria-labelledby={`${id}-title`}>
      <DrawerPanel {...panel} titleId={`${id}-title`} onClose={onClose} className={className ?? "w-full!"} />
    </Overlay>
  );
}
