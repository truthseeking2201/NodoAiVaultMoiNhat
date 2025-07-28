import { useIsChromeDesktop } from "@/hooks";
import useBreakpoint from "@/hooks/use-breakpoint";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import demoUIOfDesktop from "../../assets/images/demo-ui-nodo-ai-vault.png";
import UseDesktopBanner from "../dashboard/use-desktop-banner";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isChromeDesktop } = useIsChromeDesktop();
  const { isLg } = useBreakpoint();

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
            id="main-layout"
            className="flex flex-col h-screen relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AppHeader />
            <div
              id="main-layout-content"
              className="flex-1 overflow-y-auto pt-20"
              style={{ height: "calc(100vh - 77px)" }}
            >
              <div>
                {children}
                <AppFooter />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
