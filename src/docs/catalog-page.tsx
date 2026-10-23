"use client";

import { Card } from "@astryxdesign/core/Card";
import { Code } from "@astryxdesign/core/Code";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Link } from "@astryxdesign/core/Link";
import type { OutlineItem } from "@astryxdesign/core/Outline";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Tab, TabList } from "@astryxdesign/core/TabList";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import { type CSSProperties, useState } from "react";
import type { CatalogEntry } from "@/registry/catalog.generated";
import { previewHref } from "./catalog-routes";
import { DocDivider, DocPage, DocSection } from "./doc-page";
import { CommandBlock } from "./package-manager";
import { registryItemUrl } from "./registry-config";

const BASE_DEPS = [
  "@astryxdesign/core",
  "@astryxdesign/theme-neutral",
  "@stylexjs/stylex",
];

const previewFrame: CSSProperties = {
  display: "block",
  width: "100%",
  border: "none",
  borderRadius: "var(--radius-container)",
  background: "var(--color-background-surface)",
};

function Preview({
  entry,
  source,
}: Readonly<{ entry: CatalogEntry; source: string }>) {
  const [tab, setTab] = useState("preview");
  const height = entry.kind === "template" ? 720 : 480;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" hAlign="between">
        <TabList size="sm" value={tab} onChange={setTab}>
          <Tab value="preview" label="Preview" />
          <Tab value="code" label="Code" />
        </TabList>
        <Link href={previewHref(entry.name)} isExternalLink>
          Open in new tab
        </Link>
      </HStack>
      {tab === "preview" ? (
        <Card variant="muted" padding={0}>
          <iframe
            key={entry.file}
            title={`${entry.title} preview`}
            src={previewHref(entry.name)}
            loading="lazy"
            style={{ ...previewFrame, height }}
          />
        </Card>
      ) : (
        <CodeBlock
          code={source}
          language="tsx"
          width="100%"
          maxHeight={height}
          hasLineNumbers
        />
      )}
    </VStack>
  );
}

function InstallTabs({
  entry,
  source,
}: Readonly<{ entry: CatalogEntry; source: string }>) {
  const [tab, setTab] = useState("cli");
  return (
    <VStack gap={4}>
      <TabList value={tab} onChange={setTab} hasDivider>
        <Tab value="cli" label="CLI" />
        <Tab value="manual" label="Manual" />
      </TabList>
      {tab === "cli" ? (
        <CommandBlock
          kind="run"
          args={`shadcn@latest add ${registryItemUrl(entry.name)}`}
        />
      ) : (
        <VStack gap={6}>
          <VStack gap={2}>
            <Text weight="semibold">1. Install the dependencies</Text>
            <CommandBlock
              kind="install"
              args={[
                ...BASE_DEPS,
                ...entry.dependencies.map((dep) => dep.replace(/@\^.*$/, "")),
              ].join(" ")}
            />
          </VStack>
          <VStack gap={2}>
            <Text weight="semibold">
              2. Copy and paste the following code into your project
            </Text>
            <CodeBlock
              code={source}
              title={entry.installPath}
              language="tsx"
              width="100%"
              hasLineNumbers
              isCollapsible
              collapsibleThreshold={30}
            />
          </VStack>
          <VStack gap={2}>
            <Text weight="semibold">
              3. Make sure the XO UI CSS and Theme are set up
            </Text>
            <Text color="secondary">
              See <Link href="/docs/installation">Installation</Link>, steps 1
              and 2.
            </Text>
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

function usageFor(entry: CatalogEntry) {
  if (entry.kind === "template") {
    return `// Installed as a route: ${entry.installPath}
// Visit /${entry.installPath.replace(/^app\//, "").replace(/\/page\.tsx$/, "")} — then replace its data, copy and sections.`;
  }
  if (entry.kind === "block") {
    return `import ${entry.exportName} from "${entry.importPath}";

export default function Page() {
  return <${entry.exportName} />;
}`;
  }
  return `import { ${entry.exportName} } from "@/components/ui/${entry.name}";`;
}

export function CatalogPage({
  entry,
  source,
}: Readonly<{ entry: CatalogEntry; source: string }>) {
  const hasPreview = entry.kind !== "component";
  const outline: OutlineItem[] = [
    ...(hasPreview ? [{ id: "preview", label: "Preview", level: 2 }] : []),
    { id: "installation", label: "Installation", level: 2 },
    { id: "usage", label: "Usage", level: 2 },
    ...(entry.kind === "component"
      ? [{ id: "source", label: "Source", level: 2 }]
      : []),
  ];

  return (
    <DocPage
      title={entry.title}
      description={entry.description}
      outline={outline}
    >
      <HStack gap={2} wrap="wrap">
        <Token size="sm" label={entry.kind} color="blue" />
        <Token size="sm" label={entry.group} />
        {entry.isWip && (
          <Token size="sm" label="Work in progress" color="orange" />
        )}
        {entry.dependencies.map((dep) => (
          <Token key={dep} size="sm" label={dep} color="gray" />
        ))}
      </HStack>

      {hasPreview && (
        <DocSection id="preview" title="Preview">
          <Preview entry={entry} source={source} />
        </DocSection>
      )}

      <DocSection id="installation" title="Installation">
        <InstallTabs entry={entry} source={source} />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <CodeBlock code={usageFor(entry)} language="tsx" width="100%" />
      </DocSection>

      {entry.kind === "component" && (
        <>
          <DocDivider />
          <DocSection id="source" title="Source">
            <CodeBlock
              code={source}
              title={entry.installPath}
              language="tsx"
              width="100%"
            />
            <Text color="secondary">
              A thin wrapper around the XO UI {entry.exportName} component. Run{" "}
              <Code>astryx component {entry.exportName}</Code> for every prop,
              example and accessibility guidance.
            </Text>
          </DocSection>
        </>
      )}
    </DocPage>
  );
}
