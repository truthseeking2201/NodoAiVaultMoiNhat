import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { useWhitelistWallet } from "@/hooks/use-whitelist-wallet";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReferralTooltip from "../my-referrals/referral-tooltip";

import Icon from "@/components/icon";
import { useScrollbarWidth } from "@/hooks/use-scrollbar-width";
import { Ribbon } from "@/components/shared/ribbon";
import { cn } from "@/lib/utils";
import { useRibbon } from "@/hooks/use-ribbon";

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

  const [visibleRibbon, setVisibleRibbon] = useRibbon();

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
        visibleRibbon ? "md:pb-4 pb-2" : "md:py-4 py-2"
      )}
    >
      <div className="bg-black">
        <Ribbon
          message={
            <>
              Up to 10,000 USDC + 2,000,000,000 XP Share Rewards. Read more
              <ArrowRight className="inline ml-1 !h-4 !w-4" />
            </>
          }
          onClick={handleReadMore}
        />
      </div>
      {/* Main header content */}
      <div
        className={cn(
          "container flex items-center justify-between",
          visibleRibbon ? `md:pt-4 pt-2` : ""
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
