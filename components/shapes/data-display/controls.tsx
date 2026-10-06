// Small shared controls for data-display tool rows: ToggleButton (a labelled aria-pressed
// toggle such as Wrap or Follow). No hooks; the caller owns the state.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToggleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  pressed: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

/** Compact mono toggle for viewer toolbars: Wrap, Follow, Pause. */
export function ToggleButton({ pressed, icon, children, className, type = "button", ...rest }: ToggleButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[8px]! border px-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] transition-[background-color,border-color,color] duration-150 [&_svg]:size-3.5",
        pressed ? "border-hair-strong bg-s3 text-ink" : "border-hair bg-transparent text-ink-dim hover:border-hair-strong hover:text-ink",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
