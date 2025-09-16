import CampaignBg from "@/assets/images/leaderboards/campaign-bg.png";
import CountUp from "@/components/ui/count-up";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfigLeaderboard } from "@/hooks/use-leaderboards";
import { USDC_CONFIG, XP_CONFIG, GEMS_CONFIG } from "@/config/coin-config";
import { RewardEntry } from "@/types/leaderboards.types";
import { useMemo, Fragment } from "react";

const Banner = () => {
  const { data, isFetched } = useConfigLeaderboard();

  const prize = useMemo(() => {
    let _prize = [];
    if (data) {
      let arr_rankings = [];
      Object.values(data).forEach((el) => {
        arr_rankings = [...arr_rankings, ...Object.values(el.rankings)];
      });
      const total = sumRewards(arr_rankings);

      const rewardConfigs = [
        { value: total.reward_usdc, ...USDC_CONFIG },
        { value: total.reward_xp_shares, ...XP_CONFIG },
        { value: total.reward_gems, ...GEMS_CONFIG },
      ];
      _prize = rewardConfigs
        .filter((r) => Number(r.value) > 0)
        .map((r) => ({
          image: r.image_url,
          symbol: r.symbol,
          value: r.value,
          fromValue: Math.max(r.value - 50, 0),
        }));
    }
    return _prize;
  }, [data]);

  function sumRewards(rankings: RewardEntry[]) {
    return rankings?.reduce<RewardEntry>(
      (acc: RewardEntry, r: RewardEntry) => {
        acc.reward_gems += r.reward_gems;
        acc.reward_usdc += r.reward_usdc;
        acc.reward_xp_shares += r.reward_xp_shares;
        return acc;
      },
      { reward_gems: 0, reward_usdc: 0, reward_xp_shares: 0 }
    );
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div
        className="relative w-full rounded-[16px] px-6 py-4 flex flex-col items-center justify-center shadow-lg overflow-hidden lg:h-[128px] h-full"
        style={{
          backgroundImage: `url(${CampaignBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white text-base font-medium">✦</span>
            <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] lg:text-2xl text-xl lg:font-bold font-medium">
              Total Weekly Prize Poo
            </span>
            <span className="text-white text-base font-medium">✦</span>
          </div>
          <ConditionRenderer
            when={isFetched}
            fallback={<Skeleton className="w-[250px] h-[28px]" />}
          >
            <div className="flex items-center lg:gap-4 gap-0 lg:flex-row flex-col">
              {prize?.map((el, idx) => (
                <Fragment key={`row-${idx}`}>
                  {idx > 0 && (
                    <div className="text-white text-xl font-bold">+</div>
                  )}
                  <div className="flex items-center gap-2">
                    <img src={el.image} alt={el.symbol} className="w-6 h-6" />
                    <span className="text-white text-xl font-bold">
                      <CountUp
                        from={el.fromValue}
                        to={el.value}
                        duration={5}
                        delay={0}
                        separator=","
                      />{" "}
                      {el.symbol}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </ConditionRenderer>
        </div>
      </div>
    </div>
  );
};

export default Banner;
