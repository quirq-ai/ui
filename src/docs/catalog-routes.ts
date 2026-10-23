import type { CatalogKind } from "@/registry/catalog.generated";

/** Route segment per catalog kind: /docs/components, /docs/blocks, /docs/templates. */
export const KIND_ROUTES: Record<CatalogKind, string> = {
  component: "components",
  block: "blocks",
  template: "templates",
};

export const KIND_LABELS: Record<CatalogKind, string> = {
  component: "Components",
  block: "Blocks",
  template: "Templates",
};

export function entryHref(entry: { kind: CatalogKind; name: string }) {
  return `/docs/${KIND_ROUTES[entry.kind]}/${entry.name}`;
}

export function previewHref(name: string) {
  return `/preview/${name}`;
}
