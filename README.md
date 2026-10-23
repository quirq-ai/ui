# Quirq UI registry

A shadcn registry (plus docs site) for every Astryx component, block template and page template, built with Next.js.

| Kind | Items | Registry name | Installs to |
|------|-------|---------------|-------------|
| Components | 166 | `<kebab-name>` e.g. `date-input` | `components/ui/<name>.tsx` |
| Blocks | 659 | `block-<kebab-id>` e.g. `block-alert-dialog-delete-confirmation` | `components/<BlockId>.tsx` |
| Page templates | 55 | `template-<id>` e.g. `template-dashboard` | `app/<id>/page.tsx` |

`button`, `metric-strip`, `astryx-base` and `astryx-nextjs` are hand-written; everything else is generated.

```bash
bun install
bun run dev                 # docs site on http://localhost:3000 (builds public/r first)
bun run build               # registry JSON + production build
bun run registry:generate   # regenerate items from the installed @astryxdesign/* packages
bun run registry:build      # sync URLs from homepage, then registry.json -> public/r/*.json (runs before dev/build)
```

Re-run `registry:generate` after bumping `@astryxdesign/core` or `@astryxdesign/cli` (they are pinned to an
exact version so the generated sources match the installed packages). Generated sources live in
`registry/astryx/<name>/`, `registry/astryx/blocks/` and `registry/astryx/templates/`; the docs catalog is
`src/registry/catalog.generated.ts` and the preview loaders are `src/registry/previews.generated.ts`. Don't
hand-edit generated files — add the item name to `HAND_WRITTEN` in `scripts/generate-registry.mjs` first.

## Layout

```
registry.json                 shadcn registry definition (homepage = the origin items install from)
registry/astryx/              registry item sources (components, blocks/, templates/, nextjs-setup/)
scripts/generate-registry.mjs regenerates registry.json + sources + docs catalog
src/app/docs/                 docs routes: /docs, /docs/installation, /docs/[kind], /docs/[kind]/[name]
src/app/preview/[name]/       standalone render of one block or template (iframed by the docs)
src/docs/                     docs UI (client components built with Astryx)
src/registry/                 catalog + source helpers (server) and generated data
public/r/                     built registry JSON (generated, git-ignored)
```

## Notes

- Every docs page is prerendered with `generateStaticParams` (Cache Components is on). Source code shown on item
  pages is read from disk at build time through a `"use cache"` function.
- Astryx is consumed precompiled (`dist` + `astryx.css`), so no StyleX build step is needed for the components.
  About 26 blocks/templates call `stylex.create()` themselves; `next.config.ts` runs Babel + the StyleX plugin
  (runtime injection) on just those files via a scoped Turbopack rule.
- `app/globals.css` uses the same Astryx + Tailwind v4 layer order that the `astryx-nextjs` item installs.
- `AstryxProviders` wraps the app in the Theme and routes every Astryx link through `next/link`.
- **Registry URL — one place:** `homepage` in `registry.json`. Change it and run `bun run registry:build` (it also
  runs before `dev`/`build`): every item's dependency on another item in this registry is rewritten to
  `<homepage>/r/<name>.json`, `public/r` is rebuilt, and the docs' install commands follow. Deploy the site at
  that URL so `/r/*.json` is served there.
- `.mcp.json` wires up `next-devtools-mcp`, which talks to the dev server's `/_next/mcp` endpoint (errors, routes,
  per-route compilation).
