// Generates registry items for every Astryx component, block template and page template.
//
//   bun run registry:generate   (or: bun scripts/generate-registry.mjs)
//
// Sources come from the installed packages, so re-run after bumping @astryxdesign/*:
//   - components:  `astryx component --list` + @astryxdesign/core/src/**/<Name>.doc.mjs
//   - blocks/pages: @astryxdesign/cli/assets/templates (identical to `astryx template <id>`)
//
// Writes:
//   registry/astryx/<kebab>/<kebab>.tsx           one wrapper per component
//   registry/astryx/blocks/<BlockId>.tsx          block template sources
//   registry/astryx/templates/<id>/page.tsx       page template sources
//   registry.json                                 hand-written items + generated items
//   src/registry/catalog.generated.ts             metadata for the docs site (server-only)
//   src/registry/previews.generated.ts            lazy loaders for the /preview/[name] route

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const CORE = path.join(ROOT, "node_modules/@astryxdesign/core");
const TEMPLATES = path.join(
  ROOT,
  "node_modules/@astryxdesign/cli/assets/templates",
);
const REGISTRY_JSON = path.join(ROOT, "registry.json");
const CATALOG_TS = path.join(ROOT, "src/registry/catalog.generated.ts");
const PREVIEWS_TS = path.join(ROOT, "src/registry/previews.generated.ts");

/** Items written by hand in registry.json — kept as-is and never regenerated. */
const HAND_WRITTEN = new Set([
  "astryx-base",
  "astryx-nextjs",
  "button",
  "metric-strip",
]);

const registry = JSON.parse(fs.readFileSync(REGISTRY_JSON, "utf8"));
const BASE_DEP = `${registry.homepage.replace(/\/+$/, "")}/r/astryx-base.json`;

/** Versions for third-party packages templates import, taken from this project's package.json. */
const pkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
);
const EXTERNAL_PACKAGES = ["@heroicons/react", "recharts", "lucide-react"];

function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function astryxJson(...args) {
  const out = execFileSync("bunx", ["astryx", "--json", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 << 20,
  });
  return JSON.parse(out).data;
}

function walk(dir, test, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, test, found);
    else if (test(entry.name)) found.push(full);
  }
  return found;
}

/** Plain-text summary from a markdown usage description: first paragraph, at most two sentences. */
function summarize(markdown) {
  if (!markdown) return undefined;
  const text = markdown
    .split(/\n\s*\n/)[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text
    .split(/(?<=[a-z)][.!?])\s+(?=[A-Z])/)
    .slice(0, 2)
    .join(" ");
}

function externalDependencies(source) {
  const deps = new Set();
  for (const [, spec] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const name = EXTERNAL_PACKAGES.find(
      (p) => spec === p || spec.startsWith(`${p}/`),
    );
    if (name) {
      const version = pkg.dependencies[name] ?? pkg.devDependencies?.[name];
      deps.add(version ? `${name}@${version}` : name);
    }
  }
  return [...deps].sort();
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== content)
    fs.writeFileSync(file, content);
}

const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");

// ---------------------------------------------------------------------------
// Components

const docFiles = new Map(
  walk(path.join(CORE, "src"), (name) => name.endsWith(".doc.mjs")).map(
    (file) => [path.basename(file, ".doc.mjs"), file],
  ),
);

async function loadDoc(name) {
  const file = docFiles.get(name);
  if (!file) return undefined;
  const mod = await import(pathToFileURL(file).href);
  return mod.docs ?? mod.doc ?? mod.default;
}

const componentGroups = astryxJson("component", "--list").components;
const componentNames = Object.values(componentGroups)
  .flat()
  .filter((entry) => entry.package === "@astryxdesign/core")
  .map((entry) => entry.name);

// `component --list` (text) shows the import path; the JSON names-only list does not, so read it per module.
const importPaths = new Map();
for (const line of execFileSync("bunx", ["astryx", "component", "--list"], {
  cwd: ROOT,
  encoding: "utf8",
}).split("\n\n")) {
  const match = line.match(/name:\s+(\S+)\s+import:\s+(\S+)/);
  if (match) importPaths.set(match[1], match[2]);
}

