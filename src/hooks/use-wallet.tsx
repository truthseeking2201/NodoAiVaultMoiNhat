import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
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
  const address = account?.address;
  const {
    isConnectWalletDialogOpen,
    setIsConnectWalletDialogOpen,
    isAuthenticated,
    setIsAuthenticated,
  } = useWalletStore((state) => state);

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    setIsAuthenticated(!!access_token && !!address);
  }, [address, setIsAuthenticated]);

  return {
    isConnected: !!account?.address,
    isConnectWalletDialogOpen,
    openConnectWalletDialog: () => setIsConnectWalletDialogOpen(true),
    closeConnectWalletDialog: () => setIsConnectWalletDialogOpen(false),
    setIsAuthenticated,
    isAuthenticated,
    address: account?.address,
  };
};
