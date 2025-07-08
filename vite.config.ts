import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
// import { viteSsgPlugin } from "./src/plugins/vite-ssg-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
