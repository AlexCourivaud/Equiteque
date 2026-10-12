import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "src/index.html",
      },
    },
    // Copier les fichiers JS et assets tels quels
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});

// Made with Bob
