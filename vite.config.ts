import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    server: {
      host: "::",
      port: 8080,
      headers: {
        // Prevent Clickjacking attacks
        "X-Frame-Options": "DENY",
        // Other security headers
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy":
          "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; media-src 'self' https://d2g8s4wkah5pic.cloudfront.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
        ...(isProduction && {
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }),
      },
    },
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
