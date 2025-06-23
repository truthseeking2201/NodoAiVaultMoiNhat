import { COIN_TYPES_CONFIG, LP_TOKEN_CONFIG } from "@/config/coin-config";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { roundDownBalance } from "@/lib/utils";
import { UserCoinAsset } from "@/types/coin.types";
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { useCurrentDepositVault } from "./useVault";

interface CoinMetadata {
  decimals: number;
  name: string;
  symbol: string;
  url?: string;
  iconUrl?: string;
}

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

export const useMyAssets = () => {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  const currentVault = useCurrentDepositVault();

  // Clear cache when account address becomes empty
  useEffect(() => {
    if (!account?.address) {
      queryClient.removeQueries({ queryKey: ["lpCoinObjects"] });
      queryClient.removeQueries({ queryKey: ["collateralCoinObjects"] });
    }
  }, [account?.address, queryClient]);

  const {
    data: lpCoinObjects,
    isLoading: lpCoinObjectsLoading,
    refetch: lpCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["lpCoinObjects", account?.address, currentVault.vault_id],
    queryFn: () =>
      getCoinObjects(
        suiClient,
        currentVault.vault_lp_token,
        account?.address || ""
      ),
    enabled: !!account?.address,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  });

  const {
    data: collateralCoinObjects,
    isLoading: collateralCoinObjectsLoading,
    refetch: collateralCoinObjectsRefetch,
  } = useQuery({
    queryKey: ["collateralCoinObjects", account?.address],
    queryFn: () =>
      getCoinObjects(
        suiClient,
        currentVault.collateral_token,
        account?.address || ""
      ),
    enabled: !!account?.address,
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
      balance: roundDownBalance(asset.balance, 2),
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
  const account = useCurrentAccount();

  const { data: allCoins, refetch } = useSuiClientQuery(
    "getCoins",
    {
      owner: account?.address,
      coinType,
    },
    {
      enabled: !!account?.address && !!coinType,
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

  return { balance: userLPBalance, refetch };
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
