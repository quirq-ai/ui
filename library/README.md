# quirq UI library

A collection of the pages and components quirq has built, and the decisions behind them, so the next UI can reuse what exists and look like the rest.

Each source repository gets one folder. A folder is a snapshot from one commit of that repository, never edited here. To change a component, change it in its own repository, then refresh the snapshot.

```text
library/
  README.md              this file
  DECISIONS.md           every UI decision made so far, with who made it and when
  <repository>/
    README.md            the catalogue: each page with screenshots, each component with what it does
    manifest.json        the source commit, every copied file with its sha256, and the files only referenced
    source/              copied files, at the same paths as in the source repository
    screenshots/         <view>-<width>-<theme>.png, at 1280 and 390 wide, light and dark
```

## Sources

| Folder | Repository | Commit | What it holds |
| --- | --- | --- | --- |
| [website](website/README.md) | [quirq-ai/website](https://github.com/quirq-ai/website) | [`a66ac87`](https://github.com/quirq-ai/website/commit/a66ac87a28cc269c9aa94e4e60b7679a11096c6a) | Home base desktop at www.quirq.dev: 11 views, 55 copied files, 79 PostHog files referenced |

## Rules for adding a source

1. Copy only what the live pages use. Follow the imports from each page or route entry. A repository's unused or inherited leftovers stay out.
2. Copy files unchanged and keep their paths. Record the commit and each file's sha256 in `manifest.json`.
3. Code the repository inherited under someone else's terms (the website's PostHog code, vendored packages) is listed with a link to the file, not copied. See [DECISIONS.md](DECISIONS.md#d10-how-this-library-collects-a-repository).
4. Take screenshots of every page at 1280 and 390 wide, in light and dark.
5. In the catalogue, write one line on what each component does and link its README in the source.
6. Add any new decision to [DECISIONS.md](DECISIONS.md).

The copied sources are reference material. They are not compiled by this repository's app: `tsconfig.json`, ESLint and the dash check skip `library/*/source/`.
