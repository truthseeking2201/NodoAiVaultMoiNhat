import axios from "axios";
import CryptoJS from "crypto-js";
import { Plugin, loadEnv } from "vite";

interface SSGOptions {
  dataEndpoints: {
    name: string;
    url: string;
    outputPath: string;
  }[];
}

/**
 * Vite plugin for Static Site Generation - pre-fetches data at build time
 */
export function viteSsgPlugin(options: SSGOptions): Plugin {
  return {
    name: "vite-ssg-plugin",
    buildStart() {
      console.log("🚀 Starting SSG data pre-fetching...");
    },
    async generateBundle(outputOptions, bundle) {
      // Load environment variables
      const mode = process.env.NODE_ENV || "development";
      const env = loadEnv(mode, process.cwd(), "");

      // Access environment variables
      const baseURL = env.VITE_NODO_APP_URL_API_KEY;

      if (!baseURL) {
        throw new Error("VITE_NODO_APP_URL_API_KEY is not set");
      }

      for (const endpoint of options.dataEndpoints) {
        try {
          // Construct full URL using environment variable
          const fullUrl = endpoint.url.startsWith("http")
            ? endpoint.url
            : `${baseURL}${endpoint.url}`;

          const method = "GET";
          const fullPath = endpoint.url;

          const timestamp = Math.floor(Date.now() / 1000).toString();
          const bodyString = "";

          const rawString = `${method}${fullPath}${bodyString}${timestamp}`;
          const signature = CryptoJS.HmacSHA256(
            rawString,
            env.VITE_NODO_APP_URL_API_KEY_API_SECRET
          ).toString();

          const response = await axios.get(fullUrl, {
            headers: {
              "x-api-key": env.VITE_NODO_APP_URL_API_KEY,
              "x-timestamp": timestamp,
              "x-signature": signature,
            },
          });

          // Emit the file to the bundle
          this.emitFile({
            type: "asset",
            fileName: endpoint.outputPath,
            source: JSON.stringify({ data: response.data }, null, 2),
          });

          console.log(`✅ Generated ${endpoint.outputPath}`);
        } catch (error) {
          console.error(`❌ Failed to fetch ${endpoint.name}:`, error);
          // Don't fail the build, just warn
        }
      }
    },
  };
}
