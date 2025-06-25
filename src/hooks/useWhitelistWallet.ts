import { subscribeWhitelistRequest } from "@/apis";
import { WalletDetails } from "@/types/wallet-detail";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

export const useWhitelistWallet = () => {
  const account = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const walletAddress = account?.address;
  const walletProvider = currentWallet?.name;

  const {
    data: walletDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["walletDetails", walletAddress, walletProvider],
    queryFn: () => subscribeWhitelistRequest(walletAddress, walletProvider),
    enabled: !!walletAddress && !!walletProvider,
    staleTime: Infinity,
  }) as UseQueryResult<WalletDetails>;

  const wlServer =
    walletDetails?.status === "APPROVED" ||
    walletDetails?.status === "SIGNED_UP";

  const cachedWhitelistedAddress = localStorage.getItem("whitelisted_address");

  const isWhitelisted = wlServer || cachedWhitelistedAddress === walletAddress;

  useEffect(() => {
    if (wlServer && walletAddress) {
      localStorage.setItem("whitelisted_address", walletAddress);
    }
  }, [wlServer, walletAddress]);

  useEffect(() => {
    if (cachedWhitelistedAddress && !wlServer) {
      localStorage.removeItem("whitelisted_address");
      refetch();
    }
  }, [cachedWhitelistedAddress, wlServer, refetch]);

  return {
    isWhitelisted,
    isLoading,
    walletDetails,
    refetch,
  };
};
