import CampaignBg from "@/assets/images/leaderboards/campaign-bg.png";
import CountUp from "@/components/ui/count-up";
import { useConfigLeaderboard } from "@/hooks/use-leaderboards";
import { USDC_CONFIG, XP_CONFIG } from "@/config/coin-config";
import { useMemo, Fragment } from "react";

const Banner = () => {
  const { data } = useConfigLeaderboard();

  const prize = useMemo(() => {
    // TODO
    const valueUsd = data?.[0]?.vault_cap / 500 || 500;
    const valueXp = data?.[0]?.vault_cap || 10000000;
    const _prize = [];
    if (valueUsd) {
      _prize.push({
        image: USDC_CONFIG.image_url,
        symbol: USDC_CONFIG.symbol,
        fromValue: Math.max(valueUsd - 200, 0),
        value: valueUsd,
      });
    }
    if (valueXp) {
      _prize.push({
        image: XP_CONFIG.image_url,
        symbol: XP_CONFIG.symbol,
        fromValue: Math.max(valueXp - 200, 0),
        value: valueXp,
      });
    }
    return _prize;
  }, [data]);

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
              Total Prize Pool
            </span>
            <span className="text-white text-base font-medium">✦</span>
          </div>
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
                      duration={3}
                      delay={0}
                      separator=","
                    />{" "}
                    {el.symbol}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
