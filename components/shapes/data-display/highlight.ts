// Tiny deterministic highlighter for the code reader: TypeScript and JSON only.
// Pure functions, no DOM; the same input yields the same tokens on server and client.

export type TokenKind = "comment" | "keyword" | "string" | "number" | "function" | "name" | "punctuation" | "invalid";
export type Token = { kind: TokenKind | null; text: string };
export type CodeLanguage = "typescript" | "json" | "text";

/** Text color per token kind, mapped onto the quirq palette. */
export const TOKEN_CLASS: Record<TokenKind, string> = {
  comment: "text-ink-faint italic",
  keyword: "text-pur",
  string: "text-grn",
  number: "text-org",
  function: "text-cyn",
  name: "text-blu",
  punctuation: "text-ink-dim",
  invalid: "text-red",
};

const TS_KEYWORDS = new Set([
  "export", "import", "from", "type", "interface", "function", "return", "if", "else", "const", "let", "var",
  "async", "await", "new", "extends", "implements", "class", "as", "of", "in", "for", "while", "default",
  "typeof", "keyof", "void", "true", "false", "null", "undefined", "throw", "try", "catch",
]);

const WORD = /[A-Za-z_$][\w$]*/y;
const NUMBER = /\d+(?:\.\d+)?/y;
const STRING = /"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?/y;
const SPACE = /\s+/y;
const PUNCT = /[{}()[\];,.:<>=|&?!+\-*/%@#^~]+/y;

function match(re: RegExp, src: string, at: number): string | null {
  re.lastIndex = at;
  const m = re.exec(src);
  return m ? m[0] : null;
}

function push(out: Token[], kind: TokenKind | null, text: string) {
  const last = out[out.length - 1];
  if (last && last.kind === kind) last.text += text;
  else out.push({ kind, text });
}

function tsLine(line: string, state: { inBlock: boolean }): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (state.inBlock) {
      const end = line.indexOf("*/", i);
      if (end === -1) {
        push(out, "comment", line.slice(i));
        return out;
      }
      push(out, "comment", line.slice(i, end + 2));
      i = end + 2;
      state.inBlock = false;
      continue;
    }
    if (line.startsWith("//", i)) {
      push(out, "comment", line.slice(i));
      break;
    }
    if (line.startsWith("/*", i)) {
      state.inBlock = true;
      push(out, "comment", "/*");
      i += 2;
      continue;
    }
    let m = match(SPACE, line, i);
    if (m) {
      push(out, null, m);
      i += m.length;
      continue;
    }
    m = match(STRING, line, i);
    if (m) {
      push(out, "string", m);
      i += m.length;
      continue;
    }
    m = match(NUMBER, line, i);
    if (m) {
      push(out, "number", m);
      i += m.length;
      continue;
    }
    m = match(WORD, line, i);
    if (m) {
      const rest = line.slice(i + m.length).trimStart();
      const kind: TokenKind | null = TS_KEYWORDS.has(m) ? "keyword" : rest.startsWith("(") ? "function" : /^[A-Z]/.test(m) ? "name" : null;
      push(out, kind, m);
      i += m.length;
      continue;
    }
    m = match(PUNCT, line, i);
    if (m) {
      push(out, "punctuation", m);
      i += m.length;
      continue;
    }
    push(out, "invalid", line[i]);
    i++;
  }
  return out;
}

function jsonLine(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    let m = match(SPACE, line, i);
    if (m) {
      push(out, null, m);
      i += m.length;
      continue;
    }
    m = match(STRING, line, i);
    if (m) {
      const isKey = /^\s*:/.test(line.slice(i + m.length));
      push(out, isKey ? "name" : "string", m);
      i += m.length;
      continue;
    }
    m = match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, line, i);
    if (m) {
      push(out, "number", m);
      i += m.length;
      continue;
    }
    m = match(/true|false|null/y, line, i);
    if (m) {
      push(out, "keyword", m);
      i += m.length;
      continue;
    }
    m = match(/[{}[\],:]/y, line, i);
    if (m) {
      push(out, "punctuation", m);
      i += m.length;
      continue;
    }
    push(out, "invalid", line[i]);
    i++;
  }
  return out;
}

/** Splits code into lines of tokens. Block comments carry across lines. */
export function highlight(code: string, language: CodeLanguage): Token[][] {
  const lines = code.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");
  if (language === "text") return lines.map((l) => [{ kind: null, text: l }]);
  if (language === "json") return lines.map(jsonLine);
  const state = { inBlock: false };
  return lines.map((l) => tsLine(l, state));
}
