import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* Main content */}
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
          <AppFooter />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
