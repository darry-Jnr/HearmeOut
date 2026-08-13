import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Vite builds a plain static web app. Tailwind generates the CSS classes.
export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: true,
  },
});
