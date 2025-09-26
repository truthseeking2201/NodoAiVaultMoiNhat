import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  createNetworkConfig,
  SuiClientProvider,
  useDisconnectWallet,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrowserRouter } from "react-router-dom";
import GlobalLoading from "./components/shared/global-loading";
import AppRoutes from "./routes";
import ScrollToTop from "./components/ui/scroll-to-top";
import {
  useCriticalImagePrefetch,
  useFetchAssets,
  useFetchNDLPAssets,
  useGetAllVaults,
  useGetDepositVaults,
  useNdlpAssetsStore,
  useUserAssetsStore,
  useWallet,
} from "./hooks";

import { setWalletDisconnectHandler } from "./utils/wallet-disconnect";
import { isMobileDevice } from "./utils/helpers";
import { useToast } from "./hooks/use-toast";
import { IconErrorToast } from "./components/ui/icon-error-toast";
import { useStableAutoConnect } from "./hooks/use-stable-auto-connect";
import { captureSentryError } from "./utils/logger";

const useSetWalletDisconnectHandler = () => {
  const { mutateAsync: disconnect } = useDisconnectWallet();
  const { setIsAuthenticated, isAuthenticated, isConnected, address } =
    useWallet();
  const { setAssets } = useUserAssetsStore();
  const { setAssets: setNdlpAssets } = useNdlpAssetsStore();
  const isDisconnectingRef = useRef(false);

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setAssets([]);
    setNdlpAssets([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("current-address");
      localStorage.removeItem("whitelisted_address");
      localStorage.removeItem("last_wallet");
    }
  }, [setIsAuthenticated, setAssets, setNdlpAssets]);

  const hasActiveSession = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      !!localStorage.getItem("access_token") ||
      !!localStorage.getItem("refresh_token") ||
      !!address ||
      isAuthenticated
    );
  }, [address, isAuthenticated]);

  useEffect(() => {
    setWalletDisconnectHandler(() => {
      if (isDisconnectingRef.current || !hasActiveSession()) {
        return;
      }

      isDisconnectingRef.current = true;

      (async () => {
        try {
          if (isConnected) {
            await disconnect();
          }
        } catch (error) {
          console.error("Error disconnecting wallet:", error);
        } finally {
          clearSession();
          isDisconnectingRef.current = false;
        }
      })();
    });
  }, [
    disconnect,
    isConnected,
    hasActiveSession,
    clearSession,
  ]);
};

const ConfigWrapper = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { error, data } = useGetDepositVaults();
  const vaultIds = data?.map((vault) => vault.vault_id) || [];
  useFetchAssets();
  useFetchNDLPAssets(data);
  useGetAllVaults(vaultIds);
  useSetWalletDisconnectHandler();
  // Prefetch critical images for better UX
  useCriticalImagePrefetch();
  useStableAutoConnect();

  useEffect(() => {
    const walletConnectionInfo = JSON.parse(
      localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
    );
    const lastConnectedAccountAddress =
      walletConnectionInfo?.state?.lastConnectedAccountAddress;

    if (lastConnectedAccountAddress) {
      Sentry.setUser({
        wallet_address: lastConnectedAccountAddress,
      });
    }
  }, []);

  useEffect(() => {
    if (error) {
      captureSentryError(error);
      toast({
        title: error?.message || "Failed to fetch vaults",
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
    }
  }, [error, toast]);

  return <>{children}</>;
};

// Create query client that still loads data but doesn't show loading states
const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
//

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsWalletConnected(true);
    }, 1000);
  }, []);

  const slushWallet = useMemo(() => {
    if (isMobileDevice() || !isWalletConnected) return undefined;
    return {
      name: "NODO AI Vaults",
    };
  }, [isWalletConnected]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<GlobalLoading />}>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider
            networks={networkConfig}
            defaultNetwork={"mainnet"}
          >
            <WalletProvider autoConnect slushWallet={slushWallet}>
              <ConfigWrapper>
                <TooltipProvider delayDuration={0}>
                  <Toaster />
                  {/* <VersionChecker /> */}
                  <BrowserRouter>
                    <ScrollToTop />
                    <ScrollToTopButton />
                    <AppRoutes />
                  </BrowserRouter>
                </TooltipProvider>
              </ConfigWrapper>
            </WalletProvider>
          </SuiClientProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
