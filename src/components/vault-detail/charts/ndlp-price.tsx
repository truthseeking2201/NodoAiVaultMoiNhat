import { Fragment, useMemo, FC } from "react";
import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ChartDataPoint, PERIOD_TABS } from "../constant";
import useBreakpoint from "@/hooks/use-breakpoint";
import { CustomTooltipProps } from "./type";
import PriceChange from "@/components/shared/price-change";
import { formatDate } from "@/utils/date";
import { formatNumber } from "@/lib/number";
import { useVaultMetricUnitStore } from "@/hooks";
import FormatUsdCollateralAmount from "../sections/format-usd-collateral-amount";
import { useParams } from "react-router-dom";
import ChartNoData from "./empty-data";

const CustomLegend = () => {
  const { isMobile } = useBreakpoint();
  return (
    <div className="flex gap-4 justify-evenly mt-4">
      <div className="flex items-center gap-2">
        <span
          style={{
            display: "inline-block",
            width: isMobile ? 50 : 100,
            height: 3,
            background:
              "linear-gradient(90deg, #F2BB89 0%, #F3D2B5 50.48%, #F5C8A4 100%)",
            borderRadius: 1,
          }}
        />
        <span className="md:text-sm text-[10px] text-white font-medium">
          Vault's NDLP Price
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          style={{
            display: "inline-block",
            width: isMobile ? 19 : 38,
            height: isMobile ? 2 : 4,
            borderRadius: 1,
            borderTop: `${isMobile ? 1 : 2}px dashed rgba(253, 235, 207, 0.6)`,
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
          }}
        />
        <span className="md:text-sm text-[10px] text-white font-bold">
          Break-Even Price
        </span>
      </div>
    </div>
  );
};

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { vault_id } = useParams();
  const { unit } = useVaultMetricUnitStore(vault_id);
  if (!active || !payload || !payload.length) return null;

  const priceData = payload[0]?.payload;

  if (!priceData) return null;

  const ndlpPrice = Number(priceData.price);
  const breakEvenPrice = Number(priceData.breakEvenPrice) || 0;
  const percentage = Number(priceData.percentage) || 0;

  return (
    <div className="bg-black p-3 border border-white/20 rounded-lg shadow-lg w-[250px]">
      <div className="text-xs font-bold text-white mb-[6px]">
        {formatDate(label, "dd MMM yyyy HH:mm")}
      </div>
      {ndlpPrice && (
        <div className="flex items-end justify-between mb-1">
          <span className="font-medium text-xs text-white/80">
            NDLP Price:{" "}
          </span>
          <div className="flex items-center gap-1">
            <FormatUsdCollateralAmount
              collateralIcon={unit}
              className="font-mono text-sm font-semibold text-white"
              collateralClassName="w-4 h-4"
              text={formatNumber(ndlpPrice, 0, ndlpPrice < 1 ? 6 : 2)}
            />
            <PriceChange
              priceChange={percentage}
              showParentheses={false}
              showPeriod={false}
            />
          </div>
        </div>
      )}
      <div className="flex items-end justify-between">
        <span className="font-medium text-xs text-white/80">
          Break Even Price:{" "}
        </span>
        <FormatUsdCollateralAmount
          collateralIcon={unit}
          className="font-mono text-sm font-semibold text-white"
          collateralClassName="w-4 h-4"
          text={formatNumber(breakEvenPrice, 0, breakEvenPrice < 1 ? 6 : 2)}
        />
      </div>
    </div>
  );
};

interface NdlpPriceChartProps {
  periodTab: string;
  ndlpPriceData?: any;
  isFetching: boolean;
  isFetched: boolean;
}

