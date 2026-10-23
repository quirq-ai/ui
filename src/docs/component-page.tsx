"use client";

import { Code } from "@astryxdesign/core/Code";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Link } from "@astryxdesign/core/Link";
import type { OutlineItem } from "@astryxdesign/core/Outline";
import { VStack } from "@astryxdesign/core/Stack";
import { Tab, TabList } from "@astryxdesign/core/TabList";
import { Heading, Text } from "@astryxdesign/core/Text";
import { useState } from "react";
import { ComponentPreview, DocDivider, DocPage, DocSection } from "./doc-page";
import { CommandBlock } from "./package-manager";
import { PropsTable } from "./props-table";
import { registryItemUrl } from "./registry-config";
import { REGISTRY_ITEMS, type RegistryItemDoc } from "./registry-items";

function InstallTabs({
  item,
  source,
}: Readonly<{ item: RegistryItemDoc; source: string }>) {
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
          args={`shadcn@latest add ${registryItemUrl(item.name)}`}
        />
      ) : (
        <VStack gap={6}>
          <VStack gap={2}>
            <Text weight="semibold">1. Install the dependencies</Text>
            <CommandBlock kind="install" args={item.dependencies.join(" ")} />
          </VStack>
          <VStack gap={2}>
            <Text weight="semibold">
              2. Copy and paste the following code into your project
            </Text>
            <CodeBlock
              code={source}
              title={item.installPath}
              language="tsx"
              width="100%"
              hasLineNumbers
              isCollapsible
              collapsibleThreshold={30}
            />
          </VStack>
          <VStack gap={2}>
            <Text weight="semibold">
              3. Update the import paths to match your project setup
            </Text>
            <Text color="secondary">
              Make sure the XO UI CSS and Theme are set up — see{" "}
              <Link href="/docs/installation">Installation</Link>, steps 1 and
              2.
            </Text>
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

export function ComponentPage({
  name,
  source,
}: Readonly<{ name: string; source: string }>) {
  const item = REGISTRY_ITEMS.find((entry) => entry.name === name);
  if (!item) throw new Error(`No docs for registry item ${name}`);
  const outline: OutlineItem[] = [
    { id: "installation", label: "Installation", level: 2 },
    { id: "usage", label: "Usage", level: 2 },
    { id: "examples", label: "Examples", level: 2 },
    ...item.examples.map((example) => ({
      id: example.id,
      label: example.title,
      level: 3,
    })),
    { id: "api-reference", label: "API Reference", level: 2 },
  ];

  return (
    <DocPage
      title={item.title}
      description={item.description}
      outline={outline}
    >
      <ComponentPreview preview={item.hero.preview} code={item.hero.code} />

      <DocSection id="installation" title="Installation">
        <InstallTabs item={item} source={source} />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <CodeBlock code={item.usage.imports} language="tsx" width="100%" />
        <CodeBlock code={item.usage.code} language="tsx" width="100%" />
      </DocSection>

      <DocSection id="examples" title="Examples">
        <VStack gap={8}>
          {item.examples.map((example) => (
            <VStack key={example.id} gap={3}>
              <Heading id={example.id} level={3}>
                {example.title}
              </Heading>
              <Text color="secondary">{example.description}</Text>
              <ComponentPreview
                preview={example.preview}
                code={example.code}
                height={160}
              />
            </VStack>
          ))}
        </VStack>
      </DocSection>

      <DocDivider />

      <DocSection id="api-reference" title="API Reference">
        <VStack gap={6}>
          <VStack gap={3}>
            <Heading level={3}>{item.title.replace(/\s/g, "")}</Heading>
            <PropsTable rows={item.props} />
          </VStack>
          {item.types?.map((type) => (
            <VStack key={type.name} gap={3}>
              <Heading level={3}>{type.name}</Heading>
              <PropsTable rows={type.rows} />
            </VStack>
          ))}
          {item.referenceName && (
            <Text color="secondary">
              Built on XO UI. Run{" "}
              <Code>astryx component {item.referenceName}</Code> for every prop
              and accessibility guidance.
            </Text>
          )}
        </VStack>
      </DocSection>
    </DocPage>
  );
}
