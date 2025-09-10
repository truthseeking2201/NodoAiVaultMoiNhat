import React, { useState } from "react";
import {
  Drawer,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Menu, X, ArrowUpRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Icon from "@/components/icon";
import ReferralTooltip from "@/components/my-referrals/referral-tooltip";
import { ReferralContent } from "@/components/my-referrals/referral-content.tsx";
import { Ribbon } from "@/components/shared/ribbon";
import { NavLink, useNavigate } from "react-router-dom";

import { PATH_ROUTER } from "@/config/router";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useRibbon } from "@/hooks/use-ribbon";
import { useWallet, useWhitelistWallet } from "@/hooks";
import { cn } from "@/lib/utils";

const pageRoutes = [
  {
    icon: "Vault",
    label: "Vaults",
    path: PATH_ROUTER.VAULTS,
  },
  {
    icon: "Leaderboards",
    label: "Leaderboards",
    path: PATH_ROUTER.LEADERBOARDS,
  },
  // {
  //   icon: "Dashboard",
  //   label: "Dashboard",
  //   path: "/dashboard",
  // },
] as const;

const DesktopHeader = () => {
  const navigate = useNavigate();
  const [visibleRibbon] = useRibbon();
  const { isAuthenticated } = useWallet();
  return (
    <div
      className={cn(
        "container flex items-center justify-between max-lg:px-4",
        visibleRibbon ? "pt-4" : "pt-0"
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-6 cursor-pointer">
        <div className="relative" onClick={() => navigate("/")}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/nodo-logo.png"
              alt="NODO AI Logo"
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </motion.div>
        </div>
        <div>
          <motion.div
            className="flex items-center gap-4 max-lg:gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {pageRoutes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-lg transition-all  duration-200 text-white hover:opacity-100 ${
                    isActive
                      ? "opacity-100 font-medium bg-white/10"
                      : "opacity-50 font-normal"
                  }`
                }
              >
                <Icon
                  name={route.icon}
                  className="h-4 w-4"
                  color="currentColor"
                />
                <span className="text-sm">{route.label}</span>
              </NavLink>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Right side */}
      <div className="flex items-center lg:gap-4">
        <motion.div
          className="flex items-center lg:gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ReferralTooltip>
            <Button
              variant="link"
              className="text-white flex items-center gap-2 text !no-underline hover:text-white/80 px-2 lg:px-4"
              disabled={!isAuthenticated}
            >
              My Referral
            </Button>
          </ReferralTooltip>
          <Button
            variant="link"
            className="!no-underline hover:text-white/80 px-2 lg:px-4"
            onClick={() => {
              window.open("https://docs.nodo.xyz", "_blank");
            }}
          >
            Read Docs
            <ArrowUpRight />
          </Button>
        </motion.div>
        <ConnectWalletButton />
      </div>
    </div>
  );
};

const MobileHeader = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated } = useWallet();

  return (
    <>
      <div className="container flex items-center justify-between px-4 py-2">
        {/* Left: Menu icon and logo */}
        <div className="flex items-center gap-3">
          {/* Menu icon from lucide-react */}
          <Button
            type="button"
            aria-label="Open menu"
            variant="ghost"
            className="rounded-lg bg-white/10 p-2 flex items-center justify-center w-10 h-10"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="w-7 h-7 text-white" />
          </Button>
          {/* Logo */}
          <div className="relative" onClick={() => navigate("/")}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="/nodo-logo.png"
                alt="NODO AI Logo"
                className="h-8 w-auto transition-transform duration-300"
              />
            </motion.div>
          </div>
        </div>
        {/* Right: Connect Wallet button */}
        <ConnectWalletButton />
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="top">
        <DrawerContent
          fullWidth
          className="bg-black shadow-lg p-6 rounded-none"
        >
          <DrawerTitle className="sr" />
          <DrawerDescription className="sr" />
          <DrawerHeader className="py-2 absolute top-0 right-0 w-full">
            <div className="">
              <div className="flex items-center justify-between mb-4 ">
                <img
                  src="/nodo-logo.png"
                  alt="NODO AI Logo"
                  className="h-8 ml-2"
                />
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className=" text-white text-xl"
                  >
                    <X />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>
          <div className="mt-10">
            {/* Referral section */}
            {isAuthenticated && (
              <>
                <div className=" text-[#A6A6B0] font-sans text-base font-medium">
                  My Referral
                </div>
                <ReferralContent className="bg-[#1A1B21] rounded-md mt-2 border border-white/10" />
              </>
            )}

            {/* Docs button */}
            <Button
              variant="secondary"
              className="w-full mt-3 bg-white/10"
              onClick={() => window.open("https://docs.nodo.xyz", "_blank")}
            >
              Read Docs <ArrowUpRight className="inline w-4 h-4 ml-1" />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export function AppHeader() {
  const { isMobile } = useBreakpoint();
  const [visibleRibbon] = useRibbon();

  const handleReadMore = () => {
    window.open(
      "https://docs.nodo.xyz/public/nodo-campaigns/nodo-ai-vault-genesis-yield-campaign-phase-1",
      "_blank"
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full backdrop-blur-md  bg-transparent border-b border-white/10",
        visibleRibbon ? "md:pb-4" : "md:py-4 py-2"
      )}
    >
      <div className="bg-black">
        <Ribbon
          message={
            <span className="w-full flex items-center justify-center text-center whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="truncate max-w-[80vw] md:max-w-full">
                Up to 10,000 USDC + 2,000,000,000 XP Share Rewards. Read more
              </span>
              <ArrowRight className="inline ml-1 !h-4 !w-4 flex-shrink-0" />
            </span>
          }
          onClick={handleReadMore}
          className="text-white text-sm md:text-lg px-2 py-2 md:px-0 md:py-1 flex items-center md:justify-center  justify-start text-center w-full"
        />
      </div>
      {/* Main header content */}
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
    </header>
  );
}
