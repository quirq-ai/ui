"use client";

// Switch: a button with role="switch" and aria-checked. Controlled (checked +
// onCheckedChange) or uncontrolled (defaultChecked). Optional label and description make it
// a settings row; busy shows a spinner in the thumb and blocks toggling. With a name it
// submits like a checkbox through a hidden input.
import { useId, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./loaders";

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "children" | "defaultChecked"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md";
  /** Visible label; becomes the accessible name. Without it pass aria-label. */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Label on the left with the switch pushed right (settings rows), or after the switch. */
  labelPosition?: "start" | "end";
  /** Saving: spinner in the thumb, toggling blocked. */
  busy?: boolean;
  /** Form field name; submits value (default "on") when checked. */
  name?: string;
  value?: string;
};

const track = {
  sm: "h-4 w-7 p-[2px]",
  md: "h-5 w-9 p-[2px]",
} as const;
const thumb = {
  sm: { size: "size-3", on: "translate-x-3" },
  md: { size: "size-4", on: "translate-x-4" },
} as const;

/** On or off setting with immediate effect. */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = "md",
  label,
  description,
  labelPosition = "start",
  busy = false,
  name,
  value = "on",
  disabled,
  id,
  className,
  ...rest
}: SwitchProps) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const auto = useId();
  const switchId = id ?? `sw-${auto}`;
  const labelId = `${switchId}-label`;
  const descId = `${switchId}-desc`;

  function toggle() {
    if (busy || disabled) return;
    const next = !on;
    if (checked === undefined) setInner(next);
    onCheckedChange?.(next);
  }

  const control = (
    <button
      type="button"
      role="switch"
      id={switchId}
      aria-checked={on}
      aria-busy={busy || undefined}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={description ? descId : undefined}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full! border transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-45",
        busy && "cursor-wait",
        track[size],
        on ? "border-grn bg-grn" : "border-hair-strong bg-s4 hover:border-white/30",
        !label && className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-grid place-items-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-transform duration-150 ease-quirq",
          thumb[size].size,
          on ? ["bg-white text-grn", thumb[size].on] : "translate-x-0 bg-ink-dim text-s4",
        )}
      >
        {busy ? <Spinner size={size === "sm" ? 8 : 10} label={null} /> : null}
      </span>
    </button>
  );

  const hidden = name && on ? <input type="hidden" name={name} value={value} /> : null;

  if (!label) {
    return (
      <>
        {control}
        {hidden}
      </>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        labelPosition === "start" ? "justify-between" : "flex-row-reverse justify-end",
        className,
      )}
    >
      <div className="min-w-0">
        <label id={labelId} htmlFor={switchId} className={cn("block text-[13px] leading-5 text-ink", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
          {label}
        </label>
        {description ? (
          <p id={descId} className="mt-0.5 text-[12px] leading-snug text-ink-dim">
            {description}
          </p>
        ) : null}
      </div>
      <span className="mt-0.5 inline-flex">{control}</span>
      {hidden}
    </div>
  );
}
