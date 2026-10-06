// File bodies shared by every viewer variant: a small safe Markdown renderer, highlighted
// source with line numbers, a CSV table, a sandboxed HTML frame, notes for states, and the
// truncation banner. Server-safe: no hooks. Markdown is parsed into React elements, never
// injected as HTML, and HTML files render only inside a sandboxed iframe with no scripts.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { TRUNCATE_BYTES } from "./file-kinds";

/* ============================================================== inline markdown */

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (m[1]) {
      out.push(
        <code key={`${keyBase}-c${k++}`} className="rounded-[5px] border border-hair-soft bg-s3 px-[5px] py-px font-mono text-[0.86em] text-ink">
          {m[1].slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(
        <strong key={`${keyBase}-b${k++}`} className="font-semibold text-ink">
          {m[2].slice(2, -2)}
        </strong>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ============================================================== markdown blocks */

type Block =
  | { t: "h"; level: number; text: string }
  | { t: "p"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "code"; lang: string; text: string }
  | { t: "quote"; text: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "hr" };

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Parses the Markdown subset the product READMEs use. */
export function parseMarkdown(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push({ t: "code", lang: fence[1] || "text", text: body.join("\n") });
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ t: "h", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      blocks.push({ t: "table", head, rows });
      continue;
    }
    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ t: "quote", text: body.join(" ") });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ""));
      blocks.push({ t: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      blocks.push({ t: "ol", items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|```|>|[-*]\s|\d+\.\s|\|)/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    if (para.length === 0) {
      blocks.push({ t: "p", text: line });
      i++;
    } else {
      blocks.push({ t: "p", text: para.join(" ") });
    }
  }
  return blocks;
}

const headingCls: Record<number, string> = {
  1: "mt-1 mb-3 text-[22px] tracking-[-0.02em]",
  2: "mt-6 mb-2.5 text-[17px] tracking-[-0.01em]",
  3: "mt-5 mb-2 text-[15px]",
};

/** Rendered Markdown in the restrained wiki typography of the Space dashboard. */
export function MarkdownView({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source);
  return (
    <div className={cn("min-w-0 text-[13.5px] leading-[1.68] text-ink-dim", className)}>
      {blocks.map((b, i) => {
        const key = `b${i}`;
        switch (b.t) {
          case "h": {
            const Tag = (`h${Math.min(b.level + 1, 6)}`) as "h2" | "h3" | "h4" | "h5" | "h6";
            return (
              <Tag key={key} className={cn("font-semibold leading-tight text-ink first:mt-0", headingCls[b.level] ?? "mt-4 mb-2 text-[14px]")}>
                {inline(b.text, key)}
              </Tag>
            );
          }
          case "p":
            return (
              <p key={key} className="mb-3">
                {inline(b.text, key)}
              </p>
            );
          case "ul":
          case "ol": {
            const List = b.t;
            return (
              <List key={key} className={cn("mb-3 space-y-1 pl-5", b.t === "ul" ? "list-disc marker:text-ink-faint" : "list-decimal marker:text-ink-faint")}>
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item, `${key}-${j}`)}</li>
                ))}
              </List>
            );
          }
          case "code":
            return (
              <pre
                key={key}
                tabIndex={0}
                aria-label={`${b.lang} code`}
                className="scroll-thin mb-3.5 overflow-x-auto rounded-[9px] border border-hair-soft bg-s2 px-3.5 py-3 font-mono text-[12px] leading-[1.6] text-ink"
              >
                <code>{b.text}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote key={key} className="mb-3 border-l-2 border-hair-strong pl-3.5 text-ink-faint">
                {inline(b.text, key)}
              </blockquote>
            );
          case "table":
            return (
              <div key={key} className="scroll-thin mb-3.5 overflow-x-auto">
                <table className="w-full border-collapse text-[12.5px]">
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} scope="col" className="border border-hair-soft bg-s2 px-2.5 py-1.5 text-left font-medium text-ink">
                          {inline(h, `${key}-h${j}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, n) => (
                          <td key={n} className="border border-hair-soft px-2.5 py-1.5 align-top">
                            {inline(c, `${key}-${j}-${n}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={key} className="my-4 border-hair-soft" />;
        }
      })}
    </div>
  );
}

/* ============================================================== source highlighting */

const TS_TOKENS =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b(?:export|type|function|return|if|else|const|let|import|from|true|false|null|undefined|interface|as|new|async|await|def|class)\b)|([A-Za-z_$][\w$]*)(?=\()/g;
const JSON_TOKENS = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
const SH_TOKENS = /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(^\s*[a-z][\w-]*)/g;

function highlight(line: string, language: string, keyBase: string): ReactNode[] {
  const re = language === "json" ? JSON_TOKENS : language === "sh" ? SH_TOKENS : language === "ts" ? TS_TOKENS : null;
  if (!re) return [line];
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of line.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push(line.slice(last, at));
    let cls = "";
    if (language === "json") {
      cls = m[1] ? (m[2] ? "text-[#8fc8ff]" : "text-[#9be3b4]") : m[3] ? "text-[#ffc983]" : "text-[#d6b4ff]";
      if (m[1] && m[2]) {
        out.push(
          <span key={`${keyBase}-${k++}`} className={cls}>
            {m[1]}
          </span>,
          m[2],
        );
        last = at + m[0].length;
        continue;
      }
    } else if (language === "sh") {
      cls = m[1] ? "text-ink-faint italic" : m[2] ? "text-[#9be3b4]" : "text-[#8fc8ff]";
    } else {
      cls = m[1]
        ? "text-ink-faint italic"
        : m[2]
          ? "text-[#9be3b4]"
          : m[3]
            ? "text-[#ffc983]"
            : m[4]
              ? "text-[#d6b4ff]"
              : "text-[#8fc8ff]";
    }
    out.push(
      <span key={`${keyBase}-${k++}`} className={cls}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export type SourceViewProps = {
  text: string;
  /** ts, json, sh or anything else for plain text. */
  language?: string;
  lineNumbers?: boolean;
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Accessible name for the scroll region. */
  label: string;
  className?: string;
};

/** Escaped source text, optionally numbered and highlighted. Focusable so keyboards can scroll it. */
export function SourceView({ text, language = "text", lineNumbers = true, wrap = false, label, className }: SourceViewProps) {
  const lines = text.replace(/\n$/, "").split("\n");
  const gutter = String(lines.length).length;
  return (
    <pre
      tabIndex={0}
      aria-label={label}
      className={cn(
        "scroll-thin m-0 min-w-0 overflow-auto font-mono text-[12px] leading-[1.7] text-ink-dim",
        wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        className,
      )}
      style={{ tabSize: 2 }}
    >
      <code className="block min-w-fit">
        {lines.map((line, i) => (
          <span key={i} className="flex">
            {lineNumbers ? (
              <span aria-hidden="true" className="mr-5 inline-block shrink-0 select-none whitespace-nowrap text-right tabular-nums text-ink-faint/70" style={{ minWidth: `${gutter + 0.5}ch` }}>
                {i + 1}
              </span>
            ) : null}
            <span className={cn("min-w-0", wrap && "whitespace-pre-wrap break-words")}>{line === "" ? "\u200b" : highlight(line, language, `l${i}`)}</span>
          </span>
        ))}
      </code>
    </pre>
  );
}

/* ============================================================== csv table */

export type CsvTableProps = {
  text: string;
  /** Caption above the rows, such as the file name and row count. */
  caption?: ReactNode;
  /** Show at most this many data rows. */
  maxRows?: number;
  /** Accessible name for the scroll region, such as "usage-2026.csv table". */
  label?: string;
  className?: string;
};

/** A CSV as a table with a sticky header. Empty cells read "Unavailable", never zero. */
export function CsvTable({ text, caption, maxRows, label = "Table preview", className }: CsvTableProps) {
  const [head, ...rows] = text
    .trim()
    .split("\n")
    .map((l) => l.split(","));
  const shown = maxRows ? rows.slice(0, maxRows) : rows;
  const numeric = head.map((_, c) => rows.every((r) => r[c] === "" || r[c] === undefined || /^-?\d+(\.\d+)?$/.test(r[c])));
  return (
    <div tabIndex={0} role="region" aria-label={label} className={cn("scroll-thin min-w-0 overflow-auto", className)}>
      <table className="w-full min-w-[560px] border-separate border-spacing-0 font-mono text-[11.5px] leading-[1.5]">
        {caption ? <caption className="border-b border-hair-soft bg-s2 px-3 py-2 text-left text-[11px] text-ink-dim">{caption}</caption> : null}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={`${h}-${i}`}
                scope="col"
                className={cn(
                  "sticky top-0 z-[1] whitespace-nowrap border-b border-hair bg-s3 px-3 py-2 font-medium text-ink",
                  numeric[i] ? "text-right" : "text-left",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i} className="even:bg-white/[0.015]">
              {head.map((_, c) => {
                const v = r[c] ?? "";
                return (
                  <td
                    key={c}
                    className={cn(
                      "whitespace-nowrap border-b border-hair-soft px-3 py-1.5",
                      numeric[c] ? "text-right tabular-nums" : "text-left",
                      v === "" ? "text-ink-faint" : "text-ink-dim",
                    )}
                  >
                    {v === "" ? "Unavailable" : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================== html frame */

/**
 * An HTML file rendered as itself in a sandboxed frame: no scripts, no same origin, so it
 * can never reach the app. White while it loads, because it is another document.
 */
export function HtmlFrame({ html, title, className }: { html: string; title: string; className?: string }) {
  return <iframe title={title} sandbox="" referrerPolicy="no-referrer" srcDoc={html} className={cn("block h-full w-full border-0 bg-white", className)} />;
}

/* ============================================================== notes and banners */

export type ViewerNoteProps = {
  icon?: ReactNode;
  /** Headline in ink; omit for a single quiet line. */
  title?: ReactNode;
  children?: ReactNode;
  /** Error notes use the soft red reading tone. */
  tone?: "muted" | "error";
  /** Button or link under the message. */
  action?: ReactNode;
  className?: string;
};

/** Centered state message for loading, too large, unsupported and error bodies. */
export function ViewerNote({ icon, title, children, tone = "muted", action, className }: ViewerNoteProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col items-center justify-center gap-2.5 px-6 py-8 text-center", className)}>
      {icon ? <span className={cn("inline-flex [&_svg]:size-5", tone === "error" ? "text-[#ffbaad]" : "text-ink-faint")}>{icon}</span> : null}
      {title ? <p className="text-[14px] font-medium text-ink">{title}</p> : null}
      {children ? <div className={cn("max-w-[44ch] text-[12.5px] leading-relaxed", tone === "error" ? "text-[#ffbaad]" : "text-ink-dim")}>{children}</div> : null}
      {action ? <div className="mt-1.5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Amber strip above a truncated body: the reader shows only the first 256 KB. */
export function TruncationBanner({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <p role="note" className={cn("shrink-0 border-b border-org/20 bg-org/[0.06] px-3.5 py-1.5 text-[11.5px] text-org", className)}>
      {children ?? `Showing the first ${formatBytes(TRUNCATE_BYTES)} of this file.`}
    </p>
  );
}
