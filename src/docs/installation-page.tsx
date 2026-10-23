"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Code } from "@astryxdesign/core/Code";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Link } from "@astryxdesign/core/Link";
import { List, ListItem } from "@astryxdesign/core/List";
import type { OutlineItem } from "@astryxdesign/core/Outline";
import { VStack } from "@astryxdesign/core/Stack";
import { proportional, Table } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { DocDivider, DocPage, DocSection } from "./doc-page";
import { CommandBlock } from "./package-manager";
import {
  REGISTRY_NAMESPACE,
  REGISTRY_URL,
  registryItemUrl,
} from "./registry-config";

const OUTLINE: OutlineItem[] = [
  { id: "prerequisites", label: "Prerequisites", level: 2 },
  { id: "setup", label: "1. Run the setup", level: 2 },
  { id: "wrap-layout", label: "2. Wrap your layout", level: 2 },
  {
    id: "add-components",
    label: "3. Add components, blocks and pages",
    level: 2,
  },
  { id: "manual-setup", label: "Manual setup", level: 2 },
  { id: "add-registry", label: "Optional: register the namespace", level: 2 },
];

type InstallTarget = {
  kind: string;
  name: string;
  target: string;
  href: string;
} & Record<string, unknown>;

const INSTALL_TARGETS: InstallTarget[] = [
  {
    kind: "Components",
    name: "date-input",
    target: "components/ui/date-input.tsx",
    href: "/docs/components",
  },
  {
    kind: "Blocks",
    name: "block-<id>",
    target: "components/<BlockId>.tsx",
    href: "/docs/blocks",
  },
  {
    kind: "Page templates",
    name: "template-<id>",
    target: "app/<id>/page.tsx",
    href: "/docs/templates",
  },
];

const GLOBALS_CSS = `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`;

export function InstallationPage() {
  return (
    <DocPage
      title="Installation"
      description="Install Quirq UI components, blocks and page templates into your project with the shadcn CLI."
      outline={OUTLINE}
    >
      <DocSection id="prerequisites" title="Prerequisites">
        <List density="compact" listStyle="disc">
          <ListItem label="A Next.js app with Tailwind CSS v4 and React 19 or later" />
          <ListItem label="A components.json file — run shadcn init first if your project does not have one" />
          <ListItem label="Run every command from your project folder, next to package.json — elsewhere the CLI offers to create a new project instead" />
        </List>
        <CommandBlock kind="run" args="shadcn@latest init" />
      </DocSection>

      <DocDivider />

      <DocSection id="setup" title="1. Run the setup">
        <Text>
          Run this once. It installs <Code>@astryxdesign/core</Code> and the
          neutral theme, replaces <Code>app/globals.css</Code> with the Quirq UI +
          Tailwind layer order, and adds{" "}
          <Code>components/astryx-providers.tsx</Code>.
        </Text>
        <CommandBlock
          kind="run"
          args={`shadcn@latest add ${registryItemUrl("astryx-nextjs")}`}
        />
        <Banner
          status="warning"
          title="Answer yes to overwrite globals.css"
          description={`The default @import "tailwindcss" declares Tailwind's layers before Quirq UI's, which breaks component styles. The new file declares every layer first. Move any custom CSS you need into it afterwards.`}
          collapsible={false}
        />
        <CodeBlock
          title="app/globals.css"
          language="css"
          width="100%"
          code={GLOBALS_CSS}
        />
      </DocSection>

      <DocDivider />

      <DocSection id="wrap-layout" title="2. Wrap your layout">
        <Text>
          The Theme provider supplies the design tokens every component reads.
          Add it to your root layout.
        </Text>
        <CodeBlock
          title="app/layout.tsx"
          language="tsx"
          width="100%"
          hasLineNumbers
          highlightLines={[2, 8]}
          code={`import "./globals.css";
import { AstryxProviders } from "@/components/astryx-providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AstryxProviders>{children}</AstryxProviders>
      </body>
    </html>
  );
}`}
        />
      </DocSection>

      <DocDivider />

      <DocSection
        id="add-components"
        title="3. Add components, blocks and pages"
      >
        <Text>
          Pick anything under Browse in the sidebar. The source is copied into
          your project, so you own it and can edit it. Extra packages an item
          needs (for example <Code>recharts</Code> or{" "}
          <Code>@heroicons/react</Code>) install automatically.
        </Text>
        <Table
          data={INSTALL_TARGETS}
          idKey="kind"
          columns={[
            {
              key: "kind",
              header: "Kind",
              width: proportional(1),
              renderCell: (row: InstallTarget) => (
                <Link href={row.href}>{row.kind}</Link>
              ),
            },
            {
              key: "name",
              header: "Item name",
              width: proportional(2),
              renderCell: (row: InstallTarget) => <Code>{row.name}</Code>,
            },
            {
              key: "target",
              header: "Installs to",
              width: proportional(2),
              renderCell: (row: InstallTarget) => <Code>{row.target}</Code>,
            },
          ]}
        />
        <CommandBlock
          kind="run"
          args={`shadcn@latest add ${registryItemUrl("button")}`}
        />
        <CodeBlock
          title="app/page.tsx"
          language="tsx"
          width="100%"
          code={`import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button label="Get started" variant="primary" />;
}`}
        />
        <VStack gap={1}>
          <Text color="secondary">Install several at once:</Text>
          <CommandBlock
            kind="run"
            args={`shadcn@latest add ${registryItemUrl("button")} ${registryItemUrl("metric-strip")}`}
          />
        </VStack>
        <VStack gap={1}>
          <Text color="secondary">
            Add a full page template — it becomes a route at{" "}
            <Code>/dashboard</Code>:
          </Text>
          <CommandBlock
            kind="run"
            args={`shadcn@latest add ${registryItemUrl("template-dashboard")}`}
          />
        </VStack>
      </DocSection>

      <DocDivider />

      <DocSection id="manual-setup" title="Manual setup">
        <Text>
          Not on Next.js, or prefer to edit files yourself? Install the
          packages, put the layer order above at the top of your global CSS, and
          wrap your app in <Code>Theme</Code>.
        </Text>
        <CommandBlock
          kind="install"
          args="@astryxdesign/core @astryxdesign/theme-neutral @stylexjs/stylex"
        />
        <CodeBlock
          title="main.tsx"
          language="tsx"
          width="100%"
          code={`import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

<Theme theme={neutralTheme}>
  <App />
</Theme>`}
        />
      </DocSection>

      <DocDivider />

      <DocSection id="add-registry" title="Optional: register the namespace">
        <Text>
          To use short names like <Code>{REGISTRY_NAMESPACE}/button</Code>{" "}
          instead of full URLs, add a <Code>registries</Code> key to the{" "}
          <Code>components.json</Code> that <Code>shadcn init</Code> created.
          Keep the existing fields — a file with only <Code>registries</Code> is
          rejected as an invalid configuration.
        </Text>
        <CodeBlock
          title="components.json"
          language="json"
          width="100%"
          hasLineNumbers
          highlightLines={[18, 19, 20]}
          code={`{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils"
  },
  "registries": {
    "${REGISTRY_NAMESPACE}": "${REGISTRY_URL}"
  }
}`}
        />
        <CommandBlock
          kind="run"
          args={`shadcn@latest add ${REGISTRY_NAMESPACE}/button`}
        />
        <Banner
          status="info"
          title={`Seeing "Unknown registry ${REGISTRY_NAMESPACE}"?`}
          description="The namespace is not configured in this project's components.json. Add the registries key above, or install by full URL."
          collapsible={false}
        />
      </DocSection>
    </DocPage>
  );
}
