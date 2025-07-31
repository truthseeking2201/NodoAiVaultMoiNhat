import {
  COIN_TYPES_CONFIG,
  LP_TOKEN_CONFIG,
  SUI_CONFIG,
  USDC_CONFIG,
} from "@/config/coin-config";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { getBalanceAmountForInput } from "@/lib/number";
import { roundDownBalance } from "@/lib/utils";
import { UserCoinAsset } from "@/types/coin.types";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { CoinMetadata, SuiClient } from "@mysten/sui/client";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo } from "react";
import { useNdlpAssetsStore, useUserAssetsStore } from "./use-store";
import { useCurrentDepositVault } from "./use-vault";
import { useWallet } from "./use-wallet";

const getCoinObjects = async (
  suiClient: SuiClient,
  coinType: string,
  address: string
) => {
  let allCoins = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    // Get a page of coins with optional cursor
    const coinsPage = await suiClient.getCoins({
      owner: address,
      cursor: cursor,
      coinType: coinType,
      limit: 50, // Number of items per page (default is 50)
    });

    // Add coins from this page to our collection
    allCoins = [...allCoins, ...coinsPage.data];

    // Update the cursor for the next page
    cursor = coinsPage.nextCursor;

    // Check if there are more pages
    hasNextPage = coinsPage.hasNextPage;
  }
  return allCoins;
};

const getAllCoinObjects = async (suiClient: SuiClient, address: string) => {
  let allCoins = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    // Get a page of coins with optional cursor
    const coinsPage = await suiClient.getAllCoins({
      owner: address,
      cursor: cursor,
      limit: 50, // Number of items per page (default is 50)
    });

    // Add coins from this page to our collection
    allCoins = [...allCoins, ...coinsPage.data];

    // Update the cursor for the next page
    cursor = coinsPage.nextCursor;

    // Check if there are more pages
    hasNextPage = coinsPage.hasNextPage;
  }
  return allCoins.map((c) => {
    return {
      ...c,
      // map to full 32-byte address representation for sui coin type
      coinType:
        c.coinType === SUI_CONFIG.shortType ? SUI_CONFIG.coinType : c.coinType,
    };
  });
};

const getCoinsBalance = async (
  suiClient: SuiClient,
  address: string,
  coinTypes: string[]
) => {
  const balances = await Promise.all(
    coinTypes.map((coinType) =>
      suiClient.getBalance({ owner: address, coinType })
    )
  );
  return balances.map((balance) => {
    return {
      coinType:
        balance.coinType == SUI_CONFIG.shortType
          ? SUI_CONFIG.coinType
          : balance.coinType,
      totalBalance: balance.totalBalance,
    };
  });
};

