import { captureSentryError } from "@/utils/logger";
import {
  useConnectWallet,
  useCurrentAccount,
  useWallets,
} from "@mysten/dapp-kit";
import { useEffect } from "react";

export const useWalletSilentConnected = () => {
  const wallets = useWallets();
  const { mutateAsync: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const walletConnectionInfo = JSON.parse(
      localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
    );
    const lastConnectedAccountAddress =
      walletConnectionInfo?.state?.lastConnectedAccountAddress;

    const lastWallet = localStorage.getItem("last_wallet");
    if (lastConnectedAccountAddress && !currentAccount?.address && lastWallet) {
      const wallet = wallets.find((w) => w.name === lastWallet);
      if (wallet) {
        const silentConnect = async () => {
          try {
            await connect({
              wallet,
              accountAddress: lastConnectedAccountAddress,
              silent: true,
            });
          } catch (error) {
            console.error("Fail to reconnect to wallet:", error);
            captureSentryError(error, lastConnectedAccountAddress);
          }
        };

        silentConnect();
      }
    }
  }, [wallets, connect, currentAccount]);
};

export default useWalletSilentConnected;
