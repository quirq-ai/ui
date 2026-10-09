# UI decisions

The UI decisions this library has collected so far, oldest first. Each one gives its source, as a quote, a file and line, or a pull request. It names suraj only where a quote or a record shows he made the call. Add an entry when a decision is made. When a decision is replaced, mark it replaced and link the entry that replaces it, so the history stays readable.

## Decided

### D1. Build new UI with shadcn

suraj, 2026-10-05: "always use shadcn components when building new ui and only use other if mentioned". This applies to every new quirq UI, and is recorded in the quirq project's instructions. Another component library is used only when suraj names it.

### D2. Copy shadcn components from its source

Source: [monitoring AGENTS.md:87-100](https://github.com/quirq-ai/monitoring/blob/95a70c8/AGENTS.md#L87-L100).

The shadcn registry (ui.shadcn.com) is blocked from cloud sessions, so `shadcn add` fails there. Instead:

- copy each component from a clone of [shadcn-ui/ui](https://github.com/shadcn-ui/ui) (`apps/v4/registry/new-york-v4/ui/<component>.tsx`);
- point `from "cn"` at the repository's own helper;
- keep shadcn's MIT license beside the copies, naming the commit they came from.

Monitoring follows this in `components/ui/`. The website's `src/components/ui/` does not. Its four files are rewrites: `card.tsx` and `tabs.tsx` use forwardRef, and `badge.tsx` and `button.tsx` are plain functions with a class map instead of class-variance-authority. Only `button.tsx` names its shadcn commit, and there is no license file beside them. See [website](website/README.md#shared-controls).

### D3. Screenshots in light and dark at both widths, and popups that never scroll

Source: [innernet AGENTS.md:11](https://github.com/quirq-ai/innernet/blob/7afd503/AGENTS.md#L11) (popups never scroll) and [monitoring AGENTS.md:378](https://github.com/quirq-ai/monitoring/blob/95a70c8/AGENTS.md#L378) (no popup that scrolls), and [monitoring AGENTS.md:505-508](https://github.com/quirq-ai/monitoring/blob/95a70c8/AGENTS.md#L505-L508) (screenshots).

In innernet and monitoring, content that needs scrolling belongs on a page, not in a popup. In monitoring, every UI change carries phone and desktop screenshots in light and dark. This library takes its own screenshots the same way. Whether both rules apply to every quirq UI is open: see [O4](#o4-phone-first-everywhere).

### D4. Phone first, on monitoring

Source: [monitoring AGENTS.md:395](https://github.com/quirq-ai/monitoring/blob/95a70c8/AGENTS.md#L395) and [:406](https://github.com/quirq-ai/monitoring/blob/95a70c8/AGENTS.md#L406).

What needs attention comes first on a small screen, and tap targets are at least 44 px tall. This is monitoring's rule. Whether it applies to every quirq UI is open: see [O4](#o4-phone-first-everywhere).

### D5. Org conventions

Source: the quirq project's recorded decisions, and [website AGENTS.md:86](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/AGENTS.md#L86) for approvals.

- Repositories are public, licensed Apache-2.0, and merged by squash.
- Pull requests from agents are authored by quirq-gates.
- Product pull requests need one human approval (quirq-ai/gate#29).

### D6. Writing

Source: [ui README.md:61-62](https://github.com/quirq-ai/ui/blob/47b2f0ea90c852985acc53ffd847e0df215afe14/README.md#L61-L62), the starter template.

- Use sentence case and plain words.
- Use no em or en dashes. `pnpm check` enforces this in this repository.
- quirq is always lowercase.

### D7. Monitoring looks like Vercel

suraj, 2026-10-07: "sleek, professional, modern Vercel-type UI". Source: [monitoring AGENTS.md:414-415](https://github.com/quirq-ai/monitoring/blob/95a70c8/AGENTS.md#L414-L415).

Monitoring uses near-monochrome surfaces and hairline dividers, with color only for the six states, in Geist Sans and Geist Mono. The tokens and contrast limits are in the same file under "Brand and themes".

### D8. The website keeps its desktop character

Source: [website AGENTS.md:7-9](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/AGENTS.md#L7-L9), [:29](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/AGENTS.md#L29) (the dock) and [:50](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/AGENTS.md#L50).

The website is a desktop:

- a plain background with the organization's GitHub README written on it;
- glass icons and a floating dock;
- windows with expand, restore, minimize and close;
- light and dark themes, and screensavers.

Every link opens in a window on the site, with the page in an iframe. A page that can't be shown in a window shows **Oops** with **Open in new tab**.

### D9. Repository type comes from the org's role property

suraj, 2026-10-09 22:09 UTC: "I want to add the repo type and its affects on the website ui". The rule as built is in [website #16](https://github.com/quirq-ai/website/pull/16), in [website AGENTS.md:41](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/AGENTS.md#L41) and in [docs/quirq-app-mapping.md:69](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/docs/quirq-app-mapping.md#L69).

- A repository's type (project, agent, tool, library, docs or config) is read live from GitHub, never hard-coded per repository.
- The website shows it as a badge and as a filter.
- Names and meanings are in [`quirqRoles.ts`](website/source/src/lib/quirqRoles.ts).

### D10. Link PostHog's code, don't copy it

suraj, 2026-10-09 22:32 UTC, on a decision card in the UI library thread: "Reference inherited". The website files inherited from PostHog are listed with links to the website, not copied. PostHog's notice on its site code grants no permission to copy ([website LICENSE.posthog](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/LICENSE.posthog), lines 5 to 7).

### D11. How this library collects a repository

Source: [quirq-ai/ui #1](https://github.com/quirq-ai/ui/pull/1), which started the library.

- Each source repository gets one folder.
- Only files the live pages use are collected, copied unchanged from one commit.
- Every page gets screenshots.

See [README.md](README.md).

## Open

These are not decided. Each one needs suraj's call. The default stated is what the library does until he decides.

### O1. One look, or one per product?

quirq UI uses four looks today:

| Where | Look | Fonts |
| --- | --- | --- |
| This repository's starter template | black ground, ink text, seven-hue spectrum, glass cards | IBM Plex Mono, Quicksand |
| website (www.quirq.dev) | Euler's frosted glass on a light or dark desktop, with the project palette for app icons | IBM Plex Sans |
| monitoring | Vercel: near-monochrome, with color only for states (D7) | Geist Sans, Geist Mono |
| xo-space `quirq` theme | dark plum, pink accent | Inter, Poppins, JetBrains Mono |

Two things would make D1's components look alike across repositories: a shared set of tokens, and a decision about which of these looks is the brand.

### O2. The template's own primitives

The starter template's `components/ui/` (Button, Badge, Panel, Field and the rest) are written by hand, not copied from shadcn. Under D1, new UI built from the template would either use shadcn components instead, or these primitives would be rebuilt on shadcn.

### O3. Vendored code, and screenshots of PostHog's design

D10 settles PostHog's code. Two things are left:

- **Vendored code.** The website vendors Blobatar (MIT) and @pierre/trees (Apache-2.0). Both licenses would allow a copy with its notice. Default: linked, not copied.
- **Screenshots.** The screenshots show PostHog's window chrome and icons, and PostHog's notice asks that its design not be duplicated. Default: they stay in this PR as reference, marked as outside the Apache-2.0 license (see [website/LICENSING.md](website/LICENSING.md#screenshots)). The alternative is to drop them, or keep only the screens that are quirq's own.

### O4. Phone first everywhere?

D4 is monitoring's rule, and D3 is innernet's and monitoring's. suraj reads on his phone, so it may be the right default for every quirq UI. Default: each rule applies where it is written.
