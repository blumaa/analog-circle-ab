import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const vitestGlobals = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  vi: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
};

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/*.config.{js,ts,cjs,mjs}",
      "**/.storybook/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.{test,stories}.{ts,tsx}", "**/scripts/**", "**/seed/**"],
    languageOptions: {
      globals: { ...globals.node, ...vitestGlobals },
    },
    rules: {
      // Storybook render props / test helpers legitimately call hooks in
      // functions not named like components.
      "react-hooks/rules-of-hooks": "off",
    },
  },
);
