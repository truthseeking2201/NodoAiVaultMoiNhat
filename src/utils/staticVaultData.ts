import { getDepositVaults } from "@/apis/vault";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { QueryClient } from "@tanstack/react-query";

// Cache for the loaded static data
let staticVaultData: DepositVaultConfig[] | null = null;

/**
 * Load vault data from static JSON file (generated at build time)
 * Falls back to API call if static data is not available
 */

export async function loadVaultData(
  queryClient: QueryClient
): Promise<DepositVaultConfig[]> {
  try {
    // Try to load static data first
    const response = await fetch("/vault-data.json");
    if (response.ok) {
      const responseData = await response.json();
      staticVaultData = responseData.data;
    }
  } catch (error) {
    console.warn("⚠️ Static vault data not found, falling back to API");
  }

  // Fallback to API call
  try {
    getDepositVaults().then((res) => {
      queryClient.setQueryData(["deposit-vaults-data"], res);
    });
  } catch (error) {
    console.error("❌ Failed to load vault data from API:", error);
    throw error;
  }

  return staticVaultData;
}
