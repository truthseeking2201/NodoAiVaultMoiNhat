import { COIN_TYPES_CONFIG } from "@/config";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { UserCoinAsset } from "@/types/coin.types";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

interface CoinMetadata {
  decimals: number;
  name: string;
  symbol: string;
  url?: string;
  iconUrl?: string;
}

const ALLOW_COIN_TYPES = [
  COIN_TYPES_CONFIG.USDC_COIN_TYPE,
  COIN_TYPES_CONFIG.NDLP_COIN_TYPE,
] as const;

const COIN_CONFIG = {
  [COIN_TYPES_CONFIG.USDC_COIN_TYPE]: {
    display_name: "USDC",
    image_url: "/coins/usdc.png",
  },
  [COIN_TYPES_CONFIG.NDLP_COIN_TYPE]: {
    display_name: "NDLP",
    image_url: "/coins/ndlp.png",
  },
};

const roundDownBalance = (balance: number) => {
  return Math.floor(balance * 100) / 100;
};

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

  const fetchCoinObjects = useCallback(async () => {
    return Promise.all(
      ALLOW_COIN_TYPES.map((coinType) =>
        getCoinObjects(suiClient, coinType, account?.address || "")
      )
    );
  }, [account?.address, suiClient]);

  const {
    data: coinObjects,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["coinObjects"],
    queryFn: fetchCoinObjects,
    enabled: !!account?.address,
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  });

  const coinMetadata = useGetCoinsMetadata();

  const assets: UserCoinAsset[] =
    coinObjects?.flat().reduce((acc, coin) => {
      const metadata = coinMetadata[coin.coinType] as CoinMetadata;
      const decimals = metadata?.decimals || 9;
      const rawBalance = Number(coin.balance || "0");
      const balance = rawBalance / Math.pow(10, decimals);

      const existingAsset = acc.find(
        (asset) => asset.coin_type === coin.coinType
      );
      if (existingAsset) {
        existingAsset.balance += balance;
        existingAsset.raw_balance += rawBalance;
      } else {
        acc.push({
          coin_object_id: coin.coinObjectId,
          coin_type: coin.coinType,
          balance,
          raw_balance: rawBalance,
          image_url: COIN_CONFIG[coin.coinType]?.image_url,
          decimals: decimals,
          display_name: COIN_CONFIG[coin.coinType]?.display_name,
          name: metadata?.name,
          symbol: metadata?.symbol,
        });
      }
      return acc;
    }, [] as UserCoinAsset[]) || [];

  return {
    assets: assets.map((asset) => ({
      ...asset,
      balance: roundDownBalance(asset.balance),
    })),
    isLoading,
    refreshBalance: refetch,
  };
};

export const useGetCoinsMetadata = () => {
  const suiClient = useSuiClient();
  const coinsMetadata = useQueries({
    queries: ALLOW_COIN_TYPES.map((coinType) => ({
      queryKey: ["getCoinMetadata", coinType],
      queryFn: () => suiClient.getCoinMetadata({ coinType }),
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    })),
  });

  const coinMetadata = coinsMetadata.reduce((acc, result, index) => {
    if (result.data) {
      acc[ALLOW_COIN_TYPES[index]] = result.data;
    }
    return acc;
  }, {} as Record<string, CoinMetadata>);

  return coinMetadata;
};
