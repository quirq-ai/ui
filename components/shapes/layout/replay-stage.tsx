"use client";

// ReplayStage: plays a staggered Reveal over its items on mount and on demand. Used by the
// demos to show the "revealed" state without waiting for a scroll.
import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { Reveal } from "./reveal";

export type ReplayStageProps = {
  items: ReactNode[];
  /** Seconds between siblings (.06 to .08 on the landing). */
  stagger?: number;
  /** Start delay for the first item. */
  offset?: number;
  /** Keep everything visible with no motion (simulated reduced motion). */
  instant?: boolean;
  /** Label for the replay button. */
  replayLabel?: string;
  /** Class for the wrapper that holds the items (grids, stacks). */
  className?: string;
  itemClassName?: string;
  /** Put the button above the items instead of below. */
  buttonPosition?: "top" | "bottom" | "none";
  /** Controlled replay counter; omit to let the button own it. */
  run?: number;
};

export function ReplayStage({
  items,
  stagger = 0.08,
  offset = 0,
  instant = false,
  replayLabel = "Replay reveal",
  className,
  itemClassName,
  buttonPosition = "bottom",
  run,
}: ReplayStageProps) {
  const [inner, setInner] = useState(0);
  const n = run ?? inner;
  const button =
    buttonPosition === "none" ? null : (
      <Button size="sm" variant="secondary" leadingIcon={<RotateCcw />} onClick={() => setInner((v) => v + 1)} disabled={instant}>
        {replayLabel}
      </Button>
    );
  return (
    <div className="flex flex-col gap-4">
      {buttonPosition === "top" ? <div>{button}</div> : null}
      <div className={className}>
        {items.map((item, i) => (
          <Reveal key={`${n}-${i}`} trigger="mount" delay={offset + i * stagger} instant={instant} className={cn("min-w-0", itemClassName)}>
            {item}
          </Reveal>
        ))}
      </div>
      {buttonPosition === "bottom" ? <div>{button}</div> : null}
    </div>
  );
}
