# website

The UI of [quirq-ai/website](https://github.com/quirq-ai/website), the Home base desktop at [www.quirq.dev](https://www.quirq.dev), collected from commit [`a66ac87`](https://github.com/quirq-ai/website/commit/a66ac87a28cc269c9aa94e4e60b7679a11096c6a) (website main on 2026-10-09, with #16's type badges and filters).

The website is a Gatsby 4 and React 18 site adapted from PostHog's desktop interface, with Tailwind 3. Only the parts the live site uses are here: 12 views, and the 127 source files that following the imports from its pages and routes reaches.

- **Copied** into [`source/`](source/), unchanged: the 43 of those files that quirq wrote (components, pages, templates and catalog logic), plus the 12 READMEs in their folders. That makes 55 files.
- **Referenced** with links: the 79 files inherited from PostHog (18 of them changed by quirq), 3 vendored third-party files and 2 generated data snapshots, plus the 2 token files below. PostHog's notice grants no permission to copy its site code ([D10](../DECISIONS.md#d10-link-posthogs-code-dont-copy-it)).

[`manifest.json`](manifest.json) gives the sha256 of every copied file and the path of every referenced one. Licensing, including the screenshots, is in [LICENSING.md](LICENSING.md).

## Pages

Each view has four screenshots: 1280 wide in light and dark, then 390 wide in light and dark. Tap one to open it full size. They were taken from a local production build (`pnpm build`, `pnpm serve`) with reduced motion.

### Home base

`/`. The Home window: avatar and wordmark, the time, a greeting with three counts (Live, Apps, Repos), and a card per app with type filters (All apps, Projects, Agents and the other types), search, Open and Launch. It opens on a first visit.

Source: [`src/pages/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/pages/index.tsx), [`src/components/HomeBase/`](source/src/components/HomeBase/)

<img src="screenshots/home-1280-light.png" width="49%" alt="Home base, 1280 wide, light"> <img src="screenshots/home-1280-dark.png" width="49%" alt="Home base, 1280 wide, dark">
<img src="screenshots/home-390-light.png" width="49%" alt="Home base, 390 wide, light"> <img src="screenshots/home-390-dark.png" width="49%" alt="Home base, 390 wide, dark">

### Desktop

`/`, Home window closed. What is under the windows: the organization's GitHub profile README written on a plain background, the desktop icons (apps with a website, plus Edit), and the dock.

Source: [`src/components/Desktop/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Desktop/index.tsx), [`src/components/Desktop/Background.tsx`](source/src/components/Desktop/Background.tsx), [`src/components/QuirqProfile/`](source/src/components/QuirqProfile/), [`src/components/Dock/`](source/src/components/Dock/)

<img src="screenshots/desktop-1280-light.png" width="49%" alt="Desktop, 1280 wide, light"> <img src="screenshots/desktop-1280-dark.png" width="49%" alt="Desktop, 1280 wide, dark">
<img src="screenshots/desktop-390-light.png" width="49%" alt="Desktop, 390 wide, light"> <img src="screenshots/desktop-390-dark.png" width="49%" alt="Desktop, 390 wide, dark">

### Projects

`/projects`. Every repository the swarm is building, grouped, each on the phase ladder: Thought, Prototype, Built, Shipping, Project. Built with the shadcn Card, Badge, Tabs and Button.

Source: [`src/pages/projects.tsx`](source/src/pages/projects.tsx), [`src/components/QuirqProjects/`](source/src/components/QuirqProjects/)

<img src="screenshots/projects-1280-light.png" width="49%" alt="Projects, 1280 wide, light"> <img src="screenshots/projects-1280-dark.png" width="49%" alt="Projects, 1280 wide, dark">
<img src="screenshots/projects-390-light.png" width="49%" alt="Projects, 390 wide, light"> <img src="screenshots/projects-390-dark.png" width="49%" alt="Projects, 390 wide, dark">

### Display options

`/display-options` (Edit on the desktop). A small window of settings: color mode (system, light, dark), scrollbars, cursor, screensaver and reduce transparency, each a Radix toggle group.

Source: [`src/pages/display-options.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/pages/display-options.tsx)

<img src="screenshots/display-options-1280-light.png" width="49%" alt="Display options, 1280 wide, light"> <img src="screenshots/display-options-1280-dark.png" width="49%" alt="Display options, 1280 wide, dark">
<img src="screenshots/display-options-390-light.png" width="49%" alt="Display options, 390 wide, light"> <img src="screenshots/display-options-390-dark.png" width="49%" alt="Display options, 390 wide, dark">

### quirq infra v0

`/v0`. A custom app page for the infra-config repository: the v0 guide and its live state, in tabs (Overview, Live, The 13 repos, Guide). Built with the shadcn Card, Badge, Tabs and Button.

Source: [`src/templates/QuirqInfraV0.tsx`](source/src/templates/QuirqInfraV0.tsx), [`src/components/QuirqInfraV0/`](source/src/components/QuirqInfraV0/)

<img src="screenshots/v0-1280-light.png" width="49%" alt="quirq infra v0, 1280 wide, light"> <img src="screenshots/v0-1280-dark.png" width="49%" alt="quirq infra v0, 1280 wide, dark">
<img src="screenshots/v0-390-light.png" width="49%" alt="quirq infra v0, 390 wide, light"> <img src="screenshots/v0-390-dark.png" width="49%" alt="quirq infra v0, 390 wide, dark">

### Repository window with its own path

`/xo-space`. The default repository window at a mapped path: header with icon, name, type badge, language, stars and View code, then the repository's Markdown docs in a file tree, formatted like GitHub.

Source: [`src/templates/quirq-app.tsx`](source/src/templates/quirq-app.tsx), [`src/components/QuirqApp/`](source/src/components/QuirqApp/)

<img src="screenshots/app-xo-space-1280-light.png" width="49%" alt="Repository window with its own path, 1280 wide, light"> <img src="screenshots/app-xo-space-1280-dark.png" width="49%" alt="Repository window with its own path, 1280 wide, dark">
<img src="screenshots/app-xo-space-390-light.png" width="49%" alt="Repository window with its own path, 390 wide, light"> <img src="screenshots/app-xo-space-390-dark.png" width="49%" alt="Repository window with its own path, 390 wide, dark">

### Repository window

`/apps/<repository>` (here gate). The same window for every other repository. `quirq-live-app.tsx` serves repositories created after the build.

Source: [`src/templates/quirq-app.tsx`](source/src/templates/quirq-app.tsx), [`src/templates/quirq-live-app.tsx`](source/src/templates/quirq-live-app.tsx), [`src/components/QuirqApp/`](source/src/components/QuirqApp/)

<img src="screenshots/app-default-1280-light.png" width="49%" alt="Repository window, 1280 wide, light"> <img src="screenshots/app-default-1280-dark.png" width="49%" alt="Repository window, 1280 wide, dark">
<img src="screenshots/app-default-390-light.png" width="49%" alt="Repository window, 390 wide, light"> <img src="screenshots/app-default-390-dark.png" width="49%" alt="Repository window, 390 wide, dark">

### Web page in a window, "can't be reached"

`/launch/<repository>` (here innernet). An app's website in a window. Before framing, the window asks `/api/frame-check`. These screenshots show "Oops, it didn't load" with "can't be reached right now", because the check could not reach innernet.quirq.dev from where they were taken. A site that refuses frames, as innernet does in production, shows "Oops, it's incompatible" instead, with the same Open in new tab and Try again buttons. A page that loads in its window (docs.quirq.dev, say) has no screenshot yet, for the same reason.

Source: [`src/templates/quirq-launch.tsx`](source/src/templates/quirq-launch.tsx), [`src/lib/frameCheck.ts`](source/src/lib/frameCheck.ts), [`src/api/frame-check.ts`](source/src/api/frame-check.ts), [`src/lib/externalLinks.ts`](source/src/lib/externalLinks.ts)

<img src="screenshots/launch-oops-1280-light.png" width="49%" alt="Web page in a window, 'can't be reached', 1280 wide, light"> <img src="screenshots/launch-oops-1280-dark.png" width="49%" alt="Web page in a window, 'can't be reached', 1280 wide, dark">
<img src="screenshots/launch-oops-390-light.png" width="49%" alt="Web page in a window, 'can't be reached', 390 wide, light"> <img src="screenshots/launch-oops-390-dark.png" width="49%" alt="Web page in a window, 'can't be reached', 390 wide, dark">

### Not found

Any unknown path. "This app isn't here", in a window, with Back to home base. At 390 wide the text has no inset from the window edge. **A website bug, don't copy it.**

Source: [`src/pages/404.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/pages/404.js)

<img src="screenshots/not-found-1280-light.png" width="49%" alt="Not found, 1280 wide, light"> <img src="screenshots/not-found-1280-dark.png" width="49%" alt="Not found, 1280 wide, dark">
<img src="screenshots/not-found-390-light.png" width="49%" alt="Not found, 390 wide, light"> <img src="screenshots/not-found-390-dark.png" width="49%" alt="Not found, 390 wide, dark">

### Search

`/` or Cmd/Ctrl+K anywhere. Local search over the live catalog: every app plus Home base, Projects and Edit, with keyboard navigation.

Source: [`src/components/QuirqSearch/`](source/src/components/QuirqSearch/)

<img src="screenshots/search-1280-light.png" width="49%" alt="Search, 1280 wide, light"> <img src="screenshots/search-1280-dark.png" width="49%" alt="Search, 1280 wide, dark">
<img src="screenshots/search-390-light.png" width="49%" alt="Search, 390 wide, light"> <img src="screenshots/search-390-dark.png" width="49%" alt="Search, 390 wide, dark">

### quirqy

The dock's quirqy item, or Personalize. The window that edits your Blobatar avatar: name, shape, color, expression, Randomize, Reset and Save. At 390 wide it is squeezed beside the Home window, which clips both. **A website bug, don't copy it.**

Source: [`src/components/Quirqy/`](source/src/components/Quirqy/), [`src/components/QuirqAvatar/`](source/src/components/QuirqAvatar/), [`src/lib/quirqAvatar.ts`](source/src/lib/quirqAvatar.ts)

<img src="screenshots/quirqy-1280-light.png" width="49%" alt="quirqy, 1280 wide, light"> <img src="screenshots/quirqy-1280-dark.png" width="49%" alt="quirqy, 1280 wide, dark">
<img src="screenshots/quirqy-390-light.png" width="49%" alt="quirqy, 390 wide, light"> <img src="screenshots/quirqy-390-dark.png" width="49%" alt="quirqy, 390 wide, dark">

### Open windows

The dock's open windows item (here over Projects). A side panel listing the open windows, with Close all and a link to share the current set of windows.

Source: [`src/components/ActiveWindowsPanel/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/ActiveWindowsPanel/index.tsx)

<img src="screenshots/open-windows-1280-light.png" width="49%" alt="Open windows, 1280 wide, light"> <img src="screenshots/open-windows-1280-dark.png" width="49%" alt="Open windows, 1280 wide, dark">
<img src="screenshots/open-windows-390-light.png" width="49%" alt="Open windows, 390 wide, light"> <img src="screenshots/open-windows-390-dark.png" width="49%" alt="Open windows, 390 wide, dark">

## Tokens

The website's colors live in three files, all inherited from PostHog and changed by quirq:

- [`src/styles/global.css`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/styles/global.css) defines the light and dark CSS variables (`--bg`, `--border`, `--input-border` and the rest).
- [`tailwind.config.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/tailwind.config.js) maps them to Tailwind classes such as `bg-primary`, `text-secondary` and `border-primary`.
- [`static/scripts/theme-init.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/static/scripts/theme-init.js) picks light, dark or system before the page paints.

The app icon colors (`blue`, `purple`, `lilac`, `orange` and the rest) are listed in [QuirqAppIcon's README](source/src/components/QuirqAppIcon/README.md). [O1](../DECISIONS.md#o1-one-look-or-one-per-product) compares this look with quirq's others.

## Components

### quirq components (copied)

| Component | What it does |
| --- | --- |
| [`HomeBase`](source/src/components/HomeBase/) | The Home window. README in the folder. |
| [`Dock`](source/src/components/Dock/) | Euler's floating glass dock: Home, Projects, quirqy, search and open windows, with front and open indicators. |
| [`Desktop background`](source/src/components/Desktop/Background.tsx) | The plain background that holds the profile README. |
| [`QuirqProfile`](source/src/components/QuirqProfile/) | The organization's GitHub profile README, read live and written on the desktop. |
| [`QuirqApp`](source/src/components/QuirqApp/) | Repository windows: header, docs tabs, the docs file tree (`DocsTree`), GitHub-style Markdown (`MarkdownDoc`), and the type badge. |
| [`QuirqAppIcon`](source/src/components/QuirqAppIcon/) | An app icon: a glyph and color from `quirq.apps.json` on the glass icon (`QuirqAppTile` for the frosted tile). |
| [`QuirqAvatar`](source/src/components/QuirqAvatar/) | The Blobatar avatar, its tile, and the avatar editor. |
| [`Quirqy`](source/src/components/Quirqy/) | The quirqy window and `useOpenQuirqy()`. |
| [`QuirqSearch`](source/src/components/QuirqSearch/) | The search overlay (Radix Dialog with a Headless UI Combobox). |
| [`QuirqProjects`](source/src/components/QuirqProjects/) | The Projects page and its phase ladder. |
| [`QuirqInfraV0`](source/src/components/QuirqInfraV0/) | The v0 guide and live view. |
| [`QuirqBrand`](source/src/components/QuirqBrand/) | `QuirqMark` and `QuirqWordmark` as inline SVG. The marks are all rights reserved. |

### Shared controls

| Component | What it does |
| --- | --- |
| [`ui`](source/src/components/ui/) | `Button` and `ButtonLink`, `Card`, `Badge` (with `good`, `warn`, `bad`, `muted` status dots) and `Tabs`: rewrites of shadcn components, restyled with the site's tokens. This is the part of the website closest to [D1](../DECISIONS.md#d1-build-new-ui-with-shadcn), but for new UI copy from shadcn itself ([D2](../DECISIONS.md#d2-copy-shadcn-components-from-its-source)). |

### Logic behind the UI (copied)

| Component | What it does |
| --- | --- |
| [`quirqApps`](source/src/lib/quirqApps.ts) | The catalog: each app's name, icon, color, path and launch target. |
| [`quirqLiveApps`](source/src/lib/quirqLiveApps.ts) | `useQuirqApps()` and `useQuirqCatalog()`: the catalog as GitHub has it now, refreshed every 5 minutes. |
| [`quirqRoles`](source/src/lib/quirqRoles.ts) | Repository types (the org `role` property): label, plural and meaning. |
| [`quirqProjects`](source/src/lib/quirqProjects.ts) | Project groups and phases for `/projects`. |
| [`quirqDocs`](source/src/lib/quirqDocs.ts) | Which Markdown files a repository window shows. |
| [`quirqAvatar`](source/src/lib/quirqAvatar.ts) | The saved avatar. |
| [`externalLinks`](source/src/lib/externalLinks.ts) | Opens every outside link in a window (`/launch/web/...`). |
| [`quirqReadmeLinks`](source/src/lib/quirqReadmeLinks.ts) | Where a link in the profile README opens. |
| [`frameCheck`](source/src/lib/frameCheck.ts) | Whether a page may be framed: headers, shared hosts, https. |
| [`frame-check`](source/src/api/frame-check.ts) | The site's only server code, the API behind the frame check. |
| [`quirq-catalog`](source/scripts/lib/quirq-catalog.mjs) | Catalog validation and mapping, shared by the build and the browser. |
| [`quirq-phases`](source/scripts/lib/quirq-phases.mjs) | The phase rules. |
| [`quirq.apps.json`](source/quirq.apps.json) | Per-app choices: name, icon, color, category, path, launch URL. |
| [`quirq.projects.json`](source/quirq.projects.json) | Project groups and phase overrides. |

### Inherited from PostHog (referenced)

**Reference only. Don't copy these into another repository. Build new UI with shadcn ([D1](../DECISIONS.md#d1-build-new-ui-with-shadcn)).** PostHog's notice grants no permission to copy them ([D10](../DECISIONS.md#d10-link-posthogs-code-dont-copy-it)).

| Component | What it does |
| --- | --- |
| [`AppWindow`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/AppWindow/index.tsx) | Window chrome and behavior: expand, restore, minimize, close. Changed by quirq. |
| [`App context`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/context/App.tsx) | Window state, theme and site settings. Changed by quirq. |
| [`Desktop`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Desktop/index.tsx) | The desktop and its icon grid. Changed by quirq. |
| [`Explorer`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Explorer/index.tsx) | The window content frame most pages use. Changed by quirq. |
| [`ActiveWindowsPanel`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/ActiveWindowsPanel/index.tsx) | The open windows panel behind the dock. Changed by quirq. |
| [`Screensaver`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Screensaver/index.tsx) | Screensavers (no screenshot). Changed by quirq. |
| [`Wrapper`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Wrapper/index.tsx) | Mounts the desktop, dock, windows and search. Changed by quirq. |
| [`global.css`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/styles/global.css) | Theme colors, glass and window styles (see [Tokens](#tokens)). Changed by quirq. |
| [`OSIcons`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/) | `GlassIcon`, the frosted icon treatment `QuirqAppIcon` builds on. |
| [`OSButton`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSButton/index.tsx) | The site's button. |
| [`OSChrome`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSChrome/HeaderBar.tsx) | Window header and address bar. |
| [`OSFieldset`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSFieldset/index.tsx) | Fieldsets on Display options. |
| [`RadixUI`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/) | Wrappers around Radix: menus, context menu (no screenshot), popover, select, toggle group, tooltip, toast, scroll area, modal, accordion. |

## Every referenced file

<details><summary>From PostHog, changed by quirq (18)</summary>

- [`gatsby-browser.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/gatsby-browser.tsx)
- [`gatsby-ssr.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/gatsby-ssr.js)
- [`src/components/ActiveWindowsPanel/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/ActiveWindowsPanel/index.tsx)
- [`src/components/AppWindow/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/AppWindow/index.tsx)
- [`src/components/Desktop/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Desktop/index.tsx)
- [`src/components/Explorer/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Explorer/index.tsx)
- [`src/components/Link/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Link/index.tsx)
- [`src/components/OSIcons/AppIcon.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/AppIcon.tsx)
- [`src/components/RadixUI/ContextMenu.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/ContextMenu.tsx)
- [`src/components/Screensaver/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Screensaver/index.tsx)
- [`src/components/Wrapper/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Wrapper/index.tsx)
- [`src/components/seo.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/seo.tsx)
- [`src/context/App.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/context/App.tsx)
- [`src/hooks/usePostHog.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/hooks/usePostHog.ts)
- [`src/pages/404.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/pages/404.js)
- [`src/pages/display-options.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/pages/display-options.tsx)
- [`src/pages/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/pages/index.tsx)
- [`src/styles/global.css`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/styles/global.css)

</details>

<details><summary>From PostHog, unchanged (61)</summary>

- [`kea.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/kea.js)
- [`src/components/AppContainer/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/AppContainer/index.tsx)
- [`src/components/BookmarkButton/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/BookmarkButton/index.tsx)
- [`src/components/CallToAction/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/CallToAction/index.tsx)
- [`src/components/CodeBlock/theme.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/CodeBlock/theme.ts)
- [`src/components/DebugContainerQuery/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/DebugContainerQuery/index.tsx)
- [`src/components/Desktop/DesktopIcon.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Desktop/DesktopIcon.tsx)
- [`src/components/Editor/SearchBar.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Editor/SearchBar.tsx)
- [`src/components/Editor/SearchProvider.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Editor/SearchProvider.tsx)
- [`src/components/FloatingModal/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/FloatingModal/index.tsx)
- [`src/components/GlossaryElement/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/GlossaryElement/index.tsx)
- [`src/components/Icons/Icons.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Icons/Icons.tsx)
- [`src/components/Icons/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Icons/index.tsx)
- [`src/components/KeyboardShortcut/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/KeyboardShortcut/index.tsx)
- [`src/components/Loading/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Loading/index.tsx)
- [`src/components/NotProductIcons/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/NotProductIcons/index.tsx)
- [`src/components/OSButton/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSButton/index.tsx)
- [`src/components/OSChrome/AddressBar.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSChrome/AddressBar.tsx)
- [`src/components/OSChrome/HeaderBar.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSChrome/HeaderBar.tsx)
- [`src/components/OSFieldset/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSFieldset/index.tsx)
- [`src/components/OSIcons/DemoIcon.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/DemoIcon.tsx)
- [`src/components/OSIcons/GlassIcon.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/GlassIcon.tsx)
- [`src/components/OSIcons/Icons.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/Icons.tsx)
- [`src/components/OSIcons/PricingIcon.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/PricingIcon.tsx)
- [`src/components/OSIcons/glyphs.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/glyphs.ts)
- [`src/components/OSIcons/index.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/OSIcons/index.ts)
- [`src/components/PostLayout/types.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/PostLayout/types.ts)
- [`src/components/RadixUI/Accordion.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/Accordion.tsx)
- [`src/components/RadixUI/FileMenu.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/FileMenu.tsx)
- [`src/components/RadixUI/MenuBar.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/MenuBar.tsx)
- [`src/components/RadixUI/Modal.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/Modal.tsx)
- [`src/components/RadixUI/Popover.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/Popover.tsx)
- [`src/components/RadixUI/ScrollArea.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/ScrollArea.tsx)
- [`src/components/RadixUI/Select.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/Select.tsx)
- [`src/components/RadixUI/Toast.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/Toast.tsx)
- [`src/components/RadixUI/ToggleGroup.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/ToggleGroup.tsx)
- [`src/components/RadixUI/Tooltip.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/Tooltip.tsx)
- [`src/components/RadixUI/css/toast.css`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/RadixUI/css/toast.css)
- [`src/components/SidePanel/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/SidePanel/index.tsx)
- [`src/components/Toast/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Toast/index.tsx)
- [`src/components/Tooltip/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/Tooltip/index.tsx)
- [`src/components/WindowTabs/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/WindowTabs/index.tsx)
- [`src/components/ZoomHover/index.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/components/ZoomHover/index.tsx)
- [`src/constants/frostedSurfaces.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/constants/frostedSurfaces.ts)
- [`src/constants/index.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/constants/index.ts)
- [`src/context/Toast.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/context/Toast.tsx)
- [`src/context/Window.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/context/Window.tsx)
- [`src/hooks/useHorizontalScrollFade.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/hooks/useHorizontalScrollFade.tsx)
- [`src/hooks/useInactivityDetection.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/hooks/useInactivityDetection.ts)
- [`src/hooks/useUser.tsx`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/hooks/useUser.tsx)
- [`src/hooks/useWindowLayoutAttributes.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/hooks/useWindowLayoutAttributes.ts)
- [`src/lib/exportToPdf.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/lib/exportToPdf.ts)
- [`src/lib/shopify.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/lib/shopify.ts)
- [`src/lib/strapi.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/lib/strapi.ts)
- [`src/lib/utils.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/lib/utils.ts)
- [`src/navs/activeMenu.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/navs/activeMenu.ts)
- [`src/templates/merch/store.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/templates/merch/store.ts)
- [`src/templates/merch/types.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/templates/merch/types.ts)
- [`src/types.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/types.ts)
- [`src/types/posthog.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/types/posthog.ts)
- [`src/utils.ts`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/utils.ts)

</details>

<details><summary>Tokens, from PostHog, changed by quirq (outside the import walk) (2)</summary>

- [`tailwind.config.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/tailwind.config.js)
- [`static/scripts/theme-init.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/static/scripts/theme-init.js)

</details>

<details><summary>Vendored third-party code (Blobatar, MIT; @pierre/trees, Apache-2.0) (3)</summary>

- [`src/vendor/blobatar/expression.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/vendor/blobatar/expression.js)
- [`src/vendor/blobatar/index.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/vendor/blobatar/index.js)
- [`src/vendor/pierre-trees/react.js`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/vendor/pierre-trees/react.js)

</details>

<details><summary>Generated snapshots (`pnpm apps:sync`, `pnpm projects:sync`) (2)</summary>

- [`src/data/quirq-projects.json`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/data/quirq-projects.json)
- [`src/data/quirq-repositories.json`](https://github.com/quirq-ai/website/blob/a66ac87a28cc269c9aa94e4e60b7679a11096c6a/src/data/quirq-repositories.json)

</details>

## Not yet shown

Some states have no screenshot yet:

- a page that loads in its window;
- the "incompatible" Oops;
- the screensaver;
- the desktop's context menu.

The first two need a network that reaches quirq.dev. Add them on the next refresh.

## Refresh

1. Pick the website commit and check it out.
2. Follow the imports from `gatsby-browser.tsx`, `gatsby-ssr.js`, the four pages, the four templates, `src/api/frame-check.ts` and `src/styles/global.css`.
3. Copy the files that are not in PostHog's tree at `4c27ff7` (the commit the website started from), except `src/vendor/` and `src/data/`. Also copy the READMEs in their folders.
4. Rebuild the manifest. Take the 48 screenshots again, from `pnpm build` and `pnpm serve`.
