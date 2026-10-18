import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * ESLint flat config.
 * - next/core-web-vitals: Next.js, React, React Hooks (incl. React Compiler rules), a11y, imports
 * - next/typescript: typescript-eslint recommended rules
 * - prettier (last): turns off every rule that would fight Prettier's formatting
 *
 * Staying on ESLint 9: eslint-plugin-react, -import and -jsx-a11y (bundled in
 * eslint-config-next) don't support ESLint 10 yet. Upgrade once they do.
 */
export default defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
