import { useIsChromeDesktop } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import UseDesktopBanner from "../dashboard/UseDesktopBanner";
import { AppHeader } from "./AppHeader";
import demoUIOfDesktop from "../../assets/demo-ui-nodo-ai-vault.png";
interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isChromeDesktop, isMobile } = useIsChromeDesktop();
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden main-bg">
      {!isChromeDesktop && <UseDesktopBanner />}
      {/* Main content */}
      {isMobile && (
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

      {!isMobile && (
        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col min-h-screen relative z-[var(--z-elevate)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AppHeader />
            <div className="flex-1 relative">{children}</div>
            {/* <AppFooter /> */}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
