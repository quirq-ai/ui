"use client";

import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { useMediaQuery } from "@astryxdesign/core/hooks";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import { Outline, type OutlineItem } from "@astryxdesign/core/Outline";
import { VStack } from "@astryxdesign/core/Stack";
import { Tab, TabList } from "@astryxdesign/core/TabList";
import { Heading, Text } from "@astryxdesign/core/Text";
import { type CSSProperties, type ReactNode, useState } from "react";

const outlinePanel: CSSProperties = {
  position: "sticky",
  top: "var(--spacing-6)",
  alignSelf: "start",
  paddingBlockStart: "var(--spacing-8)",
};

type DocPageProps = {
  title: string;
  description: string;
  outline: OutlineItem[];
  children: ReactNode;
};

/** Article frame from the `documentation-technical` template: content column + sticky "On this page" outline. */
export function DocPage({
  title,
  description,
  outline,
  children,
}: Readonly<DocPageProps>) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Layout
      height="auto"
      contentWidth={960}
      end={
        isMobile ? undefined : (
          <LayoutPanel
            isScrollable={false}
            label="On this page"
            role="complementary"
            style={outlinePanel}
          >
            <Outline items={outline} label="On this page" />
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent isScrollable={false} padding={8}>
          <VStack gap={8}>
            <VStack gap={2}>
              <Text type="display-1">{title}</Text>
              <Text type="large" color="secondary">
                {description}
              </Text>
            </VStack>
            {children}
          </VStack>
        </LayoutContent>
      }
    />
  );
}

type DocSectionProps = {
  id: string;
  title: string;
  level?: 2 | 3;
  children: ReactNode;
};

export function DocSection({
  id,
  title,
  level = 2,
  children,
}: Readonly<DocSectionProps>) {
  return (
    <VStack gap={4}>
      <Heading id={id} level={level}>
        {title}
      </Heading>
      {children}
    </VStack>
  );
}

type ComponentPreviewProps = {
  preview: ReactNode;
  code: string;
  height?: number;
};

/** shadcn-style Preview / Code tabs around a live example. */
export function ComponentPreview({
  preview,
  code,
  height = 240,
}: Readonly<ComponentPreviewProps>) {
  const [tab, setTab] = useState("preview");
  return (
    <VStack gap={2}>
      <TabList size="sm" value={tab} onChange={setTab}>
        <Tab value="preview" label="Preview" />
        <Tab value="code" label="Code" />
      </TabList>
      {tab === "preview" ? (
        <Card variant="muted" padding={6}>
          <Center width="100%" minHeight={height}>
            {preview}
          </Center>
        </Card>
      ) : (
        <CodeBlock code={code} language="tsx" width="100%" maxHeight={480} />
      )}
    </VStack>
  );
}

export { Divider as DocDivider } from "@astryxdesign/core/Divider";