export const useMyAssets = () => {
  const { address: currentAddress, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  const currentVault = useCurrentDepositVault();

  // Clear cache when account address becomes empty
  useEffect(() => {
    if (!currentAddress) {
      queryClient.removeQueries({ queryKey: ["lpCoinObjects"] });
      queryClient.removeQueries({ queryKey: ["collateralCoinObjects"] });
    }
  }, [currentAddress, queryClient]);

  const {
    data: lpCoinObjects,
    isLoading: lpCoinObjectsLoading,
    refetch: lpCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["lpCoinObjects", currentAddress, currentVault.vault_id],
    queryFn: () =>
      getCoinObjects(
        suiClient,
        currentVault.vault_lp_token,
        currentAddress || ""
      ),
    enabled: isAuthenticated,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  });

  const {
    data: collateralCoinObjects,
    isLoading: collateralCoinObjectsLoading,
    refetch: collateralCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["collateralCoinObjects", currentAddress],
    queryFn: () =>
      getCoinObjects(
        suiClient,
        currentVault.collateral_token,
        currentAddress || ""
      ),
    enabled: isAuthenticated,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  });

  const refreshBalance = useCallback(() => {
    lpCoinObjectsRefetch();
    collateralCoinObjectsRefetch();
  }, [lpCoinObjectsRefetch, collateralCoinObjectsRefetch]);

  const coinMetadata = useGetCoinsMetadata();
  const coinObjects = useMemo(() => {
    let res = [];
    if (lpCoinObjects && lpCoinObjects.length > 0) {
      res = [...res, ...lpCoinObjects];
    } else {
      res = [
        ...res,
        {
          coinType: currentVault.vault_lp_token,
          balance: 0,
        },
      ];
    }

    if (collateralCoinObjects && collateralCoinObjects.length > 0) {
      res = [...res, ...collateralCoinObjects];
    } else {
      res = [
        ...res,
        {
          coinType: currentVault.collateral_token,
          balance: 0,
        },
      ];
    }

    return res;
  }, [
    lpCoinObjects,
    collateralCoinObjects,
    currentVault.vault_lp_token,
    currentVault.collateral_token,
  ]);

  const assets: UserCoinAsset[] =
    coinObjects.reduce((acc, coin) => {
      const metadata = coinMetadata[coin.coinType] as CoinMetadata;
      const decimals = metadata?.decimals || 9;
      const rawBalance = Number(coin.balance || "0");
      const balance = rawBalance / Math.pow(10, decimals);

      const collateralToken = COIN_TYPES_CONFIG.collateral_tokens.find(
        (token) => token.id === coin.coinType
      );

      const existingAsset = acc.find(
        (asset) => asset.coin_type === coin.coinType
      );
      if (existingAsset) {
        existingAsset.balance += balance;
        existingAsset.raw_balance += rawBalance;
      } else {
        acc.push({
          coin_type: coin.coinType,
          balance,
          raw_balance: rawBalance,
          image_url: collateralToken
            ? collateralToken.image_url
            : LP_TOKEN_CONFIG.image_url,
          decimals: decimals,
          display_name: collateralToken
            ? collateralToken.display_name
            : LP_TOKEN_CONFIG.display_name,
          name: metadata?.name,
          symbol: metadata?.symbol,
        });
      }
      return acc;
    }, []) || [];

  return {
    assets: assets.map((asset) => ({
      ...asset,
      balance: getBalanceAmountForInput(
        asset.raw_balance,
        asset.decimals,
        asset.decimals
      ),
    })),
    isLoading: lpCoinObjectsLoading || collateralCoinObjectsLoading,
    refreshBalance,
  };
};

export const useGetCoinsMetadata = () => {
  const suiClient = useSuiClient();
  const currentVault = useCurrentDepositVault();

  const allowedCoinTypes = useMemo(() => {
    return [currentVault?.vault_lp_token, currentVault.collateral_token];
  }, [currentVault]);

  const coinsMetadata = useQueries({
    queries: allowedCoinTypes.map((coinType) => ({
      queryKey: ["getCoinMetadata", coinType],
      queryFn: () => suiClient.getCoinMetadata({ coinType }),
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    })),
  });

  const coinMetadata = coinsMetadata.reduce((acc, result, index) => {
    if (result.data) {
      acc[allowedCoinTypes[index]] = result.data;
    }
    return acc;
  }, {} as Record<string, CoinMetadata>);

  return coinMetadata;
};

export const useGetCoinBalance = (coinType: string, decimals: number) => {
  const { address: currentAddress, isAuthenticated } = useWallet();

  const { data: allCoins, refetch } = useSuiClientQuery(
    "getCoins",
    {
      owner: currentAddress,
      coinType,
    },
    {
      enabled: isAuthenticated && !!coinType,
    }
  );

  // Calculate the user's LP token balance
  const userLPBalance = useMemo(() => {
    if (!allCoins?.data) return 0;

    const totalBalance = allCoins.data.reduce((sum, coin) => {
      return sum + parseInt(coin.balance || "0") / Math.pow(10, decimals);
    }, 0);

    return totalBalance;
  }, [allCoins, decimals]);

  return { balance: roundDownBalance(userLPBalance, 2), refetch };
};

export const useGetVaultTokenPair = () => {
  const { assets } = useMyAssets();
  const depositVault = useCurrentDepositVault();

  const collateralToken = useMemo(
    () =>
      assets.find((asset) => asset.coin_type === depositVault.collateral_token),
    [assets, depositVault.collateral_token]
  );

  const lpToken = useMemo(
    () =>
      assets.find((asset) => asset.coin_type === depositVault.vault_lp_token),
    [assets, depositVault.vault_lp_token]
  );

  return { collateralToken, lpToken };
};

// ndlp is NODO LP token
const NDLP_COIN = "ndlp";

