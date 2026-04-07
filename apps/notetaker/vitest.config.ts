import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    globalSetup: ["./src/testSetups/globalSetup.ts"],
    setupFiles: ["./src/testSetups/viTestSetup.ts"],
    coverage: {
      exclude: [
        "dist/**",
        "dist/assets/**",
        "**/dist/**",
        "**/dist/assets/**",
        "**/src/routes/**",
        "**/src/setup/**",
        "notetaker/**/*.d.ts",
        "eslint.config.js",
        "prettier.config.js",
        "vite.config.ts",
        "vitest.config.ts",
        "**/routeTree.gen.ts",
        "**/router.tsx",
        "**/types.ts",
        "**/testSetups/**",
        "**/android/**",
        "**/ios/**",
        "**/capacitor.config.ts",
      ],
    },
  },
})
