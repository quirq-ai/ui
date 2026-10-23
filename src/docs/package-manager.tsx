"use client";

import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { VStack } from "@astryxdesign/core/Stack";
import { Tab, TabList } from "@astryxdesign/core/TabList";
import { createContext, type ReactNode, useContext, useState } from "react";

const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

// One shared choice, so picking "pnpm" once switches every command on the page (like shadcn docs).
const PackageManagerContext = createContext<{
  value: PackageManager;
  setValue: (value: PackageManager) => void;
}>({ value: "npm", setValue: () => {} });

export function PackageManagerProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [value, setValue] = useState<PackageManager>("npm");
  return (
    <PackageManagerContext value={{ value, setValue }}>
      {children}
    </PackageManagerContext>
  );
}

const RUNNERS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

const INSTALLERS: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

type CommandBlockProps = {
  /** "run" executes a package binary (npx …), "install" adds dependencies (npm install …). */
  kind: "run" | "install";
  args: string;
};

/** A shell command rendered for npm / pnpm / yarn / bun. */
export function CommandBlock({ kind, args }: Readonly<CommandBlockProps>) {
  const { value, setValue } = useContext(PackageManagerContext);
  const prefix = kind === "run" ? RUNNERS[value] : INSTALLERS[value];
  return (
    <VStack gap={1}>
      <TabList
        size="sm"
        value={value}
        onChange={(next) => setValue(next as PackageManager)}
      >
        {PACKAGE_MANAGERS.map((pm) => (
          <Tab key={pm} value={pm} label={pm} />
        ))}
      </TabList>
      <CodeBlock code={`${prefix} ${args}`} language="bash" width="100%" />
    </VStack>
  );
}
