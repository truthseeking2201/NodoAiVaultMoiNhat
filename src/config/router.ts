export const PATH_ROUTER: Record<string, string> = {
  VAULTS: "/",
  VAULT_DETAIL: "/vault/:vault_id",
  // LEADERBOARDS: "/leaderboards",
};

export const getPathVaultDetail = (vaultId: string) => {
  return PATH_ROUTER?.VAULT_DETAIL?.replace(":vault_id", vaultId);
};
