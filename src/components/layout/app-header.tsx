import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { useWhitelistWallet } from "@/hooks/use-whitelist-wallet";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReferralTooltip from "../my-referrals/referral-tooltip";

import Icon from "@/components/icon";
import { useScrollbarWidth } from "@/hooks/use-scrollbar-width";

const pageRoutes = [
  {
    icon: "Vault",
    label: "Vaults",
    path: "/",
  },
  // {
  //   icon: "Dashboard",
  //   label: "Dashboard",
  //   path: "/dashboard",
  // },
] as const;

export function AppHeader() {
  const navigate = useNavigate();
  const scrollbarWidth = useScrollbarWidth();

  const { walletDetails } = useWhitelistWallet();
  const dataRefer = useMemo(() => {
    const referCode = walletDetails?.invite_code?.code;
    const href = window.location?.origin;
    return {
      referCode: referCode,
      referLinkCode: `${href}?invite-ref=${referCode}`,
      referTotal: walletDetails?.total_referrals,
    };
  }, [walletDetails]);

  return (
    <header
      className={`fixed top-0 z-50 w-full backdrop-blur-md pt-4 pb-4 bg-transparent border-b border-white/10`}
      style={{
        paddingRight: `${scrollbarWidth}px`,
      }}
    >
      {/* Main header content */}
      <div className="container flex items-center justify-between">
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
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {pageRoutes.map((route) => (
                <Link
                  key={route.label}
                  to={route.path}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 bg-white/10 text-white`}
                >
                  <Icon
                    name={route.icon}
                    className="h-4 w-4"
                    color="currentColor"
                  />

                  <span className="font-medium text-sm">{route.label}</span>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ReferralTooltip dataRefer={dataRefer}>
              <Button
                variant="link"
                className="text-white flex items-center gap-2 text !no-underline hover:text-white/80"
                disabled={!dataRefer.referCode}
              >
                My Referral
              </Button>
            </ReferralTooltip>
            <Button
              variant="link"
              className="!no-underline hover:text-white/80"
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
    </header>
  );
}