const items = [];
const catalog = [];

for (const name of [...new Set(componentNames)].sort()) {
  const importPath = importPaths.get(name);
  if (!importPath) throw new Error(`No import path for ${name}`);
  const subpath = importPath.replace("@astryxdesign/core/", "");
  const indexFile = ["index.ts", "index.tsx"]
    .map((f) => path.join(CORE, "src", subpath, f))
    .find(fs.existsSync);
  const indexSource = indexFile ? fs.readFileSync(indexFile, "utf8") : "";
  const hasProps = new RegExp(`\\b${name}Props\\b`).test(indexSource);

  const doc = (await loadDoc(name)) ?? {};
  const parentName = doc.subComponentOf ?? subpath;
  const parentDoc =
    parentName === name ? doc : ((await loadDoc(parentName)) ?? {});
  const title = doc.displayName ?? name.replace(/([a-z])([A-Z])/g, "$1 $2");
  const parentTitle = parentDoc.displayName ?? parentName;
  const ownDescription =
    summarize(doc.usage?.description) ?? summarize(doc.description);
  const description = ownDescription
    ? parentName !== name && !ownDescription.includes(parentName)
      ? `Used inside ${parentTitle}. ${ownDescription}`
      : ownDescription
    : `Sub-component of ${parentTitle}. ${summarize(parentDoc.usage?.description ?? parentDoc.description ?? "")?.split(/(?<=\.)\s/)[0] ?? ""}`.trim();
  const registryName = kebab(name);
  const category = doc.category ?? parentDoc.category ?? "Other";

  if (!HAND_WRITTEN.has(registryName)) {
    const file = path.join(
      ROOT,
      "registry/astryx",
      registryName,
      `${registryName}.tsx`,
    );
    const typeExport = hasProps
      ? `export type { ${name}Props } from "${importPath}";\n`
      : "";
    writeFile(
      file,
      `// Generated by scripts/generate-registry.mjs — edit freely once installed.
"use client";

/**
 * ${title}, re-exported from Astryx. Wrap it here to change project-wide defaults
 * (see components/ui/button.tsx for an example).
 * Docs: https://astryx.atmeta.com/components/${name}
 */
export { ${name}, ${name} as default } from "${importPath}";
${typeExport}`,
    );
    items.push({
      name: registryName,
      type: "registry:ui",
      title,
      description,
      categories: ["component", kebab(category.replace(/\s+/g, ""))],
      registryDependencies: [BASE_DEP],
      files: [{ path: rel(file), type: "registry:ui" }],
    });
  }

  catalog.push({
    kind: "component",
    name: registryName,
    title,
    description,
    group: category,
    exportName: name,
    importPath,
    file: HAND_WRITTEN.has(registryName)
      ? `registry/astryx/${registryName}/${registryName}.tsx`
      : rel(
          path.join(
            ROOT,
            "registry/astryx",
            registryName,
            `${registryName}.tsx`,
          ),
        ),
    installPath: `components/ui/${registryName}.tsx`,
    dependencies: [],
  });
}

// ---------------------------------------------------------------------------
// Block + page templates

const templateList = astryxJson("template", "--list").filter(
  (t) => t.package === "@astryxdesign/core",
);
const blockSources = new Map(
  walk(path.join(TEMPLATES, "blocks"), (name) => name.endsWith(".tsx")).map(
    (file) => [path.basename(file, ".tsx"), file],
  ),
);

