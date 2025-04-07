import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/diplom_march/",
  plugins: [react()],
  build: {
    assetsDir: "assets",
  },
});
