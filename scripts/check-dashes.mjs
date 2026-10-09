// House rule: no em or en dashes in source, copy or docs. Run with `pnpm check`.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dashes = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx?|css|mjs|md|json)$/.test(name)) {
      readFileSync(path, "utf8").split("\n").forEach((line, i) => {
        if (dashes.test(line)) problems.push(`${path.slice(root.length)}:${i + 1}`);
      });
    }
  }
}
walk(root);

if (problems.length) {
  console.error(`em or en dash found:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log("ok: no em or en dashes");
