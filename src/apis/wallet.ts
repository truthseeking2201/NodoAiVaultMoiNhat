import httpNodo from "@/utils/httpNodo";

const URLS = {
  walletDetails: "/data-management/user/wallet-detail",
  subscribe: "/data-management/user/subscribe",
  updateWalletProvider: "/data-management/user/update-wallet-provider",
};

export const subscribeWhitelistRequest = async (
  walletAddress: string,
  walletProvider: string
) => {
  const res = (await httpNodo.get(
    `${URLS.walletDetails}?wallet_address=${walletAddress}`
  )) as any;

  if (res?.data === null) {
    httpNodo.post(URLS.subscribe, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
  }
  if (!res?.wallet_provider && walletProvider) {
    httpNodo.post(URLS.updateWalletProvider, {
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
    });
  }
  return res;
};
