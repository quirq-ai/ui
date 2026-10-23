"use client";

import { Link } from "@astryxdesign/core/Link";
import { HStack } from "@astryxdesign/core/Stack";
import { proportional, Table } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Token } from "@astryxdesign/core/Token";
import { useState } from "react";
import type { CatalogEntry, CatalogKind } from "@/registry/catalog.generated";
import { entryHref } from "./catalog-routes";
import { DocPage, DocSection } from "./doc-page";
import { CommandBlock } from "./package-manager";
import { registryItemUrl } from "./registry-config";

/** The catalog fields the index table needs. */
export type CatalogRow = Pick<
  CatalogEntry,
  "kind" | "name" | "title" | "description" | "group" | "isWip"
>;

const COPY: Record<
  CatalogKind,
  { title: string; description: string; groupHeader: string }
> = {
  component: {
    title: "Components",
    description:
      "Every XO UI component as an installable item. Each one copies a thin wrapper into components/ui that you can change.",
    groupHeader: "Category",
  },
  block: {
    title: "Blocks",
    description:
      "Ready-made compositions from the XO UI block templates — drop one into a page section and replace its data.",
    groupHeader: "Component",
  },
  template: {
    title: "Templates",
    description:
      "Full XO UI page templates. Each installs as a Next.js route under app/ — keep its frame, gap and padding and replace the content.",
    groupHeader: "Category",
  },
};

type Row = CatalogRow & Record<string, unknown>;

function matches(entry: CatalogRow, query: string) {
  const q = query.trim().toLowerCase();
  return (
    !q ||
    [entry.title, entry.name, entry.group, entry.description].some((text) =>
      text.toLowerCase().includes(q),
    )
  );
}

export function CatalogIndexPage({
  kind,
  entries: all,
}: Readonly<{ kind: CatalogKind; entries: CatalogRow[] }>) {
  const [query, setQuery] = useState("");
  const rows = all.filter((entry) => matches(entry, query)) as Row[];
  const copy = COPY[kind];
  const example = all[0];

  return (
    <DocPage
      title={copy.title}
      description={copy.description}
      outline={[
        { id: "install", label: "Install", level: 2 },
        { id: "browse", label: `All ${copy.title.toLowerCase()}`, level: 2 },
      ]}
    >
      <DocSection id="install" title="Install">
        <Text>Pick an item below, or add one by name:</Text>
        <CommandBlock
          kind="run"
          args={`shadcn@latest add ${registryItemUrl(example.name)}`}
        />
      </DocSection>

      <DocSection
        id="browse"
        title={`All ${copy.title.toLowerCase()} (${all.length})`}
      >
        <TextInput
          label={`Search ${copy.title.toLowerCase()}`}
          isLabelHidden
          placeholder={`Search ${all.length} ${copy.title.toLowerCase()}…`}
          startIcon="search"
          value={query}
          onChange={setQuery}
          hasClear
          width="100%"
        />
        <Table
          data={rows}
          idKey="name"
          hasHover
          verticalAlign="top"
          columns={[
            {
              key: "title",
              header: "Name",
              width: proportional(2),
              renderCell: (row: Row) => (
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Link href={entryHref(row)}>{row.title}</Link>
                  {row.isWip && <Token size="sm" label="WIP" color="orange" />}
                </HStack>
              ),
            },
            {
              key: "group",
              header: copy.groupHeader,
              width: proportional(1),
              renderCell: (row: Row) => (
                <Text color="secondary">{row.group}</Text>
              ),
            },
            {
              key: "description",
              header: "Description",
              width: proportional(4),
              renderCell: (row: Row) => (
                <Text color="secondary" maxLines={2}>
                  {row.description}
                </Text>
              ),
            },
          ]}
        />
        {rows.length === 0 && (
          <Text color="secondary">
            No {copy.title.toLowerCase()} match “{query}”.
          </Text>
        )}
      </DocSection>
    </DocPage>
  );
}
