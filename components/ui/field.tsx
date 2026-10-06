// Forms: Field (label, hint, error, required; wires id, aria-describedby and aria-invalid
// into its single control), Fieldset (legend for a group of checkboxes or radios), Input,
// Textarea, Select (styled native select), SearchInput (glyph plus optional kbd hint that fades
// on focus), Checkbox and Radio (native inputs, optional card layout). Switch lives in
// ./switch (client) and is re-exported here. Everything else is server-safe.
// Inputs radius 10; radius classes carry "!" so the global focus rule cannot square them.
import {
  Children,
  cloneElement,
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, ChevronDown, CircleAlert, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "./kbd";

export { Switch, type SwitchProps } from "./switch";

/* ----------------------------------------------------------------------------- Field */

type ControlA11y = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
};

export type FieldProps = {
  /** Id for the control; the label, hint and error hang off it. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. When set the control is marked aria-invalid and the hint is replaced. */
  error?: ReactNode;
  required?: boolean;
  /** Mono uppercase label (brand kicker style, default) or sentence case sans. */
  labelStyle?: "mono" | "plain";
  /** Small content at the right end of the label row: a count, "Optional", a link. */
  aside?: ReactNode;
  /** A single control element (Input, Textarea, Select, SearchInput). */
  children: ReactNode;
  className?: string;
};

/** Label, control, then hint or error. Clones a11y wiring into its single child. */
export function Field({ id, label, hint, error, required = false, labelStyle = "mono", aside, children, className }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, error ? undefined : hintId].filter(Boolean).join(" ") || undefined;
  const only = Children.count(children) === 1 ? Children.toArray(children)[0] : null;
  let control: ReactNode = children;
  if (only && isValidElement(only)) {
    const el = only as ReactElement<ControlA11y>;
    // Merge, never clobber: keep the child's own describedby, required and invalid flags.
    const own = el.props;
    const wired: ControlA11y = { id };
    const ids = [own["aria-describedby"], describedBy].filter(Boolean).join(" ");
    if (ids) wired["aria-describedby"] = ids;
    if (error || own["aria-invalid"]) wired["aria-invalid"] = true;
    if (required || own.required) wired.required = true;
    control = cloneElement(el, wired);
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className={cn(
            labelStyle === "mono"
              ? "font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim"
              : "text-[12.5px] font-medium text-ink",
          )}
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-ink-faint">
              *
            </span>
          ) : null}
        </label>
        {aside ? <span className="shrink-0 text-[11.5px] text-ink-faint">{aside}</span> : null}
      </div>
      {control}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-[12px] leading-snug text-[#ff7a70]">
          <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12px] leading-snug text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type FieldsetProps = {
  legend: ReactNode;
  hint?: ReactNode;
  /** Stack choices vertically (default) or in a wrapping row. */
  direction?: "column" | "row";
  children: ReactNode;
  className?: string;
};

/** Group of checkboxes or radios under one legend. Native radios in it get arrow-key moves. */
export function Fieldset({ legend, hint, direction = "column", children, className }: FieldsetProps) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">{legend}</legend>
      {hint ? <p className="-mt-1 mb-2.5 text-[12px] text-ink-faint">{hint}</p> : null}
      <div className={cn("flex gap-2", direction === "column" ? "flex-col" : "flex-row flex-wrap")}>{children}</div>
    </fieldset>
  );
}

/* ----------------------------------------------------------------------------- shared */

export type ControlSize = "sm" | "md" | "lg";

const controlBase =
  "w-full min-w-0 border border-hair bg-s1 text-ink placeholder:text-ink-faint " +
  "transition-[border-color,background-color] duration-150 hover:border-hair-strong focus:border-white/30 " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red/60";
/* text controls only: a select also matches :read-only, so this stays out of controlBase */
const readOnlyCls = "read-only:bg-transparent read-only:text-ink-dim";

/* radius is applied per control (fields 10, search pills full) so two never compete */
const fieldRadius = "rounded-[10px]!";

const controlHeight: Record<ControlSize, string> = { sm: "h-8", md: "h-9", lg: "h-10" };
const sansText: Record<ControlSize, string> = { sm: "text-[12.5px]", md: "text-[13px]", lg: "text-[14px]" };
const monoText: Record<ControlSize, string> = { sm: "font-mono text-[12px]", md: "font-mono text-[12.5px]", lg: "font-mono text-[13px]" };
/* left and right padding are separate maps so no two padding utilities ever compete */
const padL: Record<ControlSize, string> = { sm: "pl-2.5", md: "pl-3", lg: "pl-3.5" };
const padR: Record<ControlSize, string> = { sm: "pr-2.5", md: "pr-3", lg: "pr-3.5" };

/* ----------------------------------------------------------------------------- Input */

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: ControlSize;
  /** Mono for keys, commands, ports, paths and IDs. */
  mono?: boolean;
  /** Content inside the left edge: an icon or a unit prefix. */
  leading?: ReactNode;
  /** Content inside the right edge: a unit, a kbd hint, a small button. */
  trailing?: ReactNode;
};

