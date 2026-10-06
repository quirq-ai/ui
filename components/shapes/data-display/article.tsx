// Article and markdown prose: ArticleHeader (back link, kicker, title, dek, mono meta line),
// ArticleBody (h2, h3, p, described figure, quote with a spectrum bar, focusable code and
// table regions, spectrum-bullet lists) and MarkdownProse (a small deterministic markdown
// renderer for previews, chat replies and the local reader). Server-safe, no hooks.
import { createElement, Fragment, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------- inline */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

/** Inline markdown: **bold**, `code` and [text](href). In-page and relative links stay in the tab; http links open a new one. */
export function renderInline(text: string, linkCls = "text-ink underline decoration-hair-strong underline-offset-4 transition-colors hover:decoration-ink"): ReactNode {
  const parts = text.split(INLINE);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded-[4px] bg-white/[0.07] px-[5px] py-px font-mono text-[0.86em] text-ink">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return (
        <a key={i} href={link[2]} className={linkCls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}>
          {link[1]}
          {external ? (
            <>
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </>
          ) : null}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
function headingTag(level: number): HeadingTag {
  return `h${Math.min(6, Math.max(1, level))}` as HeadingTag;
}

/** A heading whose level is chosen by the caller, so embedded articles keep the page outline. */
function Heading({ level, className, children }: { level: number; className?: string; children: ReactNode }) {
  return createElement(headingTag(level), { className }, children);
}

/* ----------------------------------------------------------------------------- ArticleHeader */

export type ArticleHeaderProps = {
  backHref: string;
  backLabel: string;
  /** Topic kicker: "Research · Experiments". */
  topic: string;
  title: string;
  dek: string;
  /** "June 2026"; omit for the undated variant. */
  date?: string;
  /** "12 min read" */
  readTime: string;
  /** Trailing tag after a short rule: "Experiment". */
  tag?: string;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
};

function BackChevron() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1">
      <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Research note header: back link, topic, title, dek and a mono meta line. */
export function ArticleHeader({ backHref, backLabel, topic, title, dek, date, readTime, tag, titleAs: Title = "h1", className }: ArticleHeaderProps) {
  return (
    <header className={className}>
      <a
        href={backHref}
        className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink"
      >
        <BackChevron />
        {backLabel}
      </a>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">{topic}</p>
      <Title className="mt-3 text-[clamp(26px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.028em] text-ink">{title}</Title>
      <p className="mt-4 text-[16px] leading-[1.65] text-ink-dim">{dek}</p>
      <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
        {date ? (
          <>
            <span>{date}</span>
            <span aria-hidden="true">·</span>
          </>
        ) : null}
        <span>{readTime}</span>
        {tag ? (
          <>
            <span aria-hidden="true" className="h-px w-4 bg-hair-strong" />
            <span>{tag}</span>
          </>
        ) : null}
      </p>
    </header>
  );
}

/* ----------------------------------------------------------------------------- ArticleBody */

export type ArticleBlock =
  | { kind: "h2" | "h3" | "p"; text: string }
  | { kind: "figure"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "code"; text: string; label?: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][]; label?: string };

export type ArticleBodyProps = {
  blocks: ArticleBlock[];
  /** Heading level used for "h2" blocks; "h3" blocks get one more. Lower it when the article sits inside a page. */
  headingBase?: number;
  className?: string;
};

function Block({ block, base }: { block: ArticleBlock; base: number }) {
  switch (block.kind) {
    case "h2":
      return (
        <Heading level={base} className="mt-10 text-[clamp(19px,2.2vw,24px)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
          {block.text}
        </Heading>
      );
    case "h3":
      return (
        <Heading level={base + 1} className="mt-8 text-[16.5px] font-semibold tracking-[-0.01em] text-ink">
          {block.text}
        </Heading>
      );
    case "p":
      return <p className="mt-4 text-[15px] leading-[1.78] text-ink-dim">{renderInline(block.text)}</p>;
    case "figure":
      return (
        <figure className="mt-7 rounded-[14px] border border-hair-soft bg-white/[0.02] px-5 py-4">
          <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Figure, described</figcaption>
          <p className="text-[14px] leading-[1.75] text-ink-dim">{block.text}</p>
        </figure>
      );
    case "quote":
      return (
        <blockquote className="relative mt-7 overflow-hidden rounded-[14px] border border-hair-soft bg-white/[0.025] py-5 pl-7 pr-6 text-[15.5px] leading-[1.65] text-ink">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,var(--red),var(--org),var(--yel),var(--grn),var(--cyn),var(--blu),var(--pur))]" />
          {block.text}
        </blockquote>
      );
    case "code":
      return (
        <pre
          tabIndex={0}
          role="region"
          aria-label={block.label ?? "Code sample"}
          className="scroll-thin mt-6 overflow-x-auto rounded-[14px] border border-hair-soft bg-white/[0.04] p-4 font-mono text-[12.5px] leading-[1.7] text-ink-dim"
        >
          {block.text}
        </pre>
      );
    case "list":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-[1.7] text-ink-dim">
              <span aria-hidden="true" className="spec-bar mt-[9px] size-1.5 shrink-0 rounded-[2px]" />
              <span className="min-w-0">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div tabIndex={0} role="region" aria-label={block.label ?? "Data table"} className="scroll-thin mt-6 overflow-x-auto rounded-[14px] border border-hair-soft">
          <table className="w-full min-w-[540px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair-soft bg-white/[0.03]">
                {block.header.map((cell, i) => (
                  <th key={i} scope="col" className="px-4 py-2.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-dim">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-hair-soft last:border-b-0">
                  {row.map((cell, c) => (
                    <td key={c} className={c === 0 ? "px-4 py-2.5 text-[13px] text-ink" : "px-4 py-2.5 font-mono text-[12.5px] tabular-nums text-ink-dim"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** Article body blocks in reading order. Never wrapped in a reveal: it is taller than any viewport. */
export function ArticleBody({ blocks, headingBase = 2, className }: ArticleBodyProps) {
  return (
    <div className={className}>
      {blocks.map((b, i) => (
        <Block key={i} block={b} base={headingBase} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------------- markdown */

export type MdBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "code"; lang: string; text: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: { text: string; task: boolean | null }[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "hr" };

const isTableSep = (line: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);
const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

/** Parses the markdown subset the product writes: headings, paragraphs, fences, quotes, lists, task lists, tables, rules. */
export function parseMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      out.push({ kind: "code", lang: fence[1], text: body.join("\n") });
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      out.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push({ kind: "hr" });
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^>\s?/, ""));
      out.push({ kind: "quote", text: body.join(" ") });
      continue;
    }
    if (line.trim().startsWith("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(splitRow(lines[i++]));
      out.push({ kind: "table", header, rows });
      continue;
    }
    const bullet = /^\s*([-*]|\d+\.)\s+/;
    if (bullet.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: { text: string; task: boolean | null }[] = [];
      while (i < lines.length && bullet.test(lines[i])) {
        const text = lines[i].replace(bullet, "");
        const task = /^\[([ xX])\]\s+/.exec(text);
        items.push(task ? { text: text.slice(task[0].length), task: task[1] !== " " } : { text, task: null });
        i++;
      }
      out.push({ kind: "list", ordered, items });
      continue;
    }
    const body: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*([-*]|\d+\.)\s)/.test(lines[i])) body.push(lines[i++]);
    out.push({ kind: "p", text: body.join(" ") });
  }
  return out;
}

export type ProseSize = "reader" | "preview" | "compact";

const PROSE: Record<ProseSize, { body: string; h: Record<number, string>; gap: string; code: string }> = {
  /* local reader: 15px/1.8, editorial */
  reader: {
    body: "text-[15px] leading-[1.8]",
    h: {
      1: "text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] pb-3 border-b border-hair-soft",
      2: "text-[21px] font-semibold leading-[1.25] tracking-[-0.02em]",
      3: "text-[17px] font-semibold leading-[1.3]",
    },
    gap: "space-y-4",
    code: "rounded-[10px] px-5 py-4 text-[12.5px]",
  },
  /* previewer: 13.5px/1.68 */
  preview: {
    body: "text-[13.5px] leading-[1.68]",
    h: {
      1: "text-[22px] font-semibold leading-[1.2] tracking-[-0.02em]",
      2: "text-[16px] font-semibold leading-[1.3] tracking-[-0.01em]",
      3: "text-[14px] font-semibold",
    },
    gap: "space-y-3",
    code: "rounded-[9px] px-3.5 py-3 text-[12px]",
  },
  /* chat reply: 13.5px, compact */
  compact: {
    body: "text-[13.5px] leading-[1.6]",
    h: {
      1: "text-[15px] font-semibold",
      2: "text-[14px] font-semibold",
      3: "text-[13.5px] font-semibold",
    },
    gap: "space-y-2",
    code: "rounded-[9px] px-3 py-2.5 text-[12px]",
  },
};

export type MarkdownProseProps = {
  source: string;
  size?: ProseSize;
  /** Heading level used for "#"; lower it when the prose sits inside a page that already has headings. */
  headingBase?: number;
  className?: string;
};

/** Renders markdown as quirq prose. Code and tables scroll inside focusable regions. */
export function MarkdownProse({ source, size = "preview", headingBase = 1, className }: MarkdownProseProps) {
  const s = PROSE[size];
  const blocks = parseMarkdown(source);
  return (
    <div className={cn("min-w-0 text-ink-dim [overflow-wrap:anywhere]", s.body, s.gap, className)}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "heading":
            return (
              <Heading key={i} level={headingBase + b.level - 1} className={cn("text-ink", i > 0 && "pt-2", s.h[Math.min(3, b.level)])}>
                {renderInline(b.text)}
              </Heading>
            );
          case "p":
            return <p key={i}>{renderInline(b.text)}</p>;
          case "code":
            return (
              <pre
                key={i}
                tabIndex={0}
                role="region"
                aria-label={b.lang ? `${b.lang} code` : "Code"}
                className={cn("scroll-thin overflow-x-auto whitespace-pre border border-hair-soft bg-s3 font-mono leading-[1.7] text-ink [overflow-wrap:normal]", s.code)}
              >
                {b.text}
              </pre>
            );
          case "quote":
            return (
              <blockquote key={i} className="relative rounded-r-[8px] bg-white/[0.03] py-2 pl-4 pr-3 text-ink-dim">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2px] bg-[linear-gradient(180deg,var(--red),var(--org),var(--yel),var(--grn),var(--cyn),var(--blu),var(--pur))]" />
                {renderInline(b.text)}
              </blockquote>
            );
          case "list": {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i} className={cn("space-y-1.5", b.ordered ? "list-decimal pl-5 marker:font-mono marker:text-ink-faint" : "")}>
                {b.items.map((it, k) => (
                  <li key={k} className={cn(!b.ordered && "flex gap-2.5")}>
                    {b.ordered ? null : it.task === null ? (
                      <span aria-hidden="true" className="mt-[0.62em] size-[5px] shrink-0 rounded-[1.5px] bg-ink-faint" />
                    ) : (
                      <span
                        className={cn(
                          "mt-[0.28em] inline-flex size-[15px] shrink-0 items-center justify-center rounded-[4px] border",
                          it.task ? "border-grn/50 bg-grn/15 text-grn" : "border-hair-strong text-transparent",
                        )}
                      >
                        <Check aria-hidden="true" className="size-[11px]" strokeWidth={3} />
                        <span className="sr-only">{it.task ? "Done: " : "Not done: "}</span>
                      </span>
                    )}
                    <span className="min-w-0">{renderInline(it.text)}</span>
                  </li>
                ))}
              </L>
            );
          }
          case "table":
            return (
              <div key={i} tabIndex={0} role="region" aria-label="Table" className="scroll-thin overflow-x-auto rounded-[9px] border border-hair-soft">
                <table className="w-full min-w-[420px] border-collapse text-left text-[0.93em] [overflow-wrap:normal]">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      {b.header.map((h, k) => (
                        <th key={k} scope="col" className="border-b border-hair-soft px-3.5 py-2 font-medium text-ink">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, k) => (
                      <tr key={k} className="border-b border-hair-soft last:border-b-0">
                        {r.map((c, j) => (
                          <td key={j} className="px-3.5 py-2 align-top">
                            {renderInline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={i} className="border-0 border-t border-hair-soft" />;
        }
      })}
    </div>
  );
}
