// A small, safe Markdown and code renderer for file previews: headings, paragraphs, lists,
// fenced code, tables and quotes, plus line-numbered source with light token colors. It
// builds React elements only (never HTML strings), so file contents cannot inject markup.
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

function inline(text: string, keyBase: string): ReactNode[] {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyBase}-${i}`;
      if (part.startsWith("`") && part.endsWith("`"))
        return (
          <code key={key} className="rounded-[4px] border border-hair-soft bg-s2 px-1 py-px font-mono text-[0.86em] text-ink">
            {part.slice(1, -1)}
          </code>
        );
      if (part.startsWith("**") && part.endsWith("**"))
        return (
          <strong key={key} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      return <span key={key}>{part}</span>;
    });
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

export function MarkdownLite({ source, className }: { source: string; className?: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key} className="scroll-thin overflow-x-auto rounded-[10px] border border-hair-soft bg-black/50 px-3.5 py-2.5 font-mono text-[12px] leading-relaxed text-ink-dim">
          {lang ? <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-ink-faint">{lang}</span> : null}
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const Tag = level === 1 ? "h4" : level === 2 ? "h5" : "h6";
      blocks.push(
        <Tag
          key={key}
          className={cn(
            "font-semibold tracking-[-0.01em] text-ink",
            level === 1 ? "border-b border-hair-soft pb-2 text-[20px]" : level === 2 ? "mt-2 text-[15px]" : "text-[13.5px]",
          )}
        >
          {inline(h[2], key)}
        </Tag>,
      );
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      blocks.push(
        <ul key={key} className="list-disc space-y-1 pl-5 marker:text-ink-faint">
          {items.map((it, j) => (
            <li key={j}>{inline(it, `${key}-${j}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const [head, , ...rest] = rows;
      blocks.push(
        <div key={key} className="scroll-thin overflow-x-auto rounded-[10px] border border-hair-soft">
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead className="bg-s2">
              <tr>
                {cells(head).map((c, j) => (
                  <th key={j} scope="col" className="px-3 py-1.5 font-medium text-ink">
                    {inline(c, `${key}-h${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rest.map((r, ri) => (
                <tr key={ri} className="border-t border-hair-soft">
                  {cells(r).map((c, j) => (
                    <td key={j} className="px-3 py-1.5 align-top text-ink-dim">
                      {inline(c, `${key}-${ri}-${j}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(
        <blockquote key={key} className="border-l-2 border-hair-strong pl-3 text-ink-dim">
          {inline(quote.join(" "), key)}
        </blockquote>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|```|\s*[-*]\s|\||>)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={key}>{inline(para.join(" "), key)}</p>);
  }
  return <div className={cn("space-y-3 text-[13px] leading-relaxed text-ink-dim", className)}>{blocks}</div>;
}

const TOKEN =
  /(\/\/.*$|\/\*\*?.*?\*\/|"(?:[^"\\]|\\.)*"(?=\s*:)|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:export|type|function|return|if|const|let|import|from|null|true|false|number|string|undefined)\b|\b\d+(?:\.\d+)?\b)/g;

function tokens(line: string, language: string): ReactNode[] {
  if (language === "csv" || language === "markdown" || language === "html") return [line];
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(line.slice(last, at));
    const t = m[0];
    const isKey = t.startsWith('"') && /^\s*:/.test(line.slice(at + t.length));
    const cls = t.startsWith("//") || t.startsWith("/*")
      ? "text-ink-faint italic"
      : isKey
        ? "text-blu"
        : /^["'`]/.test(t)
          ? "text-grn/85"
          : /^\d/.test(t)
            ? "text-org"
            : "text-pur";
    out.push(
      <span key={at} className={cls}>
        {t}
      </span>,
    );
    last = at + t.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** Props for a scrolling view; a label makes it a focusable region keyboard users can scroll. */
type ScrollViewProps = { content: string; className?: string; label?: string };

const regionProps = (label?: string) =>
  label ? ({ role: "region", "aria-label": label, tabIndex: 0 } as const) : {};

/** Line-numbered source view. */
export function CodeView({ content, language, className, label }: ScrollViewProps & { language: string }) {
  const lines = content.replace(/\n$/, "").split("\n");
  const gutter = String(lines.length).length;
  return (
    <div {...regionProps(label)} className={cn("scroll-thin overflow-auto font-mono text-[12px] leading-[18px] focus-visible:outline-offset-[-2px]", className)}>
      <table className="border-collapse">
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td
                className="select-none pl-3 pr-3 text-right align-top text-ink-faint/70 tabular-nums"
                style={{ minWidth: `${gutter + 2}ch` }}
                aria-hidden="true"
              >
                {i + 1}
              </td>
              <td className="whitespace-pre pr-4 align-top text-ink-dim">{tokens(l, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** CSV rendered as a compact table. */
export function CsvTable({ content, className, label }: ScrollViewProps) {
  const rows = content.trim().split("\n").map((r) => r.split(","));
  const [head, ...rest] = rows;
  return (
    <div {...regionProps(label)} className={cn("scroll-thin overflow-auto focus-visible:outline-offset-[-2px]", className)}>
      <table className="w-full border-collapse text-left font-mono text-[11.5px] tabular-nums">
        <thead className="sticky top-0 bg-s2">
          <tr>
            {head.map((c) => (
              <th key={c} scope="col" className="whitespace-nowrap px-3 py-1.5 font-medium text-ink">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rest.map((r, i) => (
            <tr key={i} className="border-t border-hair-soft">
              {r.map((c, j) => (
                <td key={j} className={cn("whitespace-nowrap px-3 py-1", j === 0 ? "text-ink-dim" : "text-right text-ink-dim")}>
                  {c === "" ? <span className="text-ink-faint">Unavailable</span> : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
