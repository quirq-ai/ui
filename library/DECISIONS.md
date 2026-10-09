# UI decisions

Every decision about quirq UI, newest last. Each says who decided, when, and where it applies. Add a line when a decision is made; when one is replaced, mark it replaced and link the one that replaces it, so the history stays readable.

## Decided

### D1. Build new UI with shadcn

suraj, 2026-10-05: "always use shadcn components when building new ui and only use other if mentioned". Applies to every new quirq UI. Another component library only when suraj names it.

### D2. Copy shadcn components from its source

The shadcn registry (ui.shadcn.com) is blocked from our cloud sessions, so `shadcn add` fails there. Copy each component from a clone of [shadcn-ui/ui](https://github.com/shadcn-ui/ui) (`apps/v4/registry/new-york-v4/ui/<component>.tsx`), change `from "cn"` to the repository's own helper, and keep shadcn's MIT license beside the copies with the commit they came from. Used in monitoring (`components/ui/`) and the website (`src/components/ui/`, see [website](website/README.md#shared-controls)).

### D3. Check every UI change in light and dark, at 1280 and 390 wide

suraj reads on his phone, so the 390 wide screenshots matter most. Every UI pull request carries screenshots at both widths in both themes. Popups never scroll: content that needs scrolling belongs on a page (innernet and monitoring rules).

### D4. Phone first

What needs attention comes first on a small screen, tap targets are at least 44 px tall, and nothing scrolls sideways. From the monitoring rules, which apply to any dashboard-like page.

### D5. Org conventions

Public repositories, Apache-2.0, squash merges. Pull requests from agents are authored by quirq-gates. Product pull requests need one human approval.

### D6. Writing

Sentence case and plain words. No em or en dashes (`pnpm check` enforces it in this repository). The name is always lowercase: **quirq**.

### D7. Monitoring looks like Vercel

suraj, 2026-10-07: "sleek, professional, modern Vercel-type UI". Near-monochrome surfaces, hairline dividers, color only for the six states, Geist Sans and Geist Mono. Tokens and contrast limits are in [monitoring AGENTS.md](https://github.com/quirq-ai/monitoring/blob/main/AGENTS.md#brand-and-themes).

### D8. The website keeps its desktop character

The website is a desktop: a plain background with the organization's GitHub README written on it, glass icons, a floating dock, windows with expand, restore and close, light and dark themes, and screensavers. Every link opens in a window on the site (the page in an iframe), and a page that can't be framed shows **Oops** with **Open in new tab**. From [website AGENTS.md](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/AGENTS.md).

### D9. Repository type comes from the org's role property

suraj, 2026-10-09. A repository's type is the quirq-ai `role` custom property (project, agent, tool, library, docs, config), read live from GitHub, never hard-coded per repository. The website shows it as a badge and a filter (website #16). Names and meanings are in [`quirqRoles.ts`](website/source/src/lib/quirqRoles.ts).

### D10. How this library collects a repository

2026-10-09, when the library started. One folder per source repository. Only files the live pages use are collected, copied unchanged from one commit, with screenshots of every page. Inherited third-party code is listed with links instead of copied: the website's PostHog code carries PostHog's notice asking that it not be duplicated or copied ([LICENSE.posthog](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/LICENSE.posthog)). See [README.md](README.md).

## Open

These are not decided. Each needs suraj's call.

### O1. One look, or one per product?

quirq UI uses four looks today:

| Where | Look | Fonts |
| --- | --- | --- |
| This repository's starter template | black ground, ink text, seven-hue spectrum, glass cards | IBM Plex Mono, Quicksand |
| website (www.quirq.dev) | Euler's frosted glass on a light or dark desktop, the project palette for app icons | IBM Plex Sans |
| monitoring | Vercel: near-monochrome, state colors only (D7) | Geist Sans, Geist Mono |
| xo-space `quirq` theme | dark plum, pink accent | Inter, Poppins, JetBrains Mono |

A shared set of tokens, and a decision about which of these is the brand, would make D1 components look alike across repositories.

### O2. The template's own primitives

The starter template's `components/ui/` (Button, Badge, Panel, Field and the rest) are written by hand, not copied from shadcn. Under D1, new UI built from the template would use shadcn components instead, or these would be rebuilt on shadcn.
