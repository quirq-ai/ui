"use client";

// Scroll-reveal stand-ins for the catalog: RevealItem rises 24px over 1s on the quirq ease
// with a per-item stagger, and useReplay hides then reveals a group so the motion can be
// seen on demand. Reduced motion is honored by the global transition clamp.
import { useState, type CSSProperties, type ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLater } from "./_hooks";

/** Shown flag plus a replay() that hides the group and reveals it again. */
export function useReplay(initial = true) {
  const [shown, setShown] = useState(initial);
  const later = useLater();
  const replay = () => {
    setShown(false);
    later(() => setShown(true), 90);
  };
  return { shown, replay };
}

export type RevealItemProps = {
  shown: boolean;
  /** Position in the group; multiplies the stagger. */
  index?: number;
  /** Delay per item in ms (landing uses --d steps of 60 to 120 ms). */
  stagger?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** One revealable item: 24px rise and fade, staggered by index. */
export function RevealItem({ shown, index = 0, stagger = 70, children, className, style }: RevealItemProps) {
  return (
    <div
      className={cn(
        "min-w-0",
        shown
          ? "translate-y-0 opacity-100 transition-[opacity,transform] duration-1000 ease-quirq"
          : "translate-y-6 opacity-0 transition-none",
        className,
      )}
      style={{ ...style, transitionDelay: shown ? `${index * stagger}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/** Small "Replay reveal" control for demo headers. */
export function ReplayButton({ onClick, label = "Replay reveal" }: { onClick: () => void; label?: string }) {
  return (
    <Button size="sm" variant="secondary" leadingIcon={<RotateCw />} onClick={onClick}>
      {label}
    </Button>
  );
}
