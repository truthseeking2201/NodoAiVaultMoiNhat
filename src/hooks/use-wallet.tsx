import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useMemo } from "react";
import { create } from "zustand";
import {
  isMockMode,
  MOCK_WALLET_ADDRESS,
  MOCK_WALLET_NAME,
} from "@/config/mock";

interface WalletState {
  isConnectWalletDialogOpen: boolean;
  isAuthenticated: boolean;
  setIsConnectWalletDialogOpen: (isConnectWalletDialogOpen: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  isConnectWalletDialogOpen: false,
  isAuthenticated: isMockMode,
  setIsConnectWalletDialogOpen: (isConnectWalletDialogOpen: boolean) =>
    set({ isConnectWalletDialogOpen }),
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));

export const useWallet = () => {
  const account = useCurrentAccount();
  const storedConnectionInfo =
    typeof window !== "undefined"
      ? localStorage.getItem("sui-dapp-kit:wallet-connection-info")
      : null;
  const walletConnectionInfo = storedConnectionInfo
    ? JSON.parse(storedConnectionInfo)
    : {};
  const lastConnectedAccountAddress =
    walletConnectionInfo?.state?.lastConnectedAccountAddress;

  const derivedAddress = account?.address || lastConnectedAccountAddress;
  const address = isMockMode ? MOCK_WALLET_ADDRESS : derivedAddress;
  const {
    isConnectWalletDialogOpen,
    setIsConnectWalletDialogOpen,
    isAuthenticated,
    setIsAuthenticated,
  } = useWalletStore((state) => state);

  useEffect(() => {
    if (!isMockMode) return;
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", "mock-access-token");
      localStorage.setItem("refresh_token", "mock-refresh-token");
      localStorage.setItem(
        "sui-dapp-kit:wallet-connection-info",
        JSON.stringify({
          state: {
            lastConnectedAccountAddress: MOCK_WALLET_ADDRESS,
            lastConnectedWalletName: MOCK_WALLET_NAME,
          },
        })
      );
      localStorage.setItem("current-address", MOCK_WALLET_ADDRESS);
      localStorage.setItem("last_wallet", MOCK_WALLET_NAME);
    }
  }, [setIsAuthenticated]);

  const calculateIsAuthenticated = useMemo(() => {
    if (isMockMode) {
      return true;
    }
    if (isAuthenticated) return true;

    const access_token = localStorage.getItem("access_token");
    return !!access_token && !!address;
  }, [address, isAuthenticated]);

  return {
    isConnected: isMockMode ? true : !!address,
    isConnectWalletDialogOpen,
    openConnectWalletDialog: () =>
      setIsConnectWalletDialogOpen(isMockMode ? false : true),
    closeConnectWalletDialog: () => setIsConnectWalletDialogOpen(false),
    setIsAuthenticated,
    isAuthenticated: calculateIsAuthenticated,
    address,
  };
};
