import CampaignBg from "@/assets/images/leaderboards/campaign-bg.png";
import CountUp from "@/components/ui/count-up";

const Banner = () => {
  return (
    <div className="w-full flex justify-center items-center py-4">
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
            <span className="bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] lg:text-2xl text-xl font-bold">
              Total Prize Pool
            </span>
            <span className="text-white text-base font-medium">✦</span>
          </div>
          <div className="flex items-center lg:gap-4 gap-0 lg:flex-row flex-col">
            <div className="flex items-center gap-2">
              <img src="/coins/usdc.png" alt="USDC" className="w-6 h-6" />
              <span className="text-white text-xl font-bold">
                <CountUp
                  from={0}
                  to={500}
                  duration={3}
                  delay={0}
                  separator=","
                />{" "}
                USDC
              </span>
            </div>
            <div className="text-white text-xl font-bold">+</div>
            <div className="flex items-center gap-2">
              <img src="/coins/xp.png" alt="XP" className="w-6 h-6" />
              <span className="text-white text-xl font-bold">
                <CountUp
                  from={9999100}
                  to={10000000}
                  duration={3}
                  delay={0}
                  separator=","
                />{" "}
                XP Shares
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
