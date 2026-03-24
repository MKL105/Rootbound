import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    rules: {
      // 🧱 Code quality
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",

      // 🧠 Best practices
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-var": "error",
      "prefer-const": "warn",

      // 🧩 Readability
      "max-len": ["warn", { code: 80, ignoreUrls: true }],
      "max-depth": ["warn", 3],
      "max-lines-per-function": ["warn", 50],

      // 🔁 Complexity control
      "complexity": ["warn", 8],

      // 🔒 TypeScript-specific improvements
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",

      // 🧼 Style consistency
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
    },
  },
]);
