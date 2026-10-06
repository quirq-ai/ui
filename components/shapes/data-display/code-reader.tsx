"use client";

// CodeReader: a read-only source view with a line-number gutter, token colors from the quirq
// palette, a wrap toggle and copy. Wrap is local state unless controlled.
import { useMemo, useState } from "react";
import { WrapText } from "lucide-react";
import { cn } from "@/lib/cn";
import { CopyButton } from "@/components/ui/copy-button";
import { highlight, TOKEN_CLASS, type CodeLanguage } from "./highlight";
import { ToggleButton } from "./controls";

export type CodeReaderProps = {
  code: string;
  language: CodeLanguage;
  /** Title bar: file name or path. */
  filename: string;
  /** Next to the file name, such as "TypeScript · 1.2 KB". */
  meta?: string;
  defaultWrap?: boolean;
  wrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Hide the wrap toggle (JSON reads better unwrapped). */
  wrapToggle?: boolean;
  showLineNumbers?: boolean;
  /** Body height cap in px before it scrolls. */
  maxHeight?: number;
  className?: string;
};

/** Highlighted, line-numbered, copyable code. */
export function CodeReader({
  code,
  language,
  filename,
  meta,
  defaultWrap = false,
  wrap,
  onWrapChange,
  wrapToggle = true,
  showLineNumbers = true,
  maxHeight = 360,
  className,
}: CodeReaderProps) {
  const [inner, setInner] = useState(defaultWrap);
  const wrapped = wrap ?? inner;
  const lines = useMemo(() => highlight(code, language), [code, language]);
  const gutter = String(lines.length).length + 1;

  function toggle() {
    const next = !wrapped;
    if (wrap === undefined) setInner(next);
    onWrapChange?.(next);
  }

  return (
    <section aria-label={`${filename} source`} className={cn("min-w-0 overflow-hidden rounded-[12px] border border-hair bg-[#0a0a0c]", className)}>
      <header className="flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-hair-soft px-3.5 py-1.5">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <span className="truncate font-mono text-[12px] text-ink">{filename}</span>
          {meta ? <span className="shrink-0 font-mono text-[10.5px] text-ink-faint">{meta}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {wrapToggle ? (
            <ToggleButton pressed={wrapped} onClick={toggle} icon={<WrapText />}>
              Wrap
            </ToggleButton>
          ) : null}
          <CopyButton text={code} variant="labelled" size="sm" aria-label={`Copy ${filename}`} announce={`${filename} copied`} />
        </div>
      </header>
      <div tabIndex={0} role="region" aria-label={`${filename} code`} className="scroll-thin overflow-auto" style={{ maxHeight }}>
        <pre className={cn("py-3 font-mono text-[12px] leading-[1.8] text-ink-dim", wrapped ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "w-max min-w-full whitespace-pre")}>
          <code>
            {lines.map((tokens, i) => (
              <span
                key={i}
                className="grid pr-4 hover:bg-white/[0.025]"
                style={{ gridTemplateColumns: showLineNumbers ? `${gutter + 2}ch minmax(0,1fr)` : "minmax(0,1fr)" }}
              >
                {showLineNumbers ? (
                  <span aria-hidden="true" className="select-none pr-4 text-right tabular-nums text-ink-faint/70">
                    {i + 1}
                  </span>
                ) : null}
                <span className={showLineNumbers ? undefined : "pl-4"}>
                  {tokens.length === 0 || (tokens.length === 1 && tokens[0].text === "")
                    ? " "
                    : tokens.map((t, k) =>
                        t.kind ? (
                          <span key={k} className={TOKEN_CLASS[t.kind]}>
                            {t.text}
                          </span>
                        ) : (
                          <span key={k} className="text-ink">
                            {t.text}
                          </span>
                        ),
                      )}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </section>
  );
}
