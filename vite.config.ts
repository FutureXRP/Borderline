import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages base path must match the repo name exactly (case-sensitive)
export default defineConfig({
  plugins: [react()],
  base: "/Borderline/",
});
