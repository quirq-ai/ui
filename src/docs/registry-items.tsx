"use client";

import { Icon } from "@astryxdesign/core/Icon";
import { HStack } from "@astryxdesign/core/Stack";
import type { ReactNode } from "react";
import { Button } from "../../registry/astryx/button/button";
import { MetricStrip } from "../../registry/astryx/metric-strip/metric-strip";
import { FEATURED, type FeaturedItem, type PropRow } from "./featured";

// Live examples + API docs for the hand-written registry items listed in featured.ts.

export type Example = {
  id: string;
  title: string;
  description: string;
  preview: ReactNode;
  code: string;
};

export type RegistryItemDoc = FeaturedItem & {
  /** Where the CLI writes the file in the consumer app (shadcn default aliases). */
  installPath: string;
  importPath: string;
  /** npm packages the item needs (manual install). */
  dependencies: string[];
  usage: { imports: string; code: string };
  hero: Example;
  examples: Example[];
  props: PropRow[];
  /** Extra type tables, e.g. the shape of an array prop. */
  types?: { name: string; rows: PropRow[] }[];
  /** Component name for `astryx component <name>`. */
  referenceName?: string;
};

const featured = (name: string) => {
  const item = FEATURED.find((entry) => entry.name === name);
  if (!item) throw new Error(`${name} is missing from featured.ts`);
  return item;
};

const BASE_DEPS = [
  "@astryxdesign/core",
  "@astryxdesign/theme-neutral",
  "@stylexjs/stylex",
];

const savePromise = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 1500));

