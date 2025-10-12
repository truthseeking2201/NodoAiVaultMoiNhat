import type { Quest } from "@/lib/quest-types";

const VAULT_ID_MAP: Record<string, string> = {
  vault_usdc_sui: "0xvault-usdc-sui",
  vault_usdt_sui: "0xvault-usdc-sui",
  vault_sui: "0xvault-usdc-sui",
};

const VAULT_LABEL_MAP: Record<string, string> = {
  "0xvault-usdc-sui": "Vault: USDC/SUI",
  "0xvault-btc-eth": "Vault: BTC/ETH",
  any: "Vault: Any",
  vault_usdc_sui: "Vault: USDC/SUI",
  vault_usdt_sui: "Vault: Dual Vault",
  vault_sui: "Vault: SUI",
};

export const resolveQuestVaultId = (quest: Quest) => {
  if (!quest.vaultIdRequired || quest.vaultIdRequired === "any") {
    return undefined;
  }
  return VAULT_ID_MAP[quest.vaultIdRequired] ?? quest.vaultIdRequired;
};

export const questVaultLabel = (quest: Quest) => {
  if (!quest.vaultIdRequired) {
    return null;
  }
  return (
    VAULT_LABEL_MAP[quest.vaultIdRequired] ??
    VAULT_LABEL_MAP[resolveQuestVaultId(quest) ?? ""] ??
    `Vault: ${quest.vaultIdRequired}`
  );
};
