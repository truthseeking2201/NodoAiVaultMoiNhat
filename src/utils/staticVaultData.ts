import { getDepositVaults } from "@/apis/vault";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { QueryClient } from "@tanstack/react-query";

// Cache for the loaded static data
let staticVaultData: DepositVaultConfig[];
let hasLoadStaticData = false;
/**
 * Load vault data from static JSON file (generated at build time)
 * Falls back to API call if static data is not available
 */

async function loadRealTimeData() {
  return getDepositVaults().then((res: any) => {
    const latestVaults = res.map((item) => {
      return { ...item, ready: true };
    });
    return latestVaults;
  });
}

export async function loadVaultData(
  queryClient: QueryClient
): Promise<DepositVaultConfig[]> {
  try {
    if (!hasLoadStaticData) {
      // Try to load static data first
      const response = await fetch("/vault-data.json");
      if (response.ok) {
        const responseData = (await response.json()) as {
          data: DepositVaultConfig[];
        };
        staticVaultData = responseData.data.map((item) => {
          return { ...item, apr: 0 };
        });
      }

      loadRealTimeData().then((latestVaults) => {
        queryClient.setQueryData(["deposit-vaults-data"], latestVaults);
      });
    }
  } catch (error) {
    console.warn("⚠️ Static vault data not found, using real time data");
  }

  if (hasLoadStaticData) {
    staticVaultData = await loadRealTimeData();
  }

  hasLoadStaticData = true;

  return staticVaultData;
}
