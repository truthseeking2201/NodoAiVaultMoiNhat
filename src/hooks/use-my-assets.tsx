import { getDepositTokens } from "@/apis";
import { getNdlpPrices } from "@/apis/token";
import {
  COIN_TYPES_CONFIG,
  LP_TOKEN_CONFIG,
  SUI_CONFIG,
  TOKEN_REWARDS,
} from "@/config/coin-config";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { getBalanceAmountForInput } from "@/lib/number";
import { NdlpAsset, UserCoinAsset } from "@/types/coin.types";
import { VaultDepositToken } from "@/types/payment-token.types";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo } from "react";
import { useNdlpAssetsStore, useUserAssetsStore } from "./use-store";
import { NdlpTokenPrice } from "./use-token-price";
import { useWallet } from "./use-wallet";

const getCoinsBalance = async (
  suiClient: SuiClient,
  address: string,
  coinTypes: string[]
) => {
  const allBalances = await suiClient.getAllBalances({ owner: address });
  const data = coinTypes.map((coinType) => {
    const _coinType =
      coinType == SUI_CONFIG.coinType ? SUI_CONFIG.shortType : coinType;
    return {
      coinType,
      totalBalance:
        allBalances.find((i) => i.coinType == _coinType)?.totalBalance || "0",
    };
  });
  return data;
};

const getCoinsBalanceWithUsdPrice = async (
  suiClient: SuiClient,
  address: string,
  coinTypes: string[],
  vaults: DepositVaultConfig[]
) => {
  const vaultIds = vaults.map((vault) => vault.vault_id) || [];
  const [balancesResult, ndlpPricesResult] = await Promise.allSettled([
    getCoinsBalance(suiClient, address, coinTypes),
    getNdlpPrices(vaultIds),
  ]);

  const balances =
    balancesResult.status === "fulfilled" ? balancesResult.value : [];

  let ndlpPrices: NdlpTokenPrice[] = [];
  if (ndlpPricesResult.status === "fulfilled") {
    ndlpPrices = ndlpPricesResult.value as unknown as NdlpTokenPrice[];
  } else {
    console.error("Fail to get ndlp prices", ndlpPricesResult.reason);
  }

  return balances.map((balance) => {
    const matchVault = vaults.find(
      (vault) => vault.vault_lp_token === balance.coinType
    );
    const usdPrice = ndlpPrices.find(
      (price) => price.vault_id === matchVault?.vault_id
    )?.ndlp_price_usd;

    return {
      coinType:
        balance.coinType == SUI_CONFIG.shortType
          ? SUI_CONFIG.coinType
          : balance.coinType,
      totalBalance: balance.totalBalance,
      usd_price: usdPrice,
      vault: {
        pool: {
          pool_name: matchVault?.pool.pool_name,
        },
        exchange_id: matchVault?.exchange_id,
        vault_name: matchVault?.vault_name,
        vault_id: matchVault?.vault_id,
      },
    };
  });
};

