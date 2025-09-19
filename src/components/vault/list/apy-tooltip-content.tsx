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

  if (!total || total <= 0) {
    return (
      <div className="flex items-start justify-start w-[75px] h-[75px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="79"
          height="78"
          viewBox="0 0 79 78"
          fill="none"
        >
          <path
            d="M49.2845 69.0406C45.342 70.3232 41.1854 70.8167 37.0521 70.4928C32.9188 70.169 28.8898 69.0343 25.1951 67.1534C21.5003 65.2725 18.2122 62.6823 15.5185 59.5307C12.8248 56.379 10.7783 52.7277 9.4957 48.7851C8.21312 44.8426 7.71965 40.686 8.04346 36.5527C8.36727 32.4194 9.50201 28.3904 11.3829 24.6957C13.2638 21.0009 15.854 17.7129 19.0056 15.0192C22.1573 12.3255 25.8086 10.2789 29.7512 8.99631C33.6937 7.71373 37.8503 7.22026 41.9836 7.54407C46.1169 7.86788 50.1459 9.00262 53.8406 10.8835C57.5354 12.7644 60.8235 15.3546 63.5172 18.5063C66.2109 21.6579 68.2574 25.3092 69.54 29.2518C70.8226 33.1944 71.316 37.3509 70.9922 41.4842C70.6684 45.6175 69.5337 49.6465 67.6528 53.3412C65.7719 57.036 63.1817 60.3241 60.0301 63.0178C56.8784 65.7115 53.2271 67.758 49.2845 69.0406L49.2845 69.0406Z"
            stroke="white"
            stroke-opacity="0.15"
            stroke-width="14"
          />
        </svg>
      </div>
    );
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
        <div
          className={cn(
            "w-full flex flex-col justify-center ",
            Number(daily_compounding_apy) === 0 && "gap-0.5"
          )}
        >
          <div className="flex items-center gap-3">
            {Number(daily_compounding_apy) > 0 && (
              <div className="bg-green-increase w-[5px] h-[22px] rounded-[20px]" />
            )}
            <div className="flex items-center justify-between w-full">
              <div>Base APR (7D avg)</div>
              <div>{formatPercentage(+rolling_7day_apr || 0)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            {Number(daily_compounding_apy) > 0 && (
              <div className="bg-[#CCFF00] w-[5px] h-[22px] rounded-[20px]" />
            )}
            <div className="flex items-center justify-between w-full">
              <div>NODO Incentives APR</div>
              <div>{formatPercentage(+nodo_incentive_apr || 0)}</div>
            </div>
          </div>

          {campaign_aprs.length > 0 ? (
            <div className="mt-1 flex flex-col gap-1">
              {campaign_aprs.map((campaign) => (
                <div className="flex items-center gap-3">
                  <div className="bg-[#A88BFA] w-[5px] h-[22px] rounded-[20px]" />
                  <div
                    className="flex items-center justify-between w-full"
                    key={campaign.label}
                  >
                    <div>Campaign APR ({campaign.label})</div>
                    <div>{formatPercentage(campaign.apr)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-1">
              {Number(daily_compounding_apy) > 0 && (
                <div className="bg-[#A88BFA] w-[5px] h-[22px] rounded-[20px]" />
              )}
              <div
                className="flex items-center justify-between w-full"
                key="campaign"
              >
                <div>Campaign APR (OKX)</div>
                <div>{formatPercentage(campaign_apr)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="my-3 bg-white/30 h-[1px]" />

      <div className="flex items-center justify-between mb-2">
        <div className="font-sans text-xs text-white/70 opacity-80">
          Total APR Pre-Compounding:
        </div>
        <div className="font-semibold text-sm text-green-increase">
          {formatPercentage(+total_apr_precompounding || 0)}
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-sans text-xs text-white/70 opacity-80">
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
            "flex items-center gap-2 mt-2",
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
