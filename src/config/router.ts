export const PATH_ROUTER: Record<string, string> = {
  VAULTS: "/",
  VAULT_DETAIL: "/vault/:vault_id",
  VAULT_COMMUNITY: "/vault/:vault_id/community",
  VAULT_COMMUNITY_POOL: "/vault/:vault_id/community/:pool_id",
  LEADERBOARDS: "/leaderboards",
};

export const getPathVaultDetail = (vaultId: string) => {
  return PATH_ROUTER?.VAULT_DETAIL?.replace(":vault_id", vaultId);
};

export const getPathVaultCommunity = (vaultId: string) =>
  PATH_ROUTER.VAULT_COMMUNITY.replace(":vault_id", vaultId);

export const getPathCommunityPoolDetail = (vaultId: string, poolId: string) =>
  PATH_ROUTER.VAULT_COMMUNITY_POOL.replace(":vault_id", vaultId).replace(
    ":pool_id",
    poolId
  );
