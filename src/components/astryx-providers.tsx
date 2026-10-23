"use client";

import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Theme tokens for every Astryx component, plus Next.js <Link> for every Astryx
 * link (SideNavItem, Link, Button href…) so navigation stays client-side.
 */
export function AstryxProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Theme theme={neutralTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
