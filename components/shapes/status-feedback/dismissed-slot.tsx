"use client";

// Demo helper: stands in for a dismissed specimen so it can be brought back. It takes focus
// when it appears, because the close button that was focused has just left the page.
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Caption } from "./parts";

export function DismissedSlot({
  label,
  action = "Show again",
  onRestore,
  variant = "card",
  className,
}: {
  label: string;
  action?: string;
  onRestore: () => void;
  /** card: dashed box where a card was; bar: a full-width row where a bar was. */
  variant?: "card" | "bar";
  className?: string;
}) {
  const slot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    slot.current?.querySelector("button")?.focus();
  }, []);
  return (
    <div
      ref={slot}
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-3",
        variant === "card" ? "rounded-[10px] border border-dashed border-hair px-3 py-2" : "border-b border-hair-soft px-4 py-2.5",
        className,
      )}
    >
      <Caption>{label}</Caption>
      <Button size="sm" variant="subtle" onClick={onRestore}>
        {action}
      </Button>
    </div>
  );
}
