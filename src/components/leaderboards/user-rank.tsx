import { useMemo } from "react";
import { useWallet } from "@/hooks";
import { useUserLeaderboard } from "@/hooks/use-leaderboards";
import ReferralBg from "@/assets/images/leaderboards/referral-section.png";
import { formatNumber } from "@/lib/number";
import { RankCompo } from "./helper";
import NewTag from "@/components/ui/new-tag";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralContent } from "@/components/my-referrals/referral-content.tsx";

function UserRankTVL({ rank, label }: { rank: number; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center lg:px-4 lg:py-[18px] p-3">
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
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <div className="w-full flex flex-col justify-between">
          <div className="flex gap-4">
            <Skeleton className="w-full h-[80px] rounded-xl bg-white/20" />
            <Skeleton className="w-full h-[80px] rounded-xl bg-white/20" />
          </div>
          <Skeleton className="w-full lg:h-[116px] h-[96px] rounded-xl bg-white/20 mt-4" />
        </div>
        <div className="w-full">
          <Skeleton className="md:h-[214px] h-[174px] rounded-xl bg-white/20" />
        </div>
      </div>
    </>
  );
}

export default function UserRank() {
  const { isAuthenticated } = useWallet();
  const { data, isFetched } = useUserLeaderboard();

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
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <div className="w-full flex flex-col justify-between">
              <div className="flex gap-4">
                <div className="w-full rounded-xl bg-white/10 px-4 py-2">
                  <div className="lg:text-base text-white/60">TVL</div>
                  <div className="text-2xl max-sm:text-xl text-white font-semibold mt-2 font-mono">
                    ${formatNumber(dataUser.tvl, 0, 2)}
                  </div>
                </div>
                <div className="w-full rounded-xl bg-white/10 px-4 py-2">
                  <div className="text-base text-white/60">Referred TVL</div>
                  <div className="text-2xl max-sm:text-xl text-white font-semibold mt-2 font-mono">
                    ${formatNumber(dataUser.referredTvl, 0, 2)}
                  </div>
                </div>
              </div>

              <div className="bg-[linear-gradient(90deg,_rgba(255,232,201,0.2)_0%,_rgba(249,244,233,0.2)_12%,_rgba(227,246,255,0.2)_25%,_rgba(201,212,255,0.2)_38%,_rgba(201,212,255,0.2)_50%,_rgba(227,246,255,0.2)_62%,_rgba(249,244,233,0.2)_75%,_rgba(255,232,201,0.2)_88%)] mt-4 rounded-xl relative">
                <div
                  className="absolute left-1/2 lg:top-[-6px] top-[-4px] h-[110%] w-px bg-white/25"
                  style={{ transform: "translateX(-50%) rotate(25deg)" }}
                />
                <div className="flex justify-between items-center">
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

            <div className="w-full bg-white/5 rounded-xl md:p-6 px-6 py-4 relative">
              <img
                src={ReferralBg}
                alt="Referral Section"
                className="absolute inset-0 w-full h-full z-0 rounded-xl"
              />
              <ReferralContent
                className="relative z-10 !p-0"
                forType="leaderboard"
              />
            </div>
          </div>
        </ConditionRenderer>
      </ConditionRenderer>
    </div>
  );
}