for (const template of templateList) {
  const isPage = template.type === "page";
  const sourceFile = isPage
    ? path.join(TEMPLATES, "pages", template.id, "page.tsx")
    : blockSources.get(template.id);
  if (!sourceFile || !fs.existsSync(sourceFile))
    throw new Error(`No source for template ${template.id}`);
  const source = fs.readFileSync(sourceFile, "utf8");

  const registryName = isPage
    ? `template-${template.id}`
    : `block-${kebab(template.id)}`;
  const target = isPage
    ? path.join(ROOT, "registry/astryx/templates", template.id, "page.tsx")
    : path.join(ROOT, "registry/astryx/blocks", `${template.id}.tsx`);
  const isHandWritten = HAND_WRITTEN.has(registryName);
  if (!isHandWritten) writeFile(target, source);

  const title = template.name.replace(/\s+—\s+/g, " - ");
  const group = isPage
    ? (template.category?.split(" - ")[0] ?? "Other")
    : path.basename(path.dirname(sourceFile));
  const dependencies = externalDependencies(source);
  const description =
    template.description || `${title} block built with Quirq UI.`;

  if (!isHandWritten)
    items.push({
      name: registryName,
      type: "registry:block",
      title,
      description,
      categories: [
        isPage ? "template" : "block",
        kebab(group.replace(/\s+/g, "")),
      ],
      ...(dependencies.length ? { dependencies } : {}),
      registryDependencies: [BASE_DEP],
      files: [
        isPage
          ? {
              path: rel(target),
              type: "registry:page",
              target: `app/${template.id}/page.tsx`,
            }
          : { path: rel(target), type: "registry:component" },
      ],
    });

  catalog.push({
    kind: isPage ? "template" : "block",
    name: registryName,
    title,
    description,
    group,
    exportName: isPage ? undefined : template.id,
    importPath: isPage ? undefined : `@/components/${template.id}`,
    file: rel(target),
    installPath: isPage
      ? `app/${template.id}/page.tsx`
      : `components/${template.id}.tsx`,
    dependencies,
    ...(template.isReady === false ? { isWip: true } : {}),
  });
}

// ---------------------------------------------------------------------------
// registry.json + docs catalog

const kindOrder = { "registry:ui": 0, "registry:block": 1 };
items.sort(
  (a, b) =>
    kindOrder[a.type] - kindOrder[b.type] || a.name.localeCompare(b.name),
);
// The docs UI is branded Quirq UI: rename "Astryx" in user-facing titles and descriptions.
const brand = (entry) => ({
  ...entry,
  ...(entry.title ? { title: entry.title.replace(/Astryx/g, "Quirq UI") } : {}),
  ...(entry.description
    ? { description: entry.description.replace(/Astryx/g, "Quirq UI") }
    : {}),
});
items.splice(0, items.length, ...items.map(brand));
catalog.splice(0, catalog.length, ...catalog.map(brand));

registry.items = [
  ...registry.items.filter((item) => HAND_WRITTEN.has(item.name)),
  ...items,
];
writeFile(REGISTRY_JSON, `${JSON.stringify(registry, null, "\t")}\n`);

writeFile(
  CATALOG_TS,
  `// Generated by scripts/generate-registry.mjs — do not edit by hand.

export type CatalogKind = "component" | "block" | "template";

export type CatalogEntry = {
	kind: CatalogKind;
	/** Registry item name — the \`{name}\` in \`/r/{name}.json\`. */
	name: string;
	title: string;
	description: string;
	/** Component category, or the component a block demonstrates, or the template category. */
	group: string;
	exportName?: string;
	importPath?: string;
	/** Source file, relative to the project root. */
	file: string;
	/** Where shadcn writes the file in a consumer app. */
	installPath: string;
	/** npm packages beyond the Astryx base. */
	dependencies: string[];
	isWip?: boolean;
};

export const CATALOG: CatalogEntry[] = ${JSON.stringify(catalog)};
`,
);

// Next.js has no import.meta.glob: list one lazy import per block/page so each preview is its own chunk.
const previewEntries = catalog
  .filter((entry) => entry.kind !== "component")
  .map(
    (entry) =>
      `\t${JSON.stringify(entry.name)}: () => import(${JSON.stringify(`../../${entry.file.replace(/\.tsx$/, "")}`)}),`,
  )
  .join("\n");
writeFile(
  PREVIEWS_TS,
  `// Generated by scripts/generate-registry.mjs — do not edit by hand.

import type { ComponentType } from "react";

/** Registry item name -> lazy import of its block or page template. */
export const PREVIEWS: Record<string, () => Promise<{ default: ComponentType }>> = {
${previewEntries}
};
`,
);

const counts = {};
for (const entry of catalog) counts[entry.kind] = (counts[entry.kind] ?? 0) + 1;
console.log(`registry.json: ${registry.items.length} items`, counts);
