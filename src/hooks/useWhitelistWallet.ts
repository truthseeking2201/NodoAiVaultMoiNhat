import { subscribeWhitelistRequest } from "@/apis";
import { WalletDetails } from "@/types/wallet-detail";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useWhitelistWallet = () => {
  const account = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const walletAddress = account?.address;
  const walletProvider = currentWallet?.name;

  const { data: walletDetails, isLoading } = useQuery({
    queryKey: ["walletDetails", walletAddress, walletProvider],
    queryFn: () => subscribeWhitelistRequest(walletAddress, walletProvider),
    enabled: !!walletAddress && !!walletProvider,
    staleTime: Infinity,
  }) as UseQueryResult<WalletDetails>;

  return {
    isWhitelisted: walletDetails?.status === "APPROVED",
    isLoading,
  };
};
