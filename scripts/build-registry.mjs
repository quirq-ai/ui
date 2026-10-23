// Builds public/r/*.json from registry.json.
//
//   node scripts/build-registry.mjs   (or: bun run registry:build — runs before dev and build)
//
// `homepage` in registry.json is the one place the registry URL lives. Items that depend on
// other items in this registry need full URLs (so `shadcn add <url>` works with no setup), so
// this rewrites every such registryDependency to `${homepage}/r/<name>.json` before building.
// To move the registry, change `homepage` and run this (or just `bun run dev` / `bun run build`).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REGISTRY_JSON = path.join(ROOT, "registry.json");

const source = fs.readFileSync(REGISTRY_JSON, "utf8");
const registry = JSON.parse(source);
const base = registry.homepage?.replace(/\/+$/, "");
if (!base || !/^https?:\/\//.test(base)) {
  throw new Error(
    `registry.json "homepage" must be an http(s) URL, got: ${registry.homepage}`,
  );
}

const ownItems = new Set(registry.items.map((item) => item.name));
let rewritten = 0;
for (const item of registry.items) {
  if (!item.registryDependencies) continue;
  item.registryDependencies = item.registryDependencies.map((dep) => {
    const name = dep.match(/^https?:\/\/.+\/r\/([^/]+)\.json$/)?.[1];
    if (!name || !ownItems.has(name)) return dep; // shadcn, namespaced or third-party items
    const url = `${base}/r/${name}.json`;
    if (url !== dep) rewritten++;
    return url;
  });
}

const output = `${JSON.stringify(registry, null, "\t")}\n`;
if (output !== source) fs.writeFileSync(REGISTRY_JSON, output);
if (rewritten)
  console.log(`registry.json: pointed ${rewritten} dependencies at ${base}`);

execFileSync(
  path.join(ROOT, "node_modules/.bin/shadcn"),
  ["build", "registry.json", "--output", "public/r"],
  { cwd: ROOT, stdio: "inherit" },
);
