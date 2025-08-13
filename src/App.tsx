import { MainLayout } from "@/components/layout/main-layout";
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
import { lazy, Suspense, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalLoading from "./components/shared/global-loading";
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
import Home from "./pages/home";
import VaultDetail from "./pages/vault-detail";
import { setWalletDisconnectHandler } from "./utils/wallet-disconnect";
import { isMobileDevice } from "./utils/helpers";

const NotFound = lazy(() =>
  import("./pages/not-found").catch((e) => {
    console.error("Error loading NotFound:", e);
    return { default: () => <GlobalLoading /> };
  })
);

const useSetWalletDisconnectHandler = () => {
  const { mutateAsync: disconnect } = useDisconnectWallet();
  const { setIsAuthenticated } = useWallet();
  const { setAssets } = useUserAssetsStore();
  const { setAssets: setNdlpAssets } = useNdlpAssetsStore();

  useEffect(() => {
    setWalletDisconnectHandler(async () => {
      try {
        await disconnect();
        setIsAuthenticated(false);
        setAssets([]);
        setNdlpAssets([]);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current-address");
        localStorage.removeItem("whitelisted_address");
      } catch (error) {
        const walletConnectionInfo = JSON.parse(
          localStorage.getItem("sui-dapp-kit:wallet-connection-info") || "{}"
        );
        console.error("Error disconnecting wallet:", error);
        Sentry.captureException(error, {
          extra: {
            wallet_address:
              walletConnectionInfo?.state?.lastConnectedAccountAddress,
          },
        });
        localStorage.clear();
        location.reload();
        return;
      }
    });
  }, [disconnect, setIsAuthenticated, setAssets, setNdlpAssets]);
};

const ConfigWrapper = ({ children }: { children: React.ReactNode }) => {
  const initLoad = useRef(false);
  const { error, data } = useGetDepositVaults();
  const vaultIds = data?.map((vault) => vault.vault_id) || [];
  useFetchAssets();
  useFetchNDLPAssets(data);
  useGetAllVaults(vaultIds);
  useSetWalletDisconnectHandler();

  // Prefetch critical images for better UX
  useCriticalImagePrefetch();

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

  // show error when failed to fetch deposit vaults for first load
  if (error && !initLoad.current) {
    throw new Error("Failed to fetch deposit vaults");
  }

  return <>{children}</>;
};

// Create query client that still loads data but doesn't show loading states
const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
//

const App = () => (
  <ErrorBoundary>
    <Suspense fallback={<GlobalLoading />}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider
          networks={networkConfig}
          defaultNetwork={"mainnet"}
        >
          <WalletProvider
            autoConnect
            slushWallet={
              isMobileDevice()
                ? undefined
                : {
                    name: "NODO AI Vaults",
                  }
            }
          >
            <ConfigWrapper>
              <TooltipProvider delayDuration={0}>
                <Toaster />
                {/* <VersionChecker /> */}
                <BrowserRouter>
                  <ScrollToTop />
                  <ScrollToTopButton />
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <MainLayout>
                          <Home />
                        </MainLayout>
                      }
                    />
                    <Route
                      path="/vault/:vault_id"
                      element={
                        <MainLayout>
                          <VaultDetail />
                        </MainLayout>
                      }
                    />
                    <Route
                      path="*"
                      element={<NotFound />}
                    />
                  </Routes>
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

export default App;
