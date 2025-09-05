import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useWallet, useWhitelistWallet } from "@/hooks";
import { useUserLeaderboard } from "@/hooks/use-leaderboards";
import ReferralBg from "@/assets/images/leaderboards/referral-section.png";
import { formatNumber } from "@/lib/number";
import { Button } from "@/components/ui/button";
import { ItemRow } from "@/components/my-referrals/item-row.tsx";
import { MyReferralsDashboardModal } from "@/components/my-referrals/my-referrals-dashboard-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankCompo } from "./helper";
import ExternalIcon from "@/assets/icons/external-gradient.svg?react";

function UserRankTVL({ rank, label }: { rank: number; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center lg:p-4 p-2">
      <RankCompo
        rank={rank}
        rankNode={
          <div className="px-4 py-2 flex items-center justify-center lg:text-lg text-xs font-mono font-semibold text-white shadow-lg rounded-[63px] bg-black [box-shadow:-2px_0_4px_0_rgba(255,255,255,0.75)_inset,2px_0_4px_0_rgba(0,255,251,0.95)_inset,0_-3px_4px_0_#07F_inset,0_3px_4px_0_#B708F6_inset]">
            {rank ? rank : "--"}
          </div>
        }
      />
      <div className="lg:mt-4 mt-2 flex items-center lg:flex-row flex-col">
        <span className="text-[#94DCFB] font-semibold lg:text-base text-xs">
          #{rank ? rank : "--"}
        </span>
        <span className="ml-2 text-[#E5E7EB] lg:text-base text-[10px] font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function UserRank() {
  const { isAuthenticated } = useWallet();
  const { data, isLoading } = useUserLeaderboard(isAuthenticated);
  const { walletDetails } = useWhitelistWallet();
  const [activeTab, setActiveTab] = useState<"code" | "link">("code");
  const [openModalRefer, setOpenModalRefer] = useState(false);
  const dataRefer = useMemo(() => {
    const referCode = walletDetails?.invite_code?.code;
    const href = window.location?.origin;
    return {
      referCode: referCode,
      referLinkCode: `${href}?invite-ref=${referCode}`,
      referTotal: walletDetails?.total_referrals,
    };
  }, [walletDetails]);

  const dataUser = useMemo(() => {
    // TODO
    const tvl = 1000;
    const referredTvl = 1;
    return {
      tvl: tvl,
      tvlRank: 1,
      referredTvl: referredTvl,
      referredTvlRank: 2,
    };
  }, [data]);

  return (
    <div className="border border-white/20 rounded-xl bg-black lg:p-6 px-3 py-5">
      <div className="lg:text-2xl text-base text-white font-semibold">
        {isAuthenticated ? `You’re back! Let’s rank up` : `Welcome Guest!`}
      </div>
      {!isAuthenticated && (
        <div className="text-sm text-white/70">
          Connect wallet to see your rank
        </div>
      )}

      <AnimatePresence initial={false}>
        {isAuthenticated && (
          <motion.div
            className="flex flex-col gap-4 mt-6 h-full"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, delay: isAuthenticated ? 0 : 0.5 }}
            key="box"
          >
            <motion.div
              className="flex gap-4 lg:flex-row flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                delayChildren: isAuthenticated ? 0.3 : 0,
              }}
            >
              <div className="w-full">
                <div className="flex gap-4">
                  <div className="w-full rounded-xl bg-white/10 px-4 py-2">
                    <div className="lg:text-base text-white/60">TVL</div>
                    <div className="text-xl text-white font-semibold mt-2 font-mono">
                      ${formatNumber(dataUser.tvl, 0, 2)}
                    </div>
                  </div>
                  <div className="w-full rounded-xl bg-white/10 px-4 py-2">
                    <div className="text-base text-white/60">Referred TVL</div>
                    <div className="text-xl text-white font-semibold mt-2 font-mono">
                      ${formatNumber(dataUser.referredTvl, 0, 2)}
                    </div>
                  </div>
                </div>

                <div className="bg-[linear-gradient(90deg,_rgba(255,232,201,0.2)_0%,_rgba(249,244,233,0.2)_12%,_rgba(227,246,255,0.2)_25%,_rgba(201,212,255,0.2)_38%,_rgba(201,212,255,0.2)_50%,_rgba(227,246,255,0.2)_62%,_rgba(249,244,233,0.2)_75%,_rgba(255,232,201,0.2)_88%)] mt-4 rounded-xl relative">
                  <div
                    className="absolute left-1/2 lg:top-[-6px] top-[-4px] h-[110%] w-px bg-white/25"
                    style={{ transform: "translateX(-50%) rotate(25deg)" }}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <UserRankTVL
                      rank={dataUser.tvlRank}
                      label="TVL Leaderboard"
                    />
                    <UserRankTVL
                      rank={dataUser.referredTvlRank}
                      label="Referred TVL Leaderboard"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full bg-white/5 rounded-xl lg:p-6 px-6 py-4 relative">
                <img
                  src={ReferralBg}
                  alt="Referral Section"
                  className="absolute inset-0 w-full h-full z-0 rounded-xl"
                />
                <div className="relative z-10">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Total Referrals
                      </p>
                      <p className="lg:text-2xl text-xl font-bold text-white mb-0">
                        {dataRefer.referTotal}
                      </p>
                    </div>
                    <div className="flex items-end">
                      <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                          setActiveTab(value as "code" | "link")
                        }
                        // className="bg-black border rounded-lg"
                      >
                        <TabsList className="p-1 flex gap-1">
                          <TabsTrigger
                            value="code"
                            className="w-[68px] lg:h-[38px] h-[24px]"
                          >
                            Code
                          </TabsTrigger>
                          <TabsTrigger
                            value="link"
                            className="w-[68px] lg:h-[38px] h-[24px]"
                          >
                            Link
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                  <div className="mt-6">
                    <ItemRow
                      value={
                        activeTab === "code"
                          ? dataRefer.referCode
                          : dataRefer.referLinkCode
                      }
                      isNew
                    />
                  </div>

                  <Button
                    size="sm"
                    className="font-semibold text-sm p-0 h-fit w-full hover:opacity-80 mt-3 justify-start"
                    onClick={() => {
                      setOpenModalRefer(true);
                    }}
                  >
                    <span className="bg-gradient-to-r from-[#FFE8C9] via-[#F9F4E9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text">
                      My Referral Dashboard
                    </span>

                    <ExternalIcon className="!w-4 !h-4" />
                  </Button>

                  <MyReferralsDashboardModal
                    isOpen={openModalRefer}
                    onClose={() => {
                      setOpenModalRefer(false);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
