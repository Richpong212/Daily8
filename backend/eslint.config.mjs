import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["build", "dist", "node_modules"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "error",
      "no-unused-vars": "off",
      "no-undef": "error",
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-useless-return": "error",
      "object-shorthand": ["error", "always"],

      "no-sync": "error",
      "no-process-exit": "error",
      "callback-return": ["error", ["callback", "cb", "next"]],
      "handle-callback-err": ["error", "^err"],
      "no-path-concat": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
