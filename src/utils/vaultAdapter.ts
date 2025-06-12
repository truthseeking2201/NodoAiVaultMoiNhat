import { Vault } from '@/types';
import { VaultData } from '@/types/vault';

/**
 * Adapts the Vault type to VaultData type for compatibility with existing components
 */
export function adaptVaultToVaultData(vault: Vault): VaultData {
  // Map risk level to the expected format
  const riskLevel = mapRiskLevel(vault.riskLevel);
  
  // Determine type based on vault name or tokens
  const type = determineVaultType(vault);
  
  return {
    id: vault.id,
    name: vault.name,
    type,
    tvl: vault.tvl,
    apr: vault.apr,
    apy: vault.apr * 1.05, // Simple estimation of APY from APR
    description: vault.description,
    riskLevel,
    strategy: vault.strategy,
    // Create default lockup periods
    lockupPeriods: [
      { days: 30, aprBoost: 0 },
      { days: 60, aprBoost: 1.5 },
      { days: 90, aprBoost: 3.0 }
    ],
    // Map performance data
    performance: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 100 + ((vault.performance.day / 100) * i)
      })),
      weekly: Array.from({ length: 12 }, (_, i) => ({
        date: `Week ${i + 1}`,
        value: 100 + ((vault.performance.week / 100) * i)
      })),
      monthly: Array.from({ length: 6 }, (_, i) => ({
        date: `Month ${i + 1}`,
        value: 100 + ((vault.performance.month / 100) * i)
      }))
    }
  };
}

/**
 * Maps the risk level string to the expected 'low', 'medium', or 'high' format
 */
function mapRiskLevel(riskLevel: string): 'low' | 'medium' | 'high' {
  riskLevel = riskLevel.toLowerCase();
  
  if (riskLevel.includes('low')) return 'low';
  if (riskLevel.includes('medium') || riskLevel.includes('mid')) return 'medium';
  if (riskLevel.includes('high')) return 'high';
  
  // Default to medium if unrecognized
  return 'medium';
}

/**
 * Determines vault type based on name or tokens
 */
function determineVaultType(vault: Vault): 'nova' | 'orion' | 'emerald' {
  const name = vault.name.toLowerCase();
  const tokens = vault.tokens.map(t => t.toLowerCase());
  
  // Check for specific tokens to determine type
  if (tokens.includes('btc') || tokens.includes('wbtc')) {
    return 'nova';
  }
  
  if (tokens.includes('eth') || tokens.includes('steth')) {
    return 'orion';
  }
  
  if (tokens.includes('usdc') || tokens.includes('usdt') || tokens.includes('dai')) {
    return 'emerald';
  }
  
  // Check name patterns
  if (name.includes('opportunity') || name.includes('high') || name.includes('arb')) {
    return 'nova';
  }
  
  if (name.includes('eth') || name.includes('stake')) {
    return 'orion';
  }
  
  if (name.includes('stable') || name.includes('usdc')) {
    return 'emerald';
  }
  
  // Default to emerald if no pattern matches
  return 'emerald';
}

/**
 * Adapts an array of Vault objects to VaultData objects
 */
export function adaptVaultsToVaultData(vaults: Vault[]): VaultData[] {
  return vaults.map(adaptVaultToVaultData);
} 