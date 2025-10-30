import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-gsap": ["gsap"],
          "vendor-charts": ["recharts"],
          "vendor-pb": ["pocketbase"],
          
          // Feature-based chunks
          "forms": [
            "./src/components/FormSection.jsx",
            "./src/components/TournamentFormSection.jsx",
            "./src/components/FormField.jsx",
            "./src/components/SelectField.jsx",
            "./src/components/MultiSelectField.jsx",
            "./src/components/AutocompleteField.jsx",
            "./src/services/applicationService.ts",
          ],
          "ui-effects": [
            "./src/components/Orb.tsx",
            "./src/components/FireworksBackground.tsx",
            "./src/components/TextGenerateEffect.tsx",
            "./src/components/ErrorModal.tsx",
            "./src/components/SuccessModal.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 650,
  },
});