export const useFetchAssets = () => {
  const { setAssets, setUpdated, updated, isRefetch, isLoading, setIsLoading } =
    useUserAssetsStore();
  const { address, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();

  const { data: depositTokens } = useQuery<VaultDepositToken[]>({
    queryKey: ["depositTokens"],
    queryFn: async () => {
      const response =
        (await getDepositTokens()) as unknown as VaultDepositToken[];

      // add token rewards
      TOKEN_REWARDS?.forEach((token, idx) => {
        response.push({
          token_id: 9999 + idx,
          token_symbol: token.symbol,
          token_name: token.display_name,
          token_address: token.id,
          decimal: token.decimals,
        });
      });
      const uniqueTokensResponse = response.filter(
        (token, index, self) =>
          index ===
          self.findIndex((t) => t.token_address === token.token_address)
      );
      if (uniqueTokensResponse?.length > 0) {
        localStorage.setItem(
          "cached-deposit-tokens",
          JSON.stringify(uniqueTokensResponse)
        );
      }
      return uniqueTokensResponse;
    },
    initialData: JSON.parse(
      localStorage.getItem("cached-deposit-tokens") || "[]"
    ) as VaultDepositToken[],
    refetchOnWindowFocus: false,
  });

  const {
    data: allCoinObjects = [],
    isLoading: allCoinObjectsLoading,
    isFetching: allCoinObjectsFetching,
    refetch: allCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["allCoinObjects", address],
    queryFn: () =>
      getCoinsBalance(
        suiClient,
        address || "",
        depositTokens?.map((token) => token.token_address)
      ),
    enabled: isAuthenticated && !!address && depositTokens?.length > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const isFetching = allCoinObjectsFetching || allCoinObjectsLoading;
    if (isFetching) return;

    if (allCoinObjects.length === 0 && isLoading) {
      setIsLoading(false);
      return;
    }

    if (updated) {
      return;
    }

    // map assets from allCoinObjects
    const assets: UserCoinAsset[] =
      allCoinObjects.reduce((acc, coin) => {
        const coinType = coin.coinType;
        const coinMetadata = depositTokens?.find(
          (token) => token.token_address === coinType
        );
        const decimals = coinMetadata?.decimal;

        const tokenDisplay = COIN_TYPES_CONFIG.collateral_tokens.find(
          (token) => token.id === coinType
        );

        acc.push({
          coin_type: coinType,
          balance: "0",
          raw_balance: coin.totalBalance,
          image_url:
            tokenDisplay?.image_url ||
            `/coins/${coinMetadata?.token_symbol}.png`,
          decimals: decimals,
          display_name:
            tokenDisplay?.display_name || coinMetadata?.token_name || "",
          name: tokenDisplay?.display_name || coinMetadata?.token_name || "",
          symbol: coinMetadata?.token_symbol || "",
        });
        return acc;
      }, []) || [];

    if (assets.length > 0) {
      const updatedAssets = assets.map((asset) => {
        const balance = getBalanceAmountForInput(
          asset.raw_balance,
          asset.decimals,
          asset.decimals
        ).toString();
        return {
          ...asset,
          raw_balance: new BigNumber(asset.raw_balance).toString(),
          balance: balance,
        };
      });

      setAssets(updatedAssets);
    }
  }, [
    allCoinObjects,
    updated,
    depositTokens,
    setAssets,
    allCoinObjectsLoading,
    allCoinObjectsFetching,
    isLoading,
    setIsLoading,
  ]);

  useEffect(() => {
    if (isRefetch) {
      allCoinObjectsRefetch().then(() => {
        setUpdated(false);
      });
    }
  }, [isRefetch, allCoinObjectsRefetch, setUpdated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(() => {
        allCoinObjectsRefetch().then(() => {
          setUpdated(false);
        });
      }, REFETCH_VAULT_DATA_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [allCoinObjectsRefetch, isAuthenticated, setUpdated]);
};

export const useFetchNDLPAssets = (vaults: DepositVaultConfig[]) => {
  const { setAssets, setUpdated, updated, isRefetch, isLoading, setIsLoading } =
    useNdlpAssetsStore();
  const { address, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();
  const ndlpCoinTypes = useMemo(() => {
    return vaults?.map((vault) => vault.vault_lp_token) || [];
  }, [vaults]);

  const {
    data: allCoinObjectsNDLP = [],
    isLoading: allCoinObjectsNDLPLoading,
    isFetching: allCoinObjectsNDLPFetching,
    refetch: allCoinObjectsNDLPRefetch,
  } = useQuery({
    queryKey: ["allCoinObjectsNDLP", address],
    queryFn: () =>
      getCoinsBalanceWithUsdPrice(
        suiClient,
        address || "",
        ndlpCoinTypes,
        vaults
      ),
    enabled: isAuthenticated && !!address && ndlpCoinTypes.length > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const isFetching = allCoinObjectsNDLPFetching || allCoinObjectsNDLPLoading;
    if (isFetching) return;

    if (allCoinObjectsNDLP.length === 0 && isLoading) {
      setIsLoading(false);
      return;
    }

    if (updated) {
      return;
    }

    const assets: NdlpAsset[] =
      allCoinObjectsNDLP.reduce((acc, coin) => {
        const coinType = coin.coinType;
        const vault = vaults.find((i) => i.vault_lp_token === coinType);
        const tokenDisplay = LP_TOKEN_CONFIG;

        acc.push({
          coin_type: coinType,
          balance: "0",
          raw_balance: coin.totalBalance,
          image_url: tokenDisplay?.image_url || "",
          decimals: vault.vault_lp_token_decimals,
          display_name: tokenDisplay?.display_name || "",
          name: tokenDisplay?.display_name || "",
          symbol: tokenDisplay?.symbol || "",
          vault: coin.vault || null,
          usd_price: coin.usd_price,
        });
        return acc;
      }, []) || [];

    if (assets.length > 0) {
      const updatedAssets = assets.map((asset) => {
        const balance = getBalanceAmountForInput(
          asset.raw_balance,
          asset.decimals,
          asset.decimals
        ).toString();
        return {
          ...asset,
          raw_balance: new BigNumber(asset.raw_balance).toString(),
          balance: balance,
          balance_usd: asset.usd_price
            ? new BigNumber(balance)
                .multipliedBy(new BigNumber(asset.usd_price))
                .toString()
            : "",
        };
      });

      setAssets(updatedAssets);
    }
  }, [
    allCoinObjectsNDLP,
    updated,
    setAssets,
    allCoinObjectsNDLPFetching,
    allCoinObjectsNDLPLoading,
    isLoading,
    vaults,
    setIsLoading,
  ]);

  useEffect(() => {
    if (isRefetch) {
      allCoinObjectsNDLPRefetch().then(() => {
        setUpdated(false);
      });
    }
  }, [isRefetch, allCoinObjectsNDLPRefetch, setUpdated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(() => {
        allCoinObjectsNDLPRefetch().then(() => {
          setUpdated(false);
        });
      }, REFETCH_VAULT_DATA_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [allCoinObjectsNDLPRefetch, isAuthenticated, setUpdated]);
};

export const useRefreshAssetsBalance = () => {
  const { setRefetch: setUserRefetch } = useUserAssetsStore();
  const { setRefetch: setNdlpRefetch } = useNdlpAssetsStore();

  const refreshAllBalance = useCallback(() => {
    setUserRefetch();
    setNdlpRefetch();
  }, [setUserRefetch, setNdlpRefetch]);

  return { refreshAllBalance };
};
