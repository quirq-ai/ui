import { DocsShell } from "@/docs/docs-shell";
import { countByKind } from "@/registry/catalog";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return <DocsShell counts={countByKind()}>{children}</DocsShell>;
}
