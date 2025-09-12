import { normalizeSuiAddress } from "@mysten/sui/utils";

function normalizeSuiType(typeStr: string): string {
  const parts = typeStr.split("::");
  const normalizedAddr = normalizeSuiAddress(parts[0]);
  return [normalizedAddr, ...parts.slice(1)].join("::");
}

export function compareSuiTypes(typeA: string, typeB: string): boolean {
  if (!typeA || !typeB) return;
  return normalizeSuiType(typeA) === normalizeSuiType(typeB);
}

export function compareSuiAddresses(addrA: string, addrB: string): boolean {
  if (!addrA || !addrB) return;
  return normalizeSuiAddress(addrA) === normalizeSuiAddress(addrB);
}
