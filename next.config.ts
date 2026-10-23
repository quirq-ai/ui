import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

// Registry items are installed from (and depend on) this origin, so docs commands use it too.
const registry = JSON.parse(readFileSync("./registry.json", "utf8")) as {
  homepage: string;
};

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    // The scoped babel-loader rule below is intentional (StyleX in registry templates only);
    // there is no babel config file, so the built-in loader stays off either way.
    turbopackUseBuiltinBabel: true,
  },
  env: {
    // The registry URL lives only in registry.json "homepage" (see scripts/build-registry.mjs).
    NEXT_PUBLIC_REGISTRY_ORIGIN: registry.homepage.replace(/\/+$/, ""),
  },
  async redirects() {
    return [{ source: "/", destination: "/docs", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // Astryx itself ships precompiled (dist + astryx.css), but ~26 block and page
      // templates call stylex.create() in their own code. Compile only those files,
      // injecting their styles at runtime so no extra CSS pipeline is needed.
      "*.tsx": {
        condition: {
          all: [
            { not: "foreign" },
            { path: /^registry\/astryx\// },
            { content: /@stylexjs\/stylex/ },
          ],
        },
        loaders: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              configFile: false,
              plugins: [
                ["@babel/plugin-syntax-typescript", { isTSX: true }],
                [
                  "@stylexjs/babel-plugin",
                  {
                    dev: process.env.NODE_ENV === "development",
                    runtimeInjection: true,
                    treeshakeCompensation: true,
                    unstable_moduleResolution: {
                      type: "commonJS",
                      rootDir: process.cwd(),
                    },
                  },
                ],
              ],
            },
          },
        ],
        as: "*.tsx",
      },
    },
  },
};

export default nextConfig;
