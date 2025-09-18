import { formatNumber } from "@/lib/number";
import { formatPercentage } from "@/lib/utils";
import { PieChart, Pie, Cell } from "recharts";

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

const PIE_COLORS = ["#07D993", "#CCFF00", "#A88BFA"];

const Chart = ({
  data,
}: {
  data?: { base_apr: number; nodo_incentive_apr: number; campaign_apr: number };
}) => {
  const pieData = [
    { name: "Base APR (7D avg)", value: data?.base_apr },
    { name: "NODO Incentives APR", value: data?.nodo_incentive_apr },
    { name: "Campaign APR (OKX)", value: data?.campaign_apr },
  ];
  return (
    <div className="flex items-start justify-start w-[75px] h-[75px]">
      <PieChart width={75} height={75}>
        <Pie
          data={pieData}
          cx={35}
          cy={35}
          innerRadius={20}
          outerRadius={34}
          startAngle={90}
          endAngle={450}
          dataKey="value"
          paddingAngle={0}
          cornerRadius={0}
        >
          {pieData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={PIE_COLORS[idx % PIE_COLORS.length]}
              stroke="none"
            />
          ))}
        </Pie>
      </PieChart>
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
        <Chart data={mockData} />
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
