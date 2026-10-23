"use client";

import { Center } from "@astryxdesign/core/Center";
import { Spinner } from "@astryxdesign/core/Spinner";
import {
  type ComponentType,
  type LazyExoticComponent,
  lazy,
  Suspense,
  useSyncExternalStore,
} from "react";
import { PREVIEWS } from "@/registry/previews.generated";

const lazyPreviews = new Map<string, LazyExoticComponent<ComponentType>>();

function getPreview(name: string) {
  let preview = lazyPreviews.get(name);
  if (!preview) {
    preview = lazy(PREVIEWS[name]);
    lazyPreviews.set(name, preview);
  }
  return preview;
}

const noop = () => () => {};

export function PreviewLoading() {
  return (
    <Center width="100%" minHeight="100vh">
      <Spinner label="Loading preview" />
    </Center>
  );
}

const loading = <PreviewLoading />;

/**
 * Renders one block or page template on its own, for the docs iframes. Client-only,
 * like the docs' old preview.html: templates assume a browser viewport.
 */
export function PreviewRenderer({
  name,
  isPage,
}: Readonly<{ name: string; isPage: boolean }>) {
  const isClient = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  if (!isClient) return loading;

  const Preview = getPreview(name);
  return (
    <Suspense fallback={loading}>
      {isPage ? (
        <Preview />
      ) : (
        <Center width="100%" minHeight="100vh" padding={6}>
          <Preview />
        </Center>
      )}
    </Suspense>
  );
}
