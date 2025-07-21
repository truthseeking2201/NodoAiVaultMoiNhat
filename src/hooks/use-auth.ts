import { loginWallet } from "@/apis/auth";
import { triggerWalletDisconnect } from "@/utils/wallet-disconnect";
import { useSignPersonalMessage } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import { useWallet } from "./use-wallet";

export const useLoginWallet = () => {
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const { mutateAsync: triggerLoginWallet } = useMutation({
    mutationFn: loginWallet,
  });

  const { setIsAuthenticated } = useWallet();

  return async (walletAddress: string) => {
    try {
      const timestamp = Date.now();
      const message = new TextEncoder().encode(
        `Login with wallet at ${timestamp}`
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
      return true;
    } catch (error) {
      console.log(error);
      triggerWalletDisconnect();
      return false;
    }
  };
};
