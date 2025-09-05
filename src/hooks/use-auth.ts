import { loginWallet } from "@/apis/auth";
import { triggerWalletDisconnect } from "@/utils/wallet-disconnect";
import { useSignPersonalMessage } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { useWallet } from "./use-wallet";
import { useNdlpAssetsStore, useUserAssetsStore } from "./use-store";
import { useGetDepositVaults } from "./use-vault";
import * as Sentry from "@sentry/react";
import { captureSentryError } from "@/utils/logger";
import { sleep } from "@/lib/utils";

export const useLoginWallet = () => {
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const { mutateAsync: triggerLoginWallet } = useMutation({
    mutationFn: loginWallet,
  });

  const { refetch: refetchDepositVaults } = useGetDepositVaults();

  const { setUpdated } = useUserAssetsStore();
  const { setUpdated: setNdlpUpdated } = useNdlpAssetsStore();

  const { setIsAuthenticated } = useWallet();

  // Helper function to retry triggerLoginWallet on network errors
  const retryLoginWallet = async (
    payload: {
      signature: string;
      timestamp: number;
      address: string;
    },
    maxRetries = 3
  ) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await triggerLoginWallet(payload);
      } catch (error) {
        lastError = error;

        // Check if it's a network error
        const isNetworkError =
          error?.code === "NETWORK_ERROR" ||
          error?.message?.toLowerCase().includes("network") ||
          error?.name === "NetworkError" ||
          (error?.response === undefined && error?.request !== undefined) ||
          error?.code === "ECONNABORTED" ||
          error?.code === "ENOTFOUND" ||
          error?.code === "ECONNREFUSED" ||
          error?.code === "ETIMEDOUT";

        // If it's not a network error or we've exhausted retries, throw the error
        if (!isNetworkError || attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await sleep(delay);
      }
    }

    throw lastError;
  };

  return async (walletAddress: string) => {
    try {
      const timestamp = Date.now();
      const message = new TextEncoder().encode(
        `Welcome to NODO AI Vaults. ${new Date(timestamp).toUTCString()}`
      );
      const signResult = await signPersonalMessage({
        message,
      });

      const data = await retryLoginWallet({
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
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error during wallet login"';

      captureSentryError(error, walletAddress);
      triggerWalletDisconnect();
      return {
        success: false,
        message: errorMessage,
      };
    }
  };
};
