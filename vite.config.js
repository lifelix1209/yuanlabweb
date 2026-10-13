import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["3d739047.r5.cpolar.top"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    coverage: {
      include: ["src/i18n/**", "src/lib/**", "src/components/hero/neuralCrestGeometry.js", "src/components/intro/**"],
    },
  },
});
