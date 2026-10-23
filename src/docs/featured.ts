// Hand-written registry items with full docs pages (examples + prop tables).
// Plain data, so server routes can list them; the live examples live in registry-items.tsx.
// Add an entry here and in registry-items.tsx whenever you add a hand-written registry item.

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type FeaturedItem = {
  /** Registry item name — the `{name}` in the item URL `/r/{name}.json`. */
  name: string;
  title: string;
  description: string;
  /** Source file, relative to the project root. */
  file: string;
};

export const FEATURED: FeaturedItem[] = [
  {
    name: "button",
    title: "Button",
    description:
      "Triggers an action when clicked. Use it for form submissions, confirmations, or any interaction that needs a clear call to action.",
    file: "registry/astryx/button/button.tsx",
  },
  {
    name: "metric-strip",
    title: "Metric strip",
    description:
      "A row of headline metrics with trend tokens, separated by vertical dividers. Drop it at the top of a dashboard.",
    file: "registry/astryx/metric-strip/metric-strip.tsx",
  },
];
