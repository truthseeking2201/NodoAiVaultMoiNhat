import { loginWallet } from "@/apis/auth";
import { triggerWalletDisconnect } from "@/utils/wallet-disconnect";
import { useSignPersonalMessage } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { useWallet } from "./use-wallet";
import { useNdlpAssetsStore, useUserAssetsStore } from "./use-store";
import { useGetDepositVaults } from "./use-vault";
import * as Sentry from "@sentry/react";

export const useLoginWallet = () => {
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const { mutateAsync: triggerLoginWallet } = useMutation({
    mutationFn: loginWallet,
  });

  const { refetch: refetchDepositVaults } = useGetDepositVaults();

  const { setUpdated } = useUserAssetsStore();
  const { setUpdated: setNdlpUpdated } = useNdlpAssetsStore();

  const { setIsAuthenticated } = useWallet();

  return async (walletAddress: string) => {
    try {
      const timestamp = Date.now();
      const message = new TextEncoder().encode(
        `Welcome to NODO AI Vaults. ${new Date(timestamp).toUTCString()}`
      );
      const signResult = await signPersonalMessage({
        message,
      });

      const data = await triggerLoginWallet({
        signature: signResult.signature,
        timestamp,
        address: walletAddress,
      });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setIsAuthenticated(true);
      Sentry.setUser({
        wallet_address: walletAddress,
      });
      setUpdated(false);
      setNdlpUpdated(false);
      refetchDepositVaults();
      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      Sentry.captureException(error, {
        extra: {
          walletAddress,
        },
      });
      triggerWalletDisconnect();
      return {
        success: false,
        message: error.message,
      };
    }
  };
};
