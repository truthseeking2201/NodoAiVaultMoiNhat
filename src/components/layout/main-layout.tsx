import { useGetDepositVaults, useIsChromeDesktop } from "@/hooks";
import useBreakpoint from "@/hooks/use-breakpoint";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import demoUIOfDesktop from "../../assets/images/demo-ui-nodo-ai-vault.png";
import RegisterForWhiteList from "../dashboard/request-whitelist-button/register-for-white-layout";
import UseDesktopBanner from "../dashboard/use-desktop-banner";
import ConditionRenderer from "../shared/condition-renderer";
import { AppHeader } from "./app-header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isChromeDesktop } = useIsChromeDesktop();
  const { isLg } = useBreakpoint();
  const { data, isLoading } = useGetDepositVaults();
  const isEmptyVaults = !isLoading && data?.length === 0;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden main-bg">
      {!isChromeDesktop && <UseDesktopBanner />}
      {/* Main content */}
      {!isLg && (
        <div className="flex flex-col items-center justify-center text-center h-[95vh] p-3">
          <img
            src={demoUIOfDesktop}
            alt="demo-ui-of-desktop"
            className="max-w-[255px]"
          />
          <div className="text-[36px] font-bold">
            <span>NODO </span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #0090FF -29.91%, #FF6D9C 44.08%, #FB7E16 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "DM Sans",
              }}
            >
              AI Vaults
            </span>
          </div>
          <div className="font-sans text-white">
            This view is currently unavailable on mobile. Please go to desktop
            to view it
          </div>
        </div>
      )}

      {isLg && (
        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col min-h-screen relative z-[var(--z-elevate)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AppHeader />
            <ConditionRenderer
              when={!isEmptyVaults}
              fallback={
                <div className="flex h-screen w-screen items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
              }
            >
              <div className="flex-1 relative">{children}</div>
            </ConditionRenderer>
            <RegisterForWhiteList />
            {/* <AppFooter /> */}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
