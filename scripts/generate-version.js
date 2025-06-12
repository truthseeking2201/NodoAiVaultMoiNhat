#!/usr/bin/env node

/**
 * Script to generate a version.json file with a timestamp
 * This will be used by the app to check for new deployments
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name using ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output directory
const outputDir = path.resolve(__dirname, "../dist");
const versionFile = path.join(outputDir, "version.json");

// Generate a version identifier
// Using a timestamp ensures uniqueness across deployments
const version = new Date().toISOString();

// Create version data
const versionData = {
  version,
  timestamp: Date.now(),
  generated: new Date().toISOString(),
};

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the version file
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log(`✅ Generated version.json with version: ${version}`);
