// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://Diego303.github.io",
  base: "Portfolio",
  // Los posts se publican como blog/<slug>.html, que es la URL que enlazan las tarjetas de Documentos.
  build: { format: "file" },
});
