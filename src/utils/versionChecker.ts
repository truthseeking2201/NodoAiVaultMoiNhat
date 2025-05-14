/**
 * Version checker utility for auto-refreshing the app when a new deployment is detected
 */

import { toast } from "sonner";

// This will be set during build time
const VERSION_FILE_PATH = "/version.json";
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

let currentVersion: string | null = null;

/**
 * Fetches the current version from the version file
 */
const fetchVersion = async (): Promise<string | null> => {
  try {
    // Add cache-busting parameter to avoid CloudFront/browser caching
    const response = await fetch(`${VERSION_FILE_PATH}?t=${Date.now()}`);
    if (!response.ok) {
      console.warn("Failed to fetch version file:", response.status);
      return null;
    }

    const data = await response.json();
    return data.version || null;
  } catch (error) {
    console.warn("Error fetching version:", error);
    return null;
  }
};

/**
 * Initializes the version checker
 */
export const initVersionChecker = async (): Promise<void> => {
  // Skip for development environment
  if (import.meta.env.DEV) {
    console.log("Version checker disabled in development mode");
    return;
  }

  try {
    // Get initial version
    currentVersion = await fetchVersion();

    if (!currentVersion) {
      console.warn(
        "Could not determine initial version, disabling version checker"
      );
      return;
    }

    console.log("Version checker initialized with version:", currentVersion);

    // Start periodic checking
    setInterval(async () => {
      const newVersion = await fetchVersion();
      const isNewVersion = newVersion && newVersion !== currentVersion;
      if (isNewVersion) {
        console.log(
          `New version detected: ${currentVersion} → ${newVersion}. Refreshing...`
        );
        toast.info("A new version is available. Click here to refresh.", {
          duration: CHECK_INTERVAL / 2,
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
          closeButton: true,
          invert: true,
        });
      }
    }, CHECK_INTERVAL);
  } catch (error) {
    console.error("Error initializing version checker:", error);
  }
};
