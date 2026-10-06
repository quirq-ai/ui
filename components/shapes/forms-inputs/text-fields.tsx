"use client";

// Text fields: SecretInput (write-only key with inline Show or Hide), NumberStepper (joined
// minus, value, plus; clamps on blur), ReadOnlyEnvField (an environment value the space sets,
// with copy), CommandField (mono command textarea: Enter submits, Esc puts it back),
// InlineInput (a small field set inside a sentence), RichTextEditor (bold, italic and lists
// over a contenteditable box) and ReportBugForm (the rich text dialog body with its send
// states). All of them accept the id, aria-describedby, aria-invalid and required props that
// the shared Field wires in, so they drop into a Field like a plain Input.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Bold, Bug, CircleAlert, CircleCheck, Eye, EyeOff, Italic, List, ListOrdered, Lock, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { KeyCombo } from "@/components/ui/kbd";
import { FormStyles } from "./_styles";

/* A bordered shell that owns the focus ring for the controls inside it. */
const shellCls =
  "fi-ring flex w-full min-w-0 items-center rounded-[10px] border border-hair bg-s1 transition-[border-color,background-color] duration-150 hover:border-hair-strong";
const innerInput = "min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-faint focus-visible:outline-none! disabled:cursor-not-allowed";

/* ----------------------------------------------------------------------------- SecretInput */

export type SecretInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  /** Start with the value visible. */
  defaultRevealed?: boolean;
  /** Icon toggle (swarm) or a "Show" word (space dashboard). */
  revealStyle?: "icon" | "text";
  /** Adds a copy button for the current value (gateway token fields). */
  copyable?: boolean;
  /** What the value is, for the toggle's accessible name: "bot token". */
  noun?: string;
};

