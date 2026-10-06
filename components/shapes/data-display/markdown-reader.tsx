"use client";

// MarkdownReader: the local reader for a markdown file. Preview renders the prose, Source
// shows the raw text with line numbers and an optional wrap. Mode, wrap and copy are local
// state; the file content comes in through props.
import { useState } from "react";
import { WrapText } from "lucide-react";
import { cn } from "@/lib/cn";
import { CopyButton } from "@/components/ui/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { MarkdownProse, type ProseSize } from "./article";
import { ToggleButton } from "./controls";

export type ReaderMode = "preview" | "source";

export type MarkdownReaderProps = {
  /** File name shown as the title. */
  name: string;
  /** Path under the title, mono. */
  path: string;
  source: string;
  /** Right side of the footer, such as "1.0 KB · markdown". */
  meta?: string;
  /** Kicker above the name. */
  kicker?: string;
  defaultMode?: ReaderMode;
  /** Controlled mode. */
  mode?: ReaderMode;
  onModeChange?: (mode: ReaderMode) => void;
  size?: ProseSize;
  /** Heading level for "#" in preview. */
  headingBase?: number;
  /** Max body height in px before it scrolls. */
  maxHeight?: number;
  className?: string;
};

/** A markdown file with Preview and Source modes. */
export function MarkdownReader({
  name,
  path,
  source,
  meta,
  kicker = "Local reader",
  defaultMode = "preview",
  mode,
  onModeChange,
  size = "reader",
  headingBase = 4,
  maxHeight = 460,
  className,
}: MarkdownReaderProps) {
  const [inner, setInner] = useState<ReaderMode>(defaultMode);
  const [wrap, setWrap] = useState(false);
  const current = mode ?? inner;
  const lines = source.replace(/\n$/, "").split("\n");
  const gutter = String(lines.length).length;

  function change(next: ReaderMode) {
    if (mode === undefined) setInner(next);
    onModeChange?.(next);
  }

  return (
    <section aria-label={`${name} reader`} className={cn("flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-hair bg-s1", className)}>
      <header className="flex items-start justify-between gap-3 border-b border-hair-soft px-4 pb-3.5 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p>
          <p className="mt-1.5 truncate text-[18px] font-semibold tracking-[-0.02em] text-ink">{name}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-ink-faint" title={path}>
            {path}
          </p>
        </div>
        <CopyButton text={source} size="sm" aria-label={`Copy ${name}`} announce={`${name} copied`} />
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hair-soft bg-white/[0.015] px-4 py-2 sm:px-5">
        <Segmented<ReaderMode>
          size="sm"
          aria-label="Reader mode"
          value={current}
          onChange={change}
          options={[
            { value: "preview", label: "Preview" },
            { value: "source", label: "Source" },
          ]}
        />
        {current === "source" ? (
          <ToggleButton pressed={wrap} onClick={() => setWrap((w) => !w)} icon={<WrapText />}>
            Wrap
          </ToggleButton>
        ) : (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Rendered</span>
        )}
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label={current === "preview" ? `${name} preview` : `${name} source`}
        className="scroll-thin min-h-0 flex-1 overflow-auto bg-black/30"
        style={{ maxHeight }}
      >
        {current === "preview" ? (
          <MarkdownProse source={source} size={size} headingBase={headingBase} className="mx-auto max-w-[68ch] px-4 py-5 sm:px-7 sm:py-6" />
        ) : (
          <pre className={cn("px-4 py-4 font-mono text-[12px] leading-[1.8] text-ink-dim sm:px-5", wrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "w-max min-w-full whitespace-pre")}>
            {lines.map((l, i) => (
              <span key={i} className="grid" style={{ gridTemplateColumns: `${gutter + 1}ch minmax(0,1fr)` }}>
                <span aria-hidden="true" className="select-none pr-3 text-right text-ink-faint/70">
                  {i + 1}
                </span>
                <span>{l || " "}</span>
              </span>
            ))}
          </pre>
        )}
      </div>
      {meta ? (
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-hair-soft px-4 py-2.5 font-mono text-[10.5px] text-ink-faint sm:px-5">
          <span>Read on this machine. Nothing is uploaded.</span>
          <span className="tabular-nums">{meta}</span>
        </footer>
      ) : null}
    </section>
  );
}
