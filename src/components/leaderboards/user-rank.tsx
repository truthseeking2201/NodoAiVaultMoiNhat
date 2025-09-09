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
import NewTag from "@/components/ui/new-tag";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Skeleton } from "@/components/ui/skeleton";

function UserRankTVL({ rank, label }: { rank: number; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center lg:p-4 p-2">
      <RankCompo
        rank={rank}
        classNameImage="h-10 w-10 max-md:w-[28px] max-md:h-[28px]"
        rankNode={
          <NewTag
            parentClassName="px-4 py-1.5 flex items-center justify-center md:text-lg text-xs font-mono font-semibold text-white shadow-lg rounded-[63px] ml-0"
            text={rank ? String(rank) : "--"}
          />
        }
      />
      <div className="lg:mt-4 mt-2 flex items-center lg:flex-row flex-col lg:gap-2 gap-1">
        <span className="text-[#94DCFB] font-semibold md:text-base text-xs text-center flex-shrink-0">
          {rank ? `#${rank}` : "--"}
        </span>
        <span className="text-[#E5E7EB] md:text-base text-[10px] font-semibold text-center">
          {label}
        </span>
      </div>
    </div>
  );
}

function UserRankLoading() {
  return (
    <>
      <Skeleton className="w-[200px] lg:h-[32px] h-[24px] rounded bg-white/20 mb-6" />
      <div className="flex gap-4 lg:flex-row flex-col">
        <div className="w-full">
          <div className="flex gap-4">
            <Skeleton className="w-full h-[80px] rounded-xl bg-white/20" />
            <Skeleton className="w-full h-[80px] rounded-xl bg-white/20" />
          </div>
          <Skeleton className="w-full h-[112px] rounded-xl bg-white/20 mt-4" />
        </div>
        <div className="w-full">
          <Skeleton className="h-[209px] rounded-xl bg-white/20" />
        </div>
      </div>
    </>
  );
}

export default function UserRank() {
  const { isAuthenticated } = useWallet();
  const { data, isFetched } = useUserLeaderboard();
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
    const getRank = (rank) => (rank === 999999999 ? null : rank);
    return {
      tvl: data?.tvl_usd || 0,
      tvlRank: getRank(data?.tvl_ranking || 0),
      referredTvl: data?.ref_tvl_usd || 0,
      referredTvlRank: getRank(data?.referred_ranking || 0),
    };
  }, [data]);

  const title = useMemo(() => {
    const rank = Math.min(
      data?.tvl_ranking || Infinity,
      data?.referred_ranking || Infinity
    );
    const messages = [
      { min: 1, max: 3, text: "You're the King of Vaults!" },
      { min: 4, max: 10, text: "Great job! Keep climbing!" },
      { min: 11, max: 16, text: "Good start! Keep pushing higher!" },
    ];

    const found = messages.find((m) => rank >= m.min && rank <= m.max);
    return found ? found.text : "You're back! Deposit to rank up!";
  }, [data]);

  return (
    <div className="border border-white/20 rounded-xl bg-black lg:p-6 px-3 py-5">
      <ConditionRenderer
        when={isAuthenticated}
        fallback={
          <>
            <div className="lg:text-2xl text-base text-white font-semibold">
              Welcome Guest!
            </div>
            <div className="text-sm text-white/70">
              Connect wallet to see your rank
            </div>
          </>
        }
      >
        <ConditionRenderer when={isFetched} fallback={<UserRankLoading />}>
          <div className="lg:text-2xl text-base text-white font-semibold mb-6">
            {title}
          </div>
          <div className="flex gap-4 lg:flex-row flex-col">
            <div className="w-full">
              <div className="flex gap-4">
                <div className="w-full rounded-xl bg-white/10 px-4 py-2">
                  <div className="lg:text-base text-white/60">TVL</div>
                  <div className="text-2xl text-white font-semibold mt-2 font-mono">
                    ${formatNumber(dataUser.tvl, 0, 2)}
                  </div>
                </div>
                <div className="w-full rounded-xl bg-white/10 px-4 py-2">
                  <div className="text-base text-white/60">Referred TVL</div>
                  <div className="text-2xl text-white font-semibold mt-2 font-mono">
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
              </div>
            </div>
          </div>
        </ConditionRenderer>
      </ConditionRenderer>
      <MyReferralsDashboardModal
        isOpen={openModalRefer}
        onClose={() => {
          setOpenModalRefer(false);
        }}
      />
    </div>
  );
}
