"use client";

import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { List, ListItem } from "@astryxdesign/core/List";
import type { OutlineItem } from "@astryxdesign/core/Outline";
import { HStack } from "@astryxdesign/core/Stack";
import { proportional, Table } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import type { CatalogKind } from "@/registry/catalog.generated";
import { DocDivider, DocPage, DocSection } from "./doc-page";
import { FEATURED } from "./featured";
import { CommandBlock } from "./package-manager";
import { registryItemUrl } from "./registry-config";

const OUTLINE: OutlineItem[] = [
  { id: "quick-start", label: "Quick start", level: 2 },
  { id: "how-it-works", label: "How it works", level: 2 },
  { id: "catalog", label: "What's included", level: 2 },
  { id: "components", label: "Featured", level: 2 },
];

type ItemRow = { name: string; title: string; description: string };

export function IntroductionPage({
  counts,
}: Readonly<{ counts: Record<CatalogKind, number> }>) {
  const count = (kind: CatalogKind) => counts[kind];
  const rows: ItemRow[] = FEATURED.map(({ name, title, description }) => ({
    name,
    title,
    description,
  }));
  return (
    <DocPage
      title="Introduction"
      description="Every Quirq UI component, block and page template, distributed through a shadcn registry. Install any of them with one command and own the code."
      outline={OUTLINE}
    >
      <HStack gap={2}>
        <Button
          label="Get started"
          variant="primary"
          href="/docs/installation"
        />
        <Button label="Browse components" href="/docs/components" />
      </HStack>

      <DocSection id="quick-start" title="Quick start">
        <Text>
          Already have a{" "}
          <Link href="/docs/installation">configured project</Link>? Add a
          component:
        </Text>
        <CommandBlock
          kind="run"
          args={`shadcn@latest add ${registryItemUrl("button")}`}
        />
      </DocSection>

      <DocDivider />

      <DocSection id="how-it-works" title="How it works">
        <List listStyle="disc">
          <ListItem
            label="Quirq UI is the core"
            description="Every item composes @astryxdesign/core components, so styling, theming and accessibility come from the design system."
          />
          <ListItem
            label="You own the code"
            description="The CLI copies each component, block or page into your project. Change defaults, replace the sample data or wrap it further."
          />
          <ListItem
            label="Dependencies install automatically"
            description={`Items depend on astryx-base, which installs Quirq UI and the theme the first time you add anything.`}
          />
        </List>
      </DocSection>

      <DocDivider />

      <DocSection id="catalog" title="What's included">
        <List listStyle="disc">
          <ListItem
            label={`${count("component")} components`}
            href="/docs/components"
            description="Every Quirq UI component, each installable on its own into components/ui."
          />
          <ListItem
            label={`${count("block")} blocks`}
            href="/docs/blocks"
            description="Ready-made compositions from the Quirq UI block templates, with live previews."
          />
          <ListItem
            label={`${count("template")} page templates`}
            href="/docs/templates"
            description="Full pages — dashboards, tables, forms, settings, chat — installed as Next.js routes."
          />
        </List>
      </DocSection>

      <DocDivider />

      <DocSection id="components" title="Featured">
        <Table
          data={rows}
          idKey="name"
          hasHover
          columns={[
            {
              key: "title",
              header: "Component",
              width: proportional(1),
              renderCell: (row: ItemRow) => (
                <Link href={`/docs/components/${row.name}`}>{row.title}</Link>
              ),
            },
            {
              key: "description",
              header: "Description",
              width: proportional(3),
              renderCell: (row: ItemRow) => (
                <Text color="secondary">{row.description}</Text>
              ),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
