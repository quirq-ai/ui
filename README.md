# quirq template

A stripped-down Next.js starter for new quirq repos. The quirq design tokens, brand marks and UI primitives are already wired; the rest is yours.

The full shape catalog this was cut from lives on the [`xo-quirq`](https://github.com/quirq-ai/ui/tree/xo-quirq) branch.

## Start a new project

```sh
git clone https://github.com/quirq-ai/ui.git my-project
cd my-project
rm -rf .git && git init
pnpm install
pnpm dev          # http://localhost:4310
```

Then:

1. Rename it in `lib/site.ts` (name, title, description, links) and `package.json`.
2. Replace `app/(site)/page.tsx` with your first page.
3. Delete anything in `components/ui/` you don't need.

Requires Node 20.9 or newer and pnpm.

## What's included

```text
app/
  layout.tsx           fonts (IBM Plex Mono, Quicksand), metadata from lib/site.ts, film grain
  globals.css          quirq tokens, Tailwind v4 theme, brand utilities
  (site)/              site nav and footer around the starter page
components/
  brand/mark.tsx       Mark, Wordmark, Lockup, Eyebrow
  ui/                  Button, IconButton, Badge, StatusDot, StatusPill, StateChip, Panel,
                       Field, Input, Select, Switch, Checkbox, Segmented, TabChips, Tooltip,
                       Kbd, Avatar, CopyButton, Spinner, Skeleton, ProgressBar, RuntimeLogo
  site/                SiteNav, SiteFooter
lib/
  site.ts              project name, copy and links
  cn.ts                class name helper
  format.ts            number, date and duration formatters (fixed en-US locale, UTC)
public/                favicon, quirq brand SVGs, runtime and integration logos
scripts/
  check-dashes.mjs     fails on em or en dashes
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server on port 4310. |
| `pnpm build` | Production build. |
| `pnpm start` | Serves the production build on port 4310. |
| `pnpm typecheck` | TypeScript, no emit. |
| `pnpm lint` | ESLint with the Next.js core web vitals and TypeScript rules. |
| `pnpm check` | Fails if any file uses an em or en dash. |

## Brand and writing rules

- **Look:** black ground, ink text, the seven-hue spectrum in small doses, white pill call to action, glass cards for featured surfaces. Tokens are in `app/globals.css` (`text-ink-dim`, `border-hair-soft`, `bg-s2`, `font-mono`, `.eyebrow`, `.glass`, `.spec-text`).
- **Words:** XO is the product. A space is the work environment. quirq is the unit-of-work metric, always lowercase.
- **Copy:** sentence case, plain words, no em or en dashes.

## Tailwind sources

`globals.css` imports Tailwind with `source(none)` and lists `app`, `components` and `lib` explicitly. Automatic detection breaks when the repo sits inside a parent repo that ignores it, and scans the `.next` cache instead. Add a folder to the `@source` list if you put components elsewhere.

## Deploy

No environment variables are needed. On Vercel, import the repo and keep the defaults.
