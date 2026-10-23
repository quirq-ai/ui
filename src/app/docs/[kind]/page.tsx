import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogIndexPage } from "@/docs/catalog-index-page";
import { KIND_LABELS, KIND_ROUTES } from "@/docs/catalog-routes";
import { DocLoading } from "@/docs/doc-loading";
import { CATALOG, kindFromRoute } from "@/registry/catalog";

type Params = PageProps<"/docs/[kind]">["params"];

export function generateStaticParams() {
  return Object.values(KIND_ROUTES).map((kind) => ({ kind }));
}

export async function generateMetadata({
  params,
}: PageProps<"/docs/[kind]">): Promise<Metadata> {
  const kind = kindFromRoute((await params).kind);
  return { title: kind ? KIND_LABELS[kind] : "Not found" };
}

/** /docs/components, /docs/blocks, /docs/templates: searchable index of one kind. */
export default function Page({ params }: PageProps<"/docs/[kind]">) {
  return (
    <Suspense fallback={<DocLoading />}>
      <CatalogIndex params={params} />
    </Suspense>
  );
}

async function CatalogIndex({ params }: { params: Params }) {
  const kind = kindFromRoute((await params).kind);
  if (!kind) notFound();
  const entries = CATALOG.filter((entry) => entry.kind === kind).map(
    ({ name, title, description, group, isWip }) => ({
      kind,
      name,
      title,
      description,
      group,
      isWip,
    }),
  );
  return <CatalogIndexPage key={kind} kind={kind} entries={entries} />;
}
