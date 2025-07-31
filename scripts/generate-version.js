#!/usr/bin/env node

/**
 * Script to generate a version.json file with a timestamp
 * This will be used by the app to check for new deployments
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get the directory name using ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output directory
const outputDir = path.resolve(__dirname, "../dist");
const versionFile = path.join(outputDir, "version.json");

// Generate a version identifier
// Using a timestamp ensures uniqueness across deployments
const version = new Date().toISOString();

// Check for force-update based on branch name when merging to deployment branch
function shouldForceUpdate() {
  try {
    const projectRoot = path.resolve(__dirname, "..");

    // Get current branch name
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      cwd: projectRoot,
    }).trim();

    console.log(`🌿 Current branch: ${currentBranch}`);

    // Check if we're on a deployment branch
    const deploymentBranches = ["main", "develop", "uat", "staging"];
    const isDeploymentBranch = deploymentBranches.includes(
      currentBranch.toLowerCase()
    );

    if (!isDeploymentBranch) {
      console.log(
        `ℹ️  Not on a deployment branch, skipping force-update check`
      );
      return false;
    }

    // Get the latest commit message to check if it's a merge commit
    const commitMessage = execSync("git log -1 --pretty=%B", {
      encoding: "utf8",
      cwd: projectRoot,
    }).trim();

    console.log(`📝 Latest commit message: ${commitMessage}`);

    // Check if this is a merge commit and extract source branch name
    const mergePatterns = [
      /Merge branch '([^']+)'/i, // Standard git merge: "Merge branch 'feature-branch'"
      /Merge pull request #\d+ from [^/]+\/([^\s]+)/i, // GitHub PR: "Merge pull request #123 from user/branch-name"
      /Merge branch '([^']+)' into/i, // Explicit merge: "Merge branch 'source' into target"
    ];

    for (const pattern of mergePatterns) {
      const match = commitMessage.match(pattern);
      if (match && match[1]) {
        const sourceBranch = match[1];
        console.log(`🔀 Detected merge from branch: ${sourceBranch}`);

        // Check if source branch name contains "force-update"
        const hasForceUpdate = sourceBranch
          .toLowerCase()
          .includes("force-update");
        console.log(`🔍 Branch contains 'force-update': ${hasForceUpdate}`);

        return hasForceUpdate;
      }
    }

    // Fallback: check if commit message itself contains "force-update"
    const messageHasForceUpdate = commitMessage
      .toLowerCase()
      .includes("force-update");
    console.log(
      `💬 Commit message contains 'force-update': ${messageHasForceUpdate}`
    );

    return messageHasForceUpdate;
  } catch (error) {
    console.warn(
      `⚠️  Could not determine force-update status: ${error.message}`
    );
    return false;
  }
}

// Create version data
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);

const forceUpdate = shouldForceUpdate();

const versionData = {
  version,
  timestamp: Date.now(),
  generated: new Date().toISOString(),
  semanticVersion: packageJson.version,
  forceUpdate,
};

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the version file
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log(`✅ Generated version.json with version: ${version}`);
console.log(`🔄 Force update: ${forceUpdate}`);
