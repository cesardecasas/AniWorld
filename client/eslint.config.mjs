import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // Jest mocks and setup are CommonJS
    files: ["__tests__/**", "__mocks__/**", "__mock__/**", "jest.setup.js", "jest.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // The pages router UI is rebuilt in the App Router in Phase 3; until then, flag rather than fail
    files: ["pages/**", "components/**"],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  { ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**", "next-env.d.ts"] },
];

export default config;