export const REGISTRY_ITEMS: RegistryItemDoc[] = [
  {
    ...featured("button"),
    installPath: "components/ui/button.tsx",
    importPath: "@/components/ui/button",
    dependencies: BASE_DEPS,
    referenceName: "Button",
    usage: {
      imports: `import { Button } from "@/components/ui/button";`,
      code: `<Button label="Save changes" variant="primary" />`,
    },
    hero: {
      id: "hero",
      title: "Button",
      description: "",
      preview: <Button label="Save changes" variant="primary" />,
      code: `import { Button } from "@/components/ui/button";

export function ButtonDemo() {
  return <Button label="Save changes" variant="primary" />;
}`,
    },
    examples: [
      {
        id: "variants",
        title: "Variants",
        description:
          "Reserve primary for the single most important action in a view. Use secondary or ghost for everything else, and destructive for irreversible actions behind a confirmation.",
        preview: (
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button label="Primary" variant="primary" />
            <Button label="Secondary" variant="secondary" />
            <Button label="Ghost" variant="ghost" />
            <Button label="Destructive" variant="destructive" />
          </HStack>
        ),
        code: `<Button label="Primary" variant="primary" />
<Button label="Secondary" variant="secondary" />
<Button label="Ghost" variant="ghost" />
<Button label="Destructive" variant="destructive" />`,
      },
      {
        id: "sizes",
        title: "Sizes",
        description: "Three sizes: sm, md (default) and lg.",
        preview: (
          <HStack gap={2} vAlign="center">
            <Button label="Small" size="sm" />
            <Button label="Medium" size="md" />
            <Button label="Large" size="lg" />
          </HStack>
        ),
        code: `<Button label="Small" size="sm" />
<Button label="Medium" size="md" />
<Button label="Large" size="lg" />`,
      },
      {
        id: "with-icon",
        title: "With icon",
        description:
          "A leading icon reinforces the label. Pass an Icon — it is sized for the button automatically.",
        preview: (
          <HStack gap={2} vAlign="center">
            <Button label="Search" icon={<Icon icon="search" />} />
            <Button
              label="Copy link"
              variant="ghost"
              icon={<Icon icon="copy" />}
            />
          </HStack>
        ),
        code: `import { Icon } from "@astryxdesign/core/Icon";

<Button label="Search" icon={<Icon icon="search" />} />
<Button label="Copy link" variant="ghost" icon={<Icon icon="copy" />} />`,
      },
      {
        id: "loading",
        title: "Loading",
        description:
          "Use clickAction with an async function: the button shows a spinner and blocks repeat clicks until the promise settles. Use isLoading to control it yourself.",
        preview: (
          <HStack gap={2} vAlign="center">
            <Button label="Save" variant="primary" clickAction={savePromise} />
            <Button label="Saving" isLoading />
          </HStack>
        ),
        code: `<Button
  label="Save"
  variant="primary"
  clickAction={async () => {
    await saveChanges();
  }}
/>
<Button label="Saving" isLoading />`,
      },
      {
        id: "disabled",
        title: "Disabled",
        description:
          "Add a tooltip to explain why an action is unavailable — the button stays focusable so the tooltip is reachable.",
        preview: (
          <HStack gap={2} vAlign="center">
            <Button label="Disabled" isDisabled />
            <Button
              label="Publish"
              variant="primary"
              isDisabled
              tooltip="Add a title before publishing"
            />
          </HStack>
        ),
        code: `<Button label="Disabled" isDisabled />
<Button
  label="Publish"
  variant="primary"
  isDisabled
  tooltip="Add a title before publishing"
/>`,
      },
      {
        id: "as-link",
        title: "As link",
        description:
          "Pass href to render an anchor styled as a button. Use target and rel for external destinations.",
        preview: (
          <Button
            label="Open docs"
            href="https://example.com/docs"
            target="_blank"
            icon={<Icon icon="externalLink" />}
          />
        ),
        code: `<Button
  label="Open docs"
  href="https://example.com/docs"
  target="_blank"
  icon={<Icon icon="externalLink" />}
/>`,
      },
    ],
    props: [
      {
        name: "label",
        type: "string",
        description: "Visible text and accessible name. Required.",
      },
      {
        name: "variant",
        type: '"primary" | "secondary" | "ghost" | "destructive"',
        default: '"secondary"',
        description: "Visual style.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size of the button.",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "Leading icon rendered before the label.",
      },
      {
        name: "isIconOnly",
        type: "boolean",
        default: "false",
        description:
          "Square icon-only button; label becomes aria-label. Requires icon.",
      },
      {
        name: "endContent",
        type: "ReactElement<IconProps | BadgeProps>",
        description: "Trailing icon or badge after the label.",
      },
      {
        name: "isLoading",
        type: "boolean",
        default: "false",
        description: "Shows a spinner and disables interaction.",
      },
      {
        name: "isDisabled",
        type: "boolean",
        default: "false",
        description: "Disables the button.",
      },
      {
        name: "onClick",
        type: "(e: MouseEvent) => void",
        description: "Standard click handler.",
      },
      {
        name: "clickAction",
        type: "(e: MouseEvent) => void | Promise<void>",
        description:
          "Async click handler; shows loading while the promise is pending.",
      },
      {
        name: "tooltip",
        type: "string",
        description: "Tooltip text shown on hover and focus.",
      },
      {
        name: "href",
        type: "string",
        description: "Renders the button as a link.",
      },
      {
        name: "target / rel",
        type: "string",
        description: "Anchor attributes when href is set.",
      },
      {
        name: "type",
        type: '"button" | "submit" | "reset"',
        default: '"button"',
        description: "HTML button type.",
      },
      {
        name: "width",
        type: "number | string",
        description: 'Fixed width, e.g. "100%" for a full-width button.',
      },
      {
        name: "elevation",
        type: '"none" | "low" | "med" | "high"',
        default: '"none"',
        description: "Resting shadow for floating buttons.",
      },
    ],
  },
  {
    ...featured("metric-strip"),
    installPath: "components/metric-strip.tsx",
    importPath: "@/components/metric-strip",
    dependencies: BASE_DEPS,
    usage: {
      imports: `import { MetricStrip } from "@/components/metric-strip";`,
      code: `<MetricStrip
  metrics={[
    { label: "Revenue", value: "$24,500", delta: "+12%", trend: "up", caption: "vs last month" },
    { label: "Churn", value: "1.8%", delta: "-0.3%", trend: "down" },
  ]}
/>`,
    },
    hero: {
      id: "hero",
      title: "Metric strip",
      description: "",
      preview: <MetricStrip />,
      code: `import { MetricStrip } from "@/components/metric-strip";

export function MetricStripDemo() {
  // Renders sample data when no metrics are passed.
  return <MetricStrip />;
}`,
    },
    examples: [
      {
        id: "custom-metrics",
        title: "Custom metrics",
        description:
          "Pass your own metrics. trend picks the token color: up is green, down is red, flat is gray.",
        preview: (
          <MetricStrip
            metrics={[
              {
                label: "Orders",
                value: "842",
                delta: "+4%",
                trend: "up",
                caption: "this week",
              },
              {
                label: "Refunds",
                value: "12",
                delta: "0%",
                trend: "flat",
                caption: "this week",
              },
            ]}
          />
        ),
        code: `<MetricStrip
  metrics={[
    { label: "Orders", value: "842", delta: "+4%", trend: "up", caption: "this week" },
    { label: "Refunds", value: "12", delta: "0%", trend: "flat", caption: "this week" },
  ]}
/>`,
      },
      {
        id: "values-only",
        title: "Values only",
        description: "Omit delta to show just the label and value.",
        preview: (
          <MetricStrip
            metrics={[
              { label: "Projects", value: "18" },
              { label: "Members", value: "64" },
              { label: "Storage", value: "212 GB" },
            ]}
          />
        ),
        code: `<MetricStrip
  metrics={[
    { label: "Projects", value: "18" },
    { label: "Members", value: "64" },
    { label: "Storage", value: "212 GB" },
  ]}
/>`,
      },
    ],
    props: [
      {
        name: "metrics",
        type: "Metric[]",
        default: "sample data",
        description: "Metrics to render, left to right.",
      },
    ],
    types: [
      {
        name: "Metric",
        rows: [
          {
            name: "label",
            type: "string",
            description:
              "Metric name. Also used as the React key, so keep it unique.",
          },
          {
            name: "value",
            type: "string",
            description: "Pre-formatted headline value.",
          },
          {
            name: "delta",
            type: "string",
            description: 'Change vs previous period, e.g. "+12%".',
          },
          {
            name: "trend",
            type: '"up" | "down" | "flat"',
            default: '"flat"',
            description: "Colors the delta token.",
          },
          {
            name: "caption",
            type: "string",
            description: "Supporting text after the delta.",
          },
        ],
      },
    ],
  },
];
