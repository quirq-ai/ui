"use client";

import { AppShell } from "@astryxdesign/core/AppShell";
import {
  SideNav,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { TopNav, TopNavHeading } from "@astryxdesign/core/TopNav";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import type { CatalogKind } from "@/registry/catalog.generated";
import { KIND_LABELS, KIND_ROUTES } from "./catalog-routes";
import { FEATURED } from "./featured";
import { PackageManagerProvider } from "./package-manager";

const KINDS = Object.keys(KIND_ROUTES) as CatalogKind[];

type DocsShellProps = {
  counts: Record<CatalogKind, number>;
  children: ReactNode;
};

/** Frame for every /docs page: top nav, side nav and a shared package-manager choice. */
export function DocsShell({ counts, children }: Readonly<DocsShellProps>) {
  const route = usePathname();
  const isFeatured = (path: string) =>
    FEATURED.some((item) => path === `/docs/components/${item.name}`);

  // AppShell scrolls the window, so start each page at the top like a full load would.
  useEffect(() => {
    if (route) window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <PackageManagerProvider>
      <AppShell
        height="auto"
        variant="section"
        topNav={
          <TopNav
            heading={
              <TopNavHeading heading="XO UI registry" headingHref="/docs" />
            }
          />
        }
        sideNav={
          <SideNav>
            <SideNavSection title="Getting started">
              <SideNavItem
                label="Introduction"
                href="/docs"
                isSelected={route === "/docs"}
              />
              <SideNavItem
                label="Installation"
                href="/docs/installation"
                isSelected={route === "/docs/installation"}
              />
            </SideNavSection>
            <SideNavSection title="Browse">
              {KINDS.map((kind) => {
                const base = `/docs/${KIND_ROUTES[kind]}`;
                const isInKind =
                  route === base ||
                  (route.startsWith(`${base}/`) && !isFeatured(route));
                return (
                  <SideNavItem
                    key={kind}
                    label={`${KIND_LABELS[kind]} (${counts[kind]})`}
                    href={base}
                    isSelected={isInKind}
                  />
                );
              })}
            </SideNavSection>
            <SideNavSection title="Featured">
              {FEATURED.map((item) => (
                <SideNavItem
                  key={item.name}
                  label={item.title}
                  href={`/docs/components/${item.name}`}
                  isSelected={route === `/docs/components/${item.name}`}
                />
              ))}
            </SideNavSection>
          </SideNav>
        }
      >
        {children}
      </AppShell>
    </PackageManagerProvider>
  );
}