const NdlpPriceChart = ({
  periodTab,
  ndlpPriceData,
  isFetching,
  isFetched,
}: NdlpPriceChartProps) => {
  const { isMobile } = useBreakpoint();
  const { isUsd } = useVaultMetricUnitStore();

  const isWeek = useMemo(() => {
    return periodTab === PERIOD_TABS[1].value;
  }, [periodTab]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!ndlpPriceData || isFetching) return [];

    const dataPoints = [];
    if (isFetched) {
      for (const item of ndlpPriceData) {
        dataPoints.push({
          time: item.timestamp,
          price: isUsd ? item.ndlp_price_usd : item.ndlp_price,
          breakEvenPrice: isUsd
            ? item.user_break_event_price_usd
            : item.user_break_event_price,
          percentage: item.performance_percent,
        });
      }
    }

    return dataPoints;
  }, [ndlpPriceData, isFetching, isFetched, isUsd]);

  const lastItemIndex = chartData.length - 1;

  const interval = useMemo(
    () => (isWeek ? (isMobile ? 20 : 35) : 3),
    [isWeek, isMobile]
  );

  const yAxisRange = useMemo(() => {
    if (!chartData.length) return [-15, 15];

    const percentages = chartData.map((item) => item.percentage);
    const minPercentage = Math.min(...percentages);
    const maxPercentage = Math.max(...percentages);

    // Calculate dynamic range with padding
    const range = maxPercentage - minPercentage;
    const padding = Math.max(range * 0.1, 5); // At least 5% padding

    let min = Math.floor(minPercentage - padding);
    let max = Math.ceil(maxPercentage + padding);

    // Always ensure 0% is included in the range
    if (min > 0) {
      min = 0; // If all data is positive, start from 0%
    }
    if (max < 0) {
      max = 0; // If all data is negative, end at 0%
    }

    // Ensure we have reasonable bounds
    const finalMin = Math.max(min, -100);
    const finalMax = Math.min(max, 100);

    return [finalMin, finalMax];
  }, [chartData]);

  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisRange;
    const range = max - min;

    let tickInterval;
    if (range <= 30) tickInterval = 5;
    else if (range <= 60) tickInterval = 10;
    else if (range <= 120) tickInterval = 20;
    else tickInterval = 50;

    const ticks = [];
    for (let i = min; i <= max; i += tickInterval) {
      ticks.push(i);
    }

    // Always include 0% as baseline if it's within the range and not already included
    if (min <= 0 && max >= 0 && !ticks.includes(0)) {
      ticks.push(0);
    }

    // Sort ticks to maintain order
    const sortedTicks = ticks.sort((a, b) => a - b);
    return sortedTicks;
  }, [yAxisRange]);

  const referenceAreaBounds = useMemo(() => {
    const [yAxisMin, yAxisMax] = yAxisRange;
    
    if (!chartData.length) {
      return {
        greenTop: yAxisMax,
        greenBottom: 0,
        yellowTop: 0,
        yellowBottom: -10,
        redBottom: yAxisMin,
        referenceLineY: 0,
      };
    }

    const percentages = chartData.map((item) => item.percentage);
    const minPercentage = Math.min(...percentages);
    const maxPercentage = Math.max(...percentages);

    // Calculate dynamic zones based on data
    let greenBottom, yellowTop, yellowBottom, referenceLineY;

    if (minPercentage >= 0) {
      // All positive data - green zone starts from minimum data value
      greenBottom = minPercentage;
      yellowTop = 0;
      yellowBottom = -10;
      // Reference line should be at the minimum data value (start of green zone)
      referenceLineY = minPercentage;
    } else if (maxPercentage <= 0) {
      // All negative data - yellow zone from 0% to -10%, red zone below -10%
      greenBottom = yAxisMax; // No green zone visible
      yellowTop = 0;
      yellowBottom = -10;
      // Reference line should be at 0%
      referenceLineY = 0;
    } else {
      // Mixed data - yellow zone from 0% to -10%
      greenBottom = 0;
      yellowTop = 0;
      yellowBottom = -10;
      // Reference line should be at 0%
      referenceLineY = 0;
    }

    return {
      greenTop: yAxisMax,
      greenBottom,
      yellowTop,
      yellowBottom,
      redBottom: yAxisMin,
      referenceLineY,
    };
  }, [chartData, yAxisRange]);

  if ((!chartData || chartData?.length === 0) && !isFetching) {
    return <ChartNoData type="ndlp-price" />;
  }

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <div className="flex items-center justify-between">
        <span className="text-white md:text-sm text-xs font-medium ">
          Track the NDLP price of this vault over time
        </span>
      </div>
      <div
        className="w-full rounded-[10.742px] border-[0.671px] border-white/5 p-1"
        style={{
          background:
            "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 33%, rgba(251, 191, 36, 0.02) 33%, rgba(251, 191, 36, 0.05) 66%, rgba(239, 68, 68, 0.02) 66%, rgba(239, 68, 68, 0.05) 100%), #0A0A0A",
        }}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 278 : 300}>
          <LineChart
            data={chartData}
            margin={{ top: 20, left: 0, right: 10, bottom: 10 }}
            width={isMobile ? 364 : 500}
            height={isMobile ? 278 : 300}
          >
            <defs>
              <linearGradient
                id="greenGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.70)" />
                <stop offset="38.16%" stopColor="rgba(16, 185, 129, 0.39)" />
                <stop offset="76.32%" stopColor="rgba(16, 185, 129, 0.10)" />
              </linearGradient>
              <linearGradient
                id="yellowGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#FBBF24" stopOpacity={0} />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity={1} />
              </linearGradient>
              <linearGradient
                id="redGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.90)" />
                <stop offset="50%" stopColor="rgba(239, 68, 68, 0.70)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.30)" />
              </linearGradient>
              <linearGradient
                id="customLineGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#F2BB89" />
                <stop offset="50%" stopColor="#F3D2B5" />
                <stop offset="100%" stopColor="#F5C8A4" />
              </linearGradient>
            </defs>
            <ReferenceArea
              y1={referenceAreaBounds.greenBottom}
              y2={referenceAreaBounds.greenTop}
              fill="url(#greenGradient)"
              radius={[10, 10, 0, 0]}
            />
            <ReferenceArea 
              y1={referenceAreaBounds.yellowBottom} 
              y2={referenceAreaBounds.yellowTop} 
              fill="url(#yellowGradient)" 
            />
            <ReferenceArea
              y1={yAxisRange[0]}
              y2={referenceAreaBounds.yellowBottom}
              fill="url(#redGradient)"
              radius={[0, 0, 10, 10]}
            />
            <ReferenceLine
              y={referenceAreaBounds.referenceLineY}
              stroke="#6b7280"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload, index }) => {
                const total = chartData.length;
                const isFirst = index === 0;

                // Check if this tick represents the last data point
                const lastDataPoint = chartData[total - 1];
                const isLast = payload.value === lastDataPoint?.time;

                return (
                  <text
                    x={x}
                    y={y + 8}
                    fontSize={12}
                    className="text-white/75 md:text-xs text-[10px]"
                    fill="#fff"
                    textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                  >
                    {isWeek
                      ? formatDate(payload.value, "dd/MM HH:mm")
                      : formatDate(payload.value, "HH:mm")}
                  </text>
                );
              }}
              tickMargin={12}
              interval={interval}
            />
            <YAxis
              domain={yAxisRange}
              ticks={yAxisTicks}
              tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#FFFFFF", fontSize: 12 }}
              tickMargin={10}
            />

            <Legend content={<CustomLegend />} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="percentage"
              // stroke="url(#customLineGradient)"
              stroke="#F3D2B5"
              strokeWidth={2}
              dot={({ cx, cy, index }) =>
                index === lastItemIndex ? (
                  <Fragment key={index}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill="white"
                      style={{ filter: "blur(4px)" }}
                      className="animate-pulse"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="black"
                      stroke="#fff"
                      strokeWidth={2.5}
                    />
                    <style>
                      {`
                    @keyframes fadeInDot {
                    from { opacity: 0; }
                    to { opacity: 1; }
                    }
                  `}
                    </style>
                  </Fragment>
                ) : null
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NdlpPriceChart;
