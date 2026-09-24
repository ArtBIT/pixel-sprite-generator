import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // relative paths so the build works from the GitHub Pages sub path
  base: "./",
  plugins: [react()],
  server: { port: 4000 },
  build: { outDir: "demo", emptyOutDir: true },
  test: { environment: "jsdom" },
});
