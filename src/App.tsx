import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Dashboard from "./pages/Dashboard";
import VersionChecker from "./components/shared/VersionChecker";

const NotFound = lazy(() =>
  import("./pages/NotFound").catch((e) => {
    console.error("Error loading NotFound:", e);
    return { default: () => <PageFallback /> };
  })
);

// Create query client that still loads data but doesn't show loading states
const queryClient = new QueryClient();

// Replace loading state with mock data for demo - no loading screen needed
const PageFallback = () => null;

// Preload Dashboard component immediately when app loads
(() => {
  // This immediate invocation will preload the Dashboard in the background
  import("./pages/Dashboard").catch((err) =>
    console.error("Failed to preload Dashboard on init:", err)
  );
})();

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider
      networks={networkConfig}
      defaultNetwork={import.meta.env.VITE_SUI_NETWORK || "testnet"}
    >
      <WalletProvider autoConnect>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <VersionChecker />
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <MainLayout>
                      <Suspense fallback={<PageFallback />}>
                        <Dashboard />
                      </Suspense>
                    </MainLayout>
                  }
                />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

export default App;
