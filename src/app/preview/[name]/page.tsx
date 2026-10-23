import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PreviewLoading, PreviewRenderer } from "@/docs/preview-renderer";
import { CATALOG } from "@/registry/catalog";

const PREVIEWABLE = CATALOG.filter((entry) => entry.kind !== "component");

type Params = PageProps<"/preview/[name]">["params"];

export function generateStaticParams() {
  return PREVIEWABLE.map((entry) => ({ name: entry.name }));
}

export async function generateMetadata({
  params,
}: PageProps<"/preview/[name]">): Promise<Metadata> {
  const { name } = await params;
  const entry = PREVIEWABLE.find((e) => e.name === name);
  return { title: entry ? `${entry.title} preview` : "Preview" };
}

/** Standalone render of one block or page template, embedded by the docs in an iframe. */
export default function PreviewPage({ params }: PageProps<"/preview/[name]">) {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: { params: Params }) {
  const { name } = await params;
  const entry = PREVIEWABLE.find((e) => e.name === name);
  if (!entry) notFound();
  return (
    <PreviewRenderer name={entry.name} isPage={entry.kind === "template"} />
  );
}
