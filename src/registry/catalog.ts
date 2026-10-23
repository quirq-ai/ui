import { readFile } from "node:fs/promises";
import path from "node:path";
import { KIND_ROUTES } from "@/docs/catalog-routes";
import { CATALOG, type CatalogKind } from "./catalog.generated";

export { CATALOG };
export type { CatalogEntry, CatalogKind } from "./catalog.generated";

/** Source of a registry file (e.g. "registry/astryx/blocks/Foo.tsx"), shown in Code tabs. */
export async function getSource(file: string) {
  "use cache";
  // Keep the path statically scoped to registry/ so output tracing doesn't pull in the whole project.
  const relative = path.relative("registry", file);
  return readFile(path.join(process.cwd(), "registry", relative), "utf8");
}

export function kindFromRoute(route: string) {
  return (Object.keys(KIND_ROUTES) as CatalogKind[]).find(
    (kind) => KIND_ROUTES[kind] === route,
  );
}

export function countByKind(): Record<CatalogKind, number> {
  const counts = { component: 0, block: 0, template: 0 };
  for (const entry of CATALOG) counts[entry.kind] += 1;
  return counts;
}
