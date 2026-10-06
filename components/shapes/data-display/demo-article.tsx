// Demo: Article and markdown prose. Research article (dated and undated headers, every body
// block), markdown preview (previewer and chat sizes) and the local reader in Preview and
// Source modes. Links go to other shapes on the page.
import { FILE_SAMPLES } from "@/lib/fixtures";
import { formatBytes } from "@/lib/format";
import { Caption, Cell } from "./demo-kit";
import { ArticleBody, ArticleHeader, MarkdownProse, type ArticleBlock } from "./article";
import { MarkdownReader } from "./markdown-reader";
import { MetaLine } from "./provenance";

const BODY: ArticleBlock[] = [
  {
    kind: "p",
    text: "We gave each agent the same task in seven spaces, each richer than the last: more files, more history, more tools. Then we counted how often it looked around before it acted.",
  },
  { kind: "h2", text: "What we measured" },
  {
    kind: "p",
    text: "Each run is a unit of work with a budget B set before it starts. Verification compares before and after snapshots against weighted checks and scores completion V. The [method footnote](#provenance-method-note) states the unit, scope and window.",
  },
  {
    kind: "quote",
    text: "The unit of work defines and verifies the job. The quirq is what that verification mints: the output meter, dual to the token's input meter.",
  },
  {
    kind: "code",
    label: "Minting formula",
    text: "potential quirqs  = B        (set by the human owner, before execution)\nminted quirqs   Q = V · B    (released by verification against captured state)",
  },
  { kind: "h3", text: "Three findings" },
  {
    kind: "list",
    items: [
      "Richer spaces did not raise curiosity on their own: agents read **2 of 9** context files before the first edit.",
      "A one-line pointer in `AGENTS.md` doubled the files read before the first edit.",
      "Verified completion rose with context read, not with tokens spent. Tokens stay on their own meter.",
    ],
  },
  {
    kind: "figure",
    text: "Files read before the first edit, by space richness. Both runtimes stay flat until the pointer appears in the fifth space, then rise together.",
  },
  {
    kind: "table",
    label: "Runs by space, illustrative",
    header: ["Space", "Runs", "Files read", "Median V"],
    rows: [
      ["S1 · bare folder", "12", "0.4", "0.62"],
      ["S4 · history and tools", "12", "1.1", "0.68"],
      ["S5 · pointer in AGENTS.md", "12", "2.3", "0.81"],
      ["S7 · full context", "12", "2.6", "0.84"],
    ],
  },
];

const CHAT_REPLY = [
  "Done. **2 steps** are complete and one is left:",
  "",
  "- [x] Agree on the acceptance criteria",
  "- [x] Wire the status pill to the Space API",
  "- [ ] Show Unavailable when the API is down",
  "",
  "```bash",
  "git status --short",
  "```",
  "",
  "One test still expects the old zero fallback. See the [log viewer](#log-terminal).",
].join("\n");

const CHAT_PLAN = [
  "Plan for **uow_121**, three steps:",
  "",
  "1. Give each source its own origin under `*.localhost:4100`",
  "2. Proxy the app as is, then add the bridge tag",
  "3. Report the page path back to the bar by postMessage",
  "",
  "> Budget B is 30 quirqs, set by Ada before the work runs.",
].join("\n");

const READER_SOURCE = [
  "# Welcome to the map",
  "",
  "> A folder is a world. Every file is a place worth exploring.",
  "",
  "| On your map | In your folder |",
  "| --- | --- |",
  "| Planet | A project or repository |",
  "| Molecule | A folder |",
  "| Atom | A file you can open |",
  "",
  "- [x] Open the README",
  "- [ ] Land on a project",
  "",
  "Read the words the map uses in the [term cards](#term-card).",
  "",
].join("\n");

export function ArticleDemo() {
  return (
    <div className="space-y-10">
      <Cell label="Variant · research article (dated header, every body block)">
        <article className="mx-auto max-w-[68ch] rounded-[18px] border border-hair-soft bg-[#0b0b0d] px-[clamp(18px,4vw,40px)] py-[clamp(22px,4vw,40px)]">
          <ArticleHeader
            backHref="#article"
            backLabel="Research"
            topic="Research · Experiments"
            title="The incurious agent"
            dek="84 controlled runs on curiosity across two agent runtimes and seven progressively richer spaces."
            date="June 2026"
            readTime="12 min read"
            tag="Experiment"
            titleAs="h3"
          />
          <ArticleBody blocks={BODY} headingBase={4} className="mt-8" />
          <MetaLine variant="qualifier" className="mt-10 border-t border-hair-soft pt-5">
            Illustrative numbers for the shapes catalog, not a published result.
          </MetaLine>
        </article>
      </Cell>

      <Cell label="Variant · article header without date">
        <div className="mx-auto max-w-[68ch] rounded-[18px] border border-hair-soft bg-[#0b0b0d] px-[clamp(18px,4vw,40px)] py-7">
          <ArticleHeader
            backHref="#article"
            backLabel="Notes"
            topic="Field note · Measurement"
            title="Why a missing number reads Unavailable"
            dek="A zero says the work happened and was worth nothing. Unavailable says we could not measure it. Those are different claims."
            readTime="4 min read"
            tag="Note"
            titleAs="h3"
          />
        </div>
      </Cell>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cell label={`Variant · markdown preview (previewer, ${FILE_SAMPLES.readme.path})`}>
          <div className="rounded-[14px] border border-hair bg-s1">
            <div className="flex items-center justify-between gap-3 border-b border-hair-soft px-4 py-2.5">
              <span className="truncate font-mono text-[12px] text-ink">{FILE_SAMPLES.readme.path}</span>
              <span className="font-mono text-[10.5px] text-ink-faint">{formatBytes(FILE_SAMPLES.readme.size)}</span>
            </div>
            {/* the previewer pane scrolls, like the file preview in the Space dashboard */}
            <div tabIndex={0} role="region" aria-label={`${FILE_SAMPLES.readme.path} preview`} className="scroll-thin max-h-[420px] overflow-y-auto">
              <MarkdownProse source={FILE_SAMPLES.readme.content} size="preview" headingBase={3} className="px-4 py-4" />
            </div>
          </div>
        </Cell>
        <Cell label="Variant · markdown preview (chat replies, compact)">
          <div className="space-y-3">
            <div className="rounded-[14px] border border-hair bg-s2 px-4 py-3.5">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Claude Code · claude-opus</p>
              <MarkdownProse source={CHAT_REPLY} size="compact" headingBase={4} />
            </div>
            <div className="rounded-[14px] border border-hair bg-s2 px-4 py-3.5">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Codex · gpt-5-codex</p>
              <MarkdownProse source={CHAT_PLAN} size="compact" headingBase={4} />
            </div>
          </div>
        </Cell>
      </div>

      <div className="space-y-3">
        <Caption>Variant · local reader · state preview and state source (toggle either one)</Caption>
        <div className="grid gap-6 lg:grid-cols-2">
          <MarkdownReader name="README.md" path="~/notes/README.md" source={READER_SOURCE} meta={`${formatBytes(READER_SOURCE.length)} · markdown`} headingBase={3} maxHeight={380} />
          <MarkdownReader
            name="README.md"
            path="~/notes/README.md"
            source={READER_SOURCE}
            meta={`${formatBytes(READER_SOURCE.length)} · markdown`}
            defaultMode="source"
            headingBase={3}
            maxHeight={380}
          />
        </div>
      </div>
    </div>
  );
}
