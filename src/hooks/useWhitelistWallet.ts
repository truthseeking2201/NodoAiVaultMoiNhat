import { useCurrentAccount } from "@mysten/dapp-kit";

export const useWhitelistWallet = () => {
  const account = useCurrentAccount();
  const isWhitelisted = true;

  return isWhitelisted;
};
