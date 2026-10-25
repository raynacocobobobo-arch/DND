import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["client/test/setup.ts"],
    include: ["server/test/**/*.test.ts", "client/test/**/*.test.ts", "client/test/**/*.test.tsx"],
    clearMocks: true,
    restoreMocks: true
  }
});
