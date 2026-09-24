import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    "**/node_modules/**",
    ".git/**",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "env.d.ts",
    "next-env.d.ts",
    "types/**",
    // Local extracted design reference
    "reference/**",
    // Preview/build artifacts (OpenNext + Vercel adapter dumps)
    ".vercel/**",
    ".open-next/**",
    ".wrangler/**",
    // Standalone Workers (own tsconfig/typecheck)
    "workers/**",
  ]),
]);

export default eslintConfig;
