import { formatNumber } from "@/lib/number";
import { cn, formatPercentage } from "@/lib/utils";
import { VaultApr } from "@/types/vault-config.types";
import { useCallback, useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#07D993", "#CCFF00", "#A88BFA"];
const Chart = ({
  data,
}: {
  data?: {
    rolling_7day_apr: number;
    nodo_incentive_apr: number;
    campaign_apr: number;
  };
}) => {
  const total =
    Number(data?.rolling_7day_apr) +
    Number(data?.nodo_incentive_apr) +
    Number(data?.campaign_apr);

  const calculatePercentage = useCallback(
    (value: number) => {
      return (value / total) * 100;
    },
    [total]
  );

  const pieData = useMemo(
    () => [
      {
        name: "Base APR (7D avg)",
        value: calculatePercentage(Number(data?.rolling_7day_apr)),
      },
      {
        name: "NODO Incentives APR",
        value: calculatePercentage(Number(data?.nodo_incentive_apr)),
      },
      {
        name: "Campaign APR (OKX)",
        value: calculatePercentage(Number(data?.campaign_apr)),
      },
    ],
    [data, calculatePercentage]
  );

  if (!total) {
    return null;
  }

  return (
    <div className="flex items-start justify-start w-[75px] h-[75px]">
      <PieChart width={75} height={75}>
        <Pie
          isAnimationActive={false}
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

const ApyTooltipContent = ({
  rolling_7day_apr,
  nodo_incentive_apr,
  campaign_aprs,
  total_apr_precompounding,
  daily_compounding_apy,
  nodo_incentives,
}: VaultApr) => {
  const campaign_apr = campaign_aprs.reduce(
    (acc, campaign) => acc + campaign.apr,
    0
  );
  return (
    <div className="p-1">
      <div className="font-sans text-sm mb-1">
        Total APY · Daily compounding
      </div>
      <div className="text-xl font-mono font-semibold text-green-increase">
        {formatPercentage(+daily_compounding_apy || 0)}
      </div>

      <div className="mt-3 flex gap-4">
        <Chart
          data={{
            rolling_7day_apr: Number(rolling_7day_apr),
            nodo_incentive_apr: Number(nodo_incentive_apr),
            campaign_apr,
          }}
        />
        <div className="w-full">
          <div className="flex items-center gap-3">
            <div className="bg-green-increase w-[5px] h-[22px] rounded-[20px]" />
            <div className="flex items-center justify-between w-full">
              <div>Base APR (7D avg)</div>
              <div>{formatPercentage(+rolling_7day_apr || 0)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="bg-[#CCFF00] w-[5px] h-[22px] rounded-[20px]" />
            <div className="flex items-center justify-between w-full">
              <div>NODO Incentives APR</div>
              <div>{formatPercentage(+nodo_incentive_apr || 0)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="bg-[#A88BFA] w-[5px] h-[22px] rounded-[20px]" />
            <div className="flex items-center justify-between w-full">
              <div>Campaign APR (OKX)</div>
              <div>{formatPercentage(campaign_apr)}</div>
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
          {formatPercentage(+total_apr_precompounding || 0)}
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-sans text-xs text-white/70">
          APY (Daily Compounding)
        </div>
        <div className="font-semibold text-sm">
          {formatPercentage(+daily_compounding_apy || 0)}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <div className="text-xs font-mono text-white/80 mb-1flex-1 uppercase">
          NODO Incentives (per day)
        </div>
        <div className="bg-white/30 h-[1px] w-[131px]" />
      </div>

      {nodo_incentives.map((incentive, index) => (
        <div
          className={cn(
            "flex items-center gap-2",
            index !== nodo_incentives.length - 1 && "mb-1"
          )}
        >
          <img
            src={`/coins/${incentive.token_symbol.toLowerCase()}.png`}
            alt={incentive.token_symbol}
            className="w-6 h-6"
          />
          <div className="text-sm">
            {formatNumber(incentive.daily_amount)} {incentive.token_symbol}
          </div>
        </div>
      ))}
      <div className="mt-3 text-[10px] font-mono">
        Updated 30s ago · Subject to change
      </div>
    </div>
  );
};

export default ApyTooltipContent;
