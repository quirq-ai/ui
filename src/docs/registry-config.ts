/** Optional namespace consumers can register in components.json for short `add` commands. */
export const REGISTRY_NAMESPACE = "@quirq-ui-registry";

/** Built registry JSON is served from /r at `homepage` in registry.json (inlined by next.config.ts). */
export const REGISTRY_URL = `${process.env.NEXT_PUBLIC_REGISTRY_ORIGIN}/r/{name}.json`;

/** Full URL for one registry item — works with `shadcn add` without any components.json setup. */
export function registryItemUrl(name: string) {
  return REGISTRY_URL.replace("{name}", name);
}
