import { DepositVaultConfig } from "@/types/vault-config.types";
import { getDepositVaults } from "@/apis/vault";

// Cache for the loaded static data
let staticVaultData: any = null;
let staticDataLoaded = false;

/**
 * Load vault data from static JSON file (generated at build time)
 * Falls back to API call if static data is not available
 */

export async function loadVaultData(): Promise<DepositVaultConfig[]> {
  // // Return cached data if already loaded
  // if (staticDataLoaded && staticVaultData) {
  //   return staticVaultData;
  // }

  try {
    // Try to load static data first
    const response = await fetch("/vault-data.json");
    if (response.ok) {
      staticDataLoaded = true;
      const responseData = await response.json();
      staticVaultData = responseData.data;
    }
  } catch (error) {
    console.warn("⚠️ Static vault data not found, falling back to API");
  }

  // Fallback to API call
  try {
    getDepositVaults().then((res) => {
      // console.log("✅ Loaded vault data from API", res);
      // queryClient.setQueryData(["deposit-vaults-data"], []);
    });
  } catch (error) {
    console.error("❌ Failed to load vault data from API:", error);
    throw error;
  }

  return staticVaultData;
}

/**
 * Check if static vault data is available
 */
export function hasStaticVaultData(): boolean {
  return staticDataLoaded && staticVaultData !== null;
}

/**
 * Get cached vault data (returns null if not loaded yet)
 */
export function getCachedVaultData(): DepositVaultConfig[] | null {
  return staticVaultData;
}
