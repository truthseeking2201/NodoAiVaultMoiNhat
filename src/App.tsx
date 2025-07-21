import { MainLayout } from "@/components/layout/main-layout";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  createNetworkConfig,
  SuiClientProvider,
  useCurrentAccount,
  useDisconnectWallet,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DelayRender } from "./components/shared/delay-render";
import VersionChecker from "./components/shared/version-checker";
import { LanguageProvider } from "./contexts/language-context";
import { useGetDepositVaults } from "./hooks";
import Home from "./pages/home";
import {
  clearWalletDisconnectHandler,
  setWalletDisconnectHandler,
} from "./utils/wallet-disconnect";

const NotFound = lazy(() =>
  import("./pages/not-found").catch((e) => {
    console.error("Error loading NotFound:", e);
    return { default: () => <PageFallback /> };
  })
);

const ConfigWrapper = ({ children }: { children: React.ReactNode }) => {
  const initLoad = useRef(false);
  const { isLoading, error, data } = useGetDepositVaults();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  useEffect(() => {
    if (!initLoad.current && data) {
      initLoad.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (account?.address) {
      setWalletDisconnectHandler(() => {
        disconnect();
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current-address");
        localStorage.removeItem("whitelisted_address");
      });
    }

    return () => {
      clearWalletDisconnectHandler();
    };
  }, [account, disconnect]);

  if (isLoading || !data) {
    return <PageFallback />;
  }

  // show error when failed to fetch deposit vaults for first load
  if (error && !initLoad.current) {
    throw new Error("Failed to fetch deposit vaults");
  }

  return <DelayRender>{children}</DelayRender>;
};

// Create query client that still loads data but doesn't show loading states
const queryClient = new QueryClient();

// Replace loading state with mock data for demo - no loading screen needed
const PageFallback = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
};

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const App = () => (
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork={"mainnet"}>
          <WalletProvider autoConnect>
            <ConfigWrapper>
              <LanguageProvider>
                <TooltipProvider>
                  <Toaster />
                  <VersionChecker />
                  <BrowserRouter>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <MainLayout>
                            <Home />
                          </MainLayout>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </LanguageProvider>
            </ConfigWrapper>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Suspense>
  </ErrorBoundary>
);

export default App;
