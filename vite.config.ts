import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages: set base to repo name when deploying.
// For local dev, "/" is fine. Before deploy, set to "/<repo-name>/"
export default defineConfig({
  plugins: [react()],
  base: "/",
});