/** Write-only key or token with a reveal toggle. Placeholders only; never a real key. */
export function SecretInput({
  defaultRevealed = false,
  revealStyle = "icon",
  copyable = false,
  noun = "value",
  className,
  disabled,
  value,
  defaultValue,
  onChange,
  ...rest
}: SecretInputProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const current = value !== undefined ? String(value) : inner;
  const invalid = rest["aria-invalid"] === true || rest["aria-invalid"] === "true";

  return (
    <div className={cn(shellCls, "pr-1", invalid && "border-red/60 hover:border-red/70", disabled && "cursor-not-allowed opacity-50", className)}>
      <FormStyles />
      <input
        type={revealed ? "text" : "password"}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={current}
        onChange={(e) => {
          if (value === undefined) setInner(e.target.value);
          onChange?.(e);
        }}
        className={cn(innerInput, "h-9 pl-3 pr-1 font-mono text-[12.5px] tracking-[0.02em]")}
        {...rest}
      />
      <button
        type="button"
        disabled={disabled}
        aria-pressed={revealed}
        aria-label={revealStyle === "icon" ? (revealed ? `Hide ${noun}` : `Show ${noun}`) : undefined}
        onClick={() => setRevealed((r) => !r)}
        className={cn(
          "inline-flex h-7 shrink-0 items-center justify-center rounded-[7px]! text-ink-dim transition-colors hover:bg-s3 hover:text-ink focus-visible:outline-none! focus-visible:bg-s4 focus-visible:text-ink disabled:pointer-events-none",
          revealStyle === "icon" ? "w-7" : "px-2 text-[12px] font-medium",
        )}
      >
        {revealStyle === "icon" ? (
          revealed ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />
        ) : revealed ? (
          "Hide"
        ) : (
          "Show"
        )}
      </button>
      {copyable ? <CopyButton text={current} size="sm" aria-label={`Copy ${noun}`} announce={`${noun[0].toUpperCase()}${noun.slice(1)} copied`} /> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- NumberStepper */

export type NumberStepperProps = {
  id?: string;
  value?: number;
  defaultValue?: number;
  min: number;
  max: number;
  step?: number;
  /** Unit after the control: "GB", "runs". */
  unit?: ReactNode;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** Names the buttons: "volume size" gives "Decrease volume size". */
  noun?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  required?: boolean;
  /** Width of the number box in px. */
  inputWidth?: number;
  size?: "sm" | "md";
  className?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Joined minus, number, plus. Buttons disable at the bounds and typed values clamp on blur. */
export function NumberStepper({
  id,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  unit,
  onChange,
  disabled,
  noun = "value",
  inputWidth = 52,
  size = "md",
  className,
  ...a11y
}: NumberStepperProps) {
  const [inner, setInner] = useState(clamp(defaultValue ?? min, min, max));
  const current = value ?? inner;
  const [draft, setDraft] = useState<string | null>(null);

  function commit(next: number) {
    const v = clamp(Math.round(next / step) * step, min, max);
    if (value === undefined) setInner(v);
    setDraft(null);
    onChange?.(v);
  }

  const h = size === "sm" ? "h-8" : "h-9";
  const btn = cn(
    "inline-flex w-9 items-center justify-center text-ink-dim transition-colors hover:bg-s3 hover:text-ink",
    "focus-visible:outline-none! focus-visible:bg-s3 focus-visible:text-ink disabled:pointer-events-none disabled:opacity-35",
  );

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <FormStyles />
      <div
        className={cn(
          "fi-ring-any inline-flex items-stretch overflow-hidden rounded-[10px] border border-hair bg-s1",
          a11y["aria-invalid"] && "border-red/60",
          disabled && "opacity-50",
          h,
        )}
      >
        <button type="button" className={btn} disabled={disabled || current <= min} aria-label={`Decrease ${noun}`} onClick={() => commit(current - step)}>
          <Minus aria-hidden="true" className="size-3.5" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={draft ?? String(current)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft === null) return;
            const n = Number(draft);
            commit(Number.isFinite(n) && draft.trim() !== "" ? n : current);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const n = Number(draft ?? current);
              commit(Number.isFinite(n) ? n : current);
            }
          }}
          style={{ width: inputWidth }}
          className={cn(
            "fi-num border-x border-hair bg-transparent text-center font-mono text-[13px] tabular-nums text-ink focus-visible:outline-none! focus-visible:bg-s2",
          )}
          {...a11y}
        />
        <button type="button" className={btn} disabled={disabled || current >= max} aria-label={`Increase ${noun}`} onClick={() => commit(current + step)}>
          <Plus aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      {unit ? <span className="text-[12.5px] text-ink-dim">{unit}</span> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- ReadOnlyEnvField */

export type ReadOnlyEnvFieldProps = {
  /** Environment key, shown as the label: NEXT_PUBLIC_XO_SPACE_NAME. */
  name: string;
  value: string;
  /** Who sets it: "Set by the space". */
  source?: ReactNode;
  className?: string;
};

/** An environment value the space owns: visible, copyable, never editable here. */
export function ReadOnlyEnvField({ name, value, source = "Set by the space", className }: ReadOnlyEnvFieldProps) {
  const id = useId();
  return (
    <div className={cn("min-w-0 rounded-[10px] border border-hair-soft bg-black/40", className)}>
      <div className="flex items-center justify-between gap-3 px-3 pt-2.5">
        <label htmlFor={id} className="min-w-0 truncate font-mono text-[10.5px] tracking-[0.06em] text-ink-dim">
          {name}
        </label>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-ink-faint">
          <Lock aria-hidden="true" className="size-3" />
          {source}
        </span>
      </div>
      <div className="flex items-center gap-2 pb-1.5 pl-3 pr-1.5">
        <input
          id={id}
          readOnly
          value={value}
          className="h-8 min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-ink-dim focus-visible:outline-none!"
        />
        <CopyButton text={value} size="sm" aria-label={`Copy ${name}`} announce={`${name} copied`} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- CommandField */

export type CommandFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "defaultValue" | "value" | "onSubmit"> & {
  defaultValue: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  /** Show the key hints and last result under the field. */
  showHints?: boolean;
};

/** Mono command box. Enter submits, Shift+Enter adds a line, Esc restores the saved value. */
export function CommandField({ defaultValue, onSubmit, onCancel, showHints = true, className, rows = 2, ...rest }: CommandFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [saved, setSaved] = useState(defaultValue);
  const [last, setLast] = useState<"saved" | "restored" | null>(null);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const v = value.trim();
      if (!v) return;
      setSaved(v);
      setValue(v);
      setLast("saved");
      onSubmit?.(v);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue(saved);
      setLast("restored");
      onCancel?.();
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <textarea
        rows={rows}
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setLast(null);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "scroll-thin min-h-[64px] w-full resize-y rounded-[10px]! border border-hair bg-black/40 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-ink",
          "placeholder:text-ink-faint transition-colors hover:border-hair-strong focus:border-white/30 aria-[invalid=true]:border-red/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...rest}
      />
      {showHints ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <KeyCombo keys={["enter"]} size="xs" subtle>
              saves
            </KeyCombo>
            <KeyCombo keys={["esc"]} size="xs" subtle>
              puts it back
            </KeyCombo>
          </div>
          <span role="status" className={cn("font-mono text-[10.5px] uppercase tracking-[0.12em]", last === "saved" ? "text-grn" : "text-ink-faint")}>
            {last === "saved" ? "Saved" : last === "restored" ? "Restored" : value !== saved ? "Unsaved" : ""}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------- InlineInput */

export type InlineInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Width in ch, so the box fits its value. */
  widthCh?: number;
  "aria-label": string;
};

/** A compact field that sits inside a sentence: "Check every [1] seconds". */
export function InlineInput({ widthCh = 6, className, style, ...rest }: InlineInputProps) {
  return (
    <>
      <FormStyles />
      <input
      className={cn(
        "mx-1 inline-block h-7 rounded-[7px]! border border-hair bg-s1 px-2 text-center align-baseline font-mono text-[12.5px] tabular-nums text-ink",
        "transition-colors hover:border-hair-strong focus:border-white/30 aria-[invalid=true]:border-red/60 disabled:opacity-50",
        "fi-num fi-time",
        className,
      )}
        style={{ width: `calc(${widthCh}ch + 24px)`, ...style }}
        {...rest}
      />
    </>
  );
}

/* ----------------------------------------------------------------------------- RichTextEditor */

type Format = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList";

const TOOLS: { cmd: Format; label: string; icon: ReactNode; keys?: string }[] = [
  { cmd: "bold", label: "Bold", icon: <Bold aria-hidden="true" className="size-3.5" />, keys: "⌘B" },
  { cmd: "italic", label: "Italic", icon: <Italic aria-hidden="true" className="size-3.5" />, keys: "⌘I" },
  { cmd: "insertUnorderedList", label: "Bulleted list", icon: <List aria-hidden="true" className="size-3.5" /> },
  { cmd: "insertOrderedList", label: "Numbered list", icon: <ListOrdered aria-hidden="true" className="size-3.5" /> },
];

export type RichTextEditorProps = {
  id?: string;
  /** Id of the visible label. */
  labelledBy?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  /** Starting markup; trusted fixture HTML only. */
  defaultHtml?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Plain text after every edit, for "empty disables Submit". */
  onTextChange?: (text: string) => void;
  minHeight?: number;
  className?: string;
};

/** Small rich text box: a formatting toolbar (arrow keys move along it) over an editable area. */
export function RichTextEditor({
  id,
  labelledBy,
  defaultHtml = "",
  placeholder = "Write here…",
  disabled = false,
  onTextChange,
  minHeight = 112,
  className,
  ...a11y
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const toolRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<Record<Format, boolean>>({
    bold: false,
    italic: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });
  const [empty, setEmpty] = useState(defaultHtml.trim() === "");
  const [tab, setTab] = useState(0);
  // The markup is applied once; React must not touch the editable children after that.
  const [initial] = useState(() => ({ __html: defaultHtml }));

  useEffect(() => {
    function onSelection() {
      const el = ref.current;
      const sel = document.getSelection();
      if (!el || !sel || !sel.anchorNode || !el.contains(sel.anchorNode)) return;
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });
    }
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);

  function sync() {
    const text = ref.current?.innerText.trim() ?? "";
    setEmpty(text === "");
    onTextChange?.(text);
  }

  function run(cmd: Format) {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand(cmd);
    setActive((a) => ({ ...a, [cmd]: document.queryCommandState(cmd) }));
    sync();
  }

  function onToolKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % TOOLS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TOOLS.length) % TOOLS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TOOLS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(next);
    toolRefs.current[next]?.focus();
  }

  return (
    <div
      className={cn(
        "fi-ring min-w-0 overflow-hidden rounded-[10px] border border-hair bg-s1 transition-colors hover:border-hair-strong",
        a11y["aria-invalid"] && "border-red/60",
        disabled && "opacity-50",
        className,
      )}
    >
      <FormStyles />
      <div role="toolbar" aria-label="Formatting" aria-controls={id} className="flex items-center gap-0.5 border-b border-hair-soft px-1.5 py-1">
        {TOOLS.map((t, i) => (
          <button
            key={t.cmd}
            ref={(el) => {
              toolRefs.current[i] = el;
            }}
            type="button"
            tabIndex={i === tab ? 0 : -1}
            aria-pressed={active[t.cmd]}
            aria-label={t.keys ? `${t.label} (${t.keys})` : t.label}
            title={t.keys ? `${t.label} ${t.keys}` : t.label}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(t.cmd)}
            onKeyDown={(e) => onToolKey(e, i)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-[6px]! transition-colors",
              active[t.cmd] ? "bg-s4 text-ink" : "text-ink-dim hover:bg-s3 hover:text-ink",
            )}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div className="relative">
        {empty ? (
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 text-[13px] text-ink-faint">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={ref}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={labelledBy}
          aria-placeholder={placeholder}
          aria-disabled={disabled || undefined}
          contentEditable={!disabled}
          suppressContentEditableWarning
          tabIndex={disabled ? -1 : 0}
          onInput={sync}
          dangerouslySetInnerHTML={initial}
          style={{ minHeight }}
          className={cn(
            "fi-rte scroll-thin max-h-[220px] overflow-y-auto break-words px-3 py-2.5 text-[13px] leading-relaxed text-ink focus-visible:outline-none!",
          )}
          {...a11y}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------- ReportBugForm */

export type ReportStatus = "idle" | "submitting" | "success" | "error";

export type ReportBugFormProps = {
  status: ReportStatus;
  onSubmit: (text: string) => void;
  /** Start another report after a success. */
  onReset?: () => void;
  defaultHtml?: string;
  className?: string;
};

/** "Report a bug": rich text, Submit disabled while empty, then Sending…, then the result. */
export function ReportBugForm({ status, onSubmit, onReset, defaultHtml = "", className }: ReportBugFormProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const [text, setText] = useState(() => defaultHtml.replace(/<[^>]+>/g, " ").trim());
  const busy = status === "submitting";

  if (status === "success") {
    return (
      <div role="status" className={cn("flex min-h-[236px] flex-col items-center justify-center gap-3 rounded-[14px] border border-hair bg-s2 p-6 text-center", className)}>
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-grn/12 text-grn">
          <CircleCheck aria-hidden="true" className="size-5" />
        </span>
        <p className="text-[15px] font-medium text-ink">Thanks for the report.</p>
        <p className="max-w-[34ch] text-[12.5px] text-ink-dim">It reached the team with this space&rsquo;s version and the page you were on.</p>
        {onReset ? (
          <Button size="sm" variant="subtle" onClick={onReset}>
            Report something else
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      aria-labelledby={titleId}
      aria-describedby={descId}
      onSubmit={(e) => {
        e.preventDefault();
        if (text && !busy) onSubmit(text);
      }}
      className={cn("flex flex-col gap-4 rounded-[14px] border border-hair bg-s2 p-5", className)}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-s4 text-ink-dim">
          <Bug aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h4 id={titleId} className="text-[15px] font-semibold leading-snug text-ink">
            Report a bug
          </h4>
          <p id={descId} className="mt-0.5 text-[12.5px] text-ink-dim">
            What went wrong? We&rsquo;ll get back to you.
          </p>
        </div>
      </div>
      <RichTextEditor
        id={`${uid}-body`}
        labelledBy={titleId}
        defaultHtml={defaultHtml}
        placeholder="Steps, what you expected, what happened…"
        disabled={busy}
        onTextChange={setText}
        aria-invalid={status === "error" || undefined}
      />
      {status === "error" ? (
        <p role="alert" className="flex items-center gap-1.5 text-[12px] text-[#ff7a70]">
          <CircleAlert aria-hidden="true" className="size-3.5" />
          Failed to send. Please try again.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="mr-auto text-[11.5px] text-ink-faint">{text ? `${text.length} characters` : "Write something to send"}</span>
        <Button type="submit" variant="primary" size="sm" disabled={!text} loading={busy} loadingLabel="Sending…">
          Submit
        </Button>
      </div>
    </form>
  );
}
