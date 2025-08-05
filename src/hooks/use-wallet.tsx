import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { create } from "zustand";
interface WalletState {
  isConnectWalletDialogOpen: boolean;
  isAuthenticated: boolean;
  setIsConnectWalletDialogOpen: (isConnectWalletDialogOpen: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  isConnectWalletDialogOpen: false,
  isAuthenticated: false,
  setIsConnectWalletDialogOpen: (isConnectWalletDialogOpen: boolean) =>
    set({ isConnectWalletDialogOpen }),
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));

export const useWallet = () => {
  const account = useCurrentAccount();
  const walletConnectionInfo = JSON.parse(
    localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
  );
  const lastConnectedAccountAddress =
    walletConnectionInfo?.state?.lastConnectedAccountAddress;

  const address = account?.address || lastConnectedAccountAddress;
  const {
    isConnectWalletDialogOpen,
    setIsConnectWalletDialogOpen,
    isAuthenticated,
    setIsAuthenticated,
  } = useWalletStore((state) => state);

  const calculateIsAuthenticated = useMemo(() => {
    if (isAuthenticated) return true;

    const access_token = localStorage.getItem("access_token");
    return !!access_token && !!address;
  }, [address, isAuthenticated]);

  return {
    isConnected: !!account?.address,
    isConnectWalletDialogOpen,
    openConnectWalletDialog: () => setIsConnectWalletDialogOpen(true),
    closeConnectWalletDialog: () => setIsConnectWalletDialogOpen(false),
    setIsAuthenticated,
    isAuthenticated: calculateIsAuthenticated,
    address: account?.address,
  };
};