/** Single-line text entry. className lands on the outer element. */
export function Input({ size = "md", mono = false, leading, trailing, className, ...rest }: InputProps) {
  const input = (
    <input
      className={cn(
        controlBase,
        fieldRadius,
        readOnlyCls,
        controlHeight[size],
        mono ? monoText[size] : sansText[size],
        leading ? "pl-9" : padL[size],
        trailing ? "pr-10" : padR[size],
        !leading && !trailing && className,
      )}
      {...rest}
    />
  );
  if (!leading && !trailing) return input;
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      {leading ? (
        <span className="pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 text-ink-faint [&_svg]:size-4" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      {input}
      {trailing ? <span className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center text-[12px] text-ink-faint">{trailing}</span> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Textarea */

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  mono?: boolean;
  /** Vertical resize handle (default) or fixed. */
  resize?: boolean;
};

/** Multi-line entry: notes, prompts, a pasted .env block. */
export function Textarea({ mono = false, resize = true, rows = 4, className, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        controlBase,
        fieldRadius,
        readOnlyCls,
        "min-h-[76px] px-3 py-2.5 leading-relaxed",
        mono ? monoText.md : sansText.md,
        resize ? "resize-y" : "resize-none",
        "scroll-thin",
        className,
      )}
      {...rest}
    />
  );
}

/* ----------------------------------------------------------------------------- Select */

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: ControlSize;
  mono?: boolean;
};

/** Styled native select: keeps the platform picker, keyboard and screen reader behavior. */
export function Select({ size = "md", mono = false, className, children, ...rest }: SelectProps) {
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <select
        className={cn(
          controlBase,
          fieldRadius,
          controlHeight[size],
          mono ? monoText[size] : sansText[size],
          padL[size],
          "cursor-pointer appearance-none pr-9",
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}

/* ----------------------------------------------------------------------------- SearchInput */

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  size?: ControlSize;
  /** Shortcut hint shown at the right ("/" or "⌘K"); fades while focused or filled. */
  kbd?: string;
  /** Pill (page filter, topbar) or field (inside forms and panels). */
  shape?: "pill" | "field";
};

/** Search or filter box with a leading glyph. Name it with a Field label or aria-label. */
export function SearchInput({ size = "md", kbd, shape = "pill", placeholder = "Search…", className, ...rest }: SearchInputProps) {
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          controlBase,
          controlHeight[size],
          sansText[size],
          "peer pl-9 [&::-webkit-search-cancel-button]:opacity-60",
          kbd ? "pr-11" : "pr-3",
          shape === "pill" ? "rounded-full!" : fieldRadius,
        )}
        {...rest}
      />
      {kbd ? (
        <Kbd
          subtle
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity duration-150 peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0"
        >
          {kbd}
        </Kbd>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- Checkbox and Radio */

type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  description?: ReactNode;
  /** Bordered card that brightens when checked (source pickers, radio cards). */
  card?: boolean;
  /** Content at the far right of a card row: a badge such as "offline" or "READ". */
  trailing?: ReactNode;
};

function choiceShell(card: boolean, disabled: boolean | undefined, className: string | undefined) {
  return cn(
    "group/choice relative flex items-start gap-2.5 text-[13px] text-ink",
    card
      ? "w-full rounded-[10px] border border-hair bg-s1 px-3 py-2.5 transition-colors hover:border-hair-strong has-checked:border-white/35 has-checked:bg-s2"
      : "w-fit",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    className,
  );
}

function ChoiceText({ label, description }: { label?: ReactNode; description?: ReactNode }) {
  if (!label && !description) return null;
  return (
    <span className="min-w-0 flex-1">
      {label ? <span className="block leading-5">{label}</span> : null}
      {description ? <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">{description}</span> : null}
    </span>
  );
}

export type CheckboxProps = ChoiceProps;

/** Native checkbox, 16px, ink fill with a black check when on. */
export function Checkbox({ label, description, card = false, trailing, className, disabled, ...rest }: CheckboxProps) {
  return (
    <label className={choiceShell(card, disabled, className)}>
      <span className="relative mt-0.5 inline-grid size-4 shrink-0 place-items-center">
        <input
          type="checkbox"
          disabled={disabled}
          className={cn(
            "peer size-4 cursor-[inherit] appearance-none rounded-[4px]! border border-hair-strong bg-s1 transition-colors",
            "checked:border-ink checked:bg-ink group-hover/choice:border-white/40 aria-[invalid=true]:border-red/70",
          )}
          {...rest}
        />
        <Check aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute size-3 text-black opacity-0 peer-checked:opacity-100" />
      </span>
      <ChoiceText label={label} description={description} />
      {trailing ? <span className="ml-auto shrink-0 self-center">{trailing}</span> : null}
    </label>
  );
}

export type RadioProps = ChoiceProps;

/** Native radio, 16px ring with a black center when chosen. Share a name to group them. */
export function Radio({ label, description, card = false, trailing, className, disabled, ...rest }: RadioProps) {
  return (
    <label className={choiceShell(card, disabled, className)}>
      <span className="relative mt-0.5 inline-grid size-4 shrink-0 place-items-center">
        <input
          type="radio"
          disabled={disabled}
          className={cn(
            "peer size-4 cursor-[inherit] appearance-none rounded-full! border border-hair-strong bg-s1 transition-colors",
            "checked:border-ink checked:bg-ink group-hover/choice:border-white/40",
          )}
          {...rest}
        />
        <span aria-hidden="true" className="pointer-events-none absolute size-1.5 rounded-full bg-black opacity-0 peer-checked:opacity-100" />
      </span>
      <ChoiceText label={label} description={description} />
      {trailing ? <span className="ml-auto shrink-0 self-center">{trailing}</span> : null}
    </label>
  );
}
