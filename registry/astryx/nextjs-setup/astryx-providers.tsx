"use client";

import type { ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

/**
 * Supplies the Astryx theme tokens every component reads. Theme uses React context,
 * so this is a client component — wrap `{children}` with it in app/layout.tsx.
 */
export function AstryxProviders({ children }: Readonly<{ children: ReactNode }>) {
	return <Theme theme={neutralTheme}>{children}</Theme>;
}

export default AstryxProviders;
