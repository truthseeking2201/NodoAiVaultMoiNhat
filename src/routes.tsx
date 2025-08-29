import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { PATH_ROUTER } from "@/config/router";

import { MainLayout } from "@/components/layout/main-layout";
import GlobalLoading from "@/components/shared/global-loading";

import Home from "./pages/home";
import VaultDetail from "./pages/vault-detail";
import Leaderboards from "./pages/leaderboards";

const NotFound = lazy(() =>
  import("./pages/not-found").catch((e) => {
    console.error("Error loading NotFound:", e);
    return { default: () => <GlobalLoading /> };
  })
);

const AppRoutes = () => {
  return (
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
        path={PATH_ROUTER.VAULT_DETAIL}
        element={
          <MainLayout>
            <VaultDetail />
          </MainLayout>
        }
      />
      <Route
        path={PATH_ROUTER.LEADERBOARDS}
        element={
          <MainLayout>
            <Leaderboards />
          </MainLayout>
        }
      />
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default AppRoutes;
