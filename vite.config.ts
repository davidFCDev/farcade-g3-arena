import { remixPlugin } from "@insidethesim/remix-dev/vite";
import { defineConfig } from "vite";
import remixConfig from "./remix.config";

export default defineConfig({
  plugins: [remixPlugin(remixConfig)],
  build: {
    rollupOptions: {
      // Phaser is loaded via CDN <script> tag — never bundle it
      external: ["phaser"],
      output: {
        globals: {
          phaser: "Phaser",
        },
      },
    },
  },
});
