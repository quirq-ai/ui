import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogPage } from "@/docs/catalog-page";
import { KIND_ROUTES } from "@/docs/catalog-routes";
import { ComponentPage } from "@/docs/component-page";
import { DocLoading } from "@/docs/doc-loading";
import { FEATURED } from "@/docs/featured";
import { CATALOG, getSource, kindFromRoute } from "@/registry/catalog";

type Params = PageProps<"/docs/[kind]/[name]">["params"];

/** Hand-written docs (examples + prop tables) win over the generated catalog page. */
function resolve({ kind: route, name }: { kind: string; name: string }) {
  const featured =
    route === KIND_ROUTES.component
      ? FEATURED.find((item) => item.name === name)
      : undefined;
  if (featured) return { featured } as const;
  const kind = kindFromRoute(route);
  const entry = CATALOG.find((e) => e.kind === kind && e.name === name);
  return entry ? ({ entry } as const) : undefined;
}

export function generateStaticParams() {
  const params = CATALOG.map((entry) => ({
    kind: KIND_ROUTES[entry.kind],
    name: entry.name,
  }));
  for (const item of FEATURED) {
    if (!params.some((p) => p.name === item.name)) {
      params.push({ kind: KIND_ROUTES.component, name: item.name });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps<"/docs/[kind]/[name]">): Promise<Metadata> {
  const found = resolve(await params);
  const doc = found?.featured ?? found?.entry;
  return doc
    ? { title: doc.title, description: doc.description }
    : { title: "Not found" };
}

export default function Page({ params }: PageProps<"/docs/[kind]/[name]">) {
  return (
    <Suspense fallback={<DocLoading />}>
      <ItemPage params={params} />
    </Suspense>
  );
}

async function ItemPage({ params }: { params: Params }) {
  const found = resolve(await params);
  if (!found) notFound();
  if (found.featured) {
    const { name, file } = found.featured;
    return (
      <ComponentPage key={name} name={name} source={await getSource(file)} />
    );
  }
  const { entry } = found;
  return (
    <CatalogPage
      key={entry.name}
      entry={entry}
      source={await getSource(entry.file)}
    />
  );
}
