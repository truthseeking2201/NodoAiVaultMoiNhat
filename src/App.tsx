import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VersionChecker from "./components/shared/VersionChecker";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useGetDepositVaults } from "./hooks";
import Dashboard from "./pages/Dashboard";

const NotFound = lazy(() =>
  import("./pages/NotFound").catch((e) => {
    console.error("Error loading NotFound:", e);
    return { default: () => <PageFallback /> };
  })
);

const ConfigWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, data, error } = useGetDepositVaults();
  if (isLoading || !data) {
    return <PageFallback />;
  }

  if (error) {
    throw new Error("Failed to fetch deposit vaults");
  }

  return <>{children}</>;
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
                            <Dashboard />
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
