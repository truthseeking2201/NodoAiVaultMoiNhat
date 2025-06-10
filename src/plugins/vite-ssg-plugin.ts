import axios from "axios";
import CryptoJS from "crypto-js";
import { Plugin, loadEnv } from "vite";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

/**
 * Vite plugin for Static Site Generation - pre-fetches data at build time
 */

async function generateVaultData() {
  // Load environment variables
  const mode = process.env.NODE_ENV || "development";
  const env = loadEnv(mode, process.cwd(), "");

  // Access environment variables
  const baseURL = env.VITE_NODO_APP_URL;

  if (!baseURL) {
    throw new Error("VITE_NODO_APP_URL_API_KEY is not set");
  }

  try {
    // Construct full URL using environment variable
    const fullUrl = `${baseURL}/data-management/vaults`;

    const method = "GET";
    const fullPath = "/data-management/vaults";

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

    console.log(`✅ Generated vault-data.json`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch vault-data.json:`, error);
    // Don't fail the build, just warn
  }
}

export function viteSsgPlugin(): Plugin {
  return {
    name: "vite-ssg-plugin",
    async buildStart() {
      console.log("🚀 Starting SSG data pre-fetching...");
      const mode = process.env.NODE_ENV || "development";
      if (mode === "development") {
        const publicPath = join(process.cwd(), "public", "vault-data.json");
        const publicDir = dirname(publicPath);

        // Ensure directory exists
        mkdirSync(publicDir, { recursive: true });

        // Write file to public folder

        const response = await generateVaultData();
        writeFileSync(publicPath, JSON.stringify({ ...response }, null, 2));
        console.log(
          `✅ Generated vault-data.json in public folder (development mode)`
        );
      }
    },
    async generateBundle(outputOptions, bundle) {
      const response = await generateVaultData();

      this.emitFile({
        type: "asset",
        fileName: "vault-data.json",
        source: JSON.stringify({ ...response.data }, null, 2),
      });
    },
  };
}
