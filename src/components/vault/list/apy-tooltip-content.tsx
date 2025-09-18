import { formatNumber } from "@/lib/number";
import { formatPercentage } from "@/lib/utils";

const mockData = {
  apy: 118.62,
  base_apr: 20.5,
  nodo_incentive_apr: 7.44,
  campaign_apr: 50.36,
};

const incentives = {
  usdc: 3000,
  xp_share: 500000000,
};

type ApyTooltipContentProps = {
  apy: string;
  // base_apr: number;
  // nodo_incentive_apr: number;
  // campaign_apr: number;
};

const Chart = () => {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="78"
        height="78"
        viewBox="0 0 78 78"
        fill="none"
      >
        <path
          d="M59.186 14.7292C63.5347 18.3402 66.8343 23.0524 68.7401 28.3739C70.6459 33.6954 71.088 39.4309 70.0203 44.9817C68.9527 50.5324 66.4143 55.6947 62.6704 59.9294C58.9265 64.1642 54.1143 67.3162 48.7363 69.0562"
          stroke="#34D399"
          stroke-width="14"
        />
        <path
          d="M48.7845 69.0406C44.1169 70.559 39.1596 70.9682 34.3062 70.2357C29.4528 69.5032 24.8371 67.6492 20.8256 64.8208C16.8141 61.9924 13.5173 58.2677 11.1971 53.9424C8.87682 49.6171 7.59705 44.8104 7.45938 39.9039C7.32171 34.9975 8.32994 30.1266 10.404 25.678C12.478 21.2294 15.5608 17.3256 19.4074 14.2768C23.254 11.228 27.7585 9.118 32.5632 8.1145C37.3678 7.11099 42.3403 7.24158 47.0857 8.4959"
          stroke="#B398FF"
          stroke-width="14"
        />
        <path
          d="M44.9617 8.01223C50.5271 9.07911 55.7027 11.6242 59.9455 15.3806"
          stroke="#CCFF00"
          stroke-width="14"
        />
      </svg>
    </div>
  );
};

const ApyTooltipContent = ({ apy }: ApyTooltipContentProps) => {
  return (
    <div className="p-1">
      <div className="font-sans text-sm mb-1">
        Total APY · Daily compounding
      </div>
      <div className="text-xl font-mono font-semibold text-green-increase">
        {apy}
      </div>

      <div className="mt-3 flex gap-4">
        <Chart />
        <div className="w-full">
          <div className="flex items-center gap-3">
            <div className="bg-green-increase w-[5px] h-[22px] rounded-[20px]" />
            <div className="flex items-center justify-between w-full">
              <div>Base APR (7D avg)</div>
              <div>{mockData.base_apr}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="bg-[#CCFF00] w-[5px] h-[22px] rounded-[20px]" />
            <div className="flex items-center justify-between w-full">
              <div>NODO Incentives APR</div>
              <div>{mockData.nodo_incentive_apr}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="bg-[#A88BFA] w-[5px] h-[22px] rounded-[20px]" />
            <div className="flex items-center justify-between w-full">
              <div>Campaign APR (OKX)</div>
              <div>{mockData.campaign_apr}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-3 bg-white/30 h-[1px]" />

      <div className="flex items-center justify-between mb-2">
        <div className="font-sans text-xs text-white/70">
          Total APR Pre-Compounding:
        </div>
        <div className="font-semibold text-sm text-green-increase">
          {formatPercentage(mockData.base_apr || 0)}
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-sans text-xs text-white/70">
          APY (Daily Compounding)
        </div>
        <div className="font-semibold text-sm">
          {formatPercentage(mockData.apy || 0)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="text-xs font-mono text-white/80 mb-1 mt-3 flex-1">
          NODO Incentives (per day)
        </div>
        <div className=" bg-white/30 h-[1px] w-auto" />
      </div>
      <div className="flex items-center gap-2 mb-1">
        <img src={`/coins/usdc.png`} alt="usdc" className="w-6 h-6" />
        <div className="text-sm">{formatNumber(incentives.usdc)} USDC</div>
      </div>
      <div className="flex items-center gap-2">
        <img src={`/coins/xp.png`} alt="xp_share" className="w-6 h-6" />
        <div className="text-sm">
          {formatNumber(incentives.xp_share)} XP Shares
        </div>
      </div>
      <div className="mt-3 text-[10px] font-mono">
        Updated 30s ago · Subject to change
      </div>
    </div>
  );
};

export default ApyTooltipContent;
