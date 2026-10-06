// Checks the catalog without a build: every id in lib/expected-shapes.json is
// registered in its category's index.tsx, and no source file uses an em or en dash.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const expected = JSON.parse(readFileSync(join(root, "lib/expected-shapes.json"), "utf8"));
const problems = [];

for (const [category, ids] of Object.entries(expected)) {
  const index = readFileSync(join(root, "components/shapes", category, "index.tsx"), "utf8");
  const dir = join(root, "components/shapes", category);
  const all = readdirSync(dir).map((f) => readFileSync(join(dir, f), "utf8")).join("\n");
  for (const id of ids) {
    const pattern = new RegExp(`id:\\s*["']${id}["']`);
    if (!pattern.test(all)) problems.push(`${category}: shape "${id}" is not registered`);
  }
  if (!/export const shapes/.test(index)) problems.push(`${category}: index.tsx does not export shapes`);
}

const dashes = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx?|css|mjs|md|json)$/.test(name) && name !== "pnpm-lock.yaml") {
      readFileSync(path, "utf8").split("\n").forEach((line, i) => {
        if (dashes.test(line)) problems.push(`${path.slice(root.length)}:${i + 1} uses an em or en dash`);
      });
    }
  }
}
walk(root);

const total = Object.values(expected).flat().length;
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`ok: ${total} shapes in ${Object.keys(expected).length} categories, no em or en dashes`);