export const useFetchAssets = () => {
  const { setAssets, setUpdated, updated, isRefetch, isLoading, setIsLoading } =
    useUserAssetsStore();
  const { address, isAuthenticated } = useWallet();
  const suiClient = useSuiClient();

  const {
    data: allCoinObjects = [],
    isLoading: allCoinObjectsLoading,
    isFetching: allCoinObjectsFetching,
    refetch: allCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["allCoinObjects", address],
    queryFn: () =>
      getCoinsBalance(suiClient, address || "", [
        SUI_CONFIG.coinType,
        USDC_CONFIG.coinType,
      ]),
    enabled: isAuthenticated && !!address,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    refetchOnWindowFocus: true,
  });

  const collateralTokens = useMemo(() => {
    // filter out ndlp coins by checking if coinType includes 'ndlp'
    return allCoinObjects
      .filter((coin) => !coin.coinType?.toLowerCase().includes(NDLP_COIN))
      .filter(
        (coin, index, self) =>
          index === self.findIndex((t) => t.coinType === coin.coinType)
      );
  }, [allCoinObjects]);

  const coinsMetadataQuery = useQuery({
    queryKey: [
      "getCoinMetadata",
      collateralTokens.map((coin) => coin.coinType),
    ],
    queryFn: async () => {
      return Promise.all(
        collateralTokens.map((coin) =>
          suiClient.getCoinMetadata({ coinType: coin.coinType })
        )
      );
    },
    enabled: !!collateralTokens?.length,
    gcTime: 1000 * 60 * 60 * 24 * 1, // 1 day,
    refetchOnWindowFocus: false,
  });

  const coinsMetadata = useMemo(
    () =>
      coinsMetadataQuery?.data?.reduce((acc, result, index) => {
        if (result) {
          acc[collateralTokens[index].coinType] = result;
        }
        return acc;
      }, {} as Record<string, CoinMetadata>),
    [collateralTokens, coinsMetadataQuery]
  );

  useEffect(() => {
    const isFetching = allCoinObjectsFetching || allCoinObjectsLoading;
    if (isFetching) return;

    if (allCoinObjects.length === 0 && isLoading) {
      setIsLoading(false);
      return;
    }

    if (Object.keys(coinsMetadata || {}).length === 0) {
      return;
    }

    if (updated) {
      return;
    }

    // map assets from allCoinObjects
    const assets: UserCoinAsset[] =
      allCoinObjects.reduce((acc, coin) => {
        const coinType = coin.coinType;
        const coinMetadata = coinsMetadata[coinType];
        const decimals = coinMetadata?.decimals || 6;

        const tokenDisplay = COIN_TYPES_CONFIG.collateral_tokens.find(
          (token) => token.id === coinType
        );

        acc.push({
          coin_type: coinType,
          balance: "0",
          raw_balance: coin.totalBalance,
          image_url: tokenDisplay?.image_url || coinMetadata?.iconUrl || "",
          decimals: decimals,
          display_name: tokenDisplay?.display_name || coinMetadata?.name || "",
          name: tokenDisplay?.display_name || coinMetadata?.name || "",
          symbol: coinMetadata?.symbol || "",
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
    coinsMetadata,
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
    queryFn: () => getCoinsBalance(suiClient, address || "", ndlpCoinTypes),
    enabled: isAuthenticated && !!address && ndlpCoinTypes.length > 0,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    refetchOnWindowFocus: true,
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

    const assets: UserCoinAsset[] =
      allCoinObjectsNDLP.reduce((acc, coin) => {
        const coinType = coin.coinType;
        const tokenDisplay = LP_TOKEN_CONFIG;
        acc.push({
          coin_type: coinType,
          balance: "0",
          raw_balance: coin.totalBalance,
          image_url: tokenDisplay?.image_url || "",
          decimals: LP_TOKEN_CONFIG.decimals,
          display_name: tokenDisplay?.display_name || "",
          name: tokenDisplay?.display_name || "",
          symbol: tokenDisplay?.symbol || "",
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
    allCoinObjectsNDLP,
    updated,
    setAssets,
    allCoinObjectsNDLPFetching,
    allCoinObjectsNDLPLoading,
    isLoading,
    setIsLoading,
  ]);

  useEffect(() => {
    if (isRefetch) {
      allCoinObjectsNDLPRefetch().then(() => {
        setUpdated(false);
      });
    }
  }, [isRefetch, allCoinObjectsNDLPRefetch, setUpdated]);
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
